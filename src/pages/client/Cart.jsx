// src/pages/CartPage.jsx - FIXED CART HISTORY LOADING
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Button from "../../components/ui/Button";
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
  const [isLoadingAPICarts, setIsLoadingAPICarts] = useState(false);
  const [apiCarts, setApiCarts] = useState([]);
  const [showCartHistory, setShowCartHistory] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasLoadedCarts, setHasLoadedCarts] = useState(false); // NEW: Track if carts loaded

  const {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartItemCount,
    isSyncing,
    manualSyncCart,
    cartStats,
  } = useCart();

  const { user, loadUserCartsFromAPI, refreshAllData, isSyncingCart } = useAuth();
  const api = useApi();

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // FIXED: Load user carts when user is available
  useEffect(() => {
    // Only load if:
    // 1. User is logged in
    // 2. Not currently loading
    // 3. Haven't loaded yet OR user changed
    if (user?.id && !isLoadingAPICarts) {
      loadUserAPICarts();
    }
  }, [user?.id]); // Dependency on user.id only

  // FIXED: Load user carts with proper error handling and state management
  const loadUserAPICarts = useCallback(async () => {
    // Prevent duplicate calls
    if (!user?.id || isLoadingAPICarts) {
      console.log("⏸️ Skipping cart load:", { 
        hasUser: !!user?.id, 
        isLoading: isLoadingAPICarts 
      });
      return;
    }

    console.log("🔄 Loading user carts for user:", user.id);
    
    try {
      setIsLoadingAPICarts(true);
      
      // Call the API
      const carts = await loadUserCartsFromAPI(user.id, false); // false = use cache
      
      console.log("✅ Loaded carts:", carts?.length || 0);
      
      // Set the carts (with fallback to empty array)
      setApiCarts(Array.isArray(carts) ? carts : []);
      setHasLoadedCarts(true);
      
    } catch (error) {
      console.error("❌ Error loading API carts:", error);
      toast.error("Failed to load cart history");
      
      // Set empty array on error
      setApiCarts([]);
      setHasLoadedCarts(true);
      
    } finally {
      setIsLoadingAPICarts(false);
    }
  }, [user?.id, loadUserCartsFromAPI]); // Remove isLoadingAPICarts from deps

  // OPTIMIZED: Calculate totals with memoization
  const totals = useMemo(() => {
    const subtotal = cartStats.totalValue;
    const shipping = subtotal > 100 ? 0 : 9.99;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;

    return {
      subtotal: subtotal.toFixed(2),
      shipping: shipping.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2),
    };
  }, [cartStats.totalValue]);

  // Navigation handlers
  const proceedToCheckout = useCallback(() => {
    if (cart.length === 0) return;
    toast.success("Proceeding to checkout!");
    navigate("/checkout");
  }, [navigate, cart.length]);

  const continueShopping = useCallback(() => navigate("/"), [navigate]);

  // Clear cart handler
  const clearCartHandler = useCallback(() => {
    if (window.confirm("Are you sure you want to clear your cart?")) {
      clearCart();
      toast.success("Cart cleared!");
    }
  }, [clearCart]);

  // FIXED: Load API cart with better error handling
  const loadAPICartIntoCurrentCart = useCallback(
    async (apiCart) => {
      if (isLoadingAPICarts) {
        toast.error("Please wait, loading in progress...");
        return;
      }

      if (!apiCart?.products || apiCart.products.length === 0) {
        toast.error("This cart is empty");
        return;
      }

      try {
        setIsLoadingAPICarts(true);
        toast.loading("Loading cart items...", { id: "load-cart" });

        // Fetch all products in parallel
        const productPromises = apiCart.products.map(async (apiProduct) => {
          try {
            const { data: product } = await api.productAPI.getById(
              apiProduct.productId
            );
            return { product, quantity: apiProduct.quantity };
          } catch (error) {
            console.error(`Error fetching product ${apiProduct.productId}:`, error);
            return null;
          }
        });

        const products = await Promise.all(productPromises);
        const validProducts = products.filter((p) => p !== null);

        if (validProducts.length === 0) {
          toast.error("Failed to load any products from this cart", { id: "load-cart" });
          return;
        }

        // Add all products to cart
        validProducts.forEach(({ product, quantity }) => {
          addToCart(product, quantity);
        });

        toast.success(
          `Loaded ${validProducts.length} items from saved cart!`,
          { id: "load-cart" }
        );
      } catch (error) {
        console.error("Error loading API cart:", error);
        toast.error("Failed to load saved cart", { id: "load-cart" });
      } finally {
        setIsLoadingAPICarts(false);
      }
    },
    [api.productAPI, addToCart]
  );

  // Format date helper
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

  // FIXED: Refresh data handler with forced reload
  const refreshCartData = useCallback(async () => {
    if (isRefreshing) return;

    try {
      setIsRefreshing(true);
      toast.loading("Refreshing...", { id: "refresh" });

      // Force reload with fresh data
      const tasks = [refreshAllData()];
      
      if (user?.id) {
        // Force fresh load from API
        const freshCarts = await loadUserCartsFromAPI(user.id, true); // true = force refresh
        setApiCarts(Array.isArray(freshCarts) ? freshCarts : []);
      }

      await Promise.all(tasks);

      toast.success("Cart data refreshed!", { id: "refresh" });
    } catch (error) {
      console.error("Refresh failed:", error);
      toast.error("Refresh failed", { id: "refresh" });
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshAllData, user?.id, loadUserCartsFromAPI, isRefreshing]);

  // Sync cart handler
  const handleSyncCart = useCallback(async () => {
    try {
      toast.loading("Syncing cart...", { id: "sync" });
      const result = await manualSyncCart();
      
      if (result.success) {
        toast.success("Cart synced!", { id: "sync" });
        
        // Reload cart history after successful sync
        if (user?.id) {
          const freshCarts = await loadUserCartsFromAPI(user.id, true);
          setApiCarts(Array.isArray(freshCarts) ? freshCarts : []);
        }
      } else {
        toast.error(result.message || "Failed to sync cart", { id: "sync" });
      }
    } catch (error) {
      toast.error("Failed to sync cart", { id: "sync" });
    }
  }, [manualSyncCart, user?.id, loadUserCartsFromAPI]);

  // FIXED: Toggle cart history with loading
  const toggleCartHistory = useCallback(() => {
    if (!showCartHistory && !hasLoadedCarts && user?.id) {
      // If showing history for first time and haven't loaded, load now
      loadUserAPICarts();
    }
    setShowCartHistory(!showCartHistory);
  }, [showCartHistory, hasLoadedCarts, user?.id, loadUserAPICarts]);

  return (
    <div className="min-h-screen bg-white font-sans py-8 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <Button variant="secondary" onClick={continueShopping}>
              <ArrowLeft size={20} className="mr-2" />
              Continue Shopping
            </Button>

            <Button
              onClick={refreshCartData}
              disabled={isRefreshing}
              loading={isRefreshing}
              icon={!isRefreshing && <RefreshCw size={16} />}
            >
              {isRefreshing ? "Refreshing..." : "Refresh Data"}
            </Button>
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
                {cartItemCount} {cartItemCount === 1 ? "item" : "items"} in your cart
                {isSyncing && (
                  <span className="ml-2 text-gray-500 animate-pulse">
                    (syncing...)
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Stats Banner */}
          <div className="mt-6 bg-white rounded-2xl shadow-lg p-6 dark:bg-gray-800 dark:shadow-white dark:shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <CartIcon className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {cartItemCount}
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
          {/* Left Column - Cart Items */}
          <div className="lg:col-span-2 space-y-8">
            {/* Empty Cart State */}
            {cart.length === 0 ? (
              <div className="bg-gray rounded-2xl shadow-lg p-8 text-center dark:bg-gray-800 dark:shadow-white dark:shadow-sm">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 dark:bg-gray-800">
                  <ShoppingBag className="text-red-400" size={48} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3 dark:text-white">
                  Your cart is empty
                </h2>
                <p className="text-gray-600 mb-6 dark:text-white">
                  Add some items to your cart to see them here.
                </p>
                <Button variant="teal" onClick={continueShopping}>
                  Start Shopping
                </Button>
              </div>
            ) : (
              /* Cart Items */
              <div className="bg-white rounded-2xl shadow-lg p-6 dark:bg-gray-800 dark:shadow-white dark:shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Current Cart Items
                  </h2>
                  <div className="flex items-center gap-2">
                    {user && (
                      <Button
                        onClick={handleSyncCart}
                        disabled={isSyncingCart}
                        size="small"
                      >
                        <Upload size={14} className="mr-2" />
                        Sync to Account
                      </Button>
                    )}
                    <Button
                      variant="danger"
                      onClick={clearCartHandler}
                      size="small"
                    >
                      Clear Cart
                    </Button>
                  </div>
                </div>

                {/* Cart Items List */}
                {cart.map((item) => (
                  <div
                    key={`${item.id}-${item.addedAt}`}
                    className="flex flex-col sm:flex-row gap-4 p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 rounded-lg transition dark:hover:bg-gray-700"
                  >
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <div className="w-20 h-20 bg-white rounded-lg overflow-hidden dark:bg-gray-600">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-contain p-2"
                          loading="lazy"
                        />
                      </div>
                    </div>

                    {/* Product Details */}
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

                        {/* Delete Button */}
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-400 hover:text-red-500 transition p-1 dark:text-red-400 dark:hover:text-red-500"
                          aria-label="Remove item"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      {/* Quantity Controls & Price */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center bg-gray-100 rounded-lg dark:bg-gray-300">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-2 hover:bg-gray-200 transition rounded-l-lg disabled:opacity-50"
                            disabled={item.quantity <= 1}
                            aria-label="Decrease quantity"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="px-4 py-1 font-medium min-w-[40px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-2 hover:bg-gray-200 transition rounded-r-lg"
                            aria-label="Increase quantity"
                          >
                            <Plus size={16} />
                          </button>
                        </div>

                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            ${(item.price * item.quantity).toFixed(2)}
                          </div>
                          <div className="text-gray-500 text-sm dark:text-white">
                            ${item.price.toFixed(2)} each
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* FIXED: Cart History Section */}
            {user && (
              <div>
                <Button
                  size="small"
                  variant="success"
                  onClick={toggleCartHistory}
                  fullWidth
                  disabled={isLoadingAPICarts && !showCartHistory}
                >
                  {isLoadingAPICarts && !showCartHistory ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Loading History...
                    </>
                  ) : (
                    <>
                      {showCartHistory ? "Hide" : "Show"} Cart History
                      {apiCarts.length > 0 && (
                        <span className="ml-2 px-2 py-0.5 bg-white text-green-700 rounded-full text-xs">
                          {apiCarts.length}
                        </span>
                      )}
                    </>
                  )}
                </Button>

                {showCartHistory && (
                  <div className="space-y-4 mt-4">
                    {isLoadingAPICarts ? (
                      <div className="flex flex-col items-center justify-center py-12 bg-white rounded-xl dark:bg-gray-800">
                        <Loader2 className="h-8 w-8 animate-spin text-[#01A49E] mb-3" />
                        <p className="text-gray-600 dark:text-gray-400">
                          Loading your cart history...
                        </p>
                      </div>
                    ) : apiCarts.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 bg-white rounded-xl dark:bg-gray-800">
                        <Package className="h-12 w-12 text-gray-400 mb-3" />
                        <p className="text-gray-600 dark:text-gray-400 mb-2">
                          No saved carts found
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-500">
                          Your cart history will appear here once you sync your cart
                        </p>
                      </div>
                    ) : (
                      apiCarts.slice(0, 5).map((apiCart) => (
                        <div
                          key={apiCart.id}
                          className="border border-gray-200 rounded-xl p-4 hover:border-purple-300 transition bg-white dark:bg-gray-800"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
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

                            <Button
                              size="small"
                              variant="teal"
                              onClick={() => loadAPICartIntoCurrentCart(apiCart)}
                              disabled={isLoadingAPICarts}
                            >
                              <Download size={14} className="mr-2" />
                              Load to Cart
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8 dark:bg-gray-800 dark:shadow-white dark:shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6 dark:text-white">
                Order Summary
              </h2>

              {/* Order Details */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-white">Subtotal</span>
                  <span className="font-medium dark:text-white">${totals.subtotal}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-white">Shipping</span>
                  <span
                    className={
                      totals.shipping === "0.00"
                        ? "text-green-600 font-medium dark:text-green-400"
                        : "font-medium dark:text-white"
                    }
                  >
                    {totals.shipping === "0.00" ? "FREE" : `$${totals.shipping}`}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-white">Tax (8%)</span>
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

              {/* Checkout Button */}
              <button
                onClick={proceedToCheckout}
                disabled={cart.length === 0}
                className={`w-full py-3.5 rounded-xl font-semibold transition-all ${
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

              {cart.length === 0 && (
                <p className="text-center text-sm text-gray-500 mt-3 dark:text-gray-400">
                  Add items to your cart to checkout
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;