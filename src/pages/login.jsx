import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  User,
  CheckCircle,
  Star,
  Shield,
  Truck,
  Gift,
  CreditCard,
  Package,
  Headphones,
  Check,
  AlertCircle,
  ShoppingBag,
  RefreshCw,
  Loader2,
  Sparkles,
  LogIn,
  Calendar,
  History,
  UserCheck,
  Award,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastUsername, setToastUsername] = useState("");
  const [cartItemCount, setCartItemCount] = useState(0);
  const [apiCartInfo, setApiCartInfo] = useState(null);

  const navigate = useNavigate();
  const { login, isSyncingCart, cartSyncMessage, userCartsFromAPI } = useAuth();
  const { getCartCount, mergeWithUserCart } = useCart();

  const demoCredentials = [
    {
      username: "johnd",
      password: "m38rmF$",
      name: "John Doe",
      description: "Has saved cart history with multiple items",
      userInfo: "User ID: 1 - Has multiple saved carts",
    },
    {
      username: "mor_2314",
      password: "83r5^_",
      name: "Morris",
      description: "Demo account with existing cart items",
      userInfo: "User ID: 2 - Cart sync demo",
    },
    {
      username: "kevinryan",
      password: "kev02937@",
      name: "Kevin Ryan",
      description: "Premium account with saved preferences",
      userInfo: "User ID: 3 - Test cart merging",
    },
  ];

  // Get current cart count
  useEffect(() => {
    const count = getCartCount();
    setCartItemCount(count);

    const handleCartUpdate = () => {
      setCartItemCount(getCartCount());
    };

    window.addEventListener("cartUpdated", handleCartUpdate);
    return () => window.removeEventListener("cartUpdated", handleCartUpdate);
  }, [getCartCount]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous messages
    setSuccessMessage("");
    setError("");
    setShowToast(false);
    setApiCartInfo(null);

    // Validate inputs
    if (!username.trim()) {
      setError("Please enter your username");
      return;
    }

    if (!password.trim()) {
      setError("Please enter your password");
      return;
    }

    // Show loading
    setIsLoading(true);

    try {
      const result = await login(username, password);

      if (!result.success) {
        throw new Error(result.error || "Login failed");
      }

      // Success - show toast
      setToastUsername(result.user.firstname || username);

      // Calculate API cart info
      let apiCartItems = 0;
      if (result.apiCarts && result.apiCarts.length > 0) {
        apiCartItems = result.apiCarts.reduce(
          (sum, cart) => sum + (cart.products?.length || 0),
          0
        );

        // Show API cart info
        setApiCartInfo({
          totalCarts: result.apiCarts.length,
          totalItems: apiCartItems,
          recentCartDate: result.apiCarts[0]?.date,
          user: result.user,
        });
      }

      // Set success message based on cart status
      let successMsg = `Welcome back, ${result.user.firstname || username}!`;
      if (cartItemCount > 0 && apiCartItems > 0) {
        successMsg = `Welcome back! Merged ${cartItemCount} local items with ${apiCartItems} saved items.`;
      } else if (cartItemCount > 0) {
        successMsg = `Welcome back! Your ${cartItemCount} cart items have been saved.`;
      } else if (apiCartItems > 0) {
        successMsg = `Welcome back! Loaded ${apiCartItems} saved items from your account.`;
      }

      setSuccessMessage(successMsg);
      setShowToast(true);

      // Clear form
      setUsername("");
      setPassword("");

      // Show success for 2 seconds, then redirect to cart page
      setTimeout(() => {
        navigate("/cart");
      }, 2000);
    } catch (error) {
      setError(error.message);
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Use demo account
  const useDemoAccount = (user, pass) => {
    setUsername(user);
    setPassword(pass);
  };

  // Auto-hide toast
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  // Handle forgot password
  const handleForgotPassword = () => {
    alert(
      "Password reset feature coming soon! For now, please use one of the demo accounts."
    );
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 font-sans relative flex items-center justify-center p-4 md:p-6 lg:p-8">
      {/* Success Toast */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-5 rounded-xl shadow-2xl flex items-center justify-between max-w-md border-l-4 border-l-emerald-700">
            <div className="flex items-center">
              <div className="bg-white rounded-full p-2 mr-4 shadow-lg">
                <CheckCircle className="h-7 w-7 text-green-600" />
              </div>
              <div>
                <p className="font-bold text-lg mb-1">
                  Welcome, {toastUsername}!
                </p>
                <div className="flex items-center">
                  <div className="h-1 w-8 bg-emerald-300 rounded-full mr-2"></div>
                  <p className="text-sm opacity-95">{successMessage}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="h-1 w-full bg-emerald-200 rounded-full overflow-hidden mt-1">
            <div className="h-full bg-emerald-700 rounded-full animate-progress-bar"></div>
          </div>
        </div>
      )}

      {/* Cart Sync Notification */}
      {isSyncingCart && (
        <div className="fixed bottom-4 right-4 z-50 animate-fade-in">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-4 rounded-xl shadow-2xl max-w-md border-l-4 border-l-indigo-700">
            <div className="flex items-center">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-2 mr-4">
                <RefreshCw className="h-5 w-5 text-white animate-spin" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm mb-1">Syncing Your Cart</p>
                <p className="text-xs opacity-95">
                  {cartSyncMessage || "Loading your saved cart items..."}
                </p>
              </div>
            </div>
            {cartItemCount > 0 && (
              <div className="mt-2 text-xs bg-white/10 px-2 py-1 rounded inline-block">
                {cartItemCount} item{cartItemCount !== 1 ? "s" : ""} in local
                cart
              </div>
            )}
          </div>
        </div>
      )}

      {/* API Cart Info Banner */}
      {apiCartInfo && (
        <div className="fixed bottom-24 right-4 z-50 animate-fade-in">
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-4 rounded-xl shadow-2xl max-w-md border-l-4 border-l-purple-700">
            <div className="flex items-start">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-2 mr-4">
                <History className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm mb-1">
                  Found Saved Cart History
                </p>
                <p className="text-xs opacity-95 mb-2">
                  {apiCartInfo.totalCarts} saved cart
                  {apiCartInfo.totalCarts !== 1 ? "s" : ""} with{" "}
                  {apiCartInfo.totalItems} items
                </p>
                <div className="flex items-center gap-2 text-xs">
                  <Calendar size={12} />
                  <span>
                    Most recent: {formatDate(apiCartInfo.recentCartDate)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-stretch bg-white rounded-3xl shadow-2xl overflow-hidden min-h-[85vh]">
          {/* Left Side - Login Form */}
          <div className="lg:w-1/2 w-full flex items-center justify-center p-6 md:p-8 lg:p-12">
            <div className="w-full max-w-md mx-auto">
              <div className="text-center mb-10">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#01A49E] to-[#01857F] rounded-xl flex items-center justify-center shadow-lg">
                    <LogIn className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <h1 className="text-2xl font-bold text-gray-900">
                      SWOO TECH MART
                    </h1>
                    <p className="text-gray-600 text-sm">Cart Sync Enabled</p>
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Welcome Back!
                </h2>
                <p className="text-gray-600">
                  Sign in to sync your cart across devices
                </p>

                {/* Cart Info Banner */}
                {cartItemCount > 0 && (
                  <div className="mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-lg p-3">
                    <div className="flex items-center justify-center gap-2 text-blue-700">
                      <ShoppingBag size={16} />
                      <span className="text-sm font-medium">
                        You have {cartItemCount} item
                        {cartItemCount !== 1 ? "s" : ""} in your local cart
                      </span>
                    </div>
                    <p className="text-xs text-blue-600 mt-1">
                      These will merge with your saved account items
                    </p>
                  </div>
                )}

                {/* Cart Sync Feature Badge */}
                <div className="mt-3 inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 rounded-full text-xs">
                  <Check size={12} />
                  <span>Automatic Cart Sync</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-8">
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start animate-shake">
                    <AlertCircle
                      className="text-red-500 mt-0.5 mr-3 flex-shrink-0"
                      size={20}
                    />
                    <span className="text-red-700">{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-[#01A49E]" />
                      </div>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#01A49E]/30 focus:border-[#01A49E] transition text-base bg-gray-50/50"
                        placeholder="Enter your username"
                        required
                        disabled={isLoading || isSyncingCart}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-[#01A49E]" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-12 pr-12 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#01A49E]/30 focus:border-[#01A49E] transition text-base bg-gray-50/50"
                        placeholder="Enter your password"
                        required
                        disabled={isLoading || isSyncingCart}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-4 flex items-center disabled:opacity-50"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading || isSyncingCart}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-500 hover:text-[#01A49E] transition" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-500 hover:text-[#01A49E] transition" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="remember"
                        className="h-4 w-4 text-[#01A49E] focus:ring-[#01A49E] border-gray-300 rounded"
                        disabled={isLoading || isSyncingCart}
                      />
                      <label
                        htmlFor="remember"
                        className="ml-2 text-sm text-gray-700"
                      >
                        Remember me
                      </label>
                    </div>
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-sm text-[#01A49E] font-medium hover:text-[#016F6B] transition disabled:opacity-50"
                      disabled={isLoading || isSyncingCart}
                    >
                      Forgot password?
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#01A49E] to-[#01857F] hover:from-[#01857F] hover:to-[#016F6B] text-white py-3.5 px-4 rounded-xl font-semibold hover:shadow-xl transition-all duration-300 flex items-center justify-center shadow-lg hover:scale-[1.02] group disabled:opacity-70 disabled:cursor-not-allowed"
                    disabled={isLoading || isSyncingCart}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                        Signing in...
                      </>
                    ) : isSyncingCart ? (
                      <>
                        <RefreshCw className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                        Syncing Cart...
                      </>
                    ) : (
                      <>
                        Sign In & Sync Cart
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-gray-500">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  {/* Social Login */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      className="flex items-center justify-center gap-3 border border-gray-300 p-3 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                      disabled={isLoading || isSyncingCart}
                    >
                      <img
                        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                        alt="Google"
                        className="w-5 h-5"
                      />
                      <span className="text-sm font-medium">Google</span>
                    </button>

                    <button
                      type="button"
                      className="flex items-center justify-center gap-3 border border-gray-300 p-3 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                      disabled={isLoading || isSyncingCart}
                    >
                      <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">f</span>
                      </div>
                      <span className="text-sm font-medium">Facebook</span>
                    </button>
                  </div>

                  {/* Sign Up Link */}
                  <div className="text-center pt-2">
                    <p className="text-gray-600">
                      Don't have an account?{" "}
                      <Link
                        to="/register"
                        className="text-[#01A49E] font-semibold hover:text-[#016F6B] transition"
                      >
                        Sign up now
                      </Link>
                    </p>
                  </div>
                </form>

                {/* Demo Accounts Section */}
                <div className="mt-10 pt-8 border-t border-gray-200">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="h-5 w-5 text-yellow-500" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Try demo accounts with saved carts
                    </h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    These accounts have pre-existing cart history to test the
                    sync feature:
                  </p>

                  <div className="space-y-3 mb-4">
                    {demoCredentials.map((cred, index) => (
                      <button
                        key={index}
                        onClick={() =>
                          useDemoAccount(cred.username, cred.password)
                        }
                        disabled={isLoading || isSyncingCart}
                        className="w-full text-left bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 text-gray-800 py-3 px-4 rounded-lg transition text-sm font-medium border border-gray-200 hover:border-gray-300 disabled:opacity-50 group"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                              <UserCheck className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium">{cred.name}</div>
                              <div className="text-gray-500 text-xs mt-0.5">
                                {cred.description}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-mono text-xs bg-gray-200 px-2 py-1 rounded">
                              {cred.username}
                            </div>
                            <div className="text-gray-400 text-xs mt-1">
                              {cred.userInfo}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <History className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-purple-800 text-sm font-medium">
                          Advanced Cart Sync
                        </p>
                        <p className="text-purple-600 text-xs mt-1">
                          • Merges local and saved carts automatically
                          <br />
                          • Preserves cart history with dates
                          <br />
                          • Syncs across all your devices
                          <br />• Saves cart to your account in real-time
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Features & Benefits */}
          <div className="lg:w-1/2 w-full relative bg-gradient-to-br from-blue-50/80 to-teal-50/80 p-8 md:p-10 lg:p-12 flex flex-col justify-between backdrop-blur-sm">
            {/* Background decorations */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-[#01A49E]/10 rounded-full -translate-x-16 -translate-y-16"></div>
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-[#01857F]/10 rounded-full translate-x-24 translate-y-24"></div>
            <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-[#01A49E]/5 to-[#01857F]/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>

            <div className="relative z-10">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-12">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/20 shadow-sm">
                  <div className="text-2xl font-bold text-gray-900">50K+</div>
                  <div className="text-gray-600 text-sm">Happy Customers</div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/20 shadow-sm">
                  <div className="text-2xl font-bold text-gray-900">10K+</div>
                  <div className="text-gray-600 text-sm">Products</div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/20 shadow-sm">
                  <div className="text-2xl font-bold text-gray-900">4.8★</div>
                  <div className="text-gray-600 text-sm">Avg Rating</div>
                </div>
              </div>

              {/* Main Content */}
              <div className="mb-8">
                <h2 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
                  Never Lose Your Cart
                  <br />
                  <span className="text-[#01A49E]">With Account Sync</span>
                </h2>
                <p className="text-gray-700 text-lg mb-8">
                  Login to save your shopping cart, access it from any device,
                  and continue shopping where you left off.
                </p>
              </div>

              {/* Features List */}
              <div className="space-y-6 mb-10">
                {[
                  {
                    icon: History,
                    title: "Cart History",
                    description:
                      "View and restore your previous carts with dates",
                    color: "bg-purple-100 text-purple-600",
                  },
                  {
                    icon: RefreshCw,
                    title: "Auto-Sync",
                    description:
                      "Cart automatically syncs across all your devices",
                    color: "bg-blue-100 text-blue-600",
                  },
                  {
                    icon: Shield,
                    title: "Secure Save",
                    description: "Your cart is securely saved to your account",
                    color: "bg-green-100 text-green-600",
                  },
                  {
                    icon: Calendar,
                    title: "Date Tracking",
                    description:
                      "See exactly when items were added to your cart",
                    color: "bg-orange-100 text-orange-600",
                  },
                  {
                    icon: Award,
                    title: "Smart Merge",
                    description: "Intelligently merges local and saved carts",
                    color: "bg-pink-100 text-pink-600",
                  },
                ].map((feature, index) => (
                  <div key={index} className="flex items-center group">
                    <div
                      className={`${feature.color} p-3 rounded-xl mr-4 group-hover:scale-110 transition-transform`}
                    >
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Testimonial */}
              <div className="bg-gradient-to-r from-[#01A49E] via-[#018A85] to-[#016F6B] rounded-2xl p-6 border border-white/20 shadow-lg">
                <div className="flex items-start">
                  <div className="bg-white p-3 rounded-lg mr-4">
                    <ShoppingBag className="h-6 w-6 text-[#01A49E]" />
                  </div>
                  <div>
                    <p className="text-white font-semibold mb-2">
                      How Cart Sync Works
                    </p>
                    <p className="text-white/90 text-sm">
                      1. Add items as guest → 2. Login to save → 3. Cart merges
                      automatically →<br />
                      4. Access from any device → 5. Continue shopping
                      seamlessly
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Branding */}
            <div className="relative z-10 mt-8 pt-8 border-t border-gray-200/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-900 font-bold text-lg">
                    SWOO TECH MART
                  </p>
                  <p className="text-gray-600 text-sm">
                    Smart Shopping, Seamless Sync
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Package className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="bg-teal-100 p-2 rounded-lg">
                    <CreditCard className="h-5 w-5 text-teal-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inline styles for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes progressBar {
          0% {
            width: 100%;
          }
          100% {
            width: 0%;
          }
        }

        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          10%,
          30%,
          50%,
          70%,
          90% {
            transform: translateX(-5px);
          }
          20%,
          40%,
          60%,
          80% {
            transform: translateX(5px);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-progress-bar {
          animation: progressBar 5s linear forwards;
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
