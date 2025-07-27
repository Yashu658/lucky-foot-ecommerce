import { useState } from 'react';
import { Link } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Resetpassword = () => {

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
   const [formData, setFormData] = useState({ email: "" });
   const [errors, setErrors] = useState({});


     const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


const validateForm = () => {
    const newErrors = {};
      const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|orkut\.com|yahoo\.com)$/;

     if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetClick = () => {
     e.preventDefault(); // Prevent form submit reload
    if (!validateForm()) return;
    toast.success('Reset instructions sent successfully!', {
      position: "top-center",
    });
    setLoading(true);
    setTimeout(() => {
      navigate('/');
    }, 6000); 
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold text-center ">
            Reset Your Password
          </h2>
          <div className="flex gap-5 px-4 py-4 ">
            <p className="mt-2 text-center text-l text-gray-400">
              Enter the email associated with your account and we'll send you password reset instructions
            </p>
          </div>
          <form onSubmit={handleResetClick} className="mt-6">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
               onChange={handleChange}
              className="w-full p-3 border rounded mb-4"
              required
            />
            {errors.email && <p className="text-red-500 text-sm mb-2">{errors.email}</p>}

            <button 
             type="submit"
             className="w-full bg-blue-600 text-white p-3 rounded-2xl hover:bg-blue-700 transition"
             onClick={handleResetClick}
             disabled={loading}>
              Send Reset Instructions
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-600">
              <Link to="/login" className="text-blue-600 hover:underline">
                Return to Login Page
              </Link>
            </p>
        </div>
      </div>
    </>
  );
};

export default Resetpassword;
