import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import {
  AlertTriangle,
  ArrowLeft,
  MapPin,
  ThermometerSun,
  CloudRain,
  Wind,
  Waves,
  Flame,
  Mountain,
  RefreshCw,
  Clock,
  Shield,
  Info,
  ChevronDown,
  ChevronUp,
  Map,
  Layers,
  ZoomIn,
  ZoomOut,
  Locate,
  X,
  Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getMajorCitiesWeather } from '../../services/weatherApi';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// State centers for map navigation
const stateCoordinates = {
  'Andhra Pradesh': { center: [15.9129, 79.7400], zoom: 7 },
  'Assam': { center: [26.2006, 92.9376], zoom: 7 },
  'Bihar': { center: [25.0961, 85.3131], zoom: 7 },
  'Gujarat': { center: [22.2587, 71.1924], zoom: 7 },
  'Karnataka': { center: [15.3173, 75.7139], zoom: 7 },
  'Kerala': { center: [10.8505, 76.2711], zoom: 8 },
  'Madhya Pradesh': { center: [22.9734, 78.6569], zoom: 6 },
  'Maharashtra': { center: [19.7515, 75.7139], zoom: 6 },
  'Odisha': { center: [20.9517, 85.0985], zoom: 7 },
  'Rajasthan': { center: [27.0238, 74.2179], zoom: 6 },
  'Tamil Nadu': { center: [11.1271, 78.6569], zoom: 7 },
  'Uttar Pradesh': { center: [26.8467, 80.9462], zoom: 6 },
  'West Bengal': { center: [22.9868, 87.8550], zoom: 7 },
  'Uttarakhand': { center: [30.0668, 79.0193], zoom: 7 },
  'Himachal Pradesh': { center: [31.1048, 77.1734], zoom: 7 },
};

// Hazard zone locations for each state (sample data)
const getStateHazardZones = (state) => {
  const baseCoord = stateCoordinates[state]?.center || [22.5, 82.5];
  const zones = [];

  // Generate hazard zones around the state center
  for (let i = 0; i < 8; i++) {
    const latOffset = (Math.random() - 0.5) * 4;
    const lonOffset = (Math.random() - 0.5) * 4;
    zones.push({
      id: i,
      name: `Zone ${i + 1}`,
      lat: baseCoord[0] + latOffset,
      lon: baseCoord[1] + lonOffset,
      riskScore: Math.floor(Math.random() * 100),
      dominantHazard: ['Flood', 'Drought', 'Cyclone', 'Heat Wave', 'Landslide', 'Thunderstorm'][Math.floor(Math.random() * 6)],
      population: `${(Math.random() * 2 + 0.5).toFixed(1)}M`,
    });
  }
  return zones;
};

// Map styles
const mapStyles = [
  { id: 'dark', label: 'Dark', url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' },
  { id: 'light', label: 'Light', url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png' },
  { id: 'satellite', label: 'Satellite', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}' },
  { id: 'terrain', label: 'Terrain', url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png' },
];

// Get risk color based on score
const getRiskColor = (score) => {
  if (score >= 80) return '#ef4444';
  if (score >= 60) return '#f97316';
  if (score >= 40) return '#eab308';
  if (score >= 20) return '#22c55e';
  return '#3b82f6';
};

// Create hazard marker
const createHazardMarker = (riskScore) => {
  const color = getRiskColor(riskScore);
  return L.divIcon({
    className: 'hazard-marker',
    html: `
      <div style="
        width: 36px;
        height: 36px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 700;
        font-size: 11px;
        text-shadow: 0 1px 2px rgba(0,0,0,0.5);
      ">${riskScore}</div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
};

// Map controller component
function MapController({ center, zoom }) {
  const map = useMap();

  useEffect(() => {
    if (center && zoom) {
      map.flyTo(center, zoom, { animate: true, duration: 1.2 });
    }
  }, [center, zoom, map]);

  return null;
}

// Custom controls component
function CustomControls({ onLocate }) {
  const map = useMap();

  const iconStyle = {
    color: '#ffffff',
    stroke: '#ffffff',
    strokeWidth: 2.5
  };

  return (
    <div className="leaflet-custom-controls hazard-controls">
      <button
        className="leaflet-control-btn hazard-ctrl-btn"
        onClick={() => map.zoomIn()}
        title="Zoom In"
        type="button"
      >
        <ZoomIn size={20} style={iconStyle} />
      </button>
      <button
        className="leaflet-control-btn hazard-ctrl-btn"
        onClick={() => map.zoomOut()}
        title="Zoom Out"
        type="button"
      >
        <ZoomOut size={20} style={iconStyle} />
      </button>
      <button
        className="leaflet-control-btn hazard-ctrl-btn"
        onClick={onLocate}
        title="Reset View"
        type="button"
      >
        <Locate size={20} style={iconStyle} />
      </button>
    </div>
  );
}

// Map click handler
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onMapClick(lat, lng);
    },
  });
  return null;
}

// Selected location panel
function LocationPanel({ location, onClose }) {
  if (!location) return null;

  return (
    <div className="location-panel open">
      <div className="location-panel-header">
        <h4>Selected Location</h4>
        <button className="panel-close-btn" onClick={onClose}>
          <X size={18} />
        </button>
      </div>
      <div className="location-panel-content">
        <p><strong>Latitude:</strong> {location.lat.toFixed(4)}°N</p>
        <p><strong>Longitude:</strong> {location.lng.toFixed(4)}°E</p>
        <p className="panel-note">Click on hazard zones for risk details</p>
      </div>
    </div>
  );
}

const hazardTypes = [
  { id: 'flood', name: 'Flood Risk', icon: Waves, color: '#3b82f6' },
  { id: 'drought', name: 'Drought Risk', icon: ThermometerSun, color: '#f97316' },
  { id: 'cyclone', name: 'Cyclone Risk', icon: Wind, color: '#22c55e' },
  { id: 'heatwave', name: 'Heat Wave Risk', icon: Flame, color: '#ef4444' },
  { id: 'landslide', name: 'Landslide Risk', icon: Mountain, color: '#92400e' },
  { id: 'thunderstorm', name: 'Thunderstorm Risk', icon: CloudRain, color: '#8b5cf6' },
];

const states = [
  'Andhra Pradesh', 'Assam', 'Bihar', 'Gujarat', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Rajasthan',
  'Tamil Nadu', 'Uttar Pradesh', 'West Bengal', 'Uttarakhand', 'Himachal Pradesh'
];

const riskLevels = [
  { level: 'Very High', color: '#ef4444', score: '80-100' },
  { level: 'High', color: '#f97316', score: '60-79' },
  { level: 'Moderate', color: '#eab308', score: '40-59' },
  { level: 'Low', color: '#22c55e', score: '20-39' },
  { level: 'Very Low', color: '#3b82f6', score: '0-19' },
];

const generateHazardData = (selectedState) => {
  const generateRisk = () => Math.floor(Math.random() * 100);

  const getRiskLevel = (score) => {
    if (score >= 80) return riskLevels[0];
    if (score >= 60) return riskLevels[1];
    if (score >= 40) return riskLevels[2];
    if (score >= 20) return riskLevels[3];
    return riskLevels[4];
  };

  const hazards = hazardTypes.map(hazard => {
    const riskScore = generateRisk();
    return {
      ...hazard,
      riskScore,
      riskLevel: getRiskLevel(riskScore),
      districts: Math.floor(Math.random() * 15 + 3),
      population: `${(Math.random() * 10 + 1).toFixed(1)}M`,
      historicalEvents: Math.floor(Math.random() * 20 + 5),
      trend: ['Increasing', 'Stable', 'Decreasing'][Math.floor(Math.random() * 3)],
    };
  });

  return {
    state: selectedState,
    overallVulnerability: Math.floor(hazards.reduce((sum, h) => sum + h.riskScore, 0) / hazards.length),
    hazards,
    vulnerableDistricts: [
      { name: 'District A', risk: 'High', hazards: ['Flood', 'Cyclone'] },
      { name: 'District B', risk: 'Moderate', hazards: ['Drought'] },
      { name: 'District C', risk: 'High', hazards: ['Heat Wave', 'Drought'] },
      { name: 'District D', risk: 'Very High', hazards: ['Flood', 'Landslide'] },
    ],
    seasonalRisk: {
      'Pre-Monsoon': { dominant: 'Heat Wave', level: 'High' },
      'Monsoon': { dominant: 'Flood', level: 'Very High' },
      'Post-Monsoon': { dominant: 'Cyclone', level: 'Moderate' },
      'Winter': { dominant: 'Cold Wave', level: 'Low' },
    },
    adaptationMeasures: [
      'Early warning systems in flood-prone areas',
      'Heat action plans for urban centers',
      'Drought-resistant crop varieties promotion',
      'Coastal protection infrastructure',
      'Community-based disaster preparedness',
    ],
    lastUpdated: new Date().toLocaleDateString()
  };
};

export default function HazardAtlasPage({ weatherData }) {
  const [selectedState, setSelectedState] = useState('Maharashtra');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedHazard, setExpandedHazard] = useState(null);
  const [mapStyle, setMapStyle] = useState('dark');
  const [hazardZones, setHazardZones] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showHazardZones, setShowHazardZones] = useState(true);
  const [activeHazardLayer, setActiveHazardLayer] = useState('all');
  const mapRef = useRef(null);

  // Get current state coordinates
  const currentStateCoords = stateCoordinates[selectedState] || { center: [22.5, 82.5], zoom: 6 };
  const currentMapStyle = mapStyles.find(s => s.id === mapStyle);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch current weather to inform hazard risk assessment
        const citiesWeather = await getMajorCitiesWeather();
        const hazardData = generateHazardData(selectedState);

        if (citiesWeather && citiesWeather.length > 0) {
          hazardData.isRealData = true;
          // Adjust hazard risks based on current weather conditions
          const avgTemp = citiesWeather.reduce((sum, c) => sum + (c.current?.temperature || 25), 0) / citiesWeather.length;
          if (avgTemp > 35) {
            const heatHazard = hazardData.hazards.find(h => h.type === 'heatwave');
            if (heatHazard) heatHazard.riskScore = Math.min(100, heatHazard.riskScore + 20);
          }
        }
        setData(hazardData);
        // Generate hazard zones for the map
        setHazardZones(getStateHazardZones(selectedState));
      } catch (error) {
        console.log('Using simulated hazard data - API unavailable:', error.message);
        setData(generateHazardData(selectedState));
        setHazardZones(getStateHazardZones(selectedState));
      }
      setLoading(false);
    };
    fetchData();
  }, [selectedState]);

  const overallLevel = data ? riskLevels.find(r => {
    const [min, max] = r.score.split('-').map(Number);
    return data.overallVulnerability >= min && data.overallVulnerability <= (max || 100);
  }) : null;

  const handleMapClick = (lat, lng) => {
    setSelectedLocation({ lat, lng });
  };

  const handleResetView = () => {
    if (mapRef.current) {
      mapRef.current.flyTo(currentStateCoords.center, currentStateCoords.zoom, { animate: true });
    }
  };

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
          <AlertTriangle className="page-header-icon" style={{ color: '#f97316' }} />
          <div>
            <h1 className="page-title">Climate Hazard & Vulnerability Atlas</h1>
            <p className="page-subtitle">Interactive hazard mapping and risk assessment</p>
          </div>
        </header>

        {/* State Selector */}
        <div className="selector-container">
          <div className="selector-header">
            <MapPin size={18} style={{ color: '#f97316' }} />
            <span className="selector-title">Select State/Region</span>
          </div>
          <div className="state-selector hazard-state-selector">
            {states.map(state => (
              <button
                key={state}
                className={`state-btn hazard-state-btn ${selectedState === state ? 'active' : ''}`}
                onClick={() => setSelectedState(state)}
              >
                <MapPin size={14} />
                {state}
              </button>
            ))}
          </div>
        </div>

        {/* Risk Level Legend */}
        <div className="card risk-legend">
          <h4>Risk Level Legend</h4>
          <div className="legend-items">
            {riskLevels.map((level, idx) => (
              <div key={idx} className="legend-item">
                <span className="legend-dot" style={{ background: level.color }} />
                <span className="legend-label">{level.level}</span>
                <span className="legend-score">({level.score})</span>
              </div>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <RefreshCw size={32} className="spinning" />
            <p>Loading hazard data for {selectedState}...</p>
          </div>
        ) : (
          <>
            {/* Overall Vulnerability */}
            <div className="card overall-vulnerability" style={{ borderLeft: `4px solid ${overallLevel?.color}` }}>
              <div className="vulnerability-header">
                <Shield size={32} style={{ color: overallLevel?.color }} />
                <div>
                  <h3>{selectedState} - Overall Climate Vulnerability</h3>
                  <p>Composite index based on multiple hazard types</p>
                </div>
              </div>
              <div className="vulnerability-score">
                <span className="score-value" style={{ color: overallLevel?.color }}>
                  {data.overallVulnerability}
                </span>
                <span className="score-label" style={{ background: overallLevel?.color }}>
                  {overallLevel?.level} Vulnerability
                </span>
              </div>
              <div className="vulnerability-bar">
                <div
                  className="vulnerability-fill"
                  style={{ width: `${data.overallVulnerability}%`, background: overallLevel?.color }}
                />
              </div>
            </div>

            {/* Hazard Cards */}
            <div className="hazard-grid">
              {data.hazards.map((hazard, idx) => (
                <div
                  key={idx}
                  className={`card hazard-card ${expandedHazard === hazard.id ? 'expanded' : ''}`}
                  style={{ borderLeft: `4px solid ${hazard.riskLevel.color}` }}
                >
                  <div
                    className="hazard-header"
                    onClick={() => setExpandedHazard(expandedHazard === hazard.id ? null : hazard.id)}
                  >
                    <div className="hazard-icon">
                      <hazard.icon size={24} style={{ color: hazard.color }} />
                    </div>
                    <div className="hazard-info">
                      <h4>{hazard.name}</h4>
                      <span className="hazard-risk" style={{ color: hazard.riskLevel.color }}>
                        {hazard.riskLevel.level} Risk
                      </span>
                    </div>
                    <div className="hazard-score">
                      <span style={{ color: hazard.riskLevel.color }}>{hazard.riskScore}</span>
                      {expandedHazard === hazard.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </div>

                  {expandedHazard === hazard.id && (
                    <div className="hazard-details">
                      <div className="hazard-stats">
                        <div className="stat">
                          <span className="stat-label">Affected Districts</span>
                          <span className="stat-value">{hazard.districts}</span>
                        </div>
                        <div className="stat">
                          <span className="stat-label">Population at Risk</span>
                          <span className="stat-value">{hazard.population}</span>
                        </div>
                        <div className="stat">
                          <span className="stat-label">Historical Events</span>
                          <span className="stat-value">{hazard.historicalEvents}</span>
                        </div>
                        <div className="stat">
                          <span className="stat-label">Trend</span>
                          <span className={`stat-value trend-${hazard.trend.toLowerCase()}`}>
                            {hazard.trend}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Vulnerable Districts */}
            <div className="card">
              <h3 className="card-section-title">
                <MapPin size={20} style={{ color: '#ef4444' }} />
                Most Vulnerable Districts
              </h3>
              <div className="vulnerable-districts">
                {data.vulnerableDistricts.map((district, idx) => (
                  <div key={idx} className={`district-item risk-${district.risk.toLowerCase().replace(' ', '-')}`}>
                    <div className="district-info">
                      <h4>{district.name}</h4>
                      <span className="district-risk">{district.risk} Risk</span>
                    </div>
                    <div className="district-hazards">
                      {district.hazards.map((h, i) => (
                        <span key={i} className="hazard-tag">{h}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Seasonal Risk Profile */}
            <div className="card">
              <h3 className="card-section-title">
                <Clock size={20} style={{ color: '#8b5cf6' }} />
                Seasonal Risk Profile
              </h3>
              <div className="seasonal-risk-grid">
                {Object.entries(data.seasonalRisk).map(([season, risk], idx) => (
                  <div key={idx} className="seasonal-card">
                    <h4>{season}</h4>
                    <span className="dominant-hazard">{risk.dominant}</span>
                    <span className={`seasonal-level level-${risk.level.toLowerCase().replace(' ', '-')}`}>
                      {risk.level}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Adaptation Measures */}
            <div className="card">
              <h3 className="card-section-title">
                <Shield size={20} style={{ color: '#22c55e' }} />
                Recommended Adaptation Measures
              </h3>
              <ul className="adaptation-list">
                {data.adaptationMeasures.map((measure, idx) => (
                  <li key={idx}>
                    <Info size={16} style={{ color: '#22c55e' }} />
                    {measure}
                  </li>
                ))}
              </ul>
            </div>

            {/* Interactive Hazard Map */}
            <div className="card hazard-map-card">
              <div className="map-header">
                <h3>
                  <Map size={20} style={{ color: '#3b82f6' }} />
                  Interactive Hazard Map - {selectedState}
                </h3>
                <span className="map-timestamp">
                  <Clock size={14} />
                  {new Date().toLocaleTimeString()}
                </span>
              </div>

              {/* Hazard Layer Filter */}
              <div className="hazard-layer-filter">
                <span className="filter-label">Filter by Hazard:</span>
                <div className="filter-buttons">
                  <button
                    className={`filter-btn ${activeHazardLayer === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveHazardLayer('all')}
                  >
                    All Hazards
                  </button>
                  {hazardTypes.map(hazard => (
                    <button
                      key={hazard.id}
                      className={`filter-btn ${activeHazardLayer === hazard.name.replace(' Risk', '') ? 'active' : ''}`}
                      onClick={() => setActiveHazardLayer(hazard.name.replace(' Risk', ''))}
                      style={{ borderColor: activeHazardLayer === hazard.name.replace(' Risk', '') ? hazard.color : 'transparent' }}
                    >
                      <hazard.icon size={14} style={{ color: hazard.color }} />
                      {hazard.name.replace(' Risk', '')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="leaflet-map-wrapper hazard-map-wrapper">
                <MapContainer
                  center={currentStateCoords.center}
                  zoom={currentStateCoords.zoom}
                  className="leaflet-map hazard-leaflet"
                  ref={mapRef}
                  zoomControl={false}
                  style={{ height: '500px', width: '100%' }}
                >
                  {/* Base Map Layer */}
                  <TileLayer
                    url={currentMapStyle.url}
                    attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                  />

                  {/* Hazard Zone Circles */}
                  {showHazardZones && hazardZones
                    .filter(zone => activeHazardLayer === 'all' || zone.dominantHazard === activeHazardLayer)
                    .map((zone) => (
                      <Circle
                        key={`circle-${zone.id}`}
                        center={[zone.lat, zone.lon]}
                        radius={50000}
                        pathOptions={{
                          color: getRiskColor(zone.riskScore),
                          fillColor: getRiskColor(zone.riskScore),
                          fillOpacity: 0.25,
                          weight: 2,
                        }}
                      />
                    ))}

                  {/* Hazard Zone Markers */}
                  {showHazardZones && hazardZones
                    .filter(zone => activeHazardLayer === 'all' || zone.dominantHazard === activeHazardLayer)
                    .map((zone) => (
                      <Marker
                        key={zone.id}
                        position={[zone.lat, zone.lon]}
                        icon={createHazardMarker(zone.riskScore)}
                      >
                        <Popup>
                          <div className="map-popup hazard-popup">
                            <h4>{zone.name}</h4>
                            <div className="popup-risk" style={{ color: getRiskColor(zone.riskScore) }}>
                              <strong>Risk Score: {zone.riskScore}</strong>
                            </div>
                            <p className="popup-hazard">
                              <AlertTriangle size={14} style={{ color: '#f97316' }} />
                              Dominant: {zone.dominantHazard}
                            </p>
                            <p className="popup-population">
                              <MapPin size={14} />
                              Population: {zone.population}
                            </p>
                            <p className="popup-coords">
                              {zone.lat.toFixed(2)}°N, {zone.lon.toFixed(2)}°E
                            </p>
                          </div>
                        </Popup>
                      </Marker>
                    ))}

                  {/* Selected location marker */}
                  {selectedLocation && (
                    <Marker
                      position={[selectedLocation.lat, selectedLocation.lng]}
                      icon={L.divIcon({
                        className: 'selected-marker',
                        html: `<div style="
                          width: 20px;
                          height: 20px;
                          background: #ffffff;
                          border: 3px solid #f97316;
                          border-radius: 50%;
                          box-shadow: 0 2px 8px rgba(0,0,0,0.4);
                        "></div>`,
                        iconSize: [20, 20],
                        iconAnchor: [10, 10],
                      })}
                    />
                  )}

                  {/* Map Controller */}
                  <MapController center={currentStateCoords.center} zoom={currentStateCoords.zoom} />

                  {/* Custom Controls */}
                  <CustomControls onLocate={handleResetView} />

                  {/* Map Click Handler */}
                  <MapClickHandler onMapClick={handleMapClick} />
                </MapContainer>

                {/* Selected Location Panel */}
                <LocationPanel
                  location={selectedLocation}
                  onClose={() => setSelectedLocation(null)}
                />

                {/* Risk Legend */}
                <div className="hazard-legend">
                  <div className="legend-header">
                    <AlertTriangle size={16} style={{ color: '#f97316' }} />
                    <span>Risk Level</span>
                  </div>
                  <div className="hazard-legend-items">
                    {riskLevels.map((level, idx) => (
                      <div key={idx} className="legend-row">
                        <span className="legend-dot" style={{ background: level.color }} />
                        <span className="legend-text">{level.level}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Map Style Selector */}
                <div className="map-style-selector">
                  {mapStyles.map(style => (
                    <button
                      key={style.id}
                      className={`style-btn ${mapStyle === style.id ? 'active' : ''}`}
                      onClick={() => setMapStyle(style.id)}
                      title={style.label}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Map Controls Bar */}
              <div className="map-controls-bar">
                <button
                  className={`map-toggle-btn ${showHazardZones ? 'active' : ''}`}
                  onClick={() => setShowHazardZones(!showHazardZones)}
                >
                  <Eye size={16} />
                  {showHazardZones ? 'Hide' : 'Show'} Hazard Zones
                </button>
                <button
                  className="map-toggle-btn"
                  onClick={() => {
                    const mapElement = document.querySelector('.hazard-map-card');
                    if (mapElement) {
                      if (document.fullscreenElement) {
                        document.exitFullscreen();
                      } else {
                        mapElement.requestFullscreen();
                      }
                    }
                  }}
                >
                  <Eye size={16} />
                  Full Screen
                </button>
              </div>
            </div>
          </>
        )}

        {/* Last Update */}
        <div className="last-update-bar">
          <Clock size={14} />
          <span>Last Updated: {data?.lastUpdated} | Source: Climate Vulnerability Assessment</span>
          <button className="refresh-btn-small" onClick={() => {
            setLoading(true);
            setTimeout(() => {
              setData(generateHazardData(selectedState));
              setHazardZones(getStateHazardZones(selectedState));
              setLoading(false);
            }, 500);
          }}>
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>
      </div>

      <style>{`
        .hazard-map-wrapper {
          position: relative;
          border-radius: 12px;
          overflow: hidden;
        }
        
        .hazard-leaflet {
          border-radius: 12px;
        }
        
        .map-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        
        .map-header h3 {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--foreground);
        }
        
        .map-timestamp {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.85rem;
          color: var(--muted-foreground);
        }
        
        /* Hazard Layer Filter */
        .hazard-layer-filter {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
          padding: 12px 16px;
          background: var(--card);
          border-radius: 10px;
          border: 1px solid var(--border);
          flex-wrap: wrap;
        }
        
        .filter-label {
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--muted-foreground);
        }
        
        .filter-buttons {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        
        .filter-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          font-size: 0.8rem;
          font-weight: 500;
          background: var(--background);
          border: 2px solid var(--border);
          border-radius: 20px;
          color: var(--muted-foreground);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .filter-btn:hover {
          background: var(--accent);
          color: var(--foreground);
        }
        
        .filter-btn.active {
          background: rgba(59, 130, 246, 0.15);
          color: var(--foreground);
          border-color: #3b82f6;
        }
        
        /* Zoom Controls - Bottom Right */
        .hazard-map-wrapper .leaflet-custom-controls,
        .hazard-controls {
          position: absolute;
          bottom: 60px;
          right: 20px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          z-index: 1000 !important;
        }
        
        .hazard-map-wrapper .leaflet-control-btn,
        .hazard-ctrl-btn {
          width: 44px !important;
          height: 44px !important;
          min-width: 44px;
          min-height: 44px;
          background: rgba(15, 23, 42, 0.95) !important;
          backdrop-filter: blur(10px);
          border: 2px solid rgba(255, 255, 255, 0.3) !important;
          border-radius: 12px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          cursor: pointer;
          color: white !important;
          transition: all 0.2s ease;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
          padding: 0 !important;
        }
        
        .hazard-map-wrapper .leaflet-control-btn:hover,
        .hazard-ctrl-btn:hover {
          background: linear-gradient(135deg, #f97316 0%, #ef4444 100%) !important;
          border-color: rgba(255, 255, 255, 0.5) !important;
          transform: scale(1.08);
          box-shadow: 0 6px 20px rgba(249, 115, 22, 0.5);
        }
        
        .hazard-map-wrapper .leaflet-control-btn svg,
        .hazard-ctrl-btn svg {
          width: 22px !important;
          height: 22px !important;
          color: white !important;
          stroke: white !important;
          stroke-width: 2.5 !important;
        }
        
        /* Location Panel */
        .hazard-map-wrapper .location-panel {
          position: absolute;
          bottom: 100px;
          left: 20px;
          background: rgba(15, 23, 42, 0.98) !important;
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          padding: 12px 16px;
          z-index: 999;
          min-width: 200px;
          max-width: 260px;
          transform: translateX(-120%);
          transition: transform 0.3s ease;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        }
        
        .hazard-map-wrapper .location-panel.open {
          transform: translateX(0);
        }
        
        .location-panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        
        .location-panel-header h4 {
          font-size: 0.95rem;
          font-weight: 600;
          color: white;
        }
        
        .panel-close-btn {
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.6);
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
          transition: all 0.2s;
        }
        
        .panel-close-btn:hover {
          color: white;
          background: rgba(255, 255, 255, 0.1);
        }
        
        .location-panel-content p {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 8px;
        }
        
        .panel-note {
          font-size: 0.75rem !important;
          color: rgba(255, 255, 255, 0.5) !important;
          margin-top: 12px !important;
        }
        
        /* Hazard Legend */
        .hazard-legend {
          position: absolute;
          top: 20px;
          right: 20px;
          background: rgba(15, 23, 42, 0.95) !important;
          backdrop-filter: blur(15px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 10px;
          padding: 8px 12px;
          z-index: 1000;
          width: fit-content;
          height: fit-content;
        }
        
        .hazard-legend .legend-header {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 8px;
          padding-bottom: 6px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .hazard-legend .legend-header span {
          font-size: 0.75rem;
          font-weight: 600;
          color: white;
        }
        
        .hazard-legend-items {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        
        .legend-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .legend-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        
        .legend-text {
          font-size: 0.7rem;
          color: rgba(255, 255, 255, 0.85);
        }
        
        /* Map Style Selector */
        .hazard-map-wrapper .map-style-selector {
          position: absolute;
          bottom: 20px;
          right: 20px;
          display: flex;
          gap: 6px;
          z-index: 1000;
        }
        
        .hazard-map-wrapper .style-btn {
          padding: 8px 14px;
          font-size: 0.75rem;
          font-weight: 500;
          background: rgba(15, 23, 42, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          color: rgba(255, 255, 255, 0.7);
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .hazard-map-wrapper .style-btn:hover {
          background: rgba(15, 23, 42, 1);
          color: white;
        }
        
        .hazard-map-wrapper .style-btn.active {
          background: linear-gradient(135deg, #f97316 0%, #ef4444 100%);
          color: white;
          border-color: transparent;
        }
        
        /* Map Controls Bar */
        .map-controls-bar {
          display: flex;
          gap: 12px;
          margin-top: 16px;
          flex-wrap: wrap;
        }
        
        .map-toggle-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          font-size: 0.85rem;
          font-weight: 500;
          background: var(--background);
          border: 1px solid var(--border);
          border-radius: 10px;
          color: var(--muted-foreground);
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .map-toggle-btn:hover {
          background: var(--accent);
          color: var(--foreground);
        }
        
        .map-toggle-btn.active {
          background: rgba(249, 115, 22, 0.15);
          color: #f97316;
          border-color: #f97316;
        }
        
        /* Popup Styles */
        .hazard-popup {
          padding: 8px 4px;
        }
        
        .hazard-popup h4 {
          font-size: 1rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 8px;
        }
        
        .hazard-popup .popup-risk {
          font-size: 1.1rem;
          margin-bottom: 10px;
          padding-bottom: 8px;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .hazard-popup .popup-hazard,
        .hazard-popup .popup-population {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.85rem;
          color: #475569;
          margin-bottom: 4px;
        }
        
        .hazard-popup .popup-coords {
          font-size: 0.75rem;
          color: #94a3b8;
          margin-top: 8px;
        }
        
        /* Responsive styles */
        @media (max-width: 768px) {
          .hazard-layer-filter {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .filter-buttons {
            width: 100%;
          }
          
          .filter-btn {
            flex: 1;
            min-width: 80px;
            justify-content: center;
          }
          
          .hazard-legend {
            top: 10px;
            right: 10px;
            padding: 6px 10px;
            width: fit-content;
            height: fit-content;
          }
          
          .hazard-map-wrapper .map-style-selector {
            bottom: 10px;
            right: 10px;
          }
          
          .hazard-map-wrapper .style-btn {
            padding: 6px 10px;
            font-size: 0.7rem;
          }
        }
      `}</style>
    </div>
  );
}
