import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../config/api";
import Container from "../components/Container";
import ViewProductMod from "./ViewProductMod";
import FilterButton from "./Buttons/FilterButton";
import { useCart } from "../context/CartContext";
import { FiHeart, FiShoppingBag, FiEye } from "react-icons/fi";
import { BsHeartFill, BsStarFill } from "react-icons/bs";
import { FaFire } from "react-icons/fa";
import { toast } from "react-toastify";

const Men = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState("view");
  const [userId, setUserId] = useState(null);

  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(sessionStorage.getItem("user"));
    if (userData && userData._id) setUserId(userData._id);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          "/api/admin/getAllProduct?gender=Men,Unisex&status=active"
        );

        const productsWithRatings = await Promise.all(
          response.data.products.map(async (product) => {
            try {
              const ratingRes = await axios.get(
                `/api/reviews/average/${product._id}`
              );
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

        setProducts(productsWithRatings);
      } catch (err) {
        toast.error("Failed to load products");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (!userId) return;
    const fetchWishlist = async () => {
      try {
        const { data } = await axios.get("/api/wishlist");
        if (data.success) {
          const ids = data.products.map((p) => p._id.toString());
          setWishlist(ids);
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to load wishlist"
        );
      }
    };
    fetchWishlist();
  }, [userId]);

  const toggleWishlist = async (e, productId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!userId) {
      toast.error("Please login to use wishlist");
      return navigate("/login");
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <main className="bg-gray-50 min-h-screen">
      {/* Filter & Heading */}
      <section className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-8xl px-8 mx-auto py-4 flex items-center justify-between">
        
          <div className="flex items-center space-x-4">
            
            <FilterButton />
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="py-8">
        <Container>
          {products.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              No products found.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6">
              {products.map((product) => (
                <Link
                  to={`/product/${product.productId?._id || product._id}`}
              key={product._id}
                  className="bg-white rounded-lg shadow hover:shadow-md transition relative overflow-hidden"
                >
                  {/* Badges */}
                  {product.discount > 0 && (
                    <span className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1 z-10">
                      <FaFire /> {product.discount}% OFF
                    </span>
                  )}

                  {/* Wishlist */}
                  <button
                    onClick={(e) => {
                      if (!wishlistLoading) toggleWishlist(e, product._id);
                    }}
                    className="absolute top-2 right-2 z-10 bg-white p-1.5 rounded-full shadow hover:bg-gray-50"
                  >
                    {wishlist.includes(product._id) ? (
                      <BsHeartFill className="text-red-500 text-lg" />
                    ) : (
                      <FiHeart className="text-gray-500 text-lg" />
                    )}
                  </button>

                  {/* Image */}
                  <div
                    className="relative cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      openProductModal(product);
                    }}
                  >
                    <img
                      src={product.image?.[0] || "/placeholder-product.jpg"}
                      alt={product.name}
                      className="w-full aspect-square object-cover"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mb-1">
                      {product.name}
                    </h3>
                    <div className="flex items-center mb-1 text-yellow-400 text-xs">
                      {[...Array(5)].map((_, i) => (
                        <BsStarFill
                          key={i}
                          className={i < Math.floor(product.averageRating) ? "text-yellow-400" : "text-gray-200"}
                        />
                      ))}
                      {product.ratingCount > 0 && (
                        <span className="text-xs text-gray-500 ml-1">({product.ratingCount})</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1 items-center text-sm">
                      <span className="font-bold text-gray-900">₹{Math.round(
                        product.salePrice || product.mrp * (1 - product.discount / 100)
                      )}</span>
                      {product.discount > 0 && (
                        <>
                          <span className="text-xs line-through text-gray-500">₹{product.mrp}</span>
                          <span className="text-xs text-green-600 font-medium">
                            Save ₹{Math.round(
                              product.mrp - (product.salePrice || product.mrp * (1 - product.discount / 100))
                            )}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-4 pt-0 flex gap-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        addToCart(product);
                      }}
                      className="flex-1 bg-blue-600 text-white text-xs py-2 rounded hover:bg-blue-700 flex items-center justify-center gap-1"
                    >
                      <FiShoppingBag className="text-base" /> Cart
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        buyProduct(product);
                      }}
                      className="flex-1 bg-green-600 text-white text-xs py-2 rounded hover:bg-green-700 flex items-center justify-center gap-1"
                    >
                      <FiEye className="text-base" /> Buy
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Container>
      </section>

      {/* View Modal */}
      <ViewProductMod
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        product={selectedProduct}
        action={modalAction}
      />
    </main>
  );
};

export default Men;
