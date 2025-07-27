import React, { useState, useEffect,useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";

const ThankYou = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const rawProduct = location.state?.product;
  const rawProducts = location.state?.products;
  const purchased = rawProducts || (rawProduct ? [rawProduct] : []);

  // Normalize all items into the same shape
  const displayItems = purchased.map((item) => ({
    _id: item._id ?? item.product?._id ?? Math.random(),
    name: item.name ?? item.product?.name ?? "Unnamed Product",
    mrp: item.mrp ?? item.product?.mrp ?? 0,
    image: item.image ?? item.product?.image ?? [],
    quantity: item.quantity ?? 1,
  }));

   useEffect(() => {
    console.log("Data received from PaymentPage:", location.state);
  }, [location.state]);

  if (!displayItems.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center bg-gray-100 px-4">
        <h1 className="text-3xl font-bold text-red-500 mb-4">No purchase data found.</h1>
        <button
          onClick={() => navigate("/")}
          className="bg-indigo-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-indigo-700"
        >
          Go Back to Home
        </button>
      </div>
    );
  }

 return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-10">
      <div className="bg-white rounded-2xl shadow-xl max-w-5xl w-full p-8 sm:p-12 text-center">
        <div className="flex flex-col items-center mb-8">
          <FaCheckCircle className="text-green-500 text-5xl mb-3 animate-bounce" />
          <h1 className="text-4xl font-extrabold text-gray-800 mb-2">
            Thank You for Your Purchase!
          </h1>
          <p className="text-lg text-gray-600">
            We've received your order. Here's what you bought:
          </p>
        </div>

        {/* Product Display */}
        <div className="mb-10 space-y-6">
          {Array.from({ length: Math.ceil(displayItems.length / 3) }).map((_, rowIndex) => {
            const rowItems = displayItems.slice(rowIndex * 3, rowIndex * 3 + 3);
            const isLastRow = rowIndex === Math.floor((displayItems.length - 1) / 3);
            const isIncompleteRow = rowItems.length < 3;

            return (
              <div
                key={rowIndex}
                className={`grid gap-6 justify-items-center ${
                  rowItems.length === 1
                    ? "grid-cols-1 sm:grid-cols-1"
                    : rowItems.length === 2
                    ? "grid-cols-1 sm:grid-cols-2"
                    : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
                } ${isLastRow && isIncompleteRow ? "justify-center" : ""}`}
              >
                {rowItems.map((item) => (
                  <div
                    key={item._id}
                    className="bg-white border rounded-xl shadow hover:shadow-lg transition transform hover:-translate-y-1 p-4 w-full max-w-xs"
                  >
                    {item.image?.[0] && (
                      <img
                        src={item.image[0]}
                        alt={item.name}
                        className="h-32 w-full object-contain rounded-md mb-3"
                      />
                    )}
                    <h2 className="text-lg font-semibold text-gray-800 truncate text-center">
                      {item.name}
                    </h2>
                    <span className="text-sm text-gray-500 block text-center">
                      ({item.quantity} pcs)
                    </span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        <button
          onClick={() => navigate("/")}
          className="bg-indigo-600 text-white px-8 py-3 rounded-full font-medium hover:bg-indigo-700 transition shadow-lg"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
};

export default ThankYou;