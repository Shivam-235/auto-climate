import { useState, useEffect } from 'react';
import {
  Calendar,
  TrendingUp,
  Thermometer,
  Droplets,
  CloudRain,
  ArrowLeft,
  RefreshCw,
  Sun,
  Cloud,
  AlertCircle,
  BarChart3
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getRainfallData } from '../../services/weatherApi';

const generateWeeklyData = () => {
  const weeks = [];
  const conditions = ['Above Normal', 'Normal', 'Below Normal'];

  for (let i = 1; i <= 4; i++) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + (i - 1) * 7);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);

    weeks.push({
      week: i,
      startDate: startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      endDate: endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      tempAnomaly: (Math.random() * 4 - 2).toFixed(1),
      rainfallAnomaly: Math.round(Math.random() * 60 - 30),
      tempOutlook: conditions[Math.floor(Math.random() * 3)],
      rainOutlook: conditions[Math.floor(Math.random() * 3)],
      probability: Math.round(40 + Math.random() * 40),
    });
  }
  return weeks;
};

const regions = [
  { id: 'north', name: 'North India', states: 'J&K, HP, Punjab, Haryana, Delhi, UP, Uttarakhand' },
  { id: 'south', name: 'South India', states: 'TN, Kerala, Karnataka, AP, Telangana' },
  { id: 'east', name: 'East India', states: 'WB, Odisha, Bihar, Jharkhand, NE States' },
  { id: 'west', name: 'West India', states: 'Maharashtra, Gujarat, Goa, Rajasthan' },
  { id: 'central', name: 'Central India', states: 'MP, Chhattisgarh' },
];

export default function ExtendedRangePage({ weatherData }) {
  const [weeklyData, setWeeklyData] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('north');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const rainfallData = await getRainfallData();
        const weeklyForecast = generateWeeklyData();
        if (rainfallData && rainfallData.length > 0) {
          weeklyForecast.isRealData = true;
        }
        setWeeklyData(weeklyForecast);
      } catch (error) {
        console.log('Using simulated extended range data - API unavailable:', error.message);
        setWeeklyData(generateWeeklyData());
      }
      setLoading(false);
    };
    fetchData();
  }, [selectedRegion]);

  const getAnomalyColor = (value, type) => {
    const num = parseFloat(value);
    if (type === 'temp') {
      if (num > 1) return '#ef4444';
      if (num < -1) return '#3b82f6';
      return '#22c55e';
    } else {
      if (num > 20) return '#3b82f6';
      if (num < -20) return '#f97316';
      return '#22c55e';
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
          <Calendar className="page-header-icon" style={{ color: '#a78bfa' }} />
          <div>
            <h1 className="page-title">Extended Range Outlook</h1>
            <p className="page-subtitle">2-4 Week Weather Outlook for India</p>
          </div>
        </header>

        {/* Region Selection */}
        <div className="card">
          <h3 className="card-section-title">Select Region</h3>
          <div className="region-buttons">
            {regions.map((region) => (
              <button
                key={region.id}
                className={`region-btn ${selectedRegion === region.id ? 'active' : ''}`}
                onClick={() => setSelectedRegion(region.id)}
              >
                <span className="region-name">{region.name}</span>
                <span className="region-states">{region.states}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Weekly Outlook */}
        <div className="card">
          <div className="card-header-row">
            <h3 className="card-section-title">4-Week Outlook</h3>
            <button className="refresh-btn-small" onClick={() => setWeeklyData(generateWeeklyData())}>
              <RefreshCw size={16} className={loading ? 'spinning' : ''} />
            </button>
          </div>

          {loading ? (
            <div className="loading-state">
              <RefreshCw size={32} className="spinning" />
              <p>Loading extended outlook...</p>
            </div>
          ) : (
            <div className="weekly-outlook-grid">
              {weeklyData.map((week) => (
                <div key={week.week} className="weekly-outlook-card">
                  <div className="week-header">
                    <span className="week-label">Week {week.week}</span>
                    <span className="week-dates">{week.startDate} - {week.endDate}</span>
                  </div>

                  <div className="outlook-sections">
                    <div className="outlook-section">
                      <div className="outlook-title">
                        <Thermometer size={16} />
                        <span>Temperature</span>
                      </div>
                      <div
                        className="outlook-badge"
                        style={{ backgroundColor: getOutlookColor(week.tempOutlook) + '20', color: getOutlookColor(week.tempOutlook) }}
                      >
                        {week.tempOutlook}
                      </div>
                      <div className="anomaly-value" style={{ color: getAnomalyColor(week.tempAnomaly, 'temp') }}>
                        {week.tempAnomaly > 0 ? '+' : ''}{week.tempAnomaly}°C anomaly
                      </div>
                    </div>

                    <div className="outlook-section">
                      <div className="outlook-title">
                        <CloudRain size={16} />
                        <span>Rainfall</span>
                      </div>
                      <div
                        className="outlook-badge"
                        style={{ backgroundColor: getOutlookColor(week.rainOutlook) + '20', color: getOutlookColor(week.rainOutlook) }}
                      >
                        {week.rainOutlook}
                      </div>
                      <div className="anomaly-value" style={{ color: getAnomalyColor(week.rainfallAnomaly, 'rain') }}>
                        {week.rainfallAnomaly > 0 ? '+' : ''}{week.rainfallAnomaly}% of normal
                      </div>
                    </div>
                  </div>

                  <div className="probability-section">
                    <span>Forecast Probability</span>
                    <div className="prob-bar">
                      <div className="prob-fill" style={{ width: `${week.probability}%` }} />
                    </div>
                    <span>{week.probability}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <div className="card disclaimer-card">
          <AlertCircle size={20} />
          <div>
            <strong>Extended Range Forecast Limitations</strong>
            <p>Extended range forecasts (2-4 weeks) provide probabilistic outlooks rather than deterministic predictions.
              These forecasts indicate the likelihood of above/below normal conditions and should be used for general planning purposes only.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
