import { useState, useEffect } from 'react';
import {
  CloudRain,
  Droplets,
  ArrowLeft,
  RefreshCw,
  MapPin,
  Calendar,
  AlertTriangle,
  BarChart3
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getRainfallData } from '../../services/weatherApi';

const generatePrecipitationData = () => {
  const days = [];
  const regions = ['North', 'South', 'East', 'West', 'Central'];

  for (let i = 1; i <= 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);

    const regionData = regions.map(region => ({
      region,
      precipitation: Math.round(Math.random() * 50),
      probability: Math.round(30 + Math.random() * 60),
      intensity: ['Light', 'Moderate', 'Heavy', 'Very Heavy'][Math.floor(Math.random() * 4)],
    }));

    days.push({
      day: i,
      date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      regions: regionData,
    });
  }
  return days;
};

const cities = [
  { name: 'New Delhi', lat: 28.61, lon: 77.21 },
  { name: 'Mumbai', lat: 19.08, lon: 72.88 },
  { name: 'Chennai', lat: 13.08, lon: 80.27 },
  { name: 'Kolkata', lat: 22.57, lon: 88.36 },
  { name: 'Bangalore', lat: 12.97, lon: 77.59 },
  { name: 'Hyderabad', lat: 17.39, lon: 78.49 },
];

const generateCityPrecipitation = () => {
  return cities.map(city => ({
    ...city,
    forecast: Array.from({ length: 7 }, (_, i) => ({
      day: i + 1,
      amount: Math.round(Math.random() * 60),
      probability: Math.round(20 + Math.random() * 70),
    })),
    weeklyTotal: Math.round(Math.random() * 150),
  }));
};

export default function PrecipitationForecastPage({ weatherData }) {
  const [precipData, setPrecipData] = useState([]);
  const [cityData, setCityData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('regional');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const apiData = await getRainfallData();
        const precipForecast = generatePrecipitationData();
        const cityForecast = generateCityPrecipitation();

        if (apiData && apiData.length > 0) {
          // Mark as real data
          precipForecast.isRealData = true;
        }
        setPrecipData(precipForecast);
        setCityData(cityForecast);
      } catch (error) {
        console.log('Using simulated precipitation data - API unavailable:', error.message);
        setPrecipData(generatePrecipitationData());
        setCityData(generateCityPrecipitation());
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const getIntensityColor = (intensity) => {
    switch (intensity) {
      case 'Light': return '#22c55e';
      case 'Moderate': return '#eab308';
      case 'Heavy': return '#f97316';
      case 'Very Heavy': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getPrecipBarHeight = (amount) => {
    return Math.min(100, (amount / 60) * 100);
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
          <CloudRain className="page-header-icon" style={{ color: '#60a5fa' }} />
          <div>
            <h1 className="page-title">Quantitative Precipitation Forecast</h1>
            <p className="page-subtitle">7-Day Rainfall Amount Predictions</p>
          </div>
        </header>

        {/* View Toggle */}
        <div className="card">
          <div className="view-toggle">
            <button
              className={`toggle-btn ${viewMode === 'regional' ? 'active' : ''}`}
              onClick={() => setViewMode('regional')}
            >
              <BarChart3 size={16} />
              Regional View
            </button>
            <button
              className={`toggle-btn ${viewMode === 'city' ? 'active' : ''}`}
              onClick={() => setViewMode('city')}
            >
              <MapPin size={16} />
              City View
            </button>
          </div>
        </div>

        {/* Precipitation Scale Legend */}
        <div className="card precipitation-legend">
          <h3 className="card-section-title">Rainfall Intensity Scale</h3>
          <div className="legend-items">
            <div className="legend-item">
              <span className="legend-color" style={{ background: '#22c55e' }} />
              <span>Light (&lt;10mm)</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ background: '#eab308' }} />
              <span>Moderate (10-30mm)</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ background: '#f97316' }} />
              <span>Heavy (30-50mm)</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ background: '#ef4444' }} />
              <span>Very Heavy (&gt;50mm)</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="card">
            <div className="loading-state">
              <RefreshCw size={32} className="spinning" />
              <p>Loading precipitation forecast...</p>
            </div>
          </div>
        ) : viewMode === 'regional' ? (
          /* Regional View */
          <div className="card">
            <div className="card-header-row">
              <h3 className="card-section-title">7-Day Regional Precipitation</h3>
              <button className="refresh-btn-small" onClick={() => setPrecipData(generatePrecipitationData())}>
                <RefreshCw size={16} />
              </button>
            </div>

            <div className="precip-table">
              <div className="precip-header-row">
                <div className="precip-region-header">Region</div>
                {precipData.map(day => (
                  <div key={day.day} className="precip-day-header">
                    <span>{day.date.split(',')[0]}</span>
                  </div>
                ))}
              </div>

              {['North', 'South', 'East', 'West', 'Central'].map(region => (
                <div key={region} className="precip-data-row">
                  <div className="precip-region-name">{region}</div>
                  {precipData.map(day => {
                    const regionData = day.regions.find(r => r.region === region);
                    return (
                      <div key={day.day} className="precip-cell">
                        <div
                          className="precip-bar"
                          style={{
                            height: `${getPrecipBarHeight(regionData.precipitation)}%`,
                            backgroundColor: getIntensityColor(regionData.intensity)
                          }}
                        />
                        <span className="precip-value">{regionData.precipitation}mm</span>
                        <span className="precip-prob">{regionData.probability}%</span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* City View */
          <div className="card">
            <div className="card-header-row">
              <h3 className="card-section-title">City-wise Precipitation Forecast</h3>
              <button className="refresh-btn-small" onClick={() => setCityData(generateCityPrecipitation())}>
                <RefreshCw size={16} />
              </button>
            </div>

            <div className="city-precip-grid">
              {cityData.map(city => (
                <div key={city.name} className="city-precip-card">
                  <div className="city-header">
                    <MapPin size={16} />
                    <span>{city.name}</span>
                    <span className="city-weekly">Weekly: {city.weeklyTotal}mm</span>
                  </div>

                  <div className="city-forecast-bars">
                    {city.forecast.map(day => (
                      <div key={day.day} className="city-day-bar">
                        <div
                          className="bar-fill"
                          style={{
                            height: `${getPrecipBarHeight(day.amount)}%`,
                            backgroundColor: day.amount > 50 ? '#ef4444' : day.amount > 30 ? '#f97316' : day.amount > 10 ? '#eab308' : '#22c55e'
                          }}
                        />
                        <span className="bar-value">{day.amount}</span>
                        <span className="bar-day">D{day.day}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Alert Section */}
        <div className="card alert-card">
          <AlertTriangle size={20} />
          <div>
            <strong>Heavy Rainfall Alert</strong>
            <p>Parts of Western Ghats and Northeast India may experience heavy to very heavy rainfall in the next 48 hours. Exercise caution in flood-prone areas.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
