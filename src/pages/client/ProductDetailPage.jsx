import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ShoppingCart,
  Star,
  Truck,
  RefreshCw,
  Shield,
  Package,
  Check,
  ArrowLeft,
  Home,
} from "lucide-react";
import useApi from "../../services/AdminuseApi";
import { useCart } from "../../contexts/CartContext";

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState("");
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const api = useApi();
  const {
    cart,
    addToCart: addToCartContext,
    removeFromCart,
    updateQuantity,
    isInCart,
    getCartItemQuantity,
  } = useCart();

  // Scroll to top when component mounts or id changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const { data } = await api.productAPI.getById(id);
      setProduct(data);
      setSelectedImage(data.image);
      setError(null);
    } catch (err) {
      setError(err.message || "Product not found");
    } finally {
      setLoading(false);
    }
  };

  // Check cart status on mount and when product changes
  useEffect(() => {
    if (product?.id) {
    }
  }, [product, cart]);

  // Get cart status for this product
  const cartStatus = {
    isInCart: product?.id ? isInCart(product.id) : false,
    quantity: product?.id ? getCartItemQuantity(product.id) : 0,
  };

  const handleQuantityChange = (change) => {
    setQuantity((prev) => {
      const newQty = prev + change;
      return newQty < 1 ? 1 : newQty > 10 ? 10 : newQty;
    });
  };

  const handleAddToCart = async () => {
    if (isAddingToCart || !product) return;

    setIsAddingToCart(true);
    try {
      await addToCartContext(product, quantity);
      toast.success(`${quantity} × ${product.title} added to cart!`);
      setQuantity(1);
    } catch (err) {
      toast.error("Failed to add to cart. Please try again.");
    } finally {
      setTimeout(() => setIsAddingToCart(false), 500);
    }
  };

  const handleUpdateCartQuantity = async (change) => {
    if (!product) return;

    const newQty = cartStatus.quantity + change;

    if (newQty <= 0) {
      try {
        await removeFromCart(product.id);
        toast.success("Item removed from cart");
      } catch (error) {
        toast.error("Failed to remove item");
      }
    } else {
      try {
        await updateQuantity(product.id, newQty);
        toast.success(`Cart quantity updated to ${newQty}`);
      } catch (error) {
        toast.error("Failed to update quantity");
      }
    }
  };

  const handleRemoveFromCart = async () => {
    if (!product) return;

    try {
      await removeFromCart(product.id);
      toast.success("Item removed from cart");
    } catch (error) {
      toast.error("Failed to remove item");
    }
  };

  const buyNow = async () => {
    if (!product ) return;

    try {
      // Add to cart first (if not already in cart)
      if (!cartStatus.isInCart) {
        await addToCartContext(product, quantity);
      }
      // Navigate to cart page
      navigate("/cart");
    } catch (error) {
      toast.error("Failed to add to cart");
    }
  };

  const handleViewCart = () => {
    navigate("/cart");
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#01A49E]"></div>
          <p className="text-lg text-gray-600 animate-pulse dark:text-white">
            Loading product details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="text-7xl mb-6">😞</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4 dark:text-white">
            Product Not Found
          </h2>
          <p className="text-gray-600 mb-8">
            {error || "The product you're looking for doesn't exist."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <ArrowLeft size={20} />
              Go Back
            </button>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 bg-gradient-to-r from-[#01A49E] to-[#01857F] text-white rounded-lg hover:shadow-lg transition-all font-medium flex items-center justify-center gap-2"
            >
              <Home size={20} />
              Browse Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-8">
        <ol className="flex items-center space-x-2 text-sm text-gray-600 flex-wrap dark:text-wite">
          <li>
            <button
              onClick={() => navigate("/")}
              className="hover:text-[#01A49E] transition-colors flex items-center gap-1 dark:text-gray-400 dark:hover:text-[#01A49E] transition-color"
            >
              <Home size={16} />
              Home
            </button>
          </li>
          <li className="dark:text-gray-400 ">›</li>
          <li className="capitalize">
            <button
              onClick={() => navigate("/")}
              className="hover:text-[#01A49E] transition-colors dark:text-gray-400 dark:hover:text-[#01A49E] transition-color"
            >
              {product.category}
            </button>
          </li>
          <li>›</li>
          <li className="font-medium text-gray-800 truncate dark:text-gray-300">
            {product.title}
          </li>
        </ol>
      </nav>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden dark:bg-gray-800">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
          {/* Left Column - Images */}
          <div>
            {/* Main Image */}
            <div className="relative bg-gray-100 rounded-2xl overflow-hidden mb-6 h-96 dark:bg-gray-800 dark:shadow-white dark:shadow-sm">
              <img
                src={selectedImage}
                alt={product.title}
                className="w-full h-full object-contain p-8 transition-transform duration-500 hover:scale-110 dark:shadow-white dark:shadow-lg"
              />
              {product.price > 100 && (
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1.5 bg-green-500 text-white text-sm font-bold rounded-full flex items-center gap-1 dark:bg-green-800">
                    <Truck size={14} />
                    FREE SHIPPING
                  </span>
                </div>
              )}
             
            </div>

            {/* Thumbnail Gallery */}
            <div className="flex space-x-4 overflow-x-auto pb-2">
              <button
                onClick={() => setSelectedImage(product.image)}
                className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                  selectedImage === product.image
                    ? "border-[#01A49E] ring-2 ring-[#01A49E]/20"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <img
                  src={product.image}
                  alt="Main"
                  className="w-full h-full object-contain p-2"
                />
              </button>
            </div>
          </div>

          {/* Right Column - Product Info */}
          <div>
            {/* Category & Brand */}
            <div className="mb-4">
              <span className="px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                {product.category.toUpperCase()}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl lg:text-3xl font-bold text-gray-900 mb-4 leading-tight dark:text-gray-200">
              {product.title}
            </h1>

            {/* Rating */}
            <div className="flex items-center mb-6 flex-wrap gap-2">
              <div className="flex items-center">
                <div className="flex text-yellow-400 text-xl">
                  {[...Array(5)].map((_, i) => (
                    <span key={i}>
                      {i < Math.floor(product.rating?.rate || 0) ? (
                        <Star size={20} fill="currentColor" />
                      ) : (
                        <Star size={20} />
                      )}
                    </span>
                  ))}
                </div>
                <span className="ml-3 text-lg font-semibold text-gray-700 dark:text-gray-300">
                  {product.rating?.rate?.toFixed(1) || "0.0"}/5
                </span>
              </div>
              <span className="text-gray-200 hidden sm:inline">•</span>
              <span className="text-gray-600 dark:text-gray-300">
                {product.rating?.count || 0} reviews
              </span>
              <span className="text-gray-200 hidden sm:inline">•</span>
              <span className="text-green-600 font-semibold flex items-center gap-1 dark:text-green-400">
                <Check size={16} />
                In Stock
              </span>
            </div>

            {/* Price */}
            <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-gray-50 rounded-xl border border-blue-100 dark:from-slate-900 dark:to-slate-800 dark:border-gray-700
">
              <div className="flex items-end">
                <span className="text-5xl font-bold text-gray-900 dark:text-white">
                  ${product.price.toFixed(2)}
                </span>
                {product.price > 100 && (
                  <span className="ml-4 text-lg text-green-600 font-semibold flex items-center gap-1 dark:text-green-400">
                    <Truck size={18} />
                    Free Shipping
                  </span>
                )}
              </div>
              <p className="text-gray-600 mt-2 dark:text-gray-200">
                Tax included. Shipping calculated at checkout.
              </p>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2 dark:text-gray-200">
                <Package size={20} />
                Description
              </h3>
              <p className="text-gray-600 leading-relaxed text-lg dark:text-gray-300">
                {product.description}
              </p>
            </div>

            {/* Quantity Selector */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 dark:text-gray-200">
                Quantity
              </h3>
              <div className="flex items-center">
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    className="px-5 py-3 text-xl text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:hover:bg-gray-700"
                    disabled={quantity <= 1}
                  >
                    −
                  </button>
                  <span className="px-6 py-3 text-xl font-bold w-16 text-center dark:text-gray-300">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    className="px-5 py-3 text-xl text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:hover:bg-gray-700"
                    disabled={quantity >= 10}
                  >
                    +
                  </button>
                </div>
                <span className="ml-4 text-gray-500 text-sm dark:text-gray-200">
                  Max 10 per customer
                </span>
              </div>
            </div>

            {/* Cart Status Display */}
            {cartStatus.isInCart && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-green-600 mr-2">
                      <Check size={20} />
                    </span>
                    <span className="text-green-800 font-medium">
                      {cartStatus.quantity} × {product.title} in cart
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleUpdateCartQuantity(-1)}
                      
                      className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 disabled:opacity-50"
                    >
                      -
                    </button>
                    <button
                      onClick={() => handleUpdateCartQuantity(1)}
                     
                      className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 disabled:opacity-50"
                    >
                      +
                    </button>
                    <button
                      onClick={handleRemoveFromCart}
                      
                      className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <button
                  onClick={handleViewCart}
                  className="mt-3 w-full py-2 text-center text-green-700 hover:text-green-800 font-medium flex items-center justify-center gap-2"
                >
                  View Cart <ArrowLeft className="rotate-180" size={16} />
                </button>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button
                onClick={handleAddToCart}
                disabled={isAddingToCart}
                className={`flex-1 py-4 rounded-xl transition-all duration-300 font-medium disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 ${
                  cartStatus.isInCart
                    ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 hover:from-green-200 hover:to-emerald-200 border border-green-200"
                    : "bg-gradient-to-r from-[#01A49E] to-[#01857F] text-white hover:from-[#01857F] hover:to-[#016F6B] hover:shadow-xl"
                } ${isAddingToCart ? "animate-pulse" : ""}`}
              >
                {isAddingToCart ? (
                  <>
                    <div className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    Adding...
                  </>
                ) : cartStatus.isInCart ? (
                  <>
                    <ShoppingCart size={20} />
                    In Cart ({cartStatus.quantity})
                  </>
                ) : (
                  <>
                    <ShoppingCart size={20} />
                    Add to Cart
                  </>
                )}
              </button>
              <button
                onClick={buyNow}
               
                className="flex-1 px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300 hover:shadow-xl font-semibold text-lg flex items-center justify-center gap-2 disabled:opacity-70"
              >
                ⚡ Buy Now
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="border-t border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 dark:text-gray-300">
            Customer Reviews
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2 dark:text-gray-200">
                {product.rating?.rate?.toFixed(1) || "0.0"}
                <span className="text-2xl text-gray-600 dark:text-gray-200">/5</span>
              </div>
              <div className="flex text-yellow-400 text-2xl mb-2 justify-center">
                {[...Array(5)].map((_, i) => (
                  <span key={i}>
                    {i < Math.floor(product.rating?.rate || 0) ? (
                      <Star size={24} fill="currentColor" />
                    ) : (
                      <Star size={24} />
                    )}
                  </span>
                ))}
              </div>
              <p className="text-gray-600 dark:text-gray-200">
                {product.rating?.count || 0} total reviews
              </p>
            </div>
            <button className="px-6 py-3 border-2 border-[#01A49E] text-[#01A49E] rounded-lg hover:bg-[#01A49E]/10 transition-colors font-medium">
              Write a Review
            </button>
          </div>

          {/* Review Placeholder */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-8 text-center dark:from-gray-600 dark:to-gray-700">
            <div className="text-5xl mb-4">📝</div>
            <p className="text-gray-600 text-lg mb-2 dark:text-gray-200">
              No reviews yet for this product
            </p>
            <p className="text-gray-500 dark:text-gray-200">
              Be the first to share your thoughts!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ProductDetailPage;
