import React, { useState } from "react";
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
} from "lucide-react";

const EcommerceLogin = () => {
  const [showPassword, setShowPassword] = React.useState(false);
  // === START: NEW STATE VARIABLES FOR HEADER ===
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  // === END: NEW STATE VARIABLES FOR HEADER ===

  // === START: CATEGORIES DATA FOR DROPDOWN ===
  const categories = [
    {
      name: "Laptops & Computers",
      subcategories: [
        "Gaming Laptops",
        "Business Laptops",
        "Desktop PCs",
        "Monitors",
        "Accessories",
      ],
    },
    {
      name: "Smartphones & Tablets",
      subcategories: [
        "Android Phones",
        "iPhones",
        "iPads",
        "Android Tablets",
        "Accessories",
      ],
    },
    {
      name: "Audio & Headphones",
      subcategories: [
        "Wireless Earbuds",
        "Over-Ear Headphones",
        "Speakers",
        "Soundbars",
        "Gaming Headsets",
      ],
    },
    {
      name: "Gaming & VR",
      subcategories: [
        "Gaming Consoles",
        "VR Headsets",
        "Gaming Accessories",
        "Gaming Chairs",
        "Controllers",
      ],
    },
    {
      name: "Cameras & Photography",
      subcategories: [
        "DSLR Cameras",
        "Mirrorless Cameras",
        "Action Cameras",
        "Lenses",
        "Tripods",
      ],
    },
    {
      name: "Smart Home & IoT",
      subcategories: [
        "Smart Speakers",
        "Security Cameras",
        "Smart Lights",
        "Thermostats",
        "Home Automation",
      ],
    },
    {
      name: "Wearables",
      subcategories: [
        "Smart Watches",
        "Fitness Trackers",
        "Smart Glasses",
        "Health Monitors",
      ],
    },
    {
      name: "Networking",
      subcategories: [
        "Routers",
        "Modems",
        "Mesh Systems",
        "Network Storage",
        "Cables",
      ],
    },
    {
      name: "Office & Business",
      subcategories: [
        "Printers",
        "Scanners",
        "Projectors",
        "Office Furniture",
        "Conference Systems",
      ],
    },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log("Searching for:", searchQuery);
      // Implement actual search logic here
    }
  };
  // === END: CATEGORIES DATA FOR DROPDOWN ===

  return (
    <div className="min-h-screen bg-gray-150 bg-cover bg-center font-sans">
      {/* === START: UPDATED HEADER WITH SEARCH AND DROPDOWN === */}
      <header className="bg-[#01A49E] shadow-sm">
        <div className="container mx-auto px-4 py-4">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-4">
            {/* Logo and Mobile Menu Button */}
            <div className="flex items-center space-x-3">
              <button
                className="lg:hidden text-white"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-md">
                <span className="text-[#01A49E] font-bold text-2xl">S</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  SWOO TECH MART
                </h1>
                <p className="text-white/80 text-sm">KTM's PRIME Tech Store</p>
              </div>
            </div>

            {/* Search Bar - Desktop */}
            <div className="hidden lg:flex flex-1 max-w-2xl mx-8">
              <form onSubmit={handleSearch} className="w-full relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for products, brands, or categories..."
                  className="w-full px-6 py-3 pl-12 rounded-full border-0 focus:ring-2 focus:ring-red focus:ring-opacity-50 focus:outline-none bg-white/90 text-gray-900 placeholder-gray-500"
                />
                <button
                  type="submit"
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-red"
                >
                  <Search size={20} />
                </button>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded"></span>
                </div>
              </form>
            </div>

            {/* User Actions */}
            <div className="flex items-center space-x-4">
              <button className="hidden lg:flex items-center space-x-2 text-white hover:text-gray-200 transition">
                <User size={20} />
                <span>Pankaj</span>
              </button>
              <button className="relative text-white hover:text-gray-200 transition">
                <ShoppingCart size={24} />
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  3
                </span>
              </button>
              <button className="hidden lg:block bg-white text-[#01A49E] px-6 py-2 rounded-full font-semibold hover:bg-gray-100 transition">
                Shop Now
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="lg:hidden mb-3">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full px-4 py-2 pl-10 rounded-lg border-0 focus:ring-2 focus:ring-white focus:outline-none bg-white/90 text-gray-900"
              />
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                size={18}
              />
            </form>
          </div>

          {/* Navigation Bar */}
          <nav className="hidden lg:flex items-center justify-between">
            {/* Left Navigation */}
            <div className="flex items-center space-x-6">
              <a
                href="#"
                className="text-white hover:text-gray-200 font-medium transition flex items-center border-b-2 border-transparent hover:border-white pb-1"
              >
                <span>
                  <House />
                </span>
                <span className="ml-2">Home</span>
              </a>

              {/* Categories Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                  className="flex items-center space-x-2 text-white hover:text-gray-200 font-medium transition"
                >
                  <span>
                    <ChartBarStacked />
                  </span>
                  <span>Categories</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${
                      isCategoryOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Mega Dropdown Menu */}
                {isCategoryOpen && (
                  <div
                    className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 p-6 min-w-[800px] z-50"
                    onMouseLeave={() => setIsCategoryOpen(false)}
                  >
                    <div className="grid grid-cols-3 gap-8">
                      {categories.map((category, index) => (
                        <div key={index} className="space-y-3">
                          <h3 className="font-bold text-gray-900 text-lg mb-3 pb-2 border-b border-gray-100">
                            {category.name}
                          </h3>
                          <ul className="space-y-2">
                            {category.subcategories.map((subcat, subIndex) => (
                              <li key={subIndex}>
                                <a
                                  href="#"
                                  className="text-gray-600 hover:text-[#01A49E] transition flex items-center group"
                                >
                                  <span className="w-1.5 h-1.5 bg-gray-300 rounded-full mr-3 group-hover:bg-[#01A49E] transition"></span>
                                  {subcat}
                                </a>
                              </li>
                            ))}
                          </ul>
                          <a
                            href="#"
                            className="inline-block text-sm text-[#01A49E] font-semibold mt-2 hover:underline"
                          >
                            View All →
                          </a>
                        </div>
                      ))}
                    </div>

                    {/* Featured Products */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <h3 className="font-bold text-gray-900 text-lg mb-4">
                        Featured This Week
                      </h3>
                      <div className="grid grid-cols-3 gap-4">
                        {[
                          {
                            name: "PS4 Console",
                            discount: "Up to 30% OFF",
                            icon: "🎮",
                          },
                          {
                            name: "Wireless Headphones",
                            discount: "Free Shipping",
                            icon: "🎧",
                          },
                          {
                            name: "Analog Watches",
                            discount: "New Arrivals",
                            icon: "⌚",
                          },
                        ].map((feature, idx) => (
                          <a
                            key={idx}
                            href="#"
                            className="bg-gray-50 hover:bg-[#01A49E]/5 p-4 rounded-lg transition group"
                          >
                            <div className="flex items-center">
                              <span className="text-2xl mr-3">
                                {feature.icon}
                              </span>
                              <div>
                                <div className="font-medium text-gray-900 group-hover:text-[#01A49E]">
                                  {feature.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {feature.discount}
                                </div>
                              </div>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <a
                href="#"
                className="text-white hover:text-gray-200 font-medium transition flex items-center"
              >
                <span>🔥</span>
                <span className="ml-2">Deals</span>
              </a>
              <a
                href="#"
                className="text-white hover:text-gray-200 font-medium transition flex items-center"
              >
                <span>⭐</span>
                <span className="ml-2">New Arrivals</span>
              </a>
            </div>

            {/* Right Navigation */}
            <div className="flex items-center space-x-6">
              <a
                href="#"
                className="text-white hover:text-gray-200 font-medium transition"
              >
                Help Center
              </a>
              <a
                href="#"
                className="text-white hover:text-gray-200 font-medium transition"
              >
                Track Order
              </a>
              <div className="flex items-center space-x-2 text-white">
                <span className="text-sm">Hotline:</span>
                <span className="font-bold">9862463322</span>
              </div>
            </div>
          </nav>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden bg-white rounded-xl mt-3 p-4 shadow-lg animate-fadeIn">
              <div className="space-y-4">
                <a
                  href="#"
                  className="block py-2 px-4 text-gray-900 hover:bg-gray-100 rounded-lg"
                >
                  🏠 Home
                </a>

                <div className="space-y-2">
                  <div className="font-semibold text-gray-900 px-4 py-2">
                    Categories
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.slice(0, 6).map((category, idx) => (
                      <a
                        key={idx}
                        href="#"
                        className="py-2 px-4 text-gray-700 hover:bg-gray-100 rounded-lg text-sm"
                      >
                        {category.name}
                      </a>
                    ))}
                  </div>
                  <a
                    href="#"
                    className="block py-2 px-4 text-[#01A49E] font-semibold hover:bg-gray-100 rounded-lg"
                  >
                    View All Categories →
                  </a>
                </div>

                <a
                  href="#"
                  className="block py-2 px-4 text-gray-900 hover:bg-gray-100 rounded-lg"
                >
                  🔥 Deals
                </a>
                <a
                  href="#"
                  className="block py-2 px-4 text-gray-900 hover:bg-gray-100 rounded-lg"
                >
                  ⭐ New Arrivals
                </a>
                <a
                  href="#"
                  className="block py-2 px-4 text-gray-900 hover:bg-gray-100 rounded-lg"
                >
                  📞 Contact
                </a>

                <div className="pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600 px-4">Hotline 24/7</div>
                  <div className="font-bold text-lg text-gray-900 px-4">
                    9862463322
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Access Bar */}
        <div className="bg-[#00857F] hidden lg:block">
          <div className="container mx-auto px-4 py-2">
            <div className="flex items-center justify-between text-white text-sm">
              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <span className="mr-2">
                    <Truck />
                  </span>
                  <span>Free Shipping on orders over 999</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">
                    <Undo2 />
                  </span>
                  <span>30-Day Return Policy</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">
                    <HandFist />
                  </span>
                  <span>24/7 Support</span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <a href="#" className="hover:text-gray-200">
                  Store Locations
                </a>
                <span className="text-white/50">|</span>
                <a href="#" className="hover:text-gray-200">
                  Become a Seller
                </a>
              </div>
            </div>
          </div>
        </div>
      </header>
      {/* === END: UPDATED HEADER === */}

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

              <form className="space-y-6">
                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail
                        className="h-5 w-5 text-[#01A49E]
"
                      />
                    </div>
                    <input
                      type="email"
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      placeholder="Enter your email"
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
                      <Lock
                        className="h-5 w-5 text-[#01A49E]
"
                      />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff
                          className="h-5 w-5 text-[#01A49E]
"
                        />
                      ) : (
                        <Eye
                          className="h-5 w-5 text-[#01A49E]
"
                        />
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
                >
                  LOGIN
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>

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
            </div>
          </div>

          {/* Right Column - Features/Info */}
          <div className="lg:w-1/2 w-full mt-12 lg:mt-0 lg:pl-12 bg-white p-8 rounded-2xl shadow-sm">
            <div className="max-w-xl">
              {/* Features Grid */}
              <div className="grid md:grid-cols-2 gap-6 mb-8 ">
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

        {/* Featured Categories
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-center mb-8">
            Shop by Category
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {[
              { name: "Laptops", color: "bg-blue-100", icon: "💻" },
              { name: "Phones", color: "bg-green-100", icon: "📱" },
              { name: "Tablets", color: "bg-purple-100", icon: "📟" },
              { name: "Gaming", color: "bg-red-100", icon: "🎮" },
              { name: "Cameras", color: "bg-yellow-100", icon: "📷" },
              { name: "Audio", color: "bg-indigo-100", icon: "🎧" },
              { name: "Smart Home", color: "bg-pink-100", icon: "🏠" },
              { name: "Accessories", color: "bg-gray-100", icon: "🔌" },
            ].map((category) => (
              <div
                key={category.name}
                className="bg-white rounded-xl p-4 text-center shadow-sm hover:bg-[#99DEDA] shadow-md transition cursor-pointer"
              >
                <div
                  className={`${category.color} w-12 h-12 rounded-lg flex items-center justify-center text-2xl mx-auto mb-2`}
                >
                  {category.icon}
                </div>
                <span className="text-sm font-medium">{category.name}</span>
              </div>
            ))}
          </div>
        </div> */}
      </div>

      {/* Footer */}
      <footer className="bg-white text-black text-left mt-16 border-t border-gray-800 rounded-t-lg">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-5 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">S</span>
                </div>
                <h3 className="text-xl font-bold">WOO TECH MART</h3>
              </div>
              <p className="text-gray-800">
                Your one-stop destination for all tech needs in KTM.
              </p>
              <div>
                <h4 className="font-semibold text-SM mb-4">HOTLINE 24/7</h4>

                <p className="text-[#01A49E] text-3xl font-bold mb-2">
                  9862463322
                </p>
                <p className="text-gray-400 mb-2">
                  Khadgagau-2,27-Chandragiri,Kathmandu,Nepal
                </p>
                <p className="text-gray-400">contact@swootechmart.com</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-4">TOP CATEGORIES</h4>
              <ul className="space-y-22">
                <li>
                  <a href="#" className="text-gray-400 hover:text-gray-800">
                    Laptops
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-gray-800">
                    PC and Computers
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-gray-800">
                    Cell phones
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-gray-800">
                    Tablets
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-gray-800">
                    Gaming & VR
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-gray-800">
                    Networks
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-gray-800">
                    Camera
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-gray-800">
                    Sound
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-gray-800">
                    Ofiice
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-4">COMPANY</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-gray-800">
                    About Swoo
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-gray-800">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-gray-800">
                    Carrer
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-gray-800">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-gray-800">
                    Sitemap
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-gray-800">
                    Store Loactions
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-4">HELP CENTER</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-gray-800">
                    Customer Service
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-gray-800">
                    Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-gray-800">
                    Terms & Conditions
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-gray-800">
                    Track Order
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-gray-800">
                    FAQs
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-gray-800">
                    My Account
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-gray-800">
                    Product Support
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-4">PARTNER</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-gray-800">
                    Become Seller
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-gray-800">
                    Affiliate
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-gray-800">
                    Advetise
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-gray-800">
                    Partnership
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className=" border-gray-800 mt-10 pt-10  text-2xl font-bold animate-pulse text-center text-[#01A49E]">
            <p>SUBSCRIBE AND GET 20% OFF YOUR FIRST PURCHASE</p>
          </div>

          <div className="border-t border-gray-800 mt-8 mb-0 pt-8 text-center text-gray-400">
            <p>© 2024 SWOO TECH MART. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default EcommerceLogin;
