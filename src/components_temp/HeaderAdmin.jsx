// src/components/layout/HeaderAdmin.jsx
import React, { useState, useEffect } from "react";
import { Bell, Search, Menu, Moon, Sun } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";
import Switch from "./ui/Switch";
import Button from "./ui/Button";

const HeaderAdmin = ({ onMenuClick }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [notifications] = useState([
    { id: 1, message: "New order received", time: "2 min ago", read: false },
    { id: 2, message: "Product out of stock", time: "2 hour ago", read: false },
    {
      id: 3,
      message: "Monthly report ready",
      time: "12 hours ago",
      read: true,
    },
  ]);

  // Initialize dark mode
  useEffect(() => {
    const savedDarkMode = localStorage.getItem("adminDarkMode") === "true";
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
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

  const unreadNotifications = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left section */}
          <div className="flex items-center">
            <button
              data-testid="mobile-menu-button"
              onClick={onMenuClick}
              className="lg:hidden mr-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Menu className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </button>

            <div className="hidden md:block">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Welcome back, {user?.firstname || user?.name || "Admin"} 👋
              </h2>
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-3">
            <Button
              variant="admin"
              classname="mr-2 bg-green-600 hover:bg-blue-700"
              onClick={() => navigate("/")}
            >
              Client Panel
            </Button>

            <div data-testid="dark-mode-toggle" className="flex items-center">
              <Switch checked={darkMode} onChange={toggleDarkMode} />
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                data-testid="notification-button"
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
                <div
                  data-testid="notification-dropdown"
                  className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50"
                >
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
                    <button
                      data-testid="view-all-notifications-button"
                      className="text-sm text-[#01A49E] dark:text-[#01A49E] hover:text-[#01857F] w-full text-center"
                    >
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User profile */}
            <div className="relative">
              <button
                data-testid="profile-button"
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
