import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "../config/api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";


const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    dob: "",
    phone: "",
    gender: "",
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();


  const validate = () => {
    const newErrors = {};
    const nameRegex = /^[A-Za-z\s]{3,}$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|orkut\.com|yahoo\.com)$/;
    const phoneRegex = /^[6-9]\d{9}$/;
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/;
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

    if (!nameRegex.test(formData.name)) {
      newErrors.name = "Name must be at least 3 characters and contain only letters";
    }
    if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = "Phone must be 10 digits starting with 6-9";
    }
    if (!formData.gender) {
      newErrors.gender = "Please select a gender";
    }
    if (!dateRegex.test(formData.dob)) {
      newErrors.dob = "Please enter a valid date";
    } else {
      const dobDate = new Date(formData.dob);
      const today = new Date();
      const minAgeDate = new Date(today.getFullYear() - 16, today.getMonth(), today.getDate());
      if (dobDate >= minAgeDate) {
        newErrors.dob = "You must be at least 16 years old";
      }
    }
    if (!passwordRegex.test(formData.password)) {
      newErrors.password = "Password must be 8-16 chars with uppercase, lowercase, number & special char";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const res = await axios.post("/api/auth/register", formData);
      if (res.data.success) {
      toast.success(res.data.message || "Registration successful");

      setFormData({
        name: "",
        email: "",
        password: "",
        dob: "",
        phone: "",
        gender: "",
      });

      navigate("/login");
    }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Registration failed");
      if (error.response && error.response.data) {
        setErrors({ ...errors, server: error.response.data.message });
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const renderError = (field) => (
    errors[field] && <p className="text-sm text-red-500 mt-1">{errors[field]}</p>
  );

  return (
    <div className="min-h-screen flex items-center justify-center  px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 transition duration-500 hover:scale-[1.02]">
        <h2 className="text-4xl font-extrabold text-gray-800 text-center mb-6">Create Account</h2>
        {errors.server && <p className="text-red-500 text-center mb-4">{errors.server}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {renderError("name")}
          </div>

          {/* Email */}
          <div>
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {renderError("email")}
          </div>

          {/* Phone */}
          <div>
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {renderError("phone")}
          </div>

          {/* Date of Birth */}
          <div>
            <input
              type="date"
              name="dob"
              placeholder="Date of Birth"
              value={formData.dob}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {renderError("dob")}
          </div>

          {/* Gender */}
          <div>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select Gender</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
            {renderError("gender")}
          </div>

          {/* Password */}
          <div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {renderError("password")}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-white hover:text-indigo-600 hover:border hover:border-indigo-600 transition duration-300"
          >
            Sign Up
          </button>
        </form>

        <p className="mt-6 text-sm text-center text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-600 font-semibold hover:underline">
            Sign in
          </Link>
        </p>

        <p className="mt-4 text-xs text-gray-400 text-center">
          By signing up, you agree to our{" "}
          <a href="#" className="underline">Terms</a> &{" "}
          <a href="#" className="underline">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
};

export default Register;
