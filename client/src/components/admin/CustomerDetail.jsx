import React, { useState, useEffect } from "react";
import axios from "../../config/api";
import { toast } from "react-hot-toast";
import { useParams, useNavigate } from "react-router-dom";
import { FiEye } from "react-icons/fi";

const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("orders");
  const [status, setStatus] = useState("");
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    if (!id) {
      toast.error("No customer ID provided");
      navigate("/");
      return;
    }

    const fetchCustomer = async () => {
      try {
        const response = await axios.get(`/api/customer/${id}`);
        const data = response.data;

        setCustomer(data.customer);
        setStatus(data.customer.status);
        setOrders(data.orders || []);
        setReviews(data.reviews || []);
        setWishlist(data.wishlist || []);
        setCart(data.cart || []);
      } catch (error) {
        toast.error("Failed to fetch customer details");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [id]);

  const handleStatusChange = async () => {
    try {
      await axios.patch(`/api/customer/${customer._id}/status`, { status });
      toast.success("Customer status updated successfully");
    } catch (error) {
      toast.error("Failed to update customer status");
      console.error(error);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return <div className="text-center py-8">Loading customer details...</div>;
  }

  if (!customer) {
    return (
      <div className="text-center py-8 text-red-500">Customer not found</div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Profile Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Customer Profile
        </h1>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex flex-col items-center">
            <img
              src={
                customer.profilePic ||
                `https://ui-avatars.com/api/?name=${customer.name}&background=random`
              }
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover mb-4"
            />
            <div className="flex items-center gap-2">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="border rounded px-3 py-1"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Blocked">Blocked</option>
              </select>
              <button
                onClick={handleStatusChange}
                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
              >
                Update
              </button>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Name</p>
              <p className="font-medium">{customer.name}</p>
            </div>
            <div>
              <p className="text-gray-600">Email</p>
              <p className="font-medium">{customer.email}</p>
            </div>
            <div>
              <p className="text-gray-600">Phone</p>
              <p className="font-medium">{customer.phone}</p>
            </div>
            <div>
              <p className="text-gray-600">Gender</p>
              <p className="font-medium">{customer.gender}</p>
            </div>
            <div>
              <p className="text-gray-600">Date of Birth</p>
              <p className="font-medium">{formatDate(customer.dob)}</p>
            </div>
            <div>
              <p className="text-gray-600">Member Since</p>
              <p className="font-medium">{formatDate(customer.createdAt)}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-green-500 p-4 rounded-lg text-center">
            <p className="text-white font-bold">Total Orders</p>
            <p className="text-2xl font-bold text-white">
              {customer.stats?.totalOrders || 0}
            </p>
          </div>
          <div className="bg-green-500 p-4 rounded-lg">
            <p className="text-white font-bold">Total Spent</p>
            <p className="text-2xl font-bold text-white">
              ₹{customer.stats?.totalSpent?.toFixed(2) || "0.00"}
            </p>
          </div>
          <div className="bg-green-500 p-4 rounded-lg text-center">
            <p className=" font-bold text-white">Delivered</p>
            <p className="text-2xl font-bold text-white">
              {customer.stats?.delivered || 0}
            </p>
          </div>
          <div className="bg-red-400 p-4 rounded-lg text-center">
            <p className="text-white font-bold">Cancelled</p>
            <p className="text-2xl font-bold text-white">
              {customer.stats?.cancelled || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b mb-4">
        {["orders", "reviews", "wishlist", "cart"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium capitalize ${
              activeTab === tab
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {activeTab === "orders" && (
          <div>
            <h2 className="text-xl font-semibold mb-4 text-blue-700">
              Order History
            </h2>
            {orders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Order ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Items
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr key={order._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                        >
                          {order._id.substring(0, 8).toUpperCase()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.products.length}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ₹{order.totalAmount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              order.orderStatus === "Delivered"
                                ? "bg-green-100 text-green-800"
                                : order.orderStatus === "Cancelled"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {order.orderStatus}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() =>
                              navigate(`/admin/orderdetails/${order._id}`)
                            }
                            title="View Product"
                            className="text-blue-500 hover:text-blue-700 px-6 py-4 "
                          >
                            <FiEye size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No orders found</p>
            )}
          </div>
        )}

        {activeTab === "reviews" && (
          <div>
            <h2 className="text-xl font-semibold mb-4 text-blue-700">
              Product Reviews
            </h2>
            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review._id} className="border-b pb-4">
                    <div className="flex justify-between">
                      <h3 className="font-medium">
                        {review.productId?.name || "Unknown Product"}
                      </h3>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={`text-lg ${
                              i < review.rating
                                ? "text-yellow-400"
                                : "text-gray-300"
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 mt-1">
                      {review.comment || "No comment provided"}
                    </p>
                    <p className="text-sm text-gray-400 mt-2">
                      {formatDate(review.createdAt)}
                    </p>
                    <div className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() =>
                          navigate(`/product/${review.productId?._id}`)
                        }
                        title="View Product"
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <FiEye size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No reviews found</p>
            )}
          </div>
        )}

        {activeTab === "wishlist" && (
          <div>
            <h2 className="text-xl font-semibold mb-4 text-blue-700">
              Wishlist Items
            </h2>
            {wishlist.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {wishlist.map((item) => (
                  <div key={item._id} className="border rounded-lg p-4">
                    <h3 className="font-medium">{item.name}</h3>
                    <div className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => navigate(`/product/${item._id}`)}
                        title="View Product"
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <FiEye size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No items in wishlist</p>
            )}
          </div>
        )}

        {activeTab === "cart" && (
          <div>
            <h2 className="text-xl font-semibold mb-4 text-blue-700">
              Cart Items
            </h2>
            {cart.length > 0 ? (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.productId._id} className="flex border-b pb-4">
                    <div>
                      <h3 className="font-medium">{item.productId.name}</h3>
                      <button
                        onClick={() =>
                          navigate(`/product/${item.productId._id}`)
                        }
                        title="View Product"
                        className="text-blue-500 hover:text-blue-700 px-6 py-4 "
                      >
                        <FiEye size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No items in cart</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDetail;
