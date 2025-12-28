/**
 * My Requests Page
 * View and manage receiver's food requests
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/axios';
import { formatDateTime, getStatusBadgeClass } from '../lib/utils';
import Loader from '../components/Loader';
import { PickupVerificationModal } from '../components/QRCode';
import RatingModal from '../components/RatingModal';
import { RatingStars } from '../components/Rating';
import TrustedBadge from '../components/TrustedBadge';
import { FiPackage, FiClock, FiX, FiCheck, FiPhone, FiUser, FiKey, FiStar, FiCamera, FiAward } from 'react-icons/fi';
import toast from 'react-hot-toast';

const MyRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingRequest, setRatingRequest] = useState(null);

  useEffect(() => {
    fetchMyRequests();
  }, []);

  const fetchMyRequests = async () => {
    try {
      const response = await api.get('/requests/my');
      setRequests(response.data.data);
    } catch (error) {
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this request?')) return;

    try {
      await api.delete(`/requests/${id}`);
      toast.success('Request cancelled');
      fetchMyRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel request');
    }
  };

  const openVerificationModal = (request) => {
    setSelectedRequest(request);
    setShowVerificationModal(true);
  };

  const handleVerification = async ({ type, value }) => {
    setVerifying(true);
    try {
      let response;
      if (type === 'qr') {
        // Complete via QR code
        response = await api.put('/requests/complete-qr', { qrData: value });
      } else {
        // Complete via manual code
        response = await api.put(`/requests/${selectedRequest._id}/complete`, {
          confirmationCode: value,
        });
      }
      
      toast.success(response.data.message || 'Food pickup confirmed!');
      setShowVerificationModal(false);
      
      // Show rating modal
      setRatingRequest(selectedRequest);
      setShowRatingModal(true);
      
      fetchMyRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const openRatingModal = (request) => {
    setRatingRequest(request);
    setShowRatingModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Requests</h1>
            <p className="text-gray-600">Track your food requests</p>
          </div>
          <Link to="/donations" className="btn-primary">
            Browse Donations
          </Link>
        </div>

        {/* Requests List */}
        {requests.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow">
            <FiPackage className="mx-auto text-6xl text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Requests Yet
            </h3>
            <p className="text-gray-500 mb-6">
              Browse available donations and request food
            </p>
            <Link to="/donations" className="btn-primary">
              Browse Donations
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div
                key={request._id}
                className="bg-white rounded-xl shadow-md p-6"
              >
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Image */}
                  <div className="w-full md:w-32 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {request.donation?.foodPhoto || request.donation?.foodPhotos?.[0] ? (
                      <img
                        src={request.donation.foodPhotos?.[0] || request.donation.foodPhoto}
                        alt={request.donation.foodTitle}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <FiPackage size={32} />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {request.donation?.foodTitle || 'Donation'}
                        </h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`badge ${getStatusBadgeClass(request.status)}`}
                          >
                            {request.status}
                          </span>
                          {request.status === 'approved' && request.reviewNotes?.includes('Auto-approved') && (
                            <span className="text-xs text-amber-600 flex items-center gap-1">
                              <FiAward /> Auto-approved (Trusted)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {request.message && (
                      <p className="text-gray-600 text-sm mb-3">
                        Your message: "{request.message}"
                      </p>
                    )}

                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                      <span className="flex items-center gap-1">
                        <FiClock />
                        Requested: {formatDateTime(request.createdAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <FiPackage />
                        {request.donation?.quantity}
                      </span>
                    </div>

                    {/* Donor Info (only for approved requests) */}
                    {request.status === 'approved' && request.donation?.donor && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-3">
                        <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                          Contact Donor to Collect Food
                          {request.donation.donor.isTrusted && <TrustedBadge size="small" />}
                        </h4>
                        <div className="space-y-1 text-sm">
                          <p className="flex items-center gap-2 text-green-700">
                            <FiUser />
                            {request.donation.donor.name}
                          </p>
                          {request.donation.donorPhone && (
                            <p className="flex items-center gap-2 text-green-700">
                              <FiPhone />
                              <a
                                href={`tel:${request.donation.donorPhone}`}
                                className="underline"
                              >
                                {request.donation.donorPhone}
                              </a>
                            </p>
                          )}
                        </div>
                        <p className="text-xs text-green-600 mt-2">
                          💡 When you arrive, either scan donor's QR code or enter the confirmation code
                        </p>
                      </div>
                    )}

                    {/* Completed - Show rating option */}
                    {request.status === 'completed' && !request.donorRated && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-3">
                        <p className="text-blue-800 text-sm mb-2">
                          ⭐ Please rate your experience with the donor to help build trust in our community!
                        </p>
                        <button
                          onClick={() => openRatingModal(request)}
                          className="flex items-center gap-2 px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                        >
                          <FiStar />
                          Rate Donor
                        </button>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      {request.status === 'pending' && (
                        <button
                          onClick={() => handleCancel(request._id)}
                          className="flex items-center gap-1 px-3 py-1 text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                        >
                          <FiX />
                          Cancel Request
                        </button>
                      )}
                      {request.status === 'approved' && (
                        <button
                          onClick={() => openVerificationModal(request)}
                          className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600"
                        >
                          <FiCamera className="mr-1" />
                          <FiKey />
                          Verify Pickup
                        </button>
                      )}
                      <Link
                        to={`/donations/${request.donation?._id}`}
                        className="px-3 py-1 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        View Details
                      </Link>
                    </div>

                    {/* Review Notes */}
                    {request.reviewNotes && !request.reviewNotes.includes('Auto-approved') && (
                      <div className="mt-3 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        Admin note: {request.reviewNotes}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pickup Verification Modal */}
      <PickupVerificationModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        onVerify={handleVerification}
        isVerifying={verifying}
      />

      {/* Rating Modal */}
      {showRatingModal && ratingRequest && (
        <RatingModal
          isOpen={showRatingModal}
          onClose={() => {
            setShowRatingModal(false);
            setRatingRequest(null);
          }}
          requestId={ratingRequest._id}
          ratingType="receiver_to_donor"
          targetName={ratingRequest.donation?.donor?.name || 'Donor'}
          onRatingSubmitted={fetchMyRequests}
        />
      )}
    </div>
  );
};

export default MyRequestsPage;
