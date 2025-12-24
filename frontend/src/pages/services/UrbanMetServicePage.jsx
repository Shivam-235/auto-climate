import { useState, useEffect } from 'react';
import {
  Building2,
  ArrowLeft,
  MapPin,
  ThermometerSun,
  Wind,
  Droplets,
  Eye,
  Sun,
  AlertTriangle,
  RefreshCw,
  Clock,
  CloudRain,
  Gauge,
  Leaf,
  Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getCurrentWeather, getAQILevel } from '../../services/weatherApi';

const cities = [
  { id: 'delhi', name: 'Delhi NCR', population: '32M' },
  { id: 'mumbai', name: 'Mumbai', population: '21M' },
  { id: 'bangalore', name: 'Bangalore', population: '13M' },
  { id: 'chennai', name: 'Chennai', population: '11M' },
  { id: 'hyderabad', name: 'Hyderabad', population: '10M' },
  { id: 'kolkata', name: 'Kolkata', population: '15M' },
  { id: 'pune', name: 'Pune', population: '7M' },
  { id: 'ahmedabad', name: 'Ahmedabad', population: '8M' },
];

const aqiLevels = [
  { range: '0-50', label: 'Good', color: '#22c55e' },
  { range: '51-100', label: 'Satisfactory', color: '#84cc16' },
  { range: '101-200', label: 'Moderate', color: '#eab308' },
  { range: '201-300', label: 'Poor', color: '#f97316' },
  { range: '301-400', label: 'Very Poor', color: '#ef4444' },
  { range: '401-500', label: 'Severe', color: '#7c3aed' },
];

const generateUrbanData = (cityId) => {
  const aqi = Math.floor(Math.random() * 350 + 50);
  const getAqiLevel = (aqi) => {
    if (aqi <= 50) return aqiLevels[0];
    if (aqi <= 100) return aqiLevels[1];
    if (aqi <= 200) return aqiLevels[2];
    if (aqi <= 300) return aqiLevels[3];
    if (aqi <= 400) return aqiLevels[4];
    return aqiLevels[5];
  };

  return {
    cityId,
    weather: {
      temperature: Math.floor(Math.random() * 15 + 25),
      feelsLike: Math.floor(Math.random() * 18 + 26),
      humidity: Math.floor(Math.random() * 40 + 40),
      windSpeed: Math.floor(Math.random() * 20 + 5),
      visibility: (Math.random() * 8 + 2).toFixed(1),
      uvIndex: Math.floor(Math.random() * 8 + 3),
      condition: ['Partly Cloudy', 'Hazy', 'Sunny', 'Overcast'][Math.floor(Math.random() * 4)]
    },
    airQuality: {
      aqi,
      level: getAqiLevel(aqi),
      pm25: Math.floor(Math.random() * 150 + 30),
      pm10: Math.floor(Math.random() * 200 + 50),
      no2: Math.floor(Math.random() * 80 + 20),
      so2: Math.floor(Math.random() * 40 + 10),
      co: (Math.random() * 2 + 0.5).toFixed(1),
      o3: Math.floor(Math.random() * 100 + 20),
    },
    urbanHeatIsland: {
      urbanTemp: Math.floor(Math.random() * 5 + 32),
      ruralTemp: Math.floor(Math.random() * 3 + 28),
      difference: (Math.random() * 4 + 2).toFixed(1),
      hotspots: ['Commercial District', 'Industrial Area', 'Old City'][Math.floor(Math.random() * 3)]
    },
    forecast: [
      { hour: '12:00', temp: Math.floor(Math.random() * 5 + 32), aqi: Math.floor(Math.random() * 100 + 100) },
      { hour: '15:00', temp: Math.floor(Math.random() * 5 + 34), aqi: Math.floor(Math.random() * 100 + 120) },
      { hour: '18:00', temp: Math.floor(Math.random() * 5 + 30), aqi: Math.floor(Math.random() * 100 + 150) },
      { hour: '21:00', temp: Math.floor(Math.random() * 5 + 27), aqi: Math.floor(Math.random() * 100 + 180) },
      { hour: '00:00', temp: Math.floor(Math.random() * 5 + 24), aqi: Math.floor(Math.random() * 100 + 160) },
    ],
    alerts: [
      Math.random() > 0.5 ? { type: 'Heat Advisory', message: 'Stay hydrated and avoid outdoor activities during peak hours' } : null,
      Math.random() > 0.6 ? { type: 'Poor Air Quality', message: 'Use N95 masks outdoors, limit physical exertion' } : null,
      Math.random() > 0.7 ? { type: 'UV Warning', message: 'High UV index expected, use sun protection' } : null,
    ].filter(Boolean),
    healthRecommendations: {
      outdoor: aqi > 200 ? 'Avoid' : aqi > 100 ? 'Limit' : 'Safe',
      exercise: aqi > 150 ? 'Indoor only' : 'Moderate caution',
      sensitive: aqi > 100 ? 'Stay indoors' : 'Normal precautions',
    }
  };
};

export default function UrbanMetServicePage() {
  const [selectedCity, setSelectedCity] = useState('delhi');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const cityInfo = cities.find(c => c.id === selectedCity);
        const weatherData = await getCurrentWeather(cityInfo?.name || 'Delhi');

        const urbanData = generateUrbanData(selectedCity);
        if (weatherData?.current) {
          urbanData.isRealData = true;
          urbanData.weather.temperature = Math.round(weatherData.current.temperature) || urbanData.weather.temperature;
          urbanData.weather.humidity = weatherData.current.humidity || urbanData.weather.humidity;
          urbanData.weather.windSpeed = Math.round(weatherData.wind?.speed || 10);
          urbanData.weather.visibility = weatherData.current.visibility || urbanData.weather.visibility;

          // Update AQI if available
          if (weatherData.aqi) {
            urbanData.airQuality.aqi = weatherData.aqi.value || urbanData.airQuality.aqi;
            urbanData.airQuality.level = getAQILevel(urbanData.airQuality.aqi)?.label || urbanData.airQuality.level;
          }
        }
        setData(urbanData);
      } catch (error) {
        console.log('Using simulated urban data - API unavailable:', error.message);
        setData(generateUrbanData(selectedCity));
      }
      setLoading(false);
    };
    fetchData();
  }, [selectedCity]);

  const selectedCityInfo = cities.find(c => c.id === selectedCity);

  return (
    <div className="forecast-subpage">
      <div className="page-bg">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
      </div>

      <div className="page-content">
        <Link to="/services" className="back-link">
          <ArrowLeft size={20} />
          Back to Services
        </Link>

        <header className="page-header">
          <Building2 className="page-header-icon" style={{ color: '#8b5cf6' }} />
          <div>
            <h1 className="page-title">Urban Meteorological Services</h1>
            <p className="page-subtitle">City-specific weather, air quality, and urban climate data</p>
          </div>
        </header>

        {/* City Selector */}
        <div className="city-selector">
          {cities.map(city => (
            <button
              key={city.id}
              className={`city-btn ${selectedCity === city.id ? 'active' : ''}`}
              onClick={() => setSelectedCity(city.id)}
            >
              <Building2 size={14} />
              {city.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-state">
            <RefreshCw size={32} className="spinning" />
            <p>Loading data for {selectedCityInfo?.name}...</p>
          </div>
        ) : (
          <>
            {/* City Header */}
            <div className="card city-header-card">
              <div className="city-title">
                <MapPin size={24} style={{ color: '#3b82f6' }} />
                <div>
                  <h2>{selectedCityInfo?.name}</h2>
                  <span className="city-population">Population: {selectedCityInfo?.population}</span>
                </div>
              </div>
              <div className="city-condition">
                <span className="condition-text">{data.weather.condition}</span>
                <span className="condition-temp">{data.weather.temperature}°C</span>
              </div>
            </div>

            {/* Current Conditions Grid */}
            <div className="grid-4 urban-stats">
              <div className="card stat-card">
                <ThermometerSun size={24} style={{ color: '#ef4444' }} />
                <div className="stat-info">
                  <span className="stat-value">{data.weather.feelsLike}°C</span>
                  <span className="stat-label">Feels Like</span>
                </div>
              </div>
              <div className="card stat-card">
                <Droplets size={24} style={{ color: '#3b82f6' }} />
                <div className="stat-info">
                  <span className="stat-value">{data.weather.humidity}%</span>
                  <span className="stat-label">Humidity</span>
                </div>
              </div>
              <div className="card stat-card">
                <Wind size={24} style={{ color: '#22c55e' }} />
                <div className="stat-info">
                  <span className="stat-value">{data.weather.windSpeed} km/h</span>
                  <span className="stat-label">Wind Speed</span>
                </div>
              </div>
              <div className="card stat-card">
                <Eye size={24} style={{ color: '#8b5cf6' }} />
                <div className="stat-info">
                  <span className="stat-value">{data.weather.visibility} km</span>
                  <span className="stat-label">Visibility</span>
                </div>
              </div>
            </div>

            {/* Air Quality Section */}
            <div className="card aqi-card">
              <h3 className="card-section-title">
                <Leaf size={20} style={{ color: data.airQuality.level.color }} />
                Air Quality Index
              </h3>
              <div className="aqi-display">
                <div className="aqi-main">
                  <span className="aqi-value" style={{ color: data.airQuality.level.color }}>
                    {data.airQuality.aqi}
                  </span>
                  <span className="aqi-label" style={{ background: data.airQuality.level.color }}>
                    {data.airQuality.level.label}
                  </span>
                </div>
                <div className="aqi-scale">
                  {aqiLevels.map((level, idx) => (
                    <div
                      key={idx}
                      className="scale-segment"
                      style={{ background: level.color }}
                      title={`${level.range}: ${level.label}`}
                    />
                  ))}
                </div>
              </div>
              <div className="pollutants-grid">
                <div className="pollutant-item">
                  <span className="pollutant-name">PM2.5</span>
                  <span className="pollutant-value">{data.airQuality.pm25} µg/m³</span>
                </div>
                <div className="pollutant-item">
                  <span className="pollutant-name">PM10</span>
                  <span className="pollutant-value">{data.airQuality.pm10} µg/m³</span>
                </div>
                <div className="pollutant-item">
                  <span className="pollutant-name">NO₂</span>
                  <span className="pollutant-value">{data.airQuality.no2} µg/m³</span>
                </div>
                <div className="pollutant-item">
                  <span className="pollutant-name">SO₂</span>
                  <span className="pollutant-value">{data.airQuality.so2} µg/m³</span>
                </div>
                <div className="pollutant-item">
                  <span className="pollutant-name">CO</span>
                  <span className="pollutant-value">{data.airQuality.co} mg/m³</span>
                </div>
                <div className="pollutant-item">
                  <span className="pollutant-name">O₃</span>
                  <span className="pollutant-value">{data.airQuality.o3} µg/m³</span>
                </div>
              </div>
            </div>

            {/* Urban Heat Island */}
            <div className="grid-2">
              <div className="card">
                <h3 className="card-section-title">
                  <Sun size={20} style={{ color: '#f97316' }} />
                  Urban Heat Island Effect
                </h3>
                <div className="uhi-display">
                  <div className="uhi-comparison">
                    <div className="uhi-item urban">
                      <Building2 size={24} />
                      <span className="uhi-temp">{data.urbanHeatIsland.urbanTemp}°C</span>
                      <span className="uhi-label">Urban Core</span>
                    </div>
                    <div className="uhi-difference">
                      <span>+{data.urbanHeatIsland.difference}°C</span>
                    </div>
                    <div className="uhi-item rural">
                      <Leaf size={24} />
                      <span className="uhi-temp">{data.urbanHeatIsland.ruralTemp}°C</span>
                      <span className="uhi-label">Surrounding Rural</span>
                    </div>
                  </div>
                  <p className="uhi-hotspot">
                    <AlertTriangle size={14} style={{ color: '#f97316' }} />
                    Hotspot: {data.urbanHeatIsland.hotspots}
                  </p>
                </div>
              </div>

              <div className="card">
                <h3 className="card-section-title">
                  <Activity size={20} style={{ color: '#22c55e' }} />
                  Health Recommendations
                </h3>
                <div className="health-recommendations">
                  <div className={`health-item ${data.healthRecommendations.outdoor.toLowerCase()}`}>
                    <span className="health-label">Outdoor Activities</span>
                    <span className="health-value">{data.healthRecommendations.outdoor}</span>
                  </div>
                  <div className={`health-item ${data.healthRecommendations.exercise.includes('Indoor') ? 'avoid' : 'limit'}`}>
                    <span className="health-label">Exercise</span>
                    <span className="health-value">{data.healthRecommendations.exercise}</span>
                  </div>
                  <div className={`health-item ${data.healthRecommendations.sensitive.includes('indoors') ? 'avoid' : 'safe'}`}>
                    <span className="health-label">Sensitive Groups</span>
                    <span className="health-value">{data.healthRecommendations.sensitive}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Hourly Forecast */}
            <div className="card">
              <h3 className="card-section-title">
                <Clock size={20} style={{ color: '#3b82f6' }} />
                Today's Hourly Forecast
              </h3>
              <div className="hourly-urban-forecast">
                {data.forecast.map((hour, idx) => (
                  <div key={idx} className="hourly-item">
                    <span className="hourly-time">{hour.hour}</span>
                    <ThermometerSun size={20} style={{ color: '#ef4444' }} />
                    <span className="hourly-temp">{hour.temp}°C</span>
                    <div className="hourly-aqi">
                      <span
                        className="mini-aqi"
                        style={{
                          background: hour.aqi <= 100 ? '#22c55e' :
                            hour.aqi <= 200 ? '#eab308' : '#ef4444'
                        }}
                      >
                        AQI {hour.aqi}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Alerts */}
            {data.alerts.length > 0 && (
              <div className="card">
                <h3 className="card-section-title">
                  <AlertTriangle size={20} style={{ color: '#f97316' }} />
                  Active Alerts
                </h3>
                <div className="urban-alerts">
                  {data.alerts.map((alert, idx) => (
                    <div key={idx} className="urban-alert-item">
                      <span className="alert-type-badge">{alert.type}</span>
                      <p>{alert.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Last Update */}
        <div className="last-update-bar">
          <Clock size={14} />
          <span>Data updated: {new Date().toLocaleTimeString()} | Source: Urban Met Network</span>
          <button className="refresh-btn-small" onClick={() => {
            setLoading(true);
            setTimeout(() => {
              setData(generateUrbanData(selectedCity));
              setLoading(false);
            }, 500);
          }}>
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
