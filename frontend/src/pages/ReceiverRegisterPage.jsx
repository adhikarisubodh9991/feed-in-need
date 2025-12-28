/**
 * Receiver Registration Page
 * Registration form for individuals and organizations
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiLock, FiPhone, FiMapPin, FiUserPlus, FiUsers, FiBriefcase } from 'react-icons/fi';
import Loader from '../components/Loader';
import ImageUpload from '../components/ImageUpload';

const ReceiverRegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    receiverType: '',
    address: '',
  });
  const [idProof, setIdProof] = useState(null);
  const [organizationDoc, setOrganizationDoc] = useState(null);
  const [loading, setLoading] = useState(false);
  const { registerReceiver } = useAuth();
  const navigate = useNavigate();

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

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (!formData.receiverType) {
      toast.error('Please select receiver type');
      return;
    }

    if (formData.receiverType === 'individual' && !idProof) {
      toast.error('Please upload your ID proof');
      return;
    }

    if (formData.receiverType === 'organization' && !organizationDoc) {
      toast.error('Please upload organization registration document');
      return;
    }

    setLoading(true);

    try {
      // Create FormData for file upload
      const data = new FormData();
      data.append('name', formData.name);
      data.append('email', formData.email);
      data.append('password', formData.password);
      data.append('phone', formData.phone);
      data.append('receiverType', formData.receiverType);
      data.append('address', formData.address);
      
      if (idProof) data.append('idProof', idProof);
      if (organizationDoc) data.append('organizationDoc', organizationDoc);

      const result = await registerReceiver(data);
      
      // If registration requires email verification
      if (result.requiresVerification) {
        toast.success('Verification code sent to your email!');
        navigate('/verify-email', { state: { email: formData.email } });
      } else {
        toast.success(result.message || 'Registration successful! Awaiting verification.');
        navigate('/donations');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <img src="/logo.png" alt="Feed In Need" className="h-12 w-12 object-contain" />
            <span className="font-bold text-2xl text-primary-600">Feed In Need</span>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900">Register as Receiver</h2>
          <p className="mt-2 text-gray-600">Get verified to receive food donations</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Receiver Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                I am registering as *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, receiverType: 'individual' })}
                  className={`p-4 border-2 rounded-lg text-center transition-colors ${
                    formData.receiverType === 'individual'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <FiUser className="mx-auto text-2xl mb-2" />
                  <span className="font-medium">Individual</span>
                  <p className="text-xs text-gray-500 mt-1">Person in need</p>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, receiverType: 'organization' })}
                  className={`p-4 border-2 rounded-lg text-center transition-colors ${
                    formData.receiverType === 'organization'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <FiBriefcase className="mx-auto text-2xl mb-2" />
                  <span className="font-medium">Organization</span>
                  <p className="text-xs text-gray-500 mt-1">NGO, Shelter, etc.</p>
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {formData.receiverType === 'organization' ? 'Organization Name' : 'Full Name'} *
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder={formData.receiverType === 'organization' ? 'Organization name' : 'Your full name'}
                    className="input-field pl-10"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="you@example.com"
                    className="input-field pl-10"
                  />
                </div>
              </div>

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

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="••••••••"
                    className="input-field pl-10"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    placeholder="••••••••"
                    className="input-field pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Document Upload */}
            {formData.receiverType && (
              <div className="pt-4 border-t">
                {formData.receiverType === 'individual' ? (
                  <ImageUpload
                    label="ID Proof (Citizenship, License, etc.) *"
                    onFileSelect={setIdProof}
                    maxSize={10}
                    allowDocuments={true}
                  />
                ) : (
                  <ImageUpload
                    label="Organization Registration Document *"
                    onFileSelect={setOrganizationDoc}
                    maxSize={10}
                    allowDocuments={true}
                  />
                )}
              </div>
            )}

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Your account will be reviewed by our admin team. 
                Once verified, you'll be able to request food donations. Verification 
                usually takes 24-48 hours.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !formData.receiverType}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 text-base sm:text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader size="small" color="white" />
              ) : (
                <>
                  <FiUserPlus className="text-lg" />
                  Submit for Verification
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Donor Registration Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Want to donate food instead?{' '}
            <Link to="/register" className="text-primary-600 hover:underline">
              Register as Donor
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReceiverRegisterPage;
