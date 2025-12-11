import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
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
  Calendar,
  History,
  Download,
  Upload,
  Package,
  Archive,
  Clock as ClockIcon,
  UserCheck,
} from "lucide-react";
import useApi from "../services/useApi";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";

const CartPage = () => {
  const navigate = useNavigate();
  const [suggestedProducts, setSuggestedProducts] = useState([]);
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [isLoadingAPICarts, setIsLoadingAPICarts] = useState(false);
  const [apiCarts, setApiCarts] = useState([]);
  const [showCartHistory, setShowCartHistory] = useState(false);

  // Use the CartContext for cart management
  const {
    cart,
    wishlist,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
    isSyncing,
    addToWishlist,
    removeFromWishlist,
    moveToCart,
    moveToWishlist,
    manualSyncCart,
  } = useCart();

  const {
    user,
    userCartsFromAPI,
    syncCartToAPI,
    loadUserCartsFromAPI,
    isSyncingCart,
    cartSyncMessage,
  } = useAuth();
  const api = useApi();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Load suggested products when cart changes
  useEffect(() => {
    if (cart.length > 0) {
      loadSuggestedProducts();
    } else {
      setSuggestedProducts([]);
    }
  }, [cart]);

  // Load user's carts from API when user changes
  useEffect(() => {
    if (user && user.id) {
      loadUserAPICarts();
    }
  }, [user]);

  const loadSuggestedProducts = async () => {
    try {
      const { data: products } = await api.productAPI.getAll();
      const cartIds = cart.map((item) => item.id);
      const suggestions = products
        .filter((product) => !cartIds.includes(product.id))
        .slice(0, 4);
      setSuggestedProducts(suggestions);
    } catch (error) {
      console.error("Error loading suggested products:", error);
    }
  };

  const loadUserAPICarts = async () => {
    if (!user) return;

    try {
      setIsLoadingAPICarts(true);
      const carts = await loadUserCartsFromAPI(user.id);
      setApiCarts(carts);
    } catch (error) {
      console.error("Error loading user API carts:", error);
    } finally {
      setIsLoadingAPICarts(false);
    }
  };

  // Calculate totals
  const calculateTotals = () => {
    const subtotal = cart.reduce(
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

  // Move to wishlist
  const moveItemToWishlist = async (item) => {
    try {
      addToWishlist(item);
      removeFromCart(item.id);
      toast.success("Moved to wishlist!");
    } catch (error) {
      console.error("Failed to move to wishlist:", error);
      toast.error("Failed to move to wishlist");
    }
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
      toast.success("Coupon applied successfully!");
    } else {
      setCouponError("Invalid coupon code");
      setCouponApplied(false);
      toast.error("Invalid coupon code");
    }
  };

  // Add suggested product to cart
  const addSuggestedToCart = async (product) => {
    try {
      await addToCart(product, 1);
      toast.success(`${product.title} added to cart!`);
    } catch (error) {
      console.error("Failed to add suggested product:", error);
      toast.error("Failed to add to cart");
    }
  };

  // Proceed to checkout
  const proceedToCheckout = () => {
    toast.success("Proceeding to checkout!");
    // In a real app, this would navigate to checkout page
    navigate("/checkout");
  };

  // Continue shopping
  const continueShopping = () => {
    navigate("/");
  };

  // Clear cart
  const clearCartHandler = () => {
    if (window.confirm("Are you sure you want to clear your cart?")) {
      clearCart();
      toast.success("Cart cleared!");
    }
  };

  // Load API cart items into current cart
  const loadAPICartIntoCurrentCart = async (apiCart) => {
    try {
      setIsLoadingAPICarts(true);

      // Fetch product details for each item in API cart
      for (const apiProduct of apiCart.products) {
        try {
          const { data: product } = await api.productAPI.getById(
            apiProduct.productId
          );
          await addToCart(product, apiProduct.quantity);
        } catch (error) {
          console.error(`Error adding product ${apiProduct.productId}:`, error);
        }
      }

      toast.success(`Loaded ${apiCart.products.length} items from saved cart!`);
    } catch (error) {
      console.error("Error loading API cart:", error);
      toast.error("Failed to load saved cart");
    } finally {
      setIsLoadingAPICarts(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const totals = calculateTotals();

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
                {getCartCount()} {getCartCount() === 1 ? "item" : "items"} in
                your cart
                {isSyncing && (
                  <span className="ml-2 text-sm text-gray-500 animate-pulse">
                    (syncing...)
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Cart Sync Status */}
          {isSyncingCart && (
            <div className="mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-3">
                <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
                <div>
                  <p className="text-sm font-medium text-blue-800">
                    {cartSyncMessage}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Cart Items */}
          <div className="lg:col-span-2 space-y-8">
            {/* Current Cart Items */}
            {cart.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShoppingBag className="text-gray-400" size={48} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Your cart is empty
                </h2>
                <p className="text-gray-600 mb-6">
                  Add some items to your cart to see them here.
                </p>
                <button
                  onClick={continueShopping}
                  className="bg-gradient-to-r from-[#01A49E] to-[#01857F] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Current Cart Items List */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">
                      Current Cart Items
                    </h2>
                    <div className="flex items-center gap-2">
                      {user && (
                        <button
                          onClick={async () => {
                            try {
                              const result = await manualSyncCart();
                              if (result) {
                                toast.success("Cart synced to your account!");
                                await loadUserAPICarts();
                              }
                            } catch (error) {
                              toast.error("Failed to sync cart");
                            }
                          }}
                          disabled={isSyncingCart}
                          className="flex items-center gap-2 text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                        >
                          <Upload size={14} />
                          Sync to Account
                        </button>
                      )}
                      <button
                        onClick={clearCartHandler}
                        className="text-sm border border-red-300 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition"
                      >
                        Clear Cart
                      </button>
                    </div>
                  </div>

                  {cart.map((item) => (
                    <div
                      key={`${item.id}-${item.addedAt}`}
                      className="flex flex-col sm:flex-row gap-4 p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 rounded-lg transition"
                    >
                      <div className="flex-shrink-0">
                        <div className="w-20 h-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-contain p-2"
                            loading="lazy"
                          />
                        </div>
                      </div>

                      <div className="flex-grow">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-2">
                          <div className="flex-grow">
                            <h3 className="font-bold text-gray-900 mb-1 line-clamp-2">
                              {item.title}
                            </h3>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                {item.category}
                              </span>
                              {item.fromAPI && (
                                <span className="text-xs px-2 py-0.5 bg-green-100 text-green-800 rounded flex items-center gap-1">
                                  <Archive size={10} />
                                  From Saved
                                </span>
                              )}
                            </div>
                            {item.addedAt && (
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Calendar size={12} />
                                Added {formatDate(item.addedAt)}
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-gray-400 hover:text-red-500 transition p-1 self-start sm:self-center"
                            aria-label="Remove item"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center bg-gray-100 rounded-lg">
                              <button
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity - 1)
                                }
                                className="p-2 hover:bg-gray-200 transition rounded-l-lg disabled:opacity-50"
                                disabled={item.quantity <= 1 || isSyncing}
                              >
                                <Minus size={16} />
                              </button>
                              <span className="px-4 py-1 font-medium min-w-[40px] text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity + 1)
                                }
                                className="p-2 hover:bg-gray-200 transition rounded-r-lg disabled:opacity-50"
                                disabled={isSyncing}
                              >
                                <Plus size={16} />
                              </button>
                            </div>

                            <button
                              onClick={() => moveItemToWishlist(item)}
                              disabled={isSyncing}
                              className="flex items-center text-sm text-gray-600 hover:text-[#01A49E] transition disabled:opacity-50"
                            >
                              <Heart size={14} className="mr-1" />
                              Save for later
                            </button>
                          </div>

                          <div className="text-right">
                            <div className="text-xl font-bold text-gray-900">
                              ${(item.price * item.quantity).toFixed(2)}
                            </div>
                            <div className="text-gray-500 text-sm">
                              ${item.price.toFixed(2)} each
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Saved Cart History (Only for logged-in users) */}
            {user && apiCarts.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-purple-100 to-purple-200 rounded-lg">
                      <History className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        Saved Cart History
                      </h2>
                      <p className="text-gray-600 text-sm">
                        Your previously saved carts from {user.username}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowCartHistory(!showCartHistory)}
                    className="text-sm text-[#01A49E] hover:text-[#01857F] transition"
                  >
                    {showCartHistory ? "Hide" : "Show"} History
                  </button>
                </div>

                {showCartHistory && (
                  <div className="space-y-4">
                    {isLoadingAPICarts ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-[#01A49E]" />
                      </div>
                    ) : (
                      apiCarts.map((apiCart) => (
                        <div
                          key={apiCart.id}
                          className="border border-gray-200 rounded-xl p-4 hover:border-purple-300 transition group"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-3">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <Package className="h-4 w-4 text-gray-500" />
                                <span className="font-medium text-gray-900">
                                  Cart #{apiCart.id}
                                </span>
                                <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
                                  {apiCart.products.length} items
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <ClockIcon size={14} />
                                <span>{formatDate(apiCart.date)}</span>
                                <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                                  User ID: {apiCart.userId}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  loadAPICartIntoCurrentCart(apiCart)
                                }
                                disabled={isLoadingAPICarts}
                                className="flex items-center gap-2 text-sm bg-gradient-to-r from-[#01A49E] to-[#01857F] text-white px-3 py-1.5 rounded-lg hover:shadow-lg transition disabled:opacity-50"
                              >
                                <Download size={14} />
                                Load to Cart
                              </button>
                            </div>
                          </div>

                          <div className="space-y-2">
                            {apiCart.products.map((apiProduct, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between text-sm py-2 px-3 bg-gray-50 rounded-lg"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-white border border-gray-200 rounded flex items-center justify-center">
                                    <span className="text-xs font-medium text-gray-700">
                                      #{apiProduct.productId}
                                    </span>
                                  </div>
                                  <div>
                                    <div className="font-medium text-gray-900">
                                      Product #{apiProduct.productId}
                                    </div>
                                    <div className="text-gray-500 text-xs">
                                      Quantity: {apiProduct.quantity}
                                    </div>
                                  </div>
                                </div>
                                <button
                                  onClick={async () => {
                                    try {
                                      const { data: product } =
                                        await api.productAPI.getById(
                                          apiProduct.productId
                                        );
                                      await addToCart(
                                        product,
                                        apiProduct.quantity
                                      );
                                      toast.success(
                                        `Added ${product.title} to cart`
                                      );
                                    } catch (error) {
                                      toast.error("Failed to add product");
                                    }
                                  }}
                                  className="text-xs text-[#01A49E] hover:text-[#01857F] transition flex items-center gap-1"
                                >
                                  <Plus size={12} />
                                  Add to Cart
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

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
                              disabled={isSyncing}
                              className="text-[#01A49E] hover:text-[#01857F] text-sm font-medium disabled:opacity-50"
                            >
                              {isSyncing ? "Adding..." : "Add"}
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

              {/* Coupon Section */}
              <div className="mb-6">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Coupon code"
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#01A49E] focus:border-transparent"
                  />
                  <button
                    onClick={applyCoupon}
                    disabled={couponApplied}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      couponApplied
                        ? "bg-green-100 text-green-800"
                        : "bg-[#01A49E] text-white hover:bg-[#01857F]"
                    }`}
                  >
                    {couponApplied ? "Applied" : "Apply"}
                  </button>
                </div>
                {couponError && (
                  <p className="text-red-600 text-sm mt-2">{couponError}</p>
                )}
                {couponApplied && (
                  <p className="text-green-600 text-sm mt-2">
                    Coupon applied! 10% discount added.
                  </p>
                )}
              </div>

              {/* Checkout Button */}
              <button
                onClick={proceedToCheckout}
                disabled={cart.length === 0}
                className={`w-full py-3.5 rounded-xl font-semibold transition-all mb-6 ${
                  cart.length === 0
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
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Truck className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Free Shipping</p>
                    <p className="text-sm text-gray-600">On orders over $100</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Shield className="text-green-600" size={20} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Secure Payment</p>
                    <p className="text-sm text-gray-600">
                      100% secure checkout
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <RefreshCw className="text-purple-600" size={20} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Easy Returns</p>
                    <p className="text-sm text-gray-600">
                      30-day return policy
                    </p>
                  </div>
                </div>

                {user && (
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
                    <div className="w-10 h-10 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center">
                      <UserCheck className="text-indigo-600" size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        Account Linked
                      </p>
                      <p className="text-sm text-gray-600">
                        Cart saved to {user.username}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Cart Actions */}
        {cart.length > 0 && (
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
