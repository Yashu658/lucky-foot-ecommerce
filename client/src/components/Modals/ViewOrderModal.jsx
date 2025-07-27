import React from "react";

const ViewOrderModal = ({ isOpen, onClose, order }) => {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
        <h2 className="text-xl font-semibold mb-4">Order Details</h2>

        <div className="space-y-2 text-sm text-gray-700">
          <p><strong>Order ID:</strong> {order._id}</p>
          <p><strong>Customer:</strong> {order.customerName}</p>
          <p><strong>Status:</strong> {order.status}</p>
          <p><strong>Total:</strong> ₹{order.totalAmount}</p>
          <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>

          <div>
            <strong>Items:</strong>
            <ul className="list-disc pl-6">
              {order.items.map((item, idx) => (
                <li key={idx}>
                  {item.productName} × {item.quantity} — ₹{item.price}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewOrderModal;
