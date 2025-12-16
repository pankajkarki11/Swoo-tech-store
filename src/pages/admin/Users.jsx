// src/pages/Users.jsx
import React, { useState, useEffect, useCallback } from "react";
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
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

const UsersPage = () => {
  const { toast } = useOutletContext();
  const api = useApi();

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [hasFetched, setHasFetched] = useState(false);

  // Memoized fetch function
  const fetchUsers = useCallback(async () => {
    if (hasFetched && !loading) return;

    try {
      setLoading(true);
      const response = await api.userAPI.getAll();
      setUsers(response.data || []);
      setHasFetched(true);
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [api.userAPI, toast, hasFetched, loading]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Filter users when search or role changes
  useEffect(() => {
    let filtered = [...users];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.name?.firstname
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          user.name?.lastname
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.username?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Role filter
    if (selectedRole !== "all") {
      filtered = filtered.filter((user) => {
        const username = user.username || "";
        if (selectedRole === "admin") {
          return username.includes("admin") || username.includes("john");
        } else if (selectedRole === "customer") {
          return !username.includes("admin");
        }
        return true;
      });
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, selectedRole]);

  const handleDelete = async () => {
    if (!selectedUser) return;

    try {
      await api.userAPI.delete(selectedUser.id);
      toast.success("User deleted successfully");

      // Remove user from state instead of refetching
      setUsers((prev) => prev.filter((user) => user.id !== selectedUser.id));
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  const getUserRole = (user) => {
    const username = user.username || "";
    if (username.includes("admin") || username.includes("john")) {
      return <Badge variant="danger">Admin</Badge>;
    } else if (username.includes("manager")) {
      return <Badge variant="warning">Manager</Badge>;
    } else {
      return <Badge variant="success">Customer</Badge>;
    }
  };

  const getInitials = (user) => {
    const first = user.name?.firstname?.[0] || "";
    const last = user.name?.lastname?.[0] || "";
    return (first + last).toUpperCase();
  };

  const handleRefresh = () => {
    setHasFetched(false);
    fetchUsers();
  };

  if (loading && users.length === 0) {
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
            Users
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage user accounts ({filteredUsers.length} users)
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={handleRefresh}>
            Refresh
          </Button>
          <Button variant="primary">
            <Plus className="h-5 w-5 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Users
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {users.length}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20">
              <div className="h-6 w-6 text-blue-600 dark:text-blue-400">👥</div>
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Active Users
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {users.length - 1}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/20">
              <div className="h-6 w-6 text-green-600 dark:text-green-400">
                ✅
              </div>
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Admins
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {
                  users.filter(
                    (u) =>
                      u.username?.includes("admin") ||
                      u.username?.includes("john")
                  ).length
                }
              </p>
            </div>
            <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/20">
              <div className="h-6 w-6 text-purple-600 dark:text-purple-400">
                👑
              </div>
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Customers
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {users.filter((u) => !u.username?.includes("admin")).length}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/20">
              <div className="h-6 w-6 text-orange-600 dark:text-orange-400">
                👤
              </div>
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
              placeholder="Search users by name, email, or username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div>
            <select
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="admin">Administrators</option>
              <option value="customer">Customers</option>
            </select>
          </div>

          <div>
            <Button
              variant="outline"
              fullWidth
              onClick={() => {
                setSearchTerm("");
                setSelectedRole("all");
              }}
            >
              <Filter className="h-5 w-5 mr-2" />
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card padding={false}>
        <div className="overflow-x-auto">
          <Table>
            <Table.Header>
              <Table.HeaderCell>User</Table.HeaderCell>
              <Table.HeaderCell>Contact</Table.HeaderCell>
              <Table.HeaderCell>Location</Table.HeaderCell>
              <Table.HeaderCell>Role</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
              <Table.HeaderCell>Actions</Table.HeaderCell>
            </Table.Header>

            <Table.Body>
              {filteredUsers.map((user) => (
                <Table.Row key={user.id}>
                  <Table.Cell>
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                        {getInitials(user)}
                      </div>
                      <div className="ml-4">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {user.name?.firstname} {user.name?.lastname}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          @{user.username}
                        </div>
                      </div>
                    </div>
                  </Table.Cell>

                  <Table.Cell>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <Mail className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-900 dark:text-white truncate">
                          {user.email}
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Phone className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-900 dark:text-white">
                          {user.phone}
                        </span>
                      </div>
                    </div>
                  </Table.Cell>

                  <Table.Cell>
                    <div className="flex items-center text-sm">
                      <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900 dark:text-white">
                        {user.address?.city}, {user.address?.zipcode}
                      </span>
                    </div>
                  </Table.Cell>

                  <Table.Cell>{getUserRole(user)}</Table.Cell>

                  <Table.Cell>
                    <Badge variant="success">Active</Badge>
                  </Table.Cell>

                  <Table.Cell>
                    <div className="flex items-center space-x-2">
                      <Link to={`/admin/users/${user.id}`}>
                        <Button size="small" variant="ghost">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>

                      <Button
                        size="small"
                        variant="ghost"
                        onClick={() => {
                          // Handle edit
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>

                      <Button
                        size="small"
                        variant="ghost"
                        onClick={() => {
                          setSelectedUser(user);
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

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <div className="h-12 w-12 text-gray-400 mx-auto mb-4">👥</div>
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              No users found
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {searchTerm || selectedRole !== "all"
                ? "Try adjusting your search or filter to find what you're looking for."
                : "No users have been created yet."}
            </p>
            <div className="mt-6">
              <Button variant="primary" onClick={handleRefresh}>
                Refresh Users
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
          setSelectedUser(null);
        }}
        title="Delete User"
        size="small"
      >
        <p className="text-gray-600 dark:text-gray-400">
          Are you sure you want to delete user "{selectedUser?.name?.firstname}{" "}
          {selectedUser?.name?.lastname}"? This action cannot be undone.
        </p>

        {selectedUser && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
              <div className="flex justify-between">
                <span>Username:</span>
                <span className="font-medium">@{selectedUser.username}</span>
              </div>
              <div className="flex justify-between">
                <span>Email:</span>
                <span className="font-medium">{selectedUser.email}</span>
              </div>
              <div className="flex justify-between">
                <span>Phone:</span>
                <span className="font-medium">{selectedUser.phone}</span>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={() => {
              setIsDeleteModalOpen(false);
              setSelectedUser(null);
            }}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} loading={api.loading}>
            Delete User
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default UsersPage;
