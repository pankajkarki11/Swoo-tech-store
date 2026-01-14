import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  User,
  AlertCircle,
  RefreshCw,
  Loader2,
  Sparkles,
  History,
  Shield,
  Database,
  Globe,
  Smartphone,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "../../contexts/AuthContext";

const ClientLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
      
    }
  }, [isAuthenticated, navigate]);

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
    setIsLoading(true);

    try {
      const credentials = {
        username: username,
        password: password,
      };

      const result = await login(credentials);
      if (!result.success) {
        toast.error("wrong username or password");
        throw new Error("Wrong username or password");
      }
      // Clear form
      setUsername("");
      setPassword("");
     toast.success(
  "Login successful!",  
 );
 
      setTimeout(() => {
      navigate("/");
      
    }, 1000);
    
    } catch (error) {
      setError(error.message);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  // Use demo account
  const useDemoAccount = (user, pass) => {
    setUsername(user);
    setPassword(pass);
  };

  return (
    <div className="min-h-screen bg-white font-sans relative flex items-center justify-center p-4 dark:bg-gray-900">
      <div className="w-full max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-stretch bg-white rounded-3xl shadow-2xl overflow-hidden min-h-[85vh] dark:bg-gray-900/5 dark:shadow-white dark:shadow-sm">
          {/* Left Side - Login Form */}
          <div className="lg:w-4/3 w-full flex items-center justify-center p-6 md:p-8 lg:p-12 dark:from-gray-900 dark:to-gray-800">
            <div className="w-full max-w-md mx-auto">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-4">
                  <div className="ml-4">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                      LOGIN
                    </h1>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2 dark:text-gray-200">
                  Welcome Back!
                </h2>
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
                      data-testid="username-input"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#01A49E]/30 focus:border-[#01A49E] transition text-base bg-gray-50/50 dark:bg-white"
                        placeholder="Enter your username"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-white">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-[#01A49E]" />
                      </div>
                      <input
                      data-testid="password-input"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-12 pr-12 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#01A49E]/30 focus:border-[#01A49E] transition text-base bg-gray-50/50 dark:bg-white"
                        placeholder="Enter your password"
                        required
                        disabled={isLoading}
                      />
                      <button
                      data-testid="toggle-password-button"
                        type="button"
                        className="absolute inset-y-0 right-0 pr-4 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-500 hover:text-[#01A49E] transition" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-500 hover:text-[#01A49E] transition" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                  data-testid="login-button"
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#01A49E] to-[#01857F] hover:from-[#01857F] hover:to-[#016F6B] text-white py-3.5 px-4 rounded-xl font-semibold hover:shadow-xl transition-all duration-300 flex items-center justify-center shadow-lg hover:scale-[1.02] group disabled:opacity-70 disabled:cursor-not-allowed"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                  <div 
                  
                  className="text-center pt-2">
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

                <div className="mt-10 pt-8 border-t border-gray-200">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="h-5 w-5 text-yellow-500" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Try These Accounts
                    </h3>
                  </div>

                  <div className="space-y-3"
                 
                  data-testid="demo-accounts">
                    {demoCredentials.map((cred, index) => (
                      <button
                      // disabled
                      data-testid="demo-account-button"
                        key={index}
                        onClick={() =>
                          useDemoAccount(cred.username, cred.password)
                        }
                     
                        disabled={isLoading}
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
              </div>             
            </div>
          </div>

          <div
            className="
  lg:w-1/2 w-full relative bg-gradient-to-br from-blue-50/80 to-teal-50/80 dark:from-gray-900 dark:to-gray-800p-8 md:p-10 lg:p-12 flex flex-col justify-between
"
          >
            <div className="relative z-10">
              <div className="mb-8">               
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Never Lose Your Cart
                  <br />
                  <span className="text-[#01A49E]">With Account Sync</span>
                </h2>             
                <p className="text-gray-700 text-lg dark:text-white">
                  Login to save your shopping cart, access it from any device,
                  and continue shopping where you left off.
                </p>                
              </div>

              {/* Features List */}
              <div className="space-y-6 mb-8 dark:text-white">
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
                    <p className="font-semibold mb-2">Real API Connection</p>
                    <p className="text-sm opacity-90">
                      Your cart is automatically saved and synced with the
                      FakeStoreAPI.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Branding */}
            <div className="relative z-10 mt-8 pt-8 border-t border-gray-200/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-900 font-bold dark:text-white">
                    SWOO TECH MART
                  </p>
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
