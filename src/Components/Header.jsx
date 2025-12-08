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
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const Header = () => {
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();

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

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            <button className="hidden lg:flex items-center space-x-2 text-white hover:text-gray-200 transition">
              <Link to="/login" className="flex items-center space-x-2">
                <User size={20} />
                <span>LOGIN</span>
              </Link>
            </button>

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

            <button className="hidden lg:block bg-white text-[#0A1F33] px-6 py-2 rounded-full font-semibold hover:bg-[#33BDB7] transition">
              <Link to="/">Shop Now</Link>
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
          <div className="lg:hidden bg-white rounded-xl mt-3 p-4 shadow-lg">
            <div className="space-y-4">
              <Link
                to="/"
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

              <Link
                to="/login"
                className="block py-2 px-4 text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                👤 Login
              </Link>
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
