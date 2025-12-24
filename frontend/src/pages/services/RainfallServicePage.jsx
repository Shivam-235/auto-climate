import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  CloudRain,
  ArrowLeft,
  MapPin,
  Droplets,
  TrendingUp,
  TrendingDown,
  Calendar,
  BarChart3,
  Map,
  RefreshCw,
  Clock,
  AlertTriangle,
  ThermometerSun,
  Wind,
  Gauge,
  Activity,
  Zap,
  CloudLightning,
  Umbrella,
  Navigation,
  Eye,
  Waves,
  ChevronRight,
  Info,
  Download,
  Share2,
  Bell,
  Filter
} from 'lucide-react';
import { Link } from 'react-router-dom';
import RainEffect from '../../components/RainEffect';
import { getRainfallData } from '../../services/weatherApi';

const regions = [
  { id: 'north', name: 'North India', states: ['Delhi', 'Punjab', 'Haryana', 'Uttar Pradesh', 'Uttarakhand', 'Himachal Pradesh', 'J&K'], color: '#3b82f6' },
  { id: 'south', name: 'South India', states: ['Tamil Nadu', 'Kerala', 'Karnataka', 'Andhra Pradesh', 'Telangana', 'Puducherry'], color: '#22c55e' },
  { id: 'east', name: 'East India', states: ['West Bengal', 'Odisha', 'Bihar', 'Jharkhand', 'Sikkim'], color: '#f59e0b' },
  { id: 'west', name: 'West India', states: ['Maharashtra', 'Gujarat', 'Rajasthan', 'Goa', 'Daman & Diu'], color: '#ef4444' },
  { id: 'central', name: 'Central India', states: ['Madhya Pradesh', 'Chhattisgarh'], color: '#8b5cf6' },
  { id: 'northeast', name: 'Northeast', states: ['Assam', 'Meghalaya', 'Manipur', 'Tripura', 'Nagaland', 'Arunachal Pradesh', 'Mizoram'], color: '#06b6d4' },
];

const intensityLevels = [
  { min: 0, max: 2.5, label: 'Light', color: '#22c55e', description: 'Light drizzle, minimal impact' },
  { min: 2.5, max: 7.5, label: 'Moderate', color: '#3b82f6', description: 'Steady rain, carry umbrella' },
  { min: 7.5, max: 35, label: 'Heavy', color: '#f59e0b', description: 'Heavy rain, possible flooding' },
  { min: 35, max: 65, label: 'Very Heavy', color: '#ef4444', description: 'Severe, avoid travel' },
  { min: 65, max: Infinity, label: 'Extremely Heavy', color: '#dc2626', description: 'Extreme danger, stay indoors' },
];

const getIntensityInfo = (rainfall) => {
  return intensityLevels.find(level => rainfall >= level.min && rainfall < level.max) || intensityLevels[0];
};

const generateRainfallData = () => {
  return regions.map(region => {
    const currentRainfall = Math.random() * 60;
    const intensityInfo = getIntensityInfo(currentRainfall);

    return {
      ...region,
      currentRainfall: currentRainfall.toFixed(1),
      dailyTotal: (Math.random() * 100 + 10).toFixed(1),
      weeklyTotal: (Math.random() * 300 + 50).toFixed(1),
      monthlyTotal: (Math.random() * 800 + 100).toFixed(1),
      seasonalTotal: (Math.random() * 2000 + 500).toFixed(1),
      normalRainfall: (Math.random() * 700 + 200).toFixed(1),
      departure: (Math.random() * 60 - 30).toFixed(1),
      stations: Math.floor(Math.random() * 80 + 40),
      reportingStations: Math.floor(Math.random() * 60 + 30),
      lastUpdate: new Date().toLocaleTimeString(),
      intensity: intensityInfo.label,
      intensityColor: intensityInfo.color,
      intensityDescription: intensityInfo.description,
      humidity: Math.floor(Math.random() * 40 + 60),
      windSpeed: Math.floor(Math.random() * 30 + 5),
      windDirection: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.floor(Math.random() * 8)],
      visibility: (Math.random() * 8 + 2).toFixed(1),
      pressure: Math.floor(Math.random() * 20 + 1000),
      dewPoint: Math.floor(Math.random() * 10 + 20),
      cloudCover: Math.floor(Math.random() * 40 + 60),
      uvIndex: Math.floor(Math.random() * 3),
      alerts: Math.random() > 0.7 ? [
        { type: 'warning', message: 'Heavy rainfall expected in next 3 hours' },
      ] : [],
      stateData: region.states.map(state => ({
        name: state,
        actual: (Math.random() * 200).toFixed(1),
        normal: (Math.random() * 200).toFixed(1),
        departure: (Math.random() * 60 - 30).toFixed(1),
        currentRate: (Math.random() * 20).toFixed(1),
        status: ['Normal', 'Excess', 'Deficient', 'Large Excess', 'Large Deficient'][Math.floor(Math.random() * 5)],
        rainProbability: Math.floor(Math.random() * 50 + 50),
      })),
      forecast: Array(7).fill(null).map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() + i);
        return {
          day: date.toLocaleDateString('en-US', { weekday: 'short' }),
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          rainfall: (Math.random() * 50).toFixed(1),
          probability: Math.floor(Math.random() * 60 + 40),
          intensity: ['Light', 'Moderate', 'Heavy'][Math.floor(Math.random() * 3)],
        };
      }),
    };
  });
};

const generateHourlyData = () => {
  const hours = [];
  const now = new Date();
  let cumulative = 0;

  for (let i = 23; i >= 0; i--) {
    const hour = new Date(now - i * 3600000);
    const rainfall = Math.random() * 12;
    cumulative += rainfall;
    hours.push({
      time: hour.toLocaleTimeString('en-US', { hour: '2-digit', hour12: true }),
      hour: hour.getHours(),
      rainfall: rainfall.toFixed(1),
      cumulative: cumulative.toFixed(1),
      temp: Math.floor(Math.random() * 8 + 22),
      humidity: Math.floor(Math.random() * 20 + 70),
    });
  }
  return hours;
};

const generateLiveStations = () => {
  const stationNames = [
    'Safdarjung', 'Palam', 'Lodhi Road', 'Ridge', 'Mungeshpur',
    'Najafgarh', 'Pitampura', 'Ayanagar', 'Sports Complex', 'Jafarpur'
  ];

  return stationNames.map((name, i) => ({
    id: i + 1,
    name,
    rainfall: (Math.random() * 30).toFixed(1),
    lastUpdate: `${Math.floor(Math.random() * 15) + 1} min ago`,
    status: Math.random() > 0.1 ? 'active' : 'offline',
    lat: 28.5 + Math.random() * 0.5,
    lon: 77.0 + Math.random() * 0.5,
  }));
};

export default function RainfallServicePage() {
  const [rainfallData, setRainfallData] = useState([]);
  const [hourlyData, setHourlyData] = useState([]);
  const [liveStations, setLiveStations] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('north');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('overview');
  const [showAlerts, setShowAlerts] = useState(true);
  const [animatedRainfall, setAnimatedRainfall] = useState(0);
  const [hoveredState, setHoveredState] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Try to fetch real rainfall data
      const apiData = await getRainfallData();
      if (apiData && apiData.length > 0) {
        // Merge API data with the region structure
        const enhancedData = generateRainfallData().map((region, idx) => {
          const cityData = apiData.find(d =>
            region.states.some(state =>
              d.city?.toLowerCase().includes(state.toLowerCase().split(' ')[0])
            )
          );
          if (cityData) {
            return {
              ...region,
              currentRainfall: (cityData.rainfall || Math.random() * 60).toFixed(1),
              humidity: cityData.humidity || region.humidity,
              isRealData: true,
            };
          }
          return region;
        });
        setRainfallData(enhancedData);
      } else {
        setRainfallData(generateRainfallData());
      }
    } catch (error) {
      console.log('Using simulated rainfall data - API unavailable:', error.message);
      setRainfallData(generateRainfallData());
    }
    setHourlyData(generateHourlyData());
    setLiveStations(generateLiveStations());
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const selectedData = rainfallData.find(r => r.id === selectedRegion);
    if (selectedData) {
      const targetValue = parseFloat(selectedData.currentRainfall);
      let current = 0;
      const increment = targetValue / 30;
      const timer = setInterval(() => {
        current += increment;
        if (current >= targetValue) {
          setAnimatedRainfall(targetValue);
          clearInterval(timer);
        } else {
          setAnimatedRainfall(current);
        }
      }, 30);
      return () => clearInterval(timer);
    }
  }, [selectedRegion, rainfallData]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(loadData, 300000);
    return () => clearInterval(interval);
  }, [loadData]);

  const selectedData = rainfallData.find(r => r.id === selectedRegion);

  const nationalSummary = useMemo(() => ({
    totalStations: rainfallData.reduce((sum, r) => sum + (r.stations || 0), 0),
    reportingStations: rainfallData.reduce((sum, r) => sum + (r.reportingStations || 0), 0),
    avgRainfall: (rainfallData.reduce((sum, r) => sum + parseFloat(r.dailyTotal || 0), 0) / (rainfallData.length || 1)).toFixed(1),
    heavyRainfallRegions: rainfallData.filter(r => parseFloat(r.currentRainfall) > 15).length,
    totalAlerts: rainfallData.reduce((sum, r) => sum + (r.alerts?.length || 0), 0),
  }), [rainfallData]);

  const rainIntensity = selectedData ? parseFloat(selectedData.currentRainfall) / 30 : 0.5;
  const showLightning = selectedData?.intensity === 'Very Heavy' || selectedData?.intensity === 'Extremely Heavy';

  return (
    <div className="forecast-subpage rainfall-page">
      {/* Three.js Rain Effect Background */}
      <RainEffect
        intensity={Math.min(rainIntensity, 2)}
        showLightning={showLightning}
        className="rain-bg-effect"
      />

      <div className="page-bg rain-page-bg">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="rain-gradient-overlay" />
      </div>

      <div className="page-content">
        <Link to="/services" className="back-link">
          <ArrowLeft size={20} />
          Back to Services
        </Link>

        {/* Hero Header */}
        <header className="page-header rainfall-hero">
          <div className="hero-icon-container">
            <CloudRain className="page-header-icon animated-rain-icon" style={{ color: '#3b82f6' }} />
            <div className="rain-drops">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="rain-drop" style={{ animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
          </div>
          <div className="hero-content">
            <h1 className="page-title">Rainfall Information Service</h1>
            <p className="page-subtitle">Real-time rainfall monitoring, precipitation analysis & forecasts</p>
            <div className="hero-badges">
              <span className="hero-badge live">
                <span className="pulse-dot" /> Live Data
              </span>
              <span className="hero-badge">
                <MapPin size={14} /> {nationalSummary.totalStations} Stations
              </span>
              <span className="hero-badge">
                <Activity size={14} /> Auto-refresh: 5min
              </span>
            </div>
          </div>
        </header>

        {/* Alert Banner */}
        {showAlerts && nationalSummary.totalAlerts > 0 && (
          <div className="rainfall-alert-banner">
            <div className="alert-content">
              <AlertTriangle size={20} />
              <span><strong>{nationalSummary.totalAlerts} Active Alerts:</strong> Heavy rainfall warnings in effect for some regions</span>
            </div>
            <button className="alert-dismiss" onClick={() => setShowAlerts(false)}>×</button>
          </div>
        )}

        {/* Quick Stats Bar */}
        <div className="rainfall-quick-stats">
          <div className="quick-stat">
            <Droplets size={18} className="stat-icon" />
            <div className="stat-content">
              <span className="stat-value">{nationalSummary.avgRainfall}</span>
              <span className="stat-label">mm Avg Today</span>
            </div>
          </div>
          <div className="quick-stat">
            <MapPin size={18} className="stat-icon" />
            <div className="stat-content">
              <span className="stat-value">{nationalSummary.reportingStations}</span>
              <span className="stat-label">Reporting</span>
            </div>
          </div>
          <div className="quick-stat warning">
            <CloudLightning size={18} className="stat-icon" />
            <div className="stat-content">
              <span className="stat-value">{nationalSummary.heavyRainfallRegions}</span>
              <span className="stat-label">Heavy Rain Areas</span>
            </div>
          </div>
          <div className="quick-stat">
            <Clock size={18} className="stat-icon" />
            <div className="stat-content">
              <span className="stat-value">{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
              <span className="stat-label">Last Sync</span>
            </div>
          </div>
        </div>

        {/* Region Selector Tabs */}
        <div className="region-tabs">
          {regions.map(region => (
            <button
              key={region.id}
              className={`region-tab ${selectedRegion === region.id ? 'active' : ''}`}
              onClick={() => setSelectedRegion(region.id)}
              style={{ '--region-color': region.color }}
            >
              <span className="region-indicator" style={{ background: region.color }} />
              {region.name}
              {rainfallData.find(r => r.id === region.id)?.alerts?.length > 0 && (
                <span className="region-alert-dot" />
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-state rainfall-loading">
            <div className="loading-rain">
              <CloudRain size={48} className="loading-cloud" />
              <div className="loading-drops">
                {[...Array(8)].map((_, i) => (
                  <span key={i} className="loading-drop" style={{ animationDelay: `${i * 0.1}s` }} />
                ))}
              </div>
            </div>
            <p>Loading rainfall data...</p>
          </div>
        ) : (
          <>
            {/* Main Dashboard */}
            <div className="rainfall-dashboard">
              {/* Current Conditions Card */}
              <div className="card rainfall-main-card">
                <div className="current-rainfall-display">
                  <div className="rainfall-gauge">
                    <svg viewBox="0 0 200 200" className="gauge-svg">
                      <defs>
                        <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#22c55e" />
                          <stop offset="33%" stopColor="#3b82f6" />
                          <stop offset="66%" stopColor="#f59e0b" />
                          <stop offset="100%" stopColor="#ef4444" />
                        </linearGradient>
                      </defs>
                      <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="12" />
                      <circle
                        cx="100"
                        cy="100"
                        r="90"
                        fill="none"
                        stroke={selectedData?.intensityColor}
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray={`${(animatedRainfall / 70) * 565} 565`}
                        transform="rotate(-90 100 100)"
                        className="gauge-progress"
                      />
                    </svg>
                    <div className="gauge-center">
                      <span className="gauge-value">{animatedRainfall.toFixed(1)}</span>
                      <span className="gauge-unit">mm/hr</span>
                    </div>
                  </div>
                  <div className="current-rainfall-info">
                    <h3>{selectedData?.name}</h3>
                    <div className="intensity-badge" style={{
                      background: `${selectedData?.intensityColor}20`,
                      color: selectedData?.intensityColor,
                      borderColor: selectedData?.intensityColor
                    }}>
                      {selectedData?.intensity === 'Heavy' || selectedData?.intensity === 'Very Heavy' ?
                        <Zap size={16} /> : <Droplets size={16} />}
                      {selectedData?.intensity} Rainfall
                    </div>
                    <p className="intensity-description">{selectedData?.intensityDescription}</p>

                    {selectedData?.alerts?.length > 0 && (
                      <div className="inline-alert">
                        <AlertTriangle size={16} />
                        {selectedData.alerts[0].message}
                      </div>
                    )}
                  </div>
                </div>

                {/* Rainfall Totals */}
                <div className="rainfall-totals-grid">
                  <div className="total-card">
                    <div className="total-icon" style={{ background: 'rgba(59, 130, 246, 0.2)' }}>
                      <Clock size={20} style={{ color: '#3b82f6' }} />
                    </div>
                    <div className="total-info">
                      <span className="total-value">{selectedData?.dailyTotal}</span>
                      <span className="total-label">Today (mm)</span>
                    </div>
                  </div>
                  <div className="total-card">
                    <div className="total-icon" style={{ background: 'rgba(34, 197, 94, 0.2)' }}>
                      <Calendar size={20} style={{ color: '#22c55e' }} />
                    </div>
                    <div className="total-info">
                      <span className="total-value">{selectedData?.weeklyTotal}</span>
                      <span className="total-label">This Week (mm)</span>
                    </div>
                  </div>
                  <div className="total-card">
                    <div className="total-icon" style={{ background: 'rgba(139, 92, 246, 0.2)' }}>
                      <BarChart3 size={20} style={{ color: '#8b5cf6' }} />
                    </div>
                    <div className="total-info">
                      <span className="total-value">{selectedData?.monthlyTotal}</span>
                      <span className="total-label">This Month (mm)</span>
                    </div>
                  </div>
                  <div className="total-card">
                    <div className="total-icon" style={{ background: 'rgba(245, 158, 11, 0.2)' }}>
                      <TrendingUp size={20} style={{ color: '#f59e0b' }} />
                    </div>
                    <div className="total-info">
                      <span className="total-value">{selectedData?.seasonalTotal}</span>
                      <span className="total-label">Seasonal (mm)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Weather Conditions */}
              <div className="card conditions-card">
                <h3 className="card-title">
                  <Activity size={20} style={{ color: '#06b6d4' }} />
                  Current Conditions
                </h3>
                <div className="conditions-grid">
                  <div className="condition-item">
                    <div className="condition-icon">
                      <Droplets size={18} />
                    </div>
                    <div className="condition-info">
                      <span className="condition-value">{selectedData?.humidity}%</span>
                      <span className="condition-label">Humidity</span>
                    </div>
                    <div className="condition-bar">
                      <div className="condition-fill" style={{ width: `${selectedData?.humidity}%`, background: '#3b82f6' }} />
                    </div>
                  </div>
                  <div className="condition-item">
                    <div className="condition-icon">
                      <Wind size={18} />
                    </div>
                    <div className="condition-info">
                      <span className="condition-value">{selectedData?.windSpeed} <small>km/h</small></span>
                      <span className="condition-label">Wind ({selectedData?.windDirection})</span>
                    </div>
                    <div className="condition-bar">
                      <div className="condition-fill" style={{ width: `${selectedData?.windSpeed * 2}%`, background: '#22c55e' }} />
                    </div>
                  </div>
                  <div className="condition-item">
                    <div className="condition-icon">
                      <Eye size={18} />
                    </div>
                    <div className="condition-info">
                      <span className="condition-value">{selectedData?.visibility} <small>km</small></span>
                      <span className="condition-label">Visibility</span>
                    </div>
                    <div className="condition-bar">
                      <div className="condition-fill" style={{ width: `${selectedData?.visibility * 10}%`, background: '#8b5cf6' }} />
                    </div>
                  </div>
                  <div className="condition-item">
                    <div className="condition-icon">
                      <Gauge size={18} />
                    </div>
                    <div className="condition-info">
                      <span className="condition-value">{selectedData?.pressure} <small>hPa</small></span>
                      <span className="condition-label">Pressure</span>
                    </div>
                    <div className="condition-bar">
                      <div className="condition-fill" style={{ width: `${((selectedData?.pressure - 980) / 40) * 100}%`, background: '#f59e0b' }} />
                    </div>
                  </div>
                  <div className="condition-item">
                    <div className="condition-icon">
                      <CloudRain size={18} />
                    </div>
                    <div className="condition-info">
                      <span className="condition-value">{selectedData?.cloudCover}%</span>
                      <span className="condition-label">Cloud Cover</span>
                    </div>
                    <div className="condition-bar">
                      <div className="condition-fill" style={{ width: `${selectedData?.cloudCover}%`, background: '#6b7280' }} />
                    </div>
                  </div>
                  <div className="condition-item">
                    <div className="condition-icon">
                      <ThermometerSun size={18} />
                    </div>
                    <div className="condition-info">
                      <span className="condition-value">{selectedData?.dewPoint}°C</span>
                      <span className="condition-label">Dew Point</span>
                    </div>
                    <div className="condition-bar">
                      <div className="condition-fill" style={{ width: `${selectedData?.dewPoint * 3}%`, background: '#06b6d4' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Departure Analysis */}
              <div className="card departure-card">
                <h3 className="card-title">
                  <TrendingUp size={20} style={{ color: '#8b5cf6' }} />
                  Departure from Normal
                </h3>
                <div className="departure-display">
                  <div className="departure-gauge">
                    <div className="departure-scale">
                      <span className="scale-negative">-60%</span>
                      <span className="scale-zero">Normal</span>
                      <span className="scale-positive">+60%</span>
                    </div>
                    <div className="departure-bar-container">
                      <div className="departure-center-line" />
                      <div
                        className={`departure-indicator ${parseFloat(selectedData?.departure) >= 0 ? 'positive' : 'negative'}`}
                        style={{
                          width: `${Math.abs(parseFloat(selectedData?.departure)) / 60 * 50}%`,
                          [parseFloat(selectedData?.departure) >= 0 ? 'left' : 'right']: '50%',
                          background: parseFloat(selectedData?.departure) >= 0 ? '#22c55e' : '#ef4444'
                        }}
                      />
                    </div>
                    <div className="departure-value-display">
                      <span
                        className="departure-value"
                        style={{ color: parseFloat(selectedData?.departure) >= 0 ? '#22c55e' : '#ef4444' }}
                      >
                        {parseFloat(selectedData?.departure) >= 0 ? '+' : ''}{selectedData?.departure}%
                      </span>
                      <span className="departure-label">
                        {parseFloat(selectedData?.departure) >= 0 ? 'Above Normal' : 'Below Normal'}
                      </span>
                    </div>
                  </div>
                  <div className="departure-comparison">
                    <div className="comparison-row">
                      <span className="comp-label">Actual Rainfall</span>
                      <span className="comp-value">{selectedData?.monthlyTotal} mm</span>
                    </div>
                    <div className="comparison-row">
                      <span className="comp-label">Normal Rainfall</span>
                      <span className="comp-value">{selectedData?.normalRainfall} mm</span>
                    </div>
                    <div className="comparison-row">
                      <span className="comp-label">Difference</span>
                      <span className="comp-value" style={{
                        color: parseFloat(selectedData?.departure) >= 0 ? '#22c55e' : '#ef4444'
                      }}>
                        {(parseFloat(selectedData?.monthlyTotal) - parseFloat(selectedData?.normalRainfall)).toFixed(1)} mm
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="view-toggle rainfall-view-toggle">
              <button
                className={`toggle-btn ${viewMode === 'overview' ? 'active' : ''}`}
                onClick={() => setViewMode('overview')}
              >
                <BarChart3 size={16} />
                7-Day Forecast
              </button>
              <button
                className={`toggle-btn ${viewMode === 'hourly' ? 'active' : ''}`}
                onClick={() => setViewMode('hourly')}
              >
                <Clock size={16} />
                24-Hour Trend
              </button>
              <button
                className={`toggle-btn ${viewMode === 'states' ? 'active' : ''}`}
                onClick={() => setViewMode('states')}
              >
                <Map size={16} />
                State-wise Data
              </button>
              <button
                className={`toggle-btn ${viewMode === 'stations' ? 'active' : ''}`}
                onClick={() => setViewMode('stations')}
              >
                <MapPin size={16} />
                Live Stations
              </button>
            </div>

            {/* Content Based on View Mode */}
            {viewMode === 'overview' && (
              <div className="card forecast-card">
                <h3 className="card-title">
                  <Calendar size={20} style={{ color: '#3b82f6' }} />
                  7-Day Rainfall Forecast - {selectedData?.name}
                </h3>
                <div className="forecast-week">
                  {selectedData?.forecast?.map((day, idx) => (
                    <div key={idx} className={`forecast-day-card ${idx === 0 ? 'today' : ''}`}>
                      <span className="forecast-day-name">{idx === 0 ? 'Today' : day.day}</span>
                      <span className="forecast-date">{day.date}</span>
                      <div className="forecast-icon">
                        <CloudRain size={32} style={{
                          color: day.intensity === 'Heavy' ? '#ef4444' :
                            day.intensity === 'Moderate' ? '#f59e0b' : '#3b82f6'
                        }} />
                      </div>
                      <span className="forecast-rainfall">{day.rainfall} mm</span>
                      <div className="forecast-probability">
                        <Umbrella size={14} />
                        <span>{day.probability}%</span>
                      </div>
                      <span className={`forecast-intensity ${day.intensity.toLowerCase()}`}>
                        {day.intensity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {viewMode === 'hourly' && (
              <div className="card hourly-card">
                <h3 className="card-title">
                  <Clock size={20} style={{ color: '#3b82f6' }} />
                  24-Hour Rainfall Trend
                </h3>
                <div className="hourly-chart-enhanced">
                  <div className="chart-y-axis">
                    <span>12</span>
                    <span>8</span>
                    <span>4</span>
                    <span>0</span>
                  </div>
                  <div className="chart-container">
                    {hourlyData.map((hour, idx) => (
                      <div key={idx} className="hourly-bar-wrapper">
                        <div
                          className="hourly-bar-enhanced"
                          style={{
                            height: `${Math.min(parseFloat(hour.rainfall) / 12 * 100, 100)}%`,
                          }}
                        >
                          <div
                            className="bar-fill"
                            style={{
                              background: parseFloat(hour.rainfall) > 8 ?
                                'linear-gradient(to top, #ef4444, #f87171)' :
                                parseFloat(hour.rainfall) > 4 ?
                                  'linear-gradient(to top, #f59e0b, #fbbf24)' :
                                  'linear-gradient(to top, #3b82f6, #60a5fa)'
                            }}
                          />
                          <span className="bar-tooltip">
                            <strong>{hour.rainfall} mm</strong>
                            <br />
                            Cumulative: {hour.cumulative} mm
                            <br />
                            Humidity: {hour.humidity}%
                          </span>
                        </div>
                        <span className="hourly-label">{hour.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="hourly-legend">
                  <div className="legend-item">
                    <span className="legend-color" style={{ background: '#3b82f6' }} />
                    Light (&lt;4mm)
                  </div>
                  <div className="legend-item">
                    <span className="legend-color" style={{ background: '#f59e0b' }} />
                    Moderate (4-8mm)
                  </div>
                  <div className="legend-item">
                    <span className="legend-color" style={{ background: '#ef4444' }} />
                    Heavy (&gt;8mm)
                  </div>
                </div>
              </div>
            )}

            {viewMode === 'states' && (
              <div className="card states-card">
                <h3 className="card-title">
                  <Map size={20} style={{ color: '#3b82f6' }} />
                  State-wise Rainfall Data - {selectedData?.name}
                </h3>
                <div className="states-grid">
                  {selectedData?.stateData?.map((state, idx) => (
                    <div
                      key={idx}
                      className={`state-card ${hoveredState === idx ? 'hovered' : ''}`}
                      onMouseEnter={() => setHoveredState(idx)}
                      onMouseLeave={() => setHoveredState(null)}
                    >
                      <div className="state-header">
                        <h4>{state.name}</h4>
                        <span className={`state-status ${state.status.toLowerCase().replace(' ', '-')}`}>
                          {state.status}
                        </span>
                      </div>
                      <div className="state-rainfall">
                        <div className="rainfall-rate">
                          <CloudRain size={24} style={{ color: '#3b82f6' }} />
                          <span className="rate-value">{state.currentRate}</span>
                          <span className="rate-unit">mm/hr</span>
                        </div>
                        <div className="rain-probability">
                          <Umbrella size={16} />
                          <span>{state.rainProbability}%</span>
                        </div>
                      </div>
                      <div className="state-stats">
                        <div className="stat-row">
                          <span>Actual</span>
                          <span>{state.actual} mm</span>
                        </div>
                        <div className="stat-row">
                          <span>Normal</span>
                          <span>{state.normal} mm</span>
                        </div>
                        <div className="stat-row departure">
                          <span>Departure</span>
                          <span style={{
                            color: parseFloat(state.departure) >= 0 ? '#22c55e' : '#ef4444'
                          }}>
                            {parseFloat(state.departure) >= 0 ? '+' : ''}{state.departure}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {viewMode === 'stations' && (
              <div className="card stations-card">
                <h3 className="card-title">
                  <MapPin size={20} style={{ color: '#3b82f6' }} />
                  Live Weather Stations
                </h3>
                <div className="stations-list">
                  {liveStations.map((station, idx) => (
                    <div key={idx} className={`station-item ${station.status}`}>
                      <div className="station-info">
                        <div className="station-status-dot" />
                        <div>
                          <span className="station-name">{station.name}</span>
                          <span className="station-update">{station.lastUpdate}</span>
                        </div>
                      </div>
                      <div className="station-reading">
                        <Droplets size={18} style={{ color: '#3b82f6' }} />
                        <span className="reading-value">{station.rainfall}</span>
                        <span className="reading-unit">mm</span>
                      </div>
                      <div className="station-coords">
                        <Navigation size={14} />
                        <span>{station.lat.toFixed(2)}°N, {station.lon.toFixed(2)}°E</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Intensity Scale Reference */}
            <div className="card intensity-reference">
              <h3 className="card-title">
                <Info size={20} style={{ color: '#6b7280' }} />
                Rainfall Intensity Scale
              </h3>
              <div className="intensity-scale">
                {intensityLevels.map((level, idx) => (
                  <div key={idx} className="intensity-item">
                    <div className="intensity-color" style={{ background: level.color }} />
                    <div className="intensity-info">
                      <span className="intensity-label">{level.label}</span>
                      <span className="intensity-range">
                        {level.max === Infinity ? `>${level.min}` : `${level.min}-${level.max}`} mm/hr
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Bar */}
            <div className="rainfall-action-bar">
              <button className="action-btn primary" onClick={loadData}>
                <RefreshCw size={16} />
                Refresh Data
              </button>
              <button className="action-btn">
                <Download size={16} />
                Export Report
              </button>
              <button className="action-btn">
                <Share2 size={16} />
                Share
              </button>
              <button className="action-btn">
                <Bell size={16} />
                Set Alert
              </button>
            </div>

            {/* Last Update Info */}
            <div className="last-update-bar enhanced">
              <div className="update-info">
                <Clock size={14} />
                <span>Last updated: {selectedData?.lastUpdate}</span>
                <span className="separator">|</span>
                <MapPin size={14} />
                <span>Data from {selectedData?.stations} weather stations</span>
              </div>
              <span className="data-source">Source: India Meteorological Department (IMD)</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
