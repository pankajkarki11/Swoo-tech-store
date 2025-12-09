import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  isInCart,
  getCartItemQuantity,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
} from "../utils/cartUtils";
import { ShoppingCart } from "lucide-react";

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState("");

  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [cartStatus, setCartStatus] = useState({
    isInCart: false,
    quantity: 0,
  });

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
      const response = await fetch(`https://fakestoreapi.com/products/${id}`);

      if (!response.ok) {
        throw new Error(`Product not found (Error ${response.status})`);
      }

      const data = await response.json();
      setProduct(data);
      setSelectedImage(data.image);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Check cart status on mount and when product changes
  useEffect(() => {
    if (product?.id) {
      const inCart = isInCart(product.id);
      const cartQuantity = getCartItemQuantity(product.id);
      setCartStatus({
        isInCart: inCart,
        quantity: cartQuantity,
      });
    }
  }, [product]);

  // Listen for cart updates
  useEffect(() => {
    const handleCartUpdate = () => {
      if (product?.id) {
        const inCart = isInCart(product.id);
        const cartQuantity = getCartItemQuantity(product.id);
        setCartStatus({
          isInCart: inCart,
          quantity: cartQuantity,
        });
      }
    };

    window.addEventListener("cartUpdated", handleCartUpdate);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
    };
  }, [product?.id]);

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
      // Use the addToCart function from cartUtils
      addToCart(product, quantity);

      // Update local state after adding
      const newQuantity = cartStatus.quantity + quantity;
      setCartStatus({
        isInCart: true,
        quantity: newQuantity,
      });

      toast.success("Added to cart");

      // Reset quantity to 1 after adding
      setQuantity(1);
    } catch (err) {
      toast.success("Cannot add to cart");
    } finally {
      setTimeout(() => setIsAddingToCart(false), 500);
    }
  };

  const handleUpdateCartQuantity = (change) => {
    if (!product) return;

    const newQty = cartStatus.quantity + change;

    if (newQty <= 0) {
      // Remove from cart
      removeFromCart(product.id);
      setCartStatus({
        isInCart: false,
        quantity: 0,
      });
      alert("Item removed from cart");
    } else {
      // Update quantity using cartUtils
      updateCartItemQuantity(product.id, newQty);
      setCartStatus({
        isInCart: true,
        quantity: newQty,
      });
      toast.success(`Cart quantity updated to ${newQty}`);
    }
  };

  const handleRemoveFromCart = () => {
    if (!product) return;

    removeFromCart(product.id);
    setCartStatus({
      isInCart: false,
      quantity: 0,
    });

    toast.error("Item removed from cart");
  };

  const buyNow = () => {
    if (!product) return;

    // Add to cart first (if not already in cart)
    if (!cartStatus.isInCart) {
      addToCart(product, quantity);
    }

    // Navigate to cart page
    navigate("/cart");
  };

  const handleViewCart = () => {
    navigate("/cart");
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
          <p className="text-lg text-gray-600 animate-pulse">
            Loading product details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="text-7xl mb-6">😞</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Product Not Found
          </h2>
          <p className="text-gray-600 mb-8">
            {error || "The product you're looking for doesn't exist."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              ← Go Back
            </button>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
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
        <ol className="flex items-center space-x-2 text-sm text-gray-600">
          <li>
            <button
              onClick={() => navigate("/")}
              className="hover:text-blue-600 transition-colors"
            >
              Home
            </button>
          </li>
          <li>›</li>
          <li className="capitalize">
            <button
              onClick={() => navigate("/")}
              className="hover:text-blue-600 transition-colors"
            >
              {product.category}
            </button>
          </li>
          <li>›</li>
          <li className="font-medium text-gray-800 truncate">
            {product.title}
          </li>
        </ol>
      </nav>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
          {/* Left Column - Images */}
          <div>
            {/* Main Image */}
            <div className="relative bg-gray-50 rounded-xl overflow-hidden mb-4 h-96">
              <img
                src={selectedImage}
                alt={product.title}
                className="w-full h-full object-contain p-8"
              />
              {product.price > 100 && (
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-green-500 text-white text-sm font-bold rounded-full">
                    FREE SHIPPING
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            <div className="flex space-x-4 overflow-x-auto pb-2">
              <button
                onClick={() => setSelectedImage(product.image)}
                className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                  selectedImage === product.image
                    ? "border-blue-500"
                    : "border-gray-200"
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
              <span className="px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                {product.category.toUpperCase()}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
              {product.title}
            </h1>

            {/* Rating */}
            <div className="flex items-center mb-6">
              <div className="flex items-center">
                <div className="flex text-yellow-400 text-xl">
                  {[...Array(5)].map((_, i) => (
                    <span key={i}>
                      {i < Math.floor(product.rating?.rate || 0) ? "★" : "☆"}
                    </span>
                  ))}
                </div>
                <span className="ml-3 text-lg font-semibold text-gray-700">
                  {product.rating?.rate || 0}/5
                </span>
              </div>
              <span className="mx-3 text-gray-300">•</span>
              <span className="text-gray-600">
                {product.rating?.count || 0} reviews
              </span>
              <span className="mx-3 text-gray-300">•</span>
              <span className="text-green-600 font-semibold">✓ In Stock</span>
            </div>

            {/* Price */}
            <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-gray-50 rounded-xl">
              <div className="flex items-end">
                <span className="text-5xl font-bold text-gray-800">
                  ${product.price}
                </span>
                {product.price > 100 && (
                  <span className="ml-4 text-lg text-green-600 font-semibold">
                    + Free Shipping
                  </span>
                )}
              </div>
              <p className="text-gray-600 mt-2">
                Tax included. Shipping calculated at checkout.
              </p>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                Description
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Quantity Selector */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Quantity
              </h3>
              <div className="flex items-center">
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    className="px-5 py-3 text-xl text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={quantity <= 1}
                  >
                    −
                  </button>
                  <span className="px-6 py-3 text-xl font-bold w-16 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    className="px-5 py-3 text-xl text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={quantity >= 10}
                  >
                    +
                  </button>
                </div>
                <span className="ml-4 text-gray-500 text-sm">
                  Max 10 per customer
                </span>
              </div>
            </div>

            {/* Cart Status Display */}
            {cartStatus.isInCart && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-green-600 mr-2">✓</span>
                    <span className="text-green-800 font-medium">
                      {cartStatus.quantity} × {product.title} in cart
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleUpdateCartQuantity(-1)}
                      className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                    >
                      -
                    </button>
                    <button
                      onClick={() => handleUpdateCartQuantity(1)}
                      className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                    >
                      +
                    </button>
                    <button
                      onClick={handleRemoveFromCart}
                      className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <button
                  onClick={handleViewCart}
                  className="mt-3 w-full py-2 text-center text-green-700 hover:text-green-800 font-medium"
                >
                  View Cart →
                </button>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button
                onClick={handleAddToCart}
                disabled={isAddingToCart}
                className={`flex-1 py-3 rounded-lg transition-all duration-300 font-medium disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                  cartStatus.isInCart
                    ? "bg-green-100 text-green-800 hover:bg-green-200"
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
                    Added to Cart ({cartStatus.quantity})
                  </>
                ) : (
                  <>
                    <ShoppingCart size={16} />
                    Add to Cart
                  </>
                )}
              </button>
              <button
                onClick={buyNow}
                className="flex-1 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-[1.02] font-semibold text-lg flex items-center justify-center"
              >
                ⚡ Buy Now
              </button>
            </div>

            {/* Additional Info */}
            <div className="border-t border-gray-200 pt-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-700 mb-2">
                    📦 Delivery
                  </h4>
                  <p className="text-sm text-gray-600">
                    Free shipping on orders over $100
                    <br />
                    2-5 business days
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-700 mb-2">
                    🔄 Returns
                  </h4>
                  <p className="text-sm text-gray-600">
                    30-day return policy
                    <br />
                    Money-back guarantee
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>
                    Product ID: <strong>{product.id}</strong>
                  </span>
                  <span>
                    Category:{" "}
                    <strong className="capitalize">{product.category}</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="border-t border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Customer Reviews
          </h2>
          <div className="flex items-center justify-between mb-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-800 mb-2">
                {product.rating?.rate || 0}
                <span className="text-2xl">/5</span>
              </div>
              <div className="flex text-yellow-400 text-2xl mb-2">
                {[...Array(5)].map((_, i) => (
                  <span key={i}>
                    {i < Math.floor(product.rating?.rate || 0) ? "★" : "☆"}
                  </span>
                ))}
              </div>
              <p className="text-gray-600">
                {product.rating?.count || 0} total reviews
              </p>
            </div>
            <button className="px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium">
              Write a Review
            </button>
          </div>

          {/* Review Placeholder */}
          <div className="bg-gray-50 rounded-xl p-6">
            <p className="text-gray-600 text-center">
              "Be the first to review this product!"
            </p>
          </div>
        </div>
      </div>

      {/* Back to Products */}
      <div className="mt-8 text-center">
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors font-medium group"
        >
          ← Back to All Products
          <span className="ml-2 group-hover:translate-x-1 transition-transform">
            →
          </span>
        </button>
      </div>
    </div>
  );
};

export default ProductDetailPage;
