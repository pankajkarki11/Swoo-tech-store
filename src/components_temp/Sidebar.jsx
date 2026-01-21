// src/components/layout/Sidebar.jsx
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import Button from "../components_temp/ui/Button";
import Modal from "../components_temp/ui/Modal";
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
  AlertTriangle,
} from "lucide-react";

const Sidebar = ({ isOpen, onClose }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const navItems = [
    { path: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/admin/products", icon: Package, label: "Products" },
    { path: "/admin/carts", icon: ShoppingCart, label: "Carts" },
    { path: "/admin/users", icon: Users, label: "Users" },
  ];

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = () => {
    logout();
    setShowLogoutModal(false);
    navigate("/admin/login");
    toast.success("Logged out successfully!", {
      duration: 2000,
      position: "top-center",
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
        data-testid="sidebar"
        className={`
          fixed top-0 left-0 h-full bg-white dark:bg-gray-800 
          border-r border-gray-200 dark:border-gray-700
          shadow-xl z-40 transition-all duration-300
          ${sidebarClass}
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Header */}
        <div
          data-testid="sidebar-header"
          className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 h-16"
        >
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
              iconOnly
              data-testid="collapse-button"
              variant="ghost"
              size="small"
              className="hidden lg:inline-flex"
              onClick={() => setCollapsed(!collapsed)}
              icon={
                collapsed ? (
                  <ChevronRight className="h-5 w-5" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )
              }
            />

            <Button
              data-testid="close-button-mobile"
              iconOnly
              variant="ghost"
              size="small"
              className="lg:hidden"
              onClick={onClose}
              icon={<X className="h-5 w-5" />}
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              data-testid="sidebar-link"
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
        <div
          data-testid="sidebar-user-info"
          className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700"
        >
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
                  <User data-testid="user-icon" className="h-5 w-5 text-white" />
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
            data-testid="logout-button"
            variant="danger"
            fullWidth
            onClick={handleLogoutClick}
            className={collapsed ? "justify-center" : ""}
            icon={<LogOut className="h-5 w-5" />}
            iconPosition="left"
          >
            {!collapsed && "Logout"}
          </Button>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
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
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
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
    </>
  );
};

export default Sidebar;