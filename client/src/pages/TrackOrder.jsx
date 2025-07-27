import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../config/api";
import {
  FaTruck,
  FaCheckCircle,
  FaBoxOpen,
  FaTimesCircle,
} from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { MdPayment } from "react-icons/md";
import { GiReturnArrow } from "react-icons/gi";
import toast from "react-hot-toast";

const TrackOrder = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await axios.get(`/api/orders/user/order/${orderId}`);
        setOrder(res.data.order);
      } catch (error) {
        console.error("Failed to fetch order", error);
        toast.error("Unable to fetch order details");
        navigate("/orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, navigate]);

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return { color: "#1E3A8A", iconColor: "#3B82F6" }; // Blue
      case "processing":
        return { color: "#B45309", iconColor: "#FBBF24" }; // Yellow
      case "shipped":
        return { color: "#166534", iconColor: "#A7F3D0" }; // Light green
      case "delivered":
        return { color: "#047857", iconColor: "#10B981" }; // Green
      case "cancelled":
        return { color: "#991B1B", iconColor: "#DC2626" }; // Red
      case "returned":
        return { color: "#1F2937", iconColor: "#374151" }; // Blackish Gray
      default:
        return { color: "#6B7280", iconColor: "#9CA3AF" }; // Gray fallback
    }
  };

  const getStatusIcon = (status) => {
    const lowerStatus = status?.toLowerCase();
    switch (lowerStatus) {
      case "cancelled":
        return <FaTimesCircle />;
      case "delivered":
        return <FaCheckCircle />;
      case "shipped":
      case "in transit":
        return <FaTruck />;
      case "return_requested":
      case "returned":
        return <GiReturnArrow />;
      case "pending":
      case "processing":
        return <FaBoxOpen />;
      default:
        return <FaBoxOpen />;
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
        <div className="bg-white rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
        <div className="bg-white rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl text-center">
          <FaBoxOpen className="mx-auto text-5xl text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold mb-4">Order not found</h3>
          <button
            onClick={() => navigate("/order")}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Go Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const { color: statusColor, iconColor: iconColor } = getStatusStyle(order.orderStatus);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl p-6 mt-10 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 right-4 text-gray-600 hover:text-red-500 transition"
          aria-label="Close"
        >
          <IoMdClose size={28} />
        </button>

        <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <FaTruck className="text-indigo-600" />
          Track Order #{order.orderId || order._id}
        </h2>

        {/* Order Info Card */}
        <div className="bg-gray-50 rounded-lg shadow-md border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-600">Placed on:</p>
              <p className="text-gray-900 font-semibold">
                {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-gray-600">Total Amount:</p>
              <p className="text-lg font-bold text-gray-900">
                ₹{order.totalAmount?.toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </div>

        {/* Status Card */}
        <div className="bg-gray-50 rounded-lg shadow-md border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">Current Status</h3>
            <div
              className="flex items-center gap-3 text-lg font-semibold"
              style={{ color: statusColor, transition: "color 0.3s ease" }}
            >
              {React.cloneElement(getStatusIcon(order.orderStatus), {
                style: { color: iconColor, fontSize: "1.7rem" },
              })}
              <span className="capitalize">{order.orderStatus || "Unknown"}</span>
            </div>
          </div>

          {order.paymentStatus === "pending" && order.paymentMethod === "cod" && (
            <div className="flex items-center gap-2 text-yellow-600 text-sm font-medium">
              <MdPayment size={20} />
              Payment Pending (COD)
            </div>
          )}
        </div>

        {/* Shipping Details and Estimated Delivery */}
        <div className="bg-gray-50 rounded-lg shadow-md border border-gray-200 p-6 flex flex-col md:flex-row justify-between gap-6">
          {/* Shipping Details */}
          <div className="flex-1">
            <h4 className="text-md font-semibold mb-3 text-gray-800">Shipping Details</h4>
            <p className="text-sm text-gray-700">{order.shippingAddress?.name}</p>
            <p className="text-sm text-gray-700">{order.shippingAddress?.address}</p>
            <p className="text-sm text-gray-700">{order.shippingAddress?.city}</p>
            <p className="text-sm text-gray-700">{order.shippingAddress?.state}</p>
            <p className="text-sm text-gray-700">{order.shippingAddress?.postalCode}</p>
            <p className="text-sm text-gray-700">{order.shippingAddress?.phone}</p>
          </div>

          {/* Estimated Delivery */}
{order.orderStatus?.toLowerCase() !== "cancelled" && (
  <div className="flex-1 text-right flex flex-col justify-center">
    <p className="text-sm text-gray-600 font-medium mb-1">
      {order.orderStatus?.toLowerCase() === "delivered" ? "Delivered On" : "Estimated Delivery"}
    </p>
    <p className="inline-block bg-green-100 text-green-800 rounded-md px-4 py-2 font-semibold select-none">
      {order.orderStatus?.toLowerCase() === "delivered" && order.deliveredAt
        ? new Date(order.deliveredAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : new Date(new Date(order.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
    </p>
  </div>
)}

        </div>
      </div>
    </div>
  );
};

export default TrackOrder;
