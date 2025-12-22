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
  Zap,
  ShoppingBag,
  Settings,
  LogOut,
  PhoneCall,
  HelpCircle,
  Package,
  Shield,
  Tag,
  TrendingUp,
  Bell,
  Gift,
  MapPin,
  Star,
  ChevronRight,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import Switch from "./ui/Switch";
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
            className="px-3 py-1 bg-gray-700 dark:bg-gray-700 rounded hover:bg-gray-900 dark:hover:bg-gray-600"
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

  const featuredCategories = [
    { name: "Laptops", icon: "💻", color: "text-blue-500" },
    { name: "Phones", icon: "📱", color: "text-purple-500" },
    { name: "Gaming", icon: "🎮", color: "text-red-500" },
    { name: "Audio", icon: "🎧", color: "text-green-500" },
    { name: "Cameras", icon: "📷", color: "text-yellow-500" },
    { name: "Smart Home", icon: "🏠", color: "text-indigo-500" },
  ];

  const quickLinks = [
    { name: "Daily Deals", icon: Tag, path: "/deals", badge: "🔥" },
    { name: "New Arrivals", icon: Zap, path: "/new-arrivals", badge: "NEW" },
    { name: "Best Sellers", icon: TrendingUp, path: "/best-sellers" },
    { name: "Clearance", icon: Gift, path: "/clearance", badge: "SALE" },
  ];

  return (
    <header className="bg-[#0A1F33] dark:bg-gray-900 shadow-sm w-full transition-colors duration-200">
  

      {/* Main Header */}
      <div className="w-full px-4 py-4">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-4">
          {/* Logo and Mobile Menu Button */}
          <div className="flex items-center space-x-3">
            <button
              className="lg:hidden text-white dark:text-gray-200 hover:text-gray-300 dark:hover:text-gray-400 transition-colors p-2 hover:bg-white/10 rounded-lg"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <Link
              to="/"
              className="flex items-center space-x-3 hover:opacity-90 transition-opacity"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-[#01A49E] to-teal-600 dark:from-[#01A49E] dark:to-teal-700 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow animate-pulse-glow">
                <span className="text-white font-bold text-3xl">S</span>
              </div>
              <div className="ml-3">
                <h1 className="text-2xl font-bold text-white dark:text-gray-100 bg-gradient-to-r from-white to-gray-300 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                  SWOO TECH MART
                </h1>
                <p className="text-white/80 dark:text-gray-300 text-sm">
                  {isDemoUser
                    ? "Demo Mode • Offline"
                    : "KTM's Prime Tech Store"}
                </p>
              </div>
            </Link>
          </div>

          {/* Search Bar (Desktop) */}
          <div className="hidden lg:flex flex-1 max-w-2xl mx-8">
            <form onSubmit={handleSearch} className="w-full relative group">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products, brands, or categories..."
                className="w-full px-6 py-3 pl-12 pr-12 rounded-full border-0 focus:ring-2 focus:ring-[#01A49E] dark:focus:ring-[#01A49E] focus:ring-opacity-50 focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 shadow-lg hover:shadow-xl transition-all duration-300"
              />
              <button
                type="submit"
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-[#01A49E] dark:hover:text-[#01A49E] transition-colors"
                aria-label="Search"
              >
                <Search size={20} />
              </button>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                <span className="text-xs text-gray-400 dark:text-gray-500 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md">
                  
                </span>
              </div>
            </form>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            {/* Dark Mode Toggle */}
            <div className="hidden md:flex items-center">
              <Switch checked={darkMode} onChange={toggleDarkMode} />
            </div>

            {/* User Actions (Desktop) */}
            <div className="hidden lg:flex items-center space-x-4">
              {/* Quick Links */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => navigate("/deals")}
                  className="text-white dark:text-gray-200 hover:text-gray-300 dark:hover:text-gray-400 transition-colors p-2 hover:bg-white/10 rounded-lg group relative"
                  aria-label="Deals"
                >
                  <Tag size={20} />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                </button>
                <button
                  onClick={() => navigate("/track-order")}
                  className="text-white dark:text-gray-200 hover:text-gray-300 dark:hover:text-gray-400 transition-colors p-2 hover:bg-white/10 rounded-lg"
                  aria-label="Track Order"
                >
                  <MapPin size={20} />
                </button>
                <button
                  onClick={() => navigate("/notifications")}
                  className="text-white dark:text-gray-200 hover:text-gray-300 dark:hover:text-gray-400 transition-colors p-2 hover:bg-white/10 rounded-lg relative"
                  aria-label="Notifications"
                >
                  <Bell size={20} />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                </button>
              </div>

              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                    className="flex items-center space-x-2 cursor-pointer focus:outline-none text-white dark:text-gray-200 hover:text-gray-300 dark:hover:text-gray-400 transition-colors p-2 hover:bg-white/10 rounded-lg group"
                    aria-label="User menu"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-[#01A49E] to-[#01857F] rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                      <span className="text-white font-medium text-sm">
                        {user?.firstname?.charAt(0) ||
                          user?.name?.charAt(0) ||
                          "U"}
                      </span>
                    </div>
                    <span className="font-medium capitalize hidden xl:inline">
                      {user?.firstname || user?.name || "User"}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`transition-transform hidden xl:inline ${
                        showDropdown ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {showDropdown && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 animate-fadeIn backdrop-blur-sm">
                      <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-[#01A49E] to-[#01857F] rounded-full flex items-center justify-center shadow-lg">
                            <span className="text-white font-medium text-lg">
                              {user?.firstname?.charAt(0) ||
                                user?.name?.charAt(0) ||
                                "U"}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-900 dark:text-gray-100 capitalize truncate">
                              {user?.firstname || user?.name || "User"}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                              {user?.email || user?.username}
                            </p>
                            <div className="flex items-center space-x-2 mt-2">
                              <div className="flex items-center space-x-1">
                                <Star className="h-3 w-3 text-yellow-500" />
                                <span className="text-xs text-gray-600 dark:text-gray-400">
                                  Gold Member
                                </span>
                              </div>
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

                      <div className="py-2 max-h-96 overflow-y-auto">
                        <Link
                          to="/profile"
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-[#01A49E] dark:hover:text-[#01A49E] transition-colors group"
                        >
                          <User size={18} className="mr-3" />
                          <div className="flex-1">
                            <span>My Profile</span>
                            <span className="block text-xs text-gray-500 dark:text-gray-400">
                              View & edit profile
                            </span>
                          </div>
                          <ChevronRight size={16} className="opacity-50" />
                        </Link>

                        <Link
                          to="/orders"
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-[#01A49E] dark:hover:text-[#01A49E] transition-colors group"
                        >
                          <ShoppingBag size={18} className="mr-3" />
                          <div className="flex-1">
                            <span>My Orders</span>
                            <span className="block text-xs text-gray-500 dark:text-gray-400">
                              Track & manage orders
                            </span>
                          </div>
                          <ChevronRight size={16} className="opacity-50" />
                        </Link>

                        {isAdmin && (
                          <Link
                            to="/admin/dashboard"
                            onClick={() => setShowDropdown(false)}
                            className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-[#01A49E] dark:hover:text-[#01A49E] transition-colors group"
                          >
                            <Shield size={18} className="mr-3" />
                            <div className="flex-1">
                              <span>Admin Panel</span>
                              <span className="block text-xs text-gray-500 dark:text-gray-400">
                                Manage store & products
                              </span>
                            </div>
                            <ChevronRight size={16} className="opacity-50" />
                          </Link>
                        )}

                        <Link
                          to="/wishlist"
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-[#01A49E] dark:hover:text-[#01A49E] transition-colors group"
                        >
                          <Star size={18} className="mr-3" />
                          <div className="flex-1">
                            <span>Wishlist</span>
                            <span className="block text-xs text-gray-500 dark:text-gray-400">
                              Saved items & lists
                            </span>
                          </div>
                          <ChevronRight size={16} className="opacity-50" />
                        </Link>

                        <Link
                          to="/settings"
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-[#01A49E] dark:hover:text-[#01A49E] transition-colors group"
                        >
                          <Settings size={18} className="mr-3" />
                          <div className="flex-1">
                            <span>Settings</span>
                            <span className="block text-xs text-gray-500 dark:text-gray-400">
                              Preferences & security
                            </span>
                          </div>
                          <ChevronRight size={16} className="opacity-50" />
                        </Link>
                      </div>

                      <div className="border-t border-gray-100 dark:border-gray-700 pt-2 pb-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-gray-700 transition-colors group"
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
                  className="flex items-center space-x-2 hover:opacity-80 transition-opacity text-white dark:text-gray-200 hover:text-gray-300 dark:hover:text-gray-300 bg-gradient-to-r from-[#01A49E] to-[#01857F] px-4 py-2 rounded-full font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                >
                  <User size={20} />
                  <span className="font-medium">LOGIN / SIGNUP</span>
                </Link>
              )}

              {/* Cart */}
              <button
                onClick={() => navigate("/cart")}
                className="relative text-white dark:text-gray-200 hover:text-gray-300 dark:hover:text-gray-400 transition-colors p-2 hover:bg-white/10 rounded-lg group"
                aria-label="Shopping cart"
              >
                <div className="relative">
                  <ShoppingCart
                    size={24}
                    className="group-hover:scale-110 transition-transform"
                  />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center animate-pulse shadow-lg">
                      {cartCount}
                    </span>
                  )}
                </div>
                {isSyncing && (
                  <div className="absolute -bottom-1 right-0 w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full animate-pulse" />
                )}
              </button>

              {/* Shop Now Button */}
              <button
                onClick={() => navigate("/products")}
                className="bg-gradient-to-r from-white to-gray-100 dark:from-gray-800 dark:to-gray-700 text-[#0A1F33] dark:text-gray-100 px-6 py-2.5 rounded-full font-bold hover:bg-gradient-to-r hover:from-[#01A49E] hover:to-[#01857F] dark:hover:from-[#01A49E] dark:hover:to-[#01857F] hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 group flex items-center"
              >
                Shop Now
                <ChevronRight
                  size={16}
                  className="ml-2 group-hover:translate-x-1 transition-transform"
                />
              </button>
            </div>

            {/* Mobile Actions */}
            <div className="flex items-center space-x-2 lg:hidden">
              <button
                onClick={() => navigate("/cart")}
                className="relative text-white dark:text-gray-200 p-2"
                aria-label="Shopping cart"
              >
                <ShoppingCart size={24} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
              <div className="scale-75">
                <Switch checked={darkMode} onChange={toggleDarkMode} />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="lg:hidden mb-4">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full px-4 py-3 pl-10 pr-4 rounded-lg border-0 focus:ring-2 focus:ring-[#01A49E] dark:focus:ring-[#01A49E] focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 shadow-sm transition-colors"
            />
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
              size={18}
            />
          </form>
        </div>

        {/* Desktop Navigation */}
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
                className="flex items-center space-x-2 text-white dark:text-gray-200 hover:text-gray-300 dark:hover:text-gray-400 font-medium transition-colors group hover:bg-white/10 px-3 py-1 rounded-lg"
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

            {quickLinks.map((link, index) => (
              <Link
                key={index}
                to={link.path}
                className="text-white dark:text-gray-200 hover:text-gray-300 dark:hover:text-gray-400 font-medium transition-colors flex items-center group relative"
              >
                <span className="flex items-center">
                  {link.badge && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                      {link.badge}
                    </span>
                  )}
                  <link.icon
                    size={18}
                    className="group-hover:scale-110 transition-transform"
                  />
                  <span className="ml-2">{link.name}</span>
                </span>
              </Link>
            ))}
          </div>

          {/* Right Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            <Link
              to="/seller"
              className="text-white dark:text-gray-200 hover:text-gray-300 dark:hover:text-gray-400 font-medium transition-colors flex items-center group hover:bg-white/10 px-3 py-1 rounded-lg"
            >
              <Package
                size={18}
                className="mr-2 group-hover:scale-110 transition-transform"
              />
              Become Seller
            </Link>

            <div className="flex items-center space-x-6">
              <Link
                to="/contact"
                className="flex items-center space-x-2 hover:opacity-80 transition-opacity text-white dark:text-gray-200 hover:text-gray-300 dark:hover:text-gray-300 hover:bg-white/10 px-3 py-1 rounded-lg"
              >
                <PhoneCall size={20} />
                <span className="font-medium">Helpline</span>
              </Link>
            </div>

            <div className="flex items-center space-x-3 text-white dark:text-gray-200 bg-white/10 px-4 py-2 rounded-full">
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
          <div className="lg:hidden bg-white dark:bg-gray-800 rounded-2xl mt-3 p-4 shadow-2xl animate-slideDown backdrop-blur-sm">
            <div className="space-y-3">
              {/* User Info */}
              {isAuthenticated ? (
                <div className="p-4 bg-gradient-to-r from-[#01A49E]/10 to-blue-500/5 dark:from-[#01A49E]/20 dark:to-blue-900/10 rounded-xl mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-[#01A49E] to-[#01857F] rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-lg">
                        {user?.firstname?.charAt(0) ||
                          user?.name?.charAt(0) ||
                          "U"}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 dark:text-white capitalize">
                        {user?.firstname || user?.name || "User"}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Gold Member
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Dark Mode Toggle */}
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <span className="text-gray-900 dark:text-gray-100 font-medium">
                  Theme
                </span>
                <div className="scale-90">
                  <Switch checked={darkMode} onChange={toggleDarkMode} />
                </div>
              </div>

              {/* Quick Links */}
              <div className="grid grid-cols-2 gap-2">
                {quickLinks.map((link, index) => (
                  <Link
                    key={index}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <link.icon className="h-5 w-5 text-[#01A49E] mb-2" />
                    <span className="text-xs font-medium text-gray-900 dark:text-white">
                      {link.name}
                    </span>
                  </Link>
                ))}
              </div>

              {/* Main Menu */}
              <div className="space-y-1">
                <Link
                  to="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center py-3 px-4 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <House size={18} className="mr-3" />
                  Home
                </Link>
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center py-3 px-4 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <User size={18} className="mr-3" />
                      My Profile
                    </Link>
                    <Link
                      to="/orders"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center py-3 px-4 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <ShoppingBag size={18} className="mr-3" />
                      My Orders
                    </Link>
                    <Link
                      to="/wishlist"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center py-3 px-4 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Star size={18} className="mr-3" />
                      Wishlist
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center py-3 px-4 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <Shield size={18} className="mr-3" />
                        Admin Panel
                      </Link>
                    )}
                    <Link
                      to="/addproduct"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center py-3 px-4 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Package size={18} className="mr-3" />
                      Add Products
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full text-left py-3 px-4 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <LogOut size={18} className="mr-3" />
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center py-3 px-4 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <User size={18} className="mr-3" />
                    Login / Signup
                  </Link>
                )}

                <button
                  onClick={() => {
                    navigate("/cart");
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center w-full text-left py-3 px-4 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <ShoppingCart size={18} className="mr-3" />
                  Cart {cartCount > 0 && `(${cartCount})`}
                </button>
              </div>

             

              {/* Contact Info */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="px-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Hotline 24/7
                  </div>
                  <div className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-3">
                    9862463322
                  </div>
                  <button
                    onClick={() => {
                      navigate("/contact");
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full bg-gradient-to-r from-[#01A49E] to-[#01857F] text-white py-3 rounded-lg font-bold hover:opacity-90 transition-opacity"
                  >
                    Contact Support
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Access Bar */}
      <div className="bg-[#A40107] dark:bg-red-900 hidden lg:block w-full transition-colors duration-200">
        <div className="w-full px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-white dark:text-gray-200 text-sm">
            <div className="flex items-center space-x-6">
              <div className="flex items-center hover:text-gray-300 dark:hover:text-gray-300 transition-colors cursor-pointer group">
                <div className="p-1 bg-white/20 rounded-lg mr-2 group-hover:bg-white/30">
                  <Truck size={14} />
                </div>
                <span>Free Shipping on orders over ₹999</span>
              </div>
              <div className="flex items-center hover:text-gray-300 dark:hover:text-gray-300 transition-colors cursor-pointer group">
                <div className="p-1 bg-white/20 rounded-lg mr-2 group-hover:bg-white/30">
                  <Undo2 size={14} />
                </div>
                <span>30-Day Return Policy</span>
              </div>
              <div className="flex items-center hover:text-gray-300 dark:hover:text-gray-300 transition-colors cursor-pointer group">
                <div className="p-1 bg-white/20 rounded-lg mr-2 group-hover:bg-white/30">
                  <HandFist size={14} />
                </div>
                <span>24/7 Customer Support</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {isDemoUser && (
                  <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-xs font-medium">
                    Demo Mode
                  </span>
                )}
                {isAdmin && (
                  <span className="px-2 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full text-xs font-medium">
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