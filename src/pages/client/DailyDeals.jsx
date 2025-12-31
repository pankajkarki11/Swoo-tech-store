// pages/DealsPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import Button from "../../components_temp/ui/Button";
import {
  Clock,
  Tag,
  Flame,
  TrendingDown,
  Zap,
  AlertCircle,
  ShoppingBag,
  Star,
} from "lucide-react";
import toast from "react-hot-toast";

const DealsPage = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState({ hours: 12, minutes: 30, seconds: 45 });
  const { addToCart } = useCart();

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockDeals = [
        {
          id: 1,
          title: "Wireless Bluetooth Headphones",
          originalPrice: 199.99,
          discountedPrice: 99.99,
          discount: 50,
          image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
          category: "Electronics",
          stock: 15,
          sold: 85,
          endTime: "2024-12-31T23:59:59",
          rating: 4.5,
          reviews: 1245,
          tag: "FLASH DEAL",
        },
        {
          id: 2,
          title: "Smart Watch Series 5",
          originalPrice: 299.99,
          discountedPrice: 199.99,
          discount: 33,
          image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w-400",
          category: "Wearables",
          stock: 8,
          sold: 92,
          endTime: "2024-12-25T23:59:59",
          rating: 4.7,
          reviews: 892,
          tag: "LIMITED STOCK",
        },
        {
          id: 3,
          title: "Gaming Laptop RTX 4060",
          originalPrice: 1499.99,
          discountedPrice: 1199.99,
          discount: 20,
          image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400",
          category: "Computers",
          stock: 5,
          sold: 45,
          endTime: "2024-12-20T23:59:59",
          rating: 4.8,
          reviews: 567,
          tag: "HOT DEAL",
        },
        {
          id: 4,
          title: "Professional Camera Kit",
          originalPrice: 899.99,
          discountedPrice: 649.99,
          discount: 28,
          image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400",
          category: "Photography",
          stock: 12,
          sold: 38,
          endTime: "2024-12-28T23:59:59",
          rating: 4.6,
          reviews: 321,
          tag: "WEEKEND DEAL",
        },
        {
          id: 5,
          title: "Home Theater System",
          originalPrice: 499.99,
          discountedPrice: 349.99,
          discount: 30,
          image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400",
          category: "Audio",
          stock: 20,
          sold: 60,
          endTime: "2024-12-22T23:59:59",
          rating: 4.4,
          reviews: 456,
          tag: "SPECIAL OFFER",
        },
        {
          id: 6,
          title: "Fitness Tracker Band",
          originalPrice: 79.99,
          discountedPrice: 49.99,
          discount: 38,
          image: "https://images.unsplash.com/photo-1576243345690-4e4b79b63288?w=400",
          category: "Fitness",
          stock: 25,
          sold: 175,
          endTime: "2024-12-15T23:59:59",
          rating: 4.3,
          reviews: 789,
          tag: "BEST SELLER",
        },
      ];
      setDeals(mockDeals);
      setLoading(false);
    }, 1000);
  }, []);

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        let { hours, minutes, seconds } = prev;
        if (seconds > 0) seconds--;
        else {
          seconds = 59;
          if (minutes > 0) minutes--;
          else {
            minutes = 59;
            if (hours > 0) hours--;
            else {
              hours = 23;
            }
          }
        }
        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleAddToCart = useCallback(async (deal) => {
    try {
      await addToCart({
        id: deal.id,
        title: deal.title,
        price: deal.discountedPrice,
        image: deal.image,
        category: deal.category,
      });
      toast.success(`${deal.title} added to cart!`);
    } catch (error) {
      toast.error("Failed to add item to cart");
    }
  }, [addToCart]);

  const getTagColor = (tag) => {
    switch (tag) {
      case "FLASH DEAL":
        return "bg-red-500 text-white";
      case "LIMITED STOCK":
        return "bg-orange-500 text-white";
      case "HOT DEAL":
        return "bg-pink-500 text-white";
      case "WEEKEND DEAL":
        return "bg-purple-500 text-white";
      case "SPECIAL OFFER":
        return "bg-blue-500 text-white";
      default:
        return "bg-green-500 text-white";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded-xl w-1/4"></div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-4">
                  <div className="h-48 bg-gray-300 dark:bg-gray-700 rounded-xl mb-4"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gradient-to-r from-red-500 to-orange-500 p-3 rounded-xl">
              <Flame className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Daily Deals
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Limited-time offers with amazing discounts
              </p>
            </div>
          </div>

          {/* Timer Banner */}
          <div className="bg-gradient-to-r from-red-600 to-orange-500 rounded-2xl p-6 text-white mb-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">Flash Sale Ending Soon!</h2>
                <p className="text-red-100">Don't miss out on these exclusive deals</p>
              </div>
              <div className="flex items-center gap-2 mt-4 md:mt-0">
                <Clock className="animate-pulse" />
                <span className="text-lg font-bold">Ends in:</span>
                <div className="flex gap-2">
                  <div className="bg-black/30 px-3 py-1 rounded-lg">
                    <span className="text-2xl font-bold">{String(timeRemaining.hours).padStart(2, '0')}</span>
                    <span className="text-xs opacity-80">HRS</span>
                  </div>
                  <div className="bg-black/30 px-3 py-1 rounded-lg">
                    <span className="text-2xl font-bold">{String(timeRemaining.minutes).padStart(2, '0')}</span>
                    <span className="text-xs opacity-80">MIN</span>
                  </div>
                  <div className="bg-black/30 px-3 py-1 rounded-lg">
                    <span className="text-2xl font-bold">{String(timeRemaining.seconds).padStart(2, '0')}</span>
                    <span className="text-xs opacity-80">SEC</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Deals Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deals.map((deal) => (
            <div
              key={deal.id}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Badge */}
              <div className="absolute top-4 left-4 z-10">
                <span className={`px-3 py-1 text-xs font-bold rounded-full ${getTagColor(deal.tag)}`}>
                  {deal.tag}
                </span>
              </div>

              {/* Discount Badge */}
              <div className="absolute top-4 right-4 z-10 bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                -{deal.discount}%
              </div>

              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={deal.image}
                  alt={deal.title}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded">
                    {deal.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {deal.rating} ({deal.reviews})
                    </span>
                  </div>
                </div>

                <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                  {deal.title}
                </h3>

                {/* Price */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${deal.discountedPrice.toFixed(2)}
                  </span>
                  <span className="text-lg text-gray-500 dark:text-gray-400 line-through">
                    ${deal.originalPrice.toFixed(2)}
                  </span>
                  <span className="text-sm font-bold text-green-600 dark:text-green-400">
                    Save ${(deal.originalPrice - deal.discountedPrice).toFixed(2)}
                  </span>
                </div>

                {/* Stock Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Sold: {deal.sold}</span>
                    <span className="text-gray-600 dark:text-gray-400">Available: {deal.stock}</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-600"
                      style={{ width: `${(deal.sold / (deal.sold + deal.stock)) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    variant="teal"
                    fullWidth
                    icon={<ShoppingBag />}
                    onClick={() => handleAddToCart(deal)}
                  >
                    Add to Cart
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-shrink-0"
                    icon={<Zap />}
                  >
                    Buy Now
                  </Button>
                </div>

                {/* Timer */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                      <Clock size={14} />
                      <span>Deal ends:</span>
                    </div>
                    <span className="font-medium text-red-600 dark:text-red-400">
                      {new Date(deal.endTime).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Banner */}
        <div className="mt-12 bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 text-center">
          <Tag className="h-12 w-12 text-white mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Want More Deals?
          </h2>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Subscribe to our newsletter and be the first to know about exclusive offers, 
            flash sales, and special promotions.
          </p>
          <div className="max-w-md mx-auto flex gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-[#01A49E]"
            />
            <Button variant="teal">
              Subscribe
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealsPage;