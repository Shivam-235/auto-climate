import { useState, useEffect } from 'react';
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
  Map
} from 'lucide-react';
import { Link } from 'react-router-dom';

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

export default function HazardAtlasPage() {
  const [selectedState, setSelectedState] = useState('Maharashtra');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedHazard, setExpandedHazard] = useState(null);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setData(generateHazardData(selectedState));
      setLoading(false);
    }, 700);
  }, [selectedState]);

  const overallLevel = data ? riskLevels.find(r => {
    const [min, max] = r.score.split('-').map(Number);
    return data.overallVulnerability >= min && data.overallVulnerability <= (max || 100);
  }) : null;

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
        <div className="state-selector hazard-selector">
          <label>Select State:</label>
          <select 
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="state-dropdown"
          >
            {states.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
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

            {/* Map Placeholder */}
            <div className="card">
              <h3 className="card-section-title">
                <Map size={20} style={{ color: '#3b82f6' }} />
                Hazard Map Visualization
              </h3>
              <div className="map-placeholder hazard-map">
                <Map size={64} style={{ color: 'rgba(255,255,255,0.3)' }} />
                <h4>Interactive Hazard Map</h4>
                <p>District-level vulnerability visualization</p>
                <span className="map-note">Click on districts to view detailed risk assessment</span>
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
