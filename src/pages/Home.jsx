import React, { useState, useEffect } from "react";
import {
  Search,
  ChevronDown,
  ShoppingCart,
  User,
  Menu,
  X,
  House,
  ChartBarStacked,
  Truck,
  HandFist,
  Undo2,
  Star,
  Clock,
  TrendingUp,
  Shield,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Heart,
  Filter,
  Check,
  Sparkles,
  Zap,
  Award,
  ThumbsUp,
  Gift,
  Tag,
  DollarSign,
  Truck as TruckIcon,
  Headphones,
  RefreshCw,
  Smartphone,
  Monitor,
  Camera,
  Gamepad2,
  Watch,
  Speaker,
  Home as HomeIcon,
} from "lucide-react";

const EcommerceHomepage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [wishlist, setWishlist] = useState(new Set());
  const [activeCategory, setActiveCategory] = useState("All");
  // Hero carousel slides
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
  ];

  // Featured products
  const products = [
    {
      id: 1,
      name: "iPhone 15 Pro Max",
      category: "Smartphone",
      price: 1299,
      originalPrice: 1499,
      rating: 4.8,
      reviewCount: 124,
      image:
        "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800",
      tags: ["Trending", "5G"],
      color: "bg-gradient-to-br from-gray-900 to-gray-700",
    },
    {
      id: 2,
      name: "Sony WH-1000XM5",
      category: "Headphones",
      price: 349,
      originalPrice: 399,
      rating: 4.9,
      reviewCount: 89,
      image:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w-800",
      tags: ["Noise Cancelling", "Wireless"],
      color: "bg-gradient-to-br from-blue-900 to-blue-700",
    },
    {
      id: 3,
      name: "MacBook Air M2",
      category: "Laptop",
      price: 1199,
      originalPrice: 1299,
      rating: 4.7,
      reviewCount: 203,
      image: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800",
      tags: ["M2 Chip", "Lightweight"],
      color: "bg-gradient-to-br from-gray-800 to-gray-600",
    },
    {
      id: 4,
      name: "Samsung Galaxy S24",
      category: "Smartphone",
      price: 999,
      originalPrice: 1099,
      rating: 4.6,
      reviewCount: 156,
      image:
        "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800",
      tags: ["AI Features", "8K Video"],
      color: "bg-gradient-to-br from-violet-900 to-violet-700",
    },
    {
      id: 5,
      name: "PlayStation 5",
      category: "Gaming",
      price: 499,
      originalPrice: 549,
      rating: 4.9,
      reviewCount: 312,
      image:
        "https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=800",
      tags: ["4K Gaming", "VR Ready"],
      color: "bg-gradient-to-br from-blue-800 to-blue-600",
    },
    {
      id: 6,
      name: "Apple Watch Series 9",
      category: "Wearable",
      price: 399,
      originalPrice: 429,
      rating: 4.5,
      reviewCount: 98,
      image:
        "https://images.unsplash.com/photo-1579586337278-3fdc101c61e0?w=800",
      tags: ["Health", "Always-On"],
      color: "bg-gradient-to-br from-red-900 to-red-700",
    },
  ];

  // Deals of the day
  const deals = [
    {
      id: 1,
      name: "Sony Alpha 7IV",
      category: "Camera",
      price: 2499,
      originalPrice: 2999,
      discount: "17%",
      timeLeft: "12:34:56",
      image:
        "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800",
    },
    {
      id: 2,
      name: "Logitech MX Keys",
      category: "Accessories",
      price: 99,
      originalPrice: 129,
      discount: "23%",
      timeLeft: "08:15:30",
      image:
        "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=800",
    },
    {
      id: 3,
      name: "Dyson V15 Detect",
      category: "Home",
      price: 699,
      originalPrice: 849,
      discount: "18%",
      timeLeft: "05:42:18",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
    },
  ];

  // Quick categories
  const quickCategories = [
    {
      name: "Smartphones",
      icon: Smartphone,
      color: "bg-blue-500",
      items: "1.2K",
    },
    { name: "Laptops", icon: Monitor, color: "bg-purple-500", items: "850" },
    { name: "Cameras", icon: Camera, color: "bg-yellow-500", items: "430" },
    { name: "Gaming", icon: Gamepad2, color: "bg-red-500", items: "620" },
    { name: "Wearables", icon: Watch, color: "bg-green-500", items: "310" },
    { name: "Audio", icon: Speaker, color: "bg-pink-500", items: "540" },
    {
      name: "Smart Home",
      icon: HomeIcon,
      color: "bg-indigo-500",
      items: "290",
    },
    { name: "Accessories", icon: Zap, color: "bg-orange-500", items: "1.5K" },
  ];

  // Featured brands
  const brands = [
    { name: "Apple", logo: "🍎" },
    { name: "Samsung", logo: "📱" },
    { name: "Sony", logo: "🎮" },
    { name: "LG", logo: "📺" },
    { name: "Dell", logo: "💻" },
    { name: "HP", logo: "🖥️" },
    { name: "Bose", logo: "🎧" },
    { name: "Nikon", logo: "📷" },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

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

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + heroSlides.length) % heroSlides.length
    );
  };

  const getDiscountPercentage = (price, originalPrice) => {
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Main Content */}
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

          {/* Carousel Controls */}
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

          {/* Indicators */}
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

        {/* Quick Categories */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
              Shop by Category
            </h2>
            <a
              href="#"
              className="text-[#01A49E] font-semibold hover:text-[#01857F] transition flex items-center"
            >
              View All <ArrowRight className="ml-1" size={16} />
            </a>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {quickCategories.map((category, index) => {
              const Icon = category.icon;
              return (
                <a
                  key={index}
                  href="#"
                  className="bg-white rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-all hover:-translate-y-1 group"
                >
                  <div
                    className={`${category.color} w-12 h-12 rounded-lg flex items-center justify-center text-white mx-auto mb-3 group-hover:scale-110 transition-transform`}
                  >
                    <Icon size={24} />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {category.items} Items
                  </p>
                </a>
              );
            })}
          </div>
        </div>

        {/* Deals of the Day */}
        <div className="mb-12 bg-gradient-to-r from-[#01A49E] to-[#00857F] rounded-2xl p-6 lg:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Tag className="text-white" />
                <h2 className="text-2xl lg:text-3xl font-bold text-white">
                  Deals of the Day
                </h2>
              </div>
              <p className="text-white/90">Limited time offers. Hurry up!</p>
            </div>
            <div className="hidden lg:flex items-center gap-4 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3">
              <Clock className="text-white" />
              <div className="text-white font-mono text-xl">23:59:59</div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deals.map((deal) => (
              <div
                key={deal.id}
                className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="inline-block bg-red-100 text-red-600 text-xs font-semibold px-3 py-1 rounded-full">
                        -{deal.discount}
                      </span>
                    </div>
                    <button
                      onClick={() => toggleWishlist(`deal-${deal.id}`)}
                      className="text-gray-400 hover:text-red-500 transition"
                    >
                      <Heart
                        size={20}
                        fill={
                          wishlist.has(`deal-${deal.id}`) ? "#ef4444" : "none"
                        }
                      />
                    </button>
                  </div>
                  <div className="h-48 mb-4 rounded-lg overflow-hidden">
                    <img
                      src={deal.image}
                      alt={deal.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 mb-1">
                    {deal.name}
                  </h3>
                  <p className="text-gray-500 text-sm mb-4">{deal.category}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-gray-900">
                          ${deal.price}
                        </span>
                        <span className="text-gray-400 line-through">
                          ${deal.originalPrice}
                        </span>
                      </div>
                    </div>
                    <button className="bg-[#01A49E] text-white px-4 py-2 rounded-lg hover:bg-[#00857F] transition">
                      Add to Cart
                    </button>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock size={14} />
                      <span>Ends in: {deal.timeLeft}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Products */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
                Featured Products
              </h2>
              <p className="text-gray-600">Handpicked just for you</p>
            </div>
            <div className="flex gap-2">
              {["All", "Smartphones", "Laptops", "Audio", "Gaming"].map(
                (category) => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                      activeCategory === category
                        ? "bg-[#01A49E] text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {category}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition group"
              >
                <div className="relative">
                  <div className={`h-48 ${product.color} relative`}>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4 flex gap-2">
                      {product.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-medium px-3 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition"
                    >
                      <Heart
                        size={20}
                        fill={wishlist.has(product.id) ? "#ef4444" : "none"}
                        className={
                          wishlist.has(product.id)
                            ? "text-red-500"
                            : "text-gray-600"
                        }
                      />
                    </button>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-500 text-sm">
                        {product.category}
                      </span>
                      <div className="flex items-center gap-1">
                        <Star
                          size={16}
                          className="text-yellow-400 fill-current"
                        />
                        <span className="font-semibold">{product.rating}</span>
                        <span className="text-gray-400">
                          ({product.reviewCount})
                        </span>
                      </div>
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 mb-3">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-gray-900">
                          ${product.price}
                        </span>
                        <span className="text-gray-400 line-through">
                          ${product.originalPrice}
                        </span>
                        <span className="text-red-600 font-semibold">
                          -
                          {getDiscountPercentage(
                            product.price,
                            product.originalPrice
                          )}
                          %
                        </span>
                      </div>
                      <button className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-[#01A49E] transition flex items-center gap-2">
                        <ShoppingCart size={16} />
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features Banner */}
        <div className="mb-12">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-8 text-white">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-white/20 p-3 rounded-xl">
                  <TruckIcon size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Free Shipping</h3>
                  <p className="text-blue-100">On orders over $99</p>
                </div>
              </div>
              <p className="text-blue-100">
                Get your products delivered quickly and free of charge across
                Kathmandu.
              </p>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-8 text-white">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-white/20 p-3 rounded-xl">
                  <Headphones size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">24/7 Support</h3>
                  <p className="text-purple-100">We're always here</p>
                </div>
              </div>
              <p className="text-purple-100">
                Our support team is available round the clock to assist you with
                any queries.
              </p>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-8 text-white">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-white/20 p-3 rounded-xl">
                  <RefreshCw size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Easy Returns</h3>
                  <p className="text-green-100">30-day policy</p>
                </div>
              </div>
              <p className="text-green-100">
                Not satisfied? Return within 30 days for a full refund or
                exchange.
              </p>
            </div>
          </div>
        </div>

        {/* Brands Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
                Top Brands
              </h2>
              <p className="text-gray-600">Shop from trusted manufacturers</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {brands.map((brand, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition hover:-translate-y-1"
              >
                <div className="text-4xl mb-3">{brand.logo}</div>
                <h3 className="font-semibold text-gray-900">{brand.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default EcommerceHomepage;
