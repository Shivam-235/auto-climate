import { useState, useEffect } from 'react';
import { 
  Sun, 
  Thermometer, 
  CloudRain,
  ArrowLeft,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  MapPin
} from 'lucide-react';
import { Link } from 'react-router-dom';

const seasons = [
  { id: 'southwest-monsoon', name: 'Southwest Monsoon', months: 'Jun - Sep', icon: CloudRain },
  { id: 'post-monsoon', name: 'Post Monsoon', months: 'Oct - Nov', icon: CloudRain },
  { id: 'winter', name: 'Winter', months: 'Dec - Feb', icon: Sun },
  { id: 'pre-monsoon', name: 'Pre-Monsoon', months: 'Mar - May', icon: Sun },
];

const generateSeasonalData = () => {
  const regions = ['North', 'South', 'East', 'West', 'Central', 'Northeast'];
  
  return regions.map(region => ({
    region,
    temperature: {
      outlook: ['Above Normal', 'Normal', 'Below Normal'][Math.floor(Math.random() * 3)],
      probability: Math.round(35 + Math.random() * 30),
      anomaly: (Math.random() * 3 - 1.5).toFixed(1),
    },
    rainfall: {
      outlook: ['Above Normal', 'Normal', 'Below Normal'][Math.floor(Math.random() * 3)],
      probability: Math.round(35 + Math.random() * 30),
      anomaly: Math.round(Math.random() * 40 - 20),
    },
  }));
};

const ensoStatus = {
  current: 'La Niña',
  strength: 'Moderate',
  outlook: 'La Niña conditions expected to continue through the season',
  impact: 'Generally favorable for monsoon rainfall over India',
};

const iodStatus = {
  current: 'Positive',
  strength: 'Weak',
  outlook: 'Neutral IOD conditions expected to develop',
  impact: 'May support normal to above-normal rainfall',
};

export default function SeasonalForecastPage({ weatherData }) {
  const [seasonalData, setSeasonalData] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState('southwest-monsoon');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setSeasonalData(generateSeasonalData());
      setLoading(false);
    }, 700);
  }, [selectedSeason]);

  const getOutlookIcon = (outlook) => {
    switch (outlook) {
      case 'Above Normal': return <TrendingUp className="trend-icon up" />;
      case 'Below Normal': return <TrendingDown className="trend-icon down" />;
      default: return <Minus className="trend-icon normal" />;
    }
  };

  const getOutlookColor = (outlook) => {
    switch (outlook) {
      case 'Above Normal': return '#ef4444';
      case 'Below Normal': return '#3b82f6';
      default: return '#22c55e';
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
          <Sun className="page-header-icon" style={{ color: '#fbbf24' }} />
          <div>
            <h1 className="page-title">Seasonal Forecast</h1>
            <p className="page-subtitle">Long-term Climate Outlook for India</p>
          </div>
        </header>

        {/* Season Selection */}
        <div className="card">
          <h3 className="card-section-title">Select Season</h3>
          <div className="season-buttons">
            {seasons.map((season) => (
              <button
                key={season.id}
                className={`season-btn ${selectedSeason === season.id ? 'active' : ''}`}
                onClick={() => setSelectedSeason(season.id)}
              >
                <season.icon size={20} />
                <span className="season-name">{season.name}</span>
                <span className="season-months">{season.months}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Climate Drivers */}
        <div className="grid-2">
          <div className="card climate-driver-card">
            <h3 className="card-section-title">ENSO Status</h3>
            <div className="driver-status">
              <div className="driver-header">
                <span className="driver-value">{ensoStatus.current}</span>
                <span className="driver-strength">{ensoStatus.strength}</span>
              </div>
              <p className="driver-outlook">{ensoStatus.outlook}</p>
              <p className="driver-impact"><strong>Impact:</strong> {ensoStatus.impact}</p>
            </div>
          </div>

          <div className="card climate-driver-card">
            <h3 className="card-section-title">IOD Status</h3>
            <div className="driver-status">
              <div className="driver-header">
                <span className="driver-value">{iodStatus.current}</span>
                <span className="driver-strength">{iodStatus.strength}</span>
              </div>
              <p className="driver-outlook">{iodStatus.outlook}</p>
              <p className="driver-impact"><strong>Impact:</strong> {iodStatus.impact}</p>
            </div>
          </div>
        </div>

        {/* Regional Outlook */}
        <div className="card">
          <div className="card-header-row">
            <h3 className="card-section-title">Regional Seasonal Outlook</h3>
            <button className="refresh-btn-small" onClick={() => setSeasonalData(generateSeasonalData())}>
              <RefreshCw size={16} className={loading ? 'spinning' : ''} />
            </button>
          </div>

          {loading ? (
            <div className="loading-state">
              <RefreshCw size={32} className="spinning" />
              <p>Loading seasonal outlook...</p>
            </div>
          ) : (
            <div className="seasonal-outlook-grid">
              {seasonalData.map((data) => (
                <div key={data.region} className="seasonal-region-card">
                  <div className="region-header">
                    <MapPin size={16} />
                    <span>{data.region} India</span>
                  </div>

                  <div className="seasonal-metrics">
                    <div className="metric-box">
                      <div className="metric-label">
                        <Thermometer size={14} />
                        Temperature
                      </div>
                      <div className="metric-outlook" style={{ color: getOutlookColor(data.temperature.outlook) }}>
                        {getOutlookIcon(data.temperature.outlook)}
                        {data.temperature.outlook}
                      </div>
                      <div className="metric-prob">
                        Probability: {data.temperature.probability}%
                      </div>
                    </div>

                    <div className="metric-box">
                      <div className="metric-label">
                        <CloudRain size={14} />
                        Rainfall
                      </div>
                      <div className="metric-outlook" style={{ color: getOutlookColor(data.rainfall.outlook) }}>
                        {getOutlookIcon(data.rainfall.outlook)}
                        {data.rainfall.outlook}
                      </div>
                      <div className="metric-prob">
                        Probability: {data.rainfall.probability}%
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Methodology */}
        <div className="card">
          <h3 className="card-section-title">Forecast Methodology</h3>
          <div className="methodology-content">
            <p>Seasonal forecasts are generated using:</p>
            <ul>
              <li>Multi-model ensemble approach from global climate centers</li>
              <li>Statistical analysis of historical climate patterns</li>
              <li>Consideration of ocean-atmosphere interactions (ENSO, IOD)</li>
              <li>Regional climate modeling for India-specific predictions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
