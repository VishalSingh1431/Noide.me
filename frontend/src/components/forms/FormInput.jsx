import { useState } from 'react';
import { AlertCircle } from 'lucide-react';

const FormInput = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error,
  icon: Icon,
  ...props
}) => {
  const [focused, setFocused] = useState(false);

  return (
    <div className="w-full">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          required={required}
          className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 text-sm sm:text-base ${
            Icon ? 'pl-10 sm:pl-11' : 'pl-3 sm:pl-4'
          } ${
            error
              ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
              : focused
              ? 'border-blue-500 focus:ring-blue-200'
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
          }`}
          {...props}
        />
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

export default FormInput;

