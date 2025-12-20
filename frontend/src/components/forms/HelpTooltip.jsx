import { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';

const HelpTooltip = ({ text, position = 'top' }) => {
  const [isOpen, setIsOpen] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="text-blue-500 hover:text-blue-600 transition-colors focus:outline-none"
        aria-label="Help"
      >
        <HelpCircle className="w-4 h-4" />
      </button>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div
            className={`absolute z-50 w-64 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-xl ${positionClasses[position]}`}
            role="tooltip"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="flex-1">{text}</p>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-300 flex-shrink-0"
                aria-label="Close"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            <div
              className={`absolute w-2 h-2 bg-gray-900 transform rotate-45 ${
                position === 'top' ? 'top-full left-1/2 -translate-x-1/2 -mt-1' :
                position === 'bottom' ? 'bottom-full left-1/2 -translate-x-1/2 -mb-1' :
                position === 'left' ? 'left-full top-1/2 -translate-y-1/2 -ml-1' :
                'right-full top-1/2 -translate-y-1/2 -mr-1'
              }`}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default HelpTooltip;


