import React, { useState, useEffect, useRef } from "react";
import { useSearch } from "../contexts/SearchContext";
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
  Clock,
  XCircle,
  Loader2,
  ArrowRight,
  ExternalLink
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import Switch from "./ui/Switch";
import toast from "react-hot-toast";

const HeaderClient = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { getCartCount } = useCart();
  const { 
    searchResults, 
     
    isSearching, 
    showSearchResults, 
    recentSearches,
    performSearch, 
    clearSearch, 
    clearRecentSearches,
    setShowSearchResults 
  } = useSearch();
  
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
        setIsSearchExpanded(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [setShowSearchResults]);

  useEffect(() => {
    if (isSearchExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchExpanded]);

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
        <div className="flex flex-col space-y-3 justify-end">
          <button
            onClick={() => {
              logout();
              navigate("/login");
              toast.dismiss(t.id);
            }}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Yes, Logout
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
    if (localSearchQuery.trim()) {
      performSearch(localSearchQuery);
      navigate(`/search?q=${encodeURIComponent(localSearchQuery)}`);
      setShowSearchResults(false);
      setIsSearchExpanded(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setLocalSearchQuery(value);
    
    if (value.trim()) {
      performSearch(value);
    } else {
      setShowSearchResults(false);
    }
  };

  // Handle search result click - navigate to product details
  const handleResultClick = (product) => {
    console.log('Navigating to product:', product.id); // Debug log
    navigate(`/products/${product.id}`);
    setShowSearchResults(false);
    setIsSearchExpanded(false);
    setLocalSearchQuery("");
    
    // Show success toast
    toast.success(`Viewing ${product.title}`, {
      icon: "🔍",
      duration: 2000,
    });
  };

  // Handle "View All Results" click
  const handleViewAllResults = () => {
    if (localSearchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(localSearchQuery)}`);
      setShowSearchResults(false);
      setIsSearchExpanded(false);
    }
  };

  const handleRecentSearchClick = (query) => {
    setLocalSearchQuery(query);
    performSearch(query);
    searchInputRef.current?.focus();
  };

  const handleClearSearch = () => {
    setLocalSearchQuery("");
    clearSearch();
    searchInputRef.current?.focus();
  };

  const handleCategoryClick = (categoryName) => {
    setIsMobileMenuOpen(false);
    navigate(`/products?category=${encodeURIComponent(categoryName)}`);
  };

  const quickLinks = [
    { name: "Daily Deals", icon: Tag, path: "/deals", badge: "🔥" },
    { name: "New Arrivals", icon: Zap, path: "/new-arrivals", badge: "NEW" },
    { name: "Best Sellers", icon: TrendingUp, path: "/best-sellers" },
    { name: "Clearance", icon: Gift, path: "/clearance", badge: "SALE" },
  ];

  return (
    <header className="bg-[#0A1F33] dark:bg-gray-900 shadow-sm w-full transition-colors duration-200">
      <div className="w-full px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <button
              className="lg:hidden text-white dark:text-gray-200 hover:text-gray-300 dark:hover:text-gray-400 transition-colors p-2 hover:bg-white/10 rounded-lg"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              onBlur={() => setTimeout(() => setIsMobileMenuOpen(false), 200)}
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
              </div>
            </Link>
          </div>

          <div className="hidden lg:flex flex-1 max-w-2xl mx-8" ref={searchRef}>
            <div className="w-full relative">
              <form onSubmit={handleSearch} className="relative">
                <div className={`relative transition-all duration-300 ${isSearchExpanded ? 'w-full' : 'w-full'}`}>
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={localSearchQuery}
                    onChange={handleSearchChange}
                    onFocus={() => {
                      if (localSearchQuery.trim()) {
                        setShowSearchResults(true);
                      }
                      setIsSearchExpanded(true);
                    }}
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
                  
                  {localSearchQuery && (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      aria-label="Clear search"
                    >
                      <XCircle size={20} />
                    </button>
                  )}
                </div>
              </form>

              {showSearchResults && (
                <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 animate-fadeIn backdrop-blur-sm max-h-[600px] overflow-hidden">
                  <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {isSearching ? 'Searching...' : searchResults.length > 0 ? `Found ${searchResults.length} results` : 'No results found'}
                      </h3>
                      {!localSearchQuery && (
                        <button
                          onClick={clearRecentSearches}
                          className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        >
                          Clear history
                        </button>
                      )}
                    </div>
                    

                    {isSearching ? (
                      <div className="flex justify-center items-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-[#01A49E]" />
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                        {searchResults.slice(0, 8).map((product) => (
                          <button
                            key={product.id}
                             onClick={() =>{ navigate(`/products/${product?.id}`);
                              handleClearSearch();
                             }}
                            className="flex items-center w-full p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors group"
                          >
                            <div className="relative w-12 h-12 flex-shrink-0">
                              <img
                                src={product.image}
                                alt={product.title}
                                className="w-full h-full object-contain rounded-lg border border-gray-200 dark:border-gray-600 p-1 bg-white"
                                onError={(e) => {
                                  e.target.src = "https://via.placeholder.com/100x100?text=Product";
                                }}
                              />
                            </div>
                            <div className="ml-3 flex-1 text-left min-w-0">
                              <p className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-[#01A49E] transition-colors line-clamp-1 text-sm">
                                {product.title}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-sm font-bold text-[#01A49E]">
                                  ${product.price}
                                </span>
                                <div className="flex items-center gap-1">
                                  <Star size={12} className="text-yellow-500 fill-current" />
                                  <span className="text-xs text-gray-600 dark:text-gray-400">
                                    {product.rating?.rate || 0}
                                  </span>
                                </div>
                              </div>
                              <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block truncate">
                                {product.category}
                              </span>
                            </div>
                            <ChevronRight size={16} className="text-gray-400 group-hover:text-[#01A49E] transition-colors flex-shrink-0 ml-2" />
                          </button>
                        ))}
                      </div>
                    ) : localSearchQuery.trim() && (
                      <div className="py-8 text-center">
                        <Search size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                        <p className="text-gray-600 dark:text-gray-400">
                          No results found for "<span className="font-semibold">{localSearchQuery}</span>"
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                          Try different keywords or browse categories
                        </p>
                      </div>
                    )}

                    {searchResults.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 space-y-2">
                        <button
                          onClick={handleViewAllResults}
                          className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-[#01A49E] to-[#01857F] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                        >
                          View All {searchResults.length} Results
                          <ArrowRight size={16} />
                        </button>
                        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                          Click on any product to view details
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden lg:flex items-center">
              <Switch checked={darkMode} onChange={toggleDarkMode} />
            </div>

            <div className="hidden lg:flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => navigate("/deals")}
                  className="text-white dark:text-gray-200 hover:text-gray-300 dark:hover:text-gray-400 transition-colors p-2 hover:bg-white/10 rounded-lg group relative"
                  aria-label="Deals"
                >
                  <Tag size={20} />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
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
                    <span className="absolute -top-4 -right-3 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center animate-pulse shadow-lg">
                      {cartCount}
                    </span>
                  )}
                </div>
              </button>
            </div>

            <div className="flex items-center space-x-2 lg:hidden">
              <div className="scale-75">
                <Switch checked={darkMode} onChange={toggleDarkMode} />
              </div>
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
            </div>
          </div>
        </div>

        <div className="lg:hidden mb-4" ref={searchRef}>
          <form onSubmit={handleSearch} className="relative">
            <input
              ref={searchInputRef}
              type="text"
              value={localSearchQuery}
              onChange={handleSearchChange}
              onFocus={() => {
                if (localSearchQuery.trim() || recentSearches.length > 0) {
                  setShowSearchResults(true);
                }
              }}
              placeholder="Search products..."
              className="w-full px-4 py-3 pl-10 pr-10 rounded-lg border-0 focus:ring-2 focus:ring-[#01A49E] dark:focus:ring-[#01A49E] focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 shadow-sm transition-colors"
            />
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
              size={18}
            />
            
            {localSearchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                aria-label="Clear search"
              >
                <XCircle size={18} />
              </button>
            )}
          </form>

          {showSearchResults && (
            <div className="absolute left-4 right-4 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 animate-fadeIn max-h-[500px] overflow-y-auto">
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    {isSearching ? 'Searching...' : searchResults.length > 0 ? `Results (${searchResults.length})` : recentSearches.length > 0 ? 'Recent Searches' : 'No results'}
                  </h3>
                  <button
                    onClick={() => setShowSearchResults(false)}
                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    <X size={20} />
                  </button>
                </div>

                {!localSearchQuery && recentSearches.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Recent</p>
                    <div className="space-y-2">
                      {recentSearches.map((search, index) => (
                        <button
                          key={index}
                          onClick={() => handleRecentSearchClick(search.query)}
                          className="flex items-center gap-3 w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
                        >
                          <Clock size={16} className="text-gray-500" />
                          <span className="text-sm">{search.query}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {isSearching ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-[#01A49E]" />
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="space-y-3">
                    {searchResults.slice(0, 5).map((product) => (
                      <button
                        key={product.id}
                        onClick={() => handleResultClick(product)}
                        className="flex items-center w-full p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <img
                          src={product.image}
                          alt={product.title}
                          className="w-10 h-10 object-contain rounded-lg"
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/100x100?text=Product";
                          }}
                        />
                        <div className="ml-3 flex-1 text-left">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-1">
                            {product.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-[#01A49E] font-bold">
                              ${product.price}
                            </p>
                            <div className="flex items-center gap-1">
                              <Star size={10} className="text-yellow-500 fill-current" />
                              <span className="text-xs text-gray-600 dark:text-gray-400">
                                {product.rating?.rate || 0}
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                    
                    {searchResults.length > 5 && (
                      <button
                        onClick={handleViewAllResults}
                        className="flex items-center justify-center gap-2 w-full py-3 text-center text-[#01A49E] font-medium border-t border-gray-100 dark:border-gray-700"
                      >
                        View all {searchResults.length} results
                        <ExternalLink size={14} />
                      </button>
                    )}
                  </div>
                ) : localSearchQuery.trim() && (
                  <div className="py-6 text-center">
                    <Search size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      No results found
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
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
                  className={`transition-transform group-hover:scale-110`}
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

        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white dark:bg-gray-800 rounded-2xl mt-3 p-4 shadow-2xl animate-slideDown backdrop-blur-sm">
            <div className="space-y-3">
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
                      to="/setting"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center py-3 px-4 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Package size={18} className="mr-3" />
                      Setting
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
              </div>

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