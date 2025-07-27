import React, { useEffect, useState } from "react";
import axios from "../../config/api";
import { FiEye, FiSearch, FiBox } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { FaTruck, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const OrderManagement = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("delivered");

  const [totalDelivered, setTotalDelivered] = useState(0);
  const [totalCancelled, setTotalCancelled] = useState(0);
  const [totalPending, setTotalPending] = useState(0);
  const [totalProcessing, setTotalProcessing] = useState(0);
  const [totalShipped, setTotalShipped] = useState(0);

  const statusTabs = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get("/api/orders/admin");
        const ordersData = response.data.orders || [];
        setOrders(ordersData);

        setTotalDelivered(
          ordersData.filter((o) => o.orderStatus?.toLowerCase() === "delivered").length
        );
        setTotalCancelled(
          ordersData.filter((o) => o.orderStatus?.toLowerCase() === "cancelled").length
        );
        setTotalPending(
          ordersData.filter((o) => o.orderStatus?.toLowerCase() === "pending").length
        );
        setTotalProcessing(
          ordersData.filter((o) => o.orderStatus?.toLowerCase() === "processing").length
        );
        setTotalShipped(
          ordersData.filter((o) => o.orderStatus?.toLowerCase() === "shipped").length
        );
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, []);

  const handleView = (order) => {
    navigate(`/admin/orderdetails/${order._id}`);
  };

  const getStatus = (status) => {
    const statusLower = status.toLowerCase();
    if (statusLower === "delivered") {
      return (
        <span className="text-green-600 font-semibold flex items-center gap-2">
          <FaCheckCircle /> Delivered
        </span>
      );
    }
    if (statusLower === "cancelled") {
      return (
        <span className="text-red-600 font-semibold flex items-center gap-2">
          <FaTimesCircle /> Cancelled
        </span>
      );
    }
    return (
      <span className="text-blue-600 font-semibold flex items-center gap-2">
        <FaTruck /> {status}
      </span>
    );
  };

  const filteredOrders = orders.filter((order) =>
    order.userId?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCurrentOrders = () => {
    return filteredOrders.filter(
      (order) => order.orderStatus?.toLowerCase() === activeTab
    );
  };



  const renderOrdersTable = (ordersList) => (
    <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
           <div className="max-h-[500px] overflow-y-auto relative">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">
                Order ID
              </th>
              <th className="px-6 py-3 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {ordersList.map((order) => (
              <tr key={order._id} className="hover:bg-gray-100">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600"
                
                >
                  {order._id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {order.userId?.name || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {getStatus(order.orderStatus)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  ₹{order.totalAmount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    className="p-1 text-blue-500 hover:bg-blue-500 hover:text-white rounded"
                    onClick={() => handleView(order)}
                  >
                    <FiEye size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {ordersList.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="text-center text-gray-500 py-6 text-sm"
                >
                  No orders found in this category.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );


  return (
    <div className="space-y-6 text-base text-gray-800">
      {/* Header & Summary */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <span className="text-2xl text-blue-700 font-bold">Order Management</span>
        <div className="flex flex-wrap gap-4 text-gray-700">
           <SummaryCard title="Total Pending" count={totalPending} color="yellow" />
          <SummaryCard title="Total Processing" count={totalProcessing} color="blue" />
          <SummaryCard title="Total Shipped" count={totalShipped} color="purple" />
          <SummaryCard title="Total Delivered" count={totalDelivered} color="green" />
          <SummaryCard title="Total Cancelled" count={totalCancelled} color="red" />
        </div>
      </div>
      {/* Tabs */}
      <div className="flex gap-13 flex-wrap">
        {statusTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab.toLowerCase())}
            className={`px-4 py-2 rounded-lg font-medium border ${
              activeTab === tab.toLowerCase()
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            {tab} Orders
          </button>
        ))}
      </div>

      {/* Table */}
      {renderOrdersTable(getCurrentOrders())}
    </div>
  );
};

// Summary Card Component
const SummaryCard = ({ title, count, color }) => {
  const colorMap = {
    green: "bg-green-500",
    red: "bg-red-500",
    yellow: "bg-yellow-400",
    blue: "bg-blue-400",
    purple: "bg-purple-500",
  };

  return (
    <div className={`${colorMap[color]} text-white px-4 py-1 rounded-xl flex items-center gap-2 shadow-lg`}>
      <FiBox size={32} />
      <div>
        <h2 className="text-base font-semibold">{title}:</h2>
        <p className="text-xl font-semibold">{count}</p>
      </div>
    </div>
  );
};

export default OrderManagement;
