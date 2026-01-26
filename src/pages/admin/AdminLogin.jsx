// src/pages/admin/SimpleLogin.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Card from "../../components_temp/ui/Card";
import Button from "../../components_temp/ui/Button";
import Input from "../../components_temp/ui/Input";
import LoadingSpinner from "../../components_temp/ui/LoadingSpinner";
import { Lock, Mail, ShoppingBag, Shield, Info } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";

const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isAdmin, loading } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [adminHint, setAdminHint] = useState("");

  // Check username for admin patterns as user types
  useEffect(() => {
    if (!formData.username.trim()) {
      setAdminHint("");
      return;
    }

    const username = formData.username.toLowerCase();
    const patterns = ["johnd"];
    const matchingPatterns = patterns.filter((pattern) =>
      username.includes(pattern.toLowerCase())
    );

    if (matchingPatterns.length > 0) {
      setAdminHint(`✓ Have admin privilage ${matchingPatterns.join(", ")}`);
    } else {
      setAdminHint("");
    }
  }, [formData.username]);

  // Redirect if already authenticated as admin
  useEffect(() => {
    if (isAuthenticated && isAdmin && !loading) {
      const from = location.state?.from || "/admin/dashboard";
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isAdmin, loading, navigate, location]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };



  

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      // Login with FakeStoreAPI credentials
      const result = await login({
        username: formData.username,
        password: formData.password,
      });

      if (!result.success) {
        throw new Error(result.error || "Login failed");
      }

      // Check if user has admin access
      if (result.isAdmin) {
        const from = location.state?.from || "/admin/dashboard";
        navigate(from, { replace: true });
      } else {
        setErrors({
          submit: "Access denied. Username does'nt have admin access",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrors({
        submit:
           "Invalid username or password. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Demo logins with different patterns
  const handleAdminPatternLogin = (pattern) => {
    let username, password;

    switch (pattern) {
      case "john":
        username = "johnd";
        password = "m38rmF$";
        break;

      default:
        username = "mor_2314";
        password = "83r5^_";
    }

    setFormData({
      username: username,
      password: password,
    });
  };

  if (loading) {
    return (
      <div 
      data-testid="loading-spinner"
      className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin Login
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Restricted Access
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Input
                aria-label="Username"
                  label="Username"
                  leftIcon={<Mail className="h-5 w-5" />}
                  value={formData.username}
                  onChange={(e) => {
                    setFormData({ ...formData, username: e.target.value });
                    if (errors.username) setErrors({ ...errors, username: "" });
                  }}
                  error={errors.username}
                  placeholder="Enter username "
                  required
                  disabled={isLoading}
                />
                {adminHint && (
                  <p
                    className={`text-xs mt-1 ml-1 ${
                      adminHint.startsWith("✓")
                        ? "text-green-600"
                        : "text-amber-600"
                    }`}
                  >
                    {adminHint}
                  </p>
                )}
              </div>

              <Input
              aria-label="Password"
                label="Password"
                type="password"
                leftIcon={<Lock className="h-5 w-5" />}
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  if (errors.password) setErrors({ ...errors, password: "" });
                }}
                error={errors.password}
                placeholder="Enter password"
                required
                disabled={isLoading}
              />
            </div>

            {errors.submit && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <p className="text-sm text-red-600 dark:text-red-400 flex items-start gap-2">
                  <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  {errors.submit}
                </p>
              </div>
            )}

            <div className="mt-6 space-y-3">
              <Button
              data-testid="admin-login-button"
                type="submit"
                variant="teal"
                fullWidth
                loading={isLoading}
                disabled={isLoading}
                className="flex items-center justify-center gap-2"
              >
                {isLoading ? "Verifying..." : "Login to Admin Panel"}
              </Button>

              <div className="text-left">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Try admin
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                  data-testid="admin-demo-login"
                    type="button"
                    variant="outline"
                    onClick={() => handleAdminPatternLogin("john")}
                    disabled={isLoading}
                    size="sm"
                    className="text-xs"
                  >
                    johnd
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </Card>

        <div className="text-center pt-2">
          <p className="text-gray-600 dark:text-white">
            Don't have admin access?{" "}
            <Link
              to="/login"
              className="text-[#01A49E] font-semibold hover:text-[#016F6B] transition"
            >
              Try Client Login
            </Link>
          </p>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            © 2025 SwooTechMart. Admin access required
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
