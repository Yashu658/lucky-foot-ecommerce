import React, { useState } from "react";
import { BsFilter } from "react-icons/bs";
import { Link, useNavigate } from "react-router-dom";



const FilterButton = ({ activeFilters = 0, className = ""}) => {
   const navigate = useNavigate();
    const handleClick = () => {
    navigate("/search");
  };
  return (
    <button
      onClick={handleClick}
      className="relative inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-full shadow-sm hover:bg-gray-100 transition-all duration-200"
    >
      <BsFilter className="mr-2 text-gray-600 text-xl" />
      <span className="text-xl font-medium text-gray-800">Filter</span>

      {activeFilters > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
          {activeFilters}
        </span>
      )}
    </button>
  );
};

export default FilterButton;