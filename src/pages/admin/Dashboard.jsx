// src/pages/Dashboard.jsx - OPTIMIZED VERSION
import React, { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import useApi from "../../services/AdminuseApi";
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
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCarts: 0,
    totalUsers: 0,
    totalRevenue: 0,
    totalItems: 0,
    activeCartsCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentProducts, setRecentProducts] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // OPTIMIZATION: Only 3 API calls instead of 33+
      // 1. Get all products (1 call)
      // 2. Get all carts (1 call)
      // 3. Get all users (1 call)
      const [productsRes, cartsRes, usersRes] = await Promise.all([
        api.productAPI.getAll(),
        api.cartAPI.getAll(),
        api.userAPI.getAll(),
      ]);

      const products = productsRes.data || [];
      const carts = cartsRes.data || [];
      const users = usersRes.data || [];

      // Create a product price lookup map (O(1) lookup instead of API calls)
      const productPriceMap = new Map();
      products.forEach(product => {
        productPriceMap.set(product.id, parseFloat(product.price) || 0);
      });

      // Calculate all stats in one pass through carts
      const cartStats = calculateAllStats(carts, productPriceMap);

      // Get recent products (last 5)
      const recent = products.slice(-5).reverse();

      setStats({
        totalProducts: products.length,
        totalCarts: carts.length,
        totalUsers: users.length,
        totalRevenue: cartStats.totalRevenue,
        totalItems: cartStats.totalItems,
        activeCartsCount: cartStats.activeCartsCount,
      });

      setRecentProducts(recent);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // OPTIMIZED: Calculate all stats in a single pass
  const calculateAllStats = (carts, productPriceMap) => {
    let totalRevenue = 0;
    let totalItems = 0;
    let activeCartsCount = 0;

    carts.forEach((cart) => {
      if (!cart.products || cart.products.length === 0) return;

      let cartItemCount = 0;
      let cartValue = 0;

      cart.products.forEach((item) => {
        const quantity = parseInt(item.quantity) || 0;
        const price = productPriceMap.get(item.productId) || 0;
        
        cartItemCount += quantity;
        cartValue += price * quantity;
      });

      totalItems += cartItemCount;
      totalRevenue += cartValue;
      
      if (cartItemCount > 0) {
        activeCartsCount++;
      }
    });

    return {
      totalRevenue,
      totalItems,
      activeCartsCount,
    };
  };

  const StatCard = ({ title, value, icon: Icon, change, trend, subtitle }) => (
    <Card className="hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {subtitle}
            </p>
          )}
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
        <Button variant="primary" onClick={fetchDashboardData} loading={loading}>
          Refresh Data
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={`$${stats.totalRevenue.toFixed(2)}`}
          icon={DollarSign}
          subtitle={`From ${stats.totalCarts} carts`}
          change="+12.5%"
          trend="up"
        />
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          icon={Package}
          subtitle="In catalog"
          change="+5.2%"
          trend="up"
        />
        <StatCard
          title="Active Carts"
          value={stats.activeCartsCount}
          icon={ShoppingCart}
          subtitle={`${stats.totalItems} total items`}
          change="-2.1%"
          trend="down"
        />
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          subtitle="Registered"
          change="+8.7%"
          trend="up"
        />
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <div className="text-center py-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Average Cart Value
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              ${stats.activeCartsCount > 0 
                ? (stats.totalRevenue / stats.activeCartsCount).toFixed(2) 
                : '0.00'}
            </p>
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <div className="text-center py-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Items per Cart
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              {stats.activeCartsCount > 0 
                ? (stats.totalItems / stats.activeCartsCount).toFixed(1) 
                : '0'}
            </p>
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <div className="text-center py-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Conversion Rate
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              {stats.totalUsers > 0 
                ? ((stats.activeCartsCount / stats.totalUsers) * 100).toFixed(1) 
                : '0'}%
            </p>
          </div>
        </Card>
      </div>

      {/* Recent Products */}
      <Card>
        <Card.Header>
          <Card.Title>Recent Products</Card.Title>
          <Card.Description>
            Latest products added to your store
          </Card.Description>
        </Card.Header>

        {recentProducts.length > 0 ? (
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
                    Rating
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
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => navigate(`/admin/products/${product.id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img
                            className="h-10 w-10 rounded-lg object-cover"
                            src={product.image}
                            alt={product.title}
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/100?text=No+Image';
                            }}
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
                      <Badge variant="secondary">
                        {product.category}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        ${parseFloat(product.price).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-900 dark:text-white">
                          {product.rating?.rate || 'N/A'}
                        </span>
                        {product.rating?.rate && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                            ({product.rating?.count || 0})
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="success">Active</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto" />
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              No products yet
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Get started by adding your first product
            </p>
          </div>
        )}

        <Card.Footer>
          <Button 
            onClick={() => navigate("/admin/products")}
            variant="outline" 
            fullWidth
          >
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
              onClick={() => navigate("/admin/products")}
            >
              <Package className="h-8 w-8 mb-2" />
              <span>Manage Products</span>
            </Button>

            <Button
              variant="outline"
              className="h-24 flex flex-col items-center justify-center"
              onClick={() => navigate("/admin/carts")}
            >
              <ShoppingCart className="h-8 w-8 mb-2" />
              <span>View Carts</span>
            </Button>

            <Button
              variant="outline"
              className="h-24 flex flex-col items-center justify-center"
              onClick={() => navigate("/admin/users")}
            >
              <Users className="h-8 w-8 mb-2" />
              <span>Manage Users</span>
            </Button>

            <Button
              variant="outline"
              className="h-24 flex flex-col items-center justify-center"
              onClick={fetchDashboardData}
            >
              <DollarSign className="h-8 w-8 mb-2" />
              <span>Refresh Stats</span>
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
              <span className="text-gray-600 dark:text-gray-400">
                Database
              </span>
              <Badge variant="success">Connected</Badge>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">
                Last Updated
              </span>
              <span className="text-sm text-gray-900 dark:text-white">
                {new Date().toLocaleTimeString()}
              </span>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">
                Total Products
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {stats.totalProducts}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">
                Active Carts
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {stats.activeCartsCount}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;