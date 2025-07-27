import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaShoppingCart, FaUser, FaSearch, FaBoxOpen, FaHeart, FaMapMarkerAlt, FaQuestionCircle, FaSignOutAlt } from "react-icons/fa";
import { FiEdit2 } from "react-icons/fi";
import { useAuth } from "../context/authContext";
import { useCart } from "../context/CartContext";
import { useState } from "react";
import axios from "../config/api";
import toast from "react-hot-toast";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLogin, isAdmin, setUser } = useAuth();
  const { cart, setCart } = useCart();
  const [query, setQuery] = useState("");
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);

  // Check if a nav link is active based on current path
  const isActive = (path) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navItems = [
    { label: "Home", path: "/" },
    { label: "Men", path: "/men" },
    { label: "Women", path: "/women" },
    { label: "Kids", path: "/kids" },
    { label: "Sale", path: "/sale" },
  ];

  const cartIsActive = location.pathname === "/cart";

  const accountTabs = [
    { tab: "My Account", icon: <FiEdit2 size={16} />, label: "My Account" },
    { tab: "orders", icon: <FaBoxOpen size={16} />, label: "Orders" },
    { tab: "wishlist", icon: <FaHeart size={16} />, label: "Wishlist" },
    { tab: "addresses", icon: <FaMapMarkerAlt size={16} />, label: "Saved Addresses" },
    { tab: "help", icon: <FaQuestionCircle size={16} />, label: "Help Center" },
  ];

 
 const handleSearch = async () => {
  const trimmedQuery = query.trim();
   if (!trimmedQuery) {
    toast.error("Please enter a search term");
    return;
  }


  try {
      const response = await axios.get(`/api/public/searchBox`, {
      params: { query: trimmedQuery },
      timeout: 5000 // Add timeout to prevent hanging
    });
     const activeProducts = response.data.results.filter(product => product.status === "active");

        if (response.data.success&& activeProducts.length > 0) {
      navigate("/searchbox", { 
        state: { 
          results: response.data.results,
          query: trimmedQuery 
        } 
      });
    } else {
      navigate("/searchbox", { 
        state: { 
          results: [],
          query: trimmedQuery,
          message: response.data.message || "No products found" 
        } 
      });
    }
    
    // Clear search input
    setQuery("");
  }  catch (error) {
    console.error("Search error:", error);
    let errorMessage = "Failed to perform search";
    
    if (error.response) {
      // Server responded with error status
      errorMessage = error.response.data.message || errorMessage;
    } else if (error.request) {
      // Request was made but no response
      errorMessage = "Network error - please check your connection";
    }
    
    toast.error(errorMessage);
  }
};


  const handleLogout= async () => {
      const confirmed = window.confirm("Are you sure you want to logout?");
      if (!confirmed) return; // user cancelled, so do nothing
  
      try {
        const res = await axios.get("/api/auth/logout");
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("cart"); //  Clear guest cart from localStorage
        setCart([]); //  Clear cart state
        setUser(null);
        toast.success(res.data.message)
        window.location.href = "/";
      } catch (error) {
        console.error(error);
      }
    };

 

  return (
    <nav className="bg-gradient-to-r from-indigo-700 via-blue-800 to-purple-800 shadow-lg sticky top-0 z-[999]">
      <div className="max-w-full mx-auto flex items-center h-20 px-4">
        {/* Logo */}
        <div className="flex items-center cursor-pointer select-none">
          <Link
            to="/"
            className="text-4xl font-extrabold text-yellow-400 tracking-tight hover:drop-shadow-lg transition duration-300"
            aria-label="Lucky Footwear Home"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Lucky&nbsp;
            <span className="text-white font-light tracking-widest">Footwear</span>
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center space-x-12 font-semibold text-white tracking-wider text-lg mx-auto">
          {navItems.map(({ label, path }) => (
            <Link
              key={label}
              to={path}
              className={`relative group px-4 py-3 rounded-md transition ${
                isActive(path) ? "text-yellow-400" : "hover:text-yellow-400"
              }`}
            >
              {label}
              <span
                className={`absolute left-0 -bottom-1 w-full h-1 bg-yellow-400 rounded transition-opacity ${
                  isActive(path)
                    ? "opacity-100"
                    : "opacity-0 group-hover:opacity-100"
                }`}
              ></span>
            </Link>
          ))}
        </div>

        {/* Search Box */}
        <div className="hidden md:flex items-center mx-6 relative">
          <input
            type="text"
            placeholder="Search products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSearch();
              }
            }}
            className="px-4 py-2 w-64 rounded-full bg-gray-200 border-none outline-none text-sm shadow-md focus:ring-2 focus:ring-yellow-400"
          />
          <button
            onClick={handleSearch}
            aria-label="Search"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-yellow-400 hover:text-yellow-500 focus:outline-none"
          >
            <FaSearch className="h-5 w-5" />
          </button>
        </div>

        {/* Cart and User */}
        <div className="flex items-center space-x-6">
          {/* Cart */}
          <div
            onClick={() => {
              if (!isLogin) {
                navigate("/login");
              } else {
                navigate("/cart");
              }
            }}
            className={`cursor-pointer relative group flex items-center px-3 py-2 rounded-md transition ${
              cartIsActive ? "text-yellow-400" : "text-white hover:text-yellow-400"
            }`}
            aria-label="View Cart"
          >
            <FaShoppingCart className="h-8 w-8 drop-shadow-md" />
            {cart.length > 0 && (
              <span className="absolute -top-3 -right-3 bg-yellow-400 text-indigo-900 text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full shadow-lg animate-pulse">
                {cart.length}
              </span>
            )}
            <span
              className={`absolute left-0 -bottom-1 w-full h-1 bg-yellow-400 rounded transition-opacity ${
                cartIsActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              }`}
            ></span>
          </div>

          {/* User with Dropdown */}
          <div 
            className="relative"
            onMouseEnter={() => isLogin && setShowAccountDropdown(true)}
            onMouseLeave={() => isLogin && setShowAccountDropdown(false)}
          >
            <button
              className="flex items-center gap-3 bg-white bg-opacity-25 hover:bg-opacity-50 transition rounded-full px-5 py-2 shadow-lg focus:outline-none"
              onClick={() => {
                if (isLogin) {
                  navigate(isAdmin ? "/adminDashboard" : "/account");
                } else {
                  navigate("/login");
                }
              }}
              aria-label={isLogin ? "User Account" : "Login"}
            >
              {isLogin ? (
                <img
                  src={user.profilePic}
                  alt="User Profile"
                  className="w-8 h-10 rounded-full object-cover border-2 border-yellow-400 shadow-md"
                />
              ) : (
                <FaUser className="w-8 h-8 text-black" />
              )}
              <span className="hidden sm:inline text-black font-semibold tracking-wide select-none text-lg">
                {isLogin ? user.name : "Login"}
              </span>
            </button>

            {/* Account Dropdown */}
            {isLogin && showAccountDropdown && (
              <div className="absolute right-0 mt-0 w-64 bg-white rounded-lg shadow-xl z-50 border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                  <p className="text-sm text-gray-600">{user.name}</p>
                  <p className="font-semibold text-gray-900 truncate">{user.email}</p>
                </div>
                <ul className="py-1">
                  {accountTabs.map(({ tab, icon, label }) => (
                    <li key={tab}>
                      <button
                        onClick={() => {
                          navigate("/account", { state: { tab } });
                          setShowAccountDropdown(false);
                        }}
                        className="flex items-center gap-3 w-full px-4 py-3 text-left text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition"
                      >
                        <span className="text-indigo-600">{icon}</span>
                        <span>{label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="border-t border-gray-200">
                  <button
                    onClick={() => {
                      navigate("/account");
                      setShowAccountDropdown(false);
                    }}
                    className="w-full px-4 py-3 text-left text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition font-semibold"
                  >
                    View Full Account
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 transition flex items-center gap-3"
                  >
                    <FaSignOutAlt className="text-red-500" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;