import  { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import {
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  User,
  AlertCircle,
  ShoppingBag,
  RefreshCw,
  Loader2,
  Sparkles,
  History,
  Shield,
  Database,
  Globe,
  Smartphone,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const ClientLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastUsername, setToastUsername] = useState("");
  const [apiCartInfo, setApiCartInfo] = useState(null);
  const [authMode, setAuthMode] = useState("api"); // 'api' or 'demo'

  const navigate = useNavigate();
  const location = useLocation();
  const { login, isSyncingCart, cartSyncMessage, isAuthenticated, isDemoUser } =
    useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const demoCredentials = [
    {
      username: "johnd",
      password: "m38rmF$",
      name: "John Doe",
      description: "Regular customer",
      avatarColor: "bg-blue-500",
    },
    {
      username: "mor_2314",
      password: "83r5^_",
      name: "Morris",
      description: "Frequent shopper",
      avatarColor: "bg-purple-500",
    },
    {
      username: "kevinryan",
      password: "kev02937@",
      name: "Kevin Ryan",
      description: "VIP member",
      avatarColor: "bg-green-500",
    },
  ];

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setShowToast(false);
    setApiCartInfo(null);
    setIsLoading(true);

    try {
      const credentials = {
        authSource: authMode,
        username: username,
        password: password,
        email: authMode === "demo" ? `${username}@demo.com` : undefined,
      };

      const result = await login(credentials);

      if (!result.success) {
        throw new Error(result.error || "Login failed");
      }

      setToastUsername(result.user.firstname || result.user.name || username);

      // Show API cart info if available
      if (result.apiCarts && result.apiCarts.length > 0) {
        const totalItems = result.apiCarts.reduce(
          (sum, cart) => sum + (cart.products?.length || 0),
          0
        );

        setApiCartInfo({
          totalCarts: result.apiCarts.length,
          totalItems: totalItems,
        });
      }

      setShowToast(true);

      // Clear form
      setUsername("");
      setPassword("");

      // Redirect after delay
      setTimeout(() => {
        navigate("/", { replace: true });
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
    setAuthMode("api");
  };

  const useQuickDemo = () => {
    setUsername("demo_user");
    setPassword("");
    setAuthMode("demo");
    setTimeout(() => {
      handleSubmit(new Event("submit"));
    }, 100);
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

  return (
    <div className="min-h-screen bg-white font-sans relative flex items-center justify-center p-4 dark:bg-gray-900">
      {/* Success Toast */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-5 rounded-xl shadow-2xl max-w-md border-l-4 border-l-emerald-700">
            <div className="flex items-center">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-2 mr-4">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm opacity-95 mb-1">Login Successful!</p>
                <p className="text-lg font-bold">
                  Welcome back, {toastUsername}!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-stretch bg-white rounded-3xl shadow-2xl overflow-hidden min-h-[85vh] dark:bg-gray-900/5 dark:shadow-white dark:shadow-sm">
          {/* Left Side - Login Form */}
          <div className="lg:w-1/2 w-full flex items-center justify-center p-6 md:p-8 lg:p-12 dark:from-gray-900 dark:to-gray-800">
            <div className="w-full max-w-md mx-auto">
              {/* Auth Mode Selector */}
            

              <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-4">
                  <div className="ml-4">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">LOGIN</h1>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2 dark:text-gray-200">
                  Welcome Back!
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {authMode === "api"
                    ? "Sign in to your account"
                    : "Try our demo mode for offline testing"}
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-8 dark:bg-gray-800">
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
                    <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-white">
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
                        className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#01A49E]/30 focus:border-[#01A49E] transition text-base bg-gray-50/50 dark:bg-white"
                        placeholder="Enter your username"
                        required
                        disabled={isLoading || isSyncingCart}
                      />
                    </div>
                  </div>

                  {authMode === "api" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-white">
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
                          className="w-full pl-12 pr-12 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#01A49E]/30 focus:border-[#01A49E] transition text-base bg-gray-50/50 dark:bg-white"
                          placeholder="Enter your password"
                          required
                          disabled={isLoading || isSyncingCart}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-4 flex items-center"
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
                  )}

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

                 

                  {/* Sign Up Link */}
                  <div className="text-center pt-2">
                    <p className="text-gray-600 dark:text-white">
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

                {/* API Demo Accounts Section */}
                {authMode === "api" && (
                  <div className="mt-10 pt-8 border-t border-gray-200">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="h-5 w-5 text-yellow-500" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Try These Accounts
                      </h3>
                    </div>

                    <div className="space-y-3">
                      {demoCredentials.map((cred, index) => (
                        <button
                          key={index}
                          onClick={() =>
                            useDemoAccount(cred.username, cred.password)
                          }
                          disabled={isLoading || isSyncingCart}
                          className="w-full text-left bg-white hover:from-gray-100 hover:to-gray-200 text-gray-800 py-3 px-4 rounded-lg transition text-sm font-medium border border-gray-200 hover:border-gray-300 disabled:opacity-50 group dark:bg-gray-400 dark:hover:bg-gray-500 "
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 ${cred.avatarColor} rounded-full flex items-center justify-center text-white font-medium`}
                            >
                              {cred.name.charAt(0)}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">{cred.name}</div>
                              <div className="text-gray-500 text-xs dark:text-gray-800">
                                {cred.description}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-gray-400 dark:text-gray-800">
                                Click to use
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Side - Features */}
         <div className="
  lg:w-1/2 w-full relative
  bg-gradient-to-br
  from-blue-50/80 to-teal-50/80
  dark:from-gray-900 dark:to-gray-800
  p-8 md:p-10 lg:p-12
  flex flex-col justify-between
">

            <div className="relative z-10">
              <div className="mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  {authMode === "api"
                    ? "Never Lose Your Cart"
                    : "Try Risk-Free Demo"}
                  <br />
                  <span className="text-[#01A49E]">
                    {authMode === "api"
                      ? "With Account Sync"
                      : "Explore All Features"}
                  </span>
                </h2>
                <p className="text-gray-700 text-lg dark:text-white">
                  {authMode === "api"
                    ? "Login to save your shopping cart, access it from any device, and continue shopping where you left off."
                    : ""}
                </p>
              </div>

              {/* Features List */}
              <div className="space-y-6 mb-8 dark:text-white">
                {(authMode === "api"
                  ? [
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
                    ]
                  : [
                      
                    ]
                ).map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <div className={`${feature.color} p-3 rounded-xl mr-4`}>
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 text-sm dark:text-gray-300">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mode Info Card */}
              <div className="bg-gradient-to-r from-[#01A49E] to-[#018A85] rounded-2xl p-6 text-white">
                <div className="flex items-center">
                  <div className="bg-white/20 p-3 rounded-lg mr-4">
                   
                      <Database className="h-6 w-6" />
                   
                   
                  </div>
                  <div>
                    <p className="font-semibold mb-2">
                      
                       Real API Connection
                     
                    </p>
                    <p className="text-sm opacity-90">
                     
                       Your cart is automatically saved and synced with the FakeStoreAPI.
                       
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Branding */}
            <div className="relative z-10 mt-8 pt-8 border-t border-gray-200/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-900 font-bold dark:text-white">SWOO TECH MART</p>
                  <p className="text-gray-400 text-sm dark:text-white">
                  
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

export default ClientLogin;
