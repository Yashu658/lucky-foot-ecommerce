import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import mongoose from "mongoose";
import User from "../models/userModel.js"

const ReturnStatus = {
  RETURN_REQUESTED: "ReturnRequested",
  RETURN_APPROVED: "ReturnApproved",
  RETURN_REJECTED: "ReturnRejected",
  RETURNED: "Returned",
  REPLACEMENT_REQUESTED: "ReplacementRequested",
  REPLACEMENT_APPROVED: "ReplacementApproved",
  REPLACEMENT_REJECTED: "ReplacementRejected",
  REPLACEMENT_SHIPPED: "ReplacementShipped",
  REPLACEMENT_COMPLETED: "ReplacementCompleted"
};

// Single order document per user until order is completed.
// All products stored inside one products array.
// Update order to complete after payment success.

export const placeOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      products,
      shippingAddress,
      paymentMethod,
      gateway = "",
      upiId = "",
      totalAmount,
      gstAmount,
      deliveryCharge,
    } = req.body;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Products are required" });
    }

    if (!shippingAddress || !paymentMethod) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Shipping address and payment method are required",
        });
    }

    let formattedProducts = [];

    for (const item of products) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });
      }

      const selectedSize = product.size.find(
        (s) => s.size === item.selectedSize
      );
      if (!selectedSize || selectedSize.quantity < item.quantity) {
        return res
          .status(400)
          .json({
            success: false,
            message: `Insufficient stock for size ${item.selectedSize}`,
          });
      }

      await Product.updateOne(
        { _id: item.productId, "size.size": item.selectedSize },
        { $inc: { "size.$.quantity": -item.quantity } }
      );

      formattedProducts.push({
        productId: item.productId,
        selectedSize: item.selectedSize,
        quantity: item.quantity,
        priceAtPurchase: item.priceAtPurchase,
        discountAtPurchase: item.discountAtPurchase,
        totalAmount: item.totalAmount,
      });
    }

    //Generate transactionId
const transactionId = `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;


    const order = await Order.create({
      userId,
      products: formattedProducts,
      shippingAddress,
      paymentMethod,
      paymentStatus: "Paid",
      transactionId,
      orderStatus: "Pending",
      gateway,
      upiId,
      totalAmount,
      gstAmount,
      deliveryCharge,
      isCancelled: false,
      isDelivered: false,
    });

    return res
      .status(201)
      .json({ success: true, message: "Order created", order });
  } catch (error) {
    console.error("Order error:", error);
    return res.status(400).json({ success: false, message: error.message });
  }
};

// User
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: "products.productId",
        select: "name image size price category",
      });

    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "name email")
      .populate("products.productId", "name image") 
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus, paymentStatus, cancelReason } = req.body;

    const order = await Order.findById(id);
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    if (order.orderStatus === "Cancelled") {
      return res.status(400).json({ message: "Order is already cancelled." });
    }

    // Handle cancellation
    if (orderStatus === "Cancelled") {
      order.orderStatus = "Cancelled";
      order.isCancelled = true;
      order.cancelledBy = "admin";
      order.cancelledAt = new Date();

      if (cancelReason) {
        order.cancelReason = cancelReason;
      }
    }
    // Handle delivery
    else if (orderStatus === "Delivered") {
      order.orderStatus = "Delivered";
      order.deliveredAt = new Date();
      order.isDelivered = true;
    }
    // Handle return rejection - set status to Delivered
    else if (orderStatus === "ReturnRejected") {
      order.orderStatus = "Delivered"; // Keep as Delivered
      // The actual return rejection status will be stored in product.returnDetails
    }
    // Handle other statuses
    else if (orderStatus) {
      order.orderStatus = orderStatus;
    }
    if (paymentStatus) order.paymentStatus = paymentStatus;
    await order.save();
    res.json({ success: true, message: "Order updated", order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get a single order by ID for the logged-in user
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user._id,
    })
      .populate({
        path: 'userId',
        select: 'name email phone' 
      })
    .populate("products.productId", "name image");

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }
     const response = {
      ...order._doc,
      customerInfo: order.userId ? {
        name: order.userId.name,
        email: order.userId.email,
      } : null
    };

    res.json({ success: true, order: response });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin can view any order by ID
export const getOrderByIdAdmin = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate({
        path: 'userId',
        select: 'name email phone' 
      })
      .populate({
        path: 'products.productId',
        select: 'name image'
      });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Transform the data for better frontend consumption
    const response = {
      ...order._doc,
      customerInfo: order.userId ? {
        name: order.userId.name,
        email: order.userId.email,
        phone: order.userId.phone,
        userId: order.userId._id
      } : null
    };

    res.json({ success: true, order: response });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const cancelMyOrder = async (req, res) => {
  try {
    console.log("User ID:", req.user.id);
    console.log("Order ID:", req.params.id);
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    if (order.orderStatus !== "Pending" && order.orderStatus !== "Processing") {
      return res
        .status(400)
        .json({ success: false, message: "Cannot cancel at this stage" });
    }

    //Prevent duplicate cancellation
    if (order.orderStatus === "Cancelled") {
      return res.status(400).json({ message: "Order is already cancelled." });
    }

    order.orderStatus = "Cancelled";
    order.isCancelled = true;
    order.cancelledAt = new Date();
    order.cancelReason = req.body.cancelReason;
    order.cancelledBy = "user";
    await order.save();

    res.json({ success: true, message: "Order cancelled", order });
  } catch (error) {
    console.error("Cancel Order Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Sample Express route handler
export const returnProduct = async (req, res) => {
  try {
    const { reason, productId } = req.body;
    const orderId = req.params.id;

    if (!reason || !productId) {
      return res
        .status(400)
        .json({ message: "Reason and productId are required" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Validate order status
    if (order.orderStatus !== "Delivered") {
      return res.status(400).json({
        message: "Only delivered orders can be returned",
        currentStatus: order.orderStatus,
      });
    }

    // Find the product
    const product = order.products.find(
      (p) => p.productId.toString() === productId.toString()
    );

    if (!product) {
      return res
        .status(404)
        .json({ message: "Product not found in this order" });
    }

    // Check if return already requested
    if (product.return?.requested) {
      return res.status(400).json({
        message: "Return already requested for this product",
        returnId: product.return._id,
      });
    }

    // Create return request
    product.returnDetails = {
      _id: new mongoose.Types.ObjectId(),
      requested: true,
      reason,
      status: "ReturnRequested",
      requestedAt: new Date(),
    };

    // Update order status
    order.orderStatus = "ReturnRequested";
    await order.save();

    res.status(200).json({
      message: "Return request submitted",
      order: order,
    });
  } catch (error) {
    console.error("Return processing error:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// controllers/orderController.js

// Add these new controller methods:

// Get all return requests (Admin)
export const getAllReturns = async (req, res) => {
  try {
    const orders = await Order.find({
      products: { $elemMatch: { "returnDetails.requested": true } },
    })
      .populate("userId", "name email")
      .populate("products.productId", "name image")
      .sort({ createdAt: -1 });

    const formattedReturns = [];

    for (const order of orders) {
      const returnedProducts = order.products.filter(
        (p) => p.returnDetails?.requested
      );

      for (const p of returnedProducts) {
        console.log("Fetched status:", p.returnDetails.status);
        formattedReturns.push({
          returnId: p.returnDetails._id,
          orderId: order._id,
          customerId: order.userId._id,
          customerName: order.userId.name,
          customerEmail: order.userId.email,
          productId: p.productId._id,
          name: p.productId.name,
          image: p.productId.image?.[0] || null,
          size: p.selectedSize,
          quantity: p.quantity,
          price: p.priceAtPurchase,
          reason: p.returnDetails.reason,
          status: p.returnDetails.status,
          requestDate: p.returnDetails.requestedAt,
          orderStatus: order.orderStatus,
        });
      }
    }

    res.json({ success: true, returns: formattedReturns });
  } catch (error) {
    console.error("Error in getAllReturns:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};



export const updateReturnStatus = async (req, res) => {
  const { returnId } = req.params;
  const { status } = req.body;

  const allowedStatuses = [
    "ReturnRequested",
    "ReturnApproved",
    "ReturnRejected",
    "Returned",
  ];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  try {
    const updateObj = {
      $set: {
        "products.$[elem].returnDetails.status": status,
        orderStatus:
          status === "Returned"
            ? "Returned"
            : status === "ReturnApproved"
            ? "ReturnApproved"
            : status === "ReturnRejected"
            ? "Delivered"
            : "ReturnRequested",
      },
    };

    const order = await Order.findOneAndUpdate(
      {
        "products.returnDetails._id": new mongoose.Types.ObjectId(returnId),
      },
      updateObj,
      {
        arrayFilters: [
          { "elem.returnDetails._id": new mongoose.Types.ObjectId(returnId) },
        ],
        new: true,
      }
    )
      .populate("userId", "name email")
      .populate("products.productId", "name image");

    if (!order) {
      return res.status(404).json({ message: "Return not found" });
    }

    // If status is APPROVED, restore stock
    if (status === ReturnStatus.RETURN_APPROVED) {
      const product = order.products.find(
        (p) => p.returnDetails?._id?.toString() === returnId
      );

      if (product) {
        await Product.updateOne(
          { _id: product.productId, "size.size": product.selectedSize },
          { $inc: { "size.$.quantity": product.quantity } }
        );
      }
    }

    res.json({
      success: true,
      message: `Return status updated to ${status}`,
      returnId,
      order,
    });
  } catch (error) {
    console.error("Error in updateReturnStatus:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



export const getMyReturns = async (req, res) => {
  try {
    const orders = await Order.find({
      userId: req.user.id,
      "products.return.requested": true,
    }).populate("products.productId", "name image");

    const returns = [];

    for (const order of orders) {
      const returnedProducts = order.products.filter(
        (p) => p.return?.requested
      );

      for (const product of returnedProducts) {
        returns.push({
          returnId: product.return._id,
          productId: product.productId._id,
          name: product.productId.name,
          image: product.productId.image?.[0] || null,
          quantity: product.quantity,
          reason: product.return.reason,
          status: product.return.status,
          requestedAt: product.return.requestedAt,
          orderId: order._id,
        });
      }
    }

    res.json({ success: true, returns });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



// Add new controller methods for replacements
export const requestReplacement = async (req, res) => {
  try {
    const { reason, productId, replacementSize,quantity } = req.body;
    const orderId = req.params.id;

    if (!reason || !productId|| !quantity) {
      return res.status(400).json({ message: "Reason and productId are required" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.orderStatus !== "Delivered") {
      return res.status(400).json({
        message: "Only delivered orders can request replacement",
        currentStatus: order.orderStatus,
      });
    }

    const product = order.products.find(
      (p) => p.productId.toString() === productId.toString()
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found in this order" });
    }

     // Validate quantity doesn't exceed ordered quantity
    if (quantity > product.quantity) {
      return res.status(400).json({
        message: `Replacement quantity cannot exceed ordered quantity (${product.quantity})`
      });
    }


    // Check if replacement already requested
   if (product.replacementDetails?.requested)
{
      return res.status(400).json({
        message: "Replacement already requested for this product",
        replacementId: product.replacement._id,
      });
    }

    // Create replacement request
      const now = new Date();
    product.replacementDetails = {
      _id: new mongoose.Types.ObjectId(),
      requested: true,
      reason,
      replacementSize: replacementSize || product.selectedSize,
      replacementQuantity: quantity,
      status: "ReplacementRequested",
      requestedAt: now, // Store the creation date
      shippedAt: null,
      completedAt: null,
      trackingNumber: ""
    };

    // Update order status
    order.orderStatus = "ReplacementRequested";
    await order.save();

    res.status(200).json({
      message: "Replacement request submitted",
      order: order,
    });
  } catch (error) {
    console.error("Replacement processing error:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};


export const getAllReplacements = async (req, res) => {
  try {
    const orders = await Order.find({
      products: { $elemMatch: { "replacementDetails.requested": true } },
    })
      .populate("userId", "name email")
      .populate("products.productId", "name image size")
      .sort({ createdAt: -1 });

    const formattedReplacements = [];

    for (const order of orders) {
      const replacementProducts = order.products.filter(
        (p) => p.replacementDetails?.requested
      );

      for (const p of replacementProducts) {
        formattedReplacements.push({
          replacementId: p.replacementDetails._id,
          orderId: order._id,
          customerId: order.userId._id,
          customerName: order.userId.name,
          customerEmail: order.userId.email,
          productId: p.productId._id,
          name: p.productId.name,
          image: p.productId.image?.[0] || null,
          originalSize: p.selectedSize,
          replacementSize: p.replacementDetails.replacementSize,
          quantity: p.quantity,
          price: p.priceAtPurchase,
          reason: p.replacementDetails.reason,
          status: p.replacementDetails.status,
          requestDate: p.replacementDetails.requestedAt,
          orderStatus: order.orderStatus,
        });
      }
    }

    res.json({ success: true, replacements: formattedReplacements });
  } catch (error) {
    console.error("Error in getAllReplacements:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};



export const updateReplacementStatus = async (req, res) => {
  const { replacementId } = req.params;
  const { status, trackingNumber } = req.body;

  const allowedStatuses = [
    "ReplacementRequested",
    "ReplacementApproved",
    "ReplacementRejected",
    "ReplacementShipped",
    "ReplacementCompleted"
  ];
  
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  try {
    const updateObj = {
      $set: {
        "products.$[elem].replacementDetails.status": status,
        orderStatus:
          status === "ReplacementCompleted"
            ? "ReplacementCompleted"
            : status === "ReplacementShipped"
            ? "ReplacementShipped"
            : status === "ReplacementApproved"
            ? "ReplacementApproved"
            : status === "ReplacementRejected"
            ? "Delivered"
            : "ReplacementRequested",
      },
    };

    if (status === "ReplacementShipped" && trackingNumber) {
      updateObj.$set["products.$[elem].replacementDetails.trackingNumber"] = trackingNumber;
      updateObj.$set["products.$[elem].replacementDetails.shippedAt"] = new Date();
    }

    if (status === "ReplacementCompleted") {
      updateObj.$set["products.$[elem].replacementDetails.completedAt"] = new Date();
    }

    const order = await Order.findOneAndUpdate(
      {
        "products.replacementDetails._id": new mongoose.Types.ObjectId(replacementId),
      },
      updateObj,
      {
        arrayFilters: [
          { "elem.replacementDetails._id": new mongoose.Types.ObjectId(replacementId) },
        ],
        new: true,
      }
    )
      .populate("userId", "name email")
      .populate("products.productId", "name image size",);

    if (!order) {
      return res.status(404).json({ message: "Replacement not found" });
    }

    res.json({
      success: true,
      message: `Replacement status updated to ${status}`,
      replacementId,
      order,
    });
  } catch (error) {
    console.error("Error in updateReplacementStatus:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



// Get all transactions with filtering
export const getTransactions = async (req, res) => {
  try {
    const {
      transactionId,
      customer,
      paymentMethod,
      status,
      startDate,
      endDate,
       minAmount,
      maxAmount,
      page = 1,
      limit = 10,
    } = req.query;

     // Validate page and limit
    if (isNaN(page) || isNaN(limit)) {
      return res.status(400).json({
        success: false,
        message: "Invalid page or limit value",
      });
    }

    const query = {};

    if (transactionId) {
      if (!mongoose.Types.ObjectId.isValid(transactionId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid transaction ID format",
        });
      }
      query._id = transactionId;
    }


    if (customer) {
      const users = await User.find({
        $or: [
          { firstName: { $regex: customer, $options: "i" } },
          { lastName: { $regex: customer, $options: "i" } },
          { email: { $regex: customer, $options: "i" } },
        ],
      }).select("_id");
      query.userId = { $in: users.map(u => u._id) };
    }

    if (paymentMethod) {
      query.paymentMethod = paymentMethod;
    }

    if (status) {
      query.orderStatus = status;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        const start = new Date(startDate);
        if (isNaN(start)) {
          return res.status(400).json({
            success: false,
            message: "Invalid start date format",
          });
        }
        query.createdAt.$gte = start;
      }
       if (endDate) {
        const end = new Date(endDate);
        if (isNaN(end)) {
          return res.status(400).json({
            success: false,
            message: "Invalid end date format",
          });
        }
        query.createdAt.$lte = end;
      }
    }



     if (minAmount || maxAmount) {
      query.totalAmount = {};
      if (minAmount) {
        const min = parseFloat(minAmount);
        if (isNaN(min)) {
          return res.status(400).json({
            success: false,
            message: "Invalid minimum amount",
          });
        }
        query.totalAmount.$gte = min;
      }
       if (maxAmount) {
        const max = parseFloat(maxAmount);
        if (isNaN(max)) {
          return res.status(400).json({
            success: false,
            message: "Invalid maximum amount",
          });
        }
        query.totalAmount.$lte = max;
      }
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
      populate: {
        path: "userId",
        select: "Name email",
      },
      select: "-__v", // Exclude version key
    };

    const transactions = await Order.paginate(query, options);

   const transformedDocs = transactions.docs.map(order => ({
      _id: order._id,
      transactionId: order._id.toString(),
      customerName: order.userId ? `${order.userId.firstName} ${order.userId.lastName}` : "Unknown",
      email: order.userId?.email || "",
      paymentMethod: order.paymentMethod,
      status: order.orderStatus,
      amount: order.totalAmount,
      date: order.createdAt,
      productCount: order.products.length,
    }));

    res.status(200).json({
      success: true,
      data: {
        transactions: transformedDocs,
        pagination: {
          total: transactions.totalDocs,
          pages: transactions.totalPages,
          currentPage: transactions.page,
          limit: transactions.limit,
        }
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch transactions",
      error: error.message,
    });
  }
};


// Get transaction details by ID
export const getTransactionDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await Order.findById(id)
      .populate("userId", "name email")
      .populate("products.productId", "name images");

      

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch transaction details",
      error: error.message,
    });
  }
};


// In your orderController.js
export const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Order.find({})
      .populate("userId", "name email")
      .lean();
// Set customerName manually
const transactionsWithCustomerName = transactions.map((tx) => {
  const customerName = tx.userId && typeof tx.userId === "object" ? tx.userId.name : "N/A";
  return {
    ...tx,
    transactionId: tx._id.toString(),
    OrderID: tx._id.toString(),  // Explicitly include OrderID
    userId: tx.userId?._id.toString() || tx.userId?.toString() || "N/A",
    customerName,
  };
});
//console.log("Sample transaction:", transactionsWithCustomerName);

    res.status(200).json({
      success: true,
      data: transactionsWithCustomerName,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch transactions",
      error: error.message,
    });
  }
};


export const getFilteredTransactions = async (req, res) => {
  const { customer } = req.query;

  try {
    const orders = await Order.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $match: {
          "user.name": { $regex: customer || "", $options: "i" },
        },
      },
      {
        $project: {
          transactionId: "$_id",
          totalAmount: { $ifNull: ["$totalAmount", 0] }, // Default to 0 if null
          amount: { $ifNull: ["$totalAmount", 0] }, // Alias with same default
          customerName: "$user.name",
          orderStatus: 1,
          paymentMethod: 1,
          gateway: 1,
          createdAt: 1,
          products: 1,
          address: 1,
        },
      },
    ]);


     // Transform the data to ensure consistent structure
    const transformedOrders = orders.map(order => ({
      ...order,
      amount: order.amount || order.totalAmount || 0, // Fallback to 0 if both are missing
      customerName: order.customerName || "Unknown Customer"
    }));


    res.json({
      success: true,
      data: {
        transactions: transformedOrders,
        pagination: {
          total: transformedOrders.length,
          currentPage: 1,
          limit: transformedOrders.length,

        },
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error fetching filtered transactions.",
    });
  }
};


export const getOrderStatusForProduct = async (req, res) => {
  try {
    const { productId } = req.query;
    const userId = req.user.id;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const allowedStatuses = [
      "Delivered",
      "ReplacementRequested",
      "ReplacementApproved",
      "ReplacementShipped",
      "ReplacementCompleted",
      "ReplacementRejected"
    ];

    const order = await Order.findOne({
      userId,
"products": {
  $elemMatch: {
    productId: { $in: [productId, new mongoose.Types.ObjectId(productId)] }
  }
},
      orderStatus: { $in: allowedStatuses }
    });

   if (!order) {
  return res.status(200).json({
    success: true,
     eligible: false,
    orderStatus: "NOT_ELIGIBLE",
    message: "No eligible order found for this product"
  });
}

    return res.json({
      success: true,
       eligible: true,
      orderStatus: order.orderStatus
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
