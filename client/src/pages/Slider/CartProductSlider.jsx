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


const CartProductSlider = () => {
  const { isLogin } = useAuth();
  const [cartProducts, setCartProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  useEffect(() => {
    if (isLogin) {
      fetchCartProducts();
      fetchWishlist();
    }
  }, [isLogin]);

const fetchCartProducts = async () => {
  try {
    setLoading(true);
    const { data } = await axios.get("/api/cart/getCart");

    if (data && data.products) {
      const enrichedProducts = await Promise.all(
        data.products.map(async (item) => {
          const baseProduct = {
            ...item.productId,
            quantity: item.quantity,
            selectedSize: item.selectedSize,
          };

          try {
            const ratingRes = await axios.get(`/api/reviews/average/${item.productId._id}`);
            return {
              ...baseProduct,
              averageRating: ratingRes.data.averageRating || 0,
              ratingCount: ratingRes.data.count || 0,
            };
          } catch (error) {
            console.error("Rating fetch failed for", item.productId._id, error);
            return {
              ...baseProduct,
              averageRating: 0,
              ratingCount: 0,
            };
          }
        })
      );

      setCartProducts(enrichedProducts);
    }
  } catch (error) {
    console.error("Failed to fetch cart products:", error);
  } finally {
    setLoading(false);
  }
};


  const fetchWishlist = async () => {
    try {
      const { data } = await axios.get("/api/wishlist");
      if (data.success) {
        setWishlist(data.products.map((p) => p._id));
      }
    } catch (error) {
      console.error("Failed to fetch wishlist:", error);
    }
  };

  const toggleWishlist = async (productId) => {
    if (!isLogin) {
      toast.error("Please login to use wishlist");
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

 const settings = {
  dots: true,
  infinite: false,
  speed: 500,
  slidesToShow: Math.min(cartProducts.length, 4),
  slidesToScroll: 1,
  variableWidth: true,
  centerMode: cartProducts.length === 1,
  nextArrow: <NextArrow />,
  prevArrow: <PrevArrow />,
  responsive: [
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: Math.min(cartProducts.length, 3),
        centerMode: false,
      },
    },
    {
      breakpoint: 768,
      settings: {
        slidesToShow: Math.min(cartProducts.length, 2),
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


  if (!isLogin || cartProducts.length === 0) return null;

  return (
    <div className="bg-white py-15 px-25 ">
      <h2 className="text-4xl font-bold text-green-800 mb-5 px-4">
        Your Cart Items
      </h2>
      <hr className="mb-5 text-blue-400" />

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <Slider {...settings} className="px-4">
          {cartProducts.map((product) => (
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
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
                      />
                    </div>
                  </Link>
                  <button
                    onClick={() => toggleWishlist(product._id)}
                    disabled={wishlistLoading}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition"
                  >
                    {wishlist.includes(product._id) ? (
                      <BsHeartFill className="text-red-500" />
                    ) : (
                      <FiHeart className="text-gray-600" />
                    )}
                  </button>
                </div>

                <div className="p-3 flex flex-col justify-between flex-grow">
                  <Link to={`/product/${product._id}`}>
                    <h3 className="font-medium text-gray-800 mb-1 truncate">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Size:  UK {product.selectedSize?.size ?? "N/A"}| Qty:{" "}
                      {product.quantity}
                    </p>
                  </Link>

                 <div className="flex items-center mb-1">
  <div className="flex items-center text-yellow-400">
    {[...Array(5)].map((_, i) => (
      <span key={i}>
        {i < Math.floor(product.averageRating) ? "★" : "☆"}
      </span>
    ))}
  </div>
  {product.ratingCount > 0 && (
    <span className="text-xs text-gray-500 ml-1">
      ({product.averageRating.toFixed(1)}, {product.ratingCount})
    </span>
  )}
</div>


                  <div className="flex items-center">
                    <span className="text-lg font-bold text-blue-600">
                      ₹
                      {Math.round(
                        product.mrp -
                          (product.mrp * (product.discount || 0)) / 100
                      )}
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

export default CartProductSlider;
