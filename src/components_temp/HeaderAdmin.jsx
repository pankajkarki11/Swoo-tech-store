// src/components/layout/HeaderAdmin.jsx
import React, { useState, useEffect } from "react";
import {
  Bell,
  Search,
  Menu,
  Moon,
  Sun,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";

const HeaderAdmin = ({ onMenuClick }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const { user, logout, isDemoUser } = useAuth();
  const navigate = useNavigate();

  const [notifications] = useState([
    { id: 1, message: "New order received", time: "2 min ago", read: false },
    { id: 2, message: "Product out of stock", time: "2 hour ago", read: false },
    { id: 3, message: "Monthly report ready", time: "12 hours ago", read: true },
  ]);

  // Initialize dark mode
  useEffect(() => {
    const savedDarkMode = localStorage.getItem("adminDarkMode") === "true";
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
    localStorage.setItem("adminDarkMode", newDarkMode.toString());

    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    toast.success(newDarkMode ? "Dark mode enabled" : "Light mode enabled", {
      icon: newDarkMode ? "🌙" : "☀️",
    });
  };

  const handleLogout = () => {
    toast((t) => (
      <div className="flex flex-col space-y-2">
        <p className="font-medium">Are you sure you want to logout?</p>
        <div className="flex space-x-2 justify-end">
          <button
            onClick={() => {
              logout();
              navigate("/admin/login");
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

  const unreadNotifications = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left section */}
          <div className="flex items-center">
            <button
              onClick={onMenuClick}
              className="lg:hidden mr-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Menu className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </button>

            {searchOpen ? (
              <div className="flex-1 max-w-xl">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#01A49E]"
                    autoFocus
                    onBlur={() => setSearchOpen(false)}
                  />
                </div>
              </div>
              
            ) : (
              <div className="hidden md:block">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Welcome back, {user?.firstname || user?.name || "Admin"} 👋
                </h2>
              </div>
            )}
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-3">
            {/* Search button */}
            <button
              onClick={() => setSearchOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Search className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </button>

            {/* Dark mode toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {darkMode ? (
                <Sun className="h-5 w-5 text-yellow-500" />
              ) : (
                <Moon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              )}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative"
              >
                <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
                    {unreadNotifications}
                  </span>
                )}
              </button>

              {/* Notifications dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Notifications ({notifications.length})
                    </h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                          !notification.read
                            ? "bg-blue-50 dark:bg-blue-900/20"
                            : ""
                        }`}
                      >
                        <p className="text-sm text-gray-900 dark:text-white">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {notification.time}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
                    <button className="text-sm text-[#01A49E] dark:text-[#01A49E] hover:text-[#01857F] w-full text-center">
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User profile */}
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="h-8 w-8 bg-gradient-to-br from-[#01A49E] to-[#01857F] rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {user?.firstname?.charAt(0) || user?.name?.charAt(0) || "A"}
                  </span>
                </div>
                <div className="hidden md:block text-left">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {user?.firstname || user?.name || "Admin"}
                  </span>
                  <div className="flex items-center space-x-1">
                    <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                      {user?.role || "Admin"}
                    </span>
                    {isDemoUser && (
                      <span className="text-xs px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full">
                        Demo
                      </span>
                    )}
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeaderAdmin;
