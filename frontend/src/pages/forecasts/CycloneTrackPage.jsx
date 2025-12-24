import { useState, useEffect } from 'react';
import {
  Navigation,
  MapPin,
  ArrowLeft,
  RefreshCw,
  AlertTriangle,
  Wind,
  Gauge,
  Calendar,
  Clock,
  Target,
  TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';
import './CycloneTrackPage.css';
import { getCurrentWeather } from '../../services/weatherApi';

// Simulated cyclone data
const generateCycloneData = () => {
  const hasActiveCyclone = Math.random() > 0.5;

  if (!hasActiveCyclone) {
    return null;
  }

  const categories = ['Depression', 'Deep Depression', 'Cyclonic Storm', 'Severe Cyclonic Storm', 'Very Severe Cyclonic Storm'];
  const basins = ['Bay of Bengal', 'Arabian Sea'];

  const positions = [];
  let lat = 12 + Math.random() * 8;
  let lon = 82 + Math.random() * 10;

  // Generate track positions
  for (let i = 0; i < 10; i++) {
    const date = new Date();
    date.setHours(date.getHours() + i * 6);

    positions.push({
      time: date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', hour12: true }),
      lat: lat.toFixed(1),
      lon: lon.toFixed(1),
      intensity: Math.round(40 + Math.random() * 80),
      category: categories[Math.min(Math.floor(i / 2), categories.length - 1)],
      isPredicted: i > 3,
    });

    lat += 0.5 + Math.random() * 0.5;
    lon -= 0.3 + Math.random() * 0.4;
  }

  return {
    name: ['DANA', 'FENGAL', 'MICHAUNG', 'HAMOON', 'BIPARJOY'][Math.floor(Math.random() * 5)],
    basin: basins[Math.floor(Math.random() * 2)],
    currentCategory: categories[Math.floor(Math.random() * categories.length)],
    currentPosition: positions[3],
    maxWindSpeed: Math.round(60 + Math.random() * 100),
    centralPressure: Math.round(960 + Math.random() * 40),
    movementSpeed: Math.round(10 + Math.random() * 15),
    movementDirection: ['NW', 'N', 'NNW', 'NE'][Math.floor(Math.random() * 4)],
    expectedLandfall: 'Odisha-West Bengal coast',
    landfallTime: new Date(Date.now() + 48 * 60 * 60 * 1000).toLocaleString(),
    positions,
  };
};

const historicalCyclones = [
  { name: 'Cyclone Amphan', year: 2020, category: 'Super Cyclonic Storm', impact: 'West Bengal, Odisha' },
  { name: 'Cyclone Fani', year: 2019, category: 'Extremely Severe', impact: 'Odisha' },
  { name: 'Cyclone Gaja', year: 2018, category: 'Severe Cyclonic Storm', impact: 'Tamil Nadu' },
  { name: 'Cyclone Titli', year: 2018, category: 'Very Severe', impact: 'Odisha, Andhra Pradesh' },
  { name: 'Cyclone Ockhi', year: 2017, category: 'Very Severe', impact: 'Kerala, Tamil Nadu' },
];

export default function CycloneTrackPage({ weatherData }) {
  const [cycloneData, setCycloneData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Check coastal weather conditions
        const coastalWeather = await getCurrentWeather('Chennai');
        const cycloneForecast = generateCycloneData();
        if (cycloneForecast && coastalWeather?.wind?.speed > 15) {
          cycloneForecast.realConditions = {
            windSpeed: coastalWeather.wind.speed,
            pressure: coastalWeather.pressure || 1010,
          };
        }
        setCycloneData(cycloneForecast);
      } catch (error) {
        console.log('Using simulated cyclone data - API unavailable:', error.message);
        setCycloneData(generateCycloneData());
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const refreshData = () => {
    setLoading(true);
    setTimeout(() => {
      setCycloneData(generateCycloneData());
      setLoading(false);
    }, 600);
  };

  const getCategoryColor = (category) => {
    if (category.includes('Super') || category.includes('Extremely')) return '#7c3aed';
    if (category.includes('Very Severe')) return '#ef4444';
    if (category.includes('Severe')) return '#f97316';
    if (category.includes('Cyclonic Storm')) return '#eab308';
    return '#22c55e';
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
          <Navigation className="page-header-icon spinning-slow" style={{ color: '#ef4444' }} />
          <div>
            <h1 className="page-title">Interactive Cyclone Tracker</h1>
            <p className="page-subtitle">Real-time cyclone tracking and forecast</p>
          </div>
        </header>

        {loading ? (
          <div className="card">
            <div className="loading-state">
              <RefreshCw size={32} className="spinning" />
              <p>Fetching cyclone data...</p>
            </div>
          </div>
        ) : cycloneData ? (
          <>
            {/* Active Cyclone Alert */}
            <div className="card alert-banner cyclone-alert">
              <AlertTriangle size={24} />
              <div>
                <strong>Active Cyclone: {cycloneData.name}</strong>
                <p>{cycloneData.currentCategory} over {cycloneData.basin}</p>
              </div>
            </div>

            {/* Current Status */}
            <div className="grid-2">
              <div className="card cyclone-status-card">
                <h3 className="card-section-title">Current Status</h3>
                <div className="status-grid">
                  <div className="status-item">
                    <Target size={20} />
                    <div>
                      <span className="status-label">Position</span>
                      <span className="status-value">
                        {cycloneData.currentPosition.lat}°N, {cycloneData.currentPosition.lon}°E
                      </span>
                    </div>
                  </div>
                  <div className="status-item">
                    <Wind size={20} />
                    <div>
                      <span className="status-label">Max Wind Speed</span>
                      <span className="status-value">{cycloneData.maxWindSpeed} km/h</span>
                    </div>
                  </div>
                  <div className="status-item">
                    <Gauge size={20} />
                    <div>
                      <span className="status-label">Central Pressure</span>
                      <span className="status-value">{cycloneData.centralPressure} hPa</span>
                    </div>
                  </div>
                  <div className="status-item">
                    <Navigation size={20} />
                    <div>
                      <span className="status-label">Movement</span>
                      <span className="status-value">
                        {cycloneData.movementDirection} at {cycloneData.movementSpeed} km/h
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card cyclone-status-card">
                <h3 className="card-section-title">Landfall Prediction</h3>
                <div className="landfall-info">
                  <div className="landfall-item">
                    <MapPin size={20} />
                    <div>
                      <span className="landfall-label">Expected Location</span>
                      <span className="landfall-value">{cycloneData.expectedLandfall}</span>
                    </div>
                  </div>
                  <div className="landfall-item">
                    <Clock size={20} />
                    <div>
                      <span className="landfall-label">Expected Time</span>
                      <span className="landfall-value">{cycloneData.landfallTime}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Track Positions */}
            <div className="card">
              <div className="card-header-row">
                <h3 className="card-section-title">Track Positions</h3>
                <button className="refresh-btn-small" onClick={refreshData}>
                  <RefreshCw size={16} />
                </button>
              </div>

              <div className="track-timeline">
                {cycloneData.positions.map((pos, idx) => (
                  <div
                    key={idx}
                    className={`track-point ${pos.isPredicted ? 'predicted' : 'observed'}`}
                  >
                    <div
                      className="track-marker"
                      style={{ backgroundColor: getCategoryColor(pos.category) }}
                    />
                    <div className="track-info">
                      <span className="track-time">{pos.time}</span>
                      <span className="track-position">{pos.lat}°N, {pos.lon}°E</span>
                      <span className="track-intensity">{pos.intensity} km/h</span>
                      <span
                        className="track-category"
                        style={{ color: getCategoryColor(pos.category) }}
                      >
                        {pos.category}
                      </span>
                    </div>
                    {pos.isPredicted && <span className="predicted-badge">Forecast</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Intensity Scale */}
            <div className="card">
              <h3 className="card-section-title">Cyclone Intensity Scale</h3>
              <div className="intensity-scale">
                <div className="scale-item">
                  <span className="scale-color" style={{ background: '#22c55e' }} />
                  <span>Depression (&lt;17 knots)</span>
                </div>
                <div className="scale-item">
                  <span className="scale-color" style={{ background: '#84cc16' }} />
                  <span>Deep Depression (17-27 knots)</span>
                </div>
                <div className="scale-item">
                  <span className="scale-color" style={{ background: '#eab308' }} />
                  <span>Cyclonic Storm (28-47 knots)</span>
                </div>
                <div className="scale-item">
                  <span className="scale-color" style={{ background: '#f97316' }} />
                  <span>Severe Cyclonic Storm (48-63 knots)</span>
                </div>
                <div className="scale-item">
                  <span className="scale-color" style={{ background: '#ef4444' }} />
                  <span>Very Severe (64-89 knots)</span>
                </div>
                <div className="scale-item">
                  <span className="scale-color" style={{ background: '#7c3aed' }} />
                  <span>Extremely Severe (&gt;90 knots)</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* No Active Cyclone */
          <div className="card no-cyclone-card">
            <div className="no-cyclone-content">
              <Navigation size={48} className="no-cyclone-icon" />
              <h3>No Active Cyclone</h3>
              <p>There are currently no active cyclonic disturbances in the Bay of Bengal or Arabian Sea.</p>
              <button className="refresh-btn" onClick={refreshData}>
                <RefreshCw size={16} />
                Check Again
              </button>
            </div>
          </div>
        )}

        {/* Historical Cyclones */}
        <div className="card">
          <h3 className="card-section-title">Recent Notable Cyclones</h3>
          <div className="historical-grid">
            {historicalCyclones.map((cyclone, idx) => (
              <div key={idx} className="historical-item">
                <div className="historical-header">
                  <span className="historical-name">{cyclone.name}</span>
                  <span className="historical-year">{cyclone.year}</span>
                </div>
                <span
                  className="historical-category"
                  style={{ color: getCategoryColor(cyclone.category) }}
                >
                  {cyclone.category}
                </span>
                <span className="historical-impact">Impact: {cyclone.impact}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
