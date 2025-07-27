import React, { useState, useEffect } from "react";
import axios from "../../config/api";
import { useAuth } from "../../context/authContext";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { FiHeart } from "react-icons/fi";
import { BsHeartFill } from "react-icons/bs";
import { toast } from "react-toastify";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

// Custom Arrow Components
const NextArrow = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute z-10 right-0 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow hover:bg-gray-100"
  >
    <FaChevronRight className="text-gray-800 text-lg" />
  </button>
);

const PrevArrow = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute z-10 left-0 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow hover:bg-gray-100"
  >
    <FaChevronLeft className="text-gray-800 text-lg" />
  </button>
);

const WishlistSlider = () => {
  const { isLogin } = useAuth();
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLogin) {
      fetchWishlist();
    }
  }, [isLogin]);

const fetchWishlist = async () => {
  try {
    setLoading(true);
    const { data } = await axios.get("/api/wishlist");
    if (data.success) {
      const productsWithRatings = await Promise.all(
        data.products.map(async (product) => {
          try {
            const ratingResponse = await axios.get(`/api/reviews/average/${product._id}`);
            return {
              ...product,
              rating: ratingResponse.data.averageRating || 0,
              ratingCount: ratingResponse.data.count || 0,
            };
          } catch (error) {
            console.error("Error fetching rating for wishlist product:", product._id, error);
            return {
              ...product,
              rating: 0,
              ratingCount: 0,
            };
          }
        })
      );
      setWishlistProducts(productsWithRatings);
    }
  } catch (error) {
    console.error("Failed to fetch wishlist:", error);
  } finally {
    setLoading(false);
  }
};


  const removeFromWishlist = async (productId) => {
    if (!isLogin) {
      toast.error("Please login to manage wishlist");
      return;
    }

    try {
      await axios.delete(`/api/wishlist/remove/${productId}`);
      setWishlistProducts(prev => prev.filter(product => product._id !== productId));
      toast.success("Removed from wishlist");
    } catch (error) {
      console.error("Failed to remove from wishlist:", error);
      toast.error("Failed to remove from wishlist");
    }
  };

  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: Math.min(wishlistProducts.length, 4),
    slidesToScroll: 1,
    variableWidth: true,
    centerMode: wishlistProducts.length === 1,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: Math.min(wishlistProducts.length, 3),
          centerMode: false,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: Math.min(wishlistProducts.length, 2),
          centerMode: false,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          centerMode: false,
        },
      },
    ],
  };

  if (!isLogin || wishlistProducts.length === 0) return null;

  return (
    <div className="bg-white py-15 px-25">
      <h2 className="text-4xl font-bold text-red-400 mb-5 px-4">
        Your Wishlist
      </h2>
      <hr className="mb-5 text-blue-400" />

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <Slider {...settings} className="px-4">
          {wishlistProducts.map((product) => (
            <div key={product._id} className="px-2">
              <div
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow h-full flex flex-col"
                style={{ width: "300px", height: "400px" }}
              >
                <div className="relative">
                  <Link to={`/product/${product._id}`}>
                    <div className="w-full h-70 overflow-hidden rounded-t-lg relative group">
                      <img
                        src={product.image[0]}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  </Link>
                  <button
                    onClick={() => removeFromWishlist(product._id)}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition"
                  >
                    <BsHeartFill className="text-red-500" />
                  </button>
                </div>

                <div className="p-3 flex flex-col justify-between flex-grow">
                  <Link to={`/product/${product._id}`}>
                    <h3 className="font-medium text-gray-800 mb-1 truncate">
                      {product.name}
                    </h3>
                  </Link>

              <div className="flex items-center mb-1">
  <div className="flex items-center text-yellow-400">
    {[...Array(5)].map((_, i) => (
      <span key={i}>
        {i < Math.floor(product.rating) ? "★" : "☆"}
      </span>
    ))}
  </div>
  {product.ratingCount > 0 && (
    <span className="text-xs text-gray-500 ml-1">
      ({product.rating.toFixed(1)}, {product.ratingCount})
    </span>
  )}
</div>


                  <div className="flex items-center">
                    <span className="text-lg font-bold text-blue-600">
                      ₹{Math.round(
                        product.mrp - (product.mrp * (product.discount || 0) / 100
                      ))}
                    </span>
                    {product.discount > 0 && (
                      <>
                        <span className="text-sm text-gray-500 line-through ml-2">
                          ₹{product.mrp}
                        </span>
                        <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded ml-2">
                          {product.discount}% OFF
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      )}
    </div>
  );
};

export default WishlistSlider;