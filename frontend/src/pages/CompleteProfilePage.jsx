/**
 * Complete Profile Page
 * For Google OAuth users to complete their profile
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiUser, FiPhone, FiMapPin, FiCoffee, FiCheck } from 'react-icons/fi';
import Loader from '../components/Loader';

const CompleteProfilePage = () => {
  const { user, completeProfile } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    phone: '',
    address: '',
    role: 'donor',
    donorType: 'individual',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    const phoneRegex = /^(97|98)\d{8}$/;
    if (!phoneRegex.test(formData.phone)) {
      toast.error('Please enter a valid Nepali phone number (10 digits starting with 97 or 98)');
      return;
    }

    if (!formData.address) {
      toast.error('Please enter your address');
      return;
    }

    setLoading(true);

    try {
      await completeProfile(formData);
      toast.success('Profile completed successfully!');
      navigate('/donate');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to complete profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <img src="/logo.png" alt="Feed In Need" className="h-12 w-12 object-contain" />
            <span className="font-bold text-2xl text-primary-600">Feed In Need</span>
          </Link>
          
          {/* User Avatar */}
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-20 h-20 rounded-full mx-auto mb-4 object-cover border-4 border-primary-200"
            />
          ) : (
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiUser className="text-primary-600 text-3xl" />
            </div>
          )}
          
          <h2 className="text-3xl font-bold text-gray-900">Complete Your Profile</h2>
          <p className="mt-2 text-gray-600">
            Welcome, {user?.name}! Please complete your profile to continue.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                I want to *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'donor' })}
                  className={`p-4 border-2 rounded-xl flex flex-col items-center gap-2 transition-all ${
                    formData.role === 'donor'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-2xl">🍲</span>
                  <span className="font-medium">Donate Food</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'receiver' })}
                  className={`p-4 border-2 rounded-xl flex flex-col items-center gap-2 transition-all ${
                    formData.role === 'receiver'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-2xl">🙏</span>
                  <span className="font-medium">Receive Food</span>
                </button>
              </div>
            </div>

            {/* Donor Type Selection (only for donors) */}
            {formData.role === 'donor' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  I am donating as *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, donorType: 'individual' })}
                    className={`p-4 border-2 rounded-xl flex flex-col items-center gap-2 transition-all ${
                      formData.donorType === 'individual'
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <FiUser className="text-2xl" />
                    <span className="font-medium">Individual</span>
                    <span className="text-xs text-gray-500">Personal donation</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, donorType: 'hotel' })}
                    className={`p-4 border-2 rounded-xl flex flex-col items-center gap-2 transition-all ${
                      formData.donorType === 'hotel'
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <FiCoffee className="text-2xl" />
                    <span className="font-medium">Hotel/Restaurant</span>
                    <span className="text-xs text-gray-500">Business donation</span>
                  </button>
                </div>
              </div>
            )}

            {/* Receiver info */}
            {formData.role === 'receiver' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> As a receiver, you'll need to provide ID proof for verification. 
                  Please use the regular registration to upload your documents.
                </p>
                <Link 
                  to="/register/receiver" 
                  className="text-sm text-primary-600 font-medium hover:underline mt-2 inline-block"
                >
                  Go to Receiver Registration →
                </Link>
              </div>
            )}

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <div className="relative">
                <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setFormData({ ...formData, phone: value });
                  }}
                  required
                  maxLength={10}
                  placeholder="98XXXXXXXX"
                  className="input-field pl-10"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Nepali number (10 digits starting with 97 or 98)</p>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address *
              </label>
              <div className="relative">
                <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  placeholder="Your address"
                  className="input-field pl-10"
                />
              </div>
            </div>

            {/* Submit Button */}
            {formData.role === 'donor' && (
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary flex items-center justify-center gap-2 py-3"
              >
                {loading ? (
                  <Loader size="small" color="white" />
                ) : (
                  <>
                    <FiCheck />
                    Complete Profile
                  </>
                )}
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfilePage;
