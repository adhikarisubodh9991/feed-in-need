/**
 * Trusted Badge Component
 * Shows a trusted badge for users with successful donation/receive history
 */

import { FiShield, FiAward } from 'react-icons/fi';

const TrustedBadge = ({ size = 'default', showText = false, variant = 'gold', userRole = null }) => {
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

  const variantClasses = {
    gold: 'text-amber-500',
    silver: 'text-gray-400',
    bronze: 'text-orange-600',
  };

  // Get appropriate label based on user role
  const getBadgeText = () => {
    if (userRole === 'donor') return 'Trusted Donor';
    if (userRole === 'receiver') return 'Trusted Receiver';
    return 'Trusted';
  };

  return (
    <span 
      className={`inline-flex items-center gap-1 ${variantClasses[variant]} ${sizeClasses[size]}`}
      title="Trusted User - Auto-approved donations/requests"
    >
      <FiAward 
        size={iconSizes[size]} 
        className="fill-current"
      />
      {showText && <span className="font-medium">{getBadgeText()}</span>}
    </span>
  );
};

export default TrustedBadge;
