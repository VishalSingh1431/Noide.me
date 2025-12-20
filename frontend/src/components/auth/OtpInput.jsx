import { useRef, useEffect } from 'react';

const OtpInput = ({ value, onChange, disabled = false, error }) => {
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs[0].current) {
      inputRefs[0].current.focus();
    }
  }, []);

  const handleChange = (index, e) => {
    const input = e.target;
    const newValue = input.value.replace(/[^0-9]/g, ''); // Only allow numbers

    if (newValue.length > 1) {
      // If pasted multiple digits, distribute them
      const digits = newValue.split('').slice(0, 4);
      const currentOtp = value || '';
      const newOtp = currentOtp.split('').slice(0, 4);
      // Pad to 4 characters
      while (newOtp.length < 4) {
        newOtp.push('');
      }
      digits.forEach((digit, i) => {
        if (index + i < 4) {
          newOtp[index + i] = digit;
        }
      });
      onChange(newOtp.join(''));
      
      // Focus the last filled input or next empty
      const nextIndex = Math.min(index + digits.length, 3);
      if (inputRefs[nextIndex].current) {
        inputRefs[nextIndex].current.focus();
      }
      return;
    }

    const currentOtp = value || '';
    const newOtp = currentOtp.split('').slice(0, 4);
    // Pad to 4 characters
    while (newOtp.length < 4) {
      newOtp.push('');
    }
    newOtp[index] = newValue;
    onChange(newOtp.join(''));

    // Auto-focus next input
    if (newValue && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 4);
    if (pastedData.length > 0) {
      const newOtp = [];
      pastedData.split('').forEach((digit, i) => {
        if (i < 4) {
          newOtp[i] = digit;
        }
      });
      // Pad to 4 characters
      while (newOtp.length < 4) {
        newOtp.push('');
      }
      onChange(newOtp.join(''));
      const nextIndex = Math.min(pastedData.length, 3);
      inputRefs[nextIndex].current?.focus();
    }
  };

  return (
    <div className="w-full">
      <div className="flex gap-3 justify-center">
        {[0, 1, 2, 3].map((index) => (
          <input
            key={index}
            ref={inputRefs[index]}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={value[index] || ''}
            onChange={(e) => handleChange(index, e)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            disabled={disabled}
            className={`w-14 h-14 text-center text-2xl font-bold border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
              error
                ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
            } ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
          />
        ))}
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600 text-center">{error}</p>
      )}
    </div>
  );
};

export default OtpInput;

