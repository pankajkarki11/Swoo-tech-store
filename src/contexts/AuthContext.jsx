// src/contexts/AuthContext.jsx
import {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import useApi from "../services/useApi";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [isSyncingCart, setIsSyncingCart] = useState(false);
  const [cartSyncMessage, setCartSyncMessage] = useState("");
  const [userCartsFromAPI, setUserCartsFromAPI] = useState([]); // Store user's carts from API

  const api = useApi();

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = localStorage.getItem("swmart_user");
        const storedToken = localStorage.getItem("swmart_token");

        if (storedUser && storedToken) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setToken(storedToken);

          // Load user's carts from API
          await loadUserCartsFromAPI(parsedUser.id);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        // Clear corrupted data
        localStorage.removeItem("swmart_user");
        localStorage.removeItem("swmart_token");
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Load user's carts from FakeStoreAPI
  const loadUserCartsFromAPI = async (userId) => {
    try {
      setIsSyncingCart(true);
      setCartSyncMessage("Loading your cart from account...");

      const { data: apiCarts } = await api.cartAPI.getUserCarts(userId);
      console.log("Carts loaded from API:", apiCarts);
      setUserCartsFromAPI(apiCarts);

      if (apiCarts.length > 0) {
        // Convert API cart format to our local format
        const localCartItems = await convertAPICartsToLocalFormat(apiCarts);

        // Get current local cart
        const currentLocalCart = JSON.parse(
          localStorage.getItem("swmart_cart") || "[]"
        );

        // Merge: API carts + local cart (local overrides)
        const mergedCart = await mergeAPICartsWithLocalCart(
          localCartItems,
          currentLocalCart
        );

        // Save merged cart
        localStorage.setItem("swmart_cart", JSON.stringify(mergedCart));
        window.dispatchEvent(new Event("cartUpdated"));

        setCartSyncMessage(
          `Loaded ${localCartItems.length} items from your account`
        );
        console.log("Cart loaded from API and merged:", mergedCart);
      }

      return apiCarts;
    } catch (error) {
      console.error("Error loading user carts from API:", error);
      setCartSyncMessage("Error loading cart from account");
      return [];
    } finally {
      setTimeout(() => {
        setIsSyncingCart(false);
        setCartSyncMessage("");
      }, 1500);
    }
  };

  // Convert API cart format to local cart format
  const convertAPICartsToLocalFormat = async (apiCarts) => {
    const localCartItems = [];

    for (const cart of apiCarts) {
      if (!cart.products || !Array.isArray(cart.products)) continue;

      for (const apiProduct of cart.products) {
        try {
          // Fetch product details for each productId
          const { data: product } = await api.productAPI.getById(
            apiProduct.productId
          );

          localCartItems.push({
            ...product,
            quantity: apiProduct.quantity,
            addedAt: cart.date || new Date().toISOString(), // Use cart date as added date
            cartId: cart.id, // Store which cart this came from
            userId: cart.userId,
            fromAPI: true, // Mark as from API
          });
        } catch (error) {
          console.error(
            `Error fetching product ${apiProduct.productId}:`,
            error
          );
        }
      }
    }

    return localCartItems;
  };

  // Merge API cart items with local cart items
  const mergeAPICartsWithLocalCart = async (apiCartItems, localCartItems) => {
    const mergedMap = new Map();

    // First add all API items
    apiCartItems.forEach((item) => {
      mergedMap.set(item.id, {
        ...item,
        source: "api",
      });
    });

    // Then add/override with local items
    localCartItems.forEach((item) => {
      const existingItem = mergedMap.get(item.id);
      if (existingItem) {
        // Local item overrides API item (use local quantity)
        mergedMap.set(item.id, {
          ...existingItem,
          quantity: item.quantity,
          addedAt: item.addedAt || existingItem.addedAt,
          source: "local-override",
        });
      } else {
        // Add new local item
        mergedMap.set(item.id, {
          ...item,
          source: "local",
        });
      }
    });

    return Array.from(mergedMap.values());
  };

  // Save current cart to FakeStoreAPI
  const saveCartToAPI = async (userId, cartItems) => {
    try {
      if (!userId || !cartItems.length) return null;

      // Get user's existing carts
      const { data: existingCarts } = await api.cartAPI.getUserCarts(userId);

      // Create API cart format
      const apiCartData = {
        userId: userId,
        date: new Date().toISOString(),
        products: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity || 1,
        })),
      };

      let savedCart;

      if (existingCarts.length > 0) {
        // Update the most recent cart
        const latestCart = existingCarts[0]; // Assuming first is most recent
        const { data } = await api.cartAPI.updateCart(
          latestCart.id,
          apiCartData
        );
        savedCart = data;
      } else {
        // Create new cart
        const { data } = await api.cartAPI.createCart(apiCartData);
        savedCart = data;
      }

      console.log("Cart saved to API:", savedCart);
      return savedCart;
    } catch (error) {
      console.error("Error saving cart to API:", error);
      throw error;
    }
  };

  // Login function
  const login = async (usernameInput, password) => {
    try {
      setIsSyncingCart(true);
      setCartSyncMessage("Logging in...");

      // Get authentication token
      const { data: authData } = await api.authAPI.login({
        username: usernameInput,
        password: password,
      });

      const token = authData.token;

      // Get all users to find the matching one
      const { data: users } = await api.userAPI.getAll();
      const userData = users.find((u) => u.username === usernameInput);

      if (!userData) {
        throw new Error("User not found");
      }

      // Format user data
      const formattedUser = {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        name:
          `${userData.name?.firstname || ""} ${
            userData.name?.lastname || ""
          }`.trim() || usernameInput,
        firstname: userData.name?.firstname || usernameInput,
        lastname: userData.name?.lastname || "",
        address: userData.address,
        phone: userData.phone,
      };

      // Store user data
      setUser(formattedUser);
      setToken(token);
      localStorage.setItem("swmart_user", JSON.stringify(formattedUser));
      localStorage.setItem("swmart_token", token);

      // Load user's carts from API
      setCartSyncMessage("Loading your saved cart items...");
      const apiCarts = await loadUserCartsFromAPI(formattedUser.id);

      // Get current local cart count
      const localCart = JSON.parse(localStorage.getItem("swmart_cart") || "[]");
      const apiCartItems = await convertAPICartsToLocalFormat(apiCarts);

      return {
        success: true,
        user: formattedUser,
        apiCarts: apiCarts,
        apiCartItems: apiCartItems,
        localCartItems: localCart,
        cartSynced: true,
      };
    } catch (error) {
      console.error("Login error:", error);

      let errorMessage = "Login failed. Please check your credentials.";
      if (
        error.message.includes("401") ||
        error.message.includes("Invalid credentials")
      ) {
        errorMessage = "Invalid username or password.";
      } else if (
        error.message.includes("network") ||
        error.message.includes("fetch")
      ) {
        errorMessage = "Network error. Please check your connection.";
      } else if (error.message.includes("User not found")) {
        errorMessage = "User not found. Please check your username.";
      }

      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsSyncingCart(false);
      setCartSyncMessage("");
    }
  };

  // Logout function
  const logout = () => {
    // Save current cart to API before logout if user is logged in
    if (user) {
      const currentCart = JSON.parse(
        localStorage.getItem("swmart_cart") || "[]"
      );
      if (currentCart.length > 0) {
        saveCartToAPI(user.id, currentCart).catch(console.error);
      }
    }

    // Clear auth data
    setUser(null);
    setToken(null);
    setUserCartsFromAPI([]);
    localStorage.removeItem("swmart_user");
    localStorage.removeItem("swmart_token");

    console.log("Logged out");
  };

  // Sync current cart to API
  const syncCartToAPI = async () => {
    if (!user) {
      throw new Error("User must be logged in to sync cart");
    }

    try {
      setIsSyncingCart(true);
      setCartSyncMessage("Syncing cart to your account...");

      const currentCart = JSON.parse(
        localStorage.getItem("swmart_cart") || "[]"
      );
      const savedCart = await saveCartToAPI(user.id, currentCart);

      // Reload carts from API to update local state
      const updatedCarts = await loadUserCartsFromAPI(user.id);

      setCartSyncMessage("Cart synced successfully!");
      return { success: true, savedCart, updatedCarts };
    } catch (error) {
      console.error("Error syncing cart to API:", error);
      setCartSyncMessage("Error syncing cart");
      return { success: false, error: error.message };
    } finally {
      setTimeout(() => {
        setIsSyncingCart(false);
        setCartSyncMessage("");
      }, 1500);
    }
  };

  // Get user's cart history from API
  const getUserCartHistory = () => {
    return userCartsFromAPI;
  };

  const value = {
    // State
    user,
    token,
    loading,
    isSyncingCart,
    cartSyncMessage,
    userCartsFromAPI,

    // Auth functions
    login,
    logout,
    isAuthenticated: !!user && !!token,

    // Cart sync functions
    syncCartToAPI,
    loadUserCartsFromAPI,
    getUserCartHistory,
    saveCartToAPI,

    // Helper
    hasCartItems: () => {
      const cart = JSON.parse(localStorage.getItem("swmart_cart") || "[]");
      return cart.length > 0;
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
