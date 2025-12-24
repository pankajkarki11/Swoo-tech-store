import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Button from "../../components_temp/ui/Button";
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
  Package,
  Archive,
  ShoppingCart as CartIcon,
  CalendarSync,
  AlertCircle,
} from "lucide-react";
import useApi from "../../services/AdminuseApi";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";

const CartPage = () => {
  const navigate = useNavigate();
  const [isLoadingAPICarts, setIsLoadingAPICarts] = useState(false);
  const [apiCarts, setApiCarts] = useState([]);
  const [showCartHistory, setShowCartHistory] = useState(false);
  const [hasLoadedCarts, setHasLoadedCarts] = useState(false);

  const {
    cart,
    addToCart,
    addMultipleToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartItemCount,
    cartStats,
    isSyncing,
    syncCartToAPI,
    getUserCarts,
    refreshCartFromAPI,
  } = useCart();

  const { user } = useAuth();
  const api = useApi();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (user?.id && !hasLoadedCarts) {
      loadUserAPICarts();
    }
  }, [user?.id]);

//cart history

  const loadUserAPICarts = useCallback(async () => {
    if (!user?.id || isLoadingAPICarts) {
      console.log("⏸️ Skipping cart load:", {
        hasUser: !!user?.id,
        isLoading: isLoadingAPICarts,
      });
      return;
    }

    console.log("📥 Loading cart history for user:", user.id);

    try {
      setIsLoadingAPICarts(true);

      const result = await getUserCarts(user.id);

      if (result.success && result.data) {
        console.log("✅ Loaded cart history:", result.data.length);
        setApiCarts(Array.isArray(result.data) ? result.data : []);
      } else {
        console.log("ℹ️ No cart history found");
        setApiCarts([]);
      }

      setHasLoadedCarts(true);
    } catch (error) {
      console.error("❌ Error loading cart history:", error);
      toast.error("Failed to load cart history");
      setApiCarts([]);
      setHasLoadedCarts(true);
    } finally {
      setIsLoadingAPICarts(false);
    }
  }, [user?.id, getUserCarts, isLoadingAPICarts]);

  // LOAD SAVED CART INTO CURRENT CART

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
            console.error(
              `Error fetching product ${apiProduct.productId}:`,
              error
            );
            return null;
          }
        });

        const products = await Promise.all(productPromises);
        const validProducts = products.filter((p) => p !== null);

        if (validProducts.length === 0) {
          toast.error("Failed to load any products from this cart", {
            id: "load-cart",
          });
          return;
        }

        // Use addMultipleToCart to add all products at once (fixes race condition)
        const result = await addMultipleToCart(validProducts);

        if (result.success) {
          toast.success(
            `Loaded ${validProducts.length} items from saved cart!`,
            { id: "load-cart" }
          );
        } else {
          toast.error(result.error || "Failed to add items to cart", {
            id: "load-cart",
          });
        }
      } catch (error) {
        console.error("Error loading API cart:", error);
        toast.error("Failed to load saved cart", { id: "load-cart" });
      } finally {
        setIsLoadingAPICarts(false);
      }
    },
    [api.productAPI, addMultipleToCart, isLoadingAPICarts]
  );


  // UTILITY FUNCTIONS


  const formatDate = useCallback((dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Invalid date";
    }
  }, []);

 
  // CART ACTIONS


  const handleForceSyncToAPI = useCallback(async () => {
    if (cart.length === 0) {
      toast.error("Cart is empty, nothing to sync");
      return;
    }

    try {
      toast.loading("Syncing cart to server...", { id: "sync" });
      await syncCartToAPI();
      toast.success("Cart synced successfully!", { id: "sync" });

      // Reload cart history
      await loadUserAPICarts();
    } catch (error) {
      console.error("Sync failed:", error);
      toast.error("Failed to sync cart", { id: "sync" });
    }
  }, [cart.length, syncCartToAPI, loadUserAPICarts]);

  const refreshCartData = useCallback(async () => {
    try {
      toast.loading("Refreshing cart data...", { id: "refresh" });

      // Refresh current cart from API
      if (user?.id) {
        const result = await refreshCartFromAPI();
        if (result.success) {
          toast.success("Cart refreshed from server!", { id: "refresh" });
        } else {
          toast.error(result.error || "Failed to refresh cart", { id: "refresh" });
        }
      }

      // Reload cart history
      await loadUserAPICarts();
    } catch (error) {
      console.error("Refresh failed:", error);
      toast.error("Refresh failed", { id: "refresh" });
    }
  }, [user?.id, refreshCartFromAPI, loadUserAPICarts]);

  const clearCartHandler = useCallback(() => {
    if (window.confirm("Are you sure you want to clear your cart?")) {
      clearCart();
      toast.success("Cart cleared!");
    }
  }, [clearCart]);

  const toggleCartHistory = useCallback(() => {
    if (!showCartHistory && !hasLoadedCarts && user?.id) {
      loadUserAPICarts();
    }
    setShowCartHistory(!showCartHistory);
  }, [showCartHistory, hasLoadedCarts, user?.id, loadUserAPICarts]);

 
  // NAVIGATION
  

  const proceedToCheckout = useCallback(() => {
    if (cart.length === 0) return;
    toast.success("Proceeding to checkout!");
    navigate("/checkout");
  }, [navigate, cart.length]);

  const continueShopping = useCallback(() => navigate("/"), [navigate]);


  // COMPUTED VALUES


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


  // RENDER

  return (
    <div className="min-h-screen bg-white font-sans py-8 dark:bg-gray-900">
      <div className="container mx-auto px-4">
       
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <Button variant="secondary" onClick={continueShopping}>
              <ArrowLeft size={20} className="mr-2" />
              Continue Shopping
            </Button>

            <div className="flex gap-2">
              {user && cart.length > 0 && (
                <Button
                  onClick={handleForceSyncToAPI}
                  disabled={isSyncing}
                  loading={isSyncing}
                  variant="success"
                  icon={!isSyncing && <CalendarSync size={16} />}
                >
                  {isSyncing ? "Syncing..." : "Save to Server"}
                </Button>
              )}

              <Button
                onClick={refreshCartData}
                disabled={isLoadingAPICarts}
                loading={isLoadingAPICarts}
                icon={!isLoadingAPICarts && <RefreshCw size={16} />}
              >
                {isLoadingAPICarts ? "Refreshing..." : "Refresh"}
              </Button>
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
              <div className="flex items-center gap-3">
                <p className="text-gray-600 dark:text-white">
                  {cartItemCount} {cartItemCount === 1 ? "item" : "items"} in
                  your cart
                </p>
                {isSyncing && (
                  <span className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Syncing...
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Info Banner */}
          {user && cart.length > 0 && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3 dark:bg-blue-900/20 dark:border-blue-800">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800 dark:text-blue-300">
                  <p className="font-medium">Auto-sync Info</p>
                  <p className="text-blue-600 dark:text-blue-400">
                    Your cart automatically syncs to the server. Note: FakeStore API is read-only, 
                    so changes are sent but not actually persisted on the server.
                  </p>
                </div>
              </div>
            </div>
          )}

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
                    <div className="text-gray-600 text-sm">Total Items</div>
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
                    <div className="text-gray-600 text-sm">Cart Value</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* ====================================================================== */}
          {/* LEFT COLUMN - CART ITEMS */}
          {/* ====================================================================== */}
          <div className="lg:col-span-2 space-y-8">
            {cart.length === 0 ? (
              /* Empty Cart State */
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
              /* Cart Items List */
              <div className="bg-white rounded-2xl shadow-lg p-6 dark:bg-gray-800 dark:shadow-white dark:shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Current Cart Items
                  </h2>
                  <Button
                    variant="danger"
                    onClick={clearCartHandler}
                    size="small"
                  >
                    Clear Cart
                  </Button>
                </div>

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
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
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
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
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
                            ${Number(item.price || 0).toFixed(2)} each
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                      apiCarts.map((apiCart) => (
                        <div
                          key={apiCart.id}
                          className="border border-gray-200 rounded-xl p-4 hover:border-purple-300 transition bg-white dark:bg-gray-800"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div className="flex-grow">
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
                              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                User ID: {apiCart.userId}
                              </div>
                            </div>

                            <Button
                              size="small"
                              variant="teal"
                              onClick={() => loadAPICartIntoCurrentCart(apiCart)}
                              disabled={isLoadingAPICarts}
                            >
                              <Download size={14} className="mr-2" />
                              Load Cart
                            </Button>
                          </div>

                          {/* Products Preview */}
                          {apiCart.products && apiCart.products.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                Items:
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {apiCart.products.slice(0, 5).map((p, idx) => (
                                  <span
                                    key={idx}
                                    className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded"
                                  >
                                    Product #{p.productId} (×{p.quantity})
                                  </span>
                                ))}
                                {apiCart.products.length > 5 && (
                                  <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                                    +{apiCart.products.length - 5} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

       
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8 dark:bg-gray-800 dark:shadow-white dark:shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6 dark:text-white">
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-white">Subtotal</span>
                  <span className="font-medium dark:text-white">
                    ${totals.subtotal}
                  </span>
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
                  <span className="font-medium dark:text-white">
                    ${totals.tax}
                  </span>
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

              {/* Sync Status */}
              {user && cart.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Sync Status:
                    </span>
                    {isSyncing ? (
                      <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Syncing...
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                        <CalendarSync className="h-3 w-3" />
                        Synced
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;