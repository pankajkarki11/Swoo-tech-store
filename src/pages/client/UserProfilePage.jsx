// src/pages/UserProfilePage.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";
import { User, Mail, Phone, MapPin, ShoppingBag, Package } from "lucide-react";

const UserProfilePage = () => {
  const { user, token, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (user && token) {
      fetchUserOrders();
    } else {
      setOrdersLoading(false);
    }
  }, [user, token]);

  const fetchUserOrders = async () => {
    try {
      // Fetch all carts from FakeStoreAPI
      const response = await fetch("https://fakestoreapi.com/carts");
      const allCarts = await response.json();

      // Filter carts by user ID
      const userCarts = allCarts.filter((cart) => cart.userId === user.id);

      // Get products for each cart
      const ordersWithDetails = await Promise.all(
        userCarts.map(async (cart) => {
          const products = await Promise.all(
            cart.products.map(async (item) => {
              try {
                const productRes = await fetch(
                  `https://fakestoreapi.com/products/${item.productId}`
                );
                if (!productRes.ok) throw new Error("Product not found");
                const product = await productRes.json();
                return {
                  ...product,
                  quantity: item.quantity,
                };
              } catch (error) {
                console.error(
                  `Error fetching product ${item.productId}:`,
                  error
                );
                return {
                  id: item.productId,
                  title: `Product ${item.productId}`,
                  price: 0,
                  image: "https://via.placeholder.com/50",
                  quantity: item.quantity,
                };
              }
            })
          );

          return {
            id: cart.id,
            date: cart.date || new Date().toISOString(),
            products: products,
            total: products.reduce((sum, p) => sum + p.price * p.quantity, 0),
          };
        })
      );

      setOrders(ordersWithDetails);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setOrdersLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center dark:bg-gray-900">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <User size={40} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Please login to view your profile
          </h2>
          <Link
            to="/login"
            className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8 px-4 dark:bg-gray-900">
      <div className="container mx-auto max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Account</h1>
          <div className="text-sm text-gray-600 dark:text-white">
            Member since {new Date().getFullYear()}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-8 dark:bg-gray-800 dark:border-gray-700 dark:border-2xl">
              <div className="text-center mb-8">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-3xl font-bold">
                    {(
                      user.firstname?.charAt(0) ||
                      user.username?.charAt(0) ||
                      "U"
                    ).toUpperCase()}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 capitalize dark:text-white">
                  {user.firstname || user.username} {user.lastname || ""}
                </h2>
                <p className="text-gray-600 mt-1 dark:text-gray-300">{user.email}</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center text-gray-700 dark:text-white">
                  <Mail size={18} className="mr-3 text-gray-400 dark:text-white" />
                  <span>{user.email}</span>
                </div>

                <div className="flex items-center text-gray-700 dark:text-white">
                  <User size={18} className="mr-3 text-gray-400 dark:text-white" />
                  <span className="capitalize">@{user.username}</span>
                </div>

                <div className="flex items-center text-gray-700 dark:text-white">
                  <Phone size={18} className="mr-3 text-gray-400 dark:text-white" />
                  <span>+9779802468424</span>
                </div>

                <div className="flex items-center text-gray-700 dark:text-white">
                  <MapPin size={18} className="mr-3 text-gray-400 dark:text-white" />
                  <span>Chandragiri-12, Kathmandu, Nepal</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Orders */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8 dark:bg-gray-800">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center dark:text-white">
                  <ShoppingBag size={24} className="mr-3 dark:text-white" />
                  Recent Orders
                </h2>
                <span className="text-gray-600 dark:text-gray-200">
                  {orders.length} order{orders.length !== 1 ? "s" : ""}
                </span>
              </div>

              {ordersLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600 dark:text-white">Loading orders...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12">
                  <Package size={64} className="text-gray-300 mx-auto mb-4 dark:text-white" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2 dark:text-white">
                    No orders yet
                  </h3>
                  <p className="text-gray-600 mb-6 dark:text-white">
                    Start shopping to see your orders here!
                  </p>
                  <Link
                    to="/"
                    className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
                  >
                    Browse Products
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="border border-gray-200 rounded-xl p-6 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            Order #{order.id}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-white">
                            {new Date(order.date).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900 dark:text-white">
                            ${order.total.toFixed(2)}
                          </div>
                          <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                            Delivered
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {order.products.slice(0, 5).map((product) => (
                          <div key={product.id} className="flex items-center">
                            <img
                              src={product.image}
                              alt={product.title}
                              className="w-12 h-12 object-contain rounded-lg mr-4 bg-gray-100 p-1 dark:bg-gray-500"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://via.placeholder.com/50";
                              }}
                            />
                          <div className="flex-1">
                          <p className="font-medium text-gray-800 dark:text-white">
                               {product.title.length > 60
                                 ? product.title.slice(0, 60) + "..."
                                 : product.title}
                                   </p>

                              <p className="text-sm text-gray-600 dark:text-white">
                                Quantity: {product.quantity} × ${product.price.toFixed(2)}
                              </p>
                            </div>

                            <div className="font-semibold text-gray-900 dark:text-white">
                              ${(product.price * product.quantity).toFixed(2)}
                            </div>
                          </div>
                        ))}

                     
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
