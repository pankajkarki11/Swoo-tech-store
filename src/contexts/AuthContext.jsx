// src/contexts/AuthContext.jsx
import {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  useRef,
} from "react";
import useApi from "../services/AdminuseApi";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  // Core auth state
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  // Cart sync states (for client app)
  const [isSyncingCart, setIsSyncingCart] = useState(false);
  const [cartSyncMessage, setCartSyncMessage] = useState("");
  const [userCartsFromAPI, setUserCartsFromAPI] = useState([]);
  const [allCarts, setAllCarts] = useState([]);
  const [systemCartStats, setSystemCartStats] = useState({
    totalCarts: 0,
    totalUsersWithCarts: 0,
    totalItemsInSystem: 0,
  });

  const api = useApi();

  // Refs
  const isInitializing = useRef(false);
  const isLoadingCarts = useRef(false);

  //  ADMIN USERNAME PATTERNS 

  const ADMIN_USERNAME_PATTERNS = [ 
    "john",    
  ];

  // Helper function to check if username qualifies for admin
  const isAdminUsername = (username) => {
    if (!username) return false;
    
    const lowerUsername = username.toLowerCase();
    return ADMIN_USERNAME_PATTERNS.some(pattern => 
      lowerUsername.includes(pattern.toLowerCase())
    );
  };

  // ========== INITIALIZATION ==========
  useEffect(() => {
    if (isInitializing.current) return;

    const initializeAuth = async () => {
      isInitializing.current = true;
      try {
        // Check for authentication data in unified format
        const storedUser = localStorage.getItem("swmart_user");
        const storedToken = localStorage.getItem("swmart_token");

        if (storedUser && storedToken) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setToken(storedToken);

          // Load carts for authenticated user
          if (parsedUser.id) {
            await loadUserCartsFromAPI(parsedUser.id);
            await loadAllCartsFromAPI();
            await calculateSystemCartStats();
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setLoading(false);
        isInitializing.current = false;
      }
    };

    initializeAuth();
  }, []);

  // ========== CORE AUTH FUNCTIONS ==========

  const clearAuthData = () => {
    // Clear all auth storage
    localStorage.removeItem("swmart_user");
    localStorage.removeItem("swmart_token");
    setUser(null);
    setToken(null);
    setUserCartsFromAPI([]);
  };

  // ========== LOGIN FUNCTION ==========
  const login = useCallback(
    async (credentials) => {
      const { username, password } = credentials;

      try {
        setIsSyncingCart(true);
        setCartSyncMessage("Logging in...");

        // Authenticate with API
        let apiUser;
        let apiToken;

        try {
          // Authenticate with FakeStoreAPI
          const { data: authData } = await api.authAPI.login({
            username: username,
            password: password,
          });

          apiToken = authData.token;

          // Get user details from API
          const { data: users } = await api.userAPI.getAll();
          apiUser = users.find((u) => u.username === username);

          if (!apiUser) {
            throw new Error("User not found in API");
          }
        } catch (apiError) {
          console.log("API login failed:", apiError);
          throw new Error("Invalid username or password");
        }

        // Check if username qualifies for admin access
        const isAdminUser = isAdminUsername(username);

        // Format user data
        const userData = {
          id: apiUser.id,
          username: apiUser.username,
          email: apiUser.email,
          name:
            `${apiUser.name?.firstname || ""} ${
              apiUser.name?.lastname || ""
            }`.trim() || username,
          firstname: apiUser.name?.firstname || username,
          lastname: apiUser.name?.lastname || "",
          address: apiUser.address,
          phone: apiUser.phone,
          role: isAdminUser ? "admin" : "customer",
          isAdmin: isAdminUser,
        };

        // Save auth data
        localStorage.setItem("swmart_token", apiToken);
        localStorage.setItem("swmart_user", JSON.stringify(userData));

        setUser(userData);
        setToken(apiToken);

        // Load user's carts if they have admin access
        if (isAdminUser) {
          setCartSyncMessage("🔄 Loading your cart history...");
          const userCarts = await loadUserCartsFromAPI(userData.id, true);
          setCartSyncMessage("✅ Login successful!");
          return {
            success: true,
            user: userData,
            token: apiToken,
            isAdmin: true,
            apiCarts: userCarts || [],
          };
        } else {
          setCartSyncMessage("✅ Login successful!");
          return {
            success: true,
            user: userData,
            token: apiToken,
            isAdmin: false,
            apiCarts: [],
          };
        }
      } catch (error) {
        console.error("Login error:", error);
        return {
          success: false,
          error: error.message || "Login failed. Please try again.",
        };
      } finally {
        setTimeout(() => {
          setIsSyncingCart(false);
          setCartSyncMessage("");
        }, 1000);
      }
    },
    [api.authAPI, api.userAPI]
  );
  // ========== CART FUNCTIONS ==========

  

  const loadAllCartsFromAPI = useCallback(
    async (forceRefresh = false) => {
      if (isLoadingCarts.current) return allCarts;

      try {
        isLoadingCarts.current = true;
        const { data: allCartsData } = await api.cartAPI.getAll(forceRefresh);
        setAllCarts(allCartsData || []);
        return allCartsData || [];
      } catch (error) {
        console.error("Error loading all carts:", error);
        return [];
      } finally {
        isLoadingCarts.current = false;
      }
    },
    [api.cartAPI, allCarts]
  );

  const calculateSystemCartStats = useCallback(async () => {
    try {
      const carts = await loadAllCartsFromAPI();

      let totalItems = 0;
      const userSet = new Set();

      carts.forEach((cart) => {
        userSet.add(cart.userId);
        if (cart.products && Array.isArray(cart.products)) {
          totalItems += cart.products.reduce(
            (sum, product) => sum + (product.quantity || 1),
            0
          );
        }
      });

      const stats = {
        totalCarts: carts.length,
        totalUsersWithCarts: userSet.size,
        totalItemsInSystem: totalItems,
      };

      setSystemCartStats(stats);
      return stats;
    } catch (error) {
      console.error("Error calculating cart stats:", error);
      return systemCartStats;
    }
  }, [loadAllCartsFromAPI, systemCartStats]);

  const loadUserCartsFromAPI = useCallback(
    async (userId, forceRefresh = false) => {
      if (!userId || isLoadingCarts.current) return [];

      try {
        isLoadingCarts.current = true;
        setIsSyncingCart(true);
        setCartSyncMessage("🔄 Loading your cart history...");

        const { data: userCarts } = await api.cartAPI.getUserCarts(
          userId,
          forceRefresh
        );
        setUserCartsFromAPI(userCarts || []);

        if (userCarts?.length > 0) {
          // Process and merge with local cart
          const apiCartItems = await convertAPICartsToLocalFormat(userCarts);
          const localCart = JSON.parse(
            localStorage.getItem("swmart_cart") || "[]"
          );

          const mergedCart = mergeCarts(apiCartItems, localCart);
          localStorage.setItem("swmart_cart", JSON.stringify(mergedCart));
          window.dispatchEvent(new Event("cartUpdated"));

          setCartSyncMessage(
            `✅ Loaded ${apiCartItems.length} items from your account`
          );
        } else {
          setCartSyncMessage("ℹ️ No saved carts found");
        }

        return userCarts || [];
      } catch (error) {
        console.error("Error loading user carts:", error);
        setCartSyncMessage("❌ Error loading cart history");
        return [];
      } finally {
        setTimeout(() => {
          isLoadingCarts.current = false;
          setIsSyncingCart(false);
          setCartSyncMessage("");
        }, 1000);
      }
    },
    [api.cartAPI]
  );

  const convertAPICartsToLocalFormat = useCallback(
    async (apiCarts) => {
      if (!apiCarts || apiCarts.length === 0) return [];

      const localCartItems = [];
      const productCache = new Map();

      for (const cart of apiCarts) {
        if (!cart.products || !Array.isArray(cart.products)) continue;

        for (const apiProduct of cart.products) {
          try {
            let product;
            if (productCache.has(apiProduct.productId)) {
              product = productCache.get(apiProduct.productId);
            } else {
              const { data: productData } = await api.productAPI.getById(
                apiProduct.productId
              );
              product = productData;
              productCache.set(apiProduct.productId, productData);
            }

            localCartItems.push({
              ...product,
              quantity: apiProduct.quantity || 1,
              addedAt: cart.date || new Date().toISOString(),
              cartId: cart.id,
              userId: cart.userId,
              fromAPI: true,
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
    },
    [api.productAPI]
  );

  const mergeCarts = useCallback((apiCartItems, localCartItems) => {
    const mergedMap = new Map();

    apiCartItems.forEach((item) => {
      mergedMap.set(item.id, { ...item, source: "api" });
    });

    localCartItems.forEach((item) => {
      const existingItem = mergedMap.get(item.id);
      if (existingItem) {
        mergedMap.set(item.id, {
          ...existingItem,
          quantity: item.quantity,
          addedAt: item.addedAt || existingItem.addedAt,
          source: "local-override",
        });
      } else {
        mergedMap.set(item.id, { ...item, source: "local" });
      }
    });

    return Array.from(mergedMap.values());
  }, []);

  const saveCartToAPI = useCallback(
    async (userId, cartItems) => {
      if (!userId || !cartItems.length || isLoadingCarts.current) return null;

      try {
        // Get user's existing carts
        const { data: existingCarts } = await api.cartAPI.getUserCarts(userId);

        // Prepare cart data
        const apiCartData = {
          userId: userId,
          date: new Date().toISOString(),
          products: cartItems.map((item) => ({
            productId: item.id,
            quantity: item.quantity || 1,
          })),
        };

        let savedCart;

        if (existingCarts?.length > 0) {
          // Update most recent cart
          const latestCart = existingCarts[0];
          const { data } = await api.cartAPI.update(latestCart.id, apiCartData);
          savedCart = data;
        } else {
          // Create new cart
          const { data } = await api.cartAPI.create(apiCartData);
          savedCart = data;
        }

        // Refresh data
        await loadAllCartsFromAPI(true);

        return savedCart;
      } catch (error) {
        console.error("Error saving cart to API:", error);
        throw error;
      }
    },
    [api.cartAPI, loadAllCartsFromAPI]
  );

  const syncCartToAPI = useCallback(async () => {
    if (!user) {
      throw new Error("User must be logged in to sync carts");
    }

    try {
      setIsSyncingCart(true);
      setCartSyncMessage("🔄 Syncing cart to API...");

      const currentCart = JSON.parse(
        localStorage.getItem("swmart_cart") || "[]"
      );

      const savedCart = await saveCartToAPI(user.id, currentCart);

      setCartSyncMessage("✅ Cart synced successfully!");
      return { success: true, savedCart };
    } catch (error) {
      console.error("Cart sync error:", error);
      setCartSyncMessage("❌ Sync failed");
      return { success: false, error: error.message };
    } finally {
      setTimeout(() => {
        setIsSyncingCart(false);
        setCartSyncMessage("");
      }, 1500);
    }
  }, [user, saveCartToAPI]);

  // ========== OTHER FUNCTIONS ==========

  const logout = useCallback(() => {
    // Save cart before logout
    if (user) {
      const currentCart = JSON.parse(
        localStorage.getItem("swmart_cart") || "[]"
      );
      if (currentCart.length > 0) {
        // Attempt to save, but don't block logout on error
        saveCartToAPI(user.id, currentCart).catch(console.error);
      }
    }

    clearAuthData();
  }, [user, saveCartToAPI]);

  const updateUser = useCallback(
    (updatedData) => {
      if (!user) return;

      const updatedUser = { ...user, ...updatedData };
      localStorage.setItem("swmart_user", JSON.stringify(updatedUser));
      setUser(updatedUser);

      return { success: true, user: updatedUser };
    },
    [user]
  );

  const refreshAllData = useCallback(async () => {
    try {
      setIsSyncingCart(true);
      setCartSyncMessage("🔄 Refreshing data...");

      // Clear API cache
      api.clearCache && api.clearCache();

      const results = await Promise.allSettled([
        loadAllCartsFromAPI(true),
        calculateSystemCartStats(),
        user ? loadUserCartsFromAPI(user.id, true) : Promise.resolve([]),
      ]);

      setCartSyncMessage("✅ Data refreshed!");
      return results;
    } catch (error) {
      console.error("Refresh error:", error);
      setCartSyncMessage("❌ Refresh failed");
      throw error;
    } finally {
      setTimeout(() => {
        setIsSyncingCart(false);
        setCartSyncMessage("");
      }, 1000);
    }
  }, [
    api,
    loadAllCartsFromAPI,
    calculateSystemCartStats,
    loadUserCartsFromAPI,
    user,
  ]);

  // ========== PROVIDER VALUE ==========

  const value = {
    // State
    user,
    token,
    loading,
    isSyncingCart,
    cartSyncMessage,
    userCartsFromAPI,
    allCarts,
    systemCartStats,

    // Auth status
    isAuthenticated: !!user && !!token,
    isAdmin: user?.isAdmin || false,

    // Auth functions
    login,
    logout,
    updateUser,

    // Cart functions
    syncCartToAPI,
    loadUserCartsFromAPI,
    saveCartToAPI,

    // Data functions
    loadAllCartsFromAPI,
    calculateSystemCartStats,
    refreshAllData,

    // Helpers
    hasCartItems: () => {
      const cart = JSON.parse(localStorage.getItem("swmart_cart") || "[]");
      return cart.length > 0;
    },

    // Admin pattern checking
    isAdminUsername,
    ADMIN_USERNAME_PATTERNS,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};