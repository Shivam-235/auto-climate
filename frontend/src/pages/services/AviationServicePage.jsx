import { useState, useEffect } from 'react';
import { 
  Plane, 
  ArrowLeft,
  MapPin,
  Wind,
  Eye,
  CloudRain,
  AlertTriangle,
  RefreshCw,
  Clock,
  ThermometerSun,
  Gauge,
  Cloud,
  Navigation,
  Layers,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

const airports = [
  { code: 'DEL', name: 'Indira Gandhi International', city: 'Delhi' },
  { code: 'BOM', name: 'Chhatrapati Shivaji International', city: 'Mumbai' },
  { code: 'BLR', name: 'Kempegowda International', city: 'Bangalore' },
  { code: 'MAA', name: 'Chennai International', city: 'Chennai' },
  { code: 'HYD', name: 'Rajiv Gandhi International', city: 'Hyderabad' },
  { code: 'CCU', name: 'Netaji Subhas Chandra Bose', city: 'Kolkata' },
  { code: 'COK', name: 'Cochin International', city: 'Kochi' },
  { code: 'GOI', name: 'Dabolim Airport', city: 'Goa' },
];

const generateAviationData = (airportCode) => {
  const visibility = (Math.random() * 8 + 2).toFixed(1);
  const windSpeed = Math.floor(Math.random() * 30 + 5);
  const crosswind = Math.floor(Math.random() * 15);
  
  const getFlightCategory = (vis, ceiling) => {
    if (vis >= 5 && ceiling >= 3000) return { cat: 'VFR', color: '#22c55e', desc: 'Visual Flight Rules' };
    if (vis >= 3 && ceiling >= 1000) return { cat: 'MVFR', color: '#3b82f6', desc: 'Marginal VFR' };
    if (vis >= 1 && ceiling >= 500) return { cat: 'IFR', color: '#f97316', desc: 'Instrument Flight Rules' };
    return { cat: 'LIFR', color: '#ef4444', desc: 'Low IFR' };
  };

  const ceiling = Math.floor(Math.random() * 5000 + 500);
  const category = getFlightCategory(parseFloat(visibility), ceiling);

  return {
    airport: airports.find(a => a.code === airportCode),
    metar: {
      raw: `${airportCode} ${new Date().toISOString().slice(11, 13)}50Z ${Math.floor(Math.random() * 360).toString().padStart(3, '0')}${windSpeed.toString().padStart(2, '0')}KT ${visibility}SM SCT0${Math.floor(Math.random() * 50 + 20)} BKN0${Math.floor(Math.random() * 80 + 40)} ${Math.floor(Math.random() * 15 + 25)}/${Math.floor(Math.random() * 10 + 15)} A${Math.floor(Math.random() * 30 + 2980)}`,
      time: new Date().toISOString().slice(11, 16) + ' UTC'
    },
    conditions: {
      temperature: Math.floor(Math.random() * 15 + 25),
      dewPoint: Math.floor(Math.random() * 10 + 15),
      pressure: (Math.random() * 30 + 1000).toFixed(1),
      humidity: Math.floor(Math.random() * 40 + 50),
      visibility: parseFloat(visibility),
      ceiling,
      category
    },
    wind: {
      direction: Math.floor(Math.random() * 360),
      speed: windSpeed,
      gusts: Math.random() > 0.5 ? windSpeed + Math.floor(Math.random() * 15) : null,
      crosswind,
      headwind: Math.floor(Math.random() * 20),
    },
    runways: [
      { 
        id: `${Math.floor(Math.random() * 18 + 1).toString().padStart(2, '0')}L/R`,
        status: Math.random() > 0.2 ? 'Open' : 'Closed',
        surface: 'Dry',
        crosswind: crosswind,
      },
      { 
        id: `${Math.floor(Math.random() * 18 + 19).toString().padStart(2, '0')}L/R`,
        status: 'Open',
        surface: Math.random() > 0.7 ? 'Wet' : 'Dry',
        crosswind: Math.floor(Math.random() * 10),
      },
    ],
    hazards: [
      Math.random() > 0.6 ? { type: 'Turbulence', severity: 'Light', altitude: '10,000-15,000 ft' } : null,
      Math.random() > 0.7 ? { type: 'Wind Shear', severity: 'Moderate', location: 'Approach' } : null,
      Math.random() > 0.8 ? { type: 'Thunderstorm', severity: 'Moderate', direction: 'NW, 50 km' } : null,
      Math.random() > 0.7 ? { type: 'Low Visibility', severity: 'Light', expected: '2 hours' } : null,
    ].filter(Boolean),
    taf: {
      valid: '24 hours',
      periods: [
        { time: '00-06', weather: 'Clear', wind: `${Math.floor(Math.random() * 15 + 5)} kt`, vis: '10+ km' },
        { time: '06-12', weather: 'Partly Cloudy', wind: `${Math.floor(Math.random() * 20 + 10)} kt`, vis: '8 km' },
        { time: '12-18', weather: 'Scattered Clouds', wind: `${Math.floor(Math.random() * 25 + 15)} kt`, vis: '6 km' },
        { time: '18-24', weather: 'Clear', wind: `${Math.floor(Math.random() * 15 + 5)} kt`, vis: '10+ km' },
      ]
    },
    delays: {
      departure: Math.random() > 0.7 ? `${Math.floor(Math.random() * 45 + 15)} min` : 'None',
      arrival: Math.random() > 0.8 ? `${Math.floor(Math.random() * 30 + 10)} min` : 'None',
    }
  };
};

export default function AviationServicePage() {
  const [selectedAirport, setSelectedAirport] = useState('DEL');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setData(generateAviationData(selectedAirport));
      setLoading(false);
    }, 600);
  }, [selectedAirport]);

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
          <Plane className="page-header-icon" style={{ color: '#3b82f6' }} />
          <div>
            <h1 className="page-title">Aviation Weather Services</h1>
            <p className="page-subtitle">Meteorological data for flight operations and safety</p>
          </div>
        </header>

        {/* Airport Selector */}
        <div className="airport-selector">
          {airports.map(airport => (
            <button
              key={airport.code}
              className={`airport-btn ${selectedAirport === airport.code ? 'active' : ''}`}
              onClick={() => setSelectedAirport(airport.code)}
            >
              <span className="airport-code">{airport.code}</span>
              <span className="airport-city">{airport.city}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-state">
            <RefreshCw size={32} className="spinning" />
            <p>Loading aviation weather for {selectedAirport}...</p>
          </div>
        ) : (
          <>
            {/* Airport Header */}
            <div className="card airport-header">
              <div className="airport-info">
                <Plane size={32} style={{ color: '#3b82f6' }} />
                <div>
                  <h2>{data.airport.code} - {data.airport.name}</h2>
                  <span className="airport-city-label">{data.airport.city}</span>
                </div>
              </div>
              <div 
                className="flight-category" 
                style={{ background: data.conditions.category.color }}
              >
                <span className="cat-code">{data.conditions.category.cat}</span>
                <span className="cat-desc">{data.conditions.category.desc}</span>
              </div>
            </div>

            {/* METAR */}
            <div className="card metar-card">
              <h3 className="card-section-title">
                <Layers size={18} />
                Current METAR
              </h3>
              <div className="metar-display">
                <code className="metar-raw">{data.metar.raw}</code>
                <span className="metar-time">Issued: {data.metar.time}</span>
              </div>
            </div>

            {/* Current Conditions */}
            <div className="grid-4 aviation-conditions">
              <div className="card condition-card">
                <Eye size={24} style={{ color: '#8b5cf6' }} />
                <div className="condition-info">
                  <span className="condition-value">{data.conditions.visibility} km</span>
                  <span className="condition-label">Visibility</span>
                </div>
              </div>
              <div className="card condition-card">
                <Cloud size={24} style={{ color: '#3b82f6' }} />
                <div className="condition-info">
                  <span className="condition-value">{data.conditions.ceiling} ft</span>
                  <span className="condition-label">Ceiling</span>
                </div>
              </div>
              <div className="card condition-card">
                <ThermometerSun size={24} style={{ color: '#ef4444' }} />
                <div className="condition-info">
                  <span className="condition-value">{data.conditions.temperature}°C</span>
                  <span className="condition-label">Temperature</span>
                </div>
              </div>
              <div className="card condition-card">
                <Gauge size={24} style={{ color: '#22c55e' }} />
                <div className="condition-info">
                  <span className="condition-value">{data.conditions.pressure} hPa</span>
                  <span className="condition-label">QNH</span>
                </div>
              </div>
            </div>

            {/* Wind Information */}
            <div className="grid-2">
              <div className="card">
                <h3 className="card-section-title">
                  <Wind size={18} style={{ color: '#22c55e' }} />
                  Wind Conditions
                </h3>
                <div className="wind-display">
                  <div className="wind-compass">
                    <Navigation 
                      size={48} 
                      style={{ 
                        color: '#3b82f6', 
                        transform: `rotate(${data.wind.direction}deg)` 
                      }} 
                    />
                  </div>
                  <div className="wind-details">
                    <div className="wind-item">
                      <span className="wind-label">Direction</span>
                      <span className="wind-value">{data.wind.direction}°</span>
                    </div>
                    <div className="wind-item">
                      <span className="wind-label">Speed</span>
                      <span className="wind-value">{data.wind.speed} kt</span>
                    </div>
                    {data.wind.gusts && (
                      <div className="wind-item gusts">
                        <span className="wind-label">Gusts</span>
                        <span className="wind-value">{data.wind.gusts} kt</span>
                      </div>
                    )}
                    <div className="wind-item">
                      <span className="wind-label">Crosswind</span>
                      <span className="wind-value">{data.wind.crosswind} kt</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Runway Status */}
              <div className="card">
                <h3 className="card-section-title">
                  <MapPin size={18} style={{ color: '#f97316' }} />
                  Runway Status
                </h3>
                <div className="runway-list">
                  {data.runways.map((runway, idx) => (
                    <div key={idx} className="runway-item">
                      <span className="runway-id">RWY {runway.id}</span>
                      <span className={`runway-status ${runway.status.toLowerCase()}`}>
                        {runway.status === 'Open' ? <CheckCircle size={14} /> : <XCircle size={14} />}
                        {runway.status}
                      </span>
                      <span className="runway-surface">{runway.surface}</span>
                      <span className="runway-crosswind">XW: {runway.crosswind} kt</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* TAF Forecast */}
            <div className="card">
              <h3 className="card-section-title">
                <Clock size={18} style={{ color: '#8b5cf6' }} />
                Terminal Aerodrome Forecast (TAF)
              </h3>
              <div className="taf-timeline">
                {data.taf.periods.map((period, idx) => (
                  <div key={idx} className="taf-period">
                    <span className="taf-time">{period.time} UTC</span>
                    <div className="taf-details">
                      <Cloud size={16} />
                      <span>{period.weather}</span>
                    </div>
                    <div className="taf-details">
                      <Wind size={16} />
                      <span>{period.wind}</span>
                    </div>
                    <div className="taf-details">
                      <Eye size={16} />
                      <span>{period.vis}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hazards */}
            {data.hazards.length > 0 && (
              <div className="card">
                <h3 className="card-section-title">
                  <AlertTriangle size={18} style={{ color: '#ef4444' }} />
                  Weather Hazards
                </h3>
                <div className="hazards-grid">
                  {data.hazards.map((hazard, idx) => (
                    <div key={idx} className={`hazard-item severity-${hazard.severity.toLowerCase()}`}>
                      <AlertTriangle size={20} />
                      <div className="hazard-info">
                        <span className="hazard-type">{hazard.type}</span>
                        <span className="hazard-severity">{hazard.severity}</span>
                        <span className="hazard-detail">
                          {hazard.altitude || hazard.location || hazard.direction || hazard.expected}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Delays */}
            <div className="card delays-card">
              <h3 className="card-section-title">
                <Clock size={18} />
                Current Delays
              </h3>
              <div className="delays-display">
                <div className={`delay-item ${data.delays.departure !== 'None' ? 'delayed' : 'on-time'}`}>
                  <Plane size={20} style={{ transform: 'rotate(-45deg)' }} />
                  <span className="delay-type">Departures</span>
                  <span className="delay-value">{data.delays.departure}</span>
                </div>
                <div className={`delay-item ${data.delays.arrival !== 'None' ? 'delayed' : 'on-time'}`}>
                  <Plane size={20} style={{ transform: 'rotate(45deg)' }} />
                  <span className="delay-type">Arrivals</span>
                  <span className="delay-value">{data.delays.arrival}</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Last Update */}
        <div className="last-update-bar">
          <Clock size={14} />
          <span>Data updated: {new Date().toLocaleTimeString()} | Source: Aviation Met Services</span>
          <button className="refresh-btn-small" onClick={() => {
            setLoading(true);
            setTimeout(() => {
              setData(generateAviationData(selectedAirport));
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
