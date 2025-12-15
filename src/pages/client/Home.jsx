// src/pages/Home.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Check,
  Loader2,
  Sparkles,
  RefreshCw,
  ShoppingCart,
  Package,
} from "lucide-react";
import useApi from "../../services/AdminuseApi";
import ProductCard from "../../components/ProductCard";
import { useAuth } from "../../contexts/AuthContext";

const EcommerceHomepage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [wishlist, setWishlist] = useState(new Set());
  const [activeCategory, setActiveCategory] = useState("All");
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [visibleCount, setVisibleCount] = useState(8);
  const [systemStats, setSystemStats] = useState({
    totalProducts: 0,
    totalCarts: 0,
  });
  const [isRefreshingStats, setIsRefreshingStats] = useState(false);
  const [timer, setTimer] = useState({ hours: 10, minutes: 49, seconds: 9 });

  const api = useApi();

  const { allCarts, refreshAllData, calculateSystemCartStats } = useAuth();

  const heroSlides = [
    {
      id: 1,
      title: "New Collection 2024",
      description: "Discover the latest trends in technology and fashion",
      image:
        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600",
      color: "from-blue-900 to-blue-700",
      discount: "Up to 30% OFF",
      buttonColor: "bg-blue-600 hover:bg-blue-700",
    },
    {
      id: 2,
      title: "Smart Home Devices",
      description: "Transform your home with intelligent technology",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600",
      color: "from-purple-900 to-purple-700",
      discount: "Free Installation",
      buttonColor: "bg-purple-600 hover:bg-purple-700",
    },
    {
      id: 3,
      title: "Summer Sale",
      description: "Massive discounts on all categories",
      image:
        "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1600",
      color: "from-orange-900 to-orange-700",
      discount: "Up to 50% OFF",
      buttonColor: "bg-orange-600 hover:bg-orange-700",
    },
  ];

  // Ref to track if data has been loaded
  const hasLoadedData = useRef(false);

  useEffect(() => {
    loadInitialData();

    const carouselTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(carouselTimer);
  }, []);

  // Load initial data with caching
  const loadInitialData = async () => {
    if (hasLoadedData.current && !isRefreshingStats) return;

    setIsLoading(true);
    setError(null);

    try {
      const [productsResponse, categoriesResponse] = await Promise.all([
        api.productAPI.getAll(),
        api.productAPI.getCategories(),
      ]);

      setAllProducts(productsResponse.data);
      setProducts(productsResponse.data.slice(0, 12));
      setCategories(categoriesResponse.data);

      // Load system stats
      await loadSystemStats();

      hasLoadedData.current = true;
    } catch (err) {
      setError("Failed to load data. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load system statistics with caching
  const loadSystemStats = async (forceRefresh = false) => {
    try {
      // Get system cart stats
      const stats = await calculateSystemCartStats(forceRefresh);

      // Calculate additional stats from all carts
      if (allCarts && allCarts.length > 0) {
        let totalItems = 0;

        // Get all products for price calculation
        const { data: allProducts } = await api.productAPI.getAll(forceRefresh);

        allCarts.forEach((cart) => {
          if (cart.products && Array.isArray(cart.products)) {
            cart.products.forEach((item) => {
              const product = allProducts.find((p) => p.id === item.productId);
              if (product) {
                totalItems += item.quantity;
              }
            });
          }
        });

        setSystemStats({
          totalProducts: allProducts.length,
          totalCarts: allCarts.length,
        });
      }
    } catch (error) {
      console.error("Error loading system stats:", error);
    }
  };

  const handleCategoryClick = async (category) => {
    setActiveCategory(category);
    setVisibleCount(12);
    setProducts([]);

    if (category === "All") {
      setIsLoading(true);
      try {
        const { data: allProductsData } = await api.productAPI.getAll();
        const initialProducts = allProductsData.slice(0, 12);
        setProducts(initialProducts);
      } catch (err) {
        setError("Failed to load products.");
      } finally {
        setIsLoading(false);
      }
      return;
    }

    setIsLoading(true);
    try {
      const { data: categoryProducts } = await api.productAPI.getByCategory(
        category
      );
      const initialProducts = categoryProducts.slice(0, 12);
      setProducts(initialProducts);
    } catch (err) {
      setError(`Failed to load ${category} products.`);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreProducts = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      const nextCount = visibleCount + 6;
      const nextProducts = allProducts.slice(0, nextCount);
      setProducts(nextProducts);
      setVisibleCount(nextCount);
      setIsLoadingMore(false);
    }, 800);
  };

  const toggleWishlist = useCallback((productId) => {
    setWishlist((prev) => {
      const newSet = new Set(prev);
      newSet.has(productId) ? newSet.delete(productId) : newSet.add(productId);
      return newSet;
    });
  }, []);

  const refreshStats = async () => {
    setIsRefreshingStats(true);
    try {
      await refreshAllData();
      await loadSystemStats(true);
    } catch (error) {
      console.error("Refresh failed:", error);
    } finally {
      setIsRefreshingStats(false);
    }
  };

  const hasMoreProducts = visibleCount < allProducts.length;

  // Format timer for display
  const formatTimer = () => {
    return `${timer.hours.toString().padStart(2, "0")}:${timer.minutes
      .toString()
      .padStart(2, "0")}:${timer.seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 font-sans">
      <main className="container mx-auto px-4 py-8">
        {/* Hero Carousel */}
        <div className="relative mb-12 rounded-3xl overflow-hidden shadow-2xl">
          <div className="relative h-[300px] md:h-[400px] lg:h-[500px]">
            {heroSlides.map((slide, index) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-all duration-700 ${
                  index === currentSlide
                    ? "opacity-100 scale-100"
                    : "opacity-0 scale-105"
                }`}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${slide.color} bg-cover bg-center`}
                  style={{ backgroundImage: `url(${slide.image})` }}
                >
                  <div className="absolute inset-0 bg-black/40"></div>
                </div>
                <div className="relative h-full flex items-center">
                  <div className="container mx-auto px-4 md:px-8 lg:px-16">
                    <div className="max-w-lg">
                      <span className="inline-block bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-4 animate-pulse">
                        {slide.discount}
                      </span>
                      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                        {slide.title}
                      </h2>
                      <p className="text-lg md:text-xl text-white/90 mb-8">
                        {slide.description}
                      </p>
                      <button
                        onClick={() => navigate("/products")}
                        className={`${slide.buttonColor} text-white px-8 py-3 rounded-full font-semibold hover:shadow-2xl transition-all hover:scale-105 flex items-center gap-2`}
                      >
                        Shop Now <ArrowRight className="ml-2" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() =>
              setCurrentSlide(
                (prev) => (prev - 1 + heroSlides.length) % heroSlides.length
              )
            }
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 rounded-full transition hover:scale-110"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={() =>
              setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
            }
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 rounded-full transition hover:scale-110"
          >
            <ChevronRight size={24} />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentSlide
                    ? "bg-white w-6"
                    : "bg-white/50 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Products Section */}
        <div className="mb-12">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
            <div className="mb-6 lg:mb-0">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-gradient-to-r from-[#01A49E] to-[#01857F] p-2 rounded-lg">
                  <Sparkles className="text-white" size={24} />
                </div>
                <div>
                  <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
                    Featured Products
                  </h2>
                  <p className="text-gray-600">
                    From our vast collection of {systemStats.totalProducts}{" "}
                    items
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
                <button
                  onClick={() => handleCategoryClick("All")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap ${
                    activeCategory === "All"
                      ? "bg-gradient-to-r from-[#01A49E] to-[#01857F] text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All Products
                </button>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryClick(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap ${
                      activeCategory === category
                        ? "bg-gradient-to-r from-[#01A49E] to-[#01857F] text-white shadow-lg"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-96">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-[#01A49E] mx-auto mb-4" />
                <p className="text-gray-600">Loading amazing products...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="bg-gradient-to-r from-red-50 to-pink-50 text-red-800 p-8 rounded-2xl max-w-md border border-red-200">
                  <p className="font-semibold mb-2">
                    Oops! Something went wrong
                  </p>
                  <p className="mb-6">{error}</p>
                  <button
                    onClick={loadInitialData}
                    className="bg-gradient-to-r from-[#01A49E] to-[#01857F] text-white px-6 py-3 rounded-lg hover:shadow-lg transition"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-8 rounded-2xl">
                  <p className="text-gray-500 text-lg mb-4">
                    No products found
                  </p>
                  <button
                    onClick={loadInitialData}
                    className="text-[#01A49E] hover:text-[#01857F] transition font-medium"
                  >
                    Refresh Products
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onWishlistToggle={toggleWishlist}
                    isInWishlist={wishlist.has(product.id)}
                  />
                ))}
              </div>

              <div className="text-center">
                <div className="text-gray-600 mb-6 flex items-center justify-center gap-2">
                  <div className="h-1 w-12 bg-gradient-to-r from-[#01A49E] to-[#01857F] rounded-full"></div>
                  <span>
                    Showing {Math.min(visibleCount, allProducts.length)} of{" "}
                    {allProducts.length} products
                  </span>
                  <div className="h-1 w-12 bg-gradient-to-r from-[#01A49E] to-[#01857F] rounded-full"></div>
                </div>

                {hasMoreProducts ? (
                  <button
                    onClick={loadMoreProducts}
                    disabled={isLoadingMore}
                    className="group bg-gradient-to-r from-[#01A49E] to-[#01857F] text-white px-8 py-4 rounded-full font-semibold hover:shadow-2xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto shadow-lg"
                  >
                    {isLoadingMore ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        Load More Products
                        <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                ) : (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 max-w-md mx-auto">
                    <div className="flex items-center justify-center gap-3 mb-3">
                      <Check className="h-6 w-6 text-green-600" />
                      <p className="text-green-800 font-medium">
                        You've seen all {allProducts.length} products!
                      </p>
                    </div>
                    <p className="text-green-600 text-sm">
                      Check back later for new arrivals.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Live System Stats Section - MOVED TO BOTTOM */}
        <div className="mt-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8 gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={refreshStats}
                disabled={isRefreshingStats}
                className="bg-gray-400 hover:bg-gray-300 p-2 rounded-lg transition disabled:opacity-50 flex items-center gap-2"
                title="Refresh stats"
              >
                <RefreshCw
                  size={20}
                  className={isRefreshingStats ? "animate-spin" : ""}
                />
                <span className="hidden sm:inline">
                  {isRefreshingStats ? "Refreshing..." : "Refresh"}
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-[#01A49E] p-4 rounded-xl backdrop-blur-sm  transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Package className="text-white" size={22} />
                </div>
                <div>
                  <div className="text-2xl text-white font-bold">
                    {systemStats.totalProducts}
                  </div>
                  <div className="text-sm text-white opacity-90">
                    Total Products
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#01A49E] p-4 rounded-xl backdrop-blur-sm  transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-white/20 p-2 rounded-lg">
                  <ShoppingCart className="text-white" size={22} />
                </div>
                <div>
                  <div className="text-2xl text-white font-bold">
                    {systemStats.totalCarts}
                  </div>
                  <div className="text-sm text-white opacity-90">
                    Active Carts
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
export default EcommerceHomepage;
