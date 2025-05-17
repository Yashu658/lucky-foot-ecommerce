import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "../config/api";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    dob: "",
    phone: "",
    gender: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("/api/auth/register", formData);

      console.log(res.data);
      setFormData({
        name: "",
        email: "",
        password: "",
        dob: "",
        phone: "",
        gender: "",
      });
    } catch (error) {
      console.error(error);
    }
    console.log(formData);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 p-4">
      <div className="max-w-md w-full space-y-8 bg-surface-100 p-8 rounded-xl shadow-lg">
        <div>
          <h2 className="text-3xl font-bold text-surface-900 text-center">
            Create Account
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <input
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-surface-50"
              placeholder="Name"
            />

            <input
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-surface-50"
              placeholder="Email"
            />
            <input
              name="phone"
              type="tel"
              required
              value={formData.phone}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-surface-50"
              placeholder="Phone Number"
            />

            <input
              name="dob"
              type="date"
              required
              value={formData.dob}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-surface-50"
              placeholder="Date of Birth"
            />

            <select
              name="gender"
              required
              value={formData.gender}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-surface-50"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            <input
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-surface-50"
              placeholder="Password"
            />
          </div>

          <p className="text-sm text-surface-600">
            By signing up, you agree to our{" "}
            <a href="#" className="text-primary">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-primary">
              Privacy Policy
            </a>
          </p>

          <button
            type="submit"
            className="w-full py-3 px-4 border border-secondary rounded-lg text-primary-content bg-primary hover:bg-primary-content hover:text-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 font-medium"
          >
            Create Account
          </button>
        </form>

        <p className="text-sm text-center">
          Already have an account?{" "}
          <Link to="/login" className=" text-primary">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;