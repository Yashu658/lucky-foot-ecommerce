import Product from "../models/productModel.js";
import Review from "../models/reviewModel.js";


export const searchProducts = async (req, res) => {
  try {
    const { 
      category, brand, q, minPrice, maxPrice, minDiscount, maxDiscount,
      minRating, color, gender, size, sortBy, page = 1, limit = 12
    } = req.query;

    // Validate numeric inputs
    const pageNum = Math.max(1, parseInt(page)) || 1;
    const limitNum = Math.min(Math.max(1, parseInt(limit)) || 12, 100); // Cap at 100 items per page

    // Build filter with active products only
    const filter = { status: "active" };

    // Price filter with validation
    if (minPrice || maxPrice) {
      filter.mrp = {};
      const minPriceVal = parseFloat(minPrice);
      const maxPriceVal = parseFloat(maxPrice);
      
      if (!isNaN(minPriceVal)) filter.mrp.$gte = minPriceVal;
      if (!isNaN(maxPriceVal)) filter.mrp.$lte = maxPriceVal;
    }

    // Discount filter with validation
    if (minDiscount || maxDiscount) {
      filter.discount = {};
      const minDiscountVal = Math.min(Math.max(0, parseFloat(minDiscount) || 0), 100);
      const maxDiscountVal = Math.min(Math.max(0, parseFloat(maxDiscount) || 100), 100);
      
      if (!isNaN(minDiscountVal)) filter.discount.$gte = minDiscountVal;
      if (!isNaN(maxDiscountVal)) filter.discount.$lte = maxDiscountVal;
    }

    // Rating filter with validation
 // Get product IDs with average rating >= minRating if specified
    let ratedProductIds = [];
    if (minRating) {
      const ratingVal = Math.min(Math.max(0, parseFloat(minRating)), 5);
      if (!isNaN(ratingVal)) {
        const ratedProducts = await Review.aggregate([
          {
            $group: {
              _id: "$productId",
              averageRating: { $avg: "$rating" },
              count: { $sum: 1 }
            }
          },
          {
            $match: {
              averageRating: { $gte: ratingVal }
            }
          }
        ]);
        
        ratedProductIds = ratedProducts.map(p => p._id);
        filter._id = { $in: ratedProductIds };
      }
    }


    // Text search conditions with text index support
    if (q) {
      const searchTerms = q.trim();
      if (searchTerms.length > 0) {
        filter.$text = { $search: searchTerms };
      }
    }

    // Handle multiple values for filters (comma-separated)
    const buildRegexFilter = (values, field) => {
      if (!values) return null;
      const valuesArray = values.split(',');
      if (valuesArray.length === 1) {
        return { [field]: { $regex: valuesArray[0].trim(), $options: "i" } };
      }
      return { [field]: { $in: valuesArray.map(v => new RegExp(v.trim(), 'i')) } };
    };

    // Category filter - handle multiple categories
    if (category) {
      const categoryFilter = buildRegexFilter(category, 'category');
      const subCategoryFilter = buildRegexFilter(category, 'subCategory');
      
      filter.$or = [
        ...(categoryFilter ? [categoryFilter] : []),
        ...(subCategoryFilter ? [subCategoryFilter] : [])
      ];
    }

    // Other filters
    if (brand) {
      const brandFilter = buildRegexFilter(brand, 'brand');
      if (brandFilter) Object.assign(filter, brandFilter);
    }

    if (color) {
      const colorFilter = buildRegexFilter(color, 'color');
      if (colorFilter) Object.assign(filter, colorFilter);
    }

    if (gender) {
      const genderFilter = buildRegexFilter(gender, 'gender');
      if (genderFilter) Object.assign(filter, genderFilter);
    }

    

    // Size filter - handle multiple sizes and case insensitivity
    if (size) {
      const sizes = size.split(',').map(s => s.trim().toUpperCase());
      filter['size.size'] = sizes.length === 1 ? sizes[0] : { $in: sizes };
      filter['size.quantity'] = { $gt: 0 };
    }

    // Sorting options
 // Sorting options
const sortOptions = {};
if (sortBy) {
  switch (sortBy.toLowerCase()) {
    case 'price-asc': sortOptions.mrp = 1; break;
    case 'price-desc': sortOptions.mrp = -1; break;
    case 'discount-asc': sortOptions.discount = 1; break;
    case 'discount-desc': sortOptions.discount = -1; break;
    case 'newest': sortOptions.createdAt = -1; break;
    case 'oldest': sortOptions.createdAt = 1; break;
    case 'rating': 
      sortOptions.averageRating = -1; // Sort by highest rating first
      sortOptions.reviewCount = -1;   // Secondary sort by number of reviews
      break;
    case 'popular': sortOptions.popularityScore = -1; break;
    default: sortOptions.createdAt = -1;
  }
} else {
  sortOptions.createdAt = -1;
}

    // Pagination logic
    const skip = (pageNum - 1) * limitNum;

    // Execute queries in parallel with optimized projections
   const [products, total] = await Promise.all([
  Product.find(filter)
    .select('name brand category subCategory mrp discount averageRating reviewCount image color gender sizes slug size.size size.quantity')
    .sort(sortOptions)
    .skip(skip)
    .limit(limitNum)
    .lean(),
  Product.countDocuments(filter)
]);

    // Calculate sale prices and add to products
    products.forEach(product => {
      product.salePrice = product.mrp * (1 - (product.discount / 100));
    });

    // Get available filters - only for active filters
    const activeFilters = { ...filter };
    delete activeFilters.status;
    delete activeFilters.$text; // Don't include text search in available filters

    const [brands, categories, subCategories, colors, genders, sizes] = await Promise.all([
      Product.distinct('brand', activeFilters),
      Product.distinct('category', activeFilters),
      Product.distinct('subCategory', activeFilters),
      Product.distinct('color', activeFilters),
      Product.distinct('gender', activeFilters),
      Product.distinct('size.size', { ...activeFilters, 'size.quantity': { $gt: 0 } })
    ]);

      // Get average ratings for all products in the result
    const productIds = products.map(p => p._id);
    const ratings = await Review.aggregate([
      {
        $match: {
          productId: { $in: productIds }
        }
      },
      {
        $group: {
          _id: "$productId",
          averageRating: { $avg: "$rating" },
          count: { $sum: 1 }
        }
      }
    ]);

    // Create a map of productId to rating info
    const ratingMap = {};
    ratings.forEach(r => {
      ratingMap[r._id.toString()] = {
        averageRating: parseFloat(r.averageRating.toFixed(1)),
        ratingCount: r.count
      };
    });

    // Add rating info to products
    const productsWithRatings = products.map(product => {
      const ratingInfo = ratingMap[product._id.toString()] || {
        averageRating: 0,
        ratingCount: 0
      };
      return {
        ...product,
        averageRating: ratingInfo.averageRating,
        ratingCount: ratingInfo.ratingCount,
        salePrice: product.mrp * (1 - (product.discount / 100))
      };
    });


    // Build response with more detailed pagination info
    const totalPages = Math.ceil(total / limitNum);
    const responseData = {
      success: true,
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1
      },
      filters: {
        applied: {
          ...(q && { searchQuery: q }),
          ...(category && { category }),
          ...(brand && { brand }),
          ...(color && { color }),
          ...(gender && { gender }),
          ...(size && { size }),
          ...((minPrice || maxPrice) && { 
            priceRange: { 
              min: minPrice ? parseFloat(minPrice) : undefined,
              max: maxPrice ? parseFloat(maxPrice) : undefined 
            } 
          }),
          ...((minDiscount || maxDiscount) && { 
            discountRange: { 
              min: minDiscount ? parseFloat(minDiscount) : undefined,
              max: maxDiscount ? parseFloat(maxDiscount) : undefined 
            } 
          }),
          ...(minRating && { minRating: parseFloat(minRating) })
        },
        available: { 
          brands: brands.filter(Boolean).sort(),
          categories: categories.filter(Boolean).sort(),
          subCategories: subCategories.filter(Boolean).sort(),
          colors: colors.filter(Boolean).sort(),
          genders: genders.filter(Boolean).sort(),
          sizes: sizes.filter(Boolean).sort() 
        }
      }
    };

    res.status(200).json(responseData);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({
      success: false,
      message: "Error searching products",
      ...(process.env.NODE_ENV === 'development' && { 
        error: error.message,
        stack: error.stack 
      })
    });
  }
};







export const SearchBox =async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.trim() === "") {
      return res.status(400).json({ 
        success: false,
        message: "Search query is required" 
      });
    }

      const sanitizedQuery = query.replace(/[^\w\s]/gi, '').trim();
    
    const searchResults = await Product.find({
      $or: [
        { name: { $regex: sanitizedQuery, $options: "i" } },
        { brand: { $regex: sanitizedQuery, $options: "i" } },
        { category: { $regex: sanitizedQuery, $options: "i" } },
        { subCategory: { $regex: sanitizedQuery, $options: "i" } },
          { gender: { $regex: sanitizedQuery, $options: "i" } }
      ],
      status: "active"
    })
   .select('name brand mrp discount salePrice status image color gender size category subCategory')
    .limit(20); // Limit results to prevent overload

    res.status(200).json({
      success: true,
      results: searchResults,
      count: searchResults.length
    });

  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error" ,
      error: error.message
    });
  }
};







