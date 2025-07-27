import React, { useEffect, useState } from "react";
import axios from "../../config/api";
import {
  FiSearch,
  FiCheck,
  FiX,
  FiTruck,
  FiPackage,
  FiEye,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const ReplacementManagement = () => {
  const navigate = useNavigate();
  const [replacements, setReplacements] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [selectedReplacement, setSelectedReplacement] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchReplacements = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/orders/admin/getAllReplacements");
      setReplacements(response.data.replacements);
    } catch (error) {
      console.error("Error fetching replacement requests:", error);
      toast.error("Failed to load replacement requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReplacements();
  }, [refreshTrigger]);

  const handleUpdateStatus = async (replacementId, status) => {
    try {
      const validStatuses = [
        "ReplacementRequested",
        "ReplacementApproved",
        "ReplacementRejected",
        "ReplacementShipped",
        "ReplacementCompleted",
      ];

      if (!validStatuses.includes(status)) {
        toast.error("Invalid replacement status");
        return;
      }

      const data = { status };

      // Add tracking number if shipping
      if (status === "ReplacementShipped") {
        if (!trackingNumber) {
          toast.error("Tracking number is required when shipping replacement");
          return;
        }
        data.trackingNumber = trackingNumber;
      }

      const response = await axios.put(
        `/api/orders/admin/updateReplacementStatus/${replacementId}`,
        data
      );

      if (response.data.success) {
        toast.success(
          `Replacement ${status
            .replace("Replacement", "")
            .toLowerCase()} successfully`
        );
        setTrackingNumber("");
        setSelectedReplacement(null);
        await fetchReplacements();
         setRefreshTrigger(prev => prev + 1); 
      }
    } catch (error) {
      console.error("Status update error:", error);
      toast.error(error.response?.data?.message || "Failed to update status");
      fetchReplacements();
    }
  };

  const filteredReplacements = replacements.filter((rep) => {
    const matchesSearch =
      rep.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rep.replacementId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rep.orderId?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "All" || rep.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleView = (rep) => {
    navigate(`/admin/orderdetails/${rep.orderId}`);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "ReplacementRequested":
        return (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
            Pending Review
          </span>
        );
      case "ReplacementApproved":
        return (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
            Approved-Processing
          </span>
        );
      case "ReplacementRejected":
        return (
          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
            Rejected
          </span>
        );
      case "ReplacementShipped":
        return (
          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
            Shipped
          </span>
        );
      case "ReplacementCompleted":
        return (
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
            Completed
          </span>
        );
      default:
        return null;
    }
  };

  const countByStatus = {
    ReplacementRequested: replacements.filter(
      (r) => r.status === "ReplacementRequested"
    ).length,
    ReplacementApproved: replacements.filter(
      (r) => r.status === "ReplacementApproved"
    ).length,
    ReplacementRejected: replacements.filter(
      (r) => r.status === "ReplacementRejected"
    ).length,
    ReplacementShipped: replacements.filter(
      (r) => r.status === "ReplacementShipped"
    ).length,
    ReplacementCompleted: replacements.filter(
      (r) => r.status === "ReplacementCompleted"
    ).length,
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className=" overflow-x-auto px-2 w-[1200px]">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          Replacement Management
        </h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-1 mt-2 ">
        <div className="bg-yellow-100 py-3 px-2 rounded-xl shadow text-yellow-800 text-center w-[140px] mx-auto">
          <p className="text-sm font-semibold">Pending Review</p>
          <p className="text-xl font-bold">
            {countByStatus.ReplacementRequested}
          </p>
        </div>
        <div className="bg-blue-100 py-3 px-2 rounded-xl shadow text-blue-800 text-center w-[140px] mx-auto">
          <p className="text-sm font-semibold">Approved</p>
          <p className="text-xl font-bold">
            {countByStatus.ReplacementApproved}
          </p>
        </div>
        <div className="bg-red-100 py-3 px-2 rounded-xl shadow text-red-800 text-center w-[140px] mx-auto">
          <p className="text-sm font-semibold">Rejected</p>
          <p className="text-xl font-bold">
            {countByStatus.ReplacementRejected}
          </p>
        </div>
        <div className="bg-purple-100 py-3 px-2 rounded-xl shadow text-purple-800 text-center w-[140px] mx-auto">
          <p className="text-sm font-semibold">Shipped</p>
          <p className="text-xl font-bold">
            {countByStatus.ReplacementShipped}
          </p>
        </div>
        <div className="bg-green-100 py-3 px-2 rounded-xl shadow text-green-800 text-center w-[140px] mx-auto">
          <p className="text-sm font-semibold">Completed</p>
          <p className="text-xl font-bold">
            {countByStatus.ReplacementCompleted}
          </p>
        </div>
      </div>

      {/* Status Filter Buttons */}
      <div className="flex gap-6 mt-4 flex-wrap">
        {[
          "ReplacementRequested",
          "ReplacementApproved",
          "ReplacementShipped",
          "ReplacementCompleted",
          "ReplacementRejected",
          "All",
        ].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1 rounded-full text-sm ${
              statusFilter === status
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {status === "All"
              ? "All"
              : status
                  .replace("Replacement", "Replacement ")
                  .replace("ReplacementCompleted", "Completed")}
          </button>
        ))}
      </div>

      {/* Tracking Number Modal */}
      {selectedReplacement && (
   <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Enter Tracking Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tracking Number
                </label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Enter tracking number"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setSelectedReplacement(null);
                    setTrackingNumber("");
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleUpdateStatus(
                      selectedReplacement,
                      "ReplacementShipped"
                    );
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden mt-4">
        <div className="overflow-x-auto">
          <div className="max-h-[500px] overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Replacement ID
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size (Old → New)
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Request Date
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-1 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReplacements.length > 0 ? (
                  filteredReplacements.map((rep) => (
                    <tr key={rep.replacementId}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{rep.replacementId?.slice(-6)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="font-medium">{rep.customerName}</div>
                        <div className="text-gray-400">{rep.customerEmail}</div>
                      </td>
                      <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900 relative group max-w-xs w-48">
                        <div className="truncate">{rep.name}</div>
                        <div className="text-sm text-gray-500 truncate">
                          Qty: {rep.quantity}
                        </div>
                        <div className="absolute left-0 top-12 mt-2 w-max max-w-xs bg-white text-gray-900 text-sm rounded-lg shadow-lg p-4 border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                          <div className="font-medium">{rep.name}</div>
                          <div className="text-gray-500">
                            Qty: {rep.quantity}
                          </div>
                        </div>
                      </td>

                      <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="px-2 py-1 bg-gray-100 rounded">
                          {rep.originalSize}
                        </span>
                        <span className="mx-2">→</span>
                        <span className="px-2 py-1 bg-blue-100 rounded">
                          {rep.replacementSize}
                        </span>
                      </td>
                      <td className="px-2 py-4 whitespace-nowrap">
                        {getStatusBadge(rep.status)}
                      </td>
                      <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500">
                        {rep.requestDate
                          ? (() => {
                              try {
                                // Handle Firestore timestamp (or anything with `.seconds`)
                                if (rep.requestDate.seconds) {
                                  return new Date(
                                    rep.requestDate.seconds * 1000
                                  ).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  });
                                }

                                const date = new Date(rep.requestDate);
                                return isNaN(date)
                                  ? "Invalid Date"
                                  : date.toLocaleDateString();
                              } catch (e) {
                                return "Invalid Date";
                              }
                            })()
                          : "N/A"}
                      </td>

                      <td className="px-2 py-4 text-sm text-gray-700 relative group ">
                        <div className="truncate w-20">
                          {rep.reason
                            ? rep.reason.split(" ").slice(0, 2).join(" ") +
                              (rep.reason.split(" ").length > 2 ? "..." : "")
                            : "No reason provided"}
                        </div>
                        {rep.reason && (
                          <div className="absolute left-0 top-12 w-max max-w-sm bg-white text-gray-900 text-sm rounded-lg shadow-lg p-4 border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                            {rep.reason}
                          </div>
                        )}
                      </td>
                      <td className="px-2 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          {rep.status === "ReplacementRequested" && (
                            <>
                              <button
                                onClick={() =>
                                  handleUpdateStatus(
                                    rep.replacementId,
                                    "ReplacementApproved"
                                  )
                                }
                                className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                                title="Approve Replacement"
                              >
                                <FiCheck className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() =>
                                  handleUpdateStatus(
                                    rep.replacementId,
                                    "ReplacementRejected"
                                  )
                                }
                                className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                                title="Reject Replacement"
                              >
                                <FiX className="h-5 w-5" />
                              </button>

                              <button
                                className="p-1 ml-3 text-blue-500 hover:bg-blue-500 hover:text-white rounded"
                                onClick={() => handleView(rep)}
                              >
                                <FiEye size={18} />
                              </button>
                            </>
                          )}

                          {rep.status === "ReplacementApproved" && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedReplacement(rep.replacementId);
                                }}
                                className="text-purple-600 hover:text-purple-900 p-1 rounded hover:bg-purple-50 flex items-center"
                                title="Mark as Shipped"
                              >
                                <FiTruck className="h-5 w-5 mr-1" />
                                Ship
                              </button>
                              <button
                                onClick={() =>
                                  handleUpdateStatus(
                                    rep.replacementId,
                                    "ReplacementRejected"
                                  )
                                }
                                className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                                title="Reject Replacement"
                              >
                                <FiX className="h-5 w-5" />
                              </button>
                              <button
                                className="p-1 ml-3 text-blue-500 hover:bg-blue-500 hover:text-white rounded"
                                onClick={() => handleView(rep)}
                              >
                                <FiEye size={18} />
                              </button>
                            </>
                          )}

                          {rep.status === "ReplacementShipped" && (
                            <>
                            <button
                              onClick={() =>
                                handleUpdateStatus(
                                  rep.replacementId,
                                  "ReplacementCompleted"
                                )
                              }
                              className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 flex items-center"
                              title="Mark as Completed"
                            >
                              <FiPackage className="h-5 w-5 mr-1" />
                              Complete
                            </button>
                               <button
                                className="p-1 ml-3 text-blue-500 hover:bg-blue-500 hover:text-white rounded"
                                onClick={() => handleView(rep)}
                              >
                                <FiEye size={18} />
                              </button>
                            </>
                          )}

                          {(rep.status === "ReplacementRejected" ||
                            rep.status === "ReplacementCompleted") && (
                              <>
                              <button
                                className="p-1 text-blue-500 hover:bg-blue-500 hover:text-white rounded"
                                onClick={() => handleView(rep)}
                              >
                                <FiEye size={18} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="8"
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      No replacement requests found
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

export default ReplacementManagement;
