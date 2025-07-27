import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
const shippingAddressSchema = new mongoose.Schema(
  {
    addressLine1: {
      type: String,
      required: true,
      trim: true,
    },
    addressLine2: {
      type: String,
      trim: true,
    },
    landmark: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    postalCode: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);




const productSubOrderSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    selectedSize: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    priceAtPurchase: {
      type: Number,
      required: true,
    },
    discountAtPurchase: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    returnDetails: {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        default: () => new mongoose.Types.ObjectId(),
      },
      requested: { type: Boolean, default: false },
      reason: { type: String, trim: true, default: "" },
      status: {
        type: String,
        enum: [
          "None",
          "ReturnRequested",
          "ReturnApproved",
          "Returned",
          "ReturnRejected",
        ],
        default: "None",
      },
      requestedAt: { type: Date, default: null },
    },
    replacementDetails: {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        default: () => new mongoose.Types.ObjectId(),
      },
      requested: { type: Boolean, default: false },
      reason: { type: String, trim: true, default: "" },
      replacementSize: { type: String, default: "" },
      replacementQuantity: { type: Number, default: 1 },
      status: {
        type: String,
        enum: [
          "None",
          "ReplacementRequested",
          "ReplacementApproved",
          "ReplacementShipped",
          "ReplacementCompleted",
          "ReplacementRejected",
        ],
        default: "None",
      },

      requestedAt: { type: Date, default: null },
      shippedAt: { type: Date, default: null },
      completedAt: { type: Date, default: null },
      trackingNumber: { type: String, default: "" },
    },
  },
  { timestamps: true }
);




const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [productSubOrderSchema],
    // Individual-level fields
    shippingAddress: shippingAddressSchema,
    paymentMethod: {
      type: String,
      enum: [
        "COD",
        "Credit Card",
        "Debit Card",
        "Net Banking",
        "UPI",
        "Online",
      ],
      required: true,
    },

    gateway: {
      type: String,
      enum: ["GPay", "PhonePe", "Paytm", "NetBanking", "BHIMUPI", "Other"],
      default: "",
    },

    upiId: {
      type: String,
      default: "",
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    gstAmount: {
      type: Number,
      required: false,
    },
    deliveryCharge: {
      type: Number,
      required: false,
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Paid",
    },
    transactionId: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },
    orderStatus: {
      type: String,
      enum: [
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
        "Waiting for Approval",
      ],
      default: "Pending",
    },
    isCancelled: {
      type: Boolean,
      default: false,
    },
    cancelledBy: {
      type: String,
      enum: ["user", "admin"],
      default: null,
    },
    cancelReason: {
      type: String,
      trim: true,
      default: "",
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    isDelivered: {
      type: Boolean,
      default: false,
    },
    deliveredAt: {
      type: Date,
      default: null,
    },

    // array of sub-orders
  },
  { timestamps: true }
);
//npm install mongoose-paginate-v2
// to add pagination capabilities directly to your Order model.
orderSchema.plugin(mongoosePaginate); //Add pagination (Register) plugin

const Order = mongoose.model("Order", orderSchema);
export default Order;
