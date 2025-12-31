// pages/CartPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Button from "../../components_temp/ui/Button";
import Input from "../../components_temp/ui/Input";
import Modal from "../../components_temp/ui/Modal";
import {
  ArrowRight,
  Clock,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  RefreshCw,
  ArrowLeft,
  Loader2,
  Download,
  Package,
  Archive,
  CalendarSync,
  AlertCircle,
} from "lucide-react";
import useApi from "../../services/AdminuseApi";
import { useCart, useQuantity } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";

const CartPage = () => {
  const navigate = useNavigate();
  const [isLoadingAPICarts, setIsLoadingAPICarts] = useState(false);
  const [apiCarts, setApiCarts] = useState([]);
  const [showCartHistory, setShowCartHistory] = useState(false);

  // Modal state
  const [activeModal, setActiveModal] = useState({
    type: null,
    isOpen: false,
    data: null,
  });

  const {
    cart,
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

  const {
    getCurrentQuantity,
    handleQuantityChange,
    handleQuantityBlur,
    handleQuantityKeyDown,
    handleQuantityAdjust,
  } = useQuantity();

  const { user,isAuthenticated } = useAuth();
  const api = useApi();

  // ============================================================================
  // MODAL HANDLERS
  // ============================================================================

  const openModal = useCallback((type, data = null) => {
    setActiveModal({
      type,
      isOpen: true,
      data,
    });
  }, []);

  const closeModal = useCallback(() => {
    setActiveModal({
      type: null,
      isOpen: false,
      data: null,
    });
  }, []);

  // Quantity confirmation handler
  const handleQuantityConfirm = useCallback((itemId, currentQuantity, newQuantity) => {
    openModal('quantity', {
      itemId,
      item: cart.find(item => item.id === itemId),
      currentQuantity,
      newQuantity,
    });
  }, [cart, openModal]);

  // Remove confirmation handler
  const handleRemoveConfirm = useCallback((item) => {
    openModal('remove', { item });
  }, [openModal]);

  // ============================================================================
  // ACTION HANDLERS
  // ============================================================================

  const handleRemoveItem = useCallback((item) => {
    openModal('remove', { item });
  }, [openModal]);

  const handleClearCart = useCallback(() => {
    if (cart.length === 0) {
      toast.error("Cart is already empty");
      return;
    }
    openModal('clear');
  }, [cart.length, openModal]);

  const handleProceedToCheckout = useCallback(() => {
    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    openModal('checkout');
  }, [cart.length, openModal]);

  const handleLoadAPICart = useCallback((apiCart) => {
    if (!apiCart?.products?.length) {
      toast.error("This cart is empty");
      return;
    }
    openModal('loadCart', { apiCart });
  }, [openModal]);

  const handleForceSyncToAPI = useCallback(() => {
    if (cart.length === 0) {
      toast.error("Cart is empty, nothing to sync");
      return;
    }
    openModal('sync');
  }, [cart.length, openModal]);

  const handleRefreshCartData = useCallback(() => {
    openModal('refresh');
  }, [openModal]);

  // ============================================================================
  // MODAL CONFIRMATION HANDLERS
  // ============================================================================

  const handleConfirmRemove = useCallback(async () => {
    const { item } = activeModal.data;
    try {
      await removeFromCart(item.id);
      toast.success(`"${item.title}" removed from cart`);
      closeModal();
    } catch (error) {
      toast.error("Failed to remove item");
    }
  }, [activeModal.data, removeFromCart, closeModal]);

  const handleConfirmClear = useCallback(async () => {
    try {
      await clearCart();
      toast.success("Cart cleared");
      closeModal();
    } catch (error) {
      toast.error("Failed to clear cart");
    }
  }, [clearCart, closeModal]);

  const handleConfirmQuantity = useCallback(async () => {
    const { itemId, newQuantity } = activeModal.data;
    try {
      await updateQuantity(itemId, newQuantity);
      toast.success(`Quantity updated to ${newQuantity}`);
      closeModal();
    } catch (error) {
      toast.error("Failed to update quantity");
    }
  }, [activeModal.data, updateQuantity, closeModal]);

  const handleConfirmCheckout = useCallback(() => {
    toast.success("Proceeding to checkout!");
    closeModal();
    navigate("/checkout");
  }, [navigate, closeModal]);

  const handleConfirmLoadCart = useCallback(async () => {
    const { apiCart } = activeModal.data;
    
    if (isLoadingAPICarts) {
      toast.error("Please wait, loading in progress...");
      return;
    }

    try {
      setIsLoadingAPICarts(true);
      const loadingToast = toast.loading("Loading cart items...");

      const productPromises = apiCart.products.slice(0, 10).map(async (apiProduct) => {
        try {
          const { data: product } = await api.productAPI.getById(apiProduct.productId);
          return { product, quantity: apiProduct.quantity };
        } catch (error) {
          console.error(`Error fetching product ${apiProduct.productId}:`, error);
          return null;
        }
      });

      const products = await Promise.all(productPromises);
      const validProducts = products.filter((p) => p !== null);

      if (validProducts.length === 0) {
        toast.error("Failed to load any products from this cart", { id: loadingToast });
        return;
      }

      const result = await addMultipleToCart(validProducts);
      toast[result.success ? 'success' : 'error'](
        result.success 
          ? `Loaded ${validProducts.length} items from saved cart!`
          : "Failed to add items to cart",
        { id: loadingToast }
      );
      closeModal();
    } catch (error) {
      console.error("Error loading API cart:", error);
      toast.error("Failed to load saved cart");
    } finally {
      setIsLoadingAPICarts(false);
    }
  }, [activeModal.data, api.productAPI, addMultipleToCart, isLoadingAPICarts, closeModal]);

  const handleConfirmSync = useCallback(async () => {
    try {
      const syncToast = toast.loading("Syncing cart to server...");
      await syncCartToAPI();
      toast.success("Cart synced successfully!", { id: syncToast });
      closeModal();
    } catch (error) {
      console.error("Sync failed:", error);
      toast.error("Failed to sync cart");
    }
  }, [syncCartToAPI, closeModal]);

  const handleConfirmRefresh = useCallback(async () => {
    try {
      const refreshToast = toast.loading("Refreshing cart data...");
      await refreshCartFromAPI();
      toast.success("Cart refreshed from server!", { id: refreshToast });
      closeModal();
    } catch (error) {
      console.error("Refresh failed:", error);
      toast.error("Refresh failed");
    }
  }, [refreshCartFromAPI, closeModal]);

  // ============================================================================
  // CART HISTORY LOADING
  // ============================================================================

  const loadUserAPICarts = useCallback(async () => {
    if (!user?.id || isLoadingAPICarts) return;

    try {
      setIsLoadingAPICarts(true);
      const result = await getUserCarts(user.id);

      if (result.success && result.data) {
        setApiCarts(Array.isArray(result.data) ? result.data : []);
      } else {
        setApiCarts([]);
      }
    } catch (error) {
      console.error("Error loading cart history:", error);
      toast.error("Failed to load cart history");
      setApiCarts([]);
    } finally {
      setIsLoadingAPICarts(false);
    }
  }, [user?.id, getUserCarts, isLoadingAPICarts]);

  const toggleCartHistory = useCallback(() => {
    if (!showCartHistory && user?.id) {
      loadUserAPICarts();
    }
    setShowCartHistory(!showCartHistory);
  }, [showCartHistory, user?.id, loadUserAPICarts]);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

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

  const continueShopping = useCallback(() => navigate("/"), [navigate]);

  const totals = useMemo(() => {
    const subtotal = cartStats.totalValue || 0;
    const shipping = subtotal > 100 ? 0 : 9.99;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;

    return {
      subtotal: subtotal.toFixed(2),
      shipping: shipping.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2),
      hasFreeShipping: shipping === 0,
    };
  }, [cartStats.totalValue]);

  // ============================================================================
  // MODAL RENDER
  // ============================================================================

  const renderModalContent = () => {
    const modalTitles = {
      'remove': 'Remove Item',
      'clear': 'Clear Cart',
      'quantity': 'Update Quantity',
      'checkout': 'Proceed to Checkout',
      'loadCart': 'Load Saved Cart',
      'sync': 'Save to Server',
      'refresh': 'Refresh Cart',
    };

    const getModalIcon = () => {
      const { type } = activeModal;
      const { item } = activeModal.data || {};

      switch (type) {
        case 'remove':
          return <Trash2 className="h-6 w-6 text-red-600" />;
        case 'clear':
          return <Trash2 className="h-6 w-6 text-red-600" />;
        case 'quantity':
          return <Package className="h-6 w-6 text-blue-600" />;
        case 'checkout':
          return <ArrowRight className="h-6 w-6 text-green-600" />;
        case 'loadCart':
          return <Download className="h-6 w-6 text-blue-600" />;
        case 'sync':
          return <CalendarSync className="h-6 w-6 text-green-600" />;
        case 'refresh':
          return <RefreshCw className="h-6 w-6 text-blue-600" />;
        default:
          return <AlertCircle className="h-6 w-6 text-gray-600" />;
      }
    };

    const getModalMessage = () => {
      const { type, data } = activeModal;

      switch (type) {
        case 'remove':
          return `Are you sure you want to remove "${data.item.title}" from your cart?`;
        case 'clear':
          return `Are you sure you want to clear all ${cart.length} items from your cart?`;
        case 'quantity':
          return `Update quantity of "${data.item.title}" from ${data.currentQuantity} to ${data.newQuantity}?`;
        case 'checkout':
          return `Proceed to checkout with ${cartItemCount} items totaling $${cartStats.totalValue?.toFixed(2) || '0.00'}?`;
        case 'loadCart':
          return `Load ${data.apiCart.products.length} items from Cart #${data.apiCart.id} into your current cart?`;
        case 'sync':
          return `Save your current cart with ${cartItemCount} items to the server?`;
        case 'refresh':
          return `Refresh your cart data from the server?`;
        default:
          return 'Are you sure?';
      }
    };

    const getConfirmHandler = () => {
      const { type } = activeModal;

      switch (type) {
        case 'remove': return handleConfirmRemove;
        case 'clear': return handleConfirmClear;
        case 'quantity': return handleConfirmQuantity;
        case 'checkout': return handleConfirmCheckout;
        case 'loadCart': return handleConfirmLoadCart;
        case 'sync': return handleConfirmSync;
        case 'refresh': return handleConfirmRefresh;
        default: return () => {};
      }
    };

    const getButtonVariant = () => {
      const { type } = activeModal;

      switch (type) {
        case 'remove':
        case 'clear':
          return 'danger';
        case 'checkout':
          return 'teal';
        case 'sync':
          return 'success';
        default:
          return 'primary';
      }
    };

    return (
      <div className="py-4">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="p-3 rounded-full bg-gray-100">
              {getModalIcon()}
            </div>
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-gray-900 mb-2 dark:text-gray-200">
              {modalTitles[activeModal.type] || 'Confirm Action'}
            </h4>
            <p className="text-gray-600 mb-6 dark:text-gray-400">
              {getModalMessage()}
            </p>
            <div className="flex justify-end space-x-3">
              <Button variant="secondary" onClick={closeModal}>
                Cancel
              </Button>
              <Button 
                variant={getButtonVariant()} 
                onClick={getConfirmHandler()}
                disabled={isLoadingAPICarts}
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <>
      {/* Confirmation Modal */}
      <Modal
        isOpen={activeModal.isOpen}
        onClose={closeModal}
        size="small"
      >
        {renderModalContent()}
      </Modal>

      {/* Main Page */}
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <Button variant="secondary" icon={<ArrowLeft />} onClick={continueShopping}>
                Continue Shopping
              </Button>

              <div className="flex gap-2">
                {user && cart.length > 0 && (
                  <Button
                    onClick={handleForceSyncToAPI}
                    disabled={isSyncing || cart.length === 0}
                    loading={isSyncing}
                    variant="success"
                    icon={!isSyncing && <CalendarSync size={16} />}
                  >
                    {isSyncing ? "Syncing..." : "Save to Server"}
                  </Button>
                )}

                <Button
                  onClick={handleRefreshCartData}
                  disabled={isLoadingAPICarts || !user}
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
                    {cartItemCount} {cartItemCount === 1 ? "item" : "items"} in your cart
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
                      Your cart automatically syncs to the server.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-8">
              {cart.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-lg p-8 text-center dark:bg-gray-800">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 dark:bg-gray-700">
                    <ShoppingBag className="text-gray-400" size={48} />
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
                <div className="bg-white rounded-2xl shadow-lg p-6 dark:bg-gray-800">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Cart Items
                    </h2>
                    <Button
                      variant="danger"
                      onClick={handleClearCart}
                      size="small"
                      disabled={cart.length === 0}
                    >
                      Clear Cart
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div
                        key={`${item.id}-${item.addedAt}`}
                        className="flex flex-col sm:flex-row gap-4 p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition dark:border-gray-700"
                      >
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden dark:bg-gray-700">
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
                                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full dark:bg-blue-900 dark:text-blue-300">
                                  {item.category}
                                </span>
                                {item.fromAPI && (
                                  <span className="text-xs px-2 py-0.5 bg-green-100 text-green-800 rounded flex items-center gap-1 dark:bg-green-900 dark:text-green-300">
                                    <Archive size={10} />
                                    From Saved
                                  </span>
                                )}
                              </div>
                            </div>

                            <button
                              onClick={() => handleRemoveItem(item)}
                              className="text-gray-400 hover:text-red-500 transition p-1 dark:text-gray-400 dark:hover:text-red-400"
                              aria-label="Remove item"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center">
                              {/* Decrease Button */}
                              <button
                                onClick={() => handleQuantityAdjust(
                                  item.id,
                                  -1,
                                  item.quantity,
                                  handleQuantityConfirm,
                                  { min: 1, max: 10 }
                                )}
                                className="
                                  h-10 w-8
                                  flex items-center justify-center
                                  bg-gray-100 dark:bg-gray-800
                                  border border-gray-300 dark:border-gray-600
                                  rounded-l-lg
                                  hover:bg-gray-200 dark:hover:bg-gray-700
                                  hover:border-blue-400 dark:hover:border-blue-500
                                  active:scale-95
                                  transition-all duration-200
                                  disabled:opacity-40 disabled:cursor-not-allowed
                                "
                                aria-label="Decrease quantity"
                                disabled={item.quantity <= 1}
                              >
                                <Minus size={18} className="text-gray-700 dark:text-gray-300" />
                              </button>

                              {/* Quantity Input */}
                              <div className="h-10 w-20">
                                <Input
                                  type="text"
                                  inputMode="numeric"
                                  pattern="[0-9]*"
                                  value={getCurrentQuantity(item.id, item.quantity)}
                                  onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                                  onKeyDown={(e) => handleQuantityKeyDown(
                                    e,
                                    item.id,
                                    item.quantity,
                                    handleQuantityConfirm,
                                    { min: 1, max: 10 }
                                  )}
                                  onBlur={() => handleQuantityBlur(
                                    item.id,
                                    item.quantity,
                                    handleQuantityConfirm,
                                    { min: 1, max: 10 }
                                  )}
                                  containerClassName="mb-0 h-full"
                                  className="
                                    h-full
                                    px-4
                                    font-medium
                                    w-full
                                    text-center
                                    bg-white dark:bg-gray-800
                                    border-y border-gray-300 dark:border-gray-600
                                    text-gray-900 dark:text-white
                                    focus:outline-none
                                    focus:ring-2 focus:ring-blue-500
                                    focus:border-blue-500
                                    hover:bg-gray-50 dark:hover:bg-gray-750
                                    transition-all duration-200
                                  "
                                  
                                />
                              </div>

                              {/* Increase Button */}
                              <button
                                onClick={() => handleQuantityAdjust(
                                  item.id,
                                  1,
                                  item.quantity,
                                  handleQuantityConfirm,
                                  { min: 1, max: 10 }
                                )}
                                className="
                                  h-10 w-8
                                  flex items-center justify-center
                                  bg-gray-100 dark:bg-gray-800
                                  border border-gray-300 dark:border-gray-600
                                  border-l-0
                                  rounded-r-lg
                                  hover:bg-gray-200 dark:hover:bg-gray-700
                                  hover:border-blue-400 dark:hover:border-blue-500
                                  active:scale-95
                                  transition-all duration-200
                                "
                                aria-label="Increase quantity"
                              >
                                <Plus size={18} className="text-gray-700 dark:text-gray-300" />
                              </button>
                            </div>

                            <div className="text-right">
                              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                ${(item.price * item.quantity).toFixed(2)}
                              </div>
                              <div className="text-gray-500 text-sm dark:text-gray-400">
                                ${Number(item.price || 0).toFixed(2)} each
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
              {user && (
                <div className="bg-white rounded-2xl shadow-lg p-6 dark:bg-gray-800">
                  <Button
                    size="small"
                    variant="success"
                    onClick={toggleCartHistory}
                    fullWidth
                    disabled={isLoadingAPICarts}
                    loading={isLoadingAPICarts}
                  >
                    {showCartHistory ? "Hide" : "Show"} Cart History
                    {apiCarts.length > 0 && ` (${apiCarts.length})`}
                  </Button>

                  {showCartHistory && apiCarts.length > 0 && (
                    <div className="space-y-4 mt-4">
                      {apiCarts.map((apiCart) => (
                        <div
                          key={apiCart.id}
                          className="border border-gray-200 rounded-xl p-4 hover:border-purple-300 transition dark:border-gray-700"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div className="flex-grow">
                              <div className="flex items-center gap-2 mb-2">
                                <Package className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                <span className="font-medium text-gray-900 dark:text-white">
                                  Cart #{apiCart.id}
                                </span>
                                <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full dark:bg-purple-900 dark:text-purple-300">
                                  {apiCart.products?.length || 0} items
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <Clock size={14} />
                                <span>{formatDate(apiCart.date)}</span>
                              </div>
                            </div>

                            <Button
                              size="small"
                              variant="teal"
                              onClick={() => handleLoadAPICart(apiCart)}
                              disabled={isLoadingAPICarts}
                              icon={<Download size={14}/>}
                            >
                              
                              Load Cart
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8 dark:bg-gray-800">
                <h2 className="text-xl font-bold text-gray-900 mb-6 dark:text-white">
                  Order Summary
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                    <span className="font-medium dark:text-white">${totals.subtotal}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                    <span className={totals.hasFreeShipping ? "text-green-600 font-medium dark:text-green-400" : "font-medium dark:text-white"}>
                      {totals.hasFreeShipping ? "FREE" : `$${totals.shipping}`}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Tax (8%)</span>
                    <span className="font-medium dark:text-white">${totals.tax}</span>
                  </div>

                  <div className="border-t pt-4 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900 dark:text-white">Total</span>
                      <div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          ${totals.total}
                        </div>
                        {totals.hasFreeShipping && (
                          <div className="text-green-600 text-sm font-medium dark:text-green-400">
                            Free Shipping
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

              {isAuthenticated ? ( <Button
                  onClick={handleProceedToCheckout}
                  icon={<ArrowRight/>}
                  iconPosition="right"
                  disabled={cart.length === 0}
                  variant="teal"
                  fullWidth
                  size="large"
                >
                  Proceed to Checkout
                </Button>):(
                  <Button
                  onClick={() => {navigate('/login')}}

                  icon={<ArrowRight/>}
                  iconPosition="right"
                  disabled={cart.length === 0}
                  variant="teal"
                  fullWidth
                  size="large"
                >
                  Login to Checkout
                </Button>
                )
}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CartPage;