// src/contexts/CartContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
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
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [cartStats, setCartStats] = useState({
    itemCount: 0,
    uniqueProducts: 0,
    totalValue: 0,
    lastUpdated: null,
  });

  const { user, saveCartToAPI, loadUserCartsFromAPI, systemCartStats } =
    useAuth();

  // Refs to prevent multiple operations
  const isAutoSyncing = useRef(false);
  const syncTimeoutRef = useRef(null);
  const updateTimeoutRef = useRef(null);

  // Initialize cart data
  useEffect(() => {
    const initializeCart = () => {
      try {
        // Load from localStorage
        const savedCart = localStorage.getItem("swmart_cart");
        const savedWishlist = localStorage.getItem("swmart_wishlist");

        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          setCart(parsedCart);
          console.log("🛒 Loaded cart:", parsedCart.length, "items");
        }

        if (savedWishlist) {
          setWishlist(JSON.parse(savedWishlist));
        }

        updateCartStats();
      } catch (error) {
        console.error("❌ Cart init error:", error);
        resetCartData();
      } finally {
        setIsInitialized(true);
      }
    };

    initializeCart();
  }, []);

  // Update cart stats when cart changes
  useEffect(() => {
    if (!isInitialized) return;

    // Debounce stats update
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    updateTimeoutRef.current = setTimeout(() => {
      updateCartStats();
    }, 300);
  }, [cart, isInitialized]);

  // Save cart to localStorage when it changes
  useEffect(() => {
    if (!isInitialized) return;

    try {
      localStorage.setItem("swmart_cart", JSON.stringify(cart));

      // Auto-sync to API if user is logged in (debounced)
      if (user && user.id && cart.length > 0) {
        if (syncTimeoutRef.current) {
          clearTimeout(syncTimeoutRef.current);
        }

        syncTimeoutRef.current = setTimeout(() => {
          autoSyncToAPI();
        }, 5000); // 5 second debounce
      }
    } catch (error) {
      console.error("❌ Cart save error:", error);
    }

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [cart, isInitialized, user]);

  // Save wishlist to localStorage
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("swmart_wishlist", JSON.stringify(wishlist));
    }
  }, [wishlist, isInitialized]);

  // Auto-sync cart to API
  const autoSyncToAPI = useCallback(async () => {
    if (
      !user ||
      !user.id ||
      cart.length === 0 ||
      isAutoSyncing.current ||
      isSyncing
    )
      return;

    try {
      isAutoSyncing.current = true;
      setIsSyncing(true);
      await saveCartToAPI(user.id, cart);
      console.log("✅ Auto-sync completed");
    } catch (error) {
      console.error("❌ Auto-sync failed:", error);
    } finally {
      isAutoSyncing.current = false;
      setIsSyncing(false);
    }
  }, [user, cart, isSyncing, saveCartToAPI]);

  // Update cart statistics
  const updateCartStats = useCallback(() => {
    const itemCount = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const uniqueProducts = new Set(cart.map((item) => item.id)).size;
    const totalValue = cart.reduce((sum, item) => {
      const price = parseFloat(item.price) || 0;
      const quantity = parseInt(item.quantity) || 0;
      return sum + price * quantity;
    }, 0);

    setCartStats({
      itemCount,
      uniqueProducts,
      totalValue,
      lastUpdated: new Date().toISOString(),
    });
  }, [cart]);

  // Reset cart data
  const resetCartData = () => {
    setCart([]);
    setWishlist([]);
    localStorage.setItem("swmart_cart", JSON.stringify([]));
    localStorage.setItem("swmart_wishlist", JSON.stringify([]));
  };

  // Cart operations
  const addToCart = useCallback(async (product, quantity = 1) => {
    if (!product) return;

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) => item.id === product.id
      );

      if (existingIndex > -1) {
        // Update existing item
        const updatedCart = [...prevCart];
        updatedCart[existingIndex] = {
          ...updatedCart[existingIndex],
          quantity: updatedCart[existingIndex].quantity + quantity,
          updatedAt: new Date().toISOString(),
        };
        return updatedCart;
      } else {
        // Add new item
        const newItem = {
          ...product,
          quantity,
          addedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        return [...prevCart, newItem];
      }
    });

    window.dispatchEvent(new Event("cartUpdated"));
  }, []);

  const removeFromCart = useCallback(async (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
    window.dispatchEvent(new Event("cartUpdated"));
  }, []);

  const updateQuantity = useCallback(
    async (productId, quantity) => {
      if (quantity < 1) {
        return await removeFromCart(productId);
      }

      setCart((prevCart) =>
        prevCart.map((item) =>
          item.id === productId
            ? { ...item, quantity, updatedAt: new Date().toISOString() }
            : item
        )
      );

      window.dispatchEvent(new Event("cartUpdated"));
    },
    [removeFromCart]
  );

  const clearCart = useCallback(async () => {
    setCart([]);
    window.dispatchEvent(new Event("cartUpdated"));
  }, []);

  // Wishlist operations
  const addToWishlist = useCallback((product) => {
    if (!product) return;

    setWishlist((prev) => {
      if (prev.find((item) => item.id === product.id)) {
        return prev;
      }
      return [...prev, { ...product, addedAt: new Date().toISOString() }];
    });
  }, []);

  const removeFromWishlist = useCallback((productId) => {
    setWishlist((prev) => prev.filter((item) => item.id !== productId));
  }, []);

  const moveToCart = useCallback(
    (product) => {
      addToCart(product);
      removeFromWishlist(product.id);
    },
    [addToCart, removeFromWishlist]
  );

  const moveToWishlist = useCallback(
    (product) => {
      addToWishlist(product);
      removeFromCart(product.id);
    },
    [addToWishlist, removeFromCart]
  );

  // Calculations
  const getCartTotal = useCallback(() => {
    return cart.reduce((total, item) => {
      const price = parseFloat(item.price) || 0;
      const quantity = parseInt(item.quantity) || 0;
      return total + price * quantity;
    }, 0);
  }, [cart]);

  const getCartCount = useCallback(() => {
    return cart.reduce(
      (count, item) => count + (parseInt(item.quantity) || 0),
      0
    );
  }, [cart]);

  const getWishlistCount = useCallback(() => wishlist.length, [wishlist]);

  // Queries
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

  const getFormattedCart = useCallback(() => {
    return cart.map((item) => ({
      ...item,
      formattedPrice: `$${parseFloat(item.price || 0).toFixed(2)}`,
      formattedTotal: `$${(
        parseFloat(item.price || 0) * parseInt(item.quantity || 0)
      ).toFixed(2)}`,
    }));
  }, [cart]);

  // Manual sync
  const manualSyncCart = useCallback(async () => {
    if (!user || !user.id || isAutoSyncing.current) {
      console.warn("⚠️ Cannot sync now");
      return false;
    }

    try {
      setIsSyncing(true);
      await saveCartToAPI(user.id, cart);
      console.log("✅ Manual sync completed");
      return true;
    } catch (error) {
      console.error("❌ Manual sync failed:", error);
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [user, cart, saveCartToAPI]);

  // Load user's cart from AuthContext
  const loadUserCart = useCallback(
    (userCartItems) => {
      if (!userCartItems || !Array.isArray(userCartItems)) return;

      try {
        setCart(userCartItems);
        localStorage.setItem("swmart_cart", JSON.stringify(userCartItems));
        console.log("✅ User cart loaded:", userCartItems.length, "items");
        window.dispatchEvent(new Event("cartUpdated"));
        updateCartStats();
      } catch (error) {
        console.error("❌ Error loading user cart:", error);
      }
    },
    [updateCartStats]
  );

  // Merge carts
  const mergeWithUserCart = useCallback(
    (userCartItems) => {
      if (!userCartItems || !Array.isArray(userCartItems)) {
        return cart;
      }

      try {
        const mergedMap = new Map();

        // Add user's items
        userCartItems.forEach((item) => {
          mergedMap.set(item.id, {
            ...item,
            source: "api",
          });
        });

        // Add/override with current items
        cart.forEach((currentItem) => {
          const existingItem = mergedMap.get(currentItem.id);
          if (existingItem) {
            mergedMap.set(currentItem.id, {
              ...existingItem,
              quantity: currentItem.quantity, // Current overrides
              updatedAt: new Date().toISOString(),
              source: "local-override",
            });
          } else {
            mergedMap.set(currentItem.id, {
              ...currentItem,
              source: "local",
            });
          }
        });

        const mergedCart = Array.from(mergedMap.values());
        setCart(mergedCart);
        localStorage.setItem("swmart_cart", JSON.stringify(mergedCart));
        console.log("✅ Carts merged:", mergedCart.length, "items");
        window.dispatchEvent(new Event("cartUpdated"));
        updateCartStats();

        return mergedCart;
      } catch (error) {
        console.error("❌ Merge error:", error);
        return cart;
      }
    },
    [cart, updateCartStats]
  );

  // Get system statistics
  const getSystemStatistics = useCallback(() => {
    return systemCartStats;
  }, [systemCartStats]);

  const value = {
    // State
    cart,
    wishlist,
    isSyncing,
    cartStats,

    // Cart operations
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,

    // Wishlist operations
    addToWishlist,
    removeFromWishlist,
    moveToCart,
    moveToWishlist,

    // Calculations
    getCartTotal,
    getCartCount,
    getWishlistCount,

    // Queries
    isInCart,
    getCartItemQuantity,
    getFormattedCart,

    // Cart management
    manualSyncCart,
    loadUserCart,
    mergeWithUserCart,

    // Statistics
    getSystemStatistics,
    updateCartStats,

    // Helpers
    cartItemCount: getCartCount(),
    cartTotalAmount: getCartTotal(),
    isCartEmpty: cart.length === 0,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
