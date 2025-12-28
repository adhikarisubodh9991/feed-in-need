/**
 * Location Picker Component
 * Simple interactive map for selecting location using Leaflet
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMap, Popup } from 'react-leaflet';
import { FiMapPin, FiCrosshair, FiLoader } from 'react-icons/fi';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Component to handle map click events
const MapClickHandler = ({ onLocationSelect }) => {
  const map = useMap();
  
  useEffect(() => {
    if (!map) return;
    
    const handleClick = (e) => {
      L.DomEvent.stopPropagation(e);
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    };
    
    map.on('click', handleClick);
    
    return () => {
      map.off('click', handleClick);
    };
  }, [map, onLocationSelect]);
  
  return null;
};

// Component to recenter map
const MapRecenter = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center && map) {
      map.setView(center, zoom || 17);
    }
  }, [center, zoom, map]);
  
  return null;
};

const LocationPicker = ({ 
  onLocationChange, 
  initialLocation, 
  initialLat,
  initialLng,
  address, 
  onAddressChange,
}) => {
  // Support both initialLocation object and separate lat/lng props
  const getInitialPosition = useCallback(() => {
    if (initialLocation) {
      return initialLocation;
    }
    if (initialLat && initialLng) {
      const lat = parseFloat(initialLat);
      const lng = parseFloat(initialLng);
      if (!isNaN(lat) && !isNaN(lng)) {
        return { lat, lng };
      }
    }
    return null;
  }, [initialLocation, initialLat, initialLng]);
  
  const [position, setPosition] = useState(() => getInitialPosition());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [accuracy, setAccuracy] = useState(null);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchTimeoutRef = useRef(null);
  const watchIdRef = useRef(null);

  // Default center (Kathmandu, Nepal)
  const defaultCenter = [27.7172, 85.3240];
  
  // Update position if initial values change
  useEffect(() => {
    const newPos = getInitialPosition();
    if (newPos && (!position || newPos.lat !== position.lat || newPos.lng !== position.lng)) {
      setPosition(newPos);
    }
  }, [getInitialPosition]);

  // Cleanup watch on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, []);

  // Get current location
  const getCurrentLocation = useCallback((e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Clear any existing watch
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    
    setLoading(true);
    setError('');
    setAccuracy(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    const successCallback = async (pos) => {
      const { latitude, longitude, accuracy: posAccuracy } = pos.coords;
      
      setPosition({ lat: latitude, lng: longitude });
      setAccuracy(posAccuracy);
      
      if (onLocationChange) {
        onLocationChange(latitude, longitude);
      }
      
      // Reverse geocode to get address
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
          { headers: { 'User-Agent': 'FeedInNeed/1.0' } }
        );
        const data = await response.json();
        if (data.display_name && onAddressChange) {
          onAddressChange(data.display_name);
        }
      } catch (err) {
        console.error('Error getting address:', err);
      }
      
      setLoading(false);
    };

    const errorCallback = (err) => {
      let errorMessage = 'Unable to retrieve your location';
      switch (err.code) {
        case 1:
          errorMessage = 'Location permission denied. Please enable location access.';
          break;
        case 2:
          errorMessage = 'Location unavailable. Please try again.';
          break;
        case 3:
          errorMessage = 'Location request timed out. Please try again.';
          break;
      }
      setError(errorMessage);
      setLoading(false);
    };

    navigator.geolocation.getCurrentPosition(
      successCallback,
      errorCallback,
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );

    // Watch for better accuracy
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const newAccuracy = pos.coords.accuracy;
        if (!accuracy || newAccuracy < accuracy * 0.8) {
          successCallback(pos);
        }
        if (newAccuracy < 50 && watchIdRef.current) {
          navigator.geolocation.clearWatch(watchIdRef.current);
          watchIdRef.current = null;
        }
      },
      () => {},
      { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 }
    );

    // Stop watching after 20 seconds
    setTimeout(() => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setLoading(false);
    }, 20000);
  }, [accuracy, onLocationChange, onAddressChange]);

  // Handle map click
  const handleLocationSelect = useCallback(async (lat, lng) => {
    setPosition({ lat, lng });
    
    if (onLocationChange) {
      onLocationChange(lat, lng);
    }
    
    // Reverse geocode to get address
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { 'User-Agent': 'FeedInNeed/1.0' } }
      );
      const data = await response.json();
      if (data.display_name && onAddressChange) {
        onAddressChange(data.display_name);
      }
    } catch (err) {
      console.error('Error getting address:', err);
    }
  }, [onLocationChange, onAddressChange]);

  // Search for address
  const searchAddress = async (searchText) => {
    if (!searchText || searchText.length < 3) return;
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchText)}&limit=1&addressdetails=1`,
        { headers: { 'User-Agent': 'FeedInNeed/1.0' } }
      );
      const data = await response.json();
      
      if (data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const newLat = parseFloat(lat);
        const newLng = parseFloat(lon);
        setPosition({ lat: newLat, lng: newLng });
        if (onLocationChange) {
          onLocationChange(newLat, newLng);
        }
        if (onAddressChange) {
          onAddressChange(display_name);
        }
      }
    } catch (err) {
      console.error('Error searching address:', err);
    }
  };

  // Search for address suggestions (autocomplete)
  const searchAddressSuggestions = async (searchText) => {
    if (!searchText || searchText.length < 3) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    
    setSearchLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchText)}&limit=5&addressdetails=1&countrycodes=np`,
        { headers: { 'User-Agent': 'FeedInNeed/1.0' } }
      );
      const data = await response.json();
      setSearchSuggestions(data);
      setShowSuggestions(data.length > 0);
    } catch (err) {
      console.error('Error fetching suggestions:', err);
      setSearchSuggestions([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Handle address input change with debounced suggestions
  const handleAddressInputChange = (e) => {
    const value = e.target.value;
    if (onAddressChange) {
      onAddressChange(value);
    }
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Debounce the search
    searchTimeoutRef.current = setTimeout(() => {
      searchAddressSuggestions(value);
    }, 300);
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion) => {
    const newLat = parseFloat(suggestion.lat);
    const newLng = parseFloat(suggestion.lon);
    setPosition({ lat: newLat, lng: newLng });
    
    if (onLocationChange) {
      onLocationChange(newLat, newLng);
    }
    if (onAddressChange) {
      onAddressChange(suggestion.display_name);
    }
    
    setShowSuggestions(false);
    setSearchSuggestions([]);
  };

  return (
    <div className="space-y-4">
      {/* Address Input with Autocomplete */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Location Address *
        </label>
        <div className="relative">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={address || ''}
                onChange={handleAddressInputChange}
                onFocus={() => searchSuggestions.length > 0 && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="Type to search location..."
                className="input-field w-full"
              />
              {searchLoading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <FiLoader className="animate-spin text-gray-400" />
                </div>
              )}
              
              {/* Suggestions Dropdown */}
              {showSuggestions && searchSuggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {searchSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSuggestionSelect(suggestion)}
                      className="w-full text-left px-4 py-3 hover:bg-primary-50 border-b border-gray-100 last:border-b-0 transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        <FiMapPin className="text-primary-500 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-800 font-medium">
                            {suggestion.display_name?.split(',')[0]}
                          </p>
                          <p className="text-xs text-gray-500 line-clamp-2">
                            {suggestion.display_name}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={getCurrentLocation}
              disabled={loading}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-2 whitespace-nowrap disabled:opacity-50"
            >
              {loading ? (
                <FiLoader className="animate-spin" />
              ) : (
                <FiCrosshair />
              )}
              <span className="hidden sm:inline">My Location</span>
            </button>
          </div>
        </div>
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        {accuracy && (
          <p className="text-green-600 text-xs mt-1">
            📍 Location accuracy: ±{Math.round(accuracy)} meters
          </p>
        )}
      </div>

      {/* Map */}
      <div className="h-72 rounded-lg overflow-hidden border border-gray-300 relative" style={{ minHeight: '288px' }}>
        <MapContainer
          center={position ? [position.lat, position.lng] : defaultCenter}
          zoom={position ? 17 : 12}
          className="h-full w-full"
          style={{ height: '100%', width: '100%', minHeight: '288px' }}
          scrollWheelZoom={true}
          doubleClickZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onLocationSelect={handleLocationSelect} />
          
          {position && (
            <>
              <Marker position={[position.lat, position.lng]}>
                <Popup>
                  <div className="text-center">
                    <strong>Selected Location</strong>
                  </div>
                </Popup>
              </Marker>
              <MapRecenter center={[position.lat, position.lng]} zoom={17} />
            </>
          )}
        </MapContainer>
      </div>

      <p className="flex items-center gap-1 text-sm text-gray-500">
        <FiMapPin className="text-blue-500" />
        Click on map to select location
      </p>

      {/* Coordinates Display */}
      {position && (
        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
          <span className="font-medium">Selected coordinates:</span>{' '}
          {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
        </div>
      )}
    </div>
  );
};

export default LocationPicker;
