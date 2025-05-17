import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RxDashboard } from 'react-icons/rx';
import { FaUsers, FaBoxes, FaShoppingBag, FaExchangeAlt, FaMoneyBillWave } from 'react-icons/fa';
import { RxExit } from 'react-icons/rx';
import axios from '../config/api';
import { useAuth } from '../context/authContext';
import ProductManagement from '../components/admin/ProductManagement';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
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

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <RxDashboard /> },
    { id: 'customers', label: 'Customers', icon: <FaUsers /> },
    { id: 'products', label: 'Products', icon: <FaBoxes /> },
    { id: 'orders', label: 'Orders', icon: <FaShoppingBag /> },
    { id: 'returns', label: 'Returns', icon: <FaExchangeAlt /> },
    { id: 'transactions', label: 'Transactions', icon: <FaMoneyBillWave /> },
  ];

  return (
    <div className="flex h-screen bg-surface-100">
      {/* Sidebar */}
      <div className="w-50 bg-surface-50 shadow-lg">
        <div className="p-4">
          <h1 className="text-2xl font-bold text-primary">Admin Panel</h1>
        </div>
        
        <nav className="mt-2">
          <div className="px-4 space-y-1 text-sm">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === item.id
                    ? 'bg-primary text-primary-content'
                    : 'text-surface-600 hover:bg-surface-200'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        <div className="absolute bottom-0 w-50 p-4 border-t border-surface-200">
          <button
            onClick={handleLogout}
            className=" flex items-center gap-3 px-4 py-3 rounded-lg text-error hover:bg-error hover:text-error-content transition-colors"
          >
            <RxExit />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="bg-surface-50 rounded-xl shadow-lg p-6 min-h-[calc(100vh-4rem)]">
          {activeTab === 'dashboard' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Dashboard Overview</h2>
              {/* Add dashboard content */}
            </div>
          )}
          {activeTab === 'customers' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Customer Management</h2>
              {/* Add customers content */}
            </div>
          )}
          {activeTab === 'products' && (
            <div>
             <ProductManagement/>
              {/* Add products content */}
            </div>
          )}
          {activeTab === 'orders' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Order Management</h2>
              {/* Add orders content */}
            </div>
          )}
          {activeTab === 'returns' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Returns Management</h2>
              {/* Add returns content */}
            </div>
          )}
          {activeTab === 'transactions' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Transaction History</h2>
              {/* Add transactions content */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;