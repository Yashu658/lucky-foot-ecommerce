
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../config/api";
import { useAuth } from "../context/authContext";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();
  const { user, setUser, isLogin, setIsLogin, isAdmin, setIsAdmin } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/auth/login", formData);
      console.log(res.data);
      setUser(res.data.user);
      sessionStorage.setItem("user", JSON.stringify(res.data.user));
      setIsLogin(true);
      if (res.data.user.role === "Admin") {
        setIsAdmin(true);
        navigate("/adminDashboard");
      } else {
        alert(res.data.message);
        navigate("/");
      }
      setFormData({
        email: "",
        password: "",
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
    <div className="min-h-screen flex items-center justify-center bg-surface-50">
      <div className="max-w-md w-full space-y-2 bg-surface-100 p-8 rounded-xl shadow-lg">
        <div>
          <h2 className="text-3xl font-bold text-surface-900 text-center">
            Welcome Back
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
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
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-surface-50"
              placeholder="Password"
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-surface-300 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-surface-700"
                >
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link to="/forgot-password" className="text-primary">
                  Forgot your password?
                </Link>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 border border-secondary rounded-lg text-primary-content bg-primary hover:bg-primary-content hover:text-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 font-medium"
          >
            Sign in
          </button>
        </form>

        <p className="text-surface-600 text-center">Or continue with</p>

        <div className="grid grid-cols-2 gap-3">
          <button className="w-full py-3 px-4 border border-secondary rounded-lg text-primary-content bg-primary hover:bg-primary-content hover:text-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 font-medium">
            Google
          </button>
          <button className="w-full py-3 px-4 border border-secondary rounded-lg text-primary-content bg-primary hover:bg-primary-content hover:text-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 font-medium">
            Facebook
          </button>
        </div>
        <p className="mt-2 text-center text-surface-600">
          New to Lucky Footwear?{" "}
          <Link to="/register" className="text-primary">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
