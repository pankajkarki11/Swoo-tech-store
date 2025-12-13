// src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { Badge } from "lucide-react";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import useApi from "../../hooks/useApi";
import {
  ShoppingCart,
  Users,
  Package,
  DollarSign,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

const Dashboard = () => {
  const { toast } = useOutletContext();
  const api = useApi();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCarts: 0,
    totalUsers: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentProducts, setRecentProducts] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [productsRes, cartsRes, usersRes] = await Promise.all([
        api.productAPI.getAll(),
        api.cartAPI.getAll(),
        api.userAPI.getAll(),
      ]);

      // Calculate total revenue
      let totalRevenue = 0;
      if (cartsRes.data) {
        cartsRes.data.forEach((cart) => {
          cart.products?.forEach((item) => {
            totalRevenue += item.price * item.quantity;
          });
        });
      }

      // Get recent products (last 5)
      const recent = productsRes.data?.slice(-5).reverse() || [];

      setStats({
        totalProducts: productsRes.data?.length || 0,
        totalCarts: cartsRes.data?.length || 0,
        totalUsers: usersRes.data?.length || 0,
        totalRevenue,
      });

      setRecentProducts(recent);
    } catch (error) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, change, trend }) => (
    <Card className="hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            {value}
          </p>
          {change && (
            <div className="flex items-center mt-2">
              {trend === "up" ? (
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span
                className={`text-sm font-medium ${
                  trend === "up" ? "text-green-600" : "text-red-600"
                }`}
              >
                {change}
              </span>
            </div>
          )}
        </div>
        <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
          <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
      </div>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Welcome back! Here's what's happening with your store today.
          </p>
        </div>
        <Button variant="primary" onClick={fetchDashboardData}>
          Refresh Data
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={`$${stats.totalRevenue.toFixed(2)}`}
          icon={DollarSign}
          change="+12.5%"
          trend="up"
        />
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          icon={Package}
          change="+5.2%"
          trend="up"
        />
        <StatCard
          title="Active Carts"
          value={stats.totalCarts}
          icon={ShoppingCart}
          change="-2.1%"
          trend="down"
        />
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          change="+8.7%"
          trend="up"
        />
      </div>

      {/* Recent Products */}
      <Card>
        <Card.Header>
          <Card.Title>Recent Products</Card.Title>
          <Card.Description>
            Latest products added to your store
          </Card.Description>
        </Card.Header>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {recentProducts.map((product) => (
                <tr
                  key={product.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <img
                          className="h-10 w-10 rounded-lg object-cover"
                          src={product.image}
                          alt={product.title}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {product.title.length > 40
                            ? `${product.title.substring(0, 40)}...`
                            : product.title}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          ID: {product.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant="secondary">{product.category}</Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    ${product.price}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant="success">Active</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Card.Footer>
          <Button variant="outline" fullWidth>
            View All Products
          </Button>
        </Card.Footer>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <Card.Header>
            <Card.Title>Quick Actions</Card.Title>
            <Card.Description>Common actions you might need</Card.Description>
          </Card.Header>

          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="h-24 flex flex-col items-center justify-center"
            >
              <Package className="h-8 w-8 mb-2" />
              <span>Add Product</span>
            </Button>

            <Button
              variant="outline"
              className="h-24 flex flex-col items-center justify-center"
            >
              <ShoppingCart className="h-8 w-8 mb-2" />
              <span>Create Cart</span>
            </Button>

            <Button
              variant="outline"
              className="h-24 flex flex-col items-center justify-center"
            >
              <Users className="h-8 w-8 mb-2" />
              <span>Add User</span>
            </Button>

            <Button
              variant="outline"
              className="h-24 flex flex-col items-center justify-center"
            >
              <DollarSign className="h-8 w-8 mb-2" />
              <span>View Reports</span>
            </Button>
          </div>
        </Card>

        <Card>
          <Card.Header>
            <Card.Title>System Status</Card.Title>
          </Card.Header>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">
                API Status
              </span>
              <Badge variant="success">Online</Badge>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Database</span>
              <Badge variant="success">Connected</Badge>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">
                Last Updated
              </span>
              <span className="text-sm text-gray-900 dark:text-white">
                {new Date().toLocaleDateString()}
              </span>
            </div>

            <div className="pt-4">
              <Button variant="primary" fullWidth>
                Refresh All Data
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
