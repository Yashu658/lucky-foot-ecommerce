import React, { useEffect, useState } from "react";
import axios from "../../config/api";
import { FiEdit2, FiEye, FiTrash2, FiPlus, FiSearch } from "react-icons/fi";
import AddProductModal from "../Modals/AddProductModal";
import ViewProductModal from "../Modals/ViewProductModal";

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Add handleView function
  const handleView = (product) => {
    setSelectedProduct(product);
    setIsViewModalOpen(true);
  };

  const fetchProducts = async () => {
    try {
      console.log("Fetching products...");
      const response = await axios.get("/api/admin/getAllProducts");
      setProducts(response.data.products);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
    // Log the products array to the console to check its contents
  }, []);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleProductAdded = (newProduct) => {
    setProducts([...products, newProduct]);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <span className="text-2xl text-primary font-bold">
          Product Management
        </span>
        <div className="flex gap-3">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-surface-500" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-surface-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-content rounded-lg hover:bg-primary-focus"
            onClick={() => setIsAddModalOpen(true)}
          >
            <FiPlus /> Add New Product
          </button>
        </div>
      </div>

      <div className="bg-surface-50 rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-surface-100">
                <th className="px-6 py-4 text-left text-sm font-semibold text-surface-600">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-surface-600">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-surface-600">
                  SubCategory
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-surface-600">
                  Stock
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-surface-600">
                  Price
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-surface-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200">
              {filteredProducts.map((product) => (
                <tr key={product._id} className="hover:bg-surface-100">
                  <td className="px-6 py-4 text-surface-900">{product.name}</td>
                  <td className="px-6 py-4 text-surface-600">
                    {product.category}
                  </td>
                  <td className="px-6 py-4 text-surface-600">
                    {product.subCategory}
                  </td>
                  <td className="px-6 py-4 text-surface-600">
                    {product.size.reduce(
                      (total, item) => total + item.quantity,
                      0
                    )}
                  </td>
                  <td className="px-6 py-4 text-surface-600">₹{product.mrp}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <button
                        className="p-1 text-info hover:bg-info hover:text-info-content rounded"
                        onClick={() => handleView(product)}
                      >
                        <FiEye size={18} />
                      </button>
                      <button className="p-1 text-warning hover:bg-warning hover:text-warning-content rounded">
                        <FiEdit2 size={18} />
                      </button>
                      <button className="p-1 text-error hover:bg-error hover:text-error-content rounded">
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onProductAdded={handleProductAdded}
      />
      <ViewProductModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        product={selectedProduct}
      />
    </div>
  );
};

export default ProductManagement;