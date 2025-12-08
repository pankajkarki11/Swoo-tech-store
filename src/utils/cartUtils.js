// Add product to cart
export const addToCart = (product, quantity = 1) => {
  const existingCart = JSON.parse(localStorage.getItem("swmart_cart") || "[]");

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
};

// Get all cart items
export const getCartItems = () => {
  return JSON.parse(localStorage.getItem("swmart_cart") || "[]");
};

// Update entire cart
export const updateCart = (cartItems) => {
  localStorage.setItem("swmart_cart", JSON.stringify(cartItems));
  window.dispatchEvent(new Event("cartUpdated"));
};

// Get cart item count
export const getCartCount = () => {
  const cart = JSON.parse(localStorage.getItem("swmart_cart") || "[]");
  return cart.reduce((total, item) => total + item.quantity, 0);
};

// Get cart total price
export const getCartTotal = () => {
  const cart = JSON.parse(localStorage.getItem("swmart_cart") || "[]");
  return cart.reduce((total, item) => total + item.price * item.quantity, 0);
};

// Remove item from cart
export const removeFromCart = (productId) => {
  const cart = JSON.parse(localStorage.getItem("swmart_cart") || "[]");
  const updatedCart = cart.filter((item) => item.id !== productId);
  localStorage.setItem("swmart_cart", JSON.stringify(updatedCart));
  window.dispatchEvent(new Event("cartUpdated"));
  return updatedCart;
};

// Update item quantity in cart
export const updateCartItemQuantity = (productId, quantity) => {
  if (quantity < 1) {
    return removeFromCart(productId);
  }

  const cart = JSON.parse(localStorage.getItem("swmart_cart") || "[]");
  const updatedCart = cart.map((item) =>
    item.id === productId ? { ...item, quantity: quantity } : item
  );

  localStorage.setItem("swmart_cart", JSON.stringify(updatedCart));
  window.dispatchEvent(new Event("cartUpdated"));
  return updatedCart;
};

// Clear entire cart
export const clearCart = () => {
  localStorage.removeItem("swmart_cart");
  window.dispatchEvent(new Event("cartUpdated"));
  return [];
};

// Check if product is in cart
export const isInCart = (productId) => {
  const cart = JSON.parse(localStorage.getItem("swmart_cart") || "[]");
  return cart.some((item) => item.id === productId);
};

// Get quantity of specific product in cart
export const getCartItemQuantity = (productId) => {
  const cart = JSON.parse(localStorage.getItem("swmart_cart") || "[]");
  const item = cart.find((item) => item.id === productId);
  return item ? item.quantity : 0;
};
