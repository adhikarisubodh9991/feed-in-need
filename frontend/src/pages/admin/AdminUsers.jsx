/**
 * Admin Users Page
 * Manage all users (donors, receivers)
 */

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/axios';
import { formatDateTime, capitalize } from '../../lib/utils';
import Loader from '../../components/Loader';
import toast from 'react-hot-toast';
import { 
  FiUser, 
  FiPhone, 
  FiMail, 
  FiTrash2, 
  FiCheckCircle,
  FiGift,
  FiUsers as FiReceiver,
  FiStar,
  FiX
} from 'react-icons/fi';

const AdminUsers = () => {
  const { isSuperAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [trustingId, setTrustingId] = useState(null);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [removeReason, setRemoveReason] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const roleFilter = searchParams.get('role') || '';

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/users', {
        params: { role: roleFilter || undefined },
      });
      setUsers(response.data.data);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete user "${name}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(id);
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    } finally {
      setDeletingId(null);
    }
  };

  const handleGiveTrusted = async (userId) => {
    setTrustingId(userId);
    try {
      await api.put(`/admin/users/${userId}/trust`);
      toast.success('Trusted badge given successfully');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to give trusted badge');
    } finally {
      setTrustingId(null);
    }
  };

  const openRemoveModal = (user) => {
    setSelectedUser(user);
    setRemoveReason('');
    setShowRemoveModal(true);
  };

  const handleRemoveTrusted = async () => {
    if (!removeReason || removeReason.trim().length < 10) {
      toast.error('Please provide a reason (minimum 10 characters)');
      return;
    }

    setTrustingId(selectedUser._id);
    try {
      await api.delete(`/admin/users/${selectedUser._id}/trust`, {
        data: { reason: removeReason }
      });
      toast.success('Trusted badge removed successfully');
      setShowRemoveModal(false);
      setSelectedUser(null);
      setRemoveReason('');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove trusted badge');
    } finally {
      setTrustingId(null);
    }
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'donor':
        return 'bg-blue-100 text-blue-800';
      case 'receiver':
        return 'bg-green-100 text-green-800';
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'superadmin':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'donor':
        return <FiGift className="text-blue-500" />;
      case 'receiver':
        return <FiReceiver className="text-green-500" />;
      default:
        return <FiUser className="text-gray-500" />;
    }
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
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Manage Users</h1>
              <p className="text-primary-100">View and manage all platform users</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-medium text-gray-600 mr-2">Role:</span>
            <button
              onClick={() => setSearchParams({})}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                !roleFilter
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Users
            </button>
            <button
              onClick={() => setSearchParams({ role: 'donor' })}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                roleFilter === 'donor'
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Donors
            </button>
            <button
              onClick={() => setSearchParams({ role: 'receiver' })}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                roleFilter === 'receiver'
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Receivers
            </button>
          </div>
        </div>

        {/* Users List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader size="large" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiUser className="text-4xl text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700">No users found</h3>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            {getRoleIcon(user.role)}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 flex items-center gap-2">
                              {user.name}
                              {(user.role === 'receiver' || user.role === 'donor') && user.verificationStatus === 'approved' && (
                                <FiCheckCircle className="text-blue-500" size={14} title="Verified" />
                              )}
                              {user.isTrusted && (
                                <FiStar className="text-yellow-500" size={14} title="Trusted User" />
                              )}
                            </div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          {user.phone && (
                            <a href={`tel:${user.phone}`} className="flex items-center gap-1 text-gray-600 hover:text-primary-600">
                              <FiPhone size={12} />
                              {user.phone}
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeClass(user.role)}`}>
                          {capitalize(user.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {(user.role === 'receiver' || user.role === 'donor') ? (
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.verificationStatus === 'approved' 
                              ? 'bg-green-100 text-green-800' 
                              : user.verificationStatus === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {capitalize(user.verificationStatus)}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-500">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateTime(user.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        {user.role === 'superadmin' ? (
                          <span className="text-sm text-purple-500 italic font-medium">Superadmin</span>
                        ) : user.role === 'admin' && !isSuperAdmin ? (
                          <span className="text-sm text-gray-400 italic">Admin</span>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleDelete(user._id, user.name)}
                              disabled={deletingId === user._id}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 disabled:opacity-50"
                            >
                              {deletingId === user._id ? (
                                <Loader size="small" />
                              ) : (
                                <>
                                  <FiTrash2 size={14} />
                                  Delete
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Remove Trusted Badge Modal */}
        {showRemoveModal && selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6 animate-fadeIn">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Remove Trusted Badge</h3>
              <p className="text-gray-600 mb-4">
                You are about to remove the trusted badge from <strong>{selectedUser.name}</strong>.
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for removal <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={removeReason}
                  onChange={(e) => setRemoveReason(e.target.value)}
                  rows={3}
                  placeholder="Explain why you are removing the trusted badge..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Minimum 10 characters ({removeReason.length}/10)
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowRemoveModal(false);
                    setSelectedUser(null);
                    setRemoveReason('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRemoveTrusted}
                  disabled={trustingId === selectedUser._id || removeReason.trim().length < 10}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {trustingId === selectedUser._id ? (
                    <Loader size="small" color="white" />
                  ) : (
                    'Remove Badge'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
