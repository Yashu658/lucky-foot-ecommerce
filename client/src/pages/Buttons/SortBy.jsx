import React from 'react';
import { FiChevronDown } from 'react-icons/fi';

const SortBy = ({ value, onChange, options, className = '' }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <label htmlFor="sort" className="text-gray-700 mr-2 hidden sm:inline">
        Sort by:
      </label>
      <div className="relative">
        <select
          id="sort"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="appearance-none bg-white border border-gray-300 rounded-md pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <FiChevronDown className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
};

export default SortBy;