// src/pages/ProductsPage.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Search,
  Filter,
  Grid,
  List,
  Star,
  ShoppingCart,
  Plus,
} from "lucide-react";
 

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    loadProducts();

    // Listen for product updates
    window.addEventListener("productsUpdated", loadProducts);

    return () => {
      window.removeEventListener("productsUpdated", loadProducts);
    };
  }, []);

  const loadProducts = () => {
    // Load from localStorage (our added products)
    const localProducts = JSON.parse(
      localStorage.getItem("swmart_products") || "[]"
    );

    // Also fetch from FakeStoreAPI for demonstration
    fetch("https://fakestoreapi.com/products")
      .then((res) => res.json())
      .then((apiProducts) => {
        // Combine API products with our local products
        setProducts([...localProducts, ...apiProducts]);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
        setProducts(localProducts);
      });
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(products.map((p) => p.category))];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-600 mt-1">
              Browse all products ({filteredProducts.length} items)
            </p>
          </div>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <Link
              to="/addproduct"
              className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition"
            >
              <Plus size={18} className="mr-2" />
              Add Product
            </Link>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Products
              </label>
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <div className="relative">
                <Filter
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition appearance-none"
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* View Toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                View 
              </label>
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`flex-1 py-2 flex items-center justify-center ${
                    viewMode === "grid"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Grid size={18} className="mr-2" />
                All Products
                </button>
               
              </div>
            </div>


          </div>
        </div>

        {/* grid mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden group"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.addedAt && (
                    <div className="absolute top-3 left-3 bg-green-500 text-white text-xs px-2 py-1 rounded">
                      New
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center mb-2">
                    <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-600 rounded">
                      {product.category}
                    </span>
                    {product.addedAt && (
                      <span className="ml-2 text-xs text-gray-500">
                        (Added by you)
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {product.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xl font-bold text-gray-900">
                        ${product.price}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Star
                          size={14}
                          className="text-yellow-400 fill-current mr-1"
                        />
                        {product.rating?.rate || 4.5} (
                        {product.rating?.count || 0})
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        // Add to cart logic here
                        const cart = JSON.parse(
                          localStorage.getItem("swmart_cart") || "[]"
                        );
                        const existingItem = cart.find(
                          (item) => item.id === product.id
                        );

                        if (existingItem) {
                          existingItem.quantity += 1;
                        } else {
                          cart.push({ ...product, quantity: 1 });
                        }

                        localStorage.setItem(
                          "swmart_cart",
                          JSON.stringify(cart)
                        );
                        window.dispatchEvent(new Event("cartUpdated"));
                        console.log("added to cart!");

                        toast.success("Added to cart", {
                          style: {
                            background: "#333",
                            color: "#fff",
                            borderRadius: "10px",
                          },
                        });
                      }}
                      className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                    >
                      <ShoppingCart size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
              <Search size={40} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || categoryFilter !== "all"
                ? "Try adjusting your search or filter"
                : "Add your first product to get started"}
            </p>
            <Link
              to="/add-product"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition font-medium"
            >
              <Plus size={18} className="mr-2" />
              Add Product
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
