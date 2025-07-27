import React, { useEffect, useState } from "react";
import axios from "../config/api";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { FiHeart, FiShoppingBag, FiTrash2, FiArrowRight } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import { useCart } from "../context/CartContext"; // Import your cart context

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { addItemToCart } = useCart(); // Use your cart context

  const fetchWishlist = async () => {
    try {
      const { data } = await axios.get("/api/wishlist");
      if (data.success) {
        setWishlist((data.products || []).reverse()); // Reversed for newest first
      } else {
        setWishlist([]);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        setError("Please login to view your wishlist");
        navigate('/login');
      } else {
        setError("Failed to load wishlist. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId, e) => {
    e.stopPropagation();
    try {
      await axios.delete(`/api/wishlist/remove/${productId}`);
      setWishlist(prev => prev.filter(product => product._id !== productId));
      toast.success("Removed from wishlist");
    } catch (error) {
      toast.error("Failed to remove product. Please try again.");
    }
  };

  const handleAddToCart = async (product, e) => {
    e.stopPropagation();
    try {
      // Check if product has sizes and no size is selected
      if (product.size && product.size.length > 0) {
        // Navigate to product page to select size
        navigate(`/product/${product._id}`);
        toast("Please select a size before adding to cart", {
          icon: "ℹ️",
        });
        return;
      }

      // Add to cart with quantity 1 and no size
      const response = await axios.post("/api/cart/add", {
        productId: product._id,
        quantity: 1,
      });

      if (response.data.success) {
        // Update local cart state if using context
        if (addItemToCart) {
          addItemToCart({
            product,
            quantity: 1,
            selectedSize: null,
          });
        }
        toast.success("Added to cart!");
      } else {
        toast.error(response.data.message || "Failed to add to cart");
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      toast.error(
        error.response?.data?.message || "Failed to add to cart. Please try again."
      );
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center">
        <FiHeart className="text-4xl text-pink-500 mb-4 animate-bounce" />
        <p className="text-gray-600">Loading your wishlist...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-red-50 p-8 rounded-xl text-center max-w-md">
        <FiHeart className="text-4xl text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Oops!</h3>
        <p className="text-gray-600 mb-6">{error}</p>
        <button 
          onClick={() => navigate('/')}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center justify-center mx-auto"
        >
          Continue Shopping <FiArrowRight className="ml-2" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Your Wishlist
          </h1>
          <p className="mt-3 text-xl text-gray-500">
            {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved for later
          </p>
        </div>

        {wishlist.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <FiHeart className="mx-auto text-5xl text-gray-300 mb-6" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Your wishlist is empty
            </h3>
            <p className="text-gray-500 mb-6">
              Save your favorite items here to keep track of what you love
            </p>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-1">
            {wishlist.map((product) => (
              <div
                key={product._id}
                onClick={() => navigate(`/product/${product._id}`)}
                className="flex flex-col sm:flex-row bg-white overflow-hidden rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer border border-gray-100"
              >
                <div className="w-full sm:w-48 h-48 flex-shrink-0 relative">
                  <img
                    src={product.image?.[0] || "/placeholder-image.jpg"}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "/placeholder-image.jpg";
                    }}
                  />
                  <div className="absolute top-3 right-3">
                    <button
                      onClick={(e) => removeFromWishlist(product._id, e)}
                      className="p-2 bg-white rounded-full shadow-md text-red-500 hover:bg-red-50 transition"
                      aria-label="Remove from wishlist"
                    >
                      <FaHeart className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 hover:text-indigo-600 transition">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">{product.brand}</p>
                       
                      </div>
                      <div className="text-right">
                        {product.discount > 0 ? (
                          <>
                            <span className="text-xl font-bold text-gray-900">
                              ₹{Math.round(product.mrp - (product.mrp * product.discount) / 100)}
                            </span>
                            <span className="line-through text-sm text-gray-500 ml-2">
                              ₹{product.mrp}
                            </span>
                          </>
                        ) : (
                          <span className="text-xl font-bold text-gray-900">₹{product.mrp}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                    <div className="flex space-x-3">
                      <button
                        onClick={(e) => handleAddToCart(product, e)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <FiShoppingBag className="-ml-1 mr-2 h-5 w-5" />
                        Add to Cart
                      </button>
                    </div>
                    <button
                      onClick={(e) => removeFromWishlist(product._id, e)}
                     className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <FiTrash2 className="-ml-1 mr-2 h-5 w-5" /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;