/**
 * Profile Modal Component
 * Displays full profile information for donors, receivers, and donations in admin panel
 */

import { FiX, FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiCheckCircle, FiXCircle, FiClock, FiExternalLink, FiPackage, FiCoffee, FiBriefcase } from 'react-icons/fi';
import { formatDateTime, capitalize } from '../lib/utils';

// Donor Profile Modal
export const DonorProfileModal = ({ donor, onClose }) => {
  if (!donor) return null;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return { bg: 'bg-green-100', text: 'text-green-800', icon: <FiCheckCircle className="text-green-600" /> };
      case 'rejected':
        return { bg: 'bg-red-100', text: 'text-red-800', icon: <FiXCircle className="text-red-600" /> };
      default:
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <FiClock className="text-yellow-600" /> };
    }
  };

  const statusBadge = getStatusBadge(donor.verificationStatus);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden animate-fadeIn my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-700 to-gray-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <FiX size={24} />
          </button>
          
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center overflow-hidden">
              {donor.avatar ? (
                <img src={donor.avatar} alt={donor.name} className="w-full h-full object-cover" />
              ) : donor.donorType === 'hotel' ? (
                <FiCoffee size={36} className="text-gray-600" />
              ) : (
                <FiUser size={36} className="text-gray-600" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                {donor.name}
                {donor.verificationStatus === 'approved' && (
                  <FiCheckCircle className="text-yellow-300" title="Verified" />
                )}
              </h2>
              <p className="text-gray-300 capitalize">{donor.donorType === 'hotel' ? 'Hotel/Restaurant' : 'Individual Donor'}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Verification Status */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <span className="text-gray-600 font-medium">Verification Status</span>
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${statusBadge.bg} ${statusBadge.text}`}>
              {statusBadge.icon}
              {capitalize(donor.verificationStatus)}
            </span>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Contact Information</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <FiMail className="text-gray-400" size={20} />
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-gray-900 font-medium">{donor.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <FiPhone className="text-gray-400" size={20} />
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-gray-900 font-medium">{donor.phone || 'Not provided'}</p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <FiMapPin className="text-gray-400 mt-1" size={20} />
              <div>
                <p className="text-xs text-gray-500">Address</p>
                <p className="text-gray-900 font-medium">{donor.address || 'Not provided'}</p>
              </div>
            </div>
          </div>

          {/* Account Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Account Details</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <FiCalendar className="text-gray-400" size={20} />
                <div>
                  <p className="text-xs text-gray-500">Registered On</p>
                  <p className="text-gray-900 font-medium">{formatDateTime(donor.createdAt)}</p>
                </div>
              </div>

              {donor.verifiedAt && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <FiCheckCircle className="text-gray-400" size={20} />
                  <div>
                    <p className="text-xs text-gray-500">Verified On</p>
                    <p className="text-gray-900 font-medium">{formatDateTime(donor.verifiedAt)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ID Proof if available */}
          {donor.idProof && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Documents</h3>
              <a
                href={donor.idProof}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <FiExternalLink size={16} />
                View ID Proof
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Receiver Profile Modal
export const ReceiverProfileModal = ({ receiver, onClose }) => {
  if (!receiver) return null;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return { bg: 'bg-green-100', text: 'text-green-800', icon: <FiCheckCircle className="text-green-600" /> };
      case 'rejected':
        return { bg: 'bg-red-100', text: 'text-red-800', icon: <FiXCircle className="text-red-600" /> };
      default:
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <FiClock className="text-yellow-600" /> };
    }
  };

  const statusBadge = getStatusBadge(receiver.verificationStatus);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden animate-fadeIn my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-700 to-gray-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <FiX size={24} />
          </button>
          
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center overflow-hidden">
              {receiver.avatar ? (
                <img src={receiver.avatar} alt={receiver.name} className="w-full h-full object-cover" />
              ) : receiver.receiverType === 'organization' ? (
                <FiBriefcase size={36} className="text-gray-600" />
              ) : (
                <FiUser size={36} className="text-gray-600" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                {receiver.name}
                {receiver.verificationStatus === 'approved' && (
                  <FiCheckCircle className="text-yellow-300" title="Verified" />
                )}
              </h2>
              <p className="text-gray-300 capitalize">{receiver.receiverType === 'organization' ? 'Organization' : 'Individual Receiver'}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Verification Status */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <span className="text-gray-600 font-medium">Verification Status</span>
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${statusBadge.bg} ${statusBadge.text}`}>
              {statusBadge.icon}
              {capitalize(receiver.verificationStatus)}
            </span>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Contact Information</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <FiMail className="text-gray-400" size={20} />
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-gray-900 font-medium">{receiver.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <FiPhone className="text-gray-400" size={20} />
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-gray-900 font-medium">{receiver.phone || 'Not provided'}</p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <FiMapPin className="text-gray-400 mt-1" size={20} />
              <div>
                <p className="text-xs text-gray-500">Address</p>
                <p className="text-gray-900 font-medium">{receiver.address || 'Not provided'}</p>
              </div>
            </div>
          </div>

          {/* Account Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Account Details</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <FiCalendar className="text-gray-400" size={20} />
                <div>
                  <p className="text-xs text-gray-500">Registered On</p>
                  <p className="text-gray-900 font-medium">{formatDateTime(receiver.createdAt)}</p>
                </div>
              </div>

              {receiver.verifiedAt && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <FiCheckCircle className="text-gray-400" size={20} />
                  <div>
                    <p className="text-xs text-gray-500">Verified On</p>
                    <p className="text-gray-900 font-medium">{formatDateTime(receiver.verifiedAt)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Documents */}
          {(receiver.idProof || receiver.organizationDoc) && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Documents</h3>
              <div className="flex flex-wrap gap-3">
                {receiver.idProof && (
                  <a
                    href={receiver.idProof}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <FiExternalLink size={16} />
                    View ID Proof
                  </a>
                )}
                {receiver.organizationDoc && (
                  <a
                    href={receiver.organizationDoc}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
                  >
                    <FiExternalLink size={16} />
                    View Organization Document
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Donation Detail Modal
export const DonationDetailModal = ({ donation, onClose }) => {
  if (!donation) return null;

  const isExpired = new Date() > new Date(donation.expiryDateTime);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'requested':
        return 'bg-yellow-100 text-yellow-800';
      case 'claimed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStorageLabel = (condition) => {
    switch (condition) {
      case 'room_temperature': return '🌡️ Room Temperature';
      case 'refrigerated': return '❄️ Refrigerated';
      case 'frozen': return '🧊 Frozen';
      case 'hot': return '🔥 Hot/Warm';
      default: return condition;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden animate-fadeIn my-8 max-h-[90vh] overflow-y-auto">
        {/* Header with Photos */}
        <div className="relative">
          {donation.foodPhotos && donation.foodPhotos.length > 0 ? (
            <div className="grid grid-cols-3 gap-1 h-48">
              {donation.foodPhotos.slice(0, 3).map((photo, index) => (
                <img
                  key={index}
                  src={photo}
                  alt={`${donation.foodTitle} ${index + 1}`}
                  className={`w-full h-full object-cover ${index === 0 && donation.foodPhotos.length === 1 ? 'col-span-3' : ''}`}
                />
              ))}
            </div>
          ) : (
            <div className="h-48 bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center">
              <FiPackage className="text-white" size={64} />
            </div>
          )}
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/90 hover:bg-white rounded-full transition-colors shadow-lg"
          >
            <FiX size={24} />
          </button>

          {/* Status badges */}
          <div className="absolute bottom-4 left-4 flex gap-2">
            {donation.isApproved ? (
              <span className="px-3 py-1 bg-green-500 text-white rounded-full text-sm font-medium flex items-center gap-1">
                <FiCheckCircle size={14} />
                Approved
              </span>
            ) : (
              <span className="px-3 py-1 bg-yellow-500 text-white rounded-full text-sm font-medium flex items-center gap-1">
                <FiClock size={14} />
                Pending
              </span>
            )}
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${isExpired ? 'bg-red-500 text-white' : getStatusBadge(donation.status)}`}>
              {isExpired ? 'Expired' : capitalize(donation.status)}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Title and Description */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{donation.foodTitle}</h2>
            <p className="text-gray-600">{donation.foodDescription}</p>
          </div>

          {/* Quick Info */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl text-center">
              <p className="text-xs text-gray-500 mb-1">Quantity</p>
              <p className="text-lg font-semibold text-gray-900">{donation.quantity}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl text-center">
              <p className="text-xs text-gray-500 mb-1">Storage</p>
              <p className="text-lg font-semibold text-gray-900">{getStorageLabel(donation.storageCondition)}</p>
            </div>
            <div className={`p-4 rounded-xl text-center ${isExpired ? 'bg-red-50' : 'bg-gray-50'}`}>
              <p className="text-xs text-gray-500 mb-1">Expires</p>
              <p className={`text-lg font-semibold ${isExpired ? 'text-red-600' : 'text-gray-900'}`}>
                {formatDateTime(donation.expiryDateTime)}
              </p>
            </div>
          </div>

          {/* Donor Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Donor Information</h3>
            
            <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                <FiUser className="text-blue-600" size={24} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 flex items-center gap-2">
                  {donation.donor?.name || 'Unknown'}
                  {donation.donor?.verificationStatus === 'approved' && (
                    <FiCheckCircle className="text-blue-500" size={16} />
                  )}
                </p>
                <p className="text-sm text-gray-600">{donation.donor?.email}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium text-gray-900">{donation.donorPhone}</p>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Pickup Location</h3>
            
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
              <FiMapPin className="text-gray-400 mt-1" size={20} />
              <div>
                <p className="text-gray-900 font-medium">{donation.address || 'Address not provided'}</p>
                {donation.location?.coordinates && (
                  <p className="text-sm text-gray-500 mt-1">
                    Coordinates: {donation.location.coordinates[1].toFixed(6)}, {donation.location.coordinates[0].toFixed(6)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          {donation.notes && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Additional Notes</h3>
              <p className="text-gray-600 p-4 bg-gray-50 rounded-xl">{donation.notes}</p>
            </div>
          )}

          {/* Claimed By (if applicable) */}
          {donation.claimedBy && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Claimed By</h3>
              
              <div className="flex items-center gap-4 p-4 bg-green-50 rounded-xl">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                  <FiUser className="text-green-600" size={24} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{donation.claimedBy?.name || 'Unknown'}</p>
                  <p className="text-sm text-gray-600">{donation.claimedBy?.email}</p>
                </div>
                {donation.claimedBy?.phone && (
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium text-gray-900">{donation.claimedBy.phone}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="flex justify-between text-sm text-gray-500 pt-4 border-t">
            <span>Created: {formatDateTime(donation.createdAt)}</span>
            <span>Updated: {formatDateTime(donation.updatedAt)}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default { DonorProfileModal, ReceiverProfileModal, DonationDetailModal };
