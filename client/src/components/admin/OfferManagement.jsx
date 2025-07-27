import React, { useState, useEffect } from "react";
import axios from "../../config/api";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const OfferManagement = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("slider");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    discountType: "percentage",
    discountValue: "",
    startDate: "",
    endDate: "",
    offerType: "slider",
    image: null,
    products: [],
    isActive: true,
    buttonText: "Shop Now",
    buttonLink: "/shop",
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [allProducts, setAllProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [filters, setFilters] = useState({
    gender: "",
    category: "",
    brand: "",
    subCategory: "",
  });

  const [filterOptions, setFilterOptions] = useState({
    genders: [],
    categories: [],
    brands: [],
    subCategories: [],
  });

  // Format date to display
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Update the fetchOffers useEffect in OfferManagement component
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const response = await axios.get("/api/offers");
        const offersWithProducts = await Promise.all(
          response.data.offers.map(async (offer) => {
            if (offer.products && offer.products.length > 0) {
              try {
                const productsResponse = await axios.post(
                  "/api/admin/products-by-ids",
                  {
                    productIds: offer.products,
                  }
                );
                return {
                  ...offer,
                  productDetails: productsResponse.data.products,
                };
              } catch (error) {
                console.error("Error fetching product details:", error);
                return {
                  ...offer,
                  productDetails: [],
                };
              }
            }
            return offer;
          })
        );
        setOffers(offersWithProducts);
        setLoading(false);
      } catch (error) {
        toast.error("Failed to fetch offers");
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);
  // Fetch all products for selection

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setProductsLoading(true);
        const response = await axios.get("/api/admin/getAllProduct");
        setAllProducts(response.data?.products || []);
      } catch (error) {
        toast.error("Failed to fetch products");
        setAllProducts([]);
      } finally {
        setProductsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        image: file,
      });
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    if (allProducts.length > 0) {
      const genders = [...new Set(allProducts.map((p) => p.gender))].filter(
        Boolean
      );
      const categories = [
        ...new Set(allProducts.map((p) => p.category)),
      ].filter(Boolean);
      const brands = [...new Set(allProducts.map((p) => p.brand))].filter(
        Boolean
      );

      setFilterOptions({
        genders: ["All", ...genders],
        categories: ["All", ...categories],
        brands: ["All", ...brands],
        subCategories: ["All"], // Will be populated when category is selected
      });
    }
  }, [allProducts]);

  useEffect(() => {
    if (filters.category && filters.category !== "All") {
      const subs = [
        ...new Set(
          allProducts
            .filter((p) => p.category === filters.category)
            .map((p) => p.subCategory)
        ),
      ].filter(Boolean);

      setFilterOptions((prev) => ({
        ...prev,
        subCategories: ["All", ...subs],
      }));
    } else {
      setFilterOptions((prev) => ({
        ...prev,
        subCategories: ["All"],
      }));
    }
  }, [filters.category, allProducts]);

  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value === "All" ? "" : value,
      // Reset dependent filters
      ...(filterName === "gender" && {
        category: "",
        brand: "",
        subCategory: "",
      }),
      ...(filterName === "category" && {
        subCategory: "",
      }),
    }));
  };

  const handleProductSelect = (productId) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter((id) => id !== productId));
    } else {
      setSelectedProducts([...selectedProducts, productId]);
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.title.trim()) errors.title = "Title is required";
    if (!formData.description.trim())
      errors.description = "Description is required";
    if (!formData.discountValue || isNaN(formData.discountValue))
      errors.discountValue = "Valid discount value is required";
    if (!formData.startDate) errors.startDate = "Start date is required";
    if (!formData.endDate) errors.endDate = "End date is required";
    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      errors.endDate = "End date must be after start date";
    }
    if (!formData.image && !formData._id) errors.image = "Image is required";

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const formPayload = new FormData();
      formPayload.append("title", formData.title);
      formPayload.append("description", formData.description);
      formPayload.append("discountType", formData.discountType);
      formPayload.append("discountValue", formData.discountValue);
      formPayload.append("startDate", formData.startDate);
      formPayload.append("endDate", formData.endDate);
      formPayload.append("offerType", activeTab);
      formPayload.append("isActive", formData.isActive);
      formPayload.append("buttonText", formData.buttonText);
      formPayload.append("buttonLink", formData.buttonLink);
      formPayload.append("products", JSON.stringify(selectedProducts));

      if (formData.image) {
        formPayload.append("image", formData.image);
      }

      let response;
      if (formData._id) {
        // Update existing offer
        response = await axios.put(`/api/${formData._id}`, formPayload, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        // Create new offer
        response = await axios.post("/api/offers", formPayload, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }


      // If products were selected and discount is set, update product discounts
    if (selectedProducts.length > 0 && formData.discountValue) {
      try {
        await axios.post('/api/admin/update-product-discounts', {
          productIds: selectedProducts,
          discount: Number(formData.discountValue)
        }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
      } catch (error) {
        console.error("Error updating product discounts:", error);
        toast.warning("Offer created but failed to update product discounts");
      }
    }

      toast.success(response.data.message);
      setOffers(response.data.updatedOffers);
      handleCloseModal();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save offer");
    }
  };

  const handleEditOffer = (offer) => {
    setFormData({
      ...offer,
      startDate: offer.startDate.split("T")[0],
      endDate: offer.endDate.split("T")[0],
    });
    setSelectedProducts(offer.products || []);
    setActiveTab(offer.offerType);
    setPreviewImage(offer.imageUrl || null);
    setShowModal(true);
  };

  const handleDeleteOffer = async (offerId) => {
    if (window.confirm("Are you sure you want to delete this offer?")) {
      try {
        const response = await axios.delete(`/api/${offerId}`);
        toast.success(response.data.message);
        setOffers(response.data.updatedOffers);
      } catch (error) {
        toast.error("Failed to delete offer");
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      title: "",
      description: "",
      discountType: "percentage",
      discountValue: "",
      startDate: "",
      endDate: "",
      offerType: "slider",
      image: null,
      products: [],
      isActive: true,
      buttonText: "Shop Now",
      buttonLink: "/shop",
    });
    setPreviewImage(null);
    setSelectedProducts([]);
    setValidationErrors({});
  };

  const toggleOfferStatus = async (offerId, currentStatus) => {
    try {
      const response = await axios.patch(`/api/${offerId}/status`, {
        isActive: !currentStatus,
      });
      toast.success(response.data.message);
      setOffers(response.data.updatedOffers);
    } catch (error) {
      toast.error("Failed to update offer status");
    }
  };

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl font-bold text-gray-800">Offer Management</h2>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg shadow-sm transition"
          onClick={() => setShowModal(true)}
        >
          + Create Offer
        </button>
      </div>

      <div className="mb-4">
        <div className="flex border-b text-sm">
          {["slider", "page", "popup"].map((type) => (
            <button
              key={type}
              className={`px-5 py-2.5 capitalize transition ${
                activeTab === type
                  ? "border-b-2 border-blue-600 text-blue-600 font-medium"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab(type)}
            >
              {type} Offers
            </button>
          ))}
        </div>

        <div className="mt-2">
          {activeTab === "slider" && (
            <OfferList
              offers={offers.filter((o) => o.offerType === activeTab)}
              loading={loading}
              onEdit={handleEditOffer}
              onDelete={handleDeleteOffer}
              onToggleStatus={toggleOfferStatus}
              formatDate={formatDate}
              allProducts={allProducts}
            />
          )}
          {activeTab === "page" && (
            <OfferList
              offers={offers.filter((o) => o.offerType === "page")}
              loading={loading}
              onEdit={handleEditOffer}
              onDelete={handleDeleteOffer}
              onToggleStatus={toggleOfferStatus}
              formatDate={formatDate}
              allProducts={allProducts}
            />
          )}
          {activeTab === "popup" && (
            <OfferList
              offers={offers.filter((o) => o.offerType === "popup")}
              loading={loading}
              onEdit={handleEditOffer}
              onDelete={handleDeleteOffer}
              onToggleStatus={toggleOfferStatus}
              formatDate={formatDate}
              allProducts={allProducts}
            />
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-18">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {formData._id ? "Edit Offer" : "Create New Offer"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="px-6 py-5">
              <form onSubmit={handleSubmit}>
                {/* Offer type tabs */}
                <div className="flex border-b text-sm mb-6">
                  {["slider", "page", "popup"].map((type) => (
                    <button
                      type="button"
                      key={type}
                      className={`px-5 py-2.5 capitalize transition ${
                        activeTab === type
                          ? "border-b-2 border-blue-600 text-blue-600 font-medium"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                      onClick={() => {
                        setActiveTab(type);
                        setFormData({ ...formData, offerType: type });
                      }}
                    >
                      {type} Offer
                    </button>
                  ))}
                </div>

                {/* Offer form */}
                <div className="space-y-6">
                  {activeTab === "slider" && (
                    <SliderOfferForm
                      formData={formData}
                      handleInputChange={handleInputChange}
                      handleImageChange={handleImageChange}
                      previewImage={previewImage}
                      validationErrors={validationErrors}
                    />
                  )}
                  {activeTab === "page" && (
                    <PageOfferForm
                      formData={formData}
                      handleInputChange={handleInputChange}
                      handleImageChange={handleImageChange}
                      previewImage={previewImage}
                      validationErrors={validationErrors}
                    />
                  )}
                  {activeTab === "popup" && (
                    <PopupOfferForm
                      formData={formData}
                      handleInputChange={handleInputChange}
                      handleImageChange={handleImageChange}
                      previewImage={previewImage}
                      validationErrors={validationErrors}
                    />
                  )}
                  {/* Products Filter Section */}
                  {/* Products Section */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-800">
                      Select Products (Optional)
                    </h3>

                    {/* Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      {/* Gender Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Gender
                        </label>
                        <select
                          value={filters.gender || "All"}
                          onChange={(e) =>
                            handleFilterChange("gender", e.target.value)
                          }
                          className="block w-full rounded-lg border border-gray-300 shadow-sm px-4 py-2 text-sm"
                        >
                          {filterOptions.genders.map((gender) => (
                            <option key={gender} value={gender}>
                              {gender}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Category Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Category
                        </label>
                        <select
                          value={filters.category || "All"}
                          onChange={(e) =>
                            handleFilterChange("category", e.target.value)
                          }
                          className="block w-full rounded-lg border border-gray-300 shadow-sm px-4 py-2 text-sm"
                        >
                          {filterOptions.categories.map((category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Brand Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Brand
                        </label>
                        <select
                          value={filters.brand || "All"}
                          onChange={(e) =>
                            handleFilterChange("brand", e.target.value)
                          }
                          className="block w-full rounded-lg border border-gray-300 shadow-sm px-4 py-2 text-sm"
                        >
                          {filterOptions.brands.map((brand) => (
                            <option key={brand} value={brand}>
                              {brand}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Subcategory Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Subcategory
                        </label>
                        <select
                          value={filters.subCategory || "All"}
                          onChange={(e) =>
                            handleFilterChange("subCategory", e.target.value)
                          }
                          className="block w-full rounded-lg border border-gray-300 shadow-sm px-4 py-2 text-sm"
                          disabled={!filters.category}
                        >
                          {filterOptions.subCategories.map((subCat) => (
                            <option key={subCat} value={subCat}>
                              {subCat}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Products List */}
                    <div className="border p-4 rounded-lg max-h-96 overflow-y-auto bg-gray-50 space-y-3">
                      {allProducts
                        .filter((product) => {
                          return (
                            (!filters.gender ||
                              product.gender === filters.gender) &&
                            (!filters.category ||
                              product.category === filters.category) &&
                            (!filters.brand ||
                              product.brand === filters.brand) &&
                            (!filters.subCategory ||
                              product.subCategory === filters.subCategory)
                          );
                        })
                        .map((product) => (
                          <div
                            key={product._id}
                            className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded"
                          >
                            <input
                              type="checkbox"
                              id={`product-${product._id}`}
                              checked={selectedProducts.includes(product._id)}
                              onChange={() => handleProductSelect(product._id)}
                              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                            />

                            <Link
                              to={`/product/${product._id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 group flex-1"
                            >
                              {/* image */}
                              {product.image && product.image[0] && (
                                <img
                                  src={product.image[0]}
                                  alt={product.name}
                                  className="w-12 h-12 object-cover rounded border"
                                />
                              )}
                              <div>
                                <p className="text-sm text-gray-800 group-hover:underline">
                                  {product.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  ₹{product.mrp}
                                </p>
                              </div>
                            </Link>
                          </div>
                        ))}
                    </div>
                  </div>{" "}
                  {/* Products */}
                  {/* Active checkbox */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData({ ...formData, isActive: e.target.checked })
                      }
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="isActive"
                      className="ml-2 text-sm text-gray-700"
                    >
                      Active Offer
                    </label>
                  </div>
                </div>
              </form>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t">
              <button
                onClick={handleCloseModal}
                className="px-5 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-5 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                {formData._id ? "Update Offer" : "Create Offer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
//offer show in card for admin
const OfferList = ({
  offers,
  loading,
  onEdit,
  onDelete,
  onToggleStatus,
  formatDate,
  allProducts = [],
}) => {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showProductsModal, setShowProductsModal] = useState(false);

  if (loading)
    return (
      <div className="text-center py-6 text-gray-600 text-base">
        Loading offers...
      </div>
    );
  if (offers.length === 0)
    return (
      <div className="text-center py-6 text-gray-600 text-base">
        No offers found
      </div>
    );

  const handleShowProducts = (products) => {
    if (!products || products.length === 0) return;

    // If we have full product details, use them
    if (products.productDetails) {
      setSelectedProducts(products.productDetails);
      setShowProductsModal(true);
      return;
    }

    // Otherwise find in allProducts (only if allProducts exists)
    if (!allProducts || allProducts.length === 0) {
      toast.error("Products yet data not loaded ");
      return;
    }

    const productDetails = products
      .map((productId) => allProducts.find((p) => p._id === productId))
      .filter(Boolean);

    setSelectedProducts(productDetails);
    setShowProductsModal(true);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {offers.map((offer) => (
        <div
          key={offer._id}
          className="bg-white border rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
        >
     <div className="w-full bg-red-100 flex justify-center items-center rounded-t-2xl overflow-hidden border border-blue-500">

  <img
    src={offer.imageUrl}
    alt={offer.title}
    className="object-contain max-h-[90vh]"
    onError={(e) => {
      e.target.onerror = null;
      e.target.src = '/path-to-fallback-image.jpg';
    }}
  />
</div>

          <div className="p-4">
            <h3 className="font-semibold text-2xl text-gray-800 mb-1">
              {offer.title}
            </h3>
            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
              {offer.description}
            </p>

            <div className="text-sm space-y-1 text-gray-700 mb-2">
              <p className="text-red-500 text-xl">
                <span className="font-medium ">Discount:</span>{" "}
                {offer.discountValue}
                {offer.discountType === "percentage" ? "%" : "₹"} off
              </p>
              <p className="text-yellow-900 text-xl">
                <span className="font-medium ">Valid:</span>{" "}
                {formatDate(offer.startDate)} - {formatDate(offer.endDate)}
              </p>
              <p>
                <span className="font-medium">Status:</span>{" "}
                <span
                  className={`${
                    offer.isActive ? "text-green-600 text-xl" : "text-gray-500"
                  }`}
                >
                  {offer.isActive ? "Active" : "Inactive"}
                </span>
              </p>
              <div>
                <span className="font-medium">Products:</span>{" "}
                <div
                  className="mt-1 cursor-pointer hover:text-blue-600 transition"
                  onClick={() =>
                    handleShowProducts(
                      offer.products || offer.productDetails || []
                    )
                  }
                >
                  {offer.productDetails ? (
                    <div className="max-h-20 overflow-y-auto">
                      {offer.productDetails.slice(0, 3).map((product) => (
                        <div
                          key={product._id}
                          className="text-gray-600 text-xs py-1 border-b last:border-b-0"
                        >
                          {product.name} (₹{product.mrp})
                        </div>
                      ))}
                      {offer.productDetails.length > 3 && (
                        <div className="text-blue-500 text-xs py-1">
                          +{offer.productDetails.length - 3} more...
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-600 text-sm">
                      {offer.products?.length || 0} products included
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-6">
              <button
                onClick={() => onToggleStatus(offer._id, offer.isActive)}
                className={`px-4 py-2 text-sm font-medium rounded-lg shadow-sm transition-colors ${
                  offer.isActive
                    ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                    : "bg-green-500 hover:bg-green-600 text-white"
                }`}
              >
                {offer.isActive ? "Deactivate" : "Activate"}
              </button>

              <button
                onClick={() => onEdit(offer)}
                className="px-4 py-2 text-sm font-medium bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-sm transition-colors"
              >
                Edit
              </button>

              <button
                onClick={() => onDelete(offer._id)}
                className="px-4 py-2 text-sm font-medium bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-sm transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Products Modal */}
      {showProductsModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Products in this Offer
              </h3>
              <button
                onClick={() => setShowProductsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                {selectedProducts.map((product) => (
                  <Link
                    to={`/product/${product.productId?._id || product._id}`}
                    key={product._id}
                    className="block border-b pb-4 last:border-b-0 hover:bg-gray-50 rounded transition"
                  >
                    <div className="flex items-start gap-4">
                      {product.image && product.image[0] && (
                        <img
                          src={product.image[0]}
                          alt={product.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800">
                          {product.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-gray-600">
                            MRP: ₹{product.mrp}
                          </span>
                          {product.discount > 0 && (
                            <span className="text-green-600">
                              ({product.discount}% off)
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {product.size &&
                            product.size.map((size, i) => (
                              <span
                                key={i}
                                className="text-xs bg-gray-100 px-2 py-1 rounded"
                              >
                                size {size.size}: quantity {size.quantity}
                              </span>
                            ))}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex justify-end px-6 py-4 border-t">
              <button
                onClick={() => setShowProductsModal(false)}
                className="px-5 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SliderOfferForm = ({
  formData,
  handleInputChange,
  handleImageChange,
  previewImage,
  validationErrors,
}) => {
  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-1">
          Title*
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="Enter slider title"
          className={`block w-full rounded-lg border ${
            validationErrors.title ? "border-red-500" : "border-gray-300"
          } shadow-sm px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
        />
        {validationErrors.title && (
          <p className="mt-1 text-sm text-red-600">{validationErrors.title}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-1">
          Description*
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows="3"
          placeholder="Write a brief description"
          className={`block w-full rounded-lg border ${
            validationErrors.description ? "border-red-500" : "border-gray-300"
          } shadow-sm px-4 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500`}
        />
        {validationErrors.description && (
          <p className="mt-1 text-sm text-red-600">
            {validationErrors.description}
          </p>
        )}
      </div>

      {/* Discount Type & Value */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1">
            Discount Type
          </label>
          <select
            name="discountType"
            value={formData.discountType}
            onChange={handleInputChange}
            className="block w-full rounded-lg border border-gray-300 shadow-sm px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed Amount</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1">
            Discount Value*
          </label>
          <input
            type="number"
            name="discountValue"
            value={formData.discountValue}
            onChange={handleInputChange}
            placeholder="0.00"
            className={`block w-full rounded-lg border ${
              validationErrors.discountValue
                ? "border-red-500"
                : "border-gray-300"
            } shadow-sm px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          {validationErrors.discountValue && (
            <p className="mt-1 text-sm text-red-600">
              {validationErrors.discountValue}
            </p>
          )}
        </div>
      </div>

      {/* Start & End Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1">
            Start Date*
          </label>
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleInputChange}
            className={`block w-full rounded-lg border ${
              validationErrors.startDate ? "border-red-500" : "border-gray-300"
            } shadow-sm px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          {validationErrors.startDate && (
            <p className="mt-1 text-sm text-red-600">
              {validationErrors.startDate}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1">
            End Date*
          </label>
          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleInputChange}
            className={`block w-full rounded-lg border ${
              validationErrors.endDate ? "border-red-500" : "border-gray-300"
            } shadow-sm px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          {validationErrors.endDate && (
            <p className="mt-1 text-sm text-red-600">
              {validationErrors.endDate}
            </p>
          )}
        </div>
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-1">
          Offer Image*
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className={`block w-full rounded-lg border ${
            validationErrors.image ? "border-red-500" : "border-gray-300"
          } shadow-sm px-4 py-2 text-sm file:bg-gray-100 file:border-0 file:rounded file:mr-4 file:px-4`}
        />
        {validationErrors.image && (
          <p className="mt-1 text-sm text-red-600">{validationErrors.image}</p>
        )}
        {previewImage && (
          <div className="mt-2">
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-full h-auto max-h-52 rounded shadow"
            />
          </div>
        )}
      </div>

      {/* Button Text & Link */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1">
            Button Text
          </label>
          <input
            type="text"
            name="buttonText"
            value={formData.buttonText}
            onChange={handleInputChange}
            placeholder="e.g., Shop Now"
            className="block w-full rounded-lg border border-gray-300 shadow-sm px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1">
            Button Link
          </label>
          <input
            type="text"
            name="buttonLink"
            value={formData.buttonLink}
            onChange={handleInputChange}
            placeholder="https://example.com"
            className="block w-full rounded-lg border border-gray-300 shadow-sm px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
};

const PageOfferForm = ({
  formData,
  handleInputChange,
  handleImageChange,
  previewImage,
  validationErrors,
  handleSubmit,
}) => {
  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-800 mb-1">
          Title*
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="Enter offer title"
          className={`block w-full rounded-lg border ${
            validationErrors.title ? "border-red-500" : "border-gray-300"
          } shadow-sm px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
        />
        {validationErrors.title && (
          <p className="mt-1 text-sm text-red-600">{validationErrors.title}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-800 mb-1">
          Description*
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows="5"
          placeholder="Enter detailed description"
          className={`block w-full rounded-lg border ${
            validationErrors.description ? "border-red-500" : "border-gray-300"
          } shadow-sm px-4 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500`}
        />
        {validationErrors.description && (
          <p className="mt-1 text-sm text-red-600">
            {validationErrors.description}
          </p>
        )}
      </div>

      {/* Discount Type & Value */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">
            Discount Type
          </label>
          <select
            name="discountType"
            value={formData.discountType}
            onChange={handleInputChange}
            className="block w-full rounded-lg border border-gray-300 shadow-sm px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed Amount</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">
            Discount Value*
          </label>
          <input
            type="number"
            name="discountValue"
            value={formData.discountValue}
            onChange={handleInputChange}
            placeholder="0.00"
            className={`block w-full rounded-lg border ${
              validationErrors.discountValue
                ? "border-red-500"
                : "border-gray-300"
            } shadow-sm px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          {validationErrors.discountValue && (
            <p className="mt-1 text-sm text-red-600">
              {validationErrors.discountValue}
            </p>
          )}
        </div>
      </div>

      {/* Start & End Date */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">
            Start Date*
          </label>
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleInputChange}
            className={`block w-full rounded-lg border ${
              validationErrors.startDate ? "border-red-500" : "border-gray-300"
            } shadow-sm px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          {validationErrors.startDate && (
            <p className="mt-1 text-sm text-red-600">
              {validationErrors.startDate}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">
            End Date*
          </label>
          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleInputChange}
            className={`block w-full rounded-lg border ${
              validationErrors.endDate ? "border-red-500" : "border-gray-300"
            } shadow-sm px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          {validationErrors.endDate && (
            <p className="mt-1 text-sm text-red-600">
              {validationErrors.endDate}
            </p>
          )}
        </div>
      </div>

      {/* Banner Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-800 mb-1">
          Banner Image*
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className={`block w-full rounded-lg border ${
            validationErrors.image ? "border-red-500" : "border-gray-300"
          } shadow-sm px-4 py-2 text-sm file:bg-gray-100 file:border-0 file:rounded file:mr-4 file:px-4`}
        />
        {validationErrors.image && (
          <p className="mt-1 text-sm text-red-600">{validationErrors.image}</p>
        )}
        {previewImage && (
          <div className="mt-2">
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-full h-auto max-h-52 rounded shadow"
            />
          </div>
        )}
      </div>
    </div>
  );
};

const PopupOfferForm = ({
  formData,
  handleInputChange,
  handleImageChange,
  previewImage,
  validationErrors,
  handleSubmit,
}) => {
  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title*
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          className={`block w-full rounded-lg border ${
            validationErrors.title ? "border-red-500" : "border-gray-300"
          } shadow-sm px-4 py-2 text-sm`}
        />
        {validationErrors.title && (
          <p className="mt-1 text-sm text-red-600">{validationErrors.title}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description*
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows="3"
          className={`block w-full rounded-lg border ${
            validationErrors.description ? "border-red-500" : "border-gray-300"
          } shadow-sm px-4 py-2 text-sm resize-none`}
        />
        {validationErrors.description && (
          <p className="mt-1 text-sm text-red-600">
            {validationErrors.description}
          </p>
        )}
      </div>

      {/* Discount */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Discount Type
          </label>
          <select
            name="discountType"
            value={formData.discountType}
            onChange={handleInputChange}
            className="block w-full rounded-lg border border-gray-300 shadow-sm px-4 py-2 text-sm"
          >
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed Amount</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Discount Value*
          </label>
          <input
            type="number"
            name="discountValue"
            value={formData.discountValue}
            onChange={handleInputChange}
            className={`block w-full rounded-lg border ${
              validationErrors.discountValue
                ? "border-red-500"
                : "border-gray-300"
            } shadow-sm px-4 py-2 text-sm`}
          />
          {validationErrors.discountValue && (
            <p className="mt-1 text-sm text-red-600">
              {validationErrors.discountValue}
            </p>
          )}
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date*
          </label>
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleInputChange}
            className={`block w-full rounded-lg border ${
              validationErrors.startDate ? "border-red-500" : "border-gray-300"
            } shadow-sm px-4 py-2 text-sm`}
          />
          {validationErrors.startDate && (
            <p className="mt-1 text-sm text-red-600">
              {validationErrors.startDate}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date*
          </label>
          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleInputChange}
            className={`block w-full rounded-lg border ${
              validationErrors.endDate ? "border-red-500" : "border-gray-300"
            } shadow-sm px-4 py-2 text-sm`}
          />
          {validationErrors.endDate && (
            <p className="mt-1 text-sm text-red-600">
              {validationErrors.endDate}
            </p>
          )}
        </div>
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Popup Image*
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className={`block w-full rounded-lg border ${
            validationErrors.image ? "border-red-500" : "border-gray-300"
          } shadow-sm px-4 py-2 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-gray-100`}
        />
        {validationErrors.image && (
          <p className="mt-1 text-sm text-red-600">{validationErrors.image}</p>
        )}
        {previewImage && (
          <div className="mt-2">
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-full h-auto max-h-48 rounded-md shadow"
            />
          </div>
        )}
      </div>

      {/* Optional Coupon Code */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Coupon Code (Optional)
        </label>
        <input
          type="text"
          name="couponCode"
          value={formData.couponCode || ""}
          onChange={handleInputChange}
          className="block w-full rounded-lg border border-gray-300 shadow-sm px-4 py-2 text-sm"
        />
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <button
          type="button"
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-6 py-2 text-sm rounded-lg hover:bg-blue-700 transition"
        >
          Submit Offer
        </button>
      </div>
    </div>
  );
};

export default OfferManagement;
