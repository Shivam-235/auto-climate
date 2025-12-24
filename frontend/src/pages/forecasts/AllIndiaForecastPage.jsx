import { useState, useEffect } from 'react';
import {
  FileText,
  Thermometer,
  Droplets,
  Wind,
  ArrowLeft,
  RefreshCw,
  MapPin,
  Calendar,
  Sun,
  Cloud,
  CloudRain,
  AlertTriangle,
  Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getStateWiseWeather } from '../../services/weatherApi';

const stateData = [
  { name: 'Jammu & Kashmir', region: 'North', capital: 'Srinagar' },
  { name: 'Himachal Pradesh', region: 'North', capital: 'Shimla' },
  { name: 'Punjab', region: 'North', capital: 'Chandigarh' },
  { name: 'Uttarakhand', region: 'North', capital: 'Dehradun' },
  { name: 'Delhi', region: 'North', capital: 'Delhi' },
  { name: 'Uttar Pradesh', region: 'Central', capital: 'Lucknow' },
  { name: 'Rajasthan', region: 'West', capital: 'Jaipur' },
  { name: 'Gujarat', region: 'West', capital: 'Ahmedabad' },
  { name: 'Maharashtra', region: 'West', capital: 'Mumbai' },
  { name: 'Madhya Pradesh', region: 'Central', capital: 'Bhopal' },
  { name: 'Bihar', region: 'East', capital: 'Patna' },
  { name: 'West Bengal', region: 'East', capital: 'Kolkata' },
  { name: 'Odisha', region: 'East', capital: 'Bhubaneswar' },
  { name: 'Andhra Pradesh', region: 'South', capital: 'Amaravati' },
  { name: 'Karnataka', region: 'South', capital: 'Bangalore' },
  { name: 'Tamil Nadu', region: 'South', capital: 'Chennai' },
  { name: 'Kerala', region: 'South', capital: 'Thiruvananthapuram' },
];

const generateBulletinData = (realWeatherData = {}) => {
  const conditions = ['Clear', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Heavy Rain', 'Thunderstorms'];

  return stateData.map(state => {
    const realData = realWeatherData[state.name];

    return {
      ...state,
      maxTemp: realData?.current?.temperature || Math.round(25 + Math.random() * 15),
      minTemp: realData?.current?.temperature ? realData.current.temperature - 5 : Math.round(15 + Math.random() * 10),
      humidity: realData?.current?.humidity || Math.round(40 + Math.random() * 50),
      rainfall: realData?.current?.rainfall || Math.round(Math.random() * 30),
      windSpeed: realData?.wind?.speed || Math.round(5 + Math.random() * 20),
      condition: realData?.current?.condition || conditions[Math.floor(Math.random() * conditions.length)],
      warning: Math.random() > 0.7 ? ['Heavy Rain Warning', 'Heat Wave', 'Thunderstorm Alert'][Math.floor(Math.random() * 3)] : null,
      isRealData: !!realData,
    };
  });
};

export default function AllIndiaForecastPage({ weatherData }) {
  const [bulletinData, setBulletinData] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        // Try to fetch real weather data
        const stateWeather = await getStateWiseWeather();
        setBulletinData(generateBulletinData(stateWeather));
      } catch (error) {
        console.log('Using simulated data - API unavailable:', error.message);
        // Fallback to simulated data
        setBulletinData(generateBulletinData({}));
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const regions = ['All', 'North', 'South', 'East', 'West', 'Central'];

  const filteredData = selectedRegion === 'All'
    ? bulletinData
    : bulletinData.filter(s => s.region === selectedRegion);

  const getConditionIcon = (condition) => {
    if (condition.includes('Rain') || condition.includes('Thunder')) return <CloudRain size={16} />;
    if (condition.includes('Cloud')) return <Cloud size={16} />;
    return <Sun size={16} />;
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
          <FileText className="page-header-icon" style={{ color: '#22c55e' }} />
          <div>
            <h1 className="page-title">All India Weather Forecast Bulletin</h1>
            <p className="page-subtitle">Daily Comprehensive Weather Update</p>
          </div>
        </header>

        {/* Bulletin Header */}
        <div className="card bulletin-header-card">
          <div className="bulletin-info">
            <Calendar size={20} />
            <div>
              <strong>Bulletin Date</strong>
              <p>{today}</p>
            </div>
          </div>
          <div className="bulletin-info">
            <FileText size={20} />
            <div>
              <strong>Valid Period</strong>
              <p>Next 24 Hours</p>
            </div>
          </div>
          <div className="bulletin-info">
            <RefreshCw size={20} />
            <div>
              <strong>Last Updated</strong>
              <p>{new Date().toLocaleTimeString()}</p>
            </div>
          </div>
        </div>

        {/* Synopsis */}
        <div className="card">
          <h3 className="card-section-title">Weather Synopsis</h3>
          <div className="synopsis-content">
            <p>A low-pressure area lies over central Bay of Bengal. A Western Disturbance is affecting the Western Himalayan region. The monsoon trough passes through its normal position.</p>
            <div className="synopsis-highlights">
              <div className="highlight-item">
                <AlertTriangle size={16} />
                <span>Heavy rainfall likely over Kerala, Karnataka coastal areas</span>
              </div>
              <div className="highlight-item">
                <Thermometer size={16} />
                <span>Heat wave conditions in parts of Rajasthan and Gujarat</span>
              </div>
              <div className="highlight-item">
                <Wind size={16} />
                <span>Strong winds expected over Arabian Sea</span>
              </div>
            </div>
          </div>
        </div>

        {/* Region Filter */}
        <div className="card">
          <div className="region-filter">
            {regions.map(region => (
              <button
                key={region}
                className={`filter-btn ${selectedRegion === region ? 'active' : ''}`}
                onClick={() => setSelectedRegion(region)}
              >
                {region}
              </button>
            ))}
          </div>
        </div>

        {/* State-wise Data */}
        <div className="card">
          <div className="card-header-row">
            <h3 className="card-section-title">State-wise Weather Data</h3>
            <button className="refresh-btn-small" onClick={() => setBulletinData(generateBulletinData())}>
              <RefreshCw size={16} className={loading ? 'spinning' : ''} />
            </button>
          </div>

          {loading ? (
            <div className="loading-state">
              <RefreshCw size={32} className="spinning" />
              <p>Loading bulletin data...</p>
            </div>
          ) : (
            <div className="bulletin-table-container">
              <table className="bulletin-table">
                <thead>
                  <tr>
                    <th>State</th>
                    <th>Condition</th>
                    <th>Max/Min (°C)</th>
                    <th>Humidity</th>
                    <th>Rainfall</th>
                    <th>Wind</th>
                    <th>Warnings</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map(state => (
                    <tr key={state.name} className={state.warning ? 'has-warning' : ''}>
                      <td>
                        <div className="state-name">
                          <MapPin size={14} />
                          {state.name}
                        </div>
                      </td>
                      <td>
                        <div className="condition-cell">
                          {getConditionIcon(state.condition)}
                          {state.condition}
                        </div>
                      </td>
                      <td>
                        <span className="temp-high">{state.maxTemp}°</span>
                        <span className="temp-sep">/</span>
                        <span className="temp-low">{state.minTemp}°</span>
                      </td>
                      <td>{state.humidity}%</td>
                      <td>{state.rainfall}mm</td>
                      <td>{state.windSpeed} km/h</td>
                      <td>
                        {state.warning ? (
                          <span className="warning-badge">{state.warning}</span>
                        ) : (
                          <span className="no-warning">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div className="card disclaimer-card">
          <FileText size={20} />
          <div>
            <strong>Bulletin Notes</strong>
            <p>This bulletin is issued for general guidance. For official warnings and alerts,
              please refer to India Meteorological Department (IMD) official communications.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
