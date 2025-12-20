import { useState, useEffect, useRef } from 'react';
import { MapPin, Search, ChevronDown, X, Globe, Loader } from 'lucide-react';

export default function LocationSearch({ socket, currentLocation, onLocationChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cities, setCities] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Fetch all available cities when component mounts
  useEffect(() => {
    if (socket) {
      socket.emit('getAvailableCities');
      
      socket.on('availableCities', (data) => {
        setCities(data);
        setSearchResults(data);
      });

      socket.on('citySearchResults', (results) => {
        setSearchResults(results);
        setIsSearching(false);
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

  // Search cities globally with debounce
  useEffect(() => {
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim().length >= 2) {
      setIsSearching(true);
      // Debounce the search request
      searchTimeoutRef.current = setTimeout(() => {
        socket.emit('searchCities', searchQuery);
      }, 300);
    } else if (searchQuery.trim() === '') {
      // Show default cities when search is empty
      setSearchResults(cities);
      setIsSearching(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, socket, cities]);

  const handleCitySelect = (city) => {
    setIsLoading(true);
    // If city has lat/lon from API search, use coordinates
    if (city.lat && city.lon) {
      socket.emit('changeLocation', city.city);
    } else {
      socket.emit('changeLocation', city.key);
    }
  };

  const getCountryFlag = (countryCode) => {
    // Convert country code to flag emoji
    if (!countryCode || countryCode.length !== 2) return '🌍';
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
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
              placeholder="Search any city worldwide..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="location-search-input"
            />
            {isSearching && (
              <Loader className="location-search-spinner" />
            )}
            {searchQuery && !isSearching && (
              <button 
                className="location-clear-btn"
                onClick={() => setSearchQuery('')}
              >
                <X />
              </button>
            )}
          </div>

          {searchQuery.length === 1 && (
            <div className="location-hint">
              <span>Type at least 2 characters to search globally</span>
            </div>
          )}

          <div className="location-list">
            {searchResults.length === 0 ? (
              <div className="location-no-results">
                <Globe />
                <span>No cities found</span>
                <span className="location-hint-text">Try searching for another city</span>
              </div>
            ) : (
              <>
                {searchQuery.length >= 2 && (
                  <div className="location-results-header">
                    <Globe size={14} />
                    <span>Global search results</span>
                  </div>
                )}
                {searchResults.map((city, index) => (
                  <button
                    key={`${city.city}-${city.country}-${index}`}
                    className={`location-item ${currentLocation?.city === city.city ? 'active' : ''}`}
                    onClick={() => handleCitySelect(city)}
                    disabled={isLoading}
                  >
                    <span className="location-item-flag">{getCountryFlag(city.country)}</span>
                    <span className="location-item-city">{city.city}</span>
                    <span className="location-item-country">{city.country}</span>
                    {city.state && <span className="location-item-state">{city.state}</span>}
                  </button>
                ))}
              </>
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
