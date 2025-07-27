import mongoose from 'mongoose';

const offerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'percentage'
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true,
      validate: {
        validator: function(endDate) {
          return endDate > this.startDate;
        },
        message: 'End date must be after start date'
      }
    },
    offerType: {
      type: String,
      enum: ['slider', 'page', 'popup'],
      required: true
    },
    imageUrl: {
      type: String,
      required: true,
      validate: {
        validator: function(url) {
          return /^https?:\/\/.+\.(jpg|jpeg|png|webp)$/.test(url);
        },
        message: 'Invalid image URL format'
      }
    },
    isActive: {
      type: Boolean,
      default: true
    },
    buttonText: {
      type: String,
      default: 'Shop Now'
    },
    buttonLink: {
      type: String,
      default: '/shop'
    },
    products: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }],
    couponCode: {
      type: String,
      trim: true
    }
  },
  { timestamps: true }
);

// Index for active offers that are currently valid
offerSchema.index({ 
  isActive: 1, 
  startDate: 1, 
  endDate: 1 
});

const Offer = mongoose.model('Offer', offerSchema);

export default Offer;