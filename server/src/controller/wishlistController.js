import Wishlist from "../models/WishlistModel.js";

export const getWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const wishlist = await Wishlist.findOne({ user: userId }).populate("products");
    
    if (!wishlist) {
      return res.status(200).json({ products: [] }); // Return empty array if no wishlist exists
    }
    
  res.status(200).json({ success: true, products: wishlist.products });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err});
  }
};

export const addToWishlist = async (req, res) => {
   // console.log('Add to wishlist endpoint hit');
 // console.log('Authenticated user:', req.user);
 // console.log('Product ID:', req.params.productId);
  try {
    // Check if product exists
    const wishlist = await Wishlist.findOneAndUpdate(
      { user: req.user._id },
      { $addToSet: { products: req.params.productId } },
      { upsert: true, new: true }
    ).populate("products");
    
     console.log("Updated wishlist:", wishlist);
    // Return just the product IDs for easier frontend handling
    const productIds = wishlist.products.map(p => p._id.toString());
    res.status(200).json({ 
      success: true,
      products: productIds
    });
  } catch (err) {
       console.error("Add to wishlist error:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;

    const wishlist = await Wishlist.findOneAndUpdate(
      { user: userId },
      { $pull: { products: productId } },
      { new: true }
    ).populate("products");

    res.status(200).json(wishlist);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};