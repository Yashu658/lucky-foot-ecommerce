import React, { useEffect, useState } from "react";
import axios from "../../config/api";
import { FiEye, FiSearch, FiPlus } from "react-icons/fi";
import AddCustomerModal from "../Modals/AddCustomerModal";
import EditCustomerModal from "../Modals/EditCustomerModal";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";


const CustomerManagement = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
 




const fetchCustomers = async (query = "") => {
  setLoading(true);
  try {
    const response = await axios.get("/api/customer/getAllUsers", {
      params: { search: query || undefined },
    });
    setCustomers(response.data.customers);
    setError(null);
  } catch (error) {
    console.error("Error fetching customers:", error);
    setError("Failed to load customers.");
    toast.error("Failed to load customers");
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  const delayDebounce = setTimeout(() => {
    fetchCustomers(searchQuery);
  }, 500);

  return () => clearTimeout(delayDebounce);
}, [searchQuery]);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleCustomerAdded = () => {
    fetchCustomers();
    toast.success("Customer added successfully");
  };

  const handleStatusChange = async (customerId, newStatus) => {
    try {
      const response = await axios.put(
        `/api/customer/updateStatusByAdmin/${customerId}`,
        { status: newStatus },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        toast.success(`Status changed to ${newStatus} successfully`);
        fetchCustomers();
      } else {
        toast.error(response.data.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      if (error.response) {
        if (error.response.status === 403) {
          toast.error("Cannot modify admin users");
        } else {
          toast.error(error.response.data.message || "Status update failed");
        }
      } else if (error.request) {
        toast.error("No response from server");
      } else {
        toast.error("Request setup error");
      }
    }
  };

  const filteredCustomers = customers
    .filter((customer) =>{
         const query = searchQuery.toLowerCase();
    return (
      customer.name?.toLowerCase().includes(query) ||
      customer.email?.toLowerCase().includes(query) ||
      customer._id?.toLowerCase().includes(query)
    );
})
    .filter((customer) => {
      if (statusFilter === "All") return true;
      return customer.status === statusFilter;
    });




  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <span className="text-2xl text-blue-700 font-bold">
          Customer Management
        </span>
        <div className="flex gap-4 items-center">
         <div className="relative w-full max-w-sm">
  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
  <input
    type="text"
    placeholder="Search by name, email, or ID"
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    className="pl-10 pr-2 py-1 w-full text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
  />
</div>
          <button
            className="flex items-center text-sm px-2 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-700 transition-colors"
            onClick={() => setIsAddModalOpen(true)}
          >
            <FiPlus /> Add Customer
          </button>
        </div>
      </div>

      {/* Status Filter Buttons */}
      <div className="flex gap-3 mb-4">
        {["All", "Active", "Inactive", "Blocked"].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === status
                ? status === "Active"
                  ? "bg-green-600 text-white"
                  : status === "Inactive"
                  ? "bg-red-600 text-white"
                  : status === "Blocked"
                  ? "bg-gray-800 text-white"
                  : "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading && (
          <div className="py-10 text-center text-gray-500">
            Loading customers...
          </div>
        )}
        {error && (
          <div className="py-10 text-center text-red-600">
            {error}{" "}
            <button
              onClick={fetchCustomers}
              className="text-blue-600 hover:underline"
            >
              Retry
            </button>
          </div>
        )}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <div className="max-h-[500px] overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    {[
                      "Name",
                      "Email",
                      "Phone",
                      "Status",
                      "Role",
                      "Actions",
                    ].map((header) => (
                      <th
                        key={header}
                        className="px-6 py-3 text-left text-sm font-bold text-gray-800 uppercase tracking-wider bg-gray-50"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCustomers.map((customer) => (
                    <tr key={customer._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img
                              className="h-10 w-10 rounded-full"
                              src={
                                customer.profilePic ||
                                `https://ui-avatars.com/api/?name=${customer.name}&background=random`
                              }
                              alt=""
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {customer.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(customer.dob).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {customer.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {customer.phone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            customer.status === "Active"
                              ? "bg-green-100 text-green-800"
                              : customer.status === "Inactive"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {customer.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {customer.role}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex space-x-2">
                          {/* view Button - Always visible */}
                         <button
  className="p-1 text-blue-500 hover:bg-blue-500 hover:text-white rounded"
 onClick={() => navigate(`/customers/${customer._id}`)}
>
  <FiEye size={18} />
</button>


                          {/* Status Action Buttons - Hidden for admins */}
                          {customer.role !== "Admin" && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedCustomer(customer);
                                  setIsEditModalOpen(true);
                                }}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                Edit
                              </button>

                              {/* Activate Button */}
                              {["Inactive", "Blocked"].includes(
                                customer.status
                              ) && (
                                <button
                                  onClick={() =>
                                    handleStatusChange(customer._id, "Active")
                                  }
                                  className="text-green-600 ml-2 hover:text-green-900"
                                >
                                  Activate
                                </button>
                              )}

                              {/* Deactivate Button */}
                              {["Active", "Blocked"].includes(
                                customer.status
                              ) && (
                                <button
                                  onClick={() =>
                                    handleStatusChange(customer._id, "Inactive")
                                  }
                                  className="text-yellow-600 ml-2 hover:text-yellow-900"
                                >
                                  Deactivate
                                </button>
                              )}

                              {/* Block Button */}
                              {["Active", "Inactive"].includes(
                                customer.status
                              ) && (
                                <button
                                  onClick={() =>
                                    handleStatusChange(customer._id, "Blocked")
                                  }
                                  className="text-gray-600 ml-2 hover:text-gray-900"
                                >
                                  Block
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddCustomerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onCustomerAdded={handleCustomerAdded}
      />

      <EditCustomerModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        customerData={selectedCustomer}
        onCustomerUpdated={fetchCustomers}
      />
    </div>
  );
};

export default CustomerManagement;
