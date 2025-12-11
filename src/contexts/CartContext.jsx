// src/contexts/CartContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
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

  const { user, syncCurrentCartToUser } = useAuth();

  // Load from localStorage on initial load
  useEffect(() => {
    const loadCartData = () => {
      try {
        const savedCart = localStorage.getItem("swmart_cart");
        const savedWishlist = localStorage.getItem("swmart_wishlist");

        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          setCart(parsedCart);
          console.log(
            "Loaded cart from localStorage:",
            parsedCart.length,
            "items"
          );
        }

        if (savedWishlist) {
          setWishlist(JSON.parse(savedWishlist));
        }
      } catch (error) {
        console.error("Error loading cart data:", error);
        // Reset to empty arrays on error
        setCart([]);
        setWishlist([]);
        localStorage.setItem("swmart_cart", JSON.stringify([]));
        localStorage.setItem("swmart_wishlist", JSON.stringify([]));
      } finally {
        setIsInitialized(true);
      }
    };

    loadCartData();
  }, []);

  // Save cart to localStorage when it changes
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem("swmart_cart", JSON.stringify(cart));

        // If user is logged in, sync cart to their account
        if (user && user.id) {
          // Debounce the sync to prevent too many API calls
          const timeoutId = setTimeout(() => {
            syncCartToUserAccount();
          }, 1000);

          return () => clearTimeout(timeoutId);
        }
      } catch (error) {
        console.error("Error saving cart to localStorage:", error);
      }
    }
  }, [cart, isInitialized, user]);

  // Save wishlist to localStorage when it changes
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("swmart_wishlist", JSON.stringify(wishlist));
    }
  }, [wishlist, isInitialized]);

  // Sync cart to user account (simulated API)
  const syncCartToUserAccount = useCallback(async () => {
    if (!user || !user.id || cart.length === 0) return;

    try {
      setIsSyncing(true);
      await syncCurrentCartToUser();
      console.log("Cart synced to user account");
    } catch (error) {
      console.error("Failed to sync cart to user account:", error);
    } finally {
      setIsSyncing(false);
    }
  }, [user, cart, syncCurrentCartToUser]);

  // Cart functions
  const addToCart = async (product, quantity = 1) => {
    if (!product) return cart;

    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex(
        (item) => item.id === product.id
      );

      if (existingItemIndex > -1) {
        // Update existing item quantity
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex] = {
          ...updatedCart[existingItemIndex],
          quantity: updatedCart[existingItemIndex].quantity + quantity,
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

    // Dispatch cart update event for other components
    window.dispatchEvent(new Event("cartUpdated"));

    return cart;
  };

  const removeFromCart = async (productId) => {
    setCart((prevCart) => {
      const updatedCart = prevCart.filter((item) => item.id !== productId);
      return updatedCart;
    });

    window.dispatchEvent(new Event("cartUpdated"));
    return cart;
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity < 1) {
      return await removeFromCart(productId);
    }

    setCart((prevCart) => {
      const updatedCart = prevCart.map((item) =>
        item.id === productId
          ? {
              ...item,
              quantity: quantity,
              updatedAt: new Date().toISOString(),
            }
          : item
      );
      return updatedCart;
    });

    window.dispatchEvent(new Event("cartUpdated"));
    return cart;
  };

  const clearCart = async () => {
    setCart([]);
    window.dispatchEvent(new Event("cartUpdated"));
    return [];
  };

  // Wishlist functions
  const addToWishlist = (product) => {
    if (!product) return;

    setWishlist((prev) => {
      if (prev.find((item) => item.id === product.id)) {
        return prev; // Already in wishlist
      }
      return [...prev, { ...product, addedAt: new Date().toISOString() }];
    });
  };

  const removeFromWishlist = (productId) => {
    setWishlist((prev) => prev.filter((item) => item.id !== productId));
  };

  const moveToCart = (product) => {
    addToCart(product);
    removeFromWishlist(product.id);
  };

  const moveToWishlist = (product) => {
    addToWishlist(product);
    removeFromCart(product.id);
  };

  // Calculate totals
  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const price = parseFloat(item.price) || 0;
      const quantity = parseInt(item.quantity) || 0;
      return total + price * quantity;
    }, 0);
  };

  const getCartCount = () => {
    return cart.reduce(
      (count, item) => count + (parseInt(item.quantity) || 0),
      0
    );
  };

  const getWishlistCount = () => {
    return wishlist.length;
  };

  // Check if product is in cart
  const isInCart = (productId) => {
    return cart.some((item) => item.id === productId);
  };

  // Get quantity of specific product in cart
  const getCartItemQuantity = (productId) => {
    const item = cart.find((item) => item.id === productId);
    return item ? parseInt(item.quantity) || 0 : 0;
  };

  // Get cart items with formatted prices
  const getFormattedCart = () => {
    return cart.map((item) => ({
      ...item,
      formattedPrice: `$${parseFloat(item.price || 0).toFixed(2)}`,
      formattedTotal: `$${(
        parseFloat(item.price || 0) * parseInt(item.quantity || 0)
      ).toFixed(2)}`,
    }));
  };

  // Manual sync function (can be called from UI)
  const manualSyncCart = async () => {
    if (!user || !user.id) {
      console.warn("Cannot sync: No user logged in");
      return false;
    }

    try {
      setIsSyncing(true);
      await syncCurrentCartToUser();
      console.log("Manual cart sync completed");
      return true;
    } catch (error) {
      console.error("Manual cart sync failed:", error);
      return false;
    } finally {
      setIsSyncing(false);
    }
  };

  // Load user's saved cart when they log in (called from AuthContext)
  const loadUserCart = (userCartItems) => {
    if (!userCartItems || !Array.isArray(userCartItems)) return;

    try {
      setCart(userCartItems);
      localStorage.setItem("swmart_cart", JSON.stringify(userCartItems));
      console.log("Loaded user cart:", userCartItems.length, "items");
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error) {
      console.error("Error loading user cart:", error);
    }
  };

  // Merge current cart with user's cart (called from AuthContext)
  const mergeWithUserCart = (userCartItems) => {
    if (!userCartItems || !Array.isArray(userCartItems)) {
      // If no user cart, keep current cart
      return cart;
    }

    try {
      // Merge logic: user cart items + current cart items (current overrides)
      const mergedCart = [...userCartItems];

      cart.forEach((currentItem) => {
        const existingIndex = mergedCart.findIndex(
          (item) => item.id === currentItem.id
        );
        if (existingIndex > -1) {
          // Current cart item overrides user cart item
          mergedCart[existingIndex] = {
            ...mergedCart[existingIndex],
            quantity: currentItem.quantity, // Use current quantity
            updatedAt: new Date().toISOString(),
          };
        } else {
          // Add current item to merged cart
          mergedCart.push({
            ...currentItem,
            updatedAt: new Date().toISOString(),
          });
        }
      });

      setCart(mergedCart);
      localStorage.setItem("swmart_cart", JSON.stringify(mergedCart));
      console.log("Merged cart completed:", mergedCart.length, "items");
      window.dispatchEvent(new Event("cartUpdated"));

      return mergedCart;
    } catch (error) {
      console.error("Error merging carts:", error);
      return cart;
    }
  };

  const value = {
    // State
    cart,
    wishlist,
    isSyncing,

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

    // Additional helpers
    cartItemCount: getCartCount(),
    cartTotalAmount: getCartTotal(),
    isCartEmpty: cart.length === 0,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
