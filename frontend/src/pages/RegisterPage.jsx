/**
 * Register Page (Donor)
 * Donor registration form
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiLock, FiPhone, FiUserPlus, FiCoffee, FiMapPin } from 'react-icons/fi';
import Loader from '../components/Loader';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    donorType: 'individual',
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
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

    setLoading(true);

    try {
      const result = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        address: formData.address,
        role: 'donor',
        donorType: formData.donorType,
      });
      
      // If registration requires email verification
      if (result.requiresVerification) {
        toast.success('Verification code sent to your email!');
        navigate('/verify-email', { state: { email: formData.email } });
      } else {
        toast.success(result.message || 'Registration successful!');
        navigate('/donate');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
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
          <h2 className="text-3xl font-bold text-gray-900">Register as Donor</h2>
          <p className="mt-2 text-gray-600">Start sharing food with those in need</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Donor Type Selection */}
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

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {formData.donorType === 'hotel' ? 'Hotel/Restaurant Name *' : 'Full Name *'}
              </label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder={formData.donorType === 'hotel' ? 'Hotel Paradise' : 'John Doe'}
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
              <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 text-base sm:text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader size="small" color="white" />
              ) : (
                <>
                  <FiUserPlus className="text-lg" />
                  Create Account
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

        {/* Receiver Registration Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Want to receive food instead?{' '}
            <Link to="/register/receiver" className="text-primary-600 hover:underline">
              Register as Receiver
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
