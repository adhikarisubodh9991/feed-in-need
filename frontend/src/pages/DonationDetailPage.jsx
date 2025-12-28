/**
 * Donation Detail Page
 * View single donation with full details
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useAuth } from '../context/AuthContext';
import api from '../lib/axios';
import toast from 'react-hot-toast';
import { 
  FiClock, 
  FiMapPin, 
  FiPhone, 
  FiUser, 
  FiPackage,
  FiMail,
  FiArrowLeft,
  FiCheck,
  FiAlertCircle,
  FiStar
} from 'react-icons/fi';
import { formatDateTime, getTimeRemaining, getStatusBadgeClass } from '../lib/utils';
import Loader from '../components/Loader';
import TrustedBadge from '../components/TrustedBadge';
import L from 'leaflet';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const DonationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isReceiver, isVerifiedReceiver } = useAuth();
  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [donorRatings, setDonorRatings] = useState(null);
  const [loadingRatings, setLoadingRatings] = useState(false);

  useEffect(() => {
    fetchDonation();
  }, [id]);

  const fetchDonation = async () => {
    try {
      const response = await api.get(`/donations/${id}`);
      setDonation(response.data.data);
      // Fetch donor ratings after getting donation
      if (response.data.data.donor?._id) {
        fetchDonorRatings(response.data.data.donor._id);
      }
    } catch (error) {
      toast.error('Failed to load donation details');
      navigate('/donations');
    } finally {
      setLoading(false);
    }
  };

  const fetchDonorRatings = async (donorId) => {
    setLoadingRatings(true);
    try {
      const response = await api.get(`/ratings/user/${donorId}?limit=3`);
      setDonorRatings(response.data.data);
    } catch (error) {
      console.error('Failed to load donor ratings:', error);
    } finally {
      setLoadingRatings(false);
    }
  };

  const handleRequestFood = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to request food');
      navigate('/login');
      return;
    }

    if (!isReceiver) {
      toast.error('Only receivers can request food');
      return;
    }

    if (!isVerifiedReceiver) {
      toast.error('Your account is pending verification');
      return;
    }

    setRequesting(true);
    try {
      await api.post('/requests', {
        donationId: id,
        message: requestMessage,
      });
      toast.success('Food request submitted successfully!');
      setShowRequestModal(false);
      fetchDonation();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit request');
    } finally {
      setRequesting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="large" />
      </div>
    );
  }

  if (!donation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700">Donation not found</h2>
          <Link to="/donations" className="btn-primary mt-4">
            Browse Donations
          </Link>
        </div>
      </div>
    );
  }

  const isExpired = new Date() > new Date(donation.expiryDateTime);
  const canRequest = donation.status === 'available' && !isExpired && isVerifiedReceiver;
  
  // Get photos array (support both old foodPhoto and new foodPhotos)
  const photos = donation.foodPhotos && donation.foodPhotos.length > 0 
    ? donation.foodPhotos 
    : donation.foodPhoto 
      ? [donation.foodPhoto] 
      : [];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
        >
          <FiArrowLeft />
          Back to Donations
        </button>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Image Section with Gallery */}
            <div className="relative h-64 md:h-auto bg-gray-100">
              {photos.length > 0 ? (
                <>
                  <img
                    src={photos[activePhotoIndex]}
                    alt={`${donation.foodTitle} - Photo ${activePhotoIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {/* Photo navigation */}
                  {photos.length > 1 && (
                    <>
                      {/* Thumbnails */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {photos.map((photo, index) => (
                          <button
                            key={index}
                            onClick={() => setActivePhotoIndex(index)}
                            className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                              index === activePhotoIndex 
                                ? 'border-primary-500 ring-2 ring-primary-300' 
                                : 'border-white/50 hover:border-white'
                            }`}
                          >
                            <img 
                              src={photo} 
                              alt={`Thumbnail ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                      {/* Photo counter */}
                      <span className="absolute top-4 left-4 bg-black/60 text-white text-sm px-3 py-1 rounded-full">
                        {activePhotoIndex + 1} / {photos.length}
                      </span>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <FiPackage size={80} />
                </div>
              )}
              <span
                className={`absolute top-4 right-4 badge ${getStatusBadgeClass(
                  isExpired ? 'expired' : donation.status
                )}`}
              >
                {isExpired ? 'Expired' : donation.status}
              </span>
            </div>

            {/* Details Section */}
            <div className="p-6 md:p-8">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                {donation.foodTitle}
              </h1>

              {/* Pending Approval Notice for owner */}
              {!donation.isApproved && user && donation.donor?._id === user._id && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <p className="text-yellow-800 text-sm flex items-center gap-2">
                    <FiAlertCircle />
                    <span>This donation is pending admin approval. It will be visible to receivers once approved.</span>
                  </p>
                </div>
              )}

              <p className="text-gray-600 mb-6">{donation.foodDescription}</p>

              {/* Info Grid */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3">
                  <FiPackage className="text-primary-500" />
                  <span className="text-gray-700">
                    <strong>Quantity:</strong> {donation.quantity}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <FiClock className={isExpired ? 'text-red-500' : 'text-primary-500'} />
                  <span className={isExpired ? 'text-red-600' : 'text-gray-700'}>
                    <strong>Expires:</strong> {formatDateTime(donation.expiryDateTime)}{' '}
                    ({getTimeRemaining(donation.expiryDateTime)})
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <FiMapPin className="text-primary-500 mt-1" />
                  <span className="text-gray-700">
                    <strong>Location:</strong> {donation.address}
                  </span>
                </div>
              </div>

              {/* Donor Info */}
              <div className="border-t pt-4 mb-6">
                <h3 className="font-semibold text-gray-800 mb-3">Donor Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <FiUser className="text-gray-400" />
                    <span className="text-gray-700 flex items-center gap-2">
                      {donation.donor?.name || 'Anonymous'}
                      {donation.donor?.isTrusted && <TrustedBadge size="small" />}
                    </span>
                  </div>
                  {donation.donorPhone && donation.donorPhone !== 'Hidden (Verification required)' && (
                    <div className="flex items-center gap-3">
                      <FiPhone className="text-gray-400" />
                      <a href={`tel:${donation.donorPhone}`} className="text-primary-600 hover:underline">
                        {donation.donorPhone}
                      </a>
                    </div>
                  )}
                  {donation.donorPhone === 'Hidden (Verification required)' && (
                    <div className="flex items-center gap-3 text-yellow-600">
                      <FiAlertCircle />
                      <span className="text-sm">Contact info hidden until verification</span>
                    </div>
                  )}
                  
                  {/* Donor Rating Stats */}
                  {donorRatings && donorRatings.stats && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <FiStar className="text-yellow-500" />
                        <span className="font-medium text-gray-700">
                          {donorRatings.stats.averageRating > 0 
                            ? `${donorRatings.stats.averageRating.toFixed(1)} / 5` 
                            : 'No ratings yet'}
                        </span>
                        {donorRatings.stats.totalRatings > 0 && (
                          <span className="text-sm text-gray-500">
                            ({donorRatings.stats.totalRatings} {donorRatings.stats.totalRatings === 1 ? 'review' : 'reviews'})
                          </span>
                        )}
                      </div>
                      
                      {/* Recent Reviews */}
                      {donorRatings.ratings && donorRatings.ratings.length > 0 && (
                        <div className="space-y-2 mt-2">
                          <p className="text-sm font-medium text-gray-600">Recent Reviews:</p>
                          {donorRatings.ratings.map((review) => (
                            <div key={review._id} className="bg-white p-2 rounded border border-gray-100">
                              <div className="flex items-center gap-1 mb-1">
                                {[...Array(5)].map((_, i) => (
                                  <FiStar
                                    key={i}
                                    className={`w-3 h-3 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                                  />
                                ))}
                                <span className="text-xs text-gray-500 ml-2">
                                  by {review.ratedBy?.name || 'Anonymous'}
                                </span>
                              </div>
                              {review.feedback && (
                                <p className="text-xs text-gray-600">"{review.feedback}"</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {loadingRatings && (
                    <div className="mt-2 text-sm text-gray-500">Loading donor reviews...</div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {canRequest ? (
                  <button
                    onClick={() => setShowRequestModal(true)}
                    className="w-full btn-primary py-3"
                  >
                    Request This Food
                  </button>
                ) : isReceiver && !isVerifiedReceiver ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800 text-sm font-medium mb-1">
                      ⚠️ Account Verification Required
                    </p>
                    <p className="text-yellow-700 text-sm">
                      Only verified accounts can request food. Your account is pending verification by our admin team. This usually takes 24-48 hours.
                    </p>
                  </div>
                ) : !isAuthenticated ? (
                  <Link to="/login" className="block w-full btn-primary py-3 text-center">
                    Login to Request
                  </Link>
                ) : donation.status !== 'available' || isExpired ? (
                  <div className="bg-gray-100 rounded-lg p-4 text-center text-gray-600">
                    This donation is no longer available
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* Map Section */}
          {donation.location?.coordinates && (
            <div className="border-t">
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 mb-3">Pickup Location</h3>
              </div>
              <div className="h-64">
                <MapContainer
                  center={[
                    donation.location.coordinates[1],
                    donation.location.coordinates[0],
                  ]}
                  zoom={15}
                  scrollWheelZoom={false}
                  className="h-full w-full"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker
                    position={[
                      donation.location.coordinates[1],
                      donation.location.coordinates[0],
                    ]}
                  >
                    <Popup>
                      <strong>{donation.foodTitle}</strong>
                      <br />
                      {donation.address}
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 animate-fadeIn">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Request Food</h3>
            
            {/* Show message field only for non-trusted receivers */}
            {!user?.isTrusted && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Why do you need this food? <span className="text-red-500">*</span>
                </label>
                
                {/* Guidance Box */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3 text-sm text-gray-600">
                  <p className="font-medium text-gray-700 mb-2">Please include:</p>
                  <ul className="space-y-1">
                    <li className="flex items-start gap-2">
                      <span className="text-primary-500">•</span>
                      Why you need this food
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary-500">•</span>
                      Who will benefit (yourself, family, organization, etc.)
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary-500">•</span>
                      How many people will be served
                    </li>
                  </ul>
                </div>
                
                <textarea
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  rows={4}
                  placeholder="Write your message here..."
                  className="input-field"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Minimum 20 characters ({requestMessage.length}/500)
                </p>
              </div>
            )}

            {/* Trusted receiver notice */}
            {user?.isTrusted && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <p className="text-green-800 text-sm">
                  ✓ As a trusted user, you can request food without providing additional details.
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowRequestModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestFood}
                disabled={requesting || (!user?.isTrusted && requestMessage.trim().length < 20)}
                className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {requesting ? (
                  <Loader size="small" color="white" />
                ) : (
                  <>
                    <FiCheck />
                    Confirm Request
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonationDetailPage;
