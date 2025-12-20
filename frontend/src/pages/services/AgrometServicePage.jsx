import { useState, useEffect } from 'react';
import { 
  Tractor, 
  ArrowLeft,
  MapPin,
  Droplets,
  Sun,
  Wind,
  Calendar,
  Leaf,
  ThermometerSun,
  AlertTriangle,
  RefreshCw,
  Clock,
  CloudRain,
  Sprout
} from 'lucide-react';
import { Link } from 'react-router-dom';

const cropTypes = [
  { id: 'kharif', name: 'Kharif Crops', crops: ['Rice', 'Maize', 'Cotton', 'Soybean', 'Groundnut'] },
  { id: 'rabi', name: 'Rabi Crops', crops: ['Wheat', 'Mustard', 'Chickpea', 'Barley', 'Peas'] },
  { id: 'zaid', name: 'Zaid Crops', crops: ['Watermelon', 'Muskmelon', 'Cucumber', 'Vegetables'] },
];

const states = [
  'Punjab', 'Haryana', 'Uttar Pradesh', 'Madhya Pradesh', 'Maharashtra', 
  'Karnataka', 'Andhra Pradesh', 'Tamil Nadu', 'Gujarat', 'Rajasthan'
];

const generateAgrometData = (selectedState) => {
  const activities = [
    'Sowing', 'Irrigation', 'Fertilizer Application', 'Pest Management', 
    'Harvesting', 'Field Preparation', 'Weeding', 'Spraying'
  ];
  
  return {
    state: selectedState,
    issueDate: new Date().toLocaleDateString(),
    validUntil: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    weatherOutlook: {
      rainfall: Math.floor(Math.random() * 50),
      maxTemp: Math.floor(Math.random() * 10 + 30),
      minTemp: Math.floor(Math.random() * 10 + 18),
      humidity: Math.floor(Math.random() * 30 + 50),
      windSpeed: Math.floor(Math.random() * 15 + 5),
      condition: ['Partly Cloudy', 'Clear', 'Light Rain', 'Scattered Showers'][Math.floor(Math.random() * 4)]
    },
    cropAdvisories: cropTypes[0].crops.map(crop => ({
      crop,
      stage: ['Vegetative', 'Flowering', 'Maturity', 'Harvesting'][Math.floor(Math.random() * 4)],
      advisory: [
        'Ensure adequate irrigation during this critical growth phase.',
        'Monitor for pest infestation and apply recommended pesticides.',
        'Apply recommended dose of fertilizers for better yield.',
        'Prepare for harvesting when moisture content is optimal.',
        'Take preventive measures against fungal diseases.',
      ][Math.floor(Math.random() * 5)],
      activities: activities.slice(0, Math.floor(Math.random() * 3 + 2)),
      riskLevel: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)]
    })),
    warnings: [
      { type: 'Heat Wave', severity: 'Moderate', message: 'Provide shade and increase irrigation frequency' },
      { type: 'Heavy Rainfall', severity: 'Low', message: 'Ensure proper drainage in fields' },
    ].slice(0, Math.floor(Math.random() * 3)),
    soilMoisture: {
      current: Math.floor(Math.random() * 40 + 30),
      optimal: '50-70%',
      status: ['Adequate', 'Deficit', 'Excess'][Math.floor(Math.random() * 3)]
    },
    irrigationAdvice: {
      required: Math.random() > 0.5,
      timing: 'Morning (6-8 AM) or Evening (5-7 PM)',
      method: 'Drip irrigation recommended for water conservation',
      amount: `${Math.floor(Math.random() * 30 + 20)} mm`
    }
  };
};

export default function AgrometServicePage() {
  const [selectedState, setSelectedState] = useState('Punjab');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCropType, setSelectedCropType] = useState('kharif');

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setData(generateAgrometData(selectedState));
      setLoading(false);
    }, 600);
  }, [selectedState]);

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
          <Tractor className="page-header-icon" style={{ color: '#22c55e' }} />
          <div>
            <h1 className="page-title">Agromet Advisory Service</h1>
            <p className="page-subtitle">Weather-based agricultural guidance for farmers</p>
          </div>
        </header>

        {/* State Selector */}
        <div className="state-selector">
          <label>Select State/Region:</label>
          <div className="state-buttons">
            {states.map(state => (
              <button
                key={state}
                className={`state-btn ${selectedState === state ? 'active' : ''}`}
                onClick={() => setSelectedState(state)}
              >
                {state}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <RefreshCw size={32} className="spinning" />
            <p>Loading advisory for {selectedState}...</p>
          </div>
        ) : (
          <>
            {/* Advisory Header */}
            <div className="card advisory-header">
              <div className="advisory-meta">
                <div className="meta-item">
                  <Calendar size={16} />
                  <span>Issued: {data.issueDate}</span>
                </div>
                <div className="meta-item">
                  <Clock size={16} />
                  <span>Valid until: {data.validUntil}</span>
                </div>
                <div className="meta-item">
                  <MapPin size={16} />
                  <span>{data.state}</span>
                </div>
              </div>
            </div>

            {/* Weather Outlook */}
            <div className="card">
              <h3 className="card-section-title">
                <Sun size={20} style={{ color: '#f97316' }} />
                5-Day Weather Outlook
              </h3>
              <div className="weather-outlook-grid">
                <div className="outlook-item">
                  <ThermometerSun size={28} style={{ color: '#ef4444' }} />
                  <span className="outlook-value">{data.weatherOutlook.maxTemp}°C</span>
                  <span className="outlook-label">Max Temp</span>
                </div>
                <div className="outlook-item">
                  <ThermometerSun size={28} style={{ color: '#3b82f6' }} />
                  <span className="outlook-value">{data.weatherOutlook.minTemp}°C</span>
                  <span className="outlook-label">Min Temp</span>
                </div>
                <div className="outlook-item">
                  <CloudRain size={28} style={{ color: '#22c55e' }} />
                  <span className="outlook-value">{data.weatherOutlook.rainfall} mm</span>
                  <span className="outlook-label">Expected Rain</span>
                </div>
                <div className="outlook-item">
                  <Droplets size={28} style={{ color: '#06b6d4' }} />
                  <span className="outlook-value">{data.weatherOutlook.humidity}%</span>
                  <span className="outlook-label">Humidity</span>
                </div>
                <div className="outlook-item">
                  <Wind size={28} style={{ color: '#8b5cf6' }} />
                  <span className="outlook-value">{data.weatherOutlook.windSpeed} km/h</span>
                  <span className="outlook-label">Wind Speed</span>
                </div>
              </div>
            </div>

            {/* Crop Type Selector */}
            <div className="crop-type-selector">
              {cropTypes.map(type => (
                <button
                  key={type.id}
                  className={`crop-type-btn ${selectedCropType === type.id ? 'active' : ''}`}
                  onClick={() => setSelectedCropType(type.id)}
                >
                  <Sprout size={16} />
                  {type.name}
                </button>
              ))}
            </div>

            {/* Crop Advisories */}
            <div className="card">
              <h3 className="card-section-title">
                <Leaf size={20} style={{ color: '#22c55e' }} />
                Crop-wise Advisories
              </h3>
              <div className="crop-advisories-grid">
                {data.cropAdvisories.map((crop, idx) => (
                  <div key={idx} className="crop-advisory-card">
                    <div className="crop-header">
                      <h4>{crop.crop}</h4>
                      <span className={`crop-stage ${crop.stage.toLowerCase()}`}>{crop.stage}</span>
                    </div>
                    <p className="crop-advisory-text">{crop.advisory}</p>
                    <div className="crop-activities">
                      <span className="activities-label">Recommended Activities:</span>
                      <div className="activities-tags">
                        {crop.activities.map((activity, i) => (
                          <span key={i} className="activity-tag">{activity}</span>
                        ))}
                      </div>
                    </div>
                    <div className={`crop-risk risk-${crop.riskLevel.toLowerCase()}`}>
                      <AlertTriangle size={14} />
                      Risk Level: {crop.riskLevel}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Soil & Irrigation */}
            <div className="grid-2">
              <div className="card">
                <h3 className="card-section-title">
                  <Leaf size={20} style={{ color: '#92400e' }} />
                  Soil Moisture Status
                </h3>
                <div className="soil-status">
                  <div className="soil-gauge">
                    <div className="gauge-fill" style={{ 
                      width: `${data.soilMoisture.current}%`,
                      background: data.soilMoisture.status === 'Adequate' ? '#22c55e' : 
                                  data.soilMoisture.status === 'Deficit' ? '#ef4444' : '#3b82f6'
                    }} />
                  </div>
                  <div className="soil-info">
                    <span className="soil-value">{data.soilMoisture.current}%</span>
                    <span className={`soil-status-badge ${data.soilMoisture.status.toLowerCase()}`}>
                      {data.soilMoisture.status}
                    </span>
                  </div>
                  <p className="soil-optimal">Optimal Range: {data.soilMoisture.optimal}</p>
                </div>
              </div>

              <div className="card">
                <h3 className="card-section-title">
                  <Droplets size={20} style={{ color: '#3b82f6' }} />
                  Irrigation Advisory
                </h3>
                <div className="irrigation-advice">
                  <div className={`irrigation-required ${data.irrigationAdvice.required ? 'yes' : 'no'}`}>
                    {data.irrigationAdvice.required ? 'Irrigation Required' : 'No Irrigation Needed'}
                  </div>
                  {data.irrigationAdvice.required && (
                    <div className="irrigation-details">
                      <p><strong>Best Time:</strong> {data.irrigationAdvice.timing}</p>
                      <p><strong>Method:</strong> {data.irrigationAdvice.method}</p>
                      <p><strong>Amount:</strong> {data.irrigationAdvice.amount}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Weather Warnings */}
            {data.warnings.length > 0 && (
              <div className="card">
                <h3 className="card-section-title">
                  <AlertTriangle size={20} style={{ color: '#f97316' }} />
                  Weather Warnings for Agriculture
                </h3>
                <div className="agro-warnings">
                  {data.warnings.map((warning, idx) => (
                    <div key={idx} className={`agro-warning warning-${warning.severity.toLowerCase()}`}>
                      <div className="warning-type-badge">{warning.type}</div>
                      <p>{warning.message}</p>
                      <span className="warning-severity">Severity: {warning.severity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Last Update */}
        <div className="last-update-bar">
          <Clock size={14} />
          <span>Advisory issued by: Agromet Advisory Services | IMD</span>
          <button className="refresh-btn-small" onClick={() => {
            setLoading(true);
            setTimeout(() => {
              setData(generateAgrometData(selectedState));
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
