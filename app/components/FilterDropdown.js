"use client";

import { FaFilter } from "react-icons/fa";

export default function FilterDropdown({ 
  value, 
  onChange, 
  options = [],
  label = "Filter",
  placeholder = "Select...",
  className = "" 
}) {
  return (
    <div className={`${className}`}>
      <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
        <FaFilter className="mr-2 text-gray-500" />
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md appearance-none cursor-pointer text-gray-700"
        >
          <option value="">{placeholder}</option>
          {options.map((option, index) => (
            <option key={index} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
}
