import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Calendar, 
  Thermometer, 
  Droplets, 
  Wind, 
  Eye,
  ArrowLeft,
  RefreshCw,
  Sun,
  Cloud,
  CloudRain,
  MapPin
} from 'lucide-react';
import { Link } from 'react-router-dom';

const modelData = [
  { name: 'GFS', fullName: 'Global Forecast System', source: 'NCEP/NOAA', resolution: '0.25°', updateFreq: '6 hours' },
  { name: 'ECMWF', fullName: 'European Centre Model', source: 'ECMWF', resolution: '0.1°', updateFreq: '12 hours' },
  { name: 'WRF', fullName: 'Weather Research & Forecasting', source: 'IMD', resolution: '9 km', updateFreq: '6 hours' },
];

const generateForecastData = () => {
  const days = [];
  const conditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Thunderstorms'];
  
  for (let i = 1; i <= 10; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    
    days.push({
      day: i,
      date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      tempHigh: Math.round(28 + Math.random() * 10),
      tempLow: Math.round(18 + Math.random() * 8),
      humidity: Math.round(50 + Math.random() * 40),
      precipitation: Math.round(Math.random() * 80),
      windSpeed: Math.round(10 + Math.random() * 25),
      condition: conditions[Math.floor(Math.random() * conditions.length)],
      confidence: Math.round(95 - i * 5 + Math.random() * 10),
    });
  }
  return days;
};

export default function ShortMediumRangePage({ weatherData, socket }) {
  const [forecastData, setForecastData] = useState([]);
  const [selectedModel, setSelectedModel] = useState('GFS');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setForecastData(generateForecastData());
      setLoading(false);
    }, 800);
  }, [selectedModel]);

  const getConditionIcon = (condition) => {
    switch (condition.toLowerCase()) {
      case 'sunny': return <Sun className="condition-icon sunny" />;
      case 'partly cloudy': return <Cloud className="condition-icon cloudy" />;
      case 'cloudy': return <Cloud className="condition-icon overcast" />;
      case 'light rain':
      case 'thunderstorms': return <CloudRain className="condition-icon rainy" />;
      default: return <Sun className="condition-icon" />;
    }
  };

  return (
    <div className="forecast-subpage">
      <div className="page-bg">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
      </div>

      <div className="page-content">
        <Link to="/forecasts" className="back-link">
          <ArrowLeft size={20} />
          Back to Forecasts
        </Link>

        <header className="page-header">
          <TrendingUp className="page-header-icon" style={{ color: '#60a5fa' }} />
          <div>
            <h1 className="page-title">Short to Medium Range Forecast</h1>
            <p className="page-subtitle">1-10 Day Weather Predictions using Numerical Weather Models</p>
          </div>
        </header>

        {/* Model Selection */}
        <div className="card model-selection-card">
          <h3 className="card-section-title">Select Forecast Model</h3>
          <div className="model-buttons">
            {modelData.map((model) => (
              <button
                key={model.name}
                className={`model-btn ${selectedModel === model.name ? 'active' : ''}`}
                onClick={() => setSelectedModel(model.name)}
              >
                <span className="model-name">{model.name}</span>
                <span className="model-full">{model.fullName}</span>
              </button>
            ))}
          </div>
          <div className="model-info">
            {modelData.filter(m => m.name === selectedModel).map(m => (
              <div key={m.name} className="model-details">
                <span>Source: {m.source}</span>
                <span>Resolution: {m.resolution}</span>
                <span>Updates: {m.updateFreq}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Location Info */}
        <div className="card location-card">
          <div className="location-header">
            <MapPin size={20} />
            <span>{weatherData?.location?.city || 'New Delhi'}, {weatherData?.location?.country || 'India'}</span>
          </div>
          <p className="location-coords">
            Lat: {weatherData?.location?.lat?.toFixed(2) || '28.61'}° N, 
            Lon: {weatherData?.location?.lon?.toFixed(2) || '77.21'}° E
          </p>
        </div>

        {/* Forecast Grid */}
        <div className="card forecast-detail-card">
          <div className="card-header-row">
            <h3 className="card-section-title">10-Day Forecast</h3>
            <button className="refresh-btn-small" onClick={() => setForecastData(generateForecastData())}>
              <RefreshCw size={16} className={loading ? 'spinning' : ''} />
            </button>
          </div>

          {loading ? (
            <div className="loading-state">
              <RefreshCw size={32} className="spinning" />
              <p>Loading forecast data...</p>
            </div>
          ) : (
            <div className="forecast-detail-grid">
              {forecastData.map((day) => (
                <div key={day.day} className="forecast-detail-item">
                  <div className="forecast-day-header">
                    <span className="day-number">Day {day.day}</span>
                    <span className="day-date">{day.date}</span>
                  </div>
                  
                  <div className="forecast-condition">
                    {getConditionIcon(day.condition)}
                    <span>{day.condition}</span>
                  </div>

                  <div className="forecast-temps">
                    <span className="temp-high">{day.tempHigh}°</span>
                    <span className="temp-divider">/</span>
                    <span className="temp-low">{day.tempLow}°</span>
                  </div>

                  <div className="forecast-stats">
                    <div className="stat-row">
                      <Droplets size={14} />
                      <span>{day.humidity}%</span>
                    </div>
                    <div className="stat-row">
                      <CloudRain size={14} />
                      <span>{day.precipitation}%</span>
                    </div>
                    <div className="stat-row">
                      <Wind size={14} />
                      <span>{day.windSpeed} km/h</span>
                    </div>
                  </div>

                  <div className="confidence-bar">
                    <span className="confidence-label">Confidence</span>
                    <div className="confidence-track">
                      <div 
                        className="confidence-fill" 
                        style={{ width: `${day.confidence}%` }}
                      />
                    </div>
                    <span className="confidence-value">{day.confidence}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Model Comparison */}
        <div className="card">
          <h3 className="card-section-title">Model Guidance Notes</h3>
          <div className="guidance-notes">
            <div className="note-item">
              <strong>Short Range (1-3 days):</strong> High confidence predictions with detailed hourly breakdowns available.
            </div>
            <div className="note-item">
              <strong>Medium Range (4-7 days):</strong> Moderate confidence with general trend predictions.
            </div>
            <div className="note-item">
              <strong>Extended (8-10 days):</strong> Lower confidence, useful for general planning purposes.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
