/**
 * Donation Card Component
 * Displays donation information in a card format
 */

import { Link } from 'react-router-dom';
import { FiClock, FiMapPin, FiPackage, FiNavigation } from 'react-icons/fi';
import { getTimeRemaining, getStatusBadgeClass, truncate } from '../lib/utils';

const DonationCard = ({ donation }) => {
  const isExpired = new Date() > new Date(donation.expiryDateTime);
  const timeRemaining = getTimeRemaining(donation.expiryDateTime);

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden card-hover">
      {/* Image */}
      <div className="relative h-48 bg-gray-100">
        {donation.foodPhotos && donation.foodPhotos.length > 0 ? (
          <img
            src={donation.foodPhotos[0]}
            alt={donation.foodTitle}
            className="w-full h-full object-cover"
          />
        ) : donation.foodPhoto ? (
          <img
            src={donation.foodPhoto}
            alt={donation.foodTitle}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <FiPackage size={48} />
          </div>
        )}
        
        {/* Photo count badge */}
        {donation.foodPhotos && donation.foodPhotos.length > 1 && (
          <span className="absolute top-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
            1/{donation.foodPhotos.length}
          </span>
        )}
        
        {/* Status Badge */}
        <span
          className={`absolute top-3 right-3 badge ${getStatusBadgeClass(
            isExpired ? 'expired' : donation.status
          )}`}
        >
          {isExpired ? 'Expired' : donation.status}
        </span>
        
        {/* Distance Badge - shown when sorted by location */}
        {donation.distance && (
          <span className="absolute bottom-3 left-3 bg-primary-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <FiNavigation className="w-3 h-3" />
            {donation.distance} km
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-semibold text-lg text-gray-800 mb-2">
          {donation.foodTitle}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4">
          {truncate(donation.foodDescription, 80)}
        </p>

        <div className="space-y-2 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <FiPackage className="text-primary-500" />
            <span>Quantity: {donation.quantity}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <FiClock className={isExpired ? 'text-red-500' : 'text-primary-500'} />
            <span className={isExpired ? 'text-red-500' : ''}>
              {timeRemaining}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <FiMapPin className="text-primary-500" />
            <span className="truncate">{truncate(donation.address, 30)}</span>
          </div>
        </div>

        {/* Action Button */}
        <Link
          to={`/donations/${donation._id}`}
          className="mt-4 block w-full text-center py-2 bg-primary-50 text-primary-600 font-medium rounded-lg hover:bg-primary-100 transition-colors"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default DonationCard;
