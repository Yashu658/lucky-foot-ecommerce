import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../config/api';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { FiHeart } from 'react-icons/fi';
import { BsHeartFill, BsStarFill } from 'react-icons/bs';
import { FaChevronLeft, FaChevronRight, FaFire } from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/authContext';
import { toast } from 'react-toastify';

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

const RelatedProductsSlider = ({ currentProductId, gender, category, subCategory }) => {
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const { addToCart } = useCart();
  const { user } = useAuth();

  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
     slidesToShow: 4,
    slidesToScroll: 1,
    centerMode: relatedProducts.length < 4,
    centerPadding: relatedProducts.length < 4 ? "40px" : "0", 
    variableWidth: false,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      {
        breakpoint: 1024,
       settings: {
        slidesToShow: Math.min(3, relatedProducts.length),
        centerMode: relatedProducts.length < 3,
        centerPadding: relatedProducts.length < 3 ? "30px" : "0",
      }
      },
      {
        breakpoint: 768,
        settings: {
        slidesToShow: Math.min(2, relatedProducts.length),
        centerMode: relatedProducts.length < 2,
        centerPadding: relatedProducts.length < 2 ? "20px" : "0",
      }
      },
      {
        breakpoint: 480,
             settings: {
        slidesToShow: 1,
        centerMode: true,
        centerPadding: "20px"
      }

      }
    ]
  };

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `/api/admin/getAllProduct?gender=${gender}&category=${category}&subCategory=${subCategory}&status=active&exclude=${currentProductId}`
        );
        const filteredProducts = response.data.products
          .filter(p => p._id !== currentProductId)
          .slice(0, 8);

        const productsWithRatings = await Promise.all(
          filteredProducts.map(async (product) => {
            try {
              const ratingRes = await axios.get(`/api/reviews/average/${product._id}`);
              return {
                ...product,
                averageRating: ratingRes.data.averageRating || 0,
                ratingCount: ratingRes.data.count || 0,
              };
            } catch {
              return { ...product, averageRating: 0, ratingCount: 0 };
            }
          })
        );

        setRelatedProducts(productsWithRatings);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load related products');
      } finally {
        setLoading(false);
      }
    };

    if (gender && category && subCategory) {
      fetchRelatedProducts();
    }
  }, [currentProductId, gender, category, subCategory]);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user?._id) return;
      try {
        const { data } = await axios.get('/api/wishlist');
        if (data.success) {
          setWishlist(data.products.map(p => p._id));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchWishlist();
  }, [user]);

  const toggleWishlist = async (e, productId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return toast.error('Please login to use wishlist');

    setWishlistLoading(true);
    try {
      if (wishlist.includes(productId)) {
        await axios.delete(`/api/wishlist/remove/${productId}`);
        setWishlist(prev => prev.filter(id => id !== productId));
        toast.success('Removed from wishlist');
      } else {
        await axios.post(`/api/wishlist/add/${productId}`);
        setWishlist(prev => [...prev, productId]);
        toast.success('Added to wishlist');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Wishlist operation failed');
    } finally {
      setWishlistLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-8">
        <h3 className="text-xl font-bold mb-6">Loading related products...</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-lg h-64 animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (relatedProducts.length === 0) return null;

  const renderProductCard = (product) => {
    const discountedPrice = product.mrp - (product.mrp * (product.discount || 0)) / 100;
    return (
      <div key={product._id} className="px-2" style={{ width: 220 }}>
        <Link
          to={`/product/${product._id}`}
          className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden h-full flex flex-col"
          style={{ height: 380 }}
        >
          <div className="relative pt-[100%] overflow-hidden">
            <img
              src={product.image?.[0] || '/placeholder-product.jpg'}
              alt={product.name}
              className="absolute top-0 left-0 w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
            {product.discount > 0 && (
              <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full z-10 flex items-center">
                <FaFire className="mr-1" /> {product.discount}% OFF
              </div>
            )}
            <button
              onClick={(e) => toggleWishlist(e, product._id)}
              className="absolute top-2 right-2 z-10 p-2 bg-white rounded-full shadow hover:bg-gray-50 transition"
              disabled={wishlistLoading}
            >
              {wishlist.includes(product._id) ? (
                <BsHeartFill className="text-red-500 text-lg" />
              ) : (
                <FiHeart className="text-gray-500 text-lg" />
              )}
            </button>
          </div>
          <div className="p-4 flex-grow flex flex-col">
            <h4 className="text-sm font-semibold text-gray-800 mb-1 hover:text-blue-600 transition whitespace-nowrap overflow-hidden text-ellipsis">
              {product.name}
            </h4>
            <div className="flex items-center mb-2">
              <div className="flex items-center text-yellow-400 text-xs">
                {[...Array(5)].map((_, i) => (
                  <BsStarFill
                    key={i}
                    className={i < Math.floor(product.averageRating) ? "text-yellow-400" : "text-gray-200"}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500 ml-1">({product.ratingCount})</span>
            </div>
            <div className="mt-auto">
              <div className="flex items-center flex-wrap gap-1">
                <span className="text-base font-bold text-gray-900">₹{discountedPrice.toFixed(0)}</span>
                {product.discount > 0 && (
                  <span className="text-xs text-gray-500 line-through">₹{product.mrp}</span>
                )}
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  addToCart({
                    ...product,
                    selectedSize: product.size?.[0]?.size,
                    quantity: 1,
                    price: discountedPrice,
                  });
                  toast.success(`${product.name} added to cart`);
                }}
                className="mt-3 w-full py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition flex items-center justify-center gap-1"
              >
                <span>Add to Cart</span>
              </button>
            </div>
          </div>
        </Link>
      </div>
    );
  };

  return (
    <div className="py-8 px-4">
      <h3 className="text-2xl font-bold mb-6 text-gray-800">You May Also Like</h3>
      {relatedProducts.length === 1 ? (
        <div className="flex ">
          {renderProductCard(relatedProducts[0])}
        </div>
      ) : (
        <Slider {...sliderSettings} className="px-2">
          {relatedProducts.map(renderProductCard)}
        </Slider>
      )}
    </div>
  );
};

export default RelatedProductsSlider;
