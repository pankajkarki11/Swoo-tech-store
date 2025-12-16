// src/pages/ProductDetails.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useOutletContext } from "react-router-dom";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import useApi from "../../services/AdminuseApi";
import {
  ArrowLeft,
  Edit,
  Star,
  Package,
  Tag,
  Calendar,
  BarChart,
} from "lucide-react";

const ProductDetails = () => {
  const { id } = useParams();
  const { toast } = useOutletContext();
  const navigate = useNavigate();
  const api = useApi();

  const [product, setProduct] = useState([]);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const[seletedProduct,setSelectedProduct] = useState("");
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    description: "",
    category: "",
    image: "",
  });

  useEffect(() => {
    fetchProductDetails();
    fetchCategories();
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const response = await api.productAPI.getById(id);
      setProduct(response.data);

      // Fetch related products by category
      if (response.data?.category) {
        const relatedResponse = await api.productAPI.getByCategory(
          response.data.category
        );
        // Filter out current product and limit to 9
        const related = (relatedResponse.data || [])
          .filter((p) => p.id !== parseInt(id))
          .slice(0, 9);
        setRelatedProducts(related);
      }
    } catch (error) {
      toast.error("Failed to load product details");
      console.error("Error fetching product details:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.productAPI.getCategories();
      setCategories(response.data || []);
    } catch (error) {
      toast.error("Failed to load categories");
      console.error("Error fetching categories:", error);
    }
  };

  const handleDelete = async () => {
    if (!product) return;

    try {
      await api.productAPI.delete(product.id);
      toast.success("Product deleted successfully");
      navigate("/admin/dashboard");
     setRelatedProducts((prev) =>
    prev.filter((product) => product.id !== selectedProduct.id));
     setIsDeleteModalOpen(false);
     setSelectedProduct(null);
     navigate("/admin/dashboard");

    } catch (error) {
      toast.error("Failed to delete product");
      console.error("Error deleting product:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
      };

      if (product) {
        // Update existing product
        const response = await api.productAPI.update(product.id, productData);
        toast.success("Product updated successfully");
        // Refresh product details
        // fetchProductDetails();
        //to show updated changes in the state
       setProduct((prev) => ({
  ...prev,
  ...productData,
}));

      } else {
        // Create new product - this shouldn't happen on details page but handle it anyway
        const response = await api.productAPI.create(productData);
        toast.success("Product created successfully");
        navigate(`/admin/products/${response.data.id}`);
      }

      setIsProductModalOpen(false);
      setSelectedProduct(null);
      setFormData({
        title: "",
        price: "",
        description: "",
        category: "",
        image: "",
      });
    } catch (error) {
      toast.error(
        product ? "Failed to update product" : "Failed to create product"
      );
      console.error("Error saving product:", error);
    }
  };

  const handleEdit = (productToEdit) => {
    setFormData({
      title: productToEdit.title,
      price: productToEdit.price.toString(),
      description: productToEdit.description,
      category: productToEdit.category,
      image: productToEdit.image,
    });
    setIsProductModalOpen(true);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
        );
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
        );
      } else {
        stars.push(
          <Star key={i} className="h-5 w-5 text-gray-300 dark:text-gray-600" />
        );
      }
    }

    return stars;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!product) {
    return (
      <Card>
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto" />
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
            Product not found
          </h3>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            The product you're looking for doesn't exist.
          </p>
          <div className="mt-6">
            <Link to="/admin/products">
              <Button variant="primary">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Products
              </Button>
            </Link>
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
          <Link to="/admin/products">
            <Button variant="outline" size="small">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Product Details
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              View and manage product information
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Product info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Card */}
          <Card>
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Product Image */}
              <div className="lg:w-1/3">
                <div className="aspect-square rounded-xl bg-gray-100 dark:bg-gray-700 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-contain p-4"
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/400?text=No+Image";
                    }}
                  />
                </div>
              </div>

              {/* Product Details */}
              <div className="lg:w-2/3">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {product.title}
                    </h2>
                    <div className="flex items-center mt-2 space-x-4">
                      <Badge variant="primary">{product.category}</Badge>
                      <div className="flex items-center">
                        {renderStars(product.rating?.rate || 0)}
                        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                          {product.rating?.rate || "N/A"} (
                          {product.rating?.count || 0} reviews)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">
                      ${product.price}
                    </div>
                    <div className="text-sm text-green-600 dark:text-green-400">
                      In Stock
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Description
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Product Stats */}
                <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-center h-10 w-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg mb-3 mx-auto">
                      <BarChart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {product.rating?.count || 0}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Total Reviews
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-center h-10 w-10 bg-green-100 dark:bg-green-900/30 rounded-lg mb-3 mx-auto">
                      <Star className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {product.rating?.rate || "N/A"}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Avg. Rating
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-center h-10 w-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg mb-3 mx-auto">
                      <Tag className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        #{product.id}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Product ID
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-center h-10 w-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg mb-3 mx-auto">
                      <Calendar className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        New
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Status
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Reviews */}
          <Card>
            <Card.Header>
              <Card.Title>Customer Reviews</Card.Title>
            </Card.Header>

            <div className="space-y-4">
              {product.rating?.count > 0 ? (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {renderStars(product.rating.rate)}
                      <span className="ml-2 text-lg font-bold text-gray-900 dark:text-white">
                        {product.rating.rate}
                      </span>
                      <span className="ml-1 text-gray-600 dark:text-gray-400">
                        out of 5
                      </span>
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      {product.rating.count} total reviews
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-center py-8">
                      <Star className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        No individual reviews available
                      </h3>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Star className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    No reviews yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Be the first to review this product!
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right column - Actions and Related Products */}
        <div className="space-y-6">
          {/* Actions */}
          <Card>
            <Card.Header>
              <Card.Title>Quick Actions</Card.Title>
            </Card.Header>

            <div className="space-y-2">
              <Button
                variant="outline"
                fullWidth
                onClick={() => handleEdit(product)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Product
              </Button>

              <Button
                variant="danger"
                fullWidth
                onClick={() => setIsDeleteModalOpen(true)}
              >
                <Package className="h-4 w-4 mr-2" />
                Delete Product
              </Button>
            </div>
          </Card>

          {/* Quick Stats */}
          <Card>
            <Card.Header>
              <Card.Title>Product Statistics</Card.Title>
            </Card.Header>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  Views Today
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  124
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  Added to Cart
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  47
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  Conversion Rate
                </span>
                <span className="font-medium text-green-600">8.2%</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  Revenue
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  $2,845
                </span>
              </div>
            </div>
          </Card>

          {/* Related Products */}
          <Card>
            <Card.Header>
              <Card.Title>Related Products</Card.Title>
              <Card.Description>
                Similar products you might like
              </Card.Description>
            </Card.Header>

            <div className="space-y-4">
              {relatedProducts.length > 0 ? (
                relatedProducts.map((relatedProduct) => (
                  <Link
                    key={relatedProduct.id}
                    to={`/admin/products/${relatedProduct.id}`}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="h-16 w-16 flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                      <img
                        src={relatedProduct.image}
                        alt={relatedProduct.title}
                        className="h-full w-full object-contain p-1"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {relatedProduct.title}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          ${relatedProduct.price}
                        </span>
                        <Badge variant="secondary" size="small">
                          {relatedProduct.category}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-4">
                  <Package className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    No related products found
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Delete Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Product"
        size="small"
      >
        <p className="text-gray-600 dark:text-gray-400">
          Are you sure you want to delete "{product?.title}"? This
          action cannot be undone.
        </p>

        <div className="mt-6 flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={() => setIsDeleteModalOpen(false)}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </Modal>

      {/* Product Form Modal */}
      <Modal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setFormData({
            title: "",
            price: "",
            description: "",
            category: "",
            image: "",
          });
        }}
        title="Edit Product"
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
                setFormData({
                  title: "",
                  price: "",
                  description: "",
                  category: "",
                  image: "",
                });
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Update Product
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProductDetails;