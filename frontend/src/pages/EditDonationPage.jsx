/**
 * Edit Donation Page
 * Allow donors to edit their donations before admin approval
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/axios';
import toast from 'react-hot-toast';
import { FiPhone, FiPackage, FiFileText, FiClock, FiArrowLeft, FiSave } from 'react-icons/fi';
import Loader from '../components/Loader';
import ImageUpload from '../components/ImageUpload';
import LocationPicker from '../components/LocationPicker';

const EditDonationPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [donation, setDonation] = useState(null);
  
  const [formData, setFormData] = useState({
    donorPhone: '',
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
  const [existingPhotos, setExistingPhotos] = useState([]);

  useEffect(() => {
    fetchDonation();
  }, [id]);

  const fetchDonation = async () => {
    try {
      const response = await api.get(`/donations/${id}`);
      const data = response.data.data;
      
      // Check if user owns this donation
      if (data.donor._id !== user._id) {
        toast.error('Not authorized to edit this donation');
        navigate('/my-donations');
        return;
      }

      // Check if donation is claimed or completed - no one can edit
      if (data.status === 'claimed' || data.status === 'completed') {
        toast.error('Cannot edit donation after it has been claimed or completed');
        navigate('/my-donations');
        return;
      }

      // Check if donation is already approved (allow only for trusted donors)
      if (data.isApproved && !user?.isTrusted) {
        toast.error('Cannot edit an approved donation. Only trusted donors can edit approved donations.');
        navigate('/my-donations');
        return;
      }

      setDonation(data);
      setExistingPhotos(data.foodPhotos || []);
      
      // Format datetime for input
      const expiryDate = new Date(data.expiryDateTime);
      const formattedDateTime = expiryDate.toISOString().slice(0, 16);
      
      setFormData({
        donorPhone: data.donorPhone || '',
        foodTitle: data.foodTitle || '',
        foodDescription: data.foodDescription || '',
        quantity: data.quantity || '',
        storageCondition: data.storageCondition || 'room_temperature',
        expiryDateTime: formattedDateTime,
        latitude: data.location?.coordinates?.[1] || '',
        longitude: data.location?.coordinates?.[0] || '',
        address: data.address || '',
        notes: data.notes || '',
      });
    } catch (error) {
      toast.error('Failed to load donation');
      navigate('/my-donations');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLocationChange = (lat, lng) => {
    setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
  };

  const handleAddressChange = (address) => {
    setFormData(prev => ({ ...prev, address }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    const lat = parseFloat(formData.latitude);
    const lng = parseFloat(formData.longitude);
    if (isNaN(lat) || isNaN(lng)) {
      toast.error('Please select a location on the map');
      return;
    }

    if (new Date(formData.expiryDateTime) <= new Date()) {
      toast.error('Expiry date must be in the future');
      return;
    }

    setSaving(true);

    try {
      // Create FormData for file upload
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });
      
      // Keep existing photos if no new ones uploaded
      if (foodPhotos.length > 0) {
        foodPhotos.forEach((photo) => {
          data.append('foodPhotos', photo);
        });
      } else {
        // Send existing photo URLs
        existingPhotos.forEach((url) => {
          data.append('existingPhotos', url);
        });
      }

      await api.put(`/donations/${id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Donation updated successfully!');
      navigate('/my-donations');
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to update donation';
      toast.error(errorMsg);
    } finally {
      setSaving(false);
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
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/my-donations')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
        >
          <FiArrowLeft />
          Back to My Donations
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Donation</h1>
          <p className="text-gray-600">
            Update your donation details before admin approval
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

              {/* Existing Photos */}
              {existingPhotos.length > 0 && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Photos
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {existingPhotos.map((photo, idx) => (
                      <div key={idx} className="w-24 h-24 rounded-lg overflow-hidden">
                        <img src={photo} alt={`Food ${idx + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Upload new photos below to replace these
                  </p>
                </div>
              )}

              {/* Food Photos */}
              <div className="mt-4">
                <ImageUpload
                  label="Update Food Photos (optional)"
                  onFileSelect={setFoodPhotos}
                  maxSize={5}
                  maxFiles={3}
                  required={false}
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
                initialLat={formData.latitude}
                initialLng={formData.longitude}
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
            <div className="pt-4 flex gap-4">
              <button
                type="button"
                onClick={() => navigate('/my-donations')}
                className="flex-1 btn-outline py-3"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 btn-primary py-3 text-lg flex items-center justify-center gap-2"
              >
                {saving ? (
                  <Loader size="small" color="white" />
                ) : (
                  <>
                    <FiSave />
                    Save Changes
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

export default EditDonationPage;
