// src/pages/admin/SimpleLogin.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { Lock, Mail, ShoppingBag } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

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
      // Try API login first, fallback to demo if API fails
      const result = await login({
        authSource: "api",
        username: formData.username,
        password: formData.password,
        email: `${formData.username}@demo.com`, // Fallback email
      });

      if (!result.success) {
        throw new Error(result.error || "Login failed");
      }

      // Check if user is admin (API users with admin in username get admin role)
      if (result.user.isAdmin) {
        const from = location.state?.from || "/admin/dashboard";
        navigate(from, { replace: true });
      } else {
        // If not admin, try with admin@demo.com
        const adminResult = await login({
          authSource: "demo",
          email: "admin@demo.com",
        });

        if (adminResult.success && adminResult.user.isAdmin) {
          navigate("/admin/dashboard", { replace: true });
        } else {
          setErrors({ submit: "This account doesn't have admin privileges." });
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrors({ submit: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setFormData({
      username: "mor_2314",
      password: "83r5^_",
    });

    setTimeout(() => {
      handleSubmit(new Event("submit"));
    }, 100);
  };

  const handleAdminDemoLogin = () => {
    // Direct admin demo login
    setIsLoading(true);
    login({
      authSource: "demo",
      email: "admin@demo.com",
    })
      .then((result) => {
        if (result.success && result.user.isAdmin) {
          navigate("/admin/dashboard", { replace: true });
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
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
            <ShoppingBag className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin Login
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            SwooTechMart Administration
          </p>
        </div>

        <Card>
          <Card.Header>
            <Card.Title>Welcome Back</Card.Title>
            <Card.Description>Sign in to your admin account</Card.Description>
          </Card.Header>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <Input
                label="Username"
                leftIcon={<Mail className="h-5 w-5" />}
                value={formData.username}
                onChange={(e) => {
                  setFormData({ ...formData, username: e.target.value });
                  if (errors.username) setErrors({ ...errors, username: "" });
                }}
                error={errors.username}
                placeholder="Enter your username"
                required
                disabled={isLoading}
              />

              <Input
                label="Password"
                type="password"
                leftIcon={<Lock className="h-5 w-5" />}
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  if (errors.password) setErrors({ ...errors, password: "" });
                }}
                error={errors.password}
                placeholder="Enter your password"
                required
                disabled={isLoading}
              />
            </div>

            {errors.submit && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.submit}
                </p>
              </div>
            )}

            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  disabled={isLoading}
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                >
                  Remember me
                </label>
              </div>

              <button
                type="button"
                className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 disabled:opacity-50"
                disabled={isLoading}
              >
                Forgot password?
              </button>
            </div>

            <div className="mt-6 space-y-3">
              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAdminDemoLogin}
                  disabled={isLoading}
                >
                  Demo Admin
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDemoLogin}
                  disabled={isLoading}
                >
                  Demo User
                </Button>
              </div>
            </div>
          </form>

          <Card.Footer className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Demo credentials: mor_2314 / 83r5^_ or use "admin@demo.com" for
              admin
            </p>
          </Card.Footer>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            © 2024 SwooTechMart. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
