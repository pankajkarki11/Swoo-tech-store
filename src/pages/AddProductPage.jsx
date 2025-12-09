// src/pages/AddProductPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  Tag,
  DollarSign,
  FileText,
  Image as ImageIcon,
  Package,
  Grid,
  AlertCircle,
  CheckCircle,
  X,
  ArrowLeft,
} from "lucide-react";

const AddProductPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    description: "",
    category: "electronics",
    image: "",
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Categories for dropdown
  const categories = [
    { value: "electronics", label: "Electronics" },
    { value: "jewelery", label: "Jewelery" },
    { value: "men's clothing", label: "Men's Clothing" },
    { value: "women's clothing", label: "Women's Clothing" },
  ];

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle image upload (simulated)
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);

    // Create preview URLs for selected images
    const newImages = files.map((file) => ({
      id: Date.now() + Math.random(),
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
    }));

    setImages([...images, ...newImages]);

    // Set first image as main image if not already set
    if (!formData.image && newImages.length > 0) {
      setFormData({
        ...formData,
        image: newImages[0].preview,
      });
    }
  };

  // Remove image from list
  const removeImage = (id) => {
    const updatedImages = images.filter((img) => img.id !== id);
    setImages(updatedImages);

    // If removed image was the main image, update formData
    if (formData.image === images.find((img) => img.id === id)?.preview) {
      setFormData({
        ...formData,
        image: updatedImages.length > 0 ? updatedImages[0].preview : "",
      });
    }
  };

  // Set image as main
  const setAsMainImage = (previewUrl) => {
    setFormData({
      ...formData,
      image: previewUrl,
    });
  };

  // Validate form
  const validateForm = () => {
    if (!formData.title.trim()) {
      setError("Product title is required");
      return false;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError("Valid price is required");
      return false;
    }
    if (!formData.description.trim()) {
      setError("Product description is required");
      return false;
    }
    if (!formData.image) {
      setError("Please select a main image");
      return false;
    }
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Since FakeStoreAPI is read-only, we'll simulate adding to localStorage
      // In a real app, this would be a POST request to your backend

      // Get existing products from localStorage or initialize empty array
      const existingProducts = JSON.parse(
        localStorage.getItem("swmart_products") || "[]"
      );

      // Create new product with ID
      const newProduct = {
        id:
          existingProducts.length > 0
            ? Math.max(...existingProducts.map((p) => p.id)) + 1
            : 21, // Start from 21 to avoid conflict with FakeStoreAPI IDs (1-20)
        title: formData.title,
        price: parseFloat(formData.price),
        description: formData.description,
        category: formData.category,
        image: formData.image,
        rating: {
          rate: 4.5, // Default rating for new products
          count: 0, // No reviews yet
        },
        addedAt: new Date().toISOString(),
        images: images.map((img) => img.preview),
      };

      // Add to localStorage
      const updatedProducts = [...existingProducts, newProduct];
      localStorage.setItem("swmart_products", JSON.stringify(updatedProducts));

      // Dispatch event for other components
      window.dispatchEvent(new Event("productsUpdated"));

      // Show success message
      setSuccess(true);

      // Reset form after 2 seconds
      setTimeout(() => {
        resetForm();
        setSuccess(false);
        // Optionally navigate to products page
        // navigate("/products");
      }, 2000);
    } catch (err) {
      setError("Failed to add product. Please try again.");
      console.error("Error adding product:", err);
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: "",
      price: "",
      description: "",
      category: "electronics",
      image: "",
    });
    setImages([]);
  };

  // Simulate adding via FakeStoreAPI (for demonstration)
  const handleFakeStoreSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Note: This is a simulation since FakeStoreAPI doesn't support POST
      // In a real app, you would use your own backend
      const response = await fetch("https://fakestoreapi.com/products", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Product added (simulated):", data);
        setSuccess(true);
        resetForm();
      } else {
        throw new Error("Failed to add product");
      }
    } catch (err) {
      setError(
        "This is a simulated POST request. In a real app, this would add the product."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="mr-4 p-2 rounded-full hover:bg-gray-100 transition"
            >
              <ArrowLeft size={24} className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Add New Product
              </h1>
              <p className="text-gray-600">List your product for sale</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={resetForm}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              Reset
            </button>
            <button
              onClick={() => navigate("/addedproduct")}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition"
            >
              View Products
            </button>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center">
            <CheckCircle className="text-green-500 mr-3" size={24} />
            <div>
              <p className="font-semibold text-green-800">
                Product Added Successfully!
              </p>
              <p className="text-green-600 text-sm">
                Your product has been added to the catalog.
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center">
            <AlertCircle className="text-red-500 mr-3" size={24} />
            <div>
              <p className="font-semibold text-red-800">Error</p>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Information */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <Package className="mr-3" size={20} />
                    Basic Information
                  </h2>
                  <div className="space-y-6">
                    {/* Product Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Title *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Tag className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          name="title"
                          value={formData.title}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                          placeholder="Enter product title"
                          required
                        />
                      </div>
                    </div>

                    {/* Price and Category */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Price ($) *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <DollarSign className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            placeholder="0.00"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Category *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Grid className="h-5 w-5 text-gray-400" />
                          </div>
                          <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition appearance-none"
                            required
                          >
                            {categories.map((cat) => (
                              <option key={cat.value} value={cat.value}>
                                {cat.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description *
                      </label>
                      <div className="relative">
                        <div className="absolute top-3 left-3 pointer-events-none">
                          <FileText className="h-5 w-5 text-gray-400" />
                        </div>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                          rows="6"
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none"
                          placeholder="Describe your product in detail..."
                          required
                        />
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        Include key features, specifications, and benefits
                      </p>
                    </div>
                  </div>
                </div>

                {/* Image Upload */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <ImageIcon className="mr-3" size={20} />
                    Product Images
                  </h2>

                  {/* Main Image Preview */}
                  {formData.image && (
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Main Image Preview
                      </label>
                      <div className="relative w-40 h-40 border-2 border-blue-500 rounded-lg overflow-hidden">
                        <img
                          src={formData.image}
                          alt="Main product"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                          Main
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Upload Area */}
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">
                      <label
                        htmlFor="image-upload"
                        className="text-blue-600 hover:text-blue-700 cursor-pointer font-medium"
                      >
                        Click to upload
                      </label>{" "}
                      or drag and drop
                    </p>
                    <p className="text-sm text-gray-500">
                      PNG, JPG, GIF up to 5MB each
                    </p>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>

                  {/* Image Thumbnails */}
                  {images.length > 0 && (
                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Uploaded Images ({images.length})
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {images.map((img) => (
                          <div
                            key={img.id}
                            className={`relative border rounded-lg overflow-hidden group ${
                              formData.image === img.preview
                                ? "border-2 border-blue-500"
                                : "border-gray-200"
                            }`}
                          >
                            <img
                              src={img.preview}
                              alt={img.name}
                              className="w-full h-32 object-cover"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                              <div className="flex space-x-2">
                                <button
                                  type="button"
                                  onClick={() => setAsMainImage(img.preview)}
                                  className="p-2 bg-white rounded-full hover:bg-gray-100 transition"
                                  title="Set as main"
                                >
                                  <ImageIcon size={16} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeImage(img.id)}
                                  className="p-2 bg-white rounded-full hover:bg-red-50 text-red-500 transition"
                                  title="Remove"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            </div>
                            {formData.image === img.preview && (
                              <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                                Main
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit Buttons */}
                <div className="pt-6 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3.5 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {loading ? (
                        <>
                          <svg
                            className="animate-spin h-5 w-5 mr-3 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Adding Product...
                        </>
                      ) : (
                        "Add Product to Local Storage"
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleFakeStoreSubmit}
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-700 text-white py-3.5 px-6 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-800 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                      title="Simulated POST to FakeStoreAPI"
                    >
                      Simulate API Post
                    </button>
                  </div>

                  <p className="text-sm text-gray-500 mt-4 text-center">
                    * FakeStoreAPI is read-only. Products are saved to
                    localStorage for demonstration.
                  </p>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column - Guidelines */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-8 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Listing Guidelines
              </h2>

              <div className="space-y-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-blue-800 mb-2">
                    📝 Title Tips
                  </h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Be clear and descriptive</li>
                    <li>• Include brand and model</li>
                    <li>• Add key specifications</li>
                    <li>• Keep it under 100 characters</li>
                  </ul>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-medium text-green-800 mb-2">
                    💰 Pricing Tips
                  </h3>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Research similar products</li>
                    <li>• Consider your costs</li>
                    <li>• Be competitive</li>
                    <li>• Include all fees</li>
                  </ul>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg">
                  <h3 className="font-medium text-purple-800 mb-2">
                    📸 Image Tips
                  </h3>
                  <ul className="text-sm text-purple-700 space-y-1">
                    <li>• Use high-quality images</li>
                    <li>• Show multiple angles</li>
                    <li>• Include product in use</li>
                    <li>• Good lighting is key</li>
                  </ul>
                </div>

                <div className="p-4 bg-amber-50 rounded-lg">
                  <h3 className="font-medium text-amber-800 mb-2">
                    📋 Description Tips
                  </h3>
                  <ul className="text-sm text-amber-700 space-y-1">
                    <li>• List all features</li>
                    <li>• Mention condition</li>
                    <li>• Include dimensions</li>
                    <li>• Add warranty info</li>
                  </ul>
                </div>

                {/* Quick Stats */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="font-medium text-gray-900 mb-4">
                    Your Product Stats
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Title Length</span>
                      <span
                        className={`font-medium ${
                          formData.title.length > 0 &&
                          formData.title.length < 100
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {formData.title.length}/100
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Description Length</span>
                      <span
                        className={`font-medium ${
                          formData.description.length > 50
                            ? "text-green-600"
                            : formData.description.length > 0
                            ? "text-amber-600"
                            : "text-red-600"
                        }`}
                      >
                        {formData.description.length} chars
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Images Uploaded</span>
                      <span className="font-medium text-blue-600">
                        {images.length}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Note about FakeStoreAPI */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="font-medium text-gray-900 mb-2">ℹ️ Note</h3>
                  <p className="text-sm text-gray-600">
                    FakeStoreAPI is a read-only API for testing. Products added
                    here are saved to your browser's localStorage for
                    demonstration purposes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProductPage;
