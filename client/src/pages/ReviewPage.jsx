import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { IoMdClose } from "react-icons/io";
import { FaStar, FaCamera, FaTrash } from "react-icons/fa";
import axios from "../config/api";
import toast from "react-hot-toast";

const ReviewPage = () => {
  const navigate = useNavigate();
  const { productId } = useParams();
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [userReview, setUserReview] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [orderStatus, setOrderStatus] = useState(null);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
const [isLoadingRating, setIsLoadingRating] = useState(true);
  



useEffect(() => {
  const fetchOrderStatus = async () => {
    try {
      const res = await axios.get(`/api/orders/status?productId=${productId}`, {
        credentials: "include",
      });

      const status = res.data.orderStatus;
      const allowedStatuses = [
        "Delivered",
        "ReplacementRequested",
        "ReplacementApproved",
        "ReplacementShipped",
        "ReplacementCompleted",
        "ReplacementRejected",
      ];

      if (!allowedStatuses.includes(status)) {
        // Redirect back if status doesn't allow reviews
        navigate(-1);
        toast.error("This product isn't eligible for review based on its current status.");
      }

      setOrderStatus(status);
    } catch (error) {
      console.error("Error fetching order status:", error);
      setOrderStatus("UNKNOWN");
      navigate(-1);
      toast.error("Failed to verify review eligibility.");
    }
  };

  fetchOrderStatus();
}, [productId, navigate]);


  useEffect(() => {
    const fetchReviews = async () => {
      try {
        // Fetch all reviews
        const reviewsRes = await axios.get(`/api/reviews/product/${productId}`);

        // Fetch average rating and count
         const ratingRes = await axios.get(`/api/reviews/average/${productId}`);
    setAverageRating(ratingRes.data.averageRating || 0);
    setReviewCount(ratingRes.data.count || 0);
        // Check if user has already reviewed
        const userRes = await axios.get(
          `/api/reviews/check?productId=${productId}`,
          {
            credentials: "include",
          }
        );

        if (userRes.data?.reviewed) {
          setUserReview(userRes.data.review);
          // Filter out user's own review from the reviews list
    const allReviews = reviewsRes.data.reviews || []; // Adjust key based on actual response
const filteredReviews = allReviews.filter(
  (r) => r._id !== userRes.data.review._id
);

          setReviews(filteredReviews);
        } else {
          setUserReview(null);
          setReviews(reviewsRes.data);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [productId]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      alert("You can upload a maximum of 5 images");
      return;
    }

    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      isNew: true,
    }));

    setImages([...images, ...newImages]);
  };

  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };


  useEffect(() => {
  return () => {
    images.forEach(img => {
      if (img.preview && img.isNew) {
        URL.revokeObjectURL(img.preview);
      }
    });
  };
}, [images]);

  const submitReview = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    if (!comment.trim()) {
  toast.error("Please write a review comment");
  return;
}

if (images.length > 5) {
  toast.error("You can upload a maximum of 5 images");
  return;
}

    try {
      const formData = new FormData();
      formData.append("productId", productId);
      formData.append("rating", rating);
      formData.append("comment", comment);

      images.forEach((img) => {
        if (img.isNew) {
          formData.append("images", img.file);
        }
      });

      const res = await axios.post("/api/reviews", formData, {
        headers: { 
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true
      });

      if (res.data) {
        setUserReview(res.data);
        // Refresh reviews after new review created
        window.location.reload();
      } else {
        throw new Error("Failed to submit review");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
       toast.error(error.response?.data?.message || "Failed to submit review");
    } finally {
      setIsLoading(false);
    }
  };


  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm p-4 pt-20">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6">
          <h2 className="text-2xl font-bold text-gray-800">Customer Reviews</h2>
          <button
            onClick={() => navigate(-1)}
            className="text-gray-500 hover:text-red-600 transition"
          >
            <IoMdClose size={24} />
          </button>
        </div>

        {/* Rating Summary */}
        <div className="flex items-center px-6 mt-4 mb-6">
          <div className="flex items-center mr-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <FaStar
                key={star}
                className={`text-xl ${
                  star <= Math.round(averageRating)
                    ? "text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="text-gray-700 font-medium">
            {averageRating.toFixed(1)} out of 5 ({reviewCount}{" "}
            {reviewCount === 1 ? "review" : "reviews"})
          </span>
        </div>

        {/* Write Review or Show User Review */}
        {!userReview ? (
          <div className="bg-purple-50 px-6 py-5 rounded-lg mb-8 mx-6">
            <h3 className="text-lg font-semibold text-purple-800 mb-4">
              Write a Review
            </h3>
            <form onSubmit={submitReview}>
              {/* Rating */}
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Your Rating</label>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="focus:outline-none"
                    >
                      <FaStar
                        className={`text-xl ${
                          star <= rating ? "text-yellow-400" : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <div className="mb-4">
                <label htmlFor="comment" className="block text-gray-700 mb-2">
                  Your Review
                </label>
                <textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows="4"
                  required
                ></textarea>
              </div>

              {/* Image Upload */}
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">
                  Upload Images (max 5)
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {images.map((img, index) => (
                    <div key={index} className="relative">
                      <img
                        src={img.preview}
                        alt={`Preview ${index}`}
                        className="h-20 w-20 object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                      >
                        <FaTrash className="text-xs" />
                      </button>
                    </div>
                  ))}
                </div>
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-600 hover:bg-purple-300 hover:text-white rounded-lg cursor-pointer">
                  <FaCamera />
                  <span>Add Photos</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                disabled={isLoading}
              >
                {isLoading ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          </div>
        ) : (
          // Show existing user review only here
          <div className="bg-purple-50 px-6 py-5 rounded-lg mb-8 mx-6">
            <h3 className="text-lg font-semibold text-purple-800 mb-4">
              Your Review
            </h3>

            <div className="flex items-center mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <FaStar
                  key={star}
                  className={`text-lg ${
                    star <= userReview.rating
                      ? "text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>

            <p className="text-gray-700 mb-3">{userReview.comment}</p>

            {userReview?.images?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {userReview.images.map((img, index) => (
                  <img
                    key={index}
                    src={img.url}
                    alt={`Review ${index}`}
                    className="h-20 w-20 object-cover rounded-md"
                  />
                ))}
              </div>
            )}

            <p className="text-sm text-gray-500 mt-3">
              Reviewed on {new Date(userReview.createdAt).toLocaleDateString()}
            </p>
          </div>
        )}

        {/* Reviews List - show only other people's reviews */}
        <div className="px-6 pb-6">
          {reviews.length > 0 ? (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review._id} className="border-b pb-6 last:border-0">
                  <div className="flex items-center mb-2">
                    <div className="flex items-center mr-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                          key={star}
                          className={`text-lg ${
                            star <= review.rating
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <h4 className="font-medium text-gray-800">
                      {review.userId?.name || "Anonymous"}
                    </h4>
                  </div>

                  <p className="text-gray-700 mb-3">{review.comment}</p>

                  {review.images.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {review.images.map((img, index) => (
                        <img
                          key={index}
                          src={img.url}
                          alt={`Review ${index}`}
                          className="h-20 w-20 object-cover rounded-md"
                        />
                      ))}
                    </div>
                  )}

                  <p className="text-sm text-gray-500 mt-3">
                    Reviewed on{" "}
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-6">
              No reviews yet. Be the first to review!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewPage;
