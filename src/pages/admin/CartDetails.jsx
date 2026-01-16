// src/pages/CartDetails.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Card from "../../components_temp/ui/Card";
import Button from "../../components_temp/ui/Button";
import Table from "../../components_temp/ui/Table";
import Badge from "../../components_temp/ui/Badge";
import LoadingSpinner from "../../components_temp/ui/LoadingSpinner";
import useApi from "../../services/AdminuseApi";
import { useToast } from "../../contexts/ToastContext"; // Add this import
import {
  ArrowLeft,
  ShoppingCart,
  Users,
  DollarSign,
  Package,
  Calendar,
  Truck,
  CreditCard,
  Trash2,
  Plus,
  Minus,
} from "lucide-react";

const CartDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const api = useApi();
  const toast = useToast(); // Use toast context instead of outlet

  const [cart, setCart] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    if (id) {
      fetchCartDetails();
    }
  }, [id]);

  const fetchCartDetails = async () => {
    try {
      setLoading(true);

      // Fetch cart details
      const cartResponse = await api.cartAPI.getById(id);
      const cartData = cartResponse.data;

      if (!cartData) {
        throw new Error("Cart not found");
      }

      setCart(cartData);

      // Fetch user details
      if (cartData.userId) {
        try {
          const userResponse = await api.userAPI.getById(cartData.userId);
          setUser(userResponse.data);
        } catch (error) {
          console.log("Failed to fetch user, using placeholder data");
          setUser({
            id: cartData.userId,
            name: { firstname: "User", lastname: "" },
            email: "user@example.com",
            phone: "+1 (555) 123-4567",
            address: {
              street: "123 Main St",
              city: "Anytown",
              zipcode: "12345",
            },
          });
        }
      }

      // Fetch product details for each item in cart
      if (cartData.products?.length > 0) {
        const itemsWithDetails = await Promise.all(
          cartData.products.map(async (item) => {
            try {
              const productResponse = await api.productAPI.getById(
                item.productId
              );
              const product = productResponse.data;

              // Calculate total - use price from product if available, otherwise use 0
              const price = product?.price || item.price || 0;
              const quantity = item.quantity || 1;

              return {
                ...item,
                product: product,
                price: price,
                quantity: quantity,
                total: price * quantity,
              };
            } catch (error) {
              console.error(`Error fetching product ${item.productId}:`, error);
              return {
                ...item,
                product: {
                  id: item.productId,
                  title: `Product #${item.productId}`,
                  category: "Unknown",
                  image: "https://via.placeholder.com/100?text=Product",
                  price: item.price || 0,
                },
                price: item.price || 0,
                quantity: item.quantity || 1,
                total: (item.price || 0) * (item.quantity || 1),
              };
            }
          })
        );
        setCartItems(itemsWithDetails);
      } else {
        setCartItems([]);
      }
    } catch (error) {
      console.error("Failed to load cart details:", error);
      if (toast) {
        toast.error("Failed to load cart details");
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.total || 0), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.08; // 8% tax
  };

  const calculateShipping = () => {
    return cartItems.length > 0 ? 5.99 : 0;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax() + calculateShipping();
  };

  const getCartStatus = () => {
    if (!cartItems || cartItems.length === 0) {
      return <Badge variant="secondary">Empty</Badge>;
    }

    const total = calculateTotal();
    if (total > 500) {
      return <Badge variant="success">High Value</Badge>;
    } else if (total > 100) {
      return <Badge variant="primary">Active</Badge>;
    } else {
      return <Badge variant="warning">Low Value</Badge>;
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Invalid date";
      }
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  const handleBack = () => {
    navigate("/admin/carts");
  };

  if (loading) {
    return (
      <div data-testid="loading-spinner"  className="flex items-center justify-center min-h-screen">
          
        <LoadingSpinner size="large" />
        <span className="ml-3 text-gray-600">Loading cart details...</span>
      </div>
    );
  }
  return (
    <div className="container mx-auto px-1 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div 
        data-testid="cart-header"
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-4">
            <Button 
            data-testid="back-button"
            variant="outline" size="small" onClick={handleBack}
            icon={<ArrowLeft/>}>
              Back to Carts
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Cart #{cart.id}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Shopping cart details and management
              </p>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button 
            data-testid="process-order-button"
            variant="primary" onClick={() => navigate("/admin/processorder")}
              icon={<Truck />}>
              Process Order
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Cart items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cart Items */}
            <Card
            data-testid="cart-table"
            className="dark:bg-gray-800 dark:border-gray-700"
            >
              <Card.Header>
                <Card.Title>Cart Items ({cartItems.length})</Card.Title>
                <Card.Description>
                  Products in this shopping cart
                </Card.Description>
              </Card.Header>

              {cartItems.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <Table.Header>
                      <Table.HeaderCell>Product</Table.HeaderCell>
                      <Table.HeaderCell>Price</Table.HeaderCell>
                      <Table.HeaderCell>Quantity</Table.HeaderCell>
                      <Table.HeaderCell>Total</Table.HeaderCell>
                      <Table.HeaderCell>Actions</Table.HeaderCell>
                    </Table.Header>

                    <Table.Body>
                      {cartItems.map((item) => (
                        <Table.Row
                          key={`${item.productId}-${item.id || Math.random()}`}
                        >
                          <Table.Cell>
                            <div className="flex items-center">
                              <div className="h-12 w-12 flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                                <img
                                  src={
                                    item.product?.image ||
                                    "https://via.placeholder.com/100?text=Product"
                                  }
                                  alt={item.product?.title}
                                  className="h-full w-full object-contain p-1"
                                  onError={(e) => {
                                    e.target.src =
                                      "https://via.placeholder.com/100?text=Product";
                                  }}
                                />
                              </div>
                              <div className="ml-4">
                                <div
                                  className="font-medium text-gray-900 dark:text-white max-w-[30ch] line-clamp-2"
                                  title={item.product?.title}
                                >
                                  {item.product?.title ||
                                    `Product #${item.productId}`}
                                </div>

                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {item.product?.category || "Unknown"}
                                </div>
                              </div>
                            </div>
                          </Table.Cell>

                          <Table.Cell>
                            <div className="font-medium text-gray-900 dark:text-white">
                              ${(item.price || 0).toFixed(2)}
                            </div>
                          </Table.Cell>

                          <Table.Cell>
                            <div className="flex items-center space-x-2">
                              <span className="w-12 text-center font-medium text-gray-900 dark:text-white">
                                {item.quantity || 1}
                              </span>
                            </div>
                          </Table.Cell>

                          <Table.Cell>
                            <div className="font-bold text-gray-900 dark:text-white">
                              ${(item.total || 0).toFixed(2)}
                            </div>
                          </Table.Cell>

                          <Table.Cell>
                            <Button
                            data-testid="remove-item-button"
                              size="small"
                              variant="ghost"
                              className="text-red-500 hover:text-red-600"
                              onClick={() => {
                                // Handle remove item
                                if (toast) {
                                  toast.success("Item removed from cart");
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                    Cart is empty
                  </h3>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">
                    No items have been added to this cart yet.
                  </p>
                </div>
              )}
            </Card>

            {/* Order Summary */}
            <Card 
            data-testid="order-summary-card"
            >
              <Card.Header>
                <Card.Title>Order Summary</Card.Title>
              </Card.Header>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Subtotal
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    ${calculateSubtotal().toFixed(2)}
                  </span>
                </div>

                <div 
                data-testid="shipping-fee"
                className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Shipping
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    ${calculateShipping().toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Tax (8%)
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    ${calculateTax().toFixed(2)}
                  </span>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div 
                  data-testid="total-amount"
                  className="flex justify-between text-lg font-bold">
                    <span className="text-gray-900 dark:text-white">Total</span>
                    <span className="text-gray-900 dark:text-white">
                      ${calculateTotal().toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <Card.Footer>
                <Button
                  data-testid="checkout-button"
                  variant="primary"
                  fullWidth
                  onClick={() => {
                    if (toast) {
                      toast.success("Proceeding to checkout");
                    }
                  }}
                  icon={<CreditCard className="h-4 w-4 gap-5" />}
                >
                  
                  Proceed to Checkout
                </Button>
              </Card.Footer>
            </Card>
          </div>

          {/* Right column - Cart info & actions */}
          <div className="space-y-6">
            {/* Cart Information */}
            <Card
            data-testid="cart-info-card"
            >
              <Card.Header>
                <Card.Title>Cart Information</Card.Title>
              </Card.Header>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Cart ID
                  </div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    #{cart.id}
                  </div>
                </div>

                <div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <Calendar className="h-4 w-4 mr-2" />
                    Created
                  </div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {formatDate(cart.date || new Date().toISOString())}
                  </div>
                </div>

                <div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <Package className="h-4 w-4 mr-2" />
                    Status
                  </div>
                  <div>{getCartStatus()}</div>
                </div>

                <div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Total Value
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${calculateTotal().toFixed(2)}
                  </div>
                </div>
              </div>
            </Card>

            {/* Customer Information */}
            <Card data-testid="customer-info-card">
              <Card.Header>
                <Card.Title>Customer Information</Card.Title>
              </Card.Header>

              {user ? (
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                      {user.name?.firstname?.[0] || "U"}
                      {user.name?.lastname?.[0] || ""}
                    </div>
                    <div className="ml-4">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {user.name?.firstname || "User"}{" "}
                        {user.name?.lastname || ""}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        User ID: {user.id}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Email
                    </div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {user.email || "Not available"}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Phone
                    </div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {user.phone || "Not available"}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Address
                    </div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {user.address?.street && user.address?.city
                        ? `${user.address.street}, ${user.address.city}`
                        : "Address not available"}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Customer information not available
                  </p>
                </div>
              )}

              <Card.Footer>
                <Link to={`/admin/users/${user?.id}`}>
                  <Button 
                  data-testid="view-customer-button"
                  variant="outline" fullWidth disabled={!user?.id}>
                    View Customer Profile
                  </Button>
                </Link>
              </Card.Footer>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CartDetails;
