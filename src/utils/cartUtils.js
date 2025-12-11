// src/utils/cartUtils.js

// We'll create a version that works with the existing useApi structure
// Instead of direct fetch calls, we'll use functions that can be called with useApi

// Helper function to get current user ID
const getCurrentUserId = () => {
  const user = JSON.parse(localStorage.getItem("swmart_user") || "null");
  return user ? user.id : null;
};

// Helper function to sync cart with API (requires useApi instance)
export const createSyncCartWithAPI = (api) => {
  return async (cartItems) => {
    const userId = getCurrentUserId();
    if (!userId) {
      console.warn("No user logged in. Cart will be saved locally only.");
      return null;
    }

    try {
      // Get user's existing carts from API
      const userCartsResult = await api.cartAPI.getUserCarts(userId);
      const userCarts = userCartsResult.data;
      const cartId = userCarts.length > 0 ? userCarts[0].id : null;

      // Prepare cart data for API (FakeStoreAPI format)
      const apiCartData = {
        userId: userId,
        date: new Date().toISOString().split("T")[0], // YYYY-MM-DD format
        products: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
      };

      if (cartId) {
        // Update existing cart
        const result = await api.cartAPI.updateCart(cartId, apiCartData);
        return result.data;
      } else {
        // Create new cart
        const result = await api.cartAPI.createCart(apiCartData);
        return result.data;
      }
    } catch (error) {
      console.error("Failed to sync cart with API:", error);
      return null;
    }
  };
};

// Helper function to get merged cart (requires useApi instance)
export const createGetMergedCart = (api) => {
  return async () => {
    const localCart = JSON.parse(localStorage.getItem("swmart_cart") || "[]");
    const userId = getCurrentUserId();

    if (!userId) return localCart;

    try {
      // Get user's cart from API
      const userCartsResult = await api.cartAPI.getUserCarts(userId);
      const userCarts = userCartsResult.data;
      if (userCarts.length === 0) return localCart;

      const apiCart = userCarts[0];
      const apiCartItems = apiCart.products || [];

      // Fetch product details for API cart items
      const apiCartWithDetails = await Promise.all(
        apiCartItems.map(async (apiItem) => {
          try {
            const result = await api.productAPI.getById(apiItem.productId);
            const product = result.data;
            return {
              ...product,
              quantity: apiItem.quantity,
              addedAt: new Date().toISOString(),
            };
          } catch (error) {
            console.error(
              `Failed to fetch product ${apiItem.productId}:`,
              error
            );
            return null;
          }
        })
      ).then((results) => results.filter((item) => item !== null));

      // Merge local and API carts (local takes precedence)
      const mergedCart = [...apiCartWithDetails];
      localCart.forEach((localItem) => {
        const existingIndex = mergedCart.findIndex(
          (item) => item.id === localItem.id
        );
        if (existingIndex > -1) {
          // Update quantity from local storage
          mergedCart[existingIndex].quantity = localItem.quantity;
        } else {
          // Add local item to merged cart
          mergedCart.push(localItem);
        }
      });

      return mergedCart;
    } catch (error) {
      console.error("Failed to get cart from API:", error);
      return localCart;
    }
  };
};

// Create cart utilities that require useApi instance
export const createCartUtils = (api) => {
  const syncCartWithAPI = createSyncCartWithAPI(api);
  const getMergedCart = createGetMergedCart(api);

  return {
    // Add product to cart (syncs with both API and localStorage)
    addToCart: async (product, quantity = 1) => {
      const existingCart = JSON.parse(
        localStorage.getItem("swmart_cart") || "[]"
      );

      const existingItemIndex = existingCart.findIndex(
        (item) => item.id === product.id
      );

      let updatedCart;
      if (existingItemIndex > -1) {
        updatedCart = [...existingCart];
        updatedCart[existingItemIndex] = {
          ...updatedCart[existingItemIndex],
          quantity: updatedCart[existingItemIndex].quantity + quantity,
        };
      } else {
        updatedCart = [
          ...existingCart,
          {
            ...product,
            quantity: quantity,
            addedAt: new Date().toISOString(),
          },
        ];
      }

      // Save to localStorage
      localStorage.setItem("swmart_cart", JSON.stringify(updatedCart));

      // Sync with API (fire and forget - don't wait for response)
      syncCartWithAPI(updatedCart).catch((error) => {
        console.error("Background sync failed:", error);
      });

      // Notify components
      window.dispatchEvent(new Event("cartUpdated"));

      return updatedCart;
    },

    // Get all cart items (with API sync)
    getCartItems: async () => {
      const mergedCart = await getMergedCart();

      // Update localStorage with merged cart
      localStorage.setItem("swmart_cart", JSON.stringify(mergedCart));

      return mergedCart;
    },

    // Update entire cart (syncs with both)
    updateCart: async (cartItems) => {
      // Save to localStorage
      localStorage.setItem("swmart_cart", JSON.stringify(cartItems));

      // Sync with API
      await syncCartWithAPI(cartItems);

      // Notify components
      window.dispatchEvent(new Event("cartUpdated"));
    },

    // Get cart item count (with API sync)
    getCartCount: async () => {
      const cart = await getMergedCart();
      return cart.reduce((total, item) => total + item.quantity, 0);
    },

    // Get cart total price (with API sync)
    getCartTotal: async () => {
      const cart = await getMergedCart();
      return cart.reduce(
        (total, item) => total + (item.price || 0) * item.quantity,
        0
      );
    },

    // Remove item from cart (syncs with both)
    removeFromCart: async (productId) => {
      const cart = JSON.parse(localStorage.getItem("swmart_cart") || "[]");
      const updatedCart = cart.filter((item) => item.id !== productId);

      // Save to localStorage
      localStorage.setItem("swmart_cart", JSON.stringify(updatedCart));

      // Sync with API
      await syncCartWithAPI(updatedCart);

      // Notify components
      window.dispatchEvent(new Event("cartUpdated"));

      return updatedCart;
    },

    // Update item quantity in cart (syncs with both)
    updateCartItemQuantity: async (productId, quantity) => {
      if (quantity < 1) {
        const cartUtils = createCartUtils(api);
        return await cartUtils.removeFromCart(productId);
      }

      const cart = JSON.parse(localStorage.getItem("swmart_cart") || "[]");
      const updatedCart = cart.map((item) =>
        item.id === productId ? { ...item, quantity: quantity } : item
      );

      // Save to localStorage
      localStorage.setItem("swmart_cart", JSON.stringify(updatedCart));

      // Sync with API
      await syncCartWithAPI(updatedCart);

      // Notify components
      window.dispatchEvent(new Event("cartUpdated"));

      return updatedCart;
    },

    // Clear entire cart (syncs with both)
    clearCart: async () => {
      // Clear localStorage
      localStorage.removeItem("swmart_cart");

      // Clear API cart (create empty cart)
      const userId = getCurrentUserId();
      if (userId) {
        try {
          const emptyCartData = {
            userId: userId,
            date: new Date().toISOString().split("T")[0],
            products: [],
          };
          await syncCartWithAPI([]);
        } catch (error) {
          console.error("Failed to clear API cart:", error);
        }
      }

      // Notify components
      window.dispatchEvent(new Event("cartUpdated"));

      return [];
    },

    // Check if product is in cart (with API sync)
    isInCart: async (productId) => {
      const cart = await getMergedCart();
      return cart.some((item) => item.id === productId);
    },

    // Get quantity of specific product in cart (with API sync)
    getCartItemQuantity: async (productId) => {
      const cart = await getMergedCart();
      const item = cart.find((item) => item.id === productId);
      return item ? item.quantity : 0;
    },

    // Sync cart on app startup
    initializeCartSync: async () => {
      console.log("Initializing cart sync...");
      try {
        const mergedCart = await getMergedCart();
        localStorage.setItem("swmart_cart", JSON.stringify(mergedCart));
        console.log("Cart sync initialized successfully");
        return mergedCart;
      } catch (error) {
        console.error("Failed to initialize cart sync:", error);
        return JSON.parse(localStorage.getItem("swmart_cart") || "[]");
      }
    },

    // Export API sync function for manual sync
    forceCartSync: async () => {
      const cart = JSON.parse(localStorage.getItem("swmart_cart") || "[]");
      return await syncCartWithAPI(cart);
    },

    // Get cart from API only (for debugging)
    getAPICart: async () => {
      const userId = getCurrentUserId();
      if (!userId) return null;

      try {
        const userCartsResult = await api.cartAPI.getUserCarts(userId);
        const userCarts = userCartsResult.data;
        return userCarts.length > 0 ? userCarts[0] : null;
      } catch (error) {
        console.error("Failed to get API cart:", error);
        return null;
      }
    },
  };
};

// Simple local storage only utilities (for when API is not available)
export const localCartUtils = {
  // Add product to cart (local storage only)
  addToCart: (product, quantity = 1) => {
    const existingCart = JSON.parse(
      localStorage.getItem("swmart_cart") || "[]"
    );

    const existingItemIndex = existingCart.findIndex(
      (item) => item.id === product.id
    );

    let updatedCart;
    if (existingItemIndex > -1) {
      updatedCart = [...existingCart];
      updatedCart[existingItemIndex] = {
        ...updatedCart[existingItemIndex],
        quantity: updatedCart[existingItemIndex].quantity + quantity,
      };
    } else {
      updatedCart = [
        ...existingCart,
        {
          ...product,
          quantity: quantity,
          addedAt: new Date().toISOString(),
        },
      ];
    }

    localStorage.setItem("swmart_cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cartUpdated"));
    return updatedCart;
  },

  // Get all cart items (local storage only)
  getCartItems: () => {
    return JSON.parse(localStorage.getItem("swmart_cart") || "[]");
  },

  // Get cart item count (local storage only)
  getCartCount: () => {
    const cart = JSON.parse(localStorage.getItem("swmart_cart") || "[]");
    return cart.reduce((total, item) => total + item.quantity, 0);
  },

  // Check if product is in cart (local storage only)
  isInCart: (productId) => {
    const cart = JSON.parse(localStorage.getItem("swmart_cart") || "[]");
    return cart.some((item) => item.id === productId);
  },

  // Get quantity of specific product in cart (local storage only)
  getCartItemQuantity: (productId) => {
    const cart = JSON.parse(localStorage.getItem("swmart_cart") || "[]");
    const item = cart.find((item) => item.id === productId);
    return item ? item.quantity : 0;
  },
};
