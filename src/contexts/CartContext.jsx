import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};

export const CartProvider = ({ children }) => {
  // State
  const [cart, setCart] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  const { user, getApi } = useAuth();
  const api = getApi();

  // Refs
  const hasLoadedUserCart = useRef(false);

  // ============================================================================
  // API CART FUNCTIONS
  // ============================================================================

  const getAllCarts = useCallback(async () => {
    try {
      const { data } = await api.cartAPI.getAll();
      return { success: true, data };
    } catch (error) {
      console.error("Error getting all carts:", error);
      return { success: false, error: error.message };
    }
  }, [api]);

  const getCartById = useCallback(async (cartId) => {
    try {
      const { data } = await api.cartAPI.getById(cartId);
      return { success: true, data };
    } catch (error) {
      console.error("Error getting cart:", error);
      return { success: false, error: error.message };
    }
  }, [api]);

  const getUserCarts = useCallback(async (userId) => {
    try {
      const { data } = await api.cartAPI.getUserCarts(userId);
      return { success: true, data };
    } catch (error) {
      console.error("Error getting user carts:", error);
      return { success: false, error: error.message };
    }
  }, [api]);

  const createCartAPI = useCallback(async (cartData) => {
    try {
      const { data } = await api.cartAPI.create(cartData);
      return { success: true, data };
    } catch (error) {
      console.error("Error creating cart:", error);
      return { success: false, error: error.message };
    }
  }, [api]);

  const updateCartAPI = useCallback(async (cartId, cartData) => {
    try {
      const { data } = await api.cartAPI.update(cartId, cartData);
      return { success: true, data };
    } catch (error) {
      console.error("Error updating cart:", error);
      return { success: false, error: error.message };
    }
  }, [api]);

  const deleteCartAPI = useCallback(async (cartId) => {
    try {
      const { data } = await api.cartAPI.delete(cartId);
      return { success: true, data };
    } catch (error) {
      console.error("Error deleting cart:", error);
      return { success: false, error: error.message };
    }
  }, [api]);

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  const getCartIdentifier = useCallback((userId) => {
    return userId || 1;
  }, []);

  const updateCartInAPI = useCallback(async (updatedCart) => {
    if (!user?.id) return { success: false };

    try {
      setIsSyncing(true);
      const cartIdentifier = getCartIdentifier(user.id);
      
      const apiCartData = {
        userId: user.id,
        date: new Date().toISOString(),
        products: updatedCart.map((item) => ({
          productId: item.id,
          quantity: item.quantity || 1,
        })),
      };

      const result = await updateCartAPI(cartIdentifier, apiCartData);

      if (result.success) {
        const syncTime = new Date().toISOString();
        setLastSyncTime(syncTime);
        localStorage.setItem("swmart_cart_sync_time", syncTime);

        console.log("✅ Cart Updated at:", syncTime);
      }

      return result;
    } catch (error) {
      console.error("Error updating cart in API:", error);
      return { success: false, error: error.message };
    } finally {
      setIsSyncing(false);
    }
  }, [user, getCartIdentifier, updateCartAPI]);

  const deleteCartInAPI = useCallback(async () => {
    if (!user?.id) return { success: false };

    try {
      setIsSyncing(true);
      const cartIdentifier = getCartIdentifier(user.id);
      
      const result = await deleteCartAPI(cartIdentifier);

      if (result.success) {
        setLastSyncTime(null);
        localStorage.removeItem("swmart_cart_sync_time");
        console.log("✅ Cart deleted from API");
      }

      return result;
    } catch (error) {
      console.error("Error deleting cart from API:", error);
      return { success: false, error: error.message };
    } finally {
      setIsSyncing(false);
    }
  }, [user, getCartIdentifier, deleteCartAPI]);

  const convertAPICartToLocal = useCallback(async (apiCart) => {
    if (!apiCart || !apiCart.products) return [];

    console.log("🔄 Fetching product details for", apiCart.products.length, "cart items...");

    const productPromises = apiCart.products.map(async (item) => {
      try {
        const response = await fetch(
          `https://fakestoreapi.com/products/${item.productId}`
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const product = await response.json();
        
        return {
          ...product,
          quantity: item.quantity,
          addedAt: apiCart.date,
          fromAPI: true,
        };
      } catch (error) {
        console.error(`Failed to fetch product ${item.productId}:`, error);
        return {
          id: item.productId,
          quantity: item.quantity,
          title: "Unknown Product",
          price: 0,
          image: "",
          addedAt: apiCart.date,
          fromAPI: true,
          fetchError: true,
        };
      }
    });

    const products = await Promise.all(productPromises);
    console.log("✅ Fetched product details for", products.length, "items");
    
    return products;
  }, []);

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  useEffect(() => {
    const initializeCart = async () => {
      try {
        const savedCart = localStorage.getItem("swmart_cart");
        const savedSyncTime = localStorage.getItem("swmart_cart_sync_time");

        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          setCart(parsedCart);
          console.log("✅ Loaded cart from localStorage:", parsedCart.length, "items");
        }

        if (savedSyncTime) {
          setLastSyncTime(savedSyncTime);
        }
      } catch (error) {
        console.error("Cart init error:", error);
        localStorage.removeItem("swmart_cart");
        localStorage.removeItem("swmart_cart_sync_time");
      } finally {
        setIsInitialized(true);
      }
    };

    initializeCart();
  }, []);

  useEffect(() => {
    if (isInitialized && user?.id && !hasLoadedUserCart.current) {
      console.log("📥 User logged in, loading cart from API...");
      loadUserCartFromAPI(user.id);
      hasLoadedUserCart.current = true;
    }

    if (!user?.id) {
      hasLoadedUserCart.current = false;
    }
  }, [isInitialized, user?.id]);

  // ============================================================================
  // CART LOADING FROM API
  // ============================================================================

  const loadUserCartFromAPI = useCallback(
    async (userId) => {
      if (!userId) return;

      try {
        setIsSyncing(true);
        console.log("📥 Loading cart from FakeStore API for user:", userId);

        const result = await getUserCarts(userId);

        if (result.success && result.data && result.data.length > 0) {
          const latestCart = result.data[0];
          console.log("✅ Found API cart with ID:", latestCart.id);
          console.log("   Cart has", latestCart.products.length, "products");

          const cartItems = await convertAPICartToLocal(latestCart);

          if (cartItems.length > 0) {
            setCart(cartItems);
            localStorage.setItem("swmart_cart", JSON.stringify(cartItems));
            window.dispatchEvent(new Event("cartUpdated"));
            console.log("✅ Cart loaded from API:", cartItems.length, "items");
          }
        } else {
          console.log("ℹ️ No carts found for user in API");
        }
      } catch (error) {
        console.error("Error loading cart from API:", error);
      } finally {
        setIsSyncing(false);
      }
    },
    [getUserCarts, convertAPICartToLocal]
  );

  const refreshCartFromAPI = useCallback(async () => {
    if (!user?.id) {
      console.warn("No user logged in");
      return { success: false, error: "No user logged in" };
    }

    try {
      setIsSyncing(true);
      console.log("🔄 Manually refreshing cart from API...");

      const result = await getUserCarts(user.id);

      if (result.success && result.data && result.data.length > 0) {
        const latestCart = result.data[0];
        const cartItems = await convertAPICartToLocal(latestCart);

        setCart(cartItems);
        localStorage.setItem("swmart_cart", JSON.stringify(cartItems));
        window.dispatchEvent(new Event("cartUpdated"));
        
        console.log("✅ Cart refreshed from API:", cartItems.length, "items");
        return { success: true, data: cartItems };
      } else {
        console.log("ℹ️ No carts found for user in API");
        return { success: false, error: "No cart found" };
      }
    } catch (error) {
      console.error("Error refreshing cart from API:", error);
      return { success: false, error: error.message };
    } finally {
      setIsSyncing(false);
    }
  }, [user, getUserCarts, convertAPICartToLocal]);

  // ============================================================================
  // CART OPERATIONS (WITH IMMEDIATE API CALLS)
  // ============================================================================

  const addToCart = useCallback(async (product, quantity = 1) => {
    if (!product) return { success: false };

    try {
      const updatedCart = [...cart];
      const existingIndex = updatedCart.findIndex(
        (item) => item.id === product.id
      );

      if (existingIndex > -1) {
        updatedCart[existingIndex] = {
          ...updatedCart[existingIndex],
          quantity: updatedCart[existingIndex].quantity + quantity,
          updatedAt: new Date().toISOString(),
        };
      } else {
        updatedCart.push({
          ...product,
          quantity,
          addedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      setCart(updatedCart);

      const result = await updateCartInAPI(updatedCart);

      if (result.success) {
        localStorage.setItem("swmart_cart", JSON.stringify(updatedCart));
        window.dispatchEvent(new Event("cartUpdated"));
        return { success: true };
      } else {
        setCart(cart);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      setCart(cart);
      return { success: false, error: error.message };
    }
  }, [cart, updateCartInAPI]);

  const addMultipleToCart = useCallback(async (products) => {
    if (!products || products.length === 0) {
      return { success: false, error: "No products provided" };
    }

    try {
      console.log("📦 Adding", products.length, "products to cart...");

      const updatedCart = [...cart];
      
      products.forEach(({ product, quantity }) => {
        const existingIndex = updatedCart.findIndex(
          (item) => item.id === product.id
        );

        if (existingIndex > -1) {
          updatedCart[existingIndex] = {
            ...updatedCart[existingIndex],
            quantity: updatedCart[existingIndex].quantity + quantity,
            updatedAt: new Date().toISOString(),
          };
        } else {
          updatedCart.push({
            ...product,
            quantity,
            addedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      });

      setCart(updatedCart);

      const result = await updateCartInAPI(updatedCart);

      if (result.success) {
        localStorage.setItem("swmart_cart", JSON.stringify(updatedCart));
        window.dispatchEvent(new Event("cartUpdated"));
        console.log("✅ Added", products.length, "products to cart successfully");
        return { success: true, count: products.length };
      } else {
        setCart(cart);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error("Error adding multiple items to cart:", error);
      setCart(cart);
      return { success: false, error: error.message };
    }
  }, [cart, updateCartInAPI]);

  const removeFromCart = useCallback(async (productId) => {
    try {
      const updatedCart = cart.filter((item) => item.id !== productId);
      setCart(updatedCart);

      let result;
      if (updatedCart.length === 0) {
        console.log("🗑️ Removing last item, deleting cart from API...");
        result = await deleteCartInAPI();
      } else {
        console.log("🔄 Removing item, updating cart in API...");
        result = await updateCartInAPI(updatedCart);
      }

      if (result.success) {
        localStorage.setItem("swmart_cart", JSON.stringify(updatedCart));
        window.dispatchEvent(new Event("cartUpdated"));
        return { success: true };
      } else {
        setCart(cart);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error("Error removing from cart:", error);
      setCart(cart);
      return { success: false, error: error.message };
    }
  }, [cart, updateCartInAPI, deleteCartInAPI]);

  const updateQuantity = useCallback(async (productId, quantity) => {
    if (quantity < 1) {
      return await removeFromCart(productId);
    }

    try {
      const updatedCart = cart.map((item) =>
        item.id === productId
          ? { ...item, quantity, updatedAt: new Date().toISOString() }
          : item
      );
      setCart(updatedCart);

      const result = await updateCartInAPI(updatedCart);

      if (result.success) {
        localStorage.setItem("swmart_cart", JSON.stringify(updatedCart));
        window.dispatchEvent(new Event("cartUpdated"));
        return { success: true };
      } else {
        setCart(cart);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      setCart(cart);
      return { success: false, error: error.message };
    }
  }, [cart, updateCartInAPI, removeFromCart]);

  const clearCart = useCallback(async () => {
    try {
      setCart([]);
      localStorage.removeItem("swmart_cart");

      const result = await deleteCartInAPI();

      if (result.success) {
        window.dispatchEvent(new Event("cartUpdated"));
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error("Error clearing cart:", error);
      return { success: false, error: error.message };
    }
  }, [deleteCartInAPI]);

  const forceSyncToAPI = useCallback(async () => {
    return await updateCartInAPI(cart);
  }, [cart, updateCartInAPI]);

  // ============================================================================
  // COMPUTED VALUES & HELPERS
  // ============================================================================

  const cartStats = useMemo(() => {
    const itemCount = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const uniqueProducts = cart.length;
    const totalValue = cart.reduce((sum, item) => {
      const price = parseFloat(item.price) || 0;
      const quantity = parseInt(item.quantity) || 0;
      return sum + price * quantity;
    }, 0);

    return {
      itemCount,
      uniqueProducts,
      totalValue,
      lastUpdated: new Date().toISOString(),
    };
  }, [cart]);

  const getCartTotal = useCallback(() => cartStats.totalValue, [cartStats]);
  const getCartCount = useCallback(() => cartStats.itemCount, [cartStats]);

  const isInCart = useCallback(
    (productId) => cart.some((item) => item.id === productId),
    [cart]
  );

  const getCartItemQuantity = useCallback(
    (productId) => {
      const item = cart.find((item) => item.id === productId);
      return item ? parseInt(item.quantity) || 0 : 0;
    },
    [cart]
  );

  const getCartItem = useCallback(
    (productId) => cart.find((item) => item.id === productId),
    [cart]
  );

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const value = useMemo(
    () => ({
      // State
      cart,
      cartStats,
      isSyncing,
      lastSyncTime,

      // Cart operations (with immediate API calls)
      addToCart,
      addMultipleToCart,
      removeFromCart,
      updateQuantity,
      clearCart,

      // Raw API functions
      getAllCarts,
      getCartById,
      getUserCarts,
      createCart: createCartAPI,
      updateCart: updateCartAPI,
      deleteCart: deleteCartAPI,

      // Sync operations
      syncCartToAPI: forceSyncToAPI,
      refreshCartFromAPI,

      // Helpers
      getCartTotal,
      getCartCount,
      isInCart,
      getCartItemQuantity,
      getCartItem,

      // Computed
      cartItemCount: cartStats.itemCount,
      cartTotalAmount: cartStats.totalValue,
      isCartEmpty: cart.length === 0,
      hasCartItems: cart.length > 0,
    }),
    [
      cart,
      cartStats,
      isSyncing,
      lastSyncTime,
      addToCart,
      addMultipleToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getAllCarts,
      getCartById,
      getUserCarts,
      createCartAPI,
      updateCartAPI,
      deleteCartAPI,
      forceSyncToAPI,
      refreshCartFromAPI,
      getCartTotal,
      getCartCount,
      isInCart,
      getCartItemQuantity,
      getCartItem,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};