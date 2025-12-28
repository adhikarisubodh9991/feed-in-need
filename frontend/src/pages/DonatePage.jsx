/**
 * Donate Food Page
 * Form for donors to create food donations
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/axios';
import toast from 'react-hot-toast';
import { FiPhone, FiPackage, FiFileText, FiClock, FiCheck } from 'react-icons/fi';
import Loader from '../components/Loader';
import ImageUpload from '../components/ImageUpload';
import LocationPicker from '../components/LocationPicker';

const DonatePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [donationData, setDonationData] = useState(null);
  
  const [formData, setFormData] = useState({
    donorPhone: user?.phone || '',
    foodTitle: '',
    foodDescription: '',
    quantity: '',
    storageCondition: 'room_temperature',
    expiryDateTime: '',
    latitude: '',
    longitude: '',
    address: '',
    notes: '',
  });
  const [foodPhotos, setFoodPhotos] = useState([]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLocationChange = (lat, lng) => {
    console.log('Location changed:', lat, lng);
    setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
  };

  const handleAddressChange = (address) => {
    console.log('Address changed:', address);
    setFormData(prev => ({ ...prev, address }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!foodPhotos || foodPhotos.length === 0) {
      toast.error('Please upload at least 1 food photo (max 3)');
      return;
    }

    // Check if latitude and longitude are valid numbers
    const lat = parseFloat(formData.latitude);
    const lng = parseFloat(formData.longitude);
    if (isNaN(lat) || isNaN(lng) || formData.latitude === '' || formData.longitude === '') {
      toast.error('Please select a location on the map');
      return;
    }

    if (new Date(formData.expiryDateTime) <= new Date()) {
      toast.error('Expiry date must be in the future');
      return;
    }

    setLoading(true);

    try {
      // Create FormData for file upload
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });
      // Append multiple photos
      foodPhotos.forEach((photo) => {
        data.append('foodPhotos', photo);
      });

      const response = await api.post('/donations', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setDonationData(response.data.data);
      toast.success('Donation submitted successfully!');
      setStep(2);
    } catch (error) {
      console.error('Donation submission error:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to submit donation';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Success step with social share
  if (step === 2 && donationData) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiCheck className="text-green-600 text-4xl" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Thank You for Your Donation!
            </h2>
            <p className="text-gray-600 mb-4">
              Your donation "{donationData.foodTitle}" has been submitted successfully.
            </p>
            
            {/* Pending Approval Notice */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-800 text-sm">
                <strong>⏳ Pending Approval:</strong> Your donation is waiting for admin approval. 
                Once approved, it will be visible to receivers and you'll be able to share it on social media.
              </p>
            </div>

            {/* What's Next */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
              <h4 className="font-semibold text-blue-800 mb-2">What's Next?</h4>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• Admin will review your donation</li>
                <li>• You'll receive a notification when approved</li>
                <li>• After approval, share on social media!</li>
                <li>• Verified receivers can request your food</li>
              </ul>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  setStep(1);
                  setDonationData(null);
                  setFormData({
                    donorPhone: user?.phone || '',
                    foodTitle: '',
                    foodDescription: '',
                    quantity: '',
                    storageCondition: 'room_temperature',
                    expiryDateTime: '',
                    latitude: '',
                    longitude: '',
                    address: '',
                    notes: '',
                  });
                  setFoodPhotos([]);
                }}
                className="w-full btn-primary"
              >
                Donate More Food
              </button>
              <button
                onClick={() => navigate('/my-donations')}
                className="w-full btn-outline"
              >
                View My Donations
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check if donor is verified
  if (user?.role === 'donor' && user?.verificationStatus !== 'approved') {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiClock className="text-yellow-600 text-4xl" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Verification Required
            </h2>
            <p className="text-gray-600 mb-6">
              Your account needs to be verified before you can donate food. This helps us maintain trust and quality in our platform.
            </p>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-800 text-sm">
                <strong>⏳ Status:</strong> {user?.verificationStatus === 'pending' ? 'Your verification is pending admin review.' : user?.verificationStatus === 'rejected' ? 'Your verification was rejected. Please contact support.' : 'Please complete your profile for verification.'}
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
              <h4 className="font-semibold text-blue-800 mb-2">Why Verification?</h4>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• Ensures food safety and quality</li>
                <li>• Builds trust with receivers</li>
                <li>• Verified donors get a badge on their profile</li>
                <li>• Helps prevent misuse of the platform</li>
              </ul>
            </div>

            <button
              onClick={() => navigate('/profile')}
              className="w-full btn-primary"
            >
              Go to Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Donate Food</h1>
          <p className="text-gray-600">
            Share your surplus food with those in need
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FiPhone className="text-primary-500" />
                Contact Information
              </h3>
              <div className="relative">
                <input
                  type="tel"
                  name="donorPhone"
                  value={formData.donorPhone}
                  onChange={handleChange}
                  required
                  placeholder="Phone number for pickup coordination"
                  className="input-field"
                />
              </div>
            </div>

            {/* Food Details */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FiPackage className="text-primary-500" />
                Food Details
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Food Title *
                  </label>
                  <input
                    type="text"
                    name="foodTitle"
                    value={formData.foodTitle}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Rice and Curry, Sandwiches"
                    className="input-field"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity *
                  </label>
                  <input
                    type="text"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    required
                    placeholder="e.g., 10 servings, 5 plates"
                    className="input-field"
                  />
                </div>
              </div>

              {/* Storage Condition */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Storage Condition *
                </label>
                <select
                  name="storageCondition"
                  value={formData.storageCondition}
                  onChange={handleChange}
                  required
                  className="input-field"
                >
                  <option value="room_temperature">🌡️ Room Temperature</option>
                  <option value="refrigerated">❄️ Refrigerated (Fridge)</option>
                  <option value="frozen">🧊 Frozen (Freezer)</option>
                  <option value="hot">🔥 Hot/Warm</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  How is the food currently stored?
                </p>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  name="foodDescription"
                  value={formData.foodDescription}
                  onChange={handleChange}
                  required
                  rows={3}
                  placeholder="Describe the food items, ingredients, any dietary information..."
                  className="input-field"
                />
              </div>

              {/* Food Photos */}
              <div className="mt-4">
                <ImageUpload
                  label="Food Photos (1-3 required)"
                  onFileSelect={setFoodPhotos}
                  maxSize={5}
                  maxFiles={3}
                  required={true}
                />
              </div>
            </div>

            {/* Expiry */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FiClock className="text-primary-500" />
                Expiry Information
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Best Before / Expiry Date & Time *
                </label>
                <input
                  type="datetime-local"
                  name="expiryDateTime"
                  value={formData.expiryDateTime}
                  onChange={handleChange}
                  required
                  min={new Date().toISOString().slice(0, 16)}
                  className="input-field"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Please provide accurate expiry information for food safety
                </p>
              </div>
            </div>

            {/* Location */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FiFileText className="text-primary-500" />
                Pickup Location
              </h3>
              
              <LocationPicker
                onLocationChange={handleLocationChange}
                address={formData.address}
                onAddressChange={handleAddressChange}
                donorType={user?.donorType}
                onHotelSelect={(hotel) => {
                  console.log('Selected hotel:', hotel);
                  // Optionally store hotel info
                }}
              />
            </div>

            {/* Additional Notes */}
            <div className="border-t pt-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Notes (Optional)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={2}
                placeholder="Any special instructions for pickup, availability times, etc."
                className="input-field"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 text-lg flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader size="small" color="white" />
                ) : (
                  <>
                    <FiPackage />
                    Submit Donation
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DonatePage;
