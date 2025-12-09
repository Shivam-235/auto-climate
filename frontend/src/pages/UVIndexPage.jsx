import { useState, useEffect } from 'react';
import { Sun, Shield, AlertTriangle, Clock, TrendingUp } from 'lucide-react';

const uvLevels = [
  { range: [0, 2], level: 'Low', color: '#22c55e', advice: 'Safe for most people. Wear sunglasses on bright days.' },
  { range: [3, 5], level: 'Moderate', color: '#eab308', advice: 'Seek shade during midday. Wear sunscreen SPF 30+.' },
  { range: [6, 7], level: 'High', color: '#f97316', advice: 'Reduce sun exposure. Wear protective clothing.' },
  { range: [8, 10], level: 'Very High', color: '#ef4444', advice: 'Minimize sun exposure. Seek shade. SPF 50+ required.' },
  { range: [11, 15], level: 'Extreme', color: '#7c3aed', advice: 'Avoid sun exposure. Stay indoors during peak hours.' },
];

const skinTypes = [
  { type: 'Type I', description: 'Very fair skin, always burns', burnTime: 10 },
  { type: 'Type II', description: 'Fair skin, burns easily', burnTime: 20 },
  { type: 'Type III', description: 'Medium skin, sometimes burns', burnTime: 30 },
  { type: 'Type IV', description: 'Olive skin, rarely burns', burnTime: 45 },
  { type: 'Type V', description: 'Brown skin, very rarely burns', burnTime: 60 },
  { type: 'Type VI', description: 'Dark brown skin, never burns', burnTime: 90 },
];

function getUVLevel(uv) {
  return uvLevels.find(l => uv >= l.range[0] && uv <= l.range[1]) || uvLevels[0];
}

function generateHourlyUV() {
  const hours = [];
  const now = new Date();
  for (let i = 0; i < 24; i++) {
    const hour = new Date(now);
    hour.setHours(now.getHours() + i);
    const hourNum = hour.getHours();
    
    // Simulate UV based on time of day
    let uv = 0;
    if (hourNum >= 6 && hourNum <= 19) {
      const peak = 12;
      const distance = Math.abs(hourNum - peak);
      uv = Math.max(0, 11 - distance * 1.5 + (Math.random() - 0.5) * 2);
    }
    
    hours.push({
      time: hour.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
      hour: hourNum,
      uv: Math.round(uv * 10) / 10,
    });
  }
  return hours;
}

export default function UVIndexPage({ weatherData }) {
  const [hourlyUV, setHourlyUV] = useState([]);
  const [selectedSkin, setSelectedSkin] = useState(2);
  
  useEffect(() => {
    setHourlyUV(generateHourlyUV());
  }, []);
  
  const currentUV = weatherData?.current?.uvIndex || 6;
  const uvLevel = getUVLevel(currentUV);
  const burnTime = Math.round(skinTypes[selectedSkin].burnTime / (currentUV || 1));
  
  return (
    <div className="page-content">
      <header className="page-header">
        <Sun className="page-header-icon" style={{ color: uvLevel.color }} />
        <div>
          <h1 className="page-title">UV Index</h1>
          <p className="page-subtitle">Sun safety and UV forecast</p>
        </div>
      </header>
      
      <div className="grid-3">
        {/* Current UV Card */}
        <div className="card uv-main-card">
          <div className="uv-gauge" style={{ '--uv-color': uvLevel.color }}>
            <div className="uv-gauge-ring">
              <svg viewBox="0 0 120 120" className="uv-gauge-svg">
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="8"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke={uvLevel.color}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${(currentUV / 11) * 339} 339`}
                  transform="rotate(-90 60 60)"
                  className="uv-gauge-progress"
                />
              </svg>
              <div className="uv-gauge-center">
                <span className="uv-gauge-value">{currentUV}</span>
                <span className="uv-gauge-label">UV Index</span>
              </div>
            </div>
          </div>
          <div className="uv-level-badge" style={{ backgroundColor: uvLevel.color }}>
            {uvLevel.level}
          </div>
          <p className="uv-advice">{uvLevel.advice}</p>
        </div>
        
        {/* Sun Safety Card */}
        <div className="card">
          <div className="card-header">
            <Shield className="card-icon" />
            <h3>Sun Safety Tips</h3>
          </div>
          <div className="safety-tips">
            <div className={`safety-tip ${currentUV >= 3 ? 'active' : ''}`}>
              <span className="tip-icon">🧴</span>
              <span>Apply SPF {currentUV >= 8 ? '50+' : currentUV >= 6 ? '30+' : '15+'}</span>
            </div>
            <div className={`safety-tip ${currentUV >= 3 ? 'active' : ''}`}>
              <span className="tip-icon">🕶️</span>
              <span>Wear UV-blocking sunglasses</span>
            </div>
            <div className={`safety-tip ${currentUV >= 6 ? 'active' : ''}`}>
              <span className="tip-icon">👒</span>
              <span>Wear a wide-brimmed hat</span>
            </div>
            <div className={`safety-tip ${currentUV >= 6 ? 'active' : ''}`}>
              <span className="tip-icon">👕</span>
              <span>Cover arms and legs</span>
            </div>
            <div className={`safety-tip ${currentUV >= 8 ? 'active' : ''}`}>
              <span className="tip-icon">🏠</span>
              <span>Seek shade 10am-4pm</span>
            </div>
          </div>
        </div>
        
        {/* Burn Time Calculator */}
        <div className="card">
          <div className="card-header">
            <AlertTriangle className="card-icon" />
            <h3>Burn Time Calculator</h3>
          </div>
          <div className="burn-calculator">
            <label className="burn-label">Select your skin type:</label>
            <select 
              className="skin-select"
              value={selectedSkin}
              onChange={(e) => setSelectedSkin(Number(e.target.value))}
            >
              {skinTypes.map((skin, i) => (
                <option key={i} value={i}>
                  {skin.type} - {skin.description}
                </option>
              ))}
            </select>
            <div className="burn-result">
              <span className="burn-time">{burnTime}</span>
              <span className="burn-unit">minutes</span>
              <span className="burn-desc">until skin damage without protection</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Hourly UV Forecast */}
      <div className="card mt-6">
        <div className="card-header">
          <Clock className="card-icon" />
          <h3>24-Hour UV Forecast</h3>
        </div>
        <div className="hourly-uv-chart">
          {hourlyUV.map((item, i) => {
            const level = getUVLevel(item.uv);
            const height = Math.max(5, (item.uv / 11) * 100);
            return (
              <div key={i} className="uv-bar-container">
                <div 
                  className="uv-bar"
                  style={{ 
                    height: `${height}%`,
                    backgroundColor: level.color,
                  }}
                >
                  {item.uv > 0 && <span className="uv-bar-value">{item.uv.toFixed(0)}</span>}
                </div>
                <span className="uv-bar-time">{item.time}</span>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* UV Scale Legend */}
      <div className="card mt-6">
        <div className="card-header">
          <TrendingUp className="card-icon" />
          <h3>UV Index Scale</h3>
        </div>
        <div className="uv-scale">
          {uvLevels.map((level, i) => (
            <div key={i} className="uv-scale-item">
              <div 
                className="uv-scale-color"
                style={{ backgroundColor: level.color }}
              >
                {level.range[0]}-{level.range[1]}
              </div>
              <div className="uv-scale-info">
                <span className="uv-scale-level">{level.level}</span>
                <span className="uv-scale-advice">{level.advice}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
