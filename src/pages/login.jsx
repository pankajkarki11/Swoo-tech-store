// src/pages/Login.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  User,
  CheckCircle,
  Shield,
  Check,
  AlertCircle,
  ShoppingBag,
  RefreshCw,
  Loader2,
  Sparkles,
  LogIn,
  History,
  Smartphone,
  Globe,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import useApi from "../services/useApi";

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
  const [isMobile, setIsMobile] = useState(false);

  const navigate = useNavigate();
  const { login, isSyncingCart, cartSyncMessage, userCartsFromAPI } = useAuth();
  const { getCartCount, mergeWithUserCart } = useCart();
  const api = useApi();

  // Check for mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const demoCredentials = [
    {
      username: "johnd",
      password: "m38rmF$",
      name: "John Doe",
      userInfo: "User ID: 1",
      avatarColor: "bg-blue-500",
    },
    {
      username: "mor_2314",
      password: "83r5^_",
      name: "Morris",
      userInfo: "User ID: 2",
      avatarColor: "bg-purple-500",
    },
    {
      username: "kevinryan",
      password: "kev02937@",
      name: "Kevin Ryan",
      userInfo: "User ID: 3",
      avatarColor: "bg-green-500",
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

    setSuccessMessage("");
    setError("");
    setShowToast(false);
    setApiCartInfo(null);

    if (!username.trim()) {
      setError("Please enter your username");
      return;
    }

    if (!password.trim()) {
      setError("Please enter your password");
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(username, password);

      if (!result.success) {
        throw new Error(result.error || "Login failed");
      }

      setToastUsername(result.user.firstname || username);

      // Calculate API cart info
      let apiCartItems = 0;
      if (result.apiCarts && result.apiCarts.length > 0) {
        apiCartItems = result.apiCarts.reduce(
          (sum, cart) => sum + (cart.products?.length || 0),
          0
        );

        setApiCartInfo({
          totalCarts: result.apiCarts.length,
          totalItems: apiCartItems,
          recentCartDate: result.apiCarts[0]?.date,
          user: result.user,
        });
      }

      let successMsg = `Welcome back, ${result.user.firstname || username}!`;

      setSuccessMessage(successMsg);
      setShowToast(true);

      setUsername("");
      setPassword("");

      setTimeout(() => {
        navigate("/");
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 font-sans relative flex items-center justify-center p-4">
      {/* Success Toast */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-5 rounded-xl shadow-2xl flex items-center justify-between max-w-md border-l-4 border-l-emerald-700">
            <div className="flex items-center">
              <div>
                <p className=" text-sm opacity-95 mb-1">Login Successful !</p>
                <p className="text-lg font-bold ">{successMessage}</p>
              </div>
            </div>
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
              <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-4">
                  <div className="ml-4">
                    <h1 className="text-3xl font-bold text-gray-900">LOGIN</h1>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Welcome Back!
                </h2>
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
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign In
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
                      className="flex items-center justify-center gap-2 py-2.5 px-4 border border-gray-300 rounded-lg bg-white hover:bg-gray-100 transition"
                    >
                      <img
                        src="public\images\download.png"
                        alt="Google logo"
                        className="w-12 h-12"
                      />
                      <span className="text-gray-700 text-sm font-medium">
                        Google
                      </span>
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
                      Try These Demo Accounts
                    </h3>
                  </div>

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
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 ${cred.avatarColor} rounded-full flex items-center justify-center text-white font-medium`}
                          >
                            {cred.name.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{cred.name}</div>
                            <div className="text-gray-500 text-xs">
                              {cred.description}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-gray-400">
                              {cred.userInfo}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Features & Benefits */}
          <div className="lg:w-1/2 w-full relative bg-gradient-to-br from-blue-50/80 to-teal-50/80 p-8 md:p-10 lg:p-12 flex flex-col justify-between">
            {/* Background decorations */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#01A49E]/10 rounded-full translate-x-16 -translate-y-16"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#01857F]/10 rounded-full -translate-x-24 translate-y-24"></div>

            <div className="relative z-10">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                  { value: "50K+", label: "Customers", color: "bg-blue-500" },
                  { value: "10K+", label: "Products", color: "bg-purple-500" },
                  { value: "4.8★", label: "Rating", color: "bg-yellow-500" },
                ].map((stat, idx) => (
                  <div key={idx} className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </div>
                    <div className="text-gray-600 text-sm">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Main Content */}
              <div className="mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Never Lose Your Cart
                  <br />
                  <span className="text-[#01A49E]">With Account Sync</span>
                </h2>
                <p className="text-gray-700 text-lg">
                  Login to save your shopping cart, access it from any device,
                  and continue shopping where you left off.
                </p>
              </div>

              {/* Features List */}
              <div className="space-y-6 mb-8">
                {[
                  {
                    icon: History,
                    title: "Cart History",
                    description: "View and restore your previous carts",
                    color: "text-purple-600",
                  },
                  {
                    icon: RefreshCw,
                    title: "Auto-Sync",
                    description: "Cart automatically syncs across devices",
                    color: "text-blue-600",
                  },
                  {
                    icon: Shield,
                    title: "Secure Save",
                    description: "Your cart is securely saved",
                    color: "text-green-600",
                  },
                  {
                    icon: Smartphone,
                    title: "Multi-Device",
                    description: "Access your cart from any device",
                    color: "text-indigo-600",
                  },
                  {
                    icon: Globe,
                    title: "Anywhere Access",
                    description: "Shop from anywhere, anytime",
                    color: "text-cyan-600",
                  },
                ].map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <div className={`${feature.color} p-3 rounded-xl mr-4`}>
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
              <div className="bg-gradient-to-r from-[#01A49E] to-[#018A85] rounded-2xl p-6 text-white">
                <div className="flex items-center">
                  <div className="bg-white/20 p-3 rounded-lg mr-4">
                    <ShoppingBag className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold mb-2">
                      Seamless Shopping Experience
                    </p>
                    <p className="text-sm opacity-90">
                      Your cart is automatically saved and synced across all
                      your devices.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Branding */}
            <div className="relative z-10 mt-8 pt-8 border-t border-gray-200/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-900 font-bold">SWOO TECH MART</p>
                  <p className="text-gray-600 text-sm">
                    Smart Shopping, Seamless Sync
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
