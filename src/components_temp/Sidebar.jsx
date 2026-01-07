// src/components/layout/Sidebar.jsx
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import Button from "./ui/Button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";

import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  ShoppingBag,
  User,
} from "lucide-react";

const Sidebar = ({ isOpen, onClose }) => {
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { path: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/admin/products", icon: Package, label: "Products" },
    { path: "/admin/carts", icon: ShoppingCart, label: "Carts" },
    { path: "/admin/users", icon: Users, label: "Users" },
  ];

  const { user, logout, } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Created a custom toast component
    const LogoutConfirmation = ({ t }) => (
      <div
       role="dialog"
        className={`${
          t.visible ? "animate-enter" : "animate-leave"
        } max-w-md w-full bg-gray-300 dark:bg-gray-600 shadow-lg rounded-lg pointer-events-auto flex flex-col ring-1 ring-black dark:ring-gray-700 ring-opacity-5`}
      >
        {/* Toast Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                <LogOut className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Confirm Logout
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                Are you sure you want to logout?
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex p-4 gap-3">
          <button
            onClick={() => {toast.dismiss(t.id)}}
            className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              logout();
              navigate("/admin/login");
              toast.dismiss(t.id);
              toast.success("Logged out successfully!", {
                duration: 1000,
                position: "top-center",
              });
            }}
            className="flex-1 px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 shadow-md hover:shadow-lg"
          >
            Yes, Logout
          </button>
        </div>
      </div>
    );

    
    toast.custom((t) => <LogoutConfirmation t={t} />, {
     
      position: "top-center", 
      style: {
        maxWidth: "28rem",
        margin: "0 auto",
      },
    });
  };

  const sidebarClass = collapsed ? "w-20" : "w-64";

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-white dark:bg-gray-800 
          border-r border-gray-200 dark:border-gray-700
          shadow-xl z-40 transition-all duration-300
          ${sidebarClass}
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 h-16">
          {!collapsed ? (
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <ShoppingBag className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                SwooTechMart
              </span>
            </div>
          ) : (
            <div></div>
          )}

          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="small"
              className="hidden lg:inline-flex"
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <ChevronLeft className="h-5 w-5" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="small"
              className="lg:hidden"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) => `
                flex items-center px-3 py-2.5 rounded-lg transition-all duration-200
                ${
                  isActive
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }
              `}
            >
              <item.icon className="h-5 w-5" />
              {!collapsed && (
                <span className="ml-3 font-medium">{item.label}</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User info & Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
          {!collapsed ? (
            <div className="flex items-center space-x-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                {user?.name?.charAt(0) || user?.username?.charAt(0) ? (
                  <span className="text-white font-bold">
                    {(
                      user?.name?.charAt(0) || user?.username?.charAt(0)
                    ).toUpperCase()}
                  </span>
                ) : (
                  <User className="h-5 w-5 text-white" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user?.name || user?.username || "Admin User"}
                </p>
                
              </div>
            </div>
          ) : (
            <div className="flex justify-center mb-4">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                {user?.name?.charAt(0) || user?.username?.charAt(0) ? (
                  <span className="text-white font-bold">
                    {(
                      user?.name?.charAt(0) || user?.username?.charAt(0)
                    ).toUpperCase()}
                  </span>
                ) : (
                  <User className="h-5 w-5 text-white" />
                )}
              </div>
            </div>
          )}

          <Button
            variant="danger"
            fullWidth
            onClick={handleLogout}
            className={collapsed ? "justify-center" : ""}
            icon={<LogOut className="h-5 w-5" />}
          >
            
            {!collapsed && <span className="ml-2">Logout</span>}
          </Button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
