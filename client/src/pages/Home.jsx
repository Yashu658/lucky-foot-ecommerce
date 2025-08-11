import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Container from "../components/Container";
import axios from "../config/api";
import back from "../assets/back.jpeg";
import mens from "../assets/mens.jpg";
import womens from "../assets/womens.webp";
import kids from "../assets/kids.jpg";
import ViewProductMod from "./ViewProductMod";
import RecentViewSlider from "./Slider/RecentViewSlider";
import WishlistSlider from "./Slider/WishlistSlider";
import CartProductSlider from "./Slider/CartProductSlider";
import FilterButton from "./Buttons/FilterButton";
import OfferSection from "./OfferSection";
import PopupOfferModal from "./PopupOfferModal";
import { useCart } from "../context/CartContext";
import { FiHeart } from "react-icons/fi";
import { BsHeartFill } from "react-icons/bs";
import { toast } from "react-toastify";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState("view");
  const [wishlist, setWishlist] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [offers, setOffers] = useState({
    slider: [],
    page: [],
    popup: [],
  });
  const [offersLoading, setOffersLoading] = useState(true);
  const { addToCart } = useCart();

  const navigate = useNavigate();

  // ✅ Buy product without adding to cart
  const buyProduct = (product) => {
    setSelectedProduct(product);
    setModalAction("buy"); // distinguish this is for buying
    setIsViewModalOpen(true);
  };

  useEffect(() => {
    const userData = JSON.parse(sessionStorage.getItem("user"));
    if (userData && userData._id) {
      setUserId(userData._id);
    }
  }, []);

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const response = await axios.get("/api/admin/getAllProduct", {
          params: {
            status: "active", // Explicitly request active product
          },
        });
        setProducts(response.data.products);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        toast.error("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchAllProducts();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchWishlist();
    }
  }, [userId]);

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

  

 

  const fetchAllActiveOffers = async () => {
    try {
      const response = await axios.get("/api/active");
      //console.log("API Response:", response.data);
      if (response.data.success) {
        const allOffers = response.data.offers || [];

        // Group offers by type
        const groupedOffers = {
          slider: allOffers.filter((o) => o.offerType === "slider"),
          page: allOffers.filter((o) => o.offerType === "page"),
          popup: allOffers.filter((o) => o.offerType === "popup"),
        };

       // console.log("Grouped Offers:", groupedOffers); 
        setOffers(groupedOffers);
      }
    } catch (error) {
      console.error("Failed to fetch offers:", error);
      toast.error("Failed to load offers");
    } finally {
      setOffersLoading(false);
    }
  };
  useEffect(() => {
    fetchAllActiveOffers();
  }, []);



  // const openProductModal = (product) => {
  //   setSelectedProduct(product);
  //   setModalAction("view"); // for viewing only
  //   setIsViewModalOpen(true);
  // };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <img
          src={back}
          alt="Hero Background"
          className="absolute inset-0 w-full h-full object-cover brightness-75"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-transparent"></div>
        <Container>
          <div className="relative z-10 flex flex-col items-center justify-center text-center h-[65vh] max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-extrabold text-white drop-shadow-lg mb-6 leading-tight">
              Lucky Footwear
            </h1>
            <p className="text-2xl md:text-3xl text-white mb-10 font-semibold tracking-wide">
              Wear your Luck
            </p>
            <Link
              to="/sale"
              className="inline-block bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-12 py-4 rounded-full font-semibold shadow-lg hover:from-indigo-600 hover:to-blue-700 transition-transform duration-300 transform hover:scale-105"
            >
              Shop Now
            </Link>
          </div>
        </Container>
      </section>

      {/* Categories Section */}
      <section className="py-20">
        <Container>
          <h2 className="text-4xl font-extrabold text-gray-900 text-center mb-16 tracking-tight">
            Shop by Category
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { to: "/men", label: "Men", image: mens },
              { to: "/women", label: "Women", image: womens },
              { to: "/kids", label: "Kids", image: kids },
            ].map(({ to, label, image }) => (
              <Link
                to={to}
                key={label}
                className="group relative rounded-xl overflow-hidden shadow-lg cursor-pointer transform transition-transform duration-500 hover:scale-105"
              >
                <img
                  src={image}
                  alt={`${label} Collection`}
                  className="w-full h-96 object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex items-center justify-center">
                  <span className="text-4xl font-extrabold text-white tracking-wide drop-shadow-lg">
                    {label}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>
      <div className="sticky top-20 z-50 bg-gray-50 py-4 px-6 shadow-sm flex justify-end">
        <FilterButton />
      </div>

      {/* Offers Section */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-16">
        <div className="max-w-7xl mx-auto  px-4 sm:px-6 lg:px-8">
          {/* Section Heading */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-gray-900">
              💥 Hot Deals &{" "}
              <span className="text-blue-600">Exclusive Offers</span>
            </h2>
            <p className="mt-4 text-gray-600 text-lg max-w-2xl mx-auto">
              Hand-picked promotions, limited-time discounts, and trending
              products just for you.
            </p>
          </div>

         {/* Offers Grid - updated to better center content */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto px-4">
  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 ">
    <OfferSection
      title="🎉 Special Offers"
      offers={offers.slider}
      loading={offersLoading}
    />
  </div>
  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
    <OfferSection
      title="🔥 Featured Deals"
      offers={offers.page}
      loading={offersLoading}
    />
  </div>
</div>

          {/* Popup Offer Modal */}
          {offers.popup.length > 0 && !offersLoading && (
            <PopupOfferModal offer={offers.popup[0]} />
          )}
        </div>
      </section>

      <div>
        <RecentViewSlider />
      </div>
      <div>
        <WishlistSlider />
      </div>
      {/* Featured Products Section */}
      <section className="bg-white py-20">
        <Container>
          <h2 className="text-4xl font-extrabold text-gray-900 text-center mb-16 tracking-tight">
            Featured Collection
          </h2>

          {loading ? (
            <p className="text-center text-blue-600 text-lg font-semibold">
              Loading products...
            </p>
          ) : products.length === 0 ? (
            <p className="text-center text-red-500 text-lg font-semibold">
              No products available.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {products
                .filter((product) => product.status === "active")
                .map((product) => (
                  <Link
                    to={`/product/${product.productId?._id || product._id}`}
                    key={product._id}
                    className="bg-gray-50 rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-2xl transform hover:scale-[1.03] transition duration-300 flex flex-col"
                  >
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
                    {product.image?.[0] && (
                      <img
                        src={product.image[0]}
                        alt={product.name}
                        className="aspect-square object-cover w-full"
                      />
                    )}
                    <div className="p-5 bg-white flex-grow">
                      <h3 className="text-xl font-semibold text-blue-700 mb-2 truncate">
                        {product.name}
                      </h3>
                      <p className="text-lg font-bold text-indigo-600">
                        ₹{product.mrp.toLocaleString()}
                      </p>
                    </div>

                    {/* Buttons */}
                    <div className="p-4 bg-gray-100 flex space-x-3">
                      <button
                        onClick={(e) => {
                          e.preventDefault(); //prevent navigation
                          e.stopPropagation();
                          addToCart(product);
                        }}
                        className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
                        type="button"
                      >
                        Add to Cart
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault(); //prevent navigation
                          e.stopPropagation();
                          buyProduct(product);
                        }}
                        className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
                        type="button"
                      >
                        Buy
                      </button>
                    </div>
                  </Link>
                ))}
            </div>
          )}
          <ViewProductMod
            isOpen={isViewModalOpen}
            onClose={() => setIsViewModalOpen(false)}
            product={selectedProduct}
            action={modalAction}
          />
        </Container>
        <div>
          <CartProductSlider />
        </div>
      </section>
    </div>
  );
};

export default Home;
