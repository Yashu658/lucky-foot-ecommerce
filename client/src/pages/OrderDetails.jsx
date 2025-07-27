import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "../config/api";
import { Link } from "react-router-dom";
import {
  FaArrowLeft,
  FaTruck,
  FaCheckCircle,
  FaTimesCircle,
  FaExchangeAlt,
  FaStar,
} from "react-icons/fa";
import toast from "react-hot-toast";
import { PDFDownloadLink } from '@react-pdf/renderer';
import InvoicePDF from "./Buttons/InvoicePDF";
import RelatedProductsSlider from "./Slider/RelatedProductsSlider";


const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [productRatings, setProductRatings] = useState({});
  const [fullProducts, setFullProducts] = useState([]);
  const isAdminRoute = location.pathname.startsWith("/admin/orderdetails/");

  const handleStatusUpdate = async (newStatus) => {
    if (newStatus === "Cancelled") {
      setShowCancelModal(true);
      return;
    }
    try {
      const res = await axios.patch(`/api/orders/${order._id}`, {
        orderStatus: newStatus,
      });
      setOrder(res.data.order);
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      toast.error("Failed to update order status");
    }
  };

  const submitCancellation = async () => {
    if (!cancelReason.trim()) {
      toast.error("Please enter a reason.");
      return;
    }

    const endpoint = isAdminRoute
      ? `/api/orders/${order._id}`
      : `/api/orders/user/cancel/${order._id}`;

    const payload = isAdminRoute
      ? { orderStatus: "Cancelled", cancelReason }
      : {
          cancelReason,
          deliveryCharge:
            typeof order?.deliveryCharge === "number"
              ? order.deliveryCharge
              : 0,
          gstAmount: typeof order?.gstAmount === "number" ? order.gstAmount : 0,
        };

    try {
      const res = await axios.patch(endpoint, payload);
      setOrder(res.data.order);
      toast.success("Order cancelled successfully");
      setShowCancelModal(false);
      setCancelReason("");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to cancel the order"
      );
    }
  };



  const renderStatusButtons = () => {
    // 1. Only show for admin
    if (!isAdminRoute || !order || !order.products) return null;

    // 2. Hide if any product has return or replacement in progress
    const hasReturnOrReplacement = order.products.some(
      (product) =>
        (product.returnDetails?.status &&
          product.returnDetails.status !== "None") ||
        (product.replacementDetails?.status &&
          product.replacementDetails.status !== "None")
    );
    if (hasReturnOrReplacement) return null;

    // 3. Disable buttons if order is already Delivered or Cancelled
    const isDisabled = ["Delivered", "Cancelled"].includes(order.orderStatus);

    // 4. Generate buttons based on current status
    let statusOptions = [];

    switch (order.orderStatus) {
      case "Pending":
        statusOptions = ["Processing", "Cancelled"];
        break;
      case "Processing":
        statusOptions = ["Shipped", "Cancelled"];
        break;
      case "Shipped":
        statusOptions = ["Delivered", "Cancelled"];
        break;
      default:
        // For other statuses, don't show any buttons
        return null;
    }
    return (
      <div className="mt-4 space-x-2">
        {statusOptions.map((status) => {
          const isCancel = status === "Cancelled";
          return (
            <button
              key={status}
              onClick={() =>
                isCancel ? setShowCancelModal(true) : handleStatusUpdate(status)
              }
              disabled={isDisabled}
              className={`px-4 py-2 rounded-lg ${
                isCancel
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-blue-600 hover:bg-blue-700"
              } text-white transition ${
                isDisabled ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {status}
            </button>
          );
        })}
      </div>
    );
  };


  

  const renderProductActions = (product) => {
    
    return (
      <div className="text-right space-y-1 text-sm">
        {!isAdminRoute && (
          <button
            onClick={() =>
              navigate(`/product/${product.productId?._id || product._id}`)
            }
            className="mt-2 px-4 py-1 text-lg font-medium bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            Buy It Again
          </button>
        )}
      </div>
    );
  };

  const renderUserCancelButton = () => {
    // Hide cancel button for admin or if order is not in cancelable state
    if (
      isAdminRoute ||
      !["Pending", "Processing"].includes(order.orderStatus) ||
      order.isCancelled ||
      order.orderStatus === "Delivered" // Add this condition
    ) {
      return null;
    }
    return (
      <button
        onClick={() => setShowCancelModal(true)}
        className="mt-3 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
      >
        Cancel Order
      </button>
    );
  };

  const getStatus = (status) => {
    const statusMap = {
      delivered: {
        icon: <FaCheckCircle />,
        color: "text-green-600",
        text: "Delivered",
      },
      cancelled: {
        icon: <FaTimesCircle />,
        color: "text-red-600",
        text: "Cancelled",
      },
      default: {
        icon: <FaTruck />,
        color: "text-blue-600",
        text: status,
      },
    };
    const currentStatus = statusMap[status.toLowerCase()] || statusMap.default;

    return (
      <span
        className={`${currentStatus.color} font-semibold flex items-center gap-2`}
      >
        {currentStatus.icon} {currentStatus.text}
      </span>
    );
  };

  const renderOrderStatus = () => {
    if (!order) return null;

    return (
      <div>
        <div className="mt-2">{getStatus(order.orderStatus)}</div>

        {/* ✅ Show Delivered Date */}
        {order.orderStatus === "Delivered" && order.deliveredAt && (
          <p className="text-sm text-gray-500 mt-1">
            Delivered on {formatDate(order.deliveredAt)}
          </p>
        )}

        {renderStatusButtons()}
        {renderUserCancelButton()}
      </div>
    );
  };

  const fetchUserReviews = async (products) => {
    try {
      if (!products || products.length === 0) return;

      const productIds = products
        .map(
          (product) =>
            product.productId?._id?.toString() || product._id?.toString()
        )
        .filter(Boolean);
      //console.log("Fetching reviews for product IDs:", productIds);
      const res = await axios.get(`/api/reviews/check-multiple`, {
        params: {
          productIds: productIds.join(","),
        },
        withCredentials: true,
      });

      // Create a mapping of productId to rating
      const ratingsMap = {};
      res.data.forEach((review) => {
        ratingsMap[review.productId.toString()] = review.rating;
      });
      //console.log("Ratings map:", ratingsMap);
      setProductRatings(ratingsMap);
    } catch (error) {
      console.error("Failed to fetch user reviews:", error);
    }
  };

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const url = isAdminRoute
          ? `/api/orders/admin/order/${orderId}`
          : `/api/orders/user/order/${orderId}`;
        const res = await axios.get(url);
        setOrder(res.data.order);

        // Fetch user reviews after order is loaded
        if (!isAdminRoute) {
          await fetchUserReviews(res.data.order.products);
        }
      } catch (error) {
        if (error.response?.status === 404) {
          toast.error("Order not found");
        } else {
          toast.error("Failed to load order details");
        }
        navigate(isAdminRoute ? "/admin/orders" : "/account?tab=orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId, isAdminRoute, navigate]);



useEffect(() => {
  if (order?.products) {
    const fetchProductDetails = async () => {
      const details = await Promise.all(
        order.products.map(async (p) => {
          try {
            // Fetch full product details if productId exists
            if (p.productId?._id) {
              const res = await axios.get(`/api/admin/product/${p.productId._id}`);
              return res.data.product;
            }
            // Otherwise return the product data we have
            return p;
          } catch (error) {
            console.error("Failed to fetch product details:", error);
            return p; // Fallback to original product data
          }
        })
      );
      setFullProducts(details);
    };
    fetchProductDetails();
  }
}, [order]);




  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-12 w-12 border-t-2 border-indigo-600 rounded-full"></div>
      </div>
    );

  if (!order) return <div className="text-center p-6">Order not found</div>;

  const {
    _id,
    products,
    shippingAddress,
    paymentMethod,
    gateway,
    upiId,
    totalAmount,
    gstAmount,
    deliveryCharge,
    orderStatus,
    createdAt,
  } = order;
  
//   console.log('Order products:', products.map(p => ({
//   id: p._id,
//   productId: p.productId?._id,
//   hasProductId: !!p.productId,
//   gender: p.productId?.gender || p.gender,
//   category: p.productId?.category || p.category,
//   subCategory: p.productId?.subCategory || p.subCategory
// })));

  const totalMRP = products.reduce(
    (sum, p) => sum + (p.priceAtPurchase || 0) * p.quantity,
    0
  );
  const totalDiscount = products.reduce(
    (sum, p) =>
      sum +
      ((p.priceAtPurchase * (p.discountAtPurchase || 0)) / 100) * p.quantity,
    0
  );

  return (
    <div>
       <div id="invoice-content">
         <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-8">
      <button
        onClick={() =>
          navigate(
            isAdminRoute ? "/adminDashboard?orders" : "/account?tab=orders"
          )
        }
        className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold mb-4"
      >
        <FaArrowLeft /> Back
      </button>

      <div className="bg-white shadow-lg rounded-2xl p-6 flex flex-col sm:flex-row justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold text-indigo-700">Order #{_id}</h2>
          <p className="text-gray-500 mt-1">
            Placed on {formatDate(createdAt)}
          </p>

          {renderOrderStatus()}

          

          {/* Cancelled Message and Date */}
          {order.cancelReason && (
            <>
              <p className="text-sm text-red-600 mt-1 italic">
                Cancelled by {order.cancelledBy === "admin" ? "Seller" : "You"}:{" "}
                {order.cancelReason}
              </p>
              {order.cancelledAt && (
                <p className="text-sm text-gray-500 mt-1">
                  Cancelled on {formatDate(order.cancelledAt)}
                </p>
              )}
            </>
          )}
        </div>

        <div className="text-sm text-gray-600 text-right space-y-1">
          <div>
            <span className="font-semibold text-gray-900">Payment:</span>{" "}
            {paymentMethod}
          </div>
          {gateway && (
            <div>
              <span className="font-semibold text-gray-900">Gateway:</span>{" "}
              {gateway}
            </div>
          )}
          {upiId && (
            <div>
              <span className="font-semibold text-gray-900">UPI ID:</span>{" "}
              {upiId}
            </div>
          )}
        </div>
      </div>

       {/* Customer Information - Only for Admin */}
<div className="bg-white shadow-lg rounded-lg p-6 mb-6">
  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">
    Customer Details
  </h3>
  
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {/* Customer Name */}
    <div>
      <p className="text-sm font-medium text-gray-500">Customer Name</p>
      <p className="text-base font-semibold text-gray-800 mt-1">
        {order.userId?.name || "Not available"}
      </p>
    </div>

    {/* Email Address */}
    <div>
      <p className="text-sm font-medium text-gray-500">Email Address</p>
      <p className="text-base font-semibold text-gray-800 mt-1 break-all">
        {order.userId?.email || "Not available"}
      </p>
    </div>

    {/* Phone Number (for admin) */}
    {isAdminRoute && (
      <div>
        <p className="text-sm font-medium text-gray-500">Phone Number</p>
        <p className="text-base font-semibold text-gray-800 mt-1">
          {order.userId?.phone || shippingAddress.phone || "Not available"}
        </p>
      </div>
    )}

    {/* User ID (for admin) */}
    {isAdminRoute && order.userId?._id && (
      <div>
        <p className="text-sm font-medium text-gray-500">User ID</p>
        <p className="text-base font-mono text-blue-600 mt-1" 
        onClick={() => navigate(`/customers/${order.userId._id}`)}>
          {order.userId._id}
        </p>
      </div>
    )}
  </div>
</div>
      <div className="bg-white shadow-lg rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-3 text-indigo-700">
          Shipping Address
        </h3>
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          {/* Address */}
          <div className="text-gray-700 leading-6 flex-1">
            {shippingAddress.addressLine1}, {shippingAddress.addressLine2}
            <br />
            <span className="text-sm text-gray-500">Landmark:</span>{" "}
            {shippingAddress.landmark}
            <br />
            {shippingAddress.city}, {shippingAddress.state} -{" "}
            {shippingAddress.postalCode}
            <br />
            <span className="text-sm text-gray-500">Phone:</span>{" "}
            {shippingAddress.phone}
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="bg-white shadow-lg rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-4 text-indigo-700">Products</h3>
        <div className="grid gap-4">
          {products.map((product) => {
            const productId = product.productId?._id || product._id;
            const rating = productRatings ? productRatings[productId] || 0 : 0;
            return (
              <div
                key={product._id}
                className="flex flex-col sm:flex-row gap-4 border-b pb-4"
              >
                {/* Image + Rating Column */}
                <div className="w-24 shrink-0 flex flex-col items-center">
                  <Link
                    to={`/product/${product.productId?._id || product._id}`}
                    className="w-24 h-24"
                  >
                    <img
                      src={
                        product.image?.[0] ||
                        product.productId?.image?.[0] ||
                        "/placeholder-product.jpg"
                      }
                      alt={product.name || product.productId?.name || "Product"}
                      className="w-24 h-24 object-cover rounded-lg border hover:scale-105 transition-transform duration-200"
                      onError={(e) => {
                        e.target.src = "/placeholder-product.jpg";
                      }}
                    />
                  </Link>

                  <p
                    onClick={async () => {
                      try {
                        const productId =
                          product.productId?._id?.toString() ||
                          product._id?.toString();
                        if (!productId) {
                          toast.error("Product ID not found");
                          return;
                        }
                        // Check order status before navigating
                        const res = await axios.get(
                          `/api/orders/status?productId=${
                            product.productId?._id || product._id
                          }`,
                          {
                            withCredentials: true,
                          }
                        );
                        const { orderStatus, eligible } = res.data;

                        const allowedStatuses = [
                          "Delivered",
                          "ReplacementRequested",
                          "ReplacementApproved",
                          "ReplacementShipped",
                          "ReplacementCompleted",
                          "ReplacementRejected",
                        ];

                        if (!eligible) {
                          toast.error(
                            "This product isn’t eligible for review."
                          );
                        } else if (!allowedStatuses.includes(orderStatus)) {
                          toast.error(
                            "Only delivered items are eligible for reviews."
                          );
                        } else {
                          navigate(
                            `/review/${product.productId?._id || product._id}`
                          );
                        }
                      } catch (error) {
                        toast.error(
                          "Something went wrong while checking review eligibility."
                        );
                      }
                    }}
                    className={`text-sm font-semibold cursor-pointer mt-1 flex items-center justify-center ${
                      productRatings[productId]
                        ? "text-yellow-600"
                        : "text-gray-600"
                    }`}
                  >
                    Rating:{" "}
                    {productRatings && productRatings[productId]
                      ? productRatings[productId]
                      : "Not rated"}
                    <FaStar
                      className={`ml-1 text-xs ${
                        productRatings && productRatings[productId]
                          ? "text-yellow-400"
                          : "text-gray-400"
                      }`}
                    />
                    /5
                  </p>
                </div>

                {/* Product Details */}
                <div className="flex-1 space-y-1">
                  <h4 className="font-semibold text-gray-800">
                    {product.name || product.productId?.name}
                  </h4>
                  <p className="text-sm text-gray-600">
                    Size: {product.selectedSize}
                  </p>
                  <p className="text-sm text-gray-600">
                    Qty: {product.quantity}
                  </p>

                  {/* Replacement Section */}
                  {product.replacementDetails?.requested && (
                    <div className="mt-2 p-2 bg-purple-50 rounded-md border border-purple-100">
                      <div className="flex items-center gap-1 text-purple-700 font-medium">
                        <FaExchangeAlt className="text-sm" />
                        <span>Replacement Requested</span>
                      </div>
                      {product.replacementDetails.replacementSize && (
                        <p className="text-xs mt-1">
                          New Size: {product.replacementDetails.replacementSize}
                        </p>
                      )}
                      <p className="text-xs">
                        Quantity:{" "}
                        {product.replacementDetails.quantity ||
                          product.quantity}
                      </p>
                      <p className="text-xs">
                        Status:{" "}
                        <span
                          className={`font-medium ${
                            product.replacementDetails.status ===
                            "ReplacementRequested"
                              ? "text-purple-600"
                              : product.replacementDetails.status ===
                                "ReplacementApproved"
                              ? "text-blue-600"
                              : product.replacementDetails.status ===
                                "ReplacementCompleted"
                              ? "text-green-600"
                              : product.replacementDetails.status ===
                                "ReplacementRejected"
                              ? "text-red-600"
                              : "text-gray-600"
                          }`}
                        >
                          {product.replacementDetails.status}
                        </span>
                      </p>
                      {product.replacementDetails.reason && (
                        <p className="text-xs mt-1">
                          Reason: {product.replacementDetails.reason}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Price & Actions */}
                <div className="text-right space-y-1 text-sm">
                  <p>Price: ₹{product.priceAtPurchase}</p>
                  <p>Discount: {product.discountAtPurchase}%</p>
                  <p className="font-medium">
                    Total: ₹{product.totalAmount.toFixed(2)}
                  </p>
                  {renderProductActions(product)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bill Summary */}
      <div className="bg-white shadow-lg rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-4 text-indigo-700">
          Bill Summary
        </h3>
        <ul className="space-y-2 text-gray-800 text-sm sm:text-base">
          <li className="flex justify-between">
            <span>Total MRP:</span> <span>₹{(totalMRP || 0).toFixed(2)}</span>
          </li>
          <li className="flex justify-between">
            <span>Total Discount:</span>{" "}
            <span className="text-green-600">
              -₹{(totalDiscount || 0).toFixed(2)}
            </span>
          </li>
          <li className="flex justify-between">
            <span>Delivery Charge:</span> <span>₹{deliveryCharge ?? 0}</span>
          </li>
          <li className="flex justify-between">
            <span>GST:</span> <span>₹{(gstAmount || 0).toFixed(2)}</span>
          </li>
          <li className="flex justify-between font-semibold text-green-700">
            <span>You Saved:</span>{" "}
            <span>₹{(totalDiscount || 0).toFixed(2)}</span>
          </li>
          <li className="flex justify-between text-xl font-bold text-indigo-700">
            <span>Total Paid:</span>{" "}
            <span>₹{(totalAmount || 0).toFixed(2)}</span>
          </li>
        </ul>
     {order.orderStatus !== "Cancelled" && (
  <div className="mt-4">
    <PDFDownloadLink 
      document={<InvoicePDF order={order} />} 
      fileName={`invoice_${order._id}.pdf`}
    >
      {({ loading }) => (
        <button 
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition flex items-center gap-2"
          disabled={loading}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          {loading ? 'Preparing invoice...' : 'Download Invoice'}
        </button>
      )}
    </PDFDownloadLink>
  </div>
)}
      </div>
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md space-y-4">
            <h2 className="text-lg font-semibold text-red-600">Cancel Order</h2>
            <p className="text-sm text-gray-700">
              Please provide a reason for cancelling this order:
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={4}
              className="w-full border border-gray-300 rounded-md p-2"
              placeholder="Enter cancellation reason..."
            />
            {isAdminRoute && cancelReason && (
              <p className="text-sm text-red-500 mt-2 italic">
                You will cancel this order with the following reason:
                <br />"{cancelReason}"
                <br />
                <span className="text-gray-600">
                  Cancellation date: {new Date().toLocaleString()}
                </span>
              </p>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 text-gray-700 hover:text-black"
              >
                Close
              </button>
              <button
                onClick={submitCancellation}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
       </div>
       <div className="bg-gray-200 mb-10 py-2">
                 {/* Add Related Products Slider at the bottom */}
{fullProducts.length > 0 && !isAdminRoute && (
  <div className="mt-10 px-4 sm:px-6 max-w-6xl mx-auto">
    <h3 className="text-xl font-semibold mb-4 text-gray-800">You might also like</h3>
    {fullProducts.map((product) => {
      // Only render if we have all required fields
      if (product.gender && product.category && product.subCategory) {
        return (
          <RelatedProductsSlider
            key={product._id}
            currentProductId={product._id}
            gender={product.gender}
            category={product.category}
            subCategory={product.subCategory}
          />
        );
      }
      return null;
    }).filter(Boolean)}
  </div>
)}
       </div>

    </div>
   
  );
};

export default OrderDetails;
