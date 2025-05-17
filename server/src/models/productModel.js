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
    rating: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
    },
    brand: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: [String],
      required: true,
    },
    size: {
      type: [
        {
          size: { type: String, required: true },
          quantity: { type: Number, required: true, min: 0 },
        },
      ],
      required: true,
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
    description: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
export default Product;