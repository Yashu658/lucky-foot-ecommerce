import React, { useState,useEffect } from "react";
import { FaCheckCircle } from "react-icons/fa";
import { MdCancel } from "react-icons/md";
import { FaCamera } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import axios from "../config/api";
import { useAuth } from "../context/authContext";
import { toast } from "react-toastify";

const Update = () => {
  const { user, setUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user.name,
    phone: user.phone,
    dob: user.dob.split("T")[0],
    gender: user.gender,
  });

  const [previewImage, setPreviewImage] = useState(user.profilePic);
  const [selectedFile, setSelectedFile] = useState(null);
  const navigate = useNavigate();

// Inside your component
useEffect(() => {
  if (user) {
    setFormData({
      name: user.name || "",
      phone: user.phone || "",
      dob: user.dob ? user.dob.split("T")[0] : "",
      gender: user.gender || "",
    });
    setPreviewImage(user.profilePic || "");
  }
}, [user]);


  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };


  const validateInputs = () => {
    const nameRegex = /^[a-zA-Z\s]{3,30}$/;
const phoneRegex = /^[6-9]\d{9}$/;

  if (!nameRegex.test(formData.name)) {
    toast.error("Please enter a valid name (only letters, 3–30 characters).");
    return false;
  }

  if (!phoneRegex.test(formData.phone)) {
    toast.error("Please enter a valid 10-digit Indian phone number.");
    return false;
  }

  if (!formData.dob) {
    toast.error("Please select a date of birth.");
    return false;
  }

  if (!formData.gender) {
    toast.error("Please select a gender.");
    return false;
  }

  return true;
};


  const handleSave = async () => {
     if (!validateInputs()) return;
    try {
      const updatedData = new FormData();
      updatedData.append("name", formData.name);
      updatedData.append("phone", formData.phone);
      updatedData.append("dob", formData.dob);
      updatedData.append("gender", formData.gender);
      if (selectedFile) updatedData.append("profilePic", selectedFile);

      const res = await axios.put("/api/auth/update", updatedData);
      setUser(res.data.user);
      sessionStorage.setItem("user", JSON.stringify(res.data.user));
            toast.success(res.data.message || "Profile updated successfully.");
      navigate("/account");
    } catch (error) {
     toast.error(
        error?.response?.data?.message || "Something went wrong. Please try again."
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 flex items-start justify-center">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-3xl">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Update Profile</h2>

        <div className="flex flex-col items-center space-y-6">
          {/* Profile Picture */}
          <div className="relative group">
            <img
              src={previewImage}
              alt="Profile"
              className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-md"
            />
            <label
              htmlFor="profilePic"
              className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full cursor-pointer group-hover:scale-110 transition"
              title="Change Profile Picture"
            >
              <FaCamera className="text-white w-5 h-5" />
            </label>
            <input
              type="file"
              id="profilePic"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          {/* Form Fields */}
          <div className="w-full space-y-4">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Full Name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />

            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Phone Number"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />

            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />

            <select
              name="gender"
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="w-full flex gap-4 pt-4">
            <button
              onClick={handleSave}
              className="flex-1 py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold flex items-center justify-center gap-2 transition"
            >
              <FaCheckCircle />
              Save
            </button>
            <button
              onClick={() => navigate("/account")}
              className="flex-1 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold flex items-center justify-center gap-2 transition"
            >
              <MdCancel />
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Update;
