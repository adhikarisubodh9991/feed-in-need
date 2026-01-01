/**
 * My Donations Page
 * View and manage donor's own donations
 */

import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/axios';
import { formatDateTime, getTimeRemaining, getStatusBadgeClass } from '../lib/utils';
import Loader from '../components/Loader';
import SocialShare from '../components/SocialShare';
import DonationCertificate from '../components/DonationCertificate';
import { QRCodeDisplay } from '../components/QRCode';
import RatingModal from '../components/RatingModal';
import TrustedBadge from '../components/TrustedBadge';
import { useAuth } from '../context/AuthContext';
import { FiPackage, FiClock, FiMapPin, FiPlus, FiTrash2, FiEdit, FiKey, FiUser, FiPhone, FiCheckCircle, FiShare2, FiAward, FiTrendingUp, FiHeart, FiStar } from 'react-icons/fi';
import toast from 'react-hot-toast';

const MyDonationsPage = () => {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [approvedRequest, setApprovedRequest] = useState(null);
  const [loadingCode, setLoadingCode] = useState(false);
  const [loadingCertificate, setLoadingCertificate] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingData, setRatingData] = useState(null);
  const [receiverRatings, setReceiverRatings] = useState(null);
  const [showReceiverReviewsModal, setShowReceiverReviewsModal] = useState(false);
  const [loadingReceiverReviews, setLoadingReceiverReviews] = useState(false);
  const [selectedReceiverInfo, setSelectedReceiverInfo] = useState(null);

  // Calculate donation stats
  const stats = useMemo(() => {
    const total = donations.length;
    const approved = donations.filter(d => d.isApproved).length;
    const pending = donations.filter(d => !d.isApproved).length;
    const completed = donations.filter(d => d.status === 'completed').length;
    const available = donations.filter(d => d.status === 'available' && d.isApproved).length;
    const requested = donations.filter(d => d.status === 'requested').length;
    const claimed = donations.filter(d => d.status === 'claimed').length;
    
    return { total, approved, pending, completed, available, requested, claimed };
  }, [donations]);

  useEffect(() => {
    fetchMyDonations();
  }, []);

  const fetchMyDonations = async () => {
    try {
      const response = await api.get('/donations/user/my');
      setDonations(response.data.data);
    } catch (error) {
      toast.error('Failed to load donations');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this donation?')) return;

    try {
      await api.delete(`/donations/${id}`);
      toast.success('Donation deleted successfully');
      fetchMyDonations();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete donation');
    }
  };

  const showConfirmationCode = async (donation) => {
    setSelectedDonation(donation);
    setShowCodeModal(true);
    setLoadingCode(true);
    
    try {
      const response = await api.get(`/donations/${donation._id}/approved-request`);
      setApprovedRequest(response.data.data);
    } catch (error) {
      toast.error('Failed to load confirmation details');
      setShowCodeModal(false);
    } finally {
      setLoadingCode(false);
    }
  };

  const viewCertificate = async (donation) => {
    setSelectedDonation(donation);
    setShowCertificateModal(true);
    setLoadingCertificate(true);
    setSelectedCertificate(null);
    
    try {
      const response = await api.get(`/certificates/donation/${donation._id}`);
      setSelectedCertificate(response.data.data);
    } catch (error) {
      toast.error('Failed to load certificate');
      setShowCertificateModal(false);
    } finally {
      setLoadingCertificate(false);
    }
  };

  const showReceiverReviews = async (donation) => {
    setSelectedDonation(donation);
    setShowReceiverReviewsModal(true);
    setLoadingReceiverReviews(true);
    setSelectedReceiverInfo(null);
    setReceiverRatings(null);
    
    try {
      const response = await api.get(`/donations/${donation._id}/approved-request`);
      const receiverData = response.data.data?.receiver;
      setSelectedReceiverInfo(receiverData);
      
      // Fetch receiver ratings if receiver info is available
      if (receiverData?._id) {
        try {
          const ratingsResponse = await api.get(`/ratings/user/${receiverData._id}?limit=10`);
          setReceiverRatings(ratingsResponse.data.data);
        } catch (ratingsError) {
          console.error('Failed to load receiver ratings:', ratingsError);
        }
      }
    } catch (error) {
      toast.error('Failed to load receiver reviews');
      setShowReceiverReviewsModal(false);
    } finally {
      setLoadingReceiverReviews(false);
    }
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
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Donations</h1>
            <p className="text-gray-600">Track and manage your food donations</p>
          </div>
          <Link to="/donate" className="btn-primary flex items-center gap-2">
            <FiPlus />
            New Donation
          </Link>
        </div>

        {/* Stats Summary */}
        {donations.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-md p-4 text-center border-l-4 border-blue-500">
              <div className="flex items-center justify-center gap-2 text-blue-600 mb-1">
                <FiPackage />
                <span className="text-2xl font-bold">{stats.total}</span>
              </div>
              <p className="text-sm text-gray-600">Total</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4 text-center border-l-4 border-green-500">
              <div className="flex items-center justify-center gap-2 text-green-600 mb-1">
                <FiCheckCircle />
                <span className="text-2xl font-bold">{stats.approved}</span>
              </div>
              <p className="text-sm text-gray-600">Approved</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4 text-center border-l-4 border-yellow-500">
              <div className="flex items-center justify-center gap-2 text-yellow-600 mb-1">
                <FiClock />
                <span className="text-2xl font-bold">{stats.pending}</span>
              </div>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4 text-center border-l-4 border-teal-500">
              <div className="flex items-center justify-center gap-2 text-teal-600 mb-1">
                <FiTrendingUp />
                <span className="text-2xl font-bold">{stats.available}</span>
              </div>
              <p className="text-sm text-gray-600">Available</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4 text-center border-l-4 border-orange-500">
              <div className="flex items-center justify-center gap-2 text-orange-600 mb-1">
                <FiUser />
                <span className="text-2xl font-bold">{stats.requested}</span>
              </div>
              <p className="text-sm text-gray-600">Requested</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4 text-center border-l-4 border-purple-500">
              <div className="flex items-center justify-center gap-2 text-purple-600 mb-1">
                <FiHeart />
                <span className="text-2xl font-bold">{stats.completed}</span>
              </div>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
          </div>
        )}

        {/* Donations List */}
        {donations.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow">
            <FiPackage className="mx-auto text-6xl text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Donations Yet
            </h3>
            <p className="text-gray-500 mb-6">
              Start sharing food with those in need
            </p>
            <Link to="/donate" className="btn-primary">
              Donate Food
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {donations.map((donation) => {
              const isExpired = new Date() > new Date(donation.expiryDateTime);
              return (
                <div
                  key={donation._id}
                  className="bg-white rounded-xl shadow-md p-6 flex flex-col md:flex-row gap-4"
                >
                  {/* Image */}
                  <div className="w-full md:w-32 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                    {donation.foodPhotos && donation.foodPhotos.length > 0 ? (
                      <>
                        <img
                          src={donation.foodPhotos[0]}
                          alt={donation.foodTitle}
                          className="w-full h-full object-cover"
                        />
                        {donation.foodPhotos.length > 1 && (
                          <span className="absolute bottom-1 right-1 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
                            +{donation.foodPhotos.length - 1}
                          </span>
                        )}
                      </>
                    ) : donation.foodPhoto ? (
                      <img
                        src={donation.foodPhoto}
                        alt={donation.foodTitle}
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
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {donation.foodTitle}
                        </h3>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {/* Approval Status Badge */}
                          {!donation.isApproved && (
                            <span className="badge bg-yellow-100 text-yellow-800">
                              Pending Approval
                            </span>
                          )}
                          {/* Status Badge */}
                          <span
                            className={`badge ${getStatusBadgeClass(
                              isExpired ? 'expired' : donation.status
                            )}`}
                          >
                            {isExpired ? 'Expired' : donation.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {/* Edit button - only show if donation is not claimed/completed */}
                        {/* For unapproved: anyone can edit */}
                        {/* For approved but not claimed: only trusted donors can edit */}
                        {/* For claimed/completed: no one can edit */}
                        {donation.status !== 'claimed' && donation.status !== 'completed' && (
                          (!donation.isApproved || user?.isTrusted) && (
                            <Link
                              to={`/donations/${donation._id}/edit`}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                              title="Edit Donation"
                            >
                              <FiEdit />
                            </Link>
                          )
                        )}
                        {/* Share button - only for COMPLETED donations (receiver has received food) */}
                        {donation.status === 'completed' && (
                          <button
                            onClick={() => {
                              setSelectedDonation(donation);
                              setShowShareModal(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Share on Social Media"
                          >
                            <FiShare2 />
                          </button>
                        )}
                        {/* Certificate button - only for COMPLETED donations (receiver has received food) */}
                        {donation.status === 'completed' && (
                          <button
                            onClick={() => viewCertificate(donation)}
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg"
                            title="View Certificate"
                          >
                            <FiAward />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(donation._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Delete"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                      {donation.foodDescription}
                    </p>

                    <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <FiPackage />
                        {donation.quantity}
                      </span>
                      <span className={`flex items-center gap-1 ${isExpired ? 'text-red-500' : ''}`}>
                        <FiClock />
                        {getTimeRemaining(donation.expiryDateTime)}
                      </span>
                      <span className="flex items-center gap-1">
                        <FiMapPin />
                        {donation.address?.substring(0, 30)}...
                      </span>
                    </div>

                    {donation.claimedBy && (
                      <div className="mt-3 text-sm text-green-600 bg-green-50 p-2 rounded flex items-center gap-2">
                        <FiCheckCircle />
                        Claimed by: {donation.claimedBy.name}
                      </div>
                    )}

                    {/* Show rating option for completed donations where receiver hasn't been rated yet */}
                    {donation.status === 'completed' && donation.completedRequest && !donation.completedRequest.receiverRated && (
                      <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-blue-800 text-sm mb-2">
                          ⭐ Please rate your experience with the receiver to help build trust in our community!
                        </p>
                        <button
                          onClick={() => {
                            setRatingData({
                              requestId: donation.completedRequest._id,
                              receiverName: donation.completedRequest.receiverName || 'Receiver',
                            });
                            setShowRatingModal(true);
                          }}
                          className="flex items-center gap-2 px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                        >
                          <FiStar />
                          Rate Receiver
                        </button>
                      </div>
                    )}

                    {/* Show rated status for completed donations */}
                    {donation.status === 'completed' && donation.completedRequest?.receiverRated && (
                      <div className="mt-3 text-sm text-gray-600 bg-gray-50 p-2 rounded flex items-center gap-2">
                        <FiStar className="text-yellow-500" />
                        You've rated this transaction
                      </div>
                    )}

                    {/* Show pending approval message for requested donations */}
                    {donation.status === 'requested' && (
                      <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-yellow-800 text-sm flex items-center gap-2">
                          <FiClock className="text-yellow-600" />
                          Waiting for admin to approve the food request
                        </p>
                      </div>
                    )}

                    {/* Show Confirmation Code button only after request is approved (claimed status) */}
                    {donation.status === 'claimed' && (
                      <div className="mt-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => showConfirmationCode(donation)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                          >
                            <FiKey />
                            Show Handover Code
                          </button>
                          <button
                            onClick={() => showReceiverReviews(donation)}
                            className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                          >
                            <FiStar />
                            View Receiver Reviews
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Show this code to the receiver when they collect the food
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {/* Social Share Modal */}
      {showShareModal && selectedDonation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 animate-fadeIn">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiShare2 className="text-blue-600 text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Share Your Good Deed! 🎉</h3>
              <p className="text-gray-600 text-sm mt-2">
                Let others know about your contribution
              </p>
            </div>

            {/* Preview Card */}
            <div className="bg-gradient-to-br from-primary-50 to-green-50 rounded-xl p-4 mb-6 border border-primary-100">
              <div className="flex gap-3">
                {selectedDonation.foodPhotos?.[0] && (
                  <img 
                    src={selectedDonation.foodPhotos[0]} 
                    alt={selectedDonation.foodTitle}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{selectedDonation.foodTitle}</h4>
                  <p className="text-sm text-gray-600">{selectedDonation.quantity}</p>
                  <p className="text-xs text-primary-600 mt-1">Donated via Feed In Need</p>
                </div>
              </div>
            </div>

            {/* Share Buttons */}
            <div className="flex justify-center mb-6">
              <SocialShare donation={selectedDonation} user={user} showLabel={false} />
            </div>

            <button
              onClick={() => {
                setShowShareModal(false);
                setSelectedDonation(null);
              }}
              className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      )}
      {/* Confirmation Code Modal */}
      {showCodeModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCodeModal(false);
              setApprovedRequest(null);
            }
          }}
        >
          <div className="bg-white rounded-xl max-w-md w-full p-6 animate-fadeIn my-8 relative max-h-[90vh] overflow-y-auto">
            {/* Close Button - Top Right */}
            <button
              onClick={() => {
                setShowCodeModal(false);
                setApprovedRequest(null);
              }}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
              aria-label="Close"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {loadingCode ? (
              <div className="flex items-center justify-center py-8">
                <Loader size="large" />
              </div>
            ) : approvedRequest ? (
              <>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiKey className="text-blue-600 text-2xl" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Handover Code</h3>
                  <p className="text-gray-600 text-sm mt-2">
                    Share this code with the receiver when they collect the food
                  </p>
                </div>

                {/* Big Code Display */}
                <div className="bg-gray-100 rounded-xl p-4 text-center mb-4">
                  <p className="text-3xl font-mono font-bold tracking-widest text-blue-600">
                    {approvedRequest.confirmationCode}
                  </p>
                </div>

                {/* Receiver Info */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                  <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2 text-sm">
                    Receiver Details
                    {approvedRequest.receiver?.isTrusted && <TrustedBadge size="small" />}
                  </h4>
                  <div className="space-y-1 text-sm">
                    <p className="flex items-center gap-2 text-green-700">
                      <FiUser className="flex-shrink-0" />
                      {approvedRequest.receiver?.name}
                      <span className="text-xs bg-green-200 px-2 py-0.5 rounded">
                        {approvedRequest.receiver?.receiverType}
                      </span>
                    </p>
                    {approvedRequest.receiver?.phone && (
                      <p className="flex items-center gap-2 text-green-700">
                        <FiPhone className="flex-shrink-0" />
                        <a href={`tel:${approvedRequest.receiver.phone}`} className="underline">
                          {approvedRequest.receiver.phone}
                        </a>
                      </p>
                    )}
                  </div>
                  {approvedRequest.message && (
                    <div className="mt-2 pt-2 border-t border-green-200">
                      <p className="text-sm text-green-700">
                        <strong>Their message:</strong> "{approvedRequest.message}"
                      </p>
                    </div>
                  )}
                </div>

                {/* QR Code for receiver to scan */}
                {approvedRequest.qrCodeData && (
                  <div className="text-center mb-4">
                    <p className="text-sm text-gray-600 mb-2">
                      Or let receiver scan this QR code:
                    </p>
                    <div className="flex justify-center">
                      <QRCodeDisplay data={approvedRequest.qrCodeData} size={150} />
                    </div>
                  </div>
                )}

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <p className="text-yellow-800 text-xs">
                    ⚠️ Only share this code/QR when the receiver has physically collected the food. 
                    They will enter/scan this to confirm receipt.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setShowCodeModal(false);
                    setApprovedRequest(null);
                  }}
                  className="w-full px-4 py-2.5 bg-gray-800 text-white rounded-lg hover:bg-gray-900 font-medium"
                >
                  Close
                </button>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">No approved request found</p>
                <button
                  onClick={() => setShowCodeModal(false)}
                  className="mt-4 px-4 py-2 bg-gray-200 rounded-lg"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Donation Certificate Modal */}
      {showCertificateModal && selectedDonation && (
        loadingCertificate ? (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 text-center">
              <Loader size="large" />
              <p className="mt-4 text-gray-600">Loading certificate...</p>
            </div>
          </div>
        ) : selectedCertificate ? (
          <DonationCertificate
            donation={selectedDonation}
            user={user}
            certificate={selectedCertificate}
            onClose={() => {
              setShowCertificateModal(false);
              setSelectedDonation(null);
              setSelectedCertificate(null);
            }}
          />
        ) : (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 text-center max-w-md">
              <FiAward className="mx-auto text-5xl text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Certificate Not Found</h3>
              <p className="text-gray-600 mb-4">The certificate for this donation could not be found.</p>
              <button
                onClick={() => {
                  setShowCertificateModal(false);
                  setSelectedDonation(null);
                }}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        )
      )}
      
      {/* Rating Modal */}
      {showRatingModal && ratingData && (
        <RatingModal
          isOpen={showRatingModal}
          onClose={() => {
            setShowRatingModal(false);
            setRatingData(null);
          }}
          requestId={ratingData.requestId}
          ratingType="donor_to_receiver"
          targetName={ratingData.receiverName}
          onRatingSubmitted={fetchMyDonations}
        />
      )}

      {/* Receiver Reviews Modal */}
      {showReceiverReviewsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 animate-fadeIn max-h-[80vh] overflow-y-auto">
            {loadingReceiverReviews ? (
              <div className="flex items-center justify-center py-8">
                <Loader size="large" />
              </div>
            ) : selectedReceiverInfo ? (
              <>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiStar className="text-yellow-600 text-2xl" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Receiver Reviews</h3>
                  <p className="text-gray-600 text-sm mt-2">
                    Reviews for {selectedReceiverInfo.name}
                  </p>
                </div>

                {/* Receiver Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
                      <FiUser className="text-blue-600 text-xl" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 flex items-center gap-2">
                        {selectedReceiverInfo.name}
                        {selectedReceiverInfo.isTrusted && <TrustedBadge size="small" />}
                      </p>
                      <p className="text-sm text-gray-600">
                        {selectedReceiverInfo.receiverType}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Rating Stats */}
                {receiverRatings && receiverRatings.stats && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <FiStar
                            key={i}
                            className={`w-5 h-5 ${
                              i < Math.round(receiverRatings.stats.averageRating)
                                ? 'text-yellow-500 fill-yellow-500'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-lg font-bold text-gray-900">
                        {receiverRatings.stats.averageRating > 0
                          ? receiverRatings.stats.averageRating.toFixed(1)
                          : 'N/A'}
                      </span>
                    </div>
                    <p className="text-center text-sm text-gray-600">
                      {receiverRatings.stats.totalRatings > 0
                        ? `Based on ${receiverRatings.stats.totalRatings} ${receiverRatings.stats.totalRatings === 1 ? 'review' : 'reviews'}`
                        : 'No reviews yet'}
                    </p>
                  </div>
                )}

                {/* Reviews List */}
                {receiverRatings?.ratings && receiverRatings.ratings.length > 0 ? (
                  <div className="space-y-3 mb-4">
                    <h4 className="font-semibold text-gray-800">All Reviews</h4>
                    {receiverRatings.ratings.map((review) => (
                      <div key={review._id} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <FiStar
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating
                                    ? 'text-yellow-500 fill-yellow-500'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {review.feedback && (
                          <p className="text-sm text-gray-700">"{review.feedback}"</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          - {review.ratedBy?.name || 'Anonymous'}
                          {review.donation?.foodTitle && (
                            <span className="text-gray-400"> • {review.donation.foodTitle}</span>
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <FiStar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No reviews yet for this receiver</p>
                  </div>
                )}

                <button
                  onClick={() => {
                    setShowReceiverReviewsModal(false);
                    setSelectedReceiverInfo(null);
                    setReceiverRatings(null);
                  }}
                  className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Close
                </button>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">No receiver information found</p>
                <button
                  onClick={() => {
                    setShowReceiverReviewsModal(false);
                    setSelectedReceiverInfo(null);
                  }}
                  className="mt-4 px-4 py-2 bg-gray-200 rounded-lg"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyDonationsPage;
