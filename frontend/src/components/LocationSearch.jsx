import { useState, useEffect, useRef } from 'react';
import { MapPin, Search, ChevronDown, X, Globe } from 'lucide-react';

export default function LocationSearch({ socket, currentLocation, onLocationChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cities, setCities] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Fetch all available cities when component mounts
  useEffect(() => {
    if (socket) {
      socket.emit('getAvailableCities');
      
      socket.on('availableCities', (data) => {
        setCities(data);
        setFilteredCities(data);
      });

      socket.on('citySearchResults', (results) => {
        setFilteredCities(results);
        setIsLoading(false);
      });

      socket.on('locationChanged', (result) => {
        if (result.success) {
          setIsOpen(false);
          setSearchQuery('');
          if (onLocationChange) {
            onLocationChange(result.location);
          }
        }
        setIsLoading(false);
      });

      return () => {
        socket.off('availableCities');
        socket.off('citySearchResults');
        socket.off('locationChanged');
      };
    }
  }, [socket, onLocationChange]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Filter cities based on search query
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = cities.filter(city => 
        city.city.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCities(filtered);
    } else {
      setFilteredCities(cities);
    }
  }, [searchQuery, cities]);

  const handleCitySelect = (cityKey) => {
    setIsLoading(true);
    socket.emit('changeLocation', cityKey);
  };

  const getCountryFlag = (countryCode) => {
    const flags = {
      'IN': '🇮🇳', 'US': '🇺🇸', 'GB': '🇬🇧', 'FR': '🇫🇷', 'JP': '🇯🇵',
      'AU': '🇦🇺', 'AE': '🇦🇪', 'SG': '🇸🇬', 'HK': '🇭🇰', 'DE': '🇩🇪',
      'RU': '🇷🇺', 'EG': '🇪🇬', 'CA': '🇨🇦', 'TH': '🇹🇭'
    };
    return flags[countryCode] || '🌍';
  };

  return (
    <div className="location-search" ref={dropdownRef}>
      <button 
        className={`location-trigger ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <MapPin className="location-trigger-icon" />
        <span className="location-trigger-text">
          {currentLocation?.city || 'Select Location'}, {currentLocation?.country || ''}
        </span>
        <ChevronDown className={`location-trigger-chevron ${isOpen ? 'rotated' : ''}`} />
      </button>

      {isOpen && (
        <div className="location-dropdown">
          <div className="location-search-box">
            <Search className="location-search-icon" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search cities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="location-search-input"
            />
            {searchQuery && (
              <button 
                className="location-clear-btn"
                onClick={() => setSearchQuery('')}
              >
                <X />
              </button>
            )}
          </div>

          <div className="location-list">
            {filteredCities.length === 0 ? (
              <div className="location-no-results">
                <Globe />
                <span>No cities found</span>
              </div>
            ) : (
              filteredCities.map((city) => (
                <button
                  key={city.key}
                  className={`location-item ${currentLocation?.city === city.city ? 'active' : ''}`}
                  onClick={() => handleCitySelect(city.key)}
                  disabled={isLoading}
                >
                  <span className="location-item-flag">{getCountryFlag(city.country)}</span>
                  <span className="location-item-city">{city.city}</span>
                  <span className="location-item-country">{city.country}</span>
                </button>
              ))
            )}
          </div>

          {isLoading && (
            <div className="location-loading">
              <div className="location-loading-spinner" />
              <span>Updating location...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
