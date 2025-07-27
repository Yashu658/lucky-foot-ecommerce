import React from "react";

const ViewReturnModal = ({ isOpen, onClose, ret }) => {
  if (!isOpen || !ret) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
        <h2 className="text-xl font-semibold mb-4">Return Details</h2>

        <div className="space-y-2 text-sm text-gray-700">
          <p><strong>Return ID:</strong> {ret._id}</p>
          <p><strong>Customer:</strong> {ret.customerName}</p>
          <p><strong>Order ID:</strong> {ret.orderId}</p>
          <p><strong>Reason:</strong> {ret.reason}</p>
          <p><strong>Status:</strong> {ret.status}</p>
          <p><strong>Date:</strong> {new Date(ret.createdAt).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default ViewReturnModal;
