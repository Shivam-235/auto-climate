import { useState, useEffect } from 'react';
import { 
  AlertCircle, 
  MapPin,
  ArrowLeft,
  RefreshCw,
  AlertTriangle,
  Clock,
  Calendar,
  Shield,
  Bell,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';

const severityLevels = {
  extreme: { color: '#7c3aed', label: 'Extreme', priority: 1 },
  severe: { color: '#ef4444', label: 'Severe', priority: 2 },
  moderate: { color: '#f97316', label: 'Moderate', priority: 3 },
  minor: { color: '#eab308', label: 'Minor', priority: 4 },
};

const alertTypes = [
  'Thunderstorm',
  'Heavy Rainfall',
  'Heat Wave',
  'Cold Wave',
  'Fog',
  'Cyclone',
  'Flash Flood',
  'Strong Wind',
  'Dust Storm',
];

const generateCAPAlerts = () => {
  const alerts = [];
  const regions = [
    'Delhi NCR', 'Mumbai Metropolitan', 'Chennai', 'Kolkata', 
    'Bangalore Urban', 'Hyderabad', 'Gujarat Coast', 'Kerala',
    'Odisha Coast', 'West Bengal', 'Rajasthan', 'Uttar Pradesh'
  ];
  const severities = ['extreme', 'severe', 'moderate', 'minor'];

  const numAlerts = 6 + Math.floor(Math.random() * 8);

  for (let i = 0; i < numAlerts; i++) {
    const severity = severities[Math.floor(Math.random() * severities.length)];
    const startTime = new Date();
    startTime.setHours(startTime.getHours() - Math.floor(Math.random() * 12));
    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + 24 + Math.floor(Math.random() * 48));

    alerts.push({
      id: `CAP-${Date.now()}-${i}`,
      type: alertTypes[Math.floor(Math.random() * alertTypes.length)],
      severity,
      region: regions[Math.floor(Math.random() * regions.length)],
      headline: `${alertTypes[Math.floor(Math.random() * alertTypes.length)]} Warning for ${regions[Math.floor(Math.random() * regions.length)]}`,
      description: 'Weather conditions indicate potential hazardous situation. Citizens are advised to take necessary precautions and stay updated with official announcements.',
      instruction: 'Stay indoors during peak hours. Secure loose objects. Keep emergency supplies ready. Follow local authority guidelines.',
      effective: startTime.toLocaleString(),
      expires: endTime.toLocaleString(),
      sender: 'India Meteorological Department',
      isActive: true,
    });
  }

  return alerts.sort((a, b) => severityLevels[a.severity].priority - severityLevels[b.severity].priority);
};

export default function CAPAlertsPage({ weatherData }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedAlert, setExpandedAlert] = useState(null);
  const [filterSeverity, setFilterSeverity] = useState('all');

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setAlerts(generateCAPAlerts());
      setLoading(false);
    }, 600);
  }, []);

  const filteredAlerts = filterSeverity === 'all'
    ? alerts
    : alerts.filter(a => a.severity === filterSeverity);

  const alertCounts = {
    extreme: alerts.filter(a => a.severity === 'extreme').length,
    severe: alerts.filter(a => a.severity === 'severe').length,
    moderate: alerts.filter(a => a.severity === 'moderate').length,
    minor: alerts.filter(a => a.severity === 'minor').length,
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
          <AlertCircle className="page-header-icon" style={{ color: '#ef4444' }} />
          <div>
            <h1 className="page-title">Latest CAP Alerts</h1>
            <p className="page-subtitle">Common Alerting Protocol based weather warnings</p>
          </div>
        </header>

        {/* Alert Summary */}
        <div className="grid-4 alert-summary">
          {Object.entries(severityLevels).map(([key, value]) => (
            <div 
              key={key} 
              className={`card alert-count-card ${filterSeverity === key ? 'active' : ''}`}
              onClick={() => setFilterSeverity(filterSeverity === key ? 'all' : key)}
              style={{ borderColor: value.color }}
            >
              <span className="alert-count" style={{ color: value.color }}>{alertCounts[key]}</span>
              <span className="alert-label">{value.label}</span>
            </div>
          ))}
        </div>

        {/* Filter Info */}
        {filterSeverity !== 'all' && (
          <div className="filter-info">
            <span>Showing {severityLevels[filterSeverity].label} alerts</span>
            <button onClick={() => setFilterSeverity('all')}>Clear filter</button>
          </div>
        )}

        {/* Alerts List */}
        <div className="card">
          <div className="card-header-row">
            <h3 className="card-section-title">Active Alerts ({filteredAlerts.length})</h3>
            <button className="refresh-btn-small" onClick={() => setAlerts(generateCAPAlerts())}>
              <RefreshCw size={16} className={loading ? 'spinning' : ''} />
            </button>
          </div>

          {loading ? (
            <div className="loading-state">
              <RefreshCw size={32} className="spinning" />
              <p>Fetching CAP alerts...</p>
            </div>
          ) : filteredAlerts.length === 0 ? (
            <div className="no-alerts">
              <Shield size={48} />
              <h3>No Active Alerts</h3>
              <p>There are currently no {filterSeverity !== 'all' ? severityLevels[filterSeverity].label.toLowerCase() : ''} weather alerts.</p>
            </div>
          ) : (
            <div className="alerts-list">
              {filteredAlerts.map(alert => (
                <div 
                  key={alert.id} 
                  className={`cap-alert-item ${expandedAlert === alert.id ? 'expanded' : ''}`}
                  style={{ borderLeftColor: severityLevels[alert.severity].color }}
                >
                  <div 
                    className="alert-header"
                    onClick={() => setExpandedAlert(expandedAlert === alert.id ? null : alert.id)}
                  >
                    <div className="alert-main">
                      <div 
                        className="severity-badge"
                        style={{ 
                          backgroundColor: severityLevels[alert.severity].color + '20',
                          color: severityLevels[alert.severity].color 
                        }}
                      >
                        <AlertTriangle size={14} />
                        {severityLevels[alert.severity].label}
                      </div>
                      <span className="alert-type">{alert.type}</span>
                    </div>
                    <div className="alert-meta">
                      <div className="alert-region">
                        <MapPin size={14} />
                        {alert.region}
                      </div>
                      {expandedAlert === alert.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </div>

                  {expandedAlert === alert.id && (
                    <div className="alert-details">
                      <div className="alert-timing">
                        <div className="timing-item">
                          <Clock size={14} />
                          <span>Effective: {alert.effective}</span>
                        </div>
                        <div className="timing-item">
                          <Calendar size={14} />
                          <span>Expires: {alert.expires}</span>
                        </div>
                      </div>

                      <div className="alert-section">
                        <h4>Description</h4>
                        <p>{alert.description}</p>
                      </div>

                      <div className="alert-section">
                        <h4>Instructions</h4>
                        <p>{alert.instruction}</p>
                      </div>

                      <div className="alert-footer">
                        <span className="alert-sender">
                          <Bell size={14} />
                          {alert.sender}
                        </span>
                        <span className="alert-id">ID: {alert.id}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CAP Info */}
        <div className="card info-card">
          <h3 className="card-section-title">About CAP Alerts</h3>
          <p>
            The Common Alerting Protocol (CAP) is an international standard format for emergency alerts 
            and public warnings. CAP alerts provide standardized, machine-readable warnings that can be 
            disseminated across multiple channels simultaneously.
          </p>
          <div className="cap-features">
            <div className="feature-item">
              <Shield size={20} />
              <span>Standardized Format</span>
            </div>
            <div className="feature-item">
              <Bell size={20} />
              <span>Multi-channel Distribution</span>
            </div>
            <div className="feature-item">
              <Clock size={20} />
              <span>Real-time Updates</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
