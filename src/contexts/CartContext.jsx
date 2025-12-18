// src/contexts/CartContext.jsx - OPTIMIZED VERSION
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
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const { user, saveCartToAPI } = useAuth();

  // Refs to prevent multiple operations
  const isAutoSyncing = useRef(false);
  const syncTimeoutRef = useRef(null);

  // ========== INITIALIZATION ==========
  useEffect(() => {
    const initializeCart = () => {
      try {
        const savedCart = localStorage.getItem("swmart_cart");
        const savedWishlist = localStorage.getItem("swmart_wishlist");

        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          setCart(parsedCart);
        }

        if (savedWishlist) {
          setWishlist(JSON.parse(savedWishlist));
        }
      } catch (error) {
        console.error("Cart init error:", error);
        // Clear corrupted data
        localStorage.removeItem("swmart_cart");
        localStorage.removeItem("swmart_wishlist");
      } finally {
        setIsInitialized(true);
      }
    };

    initializeCart();
  }, []);

  // ========== AUTO-SAVE & AUTO-SYNC ==========
  
  // Save cart to localStorage and auto-sync to API
  useEffect(() => {
    if (!isInitialized) return;

    try {
      localStorage.setItem("swmart_cart", JSON.stringify(cart));

      // Auto-sync to API if user is logged in (debounced)
      if (user?.id && cart.length > 0) {
        // Clear existing timeout
        if (syncTimeoutRef.current) {
          clearTimeout(syncTimeoutRef.current);
        }

        // Debounce sync for 5 seconds
        syncTimeoutRef.current = setTimeout(() => {
          autoSyncToAPI();
        }, 5000);
      }
    } catch (error) {
      console.error("Cart save error:", error);
    }

    // Cleanup
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [cart, isInitialized, user]);

  // Save wishlist to localStorage
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem("swmart_wishlist", JSON.stringify(wishlist));
      } catch (error) {
        console.error("Wishlist save error:", error);
      }
    }
  }, [wishlist, isInitialized]);

  // ========== AUTO-SYNC FUNCTION ==========
  
  const autoSyncToAPI = useCallback(async () => {
    if (!user?.id || cart.length === 0 || isAutoSyncing.current || isSyncing) {
      return;
    }

    try {
      isAutoSyncing.current = true;
      setIsSyncing(true);
      await saveCartToAPI(user.id, cart);
    } catch (error) {
      console.error("Auto-sync failed:", error);
    } finally {
      isAutoSyncing.current = false;
      setIsSyncing(false);
    }
  }, [user, cart, isSyncing, saveCartToAPI]);

  // ========== CART OPERATIONS ==========

  const addToCart = useCallback((product, quantity = 1) => {
    if (!product) return;

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.id === product.id);

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
        return [
          ...prevCart,
          {
            ...product,
            quantity,
            addedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];
      }
    });

    window.dispatchEvent(new Event("cartUpdated"));
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
    window.dispatchEvent(new Event("cartUpdated"));
  }, []);

  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId
          ? { ...item, quantity, updatedAt: new Date().toISOString() }
          : item
      )
    );

    window.dispatchEvent(new Event("cartUpdated"));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    window.dispatchEvent(new Event("cartUpdated"));
  }, []);

  // ========== WISHLIST OPERATIONS ==========

  const addToWishlist = useCallback((product) => {
    if (!product) return;

    setWishlist((prev) => {
      // Avoid duplicates
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

  // ========== CART SYNC FUNCTIONS ==========

  const manualSyncCart = useCallback(async () => {
    if (!user?.id || isAutoSyncing.current) {
      return { success: false, message: "Cannot sync now" };
    }

    try {
      setIsSyncing(true);
      await saveCartToAPI(user.id, cart);
      return { success: true, message: "Cart synced successfully" };
    } catch (error) {
      console.error("Manual sync failed:", error);
      return { success: false, message: "Sync failed" };
    } finally {
      setIsSyncing(false);
    }
  }, [user, cart, saveCartToAPI]);

  const loadUserCart = useCallback((userCartItems) => {
    if (!userCartItems || !Array.isArray(userCartItems)) return;

    try {
      setCart(userCartItems);
      localStorage.setItem("swmart_cart", JSON.stringify(userCartItems));
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error) {
      console.error("Error loading user cart:", error);
    }
  }, []);

  const mergeWithUserCart = useCallback((userCartItems) => {
    if (!userCartItems || !Array.isArray(userCartItems)) {
      return cart;
    }

    try {
      const mergedMap = new Map();

      // Add user's items from API
      userCartItems.forEach((item) => {
        mergedMap.set(item.id, { ...item, source: "api" });
      });

      // Add/override with current local items
      cart.forEach((currentItem) => {
        const existingItem = mergedMap.get(currentItem.id);
        if (existingItem) {
          // Local quantity overrides API quantity
          mergedMap.set(currentItem.id, {
            ...existingItem,
            quantity: currentItem.quantity,
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
      window.dispatchEvent(new Event("cartUpdated"));

      return mergedCart;
    } catch (error) {
      console.error("Merge error:", error);
      return cart;
    }
  }, [cart]);

  // ========== MEMOIZED CALCULATIONS ==========

  // Calculate cart statistics (memoized for performance)
  const cartStats = useMemo(() => {
    const itemCount = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const uniqueProducts = new Set(cart.map((item) => item.id)).size;
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

  const getWishlistCount = useCallback(() => wishlist.length, [wishlist]);

  // ========== QUERY FUNCTIONS ==========

  const isInCart = useCallback(
    (productId) => cart.some((item) => item.id === productId),
    [cart]
  );

  const isInWishlist = useCallback(
    (productId) => wishlist.some((item) => item.id === productId),
    [wishlist]
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

  // ========== MEMOIZED PROVIDER VALUE ==========

  const value = useMemo(
    () => ({
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
      isInWishlist,
      getCartItemQuantity,
      getCartItem,

      // Cart management
      manualSyncCart,
      loadUserCart,
      mergeWithUserCart,

      // Computed values (for convenience)
      cartItemCount: cartStats.itemCount,
      cartTotalAmount: cartStats.totalValue,
      isCartEmpty: cart.length === 0,
      hasCartItems: cart.length > 0,
      wishlistCount: wishlist.length,
      isWishlistEmpty: wishlist.length === 0,
    }),
    [
      cart,
      wishlist,
      isSyncing,
      cartStats,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      addToWishlist,
      removeFromWishlist,
      moveToCart,
      moveToWishlist,
      getCartTotal,
      getCartCount,
      getWishlistCount,
      isInCart,
      isInWishlist,
      getCartItemQuantity,
      getCartItem,
      manualSyncCart,
      loadUserCart,
      mergeWithUserCart,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};