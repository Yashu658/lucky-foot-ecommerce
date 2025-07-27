import Review from "../models/reviewModel.js";
import mongoose from 'mongoose';
import cloudinary from "../config/cloudinary.js";
import Product from '../models/productModel.js';

//const Product = mongoose.model('Product');

// Create a new review with image upload
export const createReview = async (req, res) => {
  try {
    const {productId, orderId, rating, comment } = req.body;
    const userId = req.user._id;


    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
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

  return {
    url: result.secure_url,
    publicId: result.public_id,
    caption: ""
  };
});

const images = await Promise.all(uploadPromises);


    const existingReview = await Review.findOne({ userId, productId });


    if (existingReview) {
      // Delete any uploaded files if review already exists
     if (req.files?.length) {
 await Promise.all(
          images.map(img => 
            img.publicId && cloudinary.uploader.destroy(img.publicId)
 ));
      
}
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }
    const review = new Review({
      userId,
      productId,
      orderId,
      rating,
      comment,
      images,
    });
    
    const savedReview = await review.save();
      await Product.updateAverageRating(productId);
    
    res.status(201).json(savedReview);
  } catch (error) {
    console.error("Error creating review:", error);
    
    // Clean up uploaded files if error occurs
    if (req.files?.length) {
      try {
        const publicIds = req.files
          .map(file => file.publicId)
          .filter(id => id);
        await Promise.all(
          publicIds.map(id => 
            cloudinary.uploader.destroy(id)
          )
        );
      } catch (cleanupError) {
        console.error("Error cleaning up images:", cleanupError);
      }
    }
    
    res.status(500).json({ 
      message: error.message || 'Failed to create review' 
    });
  }
};





// Update a review with image handling
export const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment, imagesToDelete } = req.body;
    const userId = req.user._id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid review ID' });
    }
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    // Check if the user is the owner of the review
    if (review.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'You can only update your own reviews' });
    }
    // Handle image deletions
    if (imagesToDelete && Array.isArray(imagesToDelete)) {
      await Promise.all(
        imagesToDelete.map(async publicId => {
          await cloudinary.uploader.destroy(publicId);
          review.images = review.images.filter(img => img.publicId !== publicId);
        })
      );
    }
    // Handle new image uploads
    if (req.files?.length) {
      const newImages = req.files.map(file => ({
        url: file.path,
        publicId: file.filename,
        caption: ''
      }));
      review.images.push(...newImages);
    }
    
    review.rating = rating || review.rating;
    review.comment = comment || review.comment;
    
    const updatedReview = await review.save();
    await Product.updateAverageRating(review.productId);
    res.json(updatedReview);
  } catch (error) {
    // Clean up uploaded files if error occurs
    if (req.files?.length) {
      await Promise.all(req.files.map(file => 
        cloudinary.uploader.destroy(file.filename)
      ));
    }
    res.status(500).json({ message: error.message });
  }
};




// Delete a review with image cleanup
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid review ID' });
    }
    
    const review = await Review.findById(id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Check if the user is the owner of the review or an admin
    if (review.userId.toString() !== userId.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }
    
    // Delete all associated images from Cloudinary
     if (review.images?.length) {
      await Promise.all(
        review.images.map(async (img) => {
          if (img.publicId) {
            try {
              await cloudinary.uploader.destroy(img.publicId);
            } catch (err) {
              console.error(`Error deleting image ${img.publicId}:`, err);
              // Continue even if one deletion fails
            }
          }
        })
      );
    }
    
    await review.remove();
    await Product.updateAverageRating(review.productId);
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




// Get all reviews for a product
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }
    
    const reviews = await Review.find({ productId })
      .populate('userId', 'name email') 
      .populate('adminReply.repliedBy', 'name')
      .sort({ createdAt: -1 });
    
     res.json({
      reviews,
      count: reviews.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




// Get a single review by ID
export const getReviewById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid review ID' });
    }
    
    const review = await Review.findById(id).populate('userId', 'name email');
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    res.json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




// Get average rating for a product
export const getAverageRating = async (req, res) => {
  try {
    const { productId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }
    
    const result = await Review.aggregate([
      { $match: { productId: new mongoose.Types.ObjectId(productId) } },

      { $group: { _id: null, averageRating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    
    if (result.length === 0) {
      return res.json({ averageRating: 0, count: 0 });
    }
    
    res.json({
      averageRating: parseFloat(result[0].averageRating.toFixed(1)),
      count: result[0].count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};






export const checkIfUserReviewed = async (req, res) => {
  try {
    const userId = req.user._id;
    const productId = req.query.productId;

    if (!productId) {
      return res.status(400).json({ message: 'Missing product ID' });
    }

    const existingReview = await Review.findOne({userId,productId });

    if (existingReview) {
      return res.status(200).json({
        reviewed: true,
        review: existingReview,
        message: 'You have already reviewed this product'
      });
    } else {
      return res.status(204).send(); // No content
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};





// Add to your reviewController.js
export const checkMultipleReviews = async (req, res) => {
  try {
    const userId = req.user._id;
    const productIds = req.query.productIds.split(',');

    const reviews = await Review.find({
      userId,
      productId: { $in: productIds }
    });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};





// Like or dislike a review
export const likeDislike = async (req, res) => {
  try {
    const { id } = req.params; // review id
    const userId = req.user._id;
    const { action } = req.body; // 'like' or 'dislike'

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid review ID' });
    }
    if (!['like', 'dislike'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action' });
    }

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const hasLiked = review.likes.includes(userId);
    const hasDisliked = review.dislikes.includes(userId);

    if (action === 'like') {
      if (!hasLiked) {
        review.likes.push(userId);
      }
      if (hasDisliked) {
        review.dislikes = review.dislikes.filter(id => id.toString() !== userId.toString());
      }
    } else if (action === 'dislike') {
      if (!hasDisliked) {
        review.dislikes.push(userId);
      }
      if (hasLiked) {
        review.likes = review.likes.filter(id => id.toString() !== userId.toString());
      }
    }

    await review.save();

    res.json({
      likesCount: review.likes.length,
      dislikesCount: review.dislikes.length,
      userAction: action,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




// Add these new routes
export const getallReviewbyadmin = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('userId', 'name email')
      .populate('productId', 'name')
      .sort({ createdAt: -1 });
      
    res.json({ reviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



export const reviewdeletebyAdmin = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Delete all associated images from Cloudinary
    if (review.images?.length) {
      await Promise.all(
        review.images.map(async (img) => {
          if (img.publicId) {
            try {
              await cloudinary.uploader.destroy(img.publicId);
            } catch (err) {
              console.error(`Error deleting image ${img.publicId}:`, err);
              // Continue even if one deletion fails
            }
          }
        })
      );
    }
    
        await Review.deleteOne({ _id: req.params.id });
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ message: error.message });
  }
};




// Add admin reply to a review
export const addAdminReply = async (req, res) => {
  try {
    const { id } = req.params;
    const { replyText } = req.body;
    const adminId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid review ID' });
    }

    const review = await Review.findById(id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Update or add admin reply
    review.adminReply = {
      text: replyText,
      repliedAt: new Date(),
      repliedBy: adminId
    };

    const updatedReview = await review.save();
    
    // Populate the repliedBy field for the response
    await updatedReview.populate('adminReply.repliedBy', 'name');
    
    res.json(updatedReview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove admin reply from a review
export const removeAdminReply = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid review ID' });
    }

    const review = await Review.findById(id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Only allow removal if the admin is the one who replied or is a super admin
    if (review.adminReply?.repliedBy.toString() !== adminId.toString() && !req.user.isSuperAdmin) {
      return res.status(403).json({ message: 'Not authorized to remove this reply' });
    }

    review.adminReply = undefined;
    const updatedReview = await review.save();
    
    res.json(updatedReview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};