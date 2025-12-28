/**
 * Donations List Page
 * Browse all available food donations
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/axios';
import DonationCard from '../components/DonationCard';
import Loader from '../components/Loader';
import { FiSearch, FiFilter, FiPackage, FiMapPin, FiNavigation } from 'react-icons/fi';

const DonationsPage = () => {
  const { user, isReceiver } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [sortByNearest, setSortByNearest] = useState(false);

  // Try to get user's location on mount
  useEffect(() => {
    // If receiver has address, try to geocode it
    if (isReceiver && user?.address) {
      geocodeAddress(user.address);
    }
  }, [user, isReceiver]);

  // Geocode user's address to get coordinates
  const geocodeAddress = async (address) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
        { headers: { 'User-Agent': 'FeedInNeed/1.0' } }
      );
      const data = await response.json();
      if (data.length > 0) {
        setUserLocation({
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
        });
        setSortByNearest(true);
      }
    } catch (error) {
      console.error('Error geocoding address:', error);
    }
  };

  // Get current location using browser geolocation
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setSortByNearest(true);
        setLocationLoading(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    fetchDonations();
  }, [page, search, sortByNearest, userLocation]);

  const fetchDonations = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 12,
        search: search || undefined,
        status: 'available',
      };

      // Add location params if sorting by nearest
      if (sortByNearest && userLocation) {
        params.latitude = userLocation.lat;
        params.longitude = userLocation.lng;
      }

      const response = await api.get('/donations', { params });
      setDonations(response.data.data);
      setTotalPages(response.data.pages);
    } catch (error) {
      console.error('Error fetching donations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchDonations();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Available Donations
          </h1>
          <p className="text-gray-600">
            Browse food donations in your area
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-6">
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by food name..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors"
            >
              Search
            </button>
          </div>
        </form>

        {/* Location Sorting Controls */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
          <button
            onClick={getCurrentLocation}
            disabled={locationLoading}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              sortByNearest && userLocation
                ? 'bg-primary-500 text-white border-primary-500'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {locationLoading ? (
              <Loader size="small" />
            ) : (
              <FiNavigation />
            )}
            Sort by Nearest
          </button>
          
          {sortByNearest && userLocation && (
            <button
              onClick={() => {
                setSortByNearest(false);
                setUserLocation(null);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <FiFilter />
              Show All
            </button>
          )}
          
          {sortByNearest && userLocation && (
            <span className="text-sm text-gray-500 flex items-center gap-1">
              <FiMapPin className="text-primary-500" />
              Sorted by distance from your location
            </span>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader size="large" />
          </div>
        ) : donations.length === 0 ? (
          <div className="text-center py-20">
            <FiPackage className="mx-auto text-6xl text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Donations Found
            </h3>
            <p className="text-gray-500 mb-6">
              {search
                ? 'Try searching with different keywords'
                : 'There are no available donations at the moment'}
            </p>
            <Link to="/" className="btn-primary">
              Back to Home
            </Link>
          </div>
        ) : (
          <>
            {/* Donations Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {donations.map((donation) => (
                <DonationCard key={donation._id} donation={donation} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DonationsPage;
