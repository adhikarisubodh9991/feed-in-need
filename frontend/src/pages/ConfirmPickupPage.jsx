/**
 * Confirm Pickup Page
 * Standalone page for receivers to confirm food pickup via QR code or confirmation code
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiCamera, FiKey, FiCheck, FiPackage, FiX, FiAlertCircle, FiArrowRight, FiClock } from 'react-icons/fi';
import { QRScanner } from '../components/QRCode';
import api from '../lib/axios';
import toast from 'react-hot-toast';
import Loader from '../components/Loader';
import RatingModal from '../components/RatingModal';

const ConfirmPickupPage = () => {
  const [mode, setMode] = useState('select'); // 'select', 'code', 'scan'
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [scanError, setScanError] = useState('');
  const [approvedRequests, setApprovedRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [completedRequest, setCompletedRequest] = useState(null);
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  useEffect(() => {
    fetchApprovedRequests();
  }, []);

  const fetchApprovedRequests = async () => {
    try {
      const response = await api.get('/requests/my');
      // Filter to only show approved requests that are ready for pickup
      const approved = response.data.data.filter(req => req.status === 'approved');
      setApprovedRequests(approved);
    } catch (error) {
      console.error('Failed to load requests:', error);
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    
    setVerifying(true);
    setScanError('');
    
    try {
      const response = await api.put('/requests/complete-by-code', {
        confirmationCode: code.toUpperCase(),
      });
      
      toast.success(response.data.message || 'Food pickup confirmed!');
      setVerificationSuccess(true);
      setCompletedRequest(response.data.data);
      setCode('');
      fetchApprovedRequests();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Verification failed. Please check the code and try again.';
      setScanError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setVerifying(false);
    }
  };

  const handleQRScan = async (qrData) => {
    setVerifying(true);
    setScanError('');
    
    try {
      // Try to parse as JSON (our QR format)
      let parsed;
      try {
        parsed = JSON.parse(qrData);
      } catch {
        setScanError('Invalid QR code format. Please try entering the code manually.');
        setMode('code');
        setVerifying(false);
        return;
      }
      
      if (parsed.type !== 'FEED_IN_NEED_PICKUP') {
        setScanError('Invalid QR code. Please scan the correct pickup QR code.');
        setMode('code');
        setVerifying(false);
        return;
      }
      
      const response = await api.put('/requests/complete-qr', { qrData });
      
      toast.success(response.data.message || 'Food pickup confirmed!');
      setVerificationSuccess(true);
      setCompletedRequest(response.data.data);
      setMode('select');
      fetchApprovedRequests();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Verification failed';
      setScanError(errorMessage);
      toast.error(errorMessage);
      setMode('code');
    } finally {
      setVerifying(false);
    }
  };

  const resetState = () => {
    setVerificationSuccess(false);
    setCompletedRequest(null);
    setMode('select');
    setScanError('');
  };

  // Show scanner in full screen
  if (mode === 'scan') {
    return (
      <QRScanner 
        onScan={handleQRScan}
        onClose={() => setMode('select')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FiCheck className="text-green-500" />
            Confirm Food Pickup
          </h1>
          <p className="text-gray-600 mt-2">
            Verify your food collection by scanning the donor's QR code or entering the confirmation code
          </p>
        </div>

        {/* Success State */}
        {verificationSuccess && completedRequest && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCheck className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Pickup Confirmed!</h2>
            <p className="text-gray-600 mb-6">
              Your food pickup has been successfully verified.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => {
                  setShowRatingModal(true);
                }}
                className="px-6 py-3 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 flex items-center justify-center gap-2"
              >
                ⭐ Rate the Donor
              </button>
              <button
                onClick={resetState}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 flex items-center justify-center gap-2"
              >
                <FiArrowRight />
                Confirm Another Pickup
              </button>
            </div>
          </div>
        )}

        {/* Main Verification Card */}
        {!verificationSuccess && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
            {/* Mode Selection */}
            {mode === 'select' && (
              <div className="p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => setMode('scan')}
                    className="p-6 border-2 border-gray-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all group"
                  >
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-200 transition-colors">
                      <FiCamera className="w-8 h-8 text-primary-600" />
                    </div>
                    <h3 className="font-bold text-gray-800 mb-2">Scan QR Code</h3>
                    <p className="text-sm text-gray-500">
                      Point your camera at the donor's QR code
                    </p>
                  </button>
                  
                  <button
                    onClick={() => setMode('code')}
                    className="p-6 border-2 border-gray-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all group"
                  >
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-200 transition-colors">
                      <FiKey className="w-8 h-8 text-primary-600" />
                    </div>
                    <h3 className="font-bold text-gray-800 mb-2">Enter Code</h3>
                    <p className="text-sm text-gray-500">
                      Type in the 6-character confirmation code
                    </p>
                  </button>
                </div>
              </div>
            )}

            {/* Code Entry Mode */}
            {mode === 'code' && (
              <div className="p-8">
                <button
                  onClick={() => {
                    setMode('select');
                    setScanError('');
                  }}
                  className="text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-1"
                >
                  ← Back
                </button>
                
                {scanError && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                    <FiAlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-red-600 text-sm">{scanError}</p>
                  </div>
                )}
                
                <form onSubmit={handleCodeSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enter Confirmation Code
                    </label>
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => {
                        setCode(e.target.value.toUpperCase());
                        setScanError('');
                      }}
                      placeholder="ABC123"
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-center text-3xl tracking-[0.5em] font-mono uppercase"
                      maxLength={6}
                      disabled={verifying}
                      autoFocus
                    />
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Get this code from the donor
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={code.length < 6 || verifying}
                    className="w-full py-4 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {verifying ? (
                      <>
                        <Loader size="small" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <FiCheck />
                        Confirm Pickup
                      </>
                    )}
                  </button>
                </form>

                <div className="flex items-center my-6">
                  <div className="flex-1 border-t border-gray-200" />
                  <span className="px-3 text-gray-500 text-sm">OR</span>
                  <div className="flex-1 border-t border-gray-200" />
                </div>

                <button
                  onClick={() => setMode('scan')}
                  disabled={verifying}
                  className="w-full py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <FiCamera />
                  Scan QR Code Instead
                </button>
              </div>
            )}
          </div>
        )}

        {/* Pending Approved Requests */}
        {!verificationSuccess && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FiClock className="text-amber-500" />
                Pending Pickups ({approvedRequests.length})
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Your approved requests waiting for pickup verification
              </p>
            </div>
            
            {loadingRequests ? (
              <div className="p-8 flex justify-center">
                <Loader />
              </div>
            ) : approvedRequests.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiPackage className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 mb-4">No pending pickups</p>
                <Link to="/donations" className="text-primary-600 hover:underline">
                  Browse available donations →
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {approvedRequests.map((request) => (
                  <div key={request._id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {request.donation?.foodPhotos?.[0] || request.donation?.foodPhoto ? (
                          <img
                            src={request.donation.foodPhotos?.[0] || request.donation.foodPhoto}
                            alt={request.donation.foodTitle}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <FiPackage size={24} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 truncate">
                          {request.donation?.foodTitle || 'Food Donation'}
                        </h3>
                        <p className="text-sm text-gray-500">
                          From: {request.donation?.donor?.name || 'Donor'}
                        </p>
                        {request.donation?.donorPhone && (
                          <p className="text-sm text-primary-600">
                            📞 {request.donation.donorPhone}
                          </p>
                        )}
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        Ready for Pickup
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Help Section */}
        <div className="mt-6 p-6 bg-blue-50 rounded-xl border border-blue-100">
          <h3 className="font-semibold text-blue-800 mb-2">💡 How to Confirm Pickup</h3>
          <ol className="text-sm text-blue-700 space-y-2 list-decimal list-inside">
            <li>Contact the donor and arrange to meet at the pickup location</li>
            <li>When you meet, ask the donor to show you their QR code or tell you the confirmation code</li>
            <li>Either scan the QR code with your camera or enter the 6-character code above</li>
            <li>Once verified, both you and the donor will receive a confirmation</li>
          </ol>
        </div>
      </div>

      {/* Rating Modal */}
      {showRatingModal && completedRequest && (
        <RatingModal
          isOpen={showRatingModal}
          onClose={() => {
            setShowRatingModal(false);
            resetState();
          }}
          requestId={completedRequest._id || completedRequest.requestId}
          ratingType="receiver_to_donor"
          targetName={completedRequest.donation?.donor?.name || 'Donor'}
          onRatingSubmitted={() => {
            setShowRatingModal(false);
            resetState();
          }}
        />
      )}
    </div>
  );
};

export default ConfirmPickupPage;
