// src/pages/Carts.jsx
import React, { useState, useEffect } from "react";
import { Link, useOutletContext } from "react-router-dom";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Table from "../../components/ui/Table";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import useApi from "../../services/AdminuseApi";
import {
  Search,
  Filter,
  Plus,
  Eye,
  Trash2,
  ShoppingCart,
  Users,
  Calendar,
} from "lucide-react";

const Carts = () => {
  const { toast } = useOutletContext();
  const api = useApi();

  const [carts, setCarts] = useState([]);
  const [filteredCarts, setFilteredCarts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCart, setSelectedCart] = useState(null);

  useEffect(() => {
    fetchCarts();
  }, []);

  useEffect(() => {
    filterCarts();
  }, [carts, searchTerm, selectedStatus]);

  const fetchCarts = async () => {
    try {
      setLoading(true);
      const response = await api.cartAPI.getAll();
      setCarts(response.data || []);
    } catch (error) {
      toast.error("Failed to load carts");
    } finally {
      setLoading(false);
    }
  };

  const filterCarts = () => {
    let filtered = [...carts];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (cart) =>
          cart.userId.toString().includes(searchTerm) ||
          cart.id.toString().includes(searchTerm)
      );
    }

    // Status filter
    if (selectedStatus !== "all") {
      filtered = filtered.filter((cart) => {
        const totalItems =
          cart.products?.reduce((sum, item) => sum + item.quantity, 0) || 0;
        const totalPrice =
          cart.products?.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          ) || 0;

        switch (selectedStatus) {
          case "active":
            return totalItems > 0;
          case "high-value":
            return totalPrice > 100;
          case "empty":
            return totalItems === 0;
          default:
            return true;
        }
      });
    }

    setFilteredCarts(filtered);
  };

  const calculateCartTotal = (cart) => {
    return (
      cart.products?.reduce((total, item) => {
        return total + item.price * item.quantity;
      }, 0) || 0
    );
  };

  const calculateTotalItems = (cart) => {
    return (
      cart.products?.reduce((total, item) => total + item.quantity, 0) || 0
    );
  };

  const handleDelete = async () => {
    if (!selectedCart) return;

    try {
      await api.cartAPI.delete(selectedCart.id);
      toast.success("Cart deleted successfully");

      setCarts((prev) => prev.filter((cart) => cart.id !== selectedCart.id));

      // fetchCarts(); // Refresh the list
      setIsDeleteModalOpen(false);
      setSelectedCart(null);
    } catch (error) {
      toast.error("Failed to delete cart");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (cart) => {
    const totalItems = calculateTotalItems(cart);
    const totalPrice = calculateCartTotal(cart);

    if (totalItems === 0) {
      return <Badge variant="secondary">Empty</Badge>;
    } else if (totalPrice > 500) {
      return <Badge variant="success">High Value</Badge>;
    } else if (totalPrice > 100) {
      return <Badge variant="primary">Active</Badge>;
    } else {
      return <Badge variant="warning">Low Value</Badge>;
    }
  };

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
            Shopping Carts
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage customer shopping carts ({filteredCarts.length} carts)
          </p>
        </div>
        <Button variant="primary">
          <Plus className="h-5 w-5 mr-2" />
          Create Cart
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Carts
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {carts.length}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20">
              <ShoppingCart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Active Carts
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {carts.filter((c) => calculateTotalItems(c) > 0).length}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/20">
              <ShoppingCart className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Value
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                $
                {carts
                  .reduce((sum, cart) => sum + calculateCartTotal(cart), 0)
                  .toFixed(2)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/20">
              <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Avg. Cart Value
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                $
                {(
                  carts.reduce(
                    (sum, cart) => sum + calculateCartTotal(cart),
                    0
                  ) / Math.max(carts.length, 1)
                ).toFixed(2)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/20">
              <Users className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <Input
              leftIcon={<Search className="h-5 w-5 text-gray-400" />}
              placeholder="Search by User ID or Cart ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div>
            <select
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active Carts</option>
              <option value="high-value">High Value</option>
              <option value="empty">Empty Carts</option>
            </select>
          </div>

          <div>
            <Button
              variant="outline"
              fullWidth
              onClick={() => {
                setSearchTerm("");
                setSelectedStatus("all");
              }}
            >
              <Filter className="h-5 w-5 mr-2" />
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Carts Table */}
      <Card padding={false}>
        <div className="overflow-x-auto">
          <Table>
            <Table.Header>
              <Table.HeaderCell>Cart ID</Table.HeaderCell>
              <Table.HeaderCell>User ID</Table.HeaderCell>
              <Table.HeaderCell>Items</Table.HeaderCell>
              <Table.HeaderCell>Total Value</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
              <Table.HeaderCell>Date</Table.HeaderCell>
              <Table.HeaderCell>Actions</Table.HeaderCell>
            </Table.Header>

            <Table.Body>
              {filteredCarts.map((cart) => (
                <Table.Row key={cart.id}>
                  <Table.Cell>
                    <div className="font-medium text-gray-900 dark:text-white">
                      #{cart.id}
                    </div>
                  </Table.Cell>

                  <Table.Cell>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900 dark:text-white">
                        {cart.userId}
                      </span>
                    </div>
                  </Table.Cell>

                  <Table.Cell>
                    <div className="flex items-center">
                      <ShoppingCart className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {calculateTotalItems(cart)}
                      </span>
                    </div>
                  </Table.Cell>

                  <Table.Cell>
                    <div className="font-bold text-gray-900 dark:text-white">
                      ${calculateCartTotal(cart).toFixed(2)}
                    </div>
                  </Table.Cell>

                  <Table.Cell>{getStatusBadge(cart)}</Table.Cell>

                  <Table.Cell>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(cart.date || new Date().toISOString())}
                    </div>
                  </Table.Cell>

                  <Table.Cell>
                    <div className="flex items-center space-x-2">
                      <Link to={`/admin/carts/${cart.id}`}>
                        <Button size="small" variant="ghost">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>

                      <Button
                        size="small"
                        variant="ghost"
                        onClick={() => {
                          setSelectedCart(cart);
                          setIsDeleteModalOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>

        {filteredCarts.length === 0 && (
          <div className="text-center py-12">
            <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto" />
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              No carts found
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {searchTerm || selectedStatus !== "all"
                ? "Try adjusting your search or filter to find what you're looking for."
                : "No shopping carts have been created yet."}
            </p>
            <div className="mt-6">
              <Button variant="primary">
                <Plus className="h-5 w-5 mr-2" />
                Create First Cart
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Delete Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedCart(null);
        }}
        title="Delete Cart"
        size="small"
      >
        <p className="text-gray-600 dark:text-gray-400">
          Are you sure you want to delete Cart #{selectedCart?.id}? This action
          cannot be undone.
        </p>

        {selectedCart && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <div className="flex justify-between mb-1">
                <span>User ID:</span>
                <span className="font-medium">{selectedCart.userId}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span>Total Items:</span>
                <span className="font-medium">
                  {calculateTotalItems(selectedCart)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total Value:</span>
                <span className="font-medium">
                  ${calculateCartTotal(selectedCart).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={() => {
              setIsDeleteModalOpen(false);
              setSelectedCart(null);
            }}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} loading={api.loading}>
            Delete Cart
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Carts;
