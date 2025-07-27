import User from "../models/userModel.js"
import bcrypt from "bcrypt";
import Product from "../models/productModel.js";
import Order from "../models/orderModel.js";
import Review from "../models/reviewModel.js";
import Wishlist from "../models/WishlistModel.js";
import Cart from "../models/cartModel.js";



export const getAllUsers = async (req, res) => {
  try {
    const { search = '', status = '', q = '' } = req.query;
    const query = {};

    // Build search query
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        ...(mongoose.Types.ObjectId.isValid(q) ? [{ _id: q }] : [])
      ];
    } else if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    // Add status filter if provided
    // if (status && ['Active', 'Inactive', 'Blocked'].includes(status)) {
    //   query.status = status;
    // }

    // Fetch customers with basic info
    const customers = await User.find(query)
      .select('-password -__v')
      .sort({ createdAt: -1 })
      .lean();

    // Get order stats in a single aggregation
    const customerStats = await Order.aggregate([
      { 
        $match: { 
          userId: { $in: customers.map(c => c._id) } 
        } 
      },
      {
        $group: {
          _id: '$userId',
          orderCount: { $sum: 1 },
          totalSpent: { $sum: '$totalAmount' },
          delivered: {
            $sum: {
              $cond: [{ $eq: ['$orderStatus', 'Delivered'] }, 1, 0]
            }
          },
          cancelled: {
            $sum: {
              $cond: [{ $eq: ['$orderStatus', 'Cancelled'] }, 1, 0]
            }
          }
        }
      }
    ]);

    // Create a map for quick lookup
    const statsMap = new Map(
      customerStats.map(stat => [stat._id.toString(), stat])
    );

    // Combine customer data with stats
    const customersWithStats = customers.map(customer => ({
      ...customer,
      orderCount: statsMap.get(customer._id.toString())?.orderCount || 0,
      totalSpent: statsMap.get(customer._id.toString())?.totalSpent || 0,
      stats: {
        delivered: statsMap.get(customer._id.toString())?.delivered || 0,
        cancelled: statsMap.get(customer._id.toString())?.cancelled || 0
      }
    }));

    res.status(200).json({
      success: true,
      count: customersWithStats.length,
      customers: customersWithStats
    });

  } catch (error) {
    console.error('Error in getAllUsers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};



export const createByAdmin = async (req, res, next) => {
  try {
    const { name, email, phone, password, gender, dob } = req.body;

    if (!name || !email || !phone || !password || !gender || !dob) {
      const error = new Error("All fields are required");
      error.statusCode = 400;
      return next(error);
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error = new Error("User already exists");
      error.statusCode = 409;
      return next(error);
    }

    const profilePic = `https://placehold.co/400X400?text=${name.charAt(0)}`;

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      gender,
      dob,
      status: "Active",
      role: "User",
      profilePic,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};



export const updateByAdmin = async (req, res, next) => {
  try {
    const { name, phone, gender, dob } = req.body;
    const userId = req.params.id;

    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    if (!name || !phone || !gender || !dob) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const updateData = { name, phone, gender, dob };

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    }).select("-password");

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: {
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        gender: updatedUser.gender,
        dob: updatedUser.dob,
        status: updatedUser.status,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    console.error("Update error:", error);
    next(error);
  }
};



export const updateStatusByAdmin = async (req, res, next) => {
  try {
    const { status } = req.body;
    const userId = req.params.id;

    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    if (!status) {
      return res.status(400).json({ 
        success: false, 
        message: "Status is required" 
      });
    }

    const validStatuses = ["Active", "Inactive", "Blocked"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid status. Must be one of: Active, Inactive, Blocked" 
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }


    // Prevent changing status of admin users
    if (user.role === "Admin") {
      return res.status(403).json({ 
        success: false, 
        message: "Cannot change status of admin users" 
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId, 
      { status }, 
      { new: true }
    ).select("-password");

    res.status(200).json({
      success: true,
      message: `User status updated to ${status} successfully`,
      user: updatedUser
    });
  } catch (error) {
    console.error("Status update error:", error);
    next(error);
  }
};




export const getCustomerDetails = async (req, res) => {
  try {
    const { customerId } = req.params;

    // Get basic customer info
    const customer = await User.findById(customerId)
      .select('-password -__v')
      .lean();

    if (!customer) {
      return res.status(404).json({ 
        success: false,
        message: "Customer not found" 
      });
    }

    // Get all customer orders
    const orders = await Order.find({ userId: customerId })
      .sort({ createdAt: -1 })
      .populate('products.productId', 'name image')
      .lean();

    // Get customer reviews
    const reviews = await Review.find({ userId: customerId })
      .populate('productId', 'name image')
      .sort({ createdAt: -1 })
      .lean();

    // Get customer wishlist
    const wishlist = await Wishlist.findOne({ user: customerId })
      .populate('products', 'name image price discount')
      .lean();

    // Get customer cart
    const cart = await Cart.findOne({ userId: customerId })
      .populate('products.productId', 'name image price discount')
      .lean();

    // Calculate order statistics
    const orderStats = {
      totalOrders: orders.length,
      pending: orders.filter(o => o.orderStatus === 'Pending').length,
      delivered: orders.filter(o => o.orderStatus === 'Delivered').length,
      cancelled: orders.filter(o => o.orderStatus === 'Cancelled').length,
      returned: orders.filter(o => o.orderStatus === 'Returned').length,
      totalSpent: orders.reduce((sum, order) => sum + order.totalAmount, 0)
    };

    res.status(200).json({
      success: true,
      customer: {
        ...customer,
        stats: orderStats
      },
      orders,
      reviews,
      wishlist: wishlist?.products || [],
      cart: cart?.products || []
    });

  } catch (error) {
    console.error("Error in getCustomerDetails:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch customer details",
      error: error.message
    });
  }
};




export const updateCustomerStatus = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { status } = req.body;
    
    if (!['Active', 'Inactive', 'Blocked'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value"
      });
    }
    
    const customer = await User.findByIdAndUpdate(
      customerId,
      { status },
      { new: true }
    ).select('-password -__v');
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found"
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Customer status updated",
      customer
    });
    
  } catch (error) {
    console.error("Error in updateCustomerStatus:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update customer status",
      error: error.message
    });
  }
};