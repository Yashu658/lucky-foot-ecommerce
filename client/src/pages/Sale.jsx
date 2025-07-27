import React, { useEffect, useState } from "react";
import Container from "../components/Container";
import axios from "../config/api";
import ViewProductMod from "./ViewProductMod";
import FilterButton from "./Buttons/FilterButton";
import SortBy from "./Buttons/SortBy";
import useSorting from "./Buttons/Customhooks/useSorting";
import { useCart } from "../context/CartContext";
import { useNavigate, Link } from "react-router-dom";
import { FiHeart , FiGrid, FiList} from "react-icons/fi";
import { BsHeartFill, BsStarFill, BsStarHalf, BsStar } from "react-icons/bs";
import { FaFire } from "react-icons/fa";
import { toast } from "react-toastify";

const Sale = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState("view");
  const [userId, setUserId] = useState(null);
   const [viewMode, setViewMode] = useState("grid"); 
    const [sortLoading, setSortLoading] = useState(false);
  const { sortOption, setSortOption, getSortParam, sortOptions,debouncedSortOption } = useSorting('updated');

  const { addToCart } = useCart();
  const navigate = useNavigate();

  // Load user ID from sessionStorage
  useEffect(() => {
    const userData = JSON.parse(sessionStorage.getItem('user'));
    if (userData && userData._id) {
      setUserId(userData._id);
    }
  }, []);

  // Fetch sale products on mount
useEffect(() => {
  const fetchProducts = async () => {
    setSortLoading(true);
    try {
      const updatedAfterDate = new Date();
      updatedAfterDate.setDate(updatedAfterDate.getDate() - 7); // last 7 days

      const response = await axios.get(
        `/api/admin/getAllProduct?sale=true&status=active&updatedAfter=${updatedAfterDate.toISOString()}${getSortParam()}`
      );
      setProducts(response.data.products);
      
    } catch (err) {
      console.error("Fetch error:", err);
    toast.error(`Failed to load products: ${err.response?.data?.message || err.message}`);
    } finally {
      setSortLoading(false);
      setLoading(false);
    }
  };
  fetchProducts();
}, [sortOption]);

  // Fetch wishlist when userId is available
  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const { data } = await axios.get(`/api/wishlist`);
        if (data.success) {
          const productIds = data.products.map((item) =>
            item._id ? item._id.toString() : item.toString()
          );
          setWishlist(productIds);
        } else {
          setWishlist([]);
        }
      } catch (error) {
        if (error.response?.status === 401) {
          toast.error("Please login to use wishlist");
          navigate("/login");
        } else {
          console.error("Wishlist fetch error:", error);
          toast.error("Failed to load wishlist");
        }
      }
    };
    if (userId) {
      fetchWishlist();
    }
  }, [userId, navigate]);

  // Wishlist toggle handler
  const toggleWishlist = async (e, productId) => {
    e.stopPropagation();

    if (!userId) {
      toast.error("Please login to use wishlist");
      navigate("/login");
      return;
    }

    setWishlistLoading(true);

    try {
      if (wishlist.some((id) => id.toString() === productId.toString())) {
        // Remove from wishlist
        await axios.delete(`/api/wishlist/remove/${productId}`);
        setWishlist((prev) =>
          prev.filter((id) => id.toString() !== productId.toString())
        );
        toast.success("Removed from wishlist");
      } else {
        // Add to wishlist
        await axios.post(`/api/wishlist/add/${productId}`);
        setWishlist((prev) => [...prev, productId]);
        toast.success("Added to wishlist");
      }
    } catch (error) {
      console.error("Wishlist operation failed:", error);
      if (error.response?.status === 401) {
        toast.error("Please login to use wishlist");
        navigate("/login");
      } else {
        toast.error(
          error.response?.data?.message || "Wishlist operation failed"
        );
      }
    } finally {
      setWishlistLoading(false);
    }
  };

  const openProductModal = (product) => {
    setSelectedProduct(product);
    setModalAction("view");
    setIsViewModalOpen(true);
  };

  const buyProduct = (product) => {
    setSelectedProduct(product);
    setModalAction("buy");
    setIsViewModalOpen(true);
  };

    const renderRatingStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<BsStarFill key={i} className="text-yellow-400" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<BsStarHalf key={i} className="text-yellow-400" />);
      } else {
        stars.push(<BsStar key={i} className="text-yellow-400" />);
      }
    }
    
    return stars;
  };

  const renderProductGrid = () => (
    <>
      {sortLoading && (
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
        <div className="h-full bg-red-600 animate-pulse"></div>
      </div>
    )}
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {products.map((product) => (
        <div
          key={product._id}
          className="relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col group"
        >
          {/* Sale Badge */}
          {product.discount > 0 && (
            <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded z-10 flex items-center">
              <FaFire className="mr-1" /> {product.discount}% OFF
            </div>
          )}

          {/* Wishlist Button */}
          <button
            className="absolute top-2 right-2 z-10 p-2 bg-white/80 rounded-full hover:bg-red-100 transition"
            onClick={(e) => {
              e.preventDefault();
              if (!wishlistLoading) toggleWishlist(e, product._id);
            }}
            aria-label={wishlist.includes(product._id) ? "Remove from wishlist" : "Add to wishlist"}
          >
            {wishlist.includes(product._id) ? (
              <BsHeartFill className="text-red-500 text-lg" />
            ) : (
              <FiHeart className="text-gray-600 text-lg" />
            )}
          </button>

          {/* Product Image */}
          <Link
            to={`/product/${product.productId?._id || product._id}`}
            className="flex-grow relative overflow-hidden"
          >
            {product.image && product.image.length > 0 && (
              <>
                <img
                  src={product.image[0]}
                  alt={product.name}
                  className="w-full h-60 object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {product.image[1] && (
                  <img
                    src={product.image[1]}
                    alt={product.name}
                    className="absolute inset-0 w-full h-60 object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  />
                )}
              </>
            )}
          </Link>

          {/* Product Info */}
          <div className="p-4 flex flex-col flex-grow">
            <Link
              to={`/product/${product.productId?._id || product._id}`}
              className="block"
            >
              <h3 className="text-sm font-semibold text-gray-800 mb-1 line-clamp-2 hover:text-red-600 transition">
                {product.name}
              </h3>
              <div className="flex items-center mb-2">
                {renderRatingStars(product.averageRating || 0)}
                <span className="text-xs text-gray-500 ml-1">
                  ({product.reviewCount || 0})
                </span>
              </div>
            </Link>

            <div className="mt-auto">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold text-gray-900">
                    ₹{product.salePrice || product.mrp}
                  </p>
                  {product.discount > 0 && (
                    <p className="text-xs text-gray-500 line-through">
                      ₹{product.mrp}
                    </p>
                  )}
                </div>
                <div className="text-xs text-green-600 font-medium">
                  {product.size && product.size.length > 0 && (
                    <span>{product.size.length} sizes</span>
                  )}
                </div>
              </div>

              <div className="mt-3 flex space-x-2">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    addToCart(product);
                    //toast.success(`${product.name} added to cart`);
                  }}
                  className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700 transition text-sm font-medium"
                >
                  Add to Cart
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    buyProduct(product);
                  }}
                  className="flex-1 bg-gray-900 text-white py-2 rounded hover:bg-gray-800 transition text-sm font-medium"
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
    </>
    
  );

  const renderProductList = () => (
    <div className="space-y-4">
      {products.map((product) => (
        <div
          key={product._id}
          className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col md:flex-row"
        >
          {/* Product Image */}
          <Link
            to={`/product/${product.productId?._id || product._id}`}
            className="md:w-1/4 lg:w-1/5 relative"
          >
            {product.image && product.image.length > 0 && (
              <img
                src={product.image[0]}
                alt={product.name}
                className="w-full h-48 md:h-full object-cover rounded-t-lg md:rounded-l-lg md:rounded-tr-none"
              />
            )}
            {product.discount > 0 && (
              <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                {product.discount}% OFF
              </div>
            )}
          </Link>

          {/* Product Details */}
          <div className="p-4 flex-1 flex flex-col">
            <div className="flex justify-between">
              <div>
                <Link
                  to={`/product/${product.productId?._id || product._id}`}
                  className="block"
                >
                  <h3 className="text-lg font-semibold text-gray-800 hover:text-red-600 transition">
                    {product.name}
                  </h3>
                </Link>
                <div className="flex items-center mt-1">
                  {renderRatingStars(product.averageRating || 0)}
                  <span className="text-xs text-gray-500 ml-1">
                    ({product.reviewCount || 0} reviews)
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                  {product.description?.overview || "No description available"}
                </p>
              </div>

              <button
                className="h-fit p-2 bg-white rounded-full hover:bg-red-100 transition self-start"
                onClick={(e) => {
                  e.preventDefault();
                  if (!wishlistLoading) toggleWishlist(e, product._id);
                }}
                aria-label={wishlist.includes(product._id) ? "Remove from wishlist" : "Add to wishlist"}
              >
                {wishlist.includes(product._id) ? (
                  <BsHeartFill className="text-red-500 text-lg" />
                ) : (
                  <FiHeart className="text-gray-600 text-lg" />
                )}
              </button>
            </div>

            <div className="mt-auto pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xl font-bold text-gray-900">
                    ₹{product.salePrice || product.mrp}
                  </p>
                  {product.discount > 0 && (
                    <p className="text-sm text-gray-500 line-through">
                      ₹{product.mrp}
                    </p>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  {product.size && product.size.length > 0 && (
                    <span>Available in {product.size.length} sizes</span>
                  )}
                </div>
              </div>

              <div className="mt-4 flex space-x-3">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    addToCart(product);
                    toast.success(`${product.name} added to cart`);
                  }}
                  className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition font-medium"
                >
                  Add to Cart
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    buyProduct(product);
                  }}
                  className="px-6 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 transition font-medium"
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  if (loading)
    return (
      <Container className="space-y-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-200 rounded-lg h-96 animate-pulse"
            ></div>
          ))}
        </div>
      </Container>
    );

  if (!loading && products.length === 0)
    return (
      <Container className="space-y-6 py-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Sale Collection</h1>
        <p className="text-gray-600">No active sale products found.</p>
        <Link to="/" className="text-red-600 hover:underline">
          Continue Shopping
        </Link>
      </Container>
    );

  return (
    <div>
   <div className="sticky top-20 z-50 bg-gray-50 py-4 px-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
  {/* View toggle - LEFT SIDE */}
  <div className="flex items-center space-x-2">
    <span className="text-xl font-bold text-gray-900 hidden sm:inline">View:</span>
    <button
      onClick={() => setViewMode("grid")}
      className={`p-2 rounded ${viewMode === "grid" ? "bg-gray-200 text-gray-900" : "text-gray-500 hover:bg-gray-100"}`}
      aria-label="Grid view"
    >
      <FiGrid className="text-lg" />
    </button>
    <button
      onClick={() => setViewMode("list")}
      className={`p-2 rounded ${viewMode === "list" ? "bg-gray-200 text-gray-900" : "text-gray-500 hover:bg-gray-100"}`}
      aria-label="List view"
    >
      <FiList className="text-lg" />
    </button>
    <span className="text-sm text-gray-500">Total {products.length} products</span>
  </div>
  

  {/* Sort and Filter - RIGHT SIDE */}
   <div className="flex items-center justify-end gap-6">
          <SortBy 
            value={sortOption}
            onChange={setSortOption}
            options={sortOptions}
            className="mr-4 text-xl font-bold"
          />
          <FilterButton />
        </div>
</div>


      <Container className="py-8">
        {viewMode === "grid" ? renderProductGrid() : renderProductList()}
      </Container>

      <ViewProductMod
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        product={selectedProduct}
        action={modalAction}
      />
    </div>
  );
};

export default Sale;
