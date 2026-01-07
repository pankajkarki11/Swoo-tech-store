// pages/CheckoutPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Button from "../../components_temp/ui/Button";
import Input from "../../components_temp/ui/Input";
import Modal from "../../components_temp/ui/Modal";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  CreditCard,
  Package,
  Truck,
  Shield,
  Lock,
  MapPin,
  User,
  Phone,
  Mail,
  ShoppingBag,
  Loader2,
  AlertCircle,
  Check,
  Calendar,
} from "lucide-react";
import useApi from "../../services/AdminuseApi";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const api = useApi();
  const { cart, cartStats, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();

  // Order state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState(null);

  // Form state
  const [shippingInfo, setShippingInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
  });

  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
  });

  const [selectedShipping, setSelectedShipping] = useState("standard");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [saveShippingInfo, setSaveShippingInfo] = useState(false);

  // Modal state
  const [activeModal, setActiveModal] = useState({
    type: null,
    isOpen: false,
    data: null,
  });

  // Initialize form with user data if available
  useEffect(() => {
    if (user) {
      setShippingInfo(prev => ({
        ...prev,
        firstName: user.firstname || "",
        lastName: user.lastname || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address?.street || "",
        city: user.address?.city || "",
        state: user.address?.state || "",
        zipCode: user.address?.zipcode || "",
      }));
    }
  }, [user]);

  // Calculate totals
  const totals = useMemo(() => {
    const subtotal = cartStats.totalValue || 0;
    const shippingOptions = {
      standard: subtotal > 100 ? 0 : 9.99,
      express: 19.99,
      overnight: 49.99,
    };
    const shipping = shippingOptions[selectedShipping];
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;

    return {
      subtotal: subtotal.toFixed(2),
      shipping: shipping.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2),
      hasFreeShipping: shipping === 0 && selectedShipping === "standard",
    };
  }, [cartStats.totalValue, selectedShipping]);

  // Validation
  const validateForm = useCallback(() => {
    // Check cart
    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return false;
    }

    // Validate shipping info
    const requiredFields = [
      'firstName', 'lastName', 'email', 'phone', 
      'address', 'city', 'state', 'zipCode'
    ];
    
    for (const field of requiredFields) {
      if (!shippingInfo[field]?.trim()) {
        toast.error(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(shippingInfo.email)) {
      toast.error("Please enter a valid email address");
      return false;
    }

    // Validate phone
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(shippingInfo.phone.replace(/[\s\-\(\)]/g, ''))) {
      toast.error("Please enter a valid phone number");
      return false;
    }

    // Validate payment info
    if (!paymentInfo.cardNumber.replace(/\s/g, '').match(/^\d{16}$/)) {
      toast.error("Please enter a valid 16-digit card number");
      return false;
    }

    if (!paymentInfo.cardName.trim()) {
      toast.error("Please enter the name on card");
      return false;
    }

    if (!paymentInfo.expiryDate.match(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)) {
      toast.error("Please enter a valid expiry date (MM/YY)");
      return false;
    }

    if (!paymentInfo.cvv.match(/^\d{3,4}$/)) {
      toast.error("Please enter a valid CVV");
      return false;
    }

    if (!agreeToTerms) {
      toast.error("Please agree to the terms and conditions");
      return false;
    }

    return true;
  }, [cart.length, shippingInfo, paymentInfo, agreeToTerms]);

  // Modal handlers
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

  // Form handlers
  const handleShippingChange = useCallback((field, value) => {
    setShippingInfo(prev => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handlePaymentChange = useCallback((field, value) => {
    setPaymentInfo(prev => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  // Format card number as user types
  const handleCardNumberChange = useCallback((value) => {
    const formatted = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
    handlePaymentChange('cardNumber', formatted.slice(0, 19));
  }, [handlePaymentChange]);

  // Format expiry date as user types
  const handleExpiryChange = useCallback((value) => {
    const formatted = value.replace(/\D/g, '').replace(/(\d{2})(\d{0,2})/, '$1/$2');
    handlePaymentChange('expiryDate', formatted.slice(0, 5));
  }, [handlePaymentChange]);

  // Place order
  const handlePlaceOrder = useCallback(async () => {
    if (!validateForm()) return;

    openModal('confirm');
  }, [validateForm, openModal]);

  const confirmPlaceOrder = useCallback(async () => {
    try {
      setIsSubmitting(true);

      // Simulate API call - in real app, you would use your actual order API
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Generate order ID
      const newOrderId = `ORD-${Date.now().toString().slice(-8)}`;
      setOrderId(newOrderId);
      
      // Save order to localStorage (for demo purposes)
      const orderData = {
        id: newOrderId,
        date: new Date().toISOString(),
        customer: {
          ...shippingInfo,
          userId: user?.id,
        },
        payment: {
          ...paymentInfo,
          cardNumber: `**** **** **** ${paymentInfo.cardNumber.slice(-4)}`,
        },
        shipping: selectedShipping,
        items: cart.map(item => ({
          id: item.id,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        totals: {
          subtotal: parseFloat(totals.subtotal),
          shipping: parseFloat(totals.shipping),
          tax: parseFloat(totals.tax),
          total: parseFloat(totals.total),
        },
        status: 'processing',
      };

      // Save order history
      const orders = JSON.parse(localStorage.getItem('swmart_orders') || '[]');
      orders.unshift(orderData);
      localStorage.setItem('swmart_orders', JSON.stringify(orders.slice(0, 20))); // Keep last 20 orders

      // Clear cart
      await clearCart();

      // Show success
      setOrderPlaced(true);
      closeModal();

      toast.success(`Order #${newOrderId} placed successfully!`);

      // Auto-redirect after 5 seconds
      setTimeout(() => {
        navigate('/orders');
      }, 5000);

    } catch (error) {
      console.error("Order placement error:", error);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [
    shippingInfo, 
    paymentInfo, 
    selectedShipping, 
    cart, 
    totals, 
    user, 
    clearCart, 
    closeModal, 
    navigate
  ]);

  // Back to cart
  const handleBackToCart = useCallback(() => {
    navigate("/cart");
  }, [navigate]);

  // Continue shopping
  const handleContinueShopping = useCallback(() => {
    navigate("/");
  }, [navigate]);

  // View order history
  const handleViewOrders = useCallback(() => {
    navigate("/orders");
  }, [navigate]);

  // Shipping options
  const shippingOptions = [
    {
      id: "standard",
      name: "Standard Shipping",
      price: totals.hasFreeShipping ? "FREE" : "$9.99",
      estimated: "5-7 business days",
      icon: <Package className="h-5 w-5" />,
    },
    {
      id: "express",
      name: "Express Shipping",
      price: "$19.99",
      estimated: "2-3 business days",
      icon: <Truck className="h-5 w-5" />,
    },
    {
      id: "overnight",
      name: "Overnight Shipping",
      price: "$49.99",
      estimated: "Next business day",
      icon: <Calendar className="h-5 w-5" />,
    },
  ];

  // Modal content
  const renderModalContent = () => {
    switch (activeModal.type) {
      case 'confirm':
        return (
          <div className="py-4">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-full bg-green-100">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-900 mb-2 dark:text-gray-200">
                  Confirm Order
                </h4>
                <p className="text-gray-600 mb-4 dark:text-gray-400">
                  Are you ready to place your order?
                </p>
                <div className="bg-gray-50 rounded-lg p-4 mb-4 dark:bg-gray-700">
                  <p className="font-medium text-gray-900 dark:text-white">Order Summary:</p>
                  <ul className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-300">
                    <li>{cart.length} items</li>
                    <li>Total: ${totals.total}</li>
                    <li>Shipping to: {shippingInfo.city}, {shippingInfo.state}</li>
                  </ul>
                </div>
                <div className="flex justify-end space-x-3">
                  <Button variant="secondary" onClick={closeModal}>
                    Cancel
                  </Button>
                  <Button 
                    variant="success" 
                    onClick={confirmPlaceOrder}
                    loading={isSubmitting}
                  >
                    {isSubmitting ? "Processing..." : "Place Order"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  // Success screen
  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center dark:bg-gray-800">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 dark:bg-green-900">
              <CheckCircle className="text-green-600 dark:text-green-400" size={48} />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-3 dark:text-white">
              Order Confirmed!
            </h1>
            
            <p className="text-gray-600 mb-2 dark:text-gray-300">
              Thank you for your purchase. Your order has been received.
            </p>
            
            <div className="bg-gray-50 rounded-xl p-6 mb-6 mt-6 dark:bg-gray-700">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full dark:bg-blue-900 dark:text-blue-300">
                <Shield className="h-4 w-4" />
                <span className="font-medium">Order #{orderId}</span>
              </div>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-white rounded-lg dark:bg-gray-600">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Amount</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">${totals.total}</p>
                </div>
                <div className="p-3 bg-white rounded-lg dark:bg-gray-600">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Items</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{cart.length}</p>
                </div>
                <div className="p-3 bg-white rounded-lg dark:bg-gray-600">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Estimated Delivery</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {selectedShipping === 'overnight' ? 'Tomorrow' : 
                     selectedShipping === 'express' ? '2-3 days' : '5-7 days'}
                  </p>
                </div>
              </div>
            </div>

            <p className="text-gray-500 text-sm mb-8 dark:text-gray-400">
              A confirmation email has been sent to {shippingInfo.email}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                variant="teal" 
                onClick={handleViewOrders}
                icon={<ShoppingBag />}
              >
                View Order History
              </Button>
              <Button 
                variant="secondary" 
                onClick={handleContinueShopping}
                icon={<ArrowLeft />}
              >
                Continue Shopping
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            <div className="mb-6">
              <Button variant="secondary" icon={<ArrowLeft />} onClick={handleBackToCart}>
                Back to Cart
              </Button>
            </div>

            <div className="flex items-center gap-3 mb-2">
              <div className="bg-gradient-to-r from-[#01A49E] to-[#01857F] p-3 rounded-xl">
                <CreditCard className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Checkout
                </h1>
                <p className="text-gray-600 dark:text-white">
                  Complete your purchase securely
                </p>
              </div>
            </div>

            {/* Progress Indicator */}
            <div className="mt-6">
              <div className="flex items-center justify-center mb-2">
                <div className="flex items-center">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
                      <Check size={16} />
                    </div>
                    <div className="w-24 h-1 bg-blue-600"></div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
                      2
                    </div>
                    <div className="w-24 h-1 bg-gray-300 dark:bg-gray-700"></div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center dark:bg-gray-700 dark:text-gray-400">
                    3
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center ">
                <div className="flex items-center justify-between gap-14">
                <span className="text-blue-600 font-medium dark:text-blue-400">Cart</span>
                <span className="text-blue-600 font-medium dark:text-blue-400 ">Checkout</span>
                <span className="text-gray-500 dark:text-gray-400">Confirmation</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Forms */}
            <div className="lg:col-span-2 space-y-8">
              {/* Shipping Information */}
              <div className="bg-white rounded-2xl shadow-lg p-6 dark:bg-gray-800">
                <div className="flex items-center gap-3 mb-6">
                  <MapPin className="text-[#01A49E]" size={24} />
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Shipping Information
                  </h2>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <Input
                    label="First Name"
                    value={shippingInfo.firstName}
                    onChange={(e) => handleShippingChange('firstName', e.target.value)}
                    required
                    icon={<User size={16} />}
                  />
                  <Input
                    label="Last Name"
                    value={shippingInfo.lastName}
                    onChange={(e) => handleShippingChange('lastName', e.target.value)}
                    required
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    value={shippingInfo.email}
                    onChange={(e) => handleShippingChange('email', e.target.value)}
                    required
                    icon={<Mail size={16} />}
                  />
                  <Input
                    label="Phone Number"
                    value={shippingInfo.phone}
                    onChange={(e) => handleShippingChange('phone', e.target.value)}
                    required
                    icon={<Phone size={16} />}
                  />
                  <Input
                    label="Address"
                    value={shippingInfo.address}
                    onChange={(e) => handleShippingChange('address', e.target.value)}
                    required
                    className="md:col-span-2"
                  />
                  <Input
                    label="City"
                    value={shippingInfo.city}
                    onChange={(e) => handleShippingChange('city', e.target.value)}
                    required
                  />
                  <Input
                  aria-label="State"
                    label="State"
                    value={shippingInfo.state}
                    onChange={(e) => handleShippingChange('state', e.target.value)}
                    required
                  />
                  <Input
                    label="ZIP Code"
                    value={shippingInfo.zipCode}
                    onChange={(e) => handleShippingChange('zipCode', e.target.value)}
                    required
                  />
                  <Input
                    label="Country"
                    value={shippingInfo.country}
                    onChange={(e) => handleShippingChange('country', e.target.value)}
                    required
                  />
                </div>

                {isAuthenticated && (
                  <div className="flex items-center gap-2 mb-4">
                    <input
                      type="checkbox"
                      id="saveShipping"
                      checked={saveShippingInfo}
                      onChange={(e) => setSaveShippingInfo(e.target.checked)}
                      className="rounded border-gray-300 text-[#01A49E] focus:ring-[#01A49E]"
                    />
                    <label htmlFor="saveShipping" className="text-sm text-gray-600 dark:text-gray-300">
                      Save shipping information for future orders
                    </label>
                  </div>
                )}
              </div>

              {/* Shipping Method */}
              <div className="bg-white rounded-2xl shadow-lg p-6 dark:bg-gray-800">
                <div className="flex items-center gap-3 mb-6">
                  <Truck className="text-[#01A49E]" size={24} />
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Shipping Method
                  </h2>
                </div>

                <div className="space-y-3">
                  {shippingOptions.map((option) => (
                    <div
                      key={option.id}
                      className={`
                        border rounded-xl p-4 cursor-pointer transition-all
                        ${selectedShipping === option.id 
                          ? 'border-[#01A49E] bg-blue-50 dark:bg-blue-900/20' 
                          : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'
                        }
                      `}
                      onClick={() => setSelectedShipping(option.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`
                            p-2 rounded-lg
                            ${selectedShipping === option.id 
                              ? 'bg-[#01A49E] text-white' 
                              : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                            }
                          `}>
                            {option.icon}
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              {option.name}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Estimated delivery: {option.estimated}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-bold ${option.price === "FREE" ? 'text-green-600' : 'text-gray-900 dark:text-white'}`}>
                            {option.price}
                          </div>
                          {selectedShipping === option.id && (
                            <div className="text-xs text-[#01A49E] font-medium">
                              Selected
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-white rounded-2xl shadow-lg p-6 dark:bg-gray-800">
                <div className="flex items-center gap-3 mb-6">
                  <CreditCard className="text-[#01A49E]" size={24} />
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Payment Information
                  </h2>
                  <div className="flex-1 flex justify-end items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Lock size={14} />
                    <span>Secure SSL encryption</span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="md:col-span-2">
                    <Input
                    aria-label="Card Number"
                      label="Card Number"
                      placeholder="1234 5678 9012 3456"
                      value={paymentInfo.cardNumber}
                      onChange={(e) => handleCardNumberChange(e.target.value)}
                      maxLength={19}
                      required
                    />
                  </div>
                  <Input
                  aria-label="Name on Card"
                    label="Name on Card"
                    placeholder="John Doe"
                    value={paymentInfo.cardName}
                    onChange={(e) => handlePaymentChange('cardName', e.target.value)}
                    required
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      aria-label="Expiry Date"
                      placeholder="MM/YY"
                      value={paymentInfo.expiryDate}
                      onChange={(e) => handleExpiryChange(e.target.value)}
                      maxLength={5}
                      required
                    />
                    <Input
                      aria-label="CVV"
                      type="password"
                      placeholder="123"
                      value={paymentInfo.cvv}
                      onChange={(e) => handlePaymentChange('cvv', e.target.value.replace(/\D/g, ''))}
                      maxLength={4}
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreeToTerms}
                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                    className="rounded border-gray-300 text-[#01A49E] focus:ring-[#01A49E]"
                    required
                  />
                  <label htmlFor="terms" className="text-sm text-gray-600 dark:text-gray-300">
                    I agree to the <a href="/terms" className="text-[#01A49E] hover:underline">Terms and Conditions</a> and <a href="/privacy" className="text-[#01A49E] hover:underline">Privacy Policy</a>
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8 dark:bg-gray-800">
                <h2 className="text-xl font-bold text-gray-900 mb-6 dark:text-white">
                  Order Summary
                </h2>

                {/* Cart Items Preview */}
                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-3 dark:text-white">
                    Items ({cart.length})
                  </h3>
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 dark:bg-gray-700">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-contain p-1"
                          />
                        </div>
                        <div className="flex-grow min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate dark:text-white">
                            {item.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Qty: {item.quantity} × ${item.price.toFixed(2)}
                          </p>
                        </div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                    <span className="font-medium dark:text-white">${totals.subtotal}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                    <span className={totals.hasFreeShipping ? "text-green-600 font-medium dark:text-green-400" : "font-medium dark:text-white"}>
                      {totals.hasFreeShipping ? "FREE" : `$${totals.shipping}`}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Tax (8%)</span>
                    <span className="font-medium dark:text-white">${totals.tax}</span>
                  </div>

                  <div className="border-t pt-3 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900 dark:text-white">Total</span>
                      <div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          ${totals.total}
                        </div>
                        {totals.hasFreeShipping && (
                          <div className="text-green-600 text-sm font-medium dark:text-green-400">
                            Free Shipping Applied
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Security Badge */}
                <div className="mb-6 p-4 bg-gray-50 rounded-xl dark:bg-gray-700">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Secure Checkout
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Your payment information is encrypted
                      </p>
                    </div>
                  </div>
                </div>

                {/* Place Order Button */}
                <Button
                  onClick={handlePlaceOrder}
                  icon={<ArrowRight />}
                  iconPosition="right"
                  disabled={cart.length === 0 || isSubmitting}
                  loading={isSubmitting}
                  variant="teal"
                  fullWidth
                  size="large"
                >
                  {isSubmitting ? "Processing..." : "Place Order"}
                </Button>

                {/* Guarantee */}
                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    30-day money-back guarantee • 24/7 customer support
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutPage;