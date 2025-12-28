/**
 * Admin Receivers Page
 * Manage and verify receiver accounts
 */

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../lib/axios';
import { formatDateTime, capitalize } from '../../lib/utils';
import Loader from '../../components/Loader';
import { ReceiverProfileModal } from '../../components/ProfileModal';
import SendMessageModal from '../../components/SendMessageModal';
import toast from 'react-hot-toast';
import { 
  FiUser, 
  FiPhone, 
  FiMail, 
  FiCheckCircle, 
  FiXCircle,
  FiBriefcase,
  FiExternalLink,
  FiEye,
  FiMessageSquare,
  FiAlertCircle,
  FiRefreshCw,
  FiStar,
  FiX
} from 'react-icons/fi';

// Rejection Modal Component
const RejectModal = ({ isOpen, onClose, onConfirm, loading, userName }) => {
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    onConfirm(reason);
    setReason('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <FiAlertCircle className="text-red-600" size={20} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Reject {userName}?</h3>
            <p className="text-sm text-gray-500">Please provide a reason for rejection</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter rejection reason (e.g., Invalid ID proof, Incomplete profile information, etc.)"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
            rows={4}
            required
          />
          <p className="text-xs text-gray-500 mt-1 mb-4">
            This reason will be shown to the user so they can correct their profile and re-apply.
          </p>
          
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                onClose();
                setReason('');
              }}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
              disabled={loading || !reason.trim()}
            >
              {loading ? <Loader size="small" /> : <><FiXCircle size={16} /> Reject</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Remove Trust Modal Component
const RemoveTrustModal = ({ isOpen, onClose, onConfirm, loading, userName }) => {
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (reason.trim().length < 10) {
      toast.error('Please provide a reason (minimum 10 characters)');
      return;
    }
    onConfirm(reason);
    setReason('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
            <FiStar className="text-yellow-600" size={20} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Remove Trusted Badge</h3>
            <p className="text-sm text-gray-500">Remove trusted badge from {userName}</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter reason for removing trusted badge..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 resize-none"
            rows={4}
            required
          />
          <p className="text-xs text-gray-500 mt-1 mb-4">
            Minimum 10 characters ({reason.length}/10)
          </p>
          
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                onClose();
                setReason('');
              }}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
              disabled={loading || reason.trim().length < 10}
            >
              {loading ? <Loader size="small" /> : 'Remove Badge'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminReceivers = () => {
  const [receivers, setReceivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifyingId, setVerifyingId] = useState(null);
  const [trustingId, setTrustingId] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = searchParams.get('status') || '';
  const typeFilter = searchParams.get('type') || '';
  const [selectedReceiver, setSelectedReceiver] = useState(null);
  const [messageUser, setMessageUser] = useState(null);
  const [rejectModal, setRejectModal] = useState({ isOpen: false, receiver: null });
  const [removeTrustModal, setRemoveTrustModal] = useState({ isOpen: false, receiver: null });

  useEffect(() => {
    fetchReceivers();
  }, [statusFilter, typeFilter]);

  const fetchReceivers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/receivers', {
        params: { 
          status: statusFilter || undefined,
        },
      });
      setReceivers(response.data.data);
    } catch (error) {
      toast.error('Failed to load receivers');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id, status, rejectionReason = null) => {
    setVerifyingId(id);
    try {
      const payload = { status };
      if (rejectionReason) {
        payload.rejectionReason = rejectionReason;
      }
      await api.put(`/admin/receivers/${id}/verify`, payload);
      toast.success(`Receiver ${status === 'approved' ? 'approved' : 'rejected'} successfully`);
      setRejectModal({ isOpen: false, receiver: null });
      fetchReceivers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update receiver');
    } finally {
      setVerifyingId(null);
    }
  };

  const openRejectModal = (receiver) => {
    setRejectModal({ isOpen: true, receiver });
  };

  const handleGiveTrusted = async (receiverId) => {
    setTrustingId(receiverId);
    try {
      await api.put(`/admin/users/${receiverId}/trust`);
      toast.success('Trusted badge given successfully');
      fetchReceivers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to give trusted badge');
    } finally {
      setTrustingId(null);
    }
  };

  const handleRemoveTrusted = async (reason) => {
    const receiverId = removeTrustModal.receiver?._id;
    setTrustingId(receiverId);
    try {
      await api.delete(`/admin/users/${receiverId}/trust`, {
        data: { reason }
      });
      toast.success('Trusted badge removed successfully');
      setRemoveTrustModal({ isOpen: false, receiver: null });
      fetchReceivers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove trusted badge');
    } finally {
      setTrustingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getReceiverTypeIcon = (type) => {
    return type === 'organization' ? <FiBriefcase className="text-purple-500" /> : <FiUser className="text-green-500" />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-primary-600 via-primary-500 to-emerald-500 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center shadow-lg">
              <FiUser className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Manage Receivers</h1>
              <p className="text-primary-100">Verify and manage receiver accounts</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-medium text-gray-600 mr-2">Status:</span>
            <button
              onClick={() => setSearchParams({})}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                !statusFilter && !typeFilter
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSearchParams({ status: 'pending' })}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                statusFilter === 'pending'
                  ? 'bg-yellow-500 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setSearchParams({ status: 'approved' })}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                statusFilter === 'approved'
                  ? 'bg-green-500 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Approved
            </button>
            <button
              onClick={() => setSearchParams({ status: 'rejected' })}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                statusFilter === 'rejected'
                  ? 'bg-red-500 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Rejected
            </button>
            
            <div className="h-6 w-px bg-gray-200 mx-2 hidden sm:block"></div>
            
            <span className="text-sm font-medium text-gray-600 mr-2">Type:</span>
            <button
              onClick={() => setSearchParams({ type: 'individual' })}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                typeFilter === 'individual'
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Individual
            </button>
            <button
              onClick={() => setSearchParams({ type: 'organization' })}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                typeFilter === 'organization'
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Organization
            </button>
          </div>
        </div>

        {/* Receivers List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader size="large" />
          </div>
        ) : receivers.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiUser className="text-4xl text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700">No receivers found</h3>
            <p className="text-gray-500 mt-2">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Receiver
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Address
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Documents
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Registered
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {receivers.map((receiver) => (
                    <tr key={receiver._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            {getReceiverTypeIcon(receiver.receiverType)}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 flex items-center gap-2">
                              {receiver.name}
                              {receiver.verificationStatus === 'approved' && (
                                <FiCheckCircle className="text-blue-500" size={14} title="Verified" />
                              )}
                              {receiver.isTrusted && (
                                <FiStar className="text-yellow-500" size={14} title="Trusted User" />
                              )}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <FiMail size={12} />
                              {receiver.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          receiver.receiverType === 'organization' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {receiver.receiverType === 'organization' ? 'Organization' : 'Individual'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          {receiver.phone && (
                            <a href={`tel:${receiver.phone}`} className="flex items-center gap-1 text-gray-600 hover:text-primary-600">
                              <FiPhone size={12} />
                              {receiver.phone}
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 max-w-xs truncate" title={receiver.address || 'N/A'}>
                          {receiver.address || <span className="text-gray-400">—</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          {receiver.idProof && (
                            <a
                              href={receiver.idProof}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs hover:bg-blue-100"
                            >
                              <FiExternalLink size={12} />
                              ID Proof
                            </a>
                          )}
                          {receiver.organizationDoc && (
                            <a
                              href={receiver.organizationDoc}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs hover:bg-blue-100"
                            >
                              <FiExternalLink size={12} />
                              Org Doc
                            </a>
                          )}
                          {!receiver.idProof && !receiver.organizationDoc && (
                            <span className="text-sm text-gray-400">—</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(receiver.verificationStatus)}`}>
                            {capitalize(receiver.verificationStatus)}
                          </span>
                          {receiver.verificationStatus === 'rejected' && (
                            <div className="mt-1 flex items-center gap-1">
                              <FiRefreshCw size={10} className="text-orange-500" />
                              <span className="text-xs text-orange-600">Re-applied</span>
                            </div>
                          )}
                          {receiver.rejectionReason && (
                            <div className="mt-1 max-w-xs">
                              <p className="text-xs text-red-600 truncate" title={receiver.rejectionReason}>
                                Reason: {receiver.rejectionReason}
                              </p>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateTime(receiver.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2 flex-wrap">
                          {/* View Profile Button */}
                          <button
                            onClick={() => setSelectedReceiver(receiver)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-primary-600 bg-primary-50 rounded-xl hover:bg-primary-100 transition-colors"
                            title="View Full Profile"
                          >
                            <FiEye size={14} />
                            View
                          </button>
                          
                          {/* Send Message Button */}
                          <button
                            onClick={() => setMessageUser(receiver)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
                            title="Send Message"
                          >
                            <FiMessageSquare size={14} />
                            Msg
                          </button>
                          
                          {/* Trusted Badge Actions - only for approved receivers */}
                          {receiver.verificationStatus === 'approved' && (
                            <>
                              {receiver.isTrusted ? (
                                <button
                                  onClick={() => setRemoveTrustModal({ isOpen: true, receiver })}
                                  disabled={trustingId === receiver._id}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-amber-600 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors disabled:opacity-50"
                                  title="Remove trusted badge"
                                >
                                  {trustingId === receiver._id ? (
                                    <Loader size="small" />
                                  ) : (
                                    <>
                                      <FiX size={14} />
                                      <FiStar size={14} />
                                    </>
                                  )}
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleGiveTrusted(receiver._id)}
                                  disabled={trustingId === receiver._id}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-amber-600 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors disabled:opacity-50"
                                  title="Give trusted badge"
                                >
                                  {trustingId === receiver._id ? (
                                    <Loader size="small" />
                                  ) : (
                                    <>
                                      <FiStar size={14} />
                                      Trust
                                    </>
                                  )}
                                </button>
                              )}
                            </>
                          )}
                          
                          {receiver.verificationStatus === 'pending' || receiver.verificationStatus === 'rejected' ? (
                            <>
                              <button
                                onClick={() => handleVerify(receiver._id, 'approved')}
                                disabled={verifyingId === receiver._id}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-green-600 bg-green-50 rounded-xl hover:bg-green-100 transition-colors disabled:opacity-50"
                              >
                                {verifyingId === receiver._id ? (
                                  <Loader size="small" />
                                ) : (
                                  <>
                                    <FiCheckCircle size={14} />
                                    Approve
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => openRejectModal(receiver)}
                                disabled={verifyingId === receiver._id}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50"
                              >
                                <FiXCircle size={14} />
                                Reject
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => openRejectModal(receiver)}
                              disabled={verifyingId === receiver._id}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50"
                            >
                              {verifyingId === receiver._id ? (
                                <Loader size="small" />
                              ) : (
                                <>
                                  <FiXCircle size={14} />
                                  Revoke
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Receiver Profile Modal */}
        {selectedReceiver && (
          <ReceiverProfileModal
            receiver={selectedReceiver}
            onClose={() => setSelectedReceiver(null)}
          />
        )}
        
        {/* Send Message Modal */}
        {messageUser && (
          <SendMessageModal
            isOpen={!!messageUser}
            onClose={() => setMessageUser(null)}
            user={messageUser}
            onMessageSent={() => {
              toast.success('Message sent to user');
            }}
          />
        )}

        {/* Rejection Modal */}
        <RejectModal
          isOpen={rejectModal.isOpen}
          onClose={() => setRejectModal({ isOpen: false, receiver: null })}
          onConfirm={(reason) => handleVerify(rejectModal.receiver?._id, 'rejected', reason)}
          loading={verifyingId === rejectModal.receiver?._id}
          userName={rejectModal.receiver?.name}
        />

        {/* Remove Trust Modal */}
        <RemoveTrustModal
          isOpen={removeTrustModal.isOpen}
          onClose={() => setRemoveTrustModal({ isOpen: false, receiver: null })}
          onConfirm={handleRemoveTrusted}
          loading={trustingId === removeTrustModal.receiver?._id}
          userName={removeTrustModal.receiver?.name}
        />
      </div>
    </div>
  );
};

export default AdminReceivers;
