import React, { useState, useEffect, useRef } from "react";
import {
  FaGooglePay,
  FaPhone,
  FaUniversity,
  FaMoneyCheckAlt,
} from "react-icons/fa";
import { SiPaytm } from "react-icons/si";
import { useCart } from "../context/CartContext";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import QR from "../assets/QR.jpeg";
import axios from "../config/api";

const PaymentPage = () => {
  const { state } = useLocation();
  const location = useLocation();
  const navigate = useNavigate();
  const { cart, removeMultipleFromCart, isSyncing } = useCart();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [gateway, setGateway] = useState("");
  const [upiId, setUpiId] = useState("");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [products, setProducts] = useState([]);
  const productsRef = useRef(products);

  const address =
    state?.address || JSON.parse(sessionStorage.getItem("user_address"));

  useEffect(() => {
    let rawProducts = [];

    if (location.state?.products) {
      rawProducts = location.state.products;
      sessionStorage.setItem("payment_products", JSON.stringify(rawProducts));
    } else {
      const stored = sessionStorage.getItem("payment_products");
      if (stored) rawProducts = JSON.parse(stored);
    }

    const formatted = rawProducts.map((item) => {
      if (item.product) {
        return {
          ...(item.product || item),
          quantity: item.quantity || 1,
          selectedSize: item.selectedSize || item.product?.selectedSize,
        };
      }
      return {
        ...item,
        quantity: item.quantity || 1,
      };
    });

    setProducts(formatted);
  }, [location.state]);

  const totalMRP = products.reduce(
    (sum, product) => sum + (product.mrp || 0) * (product.quantity || 1),
    0
  );

  const totalDiscount = products.reduce(
    (sum, product) =>
      sum +
      (((product.mrp || 0) * (product.discount || 0)) / 100) *
        (product.quantity || 1),
    0
  );

  const totalPriceAfterDiscount = products.reduce((sum, item) => {
    const price = item.price || item.mrp || 0;
    const discount = item.discount || 0;
    const finalPrice = price - (price * discount) / 100;
    return sum + finalPrice * item.quantity;
  }, 0);

  const totalQuantity = products.reduce(
    (sum, product) => sum + (product.quantity || 1),
    0
  );

  const deliveryCharge =
    totalQuantity === 1
      ? 40
      : totalQuantity === 2
      ? 60
      : totalQuantity === 3
      ? 100
      : 100 + (totalQuantity - 3) * 100;

  const platformFee = 15;
  const gstRate = totalPriceAfterDiscount <= 1000 ? 0.12 : 0.18;
  const gstAmount = totalPriceAfterDiscount * gstRate;
  const finalAmount = totalPriceAfterDiscount + deliveryCharge + platformFee;

  const isUpiGateway = ["GPay", "PhonePe", "BHIMUPI", "Paytm"].includes(gateway);

  const handlePayment = async () => {
    if (isSyncing) {
      toast.error("Please wait while we update your cart");
      return;
    }

    if (isPlacingOrder) return;
    setIsPlacingOrder(true);

    try {
      if (!products || products.length === 0) {
        toast.error("Something went wrong. Please try again.");
        return;
      }

      if (paymentMethod === "COD") {
        toast.error(
          "COD not available due to technical issues. Please select another method."
        );
        return;
      }

      if (paymentMethod === "Online" && !gateway) {
        toast.error("Please select a payment gateway.");
        return;
      }

      if (gateway === "NetBanking") {
        toast.error("Net Banking is temporarily unavailable due to server issues.");
  setIsPlacingOrder(false);
        return;
      }

      const upiRegex = /^[\w.-]+@[\w]{3,}$/i;
      if (isUpiGateway && !upiRegex.test(upiId)) {
        toast.error("Please enter a valid UPI ID (e.g., name@bank).");
        return;
      }

      const addressPayload = {
        addressLine1: address?.homeNumber || "123 Street",
        addressLine2: address?.street || "Near Park",
        landmark: address?.landmark || "Landmark",
        city: address?.city || "Mumbai",
        state: address?.state || "MH",
        postalCode: address?.postalCode || "400001",
        country: "India",
        phone: address?.phone || "0000000000",
      };

      const productsPayload = products.map((item) => {
        const price = item.price || item.mrp || 0;
        const discount = item.discount || 0;
        const finalPrice = price - (price * discount) / 100;
        const itemTotal = finalPrice * item.quantity;
        return {
          productId: item._id || item.product?._id,
          selectedSize:
            typeof item.selectedSize === "object"
              ? item.selectedSize.size
              : item.selectedSize,
          quantity: item.quantity,
          priceAtPurchase: price,
          discountAtPurchase: discount,
          paymentMethod: "UPI",
          totalAmount: itemTotal,
        };
      });

      const token = localStorage.getItem("token");

      const res = await axios.post(
        "/api/orders",
        {
          products: productsPayload,
          shippingAddress: addressPayload,
          paymentMethod,
          gateway,
          upiId,
          totalAmount: finalAmount,
          deliveryCharge,
          gstAmount,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.success) {
        const productIdsToRemove = products.map((p) => p._id || p.product?._id);
        await removeMultipleFromCart(productIdsToRemove);
        toast.success("Order placed successfully!");
        setOrderPlaced(true);
      } else {
        toast.error("Order failed. Try again.");
      }
    } catch (err) {
      console.error("Payment error:", err);
      toast.error(err.response?.data?.message || "Payment failed.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  useEffect(() => {
    productsRef.current = products;
  }, [products]);

  useEffect(() => {
    if (orderPlaced) {
      sessionStorage.removeItem("cart");
      sessionStorage.removeItem("payment_products");
      sessionStorage.removeItem("user_address");

      navigate("/thankyou", {
        state: {
          products: products.map((product) => ({
            ...product,
            quantity: product.quantity || 1,
          })),
          address,
          paymentMethod,
          gateway,
          upiId,
          finalAmount,
        },
      });

      setOrderPlaced(false);
    }
  }, [orderPlaced, navigate, address, paymentMethod, gateway, upiId, finalAmount]);

  const paymentOptions = [
    { label: "Google Pay", value: "GPay", icon: <FaGooglePay className="text-blue-600 text-xl" /> },
    { label: "PhonePe", value: "PhonePe", icon: <FaPhone className="text-purple-600 text-xl" /> },
    { label: "BHIM UPI", value: "BHIMUPI", icon: <FaMoneyCheckAlt className="text-green-600 text-xl" /> },
    { label: "Paytm", value: "Paytm", icon: <SiPaytm className="text-blue-500 text-xl" /> },
    { label: "Net Banking", value: "NetBanking", icon: <FaUniversity className="text-gray-700 text-xl" /> },
  ];

  return (
    <div className="flex max-w-5xl mx-auto mt-15 mb-25 gap-6">
      {/* Sidebar */}
      <div className="w-1/3 bg-white shadow-lg rounded-lg p-4 space-y-4 sticky top-20 h-fit">
        <h3 className="text-lg font-bold">Choose Payment Method</h3>
        <label className={`flex items-center gap-2 cursor-pointer ${paymentMethod === "COD" ? "text-blue-700 font-semibold" : "text-gray-700"}`}>
          <input
            type="radio"
            name="payment"
            value="cod"
            checked={paymentMethod === "COD"}
            onChange={() => {
              setPaymentMethod("COD");
              setGateway("");
            }}
          />
          Cash on Delivery
        </label>

        <label className={`flex items-center gap-2 cursor-pointer ${paymentMethod === "Online" ? "text-blue-700 font-semibold" : "text-gray-700"}`}>
          <input
            type="radio"
            name="payment"
            value="online"
            checked={paymentMethod === "Online"}
            onChange={() => setPaymentMethod("Online")}
          />
          Online Payment
        </label>

        {paymentMethod === "Online" && (
          <div className="ml-4 space-y-2">
            {paymentOptions.map(({ label, value, icon }) => (
              <label
                key={value}
                className={`flex items-center gap-2 cursor-pointer ${gateway === value ? "text-blue-600 font-semibold" : "text-gray-700"}`}
              >
                <input
                  type="radio"
                  name="gateway"
                  value={value}
                  checked={gateway === value}
                   onChange={() => {
            if (value === "NetBanking") {
              toast.error("Net Banking is temporarily unavailable due to server issues.");
              setGateway("");
            } else {
              setGateway(value);
            }
          }}
                />
                {icon}
                {label}
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="w-2/3 bg-white rounded-xl shadow-xl p-6">
        <div className="flex w-full">
          <div>
            <h2 className="text-2xl font-bold mb-4 text-indigo-700">Payment Details</h2>
            <ul className="text-gray-700 text-base space-y-2">
              <li>Total MRP: ₹{totalMRP.toLocaleString()}</li>
              <li>Total Discount: ₹{totalDiscount.toFixed(2)}</li>
              <li>Price After Discount: ₹{totalPriceAfterDiscount.toFixed(2)}</li>
              <li>Delivery Charge: ₹{deliveryCharge}</li>
              <li>Platform Fee: ₹{platformFee}</li>
              <li>GST ({gstRate * 100}%): ₹{gstAmount.toFixed(2)}</li>
              <li className="font-semibold text-green-600">Total Saved: ₹{totalDiscount.toFixed(2)}</li>
            </ul>
          </div>

          {/* QR Display */}
          {paymentMethod === "Online" && isUpiGateway && (
            <div className="ml-12">
              <div className="bg-white p-4 shadow-md border rounded-lg">
                <img src={QR} alt="Scan QR Code" className="w-48 h-48 object-contain" />
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="text-center font-bold text-xl text-indigo-800 mt-4">
            Total Payable: ₹{finalAmount.toFixed(2)}
          </div>

          {paymentMethod === "COD" && (
            <p className="mt-4 text-red-500 text-center text-lg font-semibold">
              COD is temporarily unavailable. Please choose another method.
            </p>
          )}

          {paymentMethod === "Online" && isUpiGateway && (
            <div className="mt-6 space-y-4 text-center">
              <h4 className="font-semibold text-lg">Scan QR or Enter UPI ID</h4>
              <input
                type="text"
                placeholder="Enter your UPI ID"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="border rounded-md p-2 w-2/3"
              />
            </div>
          )}

          <button
  onClick={handlePayment}
  disabled={
    isPlacingOrder || (paymentMethod === "Online" && !gateway)
  }
  className={`mt-6 w-2/3 ml-25 bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-4 shadow-gray-400 rounded-full ${
    isPlacingOrder || (paymentMethod === "Online" && !gateway)
      ? "opacity-50 cursor-not-allowed"
      : ""
  }`}
>
  {isPlacingOrder ? "Processing..." : `Pay ₹${finalAmount.toFixed(2)}`}
</button>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
