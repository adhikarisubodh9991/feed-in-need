/**
 * Admin Donations Page
 * View and manage all donations
 */

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../lib/axios';
import { formatDateTime, getTimeRemaining, capitalize } from '../../lib/utils';
import Loader from '../../components/Loader';
import { DonationDetailModal } from '../../components/ProfileModal';
import toast from 'react-hot-toast';
import { 
  FiPackage, 
  FiClock,
  FiEye,
  FiTrash2,
  FiCheck,
  FiAlertCircle,
  FiCheckCircle,
  FiXCircle,
  FiFilter
} from 'react-icons/fi';

const AdminDonations = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = searchParams.get('status') || '';
  const approvedFilter = searchParams.get('approved') || '';
  const [selectedDonation, setSelectedDonation] = useState(null);

  useEffect(() => {
    fetchDonations();
  }, [statusFilter, approvedFilter]);

  const fetchDonations = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/donations', {
        params: { 
          status: statusFilter || undefined,
          approved: approvedFilter || undefined,
        },
      });
      setDonations(response.data.data);
    } catch (error) {
      toast.error('Failed to load donations');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id, approved) => {
    setProcessingId(id);
    try {
      await api.put(`/admin/donations/${id}/approve`, { approved });
      toast.success(`Donation ${approved ? 'approved' : 'rejected'} successfully`);
      fetchDonations();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update donation');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this donation?')) return;
    try {
      await api.delete(`/donations/${id}`);
      toast.success('Donation deleted');
      fetchDonations();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete');
    }
  };

  const setFilter = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    setSearchParams(params);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center">
              <FiPackage className="text-primary-600 text-2xl" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">All Donations</h1>
              <p className="text-gray-600">View, approve and manage food donations</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm border border-gray-100 animate-fade-in">
          <div className="flex flex-wrap gap-4 items-center">
            <FiFilter className="text-gray-400" />
            <span className="text-sm font-medium text-gray-600">Approval:</span>
            <button 
              onClick={() => setFilter('approved', '')} 
              className={`filter-pill ${!approvedFilter ? 'filter-pill-active' : 'filter-pill-inactive'}`}
            >
              All
            </button>
            <button 
              onClick={() => setFilter('approved', 'false')} 
              className={`filter-pill ${approvedFilter === 'false' ? 'filter-pill-pending' : 'filter-pill-inactive'}`}
            >
              <FiAlertCircle size={14} /> Pending
            </button>
            <button 
              onClick={() => setFilter('approved', 'true')} 
              className={`filter-pill ${approvedFilter === 'true' ? 'filter-pill-approved' : 'filter-pill-inactive'}`}
            >
              <FiCheck size={14} /> Approved
            </button>
            <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>
            <select 
              value={statusFilter} 
              onChange={(e) => setFilter('status', e.target.value)} 
              className="input-field w-auto py-2"
            >
              <option value="">All Status</option>
              <option value="available">Available</option>
              <option value="requested">Requested</option>
              <option value="claimed">Claimed</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Content */}
        {donations.length === 0 ? (
          <div className="bg-white rounded-2xl text-center py-20 shadow-sm border border-gray-100 animate-fade-in">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiPackage className="text-4xl text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700">No Donations Found</h3>
            <p className="text-gray-500 mt-2">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 animate-fade-in">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Food</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Donor</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Expiry</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Approval</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {donations.map((donation) => {
                    const isExpired = new Date() > new Date(donation.expiryDateTime);
                    return (
                      <tr key={donation._id} className={`hover:bg-gray-50 transition-colors ${!donation.isApproved ? 'bg-yellow-50/50' : ''}`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 relative">
                              {donation.foodPhotos?.length > 0 ? (
                                <>
                                  <img src={donation.foodPhotos[0]} alt={donation.foodTitle} className="w-full h-full object-cover" />
                                  {donation.foodPhotos.length > 1 && (
                                    <span className="absolute bottom-0 right-0 bg-black/60 text-white text-[10px] px-1 rounded-tl">
                                      +{donation.foodPhotos.length - 1}
                                    </span>
                                  )}
                                </>
                              ) : donation.foodPhoto ? (
                                <img src={donation.foodPhoto} alt={donation.foodTitle} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                  <FiPackage />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{donation.foodTitle}</p>
                              <p className="text-sm text-gray-500 truncate max-w-xs">{donation.address}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-gray-900">{donation.donor?.name}</p>
                          <p className="text-sm text-gray-500">{donation.donorPhone}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{donation.quantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-medium ${isExpired ? 'text-red-600' : 'text-primary-600'}`}>
                              {getTimeRemaining(donation.expiryDateTime)}
                            </span>
                            <span className="text-gray-300">•</span>
                            <span className="text-xs text-gray-500">{formatDateTime(donation.expiryDateTime)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {donation.isApproved ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                              <FiCheck size={12} /> Approved
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                              <FiClock size={12} /> Pending
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            isExpired ? 'bg-red-100 text-red-700' :
                            donation.status === 'available' ? 'bg-green-100 text-green-700' :
                            donation.status === 'requested' ? 'bg-blue-100 text-blue-700' :
                            donation.status === 'claimed' ? 'bg-purple-100 text-purple-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {isExpired ? 'Expired' : capitalize(donation.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            {!donation.isApproved && (
                              <>
                                <button 
                                  onClick={() => handleApprove(donation._id, true)} 
                                  disabled={processingId === donation._id}
                                  className="btn-approve disabled:opacity-50"
                                  title="Approve"
                                >
                                  {processingId === donation._id ? (
                                    <Loader size="small" />
                                  ) : (
                                    <>
                                      <FiCheckCircle size={14} /> Approve
                                    </>
                                  )}
                                </button>
                                <button 
                                  onClick={() => handleApprove(donation._id, false)} 
                                  disabled={processingId === donation._id}
                                  className="btn-reject disabled:opacity-50"
                                  title="Reject"
                                >
                                  <FiXCircle size={14} /> Reject
                                </button>
                              </>
                            )}
                            <button 
                              onClick={() => setSelectedDonation(donation)}
                              className="btn-view"
                              title="View"
                            >
                              <FiEye size={14} /> View
                            </button>
                            <button 
                              onClick={() => handleDelete(donation._id)}
                              className="btn-reject"
                              title="Delete"
                            >
                              <FiTrash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedDonation && (
          <DonationDetailModal 
            donation={selectedDonation} 
            onClose={() => setSelectedDonation(null)} 
          />
        )}
      </div>
    </div>
  );
};

export default AdminDonations;
