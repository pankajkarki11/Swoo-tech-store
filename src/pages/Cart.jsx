// src/pages/Cart.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Tag,
  Truck,
  Shield,
  CreditCard,
  X,
  ShoppingCart as CartIcon,
  Heart,
  RefreshCw,
  ArrowLeft,
  Check,
  AlertCircle,
} from "lucide-react";

const CartPage = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [suggestedProducts, setSuggestedProducts] = useState([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("swmart_cart");
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart);
        loadSuggestedProducts(parsedCart);
      } catch (error) {
        console.error("Error loading cart:", error);
        setCartItems([]);
      }
    }
    setIsLoading(false);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("swmart_cart", JSON.stringify(cartItems));
    }
  }, [cartItems, isLoading]);

  // Mock function to load suggested products
  const loadSuggestedProducts = (currentCart) => {
    // In a real app, fetch based on cart items
    const suggestions = [
      {
        id: 101,
        title: "iPhone 13 Case",
        price: 29.99,
        image:
          "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800",
        category: "Accessories",
      },
      {
        id: 102,
        title: "Wireless Charger",
        price: 49.99,
        image:
          "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=800",
        category: "Electronics",
      },
      {
        id: 103,
        title: "Bluetooth Headphones",
        price: 89.99,
        image:
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
        category: "Audio",
      },
    ];
    setSuggestedProducts(suggestions);
  };

  // Calculate totals
  const calculateTotals = () => {
    const subtotal = cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    const shipping = subtotal > 100 ? 0 : 9.99;
    const tax = subtotal * 0.08; // 8% tax
    const discount = couponApplied ? subtotal * 0.1 : 0; // 10% discount if coupon applied
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
  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;

    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  // Remove item
  const removeItem = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Move to wishlist
  const moveToWishlist = (item) => {
    const wishlist = JSON.parse(
      localStorage.getItem("swmart_wishlist") || "[]"
    );
    localStorage.setItem(
      "swmart_wishlist",
      JSON.stringify([...wishlist, item])
    );
    removeItem(item.id);
  };

  // Apply coupon
  const applyCoupon = () => {
    setCouponError("");

    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }

    // Mock coupon validation
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
  const addSuggestedToCart = (product) => {
    const existingItem = cartItems.find((item) => item.id === product.id);

    if (existingItem) {
      updateQuantity(product.id, existingItem.quantity + 1);
    } else {
      setCartItems((prev) => [...prev, { ...product, quantity: 1 }]);
    }
  };

  // Proceed to checkout
  const proceedToCheckout = () => {
    navigate("/checkout");
  };

  // Continue shopping
  const continueShopping = () => {
    navigate("/");
  };

  const totals = calculateTotals();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#01A49E] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
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
            <div className="bg-[#01A49E] p-2 rounded-lg">
              <CartIcon className="text-white" size={24} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Your Shopping Cart
            </h1>
          </div>
          <p className="text-gray-600">
            {cartItems.length} {cartItems.length === 1 ? "item" : "items"} in
            your cart
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Cart Items */}
          <div className="lg:col-span-2">
            {cartItems.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CartIcon className="text-gray-400" size={48} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Your cart is empty
                </h2>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Looks like you haven't added any items to your cart yet. Start
                  shopping to discover amazing products!
                </p>
                <button
                  onClick={continueShopping}
                  className="bg-gradient-to-r from-[#01A49E] to-[#01857F] text-white px-8 py-3 rounded-full font-semibold hover:shadow-xl transition flex items-center gap-2 mx-auto"
                >
                  <ShoppingBag size={20} />
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Cart Items List */}
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl shadow-lg p-6"
                  >
                    <div className="flex flex-col sm:flex-row gap-6">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <div className="w-32 h-32 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-contain p-4"
                          />
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="flex-grow">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-bold text-lg text-gray-900 mb-1">
                              {item.title}
                            </h3>
                            <p className="text-sm text-gray-500 mb-3">
                              {item.category}
                            </p>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-gray-400 hover:text-red-500 transition p-1"
                            aria-label="Remove item"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>

                        <div className="flex flex-wrap items-center justify-between">
                          {/* Quantity Controls */}
                          <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                            <div className="flex items-center bg-gray-100 rounded-lg">
                              <button
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity - 1)
                                }
                                className="p-2 hover:bg-gray-200 transition rounded-l-lg"
                                disabled={item.quantity <= 1}
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
                                className="p-2 hover:bg-gray-200 transition rounded-r-lg"
                              >
                                <Plus size={18} />
                              </button>
                            </div>

                            <div className="flex space-x-2">
                              <button
                                onClick={() => moveToWishlist(item)}
                                className="flex items-center text-sm text-gray-600 hover:text-[#01A49E] transition"
                              >
                                <Heart size={16} className="mr-1" />
                                Save
                              </button>
                            </div>
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
                          className="border border-gray-200 rounded-xl p-4 hover:border-[#01A49E] transition"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-16 h-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                              <img
                                src={product.image}
                                alt={product.title}
                                className="w-full h-full object-contain p-2"
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
                                  className="text-[#01A49E] hover:text-[#01857F] text-sm font-medium"
                                >
                                  Add
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
                      totals.shiing === "0.00"
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

                {couponApplied && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount (10%)</span>
                    <span className="font-bold">-${totals.discount}</span>
                  </div>
                )}

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

              {/* Coupon Code */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Coupon Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter coupon code"
                    className="flex-grow border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#01A49E] focus:border-[#01A49E] outline-none"
                  />
                  <button
                    onClick={applyCoupon}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition font-medium"
                  >
                    Apply
                  </button>
                </div>
                {couponError && (
                  <p className="text-red-500 text-sm mt-2 flex items-center">
                    <AlertCircle size={14} className="mr-1" />
                    {couponError}
                  </p>
                )}
                {couponApplied && (
                  <p className="text-green-600 text-sm mt-2 flex items-center">
                    <Check size={14} className="mr-1" />
                    Coupon applied! 10% discount
                  </p>
                )}
              </div>

              {/* Checkout Button */}
              <button
                onClick={proceedToCheckout}
                disabled={cartItems.length === 0}
                className={`w-full py-3.5 rounded-full font-semibold transition-all ${
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
              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Shield size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium">Secure Payment</div>
                    <div className="text-sm">256-bit SSL encryption</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-gray-600">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Truck size={18} className="text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium">Free Shipping</div>
                    <div className="text-sm">On orders over $100</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-gray-600">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <RefreshCw size={18} className="text-purple-600" />
                  </div>
                  <div>
                    <div className="font-medium">Easy Returns</div>
                    <div className="text-sm">30-day return policy</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cart Actions */}
        {cartItems.length > 0 && (
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <button
              onClick={continueShopping}
              className="flex-grow border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Continue Shopping
            </button>
            <button
              onClick={() => {
                if (
                  window.confirm("Are you sure you want to clear your cart?")
                ) {
                  setCartItems([]);
                  localStorage.removeItem("swmart_cart");
                }
              }}
              className="flex-grow border border-red-300 text-red-600 px-6 py-3 rounded-lg hover:bg-red-50 transition font-medium"
            >
              Clear Cart
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
