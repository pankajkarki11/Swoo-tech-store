import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Check,
  Loader2,
  Sparkles,
  Package,
} from "lucide-react";
import useApi from "../../services/AdminuseApi";
import ProductCard from "../../components_temp/ProductCard";
import Button from "../../components_temp/ui/Button";

const EcommerceHomepage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeCategory, setActiveCategory] = useState("All");
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [visibleCount, setVisibleCount] = useState(12);

  const api = useApi();
  const navigate = useNavigate();

  // Use ref to track if data has been loaded
  const hasLoadedDataRef = useRef(false);
  const autoSlideTimerRef = useRef(null);

  const heroSlides = useMemo(
    () => [
      {
        id: 1,
        title: "New Collection 2026",
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
        image:
          "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600",
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
      {
        id: 4,
        title: "Premium Electronics",
        description: "High-end gadgets and devices",
        image:
          "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1600",
        color: "from-emerald-900 to-emerald-700",
        discount: "Limited Time Offer",
        buttonColor: "bg-emerald-600 hover:bg-emerald-700",
      },
    ],
    []
  );

  // Start auto slide
  const startAutoSlide = useCallback(() => {
    if (autoSlideTimerRef.current) {
      clearInterval(autoSlideTimerRef.current);
    }

    autoSlideTimerRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
  }, [heroSlides.length]);

  // Handle slide change with resetting auto slide timer
  const handleSlideChange = useCallback(
    (index) => {
      setCurrentSlide(index);
      // Reset auto slide timer
      if (autoSlideTimerRef.current) {
        clearInterval(autoSlideTimerRef.current);
      }
      startAutoSlide();
    },
    [startAutoSlide]
  );

  // Handle next slide
  const handleNextSlide = useCallback(() => {
    const nextSlide = (currentSlide + 1) % heroSlides.length;
    handleSlideChange(nextSlide);
  }, [currentSlide, handleSlideChange, heroSlides.length]);

  // Handle previous slide
  const handlePrevSlide = useCallback(() => {
    const prevSlide =
      (currentSlide - 1 + heroSlides.length) % heroSlides.length;
    handleSlideChange(prevSlide);
  }, [currentSlide, handleSlideChange, heroSlides.length]);

  // Effect for auto-slide
  useEffect(() => {
    startAutoSlide();

    return () => {
      if (autoSlideTimerRef.current) {
        clearInterval(autoSlideTimerRef.current);
      }
    };
  }, [startAutoSlide]);

  useEffect(() => {
    const loadInitialData = async () => {
      // Prevent multiple calls
      if (hasLoadedDataRef.current) {
        return;
      }

      hasLoadedDataRef.current = true;
      setIsLoading(true);
      setError(null);

      try {
        const [productsResponse, categoriesResponse,] = await Promise.all([
          api.productAPI.getAll(),
          api.productAPI.getCategories(),
          
        ]);

        const allProductsData = productsResponse.data;
        const categoriesData = categoriesResponse.data;

        setAllProducts(allProductsData);
        setProducts(allProductsData.slice(0, 12));
        setCategories(categoriesData);
      } catch (err) {
        setError("Failed to load data. Please try again.");
         console.error("Load data error:", err);
       
        // Reset flag on error to allow retry
        hasLoadedDataRef.current = false;
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [api.productAPI]);

  // Handle category click - uses cached data
  const handleCategoryClick = useCallback(
    (category) => {
      setActiveCategory(category);
      setVisibleCount(12); // Reset visible count

      if (category === "All") {
        setProducts(allProducts.slice(0, 12));
      } else {
        const filteredProducts = allProducts.filter(
          (product) =>
            product.category?.toLowerCase() === category.toLowerCase()
        );
        setProducts(filteredProducts.slice(0, 12));
      }
    },
    [allProducts]
  );

  // Load more products - uses cached data
  const loadMoreProducts = useCallback(() => {
    setIsLoadingMore(true);

    setTimeout(() => {
      const nextCount = visibleCount + 6;
      let productsToShow = [];

      if (activeCategory === "All") {
        productsToShow = allProducts.slice(0, nextCount);
      } else {
        const filteredProducts = allProducts.filter(
          (product) =>
            product.category?.toLowerCase() === activeCategory.toLowerCase()
        );
        productsToShow = filteredProducts.slice(0, nextCount);
      }

      setProducts(productsToShow);
      setVisibleCount(nextCount);
      setIsLoadingMore(false);
    }, 800);
  }, [visibleCount, allProducts, activeCategory]);

  // Calculate hasMoreProducts based on filtered data
  const hasMoreProducts = useMemo(() => {
    if (activeCategory === "All") {
      return visibleCount < allProducts.length;
    }

    const filteredProducts = allProducts.filter(
      (product) =>
        product.category?.toLowerCase() === activeCategory.toLowerCase()
    );
    return visibleCount < filteredProducts.length;
  }, [visibleCount, allProducts, activeCategory]);

  // Calculate total products in current category
  const currentCategoryProductCount = useMemo(() => {
    if (activeCategory === "All") {
      return allProducts.length;
    }

    return allProducts.filter(
      (product) =>
        product.category?.toLowerCase() === activeCategory.toLowerCase()
    ).length;
  }, [allProducts, activeCategory]);

  // Handle retry loading
  const handleRetry = useCallback(() => {
    hasLoadedDataRef.current = false;
    window.location.reload(); // Simple reload for retry
  }, []);

  // Render loading state
  const renderLoadingState = () => (
    <div className="flex justify-center items-center h-96">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-[#01A49E] mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-300">
          Loading amazing products...
        </p>
      </div>
    </div>
  );

  // Render error state
  const renderErrorState = () => (
    <div className="flex justify-center items-center h-64">
      <div className="text-center">
        <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/10 dark:to-pink-900/10 text-red-800 dark:text-red-300 p-8 rounded-2xl max-w-md border border-red-200 dark:border-red-800">
          <p className="font-semibold mb-2">Oops! Something went wrong</p>
          <p className="mb-6">{error}</p>
          <Button
            variant="primary"
            onClick={handleRetry}
            className="px-6 py-3 rounded-lg hover:shadow-lg transition"
          >
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );

  // Render empty state
  const renderEmptyState = () => (
    <div className="flex justify-center items-center h-64">
      <div className="text-center">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-8 rounded-2xl">
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">
            No products found in this category
          </p>
          <Button
            variant="ghost"
            onClick={handleRetry}
            className="text-[#01A49E] hover:text-[#01857F] dark:text-[#01A49E] dark:hover:text-[#00c9b7] transition font-medium"
          >
            Refresh Products
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white font-sans dark:bg-gray-900">
      <main className="container mx-auto px-4 py-8">
        {/* Hero Carousel */}
        <div className="relative mb-12 rounded-3xl overflow-hidden shadow-2xl">
          <div className="relative h-[300px] md:h-[400px] lg:h-[500px] bg-gray-300 dark:bg-gray-700">
            {heroSlides.map((slide, index) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                  index === currentSlide
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 translate-x-full"
                }`}
                style={{
                  transform: `translateX(${
                    index === currentSlide
                      ? "0%"
                      : index < currentSlide
                      ? "-100%"
                      : "100%"
                  })`,
                  transition: "all 700ms ease-in-out",
                }}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${slide.color} bg-cover bg-center`}
                  style={{ backgroundImage: `url(${slide.image})` }}
                >
                  <div className="absolute inset-0 bg-black/20 dark:bg-black/30"></div>
                  <div className="absolute inset-0 bg-black/40"></div>
                </div>
                <div className="relative h-full flex items-center">
                  <div className="container mx-auto px-4 md:px-8 lg:px-16">
                    <div className="max-w-lg">
                      <span className="inline-block bg-green-500 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-4 animate-bounce">
                        {slide.discount}
                      </span>
                      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                        {slide.title}
                      </h2>
                      <p className="text-lg md:text-xl text-white/90 mb-8">
                        {slide.description}
                      </p>
                      <Button
                        onClick={() => navigate("/product")}
                        className={`${slide.buttonColor} hover:shadow-2xl transition-all hover:scale-105 flex items-center gap-2`}
                      >
                        Shop Now <ArrowRight className="ml-2" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handlePrevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all hover:scale-110 z-10"
            aria-label="Previous slide"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={handleNextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all hover:scale-110 z-10"
            aria-label="Next slide"
          >
            <ChevronRight size={24} />
          </button>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-3 z-10">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => handleSlideChange(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? "bg-white w-8"
                    : "bg-white/50 hover:bg-white/70"
                }`}
                aria-label={`Go to slide ${index + 1}`}
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
                  <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                    Featured Products
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    From our vast collection of {currentCategoryProductCount}{" "}
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
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
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
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                    }`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {isLoading ? (
            renderLoadingState()
          ) : error ? (
            renderErrorState()
          ) : products.length === 0 ? (
            renderEmptyState()
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              <div className="text-center">
                <div className="text-gray-600 dark:text-gray-300 mb-6 flex items-center justify-center gap-2">
                  <div className="h-1 w-12 bg-gradient-to-r from-[#01A49E] to-[#01857F] rounded-full"></div>
                  <span>
                    Showing {products.length} of {currentCategoryProductCount}{" "}
                    products
                  </span>
                  <div className="h-1 w-12 bg-gradient-to-r from-[#01A49E] to-[#01857F] rounded-full"></div>
                </div>

                {hasMoreProducts ? (
                  <Button
                    variant="teal"
                    size="xlarge"
                    onClick={loadMoreProducts}
                    disabled={isLoadingMore}
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
                  </Button>
                ) : (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 border border-green-200 dark:border-green-800 rounded-2xl p-6 max-w-md mx-auto">
                    <div className="flex items-center justify-center gap-3 mb-3">
                      <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
                      <p className="text-green-800 dark:text-green-300 font-medium">
                        You've seen all {currentCategoryProductCount} products!
                      </p>
                    </div>
                    <p className="text-green-600 dark:text-green-400 text-sm">
                      Check back later for new arrivals.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 p-6 rounded-2xl border border-blue-100 dark:border-blue-800">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-xl">
                <Package
                  className="text-blue-600 dark:text-blue-400"
                  size={24}
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Free Shipping
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              Free delivery on orders above $100. No hidden charges.
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 p-6 rounded-2xl border border-green-100 dark:border-green-800">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-xl">
                <Check
                  className="text-green-600 dark:text-green-400"
                  size={24}
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Quality Guarantee
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              30-day return policy. Your satisfaction is our priority.
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/10 dark:to-violet-900/10 p-6 rounded-2xl border border-purple-100 dark:border-purple-800">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-xl">
                <Sparkles
                  className="text-purple-600 dark:text-purple-400"
                  size={24}
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Secure Payment
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              Your payments are secure with our encrypted payment system.
            </p>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="bg-gradient-to-r from-[#01A49E]/10 to-[#01857F]/10 dark:from-[#01A49E]/20 dark:to-[#01857F]/20 rounded-2xl p-8 text-center mb-12">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Stay Updated
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
            Subscribe to our newsletter for exclusive deals and new arrivals.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-grow px-6 py-3 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#01A49E]"
            />
            <Link to="/subscribe">
              <Button variant="teal" size="xlarge">
                Subscribe
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EcommerceHomepage;