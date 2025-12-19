// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-[#01A49E] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 font-medium">Loading authentication...</p>
          <p className="text-gray-500 text-sm mt-2">
            Please wait while we verify your session
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to appropriate login page
    const loginPath = requireAdmin ? "/admin/login" : "/login";
    return (
      <Navigate
        to={loginPath}
        replace
        state={{ from: window.location.pathname }}
      />
    );
  }

  // All authenticated users can access admin routes
  return children;
};

export default ProtectedRoute;