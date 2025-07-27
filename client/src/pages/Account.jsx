import { useState, useEffect } from "react";
import Container from "../components/Container";
import { RxExit } from "react-icons/rx";
import { FiEdit2 } from "react-icons/fi";
import {
  FaTrash,
  FaHeart,
  FaBoxOpen,
  FaMapMarkerAlt,
  FaQuestionCircle,
} from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import axios from "../config/api";
import { useAuth } from "../context/authContext";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import Order from "./Order";
import Wishlist from "./Wishlist";
import { useCart } from "../context/CartContext";
import { HiChatBubbleLeftRight } from "react-icons/hi2";

const Account = () => {
  const { user, setUser } = useAuth();
  const location = useLocation();
  const { setCart } = useCart();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeTab, setActiveTab] = useState(
    location.state?.tab || "My Account"
  );
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [showGettingStarted, setShowGettingStarted] = useState(false);
  const [showSupportDetails, setShowSupportDetails] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);

  const navigate = useNavigate();

  const tab = location.state?.tab || "default";
  useEffect(() => {
    if (activeTab === "addresses") {
      axios
        .get("/api/addresses")
        // .then((res) => setSavedAddresses(res.data.addresses)) // instead of res.data
        .then((res) => {
          if (res.data.success) {
            setSavedAddresses(res.data.addresses);
            // Also save to session storage for PlaceOrder to use
            sessionStorage.setItem(
              "saved_addresses",
              JSON.stringify(res.data.addresses)
            );
          }
        })

        .catch((err) => {
          console.error(err);
          toast.error("Could not load addresses");
        });
    }
  }, [activeTab]);

  const handelLogout = async () => {
    const confirmed = window.confirm("Are you sure you want to logout?");
    if (!confirmed) return; // user cancelled, so do nothing

    try {
      const res = await axios.get("/api/auth/logout");
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("cart"); // ✅ Clear guest cart from localStorage
      setCart([]); // ✅ Clear cart state
      setUser(null);
      toast.success(res.data.message);
      window.location.href = "/";
    } catch (error) {
      console.error(error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleDeleteAccount = async () => {
    try {
      const res = await axios.delete("/api/auth/delete");
      sessionStorage.removeItem("user");
      setUser(null);
      toast.success(res.data.message);
      window.location.href = "/";
    } catch (error) {
      console.error(error);
      alert("Failed to delete account");
    }
  };

  const handleEditAddress = (addr) => {
    navigate("/edit-address", { state: { address: addr } });
  };

  const handleDeleteAddress = async (id) => {
    try {
      await axios.delete(`/api/addresses/${id}`);
      setSavedAddresses((prev) => prev.filter((addr) => addr._id !== id));
      toast.success("Address deleted");
    } catch (error) {
      toast.error("Failed to delete address");
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "My Account":
        return (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6 bg-gradient-to-r from-blue-50 to-white p-6 rounded-lg shadow-md">
                <div>
                  <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
                    Email
                  </h3>
                  <p className="text-gray-900 text-lg font-semibold">
                    {user.email}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
                    Phone
                  </h3>
                  <p className="text-gray-900 text-lg font-semibold">
                    {user.phone}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
                    Date of Birth
                  </h3>
                  <p className="text-gray-900 text-lg font-semibold">
                    {formatDate(user.dob)}
                  </p>
                </div>
              </div>

              <div className="space-y-6 bg-gradient-to-r from-purple-50 to-white p-6 rounded-lg shadow-md">
                <div>
                  <h3 className="text-sm font-semibold text-purple-600 uppercase tracking-wide">
                    Gender
                  </h3>
                  <p className="text-gray-900 text-lg font-semibold">
                    {user.gender}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-purple-600 uppercase tracking-wide">
                    Account Status
                  </h3>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                      user.status === "Active"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {user.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-gray-300 flex gap-8">
              <button
                className="flex items-center gap-2 text-white bg-blue-600 hover:bg-blue-700 font-semibold px-5 py-3 rounded-lg shadow-lg transition-all duration-300"
                onClick={() => navigate("/update")}
              >
                <FiEdit2 size={18} /> Edit Profile
              </button>
              <button
                className="flex items-center gap-2 text-white bg-red-600 hover:bg-red-700 font-semibold px-5 py-3 rounded-lg shadow-lg transition-all duration-300"
                onClick={() => setShowDeleteModal(true)}
              >
                <FaTrash size={18} /> Delete Account
              </button>
            </div>
          </div>
        );

      case "orders":
        return <Order />;

      case "wishlist":
        return <Wishlist />;

      case "addresses":
        return (
          <div className="space-y-6">
            <div className="flex justify-end mb-4">
              <button
                onClick={() =>
                  navigate("/edit-address", { state: { from: "account" } })
                }
                className="px-5 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                Add New Address
              </button>
            </div>

            {savedAddresses.length === 0 ? (
              <p className="text-gray-700">No saved addresses yet.</p>
            ) : (
              savedAddresses.map((addr, index) => (
                <div
                  key={addr._id}
                  className="p-5 border border-gray-300 rounded-xl shadow-sm bg-white"
                >
                  <h3 className="text-lg font-bold text-indigo-700">
                    Address {index + 1}
                  </h3>
                  <p className="text-gray-800">{addr.homeNumber},</p>
                  <p className="text-gray-800">{addr.street}</p>
                  <p className="text-gray-600">{addr.landmark}</p>
                  <p className="text-gray-600">{addr.city}</p>
                  <p className="text-gray-600">{addr.state}</p>
                  <p className="text-gray-600">{addr.zip}</p>
                  <p className="text-gray-600">{addr.phone}</p>
                  <div className="flex justify-between">
                    <button
                      onClick={() => handleEditAddress(addr)}
                      className="text-green-600 text-xl font-semibold hover:underline mt-2 "
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteAddress(addr._id)}
                      className="text-red-600 text-lg  font-semibold hover:underline mt-2"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        );

      case "help":
        return (
          <div className="p-6 bg-white shadow-lg rounded-2xl text-gray-800">
            <h2 className="text-2xl font-bold text-green-600 mb-4 flex items-center gap-2">
              
              Help Center
            </h2>
            <a
              href="https://wa.link/x3byjl"
              target="_blank"
              rel="noopener noreferrer"
              className="fixed bottom-90 right-90 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition cursor-pointer z-50"
            >
              <HiChatBubbleLeftRight className="w-6 h-6" />
            </a>

            <p className="mb-6 text-lg">
              Find answers to common questions, reach out for support, or learn
              more about how to use our service.
            </p>

            <div className="space-y-4">
              <div
                onClick={() => navigate("/faq")}
                className="bg-gray-50 p-4 rounded-xl border border-gray-200 hover:shadow-md transition cursor-pointer"
              >
                <h3 className="text-lg font-semibold text-gray-700">
                  📌 Frequently Asked Questions
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Explore answers to the most commonly asked questions.
                </p>
              </div>
              <div
                onClick={() => setShowSupportDetails(!showSupportDetails)}
                className="bg-gray-50 p-4 rounded-xl border border-gray-200 hover:shadow-md transition cursor-pointer"
              >
                <h3 className="text-lg font-semibold text-gray-700">
                  📞 Contact Support
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Need help? Get in touch with our friendly support team.
                </p>

                {showSupportDetails && (
                  <div className="mt-4 space-y-2 text-sm text-gray-700">
                    <p>
                      <strong>Email:</strong> support@luckyfootwear.com
                    </p>
                    <p>
                      <strong>Phone:</strong> +91 8989961490
                    </p>
                    <p>
                      <strong>Live Chat:</strong> Available 9AM – 6PM (Mon–Fri)
                    </p>
                    <p>
                      <strong>WhatsApp:</strong>
                      <a
                        href="https://wa.link/x3byjl"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 underline"
                      >
                        Chat with us
                      </a>
                    </p>
                  </div>
                )}
              </div>

              <div
                onClick={() => setShowGettingStarted(!showGettingStarted)}
                className="bg-gray-50 p-4 rounded-xl border border-gray-200 hover:shadow-md transition"
              >
                <h3 className="text-lg font-semibold text-gray-700">
                  📚 Getting Started
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  New here? Learn how to set up and use our services
                  effectively.
                </p>
                {showGettingStarted && (
                  <div>
                    <div className="text-2xl text-blue-500">
                      Welcome to our shoe store! Here's how to get started:
                    </div>
                    <ul className="list-disc pl-5 text-sm text-gray-700 mt-4 space-y-2">
                      <li>
                        <strong>Sign Up / Login:</strong> Create a new account
                        or log in to save your preferences and orders.
                      </li>
                      <li>
                        <strong>Browse Shoes:</strong> Explore our wide
                        collection of shoes by category or search.
                      </li>
                      <li>
                        <strong>Add to Cart:</strong> Select your favorite shoes
                        and add them to your cart.
                      </li>
                      <li>
                        <strong>Checkout:</strong> Review your cart, provide
                        shipping address, and select payment method.
                      </li>
                      <li>
                        <strong>Track Orders:</strong> Check your order history
                        and track delivery status in your profile.
                      </li>
                      <li>
                        <strong>Support:</strong> Contact our support if you
                        need any help or have questions.
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Container className="space-y-6 py-2">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-w-6xl mx-auto">
        {/* Sidebar */}
        <aside className="w-full md:w-72 bg-gradient-to-b from-indigo-100 to-white border-r border-gray-300 p-8 flex flex-col space-y-10">
          <div className="flex flex-col items-center md:items-start gap-4">
            <img
              src={user.profilePic}
              alt={user.name}
              className="w-28 h-28 rounded-full border-8 border-white shadow-lg object-cover"
            />
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-extrabold text-gray-900">
                {user.name}
              </h2>
              <p className="text-indigo-700 font-semibold tracking-wide">
                {user.role}
              </p>
            </div>
          </div>

          <nav className="flex flex-col gap-4 text-lg font-semibold">
            {[
              {
                tab: "My Account",
                icon: <FiEdit2 size={20} />,
                label: "My Account",
              },
              { tab: "orders", icon: <FaBoxOpen size={20} />, label: "Orders" },
              {
                tab: "wishlist",
                icon: <FaHeart size={20} />,
                label: "Wishlist",
              },
              {
                tab: "addresses",
                icon: <FaMapMarkerAlt size={20} />,
                label: "Saved Addresses",
              },
              {
                tab: "help",
                icon: <FaQuestionCircle size={20} />,
                label: "Help Center",
              },
            ].map(({ tab, icon, label }) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-3 px-5 py-3 rounded-xl transition-colors duration-300 focus:outline-none ${
                  activeTab === tab
                    ? "bg-indigo-600 text-white shadow-lg transform scale-105"
                    : "text-indigo-800 hover:bg-indigo-200 hover:text-indigo-900"
                }`}
              >
                {icon} {label}
              </button>
            ))}
          </nav>

          <button
            className="flex items-center justify-center gap-3 font-extrabold bg-red-600 text-white px-6 py-3 rounded-xl shadow-lg hover:bg-red-700 transition duration-300 mt-auto"
            onClick={handelLogout}
          >
            <RxExit size={22} /> Logout
          </button>
        </aside>

        {/* Main Content Area */}
        <section className="flex-1 p-12 bg-white">
          {renderContent()}

          {/* Delete Confirmation Modal */}
          {showDeleteModal && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-8 max-w-lg w-full mx-4 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-extrabold text-gray-900">
                    Delete Account
                  </h3>
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="text-gray-700 hover:text-red-600 transition"
                  >
                    <IoMdClose size={26} />
                  </button>
                </div>

                <p className="text-gray-800 mb-8 leading-relaxed">
                  Are you sure you want to delete your account? This action
                  cannot be undone and all your data will be permanently
                  removed.
                </p>

                <div className="flex justify-end gap-5">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-6 py-3 rounded-lg border border-gray-400 text-gray-700 hover:bg-gray-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    className="px-6 py-3 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </Container>
  );
};

export default Account;
