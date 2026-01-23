import React, { useState, useEffect, useRef } from "react";//useState used to manage compoent state,useEffect used for managing side effects such as dark mode,useRef used for accessing DOM elements like search BOX INPUT
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
  ShoppingBag,
  Settings,
  LogOut,
  PhoneCall,
  Package,
  Shield,
  TrendingUp,
  Bell,
  MapPin,
  Star,
  ChevronRight,
  Clock,
  XCircle,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";//link is used for navigation without page reload or refreash and Navigation is used for page programmatic navigation
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import Switch from "./ui/Switch";
import toast from "react-hot-toast";
import Modal from "./ui/Modal";
import Button from "./ui/Button";//all the states and components
import Input from "./ui/Input";


//it is the main header component this doesn'T need props as all the data comes from contexts.
const HeaderClient = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { getCartCount } = useCart();
  const {
    searchResults,
    isSearching,
    showSearchResults,
    performSearch,
    clearSearch,
    setShowSearchResults,
  } = useSearch();

  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState("");
  const [darkMode, setDarkMode] = useState(false);
 const [showLogoutModal, setShowLogoutModal] = useState(false);

  const navigate = useNavigate();
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem("clientDarkMode") === "true";
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;//checks if user's operating system is in dark mode returns true of in  dark mode AND FALSE IF IT IN LIGHT MODE
    const initialDarkMode =
      savedDarkMode !== null ? savedDarkMode : systemPrefersDark;
//chck if user has previously selected dark mode or not,if yes use saved preference else use system preference
    setDarkMode(initialDarkMode);
    if (initialDarkMode) {
      document.documentElement.classList.add("dark");//adds dark class to html element,this uses all the dark element we have applied in the tailwind css and changes the theme to dark mode
    }
  }, []);//empty dependency array means it runs once when compoent mounts

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);//closes the dropdown when user click outside the search box//
        //searchref.current checks if searchbox is rendered
        //searchref.current.contains(event.target) checks if an element contains another element if search box contains the event target like clicking the search box which is true then we dont close the dropdown ,if no event or click outside the box we close the dropdown
   
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [setShowSearchResults]);

 

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;//true or false
    setDarkMode(newDarkMode);
    localStorage.setItem("clientDarkMode", newDarkMode.toString());//tostring( )convert boolen to string

    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }//if newdarkmode is true then add dark class to html element else remove dark class

    toast.success(newDarkMode ? "Dark mode enabled" : "Light mode enabled", {
      icon: newDarkMode ? "🌙" : "☀️",
    });
  };

  const cartCount = getCartCount();

  // const handleLogout = () => {
  //   toast((t) => (
  //     <div className="flex flex-col space-y-2">
  //       <p className="font-medium">Are you sure you want to logout?</p>
  //       <div className="flex flex-col space-y-3 justify-end">
  //         <button
  //           onClick={() => {
  //             logout();
  //             navigate("/login");
  //             toast.dismiss(t.id);
  //           }}
  //           className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
  //         >
  //           Yes, Logout
  //         </button>
  //         <button
  //           onClick={() => toast.dismiss(t.id)}
  //           className="px-3 py-1 bg-gray-700 dark:bg-gray-700 rounded hover:bg-gray-900 dark:hover:bg-gray-600"
  //         >
  //           Cancel
  //         </button>
  //       </div>
  //     </div>
  //   ));
  // };



   const handleLogoutConfirm = () => {
    logout();
    setShowLogoutModal(false);
    navigate("/login");
    toast.success("Logged out successfully!", {
      duration: 2000,
      position: "top-center",
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (localSearchQuery.trim()) {//trim removes the spaces before and after  the string.this checks if there is already search qwery in the search box
      performSearch(localSearchQuery);
      navigate(`/search?q=${encodeURIComponent(localSearchQuery)}`);
      setShowSearchResults(false);//closes the dropdown after navigating to the search result page
     
    }
  };

  const handleSearchChange = (e) => {//it runs when user types something in the search box like when we type m it shows all results and again if we type me it shows all results so on
    const value = e.target.value;
    setLocalSearchQuery(value);

    if (value.trim()) {
      performSearch(value);
    } else {
      setShowSearchResults(false);
    }
  };

  // Handle search result click - navigate to product details
  //when we click on the result item it navigates to the product details of that item
  const handleResultClick = (product) => {
    console.log("Navigating to product:", product.id); // Debug log
    navigate(`/products/${product.id}`);
    setShowSearchResults(false);
   
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
    }
  };

  const handleClearSearch = () => {
    setLocalSearchQuery("");
    clearSearch();
    searchInputRef.current?.focus();
  };

  const quickLinks = [
    { name: "Best Sellers", icon: TrendingUp, path: "/best-sellers" },
    { name: "Top Rated", icon: Star, path: "/top-rated" },
  ];

  return (
    <div>
    <header className="bg-[#0A1F33] dark:bg-gray-900 shadow-sm w-full transition-colors duration-200">
      <div className="w-full px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {/* //space-x-3 adds space between the elementsexpect the first element all elemnt have left margin as 12px */}
            <Button
            //lg:hidden is a class that is used to hide the button on large screens i.e when the screen size is greater than 1024px
            variant="ghost"
              className="lg:hidden text-white dark:text-gray-200 hover:text-gray-300 dark:hover:text-gray-400 transition-colors p-2 hover:bg-white/10 rounded-lg"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              onBlur={() => setTimeout(() => setIsMobileMenuOpen(false), 200)}
              aria-label="Toggle mobile menu"
              data-testid="toggle-mobile-menu"
              iconOnly
              icon={isMobileMenuOpen ? <X size={24} />: <Menu size={24} />}
            />
             
           
            <Link
              to="/"
              className=" hover:opacity-90 transition-opacity"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-[#01A49E] to-teal-600 dark:from-[#01A49E] dark:to-teal-700 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow animate-pulse-glow">
                <span className="text-white font-bold text-3xl">S</span>
              </div>
               </Link>
              <div className="ml-3">
                <h1 className="text-2xl font-bold text-white dark:text-gray-100 bg-gradient-to-r from-white to-gray-300 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                  {/* bg-clip-text allows us to make the gradient only show through the text  and text-transparent makes the text transparent so gradient shows through*/}

                  SWOO TECH MART
                </h1>
              </div>
           
          </div>
          <div className="hidden lg:flex flex-1 max-w-2xl mx-8" ref={searchRef}
          //flex-1 makes the element take up all the available space in the flex container,
          //flex-1-grow makes the element take up all the available space in the flex container and flex-1-shrink can shrunk the element to fit the available space in the flex container  ref={searchRef} is used for clicking outside the search input to close the search results
          >
            <div className="w-full relative">
              <form onSubmit={handleSearch} className="relative"
           
              >
                <div
                  className={`relative transition-all duration-300`}
                >
                  <Input
                     data-testid="search-input"
                    ref={searchInputRef}//used to focus input programmatically
                    type="text"
                    value={localSearchQuery}//stores the input data 
                    onChange={handleSearchChange} //fucntion to run when user types
                   
                    placeholder="Search for products, brands, or categories..."
                    className="w-full px-12 py-3 rounded-full border-0 focus:ring-2 focus:ring-[#01A49E] dark:focus:ring-[#01A49E] focus:ring-opacity-50 focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 shadow-lg hover:shadow-xl transition-all duration-300"
                    leftIcon={<Search size={20} className="text-gray-500"/>}
                    rightIcon= {localSearchQuery && (
                    
                      <XCircle size={20} className="text-gray-500"/>
                  )} 
                  onRightIconClick={handleClearSearch}
                    // rightIcon={<XCircle size={20} className="text-gray-500"/>}
                  
                  />
                  {/* <Button
                  variant="ghost"
                  iconOnly
                    data-testid="search-button"
                    type="submit"
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400   "
                    aria-label="Search"
                    icon={<Search size={20} />}
                  /> */}
                 

                  {/* {localSearchQuery && (
                    <button
                      data-testid="clear-search-button"
                      type="button"
                      onClick={handleClearSearch}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      aria-label="Clear search"
                    >
                      <XCircle size={20} />
                    </button>
                  )} */}
                </div>
              </form>

              {showSearchResults && (
                <div className="absolute top-full mt-2 w-full bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 animate-fadeIn backdrop-blur-sm max-h-[450px] overflow-hidden">
                  <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {isSearching
                          ? "Searching..."
                          : searchResults.length > 0
                          ? `Found ${searchResults.length} results`
                          : "No results found"}
                      </h3>
                    
                    </div>

                    {isSearching ? (
                      <div className="flex justify-center items-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-[#01A49E]" />
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2"//overflow-y-auto adds the vertical scroll bar if the content is taller than the container
                      // 
                      
                      >
                        {searchResults.map((product) => (
                          <button
                          data-testid="search-result-item"
                            key={product.id}
                            onClick={() => {
                              navigate(`/products/${product?.id}`);
                              handleClearSearch();
                            }}
                            className="flex items-center w-full p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors group"//here group is a special class that is used to group elements together like if we want to add hover effects to a group of elements inside the button then we cqn use it 
                          >
                            <div className="relative w-12 h-12 flex-shrink-0">
                              <img
                                src={product.image}
                                alt={product.title}
                                className="w-full h-full object-contain rounded-lg border border-gray-200 dark:border-gray-600 p-1 bg-white"//object contain fits inside container,may also have space
                                onError={(e) => {
                                  e.target.src =
                                    "https://via.placeholder.com/100x100?text=Product";
                                }}
                              />
                            </div>
                            <div className="ml-3 flex-1 text-left min-w-0"
                            //min-w-0 makes the element shrink to fit its content and long text will be truncated
                            >
                              <p className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-[#01A49E] transition-colors line-clamp-1 text-sm"
                              //line-clamp-1 limits the number of lines to 1 and truncates the text which overflow to next line
                              >
                                {product.title}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-sm font-bold text-[#01A49E]">
                                  ${product.price}
                                </span>
                                <div className="flex items-center gap-1">
                                  <Star
                                    size={12}
                                    className="text-yellow-500 fill-current"
                                  />
                                  <span className="text-xs text-gray-600 dark:text-gray-400">
                                    {product.rating?.rate || 0}
                                  </span>
                                </div>
                              </div>
                              <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block truncate">
                                {product.category}
                              </span>
                            </div>
                            <ChevronRight
                              size={16}
                              className="text-gray-400 group-hover:text-[#01A49E] transition-colors flex-shrink-0 ml-2"
                            />
                          </button>
                        ))}
                      </div>
                    ) : (
                      localSearchQuery.trim() && (
                        <div className="py-8 text-center">
                          <Search
                            size={48}
                            className="mx-auto text-gray-300 dark:text-gray-600 mb-3"
                          />
                          <p className="text-gray-600 dark:text-gray-400">
                            No results found for "
                            <span className="font-semibold">
                              {localSearchQuery}
                            </span>
                            "
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                            Try different keywords....
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden lg:flex items-center">
            
              <Switch  checked={darkMode} onChange={toggleDarkMode} />
            </div>

            <div className="hidden lg:flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <Button
                variant="ghost"
                  onClick={() => navigate("/track-order")}
                  className="text-white dark:text-gray-200 hover:text-gray-300 dark:hover:text-gray-400 transition-colors p-2 hover:bg-white/10 rounded-lg "
                  aria-label="Track Order"
                  icon={ <MapPin size={20} />}
                  iconOnly
                />
                 
               
                <Button
                variant="ghost"
                  className="text-white dark:text-gray-200 hover:text-gray-300 dark:hover:text-gray-400 transition-colors hover:bg-white/10 rounded-lg relative"
                  aria-label="Notifications"
                  icon={<Bell size={20} />}
                  iconOnly
                />
              </div>

              {isAuthenticated ? (
                <div className="relative">
                  <button
                  data-testid="user-button"
                    onClick={() => setShowDropdown(!showDropdown)}
                    onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                    className="flex items-center space-x-2 cursor-pointer focus:outline-none text-white dark:text-gray-200 hover:text-gray-300 dark:hover:text-gray-400 transition-colors p-2 hover:bg-white/10 rounded-lg group"
                    aria-label="User menu"
                  >
                      {!showDropdown && (
                  <div className="flex items-center space-x-2 ">
                    <div className="w-8 h-8 bg-gradient-to-r from-[#01A49E] to-[#01857F] rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                      <span className="text-white font-medium text-sm">
                        {user?.firstname?.charAt(0) ||
                          user?.name?.charAt(0) ||
                          "U"}
                      </span>
                    </div>
                     
                      
                    <div className="font-medium capitalize hidden xl:inline">
                      {user?.firstname || user?.name || "User"}
                    </div>
                    </div>
         )}
                    {showDropdown && (
                      <div>
                      <span className="font-medium capitalize hidden xl:inline">
                      Close
                    </span>
                    </div>
                    )}
                    <ChevronDown
                      size={16}
                      className={`transition-transform hidden xl:inline ${
                        showDropdown ? "rotate-180" : ""
                      }`}
                    />   
                  </button>

                  {showDropdown && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 animate-fadeIn backdrop-blur-sm"
                    //right-0 keeps it aligned to right edge of the parebt button which is this user button//top-full keeps the dropdown below the user button
                    
                    >
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
                              {user?.name || "User"}
                            </p>

                            <div className="flex items-center space-x-2 mt-2">
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
                        {/* <Button
                        variant="ghost"
                       onClick={() => setShowDropdown(false)}
                          className="flex items-center w-full text-left px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-[#01A49E] dark:hover:text-[#01A49E] transition-colors group"
                          leftIcon={<User size={18} className="mr-3" />}
                          rightIcon={<ChevronRight size={16} className="opacity-50" />}
                        
                        
                        
                        >My Profile</Button> */}
                        <Link
                          to="/profile"
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-[#01A49E] dark:hover:text-[#01A49E] transition-colors group"
                        >
                          <User size={18} className="mr-3" />
                          <div className="flex-1">
                            <span>My Profile</span>
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
                            </div>
                            <ChevronRight size={16} className="opacity-50" />
                          </Link>
                        )}
                        <Link
                          to="/settings"
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-[#01A49E] dark:hover:text-[#01A49E] transition-colors group"
                        >
                          <Settings size={18} className="mr-3" />
                          <div className="flex-1">
                            <span>Settings</span>
                          </div>
                          <ChevronRight size={16} className="opacity-50" />
                        </Link>
                      </div>

                      <div className="border-t border-gray-100 dark:border-gray-700 pt-2 pb-2">
                        <Button
                        variant="danger"
                          onClick={()=>{ setShowLogoutModal(true);}}
                          className="flex items-center space-x-2 rounded-lg w-full px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-gray-700 transition-colors group"
                          icon={<LogOut size={18} className="mr-3" />}
                        >
                          
                          <span>Logout</span>
                        </Button>
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
              data-testid="cart-button"
                onClick={() => navigate("/cart")}
                className="relative text-white dark:text-gray-200 hover:text-gray-300 dark:hover:text-gray-400 transition-colors p-2 hover:bg-white/10 rounded-lg group"
                aria-label="Shopping cart"
              >
                <div className="relative">
                  <ShoppingCart
                    size={35}
                    className="group-hover:scale-110 transition-transform hover:text-blue-300 dark:hover:text-gray-400"
                  />
                  {cartCount > 0 && (
                    <span
                    data-testid="cart-count"
                    className="absolute -top-4 -right-3 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center animate-pulse shadow-lg">
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
                <ShoppingCart
                  size={35}
                  className="group-hover:scale-110 transition-transform hover:text-blue-300 dark:hover:text-gray-400"
                />
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
             <div className="w-full relative">
              <form onSubmit={handleSearch} className="relative"
           
              >
                <div
                  className={`relative transition-all duration-300`}
                >
                  <Input
                     data-testid="mobile-search-input"
                    ref={searchInputRef}//used to focus input programmatically
                    type="text"
                    value={localSearchQuery}//stores the input data 
                    onChange={handleSearchChange} //fucntion to run when user types
                   
                    placeholder="Search for products, brands, or categories..."
                    className="w-full px-12 py-3 rounded-full border-0 focus:ring-2 focus:ring-[#01A49E] dark:focus:ring-[#01A49E] focus:ring-opacity-50 focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 shadow-lg hover:shadow-xl transition-all duration-300"
                    leftIcon={<Search size={20} className="text-gray-500"/>}
                    rightIcon= {localSearchQuery && (
                    
                      <XCircle size={20} className="text-gray-500"/>
                  )} 
                  onRightIconClick={handleClearSearch}
                    // rightIcon={<XCircle size={20} className="text-gray-500"/>}
                  
                  />
                  {/* <Button
                  variant="ghost"
                  iconOnly
                    data-testid="search-button"
                    type="submit"
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400   "
                    aria-label="Search"
                    icon={<Search size={20} />}
                  /> */}
                 

                  {/* {localSearchQuery && (
                    <button
                      data-testid="clear-search-button"
                      type="button"
                      onClick={handleClearSearch}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      aria-label="Clear search"
                    >
                      <XCircle size={20} />
                    </button>
                  )} */}
                </div>
              </form>

              {showSearchResults && (
                <div className="absolute top-full mt-2 w-full bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 animate-fadeIn backdrop-blur-sm max-h-[450px] overflow-hidden">
                  <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {isSearching
                          ? "Searching..."
                          : searchResults.length > 0
                          ? `Found ${searchResults.length} results`
                          : "No results found"}
                      </h3>
                    
                    </div>

                    {isSearching ? (
                      <div className="flex justify-center items-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-[#01A49E]" />
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2"//overflow-y-auto adds the vertical scroll bar if the content is taller than the container
                      // 
                      
                      >
                        {searchResults.map((product) => (
                          <button
                          data-testid="search-result-item"
                            key={product.id}
                            onClick={() => {
                              navigate(`/products/${product?.id}`);
                              handleClearSearch();
                            }}
                            className="flex items-center w-full p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors group"//here group is a special class that is used to group elements together like if we want to add hover effects to a group of elements inside the button then we cqn use it 
                          >
                            <div className="relative w-12 h-12 flex-shrink-0">
                              <img
                                src={product.image}
                                alt={product.title}
                                className="w-full h-full object-contain rounded-lg border border-gray-200 dark:border-gray-600 p-1 bg-white"//object contain fits inside container,may also have space
                                onError={(e) => {
                                  e.target.src =
                                    "https://via.placeholder.com/100x100?text=Product";
                                }}
                              />
                            </div>
                            <div className="ml-3 flex-1 text-left min-w-0"
                            //min-w-0 makes the element shrink to fit its content and long text will be truncated
                            >
                              <p className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-[#01A49E] transition-colors line-clamp-1 text-sm"
                              //line-clamp-1 limits the number of lines to 1 and truncates the text which overflow to next line
                              >
                                {product.title}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-sm font-bold text-[#01A49E]">
                                  ${product.price}
                                </span>
                                <div className="flex items-center gap-1">
                                  <Star
                                    size={12}
                                    className="text-yellow-500 fill-current"
                                  />
                                  <span className="text-xs text-gray-600 dark:text-gray-400">
                                    {product.rating?.rate || 0}
                                  </span>
                                </div>
                              </div>
                              <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block truncate">
                                {product.category}
                              </span>
                            </div>
                            <ChevronRight
                              size={16}
                              className="text-gray-400 group-hover:text-[#01A49E] transition-colors flex-shrink-0 ml-2"
                            />
                          </button>
                        ))}
                      </div>
                    ) : (
                      localSearchQuery.trim() && (
                        <div className="py-8 text-center">
                          <Search
                            size={48}
                            className="mx-auto text-gray-300 dark:text-gray-600 mb-3"
                          />
                          <p className="text-gray-600 dark:text-gray-400">
                            No results found for "
                            <span className="font-semibold">
                              {localSearchQuery}
                            </span>
                            "
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                            Try different keywords....
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
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
                      <p 
                      data-testid="mobile-menu-username"
                      className="font-bold text-gray-900 dark:text-white capitalize">
                        {user?.firstname || user?.name || "User"}
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
                data-testid="mobile-menu-home"
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
                     data-testid="mobile-menu-profile"
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
                    {isAdmin && (
                      <Link
                       data-testid="mobile-menu-admin-panel"
                        to="/admin/dashboard"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center py-3 px-4 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <Shield size={18} className="mr-3" />
                        Admin Panel
                      </Link>
                    )}
                    <Link
                     data-testid="mobile-menu-setting"
                      to="/setting"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center py-3 px-4 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Package size={18} className="mr-3" />
                      Setting
                    </Link>
                    <button
                     data-testid="mobile-menu-logout"
                      onClick={()=>{ setShowLogoutModal(true); setIsMobileMenuOpen(false) }}
                      
                      className="flex items-center w-full text-left py-3 px-4 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <LogOut size={18} className="mr-3" />
                      Logout
                    </button>
                  </>
                ) : (
                 <button
                     data-testid="mobile-menu-login"
                    onClick={() =>{ setIsMobileMenuOpen(false)
                    navigate("/login")}
                    }
                    className="flex items-center py-3 px-4 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <User size={18} className="mr-3" />
                    Login / Signup
                  </button>
                )}
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
            {/* Logout Confirmation Modal
            should be outside the header beacuse if now it will show over the header and not visible in movile screen mode,
            */}
      <Modal
        isOpen={showLogoutModal}
        // onClose={() => setShowLogoutModal(false)} 
        title="Confirm Logout"
        size="small"
        hideCloseButton
      >
        <div className="space-y-4">
          {/* Icon and Message */}
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
               
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Are you sure you want to logout? You will need to sign in again
                to access the admin panel.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              data-testid="logout-cancel-button"
              variant="secondary"
              fullWidth
              onClick={() => setShowLogoutModal(false)} 
            >
              Cancel
            </Button>
            <Button
              data-testid="logout-confirm-button"
              variant="danger"
              fullWidth
              onClick={handleLogoutConfirm}
              icon={<LogOut className="h-5 w-5" />}
              iconPosition="left"
            >
              Yes, Logout
            </Button>
          </div>
        </div>
      </Modal>
    </div>
    
    
  );
};

export default HeaderClient;
