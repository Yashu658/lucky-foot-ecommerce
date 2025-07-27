import React, { useEffect, useState } from "react";
import axios from "../../config/api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FiEye,
  FiShoppingCart,
  FiUsers,
  FiBox,
  FiCheckCircle,
} from "react-icons/fi";
import { FaRupeeSign } from "react-icons/fa";

const DashboardOverview = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSales: 0,
    totalProducts: 0,
    totalCustomers: 0,
    totalPending: 0,
    totalShipped: 0,
    totalProcessing: 0,
    totalDelivered: 0,
    totalCancelled: 0,
    totalReturned: 0,
    totalPendingReturn: 0,
    totalReplaced: 0,
    totalPendingReplace: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch dashboard stats
      const statsResponse = await axios.get("/api/admin/dashboard");
      const baseStats = statsResponse.data.success
        ? statsResponse.data.stats || {}
        : {};

      // Fetch recent orders separately
      const ordersResponse = await axios.get("/api/orders/admin");
      const orders = ordersResponse.data.orders || [];

      // Initialize counters
      let totalPending = 0;
      let totalShipped = 0;
      let totalProcessing = 0;
      let totalDelivered = 0;
      let totalCancelled = 0;
      let totalReturned = 0;
      let totalPendingReturn = 0;
      let totalReplaced = 0;

      let totalPendingReplace = 0;

      let totalSales = 0;
      const countedOrders = new Set();

      orders.forEach((order) => {
        const status = order.orderStatus?.toLowerCase();
        const deliveredStatus = (order.orderStatus || "").toLowerCase();
        const isDelivered = deliveredStatus === "delivered";

        const replacementStatuses = [
          "replacementrequested",
          "replacementapproved",
          "replacementshipped",
          "replacementcompleted",
          "replacementrejected",
        ];

        let hasAnyPendingReturn = false;
        let hasAnyPendingReplacement = false;
        let hasAnyCompletedReplacement = false;
        let hasAnyCountableReplacement = false;

        // Flag to determine if this order should be counted as delivered or replaced
        let shouldCountDelivered = isDelivered;

        order.products.forEach((product) => {
          const returnStatus = (
            product.returnDetails?.status || ""
          ).toLowerCase();
          const replacementStatus = (
            product.replacementDetails?.status || ""
          ).toLowerCase();

          if (
            returnStatus === "returnrequested" ||
            returnStatus === "returnapproved"
          ) {
            hasAnyPendingReturn = true;
          }

          if (replacementStatuses.includes(replacementStatus)) {
            if (replacementStatus === "replacementcompleted") {
              hasAnyCompletedReplacement = true;
              shouldCountDelivered = true;
            } else if (
              replacementStatus === "replacementrequested" ||
              replacementStatus === "replacementapproved"
            ) {
              hasAnyPendingReplacement = true;
              shouldCountDelivered = true;
            } else if (
              replacementStatus === "replacementshipped" ||
              replacementStatus === "replacementrejected"
            ) {
              hasAnyCountableReplacement = true;
              shouldCountDelivered = true;
            }
          }
        });

        if (hasAnyCompletedReplacement) {
          totalReplaced++;
        }

        if (hasAnyPendingReplacement) {
          totalPendingReplace++;
        }

        if (hasAnyPendingReturn) {
          totalPendingReturn++;
        }

        if (shouldCountDelivered && !countedOrders.has(order._id)) {
          totalDelivered++;
          totalSales += order.totalAmount || 0;
          countedOrders.add(order._id);
        }

        // Count order-level statuses

        if (status === "pending") totalPending++;
        else if (status === "shipped") totalShipped++;
        else if (status === "processing") totalProcessing++;
        else if (status === "cancelled" || status === "canceled") {
          totalCancelled++;
        } else if (status === "returned") {
          totalReturned++;
        }

        // Fallback return status count (if somehow not caught in products loop)
        if (
          status?.includes("returnrequested") ||
          status?.includes("returnapproved")
        ) {
          totalPendingReturn++;
        }
      });

      if (ordersResponse.data.success) {
        setRecentOrders(orders);
      }

      setStats({
        ...baseStats,
        totalOrders: orders.length,
        totalSales,
        totalPending,
        totalShipped,
        totalProcessing,
        totalDelivered,
        totalCancelled,
        totalReturned,
        totalReplaced,
        totalPendingReplace,
        totalPendingReturn,
      });
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
      toast.error("Failed to load dashboard data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const filteredRecentOrders = recentOrders.filter((order) => {
    const status = order.orderStatus?.toLowerCase();
    return status && ["pending", "shipped", "processing"].includes(status);
  });

  if (loading) {
    return <div className="text-center py-8">Loading dashboard...</div>;
  }

  const handleView = (order) => {
    navigate(`/admin/orderdetails/${order._id}`);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-blue-700">Dashboard Overview</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-blue-600 text-white p-6 rounded-xl flex items-center gap-4 shadow-lg">
          <FiShoppingCart size={40} />
          <div>
            <h2 className="text-base font-semibold">Total Orders</h2>
            <p className="text-2xl">{stats.totalOrders}</p>
          </div>
        </div>

        <div className="bg-green-600 text-white p-6 rounded-xl flex items-center gap-4 shadow-lg">
          <FaRupeeSign size={40} />
          <div>
            <h2 className="text-base font-semibold">Total Sales</h2>
            <p className="text-2xl">₹{stats.totalSales.toFixed(2)}</p>
          </div>
        </div>

        <div className="bg-purple-600 text-white p-6 rounded-xl flex items-center gap-4 shadow-lg">
          <FiBox size={40} />
          <div>
            <h2 className="text-base font-semibold">Total Products</h2>
            <p className="text-2xl">{stats.totalProducts}</p>
          </div>
        </div>

        <div className="bg-indigo-600 text-white p-6 rounded-xl flex items-center gap-4 shadow-lg">
          <FiUsers size={40} />
          <div>
            <h2 className="text-base font-semibold">Total Customers</h2>
            <p className="text-2xl">{stats.totalCustomers}</p>
          </div>
        </div>
      </div>

      <hr />

      {/* Orders Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-green-500 text-white p-6 rounded-xl flex items-center gap-4 shadow-lg">
          <FiCheckCircle size={32} />
          <div>
            <h2 className="text-base font-semibold">Delivered Orders</h2>
            <p className="text-2xl font-semibold">{stats.totalDelivered}</p>
          </div>
        </div>

        <div className="bg-blue-500 text-white p-6 rounded-xl flex items-center gap-4 shadow-lg">
          <FiBox size={32} />
          <div>
            <h2 className="text-base font-semibold">Processing Orders</h2>
            <p className="text-2xl font-semibold">{stats.totalProcessing}</p>
          </div>
        </div>

        <div className="bg-teal-500 text-white p-6 rounded-xl flex items-center gap-4 shadow-lg">
          <FiBox size={32} />
          <div>
            <h2 className="text-base font-semibold">Shipped Orders</h2>
            <p className="text-2xl font-semibold">{stats.totalShipped}</p>
          </div>
        </div>

        <div className="bg-yellow-500 text-white p-6 rounded-xl flex items-center gap-4 shadow-lg">
          <FiBox size={32} />
          <div>
            <h2 className="text-base font-semibold">Pending Orders</h2>
            <p className="text-2xl font-semibold">{stats.totalPending}</p>
          </div>
        </div>
      </div>

      {/* More status */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
        <div className="bg-red-500 text-white p-6 rounded-xl flex items-center gap-4 shadow-lg">
          <FiBox size={32} />
          <div>
            <h2 className="text-base font-semibold">Cancelled Orders</h2>
            <p className="text-2xl font-semibold">{stats.totalCancelled}</p>
          </div>
        </div>

        <div className="bg-orange-500 text-white p-6 rounded-xl flex items-center gap-4 shadow-lg">
          <FiBox size={32} />
          <div>
            <h2 className="text-base font-semibold">Returned Orders</h2>
            <p className="text-2xl font-semibold">{stats.totalReturned}</p>
          </div>
        </div>

        <div className="bg-yellow-400 text-white p-6 rounded-xl flex items-center gap-4 shadow-lg">
          <FiBox size={32} />
          <div>
            <h2 className="text-base font-semibold">Pending Returns</h2>
            <p className="text-2xl font-semibold">{stats.totalPendingReturn}</p>
          </div>
        </div>

        <div className="bg-pink-500 text-white p-6 rounded-xl flex items-center gap-4 shadow-lg">
          <FiBox size={32} />
          <div>
            <h2 className="text-base font-semibold">Replaced Orders</h2>
            <p className="text-2xl font-semibold">{stats.totalReplaced}</p>
          </div>
        </div>

        <div className="bg-pink-400 text-white p-6 rounded-xl flex items-center gap-4 shadow-lg">
          <FiBox size={32} />
          <div>
            <h2 className="text-base font-semibold">Pending Replacements</h2>
            <p className="text-2xl font-semibold">
              {stats.totalPendingReplace}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div>
        <h2 className="text-2xl font-semibold text-blue-700 mb-4">
          Recent Orders
        </h2>

        <div className="bg-gray-50 rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-y-auto max-h-[500px]">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700 bg-gray-100">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700 bg-gray-100">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700 bg-gray-100">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700 bg-gray-100">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700 bg-gray-100">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700 bg-gray-100">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-800">
                {filteredRecentOrders.length > 0 ? (
                  filteredRecentOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-100">
                      <td className="px-6 py-4 font-medium">
                        #{order._id.substring(0, 8)}
                      </td>
                      <td className="px-6 py-4">
                        {order.userId?.name ||
                          order.shippingInfo?.name ||
                          "N/A"}
                      </td>
                      <td className="px-6 py-4">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            order.orderStatus?.toLowerCase() === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : order.orderStatus?.toLowerCase() === "shipped"
                              ? "bg-green-100 text-green-800"
                              : order.orderStatus?.toLowerCase() ===
                                "processing"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold">
                        ₹{order.totalAmount?.toFixed(2) || "0.00"}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          className="p-1 text-blue-500 hover:bg-blue-500 hover:text-white rounded"
                          onClick={() => handleView(order)}
                        >
                          <FiEye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center text-gray-500 py-6 text-base"
                    >
                      No recent orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
