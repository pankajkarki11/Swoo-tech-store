// src/contexts/AuthContext.jsx - OPTIMIZED VERSION
import {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  useRef,
  useMemo,
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

  // Cart sync states
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

  // Refs to prevent duplicate operations
  const isInitializing = useRef(false);
  const isLoadingCarts = useRef(false);
  const productCacheRef = useRef(new Map()); // NEW: Cache products globally

  // Admin username patterns
  const ADMIN_USERNAME_PATTERNS = ["john"];

  // Helper function to check if username qualifies for admin
  const isAdminUsername = useCallback((username) => {
    if (!username) return false;
    const lowerUsername = username.toLowerCase();
    return ADMIN_USERNAME_PATTERNS.some(pattern => 
      lowerUsername.includes(pattern.toLowerCase())
    );
  }, []);

  // ========== INITIALIZATION ==========
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

          // OPTIMIZED: Load data only for admin users
          if (parsedUser.isAdmin) {
            // Load all carts and calculate stats in parallel
            await Promise.all([
              loadAllCartsFromAPI(),
              loadUserCartsFromAPI(parsedUser.id),
            ]);
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        clearAuthData();
      } finally {
        setLoading(false);
        isInitializing.current = false;
      }
    };

    initializeAuth();
  }, []);

  // ========== CORE AUTH FUNCTIONS ==========

  const clearAuthData = useCallback(() => {
    localStorage.removeItem("swmart_user");
    localStorage.removeItem("swmart_token");
    setUser(null);
    setToken(null);
    setUserCartsFromAPI([]);
    setAllCarts([]);
    productCacheRef.current.clear(); // Clear product cache
  }, []);

  // ========== OPTIMIZED LOGIN FUNCTION ==========
  const login = useCallback(
    async (credentials) => {
      const { username, password } = credentials;

      try {
        setIsSyncingCart(true);
        setCartSyncMessage("Logging in...");

        // OPTIMIZED: Single parallel API call
        const [authResponse, usersResponse] = await Promise.all([
          api.authAPI.login({ username, password }),
          api.userAPI.getAll(),
        ]);

        const apiToken = authResponse.data.token;
        const apiUser = usersResponse.data.find((u) => u.username === username);

        if (!apiUser) {
          throw new Error("User not found in API");
        }

        const isAdminUser = isAdminUsername(username);

        // Format user data
        const userData = {
          id: apiUser.id,
          username: apiUser.username,
          email: apiUser.email,
          name:
            `${apiUser.name?.firstname || ""} ${apiUser.name?.lastname || ""}`.trim() || username,
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

        // Load user's carts if admin
        let userCarts = [];
        if (isAdminUser) {
          setCartSyncMessage("🔄 Loading your cart history...");
          userCarts = await loadUserCartsFromAPI(userData.id, true);
        }

        setCartSyncMessage("✅ Login successful!");
        
        return {
          success: true,
          user: userData,
          token: apiToken,
          isAdmin: isAdminUser,
          apiCarts: userCarts,
        };
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
    [api, isAdminUsername]
  );

  // ========== OPTIMIZED CART FUNCTIONS ==========

  // OPTIMIZED: Load all carts and calculate stats in one go
  const loadAllCartsFromAPI = useCallback(
    async (forceRefresh = false) => {
      if (isLoadingCarts.current && !forceRefresh) return allCarts;

      try {
        isLoadingCarts.current = true;
        const { data: allCartsData } = await api.cartAPI.getAll(forceRefresh);
        setAllCarts(allCartsData || []);

        // Calculate stats immediately without additional function call
        let totalItems = 0;
        const userSet = new Set();

        (allCartsData || []).forEach((cart) => {
          userSet.add(cart.userId);
          if (cart.products && Array.isArray(cart.products)) {
            totalItems += cart.products.reduce(
              (sum, product) => sum + (product.quantity || 1),
              0
            );
          }
        });

        setSystemCartStats({
          totalCarts: allCartsData?.length || 0,
          totalUsersWithCarts: userSet.size,
          totalItemsInSystem: totalItems,
        });

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

  // REMOVED: calculateSystemCartStats - now done inside loadAllCartsFromAPI

  // OPTIMIZED: Load user carts with product cache
  const loadUserCartsFromAPI = useCallback(
    async (userId, forceRefresh = false) => {
      if (!userId || (isLoadingCarts.current && !forceRefresh)) return [];

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

  // OPTIMIZED: Use product cache to avoid duplicate API calls
  const convertAPICartsToLocalFormat = useCallback(
    async (apiCarts) => {
      if (!apiCarts || apiCarts.length === 0) return [];

      const localCartItems = [];
      const productCache = productCacheRef.current;

      // Collect all unique product IDs
      const productIds = new Set();
      apiCarts.forEach(cart => {
        cart.products?.forEach(item => {
          if (!productCache.has(item.productId)) {
            productIds.add(item.productId);
          }
        });
      });

      // OPTIMIZED: Fetch all missing products in parallel
      if (productIds.size > 0) {
        const productPromises = Array.from(productIds).map(async (productId) => {
          try {
            const { data: productData } = await api.productAPI.getById(productId);
            productCache.set(productId, productData);
            return productData;
          } catch (error) {
            console.error(`Error fetching product ${productId}:`, error);
            return null;
          }
        });

        await Promise.all(productPromises);
      }

      // Build cart items using cached products
      for (const cart of apiCarts) {
        if (!cart.products || !Array.isArray(cart.products)) continue;

        for (const apiProduct of cart.products) {
          const product = productCache.get(apiProduct.productId);
          
          if (product) {
            localCartItems.push({
              ...product,
              quantity: apiProduct.quantity || 1,
              addedAt: cart.date || new Date().toISOString(),
              cartId: cart.id,
              userId: cart.userId,
              fromAPI: true,
            });
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
        const { data: existingCarts } = await api.cartAPI.getUserCarts(userId);

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
          const latestCart = existingCarts[0];
          const { data } = await api.cartAPI.update(latestCart.id, apiCartData);
          savedCart = data;
        } else {
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
    // Save cart before logout (non-blocking)
    if (user) {
      const currentCart = JSON.parse(
        localStorage.getItem("swmart_cart") || "[]"
      );
      if (currentCart.length > 0) {
        saveCartToAPI(user.id, currentCart).catch(console.error);
      }
    }

    clearAuthData();
  }, [user, saveCartToAPI, clearAuthData]);

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

  // OPTIMIZED: Refresh all data efficiently
  const refreshAllData = useCallback(async () => {
    try {
      setIsSyncingCart(true);
      setCartSyncMessage("🔄 Refreshing data...");

      // Clear API cache
      api.clearCache && api.clearCache();

      // OPTIMIZED: Parallel refresh with proper error handling
      const tasks = [loadAllCartsFromAPI(true)];
      
      if (user) {
        tasks.push(loadUserCartsFromAPI(user.id, true));
      }

      const results = await Promise.allSettled(tasks);

      const hasErrors = results.some(r => r.status === 'rejected');
      
      if (hasErrors) {
        setCartSyncMessage("⚠️ Data refreshed with some errors");
      } else {
        setCartSyncMessage("✅ Data refreshed!");
      }

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
  }, [api, loadAllCartsFromAPI, loadUserCartsFromAPI, user]);

  // OPTIMIZED: Memoize helper function
  const hasCartItems = useCallback(() => {
    try {
      const cart = JSON.parse(localStorage.getItem("swmart_cart") || "[]");
      return cart.length > 0;
    } catch {
      return false;
    }
  }, []);

  // ========== MEMOIZED PROVIDER VALUE ==========
  const value = useMemo(() => ({
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
    refreshAllData,

    // Helpers
    hasCartItems,
    isAdminUsername,
    ADMIN_USERNAME_PATTERNS,
  }), [
    user,
    token,
    loading,
    isSyncingCart,
    cartSyncMessage,
    userCartsFromAPI,
    allCarts,
    systemCartStats,
    login,
    logout,
    updateUser,
    syncCartToAPI,
    loadUserCartsFromAPI,
    saveCartToAPI,
    loadAllCartsFromAPI,
    refreshAllData,
    hasCartItems,
    isAdminUsername,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};