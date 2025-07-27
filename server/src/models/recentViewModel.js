import mongoose from "mongoose";

const recentViewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  products: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    viewedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, { timestamps: true });

// Limit to 10 most recent products per user
recentViewSchema.methods.addProduct = async function(productId) {
  // Remove if product already exists
  this.products = this.products.filter(p => !p.productId.equals(productId));
  
  // Add new product to beginning of array
  this.products.unshift({ productId });
  
  // Keep only last 10 viewed products
  if (this.products.length > 10) {
    this.products = this.products.slice(0, 10);
  }
  
  await this.save();
};

const RecentView = mongoose.model("RecentView", recentViewSchema);
export default RecentView;