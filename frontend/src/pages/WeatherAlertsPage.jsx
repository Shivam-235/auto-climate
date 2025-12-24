import { useState, useEffect } from 'react';
import { AlertTriangle, AlertCircle, Info, Bell, Shield, Clock, MapPin, ChevronRight } from 'lucide-react';

const alertTypes = {
  extreme: { icon: AlertTriangle, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', label: 'Extreme' },
  severe: { icon: AlertTriangle, color: '#f97316', bg: 'rgba(249, 115, 22, 0.15)', label: 'Severe' },
  moderate: { icon: AlertCircle, color: '#eab308', bg: 'rgba(234, 179, 8, 0.15)', label: 'Moderate' },
  minor: { icon: Info, color: '#22c55e', bg: 'rgba(34, 197, 94, 0.15)', label: 'Minor' },
};

function generateAlerts(location) {
  const city = location?.city || 'Your Area';
  const now = new Date();

  // Generate some sample alerts based on common weather scenarios
  const possibleAlerts = [
    {
      id: 1,
      type: 'severe',
      title: 'Heat Advisory',
      headline: `Heat Advisory in effect for ${city}`,
      description: 'Dangerously hot conditions with temperatures expected to exceed 40°C. The heat and humidity may cause heat stress during outdoor activities.',
      instruction: 'Drink plenty of fluids, stay in air-conditioned rooms, and avoid outdoor activities during peak afternoon hours.',
      effective: new Date(now.getTime() + 2 * 60 * 60 * 1000),
      expires: new Date(now.getTime() + 36 * 60 * 60 * 1000),
      areas: [city, 'Surrounding regions'],
      source: 'National Weather Service',
    },
    {
      id: 2,
      type: 'moderate',
      title: 'Air Quality Alert',
      headline: 'Unhealthy air quality expected',
      description: 'Air quality is expected to be unhealthy for sensitive groups. Elevated levels of PM2.5 and ozone are forecasted.',
      instruction: 'People with respiratory conditions should limit prolonged outdoor exertion. Consider wearing N95 masks outdoors.',
      effective: now,
      expires: new Date(now.getTime() + 24 * 60 * 60 * 1000),
      areas: [city],
      source: 'Air Quality Monitoring Agency',
    },
    {
      id: 3,
      type: 'minor',
      title: 'UV Index Warning',
      headline: 'Very High UV Index expected',
      description: 'UV Index values of 8-10 are expected during midday hours. Unprotected skin can burn quickly.',
      instruction: 'Apply SPF 30+ sunscreen, wear protective clothing and sunglasses, and seek shade during 10am-4pm.',
      effective: now,
      expires: new Date(now.getTime() + 12 * 60 * 60 * 1000),
      areas: [city],
      source: 'Meteorological Department',
    },
    {
      id: 4,
      type: 'moderate',
      title: 'Thunderstorm Watch',
      headline: 'Isolated thunderstorms possible this evening',
      description: 'Atmospheric conditions are favorable for isolated thunderstorms. Some storms could produce gusty winds and heavy rainfall.',
      instruction: 'Monitor weather conditions. Be prepared to seek shelter if storms develop.',
      effective: new Date(now.getTime() + 6 * 60 * 60 * 1000),
      expires: new Date(now.getTime() + 18 * 60 * 60 * 1000),
      areas: [city, 'Eastern suburbs'],
      source: 'National Weather Service',
    },
  ];

  // Randomly select some alerts
  const selectedAlerts = possibleAlerts.filter(() => Math.random() > 0.3);
  return selectedAlerts.length ? selectedAlerts : [possibleAlerts[2]]; // Always show at least UV warning
}

function formatAlertTime(date) {
  return date.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export default function WeatherAlertsPage({ weatherData }) {
  const [alerts, setAlerts] = useState([]);
  const [expandedAlert, setExpandedAlert] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    setAlerts(generateAlerts(weatherData?.location));
  }, [weatherData?.location]);

  const filteredAlerts = filter === 'all'
    ? alerts
    : alerts.filter(a => a.type === filter);

  const activeCount = alerts.filter(a => a.expires > new Date()).length;

  return (
    <div className="page-content">
      <header className="page-header">
        <AlertTriangle className="page-header-icon" style={{ color: '#f97316' }} />
        <div>
          <h1 className="page-title">Weather Alerts</h1>
          <p className="page-subtitle">Active warnings and advisories</p>
        </div>
      </header>

      {/* Alert Summary */}
      <div className="grid-4 mt-6">
        <div className="alert-summary-card">
          <Bell className="alert-summary-icon" />
          <div className="alert-summary-info">
            <span className="alert-summary-value">{activeCount}</span>
            <span className="alert-summary-label">Active Alerts</span>
          </div>
        </div>
        {Object.entries(alertTypes).map(([key, type]) => {
          const count = alerts.filter(a => a.type === key).length;
          return (
            <div
              key={key}
              className="alert-summary-card clickable"
              style={{ borderColor: count ? type.color : 'transparent' }}
              onClick={() => setFilter(filter === key ? 'all' : key)}
            >
              <type.icon className="alert-summary-icon" style={{ color: type.color }} />
              <div className="alert-summary-info">
                <span className="alert-summary-value">{count}</span>
                <span className="alert-summary-label">{type.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Alerts List */}
      <div className="alerts-container mt-6">
        {filteredAlerts.length === 0 ? (
          <div className="no-alerts">
            <Shield className="no-alerts-icon" />
            <h3>No Active Alerts</h3>
            <p>There are currently no weather alerts for your area.</p>
          </div>
        ) : (
          filteredAlerts.map(alert => {
            const type = alertTypes[alert.type];
            const isExpanded = expandedAlert === alert.id;
            const Icon = type.icon;

            return (
              <div
                key={alert.id}
                className={`alert-card ${isExpanded ? 'expanded' : ''}`}
                style={{ backgroundColor: type.bg, borderLeftColor: type.color }}
              >
                <div
                  className="alert-header"
                  onClick={() => setExpandedAlert(isExpanded ? null : alert.id)}
                >
                  <div className="alert-header-left">
                    <Icon className="alert-icon" style={{ color: type.color }} />
                    <div className="alert-title-group">
                      <span className="alert-type-badge" style={{ backgroundColor: type.color }}>
                        {type.label}
                      </span>
                      <h3 className="alert-title">{alert.title}</h3>
                      <p className="alert-headline">{alert.headline}</p>
                    </div>
                  </div>
                  <ChevronRight className={`alert-expand-icon ${isExpanded ? 'rotated' : ''}`} />
                </div>

                {isExpanded && (
                  <div className="alert-body">
                    <div className="alert-meta">
                      <div className="alert-meta-item">
                        <Clock size={16} />
                        <span>
                          <strong>Effective:</strong> {formatAlertTime(alert.effective)}
                        </span>
                      </div>
                      <div className="alert-meta-item">
                        <Clock size={16} />
                        <span>
                          <strong>Expires:</strong> {formatAlertTime(alert.expires)}
                        </span>
                      </div>
                      <div className="alert-meta-item">
                        <MapPin size={16} />
                        <span>
                          <strong>Areas:</strong> {alert.areas.join(', ')}
                        </span>
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

                    <div className="alert-source">
                      Source: {alert.source}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Safety Tips */}
      <div className="card mt-6">
        <div className="card-header">
          <Shield className="card-icon" />
          <h3>General Weather Safety Tips</h3>
        </div>
        <div className="safety-grid">
          <div className="safety-item">
            <span className="safety-emoji">🌡️</span>
            <h4>Heat Safety</h4>
            <p>Stay hydrated, avoid direct sun during peak hours, and never leave children or pets in vehicles.</p>
          </div>
          <div className="safety-item">
            <span className="safety-emoji">⛈️</span>
            <h4>Storm Safety</h4>
            <p>When thunder roars, go indoors. Stay away from windows and avoid using electrical equipment.</p>
          </div>
          <div className="safety-item">
            <span className="safety-emoji">🌊</span>
            <h4>Flood Safety</h4>
            <p>Never walk or drive through flood waters. Turn around, don't drown.</p>
          </div>
          <div className="safety-item">
            <span className="safety-emoji">💨</span>
            <h4>Wind Safety</h4>
            <p>Secure loose outdoor items. Stay away from damaged buildings and downed power lines.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
