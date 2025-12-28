/**
 * Admin Requests Page
 * Manage food requests from receivers
 */

import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../../lib/axios';
import { formatDateTime, getStatusBadgeClass, capitalize } from '../../lib/utils';
import Loader from '../../components/Loader';
import toast from 'react-hot-toast';
import { 
  FiPackage, 
  FiUser, 
  FiPhone, 
  FiMail, 
  FiCheck, 
  FiX,
  FiMessageCircle,
  FiEye,
  FiCheckCircle
} from 'react-icons/fi';

const AdminRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = searchParams.get('status') || '';
  const [reviewNotes, setReviewNotes] = useState('');
  const [showNotesModal, setShowNotesModal] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/requests', {
        params: { status: statusFilter || undefined },
      });
      setRequests(response.data.data);
    } catch (error) {
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async (id, status) => {
    setProcessingId(id);
    try {
      await api.put(`/admin/requests/${id}`, { status, reviewNotes });
      toast.success(`Request ${status} successfully`);
      setShowNotesModal(null);
      setReviewNotes('');
      fetchRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update request');
    } finally {
      setProcessingId(null);
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
    <div className="min-h-screen bg-gray-50">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-primary-600 via-primary-500 to-emerald-500 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center shadow-lg">
                <FiPackage className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Food Requests</h1>
                <p className="text-primary-100">Review and manage food requests</p>
              </div>
            </div>

            {/* Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setSearchParams(e.target.value ? { status: e.target.value } : {})}
              className="px-4 py-2 border border-white/30 rounded-xl bg-white/10 backdrop-blur text-white focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              <option value="" className="text-gray-900">All Status</option>
              <option value="pending" className="text-gray-900">Pending</option>
              <option value="approved" className="text-gray-900">Approved</option>
              <option value="rejected" className="text-gray-900">Rejected</option>
              <option value="completed" className="text-gray-900">Completed</option>
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Requests List */}
        {requests.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiPackage className="text-4xl text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700">
              No Requests Found
            </h3>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div
                key={request._id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Donation Info */}
                  <div className="flex gap-4">
                    <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 relative">
                      {request.donation?.foodPhotos && request.donation.foodPhotos.length > 0 ? (
                        <>
                          <img
                            src={request.donation.foodPhotos[0]}
                            alt={request.donation.foodTitle}
                            className="w-full h-full object-cover"
                          />
                          {request.donation.foodPhotos.length > 1 && (
                            <span className="absolute bottom-1 right-1 bg-black/60 text-white text-xs px-1.5 rounded">
                              +{request.donation.foodPhotos.length - 1}
                            </span>
                          )}
                        </>
                      ) : request.donation?.foodPhoto ? (
                        <img
                          src={request.donation.foodPhoto}
                          alt={request.donation.foodTitle}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <FiPackage size={32} />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {request.donation?.foodTitle}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Qty: {request.donation?.quantity}
                      </p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(request.status)}`}>
                        {capitalize(request.status)}
                      </span>
                    </div>
                  </div>

                  {/* Receiver Info */}
                  <div className="flex-1 border-t lg:border-t-0 lg:border-l pt-4 lg:pt-0 lg:pl-6">
                    <h4 className="font-medium text-gray-700 mb-2">Receiver</h4>
                    <div className="space-y-1 text-sm">
                      <p className="flex items-center gap-2 text-gray-600">
                        <FiUser className="text-gray-400" />
                        {request.receiver?.name}
                        {request.receiver?.verificationStatus === 'approved' ? (
                          <span className="inline-flex items-center gap-1 text-blue-500" title="Verified">
                            <FiCheckCircle size={14} />
                          </span>
                        ) : (
                          <span className={`badge ${getStatusBadgeClass(request.receiver?.verificationStatus)}`}>
                            {capitalize(request.receiver?.verificationStatus)}
                          </span>
                        )}
                      </p>
                      <p className="flex items-center gap-2 text-gray-600">
                        <FiMail className="text-gray-400" />
                        {request.receiver?.email}
                      </p>
                      <p className="flex items-center gap-2 text-gray-600">
                        <FiPhone className="text-gray-400" />
                        {request.receiver?.phone}
                      </p>
                    </div>
                    {request.message && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                        <FiMessageCircle className="inline mr-1 text-gray-400" />
                        "{request.message}"
                      </div>
                    )}
                  </div>

                  {/* Donor Info */}
                  <div className="flex-1 border-t lg:border-t-0 lg:border-l pt-4 lg:pt-0 lg:pl-6">
                    <h4 className="font-medium text-gray-700 mb-2">Donor</h4>
                    <div className="space-y-1 text-sm">
                      <p className="flex items-center gap-2 text-gray-600">
                        <FiUser className="text-gray-400" />
                        {request.donation?.donor?.name}
                      </p>
                      <p className="flex items-center gap-2 text-gray-600">
                        <FiPhone className="text-gray-400" />
                        {request.donation?.donorPhone}
                      </p>
                    </div>
                    <Link
                      to={`/donations/${request.donation?._id}`}
                      className="inline-flex items-center gap-1 mt-2 text-primary-600 text-sm hover:underline"
                    >
                      <FiEye />
                      View Donation
                    </Link>
                  </div>

                  {/* Actions */}
                  {request.status === 'pending' && (
                    <div className="flex lg:flex-col gap-2 lg:justify-center border-t lg:border-t-0 lg:border-l pt-4 lg:pt-0 lg:pl-6">
                      <button
                        onClick={() => setShowNotesModal({ id: request._id, action: 'approved' })}
                        disabled={processingId === request._id}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                      >
                        <FiCheck />
                        Approve
                      </button>
                      <button
                        onClick={() => setShowNotesModal({ id: request._id, action: 'rejected' })}
                        disabled={processingId === request._id}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                      >
                        <FiX />
                        Reject
                      </button>
                    </div>
                  )}
                </div>

                {/* Timestamps */}
                <div className="mt-4 pt-4 border-t text-xs text-gray-500 flex flex-wrap gap-4">
                  <span>Requested: {formatDateTime(request.createdAt)}</span>
                  {request.reviewedAt && (
                    <span>Reviewed: {formatDateTime(request.reviewedAt)}</span>
                  )}
                  {request.reviewNotes && (
                    <span>Note: {request.reviewNotes}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notes Modal */}
      {showNotesModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 animate-fadeIn">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {showNotesModal.action === 'approved' ? 'Approve' : 'Reject'} Request
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                rows={3}
                placeholder="Add any notes..."
                className="input-field"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowNotesModal(null);
                  setReviewNotes('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRequest(showNotesModal.id, showNotesModal.action)}
                disabled={processingId}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-white rounded-lg ${
                  showNotesModal.action === 'approved'
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {processingId ? (
                  <Loader size="small" color="white" />
                ) : (
                  <>
                    {showNotesModal.action === 'approved' ? <FiCheck /> : <FiX />}
                    Confirm
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

export default AdminRequests;
