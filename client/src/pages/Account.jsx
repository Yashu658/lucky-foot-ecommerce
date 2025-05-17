import { useState } from "react";
import Container from "../components/Container";
import { RxExit } from "react-icons/rx";
import { FiEdit2 } from "react-icons/fi";
import { FaTrash } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import axios from "../config/api";
import { useAuth } from "../context/authContext";
import { useNavigate } from "react-router-dom";

const Account = () => {
  const { user, setUser } = useAuth();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const navigate = useNavigate();

  const handelLogout = async () => {
    try {
      const res = await axios.get("/api/auth/logout");
      sessionStorage.removeItem("user");
      setUser(null);
      alert(res.data.message);
      window.location.href = "/";
    } catch (error) {
      console.error(error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleDelete = async () => {
    try {
      const res = await axios.delete("/api/auth/delete");
      sessionStorage.removeItem("user");
      setUser(null);
      alert(res.data.message);
      window.location.href = "/";
    } catch (error) {
      console.error(error);
      alert("Failed to delete account");
    }
  };

  return (
    <Container className="space-y-6 py-8">
      <div className="bg-surface-50 rounded-xl shadow-lg overflow-hidden">
        <div className="bg-primary p-6 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <img
              src={user.profilePic}
              alt={user.name}
              className="w-24 h-24 rounded-full border-4 border-surface-50"
            />
            <div className="text-primary-content">
              <h2 className="text-2xl font-bold">{user.name}</h2>
              <p className="text-primary-content/80">{user.role}</p>
            </div>
          </div>
          <button
            className="border p-2 rounded flex justify-center items-center gap-2 font-bold text-error-content bg-error border-error hover:bg-error-content hover:text-error"
            onClick={handelLogout}
          >
            <RxExit /> Logout
          </button>
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
                <p className="text-base-content font-medium">{user.phone}</p>
              </div>
              <div>
                <h3 className="text-sm text-secondary">Date of Birth</h3>
                <p className="text-base-content font-medium">
                  {formatDate(user.dob)}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm text-secondary">Gender</h3>
                <p className="text-base-content font-medium">{user.gender}</p>
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

          <div className="pt-6 border-t border-surface-200 flex gap-10">
            <button 
              className="flex items-center gap-2 text-primary/60 hover:text-primary font-medium"
              onClick={() => navigate("/update")}
            >
              <FiEdit2 /> Edit Profile
            </button>
            <button 
              className="flex items-center gap-2 text-error/60 hover:text-error font-medium"
              onClick={() => setShowDeleteModal(true)}
            >
              <FaTrash /> Delete Profile
            </button>
          </div>

          {/* Delete Confirmation Modal */}
          {showDeleteModal && (
            <div className="fixed inset-0 bg-secondary flex items-center justify-center z-50">
              <div className="bg-surface-50 rounded-lg p-6 max-w-md w-full mx-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-secondary-content">Delete Account</h3>
                  <button 
                    onClick={() => setShowDeleteModal(false)}
                    className="text-secondary-content hover:text-error"
                  >
                    <IoMdClose size={24} />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <p className="text-secondary-content">
                    Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.
                  </p>
                  
                  <div className="flex justify-end gap-4 pt-4">
                    <button
                      onClick={() => setShowDeleteModal(false)}
                      className="px-4 py-2 rounded border border-secondary-content text-secondary-content hover:bg-secondary-content hover:text-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDelete}
                      className="px-4 py-2 rounded bg-error text-error-content hover:bg-error/90"
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Container>
  );
};

export default Account;