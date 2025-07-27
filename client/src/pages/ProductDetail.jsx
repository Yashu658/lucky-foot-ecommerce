import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../config/api";
import toast from "react-hot-toast";
import { FiShoppingCart, FiCreditCard ,  FiArrowLeft } from "react-icons/fi";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import {
  FaTrash,
  FaThumbsUp,
  FaThumbsDown,
  FaChevronDown,
} from "react-icons/fa";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/authContext";
import ViewProductMod from "./ViewProductMod";
import ProductDescription from "./ProductDescription";
import RelatedProductsSlider from "./Slider/RelatedProductsSlider";
import { FiHeart } from "react-icons/fi";
import { FaReply } from "react-icons/fa";
import { BsHeartFill } from "react-icons/bs";
import EditProductModal from "../components/Modals/EditProductModal"; 

const ProductDetail = () => {
  const { user, isLogin } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
const [showDescription, setShowDescription] = useState(false);
const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState("/placeholder-product.jpg");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState("view");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [productRatings, setProductRatings] = useState({});
  const [wishlist, setWishlist] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [userId, setUserId] = useState(null);
const [replyingTo, setReplyingTo] = useState(null);
const [replyText, setReplyText] = useState("");
  const [reviews, setReviews] = useState([]);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [totalReviews, setTotalReviews] = useState(0);

  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedReviewForImage, setSelectedReviewForImage] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [userReactions, setUserReactions] = useState({});
  const [likesCounts, setLikesCounts] = useState({});
  const [dislikesCounts, setDislikesCounts] = useState({});
  const [visibleCount, setVisibleCount] = useState(3);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!product?._id) return;

      setReviewLoading(true);
      try {
        const response = await axios.get(`/api/reviews/product/${product._id}`);
        const reviewsWithShowReply = response.data.reviews.map((review) => ({
          ...review,
          showReply: false,
        }));
        setReviews(reviewsWithShowReply || []);
        setTotalReviews(response.data.count || 0);
      } catch (error) {
        console.error("Error fetching reviews:", error);
        toast.error("Failed to load reviews");
      } finally {
        setReviewLoading(false);
      }
    };

    fetchReviews();
  }, [product?._id]);

  // Add these useEffect hooks
  useEffect(() => {
    const userData = JSON.parse(sessionStorage.getItem("user"));
    if (userData && userData._id) {
      setUserId(userData._id);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      fetchWishlist();
    }
  }, [userId]);

   useEffect(() => {
    const trackRecentView = async () => {
      if (isLogin && product?._id) {
        try {
          await axios.post(`/api/recent-views/track/${product._id}`);
        } catch (error) {
          console.error("Error tracking recent view:", error);
        }
      }
    };

    trackRecentView();
  }, [isLogin, product?._id]);

  const fetchWishlist = async () => {
    try {
      const { data } = await axios.get("/api/wishlist");
      if (data.success) {
        const productIds = data.products.map((p) => p._id);
        setWishlist(productIds);
      }
    } catch (error) {
      console.error("Failed to fetch wishlist:", error);
    }
  };

  const toggleWishlist = async (e, productId) => {
    e.stopPropagation();

    if (!userId) {
      toast.error("Please login to use wishlist");
      navigate("/login");
      return;
    }

    setWishlistLoading(true);

    try {
      if (wishlist.includes(productId)) {
        await axios.delete(`/api/wishlist/remove/${productId}`);
        setWishlist((prev) => prev.filter((id) => id !== productId));
        toast.success("Removed from wishlist");
      } else {
        await axios.post(`/api/wishlist/add/${productId}`);
        setWishlist((prev) => [...prev, productId]);
        toast.success("Added to wishlist");
      }
    } catch (error) {
      console.error("Wishlist operation failed:", error);
      toast.error(error.response?.data?.message || "Wishlist operation failed");
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleImageClick = () => {
  if (user?.role === "Admin") {
    setIsEditModalOpen(true);
  }
};

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/admin/product/${id}`);

        if (!response.data?.product) {
          throw new Error("Invalid product data received");
        }
        setProduct(response.data.product);
        setSelectedSize(response.data.product.size?.[0] || null);

        // Fetch all ratings for products in this order
        const productId = response.data.product._id;

        try {
          const ratingRes = await axios.get(
            `/api/reviews/average/${productId}`
          );
          setProductRatings({
            [productId]: {
              averageRating: ratingRes.data.averageRating || 0,
              reviewCount: ratingRes.data.count || 0,
            },
          });
        } catch (err) {
          console.error(`Error fetching rating for product ${productId}:`, err);
          setProductRatings({ [productId]: 0 });
        }

        //console.log('All ratings:', ratings);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError(
          err.response?.data?.message || err.message || "Failed to load product"
        );

        if (err.response?.status === 404) {
          setTimeout(() => navigate("/not-found"), 2000);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  useEffect(() => {
    if (product?.image?.[0]) {
      setMainImage(product.image[0]);
    }
  }, [product]);

  const handleSizeSelect = (sizeObj) => {
    setSelectedSize(sizeObj);
    setQuantity(1); // Reset quantity when size changes
  };

  const buyProduct = (product) => {
    if (!selectedSize) {
      toast.error("Please select a size first");
      return;
    }
    setSelectedProduct(product);
    setModalAction("buy");
    setIsViewModalOpen(true);
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error("Please select a size first");
      return;
    }
    if (quantity > selectedSize.quantity) {
      toast.error(`Only ${selectedSize.quantity} available in this size`);
      return;
    }
    addToCart({
      ...product,
      selectedSize: selectedSize.size,
      quantity,
      price: product.mrp - (product.mrp * product.discount) / 100,
    });
    //toast.success("Added to cart!");
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1 || newQuantity > (selectedSize?.quantity || 0)) return;
    setQuantity(newQuantity);
  };

  useEffect(() => {
    if (!reviews.length) return;
    const reactions = {};
    const likes = {};
    const dislikes = {};

    reviews.forEach((review) => {
      likes[review._id] = review.likes?.length || 0;
      dislikes[review._id] = review.dislikes?.length || 0;

      if (user && review.likes?.some((u) => u._id === user._id)) {
        reactions[review._id] = "like";
      } else if (user && review.dislikes?.some((u) => u._id === user._id)) {
        reactions[review._id] = "dislike";
      }
    });

    setUserReactions(reactions);
    setLikesCounts(likes);
    setDislikesCounts(dislikes);
  }, [reviews, user]);


  const toggleDescription = () => {
    setShowDescription((prev) => !prev);
  };

  const handleReplySubmit = async (reviewId) => {
  if (!replyText.trim()) {
    toast.error("Reply cannot be empty");
    return;
  }
  
  try {
    const response = await axios.post(`/api/reviews/${reviewId}/reply`, { 
      replyText 
    });
    
    // Update the reviews state with the new reply
    setReviews(reviews.map(review => 
      review._id === reviewId ? response.data : review
    ));
    
    setReplyText("");
    setReplyingTo(null);
    toast.success("Reply submitted successfully");
  } catch (error) {
    console.error("Error submitting reply:", error);
    toast.error(error.response?.data?.message || "Failed to submit reply");
  }
};

const handleRemoveReply = async (reviewId) => {
  try {
    const response = await axios.delete(`/api/reviews/${reviewId}/reply`);
    setReviews(reviews.map(review => 
      review._id === reviewId ? response.data : review
    ));
    toast.success("Reply removed successfully");
  } catch (error) {
    console.error("Error removing reply:", error);
    toast.error(error.response?.data?.message || "Failed to remove reply");
  }
};

  const handleReaction = async (reviewId, action) => {
    if (!user) {
      toast.error("Please login to react to reviews.");
      navigate("/login");
      return;
    }
    try {
      const response = await axios.post(`/api/reviews/${reviewId}/react`, {
        action,
      });
      setUserReactions((prev) => ({
        ...prev,
        [reviewId]: action,
      }));

      setLikesCounts((prev) => ({
        ...prev,
        [reviewId]: response.data.likesCount,
      }));

      setDislikesCounts((prev) => ({
        ...prev,
        [reviewId]: response.data.dislikesCount,
      }));
    } catch (error) {
      toast.error("Failed to register your reaction.");
    }
  };

  if (loading)
    return (
      <div className="p-4 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="grid grid-cols-2 gap-2">
                <div className="h-24 bg-gray-200 rounded"></div>
                <div className="h-24 bg-gray-200 rounded"></div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-10 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
        </div>
      </div>
    );

  if (error) return <div className="p-4 text-red-600 text-center">{error}</div>;
  if (!product)
    return <div className="p-4 text-center">Product not available</div>;

  const discountedPrice =
    (product.mrp || 0) - ((product.mrp || 0) * (product.discount || 0)) / 100;

  // Add this function to your ProductDetail component
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;

    try {
      await axios.delete(`/api/reviews/admin/${reviewId}`);
      toast.success("Review deleted successfully");
      // Refresh reviews after deletion
      const response = await axios.get(`/api/reviews/product/${product._id}`);
      const reviewsWithShowReply = response.data.reviews.map((review) => ({
        ...review,
        showReply: false,
      }));
      setReviews(reviewsWithShowReply || []);
      setTotalReviews(response.data.count || 0);
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error(error.response?.data?.message || "Failed to delete review");
    }
  };

  const renderReviewsSection = () => {
    if (reviewLoading) {
      return (
        <div className="flex justify-center py-12">
          Loading...
        </div>
      );
    }
    if (reviews.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            No reviews yet. Be the first to review!
          </p>
        </div>
      );
    }
    const totalReviewsCount = reviews.length;
    const totalStarRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalReviewsCount
      ? (totalStarRating / totalReviewsCount).toFixed(1)
      : 0;

    const starBreakdown = [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: reviews.filter((r) => r.rating === star).length,
    }));

    const allReviewImages = reviews.flatMap((r) => r.images || []);
    const displayedReviews = reviews.slice(0, visibleCount);

    return (
      <div className="mt-16 border-t pt-10 relative">
        <h3 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">
          Customer Reviews
        </h3>

        {/* Summary Box */}
        <div className=" bg-indigo-50 border border-indigo-200 rounded-xl p-2 mb-2 text-center max-w-xl mx-auto shadow-sm">
          <div>
            <p className="text-4xl font-bold text-indigo-700 mb-1">
              ⭐ {averageRating}
            </p>
            <p className="text-gray-700 text-lg">
              {totalReviewsCount} reviews in total
            </p>
          </div>
          {/* Star Breakdown */}
          <div className="mt-6 space-y-2 text-left">
            {starBreakdown.map(({ star, count }) => (
              <div key={star} className="flex items-center gap-3">
                <span className="text-sm w-14">{star} Star</span>
                <div className="h-2 flex-1 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500"
                    style={{ width: `${(count / totalReviewsCount) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-700 w-6 text-right">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* All Review Images - Horizontal Slider */}
        {allReviewImages.length > 0 && (
          <div className="mb-5">
            <h4 className="text-lg font-semibold text-gray-800 mb-3 m-2">
              Photos from customers
            </h4>
            <div className="flex overflow-x-auto gap-3 pb-2 m-2 scrollbar-hide">
              {allReviewImages.map((img, idx) => (
                <img
                  key={idx}
                  src={img.url}
                  alt={`Review Image ${idx + 1}`}
                  className="h-28 w-28 rounded-lg object-cover border shadow-sm hover:opacity-90 cursor-pointer transition"
                  onClick={() => {
                    // Find which review this image belongs to
                    const reviewWithImage = reviews.find((r) =>
                      r.images?.some((i) => i.url === img.url)
                    );
                    if (reviewWithImage) {
                      const imageIndex = reviewWithImage.images.findIndex(
                        (i) => i.url === img.url
                      );
                      setSelectedReviewForImage(reviewWithImage);
                      setSelectedImageIndex(imageIndex);
                      setIsImageModalOpen(true);
                    }
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Individual Reviews */}
        
         <div className="space-y-6">
        {reviews.slice(0, visibleCount).map((review) => (
          <div key={review._id} className="bg-white p-6 rounded-lg shadow  relative">
            {user?.role === "Admin" && (
              <div className="absolute top-4 right-4 flex gap-2">
                {!review.adminReply && (
                  <button
                    onClick={() => setReplyingTo(replyingTo === review._id ? null : review._id)}
                    className="text-indigo-600 hover:text-indigo-800"
                    title="Reply to review"
                  >
                    <FaReply className="w-5 h-5" />
                  </button>
                )}
                <button
                  onClick={() => handleDeleteReview(review._id)}
                  className="text-red-500 hover:text-red-700"
                  title="Delete review"
                >
                  <FaTrash className="w-5 h-5" />
                </button>
              </div>
            )}
            
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-lg font-bold">
                {review.userId?.name?.charAt(0) || "U"}
              </div>
              <div>
                <p className="font-semibold text-gray-800">
                  {review.userId?.name || "Anonymous"}
                </p>
                <div className="flex items-center space-x-1 text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={
                        i < review.rating ? "text-yellow-400" : "text-gray-300"
                      }
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <p className="text-gray-700 mb-3">{review.comment}</p>

            {/* Review Images */}
            {review.images?.length > 0 && (
              <div className="flex gap-3 mt-2">
                {review.images.slice(0, 3).map((img, idx) => (
                  <img
                    key={idx}
                    src={img.url}
                    alt={`Review ${idx + 1}`}
                    className="h-20 w-20 object-cover rounded border cursor-pointer hover:opacity-80"
                    onClick={() => {
                      setSelectedReviewForImage(review);
                      setSelectedImageIndex(idx);
                      setIsImageModalOpen(true);
                    }}
                  />
                ))}
              </div>
            )}
            
            <p className="text-xs text-gray-500 mt-4">
              {new Date(review.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>

            {review.adminReply && (
              <div className="mt-4 pl-4 border-l-4 border-indigo-200 bg-indigo-50 p-3 rounded">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">Admin Reply</p>
                    <p className="text-gray-700">{review.adminReply.text}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Replied on {new Date(review.adminReply.repliedAt).toLocaleDateString()}
                    </p>
                  </div>
                  {user?.role === "Admin" && (
                    <button
                      onClick={() => handleRemoveReply(review._id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            )}

            {replyingTo === review._id && (
              <div className="mt-4">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full p-2 border rounded"
                  rows="3"
                  placeholder="Write your reply..."
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyText("");
                    }}
                    className="px-3 py-1 bg-gray-200 rounded text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleReplySubmit(review._id)}
                    className="px-3 py-1 bg-indigo-600 text-white rounded text-sm"
                  >
                    Submit
                  </button>
                </div>
              </div>
            )}

              {/* Like / Dislike Buttons */}
              <div className="flex items-center gap-4 mt-4">
                <button
                  onClick={() => handleReaction(review._id, "like")}
                  className={`flex items-center gap-1 text-xl font-medium ${
                    userReactions[review._id] === "like"
                      ? "text-blue-600"
                      : "text-gray-500"
                  }`}
                  aria-label="Like review"
                >
                  <FaThumbsUp />
                  <span>{likesCounts[review._id] || 0}</span>
                </button>

                <button
                  onClick={() => handleReaction(review._id, "dislike")}
                  className={`flex items-center gap-1 text-xl font-medium ${
                    userReactions[review._id] === "dislike"
                      ? "text-blue-600"
                      : "text-gray-500"
                  }`}
                  aria-label="Dislike review"
                >
                  <FaThumbsDown />
                  <span>{dislikesCounts[review._id] || 0}</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Buttons */}
        {reviews.length > 3 && (
          <div className="text-center mt-8 flex justify-center gap-4 flex-wrap">
            {/* Load More Reviews Button */}
            {visibleCount < reviews.length && (
              <button
                onClick={() =>
                  setVisibleCount((prev) => Math.min(prev + 3, reviews.length))
                }
                className="px-6 py-2 bg-white border border-indigo-600 text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 transition-colors"
              >
                Load More Reviews
              </button>
            )}

            {/* Show Less Reviews Button */}
            {visibleCount > 3 && (
              <button
                onClick={() => setVisibleCount(3)}
                className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Show Less Reviews
              </button>
            )}
          </div>
        )}
      </div>
    );
  };




// product
  return (
   <div>
     <div className="ml-40 mt-2">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 transition-colors"
      >
        <FiArrowLeft className="w-5 h-5" />
        <span>Back</span>
      </button>
    </div>
     <div className="max-w-6xl mx-auto p-4 md:p-8">
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-4">
          {/* Product Images */}
          <div>
            <div className="mb-4 relative">
              <div
                className="absolute top-2 right-2 z-10"
                onClick={(e) =>
                  !wishlistLoading && toggleWishlist(e, product._id)
                }
              >
                {wishlist.includes(product._id) ? (
                  <BsHeartFill className="text-red-500 text-2xl" />
                ) : (
                  <FiHeart className="text-white text-2xl bg-black/20 rounded-full p-1" />
                )}
              </div>
              {user?.role === "Admin" && (
      <div className="absolute top-2 left-2 z-10 bg-blue-500 text-white text-xs px-2 py-1 rounded">
        Edit
      </div>
    )}
              <img
                src={mainImage}
                alt={product.name}
                className="w-full h-96 object-contain rounded-lg bg-gray-100 border"
                onError={(e) => {
                  e.target.src = "/placeholder-product.jpg";
                }}
                 onClick={handleImageClick}
      style={{ cursor: user?.role === "Admin" ? "pointer" : "default" }}
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {product.image?.slice(0, 4).map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`${product.name} - ${idx + 1}`}
                  className="h-24 object-cover rounded border cursor-pointer  hover:opacity-80"
                  onClick={() => setMainImage(img)}
                />
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              <p className="text-gray-600 mb-4">{product.brand}</p>

              <div className="flex items-center gap-4 mb-4">
                <span className="text-2xl font-bold text-indigo-700">
                  ₹{discountedPrice.toLocaleString()}
                </span>
                {product.discount > 0 && (
                  <>
                    <span className="text-4xl font-bold text-red-500 line-through">
                      ₹{product.mrp.toLocaleString()}
                    </span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-sm font-medium rounded">
                      {product.discount}% OFF
                    </span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-5 h-5 ${
                        i <
                        Math.floor(
                          productRatings[product._id]?.averageRating || 0
                        )
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                <span className="text-gray-600 text-sm">
                  {(productRatings[product._id]?.averageRating || 0).toFixed(1)}
                  /5 ({productRatings[product._id]?.reviewCount || 0} reviews)
                </span>
              </div>
            </div>

            {/* Size Selection */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Select Size</h3>
              <div className="flex flex-wrap gap-2">
                {(product.size || []).map((sizeItem) => {
                  const sizeStock = sizeItem.quantity;
                  const isSelected = selectedSize?.size === sizeItem.size;

                  return (
                    <div key={sizeItem.size} className="relative mb-2">
                      <button
                        onClick={() => handleSizeSelect(sizeItem)}
                        disabled={sizeStock === 0}
                        className={`px-4 py-2 rounded border font-medium ${
                          isSelected
                            ? "bg-indigo-600 text-white border-indigo-700"
                            : "bg-white border-gray-300 hover:border-indigo-400"
                        } ${
                          sizeStock === 0 ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        UK {sizeItem.size}
                      </button>

                      {sizeStock === 0 && (
                        <p className="text-red-600 text-xs font-bold mt-2 absolute -bottom-8 left-0 right-0 text-center">
                          Out of stock
                        </p>
                      )}
                      {sizeStock > 0 && sizeStock < 5 && (
                        <p className="text-orange-500 text-xs font-medium mt-2 absolute -bottom-8 left-0 right-0 text-center">
                          Hurry! Only {sizeStock} left
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {selectedSize && (
                <div className="pt-2">
                  {quantity > selectedSize.quantity && (
                    <p className="text-red-500 font-semibold">
                      Only {selectedSize.quantity} in stock!
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Quantity Selector */}
            {selectedSize && selectedSize.quantity > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold">Quantity</h3>
                <div className="flex items-center border rounded w-32">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                    className="px-3 py-2 hover:bg-gray-100 disabled:opacity-50"
                  >
                    -
                  </button>
                  <span className="flex-1 text-center px-2">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= selectedSize.quantity}
                    className="px-3 py-2 hover:bg-gray-100 disabled:opacity-50"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={handleAddToCart}
                disabled={!selectedSize || !selectedSize.quantity}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FiShoppingCart className="text-lg" />
                Add to Cart
              </button>
              <button
                onClick={() => buyProduct(product)}
                disabled={!selectedSize || !selectedSize.quantity}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FiCreditCard className="text-lg" />
                Buy Now
              </button>
            </div>
          </div>
        </div>
        {/* Product Details */}
        <div className="space-y-4 pt-6 border-t m-10">
          
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-8">
             <div>
              <h4 className="text-lg font-semibold text-indigo-700 mb-1 uppercase tracking-wide">
                Gender
              </h4>
              <p className="text-gray-600 capitalize">{product.gender}</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-indigo-700 mb-1 uppercase tracking-wide">
                Category
              </h4>
              <p className="text-gray-600 capitalize">{product.category}</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-indigo-700 mb-1 uppercase tracking-wide">
                SubCategory
              </h4>
              <p className="text-gray-600 capitalize">{product.subCategory}</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-indigo-700 mb-1 uppercase tracking-wide">
                Color
              </h4>
              <p className="text-gray-600">{product.color}</p>
            </div>
          </div>
        <div className="mt-10">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={toggleDescription}
      >
        <h2 className="text-lg font-semibold text-indigo-700 uppercase tracking-wide">
          Product Details
        </h2>
        {showDescription ? (
          <IoIosArrowUp className="text-indigo-700" />
        ) : (
          <IoIosArrowDown className="text-indigo-700" />
        )}
      </div>
            {showDescription && (
        <div className="mt-4">
          <ProductDescription description={product.description} />
        </div>
      )}
    </div>


        </div>
              {/* Related Products Slider - Add this after the main product details */}
  

        {/* Add this where you want the reviews section to appear */}
        {renderReviewsSection()}
 {product && (
        <div className="mt-10"> {/* Added margin-top for spacing */}
          <RelatedProductsSlider 
            currentProductId={product._id}
            gender={product.gender}
            category={product.category}
            subCategory={product.subCategory}
          />
        </div>
      )}
    </div>
       {isEditModalOpen && (
  <EditProductModal
    isOpen={isEditModalOpen}
    onClose={() => setIsEditModalOpen(false)}
    product={product}
    onProductUpdated={(updatedProduct) => {
      setProduct(updatedProduct);
    }}
  />
)}

      <ViewProductMod
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        product={product}
        selectedSize={selectedSize}
        quantity={quantity}
        action={modalAction}
      />

      <ReviewImageModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        review={selectedReviewForImage}
        initialImageIndex={selectedImageIndex}
      />
    </div>
   </div>
  );
};

const ReviewImageModal = ({
  isOpen,
  onClose,
  review,
  initialImageIndex = 0,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(initialImageIndex);
  const [showAdminReply, setShowAdminReply] = useState(false);
  if (!isOpen || !review) return null;

  const currentImage = review.images[currentImageIndex];

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
          {/* Main Image */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={currentImage.url}
                alt={`Review image ${currentImageIndex + 1}`}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Thumbnail Slider */}
            {review.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto py-2 scrollbar-hide">
                {review.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`flex-shrink-0 w-16 h-16 rounded border-2 ${
                      idx === currentImageIndex
                        ? "border-indigo-500"
                        : "border-transparent"
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover rounded"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Review Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-lg font-bold">
                {review.userId?.name?.charAt(0) || "U"}
              </div>
              <div>
                <p className="font-semibold text-gray-800">
                  {review.userId?.name || "Anonymous"}
                </p>
                <div className="flex items-center space-x-1 text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={
                        i < review.rating ? "text-yellow-400" : "text-gray-300"
                      }
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <p className="text-gray-700">{review.comment}</p>

            <div className="text-sm text-gray-500">
              Reviewed on{" "}
              {new Date(review.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
            {/* Admin Reply Section */}
            {review.adminReply && (
              <div className="mt-6 pt-4 border-t">
                <button
                  onClick={() => setShowAdminReply(!showAdminReply)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1 mb-2"
                >
                  {showAdminReply ? "Hide Admin Reply" : "View Admin Reply"}
                  <FaChevronDown
                    className={`transition-transform duration-200 ${
                      showAdminReply ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {showAdminReply && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-bold">
                        A
                      </div>
                      <p className="font-medium text-blue-800">
                        Admin Response
                      </p>
                    </div>
                    <p className="text-blue-700">{review.adminReply.text}</p>
                    <p className="text-xs text-blue-500 mt-2">
                      {new Date(review.adminReply.repliedAt).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    
    </div>
  );
};

export default ProductDetail;
