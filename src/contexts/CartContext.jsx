
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
  const [apiCartId, setApiCartId] = useState(null); // Store the API cart ID

  const { user, getUserCarts, createCart, updateCart, deleteCart } = useAuth();

  // Refs
  const syncTimeoutRef = useRef(null);
  const productCacheRef = useRef(new Map());


  useEffect(() => {
    const initializeCart = async () => {
      try {
        const savedCart = localStorage.getItem("swmart_cart");
        const savedCartId = localStorage.getItem("swmart_cart_id");

        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          setCart(parsedCart);
        }

        if (savedCartId) {
          setApiCartId(parseInt(savedCartId));
        }

      
      } catch (error) {
        console.error("Cart init error:", error);
        localStorage.removeItem("swmart_cart");
        localStorage.removeItem("swmart_cart_id");
      } finally {
        setIsInitialized(true);
      }
    };

    initializeCart();
  }, [user]); 


  useEffect(() => {
    if (!isInitialized) return;

    try {
      localStorage.setItem("swmart_cart", JSON.stringify(cart));

      // Debounced auto-sync to FakeStore API
      if (user?.id && cart.length > 0) {
        if (syncTimeoutRef.current) {
          clearTimeout(syncTimeoutRef.current);
        }

        syncTimeoutRef.current = setTimeout(() => {
          syncCartToAPI();
        }, 100);
      }
    } catch (error) {
      console.error("Cart save error:", error);
    }

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [cart, isInitialized, user]); 


  const loadUserCartFromAPI = useCallback(
    async (userId) => {
      if (!userId) return;

      try {
        setIsSyncing(true);
        console.log("📥 Loading cart from FakeStore API for user:", userId);

        const result = await getUserCarts(userId);

        if (result.success && result.data && result.data.length > 0) {
          // Get the latest cart
          const latestCart = result.data[0];
          console.log("✅ Found cart:", latestCart);

          setApiCartId(latestCart.id);
          localStorage.setItem("swmart_cart_id", latestCart.id.toString());

          
          const cartItems = await convertAPICartToLocal(latestCart);

   
          const localCart = [...cart];
          const mergedCart = mergeCartItems(cartItems, localCart);

          setCart(mergedCart);
          localStorage.setItem("swmart_cart", JSON.stringify(mergedCart));
          window.dispatchEvent(new Event("cartUpdated"));

          console.log("✅ Cart loaded and merged:", mergedCart);
        } else {
          console.log("ℹ️ No carts found for user");
        }
      } catch (error) {
        console.error("Error loading cart from API:", error);
      } finally {
        setIsSyncing(false);
      }
    },
    [cart, getUserCarts]
  );

 
  const convertAPICartToLocal = useCallback(
    async (apiCart) => {
      if (!apiCart || !apiCart.products) return [];

      const cartItems = [];
      const productCache = productCacheRef.current;

    
      for (const item of apiCart.products) {
        try {
          let product = productCache.get(item.productId);

      
          if (!product) {
            const response = await fetch(
              `https://fakestoreapi.com/products/${item.productId}`
            );
            product = await response.json();
            productCache.set(item.productId, product);
          }

          cartItems.push({
            ...product,
            quantity: item.quantity,
            addedAt: apiCart.date,
            fromAPI: true,
          });
        } catch (error) {
          console.error(
            `Error fetching product ${item.productId}:`,
            error
          );
        }
      }

      return cartItems;
    },
    []
  );

  
  const mergeCartItems = useCallback((apiItems, localItems) => {
    const mergedMap = new Map();

    s
    apiItems.forEach((item) => {
      mergedMap.set(item.id, { ...item, source: "api" });
    });

  
    localItems.forEach((item) => {
      const existing = mergedMap.get(item.id);
      if (existing) {
        mergedMap.set(item.id, {
          ...existing,
          quantity: item.quantity,
          source: "merged",
        });
      } else {
        mergedMap.set(item.id, { ...item, source: "local" });
      }
    });

    return Array.from(mergedMap.values());
  }, []);

 
  const syncCartToAPI = useCallback(async () => {
    if (!user?.id || cart.length === 0) return;

    try {
      setIsSyncing(true);
      console.log("📤 Syncing cart to FakeStore API...");

      const apiCartData = {
        userId: user.id,
        date: new Date().toISOString(),
        products: cart.map((item) => ({
          productId: item.id,
          quantity: item.quantity || 1,
        })),
      };

      let result;

      if (apiCartId) {
        // Update existing cart
        console.log(`🔄 Updating cart ${apiCartId}...`);
        result = await updateCart(apiCartId, apiCartData);
      } else {
        // Create new cart
        console.log("➕ Creating new cart...");
        result = await createCart(apiCartData);
        
        if (result.success && result.data?.id) {
          setApiCartId(result.data.id);
          localStorage.setItem("swmart_cart_id", result.data.id.toString());
        }
      }

      if (result.success) {
        console.log("✅ Cart synced successfully:", result.data);
      }
    } catch (error) {
      console.error("Error syncing cart to API:", error);
    } finally {
      setIsSyncing(false);
    }
  }, [user, cart, apiCartId, createCart, updateCart]);

  const deleteCartFromAPI = useCallback(async () => {
    if (!apiCartId) return;

    try {
      setIsSyncing(true);
      console.log(`🗑️ Deleting cart ${apiCartId}...`);

      const result = await deleteCart(apiCartId);

      if (result.success) {
        console.log("✅ Cart deleted:", result.data);
        setApiCartId(null);
        localStorage.removeItem("swmart_cart_id");
      }
    } catch (error) {
      console.error("Error deleting cart:", error);
    } finally {
      setIsSyncing(false);
    }
  }, [apiCartId, deleteCart]);

  
  const addToCart = useCallback(
    async (product, quantity = 1) => {
      if (!product) return;

      setCart((prevCart) => {
        const existingIndex = prevCart.findIndex(
          (item) => item.id === product.id
        );

        let updatedCart;

        if (existingIndex > -1) {
          // Update existing item
          updatedCart = [...prevCart];
          updatedCart[existingIndex] = {
            ...updatedCart[existingIndex],
            quantity: updatedCart[existingIndex].quantity + quantity,
            updatedAt: new Date().toISOString(),
          };
        } else {
          // Add new item
          updatedCart = [
            ...prevCart,
            {
              ...product,
              quantity,
              addedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ];
        }

        return updatedCart;
      });

      window.dispatchEvent(new Event("cartUpdated"));

      
    
    },
    [user]
  );

  
  const removeFromCart = useCallback(
    async (productId) => {
      setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
      window.dispatchEvent(new Event("cartUpdated"));

      // Trigger sync
      if (user?.id) {
        console.log("⏳ Cart will sync to API in 3 seconds...");
      }
    },
    [user]
  );

 
  const updateQuantity = useCallback(
    async (productId, quantity) => {
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

    
     
    },
    [user, removeFromCart]
  );


  const clearCart = useCallback(async () => {
    setCart([]);
    localStorage.removeItem("swmart_cart");
    window.dispatchEvent(new Event("cartUpdated"));

   
    if (user?.id && apiCartId) {
      await deleteCartFromAPI();
    }
  }, [user, apiCartId, deleteCartFromAPI]);

 
  const forceSyncToAPI = useCallback(async () => {
    await syncCartToAPI();
  }, [syncCartToAPI]);


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


  const value = useMemo(
    () => ({
      // State
      cart,
      cartStats,
      isSyncing,
      apiCartId,

      // Cart operations
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,

      // API operations
      loadUserCartFromAPI,
      syncCartToAPI: forceSyncToAPI,
      deleteCartFromAPI,

      // Calculations
      getCartTotal,
      getCartCount,

      // Queries
      isInCart,
      getCartItemQuantity,
      getCartItem,

      // Computed values
      cartItemCount: cartStats.itemCount,
      cartTotalAmount: cartStats.totalValue,
      isCartEmpty: cart.length === 0,
      hasCartItems: cart.length > 0,
    }),
    [
      cart,
      cartStats,
      isSyncing,
      apiCartId,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      loadUserCartFromAPI,
      forceSyncToAPI,
      deleteCartFromAPI,
      getCartTotal,
      getCartCount,
      isInCart,
      getCartItemQuantity,
      getCartItem,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};