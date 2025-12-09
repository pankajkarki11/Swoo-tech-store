import React, { useState, useEffect } from "react";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Check,
  Loader2,
} from "lucide-react";
import {
  fetchProductCategories,
  fetchProductsByCategory,
  fetchAllProducts,
} from "../services/api";
import ProductCard from "../components/ProductCard";
import { addToCart as addToCartUtil } from "../utils/cartUtils";

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
  const heroSlides = [
    {
      id: 1,
      title: "New MacBook Pro 2024",
      description: "Supercharged by M3 Pro chip. Experience the power.",
      image:
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1600",
      color: "from-blue-900 to-blue-700",
      discount: "Up to 15% OFF",
    },
    {
      id: 2,
      title: "Gaming Festival",
      description: "Premium gaming gear at unbelievable prices",
      image:
        "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=1600",
      color: "from-purple-900 to-purple-700",
      discount: "Up to 40% OFF",
    },
    {
      id: 3,
      title: "Wireless Freedom",
      description: "Latest wireless earbuds & headphones",
      image:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1600",
      color: "from-green-900 to-green-700",
      discount: "Free Shipping",
    },
    {
      id: 4,
      title: "Iphone 17 Pro Max",
      description: "Iphone 17 Pro Max available now. Experience the future.",
      image: "images/iphone.jpg",
      color: "from-green-900 to-green-700",
      discount: "Exclusive Launch Offer",
    },
  ];

  useEffect(() => {
    loadProductsAndCategories();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const loadProductsAndCategories = async () => {
    setIsLoading(true);
    setError(null);
    setVisibleCount(12);

    try {
      const [productsData, categoriesData] = await Promise.all([
        fetchAllProducts(),
        fetchProductCategories(),
      ]);

      setAllProducts(productsData);
      setProducts(productsData.slice(0, 12));
      setCategories(categoriesData);
    } catch (err) {
      setError("Failed to load products. Please try again later.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryClick = async (category) => {
    setActiveCategory(category);
    setVisibleCount(12);
    setProducts([]);

    if (category === "All") {
      setIsLoading(true);
      try {
        const allProductsData = await fetchAllProducts();
        setAllProducts(allProductsData);
        const initialProducts = allProductsData.slice(0, 12);
        setProducts(initialProducts);
      } catch (err) {
        setError(`Failed to load products.`);
        console.error(err);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    setIsLoading(true);
    try {
      const categoryProducts = await fetchProductsByCategory(category);
      setAllProducts(categoryProducts);
      const initialProducts = categoryProducts.slice(0, 12);
      setProducts(initialProducts);
    } catch (err) {
      setError(`Failed to load ${category} products.`);
      console.error(err);
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

      if (nextCount > visibleCount) {
        window.scrollTo({
          top: document.documentElement.scrollHeight - 500,
          behavior: "smooth",
        });
      }
    }, 800);
  };

  const toggleWishlist = (productId) => {
    setWishlist((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const addToCart = (product) => {
    const updatedCart = addToCartUtil(product);

    console.log(`✅ Added ${product.title} to cart`);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + heroSlides.length) % heroSlides.length
    );
  };

  const hasMoreProducts = visibleCount < allProducts.length;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <main className="container mx-auto px-4 py-8">
        {/* Hero Carousel */}
        <div className="relative mb-12 rounded-2xl overflow-hidden">
          <div className="relative h-[400px] lg:h-[500px]">
            {heroSlides.map((slide, index) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  index === currentSlide ? "opacity-100" : "opacity-0"
                }`}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${slide.color} bg-cover bg-center`}
                  style={{ backgroundImage: `url(${slide.image})` }}
                >
                  <div className="absolute inset-0 bg-black/40"></div>
                </div>
                <div className="relative h-full flex items-center">
                  <div className="container mx-auto px-8 lg:px-16">
                    <div className="max-w-lg">
                      <span className="inline-block bg-white/20 backdrop-blur-sm text-white px-4 py-1 rounded-full text-sm font-medium mb-4">
                        {slide.discount}
                      </span>
                      <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                        {slide.title}
                      </h2>
                      <p className="text-xl text-white/90 mb-8">
                        {slide.description}
                      </p>
                      <button className="bg-white text-gray-900 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition flex items-center">
                        Shop Now <ArrowRight className="ml-2" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 rounded-full transition"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 rounded-full transition"
          >
            <ChevronRight size={24} />
          </button>

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
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

        {/* Featured Products Section */}
        <div className="mb-12">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
            <div className="mb-4 lg:mb-0">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
                Featured Products
              </h2>
              <p className="text-gray-600">Handpicked just for you</p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex gap-2 overflow-x-auto pb-2">
                <button
                  onClick={() => handleCategoryClick("All")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap ${
                    activeCategory === "All"
                      ? "bg-[#01A49E] text-white"
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
                        ? "bg-[#01A49E] text-white"
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
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-[#01A49E] mx-auto mb-4" />
                <p className="text-gray-600">Loading products...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="bg-red-50 text-red-800 p-6 rounded-xl max-w-md">
                  <p className="font-semibold mb-2">
                    Oops! Something went wrong
                  </p>
                  <p className="mb-4">{error}</p>
                  <button
                    onClick={loadProductsAndCategories}
                    className="bg-[#01A49E] text-white px-4 py-2 rounded-lg hover:bg-[#01857F] transition"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <p className="text-gray-500 text-lg">No products found</p>
                <button
                  onClick={loadProductsAndCategories}
                  className="mt-4 text-[#01A49E] hover:text-[#01857F] transition"
                >
                  Refresh
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onWishlistToggle={toggleWishlist}
                    onAddToCart={addToCart}
                    isInWishlist={wishlist.has(product.id)}
                  />
                ))}
              </div>

              <div className="text-center">
                <div className="text-gray-600 mb-4">
                  Showing {Math.min(visibleCount, allProducts.length)} of{" "}
                  {allProducts.length} products
                </div>

                {hasMoreProducts ? (
                  <button
                    onClick={loadMoreProducts}
                    disabled={isLoadingMore}
                    className="bg-gradient-to-r from-[#01A49E] to-[#01857F] text-white px-8 py-3 rounded-full font-semibold hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
                  >
                    {isLoadingMore ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>Load More</>
                    )}
                  </button>
                ) : (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 max-w-md mx-auto">
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
      </main>
    </div>
  );
};

export default EcommerceHomepage;
