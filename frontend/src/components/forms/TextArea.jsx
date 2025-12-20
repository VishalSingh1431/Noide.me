import { useState } from 'react';
import { AlertCircle } from 'lucide-react';

const TextArea = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  error,
  rows = 4,
  ...props
}) => {
  const [focused, setFocused] = useState(false);

  return (
    <div className="w-full">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        required={required}
        rows={rows}
        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 resize-none ${
          error
            ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
            : focused
            ? 'border-blue-500 focus:ring-blue-200'
            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
        }`}
        {...props}
      />
      {error && (
        <div className="mt-1 flex items-center gap-1 text-sm text-red-600">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default TextArea;

