import React, { useState, useEffect } from "react";
import axios from "../../config/api";
import { useNavigate } from "react-router-dom";
const ALL_STATUSES = [
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
  "ReturnRequested",
  "ReturnApproved",
  "Returned",
  "ReturnRejected",
  "ReplacementRequested",
  "ReplacementApproved",
  "ReplacementShipped",
  "ReplacementCompleted",
  "ReplacementRejected",
];

const statusDisplayNames = {
  Pending: "Pending",
  Processing: "Processing",
  Shipped: "Shipped",
  Delivered: "Delivered",
  Cancelled: "Cancelled",
  ReturnRequested: "Return Requested",
  ReturnApproved: "Return Approved",
  Returned: "Returned",
  ReturnRejected: "Return Rejected",
  ReplacementRequested: "Replacement Requested",
  ReplacementApproved: "Replacement Approved",
  ReplacementShipped: "Replacement Shipped",
  ReplacementCompleted: "Replacement Completed",
  ReplacementRejected: "Replacement Rejected",
};

const getStatusClass = (status) => {
  const classes = {
    Delivered: "bg-green-100 text-green-800",
    Cancelled: "bg-red-100 text-red-800",
    Returned: "bg-red-100 text-red-800",
    ReturnRejected: "bg-red-100 text-red-800",
    ReturnRequested: "bg-yellow-100 text-yellow-800",
    ReturnApproved: "bg-green-100 text-green-800",
    Pending: "bg-yellow-100 text-yellow-800",
    Processing: "bg-yellow-100 text-yellow-800",
    Shipped: "bg-blue-100 text-blue-800",
    ReplacementRequested: "bg-yellow-100 text-yellow-800",
    ReplacementApproved: "bg-blue-100 text-blue-800",
    ReplacementShipped: "bg-purple-100 text-purple-800",
    ReplacementCompleted: "bg-green-100 text-green-800",
    ReplacementRejected: "bg-red-100 text-red-800",
  };
  return classes[status] || "bg-gray-100 text-gray-800";
};

const TransactionsManagement = () => {
  const navigate = useNavigate();
  const [allTransactions, setAllTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    transactionId: "",
    customer: "",
    paymentMethod: "",
    status: "All",
    startDate: "",
    endDate: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, "0")} ${date.toLocaleString(
      "default",
      { month: "short" }
    )} ${date.getFullYear()} ${date
      .getHours()
      .toString()
      .padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
  };

  const fetchAllTransactions = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/orders/admin/getAllTransactions");
      if (response.data.success) {
        let data = response.data.data || [];
        // Sort by createdAt descending (newest first)
        data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setAllTransactions(data);
        setFilteredTransactions(data);
        setPagination((prev) => ({ ...prev, total: data.length, page: 1 }));
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilteredTransactions = async () => {
    try {
      const response = await axios.get(
        `/api/orders/admin/getFilteredTransactions`,
        {
          params: {
            customer: filters.customer,
          },
        }
      );

      if (response.data.success) {
        let { transactions, pagination: pag } = response.data.data;

        // Sort transactions by date
        transactions.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        // Apply status filter on API result
        if (filters.status !== "All") {
          transactions = transactions.filter(
            (tx) => tx.orderStatus === filters.status
          );
        }

        setFilteredTransactions(transactions);
        setPagination({
          total: transactions.length,
          page: 1,
          limit: pag?.limit || 10,
        });
      }
    } catch (error) {
      console.error("Error fetching filtered transactions:", error);
    }
  };

  const applyFilters = () => {
    let filtered = allTransactions;
    if (filters.customer.trim()) {
      fetchFilteredTransactions();
      return;
    }

    // Apply status filter if not "All"
    if (filters.status !== "All") {
      filtered = filtered.filter((tx) => tx.orderStatus === filters.status);
    }
    // Optionally clear the list or show all
    setFilteredTransactions(filtered);
    setPagination((prev) => ({
      ...prev,
      total: filtered.length,
      page: 1,
      limit: prev.limit || 10,
    }));
  };

  useEffect(() => {
    fetchAllTransactions();
  }, []);

  // Reapply filters every time filters or allTransactions state changes
  useEffect(() => {
    applyFilters();
  }, [filters.customer, filters.status, allTransactions]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleStatusClick = (status) => {
    setFilters((prev) => ({ ...prev, status }));
  };

  const handlePageChange = (pageNumber) => {
    setPagination((prev) => ({ ...prev, page: pageNumber }));
  };

  const handleResetFilters = () => {
    setFilters({
      transactionId: "",
      customer: "",
      paymentMethod: "",
      status: "All",
      startDate: "",
      endDate: "",
    });
  };

  const getPaginatedTransactions = () => {
    const start = (pagination.page - 1) * pagination.limit;
    return filteredTransactions.slice(start, start + pagination.limit);
  };

  const hasReturnedProducts = (products) =>
    products?.some((p) => p.returnDetails?.status === "Returned");

  // FIX: Validate pagination.limit to avoid invalid array length error
  const totalPages =
    pagination.limit > 0 ? Math.ceil(pagination.total / pagination.limit) : 0;

  const currentTransactions = getPaginatedTransactions();

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-4xl font-bold text-blue-700 mb-6">
        Transaction Management
      </h1>

      {/* Status Filter Buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => handleStatusClick("All")}
          className={`px-3 py-1 rounded-full text-sm ${
            filters.status === "All"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          All
        </button>
        {ALL_STATUSES.map((status) => (
          <button
            key={status}
            onClick={() => handleStatusClick(status)}
            className={`px-3 py-1 rounded-full text-sm ${
              filters.status === status
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {statusDisplayNames[status] || status}
          </button>
        ))}
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 text-sm">
        <input
          type="text"
          name="customer"
          value={filters.customer}
          onChange={handleFilterChange}
          placeholder="Customer"
          className="border rounded px-3 py-2"
        />
        <button
          onClick={applyFilters}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Search
        </button>
        <button
          onClick={handleResetFilters}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded"
        >
          Reset
        </button>
      </div>

      {/* Transactions Table */}
      <div className="overflow-auto max-h-[500px] rounded-lg shadow-md bg-white">
        <table className="min-w-full border-collapse text-sm">
          <thead className="sticky top-0 bg-blue-100 z-10">
            <tr>
              {[
                "Transaction ID",
                "Order ID",
                // "User ID",
                "Amount",
                "Customer",
                "Status",
                "Payment Method",
                "Gateway",
                "Date",
                "Actions",
              ].map((h) => (
                <th
                  key={h}
                  className="text-left px-6 py-3 text-sm font-semibold text-gray-700 border-b"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700">
            {loading ? (
              <tr>
                <td colSpan="8" className="text-center py-8 text-gray-500">
                  Loading transactions...
                </td>
              </tr>
            ) : currentTransactions.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-8 text-gray-500">
                  No transactions found.
                </td>
              </tr>
            ) : (
              currentTransactions.map((tx) => (
                <tr
                  key={tx.transactionId}
                  className={`border-b ${
                    hasReturnedProducts(tx.products) ? "bg-red-100" : ""
                  }`}
                >
                  <td className="px-6 py-3">{tx.transactionId}</td>
                  <td className="px-6 py-3">{tx.OrderID || tx._id}</td>
                  {/* <td className="px-6 py-3">
                    {tx.userId?._id || tx.userId || "N/A"}
                  </td> */}
                  <td className="px-6 py-3">
                    ₹
                    {typeof tx.amount === "number"
                      ? tx.amount.toFixed(2)
                      : typeof tx.totalAmount === "number"
                      ? tx.totalAmount.toFixed(2)
                      : "0.00"}
                  </td>

                  <td className="px-6 py-3">{tx.customerName}</td>
                  <td className="px-6 py-3">
                    <button
                      onClick={() => handleStatusClick(tx.orderStatus)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer ${getStatusClass(
                        tx.orderStatus
                      )}`}
                      title="Click to filter"
                    >
                      {statusDisplayNames[tx.orderStatus] || tx.orderStatus}
                    </button>
                  </td>
                  <td className="px-6 py-3">{tx.paymentMethod}</td>
                  <td className="px-6 py-3">{tx.gateway}</td>
                  <td className="px-6 py-3">{formatDate(tx.createdAt)}</td>
                  <td className="px-6 py-3">
                    <button
                      onClick={() => {
                        setSelectedTransaction(tx);
                        setShowDetails(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 font-semibold"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4 text-sm">
        <div>
          Showing{" "}
          {pagination.total === 0
            ? 0
            : (pagination.page - 1) * pagination.limit + 1}{" "}
          - {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
          {pagination.total} transactions
        </div>
        <div className="flex gap-2">
          <button
            disabled={pagination.page === 1}
            onClick={() => handlePageChange(pagination.page - 1)}
            className={`px-3 py-1 rounded ${
              pagination.page === 1
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-600 text-white"
            }`}
          >
            Prev
          </button>
          {totalPages > 0 &&
            [...Array(totalPages).keys()].map((i) => {
              const pageNum = i + 1;
              if (
                pageNum === 1 ||
                pageNum === totalPages ||
                (pageNum >= pagination.page - 2 &&
                  pageNum <= pagination.page + 2)
              ) {
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-1 rounded ${
                      pageNum === pagination.page
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              }
              if (
                (pageNum === pagination.page - 3 && pageNum > 1) ||
                (pageNum === pagination.page + 3 && pageNum < totalPages)
              ) {
                return (
                  <span
                    key={pageNum}
                    className="px-3 py-1 text-gray-500 select-none"
                  >
                    ...
                  </span>
                );
              }
              return null;
            })}
          <button
            disabled={pagination.page === totalPages || totalPages === 0}
            onClick={() => handlePageChange(pagination.page + 1)}
            className={`px-3 py-1 rounded ${
              pagination.page === totalPages || totalPages === 0
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-600 text-white"
            }`}
          >
            Next
          </button>
        </div>
      </div>

      {/* Details Modal */}
      {showDetails && selectedTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-auto shadow-lg p-6 relative">
            <button
              className="absolute top-2 right-2 text-gray-700 hover:text-gray-900 font-bold text-xl"
              onClick={() => setShowDetails(false)}
              aria-label="Close details modal"
            >
              &times;
            </button>
            <h2 className="text-2xl font-semibold mb-4">Transaction Details</h2>

            <p>
              <strong>Transaction ID:</strong>{" "}
              {selectedTransaction.transactionId}
            </p>
           <p>
  <strong>Order ID:</strong><span  className="text-blue-400" onClick={() =>navigate(`/admin/orderdetails/${selectedTransaction.OrderID || selectedTransaction._id}`)}>{selectedTransaction.OrderID || selectedTransaction._id}</span> 
</p>
<p>
  <strong>User ID:</strong><span  className="text-blue-400"  onClick={() => navigate(`/customers/${selectedTransaction.userId?._id || selectedTransaction.userId}`)} > {selectedTransaction.userId?._id || selectedTransaction.userId || "N/A"}</span>
</p>
            <p>
              <strong>Customer:</strong> {selectedTransaction.customerName}
            </p>
            <p>
              <strong>Amount:</strong> ₹
              {(
                selectedTransaction.totalAmount ?? selectedTransaction.amount
              )?.toFixed(2)}
            </p>

            <p>
              {" "}
              <strong>Status:</strong>
              <span
                className={`px-2 py-1 rounded-full ${getStatusClass(
                  selectedTransaction.orderStatus
                )}`}
              >
                {statusDisplayNames[selectedTransaction.orderStatus] ||
                  selectedTransaction.orderStatus}
              </span>
            </p>
            <p>
              <strong>Payment Method:</strong>{" "}
              {selectedTransaction.paymentMethod}
            </p>
            <p>
              <strong>Gateway:</strong> {selectedTransaction.gateway}
            </p>
            <p>
              <strong>Date:</strong> {formatDate(selectedTransaction.createdAt)}
            </p>

            {/* Products Table */}
            <div className="mt-4 overflow-auto max-h-72 border rounded">
              <table className="min-w-full border-collapse text-sm">
                <thead className="bg-gray-200 sticky top-0 z-10">
                  <tr>
                    <th className="border px-4 py-2 text-left">Product ID</th>
                    <th className="border px-4 py-2 text-left">Quantity</th>
                    <th className="border px-4 py-2 text-left">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedTransaction.products?.map((product, idx) => (
                    <tr
                      key={`${product.productid || product.productId}-${idx}`}
                      className={`border-b ${
                        product.returnDetails?.status === "Returned"
                          ? "bg-red-100"
                          : ""
                      }`}
                    >
                      <td
                        className="px-4 py-2 text-blue-400"
                        onClick={() =>
                          navigate(`/product/${product.productId}`)
                        }
                      >
                        {product.productid || product.productId || "Unknown ID"}
                      </td>
                      <td className="px-4 py-2">{product.quantity}</td>
                      <td className="px-4 py-2">₹{product.totalAmount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionsManagement;
