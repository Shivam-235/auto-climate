import { useState, useEffect } from 'react';
import { 
  MapPin, 
  Thermometer, 
  Droplets, 
  Wind,
  Eye,
  RefreshCw,
  Cloud,
  Sun,
  CloudRain,
  CloudSnow,
  CloudFog,
  CloudLightning,
  AlertCircle
} from 'lucide-react';

const majorCities = [
  { name: 'New Delhi', lat: 28.6139, lon: 77.2090 },
  { name: 'Mumbai', lat: 19.0760, lon: 72.8777 },
  { name: 'Chennai', lat: 13.0827, lon: 80.2707 },
  { name: 'Kolkata', lat: 22.5726, lon: 88.3639 },
  { name: 'Bangalore', lat: 12.9716, lon: 77.5946 },
  { name: 'Hyderabad', lat: 17.3850, lon: 78.4867 },
  { name: 'Ahmedabad', lat: 23.0225, lon: 72.5714 },
  { name: 'Pune', lat: 18.5204, lon: 73.8567 },
  { name: 'Jaipur', lat: 26.9124, lon: 75.7873 },
  { name: 'Lucknow', lat: 26.8467, lon: 80.9462 },
  { name: 'Chandigarh', lat: 30.7333, lon: 76.7794 },
  { name: 'Bhopal', lat: 23.2599, lon: 77.4126 },
  { name: 'Patna', lat: 25.5941, lon: 85.1376 },
  { name: 'Thiruvananthapuram', lat: 8.5241, lon: 76.9366 },
  { name: 'Guwahati', lat: 26.1445, lon: 91.7362 },
  { name: 'Srinagar', lat: 34.0837, lon: 74.7973 }
];

const getWeatherIcon = (description) => {
  if (!description) return Cloud;
  const desc = description.toLowerCase();
  
  if (desc.includes('thunder') || desc.includes('storm')) return CloudLightning;
  if (desc.includes('rain') || desc.includes('drizzle') || desc.includes('shower')) return CloudRain;
  if (desc.includes('snow') || desc.includes('sleet')) return CloudSnow;
  if (desc.includes('fog') || desc.includes('mist') || desc.includes('haze')) return CloudFog;
  if (desc.includes('clear') || desc.includes('sunny')) return Sun;
  if (desc.includes('cloud')) return Cloud;
  
  return Cloud;
};

const getConditionColor = (description) => {
  if (!description) return '#94a3b8';
  const desc = description.toLowerCase();
  
  if (desc.includes('clear') || desc.includes('sunny')) return '#fbbf24';
  if (desc.includes('rain') || desc.includes('drizzle')) return '#60a5fa';
  if (desc.includes('thunder') || desc.includes('storm')) return '#a78bfa';
  if (desc.includes('snow')) return '#e2e8f0';
  if (desc.includes('fog') || desc.includes('mist') || desc.includes('haze')) return '#9ca3af';
  
  return '#94a3b8';
};

export default function MajorCitiesPage({ socket }) {
  const [citiesWeather, setCitiesWeather] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);

  const fetchCitiesWeather = () => {
    if (!socket) {
      setError('Socket connection not available');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    // Request weather data for all major cities via socket
    socket.emit('getMajorCitiesWeather', majorCities);
  };

  useEffect(() => {
    if (!socket) return;

    // Listen for major cities weather data response
    const handleMajorCitiesWeather = (response) => {
      setLoading(false);
      
      if (response.success && response.data) {
        const formattedData = response.data
          .filter(city => city.success)
          .map(city => ({
            city: city.cityName || city.location?.city || 'Unknown',
            temp: city.current?.temperature || 0,
            feelsLike: city.current?.feelsLike || 0,
            humidity: city.current?.humidity || 0,
            windSpeed: city.wind?.speed || 0,
            visibility: city.current?.visibility || 0,
            condition: city.current?.description || 'Unknown',
            pressure: city.current?.pressure || 0,
            aqi: city.aqi?.value || null,
            aqiLevel: city.aqi?.level || null
          }));
        
        setCitiesWeather(formattedData);
        setLastUpdated(new Date().toLocaleTimeString());
      } else {
        setError(response.error || 'Failed to fetch weather data');
      }
    };

    socket.on('majorCitiesWeatherData', handleMajorCitiesWeather);

    // Fetch initial data
    fetchCitiesWeather();

    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchCitiesWeather, 5 * 60 * 1000);

    return () => {
      socket.off('majorCitiesWeatherData', handleMajorCitiesWeather);
      clearInterval(interval);
    };
  }, [socket]);

  return (
    <div className="major-cities-page">
      <div className="page-bg">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />
      </div>

      <div className="page-content">
        <header className="page-header">
          <div className="page-header-top">
            <div>
              <h1 className="page-title">Current Weather Across Major Cities</h1>
              <p className="page-subtitle">Live weather updates from major Indian cities via OpenWeatherMap API</p>
            </div>
            <button 
              className="refresh-btn"
              onClick={fetchCitiesWeather}
              disabled={loading}
            >
              <RefreshCw size={18} className={loading ? 'spinning' : ''} />
              Refresh
            </button>
          </div>
          {lastUpdated && (
            <p className="last-updated">Last updated: {lastUpdated}</p>
          )}
        </header>

        <main className="cities-weather-grid">
          {loading ? (
            <div className="loading-state">
              <RefreshCw size={40} className="spinning" />
              <p>Fetching live weather data...</p>
            </div>
          ) : error ? (
            <div className="loading-state">
              <AlertCircle size={40} />
              <p>{error}</p>
              <button className="refresh-btn" onClick={fetchCitiesWeather}>
                Try Again
              </button>
            </div>
          ) : citiesWeather.length === 0 ? (
            <div className="loading-state">
              <AlertCircle size={40} />
              <p>No weather data available. Please check your API configuration.</p>
            </div>
          ) : (
            citiesWeather.map((weather, index) => {
              const WeatherIcon = getWeatherIcon(weather.condition);
              return (
                <div key={index} className="city-weather-card">
                  <div className="city-weather-header">
                    <div className="city-name">
                      <MapPin size={16} />
                      <span>{weather.city}</span>
                    </div>
                    <div 
                      className="city-condition"
                      style={{ color: getConditionColor(weather.condition) }}
                    >
                      <WeatherIcon size={24} />
                    </div>
                  </div>
                  
                  <div className="city-weather-temp">
                    <span className="temp-value">{Math.round(weather.temp)}°</span>
                    <span className="temp-unit">C</span>
                  </div>
                  
                  <div className="city-weather-condition">
                    {weather.condition.charAt(0).toUpperCase() + weather.condition.slice(1)}
                  </div>
                  
                  <div className="city-weather-details">
                    <div className="weather-detail">
                      <Thermometer size={14} />
                      <span>Feels {Math.round(weather.feelsLike)}°C</span>
                    </div>
                    <div className="weather-detail">
                      <Droplets size={14} />
                      <span>{weather.humidity}%</span>
                    </div>
                    <div className="weather-detail">
                      <Wind size={14} />
                      <span>{weather.windSpeed} km/h</span>
                    </div>
                    <div className="weather-detail">
                      <Eye size={14} />
                      <span>{weather.visibility} km</span>
                    </div>
                  </div>
                  
                  {weather.aqi && (
                    <div className="city-aqi-badge">
                      AQI: {weather.aqi} ({weather.aqiLevel})
                    </div>
                  )}
                </div>
              );
            })
          )}
        </main>
      </div>
    </div>
  );
}
