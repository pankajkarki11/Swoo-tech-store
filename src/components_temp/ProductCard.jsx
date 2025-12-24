// src/components/ProductCard.jsx - UPDATED FOR NEW CART CONTEXT
import React, { useState, useEffect, useCallback } from "react";
import {
  ShoppingCart,
  Heart,
  Star,
  Eye,
  Zap,
  ChevronRight,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";
import Button from "./ui/Button";

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
  const { addToCart, isInCart, getCartItemQuantity, isSyncing } = useCart();
  const { user } = useAuth();

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


  const handleAddToCart = useCallback(
    async (e) => {
      if (!product || isAddingToCart) return;

      e.stopPropagation();
      setIsAddingToCart(true);

      try {
       
        await addToCart(product, 1);
       
        toast.success(
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span>
              <strong><p className="text-blue-500">{product.title}</p> added to cart!</strong> 
            </span>
          </div>,
          {
            duration: 1500,
            icon: "🛒",
          }
        );
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
    [product, isAddingToCart, addToCart, user]
  );

  // Quick view handler
  const handleQuickView = useCallback(
    (e) => {
      e.stopPropagation();
      navigate(`/products/${product?.id}`);
    },
    [navigate, product?.id]
  );
  
  // Loading skeleton
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse dark:bg-gray-800">
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
  return (
    <div
      onClick={() => navigate(`/products/${product?.id}`)}
      className="group relative bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border border-gray-100 dark:bg-gray-900"
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

     
      {isSyncing && cartStatus.isInCart && (
        <div className="absolute top-12 left-3 z-20 animate-fade-in">
          <span className="bg-blue-500 text-white text-xs font-medium px-2 py-1 rounded-full shadow-lg flex items-center gap-1">
            <Loader2 size={10} className="animate-spin" />
            Syncing...
          </span>
        </div>
      )}

      {/* Product Image */}
      <div className="relative h-64 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden dark:bg-gray-800">
        <img
          src={product?.image}
          alt={product?.title || "Product"}
          className={`w-full h-full object-contain p-4 transition-transform duration-500 dark:bg-gray-800 ${
            isHovered ? "scale-110" : "scale-100 dark:bg-gray-700"
          }`}
          loading="lazy"
        />

     

        {/* Quick View Overlay */}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center transition-all duration-300 ${
            isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <Button 
          variant="overlay"
           onClick={handleQuickView}
           >
            <Eye size={16} />
            Quick View
          </Button>
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

          <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 min-h-[56px] group-hover:text-[#01A49E] transition-colors dark:text-white dark:group-hover:text-white">
            {product?.title || "Product Title"}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-2 min-h-[40px] dark:text-white">
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
            <span className="text-gray-900 font-medium text-sm dark:text-white">
              {product?.rating?.rate?.toFixed(1) || "4.5"}
            </span>
            <span className="text-gray-400 text-sm dark:text-white">
              ({product?.rating?.count || 0})
            </span>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
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

      
        {user && cartStatus.isInCart && (
          <div className="mt-2 text-center">
            {isSyncing ? (
              <span className="text-xs text-blue-600 flex items-center justify-center gap-1">
                <Loader2 size={10} className="animate-spin" />
                Syncing to server...
              </span>
            ) : (
              <span className="text-xs text-green-600 flex items-center justify-center gap-1">
                <CheckCircle size={10} />
                Synced to server
              </span>
            )}
          </div>
        )}
      </div>

     
      <div
        className={`
          absolute bottom-0 left-0 right-0 h-1
          bg-gradient-to-r from-[#01A49E] to-[#01857F]
          dark:bg-gradient-to-r dark:from-white dark:to-gray-300
          transform origin-left transition-transform duration-300
          ${isHovered ? "scale-x-100" : "scale-x-0"}
        `}
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