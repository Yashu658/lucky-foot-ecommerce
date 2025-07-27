import React, { useEffect, useState, useRef } from "react";
import axios from "../../config/api";
import { FiMoreVertical, FiEye, FiEdit2, FiCheckCircle, FiTrash2, FiPlus, FiSearch } from "react-icons/fi";
import AddProductModal from "../Modals/AddProductModal";
import ViewProductModal from "../Modals/ViewProductModal";
import EditProductModal from "../Modals/EditProductModal";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const ProductManagement = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({
    gender: "all",
    status: "all"
  });
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const dropdownRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleView = (product) => {
    setSelectedProduct(product);
    setIsViewModalOpen(true);
    setOpenDropdownId(null);
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
    setOpenDropdownId(null);
  };

  const handleSearch = async () => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      setIsSearching(false);
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      const response = await axios.get(`/api/public/searchBox?query=${encodeURIComponent(trimmedQuery)}`);
      
      if (response.data.success) {
        setSearchResults(response.data.results);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Failed to perform search");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setQuery("");
    setSearchResults([]);
  };

  const handleProductUpdated = (updatedProduct) => {
    setProducts(prev => prev.map(p => (p._id === updatedProduct._id ? updatedProduct : p)));
    setSearchResults(prev => prev.map(p => (p._id === updatedProduct._id ? updatedProduct : p)));
  };

  const handleProductAdded = (newProduct) => {
    setProducts(prev => [...prev, newProduct]);
  };

  const toggleProductStatus = async (product) => {
    const updatedStatus = product.status === "active" ? "inactive" : "active";

    try {
      const response = await axios.patch(`/api/admin/updateProductStatus/${product._id}`, {
        status: updatedStatus,
      });

      const updatedProduct = response.data.product;
      setProducts(prev => prev.map(p => (p._id === product._id ? updatedProduct : p)));
      setSearchResults(prev => prev.map(p => (p._id === product._id ? updatedProduct : p)));
      setOpenDropdownId(null);
    } catch (error) {
      console.error("Error updating product status:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.status !== "all") params.append("status", filters.status);
      if (filters.gender !== "all") params.append("gender", filters.gender);

      const response = await axios.get(`/api/admin/getAllProduct?${params}`);
      setProducts(response.data.products);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const updateFilter = (type, value) => {
    setFilters(prev => ({ ...prev, [type]: value }));
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(query.toLowerCase())
  );

  const displayProducts = searchResults.length > 0 ? searchResults : filteredProducts;

  const genderFilters = [
    { value: "all", label: "All Genders" },
    { value: "men", label: "Men" },
    { value: "women", label: "Women" },
    { value: "kids", label: "Kids" },
    { value: "unisex", label: "Unisex" }
  ];

  const statusFilters = [
    { value: "all", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <span className="text-2xl text-blue-700 font-bold">Product Management</span>
        <div className="flex gap-3">
          <div className="hidden md:flex items-center mx-6 relative">
            <input
              type="text"
              placeholder="Search products..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (e.target.value === "") clearSearch();
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            {query && (
              <button
                onClick={clearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            )}
            <button
              onClick={handleSearch}
              className="absolute right-8 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-700"
              disabled={isSearching}
            >
              {isSearching ? "Searching..." : "Search"}
            </button>
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            onClick={() => setIsAddModalOpen(true)}
          >
            <FiPlus /> Add New Product
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {genderFilters.map((filter) => (
            <button
              key={filter.value}
              className={`px-3 py-1 rounded-md text-sm ${
                filters.gender === filter.value
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              onClick={() => updateFilter("gender", filter.value)}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              className={`px-3 py-1 rounded-md text-sm ${
                filters.status === filter.value
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              onClick={() => updateFilter("status", filter.value)}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <div className="max-h-[600px] overflow-y-auto">
            <table className="w-full table-fixed">
              <thead className="bg-gray-100 sticky top-0 z-20">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Product</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">SubCategory</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Gender</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Color</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Stock</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Size : Quantity</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Price</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {displayProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-100 relative">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {product.image?.[0] && (
                          <img 
                            src={product.image[0]} 
                            alt={product.name}
                            onClick={() => navigate(`/product/${product._id}`)}
                            className="w-10 h-10 object-cover rounded-md cursor-pointer"
                          />
                        )}
                        <span className="text-gray-900 max-w-[150px] truncate" title={product.name}>
                          {product.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 capitalize">{product.category}</td>
                    <td className="px-6 py-4 text-gray-600 capitalize">{product.subCategory}</td>
                    <td className="px-6 py-4 text-gray-600 capitalize">{product.gender || 'unisex'}</td>
                    <td className="px-6 py-4 text-gray-600 capitalize">{product.color}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {product.status === "active" 
                        ? product.size.reduce((total, item) => total + (item.quantity || 0), 0)
                        : 0}
                    </td>
                    <td className="px-6 py-4">
                      {product.size.map((size, index) => (
                        <span 
                          key={index} 
                          className={`capitalize ${product.status === "active" ? "text-gray-600" : "text-gray-400"}`}
                        >
                          {size.size}: {product.status === "active" ? size.quantity || 0 : 0}
                          {index < product.size.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </td>
                    <td className="px-6 py-4 text-gray-600">₹{product.mrp}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        product.status === "active" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"
                      }`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 relative">
                      <button
                        className="p-2 rounded hover:bg-gray-200 focus:outline-none"
                        onClick={() => setOpenDropdownId(openDropdownId === product._id ? null : product._id)}
                        aria-haspopup="true"
                        aria-expanded={openDropdownId === product._id}
                        aria-label="Product actions"
                      >
                        <FiMoreVertical size={20} />
                      </button>

                      {openDropdownId === product._id && (
                        <div
                          ref={dropdownRef}
                          className="absolute right-0 top-12 mt-1 w-44 bg-white border border-gray-300 rounded shadow-lg z-10"
                        >
                          <button
                            className="flex items-center gap-2 w-full px-4 py-2 text-gray-700 hover:bg-blue-100"
                            onClick={() => handleView(product)}
                          >
                            <FiEye /> View
                          </button>
                          <button
                            className="flex items-center gap-2 w-full px-4 py-2 text-gray-700 hover:bg-blue-100"
                            onClick={() => handleEdit(product)}
                          >
                            <FiEdit2 /> Edit
                          </button>
                          <button
                            className={`flex items-center gap-2 w-full px-4 py-2 ${
                              product.status === "active"
                                ? "text-green-700 hover:bg-green-100"
                                : "text-red-700 hover:bg-red-100"
                            }`}
                            onClick={() => toggleProductStatus(product)}
                          >
                            {product.status === "active" ? (
                              <>
                                <FiCheckCircle /> Deactivate
                              </>
                            ) : (
                              <>
                                <FiTrash2 /> Activate
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {displayProducts.length === 0 && (
                  <tr>
                    <td colSpan={10} className="text-center text-gray-500 py-6">
                      {isSearching ? (
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                      ) : query ? (
                        "No products found matching your search"
                      ) : (
                        "No products available"
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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
      <EditProductModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        product={selectedProduct}
        onProductUpdated={handleProductUpdated}
      />
    </div>
  );
};

export default ProductManagement;