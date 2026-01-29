import { BadgeCheck, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

export const VerifiedBadge = ({ size = 'md', className = '', showTooltip = true, explanation = 'This business has been verified by NoidaHub. All information is authentic and verified.' }) => {
  const [showTooltipState, setShowTooltipState] = useState(false);
  
  const sizes = {
    sm: { icon: 'w-3 h-3', text: 'text-[10px]', padding: 'px-1.5 py-0.5', gap: 'gap-0.5' },
    md: { icon: 'w-4 h-4', text: 'text-xs', padding: 'px-2 py-1', gap: 'gap-1' },
    lg: { icon: 'w-5 h-5', text: 'text-sm', padding: 'px-3 py-1.5', gap: 'gap-1.5' },
  };

  const sizeClasses = sizes[size];

  return (
    <div className="relative inline-block">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        onMouseEnter={() => showTooltip && setShowTooltipState(true)}
        onMouseLeave={() => setShowTooltipState(false)}
        className={`inline-flex items-center ${sizeClasses.gap} ${sizeClasses.padding} bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full ${sizeClasses.text} font-bold shadow-lg hover:shadow-xl transition-all duration-300 cursor-help group ${className}`}
        title="Verified Business"
      >
        <BadgeCheck className={sizeClasses.icon} />
        <span>Verified</span>
      </motion.div>

      {/* Enhanced Tooltip */}
      {showTooltip && showTooltipState && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 5 }}
          className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-2xl z-50 pointer-events-none"
        >
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-white mb-1">Verified Business</div>
              <div className="text-gray-300 leading-relaxed">{explanation}</div>
            </div>
          </div>
          {/* Tooltip Arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
            <div className="w-2 h-2 bg-gray-900 transform rotate-45"></div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

