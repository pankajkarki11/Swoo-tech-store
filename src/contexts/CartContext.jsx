// contexts/CartContext.js
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
import { toast } from "react-hot-toast";

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};

// Unified quantity management hook
export const useQuantity = () => {
  const { cart, updateQuantity, removeFromCart, getCartItemQuantity } = useContext(CartContext);
  const [editingQuantities, setEditingQuantities] = useState({});

  // Get current quantity for a product (with priority: editing > cart > default)
  const getCurrentQuantity = useCallback((productId, defaultValue = 1) => {
    // If currently editing this product, use editing value
    if (editingQuantities[productId] !== undefined) {
      return editingQuantities[productId];
    }
    
    // If product is in cart, use cart quantity
    const cartQuantity = getCartItemQuantity(productId);
    if (cartQuantity > 0) {
      return cartQuantity.toString();
    }
    
    // Otherwise use default value
    return defaultValue.toString();
  }, [editingQuantities, getCartItemQuantity]);

  // Handle quantity input change
  const handleQuantityChange = useCallback((productId, value) => {
    // Remove all non-numeric characters
    const numericValue = value.replace(/[^0-9]/g, '');
    
    // Allow empty string or positive numbers
    if (numericValue === '' || parseInt(numericValue) > 0) {
      setEditingQuantities((prev) => ({
        ...prev,
        [productId]: numericValue,
      }));
    }
  }, []);

  // Validate quantity with min/max limits
  const validateQuantity = useCallback((value, min = 1, max = 10) => {
    if (value === '') {
      toast.error("Quantity cannot be empty");
      return null;
    }

    const qty = parseInt(value);
    
    if (isNaN(qty)) {
      toast.error("Please enter a valid number");
      return null;
    }
    
    if (qty < min) {
      toast.error(`Minimum quantity is ${min}`);
      return null;
    }
    
    if (qty > max) {
      toast.error(`Maximum quantity is ${max}`);
      return max;
    }
    
    return qty;
  }, []);

  // Handle quantity input blur/confirmation
  const handleQuantityBlur = useCallback((productId, currentQuantity, onConfirm, options = {}) => {
    const { min = 1, max = 10 } = options;
    const editingValue = editingQuantities[productId];
    
    // If empty or same as current, reset without action
    if (!editingValue || editingValue === currentQuantity.toString()) {
      clearEditingQuantity(productId);
      return;
    }

    // Validate the new quantity
    const validatedQty = validateQuantity(editingValue, min, max);
    if (validatedQty === null) {
      clearEditingQuantity(productId);
      return;
    }

    // Call the confirmation handler if provided
    if (onConfirm) {
      onConfirm(productId, currentQuantity, validatedQty);
    }
    
    // Clear editing state
    clearEditingQuantity(productId);
  }, [editingQuantities, validateQuantity]);

  // Handle quantity input key events
  const handleQuantityKeyDown = useCallback(
    (e, productId, currentQuantity, onConfirm, options = {}) => {
      if (e.key === "Enter") {
        handleQuantityBlur(productId, currentQuantity, onConfirm, options);
      } else if (e.key === "Escape") {
        clearEditingQuantity(productId);
      }
    },
    [handleQuantityBlur]
  );

  // Handle quantity adjustment (+/- buttons)
  const handleQuantityAdjust = useCallback((productId, change, currentQuantity, onConfirm, options = {}) => {
    const { min = 1, max = 10 } = options;
    let newQty = currentQuantity + change;
    
    // Handle removal (quantity goes to 0 or below)
    if (newQty < min) {
      if (onConfirm) {
        onConfirm(productId, currentQuantity, 0, 'remove');
      }
      return;
    }
    
    // Cap at maximum allowed
    if (newQty > max) {
      toast.error(`Maximum quantity is ${max}`);
      newQty = max;
    }
    
    // Call confirmation handler
    if (onConfirm) {
      onConfirm(productId, currentQuantity, newQty);
    }
  }, []);

  // Clear editing state for a product
  const clearEditingQuantity = useCallback((productId) => {
    setEditingQuantities((prev) => {
      const updated = { ...prev };
      delete updated[productId];
      return updated;
    });
  }, []);

  // Direct quantity update (immediate, without confirmation modal)
  const updateQuantityDirectly = useCallback(async (productId, change, currentQuantity) => {
    const newQty = currentQuantity + change;
    
    if (newQty <= 0) {
      try {
        await removeFromCart(productId);
        toast.success("Item removed from cart");
      } catch (error) {
        toast.error("Failed to remove item");
      }
    } else {
      try {
        await updateQuantity(productId, newQty);
        toast.success(`Cart quantity updated to ${newQty}`);
      } catch (error) {
        toast.error("Failed to update quantity");
      }
    }
  }, [updateQuantity, removeFromCart]);

  // Clear all editing states
  const clearAllEditingQuantities = useCallback(() => {
    setEditingQuantities({});
  }, []);

  return {
    // State
    editingQuantities,
    
    // Core quantity functions
    getCurrentQuantity,
    handleQuantityChange,
    handleQuantityBlur,
    handleQuantityKeyDown,
    handleQuantityAdjust,
    
    // Utility functions
    validateQuantity,
    clearEditingQuantity,
    clearAllEditingQuantities,
    updateQuantityDirectly,
    
    // For setting editing state externally (if needed)
    setEditingQuantities,
  };
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const { user, getApi } = useAuth();
  const api = getApi();
  
  // Track if we've loaded cart for this user session
  const hasLoadedForUser = useRef(null);

  // ============================================================================
  // INITIALIZATION - Load from localStorage immediately
  // ============================================================================

  useEffect(() => {
    const savedCart = localStorage.getItem("swmart_cart");
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCart(parsedCart);
        console.log("✅ Loaded cart from localStorage:", parsedCart.length, "items");
      } catch (error) {
        console.error("Error loading cart:", error);
        localStorage.removeItem("swmart_cart");
      }
    }
    setIsInitialized(true);
  }, []);

  // ============================================================================
  // AUTO-REFRESH when user logs in or page reloads
  // ============================================================================

  useEffect(() => {
    if (isInitialized && user?.id && hasLoadedForUser.current !== user.id) {
      console.log("🔄 User detected, refreshing cart from API...");
      refreshCartFromAPI();
      hasLoadedForUser.current = user.id;
    }

    if (!user?.id) {
      hasLoadedForUser.current = null;
    }
  }, [isInitialized, user?.id]);

  // ============================================================================
  // API CART FUNCTIONS
  // ============================================================================

  const getUserCarts = useCallback(async (userId) => {
    try {
      const { data } = await api.cartAPI.getUserCarts(userId);
      return { success: true, data: Array.isArray(data) ? data : [] };
    } catch (error) {
      console.error("Error getting user carts:", error);
      return { success: false, error: error.message, data: [] };
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
  // CART SYNC FUNCTIONS
  // ============================================================================

  const syncCartToAPI = useCallback(async () => {
    if (!user?.id) {
      return { success: false, error: "User not logged in" };
    }

    if (cart.length === 0) {
      return { success: false, error: "Cart is empty" };
    }

    try {
      setIsSyncing(true);

      const apiCartData = {
        userId: user.id,
        date: new Date().toISOString(),
        products: cart.map((item) => ({
          productId: item.id,
          quantity: item.quantity || 1,
        })),
      };

      const result = await updateCartAPI(user.id, apiCartData);
      
      if (result.success) {
        console.log("✅ Cart synced to API successfully");
        toast.success("Cart synced successfully!");
      } else {
        toast.error("Failed to sync cart");
      }

      return result;
    } catch (error) {
      console.error("Sync error:", error);
      toast.error("Sync failed");
      return { success: false, error: error.message };
    } finally {
      setIsSyncing(false);
    }
  }, [user, cart, updateCartAPI]);

  const refreshCartFromAPI = useCallback(async () => {
    if (!user?.id) {
      console.warn("⚠️ Cannot refresh cart: User not logged in");
      return { success: false, error: "User not logged in" };
    }

    try {
      setIsSyncing(true);
      console.log("📥 Refreshing cart from API for user:", user.id);
      
      const result = await getUserCarts(user.id);
      
      if (result.success && result.data.length > 0) {
        const latestCart = result.data[0];
        console.log("✅ Found cart in API with", latestCart.products.length, "products");
        
        const productPromises = latestCart.products.map(async (item) => {
          try {
            const { data: product } = await api.productAPI.getById(item.productId);
            return {
              ...product,
              quantity: item.quantity,
              addedAt: latestCart.date,
              fromAPI: true,
            };
          } catch (error) {
            console.error(`Error fetching product ${item.productId}:`, error);
            return null;
          }
        });

        const products = await Promise.all(productPromises);
        const validProducts = products.filter(p => p !== null);

        if (validProducts.length > 0) {
          setCart(validProducts);
          localStorage.setItem("swmart_cart", JSON.stringify(validProducts));
          console.log("✅ Cart refreshed:", validProducts.length, "items loaded");
          toast.success(`Cart refreshed! ${validProducts.length} items loaded`);
          return { success: true, data: validProducts };
        } else {
          console.warn("⚠️ No valid products found in saved cart");
          toast.error("No valid products found in saved cart");
          return { success: false, error: "No valid products found" };
        }
      } else {
        console.log("ℹ️ No saved cart found in API");
        toast.info("No saved cart found");
        return { success: false, error: "No cart found" };
      }
    } catch (error) {
      console.error("❌ Refresh error:", error);
      toast.error("Failed to refresh cart");
      return { success: false, error: error.message };
    } finally {
      setIsSyncing(false);
    }
  }, [user, getUserCarts, api.productAPI]);

  // ============================================================================
  // CART OPERATIONS
  // ============================================================================

  const updateCartAndSync = useCallback(async (updatedCart) => {
    setCart(updatedCart);
    localStorage.setItem("swmart_cart", JSON.stringify(updatedCart));

    if (user?.id && updatedCart.length > 0) {
      const apiCartData = {
        userId: user.id,
        date: new Date().toISOString(),
        products: updatedCart.map((item) => ({
          productId: item.id,
          quantity: item.quantity || 1,
        })),
      };

      try {
        await updateCartAPI(user.id, apiCartData);
        console.log("✅ Background sync completed");
      } catch (error) {
        console.error("⚠️ Background sync failed:", error);
      }
    }

    return { success: true };
  }, [user, updateCartAPI]);

  const addToCart = useCallback(async (product, quantity = 1) => {
    const updatedCart = [...cart];
    const existingIndex = updatedCart.findIndex(item => item.id === product.id);

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
      });
    }

    return await updateCartAndSync(updatedCart);
  }, [cart, updateCartAndSync]);

  const addMultipleToCart = useCallback(async (products) => {
    const updatedCart = [...cart];

    products.forEach(({ product, quantity }) => {
      const existingIndex = updatedCart.findIndex(item => item.id === product.id);

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
        });
      }
    });

    return await updateCartAndSync(updatedCart);
  }, [cart, updateCartAndSync]);

  const removeFromCart = useCallback(async (productId) => {
    const updatedCart = cart.filter(item => item.id !== productId);
    return await updateCartAndSync(updatedCart);
  }, [cart, updateCartAndSync]);

  const updateQuantity = useCallback(async (productId, quantity) => {
    if (quantity < 1) {
      return await removeFromCart(productId);
    }

    const updatedCart = cart.map(item =>
      item.id === productId
        ? { ...item, quantity, updatedAt: new Date().toISOString() }
        : item
    );

    return await updateCartAndSync(updatedCart);
  }, [cart, removeFromCart, updateCartAndSync]);

  const clearCart = useCallback(async () => {
    if (user?.id) {
      try {
        await deleteCartAPI(user.id);
        console.log("✅ Cart deleted from API");
      } catch (error) {
        console.error("Error deleting cart from API:", error);
      }
    }

    setCart([]);
    localStorage.removeItem("swmart_cart");
    toast.success("Cart cleared!");
    return { success: true };
  }, [user, deleteCartAPI]);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const cartStats = useMemo(() => {
    const itemCount = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const totalValue = cart.reduce((sum, item) => {
      const price = parseFloat(item.price) || 0;
      const quantity = parseInt(item.quantity) || 0;
      return sum + price * quantity;
    }, 0);

    return {
      itemCount,
      totalValue,
    };
  }, [cart]);

  const getCartCount = useCallback(() => cartStats.itemCount, [cartStats]);

  const getCartItemQuantity = useCallback(
    (productId) => {
      const item = cart.find((item) => item.id === productId);
      return item ? parseInt(item.quantity) || 0 : 0;
    },
    [cart]
  );

  const isInCart = useCallback((productId) => 
    cart.some(item => item.id === productId),
    [cart]
  );

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const value = useMemo(() => ({
    // State
    cart,
    cartStats,
    isSyncing,

    // Core cart operations
    addToCart,
    addMultipleToCart,
    removeFromCart,
    updateQuantity,
    clearCart,

    // API operations
    getUserCarts,
    syncCartToAPI,
    refreshCartFromAPI,
    getCartCount,
    getCartItemQuantity,

    // Helpers
    cartItemCount: cartStats.itemCount,
    isInCart,
  }), [
    cart,
    cartStats,
    isSyncing,
    addToCart,
    addMultipleToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getUserCarts,
    syncCartToAPI,
    refreshCartFromAPI,
    isInCart,
    getCartCount,
    getCartItemQuantity,
  ]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};