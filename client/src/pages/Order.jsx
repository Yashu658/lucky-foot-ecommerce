import { useEffect, useState } from "react";
import axios from "../config/api";
import {
  FaTruck,
  FaCheckCircle,
  FaTimesCircle,
  FaRupeeSign,
  FaBoxOpen,
  FaExchangeAlt,
} from "react-icons/fa";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { MdPayment } from "react-icons/md";
import { GiReturnArrow } from "react-icons/gi";
import { BsQuestionCircleFill } from "react-icons/bs";
import { FaStar } from "react-icons/fa";
import toast from "react-hot-toast";

const Order = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeReturnOrderId, setActiveReturnOrderId] = useState(null);
  const [returnReason, setReturnReason] = useState("");
  const [replaceReason, setReplaceReason] = useState("");
  const [replaceSize, setReplaceSize] = useState("");
  const [loadingReturns, setLoadingReturns] = useState({});
  const [loadingReplacements, setLoadingReplacements] = useState({});
  const [selectedProductId, setSelectedProductId] = useState("");
  const [productRatings, setProductRatings] = useState({});
  const [replaceQuantity, setReplaceQuantity] = useState(1);
  const [activeReplacement, setActiveReplacement] = useState({
    orderId: null,
    productId: null,
  });
  const [loadingRatings, setLoadingRatings] = useState(false);

  const isAdminRoute = location.pathname.startsWith("/admin/orders");

  const fetchUserReviews = async (products) => {
    setLoadingRatings(true);
    try {
      if (!products || products.length === 0) return;

      const productIds = products.map(
        (product) => product.productId?._id || product._id
      );

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

      setProductRatings(ratingsMap);
    } catch (error) {
      console.error("Failed to fetch user reviews:", error);
    } finally {
      setLoadingRatings(false);
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get("/api/orders/user");
        const ordersData = res.data.orders || [];
        setOrders(ordersData);

        // Collect all product IDs from all orders
        const allProducts = ordersData.flatMap((order) => order.products || []);

        // Fetch user reviews after order is loaded
        if (!isAdminRoute) {
          await fetchUserReviews(allProducts);
        }
      } catch (error) {
        console.error("Failed to fetch orders", error);
        toast.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchOrders();
    }
  }, [user]);

  const getStatusBadge = (order) => {
    const status = order?.orderStatus?.toLowerCase?.();
    const paymentStatus = order?.paymentStatus?.toLowerCase?.();

    if (!status) {
      return (
        <span className="flex items-center gap-2 text-gray-500 font-semibold">
          <FaBoxOpen /> Status Unknown
        </span>
      );
    }

    if (status === "cancelled") {
      return (
        <span className="flex items-center gap-2 text-red-600 font-semibold">
          <FaTimesCircle /> Cancelled
        </span>
      );
    }

    if (status === "delivered") {
      return (
        <span className="flex items-center gap-2 text-green-600 font-semibold">
          <FaCheckCircle /> Delivered
        </span>
      );
    }

    if (paymentStatus === "pending" && order?.paymentMethod === "cod") {
      return (
        <span className="flex items-center gap-2 text-yellow-600 font-semibold">
          <MdPayment /> Payment Pending (COD)
        </span>
      );
    }

    if (status === "returnrequested") {
      return (
        <span className="flex items-center gap-2 text-orange-500 font-semibold">
          <FaBoxOpen /> Return Requested
        </span>
      );
    }

    if (status === "returned") {
      return (
        <span className="flex items-center gap-2 text-red-600 font-semibold">
          <GiReturnArrow /> Returned
        </span>
      );
    }
    if (status === "replacementrequested") {
      return (
        <span className="flex items-center gap-2 text-purple-500 font-semibold">
          <FaExchangeAlt /> Replacement Requested
        </span>
      );
    }
    if (status === "replacementcompleted") {
      return (
        <span className="flex items-center gap-2 text-green-600 font-semibold">
          <FaExchangeAlt /> Replacement Completed
        </span>
      );
    }

    return (
      <span className="flex items-center gap-2 text-blue-600 font-semibold">
        <FaTruck /> {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const handleTrackOrder = (orderId) => {
    navigate(`/track-order/${orderId}`);
  };

  const isReturnWindowExpired = (deliveredAt) => {
    if (!deliveredAt) return true;
    const deliveredDate = new Date(deliveredAt);
    const currentDate = new Date();

    const deliveredUTC = Date.UTC(
      deliveredDate.getFullYear(),
      deliveredDate.getMonth(),
      deliveredDate.getDate()
    );
    const currentUTC = Date.UTC(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate()
    );

    const diffDays = (currentUTC - deliveredUTC) / (1000 * 60 * 60 * 24);
    return diffDays > 4;
  };

  const getRemainingReturnDays = (deliveredAt) => {
    if (!deliveredAt) return 0;
    const deliveredDate = new Date(deliveredAt);
    const currentDate = new Date();
    const diffTime = currentDate - deliveredDate;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return Math.max(0, Math.ceil(3 - diffDays));
  };

  const handleReturnRequest = async (orderId, productId) => {
    if (!returnReason.trim()) {
      toast.error("Please provide a reason for return");
      return;
    }

    setLoadingReturns((prev) => ({ ...prev, [productId]: true }));

    try {
      const response = await axios.post(
        `/api/orders/user/order/${orderId}/return`,
        {
          reason: returnReason.trim(),
          productId: productId.toString(),
        }
      );

      toast.success(response.data.message || "Return request submitted");

      setOrders(
        orders.map((order) => {
          if (order._id === orderId) {
            const updatedProducts = order.products.map((p) => {
              if (p.productId?._id.toString() === productId.toString()) {
                return {
                  ...p,
                  returnDetails: {
                    ...p.returnDetails,
                    requested: true,
                    reason: returnReason.trim(),
                    status: "ReturnRequested",
                    requestedAt: new Date(),
                  },
                };
              }
              return p;
            });

            return {
              ...order,
              products: updatedProducts,
              orderStatus: "ReturnRequested",
            };
          }
          return order;
        })
      );

      setActiveReturnOrderId(null);
      setReturnReason("");
    } catch (error) {
      console.error("Return error:", error);
      toast.error(error.response?.data?.message || "Failed to request return");
    } finally {
      setLoadingReturns((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const handleReplacementRequest = async (orderId, productId) => {
    if (!replaceReason.trim()) {
      toast.error("Please provide a reason for replacement");
      return;
    }

    if (!replaceSize) {
      toast.error("Please select a replacement size");
      return;
    }

    // Find the product to get max quantity
    const order = orders.find((o) => o._id === orderId);
    const product = order.products.find((p) => p.productId._id === productId);

    if (replaceQuantity > product.quantity) {
      toast.error(`Quantity cannot exceed ${product.quantity}`);
      return;
    }

    setLoadingReplacements((prev) => ({ ...prev, [productId]: true }));

    try {
      const response = await axios.post(
        `/api/orders/user/order/${orderId}/replacement`,
        {
          reason: replaceReason.trim(),
          productId: productId.toString(),
          replacementSize: replaceSize,
          quantity: replaceQuantity,
        }
      );

      toast.success(response.data.message || "Replacement request submitted");

      setOrders(
        orders.map((order) => {
          if (order._id === orderId) {
            const updatedProducts = order.products.map((p) => {
              if (p.productId?._id.toString() === productId.toString()) {
                return {
                  ...p,
                  replacementDetails: {
                    ...p.replacementDetails,
                    requested: true,
                    reason: replaceReason.trim(),
                    replacementSize: replaceSize,
                    status: "ReplacementRequested",
                    requestedAt: new Date(),
                  },
                };
              }
              return p;
            });

            return {
              ...order,
              products: updatedProducts,
              orderStatus: "ReplacementRequested",
            };
          }
          return order;
        })
      );

      setActiveReplacement({ orderId: null, productId: null });
      setReplaceReason("");
      setReplaceSize("");
    } catch (error) {
      console.error("Replacement error:", error);
      let errorMessage = "Failed to request replacement";
      if (error.response) {
        if (error.response.status === 400) {
          errorMessage = error.response.data.message || "Invalid request data";
        } else if (error.response.status === 404) {
          errorMessage = "Product or order not found";
        } else if (error.response.status === 409) {
          errorMessage = "Selected size is no longer available";
        }
      }
      toast.error(errorMessage);
    } finally {
      setLoadingReplacements((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const handleViewDetails = (orderId) => {
    navigate(`/orderdetails/${orderId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <FaBoxOpen className="mx-auto text-5xl text-gray-400 mb-4" />
        <h3 className="text-xl font-medium text-gray-600">
          You haven't placed any orders yet
        </h3>
        <button
          onClick={() => navigate("/")}
          className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <FaBoxOpen className="text-indigo-600" />
        Your Orders
      </h2>

      <div className="space-y-6">
        {orders.map((order) => (
          <div
            key={order._id}
            className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="p-6 bg-gray-50 border-b">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Order #{order.orderId || order._id}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Placed on{" "}
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  {order.deliveredAt && (
                    <p className="text-gray-600 text-sm">
                      Delivered on{" "}
                      {new Date(order.deliveredAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end">
                  <div className="mb-2">{getStatusBadge(order)}</div>
                  <p className="text-lg font-bold flex items-center">
                    <FaRupeeSign className="mr-1" />
                    {order.totalAmount?.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {order.products.map((item) => {
                  const productId = item.productId?._id || item._id;
                  const userRating = productRatings[productId] || 0;
                  //console.log(productId)
                  return (
                    <div key={item._id} className="flex gap-4">
                      <div>
                        <Link
                          to={`/product/${item.productId?._id || item._id}`}
                          className="w-24 h-24 shrink-0"
                        >
                          <img
                            src={
                              item.image?.[0] ||
                              item.productId?.image?.[0] ||
                              "/placeholder-product.jpg"
                            }
                            alt={item.name || item.productId?.name || "Product"}
                            className="w-20 h-20 rounded-lg object-cover border"
                            onError={(e) => {
                              e.target.src = "/placeholder-product.jpg";
                            }}
                          />
                        </Link>
                        <p
                          onClick={async () => {
                            try {
                              // Check order status before navigating
                              const res = await axios.get(
                                `/api/orders/status?productId=${
                                  item.productId?._id || item._id
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
                              } else if (
                                !allowedStatuses.includes(orderStatus)
                              ) {
                                toast.error(
                                  "Only delivered items are eligible for reviews."
                                );
                              } else {
                                navigate(
                                  `/review/${item.productId?._id || item._id}`
                                );
                              }
                            } catch (error) {
                              toast.error(
                                "Something went wrong while checking review eligibility."
                              );
                            }
                          }}
                          className={`text-sm font-semibold cursor-pointer mt-1 flex items-center justify-center ${
                            userRating ? "text-yellow-600" : "text-gray-600"
                          }`}
                        >
                          {userRating ? (
                            <>
                              Rated: {userRating}
                              <FaStar className="ml-1 text-xs text-yellow-400" />
                            </>
                          ) : (
                            "Not rated"
                          )}
                        </p>
                      </div>

                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800 line-clamp-2">
                          {item.name ||
                            item.productId?.name ||
                            "Product not available"}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Size: {item.selectedSize || "N/A"}
                        </p>
                        <p className="text-sm text-gray-600">
                          Qty: {item.quantity} × ₹
                          {item.priceAtPurchase?.toFixed(2) || "0.00"}
                        </p>
                        {item.discountAtPurchase > 0 && (
                          <p className="text-sm text-green-600">
                            {item.discountAtPurchase}% off
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-wrap gap-3 justify-between border-t pt-4">
                <button
                  onClick={() => handleViewDetails(order._id)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
                >
                  <BsQuestionCircleFill />
                  View Details
                </button>

                {(() => {
                  // Statuses where we only show track order button
                  const isTrackOnlyStatus = [
                    "Pending",
                    "Processing",
                    "Shipped",
                  ].includes(order.orderStatus);

                  if (isTrackOnlyStatus) {
                    return (
                      <button
                        onClick={() => handleTrackOrder(order._id)}
                        className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 flex items-center gap-2"
                      >
                        <FaTruck />
                        Track Order
                      </button>
                    );
                  }
                  const isDelivered = order.orderStatus === "Delivered";

                  const returnableProduct = order.products.find((item) => {
                    const returnStatus = item.returnDetails?.status || "None";
                    const replaceStatus =
                      item.replacementDetails?.status || "None";

                    const sizes = item.size || item.productId?.size || [];
                    const hasAlternativeSizes = sizes.some(
                      (s) => s.size !== item.selectedSize && s.quantity > 0
                    );

                    //console.log("Full ProductId Object Debug:", item.productId);
                    return (
                      order.orderStatus === "Delivered" &&
                      !isReturnWindowExpired(order.deliveredAt) &&
                      ![
                        "ReturnRequested",
                        "ReturnApproved",
                        "Returned",
                        "ReturnRejected",
                      ].includes(returnStatus) &&
                      ![
                        "ReplacementRequested",
                        "ReplacementApproved",
                        "ReplacementCompleted",
                        "ReplacementRejected",
                      ].includes(replaceStatus) &&
                      sizes.some(
                        (s) => s.size !== item.selectedSize && s.quantity > 0
                      )
                    );
                  });

                  const replaceableProduct = order.products.find((item) => {
                    const returnStatus = item.returnDetails?.status || "None";
                    const replaceStatus =
                      item.replacementDetails?.status || "None";
                    const hasSizeInfo =
                      item.productId?.size &&
                      Array.isArray(item.productId.size);
                    const hasAlternativeSizes =
                      hasSizeInfo &&
                      item.productId.size.some(
                        (s) => s.size !== item.selectedSize && s.quantity > 0
                      );

                    return (
                      order.orderStatus === "Delivered" &&
                      !isReturnWindowExpired(order.deliveredAt) &&
                      ![
                        "ReturnRequested",
                        "ReturnApproved",
                        "Returned",
                        "ReturnRejected",
                      ].includes(returnStatus) &&
                      ![
                        "ReplacementRequested",
                        "ReplacementApproved",
                        "ReplacementCompleted",
                        "ReplacementRejected",
                      ].includes(replaceStatus) &&
                      item.productId?.size?.some(
                        (s) => s.size !== item.selectedSize && s.quantity > 0
                      )
                    );
                  });

                  const hasReturnRejected = order.products.some(
                    (item) => item.returnDetails?.status === "ReturnRejected"
                  );
                  const hasReplaceRejected = order.products.some(
                    (item) =>
                      item.replacementDetails?.status === "ReplacementRejected"
                  );

                  if (activeReturnOrderId === order._id) {
                    return (
                      <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                        <input
                          type="text"
                          value={returnReason}
                          onChange={(e) => setReturnReason(e.target.value)}
                          placeholder="Why do you want to return this item?"
                          className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ring-indigo-500"
                        />
                        <button
                          onClick={() =>
                            handleReturnRequest(
                              order._id,
                              returnableProduct.productId?._id
                            )
                          }
                          disabled={
                            loadingReturns[returnableProduct.productId?._id]
                          }
                          className={`px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 ${
                            loadingReturns[returnableProduct.productId?._id]
                              ? "opacity-70 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          {loadingReturns[returnableProduct.productId?._id]
                            ? "Submitting..."
                            : "Submit Return"}
                        </button>
                        <button
                          onClick={() => setActiveReturnOrderId(null)}
                          className="px-4 py-2 bg-gray-200 text-gray-600 rounded-md hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                      </div>
                    );
                  }

                  if (activeReplacement.orderId === order._id) {
                    return (
                      <div className="flex flex-col gap-3 w-[400px]">
                        {order.products.length > 1 && (
                          <select
                            value={activeReplacement.productId}
                            onChange={(e) =>
                              setActiveReplacement((prev) => ({
                                ...prev,
                                productId: e.target.value,
                              }))
                            }
                            className="px-4 py-2 border rounded-md"
                          >
                            <option value="">Select Product</option>
                            {order.products.map((product) => {
                              const sizes =
                                product.size || product.productId?.size || [];
                              const canReplace =
                                product.returnDetails?.status === "None" &&
                                product.replacementDetails?.status === "None" &&
                                sizes.some(
                                  (s) =>
                                    s.size !== product.selectedSize &&
                                    s.quantity > 0
                                );

                              return (
                                <option
                                  key={product._id}
                                  value={product.productId._id}
                                  disabled={!canReplace}
                                >
                                  {product.productId?.name || "Unknown Product"}{" "}
                                  - {product.selectedSize}
                                  {!canReplace &&
                                    " (Not eligible for replacement)"}
                                </option>
                              );
                            })}
                          </select>
                        )}

                        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                          <input
                            type="text"
                            value={replaceReason}
                            onChange={(e) => setReplaceReason(e.target.value)}
                            placeholder="Why do you want to replace this item?"
                            className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ring-indigo-500"
                          />
                          <select
                            value={replaceSize}
                            onChange={(e) => setReplaceSize(e.target.value)}
                            className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ring-indigo-500"
                            disabled={
                              !activeReplacement.productId &&
                              order.products.length > 1
                            }
                          >
                            <option value="">Select new size</option>
                            {(() => {
                              const product =
                                order.products.find(
                                  (p) =>
                                    p.productId._id ===
                                    activeReplacement.productId
                                ) || replaceableProduct;

                              console.log("Available sizes for replacement:", {
                                productId: product?.productId?._id,
                                currentSize: product?.selectedSize,
                                allSizes: product?.productId?.size,
                                availableSizes:
                                  product?.productId?.size?.filter(
                                    (s) =>
                                      s.size !== product?.selectedSize &&
                                      s.quantity > 0
                                  ),
                              });

                              return (product?.productId?.size || [])
                                .filter(
                                  (s) =>
                                    s.size !== product.selectedSize &&
                                    s.quantity > 0
                                )
                                .map((size) => (
                                  <option key={size.size} value={size.size}>
                                    {size.size} (Available: {size.quantity})
                                  </option>
                                ));
                            })()}
                          </select>
                        </div>

                        {/* Quantity Selection */}
                        <div className="flex items-center gap-2">
                          <label className="text-sm font-medium">
                            Quantity:
                          </label>
                          <input
                            type="number"
                            min="1"
                            max={
                              order.products.find(
                                (p) =>
                                  p.productId._id ===
                                  activeReplacement.productId
                              )?.quantity || 1
                            }
                            value={replaceQuantity}
                            onChange={(e) =>
                              setReplaceQuantity(
                                Math.max(
                                  1,
                                  Math.min(
                                    parseInt(e.target.value) || 1,
                                    order.products.find(
                                      (p) =>
                                        p.productId._id ===
                                        activeReplacement.productId
                                    )?.quantity || 1
                                  )
                                )
                              )
                            }
                            className="w-20 px-2 py-1 border rounded"
                          />
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              handleReplacementRequest(
                                order._id,
                                activeReplacement.productId ||
                                  replaceableProduct.productId._id,
                                replaceSize,
                                replaceQuantity // Pass quantity to handler
                              )
                            }
                            disabled={!replaceSize || !replaceReason}
                            className={`px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 ${
                              !replaceSize || !replaceReason
                                ? "opacity-70 cursor-not-allowed"
                                : ""
                            }`}
                          >
                            Submit Replacement
                          </button>
                          <button
                            onClick={() => {
                              setActiveReplacement({
                                orderId: null,
                                productId: null,
                              });
                              setReplaceReason("");
                              setReplaceSize("");
                              setReplaceQuantity(1); // Reset quantity
                            }}
                            className="px-4 py-2 bg-gray-200 text-gray-600 rounded-md hover:bg-gray-300"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div className="flex gap-2">
                      {isDelivered && !hasReturnRejected && (
                        <button
                          onClick={() => {
                            // Find the first eligible product for replacement
                            const eligibleProduct = order.products.find(
                              (item) => {
                                const returnStatus =
                                  item.returnDetails?.status || "None";
                                const replaceStatus =
                                  item.replacementDetails?.status || "None";
                                const hasAlternativeSizes =
                                  item.productId?.size?.some(
                                    (s) =>
                                      s.size !== item.selectedSize &&
                                      s.quantity > 0
                                  );

                                return (
                                  returnStatus === "None" &&
                                  replaceStatus === "None" &&
                                  hasAlternativeSizes
                                );
                              }
                            );

                            if (eligibleProduct) {
                              setActiveReplacement({
                                orderId: order._id,
                                productId: eligibleProduct.productId._id,
                              });
                              setSelectedProductId(
                                eligibleProduct.productId._id
                              );
                              setReplaceSize(""); // Reset size selection
                            }
                          }}
                          disabled={
                            activeReturnOrderId === order._id ||
                            hasReplaceRejected ||
                            !order.products.some((item) => {
                              const returnStatus =
                                item.returnDetails?.status || "None";
                              const replaceStatus =
                                item.replacementDetails?.status || "None";
                              const hasAlternativeSizes =
                                item.productId?.size?.some(
                                  (s) =>
                                    s.size !== item.selectedSize &&
                                    s.quantity > 0
                                );

                              return (
                                returnStatus === "None" &&
                                replaceStatus === "None" &&
                                hasAlternativeSizes
                              );
                            }) ||
                            isReturnWindowExpired(order.deliveredAt)
                          }
                          className={`px-4 py-2 bg-purple-100 text-purple-600 hover:bg-purple-300 hover:text-white rounded-lg flex items-center gap-2 ${
                            activeReturnOrderId === order._id ||
                            hasReplaceRejected ||
                            !order.products.some((item) => {
                              const returnStatus =
                                item.returnDetails?.status || "None";
                              const replaceStatus =
                                item.replacementDetails?.status || "None";
                              const hasAlternativeSizes =
                                item.productId?.size?.some(
                                  (s) =>
                                    s.size !== item.selectedSize &&
                                    s.quantity > 0
                                );

                              return (
                                returnStatus === "None" &&
                                replaceStatus === "None" &&
                                hasAlternativeSizes
                              );
                            }) ||
                            isReturnWindowExpired(order.deliveredAt)
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          <FaExchangeAlt />
                          Replace Item
                        </button>
                      )}

                      {/* Return Button - Only show for delivered orders within return window */}
                      {isDelivered && !hasReplaceRejected && (
                        <button
                          onClick={() => setActiveReturnOrderId(order._id)}
                          disabled={
                            activeReplacement.orderId === order._id ||
                            hasReturnRejected ||
                            !returnableProduct ||
                            isReturnWindowExpired(order.deliveredAt)
                          }
                          className={`px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg flex items-center gap-2 ${
                            activeReplacement.orderId === order._id ||
                            hasReturnRejected ||
                            !returnableProduct ||
                            isReturnWindowExpired(order.deliveredAt)
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          <GiReturnArrow />
                          Return Item
                        </button>
                      )}
                    </div>
                  );
                })()}
              </div>

              <div className="flex justify-between items-center w-full mt-2">
                {order.products.some((item) => {
                  const returnStatus = item.returnDetails?.status || "None";
                  const replaceStatus =
                    item.replacementDetails?.status || "None";
                  return (
                    order.orderStatus === "Delivered" &&
                    !["ReturnRequested", "Returned", "ReturnRejected"].includes(
                      returnStatus
                    ) &&
                    ![
                      "ReplacementRequested",
                      "ReplacementCompleted",
                      "ReplacementRejected",
                    ].includes(replaceStatus)
                  );
                }) && (
                  <div className="text-sm text-red-600 ml-auto">
                    {(() => {
                      const daysRemaining = getRemainingReturnDays(
                        order.deliveredAt
                      );
                      return daysRemaining > 0
                        ? `${daysRemaining} day${
                            daysRemaining > 1 ? "s" : ""
                          } remaining to return/replace`
                        : "Your return/replace window has expired";
                    })()}
                  </div>
                )}
              </div>

              {order.products.some((item) => {
                const returnStatus = item.returnDetails?.status || "None";
                return returnStatus === "ReturnRejected";
              }) && (
                <div className="mt-1 p-1 bg-red-50 text-red-600 rounded text-sm">
                  Your return request has been rejected
                </div>
              )}

              {order.products.some((item) => {
                const replaceStatus = item.replacementDetails?.status || "None";
                return replaceStatus === "ReplacementRejected";
              }) && (
                <div className="mt-1 p-1 bg-red-50 text-red-600 rounded text-sm">
                  Your replacement request has been rejected
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Order;
