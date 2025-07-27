import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import axios from "../config/api";
import { useCart } from "../context/CartContext";
import ViewProductMod from "./ViewProductMod";
import {
  FiFilter,
  FiSearch,
  FiX,
  FiShoppingCart,
  FiStar,
} from "react-icons/fi";
import { FaStar, FaStarHalfAlt } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [modalAction, setModalAction] = useState("view");

  // State for products and loading
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // State for filters
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [colors, setColors] = useState([]);
  const [genders, setGenders] = useState([]);
  const [sizes, setSizes] = useState([]);

  // State for selected filters
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedBrands, setSelectedBrands] = useState(
    searchParams.get("brand") ? [searchParams.get("brand")] : []
  );
  const [selectedCategories, setSelectedCategories] = useState(
    searchParams.get("category") ? [searchParams.get("category")] : []
  );
  const [selectedSubCategories, setSelectedSubCategories] = useState([]);
  const [selectedColors, setSelectedColors] = useState(
    searchParams.get("color") ? [searchParams.get("color")] : []
  );
  const [selectedGenders, setSelectedGenders] = useState(
    searchParams.get("gender") ? [searchParams.get("gender")] : []
  );
  const [selectedSizes, setSelectedSizes] = useState(
    searchParams.get("size") ? [searchParams.get("size")] : []
  );
  const [priceRange, setPriceRange] = useState([
    searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : 0,
    searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : 10000,
  ]);
  const [discountRange, setDiscountRange] = useState([
    searchParams.get("minDiscount")
      ? Number(searchParams.get("minDiscount"))
      : 0,
    searchParams.get("maxDiscount")
      ? Number(searchParams.get("maxDiscount"))
      : 100,
  ]);
  const [minRating, setMinRating] = useState(
    searchParams.get("minRating") ? Number(searchParams.get("minRating")) : 0
  );
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "newest");
  const [page, setPage] = useState(
    searchParams.get("page") ? Number(searchParams.get("page")) : 1
  );
  const [limit, setLimit] = useState(12);

  // Modal state
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Mobile filters
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const ALL_GENDERS = ["Men", "Women", "Kids", "Unisex"];

  // Fetch products and filters
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = {
          page,
          limit,
          sortBy,
          ...(searchQuery && { q: searchQuery }),
          ...(selectedBrands.length > 0 && { brand: selectedBrands.join(",") }),
          ...(selectedCategories.length > 0 && {
            category: selectedCategories.join(","),
          }),
          ...(selectedSubCategories.length > 0 && {
            subCategory: selectedSubCategories.join(","),
          }),
          ...(selectedColors.length > 0 && { color: selectedColors.join(",") }),
          ...(selectedGenders.length > 0 && {
            gender: selectedGenders.join(","),
          }),
          ...(selectedSizes.length > 0 && { size: selectedSizes.join(",") }),
          ...(priceRange[0] > 0 && { minPrice: priceRange[0] }),
          ...(priceRange[1] < 10000 && { maxPrice: priceRange[1] }),
          ...(discountRange[0] > 0 && { minDiscount: discountRange[0] }),
          ...(discountRange[1] < 100 && { maxDiscount: discountRange[1] }),
          ...(minRating > 0 && { minRating }),
        };

        const response = await axios.get("/api/public/search", {
          params,
          timeout: 10000,
        });

        // Fetch average ratings for all products
        const productsWithRatings = await Promise.all(
          (response.data.products || []).map(async (product) => {
            try {
              const ratingResponse = await axios.get(
                `/api/reviews/average/${product._id}`
              );
              return {
                ...product,
                averageRating: ratingResponse.data.averageRating || 0,
                ratingCount: ratingResponse.data.count || 0,
              };
            } catch (error) {
              console.error(
                "Error fetching rating for product:",
                product._id,
                error
              );
              return {
                ...product,
                averageRating: 0,
                ratingCount: 0,
              };
            }
          })
        );

        setProducts(productsWithRatings);
        setTotalProducts(response.data.pagination?.total || 0);
        setTotalPages(response.data.pagination?.pages || 1);

        // Set available filters from response
        if (response.data.filters?.available) {
          setBrands(response.data.filters.available.brands || []);
          setCategories(response.data.filters.available.categories || []);
          setSubCategories(response.data.filters.available.subCategories || []);
          setColors(response.data.filters.available.colors || []);
          setGenders(response.data.filters.available.genders || []);
          setSizes(response.data.filters.available.sizes || []);
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to fetch products"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [
    page,
    limit,
    sortBy,
    searchQuery,
    selectedBrands,
    selectedCategories,
    selectedSubCategories,
    selectedColors,
    selectedGenders,
    selectedSizes,
    priceRange,
    discountRange,
    minRating,
  ]);

  // Update URL search params when filters change
  useEffect(() => {
    const params = {};
    if (searchQuery) params.q = searchQuery;
    if (selectedBrands.length > 0) params.brand = selectedBrands.join(",");
    if (selectedCategories.length > 0)
      params.category = selectedCategories.join(",");
    if (selectedSubCategories.length > 0)
      params.subCategory = selectedSubCategories.join(",");
    if (selectedColors.length > 0) params.color = selectedColors.join(",");
    if (selectedGenders.length > 0) params.gender = selectedGenders.join(",");
    if (selectedSizes.length > 0) params.size = selectedSizes.join(",");
    if (priceRange[0] > 0) params.minPrice = priceRange[0];
    if (priceRange[1] < 10000) params.maxPrice = priceRange[1];
    if (discountRange[0] > 0) params.minDiscount = discountRange[0];
    if (discountRange[1] < 100) params.maxDiscount = discountRange[1];
    if (minRating > 0) params.minRating = minRating;
    if (sortBy !== "newest") params.sortBy = sortBy;
    if (page > 1) params.page = page;

    setSearchParams(params);
  }, [
    searchQuery,
    selectedBrands,
    selectedCategories,
    selectedSubCategories,
    selectedColors,
    selectedGenders,
    selectedSizes,
    priceRange,
    discountRange,
    minRating,
    sortBy,
    page,
    setSearchParams,
  ]);

  const handleFilterChange = (filterType, value) => {
    setPage(1);

    switch (filterType) {
      case "brand":
        setSelectedBrands(
          selectedBrands.includes(value)
            ? selectedBrands.filter((b) => b !== value)
            : [...selectedBrands, value]
        );
        break;
      case "category":
        setSelectedCategories(
          selectedCategories.includes(value)
            ? selectedCategories.filter((c) => c !== value)
            : [...selectedCategories, value]
        );
        setSelectedSubCategories([]);
        break;
      case "subCategory":
        setSelectedSubCategories(
          selectedSubCategories.includes(value)
            ? selectedSubCategories.filter((sc) => sc !== value)
            : [...selectedSubCategories, value]
        );
        break;
      case "color":
        setSelectedColors(
          selectedColors.includes(value)
            ? selectedColors.filter((c) => c !== value)
            : [...selectedColors, value]
        );
        break;
      case "gender":
        // If value is empty (All selected) or already selected, clear gender filter
        if (!value || selectedGenders.includes(value)) {
          setSelectedGenders([]);
        } else {
          // Otherwise set only this gender
          setSelectedGenders([value]);
        }
        // Clear dependent filters
        setSelectedCategories([]);
        setSelectedSubCategories([]);
        setSelectedColors([]);
        break;
      case "size":
        setSelectedSizes(
          selectedSizes.includes(value)
            ? selectedSizes.filter((s) => s !== value)
            : [...selectedSizes, value]
        );
        break;
      default:
        break;
    }
  };

  // const handlePriceChange = (e) => {
  //   const value = Number(e.target.value);
  //   if (e.target.name === "minPrice") {
  //     setPriceRange([value, priceRange[1]]);
  //   } else {
  //     setPriceRange([priceRange[0], value]);
  //   }
  // };

  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    const num = Number(value);

    if (name === "minPrice") {
      setPriceRange([Math.min(num, priceRange[1]), priceRange[1]]);
    } else {
      setPriceRange([priceRange[0], Math.max(num, priceRange[0])]);
    }
  };

  const handleDiscountChange = (e) => {
    const value = Number(e.target.value);
    if (e.target.name === "minDiscount") {
      setDiscountRange([value, discountRange[1]]);
    } else {
      setDiscountRange([discountRange[0], value]);
    }
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handlePageChange = (value) => {
    setPage(value);
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedBrands([]);
    setSelectedCategories([]);
    setSelectedSubCategories([]);
    setSelectedColors([]);
    setSelectedGenders([]);
    setSelectedSizes([]);
    setPriceRange([0, 10000]);
    setDiscountRange([0, 100]);
    setMinRating(0);
    setSortBy("newest");
    setPage(1);
  };

  const openProductModal = (product) => {
    setSelectedProduct(product);
    setModalAction("buyNow");
    setIsViewModalOpen(true);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Filters Sidebar */}
        <div
          className={`w-full md:w-72 bg-white p-4 rounded-lg shadow ${
            mobileFiltersOpen
              ? "block fixed inset-0 z-50 overflow-y-auto"
              : "hidden md:block"
          }`}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Filters</h3>
            {mobileFiltersOpen && (
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <IoMdClose size={24} />
              </button>
            )}
          </div>

          <button
            onClick={clearAllFilters}
            className="w-full mb-6 flex items-center justify-center gap-2 px-4 py-2 text-white font-bold border border-gray-300 rounded-md bg-blue-500 hover:bg-blue-500"
          >
            <FiX /> Clear All
          </button>

          {/* Sort */}
          <div className="mb-6">
            <label className="block font-medium mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={handleSortChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="discount-asc">Discount: Low to High</option>
              <option value="discount-desc">Discount: High to Low</option>
              <option value="rating">Highest Rating</option>
            </select>
          </div>

          {/* Gender Dropdown - Always shows all options */}
          {genders.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium mb-2">Gender</h4>
              <select
                value={selectedGenders[0] || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  // Pass empty string when "All" is selected
                  handleFilterChange("gender", value || null);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">All Genders</option>
                {ALL_GENDERS.map((gender) => (
                  <option key={gender} value={gender}>
                    {gender.charAt(0).toUpperCase() + gender.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Categories (only show if gender selected) */}
          {selectedGenders.length > 0 && categories.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium mb-2">Categories</h4>
              <select
                value={selectedCategories[0] || ""}
                onChange={(e) => handleFilterChange("category", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">All</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Subcategories (only show if category selected) */}
          {selectedCategories.length > 0 && subCategories.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium mb-2">Subcategories</h4>
              <div className="flex flex-wrap gap-2">
                {subCategories.map((subCategory) => (
                  <button
                    key={subCategory}
                    onClick={() =>
                      handleFilterChange("subCategory", subCategory)
                    }
                    className={`px-3 py-1 rounded-full text-sm ${
                      selectedSubCategories.includes(subCategory)
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {subCategory}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Colors (only show if subcategory selected) */}
          {selectedSubCategories.length > 0 && colors.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium mb-2">Colors</h4>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleFilterChange("color", color)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      selectedColors.includes(color)
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Brands (only show if gender selected) */}
          {selectedGenders.length > 0 && brands.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium mb-2">Brands</h4>
              <div className="flex flex-wrap gap-2">
                {brands.map((brand) => (
                  <button
                    key={brand}
                    onClick={() => handleFilterChange("brand", brand)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      selectedBrands.includes(brand)
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sizes */}
          {sizes.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium mb-2">Sizes</h4>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => handleFilterChange("size", size)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      selectedSizes.includes(size)
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}
          {/* Rating */}
          {/* Rating Filter */}
          <div className="mb-6">
            <h4 className="font-medium mb-2">Minimum Rating</h4>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setMinRating(minRating === star ? 0 : star)}
                  className={`text-2xl ${
                    minRating >= star ? "text-yellow-400" : "text-gray-300"
                  }`}
                >
                  {minRating >= star ? <FaStar /> : <FiStar />}
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {minRating > 0 ? `${minRating}+ stars` : "Any rating"}
            </p>
          </div>

          {/* price */}
          <div className="mb-6">
            <h4 className="font-medium mb-2">Price Range</h4>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Min</label>
                <input
                  type="number"
                  name="minPrice"
                  min="0"
                  max="10000"
                  value={priceRange[0]}
                  onChange={handlePriceChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Max</label>
                <input
                  type="number"
                  name="maxPrice"
                  min="0"
                  max="10000"
                  value={priceRange[1]}
                  onChange={handlePriceChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            {/* Slider UI */}
            <div className="px-1">
              <input
                type="range"
                min="0"
                max="10000"
                step="100"
                value={priceRange[0]}
                onChange={(e) =>
                  handlePriceChange({
                    target: { name: "minPrice", value: e.target.value },
                  })
                }
                className="w-full mb-2"
              />
            </div>
          </div>

          {/* Discount Range */}
          <div className="mb-6">
            <h4 className="font-medium mb-2">Discount Range</h4>
            <div className="grid grid-cols-2 gap-4 mb-2">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Min</label>
                <input
                  type="number"
                  name="minDiscount"
                  min="0"
                  max="100"
                  value={discountRange[0]}
                  onChange={handleDiscountChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Max</label>
                <input
                  type="number"
                  name="maxDiscount"
                  min="0"
                  max="100"
                  value={discountRange[1]}
                  onChange={handleDiscountChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Mobile filter toggle */}
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="md:hidden mb-4 flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <FiFilter /> Filters
          </button>

          {/* Applied filters */}
          {(selectedBrands.length > 0 ||
            selectedCategories.length > 0 ||
            selectedSubCategories.length > 0 ||
            selectedColors.length > 0 ||
            selectedGenders.length > 0 ||
            selectedSizes.length > 0 ||
            priceRange[0] > 0 ||
            priceRange[1] < 10000 ||
            discountRange[0] > 0 ||
            discountRange[1] < 100 ||
            minRating > 0 ||
            searchQuery) && (
            <div className="mb-6">
              <h4 className="font-medium mb-2">Applied Filters:</h4>
              <div className="flex flex-wrap gap-2">
                {searchQuery && (
                  <div className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm">
                    Search: "{searchQuery}"
                    <button
                      onClick={() => setSearchQuery("")}
                      className="ml-2 text-gray-500 hover:text-gray-700"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                )}
                {selectedBrands.map((brand) => (
                  <div
                    key={brand}
                    className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm"
                  >
                    Brand: {brand}
                    <button
                      onClick={() =>
                        setSelectedBrands(
                          selectedBrands.filter((b) => b !== brand)
                        )
                      }
                      className="ml-2 text-gray-500 hover:text-gray-700"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                ))}
                {selectedCategories.map((category) => (
                  <div
                    key={category}
                    className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm"
                  >
                    Category: {category}
                    <button
                      onClick={() =>
                        setSelectedCategories(
                          selectedCategories.filter((c) => c !== category)
                        )
                      }
                      className="ml-2 text-gray-500 hover:text-gray-700"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                ))}
                {selectedSubCategories.map((subCategory) => (
                  <div
                    key={subCategory}
                    className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm"
                  >
                    Subcategory: {subCategory}
                    <button
                      onClick={() =>
                        setSelectedSubCategories(
                          selectedSubCategories.filter(
                            (sc) => sc !== subCategory
                          )
                        )
                      }
                      className="ml-2 text-gray-500 hover:text-gray-700"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                ))}
                {selectedColors.map((color) => (
                  <div
                    key={color}
                    className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm"
                  >
                    Color: {color}
                    <button
                      onClick={() =>
                        setSelectedColors(
                          selectedColors.filter((c) => c !== color)
                        )
                      }
                      className="ml-2 text-gray-500 hover:text-gray-700"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                ))}
                {selectedGenders.map((gender) => (
                  <div
                    key={gender}
                    className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm"
                  >
                    Gender: {gender}
                    <button
                      onClick={() =>
                        setSelectedGenders(
                          selectedGenders.filter((g) => g !== gender)
                        )
                      }
                      className="ml-2 text-gray-500 hover:text-gray-700"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                ))}
                {selectedSizes.map((size) => (
                  <div
                    key={size}
                    className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm"
                  >
                    Size: {size}
                    <button
                      onClick={() =>
                        setSelectedSizes(
                          selectedSizes.filter((s) => s !== size)
                        )
                      }
                      className="ml-2 text-gray-500 hover:text-gray-700"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                ))}
                {(priceRange[0] > 0 || priceRange[1] < 10000) && (
                  <div className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm">
                    Price: ₹{priceRange[0]} - ₹{priceRange[1]}
                    <button
                      onClick={() => setPriceRange([0, 10000])}
                      className="ml-2 text-gray-500 hover:text-gray-700"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                )}
                {(discountRange[0] > 0 || discountRange[1] < 100) && (
                  <div className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm">
                    Discount: {discountRange[0]}% - {discountRange[1]}%
                    <button
                      onClick={() => setDiscountRange([0, 100])}
                      className="ml-2 text-gray-500 hover:text-gray-700"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                )}
                {minRating > 0 && (
                  <div className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm">
                    Rating: {minRating}+
                    <button
                      onClick={() => setMinRating(0)}
                      className="ml-2 text-gray-500 hover:text-gray-700"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Results count */}
          <h3 className="text-lg font-semibold mb-4">
            {totalProducts} {totalProducts === 1 ? "product" : "products"} found
          </h3>

          {/* Loading state */}
          {loading && (
            <div className="flex justify-center my-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="bg-white p-6 rounded-lg shadow text-center my-4">
              <p className="text-red-500 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Retry
              </button>
            </div>
          )}

          {/* Products grid */}
          {!loading && !error && (
            <>
              {products.length === 0 ? (
                <div className="bg-white p-6 rounded-lg shadow text-center">
                  <p className="mb-4">No products match your filters.</p>
                  <button
                    onClick={clearAllFilters}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    Clear all filters
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.map((product) => {
                      const salePrice =
                        product.mrp - (product.mrp * product.discount) / 100;
                      const hasImage =
                        Array.isArray(product?.image) &&
                        product.image.length > 0;

                      return (
                        <div
                          key={product._id}
                          className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                        >
                          <Link
                            to={`/product/${
                              product.productId?._id || product._id
                            }`}
                          >
                            <div className="h-48 flex items-center justify-center p-4 bg-gray-50">
                              <img
                                src={
                                  hasImage
                                    ? product.image[0]
                                    : "https://placehold.co/300x300?text=No+Image"
                                }
                                alt={product.name || "Product"}
                                className="max-h-full max-w-full object-contain"
                              />
                            </div>
                            <div className="p-4">
                              <h4 className="font-semibold text-lg mb-1 truncate">
                                {product.name}
                              </h4>
                              <p className="text-gray-600 text-sm mb-2">
                                {product.brand}
                              </p>

                              <div className="flex items-center mb-2">
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <span key={i}>
                                      {i < Math.floor(product.averageRating) ? (
                                        <FaStar className="text-yellow-400" />
                                      ) : (
                                        <FiStar className="text-yellow-400" />
                                      )}
                                    </span>
                                  ))}
                                </div>
                                {product.ratingCount > 0 && (
                                  <span className="text-sm text-gray-500 ml-1">
                                    ({product.averageRating.toFixed(1)})
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2">
                                <p className="font-bold text-blue-600">
                                  {formatPrice(salePrice)}
                                </p>
                                {product.discount > 0 && (
                                  <>
                                    <p className="text-sm text-gray-500 line-through">
                                      {formatPrice(product.mrp)}
                                    </p>
                                    <p className="text-sm text-green-600">
                                      ({product.discount}% off)
                                    </p>
                                  </>
                                )}
                              </div>
                            </div>
                          </Link>
                          <div className="mt-4 space-y-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                addToCart(product);
                              }}
                              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                            >
                              <FiShoppingCart /> Add to Cart
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                openProductModal(product);
                              }}
                              className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-50"
                            >
                              Buy Now
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center mt-8">
                      <nav className="flex items-center gap-1">
                        <button
                          onClick={() => handlePageChange(1)}
                          disabled={page === 1}
                          className="px-3 py-1 rounded-md border border-gray-300 disabled:opacity-50"
                        >
                          First
                        </button>
                        <button
                          onClick={() => handlePageChange(page - 1)}
                          disabled={page === 1}
                          className="px-3 py-1 rounded-md border border-gray-300 disabled:opacity-50"
                        >
                          Previous
                        </button>

                        {Array.from(
                          { length: totalPages },
                          (_, i) => i + 1
                        ).map((pageNum) => (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-3 py-1 rounded-md ${
                              page === pageNum
                                ? "bg-blue-500 text-white"
                                : "border border-gray-300"
                            }`}
                          >
                            {pageNum}
                          </button>
                        ))}

                        <button
                          onClick={() => handlePageChange(page + 1)}
                          disabled={page === totalPages}
                          className="px-3 py-1 rounded-md border border-gray-300 disabled:opacity-50"
                        >
                          Next
                        </button>
                        <button
                          onClick={() => handlePageChange(totalPages)}
                          disabled={page === totalPages}
                          className="px-3 py-1 rounded-md border border-gray-300 disabled:opacity-50"
                        >
                          Last
                        </button>
                      </nav>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Product View Modal */}
      {selectedProduct && (
        <ViewProductMod
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          product={selectedProduct}
          action={modalAction}
          filteredSizes={selectedSizes}
        />
      )}
    </div>
  );
};

export default Search;
