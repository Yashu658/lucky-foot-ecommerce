import React, { useState, useEffect } from "react";
import axios from "../../config/api";

const EditCustomerModel = ({
  isOpen,
  onClose,
  customerData,
  onCustomerUpdated,
}) => {
  const [formData, setFormData] = useState({
    _id: "",
    name: "",
    email: "",
    dob: "",
    phone: "",
    gender: "",
  });

  useEffect(() => {
    if (customerData) {
      setFormData({
        _id: customerData._id || customerData.id || "",
        name: customerData.name || "",
        email: customerData.email || "",
        dob: customerData.dob ? customerData.dob.split("T")[0] : "",
        phone: customerData.phone || "",
        gender: customerData.gender || "",
      });
    }
  }, [customerData]);

  if (!isOpen || !customerData) return null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.put(`/api/customer/updateByAdmin/${formData._id}`, {
        name: formData.name,
        phone: formData.phone,
        gender: formData.gender,
        dob: formData.dob,
      });
      alert("Customer updated successfully");
      onCustomerUpdated?.(); // Call this to refresh UI
      onClose?.();
    } catch (error) {
      console.error("Error updating customer:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="animate-fade-in-up bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition"
        >
          ✕
        </button>
        <h2 className="text-2xl font-bold text-center text-blue-600 mb-6">
          Edit Customer
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            type="text"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder="Full Name"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <input
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <input
            name="phone"
            type="tel"
            required
            value={formData.phone}
            onChange={handleChange}
            placeholder="Phone Number"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <input
            name="dob"
            type="date"
            required
            value={formData.dob}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <select
            name="gender"
            required
            value={formData.gender}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>

          <button
            type="submit"
            className="w-full py-3 text-white font-semibold bg-blue-500 hover:bg-blue-600 rounded-lg transition"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditCustomerModel;
