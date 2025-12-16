// src/components/HeaderClient.jsx
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
  Undo2,
  HandFist,
  Award,
  Zap,
  Sparkles,
  ShoppingBag,
  Settings,
  LogOut,
  PhoneCall,
  Moon,
  Sun,
  HelpCircle,
  Package,
  Shield,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import toast from "react-hot-toast";

const HeaderClient = () => {
  const { user, logout, isAuthenticated, isAdmin, isDemoUser } = useAuth();
  const { getCartCount, isSyncing } = useCart();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedDarkMode = localStorage.getItem("clientDarkMode") === "true";
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const initialDarkMode =
      savedDarkMode !== null ? savedDarkMode : systemPrefersDark;

    setDarkMode(initialDarkMode);
    if (initialDarkMode) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("clientDarkMode", newDarkMode.toString());

    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    toast.success(newDarkMode ? "Dark mode enabled" : "Light mode enabled", {
      icon: newDarkMode ? "🌙" : "☀️",
    });
  };

  const cartCount = getCartCount();

  const handleLogout = () => {
    toast((t) => (
      <div className="flex flex-col space-y-2">
        <p className="font-medium">Are you sure you want to logout?</p>
        <div className="flex space-x-2 justify-end">
          <button
            onClick={() => {
              logout();
              navigate("/login");
              toast.dismiss(t.id);
            }}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Yes, logout
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </div>
    ));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleCategoryClick = (categoryName) => {
    setIsCategoryOpen(false);
    setIsMobileMenuOpen(false);
    navigate(`/products?category=${encodeURIComponent(categoryName)}`);
  };

  return (
    <header className="bg-[#0A1F33] dark:bg-gray-900 shadow-sm w-full transition-colors duration-200">
      {/* Main Header */}
      <div className="w-full px-4 py-4">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-4">
          {/* Logo and Mobile  Menu Button */}
          <div className="flex items-center space-x-3">
            <button
              className="lg:hidden text-white dark:text-gray-200 hover:text-gray-300 dark:hover:text-gray-400 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#01A49E] to-teal-600 dark:from-[#01A49E] dark:to-teal-700 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow">
                <span className="text-white font-bold text-3xl">S</span>
              </div>
              <div className="ml-3">
                <h1 className="text-2xl font-bold text-white dark:text-gray-100">
                  SWOO TECH MART
                </h1>
                <p className="text-white dark:text-gray-300 text-sm">
                  {isDemoUser
                    ? "Demo Mode • Offline"
                    : "KTM's Prime Tech Store"}
                </p>
              </div>
            </Link>
          </div>

          <div className="hidden lg:flex flex-1 max-w-2xl mx-8">
            <form onSubmit={handleSearch} className="w-full relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products, brands, or categories..."
                className="w-full px-6 py-3 pl-12 rounded-full border-0 focus:ring-2 focus:ring-[#01A49E] dark:focus:ring-[#01A49E] focus:ring-opacity-50 focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 shadow-sm transition-colors"
              />
              <button
                type="submit"
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-[#01A49E] dark:hover:text-[#01A49E] transition-colors"
                aria-label="Search"
              >
                <Search size={20} />
              </button>
            </form>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full bg-white/10 dark:bg-gray-800 hover:bg-white/20 dark:hover:bg-gray-700 transition-colors group"
              aria-label={
                darkMode ? "Switch to light mode" : "Switch to dark mode"
              }
            >
              {darkMode ? (
                <Sun className="h-5 w-5 text-yellow-300 group-hover:text-yellow-200 transition-colors" />
              ) : (
                <Moon className="h-5 w-5 text-blue-300 group-hover:text-blue-200 transition-colors" />
              )}
            </button>

            <div className="hidden lg:flex items-center space-x-2">
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                    className="flex items-center space-x-2 cursor-pointer focus:outline-none text-white dark:text-gray-200 hover:text-gray-300 dark:hover:text-gray-400 transition-colors"
                    aria-label="User menu"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-[#01A49E] to-[#01857F] rounded-full flex items-center justify-center shadow-sm">
                      <span className="text-white font-medium text-sm">
                        {user?.firstname?.charAt(0) ||
                          user?.name?.charAt(0) ||
                          "U"}
                      </span>
                    </div>
                    <span className="font-medium capitalize">
                      {user?.firstname || user?.name || "User"}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`transition-transform ${
                        showDropdown ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {showDropdown && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 animate-fadeIn">
                      <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-[#01A49E] to-[#01857F] rounded-full flex items-center justify-center">
                            <span className="text-white font-medium">
                              {user?.firstname?.charAt(0) ||
                                user?.name?.charAt(0) ||
                                "U"}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-gray-100 capitalize">
                              {user?.firstname || user?.name || "User"}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                              {user?.email || user?.username}
                            </p>
                            <div className="flex items-center space-x-1 mt-1">
                              {isAdmin && (
                                <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                                  Admin
                                </span>
                              )}
                              {isDemoUser && (
                                <span className="text-xs px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full">
                                  Demo
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="py-2">
                        <Link
                          to="/profile"
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-[#01A49E] dark:hover:text-[#01A49E] transition-colors"
                        >
                          <User size={18} className="mr-3" />
                          <span>My Profile</span>
                        </Link>

                        <Link
                          to="/orders"
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-[#01A49E] dark:hover:text-[#01A49E] transition-colors"
                        >
                          <ShoppingBag size={18} className="mr-3" />
                          <span>My Orders</span>
                        </Link>

                        {isAdmin && (
                          <Link
                            to="/admin/dashboard"
                            onClick={() => setShowDropdown(false)}
                            className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-[#01A49E] dark:hover:text-[#01A49E] transition-colors"
                          >
                            <Shield size={18} className="mr-3" />
                            <span>Admin Panel</span>
                          </Link>
                        )}

                        <Link
                          to="/settings"
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-[#01A49E] dark:hover:text-[#01A49E] transition-colors"
                        >
                          <Settings size={18} className="mr-3" />
                          <span>Settings</span>
                        </Link>
                      </div>

                      <div className="border-t border-gray-100 dark:border-gray-700 pt-2 pb-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-gray-700 transition-colors"
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
                  className="flex items-center space-x-2 hover:opacity-80 transition-opacity text-white dark:text-gray-200 hover:text-gray-300 dark:hover:text-gray-300"
                >
                  <User size={20} />
                  <span className="font-medium">LOGIN</span>
                </Link>
              )}
            </div>

            <button
              onClick={() => navigate("/cart")}
              className="relative text-white dark:text-gray-200 hover:text-gray-300 dark:hover:text-gray-400 transition-colors p-2 group"
              aria-label="Shopping cart"
            >
              <div className="relative">
                <ShoppingCart
                  size={24}
                  className="group-hover:scale-110 transition-transform"
                />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 dark:bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {cartCount}
                  </span>
                )}
              </div>
              {isSyncing && (
                <div className="absolute -bottom-1 right-0 w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full animate-pulse" />
              )}
            </button>

            <button
              onClick={() => navigate("/addedproduct")}
              className="hidden lg:block bg-white dark:bg-gray-800 text-[#0A1F33] dark:text-gray-100 px-6 py-2 rounded-full font-semibold hover:bg-[#01A49E] dark:hover:bg-[#01A49E] hover:text-white transition-colors shadow-sm hover:shadow-md"
            >
              Shop Now
            </button>
          </div>
        </div>

        <div className="lg:hidden mb-3">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full px-4 py-2 pl-10 rounded-lg border-0 focus:ring-2 focus:ring-[#01A49E] dark:focus:ring-[#01A49E] focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 shadow-sm transition-colors"
            />
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
              size={18}
            />
          </form>
        </div>

        <nav className="hidden lg:flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link
              to="/"
              className="text-white dark:text-gray-200 hover:text-gray-300 dark:hover:text-gray-400 font-medium transition-colors flex items-center border-b-2 border-transparent hover:border-white dark:hover:border-gray-300 pb-1 group"
            >
              <House
                size={18}
                className="group-hover:scale-110 transition-transform"
              />
              <span className="ml-2">Home</span>
            </Link>

            <div className="relative">
              <button
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                onBlur={() => setTimeout(() => setIsCategoryOpen(false), 200)}
                className="flex items-center space-x-2 text-white dark:text-gray-200 hover:text-gray-300 dark:hover:text-gray-400 font-medium transition-colors group"
                aria-label="Product categories"
              >
                <ChartBarStacked
                  size={18}
                  className="group-hover:scale-110 transition-transform"
                />
                <span>Categories</span>
                <ChevronDown
                  size={16}
                  className={`transition-transform ${
                    isCategoryOpen ? "rotate-180" : ""
                  } group-hover:scale-110`}
                />
              </button>
            </div>

            <Link
              to="/deals"
              className="text-white dark:text-gray-200 hover:text-gray-300 dark:hover:text-gray-400 font-medium transition-colors flex items-center group"
            >
              <Sparkles
                size={18}
                className="group-hover:scale-110 transition-transform"
              />
              <span className="ml-2">Deals</span>
            </Link>
            <Link
              to="/new-arrivals"
              className="text-white dark:text-gray-200 hover:text-gray-300 dark:hover:text-gray-400 font-medium transition-colors flex items-center group"
            >
              <Zap
                size={18}
                className="group-hover:scale-110 transition-transform"
              />
              <span className="ml-2">New Arrivals</span>
            </Link>
            <Link
              to="/best-sellers"
              className="text-white dark:text-gray-200 hover:text-gray-300 dark:hover:text-gray-400 font-medium transition-colors flex items-center group"
            >
              <Award
                size={18}
                className="group-hover:scale-110 transition-transform"
              />
              <span className="ml-2">Best Sellers</span>
            </Link>
          </div>

          {/* Right Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            <Link
              to="/addedproduct"
              className="text-white dark:text-gray-200 hover:text-gray-300 dark:hover:text-gray-400 font-medium transition-colors flex items-center group"
            >
              <Package
                size={18}
                className="mr-2 group-hover:scale-110 transition-transform"
              />
              View Products
            </Link>

            <div className="flex items-center space-x-6">
              {isAuthenticated ? (
                <Link
                  to="/addproduct"
                  className="text-white dark:text-gray-200 hover:text-gray-300 dark:hover:text-gray-400 font-medium transition-colors"
                >
                  Add Products
                </Link>
              ) : (
                <Link
                  to="/contact"
                  className="flex items-center space-x-2 hover:opacity-80 transition-opacity text-white dark:text-gray-200 hover:text-gray-300 dark:hover:text-gray-300"
                >
                  <PhoneCall size={20} />
                  <span className="font-medium">Helpline</span>
                </Link>
              )}
            </div>

            <div className="flex items-center space-x-3 text-white dark:text-gray-200">
              <HelpCircle
                size={16}
                className="text-gray-300 dark:text-gray-400"
              />
              <span className="text-sm">Hotline:</span>
              <span className="font-bold">9862463322</span>
            </div>
          </div>
        </nav>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white dark:bg-gray-800 rounded-xl mt-3 p-4 shadow-lg animate-slideDown">
            <div className="space-y-4">
              {/* Dark Mode Toggle in Mobile Menu */}
              <div className="flex items-center justify-between px-4 py-2">
                <span className="text-gray-900 dark:text-gray-100">Theme</span>
                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  aria-label="Toggle dark mode"
                >
                  {darkMode ? (
                    <Sun className="h-5 w-5 text-yellow-500" />
                  ) : (
                    <Moon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                  )}
                </button>
              </div>

              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center py-2 px-4 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <House size={18} className="mr-3" />
                Home
              </Link>
              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center py-2 px-4 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <User size={18} className="mr-3" />
                    {user?.firstname || user?.name || "User"}
                  </Link>
                  <Link
                    to="/orders"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center py-2 px-4 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <ShoppingBag size={18} className="mr-3" />
                    My Orders
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin/dashboard"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center py-2 px-4 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Shield size={18} className="mr-3" />
                      Admin Panel
                    </Link>
                  )}
                  <Link
                    to="/addproduct"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center py-2 px-4 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Package size={18} className="mr-3" />
                    Add Products
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full text-left py-2 px-4 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <LogOut size={18} className="mr-3" />
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center py-2 px-4 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <User size={18} className="mr-3" />
                  Login
                </Link>
              )}

              <button
                onClick={() => {
                  navigate("/cart");
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center w-full text-left py-2 px-4 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ShoppingCart size={18} className="mr-3" />
                Cart {cartCount > 0 && `(${cartCount})`}
              </button>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-600 dark:text-gray-400 px-4">
                  Hotline 24/7
                </div>
                <div className="font-bold text-lg text-gray-900 dark:text-gray-100 px-4">
                  9862463322
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Access Bar */}
      <div className="bg-[#A40107] dark:bg-red-900 hidden lg:block w-full transition-colors duration-200">
        <div className="w-full px-4 py-2">
          <div className="flex items-center justify-between text-white dark:text-gray-200 text-sm">
            <div className="flex items-center space-x-6">
              <div className="flex items-center hover:text-gray-300 dark:hover:text-gray-300 transition-colors cursor-pointer">
                <Truck size={16} className="mr-2" />
                <span>Free Shipping on orders over 999</span>
              </div>
              <div className="flex items-center hover:text-gray-300 dark:hover:text-gray-300 transition-colors cursor-pointer">
                <Undo2 size={16} className="mr-2" />
                <span>30-Day Return Policy</span>
              </div>
              <div className="flex items-center hover:text-gray-300 dark:hover:text-gray-300 transition-colors cursor-pointer">
                <HandFist size={16} className="mr-2" />
                <span>24/7 Support</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                {isDemoUser && (
                  <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-300 rounded-full text-xs">
                    Demo Mode
                  </span>
                )}
                {isAdmin && (
                  <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded-full text-xs">
                    Admin
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeaderClient;
