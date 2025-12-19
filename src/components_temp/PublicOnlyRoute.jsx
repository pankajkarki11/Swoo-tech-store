// src/components/PublicOnlyRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const PublicOnlyRoute = ({ children, redirectTo = "/" }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-[#01A49E] border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    // If admin user and trying to access admin login, redirect to admin dashboard
    if (
      user?.role === "admin" &&
      window.location.pathname.includes("/admin/login")
    ) {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

export default PublicOnlyRoute;
