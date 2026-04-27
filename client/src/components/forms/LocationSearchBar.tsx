import React, { useState } from 'react';
import { MapPin, Search, Navigation } from 'lucide-react';
import axios from "axios";

interface LocationState {
  lat: number;
  lng: number;
  label: string;
}

interface LocationSearchBarProps {
  location: LocationState | null;
  setLocation: (loc: LocationState | null) => void;
}

const LocationSearchBar: React.FC<LocationSearchBarProps> = ({ location, setLocation }) => {
  const [isEditing, setIsEditing] = useState(!location);
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTextSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await axios.post('http://localhost:5000/api/geocode', { address: searchInput });
      setLocation({
        lat: res.data.lat,
        lng: res.data.lng,
        label: res.data.formattedAddress.split(',')[0], // Just show the city/district part
      });
      setIsEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Location not found.');
    } finally {
      setLoading(false);
    }
  };

  const handleUseLocation = () => {
    setLoading(true);
    setError(null);
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Attempt to reverse geocode the coordinates for a better label
          const res = await axios.get(`http://localhost:5000/api/geocode/reverse?lat=${latitude}&lng=${longitude}`);
          setLocation({
            lat: latitude,
            lng: longitude,
            label: res.data.label || 'Current Location',
          });
        } catch (err) {
          // Fallback to generic label if reverse geocode fails
          setLocation({
            lat: latitude,
            lng: longitude,
            label: 'Current Location',
          });
        }
        setIsEditing(false);
        setLoading(false);
      },
      () => {
        setError('Unable to retrieve your location');
        setLoading(false);
      }
    );
  };

  const handleClear = () => {
    setLocation(null);
    setSearchInput('');
    setIsEditing(true);
  };

  if (!isEditing && location) {
    return (
      <div className="flex items-center justify-between bg-primary-50 text-primary-900 px-4 py-3 rounded-xl border border-primary-200">
        <div className="flex items-center gap-2">
          <MapPin className="text-primary-600" size={20} />
          <span className="font-medium">Near {location.label}</span>
        </div>
        <button
          onClick={handleClear}
          className="text-sm font-semibold text-primary-700 hover:text-primary-900 transition-colors"
        >
          Change
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-stretch gap-2 w-full">
      <div className="flex-grow transition-all">
        <form onSubmit={handleTextSearch} className="flex">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm transition-all"
              placeholder="Enter city or district (e.g. Kathmandu)"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              disabled={loading}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleTextSearch(e);
                }
              }}
            />
            {loading && (
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        </form>
        
        {error && <p className="mt-2 text-sm text-red-600 px-2 font-medium">{error}</p>}
        
        {location && (
          <div className="mt-2 px-2 text-sm">
            <button onClick={() => setIsEditing(false)} className="text-gray-500 hover:text-gray-900 underline font-medium">
              Cancel and keep "{location.label}"
            </button>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handleUseLocation}
        disabled={loading}
        className="shrink-0 w-14 bg-white text-primary-600 rounded-2xl shadow-sm border border-gray-200 hover:bg-gray-50 flex items-center justify-center transition-all hover:shadow-md active:scale-95 group relative mb-auto"
        style={{ height: '54px' }} // Explicitly matching typical py-3.5 height for precision
        title="Use my current GPS location"
      >
        <Navigation className={`h-6 w-6 ${loading ? 'animate-pulse text-gray-400' : ''}`} />
        <span className="absolute bottom-full mb-2 right-0 px-2 py-1 bg-gray-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Use My GPS Location
        </span>
      </button>
    </div>
  );
};

export default LocationSearchBar;
