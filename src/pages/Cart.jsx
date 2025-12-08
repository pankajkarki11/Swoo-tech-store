import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Heart,
  Tag,
  Clock,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  Truck,
  Shield,
  RefreshCw,
  ArrowLeft,
  Check,
  AlertCircle,
  Loader2,
} from "lucide-react";
import {
  getCartItems,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
} from "../utils/cartUtils";

const CartPage = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [suggestedProducts, setSuggestedProducts] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState("");

  // Load cart from localStorage on mount
  useEffect(() => {
    loadCartFromStorage();
  }, []);

  // Load suggested products when cart changes
  useEffect(() => {
    if (cartItems.length > 0) {
      loadSuggestedProducts();
    } else {
      setSuggestedProducts([]);
    }
  }, [cartItems]);

  const loadCartFromStorage = () => {
    setIsLoading(true);
    try {
      const cartItems = getCartItems();
      setCartItems(cartItems);
    } catch (error) {
      console.error("Error loading cart:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSuggestedProducts = async () => {
    try {
      const response = await fetch("https://fakestoreapi.com/products?limit=8");
      const products = await response.json();

      const cartIds = cartItems.map((item) => item.id);
      const suggestions = products
        .filter((product) => !cartIds.includes(product.id))
        .slice(0, 4);

      setSuggestedProducts(suggestions);
    } catch (error) {
      console.error("Error loading suggested products:", error);
    }
  };

  // Calculate totals
  const calculateTotals = () => {
    const subtotal = cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    const shipping = subtotal > 100 ? 0 : 9.99;
    const tax = subtotal * 0.08;
    const discount = couponApplied ? subtotal * 0.1 : 0;
    const total = subtotal + shipping + tax - discount;

    return {
      subtotal: subtotal.toFixed(2),
      shipping: shipping.toFixed(2),
      tax: tax.toFixed(2),
      discount: discount.toFixed(2),
      total: total.toFixed(2),
    };
  };

  // Update quantity
  const updateQuantity = async (id, newQuantity) => {
    if (newQuantity < 1) return;

    setIsUpdating(true);
    try {
      const updatedItems = updateCartItemQuantity(id, newQuantity);
      setCartItems(updatedItems);
    } finally {
      setTimeout(() => setIsUpdating(false), 300);
    }
  };

  // Remove item
  const removeItem = (id) => {
    const updatedItems = removeFromCart(id);
    setCartItems(updatedItems);
  };

  // Move to wishlist
  const moveToWishlist = (item) => {
    const wishlist = JSON.parse(
      localStorage.getItem("swmart_wishlist") || "[]"
    );
    const updatedWishlist = [...wishlist, item];
    localStorage.setItem("swmart_wishlist", JSON.stringify(updatedWishlist));
    removeItem(item.id);

    console.log("Moved to wishlist:", item.title);
  };

  // Apply coupon
  const applyCoupon = () => {
    setCouponError("");

    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }

    const validCoupons = ["SWMART10", "SAVE20", "WELCOME15"];

    if (validCoupons.includes(couponCode.toUpperCase())) {
      setCouponApplied(true);
      setCouponError("");
    } else {
      setCouponError("Invalid coupon code");
      setCouponApplied(false);
    }
  };

  // Add suggested product to cart
  const addSuggestedToCart = async (product) => {
    setIsUpdating(true);
    try {
      // Using the same addToCart utility from cartUtils
      const existingItem = cartItems.find((item) => item.id === product.id);

      let updatedItems;
      if (existingItem) {
        updatedItems = cartItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        updatedItems = [...cartItems, { ...product, quantity: 1 }];
      }

      setCartItems(updatedItems);
      // Update localStorage
      localStorage.setItem("swmart_cart", JSON.stringify(updatedItems));
      window.dispatchEvent(new Event("cartUpdated"));
    } finally {
      setTimeout(() => setIsUpdating(false), 300);
    }
  };

  // Proceed to checkout
  const proceedToCheckout = () => {
    alert("Successful!");
    clearCart();
    setCartItems([]);
    navigate("/");
  };

  // Continue shopping
  const continueShopping = () => {
    // alert("Continuing shopping...");
    navigate("/");
  };

  // Clear cart
  const clearCartHandler = () => {
    if (window.confirm("Are you sure you want to clear your cart?")) {
      clearCart();
      setCartItems([]);
    }
  };

  const totals = calculateTotals();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 font-sans flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#01A49E] mx-auto mb-4" />
          <p className="text-gray-600">Loading your cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={continueShopping}
            className="flex items-center text-[#01A49E] hover:text-[#01857F] transition mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Continue Shopping
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gradient-to-r from-[#01A49E] to-[#01857F] p-3 rounded-xl">
              <ShoppingBag className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Shopping Cart
              </h1>
              <p className="text-gray-600">
                {cartItems.length} {cartItems.length === 1 ? "item" : "items"}{" "}
                in your cart
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Cart Items */}
          <div className="lg:col-span-2">
            {cartItems.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShoppingBag className="text-gray-400" size={48} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Your cart is empty
                </h2>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Cart Items List */}
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all"
                  >
                    <div className="p-6">
                      <div className="flex flex-col sm:flex-row gap-6">
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          <div className="w-32 h-32 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden">
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-full h-full object-contain p-4"
                              loading="lazy"
                            />
                          </div>
                        </div>

                        {/* Product Details */}
                        <div className="flex-grow">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4">
                            <div className="flex-grow">
                              <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-2">
                                {item.title}
                              </h3>
                              <div className="flex items-center gap-3 mb-2">
                                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                  {item.category}
                                </span>
                                <div className="flex items-center gap-1">
                                  <span className="text-yellow-400">★</span>
                                  <span className="text-sm text-gray-600">
                                    {item.rating?.rate || 4.5}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Remove Button */}
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-gray-400 hover:text-red-500 transition p-1 self-start sm:self-center"
                              aria-label="Remove item"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            {/* Quantity Controls */}
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center bg-gray-100 rounded-lg">
                                <button
                                  onClick={() =>
                                    updateQuantity(item.id, item.quantity - 1)
                                  }
                                  className="p-2 hover:bg-gray-200 transition rounded-l-lg disabled:opacity-50"
                                  disabled={item.quantity <= 1 || isUpdating}
                                >
                                  <Minus size={18} />
                                </button>
                                <span className="px-4 py-2 font-medium min-w-[40px] text-center">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() =>
                                    updateQuantity(item.id, item.quantity + 1)
                                  }
                                  className="p-2 hover:bg-gray-200 transition rounded-r-lg disabled:opacity-50"
                                  disabled={isUpdating}
                                >
                                  <Plus size={18} />
                                </button>
                              </div>

                              {/* <div className="flex space-x-3">
                                <button
                                  onClick={() => moveToWishlist(item)}
                                  className="flex items-center text-sm text-gray-600 hover:text-[#01A49E] transition"
                                >
                                  <Heart size={16} className="mr-1" />
                                  Save for later
                                </button>
                              </div> */}
                            </div>

                            {/* Price */}
                            <div className="text-right">
                              <div className="text-2xl font-bold text-gray-900">
                                ${(item.price * item.quantity).toFixed(2)}
                              </div>
                              <div className="text-gray-500 text-sm">
                                ${item.price.toFixed(2)} each
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Suggested Products */}
                {suggestedProducts.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      You might also like
                    </h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      {suggestedProducts.map((product) => (
                        <div
                          key={product.id}
                          className="border border-gray-200 rounded-xl p-4 hover:border-[#01A49E] transition group"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-16 h-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                              <img
                                src={product.image}
                                alt={product.title}
                                className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform"
                              />
                            </div>
                            <div className="flex-grow">
                              <h4 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">
                                {product.title}
                              </h4>
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-gray-900">
                                  ${product.price.toFixed(2)}
                                </span>
                                <button
                                  onClick={() => addSuggestedToCart(product)}
                                  disabled={isUpdating}
                                  className="text-[#01A49E] hover:text-[#01857F] text-sm font-medium disabled:opacity-50"
                                >
                                  {isUpdating ? "Adding..." : "Add"}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Order Summary
              </h2>

              {/* Order Details */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${totals.subtotal}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span
                    className={
                      totals.shipping === "0.00"
                        ? "text-green-600 font-medium"
                        : "font-medium"
                    }
                  >
                    {totals.shipping === "0.00"
                      ? "FREE"
                      : `$${totals.shipping}`}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">${totals.tax}</span>
                </div>

                {/* {couponApplied && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount (10%)</span>
                    <span className="font-bold">-${totals.discount}</span>
                  </div>
                )} */}

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">
                      Total
                    </span>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        ${totals.total}
                      </div>
                      {totals.shipping === "0.00" && (
                        <div className="text-green-600 text-sm font-medium">
                          Free Shipping Applied
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={proceedToCheckout}
                disabled={cartItems.length === 0}
                className={`w-full py-3.5 rounded-xl font-semibold transition-all mb-6 ${
                  cartItems.length === 0
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-[#01A49E] to-[#01857F] text-white hover:shadow-xl hover:scale-[1.02]"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <span>Proceed to Checkout</span>
                  <ArrowRight size={20} />
                </div>
              </button>

              {/* Features */}
            </div>
          </div>
        </div>

        {/* Cart Actions */}
        {cartItems.length > 0 && (
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <button
              onClick={continueShopping}
              className="flex-grow border border-green-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-green-50 transition font-medium "
            >
              Continue Shopping
            </button>
            <button
              onClick={clearCartHandler}
              className="flex-grow border border-red-300 text-red-600 px-6 py-3 rounded-lg hover:bg-red-50 transition font-medium"
            >
              Clear Cart
            </button>
          </div>
        )}

        {/* Deals Banner */}
        <div className="mt-12 bg-gradient-to-r from-[#01A49E] to-[#00857F] rounded-2xl p-6 lg:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Tag className="text-white" />
                <h2 className="text-2xl lg:text-3xl font-bold text-white">
                  Don't Miss These Deals!
                </h2>
              </div>
              <p className="text-white/90">Limited time offers. Hurry up!</p>
            </div>
            <div className="hidden lg:flex items-center gap-4 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3">
              <Clock className="text-white" />
              <div className="text-white font-mono text-xl">10:49:09</div>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={continueShopping}
              className="bg-white text-gray-900 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition flex items-center gap-2 mx-auto"
            >
              View All Deals <ArrowRight className="ml-1" size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
