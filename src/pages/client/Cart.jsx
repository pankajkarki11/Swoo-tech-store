// src/pages/CartPage.jsx
import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowRight,
  Heart,
  Clock,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  RefreshCw,
  ArrowLeft,
  Loader2,
  Calendar,
  History,
  Download,
  Upload,
  Package,
  Archive,
  ShoppingCart as CartIcon,
} from "lucide-react";
import useApi from "../../services/AdminuseApi";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";

const CartPage = () => {
  const navigate = useNavigate();
  const [suggestedProducts, setSuggestedProducts] = useState([]);
  const [couponApplied, setCouponApplied] = useState(false);
  const [isLoadingAPICarts, setIsLoadingAPICarts] = useState(false);
  const [apiCarts, setApiCarts] = useState([]);
  const [showCartHistory, setShowCartHistory] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartCount,
    isSyncing,
    manualSyncCart,
    cartStats,
  } = useCart();

  const { user, loadUserCartsFromAPI, refreshAllData, isSyncingCart } =
    useAuth();

  const api = useApi();

  // Refs to prevent multiple API calls
  const hasLoadedInitialData = useRef(false);

  // Scroll to top only once
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Load initial data once
  useEffect(() => {
    if (hasLoadedInitialData.current) return;

    const loadInitialData = async () => {
      try {
        // Load suggested products if cart has items
        if (cart.length > 0) {
          await loadSuggestedProducts();
        }

        // If user is logged in, load their carts
        if (user?.id) {
          await loadUserAPICarts();
        }
      } catch (error) {
        console.error("Error loading cart data:", error);
      } finally {
        hasLoadedInitialData.current = true;
      }
    };

    loadInitialData();

    return () => {
      hasLoadedInitialData.current = false;
    };
  }, []); // Empty dependency array - runs only once on mount

  // Update user carts when user changes
  useEffect(() => {
    if (user?.id && !isLoadingAPICarts) {
      loadUserAPICarts();
    }
  }, [user?.id]);

  const loadSuggestedProducts = useCallback(async () => {
    try {
      const { data: products } = await api.productAPI.getAll();
      const cartIds = cart.map((item) => item.id);
      const suggestions = products
        .filter((product) => !cartIds.includes(product.id))
        .slice(0, 4);
      setSuggestedProducts(suggestions);
    } catch (error) {
      console.error("Error loading suggestions:", error);
    }
  }, [cart, api.productAPI]);

  const loadUserAPICarts = useCallback(async () => {
    if (!user?.id || isLoadingAPICarts) return;

    try {
      setIsLoadingAPICarts(true);
      const carts = await loadUserCartsFromAPI(user.id);
      setApiCarts(carts);
    } catch (error) {
      console.error("Error loading API carts:", error);
    } finally {
      setIsLoadingAPICarts(false);
    }
  }, [user?.id, loadUserCartsFromAPI, isLoadingAPICarts]);

  // Memoized calculations
  const totals = useMemo(() => {
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
  }, [cart, couponApplied]);

  const proceedToCheckout = useCallback(() => {
    toast.success("Proceeding to checkout!");
    navigate("/checkout");
  }, [navigate]);

  const continueShopping = useCallback(() => navigate("/"), [navigate]);

  const clearCartHandler = useCallback(() => {
    if (window.confirm("Are you sure you want to clear your cart?")) {
      clearCart();
      toast.success("Cart cleared!");
    }
  }, [clearCart]);

  const loadAPICartIntoCurrentCart = useCallback(
    async (apiCart) => {
      if (isLoadingAPICarts) return;

      try {
        setIsLoadingAPICarts(true);

        // Batch product fetches
        const productPromises = apiCart.products.map(async (apiProduct) => {
          try {
            const { data: product } = await api.productAPI.getById(
              apiProduct.productId
            );
            return { product, quantity: apiProduct.quantity };
          } catch (error) {
            console.error(
              `Error fetching product ${apiProduct.productId}:`,
              error
            );
            return null;
          }
        });

        const products = await Promise.all(productPromises);
        const validProducts = products.filter((p) => p !== null);

        // Add all products to cart
        for (const { product, quantity } of validProducts) {
          await addToCart(product, quantity);
        }

        toast.success(`Loaded ${validProducts.length} items from saved cart!`);
      } catch (error) {
        console.error("Error loading API cart:", error);
        toast.error("Failed to load saved cart");
      } finally {
        setIsLoadingAPICarts(false);
      }
    },
    [api.productAPI, addToCart, isLoadingAPICarts]
  );

  const formatDate = useCallback((dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Invalid date";
    }
  }, []);

  const refreshCartData = useCallback(async () => {
    if (isRefreshing) return;

    try {
      setIsRefreshing(true);
      await refreshAllData();
      toast.success("Cart data refreshed!");
    } catch (error) {
      console.error("Refresh failed:", error);
      toast.error("Refresh failed");
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshAllData, isRefreshing]);

  return (
    <div className="min-h-screen bg-white font-sans py-8 dark:bg-gray-800">
      <div className="container mx-auto px-4 dark:bg-gray-800">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={continueShopping}
                className="flex items-center text-[#01A49E] hover:text-[#01857F] transition"
              >
                <ArrowLeft size={20} className="mr-2" />
                Continue Shopping
              </button>
            </div>

            <div className="flex items-center gap-3 ">
              <button
                onClick={refreshCartData}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition disabled:opacity-50"
              >
                <RefreshCw
                  size={16}
                  className={isRefreshing ? "animate-spin" : ""}
                />
                {isRefreshing ? "Refreshing..." : "Refresh Data"}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gradient-to-r from-[#01A49E] to-[#01857F] p-3 rounded-xl">
              <ShoppingBag className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Shopping Cart
              </h1>
              <p className="text-gray-600 dark:text-white">
                {getCartCount()} {getCartCount() === 1 ? "item" : "items"} in
                your cart
                {isSyncing && (
                  <span className="ml-2 text-gray-500 animate-pulse">
                    (syncing...)
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* System Stats Banner */}
          <div className="mt-6 bg-white rounded-2xl shadow-lg p-6 dark:bg-gray-800 dark:shadow-white dark:shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <CartIcon className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {getCartCount()}
                    </div>
                    <div className="text-gray-600 text-sm">Your Items</div>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Heart className="text-green-600" size={20} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      ${cartStats.totalValue?.toFixed(2) || "0.00"}
                    </div>
                    <div className="text-gray-600 text-sm">Your Cart Value</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Current Cart */}
            {cart.length === 0 ? (
              <div className="bg-gray rounded-2xl shadow-lg p-8 text-center dark:bg-dark-800 dark:shadow-white dark:shadow-sm">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 dark:bg-dark-800">
                  <ShoppingBag className="text-red-400" size={48} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3 dark:text-white">
                  Your cart is empty
                </h2>
                <p className="text-gray-600 mb-6 dark:text-white">
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
                <div className="bg-white rounded-2xl shadow-lg p-6 dark:bg-gray-800 dark:shadow-white dark:shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Current Cart Items
                    </h2>
                    <div className="flex items-center gap-2">
                      {user && (
                        <button
                          onClick={async () => {
                            try {
                              const result = await manualSyncCart();
                              if (result) {
                                toast.success("Cart synced!");
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
                        className="text-sm border border-red-300 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition dark:bg-red-500 dark:text-white dark:hover:bg-red-700"
                      >
                        Clear Cart
                      </button>
                    </div>
                  </div>

                  {cart.map((item) => (
                    <div
                      key={`${item.id}-${item.addedAt}`}
                      className="flex flex-col sm:flex-row gap-4 p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 rounded-lg transition dark:hover:bg-gray-700"
                    >
                      <div className="flex-shrink-0">
                        <div className="w-20 h-20 bg-white rounded-lg overflow-hidden dark:bg-gray-600 ">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-contain p-2 "
                            loading="lazy"
                          />
                        </div>
                      </div>

                      <div className="flex-grow">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-2">
                          <div className="flex-grow">
                            <h3 className="font-bold text-gray-900 mb-1 line-clamp-2 dark:text-white">
                              {item.title}
                            </h3>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
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
                              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-white">
                                <Calendar size={12} />
                                Added {formatDate(item.addedAt)}
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-gray-400 hover:text-red-500 transition p-1 dark:text-red-400 dark:hover:text-red-500"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center bg-gray-100 rounded-lg dark:bg-gray-300">
                              <button
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity - 1)
                                }
                                className="p-2 hover:bg-gray-200 transition rounded-l-lg disabled:opacity-50"
                                disabled={item.quantity <= 1}
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
                                className="p-2 hover:bg-gray-200 transition rounded-r-lg"
                              >
                                <Plus size={16} />
                              </button>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                              ${(item.price * item.quantity).toFixed(2)}
                            </div>
                            <div className="text-gray-500 text-sm dark:text-white dark:text-sm">
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

            {/* Cart History */}
            {user && apiCarts.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6 dark:bg-gray-800 dark:shadow-white dark:shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-purple-100 to-purple-200 rounded-lg">
                      <History className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Your Cart History
                      </h2>
                      <p className="text-gray-600 text-sm dark:text-white">
                        {apiCarts.length} saved carts from your account
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowCartHistory(!showCartHistory)}
                    className="text-sm text-[#01A49E] hover:text-[#01857F] transition dark:text-white dark:hover:text-gray-300"
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
                      apiCarts.slice(0, 5).map((apiCart) => (
                        <div
                          key={apiCart.id}
                          className="border border-gray-200 rounded-xl p-4 hover:border-purple-300 transition"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-3">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <Package className="h-4 w-4 text-gray-500 dark:text-white" />
                                <span className="font-medium text-gray-900 dark:text-white">
                                  Cart #{apiCart.id}
                                </span>
                                <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
                                  {apiCart.products?.length || 0} items
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-white">
                                <Clock size={14} />
                                <span>{formatDate(apiCart.date)}</span>
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
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8 dark:bg-gray-800 dark:shadow-white dark:shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6 dark:text-white">
                Order Summary
              </h2>

              {/* Order Details */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-white ">Subtotal</span>
                  <span className="font-medium dark:text-white">${totals.subtotal}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-white">Shipping</span>
                  <span
                    className={
                      totals.shipping === "0.00"
                        ? "text-green-600 font-medium dark:text-green-400"
                        : "font-medium"
                    }
                  >
                    {totals.shipping === "0.00"
                      ? "FREE"
                      : `$${totals.shipping}`}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-white">Tax</span>
                  <span className="font-medium dark:text-white">${totals.tax}</span>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      Total
                    </span>
                    <div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        ${totals.total}
                      </div>
                      {totals.shipping === "0.00" && (
                        <div className="text-green-600 text-sm font-medium dark:text-green-400">
                          Free Shipping
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
