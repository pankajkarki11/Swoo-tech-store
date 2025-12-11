// src/components/ProductCard.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  ShoppingCart,
  Heart,
  Star,
  Eye,
  Zap,
  ChevronRight,
  CheckCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import useApi from "../services/useApi";
import toast from "react-hot-toast";

const ProductCard = ({
  product,
  onWishlistToggle,
  isInWishlist = false,
  isLoading = false,
  compact = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [cartStatus, setCartStatus] = useState({
    isInCart: false,
    quantity: 0,
  });

  const navigate = useNavigate();
  const { addToCart, isInCart, getCartItemQuantity } = useCart();
  const api = useApi();

  // Update cart status when product or cart changes
  useEffect(() => {
    if (product?.id) {
      const inCart = isInCart(product.id);
      const quantity = getCartItemQuantity(product.id);
      setCartStatus({
        isInCart: inCart,
        quantity: quantity,
      });
    }
  }, [product?.id, isInCart, getCartItemQuantity]);

  // Listen for cart updates
  useEffect(() => {
    const handleCartUpdate = () => {
      if (product?.id) {
        const inCart = isInCart(product.id);
        const quantity = getCartItemQuantity(product.id);
        setCartStatus({
          isInCart: inCart,
          quantity: quantity,
        });
      }
    };

    window.addEventListener("cartUpdated", handleCartUpdate);
    return () => window.removeEventListener("cartUpdated", handleCartUpdate);
  }, [product?.id, isInCart, getCartItemQuantity]);

  const formatPrice = useCallback((price) => {
    return `$${price?.toFixed(2) || "0.00"}`;
  }, []);

  const truncateText = useCallback(
    (text, maxLength = compact ? 40 : 60) => {
      if (!text || text.length <= maxLength) return text;
      return text.substring(0, maxLength).trim() + "...";
    },
    [compact]
  );

  // Enhanced add to cart with API sync
  const handleAddToCart = useCallback(
    async (e) => {
      if (!product || isAddingToCart) return;

      e.stopPropagation();
      setIsAddingToCart(true);

      try {
        // First, add to local cart using CartContext
        await addToCart(product, 1);

        // Show success message
        toast.success(
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span>
              <strong>{product.title}</strong> added to cart!
            </span>
          </div>,
          {
            duration: 2000,
            icon: "🛒",
          }
        );

        // If user is logged in, sync to API in background
        const user = JSON.parse(localStorage.getItem("swmart_user") || "null");
        const token = localStorage.getItem("swmart_token");

        if (user && token) {
          // Get current cart from localStorage
          const currentCart = JSON.parse(
            localStorage.getItem("swmart_cart") || "[]"
          );

          // Find user's existing carts
          try {
            const { data: existingCarts } = await api.cartAPI.getUserCarts(
              user.id
            );

            // Prepare cart data for API
            const apiCartData = {
              userId: user.id,
              date: new Date().toISOString(),
              products: currentCart.map((item) => ({
                productId: item.id,
                quantity: item.quantity || 1,
              })),
            };

            if (existingCarts?.length > 0) {
              // Update most recent cart
              const latestCart = existingCarts[0];
              await api.cartAPI.update(latestCart.id, apiCartData);
            } else {
              // Create new cart
              await api.cartAPI.create(apiCartData);
            }

            console.log("✅ Cart synced to API after adding item");
          } catch (apiError) {
            console.error("❌ Error syncing to API (background):", apiError);
            // Don't show error to user - this happens in background
          }
        }
      } catch (error) {
        console.error("Failed to add to cart:", error);
        toast.error(
          <div className="flex items-center gap-2">
            <span>Failed to add to cart. Please try again.</span>
          </div>
        );
      } finally {
        setTimeout(() => setIsAddingToCart(false), 500);
      }
    },
    [product, isAddingToCart, addToCart, api.cartAPI]
  );

  // Quick view handler
  const handleQuickView = useCallback(
    (e) => {
      e.stopPropagation();
      navigate(`/products/${product?.id}`);
    },
    [navigate, product?.id]
  );

  // Wishlist toggle handler
  const handleWishlistToggle = useCallback(
    (e) => {
      e.stopPropagation();
      if (onWishlistToggle) {
        onWishlistToggle(product?.id);
        toast.success(
          isInWishlist ? "Removed from wishlist" : "Added to wishlist!",
          {
            icon: isInWishlist ? "💔" : "❤️",
            duration: 1500,
          }
        );
      }
    },
    [product?.id, onWishlistToggle, isInWishlist]
  );

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
        <div className={`${compact ? "h-48" : "h-64"} bg-gray-200`}></div>
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

  // Compact version for lists
  if (compact) {
    return (
      <div
        onClick={() => navigate(`/products/${product?.id}`)}
        className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100"
      >
        <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
          <img
            src={product?.image}
            alt={product?.title || "Product"}
            className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />

          {/* Wishlist Button */}
          <button
            onClick={handleWishlistToggle}
            className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm hover:shadow-md transition-all hover:scale-110 z-10"
            aria-label={
              isInWishlist ? "Remove from wishlist" : "Add to wishlist"
            }
          >
            <Heart
              size={16}
              fill={isInWishlist ? "#ef4444" : "none"}
              strokeWidth={isInWishlist ? 0 : 2}
              className={
                isInWishlist
                  ? "text-red-500"
                  : "text-gray-600 hover:text-red-500"
              }
            />
          </button>
        </div>

        <div className="p-4">
          <h3 className="font-bold text-gray-900 text-sm mb-2 line-clamp-2 hover:text-[#01A49E] transition-colors">
            {product?.title || "Product Title"}
          </h3>

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1">
              <span className="text-yellow-400">★</span>
              <span className="text-gray-900 font-medium text-xs">
                {product?.rating?.rate?.toFixed(1) || "4.5"}
              </span>
              <span className="text-gray-400 text-xs">
                ({product?.rating?.count || 0})
              </span>
            </div>
            <div className="text-lg font-bold text-gray-900">
              {formatPrice(product?.price || 0)}
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isAddingToCart || cartStatus.isInCart}
            className={`w-full py-2 rounded-lg transition-all duration-300 text-sm font-medium flex items-center justify-center gap-2 ${
              cartStatus.isInCart
                ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 hover:from-green-200 hover:to-emerald-200 border border-green-200"
                : "bg-gradient-to-r from-[#01A49E] to-[#01857F] text-white hover:from-[#01857F] hover:to-[#016F6B] hover:shadow-md"
            } ${isAddingToCart ? "animate-pulse" : ""}`}
          >
            {isAddingToCart ? (
              <>
                <div className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                Adding...
              </>
            ) : cartStatus.isInCart ? (
              <>
                <CheckCircle size={14} />
                Added ({cartStatus.quantity})
              </>
            ) : (
              <>
                <ShoppingCart size={14} />
                Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Full version with hover effects
  return (
    <div
      onClick={() => navigate(`/products/${product?.id}`)}
      className="group relative bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border border-gray-100"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Cart Status Badge */}
      {cartStatus.isInCart && (
        <div className="absolute top-3 left-3 z-20 animate-fade-in">
          <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
            <ShoppingCart size={12} />
            In Cart ({cartStatus.quantity})
          </span>
        </div>
      )}

      {/* Product Image */}
      <div className="relative h-64 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        <img
          src={product?.image}
          alt={product?.title || "Product"}
          className={`w-full h-full object-contain p-4 transition-transform duration-500 ${
            isHovered ? "scale-110" : "scale-100"
          }`}
          loading="lazy"
        />

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2.5 rounded-full shadow-sm hover:shadow-md transition-all hover:scale-110 z-10"
          aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            size={18}
            fill={isInWishlist ? "#ef4444" : "none"}
            strokeWidth={isInWishlist ? 0 : 2}
            className={`transition-colors ${
              isInWishlist ? "text-red-500" : "text-gray-600 hover:text-red-500"
            }`}
          />
        </button>

        {/* Quick View Overlay */}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center transition-all duration-300 ${
            isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <button
            onClick={handleQuickView}
            className="mb-6 bg-white text-gray-900 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-100 transition flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <Eye size={16} />
            Quick View
          </button>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-5">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
              {product?.category?.toUpperCase()}
            </span>
            {product?.price && product.price < 50 && (
              <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                <Zap size={10} />
                Great Value
              </span>
            )}
          </div>

          <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 min-h-[56px] group-hover:text-[#01A49E] transition-colors">
            {product?.title || "Product Title"}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-2 min-h-[40px]">
            {truncateText(product?.description, 80)}
          </p>
        </div>

        {/* Rating and Price */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  fill={
                    i < Math.floor(product?.rating?.rate || 0)
                      ? "currentColor"
                      : "none"
                  }
                  strokeWidth={
                    i < Math.floor(product?.rating?.rate || 0) ? 0 : 1
                  }
                />
              ))}
            </div>
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
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={isAddingToCart || cartStatus.isInCart}
          className={`w-full py-3 rounded-xl transition-all duration-300 font-medium disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
            cartStatus.isInCart
              ? "bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 hover:from-green-100 hover:to-emerald-100 border border-green-200"
              : "bg-gradient-to-r from-[#01A49E] to-[#01857F] text-white hover:from-[#01857F] hover:to-[#016F6B] hover:shadow-lg"
          } ${isAddingToCart ? "animate-pulse" : ""} group-hover:shadow-lg`}
        >
          {isAddingToCart ? (
            <>
              <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              Adding...
            </>
          ) : cartStatus.isInCart ? (
            <>
              <CheckCircle size={16} />
              Added to Cart
              <ChevronRight
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                size={16}
              />
            </>
          ) : (
            <>
              <ShoppingCart size={16} />
              Add to Cart
              <ChevronRight
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                size={16}
              />
            </>
          )}
        </button>
      </div>

      {/* Hover Indicator */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#01A49E] to-[#01857F] transform transition-transform duration-300 ${
          isHovered ? "scale-x-100" : "scale-x-0"
        }`}
      ></div>
    </div>
  );
};

// Add animation styles
const style = document.createElement("style");
style.textContent = `
  @keyframes fade-in {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-fade-in {
    animation: fade-in 0.3s ease-out;
  }
`;
document.head.appendChild(style);

export default ProductCard;
