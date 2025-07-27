import User from "../models/userModel.js";
import Product from "../models/productModel.js";
import Review from "../models/reviewModel.js";
import Order from "../models/orderModel.js";
import cloudinary from "../config/cloudinary.js";

export const addProduct = async (req, res, next) => {
  try {
    const {
      name,
      mrp,
      discount,
      description,
      category,
      subCategory,
      rating,
      color,
      size,
      brand,
      gender,
    } = req.body;

    let descriptionObj;
    try {
      descriptionObj = JSON.parse(description);
    } catch (e) {
      return res.status(400).json({
        success: false,
        message: "Invalid description format",
      });
    }

    // Upload images to Cloudinary and get only secure URLs
    const uploadPromises = req.files.map(async (file) => {
      const b64 = Buffer.from(file.buffer).toString("base64");
      const dataURI = `data:${file.mimetype};base64,${b64}`;

      const result = await cloudinary.uploader.upload(dataURI, {
        folder: "LuckyFootwear/products",
        width: 800,
        height: 800,
        crop: "fill",
        quality: "auto",
      });

      return result.secure_url;
    });

    const uploadedImageUrls = await Promise.all(uploadPromises);

    const Stock = JSON.parse(size);

    const newProduct = await Product.create({
      name,
      mrp,
      discount,
      description: descriptionObj,
      category,
      subCategory,
      rating,
      color,
      size: Stock,
      brand,
      gender,
      image: uploadedImageUrls,
      status: "active",
    });

    res.status(201).json({
      success: true,
      message: "Product added successfully",
      product: newProduct,
    });
  } catch (error) {
    console.error("Product creation error:", error);
    next(error);
  }
};

export const getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.find();

    res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      products,
    });
  } catch (error) {
    console.error("Product fetching error:", error);
    next(error);
  }
};

export const getAllProduct = async (req, res, next) => {
  try {
    const filter = { status: "active" };

    // Status filter (exact match)
    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.sale === "true") {
      filter.discount = { $gt: 0 }; // Only products with discount > 0
    }

    // Category filter (multiple, case-insensitive)
    if (req.query.category) {
      const categories = req.query.category
        .split(",")
        .map((cat) => new RegExp(`^${cat}$`, "i"));
      filter.category = { $in: categories };
    }

    // SubCategory filter (multiple, case-insensitive)
    if (req.query.subCategory) {
      const subCategories = req.query.subCategory
        .split(",")
        .map((sub) => new RegExp(`^${sub}$`, "i"));
      filter.subCategory = { $in: subCategories };
    }

    // Gender filter (multiple, case-insensitive)
    if (req.query.gender) {
      const genders = req.query.gender
        .split(",")
        .map((g) => new RegExp(`^${g}$`, "i"));
      filter.gender = { $in: genders };
    }

    // Product name filter (partial, case-insensitive)
    if (req.query.name) {
      filter.name = { $regex: req.query.name, $options: "i" };
    }

    // Brand filter (partial, case-insensitive)
    if (req.query.brand) {
      filter.brand = { $regex: req.query.brand, $options: "i" };
    }

    // MRP filter - expect range as min,max or single value
    if (req.query.mrp) {
      const mrpValues = req.query.mrp.split(",");
      if (mrpValues.length === 2) {
        filter.mrp = { $gte: Number(mrpValues[0]), $lte: Number(mrpValues[1]) };
      } else {
        filter.mrp = Number(mrpValues[0]);
      }
    }

    // Rating filter - expect range as min,max or single value
    if (req.query.rating) {
      const ratingValues = req.query.rating.split(",");
      if (ratingValues.length === 2) {
        filter.rating = {
          $gte: Number(ratingValues[0]),
          $lte: Number(ratingValues[1]),
        };
      } else {
        filter.rating = Number(ratingValues[0]);
      }
    }

    // Color filter (partial, case-insensitive)
    if (req.query.color) {
      filter.color = { $regex: req.query.color, $options: "i" };
    }

    // Discount filter - expect range as min,max or single value
    if (req.query.discount) {
      const discountValues = req.query.discount.split(",");
      if (discountValues.length === 2) {
        filter.discount = {
          $gte: Number(discountValues[0]),
          $lte: Number(discountValues[1]),
        };
      } else {
        filter.discount = Number(discountValues[0]);
      }
    }

    if (req.query.updatedAfter) {
      const updatedAfterDate = new Date(req.query.updatedAfter);
      if (!isNaN(updatedAfterDate)) {
        filter.updatedAt = { $gte: updatedAfterDate };
      }
    }

    // Sorting: latest products first or by other criteria
    // Default sort by createdAt descending (latest first)
    let sort = { createdAt: -1 };

 if (req.query.sortBy) {
  switch (req.query.sortBy.toLowerCase()) {
    case "mrp_asc":
      sort = { mrp: 1 };
      break;
    case "mrp_desc":
      sort = { mrp: -1 };
      break;
    case "rating_asc":
      sort = { averageRating: 1 };
      break;
    case "rating_desc":
      sort = { averageRating: -1, reviewCount: -1 };
      break;
    case "discount_asc":
      sort = { discount: 1 };
      break;
    case "discount_desc":
      sort = { discount: -1 };
      break;
    case "latest":
      sort = { createdAt: -1 };
      break;
    case "updated":
      sort = { updatedAt: -1, createdAt: -1 };
      break;
    default:
      sort = { createdAt: -1 };
  }
}

    const products = await Product.find(filter).sort(sort);

    res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      products,
    });
  } catch (error) {
    console.error("Product fetching error:", error);
    next(error);
  }
};




export const getDashboardStats = async (req, res) => {
  try {
    // Get counts from database
    const [usersCount, productsCount, ordersCount] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
    ]);

    // Get recent orders with user and product details
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("userId", "name email")
      .populate("products.productId", "name image");

    // Calculate total revenue (example)
    const revenueResult = await Order.aggregate([
      {
        $match: { paymentStatus: "Paid" },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
    ]);

    const totalRevenue = revenueResult[0]?.totalRevenue || 0;

    const statusCounts = await Order.aggregate([
      {
        $group: {
          _id: { $toLower: "$orderStatus" },
          count: { $sum: 1 },
        },
      },
    ]);

    // Convert to a dictionary
    const statusMap = statusCounts.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      stats: {
        totalOrders: ordersCount,
        totalSales: totalRevenue,
        totalProducts: productsCount,
        totalCustomers: usersCount,
        totalPending: statusMap["pending"] || 0,
        totalProcessing: statusMap["processing"] || 0,
        totalShipped: statusMap["shipped"] || 0,
      },
      recentOrders,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard data",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};



export const getProductById = async (req, res) => {
  try {
    // 1. Validate ID format more thoroughly
    const productId = req.params.id;
    if (!productId || !productId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        code: "INVALID_PRODUCT_ID",
        message: "Please provide a valid product ID",
        details: {
          expected: "24-character hexadecimal string",
          received: productId || "undefined",
        },
      });
    }

    // 2. Add caching layer (pseudo-code)
    // const cachedProduct = await cache.get(`product:${productId}`);
    // if (cachedProduct) return res.json(cachedProduct);

    // 3. Database query with projection and error handling
    const product = await Product.findById(productId)
      .select("-__v -createdAt -updatedAt") // Exclude unnecessary fields
      .lean()
      .catch((dbError) => {
        console.error("Database query failed:", dbError);
        throw new Error("Database operation failed");
      });

    if (!product) {
      return res.status(404).json({
        success: false,
        code: "PRODUCT_NOT_FOUND",
        message: "The requested product was not found",
        productId,
      });
    }

    let ratingDetails = {
      average: 0,
      count: 0,
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    try {
      const ratingStats = await Review.aggregate([
        { $match: { productId: new mongoose.Types.ObjectId(productId) } },
        {
          $group: {
            _id: null,
            average: { $avg: "$rating" },
            count: { $sum: 1 },
            1: { $sum: { $cond: [{ $eq: ["$rating", 1] }, 1, 0] } },
            2: { $sum: { $cond: [{ $eq: ["$rating", 2] }, 1, 0] } },
            3: { $sum: { $cond: [{ $eq: ["$rating", 3] }, 1, 0] } },
            4: { $sum: { $cond: [{ $eq: ["$rating", 4] }, 1, 0] } },
            5: { $sum: { $cond: [{ $eq: ["$rating", 5] }, 1, 0] } },
          },
        },
      ]);

      if (ratingStats.length > 0) {
        ratingDetails = ratingStats[0];
      }
    } catch (reviewError) {
      console.log("Could not fetch review stats:", reviewError.message);
      // Continue with default ratingDetails
    }

    // 4. Data transformation and validation
    const productData = {
      ...product,
      ratingDetails,
      image: Array.isArray(product.image) ? product.image : [product.image],
      size: Array.isArray(product.size) ? product.size : [],
      // Calculate discounted price server-side
      discountedPrice:
        product.mrp - (product.mrp * (product.discount || 0)) / 100,
    };

    // 5. Validate transformed data
    if (!productData.name || !productData.mrp || !productData.image.length) {
      console.warn("Incomplete product data:", productData);
      // Don't fail, but log the issue
    }

    // 6. Cache the result (pseudo-code)
    // await cache.set(`product:${productId}`, {
    //   success: true,
    //   product: productData
    // }, 3600); // Cache for 1 hour

    // 7. Successful response
    res.status(200).json({
      success: true,
      product: productData,
      meta: {
        fetchedAt: new Date().toISOString(),
        cache: false, // Would be true if from cache
      },
    });
  } catch (err) {
    console.error("Product fetch error:", err);
    console.error("Product fetch error:", {
      message: err.message,
      stack: err.stack,
      productId: req.params.id,
      timestamp: new Date().toISOString(),
    });

    res.status(500).json({
      success: false,
      message: "Server error while fetching product",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};



export const updateProduct = async (req, res, next) => {
  try {
    const {
      name,
      mrp,
      discount,
      description,
      category,
      subCategory,
      rating,
      color,
      size,
      brand,
      gender,
      image: existingImagesJson, // This comes from the frontend when no new images are uploaded
    } = req.body;

    const productID = req.params.id;
    const existingProduct = await Product.findById(productID);

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    let uploadedImageUrls = existingProduct.image; // Default to existing images

    // Case 1: New images were uploaded (as files)
    if (req.files && req.files.length > 0) {
      // First delete existing images from Cloudinary
      const deletePromises = existingProduct.image.map(async (img) => {
        try {
          const imgId = img.split("/upload/")[1].split("/");
          const public_id =
            imgId[1] + "/" + imgId[2] + "/" + imgId[3].split(".")[0];
          await cloudinary.uploader.destroy(public_id);
        } catch (err) {
          console.error("Error deleting image from Cloudinary:", err);
        }
      });

      await Promise.all(deletePromises);

      // Upload new images to Cloudinary
      const uploadPromises = req.files.map(async (file) => {
        const b64 = Buffer.from(file.buffer).toString("base64");
        const dataURI = `data:${file.mimetype};base64,${b64}`;

        const result = await cloudinary.uploader.upload(dataURI, {
          folder: "LuckyFootwear/products",
          width: 800,
          height: 800,
          crop: "fill",
          quality: "auto",
        });

        return result.secure_url;
      });

      uploadedImageUrls = await Promise.all(uploadPromises);
    }
    // Case 2: No new images, but we got existing images JSON from frontend
    else if (existingImagesJson) {
      try {
        uploadedImageUrls = JSON.parse(existingImagesJson);
      } catch (e) {
        console.error("Error parsing existing images JSON:", e);
        // Fall back to existing product images
        uploadedImageUrls = existingProduct.image;
      }
    }

    const Stock = JSON.parse(size);

    let descriptionObj;
    try {
      descriptionObj =
        typeof req.body.description === "string"
          ? JSON.parse(req.body.description)
          : req.body.description;
    } catch (e) {
      return res.status(400).json({
        success: false,
        message: "Invalid description format",
      });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productID,
      {
        name,
        mrp,
        discount,
        description: descriptionObj,
        category,
        subCategory,
        rating,
        color,
        size: Stock,
        brand,
        gender,
        image: uploadedImageUrls,
        status: "active",
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Product update error:", error);
    next(error);
  }
};



export const deleteProduct = async (req, res, next) => {
  console.log("deleteProduct");
};



export const updateProductStatus = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const { status } = req.body;

    // Basic validation
    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value. Must be 'active' or 'inactive'",
      });
    }

    let updateData = { status };

    // If status is being set to inactive, store original quantities in a new field
    if (status === "inactive") {
      const product = await Product.findById(productId);
      updateData.originalQuantities = product.size.map((item) => ({
        size: item.size,
        quantity: item.quantity,
      }));

      // Set all quantities to 0
      updateData.size = product.size.map((item) => ({
        size: item.size,
        quantity: 0,
      }));
    } else if (status === "active") {
      // If reactivating, restore original quantities if they exist
      const product = await Product.findById(productId);
      if (product.originalQuantities) {
        updateData.size = product.originalQuantities;
        updateData.originalQuantities = undefined;
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      updateData,
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product status updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product status:", error);
    next(error);
  }
};



// Add this to your productController.js
export const getProductsByIds = async (req, res) => {
  try {
    const { productIds } = req.body;

    if (!productIds || !Array.isArray(productIds)) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of product IDs",
      });
    }

    const products = await Product.find({ _id: { $in: productIds } });

    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Error fetching products by IDs:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching products",
    });
  }
};




export const updateProductDiscounts = async (req, res, next) => {
  try {
    const { productIds, discount } = req.body;

    // Validate input
    if (!Array.isArray(productIds) || typeof discount !== 'number') {
      return res.status(400).json({
        success: false,
        message: "Invalid request data"
      });
    }

    // Update all products with the new discount
    const { modifiedCount } = await Product.updateMany(
      { _id: { $in: productIds } },
      { $set: { discount } }
    );

    res.status(200).json({
      success: true,
      message: `Updated discount for ${modifiedCount} products`,
      modifiedCount
    });
  } catch (error) {
    console.error("Error updating product discounts:", error);
    next(error);
  }
};