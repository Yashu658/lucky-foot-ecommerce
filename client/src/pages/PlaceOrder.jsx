import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { IoMdClose } from "react-icons/io";
import { useCart } from "../context/CartContext";
import { FiPlus, FiMinus } from "react-icons/fi";
import toast from "react-hot-toast";
import axios from "../config/api";

const PlaceOrder = ({ isOpen = true }) => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { clearCart } = useCart();
  const shownWarnings = useRef({});
  const alertShown = useRef(false);

  // Initialize products array based on whether we're ordering single or multiple products
  const initialProducts = state?.product
    ? [
        {
          product: state.product,
          quantity: state.quantity || 1,
          selectedSize: state.selectedSize,
        },
      ]
    : state?.products || [];

  const [products, setProducts] = useState(
    initialProducts.map((item) => ({
      product: item.product || item, // Handle both formats
      quantity: item.quantity || 1,
      selectedSize: item.selectedSize || item.product?.selectedSize || null,
    }))
  );

  const [userAddress, setUserAddress] = useState(null);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [showAddressChooser, setShowAddressChooser] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  // Check for saved address on component mount
useEffect(() => {
  const fetchAddresses = async () => {
    try {
      const savedAddress = sessionStorage.getItem("user_address");
      const savedList = sessionStorage.getItem("saved_addresses");

      if (savedList) {
        const parsedList = JSON.parse(savedList);
        setSavedAddresses(parsedList);

        if (savedAddress) {
          setUserAddress(JSON.parse(savedAddress));
        } else if (parsedList.length > 0) {
          setUserAddress(parsedList[0]);
          sessionStorage.setItem("user_address", JSON.stringify(parsedList[0]));
        }

      } else {
        const response = await axios.get("/api/addresses");
        const addresses = response.data.addresses || [];
        setSavedAddresses(addresses);

        if (addresses.length > 0) {
          setUserAddress(addresses[0]);
          sessionStorage.setItem("user_address", JSON.stringify(addresses[0]));
          sessionStorage.setItem("saved_addresses", JSON.stringify(addresses));
        }

        const showPopup =
          !savedAddress && addresses.length === 0 && !alertShown.current;
        if (showPopup) {
          alertShown.current = true;
          const shouldAddAddress = window.confirm(
            "No saved address found. Would you like to add one now?"
          );
          if (shouldAddAddress) {
            navigate("/account", {
              state: { fromOrderPage: true, tab: "addresses" },
            });
          }
        }
      }

      setLoadingAddresses(false); // ✅ Always call it
    } catch (error) {
      console.error("Error fetching addresses:", error);
      setLoadingAddresses(false);
    }
  };

  fetchAddresses();
}, [navigate]);


  // Helper functions
  const getDiscountedPrice = (product) =>
    product.mrp - (product.mrp * product.discount) / 100;

  const getDeliveryCharge = (quantity) => {
    if (quantity <= 0) return 0;
    if (quantity === 1) return 40;
    if (quantity === 2) return 60;
    if (quantity === 3) return 100;
    return 100 + (quantity - 3) * 100;
  };

  // Update quantity for a specific product
  const updateQuantity = (index, delta) => {
    setProducts((prev) =>
      prev.map((item, i) => {
        if (i === index) {
          const selectedSize = item.selectedSize?.size;
          const stockForSize =
            item.product.size.find((s) => s.size === selectedSize)?.quantity ||
            0;
          const newQty = item.quantity + delta;

          if (newQty > stockForSize) {
            setTimeout(() => {
              toast.error(
                `Only ${stockForSize} in stock for size ${selectedSize}`
              );
            }, 0);
            return item;
          }

          if (
            newQty === stockForSize &&
            !shownWarnings.current[`${item.product._id}-${selectedSize}-max`]
          ) {
            setTimeout(() => {
              toast.success(
                `Max stock reached for ${item.product.name} (Size ${selectedSize})`
              );
            }, 0);
            shownWarnings.current[
              `${item.product._id}-${selectedSize}-max`
            ] = true;
          }

          return {
            ...item,
            quantity: Math.min(10, Math.max(1, newQty)),
          };
        }
        return item;
      })
    );
  };

  // Calculate totals
  const totalQuantity = products.reduce((sum, item) => sum + item.quantity, 0);
  const deliveryCharge = getDeliveryCharge(totalQuantity);
  const platformFee = 15;

  const totals = products.reduce(
    (acc, { product, quantity }) => {
      const discount = (product.mrp * product.discount) / 100;
      const price = product.mrp - discount;
      acc.totalPayable += price * quantity;
      acc.totalSaved += discount * quantity;
      return acc;
    },
    { totalPayable: 0, totalSaved: 0 }
  );

  totals.totalPayable += deliveryCharge + platformFee;

  // Delivery date calculation
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 5);

  // Handle place order
  const handlePlaceOrder = () => {
    const totalQuantity = products.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    if (totalQuantity > 10) {
      toast.error("You cannot buy more than 10 products in total.");
      return;
    }

    const itemExceedingStock = products.find((item) => {
      const selectedSize = item.selectedSize?.size;
      const stock =
        item.product.size.find((s) => s.size === selectedSize)?.quantity || 0;
      return item.quantity > stock;
    });

    if (itemExceedingStock) {
      toast.error(
        `Quantity for "${itemExceedingStock.product.name}" exceeds available stock.`
      );
      return;
    }

    if (!userAddress) {
      toast.error("Please select a delivery address.");
      return;
    }

    sessionStorage.setItem("payment_products", JSON.stringify(products));
    sessionStorage.setItem("user_address", JSON.stringify(userAddress));

    navigate("/paymentPage", {
      state: {
        products: products.map((item) => ({
          ...item.product,
          quantity: item.quantity,
          selectedSize: item.selectedSize,
        })),
        address: userAddress,
      },
    });
  };

  if (!products.length || !isOpen) return null;

  const isSingleProduct = products.length === 1;

  const isPlaceOrderDisabled =
    products.length === 0 ||
    products.some(({ quantity, product, selectedSize }) => {
      const stock =
        product.size.find((s) => s.size === selectedSize?.size)?.quantity || 0;
      return quantity > stock || quantity < 1;
    }) ||
    !userAddress;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl p-6 mt-22 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="mb-4 border-b pb-3 relative">
          <button
            onClick={() => navigate(-1)}
            className="absolute top-0 right-0 text-gray-600 hover:text-red-500 transition"
          >
            <IoMdClose size={24} />
          </button>
          <h2 className="text-3xl font-extrabold text-indigo-700 text-center">
            {isSingleProduct ? "Place Your Order" : "Place Your Orders"}
          </h2>
        </div>

        {loadingAddresses ? (
          <div className="text-center py-8">
            <p>Loading addresses...</p>
          </div>
        ) : (
          <>
            {/* Product List */}
            <div className="space-y-4 mb-4">
              {products.map(({ product, quantity, selectedSize }, index) => {
                const discountedPrice = getDiscountedPrice(product);
                const discountAmount = (product.mrp * product.discount) / 100;
                const sizeStock =
                  product.size.find((s) => s.size === selectedSize?.size)
                    ?.quantity || 0;

                return (
                  <div
                    key={`${product._id}-${index}`}
                    className="flex gap-4 border p-4 rounded-lg"
                  >
                    <img
                      src={product.image[0]}
                      alt={product.name}
                      className="w-24 h-24 object-cover rounded-lg border"
                    />
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {product.name}
                      </h3>
                      <p className="text-gray-600">
                        Size: UK {selectedSize?.size || "N/A"}
                      </p>
                      <p className="text-gray-600">Brand: {product.brand}</p>

                      <div className="flex items-center mt-2">
                        <button
                          onClick={() => updateQuantity(index, -1)}
                          disabled={quantity <= 1}
                          className={`p-1 rounded-full ${
                            quantity <= 1
                              ? "text-gray-400 cursor-not-allowed"
                              : "text-indigo-600 hover:bg-indigo-100"
                          }`}
                        >
                          <FiMinus size={16} />
                        </button>
                        <span className="mx-3 text-lg font-medium">
                          {quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(index, 1)}
                          disabled={quantity >= sizeStock}
                          className={`p-1 rounded-full ${
                            quantity >= sizeStock
                              ? "text-gray-400 cursor-not-allowed"
                              : "text-indigo-600 hover:bg-indigo-100"
                          }`}
                        >
                          <FiPlus size={16} />
                        </button>
                      </div>

                      <p className="text-indigo-600 font-bold text-xl mt-1">
                        ₹{(discountedPrice * quantity).toLocaleString()}
                        <span className="text-sm text-gray-500 ml-1">
                          ({quantity} pcs)
                        </span>
                      </p>
                      <p className="line-through text-red-500 font-bold">
                        ₹{product.mrp.toLocaleString()}
                      </p>

                      {sizeStock === 0 && (
                        <p className="text-red-600 font-bold mt-1">
                          Out of stock
                        </p>
                      )}
                      {sizeStock > 0 && sizeStock < 5 && (
                        <p className="text-orange-500 font-medium mt-1">
                          Hurry! Only {sizeStock} left in stock
                        </p>
                      )}
                      {quantity > sizeStock && (
                        <p className="text-red-500 font-semibold mt-1">
                          Only {sizeStock} in stock!
                        </p>
                      )}
                    </div>
                    <div className="text-right min-w-[120px]">
                      <p className="text-green-600 font-semibold">
                        Saved: ₹{(discountAmount * quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Delivery Address */}
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <h3 className="font-semibold text-xl text-gray-800 mb-2 flex items-center gap-2">
                  <svg
                    className="w-6 h-6 text-indigo-600"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C8.134 2 5 5.134 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7z" />
                  </svg>
                  Delivery Address
                </h3>
                {savedAddresses.length > 0 && (
                  <button
                    onClick={() => setShowAddressChooser(true)}
                    className="text-sm px-4 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                  >
                    Choose from Saved
                  </button>
                )}
              </div>

              <div className="bg-gray-50 p-4 rounded-lg shadow-sm border flex justify-between items-start">
                <div className="text-gray-700 text-base leading-snug">
                  {userAddress ? (
                    <>
                      <p className="font-medium">{userAddress.name}</p>
                      <p>
                        {userAddress.street}, {userAddress.city}
                      </p>
                      <p>
                        {userAddress.state} - {userAddress.zip}
                      </p>
                      <p>Phone: {userAddress.phone}</p>
                    </>
                  ) : (
                    <div>
                      <p className="text-gray-500 italic mb-2">
                        No address selected
                      </p>
                      <button
                        onClick={() =>
                          navigate("/account", { state: { tab: "addresses" } })
                        }
                        className="text-sm px-4 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                      >
                        Add Address
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Address Chooser Modal */}
            {showAddressChooser && (
              <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 px-4 mt-20">
                <div className="relative bg-white rounded-xl p-6 max-w-lg w-full shadow-2xl overflow-auto max-h-[80vh]">
                  <button
                    onClick={() => setShowAddressChooser(false)}
                    className="absolute top-5 right-3 text-gray-800 hover:text-red-500 transition"
                  >
                    <IoMdClose size={24} />
                  </button>
                  <h4 className="text-2xl font-bold text-center text-indigo-700 mb-4">
                    Select a Saved Address
                  </h4>
                  <div className="space-y-4">
                    {savedAddresses.map((addr) => (
                      <div
                        key={addr._id}
                        className="border rounded-lg p-4 shadow-sm hover:shadow-md transition bg-gray-50"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {addr.name}
                            </p>
                            <p className="text-gray-700 text-sm">
                              {addr.street}, {addr.city}
                            </p>
                            <p className="text-gray-600 text-sm">
                              {addr.state} - {addr.zip}
                            </p>
                            <p className="text-gray-600 text-sm">
                              Phone: {addr.phone}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              setUserAddress(addr);
                              sessionStorage.setItem(
                                "user_address",
                                JSON.stringify(addr)
                              );
                              setShowAddressChooser(false);
                              toast.success("Address selected");
                            }}
                            className="ml-4 px-4 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition"
                          >
                            Choose
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      setShowAddressChooser(false);
                      navigate("/account", { state: { tab: "addresses" } });
                    }}
                    className="mt-6 w-full py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition font-medium"
                  >
                    Add New Address
                  </button>
                  <button
                    onClick={() => setShowAddressChooser(false)}
                    className="mt-6 w-full py-2 bg-gray-200 text-gray-700 rounded hover:bg-red-500 hover:text-white transition font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Estimated Delivery */}
            <div className="mb-6 ml-45 text-lg">
              <p className="text-black font-medium">
                Estimated Delivery by:{" "}
                <span className="font-bold text-green-600">
                  {deliveryDate.toDateString()}
                </span>
              </p>
            </div>

            {/* Price Details */}
            <div className="mb-6 border-t pt-4">
              <h3 className="font-semibold text-lg text-gray-800 mb-2">
                Price Details
              </h3>
              <ul className="text-gray-700 space-y-1 text-sm">
                <li>Total Items: {totalQuantity}</li>
                <li>
                  Product Price: ₹
                  {(
                    totals.totalPayable -
                    deliveryCharge -
                    platformFee
                  ).toLocaleString()}
                </li>
                <li>Delivery Charge: ₹{deliveryCharge}</li>
                <li>Platform Fee: ₹{platformFee}</li>
                <li className="text-green-600">
                  Total Saved: ₹{totals.totalSaved.toLocaleString()}
                </li>
              </ul>
              <div className="mt-4 text-center text-green-600 font-bold text-xl border-t pt-3">
                You Saved ₹{totals.totalSaved.toLocaleString()} on this Order!
              </div>
            </div>

            {/* Place Order Section */}
            <div className="flex justify-between items-center pt-2 border-t mt-4">
              <div className="font-bold text-indigo-700 text-lg">
                Total Payable: ₹
                <span className="text-2xl">
                  {totals.totalPayable.toLocaleString()}
                </span>
              </div>
              <button
                onClick={handlePlaceOrder}
                disabled={isPlaceOrderDisabled}
                className={`px-6 py-2 rounded-full font-medium transition ${
                  isPlaceOrderDisabled
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                {isSingleProduct ? "Place Order" : "Place All Orders"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PlaceOrder;
