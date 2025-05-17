import { Link, useNavigate } from "react-router-dom";
import { FaShoppingCart, FaUser } from "react-icons/fa";
import { useAuth } from "../context/authContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, isLogin, isAdmin } = useAuth();

  // const handelClick = (e) => {
  //   if (isLogin) {
  //     if (isAdmin) {
  //       navigate("/adminDashboard");
  //     } else {
  //       navigate("/account");
  //     }
  //   } else {
  //     navigate("/login");
  //   }
  // };

  return (
   <nav className="bg-primary-content shadow-md sticky top-0 z-[999]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-surface-900">
              Lucky Footwear
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {["Home", "Men", "Women", "Kids", "Sale"].map((label) => (
              <Link
                key={label}
                to={`/${label.toLowerCase() === "home" ? "" : label.toLowerCase()}`}
                className="text-surface-700 hover:text-primary transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Icons and User */}
          <div className="flex items-center space-x-4">
            <Link to="/cart" className="text-surface-700 hover:text-primary">
              <FaShoppingCart className="h-6 w-6" />
            </Link>

            <button
              className="flex gap-2 items-center hover:text-primary focus:outline-none"
              onClick={() => {
                if (isLogin) {
                  navigate(isAdmin ? "/adminDashboard" : "/account");
                } else {
                  navigate("/login");
                }
              }}
            >
              {isLogin ? (
                <img
                  src={user.profilePic}
                  alt="User Profile"
                  className="border w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <FaUser className="h-6 w-6" />
              )}
              <span className="hidden sm:inline">{isLogin ? user.name : "Login"}</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;