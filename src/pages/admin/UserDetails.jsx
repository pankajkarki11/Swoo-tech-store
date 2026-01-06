// src/pages/UserDetails.jsx
import React, { useState, useEffect } from "react";
import {
  useParams,
  Link,
  useOutletContext,
  useNavigate,
} from "react-router-dom";

import Card from "../../components_temp/ui/Card";
import Button from "../../components_temp/ui/Button";
import Table from "../../components_temp/ui/Table";
import Badge from "../../components_temp/ui/Badge";
import LoadingSpinner from "../../components_temp/ui/LoadingSpinner";
import useApi from "../../services/AdminuseApi";

import {
  ArrowLeft,
  Edit,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShoppingCart,
  Package,
  User,
  CreditCard,
} from "lucide-react";

const UserDetails = () => {
  const { id } = useParams();
  const { toast } = useOutletContext();
  const api = useApi();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userCarts, setUserCarts] = useState([]);
  const [cartsWithProducts, setCartsWithProducts] = useState([]); // NEW: Store carts with full product details
  const navigate = useNavigate();
  useEffect(() => {
    fetchUserDetails();
  }, [id]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);

      // Fetch user details
      const userResponse = await api.userAPI.getById(id);
      setUser(userResponse.data);

      // Fetch user's carts
      const cartsResponse = await api.cartAPI.getUserCarts(id);
      const carts = cartsResponse.data || [];
      setUserCarts(carts);

      // NEW: Fetch full product details for each cart
      await fetchProductDetailsForCarts(carts);
    } catch (error) {
      console.error("Error fetching user details:", error);
      toast.error("Failed to load user details");
    } finally {
      setLoading(false);
    }
  };

  // NEW: Fetch product details for all carts
  const fetchProductDetailsForCarts = async (carts) => {
    try {
      const cartsWithFullProducts = await Promise.all(
        carts.map(async (cart) => {
          if (!cart.products || cart.products.length === 0) {
            return { ...cart, products: [] };
          }

          // Fetch full product details for each product in the cart
          const productsWithDetails = await Promise.all(
            cart.products.map(async (item) => {
              try {
                const productResponse = await api.productAPI.getById(
                  item.productId
                );
                return {
                  ...productResponse.data,
                  quantity: item.quantity,
                  cartProductId: item.productId,
                };
              } catch (error) {
                console.error(
                  `Error fetching product ${item.productId}:`,
                  error
                );
                // Return a fallback if product fetch fails
                return {
                  id: item.productId,
                  title: "Unknown Product",
                  price: 0,
                  quantity: item.quantity,
                  cartProductId: item.productId,
                };
              }
            })
          );

          return {
            ...cart,
            products: productsWithDetails,
          };
        })
      );

      setCartsWithProducts(cartsWithFullProducts);
    } catch (error) {
      console.error("Error fetching product details:", error);
      // Fallback to carts without full details
      setCartsWithProducts(carts);
    }
  };

  // FIXED: Calculate total spent using cartsWithProducts
  const calculateTotalSpent = () => {
    if (cartsWithProducts.length === 0) return 0;

    return cartsWithProducts.reduce((total, cart) => {
      return (
        total +
        (cart.products?.reduce((cartTotal, item) => {
          const price = parseFloat(item.price) || 0;
          const quantity = parseInt(item.quantity) || 0;
          return cartTotal + price * quantity;
        }, 0) || 0)
      );
    }, 0);
  };

  // FIXED: Calculate total orders using cartsWithProducts
  const calculateTotalOrders = () => {
    if (cartsWithProducts.length === 0) return 0;

    return cartsWithProducts.reduce((total, cart) => {
      return (
        total +
        (cart.products?.reduce((sum, item) => {
          return sum + (parseInt(item.quantity) || 0);
        }, 0) || 0)
      );
    }, 0);
  };

  const getInitials = () => {
    if (!user?.name) return "U";
    const first = user.name.firstname?.[0] || "";
    const last = user.name.lastname?.[0] || "";
    return (first + last).toUpperCase();
  };

  const getUserRole = () => {
    const username = user?.username || "";
    if (username.includes("admin") || username.includes("john")) {
      return <Badge variant="danger">Admin</Badge>;
    } else if (username.includes("manager")) {
      return <Badge variant="warning">Manager</Badge>;
    } else {
      return <Badge variant="success">Customer</Badge>;
    }
  };

  if (loading) {
    return (
      <div
        data-testid="loading-spinner"
        className="flex items-center justify-center h-64"
      >
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!user) {
    return (
      <Card>
        <div className="text-center py-12">
          <User className="h-12 w-12 text-gray-400 mx-auto" />
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
            User not found
          </h3>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            The user you're looking for doesn't exist.
          </p>
          <div className="mt-6">
            <Button
              variant="primary"
              onClick={() => navigate("/admin/users")}
              icon={<ArrowLeft />}
            >
              Back to Users
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-4">
        
            <Button 
            onClick={() => navigate("/admin/users")}
            variant="outline" size="small" icon={<ArrowLeft />}>
              Back
            </Button>
      
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              User Details
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              View and manage user information
            </p>
          </div>
        </div>

        <div className="flex space-x-3">
          <Button variant="primary" icon={<Edit />}>
            Edit User
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - User info */}
        <div className="lg:col-span-2 space-y-6">
          {/* User Profile Card */}
          <Card>
            <div className="flex flex-col md:flex-row gap-6">
              {/* User Avatar */}
              <div className="md:w-1/3">
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-6xl font-bold text-white">
                    {getInitials()}
                  </span>
                </div>

                {/* Quick Actions */}
                <div className="mt-4 space-y-2">
                  <Button
                    onClick={() => navigate("/sentemail")}
                    variant="outline"
                    fullWidth
                    icon={<Mail className="h-4 w-4 mr-2" />}
                  >
                    Send Email
                  </Button>
                  <Button
                    onClick={() => navigate("/vieworder")}
                    variant="primary"
                    fullWidth
                    icon={<CreditCard className="h-4 w-4 mr-2" />}
                  >
                    View Orders
                  </Button>
                </div>
              </div>

              {/* User Details */}
              <div className="md:w-2/3">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {user.name?.firstname} {user.name?.lastname}
                    </h2>
                    <div className="flex items-center mt-2 space-x-4">
                      {getUserRole()}
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        @{user.username}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">
                      ${calculateTotalSpent().toFixed(2)}
                    </div>
                    <div className="text-sm text-green-600 dark:text-green-400">
                      Total Spent
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {user.email}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Phone className="h-4 w-4 mr-2" />
                      Phone
                    </div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {user.phone}
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="h-4 w-4 mr-2" />
                      Address
                    </div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {user.address?.street}, {user.address?.city},{" "}
                      {user.address?.zipcode}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {user.address?.city}, {user.address?.zipcode}
                    </div>
                  </div>
                </div>

                {/* User Stats */}
                <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-center h-10 w-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg mb-3 mx-auto">
                      <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        #{user.id}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        User ID
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-center h-10 w-10 bg-green-100 dark:bg-green-900/30 rounded-lg mb-3 mx-auto">
                      <User className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        Active
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Status
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-center h-10 w-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg mb-3 mx-auto">
                      <ShoppingCart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {userCarts.length}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Total Carts
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-center h-10 w-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg mb-3 mx-auto">
                      <Package className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {calculateTotalOrders()}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Total Items
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Recent Orders */}
          <Card>
            <Card.Header>
              <Card.Title>Recent Carts</Card.Title>
              <Card.Description>User's recent shopping carts</Card.Description>
            </Card.Header>

            {/* FIXED: Use cartsWithProducts instead of userCarts */}
            {cartsWithProducts.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <Table.Header>
                    <Table.HeaderCell>Cart ID</Table.HeaderCell>
                    <Table.HeaderCell>Date</Table.HeaderCell>
                    <Table.HeaderCell>Items</Table.HeaderCell>
                    <Table.HeaderCell>Total</Table.HeaderCell>
                    <Table.HeaderCell>Status</Table.HeaderCell>
                    <Table.HeaderCell>Actions</Table.HeaderCell>
                  </Table.Header>

                  <Table.Body>
                    {cartsWithProducts.slice(0, 5).map((cart) => {
                      const total =
                        cart.products?.reduce(
                          (sum, item) =>
                            sum +
                            (parseFloat(item.price) || 0) *
                              (parseInt(item.quantity) || 0),
                          0
                        ) || 0;

                      const itemCount =
                        cart.products?.reduce(
                          (sum, item) => sum + (parseInt(item.quantity) || 0),
                          0
                        ) || 0;

                      return (
                        <Table.Row key={cart.id}>
                          <Table.Cell>
                            <div className="font-medium text-gray-900 dark:text-white">
                              #{cart.id}
                            </div>
                          </Table.Cell>

                          <Table.Cell>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {new Date(
                                cart.date || new Date()
                              ).toLocaleDateString()}
                            </div>
                          </Table.Cell>

                          <Table.Cell>
                            <div className="flex items-center">
                              <ShoppingCart className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="font-medium text-gray-900 dark:text-white">
                                {itemCount}
                              </span>
                            </div>
                          </Table.Cell>

                          <Table.Cell>
                            <div className="font-bold text-gray-900 dark:text-white">
                              ${total.toFixed(2)}
                            </div>
                          </Table.Cell>

                          <Table.Cell>
                            <Badge
                              variant={total > 100 ? "success" : "warning"}
                            >
                              {total > 100 ? "High Value" : "Low Value"}
                            </Badge>
                          </Table.Cell>

                          <Table.Cell>
                            <Link to={`/admin/carts/${cart.id}`}>
                              <Button size="small" className="hover:underline">
                                View
                              </Button>
                            </Link>
                          </Table.Cell>
                        </Table.Row>
                      );
                    })}
                  </Table.Body>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto" />
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                  No carts found
                </h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  This user hasn't created any shopping carts yet.
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* Right column - Quick info */}
        <div className="space-y-6">
          {/* User Statistics */}
          <Card>
            <Card.Header>
              <Card.Title>User Statistics</Card.Title>
            </Card.Header>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  Member Since
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  Jan 2023
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  Last Active
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  2 hours ago
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  Avg. Order Value
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  $
                  {(
                    calculateTotalSpent() / Math.max(userCarts.length, 1)
                  ).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  Total Items Purchased
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {calculateTotalOrders()}
                </span>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card>
            <Card.Header>
              <Card.Title>Quick Actions</Card.Title>
            </Card.Header>

            <div className="space-y-2">
              <Button
                variant="outline"
                fullWidth
                icon={<Mail className="h-4 w-4 mr-2" />}
              >
                Send Welcome Email
              </Button>

              <Button
                variant="outline"
                fullWidth
                icon={<CreditCard className="h-4 w-4 mr-2" />}
              >
                View Purchase History
              </Button>

              <Button
                variant="danger"
                fullWidth
                icon={<User className="h-4 w-4 mr-2" />}
              >
                Deactivate User
              </Button>
            </div>
          </Card>

          {/* Notes */}
          <Card>
            <Card.Header>
              <Card.Title>Notes</Card.Title>
            </Card.Header>

            <div className="space-y-4">
              <textarea
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="4"
                placeholder="Add notes about this user..."
              />

              <Button variant="primary" fullWidth>
                Save Notes
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
