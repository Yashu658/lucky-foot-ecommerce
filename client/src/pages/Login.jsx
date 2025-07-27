// Login.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../config/api";
import { toast } from "react-toastify";
import { useAuth } from "../context/authContext";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();
  const { user, setUser, isLogin, setIsLogin, isAdmin, setIsAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [userId, setUserId] = useState();
  const [showActivationModal, setShowActivationModal] = useState(false);
  const [activationEmail, setActivationEmail] = useState("");
  const [activationError, setActivationError] = useState("");
  const [showBlockedModal, setShowBlockedModal] = useState(false);


  const allowedEmailRegex =
    /^[a-zA-Z0-9._%+-]+@(gmail\.com|luckyfoot\.com|orkut\.com|yahoo\.com)$/;

  const validateForm = () => {
    const newErrors = {};
    const emailRegex =
      /^[a-zA-Z0-9._%+-]+@(gmail\.com|luckyfoot\.com|orkut\.com|yahoo\.com)$/;

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const res = await axios.post("/api/auth/login", formData);
      const userData = res.data.user;

      if (!res.data.success) {
        toast.error(res.data.message);
        return;
      }

      // Handle based on user status
      if (userData.status === "Inactive") {
        setActivationEmail(userData.email);
        setShowActivationModal(true);
        toast.warning("Your account is inactive. Please activate it.");
        return;
      } else if (userData.status === "Blocked") {
  setShowBlockedModal(true);
  return;
}


      // Proceed if status is active
      sessionStorage.setItem(
        "user",
        JSON.stringify({ ...userData, token: res.data.token })
      );
      setUser(userData);
      setIsLogin(true);
      toast.success(res.data.message);

      if (userData.role === "Admin") {
        setIsAdmin(true);
        navigate("/adminDashboard");
      } else {
        navigate("/");
      }

      setFormData({ email: "", password: "" });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Login failed. Please try again.";
      toast.error(errorMessage);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear the error message for this field when user types
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "",
    }));
  };

  useEffect(() => {
    const userData = JSON.parse(sessionStorage.getItem("user"));
    if (userData && userData._id) {
      console.log("User ID:", userData._id); // ✅ will print the user ID
      setUserId(userData._id);
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-2 bg-white p-8 rounded-xl shadow-lg">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 text-center">
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
              className={`mt-1 w-full px-4 py-2 border ${
                errors.email ? "border-red-500" : "border-gray-300"
              } 
              rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50`}
              placeholder="Email"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}

            <input
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className={`mt-1 w-full px-4 py-2 border ${
                errors.password ? "border-red-500" : "border-gray-300"
              }
               rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50`}
              placeholder="Password"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <p className="mt-4 text-center text-sm text-gray-600">
                  <Link
                    to="/Resetpassword"
                    className="text-blue-600 hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 border border-blue-600 rounded-lg text-white bg-blue-600 hover:bg-white hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 font-medium transition"
          >
            Sign in
          </button>
        </form>

        <p className="text-gray-600 text-center">Or continue with</p>

        <div className="grid grid-cols-2 gap-3">
          <button className="w-full py-3 px-4 border border-blue-600 rounded-lg text-white bg-blue-600 hover:bg-white hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 font-medium transition">
            Google
          </button>
          <button className="w-full py-3 px-4 border border-blue-600 rounded-lg text-white bg-blue-600 hover:bg-white hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 font-medium transition">
            Facebook
          </button>
        </div>
        <p className="mt-2 text-center text-gray-600">
          New to Lucky Footwear?{" "}
          <Link to="/register" className="text-blue-600 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
      {showActivationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Activate Your Account
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Enter your email to receive an account activation link.
            </p>
            <input
              type="email"
              value={activationEmail}
              onChange={(e) => {
                const email = e.target.value;
                setActivationEmail(email);

                if (!allowedEmailRegex.test(email)) {
                  setActivationError(
                    "Only Gmail, Luckyfoot, Orkut, or Yahoo emails are allowed."
                  );
                } else {
                  setActivationError("");
                }
              }}
              className={`w-full px-4 py-2 border ${
                activationError ? "border-red-500" : "border-gray-300"
              } rounded-lg focus:ring-2 focus:ring-blue-500`}
              placeholder="Enter your email"
            />
            {activationError && (
              <p className="text-sm text-red-600 mt-1">{activationError}</p>
            )}

            <div className="flex justify-end mt-4 space-x-3">
              <button
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                onClick={() => setShowActivationModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={async () => {
                  if (!allowedEmailRegex.test(activationEmail)) {
                    setActivationError(
                      "Only Gmail, Luckyfoot, Orkut, or Yahoo emails are allowed."
                    );
                    return;
                  }
                    toast.success("Activation link sent to your email.");
                    setShowActivationModal(false);
                     navigate("/");
                  
                }}
              >
                Send Link
              </button>
            </div>
          </div>
        </div>
      )}


      {showBlockedModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
    <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
      <h3 className="text-xl font-semibold text-red-600 mb-3">Account Blocked</h3>
      <p className="text-gray-700 mb-4">
        Your account has been blocked due to suspicious activities.
        Please contact support for assistance.
      </p>
      <div className="flex justify-end space-x-3">
        <button
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
          onClick={() => setShowBlockedModal(false)}
        >
          Cancel
        </button>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => {
            setShowBlockedModal(false);
            navigate("/");
          }}
        >
          Home
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default Login;
