import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    mrp: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    subCategory: {
      type: String,
      required: true,
      trim: true,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    brand: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: [String],
      required: true,
      validate: {
        validator: function (arr) {
          return arr.every((url) =>
            /^https?:\/\/.+\.(jpg|jpeg|png|webp)$/.test(url)
          );
        },
        message: "Invalid image URL format",
      },
    },

    size: {
      type: [
        {
          size: { type: String, required: true },
          quantity: { type: Number, required: true, min: 0 },
        },
      ],
      required: true,
      default: [], // Add default empty array
    },
    color: {
      type: String,
      required: true,
      trim: true,
    },
    discount: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    salePrice: {
      type: Number,
    },
    description: {
      type: {
        overview: String,
        features: [String],
        specifications: [
          {
            name: String,
            value: String
          }
        ],
        careInstructions: String,
        materialComposition: String,
        additionalInfo: [String],
      },
      required: true
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    gender: {
      type: String,
      enum: ["men", "women", "kids", "unisex"],
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

// Calculate salePrice before saving
productSchema.pre("save", function (next) {
  this.salePrice = this.mrp - (this.mrp * this.discount) / 100;
  next();
});




const Product = mongoose.model("Product", productSchema);





Product.updateAverageRating = async function (productId) {
  try {
    const Review = mongoose.model("Review");
    const result = await Review.aggregate([
      { $match: { productId: new mongoose.Types.ObjectId(productId) } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          count: { $sum: 1 },
        },
      },
    ]);

    let averageRating = 0;
    let reviewCount = 0;

    if (result.length > 0) {
      averageRating = parseFloat(result[0].averageRating.toFixed(1));
      reviewCount = result[0].count;
    }

    await this.findByIdAndUpdate(productId, {
      averageRating,
      reviewCount,
    });
  } catch (error) {
    console.error("Error updating product rating:", error);
    throw error;
  }
};

export default Product;
