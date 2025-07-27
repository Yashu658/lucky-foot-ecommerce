import { useState, useEffect } from "react";
import { IoMdClose } from "react-icons/io";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import axios from "../../config/api";
import DescriptionEditor from "./DescriptionEditor";

const EditProductModal = ({ isOpen, onClose, product, onProductUpdated }) => {
  const [formData, setFormData] = useState({
    name: "",
    mrp: "",
    discount: "",
    description: {},
    category: "",
    subCategory: "",
    rating: 0,
    color: "",
    brand: "",
    gender: "unisex",
    status: "active"
  });

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stockList, setStockList] = useState([{ size: "", quantity: "" }]);
  const [existingImages, setExistingImages] = useState([]);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        mrp: product.mrp,
        discount: product.discount,
      description:
  product.description && typeof product.description === "string"
    ? JSON.parse(product.description)
    : product.description || {},
        category: product.category,
        subCategory: product.subCategory,
        rating: product.rating,
        color: product.color,
        brand: product.brand,
        gender: product.gender,
        status: product.status
      });
      setStockList(product.size);
      setExistingImages(product.image || []);
    }
  }, [product]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      alert("Maximum 5 images allowed");
      return;
    }
    setImages(files);
  };

  const handleStockChange = (index, field, value) => {
    const newStockList = [...stockList];
    newStockList[index][field] = value;
    setStockList(newStockList);
  };

  const handleAddStock = (e) => {
    e.preventDefault();
    setStockList([...stockList, { size: "", quantity: "" }]);
  };

  const handleRemoveStock = (index) => {
    const newStockList = stockList.filter((_, i) => i !== index);
    setStockList(newStockList);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();

      // Append all form data
     Object.keys(formData).forEach((key) => {
        const newValue = formData[key];
        const oldValue = product[key];
        const hasChanged =
          typeof newValue === "object"
            ? JSON.stringify(newValue) !== JSON.stringify(oldValue)
            : newValue !== oldValue;

        if (hasChanged) {
          formDataToSend.append(
            key,
            typeof newValue === "object" ? JSON.stringify(newValue) : newValue
          );
        }
      });

      // Append size/stock data
      formDataToSend.append("size", JSON.stringify(stockList));

      // Handle images
      if (images.length > 0) {
        images.forEach((image) => {
          formDataToSend.append("images", image);
        });
      } else {
        formDataToSend.append("image", JSON.stringify(existingImages));
      }

      const response = await axios.put(
        `/api/admin/updateProduct/${product._id}`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      onProductUpdated(response.data.product);
      onClose();
      alert("Product updated successfully!");
    } catch (error) {
      console.error("Error updating product:", error);
      alert(`Failed to update product: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl p-6 mt-18 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Edit Product</h2>
          <button onClick={onClose} className="text-gray-700 hover:text-red-600">
            <IoMdClose size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full border border-gray-700 rounded-lg p-2 text-gray-900"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Brand</label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                className="w-full border border-gray-700 rounded-lg p-2 text-gray-900"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">MRP</label>
              <input
                type="number"
                name="mrp"
                value={formData.mrp}
                onChange={handleInputChange}
                className="w-full border border-gray-700 rounded-lg p-2 text-gray-900"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Discount (%)</label>
              <input
                type="number"
                name="discount"
                value={formData.discount}
                onChange={handleInputChange}
                className="w-full border border-gray-700 rounded-lg p-2 text-gray-900"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Category</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full border border-gray-700 rounded-lg p-2 text-gray-900"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Sub Category</label>
              <input
                type="text"
                name="subCategory"
                value={formData.subCategory}
                onChange={handleInputChange}
                className="w-full border border-gray-700 rounded-lg p-2 text-gray-900"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Color</label>
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleInputChange}
                className="w-full border border-gray-700 rounded-lg p-2 text-gray-900"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full border border-gray-700 rounded-lg p-2 text-gray-900"
                required
              >
                <option value="men">Men</option>
                <option value="women">Women</option>
                <option value="kids">Kids</option>
                <option value="unisex">Unisex</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full border border-gray-700 rounded-lg p-2 text-gray-900"
                required
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-800">Size & Stock</label>
              
            </div>

            <div className="space-y-3">
              {stockList.map((item, index) => (
                <div key={index} className="flex gap-3 items-center">
                  <input
                    type="text"
                    value={item.size}
                    onChange={(e) => handleStockChange(index, "size", e.target.value)}
                    className="border border-gray-700 rounded-lg p-2 text-gray-900"
                    placeholder="Size"
                    required
                  />
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleStockChange(index, "quantity", e.target.value)}
                    className="border border-gray-700 rounded-lg p-2 text-gray-900"
                    placeholder="Stock"
                    required
                  />
                  {stockList.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveStock(index)}
                      className="p-2 text-red-600 hover:bg-red-600 hover:text-white rounded"
                    >
                      <FiTrash2 />
                    </button>
                  )}
                </div>
              ))}
              <button
                className="flex items-center gap-2 text-blue-500 p-1 rounded  hover:bg-blue-600"
                onClick={handleAddStock}
              >
                <FiPlus /> Add more Stock
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">Description</label>
            <DescriptionEditor formData={formData} setFormData={setFormData} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">Existing Images</label>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {existingImages.map((img, index) => (
                <div key={index} className="relative">
                  <img
                    src={img}
                    alt={`Existing image ${index + 1}`}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Upload New Images (Max 5, will replace existing)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="w-full border border-gray-700 rounded-lg p-2 text-gray-900"
            />
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-red-600 rounded-lg text-red-600 hover:bg-red-600 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductModal;