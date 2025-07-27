import React, { useState,useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { IoMdArrowBack } from "react-icons/io";
import { IoMdClose } from "react-icons/io";
import axios from "../config/api"; // or from "axios" if you're using default axios

const AddressPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const editingAddress = location.state?.address;
  const isEditMode = Boolean(editingAddress);
  const cameFrom = location.state?.from || null;
  const [address, setAddress] = useState({
    homeNumber: "",
    street: "",
    landmark: "",
    city: "",
    state: "",
    zip: "",
    phone:"",
    country:"",
  });




// inside component
useEffect(() => {
  if (editingAddress) {
    setAddress({
      homeNumber: editingAddress.homeNumber || "",
      street: editingAddress.street || "",
      landmark: editingAddress.landmark || "",
      city: editingAddress.city || "",
      state: editingAddress.state || "",
      zip: editingAddress.zip || "",
      phone: editingAddress.phone || "",
      country:editingAddress.country || "",
    });
  }
}, [editingAddress]);


  const handleChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

const handleSave = async () => {
  // Destructure address fields
  const { homeNumber, street, landmark, city, state, zip, phone, country } = address;
  
  // Validate required fields
  if (!homeNumber || !city || !state || !zip || !phone || !country) {
    toast.error("Please fill in all address fields");
    return;
  }

  // Regex validators
  const regexValidators = {
    homeNumber: /^[\w\s\/#-]{1,50}$/,
    street: /^[a-zA-Z0-9\s,.'-]{3,100}$/,
    landmark: /^[a-zA-Z0-9\s,.'-]{0,100}$/,
    city: /^[a-zA-Z\s]{2,50}$/,
    state: /^[a-zA-Z\s]{2,50}$/,
    zip: /^\d{4,10}$/,
    phone: /^[6-9]\d{9}$/,
    country: /^[a-zA-Z\s]{2,56}$/,
  };

  // Validate field formats
  const requiredFields = { homeNumber, street, city, state, zip, phone, country };
  for (let key in requiredFields) {
    if (!requiredFields[key]) {
      toast.error(`Please enter your ${key}`);
      return;
    }
    if (!regexValidators[key].test(requiredFields[key])) {
      toast.error(`Invalid ${key} format`);
      return;
    }
  }

  if (landmark && !regexValidators.landmark.test(landmark)) {
    toast.error("Invalid landmark format");
    return;
  }

  try {
    let updatedAddresses = [];
    
    // Check address limit only for new addresses
    if (!isEditMode) {
      const currentAddresses = await axios.get("/api/addresses");
      const savedList = Array.isArray(currentAddresses.data) 
        ? currentAddresses.data 
        : currentAddresses.data.addresses;
      
      if (savedList.length >= 10) {
        toast.error("You can only save up to 10 addresses.");
        return;
      }
    }

    // Save/update address
    if (isEditMode) {
      await axios.put(`/api/addresses/${editingAddress._id}`, address);
      toast.success("Address updated!");
    } else {
      await axios.post("/api/addresses/add", address);
      toast.success("Address saved!");
    }

    // Get fresh address list from server
    const freshResponse = await axios.get("/api/addresses");
    updatedAddresses = Array.isArray(freshResponse.data) 
      ? freshResponse.data 
      : freshResponse.data.addresses;

    // Update session storage
    sessionStorage.setItem("user_address", JSON.stringify(address));
    sessionStorage.setItem("saved_addresses", JSON.stringify(updatedAddresses));

    // Navigate back with proper state
    if (cameFrom === "account") {
      navigate("/account", { 
        state: { 
          tab: "addresses",
          addressUpdated: true 
        } 
      });
    } else {
      navigate(-1, { 
        state: { 
          newAddress: address,
          addressesUpdated: true 
        } 
      });
    }

  } catch (error) {
    console.error("Address save error:", error);
    toast.error(
      error.response?.data?.message || 
      "Failed to save address. Please try again."
    );
  }
};



  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-50 to-blue-50 flex items-center justify-center px-4">
      <div className="relative bg-white shadow-2xl rounded-2xl p-8 max-w-lg w-full border border-indigo-100">
         {/* Close Button */}
    <button
      onClick={() => navigate(-1)}
      className="absolute top-4 right-4 text-gray-600 hover:text-red-500 transition"
      aria-label="Close"
    >
      <IoMdClose size={24} />
    </button>

    {/* Header */}
    <div className="flex items-center gap-4 mb-6">
      <button
        onClick={() => navigate(-1)}
        className="text-indigo-600 hover:text-indigo-800 transition"
        aria-label="Back"
      >
        <IoMdArrowBack size={24} />
      </button>
      <h1 className="text-2xl font-bold text-indigo-700">
        {isEditMode ? "Edit Address" : "Add New Address"}
      </h1>
    </div>

        <div className="space-y-4">
          <input
            type="text"
            name="homeNumber"
            placeholder="Home / Flat Number"
            value={address.homeNumber}
            onChange={handleChange}
            className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none"
          />
          <input
            type="text"
            name="street"
            placeholder="Street Address"
            value={address.street}
            onChange={handleChange}
            className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none"
          />
          <input
            type="text"
            name="landmark"
            placeholder="Landmark (e.g. Near Park, Mall)"
            value={address.landmark}
            onChange={handleChange}
            className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none"
          />
          <input
            type="text"
            name="city"
            placeholder="City"
            value={address.city}
            onChange={handleChange}
            className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none"
          />
          <input
            type="text"
            name="state"
            placeholder="State"
            value={address.state}
            onChange={handleChange}
            className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none"
          />
          <input
            type="text"
            name="zip"
            placeholder="Zip Code"
            value={address.zip}
            onChange={handleChange}
            className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none"
          />
           <input
            type="text"
            name="phone"
            placeholder="phone number"
            value={address.phone}
            onChange={handleChange}
            className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none"
          />
           <input
            type="text"
            name="country"
            placeholder="country"
            value={address.country}
            onChange={handleChange}
            className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none"
          />

          <button
            onClick={handleSave}
            className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 transition"
          >
            {isEditMode ? "Update Address" : "Save Address"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddressPage;
