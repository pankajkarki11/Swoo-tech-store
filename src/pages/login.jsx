import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Smartphone,
  Monitor,
  Headphones,
  Camera,
  Search,
  ChevronDown,
  ShoppingCart,
  User,
  Menu,
  X,
  House,
  ChartBarStacked,
  Truck,
  HandFist,
  Undo2,
  Star,
} from "lucide-react";

const EcommerceLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // State for login status
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [token, setToken] = useState("");

  // Toast notification state
  const [showToast, setShowToast] = useState(false);

  const navigate = useNavigate();

  // Demo credentials for easy testing
  const demoCredentials = [
    { username: "mor_2314", password: "83r5^_" },
    { username: "johnd", password: "m38rmF$" },
  ];

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload

    // Clear previous messages
    setSuccessMessage("");
    setErrorMessage("");
    setToken("");
    setShowToast(false);

    // Show loading
    setIsLoading(true);

    try {
      // Send login request to FakeStoreAPI
      const response = await fetch("https://fakestoreapi.com/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });

      // Check if response is ok
      if (!response.ok) {
        throw new Error("Login failed. Check your username and password.");
      }

      // Get the response data (contains token)
      const data = await response.json();

      // Show success message in toast
      setSuccessMessage(`Login successful! Welcome ${username}`);
      setToken(data.token);
      setShowToast(true);

      // Clear form
      setUsername("");
      setPassword("");

      // Redirect to home page after 2 seconds
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      // Show error message
      setErrorMessage(`❌ ${error.message}`);
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

  // Auto-hide toast after 5 seconds
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  return (
    <div className="min-h-screen bg-gray-50 bg-cover bg-center font-sans">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center justify-between max-w-md">
            <div className="flex items-center">
              <div className="bg-green-600 rounded-full p-1 mr-3">
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
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              </div>
              <div>
                <p className="font-semibold">Login Successful!</p>
                <p className="text-sm opacity-90">
                  Welcome {username}. Redirecting to homepage...
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowToast(false)}
              className="ml-4 text-white hover:text-gray-200"
            >
              <svg
                className="w-4 h-4"
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
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row items-center justify-between">
          {/* Left Column - Login Form */}
          <div className="lg:w-1/2 w-full max-w-md mx-auto lg:mx-0">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Welcome Back
                </h2>
                <p className="text-gray-600">
                  Login to your account to continue shopping
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-[#01A49E]" />
                    </div>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-[#01A49E]" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-[#01A49E]" />
                      ) : (
                        <Eye className="h-5 w-5 text-[#01A49E]" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="remember"
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-green-300 rounded"
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
                    className="text-sm text-blue-600 hover:text-red-800"
                  >
                    Forgot password?
                  </a>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  className="w-full bg-[#01A49E] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#018A85] transition duration-200 flex items-center justify-center"
                  disabled={isLoading}
                >
                  {isLoading ? "Logging in..." : "Login"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>

                {successMessage && !showToast && (
                  <div className="mt-4 p-4 bg-green-100 text-green-800 rounded-lg">
                    <p>{successMessage}</p>
                  </div>
                )}

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">
                      Or continue with
                    </span>
                  </div>
                </div>

                {/* Social Login */}
                <div className="grid grid-cols-2 gap-4">
                  <button className="flex items-center gap-2 border p-2 rounded-lg hover:bg-gray-100">
                    <img
                      src="https://www.gstatic.com/images/branding/product/1x/gsa_64dp.png"
                      alt="Google"
                      className="w-5 h-5"
                    />
                    <span className="text-bol">Google</span>
                  </button>

                  <button className="flex items-center gap-2 border p-2 rounded-lg hover:bg-gray-100">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png"
                      alt="Facebook"
                      className="w-5 h-5"
                    />
                    <span>Facebook</span>
                  </button>
                </div>

                {/* Sign Up Link */}
                <div className="text-center">
                  <p className="text-gray-600">
                    Don't have an account?{" "}
                    <a
                      href="#"
                      className="text-[#01A49E] font-semibold hover:text-blue-800"
                    >
                      Sign up here
                    </a>
                  </p>
                </div>
              </form>

              {/* Demo Accounts Section */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Try these demo accounts:
                </h3>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {demoCredentials.map((cred, index) => (
                    <button
                      key={index}
                      onClick={() =>
                        useDemoAccount(cred.username, cred.password)
                      }
                      className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-lg transition text-sm"
                    >
                      {cred.username}
                    </button>
                  ))}
                </div>
                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  <p>
                    <strong>Username:</strong> mor_2314
                  </p>
                  <p>
                    <strong>Password:</strong> 83r5^_
                  </p>
                </div>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="mt-4 p-4 bg-red-100 text-red-800 rounded-lg">
                  {errorMessage}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Features/Info */}
          <div className="lg:w-1/2 w-full mt-12 lg:mt-0 lg:pl-12 bg-white p-8 rounded-2xl shadow-sm">
            <div className="max-w-xl">
              {/* Features Grid */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-lg">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Smartphone className="h-6 w-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-lg mb-2">
                    Latest Tech Products
                  </h4>
                  <p className="text-gray-600">
                    Access to the newest smartphones, laptops, and gadgets at
                    competitive prices.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <Monitor className="h-6 w-6 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-lg mb-2">24/7 Support</h4>
                  <p className="text-gray-600">
                    Round-the-clock customer service for all your tech needs and
                    inquiries.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <Headphones className="h-6 w-6 text-purple-600" />
                  </div>
                  <h4 className="font-semibold text-lg mb-2">Fast Delivery</h4>
                  <p className="text-gray-600">
                    Same-day delivery available in KTM. Free shipping on orders
                    over Rs.500
                  </p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                    <Camera className="h-6 w-6 text-orange-600" />
                  </div>
                  <h4 className="font-semibold text-lg mb-2">
                    Authentic Products
                  </h4>
                  <p className="text-gray-600">
                    100% genuine products with manufacturer warranty and easy
                    returns.
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="bg-gradient-to-r from-[#01A49E] to-[#016F6B] rounded-2xl p-8 text-white">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-3xl font-bold mb-1">50K+</div>
                    <div className="text-blue-100 text-sm">Happy Customers</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold mb-1">10K+</div>
                    <div className="text-blue-100 text-sm">Products</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold mb-1">24/7</div>
                    <div className="text-blue-100 text-sm">Support</div>
                  </div>
                </div>
                <p className="text-center mt-6 text-blue-100">
                  Join thousands of satisfied customers shopping at SWOO TECH
                  MART
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EcommerceLogin;

// import React, { useState } from "react";
// import {
//   Mail,
//   Lock,
//   Eye,
//   EyeOff,
//   ArrowRight,
//   Smartphone,
//   Monitor,
//   Headphones,
//   Camera,
//   Search,
//   ChevronDown,
//   ShoppingCart,
//   User,
//   Menu,
//   X,
//   House,
//   ChartBarStacked,
//   Truck,
//   HandFist,
//   Undo2,
//   Star,
// } from "lucide-react";

// const EcommerceLogin = () => {
//   const [showPassword, setShowPassword] = useState(false);
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");

//   // State for login status
//   const [isLoading, setIsLoading] = useState(false);
//   const [successMessage, setSuccessMessage] = useState("");
//   const [errorMessage, setErrorMessage] = useState("");
//   const [token, setToken] = useState("");

//   // Demo credentials for easy testing
//   const demoCredentials = [
//     { username: "mor_2314", password: "83r5^_" },
//     { username: "johnd", password: "m38rmF$" },
//   ];

//   // Handle form submission
//   const handleSubmit = async (e) => {
//     e.preventDefault(); // Prevent page reload

//     // Clear previous messages
//     setSuccessMessage("");
//     setErrorMessage("");
//     setToken("");

//     // Show loading
//     setIsLoading(true);

//     try {
//       // Send login request to FakeStoreAPI
//       const response = await fetch("https://fakestoreapi.com/auth/login", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           username: username,
//           password: password,
//         }),
//       });

//       // Check if response is ok
//       if (!response.ok) {
//         throw new Error("Login failed. Check your username and password.");
//       }

//       // Get the response data (contains token)
//       const data = await response.json();

//       // Show success message
//       setSuccessMessage(`✅ Login successful! Welcome ${username}`);
//       setToken(data.token);

//       // Clear form
//       setUsername("");
//       setPassword("");
//     } catch (error) {
//       // Show error message
//       setErrorMessage(`❌ ${error.message}`);
//     } finally {
//       // Hide loading
//       setIsLoading(false);
//     }
//   };

//   // Use demo account
//   const useDemoAccount = (user, pass) => {
//     setUsername(user);
//     setPassword(pass);
//   };

//   // Copy token to clipboard
//   const copyToken = () => {
//     navigator.clipboard.writeText(token);
//     alert("Token copied to clipboard!");
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 bg-cover bg-center font-sans">
//       <div className="container mx-auto px-4 py-8">
//         <div className="flex flex-col lg:flex-row items-center justify-between">
//           {/* Left Column - Login Form */}
//           <div className="lg:w-1/2 w-full max-w-md mx-auto lg:mx-0">
//             <div className="bg-white rounded-2xl shadow-lg p-8">
//               <div className="text-center mb-8">
//                 <h2 className="text-3xl font-bold text-gray-900 mb-2">
//                   Welcome Back
//                 </h2>
//                 <p className="text-gray-600">
//                   Login to your account to continue shopping
//                 </p>
//               </div>

//               <form onSubmit={handleSubmit} className="space-y-6">
//                 {/* Email Field */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Email Address
//                   </label>
//                   <div className="relative">
//                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                       <Mail className="h-5 w-5 text-[#01A49E]" />
//                     </div>
//                     <input
//                       type="text"
//                       value={username}
//                       onChange={(e) => setUsername(e.target.value)}
//                       className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
//                       placeholder="Enter your email"
//                       required
//                     />
//                   </div>
//                 </div>

//                 {/* Password Field */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Password
//                   </label>
//                   <div className="relative">
//                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                       <Lock className="h-5 w-5 text-[#01A49E]" />
//                     </div>
//                     <input
//                       type={showPassword ? "text" : "password"}
//                       value={password}
//                       onChange={(e) => setPassword(e.target.value)}
//                       className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
//                       placeholder="Enter your password"
//                       required
//                     />
//                     <button
//                       type="button"
//                       className="absolute inset-y-0 right-0 pr-3 flex items-center"
//                       onClick={() => setShowPassword(!showPassword)}
//                     >
//                       {showPassword ? (
//                         <EyeOff className="h-5 w-5 text-[#01A49E]" />
//                       ) : (
//                         <Eye className="h-5 w-5 text-[#01A49E]" />
//                       )}
//                     </button>
//                   </div>
//                 </div>

//                 {/* Remember Me & Forgot Password */}
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center">
//                     <input
//                       type="checkbox"
//                       id="remember"
//                       className="h-4 w-4 text-green-600 focus:ring-green-500 border-green-300 rounded"
//                     />
//                     <label
//                       htmlFor="remember"
//                       className="ml-2 text-sm text-gray-700"
//                     >
//                       Remember me
//                     </label>
//                   </div>
//                   <a
//                     href="#"
//                     className="text-sm text-blue-600 hover:text-red-800"
//                   >
//                     Forgot password?
//                   </a>
//                 </div>

//                 {/* Login Button */}
//                 <button
//                   type="submit"
//                   className="w-full bg-[#01A49E] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#018A85] transition duration-200 flex items-center justify-center"
//                   disabled={isLoading}
//                 >
//                   {isLoading ? "Logging in..." : "Login"}
//                   <ArrowRight className="ml-2 h-5 w-5" />
//                 </button>

//                 {successMessage && (
//                   <div className="mt-4 p-4 bg-green-100 text-green-800 rounded-lg">
//                     <p>{successMessage}</p>
//                   </div>
//                 )}

//                 {/* Divider */}
//                 <div className="relative">
//                   <div className="absolute inset-0 flex items-center">
//                     <div className="w-full border-t border-gray-300"></div>
//                   </div>
//                   <div className="relative flex justify-center text-sm">
//                     <span className="px-2 bg-white text-gray-500">
//                       Or continue with
//                     </span>
//                   </div>
//                 </div>

//                 {/* Social Login */}
//                 <div className="grid grid-cols-2 gap-4">
//                   <button className="flex items-center gap-2 border p-2 rounded-lg hover:bg-gray-100">
//                     <img
//                       src="https://www.gstatic.com/images/branding/product/1x/gsa_64dp.png"
//                       alt="Google"
//                       className="w-5 h-5"
//                     />
//                     <span className="text-bol">Google</span>
//                   </button>

//                   <button className="flex items-center gap-2 border p-2 rounded-lg hover:bg-gray-100">
//                     <img
//                       src="https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png"
//                       alt="Facebook"
//                       className="w-5 h-5"
//                     />
//                     <span>Facebook</span>
//                   </button>
//                 </div>

//                 {/* Sign Up Link */}
//                 <div className="text-center">
//                   <p className="text-gray-600">
//                     Don't have an account?{" "}
//                     <a
//                       href="#"
//                       className="text-[#01A49E] font-semibold hover:text-blue-800"
//                     >
//                       Sign up here
//                     </a>
//                   </p>
//                 </div>
//               </form>

//               {/* Demo Accounts Section */}
//               <div className="mt-8 pt-6 border-t border-gray-200">
//                 <h3 className="text-lg font-semibold text-gray-900 mb-4">
//                   Try these demo accounts:
//                 </h3>
//                 <div className="grid grid-cols-2 gap-3 mb-4">
//                   {demoCredentials.map((cred, index) => (
//                     <button
//                       key={index}
//                       onClick={() =>
//                         useDemoAccount(cred.username, cred.password)
//                       }
//                       className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-lg transition text-sm"
//                     >
//                       {cred.username}
//                     </button>
//                   ))}
//                 </div>
//                 <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
//                   <p>
//                     <strong>Username:</strong> mor_2314
//                   </p>
//                   <p>
//                     <strong>Password:</strong> 83r5^_
//                   </p>
//                 </div>
//               </div>

//               {/* Success Message */}

//               {/* Error Message */}
//               {errorMessage && (
//                 <div className="mt-4 p-4 bg-red-100 text-red-800 rounded-lg">
//                   {errorMessage}
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Right Column - Features/Info */}
//           <div className="lg:w-1/2 w-full mt-12 lg:mt-0 lg:pl-12 bg-white p-8 rounded-2xl shadow-sm">
//             <div className="max-w-xl">
//               {/* Features Grid */}
//               <div className="grid md:grid-cols-2 gap-6 mb-8">
//                 <div className="bg-white p-6 rounded-xl shadow-lg">
//                   <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
//                     <Smartphone className="h-6 w-6 text-blue-600" />
//                   </div>
//                   <h4 className="font-semibold text-lg mb-2">
//                     Latest Tech Products
//                   </h4>
//                   <p className="text-gray-600">
//                     Access to the newest smartphones, laptops, and gadgets at
//                     competitive prices.
//                   </p>
//                 </div>

//                 <div className="bg-white p-6 rounded-xl shadow-md">
//                   <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
//                     <Monitor className="h-6 w-6 text-green-600" />
//                   </div>
//                   <h4 className="font-semibold text-lg mb-2">24/7 Support</h4>
//                   <p className="text-gray-600">
//                     Round-the-clock customer service for all your tech needs and
//                     inquiries.
//                   </p>
//                 </div>

//                 <div className="bg-white p-6 rounded-xl shadow-lg">
//                   <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
//                     <Headphones className="h-6 w-6 text-purple-600" />
//                   </div>
//                   <h4 className="font-semibold text-lg mb-2">Fast Delivery</h4>
//                   <p className="text-gray-600">
//                     Same-day delivery available in KTM. Free shipping on orders
//                     over Rs.500
//                   </p>
//                 </div>

//                 <div className="bg-white p-6 rounded-xl shadow-lg">
//                   <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
//                     <Camera className="h-6 w-6 text-orange-600" />
//                   </div>
//                   <h4 className="font-semibold text-lg mb-2">
//                     Authentic Products
//                   </h4>
//                   <p className="text-gray-600">
//                     100% genuine products with manufacturer warranty and easy
//                     returns.
//                   </p>
//                 </div>
//               </div>

//               {/* Stats */}
//               <div className="bg-gradient-to-r from-[#01A49E] to-[#016F6B] rounded-2xl p-8 text-white">
//                 <div className="grid grid-cols-3 gap-4 text-center">
//                   <div>
//                     <div className="text-3xl font-bold mb-1">50K+</div>
//                     <div className="text-blue-100 text-sm">Happy Customers</div>
//                   </div>
//                   <div>
//                     <div className="text-3xl font-bold mb-1">10K+</div>
//                     <div className="text-blue-100 text-sm">Products</div>
//                   </div>
//                   <div>
//                     <div className="text-3xl font-bold mb-1">24/7</div>
//                     <div className="text-blue-100 text-sm">Support</div>
//                   </div>
//                 </div>
//                 <p className="text-center mt-6 text-blue-100">
//                   Join thousands of satisfied customers shopping at SWOO TECH
//                   MART
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default EcommerceLogin;
