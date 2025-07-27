import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "../config/api";
import Container from "../components/Container";
import ViewProductMod from "./ViewProductMod";
import FilterButton from "./Buttons/FilterButton";
import { useCart } from "../context/CartContext";
import { FiHeart } from "react-icons/fi";
import { BsHeartFill } from "react-icons/bs";
import { toast } from "react-toastify";

const ShopPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState("view");
  const [userId, setUserId] = useState(null);
  const [searchParams] = useSearchParams();

  const { addToCart } = useCart();

  // Load user ID from sessionStorage
  useEffect(() => {
    const userData = JSON.parse(sessionStorage.getItem("user"));
    if (userData && userData._id) {
      setUserId(userData._id);
    }
  }, []);

  // Fetch products on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("/api/admin/getAllProduct?status=active");
        const allProducts = response.data.products;
        setProducts(allProducts);

        // Get product IDs from URL parameters
        const offerProductsParam = searchParams.get("offerProducts");
        if (offerProductsParam) {
          const offerProductIds = offerProductsParam.split(",");
          const filtered = allProducts.filter(product => 
            offerProductIds.includes(product._id)
          );
          setFilteredProducts(filtered);
        } else {
          setFilteredProducts(allProducts);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        toast.error("Failed to load products");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [searchParams]);

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
        } else {
          console.error("Wishlist fetch error:", error);
          toast.error("Failed to load wishlist");
        }
      }
    };
    if (userId) {
      fetchWishlist();
    }
  }, [userId]);

  // Wishlist toggle handler
  const toggleWishlist = async (e, productId) => {
    e.stopPropagation();

    if (!userId) {
      toast.error("Please login to use wishlist");
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
      toast.error(
        error.response?.data?.message || "Wishlist operation failed"
      );
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

  if (loading) return <p className="text-center py-10">Loading products...</p>;
  if (filteredProducts.length === 0) return <p className="text-center py-10">No products found.</p>;

  return (
    <div>
    <div className="sticky top-20 z-50 bg-white py-4 px-6 shadow-sm flex justify-between items-center border-b border-gray-200">
  <h1 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-2">
    {filteredProducts.length !== products.length ? (
      <>
        <span role="img" aria-label="tag">🏷️</span> 
        Special Offer
      </>
    ) : (
      <>
        <span role="img" aria-label="grid">🛍️</span> 
        All Products
      </>
    )}
  </h1>
  <FilterButton />
</div>

      
      <Container className="space-y-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Link
              to={`/product/${product.productId?._id || product._id}`}
              key={product._id}
              className="relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer flex flex-col"
            >
              {/* Wishlist Icon */}
              <div
                className="absolute top-2 right-2 z-10"
                onClick={(e) => {
                  if (!wishlistLoading) toggleWishlist(e, product._id);
                }}
              >
                {wishlist.includes(product._id) ? (
                  <BsHeartFill className="text-red-500 text-2xl" />
                ) : (
                  <FiHeart className="text-white text-2xl bg-black/20 rounded-full p-1" />
                )}
              </div>

              <div
                onClick={() => openProductModal(product)}
                className="flex-grow"
              >
                {product.image && product.image.length > 0 && (
                  <img
                    src={product.image[0]}
                    alt={product.name}
                    className="aspect-square object-cover w-full"
                  />
                )}
                <div className="p-4 bg-gray-100">
                  <h3 className="text-lg font-semibold text-blue-700">
                    {product.name}
                  </h3>
                  <p className="text-blue-700">₹{product.mrp}</p>
                </div>
              </div>

              {/* Buttons: Add to Cart and Buy */}
              <div className="flex space-x-2 p-4 bg-gray-50">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    addToCart(product);
                  }}
                  className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
                >
                  Add to Cart
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    buyProduct(product);
                  }}
                  className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
                >
                  Buy
                </button>
              </div>
            </Link>
          ))}
        </div>

        <ViewProductMod
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          product={selectedProduct}
          action={modalAction}
        />
      </Container>
    </div>
  );
};

export default ShopPage; 