import Offer from '../models/offerModel.js';
import cloudinary from '../config/cloudinary.js';

// Admin
export const createOffer = async (req, res) => {
  try {
    const {
      title,
      description,
      discountType,
      discountValue,
      startDate,
      endDate,
      offerType,
      isActive,
      buttonText,
      buttonLink,
      products
    } = req.body;

    // Upload image to Cloudinary
    let imageUrl = '';
    if (req.file) {
      const b64 = Buffer.from(req.file.buffer).toString('base64');
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;
      
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: "LuckyFootwear/offers",
        width: 1200,
    height: 1200,
    crop: "fill",
        quality: "auto"
      });
      
      imageUrl = result.secure_url;
    }

    const parsedProducts = JSON.parse(products || '[]');

    const offer = await Offer.create({
      title,
      description,
      discountType,
      discountValue,
      startDate,
      endDate,
      offerType,
      imageUrl,
      isActive,
      buttonText,
      buttonLink,
      products: parsedProducts
    });

    const offers = await Offer.find().sort({ createdAt: -1 });

    res.status(201).json({
      success: true,
      message: 'Offer created successfully',
      offer,
      updatedOffers: offers
    });
  } catch (error) {
    console.error('Error creating offer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create offer',
      error: error.message
    });
  }
};


// Public
export const getAllOffers = async (req, res) => {
  try {
    const offers = await Offer.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      offers
    });
  } catch (error) {
    console.error('Error fetching offers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch offers',
      error: error.message
    });
  }
};

// Public
export const getOfferById = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    
    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found'
      });
    }
    
    res.status(200).json({
      success: true,
      offer
    });
  } catch (error) {
    console.error('Error fetching offer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch offer',
      error: error.message
    });
  }
};


// Admin
export const updateOffer = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    
    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found'
      });
    }

    const {
      title,
      description,
      discountType,
      discountValue,
      startDate,
      endDate,
      offerType,
      isActive,
      buttonText,
      buttonLink,
      products
    } = req.body;

    let imageUrl = offer.imageUrl;
    
    // If new image is uploaded
    if (req.file) {
      // First delete old image from Cloudinary if it exists
      if (offer.imageUrl) {
        const imgId = offer.imageUrl.split('/upload/')[1].split('/');
        const public_id = imgId[1] + '/' + imgId[2] + '/' + imgId[3].split('.')[0];
        await cloudinary.uploader.destroy(public_id);
      }
      
      // Upload new image
      const b64 = Buffer.from(req.file.buffer).toString('base64');
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;
      
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: "LuckyFootwear/offers",
        width: 1200,
    height: 1200,
    crop: "fill",
        quality: "auto"
      });
      
      imageUrl = result.secure_url;
    }

    const parsedProducts = JSON.parse(products || '[]');

    const updatedOffer = await Offer.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        discountType,
        discountValue,
        startDate,
        endDate,
        offerType,
        imageUrl,
        isActive,
        buttonText,
        buttonLink,
        products: parsedProducts
      },
      { new: true }
    );

    const offers = await Offer.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Offer updated successfully',
      offer: updatedOffer,
      updatedOffers: offers
    });
  } catch (error) {
    console.error('Error updating offer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update offer',
      error: error.message
    });
  }
};


// Admin
export const deleteOffer = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    
    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found'
      });
    }

    // Delete image from Cloudinary if it exists
    if (offer.imageUrl) {
      const imgId = offer.imageUrl.split('/upload/')[1].split('/');
      const public_id = imgId[1] + '/' + imgId[2] + '/' + imgId[3].split('.')[0];
      await cloudinary.uploader.destroy(public_id);
    }

    await Offer.findByIdAndDelete(req.params.id);

    const offers = await Offer.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Offer deleted successfully',
      updatedOffers: offers
    });
  } catch (error) {
    console.error('Error deleting offer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete offer',
      error: error.message
    });
  }
};

// Admin
export const toggleOfferStatus = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    
    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found'
      });
    }

    offer.isActive = !offer.isActive;
    await offer.save();

    const offers = await Offer.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: `Offer ${offer.isActive ? 'activated' : 'deactivated'}`,
      updatedOffers: offers
    });
  } catch (error) {
    console.error('Error toggling offer status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle offer status',
      error: error.message
    });
  }
};



//Public
export const getActiveOffers = async (req, res) => {
  try {
    const currentDate = new Date();
     const allOffers = await Offer.find({});
   // console.log('All offers in DB:', allOffers); 
    const  offers = await Offer.find({
      isActive: true,
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate }
    }).sort({ createdAt: -1 });
    
    // console.log('Active offers:', offers);
    res.status(200).json({
      success: true,
      offers
    });
  } catch (error) {
    console.error('Error fetching active offers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch active offers',
      error: error.message
    });
  }
};