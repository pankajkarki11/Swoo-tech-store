// src/components/layout/Layout.jsx
import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./HeaderAdmin";
import Toast from "./ui/Toast";
import useToast from "../hooks/useToast";

const LayoutAdmin = ({ setIsAuthenticated }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toast = useToast();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        setIsAuthenticated={setIsAuthenticated}
      />

      <div className="lg:pl-64">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="py-6 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <Outlet context={{ toast }} />
          </div>
        </main>
      </div>

      <Toast toasts={toast.toasts} onRemove={toast.removeToast} />
    </div>
  );
};

export default LayoutAdmin;
