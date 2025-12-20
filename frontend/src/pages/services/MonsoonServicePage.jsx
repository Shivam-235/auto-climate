import { useState, useEffect } from 'react';
import { 
  Cloud, 
  ArrowLeft,
  MapPin,
  Droplets,
  Wind,
  Calendar,
  TrendingUp,
  Navigation,
  RefreshCw,
  Clock,
  ThermometerSun,
  Waves
} from 'lucide-react';
import { Link } from 'react-router-dom';

const monsoonPhases = [
  { id: 'onset', name: 'Onset Phase', color: '#22c55e' },
  { id: 'advance', name: 'Advancing', color: '#3b82f6' },
  { id: 'active', name: 'Active Monsoon', color: '#8b5cf6' },
  { id: 'break', name: 'Break Period', color: '#eab308' },
  { id: 'withdrawal', name: 'Withdrawal', color: '#f97316' },
];

const generateMonsoonData = () => {
  const currentPhase = monsoonPhases[Math.floor(Math.random() * monsoonPhases.length)];
  return {
    currentPhase,
    onsetDate: 'June 1, 2025',
    currentPosition: 'Central India (18°N)',
    nextAdvance: 'Expected in 2-3 days',
    seasonalProgress: Math.floor(Math.random() * 40 + 40),
    regions: [
      { name: 'Kerala Coast', status: 'Active', rainfall: (Math.random() * 300 + 100).toFixed(0), normal: '250' },
      { name: 'Karnataka', status: 'Active', rainfall: (Math.random() * 200 + 50).toFixed(0), normal: '180' },
      { name: 'Goa', status: 'Active', rainfall: (Math.random() * 350 + 150).toFixed(0), normal: '320' },
      { name: 'Maharashtra', status: 'Active', rainfall: (Math.random() * 250 + 100).toFixed(0), normal: '220' },
      { name: 'Gujarat', status: 'Advancing', rainfall: (Math.random() * 150 + 30).toFixed(0), normal: '140' },
      { name: 'Madhya Pradesh', status: 'Advancing', rainfall: (Math.random() * 100 + 20).toFixed(0), normal: '110' },
      { name: 'Rajasthan', status: 'Awaiting', rainfall: (Math.random() * 30).toFixed(0), normal: '80' },
      { name: 'Delhi NCR', status: 'Awaiting', rainfall: (Math.random() * 20).toFixed(0), normal: '70' },
    ],
    indicators: {
      windDirection: ['SW', 'SSW', 'WSW'][Math.floor(Math.random() * 3)],
      windSpeed: Math.floor(Math.random() * 30 + 15),
      humidity: Math.floor(Math.random() * 30 + 60),
      seaTemp: (Math.random() * 2 + 28).toFixed(1),
      pressureTrend: ['Falling', 'Steady', 'Rising'][Math.floor(Math.random() * 3)],
    },
    forecast: [
      { day: 'Today', condition: 'Heavy Rain', rainfall: Math.floor(Math.random() * 50 + 20) },
      { day: 'Tomorrow', condition: 'Moderate Rain', rainfall: Math.floor(Math.random() * 40 + 10) },
      { day: 'Day 3', condition: 'Light Rain', rainfall: Math.floor(Math.random() * 20 + 5) },
      { day: 'Day 4', condition: 'Scattered Showers', rainfall: Math.floor(Math.random() * 30 + 10) },
      { day: 'Day 5', condition: 'Heavy Rain', rainfall: Math.floor(Math.random() * 60 + 30) },
    ]
  };
};

export default function MonsoonServicePage() {
  const [monsoonData, setMonsoonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('status');

  useEffect(() => {
    setTimeout(() => {
      setMonsoonData(generateMonsoonData());
      setLoading(false);
    }, 800);
  }, []);

  if (loading) {
    return (
      <div className="forecast-subpage">
        <div className="page-bg">
          <div className="bg-orb bg-orb-1" />
          <div className="bg-orb bg-orb-2" />
        </div>
        <div className="page-content">
          <div className="loading-state">
            <RefreshCw size={32} className="spinning" />
            <p>Loading monsoon data...</p>
          </div>
        </div>
      </div>
    );
  }

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
          <Cloud className="page-header-icon" style={{ color: '#eab308' }} />
          <div>
            <h1 className="page-title">Monsoon Information Service</h1>
            <p className="page-subtitle">Comprehensive monsoon tracking and seasonal forecasts</p>
          </div>
        </header>

        {/* Current Status Banner */}
        <div className="card monsoon-status-banner" style={{ borderLeft: `4px solid ${monsoonData.currentPhase.color}` }}>
          <div className="status-main">
            <div className="status-phase">
              <span className="phase-badge" style={{ background: monsoonData.currentPhase.color }}>
                {monsoonData.currentPhase.name}
              </span>
              <h3>Current Monsoon Position</h3>
              <p className="position-text">{monsoonData.currentPosition}</p>
            </div>
            <div className="status-details">
              <div className="detail-item">
                <Calendar size={16} />
                <span>Onset: {monsoonData.onsetDate}</span>
              </div>
              <div className="detail-item">
                <Navigation size={16} />
                <span>{monsoonData.nextAdvance}</span>
              </div>
            </div>
          </div>
          <div className="progress-section">
            <span className="progress-label">Season Progress</span>
            <div className="progress-bar-bg">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${monsoonData.seasonalProgress}%`, background: monsoonData.currentPhase.color }}
              />
            </div>
            <span className="progress-value">{monsoonData.seasonalProgress}%</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button 
            className={`tab-btn ${activeTab === 'status' ? 'active' : ''}`}
            onClick={() => setActiveTab('status')}
          >
            <Cloud size={16} />
            Regional Status
          </button>
          <button 
            className={`tab-btn ${activeTab === 'indicators' ? 'active' : ''}`}
            onClick={() => setActiveTab('indicators')}
          >
            <TrendingUp size={16} />
            Monsoon Indicators
          </button>
          <button 
            className={`tab-btn ${activeTab === 'forecast' ? 'active' : ''}`}
            onClick={() => setActiveTab('forecast')}
          >
            <Calendar size={16} />
            5-Day Outlook
          </button>
        </div>

        {activeTab === 'status' && (
          <div className="card">
            <h3 className="card-section-title">
              <MapPin size={20} style={{ color: '#3b82f6' }} />
              Region-wise Monsoon Status
            </h3>
            <div className="monsoon-regions-grid">
              {monsoonData.regions.map((region, idx) => (
                <div key={idx} className="monsoon-region-card">
                  <div className="region-header">
                    <h4>{region.name}</h4>
                    <span className={`status-tag ${region.status.toLowerCase()}`}>
                      {region.status}
                    </span>
                  </div>
                  <div className="region-rainfall">
                    <div className="rainfall-main">
                      <Droplets size={20} style={{ color: '#3b82f6' }} />
                      <span className="rainfall-value">{region.rainfall} mm</span>
                    </div>
                    <span className="rainfall-normal">Normal: {region.normal} mm</span>
                  </div>
                  <div className="rainfall-bar-bg">
                    <div 
                      className="rainfall-bar-fill"
                      style={{ 
                        width: `${Math.min((parseFloat(region.rainfall) / parseFloat(region.normal)) * 100, 150)}%`,
                        background: parseFloat(region.rainfall) > parseFloat(region.normal) ? '#22c55e' : '#3b82f6'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'indicators' && (
          <div className="grid-2">
            <div className="card">
              <h3 className="card-section-title">
                <Wind size={20} style={{ color: '#22c55e' }} />
                Wind Patterns
              </h3>
              <div className="indicator-grid">
                <div className="indicator-item">
                  <Navigation size={32} style={{ color: '#3b82f6', transform: 'rotate(225deg)' }} />
                  <div className="indicator-info">
                    <span className="indicator-value">{monsoonData.indicators.windDirection}</span>
                    <span className="indicator-label">Wind Direction</span>
                  </div>
                </div>
                <div className="indicator-item">
                  <Wind size={32} style={{ color: '#22c55e' }} />
                  <div className="indicator-info">
                    <span className="indicator-value">{monsoonData.indicators.windSpeed} km/h</span>
                    <span className="indicator-label">Wind Speed</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="card-section-title">
                <Waves size={20} style={{ color: '#3b82f6' }} />
                Ocean & Atmosphere
              </h3>
              <div className="indicator-grid">
                <div className="indicator-item">
                  <Droplets size={32} style={{ color: '#3b82f6' }} />
                  <div className="indicator-info">
                    <span className="indicator-value">{monsoonData.indicators.humidity}%</span>
                    <span className="indicator-label">Humidity</span>
                  </div>
                </div>
                <div className="indicator-item">
                  <ThermometerSun size={32} style={{ color: '#f97316' }} />
                  <div className="indicator-info">
                    <span className="indicator-value">{monsoonData.indicators.seaTemp}°C</span>
                    <span className="indicator-label">Sea Surface Temp</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="card full-width">
              <h3 className="card-section-title">
                <TrendingUp size={20} style={{ color: '#8b5cf6' }} />
                Pressure Trend
              </h3>
              <div className="pressure-indicator">
                <span className={`pressure-status ${monsoonData.indicators.pressureTrend.toLowerCase()}`}>
                  {monsoonData.indicators.pressureTrend}
                </span>
                <p className="pressure-note">
                  {monsoonData.indicators.pressureTrend === 'Falling' 
                    ? 'Favorable for monsoon advancement' 
                    : monsoonData.indicators.pressureTrend === 'Rising'
                    ? 'May slow monsoon progress'
                    : 'Stable monsoon conditions expected'}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'forecast' && (
          <div className="card">
            <h3 className="card-section-title">
              <Calendar size={20} style={{ color: '#8b5cf6' }} />
              5-Day Monsoon Forecast
            </h3>
            <div className="forecast-timeline">
              {monsoonData.forecast.map((day, idx) => (
                <div key={idx} className="forecast-day-card">
                  <span className="forecast-day-label">{day.day}</span>
                  <div className="forecast-icon">
                    <Cloud size={32} style={{ color: '#3b82f6' }} />
                  </div>
                  <span className="forecast-condition">{day.condition}</span>
                  <div className="forecast-rainfall">
                    <Droplets size={16} style={{ color: '#3b82f6' }} />
                    <span>{day.rainfall} mm</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Last Update */}
        <div className="last-update-bar">
          <Clock size={14} />
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
          <button className="refresh-btn-small" onClick={() => {
            setLoading(true);
            setTimeout(() => {
              setMonsoonData(generateMonsoonData());
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
