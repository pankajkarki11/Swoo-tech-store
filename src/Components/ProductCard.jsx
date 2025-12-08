import React, { useState, useEffect } from "react";
import { ShoppingCart, Heart, Star, Eye, Zap } from "lucide-react";
import { isInCart, getCartItemQuantity } from "../utils/cartUtils";
import { useNavigate } from "react-router-dom";
import ProductDetailPage from "../pages/ProductDetailPage";

const ProductCard = ({
  product,
  onWishlistToggle,
  onAddToCart,
  isInWishlist = false,
  isLoading = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [cartStatus, setCartStatus] = useState({
    isInCart: false,
    quantity: 0,
  });

  const navigate = useNavigate();

  // Check cart status on mount and when product changes
  useEffect(() => {
    const inCart = isInCart(product?.id);
    const quantity = getCartItemQuantity(product?.id);
    setCartStatus({
      isInCart: inCart,
      quantity: quantity,
    });
  }, [product?.id]);

  // Listen for cart updates
  useEffect(() => {
    const handleCartUpdate = () => {
      const inCart = isInCart(product?.id);
      const quantity = getCartItemQuantity(product?.id);
      setCartStatus({
        isInCart: inCart,
        quantity: quantity,
      });
    };

    window.addEventListener("cartUpdated", handleCartUpdate);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
    };
  }, [product?.id]);

  const formatPrice = (price) => {
    return `$${price?.toFixed(2) || "0.00"}`;
  };

  const truncateText = (text, maxLength = 60) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "...";
  };

  const getCategoryIcon = (category) => {
    const icons = {
      electronics: "⚡",
      jewelery: "💎",
      "men's clothing": "👕",
      "women's clothing": "👗",
      default: "📦",
    };

    return icons[category?.toLowerCase()] || icons.default;
  };

  const getCategoryColor = (category) => {
    const colors = {
      electronics: "bg-blue-100 text-blue-700",
      jewelery: "bg-purple-100 text-purple-700",
      "men's clothing": "bg-green-100 text-green-700",
      "women's clothing": "bg-pink-100 text-pink-700",
      default: "bg-gray-100 text-gray-700",
    };

    return colors[category?.toLowerCase()] || colors.default;
  };

  const handleAddToCart = async () => {
    if (isAddingToCart) return;

    setIsAddingToCart(true);
    try {
      await onAddToCart(product);
    } finally {
      setTimeout(() => setIsAddingToCart(false), 500);
    }
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
        <div className="h-64 bg-gray-200"></div>
        <div className="p-5">
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
          <div className="mt-4 flex justify-between items-center">
            <div className="h-6 bg-gray-200 rounded w-20"></div>
            <div className="h-10 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
      </div>
    );
  }

  const ratingPercentage = product?.rating?.rate
    ? (product.rating.rate / 5) * 100
    : 0;

  return (
    <div
      onClick={() => navigate(`/products/${product?.id}`)}
      className="group relative bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Cart Status Badge */}
      {cartStatus.isInCart && (
        <div className="absolute top-3 left-3 z-20">
          <span className="bg-[#01A49E] text-white text-xs font-bold px-3 py-1 rounded-full">
            In Cart ({cartStatus.quantity})
          </span>
        </div>
      )}

      {/* Product Image Container */}
      <div className="relative h-64 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        <img
          src={product?.image}
          alt={product?.title || "Product"}
          className={`w-full h-full object-contain p-4 transition-transform duration-500 ${
            isHovered ? "scale-110" : "scale-100"
          }`}
          loading="lazy"
        />

        {/* Category Badge */}
        {product?.category && (
          <div className="absolute top-3 left-3">
            <span
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(
                product.category
              )}`}
            >
              <span className="text-lg">
                {getCategoryIcon(product.category)}
              </span>
              {product.category}
            </span>
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation(); // stops navigation
            onWishlistToggle(product?.id);
          }}
          className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2.5 rounded-full shadow-sm hover:shadow-md transition-all hover:scale-110 z-10"
          aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            size={18}
            fill={isInWishlist ? "#ef4444" : "none"}
            className={`transition-colors ${
              isInWishlist ? "text-red-500" : "text-gray-600 hover:text-red-500"
            }`}
          />
        </button>

        {/* Quick View Overlay */}
        <div
          className={`absolute inset-0 bg-black/60 flex items-center justify-center transition-opacity duration-300 ${
            isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <button className="bg-white text-gray-900 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition flex items-center gap-2">
            <Eye size={16} />
            Quick View
          </button>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-5">
        {/* Title and Description */}
        <div className="mb-4">
          <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 min-h-[56px]">
            {product?.title || "Product Title"}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-2 min-h-[40px]">
            {truncateText(product?.description, 80)}
          </p>
        </div>

        {/* Rating and Price */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="relative"></div>
            <span className="text-yellow-400">★</span>
            <span className="text-gray-900 font-medium text-sm">
              {product?.rating?.rate?.toFixed(1) || "4.5"}
            </span>
            <span className="text-gray-400 text-sm">
              ({product?.rating?.count || 0})
            </span>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              {formatPrice(product?.price || 0)}
            </div>
            {product?.price && product.price < 50 && (
              <div className="text-xs text-green-600 font-medium mt-1 flex items-center gap-1">
                <Zap size={10} />
                Great Value
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation(); // stops navigation
              handleAddToCart();
            }}
            disabled={isAddingToCart || cartStatus.isInCart}
            className={`flex-1 py-3 rounded-lg transition-all duration-300 font-medium disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
              cartStatus.isInCart
                ? "bg-green-100 text-green-800"
                : "bg-gradient-to-r from-[#01A49E] to-[#01857F] text-white hover:from-[#01857F] hover:to-[#016F6B]"
            }`}
          >
            {isAddingToCart ? (
              <>
                <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                Adding...
              </>
            ) : cartStatus.isInCart ? (
              <>
                <ShoppingCart size={16} />
                Added to Cart
              </>
            ) : (
              <>
                <ShoppingCart size={16} />
                Add to Cart
              </>
            )}
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Free Shipping</span>
            <span>30-Day Returns</span>
          </div>
        </div>
      </div>

      {/* Hot Deal Badge */}
      {product?.rating?.rate >= 4.5 && (
        <div className="absolute top-3 left-3 z-10">
          <span className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
            HOT DEAL
          </span>
        </div>
      )}
    </div>
  );
};

export default ProductCard;
