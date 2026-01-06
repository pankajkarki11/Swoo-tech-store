// src/pages/Products.jsx - OPTIMIZED VERSION
import React, { useState, useEffect } from "react";
import { Link, useOutletContext } from "react-router-dom";
import Card from "../../components_temp/ui/Card";
import Button from "../../components_temp/ui/Button";
import Input from "../../components_temp/ui/Input";
import Table from "../../components_temp/ui/Table";
import Badge from "../../components_temp/ui/Badge";
import Modal from "../../components_temp/ui/Modal";
import LoadingSpinner from "../../components_temp/ui/LoadingSpinner";
import useApi from "../../services/AdminuseApi";
import { Search, Filter, Plus, Edit, Trash2, Eye, Package } from "lucide-react";

const Products = () => {
  const { toast } = useOutletContext();
  const api = useApi();

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    description: "",
    category: "",
    image: "",
  });

  // OPTIMIZED: Single effect that fetches both products and categories
  useEffect(() => {
    fetchInitialData();
  }, []); // Empty dependency array - only runs once on mount

  const fetchInitialData = async () => {
    try {
      setLoading(true);

      // Fetch both at the same time - only 2 API calls total
      const [productsResponse, categoriesResponse] = await Promise.all([
        api.productAPI.getAll(),
        api.productAPI.getCategories(),
      ]);

      setProducts(productsResponse.data || []);
      setCategories(categoriesResponse.data || []);
    } catch (error) {
      console.error("Error fetching initial data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // Filter products when search or category changes
  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, selectedCategory]);

  const filterProducts = () => {
    let filtered = [...products];

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.title.toLowerCase().includes(searchLower) ||
          product.description.toLowerCase().includes(searchLower) ||
          product.id.toString().includes(searchTerm)
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (product) => product.category === selectedCategory
      );
    }

    setFilteredProducts(filtered);
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;

    try {
      await api.productAPI.delete(selectedProduct.id);
      toast.success("Product deleted successfully");

      // Remove product from state (no API refetch needed)
      setProducts((prev) =>
        prev.filter((product) => product.id !== selectedProduct.id)
      );

      setIsDeleteModalOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
      };

      if (selectedProduct) {
        // Update existing product
        const response = await api.productAPI.update(
          selectedProduct.id,
          productData
        );
        toast.success("Product updated successfully");

        // Update product in state (no API refetch needed)
        setProducts((prev) =>
          prev.map((p) =>
            p.id === selectedProduct.id ? { ...p, ...response.data } : p
          )
        );
      } else {
        // Create new product
        const response = await api.productAPI.create(productData);
        toast.success("Product created successfully");

        // Add new product to state (no API refetch needed)
        setProducts((prev) => [...prev, response.data]);
      }

      setIsProductModalOpen(false);
      setSelectedProduct(null);
      resetForm();
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error(
        selectedProduct
          ? "Failed to update product"
          : "Failed to create product"
      );
    }
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setFormData({
      title: product.title,
      price: product.price.toString(),
      description: product.description,
      category: product.category,
      image: product.image,
    });
    setIsProductModalOpen(true);
  };

  const handleAddNew = () => {
    setSelectedProduct(null);
    resetForm();
    setIsProductModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      price: "",
      description: "",
      category: "",
      image: "",
    });
  };

  const handleRefresh = async () => {
    await fetchInitialData();
    toast.success("Data refreshed");
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
  };

  if (loading) {
    return (
            <div data-testid="loading-spinner" className="flex items-center justify-center h-64">
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
            Products
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your product catalog ({filteredProducts.length} products)
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={handleRefresh} loading={loading}>
            Refresh
          </Button>
          <Button variant="primary" icon={<Plus className="h-5 w-5" />} onClick={handleAddNew}>
            
            Add Product
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total Products
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {products.length}
            </p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Categories
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {categories.length}
            </p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Avg. Price
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              $
              {products.length > 0
                ? (
                    products.reduce((sum, p) => sum + parseFloat(p.price), 0) /
                    products.length
                  ).toFixed(2)
                : "0.00"}
            </p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">Filtered</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {filteredProducts.length}
            </p>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <Input
              leftIcon={<Search className="h-5 w-5 text-gray-400" />}
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div>
            <select
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Button variant="outline" icon={  <Filter className="h-5 w-5 mr-2" />}fullWidth onClick={clearFilters}>
            
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Products Table */}
      <Card padding={false}>
        <div className="overflow-x-auto">
          <Table>
            <Table.Header>
              <Table.HeaderCell>Product</Table.HeaderCell>
              <Table.HeaderCell>Category</Table.HeaderCell>
              <Table.HeaderCell>Price</Table.HeaderCell>
              <Table.HeaderCell>Rating</Table.HeaderCell>
              <Table.HeaderCell>Actions</Table.HeaderCell>
            </Table.Header>

            <Table.Body>
              {filteredProducts.map((product) => (
                <Table.Row key={product.id}>
                  <Table.Cell>
                    <div className="flex items-center">
                      <img
                        className="h-10 w-10 rounded-lg object-cover mr-3"
                        src={product.image}
                        alt={product.title}
                        onError={(e) => {
                          e.target.src =
                            "https://via.placeholder.com/150?text=No+Image";
                        }}
                      />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {product.title.length > 50
                            ? `${product.title.substring(0, 50)}...`
                            : product.title}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          ID: {product.id}
                        </div>
                      </div>
                    </div>
                  </Table.Cell>

                  <Table.Cell>
                    <Badge variant="secondary">{product.category}</Badge>
                  </Table.Cell>

                  <Table.Cell>
                    <span className="font-medium text-gray-900 dark:text-white">
                      ${parseFloat(product.price).toFixed(2)}
                    </span>
                  </Table.Cell>

                  <Table.Cell>
                    <div className="flex items-center">
                      <span className="text-yellow-400 mr-1">★</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {product.rating?.rate || "N/A"}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400 text-sm ml-1">
                        ({product.rating?.count || 0})
                      </span>
                    </div>
                  </Table.Cell>

                  <Table.Cell>
                    <div className="flex items-center space-x-2">
                      <Link to={`/admin/products/${product.id}`}>
                        <Button size="small" variant="ghost">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                            
                      <Button
                     aria-label="Edit"
                        size="small"
                        variant="ghost"
                        onClick={() => handleEdit(product)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                     

                      <Button
                      aria-label="delete-product"
                        size="small"
                        variant="ghost"
                        onClick={() => {
                          setSelectedProduct(product);
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

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto" />
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              No products found
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {searchTerm || selectedCategory !== "all"
                ? "Try adjusting your search or filter to find what you're looking for."
                : "Get started by creating a new product."}
            </p>
            {searchTerm || selectedCategory !== "all" ? (
              <div className="mt-6">
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="mt-6">
                <Button variant="primary" onClick={handleAddNew}>
                  <Plus className="h-5 w-5 mr-2" />
                  Add Product
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Delete Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedProduct(null);
        }}
        title="Delete Product"
        size="small"
      >
        <p className="text-gray-600 dark:text-gray-400">
          Are you sure you want to delete "{selectedProduct?.title}"? This
          action cannot be undone.
        </p>

        <div className="mt-6 flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={() => {
              setIsDeleteModalOpen(false);
              setSelectedProduct(null);
            }}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} loading={api.loading}>
            Delete
          </Button>
        </div>
      </Modal>

      {/* Product Form Modal */}
      <Modal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setSelectedProduct(null);
          resetForm();
        }}
        title={selectedProduct ? "Edit Product" : "Add New Product"}
        size="large"
      >
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Product Title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
                placeholder="Enter product title"
              />

              <Input
                label="Price ($)"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                required
                placeholder="0.00"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category *
                </label>
                <select
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Image URL"
                type="url"
                value={formData.image}
                onChange={(e) =>
                  setFormData({ ...formData, image: e.target.value })
                }
                required
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description *
              </label>
              <textarea
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="4"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
                placeholder="Enter product description"
              />
            </div>

            {formData.image && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Image Preview
                </label>
                <img
                  src={formData.image}
                  alt="Preview"
                  className="h-32 w-32 object-cover rounded-lg border border-gray-300"
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/150?text=Invalid+URL";
                  }}
                />
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                setIsProductModalOpen(false);
                setSelectedProduct(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={api.loading}>
              {selectedProduct ? "Update Product" : "Create Product"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Products;
