// src/contexts/AuthContext.jsx
import {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  useRef,
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
  const [userCartsFromAPI, setUserCartsFromAPI] = useState([]);
  const [allCarts, setAllCarts] = useState([]);
  const [systemCartStats, setSystemCartStats] = useState({
    totalCarts: 0,
    totalUsersWithCarts: 0,
    totalItemsInSystem: 0,
  });

  const api = useApi();

  // Refs to prevent multiple calls
  const isInitializing = useRef(false);
  const isLoadingCarts = useRef(false);
  const isCalculatingStats = useRef(false);

  // Initialize auth state
  useEffect(() => {
    if (isInitializing.current) return;

    const initializeAuth = async () => {
      isInitializing.current = true;
      try {
        const storedUser = localStorage.getItem("swmart_user");
        const storedToken = localStorage.getItem("swmart_token");

        if (storedUser && storedToken) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setToken(storedToken);

          // Load initial data in parallel
          await Promise.allSettled([
            loadUserCartsFromAPI(parsedUser.id),
            loadAllCartsFromAPI(),
            calculateSystemCartStats(),
          ]);
        } else {
          await Promise.allSettled([
            loadAllCartsFromAPI(),
            calculateSystemCartStats(),
          ]);
        }
      } catch (error) {
        console.error("❌ Auth init error:", error);
        clearAuthData();
      } finally {
        setLoading(false);
        isInitializing.current = false;
      }
    };

    initializeAuth();
  }, []);

  // Clear auth data
  const clearAuthData = () => {
    localStorage.removeItem("swmart_user");
    localStorage.removeItem("swmart_token");
    setUser(null);
    setToken(null);
    setUserCartsFromAPI([]);
  };

  // Load ALL carts from FakeStoreAPI
  const loadAllCartsFromAPI = useCallback(
    async (forceRefresh = false) => {
      if (isLoadingCarts.current) return allCarts;

      try {
        isLoadingCarts.current = true;
        console.log("🔄 Loading all carts...");
        const { data: allCartsData } = await api.cartAPI.getAll(forceRefresh);
        console.log("✅ All carts loaded:", allCartsData.length, "carts");
        setAllCarts(allCartsData);
        return allCartsData;
      } catch (error) {
        console.error("❌ Error loading all carts:", error);
        return [];
      } finally {
        isLoadingCarts.current = false;
      }
    },
    [api.cartAPI, allCarts]
  );

  // Calculate system-wide cart statistics
  const calculateSystemCartStats = useCallback(
    async (forceRefresh = false) => {
      if (isCalculatingStats.current) return systemCartStats;

      try {
        isCalculatingStats.current = true;
        const { data: allCartsData } = await api.cartAPI.getAll(forceRefresh);

        if (!allCartsData || allCartsData.length === 0) {
          return systemCartStats;
        }

        let totalItems = 0;
        const userSet = new Set();

        allCartsData.forEach((cart) => {
          userSet.add(cart.userId);
          if (cart.products && Array.isArray(cart.products)) {
            totalItems += cart.products.reduce(
              (sum, product) => sum + product.quantity,
              0
            );
          }
        });

        const newStats = {
          totalCarts: allCartsData.length,
          totalUsersWithCarts: userSet.size,
          totalItemsInSystem: totalItems,
        };

        setSystemCartStats(newStats);
        return newStats;
      } catch (error) {
        console.error("❌ Error calculating cart stats:", error);
        return systemCartStats;
      } finally {
        isCalculatingStats.current = false;
      }
    },
    [api.cartAPI, systemCartStats]
  );

  // Load user's carts from FakeStoreAPI
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
        console.log(`✅ User ${userId} carts loaded:`, userCarts?.length || 0);
        setUserCartsFromAPI(userCarts || []);

        if (userCarts?.length > 0) {
          // Process user's carts
          const localCartItems = await convertAPICartsToLocalFormat(userCarts);
          const currentLocalCart = JSON.parse(
            localStorage.getItem("swmart_cart") || "[]"
          );

          // Merge carts
          const mergedCart = mergeCarts(localCartItems, currentLocalCart);

          // Save to localStorage
          localStorage.setItem("swmart_cart", JSON.stringify(mergedCart));
          window.dispatchEvent(new Event("cartUpdated"));

          setCartSyncMessage(
            `✅ Loaded ${localCartItems.length} items from your account`
          );
        } else {
          setCartSyncMessage("ℹ️ No saved carts found");
        }

        return userCarts || [];
      } catch (error) {
        console.error("❌ Error loading user carts:", error);
        setCartSyncMessage("❌ Error loading cart history");
        return [];
      } finally {
        setTimeout(() => {
          setIsSyncingCart(false);
          setCartSyncMessage("");
          isLoadingCarts.current = false;
        }, 1000);
      }
    },
    [api.cartAPI, api.productAPI]
  );

  // Convert API cart format to local format
  const convertAPICartsToLocalFormat = useCallback(
    async (apiCarts) => {
      if (!apiCarts || apiCarts.length === 0) return [];

      const localCartItems = [];
      const productCache = new Map();

      // Sort carts by date (newest first)
      const sortedCarts = [...apiCarts].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );

      for (const cart of sortedCarts) {
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
              quantity: apiProduct.quantity,
              addedAt: cart.date || new Date().toISOString(),
              cartId: cart.id,
              userId: cart.userId,
              fromAPI: true,
              cartDate: cart.date,
            });
          } catch (error) {
            console.error(
              `❌ Error fetching product ${apiProduct.productId}:`,
              error
            );
          }
        }
      }

      // Remove duplicates, keep most recent
      const uniqueItems = [];
      const seenIds = new Set();

      localCartItems.reverse().forEach((item) => {
        if (!seenIds.has(item.id)) {
          seenIds.add(item.id);
          uniqueItems.unshift(item);
        }
      });

      return uniqueItems;
    },
    [api.productAPI]
  );

  // Merge API carts with local cart
  const mergeCarts = useCallback((apiCartItems, localCartItems) => {
    const mergedMap = new Map();

    // Add API items
    apiCartItems.forEach((item) => {
      mergedMap.set(item.id, {
        ...item,
        source: "api",
      });
    });

    // Add/override with local items
    localCartItems.forEach((item) => {
      const existingItem = mergedMap.get(item.id);
      if (existingItem) {
        mergedMap.set(item.id, {
          ...existingItem,
          quantity: item.quantity, // Local quantity overrides
          addedAt: item.addedAt || existingItem.addedAt,
          source: "local-override",
        });
      } else {
        mergedMap.set(item.id, {
          ...item,
          source: "local",
        });
      }
    });

    return Array.from(mergedMap.values());
  }, []);

  // Save current cart to FakeStoreAPI
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
          console.log("✅ Updated existing cart");
        } else {
          // Create new cart
          const { data } = await api.cartAPI.create(apiCartData);
          savedCart = data;
          console.log("✅ Created new cart");
        }

        // Clear cache for user's carts to force refresh
        api.clearCacheForUrl(`/carts/user/${userId}`);

        // Refresh data
        await Promise.allSettled([
          loadAllCartsFromAPI(true),
          calculateSystemCartStats(true),
        ]);

        return savedCart;
      } catch (error) {
        console.error("❌ Error saving cart to API:", error);
        throw error;
      }
    },
    [
      api.cartAPI,
      api.clearCacheForUrl,
      loadAllCartsFromAPI,
      calculateSystemCartStats,
    ]
  );

  // Login function
  const login = useCallback(
    async (usernameInput, password) => {
      try {
        setIsSyncingCart(true);
        setCartSyncMessage("🔐 Logging in...");

        // Authenticate
        const { data: authData } = await api.authAPI.login({
          username: usernameInput,
          password: password,
        });

        const token = authData.token;

        // Get user data
        const { data: users } = await api.userAPI.getAll();
        const userData = users.find((u) => u.username === usernameInput);

        if (!userData) throw new Error("User not found");

        // Format user
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

        // Store auth data
        setUser(formattedUser);
        setToken(token);
        localStorage.setItem("swmart_user", JSON.stringify(formattedUser));
        localStorage.setItem("swmart_token", token);

        // Load user's carts and stats
        setCartSyncMessage("🔄 Loading your cart history...");
        const [apiCarts, systemStats] = await Promise.allSettled([
          loadUserCartsFromAPI(formattedUser.id, true),
          calculateSystemCartStats(true),
        ]);

        return {
          success: true,
          user: formattedUser,
          apiCarts: apiCarts.value || [],
          systemStats: systemStats.value || systemCartStats,
        };
      } catch (error) {
        console.error("❌ Login error:", error);

        let errorMessage = "Login failed. Please check credentials.";
        if (
          error.message.includes("401") ||
          error.message.includes("Invalid")
        ) {
          errorMessage = "Invalid username or password.";
        } else if (
          error.message.includes("network") ||
          error.message.includes("fetch")
        ) {
          errorMessage = "Network error. Check connection.";
        }

        return {
          success: false,
          error: errorMessage,
        };
      } finally {
        setTimeout(() => {
          setIsSyncingCart(false);
          setCartSyncMessage("");
        }, 1000);
      }
    },
    [
      api.authAPI,
      api.userAPI,
      loadUserCartsFromAPI,
      calculateSystemCartStats,
      systemCartStats,
    ]
  );

  // Logout function
  const logout = useCallback(async () => {
    if (user) {
      const currentCart = JSON.parse(
        localStorage.getItem("swmart_cart") || "[]"
      );
      if (currentCart.length > 0) {
        try {
          await saveCartToAPI(user.id, currentCart);
          console.log("✅ Cart saved before logout");
        } catch (error) {
          console.error("❌ Error saving cart before logout:", error);
        }
      }
    }

    clearAuthData();
    console.log("👋 Logged out");
  }, [user, saveCartToAPI]);

  // Sync cart to API
  const syncCartToAPI = useCallback(async () => {
    if (!user) throw new Error("Login required to sync cart");

    try {
      setIsSyncingCart(true);
      setCartSyncMessage("🔄 Syncing cart...");

      const currentCart = JSON.parse(
        localStorage.getItem("swmart_cart") || "[]"
      );
      const savedCart = await saveCartToAPI(user.id, currentCart);

      setCartSyncMessage("✅ Cart synced!");
      return { success: true, savedCart };
    } catch (error) {
      console.error("❌ Cart sync error:", error);
      setCartSyncMessage("❌ Sync failed");
      return { success: false, error: error.message };
    } finally {
      setTimeout(() => {
        setIsSyncingCart(false);
        setCartSyncMessage("");
      }, 1500);
    }
  }, [user, saveCartToAPI]);

  // Refresh all data
  const refreshAllData = useCallback(async () => {
    if (isLoadingCarts.current) return;

    try {
      setIsSyncingCart(true);
      setCartSyncMessage("🔄 Refreshing data...");

      // Clear all caches first
      api.clearCache();

      const results = await Promise.allSettled([
        loadAllCartsFromAPI(true),
        calculateSystemCartStats(true),
        user ? loadUserCartsFromAPI(user.id, true) : Promise.resolve([]),
      ]);

      setCartSyncMessage("✅ Data refreshed!");
      return results;
    } catch (error) {
      console.error("❌ Refresh error:", error);
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

    // Auth functions
    login,
    logout,
    isAuthenticated: !!user && !!token,

    // Cart sync functions
    syncCartToAPI,
    loadUserCartsFromAPI,
    saveCartToAPI,

    // Data functions
    loadAllCartsFromAPI,
    calculateSystemCartStats,
    refreshAllData,

    // Helper
    hasCartItems: () => {
      const cart = JSON.parse(localStorage.getItem("swmart_cart") || "[]");
      return cart.length > 0;
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
