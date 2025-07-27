import { useState, useEffect } from "react";
import axios from "../../config/api";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { FaStar, FaTrash, FaExternalLinkAlt, FaUser, FaReply, FaSearch } from "react-icons/fa";

const ReviewManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await axios.get("/api/reviews/admin/all");
        const sorted = res.data.reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setReviews(sorted);
        setFilteredReviews(sorted); // Initialize filtered reviews with all reviews
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch reviews");
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  // Filter reviews based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredReviews(reviews);
    } else {
      const filtered = reviews.filter(review => 
        review.userId?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredReviews(filtered);
    }
  }, [searchQuery, reviews]);

  const handleDeleteReview = async (id) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      await axios.delete(`/api/reviews/admin/${id}`);
      setReviews(reviews.filter((r) => r._id !== id));
      toast.success("Review deleted successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete review");
    }
  };

  const handleReplySubmit = async (id) => {
    if (!replyText.trim()) return toast.error("Reply cannot be empty");
    try {
      const res = await axios.post(`/api/reviews/${id}/reply`, { replyText });
      setReviews(reviews.map((r) => (r._id === id ? res.data : r)));
      setReplyText("");
      setReplyingTo(null);
      toast.success("Reply submitted");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to post reply");
    }
  };

  const handleRemoveReply = async (id) => {
    try {
      const res = await axios.delete(`/api/reviews/${id}/reply`);
      setReviews(reviews.map((r) => (r._id === id ? res.data : r)));
      toast.success("Reply removed");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove reply");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 py-10">{error}</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Customer Reviews</h1>
        
        {/* Search Field */}
        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Search by user name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {filteredReviews.length === 0 ? (
        <div className="text-center text-gray-500 py-20">
          {searchQuery ? "No matching reviews found" : "No reviews found"}
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredReviews.map((review) => (
            <div key={review._id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        className={`text-sm ${i < review.rating ? "text-yellow-400" : "text-gray-300"}`}
                      />
                    ))}
                  </div>
                  <p className="mt-2 font-medium text-gray-600 text-lg">{review.comment}</p>
                  <p className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleString()}</p>

                  <div className="mt-3 text-sm text-gray-600">
                    <p><span className="font-semibold">Product:</span> {review.productId?.name || "Unknown"}</p>
                    <p><span className="font-semibold">User:</span> {review.userId?.name || "Anonymous"}</p>
                  </div>

                  {review.images?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {review.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img.url}
                          alt={`Review ${idx + 1}`}
                          className="h-20 w-20 object-cover rounded border"
                        />
                      ))}
                    </div>
                  )}

                  {review.adminReply && (
                    <div className="mt-4 border-l-4 border-indigo-400 bg-indigo-50 p-4 rounded-md">
                      <div className="flex justify-between">
                        <div>
                          <p className="font-semibold text-indigo-700">Admin Reply</p>
                          <p className="text-gray-700 text-lg font-medium">{review.adminReply.text}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Replied by: {review.adminReply.repliedBy?.name || "Admin"} on{" "}
                            {new Date(review.adminReply.repliedAt).toLocaleString()}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveReply(review._id)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove Reply
                        </button>
                      </div>
                    </div>
                  )}

                  {replyingTo === review._id && (
                    <div className="mt-4">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="w-full text-lg p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        rows="3"
                        placeholder="Write your reply..."
                      />
                      <div className="mt-2 flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setReplyingTo(null);
                            setReplyText("");
                          }}
                          className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleReplySubmit(review._id)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm"
                        >
                          {review.adminReply ? "Update Reply" : "Post Reply"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col space-y-2 ml-4">
                  <Link
                    to={`/product/${review.productId._id}`}
                    className="text-blue-600 hover:text-blue-800 p-2"
                    title="View Product"
                  >
                    <FaExternalLinkAlt />
                  </Link>
                  <Link
                    to={ `/customers/${review.userId?._id || review.userId}` }
                    className="text-green-600 hover:text-green-800 p-2"
                    title="View User"
                  >
                    <FaUser />
                  </Link>
                  <button
                    onClick={() => setReplyingTo(replyingTo === review._id ? null : review._id)}
                    className="text-indigo-600 hover:text-indigo-800 p-2"
                    title={review.adminReply ? "Edit Reply" : "Add Reply"}
                  >
                    <FaReply />
                  </button>
                  <button
                    onClick={() => handleDeleteReview(review._id)}
                    className="text-red-600 hover:text-red-800 p-2"
                    title="Delete Review"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewManagement;