import { useState } from "react";
import { IoMdClose } from "react-icons/io";
import axios from "../../config/api";
import DescriptionEditor from "./DescriptionEditor";
import { FiPlus } from "react-icons/fi";
import { FiTrash2 } from "react-icons/fi";

const AddProductModal = ({ isOpen, onClose, onProductAdded }) => {
  const [formData, setFormData] = useState({
    name: "",
    mrp: "",
    discount: "",
    description: "",
    category: "",
    subCategory: "",
    rating: 0,
    color: "",
    brand: "",
  });

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stockList, setStockList] = useState([{ size: "", quantity: "" }]);

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

      Object.keys(formData).forEach((key) => {
        formDataToSend.append(key, formData[key]);
      });

      formDataToSend.append("size", JSON.stringify(stockList));

      images.forEach((image) => {
        formDataToSend.append("images", image);
      });

      const response = await axios.post("/api/admin/addProduct", formDataToSend);
      onProductAdded(response.data.product);
      onClose();
      alert("Product added successfully!");
      setFormData({
        name: "",
        mrp: "",
        discount: "",
        description: "",
        category: "",
        subCategory: "",
        rating: 0,
        color: "",
        brand: "",
      });
      setStockList([{ size: "", quantity: "" }]);
      setImages([]);
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl p-6 mt-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Add New Product</h2>
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
    <label className="block text-sm font-medium text-gray-800 mb-1">Gender</label>
    <select
      name="gender"
      value={formData.gender}
      onChange={handleInputChange}
      className="w-full border border-gray-700 rounded-lg p-2 text-gray-900"
      required
    >
      <option value="">Select Gender</option>
      <option value="men">Men</option>
      <option value="women">Women</option>
      <option value="kids">Kids</option>
      <option value="unisex">Unisex</option>
    </select>
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
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-800">Size & Stock</label>
              <button
                className="flex items-center gap-2 border border-blue-500 p-1 rounded bg-blue-500/80 text-white hover:bg-blue-600"
                onClick={handleAddStock}
              >
                <FiPlus /> Add more Stock
              </button>
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
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">Description</label>
          <DescriptionEditor formData={formData} setFormData={setFormData} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">Images (Max 5)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="w-full border border-gray-700 rounded-lg p-2 text-gray-900"
              required
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
              {loading ? "Adding..." : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;
