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
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");

  const [showToast, setShowToast] = useState(false);
  const [toastUsername, setToastUsername] = useState("");

  const navigate = useNavigate();
  const { login } = useAuth();

  const demoCredentials = [
    { username: "mor_2314", password: "83r5^_" },
    { username: "johnd", password: "m38rmF$" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload

    // Clear previous messages
    setSuccessMessage("");
    setError("");
    setShowToast(false);

    // Show loading
    setIsLoading(true);

    try {
      // Send login request using AuthContext login function
      const result = await login(username, password);

      if (!result.success) {
        throw new Error(result.error || "Login failed");
      }

      // Set toast username and show toast
      setToastUsername(username);
      setSuccessMessage(
        `Login successful! Welcome ${result.user?.firstname || username}`
      );
      setShowToast(true);

      // Clear form
      setUsername("");
      setPassword("");

      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (error) {
      // Show error message
      setError(`❌ ${error.message}`);
      console.error("Login error:", error);
    } finally {
      // Hide loading
      setIsLoading(false);
    }
  };

  // Use demo account
  const useDemoAccount = (user, pass) => {
    setUsername(user);
    setPassword(pass);
  };

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 font-sans relative flex items-center justify-center p-4 md:p-6 lg:p-8">
      {/* Enhanced Toast Notification */}
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
                  <p className="text-sm opacity-95">
                    Login successful. Redirecting...
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowToast(false)}
              className="ml-6 text-white hover:text-emerald-200 transition"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>

          {/* Progress bar for toast */}
          <div className="h-1 w-full bg-emerald-200 rounded-full overflow-hidden mt-1">
            <div className="h-full bg-emerald-700 rounded-full animate-progress-bar"></div>
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
                  <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center shadow-sm">
                    <span className="text-white font-bold text-3xl">S</span>
                  </div>
                  <div className="ml-4">
                    <h1 className="text-2xl font-bold text-gray-900">
                      SWOO TECH
                    </h1>
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Welcome Back!
                </h2>
                <p className="text-gray-600">
                  Sign in to access your account and continue shopping
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-8">
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
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
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-4 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
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
                      />
                      <label
                        htmlFor="remember"
                        className="ml-2 text-sm text-gray-700"
                      >
                        Remember me
                      </label>
                    </div>
                    <a
                      href="#"
                      className="text-sm text-[#01A49E] font-medium hover:text-[#016F6B] transition"
                    >
                      Forgot password?
                    </a>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#01A49E] hover:bg-[#33BDB7] text-white py-3.5 px-4 rounded-xl font-semibold hover:shadow-xl transition-all duration-300 flex items-center justify-center shadow-lg hover:scale-[1.02] group"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
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
                      className="flex items-center justify-center gap-3 border border-gray-300 p-3 rounded-lg hover:bg-gray-50 transition"
                    >
                      <img
                        src="https://www.gstatic.com/images/branding/product/1x/gsa_64dp.png"
                        alt="Google"
                        className="w-5 h-5"
                      />
                      <span className="text-sm font-medium">Google</span>
                    </button>

                    <button
                      type="button"
                      className="flex items-center justify-center gap-3 border border-gray-300 p-3 rounded-lg hover:bg-gray-50 transition"
                    >
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png"
                        alt="Facebook"
                        className="w-5 h-5"
                      />
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

                <div className="mt-10 pt-8 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Star className="h-5 w-5 mr-2 text-red-500" />
                    Try demo accounts
                  </h3>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {demoCredentials.map((cred, index) => (
                      <button
                        key={index}
                        onClick={() =>
                          useDemoAccount(cred.username, cred.password)
                        }
                        className="bg-gray-50 hover:bg-gray-100 text-gray-800 py-2.5 px-4 rounded-lg transition text-sm font-medium border border-gray-200 hover:border-gray-300"
                      >
                        {cred.username}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Features */}
          <div className="lg:w-1/2 w-full relative bg-gradient-to-br from-blue-50 to-teal-50 p-8 md:p-10 lg:p-12 flex flex-col justify-between">
            <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-16 -translate-y-16"></div>
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/5 rounded-full translate-x-24 translate-y-24"></div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-12 bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-sm">
                <div className="text-gray-900">
                  <div className="text-3xl font-bold">50K+</div>
                  <div className="text-sm opacity-90">Happy Customers</div>
                </div>
                <div className="text-gray-900">
                  <div className="text-3xl font-bold">10K+</div>
                  <div className="text-sm opacity-90">Products</div>
                </div>
                <div className="text-gray-900">
                  <div className="text-3xl font-bold">4.8★</div>
                  <div className="text-sm opacity-90">Avg Rating</div>
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  Discover Amazing Tech Products
                </h2>
                <p className="text-gray-700 text-lg mb-8">
                  Join thousands of customers shopping the latest electronics,
                  gadgets, and tech accessories with exclusive deals and premium
                  service.
                </p>
              </div>

              {/* Features List */}
              <div className="space-y-6 mb-10">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-2 rounded-lg mr-4">
                    <Shield className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="text-gray-900 font-medium">
                    100% Authentic & Genuine Products
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="bg-teal-100 p-2 rounded-lg mr-4">
                    <Truck className="h-5 w-5 text-teal-600" />
                  </div>
                  <span className="text-gray-900 font-medium">
                    Free Delivery Across Nepal
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="bg-purple-100 p-2 rounded-lg mr-4">
                    <Headphones className="h-5 w-5 text-purple-600" />
                  </div>
                  <span className="text-gray-900 font-medium">
                    24/7 Customer Support
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="bg-green-100 p-2 rounded-lg mr-4">
                    <CreditCard className="h-5 w-5 text-green-600" />
                  </div>
                  <span className="text-gray-900 font-medium">
                    Secure Payment Options
                  </span>
                </div>
              </div>

              {/* Testimonial/Call to Action */}
              <div className="bg-gradient-to-br from-[#01A49E] via-[#018A85] to-[#016F6B] rounded-2xl p-6 border border-white/20 shadow-lg">
                <div className="flex items-start">
                  <div className="bg-white p-2 rounded-lg mr-4">
                    <Gift className="h-6 w-6 text-[#01A49E]" />
                  </div>
                  <div>
                    <p className="text-white font-semibold mb-2">
                      Exclusive Member Benefits
                    </p>
                    <p className="text-white/80 text-sm">
                      Get 20% off your first order, early access to sales, and
                      priority customer support when you create an account.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Branding */}
            <div className="relative z-10 mt-8 pt-8 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-900 font-bold text-lg">
                    SWOO TECH MART
                  </p>
                  <p className="text-gray-600 text-sm">
                    Premium Tech Marketplace
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Package className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="bg-teal-100 p-2 rounded-lg">
                    <Check className="h-5 w-5 text-teal-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add custom CSS for animations */}
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

        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-progress-bar {
          animation: progressBar 5s linear forwards;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
