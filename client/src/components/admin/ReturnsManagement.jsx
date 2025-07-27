import React, { useEffect, useState } from "react";
import axios from "../../config/api";
import { FiSearch, FiCheck,  FiPackage, FiX,FiEye } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const ReturnsManagement = () => {
    const navigate = useNavigate();
  const [returns, setReturns] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");

  const fetchReturns = async () => {  
    try {
      setLoading(true);
      const response = await axios.get("/api/orders/admin/getAllReturns");

      const validReturns = response.data.returns.filter(
        (ret) => ret.status && ret.status !== "None"
      );

      setReturns(validReturns);
    } catch (error) {
      console.error("Error fetching return requests:", error);
      toast.error("Failed to load return requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  const handleUpdateStatus = async (returnId, status) => {
    try {
      const validStatuses = [
        "ReturnRequested",
        "ReturnApproved",
        "ReturnRejected",
        "Returned",
      ];
      if (!validStatuses.includes(status)) {
        toast.error("Invalid return status");
        return;
      }

      const response = await axios.put(
        `/api/orders/admin/updateReturnStatus/${returnId}`,
        { status }
      );

      if (response.data.success) {
        toast.success(
          `Return ${status.replace("Return", "").toLowerCase()} successfully`
        );
        setStatusFilter(status);
        await fetchReturns();
      }
    } catch (error) {
      console.error("Status update error:", error);
      toast.error(error.response?.data?.message || "Failed to update status");
      fetchReturns();
    }
  };

  const filteredReturns = returns.filter((ret) => {
    const matchesSearch =
      ret.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ret.returnId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ret.orderId?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "All" || ret.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleView = (ret) => {
  navigate(`/admin/orderdetails/${ret.orderId}`);
};


  const getStatusBadge = (status) => {
    switch (status) {
      case "ReturnRequested":
        return (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
            Pending Review
          </span>
        );
      case "ReturnApproved":
        return (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
            Approved - Awaiting Return
          </span>
        );
      case "ReturnRejected":
        return (
          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
            Rejected
          </span>
        );
      case "Returned":
        return (
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
            Return Completed
          </span>
        );
      default:
        return null;
    }
  };

  const countByStatus = {
    ReturnRequested: returns.filter((r) => r.status === "ReturnRequested")
      .length,
    ReturnApproved: returns.filter((r) => r.status === "ReturnApproved").length,
    ReturnRejected: returns.filter((r) => r.status === "ReturnRejected").length,
    Returned: returns.filter((r) => r.status === "Returned").length,
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Returns Management</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-yellow-100 p-4 rounded-xl shadow text-yellow-800 text-center">
          <p className="text-sm font-semibold">Pending Review</p>
          <p className="text-xl font-bold">{countByStatus.ReturnRequested}</p>
        </div>
        <div className="bg-blue-100 p-4 rounded-xl shadow text-blue-800 text-center">
          <p className="text-sm font-semibold">Approved</p>
          <p className="text-xl font-bold">{countByStatus.ReturnApproved}</p>
        </div>
        <div className="bg-red-100 p-4 rounded-xl shadow text-red-800 text-center">
          <p className="text-sm font-semibold">Rejected</p>
          <p className="text-xl font-bold">{countByStatus.ReturnRejected}</p>
        </div>
        <div className="bg-green-100 p-4 rounded-xl shadow text-green-800 text-center">
          <p className="text-sm font-semibold">Completed</p>
          <p className="text-xl font-bold">{countByStatus.Returned}</p>
        </div>
      </div>

      {/* Status Filter Buttons */}
      <div className="flex gap-2 mt-4 flex-wrap">
        {[
          "ReturnRequested",
          "ReturnApproved",
          "Returned",
          "ReturnRejected",
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
                  .replace("Return", "Return ")
                  .replace("Returned", "Returned")}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
           <div className="max-h-[500px] overflow-y-auto relative">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Return ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Request Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Return Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReturns.length > 0 ? (
                filteredReturns.map((ret) => (
                  <tr key={ret.returnId}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{ret.returnId?.slice(-6)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="font-medium">{ret.customerName}</div>
                      <div className="text-gray-400">{ret.customerEmail}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      #{ret.orderId?.slice(-6)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(ret.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(ret.requestDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 relative group max-w-xs">
                      <div className="truncate w-40">
                        {ret.reason
                          ? ret.reason.split(" ").slice(0, 2).join(" ") +
                            (ret.reason.split(" ").length > 2 ? "..." : "")
                          : "No reason provided"}
                      </div>
                      {ret.reason && (
                        <div className="absolute left-0 top-12  w-max max-w-sm bg-white text-gray-900 text-sm rounded-lg shadow-lg p-4 border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                          {ret.reason}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        {ret.status === "ReturnRequested" && (
                          <>
                            <button
                              onClick={() =>
                                handleUpdateStatus(
                                  ret.returnId,
                                  "ReturnApproved"
                                )
                              }
                              className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                              title="Approve Return"
                            >
                              <FiCheck className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() =>
                                handleUpdateStatus(
                                  ret.returnId,
                                  "ReturnRejected"
                                )
                              }
                              className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                              title="Reject Return"
                            >
                              <FiX className="h-5 w-5" />
                            </button>
                             <button
                              className="p-1 ml-3 text-blue-500 hover:bg-blue-500 hover:text-white rounded"
                              onClick={() => handleView(ret)}
                            >
                              <FiEye size={18} />
                            </button>
                            
                          </>
                        )}

                        {ret.status === "ReturnApproved" && (
                          <>
                            <button
                              onClick={() =>
                                handleUpdateStatus(ret.returnId, "Returned")
                              }
                              className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 flex items-center"
                              title="Mark as Returned"
                            >
                              <FiPackage className="h-5 w-5 mr-1" />
                              Complete
                            </button>
                            <button
                              onClick={() =>
                                handleUpdateStatus(
                                  ret.returnId,
                                  "ReturnRejected"
                                )
                              }
                              className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                              title="Reject Return"
                            >
                              <FiX className="h-5 w-5" />
                            </button>
                            <button
                              className="p-1 ml-3 text-blue-500 hover:bg-blue-500 hover:text-white rounded"
                              onClick={() => handleView(ret)}
                            >
                              <FiEye size={18} />
                            </button>
                          </>
                        )}

                        {(ret.status === "ReturnRejected" ||
                          ret.status === "Returned") && (
                            <>
                            <button
                              className="p-1 text-blue-500 hover:bg-blue-500 hover:text-white rounded"
                              onClick={() => handleView(ret)}
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
                    colSpan="7"
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No return requests found
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

export default ReturnsManagement;
