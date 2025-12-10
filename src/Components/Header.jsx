import React, { useState, useEffect } from "react";
import {
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
  Award,
  Zap,
  Sparkles,
  ShoppingBag,
  Settings,
  LogOut,
  PhoneCall,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Header = () => {
  const { user, logout, loading } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();

  const handleLogout = async () => {
    logout();
    setShowDropdown(false);
    navigate("/");
  };

  // Load cart count from localStorage
  useEffect(() => {
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem("swmart_cart") || "[]");
      const count = cart.reduce((total, item) => total + item.quantity, 0);
      setCartCount(count);
    };

    updateCartCount();

    // Listen for storage changes
    window.addEventListener("storage", updateCartCount);

    // Custom event for cart updates within same tab
    window.addEventListener("cartUpdated", updateCartCount);

    return () => {
      window.removeEventListener("storage", updateCartCount);
      window.removeEventListener("cartUpdated", updateCartCount);
    };
  }, []);

  // Categories data for dropdown
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

  if (loading) {
    return (
      <header className="bg-[#0A1F33] shadow-sm w-full">
        <div className="w-full px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link to="/" className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center shadow-sm">
                  <span className="text-white font-bold text-3xl">S</span>
                </div>
                <div className="ml-3">
                  <h1 className="text-2xl font-bold text-white">
                    SWOO TECH MART
                  </h1>
                  <p className="text-white text-sm">KTM's Prime Tech Store</p>
                </div>
              </Link>
            </div>
            <div className="hidden lg:flex items-center space-x-2 text-white opacity-70">
              <User size={20} />
              <span>Loading...</span>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-[#0A1F33] shadow-sm w-full">
      {/* Main Header */}
      <div className="w-full px-4 py-4">
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
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-3xl">S</span>
              </div>
              <div className="ml-3">
                <h1 className="text-2xl font-bold text-white">
                  SWOO TECH MART
                </h1>
                <p className="text-white text-sm">KTM's Prime Tech Store</p>
              </div>
            </Link>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:flex flex-1 max-w-2xl mx-8">
            <form onSubmit={handleSearch} className="w-full relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products, brands, or categories..."
                className="w-full px-6 py-3 pl-12 rounded-full border-0 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 focus:outline-none bg-white/90 text-gray-900 placeholder-gray-500"
              />
              <button
                type="submit"
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500"
              >
                <Search size={20} />
              </button>
            </form>
          </div>
          <div className="flex items-center space-x-4">
            {/* User Section */}
            <div className="hidden lg:flex items-center space-x-2">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                    className="flex items-center space-x-2 cursor-pointer focus:outline-none text-white hover:text-gray-200 transition"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {user.firstname?.charAt(0) ||
                          user.username?.charAt(0) ||
                          "U"}
                      </span>
                    </div>
                    <span className="font-medium capitalize">
                      {user.firstname || user.username}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`transition-transform ${
                        showDropdown ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {showDropdown && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 animate-fadeIn">
                      <div className="p-4 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium">
                              {user.firstname?.charAt(0) ||
                                user.username?.charAt(0) ||
                                "U"}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 capitalize">
                              {user.firstname || user.username}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="py-2">
                        <Link
                          to="profile"
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        >
                          <User size={18} className="mr-3" />
                          <span>My Profile</span>
                        </Link>

                        <Link
                          to="/user/orders"
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        >
                          <ShoppingBag size={18} className="mr-3" />
                          <span>My Orders</span>
                        </Link>

                        <Link
                          to="/user/settings"
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        >
                          <Settings size={18} className="mr-3" />
                          <span>Settings</span>
                        </Link>
                      </div>

                      <div className="border-t border-gray-100 pt-2 pb-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut size={18} className="mr-3" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center space-x-2 hover:opacity-80 transition-opacity text-white hover:text-gray-200"
                >
                  <User size={20} />
                  <span className="font-medium">LOGIN</span>
                </Link>
              )}
            </div>

            {/* Cart Button */}
            <button
              onClick={() => navigate("/cart")}
              className="relative text-white hover:text-gray-200 transition p-2"
            >
              <ShoppingCart size={24} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-sm rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Shop Now Button */}
            <button
              onClick={() => navigate("/")}
              className="hidden lg:block bg-white text-[#0A1F33] px-6 py-2 rounded-full font-semibold hover:bg-[#33BDB7] transition"
            >
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
            <Link
              to="/"
              className="text-white hover:text-gray-200 font-medium transition flex items-center border-b-2 border-transparent hover:border-white pb-1"
            >
              <House size={18} />
              <span className="ml-2">Home</span>
            </Link>

            {/* Categories Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className="flex items-center space-x-2 text-white hover:text-gray-200 font-medium transition"
              >
                <ChartBarStacked size={18} />
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
                </div>
              )}
            </div>

            <a
              href="#"
              className="text-white hover:text-gray-200 font-medium transition flex items-center"
            >
              <Sparkles size={18} />
              <span className="ml-2">Deals</span>
            </a>
            <a
              href="#"
              className="text-white hover:text-gray-200 font-medium transition flex items-center"
            >
              <Zap size={18} />
              <span className="ml-2">New Arrivals</span>
            </a>
            <a
              href="#"
              className="text-white hover:text-gray-200 font-medium transition flex items-center"
            >
              <Award size={18} />
              <span className="ml-2">Best Sellers</span>
            </a>
          </div>

          {/* Right Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            <a
              href="/addedproduct"
              className="text-white hover:text-gray-200 font-medium transition"
            >
              View Products
            </a>

            <div className="flex items-center space-x-6">
              {user ? (
                <a
                  href="addproduct"
                  className="text-white hover:text-gray-200 font-medium transition"
                >
                  Add Products
                </a>
              ) : (
                <Link
                  to="/"
                  className="flex items-center space-x-2 hover:opacity-80 transition-opacity text-white hover:text-gray-200"
                >
                  <PhoneCall size={20} />
                  <span className="font-medium">Helpline</span>
                </Link>
              )}
            </div>

            <div className="flex items-center space-x-3 text-white">
              <span className="text-sm">Hotline:</span>
              <span className="font-bold">9862463322</span>
            </div>
          </div>
        </nav>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white rounded-xl mt-3 p-4 shadow-lg">
            <div className="space-y-4">
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2 px-4 text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                🏠 Home
              </Link>

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

              {user ? (
                <>
                  <Link
                    to="/user/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-2 px-4 text-gray-900 hover:bg-gray-100 rounded-lg"
                  >
                    👤 {user.firstname || user.username}
                  </Link>
                  <Link
                    to="/user/orders"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-2 px-4 text-gray-900 hover:bg-gray-100 rounded-lg"
                  >
                    📦 My Orders
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full text-left py-2 px-4 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    🚪 Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-2 px-4 text-gray-900 hover:bg-gray-100 rounded-lg"
                >
                  👤 Login
                </Link>
              )}

              <button
                onClick={() => {
                  navigate("/cart");
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left py-2 px-4 text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                🛒 Cart {cartCount > 0 && `(${cartCount})`}
              </button>
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
      <div className="bg-[#A40107] hidden lg:block w-full">
        <div className="w-full px-4 py-2">
          <div className="flex items-center justify-between text-white text-sm">
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <Truck size={16} className="mr-2" />
                <span>Free Shipping on orders over 999</span>
              </div>
              <div className="flex items-center">
                <Undo2 size={16} className="mr-2" />
                <span>30-Day Return Policy</span>
              </div>
              <div className="flex items-center">
                <HandFist size={16} className="mr-2" />
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
  );
};

export default Header;
