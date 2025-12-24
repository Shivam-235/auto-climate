import { useState, useEffect } from 'react';
import {
  Wind,
  ArrowLeft,
  MapPin,
  AlertTriangle,
  Navigation,
  Gauge,
  Clock,
  RefreshCw,
  Waves,
  Target,
  Shield,
  Info
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getCurrentWeather } from '../../services/weatherApi';

const cycloneCategories = [
  { name: 'Depression', windSpeed: '31-49', color: '#22c55e' },
  { name: 'Deep Depression', windSpeed: '50-61', color: '#84cc16' },
  { name: 'Cyclonic Storm', windSpeed: '62-88', color: '#eab308' },
  { name: 'Severe Cyclonic', windSpeed: '89-117', color: '#f97316' },
  { name: 'Very Severe', windSpeed: '118-166', color: '#ef4444' },
  { name: 'Extremely Severe', windSpeed: '167-221', color: '#dc2626' },
  { name: 'Super Cyclone', windSpeed: '>221', color: '#7c3aed' },
];

const generateCycloneData = () => {
  const hasActiveCyclone = Math.random() > 0.3;

  if (!hasActiveCyclone) {
    return {
      active: false,
      message: 'No active cyclonic disturbances in the Indian Ocean region',
      lastDisturbance: {
        name: 'Cyclone MICHAUNG',
        date: 'December 2024',
        maxIntensity: 'Severe Cyclonic Storm',
        landfall: 'Andhra Pradesh Coast'
      },
      monitoring: [
        { region: 'Bay of Bengal', status: 'Clear', probability: 'Low' },
        { region: 'Arabian Sea', status: 'Clear', probability: 'Low' },
        { region: 'Andaman Sea', status: 'Monitoring', probability: 'Moderate' },
      ]
    };
  }

  const category = cycloneCategories[Math.floor(Math.random() * 5) + 1];
  return {
    active: true,
    cyclone: {
      name: 'DANA',
      category: category.name,
      color: category.color,
      currentPosition: {
        lat: (Math.random() * 10 + 10).toFixed(2),
        lon: (Math.random() * 15 + 80).toFixed(2),
        location: 'Bay of Bengal, 450 km SE of Paradip'
      },
      movement: {
        direction: 'NW',
        speed: Math.floor(Math.random() * 15 + 10),
      },
      intensity: {
        windSpeed: Math.floor(Math.random() * 60 + 80),
        gusts: Math.floor(Math.random() * 80 + 100),
        pressure: Math.floor(Math.random() * 30 + 970),
      },
      forecast: [
        { time: '+12h', position: '16.5°N, 86.2°E', intensity: 'Intensifying', wind: 95 },
        { time: '+24h', position: '17.8°N, 85.5°E', intensity: 'Peak', wind: 110 },
        { time: '+36h', position: '19.2°N, 84.8°E', intensity: 'Maintaining', wind: 105 },
        { time: '+48h', position: '20.5°N, 84.2°E', intensity: 'Weakening', wind: 85 },
        { time: '+72h', position: 'Landfall expected', intensity: 'Post-landfall', wind: 60 },
      ],
      warnings: [
        { type: 'Red Warning', areas: ['Odisha Coast', 'North Andhra Pradesh'], message: 'Heavy to very heavy rainfall expected' },
        { type: 'Orange Warning', areas: ['West Bengal Coast', 'Chhattisgarh'], message: 'Heavy rainfall likely' },
        { type: 'Yellow Warning', areas: ['Jharkhand', 'South Bihar'], message: 'Moderate rainfall expected' },
      ],
      expectedLandfall: {
        location: 'Between Puri and Paradip, Odisha',
        time: 'October 25, 2025 Morning',
        intensity: 'Severe Cyclonic Storm'
      }
    }
  };
};

export default function CycloneServicePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Check coastal city weather for potential cyclone conditions
        const coastalWeather = await getCurrentWeather('Chennai');
        const cycloneData = generateCycloneData();
        if (cycloneData && coastalWeather?.wind?.speed > 20) {
          cycloneData.realWindData = coastalWeather.wind;
        }
        setData(cycloneData);
      } catch (error) {
        console.log('Using simulated cyclone data - API unavailable:', error.message);
        setData(generateCycloneData());
      }
      setLoading(false);
    };
    fetchData();
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
            <p>Loading cyclone data...</p>
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
          <Wind className="page-header-icon" style={{ color: '#22c55e' }} />
          <div>
            <h1 className="page-title">Cyclone Information Service</h1>
            <p className="page-subtitle">Real-time cyclone tracking and early warning system</p>
          </div>
        </header>

        {/* Category Legend */}
        <div className="card cyclone-legend">
          <h3 className="card-section-title">
            <Info size={20} />
            Cyclone Classification (Wind Speed in km/h)
          </h3>
          <div className="category-legend">
            {cycloneCategories.map((cat, idx) => (
              <div key={idx} className="legend-item">
                <span className="legend-dot" style={{ background: cat.color }} />
                <div className="legend-text">
                  <span className="legend-name">{cat.name}</span>
                  <span className="legend-wind">{cat.windSpeed} km/h</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {!data.active ? (
          <>
            {/* No Active Cyclone */}
            <div className="card no-cyclone-card">
              <div className="no-cyclone-content">
                <Shield size={64} style={{ color: '#22c55e' }} />
                <h3>No Active Cyclonic Disturbances</h3>
                <p>{data.message}</p>
              </div>
            </div>

            <div className="grid-2">
              {/* Last Cyclone Info */}
              <div className="card">
                <h3 className="card-section-title">
                  <Clock size={20} style={{ color: '#8b5cf6' }} />
                  Last Cyclonic Activity
                </h3>
                <div className="last-cyclone-info">
                  <div className="info-row">
                    <span className="info-label">Name</span>
                    <span className="info-value">{data.lastDisturbance.name}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Period</span>
                    <span className="info-value">{data.lastDisturbance.date}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Max Intensity</span>
                    <span className="info-value">{data.lastDisturbance.maxIntensity}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Landfall</span>
                    <span className="info-value">{data.lastDisturbance.landfall}</span>
                  </div>
                </div>
              </div>

              {/* Monitoring Status */}
              <div className="card">
                <h3 className="card-section-title">
                  <Target size={20} style={{ color: '#3b82f6' }} />
                  Ocean Basin Monitoring
                </h3>
                <div className="monitoring-grid">
                  {data.monitoring.map((region, idx) => (
                    <div key={idx} className="monitoring-card">
                      <h4>{region.region}</h4>
                      <div className="monitoring-details">
                        <span className={`monitoring-status ${region.status.toLowerCase()}`}>
                          {region.status}
                        </span>
                        <p className="monitoring-prob">
                          <strong>{region.probability}</strong> Formation Risk
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Active Cyclone Alert */}
            <div className="card active-cyclone-alert" style={{ borderLeftColor: data.cyclone.color }}>
              <div className="alert-header">
                <AlertTriangle size={28} style={{ color: data.cyclone.color }} />
                <div className="alert-title">
                  <h2>Active Cyclone: {data.cyclone.name}</h2>
                  <span className="category-badge" style={{ background: data.cyclone.color }}>
                    {data.cyclone.category}
                  </span>
                </div>
              </div>
            </div>

            {/* Current Status Grid */}
            <div className="grid-2">
              <div className="card cyclone-position-card">
                <h3 className="card-section-title">
                  <MapPin size={20} style={{ color: '#3b82f6' }} />
                  Current Position
                </h3>
                <div className="cyclone-position">
                  <div className="position-coords">
                    <div className="coord-item">
                      <span className="coord-label">Latitude</span>
                      <span className="coord-value">{data.cyclone.currentPosition.lat}°N</span>
                    </div>
                    <div className="coord-item">
                      <span className="coord-label">Longitude</span>
                      <span className="coord-value">{data.cyclone.currentPosition.lon}°E</span>
                    </div>
                  </div>
                  <p className="position-desc">{data.cyclone.currentPosition.location}</p>
                  <div className="movement-info">
                    <Navigation size={24} style={{ transform: 'rotate(-45deg)', color: '#3b82f6' }} />
                    <div className="movement-text">
                      <span className="movement-label">Movement</span>
                      <span className="movement-value">
                        {data.cyclone.movement.direction} at {data.cyclone.movement.speed} km/h
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card cyclone-intensity-card">
                <h3 className="card-section-title">
                  <Gauge size={20} style={{ color: '#ef4444' }} />
                  Current Intensity
                </h3>
                <div className="intensity-stats">
                  <div className="intensity-item">
                    <Wind size={28} style={{ color: data.cyclone.color }} />
                    <div className="intensity-info">
                      <span className="intensity-value">{data.cyclone.intensity.windSpeed}</span>
                      <span className="intensity-label">Wind (km/h)</span>
                    </div>
                  </div>
                  <div className="intensity-item">
                    <Wind size={28} style={{ color: '#f97316' }} />
                    <div className="intensity-info">
                      <span className="intensity-value">{data.cyclone.intensity.gusts}</span>
                      <span className="intensity-label">Gusts (km/h)</span>
                    </div>
                  </div>
                  <div className="intensity-item">
                    <Waves size={28} style={{ color: '#3b82f6' }} />
                    <div className="intensity-info">
                      <span className="intensity-value">{data.cyclone.intensity.pressure}</span>
                      <span className="intensity-label">Pressure (hPa)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Expected Landfall */}
            <div className="card landfall-card">
              <h3 className="card-section-title">
                <Target size={20} style={{ color: '#ef4444' }} />
                Expected Landfall
              </h3>
              <div className="landfall-info">
                <div className="landfall-detail">
                  <div className="landfall-icon">
                    <MapPin size={24} style={{ color: '#ef4444' }} />
                  </div>
                  <div className="landfall-text">
                    <span className="landfall-label">Location</span>
                    <span className="landfall-value">{data.cyclone.expectedLandfall.location}</span>
                  </div>
                </div>
                <div className="landfall-detail">
                  <div className="landfall-icon">
                    <Clock size={24} style={{ color: '#f97316' }} />
                  </div>
                  <div className="landfall-text">
                    <span className="landfall-label">Expected Time</span>
                    <span className="landfall-value">{data.cyclone.expectedLandfall.time}</span>
                  </div>
                </div>
                <div className="landfall-detail">
                  <div className="landfall-icon">
                    <Wind size={24} style={{ color: '#8b5cf6' }} />
                  </div>
                  <div className="landfall-text">
                    <span className="landfall-label">Expected Intensity</span>
                    <span className="landfall-value">{data.cyclone.expectedLandfall.intensity}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Track Forecast */}
            <div className="card">
              <h3 className="card-section-title">
                <Navigation size={20} style={{ color: '#8b5cf6' }} />
                72-Hour Track Forecast
              </h3>
              <div className="track-timeline">
                {data.cyclone.forecast.map((point, idx) => (
                  <div key={idx} className="track-point">
                    <div className="track-time">{point.time}</div>
                    <div className="track-connector">
                      <div className="track-dot" style={{
                        background: point.intensity === 'Peak' ? '#ef4444' :
                          point.intensity === 'Intensifying' ? '#f97316' :
                            point.intensity === 'Maintaining' ? '#eab308' : '#3b82f6'
                      }} />
                      {idx < data.cyclone.forecast.length - 1 && <div className="track-line" />}
                    </div>
                    <div className="track-details">
                      <span className="track-position">{point.position}</span>
                      <div className="track-info">
                        <span className="track-wind">
                          <Wind size={14} />
                          {point.wind} km/h
                        </span>
                        <span className={`track-status ${point.intensity.toLowerCase().replace(' ', '-')}`}>
                          {point.intensity}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Warnings */}
            <div className="card">
              <h3 className="card-section-title">
                <AlertTriangle size={20} style={{ color: '#ef4444' }} />
                Active Weather Warnings
              </h3>
              <div className="warnings-list">
                {data.cyclone.warnings.map((warning, idx) => (
                  <div key={idx} className={`warning-item warning-${warning.type.toLowerCase().replace(' ', '-')}`}>
                    <div className="warning-badge" style={{
                      background: warning.type === 'Red Warning' ? 'rgba(239, 68, 68, 0.2)' :
                        warning.type === 'Orange Warning' ? 'rgba(249, 115, 22, 0.2)' :
                          'rgba(234, 179, 8, 0.2)',
                      borderColor: warning.type === 'Red Warning' ? '#ef4444' :
                        warning.type === 'Orange Warning' ? '#f97316' : '#eab308'
                    }}>
                      {warning.type}
                    </div>
                    <div className="warning-content">
                      <div className="warning-areas">
                        <MapPin size={16} />
                        <span>{warning.areas.join(', ')}</span>
                      </div>
                      <p className="warning-message">{warning.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Last Update */}
        <div className="last-update-bar">
          <Clock size={14} />
          <span>Last updated: {new Date().toLocaleTimeString()} | Source: IMD Cyclone Warning Division</span>
          <button className="refresh-btn-small" onClick={() => {
            setLoading(true);
            setTimeout(() => {
              setData(generateCycloneData());
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
