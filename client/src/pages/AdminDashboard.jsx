import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RxDashboard, RxExit } from "react-icons/rx";
import {
  FaUsers,
  FaBoxes,
  FaShoppingBag,
  FaExchangeAlt,
  FaMoneyBillWave,
  FaStar,
  FaTags ,
} from "react-icons/fa";
import { GiReturnArrow } from "react-icons/gi";
import axios from "../config/api";
import { useAuth } from "../context/authContext";
import DashboardOverview from "../components/admin/DashboardOverview";
import ProductManagement from "../components/admin/ProductManagement";
import Customers from "../components/admin/CustomerManagement";
import OrderManagement from "../components/admin/OrderManagement";
import ReplacementManagement from "../components/admin/ReplacementManagement";
import ReturnsManagement from "../components/admin/ReturnsManagement";
import TransactionsManagement from "../components/admin/TransactionsManagement";
import ReviewManagement from "../components/admin/ReviewManagement";
import OfferManagement from "../components/admin/OfferManagement";
import toast from "react-hot-toast";
import { FiPackage } from "react-icons/fi";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [returnCount, setReturnCount] = useState(0);
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const confirmed = window.confirm("Are you sure you want to logout?");
    if (!confirmed) return;
    try {
      const res = await axios.get("/api/auth/logout");
      sessionStorage.removeItem("user");
      setUser(null);
      toast.success(res.data.message);
      window.location.href = "/";
    } catch (error) {
      console.error(error);
    }
  };

  const fetchReturnCounts = async () => {
    try {
      const res = await axios.get("/api/orders/admin/getAllReturns");

      const validReturns = res.data.returns.filter(
        (r) => r.status === "ReturnRequested" || r.status === "ReturnApproved"
      );

      setReturnCount(validReturns.length);
    } catch (error) {
      console.error("Failed to load return count", error);
    }
  };

  useEffect(() => {
    fetchReturnCounts();
  }, []);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: <RxDashboard /> },
    { id: "customers", label: "Customers", icon: <FaUsers /> },
    { id: "products", label: "Products", icon: <FaBoxes /> },
    { id: "orders", label: "Orders", icon: <FaShoppingBag /> },
    { id: "replace", label: "Replace", icon: <FaExchangeAlt /> },
    { id: "returns", label: "Returns", icon: <GiReturnArrow /> },
    { id: "transactions", label: "Transactions", icon: <FaMoneyBillWave /> },
    { id: "reviews", label: "Reviews", icon: <FaStar /> },
    { id: "offer", label: "Offer", icon: <FaTags /> },
  ];

  return (
    <div className="flex h-80vh bg-gray-100">
      {/* Sidebar */}
      <div className="w-56 bg-white shadow-lg relative">
        <div className="p-4">
          <h1 className="text-2xl font-bold text-blue-600">Admin Panel</h1>
        </div>

        <nav className="mt-2">
          <div className="px-4 space-y-1 text-sm">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === item.id
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
              >
                {item.icon}
                <span className="flex items-center gap-2">
                  {item.label}
                  {item.id === "returns" && returnCount > 0 && (
                    <span className="ml-1 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {returnCount}
                    </span>
                  )}
                </span>
              </button>
            ))}
          </div>
        </nav>

        <div className="absolute  w-full p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-500 text-white hover:bg-red-500 hover:text-red-800 transition-colors"
          >
            <RxExit />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="bg-white rounded-xl shadow-lg p-6 min-h-[calc(100vh-4rem)]">
          {activeTab === "dashboard" && (
            <div>
              <h2 className="text-2xl font-bold mb-4">
                <DashboardOverview />
              </h2>
            </div>
          )}
          {activeTab === "customers" && (
            <div>
              <h2 className="text-2xl font-bold mb-4">
                <Customers />
              </h2>
            </div>
          )}
          {activeTab === "products" && (
            <div>
              <ProductManagement />
            </div>
          )}
          {activeTab === "orders" && (
            <div>
              <h2 className="text-2xl font-bold mb-4">
                <OrderManagement />
              </h2>
            </div>
          )}
          {activeTab === "replace" && (
            <div>
              <h2 className="text-2xl font-bold mb-4">
                <ReplacementManagement />
              </h2>
            </div>
          )}
          {activeTab === "returns" && (
            <div>
              <h2 className="text-2xl font-bold mb-4">
                <ReturnsManagement />
              </h2>
            </div>
          )}
          {activeTab === "transactions" && (
            <div>
              <h2 className="text-2xl font-bold mb-4">
                <TransactionsManagement />
              </h2>
            </div>
          )}
          {activeTab === "reviews" && (
            <div>
              <h2 className="text-2xl font-bold mb-4">
                <ReviewManagement />
              </h2>
            </div>
          )}
           {activeTab === "offer" && (
            <div>
              <h2 className="text-2xl font-bold mb-4">
                <OfferManagement />
              </h2>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
