import { useState } from 'react';
import { ChevronDown, AlertCircle } from 'lucide-react';

const categories = [
  'Shop',
  'Restaurant',
  'Hotel',
  'Clinic',
  'Library',
  'Services',
  'Temple',
  'School',
  'College',
  'Gym',
  'Salon',
  'Spa',
  'Pharmacy',
  'Bank',
  'Travel Agency',
  'Real Estate',
  'Law Firm',
  'Accounting',
  'IT Services',
  'Photography',
  'Event Management',
  'Catering',
  'Bakery',
  'Jewelry',
  'Fashion',
  'Electronics',
  'Furniture',
  'Automobile',
  'Repair Services',
  'Education',
  'Healthcare',
  'Beauty',
  'Fitness',
  'Entertainment',
  'Tourism',
  'Food & Beverage',
  'Retail',
  'Wholesale',
  'Manufacturing',
  'Construction',
  'Other'
];

const CategorySelect = ({ label, name, value, onChange, required = false, error }) => {
  const [focused, setFocused] = useState(false);

  return (
    <div className="w-full">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          required={required}
          className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 appearance-none bg-white cursor-pointer ${
            error
              ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
              : focused
              ? 'border-blue-500 focus:ring-blue-200'
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
          }`}
        >
          <option value="">Select a category</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
      </div>
      {error && (
        <div className="mt-1 flex items-center gap-1 text-sm text-red-600">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default CategorySelect;

