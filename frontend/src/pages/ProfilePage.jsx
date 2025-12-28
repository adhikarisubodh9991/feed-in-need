/**
 * Profile Page
 * User profile management with avatar upload
 */

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/axios';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiPhone, FiMapPin, FiLock, FiSave, FiShield, FiCamera, FiUpload, FiStar, FiAward, FiRefreshCw } from 'react-icons/fi';
import Loader from '../components/Loader';
import VerifiedBadge from '../components/VerifiedBadge';
import TrustedBadge from '../components/TrustedBadge';
import { RatingStars, RatingSummary } from '../components/Rating';
import { capitalize, getStatusBadgeClass } from '../lib/utils';

// Re-verification Request Button Component
const ReverificationButton = ({ rejectionReason }) => {
  const [requesting, setRequesting] = useState(false);
  const { refreshUser } = useAuth();

  const handleRequestReverification = async () => {
    setRequesting(true);
    try {
      await api.post('/auth/request-reverification');
      toast.success('Re-verification request submitted! An admin will review your profile.');
      // Refresh user data to update verification status
      if (refreshUser) {
        await refreshUser();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to request re-verification');
    } finally {
      setRequesting(false);
    }
  };

  return (
    <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
      <div className="flex items-start gap-3">
        <FiShield className="text-amber-600 text-xl mt-0.5" />
        <div className="flex-1">
          <h4 className="font-semibold text-amber-800">Verification Rejected</h4>
          {rejectionReason && (
            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm font-medium text-red-800">Rejection Reason:</p>
              <p className="text-sm text-red-700 mt-1">{rejectionReason}</p>
            </div>
          )}
          <p className="text-sm text-amber-700 mt-2">
            Please fix the issues mentioned above and update your profile, 
            then click the button below to request re-verification.
          </p>
          <button
            onClick={handleRequestReverification}
            disabled={requesting}
            className="mt-3 flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {requesting ? (
              <>
                <Loader size="small" color="white" />
                Requesting...
              </>
            ) : (
              <>
                <FiRefreshCw />
                Request Re-verification
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Ratings Tab Component
const RatingsTab = ({ userId }) => {
  const [ratingStats, setRatingStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRatingStats = async () => {
      try {
        const response = await api.get('/ratings/my-stats');
        setRatingStats(response.data.data);
      } catch (error) {
        console.error('Failed to fetch rating stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRatingStats();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader size="large" />
      </div>
    );
  }

  if (!ratingStats) {
    return (
      <div className="text-center py-8 text-gray-500">
        Failed to load rating statistics
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="text-center">
        <div className="text-5xl font-bold text-gray-800 mb-2">
          {ratingStats.averageRating?.toFixed(1) || '0.0'}
        </div>
        <RatingStars rating={ratingStats.averageRating || 0} size="large" />
        <p className="text-gray-600 mt-2">
          Based on {ratingStats.totalRatings || 0} {ratingStats.totalRatings === 1 ? 'review' : 'reviews'}
        </p>
      </div>

      {/* Trusted Badge Progress */}
      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <FiAward className="text-amber-500 text-2xl" />
          <h3 className="font-bold text-amber-800">Trusted Badge Progress</h3>
        </div>
        
        {ratingStats.isTrusted ? (
          <div className="bg-green-100 text-green-800 rounded-lg p-4 text-center">
            <FiAward className="inline text-2xl mb-2" />
            <p className="font-semibold">🎉 You've earned the Trusted Badge!</p>
            <p className="text-sm mt-1">Your donations/requests are auto-approved.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-amber-700">
              Complete {ratingStats.trustedBadgeRequirements?.minTransactions || 3} successful transactions 
              with an average rating of {ratingStats.trustedBadgeRequirements?.minRating || 4.0}+ to earn the Trusted Badge!
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-amber-600">
                  {(ratingStats.successfulDonations || 0) + (ratingStats.successfulReceives || 0)}
                  <span className="text-sm text-gray-400">/{ratingStats.trustedBadgeRequirements?.minTransactions || 3}</span>
                </div>
                <p className="text-xs text-gray-600">Successful Transactions</p>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-amber-600">
                  {ratingStats.averageRating?.toFixed(1) || '0.0'}
                  <span className="text-sm text-gray-400">/{ratingStats.trustedBadgeRequirements?.minRating || 4.0}</span>
                </div>
                <p className="text-xs text-gray-600">Average Rating</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Rating Breakdown */}
      {ratingStats.ratingBreakdown && Object.keys(ratingStats.ratingBreakdown).length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">Rating Breakdown</h3>
          <RatingSummary 
            averageRating={ratingStats.averageRating} 
            totalRatings={ratingStats.totalRatings}
            breakdown={ratingStats.ratingBreakdown}
          />
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{ratingStats.ratingsGiven || 0}</div>
          <p className="text-sm text-blue-700">Ratings Given</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{ratingStats.ratingsReceived || 0}</div>
          <p className="text-sm text-green-700">Ratings Received</p>
        </div>
        {ratingStats.successfulDonations > 0 && (
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{ratingStats.successfulDonations}</div>
            <p className="text-sm text-purple-700">Successful Donations</p>
          </div>
        )}
        {ratingStats.successfulReceives > 0 && (
          <div className="bg-orange-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{ratingStats.successfulReceives}</div>
            <p className="text-sm text-orange-700">Successful Receives</p>
          </div>
        )}
      </div>
    </div>
  );
};

const ProfilePage = () => {
  const { user, loading: authLoading, updateProfile, updateAvatar, changePassword, login } = useAuth();
  const fileInputRef = useRef(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  
    // On mount, refresh user data from backend if logged in
    useEffect(() => {
      const refreshUser = async () => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        if (token && storedUser) {
          try {
            // Re-login to refresh user data
            const parsedUser = JSON.parse(storedUser);
            await login(parsedUser.email, null); // null password triggers token-based fetch
          } catch (e) {
            // Ignore errors, fallback to existing user
          }
        }
      };
      refreshUser();
      // eslint-disable-next-line
    }, []);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  // Wait for user to load
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="large" />
      </div>
    );
  }

  // Show error if user is not loaded
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Profile Not Found</h2>
          <p className="text-gray-600 mb-4">Unable to load your profile. Please try logging in again.</p>
          <a href="/login" className="btn-primary">Go to Login</a>
        </div>
      </div>
    );
  }

  const [profileData, setProfileData] = useState({
    name: user?.name ?? '',
    phone: user?.phone ?? '',
    address: user?.address ?? '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setAvatarUploading(true);

    try {
      const formData = new FormData();
      formData.append('avatar', file);
      await updateAvatar(formData);
      toast.success('Profile picture updated!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile picture');
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateProfile(profileData);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      toast.success('Password changed successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          {/* Avatar with Upload */}
          <div className="relative inline-block">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/*"
              className="hidden"
            />
            <div 
              onClick={handleAvatarClick}
              className="w-28 h-28 rounded-full mx-auto mb-4 cursor-pointer relative group overflow-hidden border-4 border-gray-200 shadow-lg"
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <FiUser className="text-gray-500 text-5xl" />
                </div>
              )}
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {avatarUploading ? (
                  <Loader size="small" color="white" />
                ) : (
                  <FiCamera className="text-white text-2xl" />
                )}
              </div>
            </div>
            {/* Upload button hint */}
            <button
              type="button"
              onClick={handleAvatarClick}
              disabled={avatarUploading}
              className="absolute -bottom-1 right-1/2 transform translate-x-1/2 bg-gray-600 text-white p-2 rounded-full shadow-lg hover:bg-gray-700 transition-colors"
            >
              <FiCamera className="text-sm" />
            </button>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
            {user?.name}
            {(user?.role === 'receiver' || user?.role === 'donor') && user?.verificationStatus === 'approved' && (
              <VerifiedBadge size="large" />
            )}
          </h1>
          <p className="text-gray-600">{user?.email}</p>
          
          {/* Trusted Badge - shown prominently below name */}
          {user?.isTrusted && (
            <div className="mt-2">
              <TrustedBadge size="large" showText userRole={user?.role} />
            </div>
          )}
          
          {/* Rating Display - hidden for admins */}
          {user?.totalRatings > 0 && user?.role !== 'admin' && user?.role !== 'superadmin' && (
            <div className="mt-2 flex items-center justify-center gap-2">
              <RatingStars rating={user.averageRating || 0} size="default" />
              <span className="text-sm text-gray-600">
                ({user.totalRatings} {user.totalRatings === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          )}
          
          <div className="mt-2 flex items-center justify-center gap-2">
            <span className="badge badge-available">{capitalize(user?.role)}</span>
            {(user?.role === 'receiver' || user?.role === 'donor') && user?.verificationStatus !== 'approved' && (
              <span className={`badge ${getStatusBadgeClass(user?.verificationStatus)}`}>
                {capitalize(user?.verificationStatus)}
              </span>
            )}
          </div>

          {/* Donor-specific info */}
          {user?.role === 'donor' && (
            <div className="mt-4 space-y-1">
              <div className="text-sm text-gray-700">
                <strong>Donor Type:</strong> {user?.donorType === 'hotel' ? 'Hotel/Restaurant' : 'Individual'}
              </div>
              <div className="text-sm text-gray-700">
                <strong>Verification Status:</strong> {capitalize(user?.verificationStatus ?? '') || 'N/A'}
              </div>
              {user?.address && (
                <div className="text-sm text-gray-700 flex items-start gap-1">
                  <FiMapPin className="text-primary-500 mt-0.5 flex-shrink-0" />
                  <span>{user.address}</span>
                </div>
              )}
              {/* Re-verification Request Button for Donors */}
              {user?.verificationStatus === 'rejected' && (
                <ReverificationButton rejectionReason={user?.rejectionReason} />
              )}
            </div>
          )}

          {/* Receiver-specific info */}
          {user?.role === 'receiver' && (
            <div className="mt-4 space-y-1">
              <div className="text-sm text-gray-700">
                <strong>Receiver Type:</strong> {capitalize(user?.receiverType ?? '') || 'N/A'}
              </div>
              <div className="text-sm text-gray-700">
                <strong>Verification Status:</strong> {capitalize(user?.verificationStatus ?? '') || 'N/A'}
              </div>
              {user?.receiverType === 'individual' && user?.idProof && (
                <div className="text-sm text-gray-700">
                  <strong>ID Proof:</strong> <a href={user.idProof} target="_blank" rel="noopener noreferrer" className="text-primary-600 underline">View Document</a>
                </div>
              )}
              {user?.receiverType === 'organization' && user?.organizationDoc && (
                <div className="text-sm text-gray-700">
                  <strong>Registration Document:</strong> <a href={user.organizationDoc} target="_blank" rel="noopener noreferrer" className="text-primary-600 underline">View Document</a>
                </div>
              )}
              {/* Re-verification Request Button */}
              {user?.verificationStatus === 'rejected' && (
                <ReverificationButton rejectionReason={user?.rejectionReason} />
              )}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 px-4 py-3 font-medium text-center transition-colors ${
                activeTab === 'profile'
                  ? 'text-primary-600 border-b-2 border-primary-500'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FiUser className="inline mr-2" />
              Profile
            </button>
            {user?.role !== 'admin' && user?.role !== 'superadmin' && (
              <button
                onClick={() => setActiveTab('ratings')}
                className={`flex-1 px-4 py-3 font-medium text-center transition-colors ${
                  activeTab === 'ratings'
                    ? 'text-primary-600 border-b-2 border-primary-500'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <FiStar className="inline mr-2" />
                Ratings
              </button>
            )}
            <button
              onClick={() => setActiveTab('security')}
              className={`flex-1 px-4 py-3 font-medium text-center transition-colors ${
                activeTab === 'security'
                  ? 'text-primary-600 border-b-2 border-primary-500'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FiLock className="inline mr-2" />
              Security
            </button>
          </div>

          <div className="p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      value={profileData.name}
                      onChange={handleProfileChange}
                      className="input-field pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={user?.email}
                      disabled
                      className="input-field pl-10 bg-gray-100"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleProfileChange}
                      className="input-field pl-10"
                    />
                  </div>
                </div>

                {/* Address field - visible for both donors and receivers */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <div className="relative">
                    <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="address"
                      value={profileData.address}
                      onChange={handleProfileChange}
                      className="input-field pl-10"
                      placeholder="Enter your address"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {user?.role === 'donor' 
                      ? 'This address will be shown in your profile and used for pickup locations'
                      : 'This address will help show donations near you'}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex items-center justify-center gap-2 w-full"
                >
                  {loading ? (
                    <Loader size="small" color="white" />
                  ) : (
                    <>
                      <FiSave />
                      Save Changes
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Ratings Tab */}
            {activeTab === 'ratings' && (
              <RatingsTab userId={user?._id} />
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      required
                      className="input-field pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      required
                      className="input-field pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                      className="input-field pl-10"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex items-center justify-center gap-2 w-full"
                >
                  {loading ? (
                    <Loader size="small" color="white" />
                  ) : (
                    <>
                      <FiShield />
                      Change Password
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
