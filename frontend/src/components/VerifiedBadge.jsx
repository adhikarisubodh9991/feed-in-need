/**
 * Verified Badge Component
 * Shows a verified checkmark for approved receivers
 */

import { FiCheckCircle } from 'react-icons/fi';

const VerifiedBadge = ({ size = 'default', showText = false }) => {
  const sizeClasses = {
    small: 'text-sm',
    default: 'text-base',
    large: 'text-lg'
  };

  const iconSizes = {
    small: 14,
    default: 16,
    large: 20
  };

  return (
    <span 
      className={`inline-flex items-center gap-1 text-blue-500 ${sizeClasses[size]}`}
      title="Verified Account"
    >
      <FiCheckCircle 
        size={iconSizes[size]} 
        className="fill-blue-500 text-white"
        style={{ fill: 'currentColor', stroke: 'white', strokeWidth: 2 }}
      />
      {showText && <span className="font-medium">Verified</span>}
    </span>
  );
};

export default VerifiedBadge;
