import RecentView from "../models/recentViewModel.js";
import Product from "../models/productModel.js";

export const trackProductView = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    let recentView = await RecentView.findOne({ userId });
    
    if (!recentView) {
      recentView = new RecentView({ userId, products: [] });
    }
    
    await recentView.addProduct(productId);
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error tracking product view:", error);
    res.status(500).json({ success: false, message: "Error tracking view" });
  }
};

export const getRecentViews = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const recentView = await RecentView.findOne({ userId })
      .populate({
        path: "products.productId",
        select: "name image mrp discount rating",
        match: { status: "active" } // Only include active products
      });
    
    if (!recentView) {
      return res.status(200).json({ success: true, products: [] });
    }
    
    // Filter out any null products (in case they were deleted)
    const validProducts = recentView.products
      .filter(p => p.productId)
      .map(p => ({
        ...p.productId._doc,
        viewedAt: p.viewedAt
      }));
    
    res.status(200).json({ 
      success: true, 
      products: validProducts 
    });
  } catch (error) {
    console.error("Error getting recent views:", error);
    res.status(500).json({ success: false, message: "Error getting recent views" });
  }
};