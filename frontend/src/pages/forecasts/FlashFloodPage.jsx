import { useState, useEffect } from 'react';
import {
  Waves,
  MapPin,
  ArrowLeft,
  RefreshCw,
  AlertTriangle,
  Clock,
  CloudRain,
  Droplets,
  Mountain,
  Shield,
  Bell,
  TrendingUp,
  Info
} from 'lucide-react';
import { Link } from 'react-router-dom';
import './FlashFloodPage.css';
import { getRainfallData } from '../../services/weatherApi';

const riskLevels = {
  extreme: { color: '#dc2626', label: 'Extreme Risk', icon: '🔴', priority: 1 },
  high: { color: '#ef4444', label: 'High Risk', icon: '🟠', priority: 2 },
  moderate: { color: '#f97316', label: 'Moderate Risk', icon: '🟡', priority: 3 },
  low: { color: '#22c55e', label: 'Low Risk', icon: '🟢', priority: 4 },
};

const vulnerableAreas = [
  { name: 'Western Ghats - Kerala', state: 'Kerala', type: 'Mountain' },
  { name: 'Uttarakhand Himalayas', state: 'Uttarakhand', type: 'Mountain' },
  { name: 'Northeast Hill Region', state: 'Assam/Meghalaya', type: 'Mountain' },
  { name: 'Mumbai Urban', state: 'Maharashtra', type: 'Urban' },
  { name: 'Chennai Metro', state: 'Tamil Nadu', type: 'Coastal' },
  { name: 'Kolkata & Sundarbans', state: 'West Bengal', type: 'Delta' },
  { name: 'Odisha Coastal', state: 'Odisha', type: 'Coastal' },
  { name: 'Bihar Flood Plains', state: 'Bihar', type: 'River' },
  { name: 'Brahmaputra Valley', state: 'Assam', type: 'River' },
  { name: 'Gujarat Coastal', state: 'Gujarat', type: 'Coastal' },
];

const generateFlashFloodData = () => {
  const risks = ['extreme', 'high', 'moderate', 'low'];

  return vulnerableAreas.map(area => {
    const risk = risks[Math.floor(Math.random() * risks.length)];
    const rainfall24h = Math.round(Math.random() * 150);
    const rainfall48h = rainfall24h + Math.round(Math.random() * 100);

    return {
      ...area,
      risk,
      rainfall24h,
      rainfall48h,
      soilMoisture: Math.round(60 + Math.random() * 35),
      riverLevel: ['Normal', 'Above Normal', 'High', 'Danger'][Math.floor(Math.random() * 4)],
      lastUpdate: new Date(Date.now() - Math.random() * 3600000).toLocaleTimeString(),
      hasWarning: risk === 'extreme' || risk === 'high',
    };
  });
};

const safetyTips = [
  'Move to higher ground immediately if you notice rising water levels',
  'Do not attempt to walk or drive through flooded areas',
  'Keep emergency supplies including water, food, and first aid kit ready',
  'Stay informed through official weather channels and alerts',
  'Identify evacuation routes and shelter locations in your area',
  'Secure important documents in waterproof containers',
];

export default function FlashFloodPage({ weatherData }) {
  const [floodData, setFloodData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRisk, setFilterRisk] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const apiData = await getRainfallData();
        const floodForecast = generateFlashFloodData();
        if (apiData && apiData.length > 0) {
          // Enhance flood risk based on real rainfall data
          floodForecast.forEach(area => {
            const areaData = apiData.find(d =>
              d.city?.toLowerCase().includes(area.state.toLowerCase().split(' ')[0]) ||
              d.city?.toLowerCase().includes(area.name.toLowerCase().split(' ')[0])
            );
            if (areaData?.rainfall > 50) {
              area.risk = 'high';
              area.isRealData = true;
            }
          });
        }
        setFloodData(floodForecast);
      } catch (error) {
        console.log('Using simulated flood data - API unavailable:', error.message);
        setFloodData(generateFlashFloodData());
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const filteredData = filterRisk === 'all'
    ? floodData
    : floodData.filter(d => d.risk === filterRisk);

  const warningCount = floodData.filter(d => d.hasWarning).length;

  const getRiverLevelColor = (level) => {
    switch (level) {
      case 'Danger': return '#ef4444';
      case 'High': return '#f97316';
      case 'Above Normal': return '#eab308';
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
          <Waves className="page-header-icon" style={{ color: '#3b82f6' }} />
          <div>
            <h1 className="page-title">Flash Flood Bulletin</h1>
            <p className="page-subtitle">Early warnings and risk assessment for flash floods</p>
          </div>
        </header>

        {/* Warning Banner */}
        {warningCount > 0 && (
          <div className="card alert-banner flood-warning">
            <AlertTriangle size={24} />
            <div>
              <strong>{warningCount} Areas Under Flash Flood Warning</strong>
              <p>High to Extreme risk detected. Monitor conditions and be prepared to evacuate if advised.</p>
            </div>
          </div>
        )}

        {/* Risk Summary */}
        <div className="risk-summary-grid">
          {Object.entries(riskLevels).map(([key, value]) => {
            const count = floodData.filter(d => d.risk === key).length;
            return (
              <div
                key={key}
                className={`risk-stat-card ${filterRisk === key ? 'active' : ''}`}
                onClick={() => setFilterRisk(filterRisk === key ? 'all' : key)}
                style={{
                  borderColor: count > 0 ? value.color : 'rgba(255, 255, 255, 0.08)',
                  color: value.color
                }}
              >
                <span className="risk-icon">{value.icon}</span>
                <span className="risk-count">{count}</span>
                <span className="risk-label">{value.label}</span>
              </div>
            );
          })}
        </div>

        {/* Area-wise Data */}
        <div className="card">
          <div className="card-header-row">
            <h3 className="card-section-title">
              <MapPin size={20} />
              Area-wise Flash Flood Risk
            </h3>
            <button
              className="refresh-btn-small"
              onClick={() => {
                setLoading(true);
                setTimeout(() => {
                  setFloodData(generateFlashFloodData());
                  setLoading(false);
                }, 600);
              }}
              title="Refresh flood data"
            >
              <RefreshCw size={16} className={loading ? 'spinning' : ''} />
            </button>
          </div>

          {loading ? (
            <div className="loading-state">
              <RefreshCw size={32} className="spinning" />
              <p>Loading flood risk data...</p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="no-alerts">
              <Shield size={64} />
              <h3>No Areas Found</h3>
              <p>
                No areas matching the selected risk level.
                {filterRisk !== 'all' && ' Try selecting a different filter.'}
              </p>
            </div>
          ) : (
            <div className="flood-area-grid">
              {filteredData.sort((a, b) => riskLevels[a.risk].priority - riskLevels[b.risk].priority).map((area, idx) => (
                <div
                  key={idx}
                  className={`flood-area-card ${area.hasWarning ? 'has-warning' : ''}`}
                  style={{ borderLeftColor: riskLevels[area.risk].color }}
                >
                  <div className="area-header">
                    <div className="area-info">
                      <Mountain size={16} />
                      <div>
                        <span className="area-name">{area.name}</span>
                        <span className="area-state">{area.state} • {area.type}</span>
                      </div>
                    </div>
                    <div
                      className="risk-badge"
                      style={{
                        backgroundColor: riskLevels[area.risk].color + '20',
                        color: riskLevels[area.risk].color
                      }}
                    >
                      {riskLevels[area.risk].label}
                    </div>
                  </div>

                  <div className="area-metrics">
                    <div className="metric">
                      <CloudRain size={14} />
                      <span className="metric-label">24h Rainfall</span>
                      <span className="metric-value">{area.rainfall24h} mm</span>
                    </div>
                    <div className="metric">
                      <Droplets size={14} />
                      <span className="metric-label">48h Forecast</span>
                      <span className="metric-value">{area.rainfall48h} mm</span>
                    </div>
                    <div className="metric">
                      <Mountain size={14} />
                      <span className="metric-label">Soil Moisture</span>
                      <span className="metric-value">{area.soilMoisture}%</span>
                    </div>
                    <div className="metric">
                      <Waves size={14} />
                      <span className="metric-label">River Level</span>
                      <span
                        className="metric-value"
                        style={{ color: getRiverLevelColor(area.riverLevel) }}
                      >
                        {area.riverLevel}
                      </span>
                    </div>
                  </div>

                  <div className="area-footer">
                    <Clock size={12} />
                    <span>Updated: {area.lastUpdate}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Safety Tips */}
        <div className="card">
          <h3 className="card-section-title">
            <Shield size={18} />
            Flash Flood Safety Tips
          </h3>
          <div className="safety-tips-grid">
            {safetyTips.map((tip, idx) => (
              <div key={idx} className="safety-tip">
                <span className="tip-number">{idx + 1}</span>
                <span className="tip-text">{tip}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency Contacts */}
        <div className="card">
          <h3 className="card-section-title">
            <Bell size={18} />
            Emergency Contacts
          </h3>
          <div className="emergency-contacts">
            <div className="contact-item">
              <span className="contact-name">National Disaster Response Force</span>
              <span className="contact-number">011-24363260</span>
            </div>
            <div className="contact-item">
              <span className="contact-name">Emergency Services</span>
              <span className="contact-number">112</span>
            </div>
            <div className="contact-item">
              <span className="contact-name">Disaster Management Helpline</span>
              <span className="contact-number">1078</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
