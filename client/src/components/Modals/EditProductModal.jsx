import { useState, useEffect } from "react";
import { IoMdClose } from "react-icons/io";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import axios from "../../config/api";

const EditProductModal = ({ isOpen, onClose, product, onProductUpdated }) => {
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
  const [existingImages, setExistingImages] = useState([]);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        mrp: product.mrp,
        discount: product.discount,
        description: product.description,
        category: product.category,
        subCategory: product.subCategory,
        rating: product.rating,
        color: product.color,
        brand: product.brand,
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

      Object.keys(formData).forEach((key) => {
        formDataToSend.append(key, formData[key]);
      });

      formDataToSend.append("size", JSON.stringify(stockList));

      if (images.length > 0) {
        images.forEach((image) => {
          formDataToSend.append("images", image);
        });
      } else {
        formDataToSend.append("image", JSON.stringify(existingImages));
      }

      const response = await axios.put(
        `/api/admin/updateProduct/${product._id}`,
        formDataToSend
      );

      onProductUpdated(response.data.product);
      onClose();
      alert("Product updated successfully!");
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Failed to update product");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-secondary flex items-center justify-center z-5 mt-15">
      <div className="bg-secondary rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-secondary-content">
            Edit Product
          </h2>
          <button
            onClick={onClose}
            className="text-secondary-content hover:text-error"
          >
            <IoMdClose size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary-content mb-1">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full border border-secondary-content rounded-lg p-2 text-secondary-content"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-content mb-1">
                Brand
              </label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                className="w-full border border-secondary-content rounded-lg p-2 text-secondary-content"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-content mb-1">
                MRP
              </label>
              <input
                type="number"
                name="mrp"
                value={formData.mrp}
                onChange={handleInputChange}
                className="w-full border border-secondary-content rounded-lg p-2 text-secondary-content"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-content mb-1">
                Discount (%)
              </label>
              <input
                type="number"
                name="discount"
                value={formData.discount}
                onChange={handleInputChange}
                className="w-full border border-secondary-content rounded-lg p-2 text-secondary-content"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-content mb-1">
                Category
              </label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full border border-secondary-content rounded-lg p-2 text-secondary-content"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-content mb-1">
                Sub Category
              </label>
              <input
                type="text"
                name="subCategory"
                value={formData.subCategory}
                onChange={handleInputChange}
                className="w-full border border-secondary-content rounded-lg p-2 text-secondary-content"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-content mb-1">
                Color
              </label>
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleInputChange}
                className="w-full border border-secondary-content rounded-lg p-2 text-secondary-content"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between">
              <label className="block text-sm font-medium text-secondary-content mb-1">
                Size & Stock
              </label>
              <button
                className="flex justify-center gap-3 items-center border border-info p-1 rounded bg-info/80 text-info-content"
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
                    onChange={(e) =>
                      handleStockChange(index, "size", e.target.value)
                    }
                    className="border border-secondary-content rounded-lg p-2 text-secondary-content"
                    placeholder="Size"
                    required
                  />
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      handleStockChange(index, "quantity", e.target.value)
                    }
                    className="border border-secondary-content rounded-lg p-2 text-secondary-content"
                    placeholder="Stock"
                    required
                  />
                  {stockList.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveStock(index)}
                      className="p-2 text-error hover:bg-error hover:text-error-content rounded"
                    >
                      <FiTrash2 />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-content mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="4"
              className="w-full border border-secondary-content rounded-lg p-2 text-secondary-content"
              required
            ></textarea>
          </div>

          {/* Current Images Section */}
          <div>
            <label className="block text-sm font-medium text-secondary-content mb-1">
              Current Images
            </label>
            <div className="grid grid-cols-5 gap-2 mb-4">
              {existingImages.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`Product ${index + 1}`}
                  className="w-full h-20 object-fill rounded"
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-content mb-1">
              Upload New Images (Optional)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="w-full border border-secondary-content rounded-lg p-2 text-secondary-content"
            />
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-error rounded-lg text-error-content hover:bg-error"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-warning text-warning-content rounded-lg hover:bg-warning-focus disabled:opacity-50"
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