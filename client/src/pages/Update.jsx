import React, { useState } from "react";
import Container from "../components/Container";
import { FaCheckCircle } from "react-icons/fa";
import { MdCancel } from "react-icons/md";
import { FaCamera } from "react-icons/fa6";
import axios from "../config/api";
import { useAuth } from "../context/authContext";
import { useNavigate } from "react-router-dom";

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

  const handelSave = async () => {
    try {
      const updatedData = new FormData();
      updatedData.append("name", formData.name);
      updatedData.append("phone", formData.phone);
      updatedData.append("dob", formData.dob);
      updatedData.append("gender", formData.gender);
      updatedData.append("profilePic", selectedFile);

      const res = await axios.put("/api/auth/update", updatedData);
      console.log(res.data);
      setUser(res.data.user);
      sessionStorage.setItem("user", JSON.stringify(res.data.user));
      alert(res.data.message);
      navigate("/account");
    } catch (error) {
      console.error("Error Updating profile", error);
    }
  };

  return (
    <Container className="space-y-6 py-8">
      <div className="bg-surface-50 rounded-xl shadow-lg overflow-hidden">
        <div className="bg-primary p-6 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="relative">
              <img
                src={previewImage}
                alt={formData.name}
                className="w-24 h-24 rounded-full border-4 border-surface-50 object-cover"
              />
              <label className="absolute bottom-0 right-0 cursor-pointer">
                <FaCamera className="text-2xl text-primary bg-primary-content rounded-full p-1" />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
            </div>
            <div className="text-primary-content">
              <input
                type="text"
                name="name"
                value={formData.name}
                className="border p-1 rounded"
                onChange={(e) =>
                  setFormData({ ...formData, [e.target.name]: e.target.value })
                }
              />
              <p className="text-primary-content/80">{user.role}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm text-secondary">Email</h3>
                <p className="text-base-content font-medium">{user.email}</p>
              </div>
              <div>
                <h3 className="text-sm text-secondary">Phone</h3>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  className="border p-1 rounded"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      [e.target.name]: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <h3 className="text-sm text-secondary">Date of Birth</h3>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  className="border p-1 rounded"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      [e.target.name]: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm text-secondary">Gender</h3>
                <select
                  name="gender"
                  value={formData.gender}
                  className="border p-1 rounded"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      [e.target.name]: e.target.value,
                    })
                  }
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Others">Others</option>
                </select>
              </div>
              <div>
                <h3 className="text-sm text-secondary">Account Status</h3>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.status === "Active"
                      ? "bg-success/20 text-success"
                      : "bg-error/20 text-error"
                  }`}
                >
                  {user.status}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-surface-200 flex justify-between">
            <button
              className="flex items-center gap-2 text-error hover:text-error-content hover:bg-error font-medium border border-error p-2 rounded"
              onClick={() => navigate("/account")}
            >
              <MdCancel /> Cancel
            </button>
            <button
              className="flex items-center gap-2 text-success hover:text-success-content hover:bg-success font-medium border border-success p-2 rounded"
              onClick={handelSave}
            >
              <FaCheckCircle /> Save
            </button>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default Update;