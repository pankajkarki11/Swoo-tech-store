// src/components/ProductCard.jsx
import React, { useState } from "react";
import { ShoppingCart, Heart, Star, Eye } from "lucide-react";

const ProductCard = ({
  product,
  onWishlistToggle,
  onAddToCart,
  isInWishlist,
  isLoading = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const formatPrice = (price) => {
    return `$${price.toFixed(2)}`;
  };

  const truncateDescription = (text, maxLength = 20) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const getCategoryIcon = (category) => {
    const icons = {
      electronics: "⚡",
      jewelery: "💎",
      "men's clothing": "👕",
      "women's clothing": "👗",
    };
    return icons[category.toLowerCase()] || "🛒";
  };

  return (
    <div
      className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image */}
      <div className="relative h-64 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        <img
          src={product.image}
          alt={product.title}
          className={`w-full h-full object-contain p-4 transition-transform duration-500 ${
            isHovered ? "scale-110" : "scale-100"
          }`}
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.category && (
            <span className="bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
              <span className="text-lg">
                {getCategoryIcon(product.category)}
              </span>
              {product.category.charAt(0).toUpperCase() +
                product.category.slice(1)}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div
          className={`absolute top-3 right-3 flex flex-col gap-2 transition-all duration-300 ${
            isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
          }`}
        >
          <button
            onClick={() => onWishlistToggle(product.id)}
            className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition shadow-sm hover:shadow-md"
            title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              size={18}
              fill={isInWishlist ? "#ef4444" : "none"}
              className={isInWishlist ? "text-red-500" : "text-gray-600"}
            />
          </button>
          <button
            className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition shadow-sm hover:shadow-md"
            title="Quick view"
          >
            <Eye size={18} className="text-gray-600" />
          </button>
        </div>

        {/* Add to Cart Button */}
        {/* <button
          onClick={() => onAddToCart(product)}
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-r from-[#01A49E] to-[#01857F] text-white py-3 font-semibold transition-all duration-300 ${
            isHovered
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-full"
          }`}
        >
          Add to Cart
        </button> */}
      </div>

      {/* Product Info */}
      <div className="p-5">
        <div className="mb-3">
          <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 h-14">
            {product.title}
          </h3>
          <p className="text-gray-500 text-sm line-clamp-2 h-10">
            {truncateDescription(product.description, 80)}
          </p>
        </div>

        {/* Rating */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Star size={16} className="text-yellow-400 fill-current" />
              <span className="font-semibold text-gray-900">
                {product.rating?.rate || 4.5}
              </span>
            </div>
            <span className="text-gray-400 text-sm">
              ({product.rating?.count || 10})
            </span>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => onAddToCart(product)}
            className="flex-1 bg-gray-900 text-white py-2.5 rounded-lg hover:bg-[#01A49E] transition flex items-center justify-center gap-2 font-medium"
          >
            <ShoppingCart size={16} />
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
