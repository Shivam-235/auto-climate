import { Wind, AlertTriangle, Skull, CloudFog, HeartPulse } from 'lucide-react';
import './AQISeverity.css';

export default function AQICard({ aqi }) {
  if (!aqi) return null;

  // Determine severity level
  const isHazardous = aqi.value >= 201 && aqi.value <= 300;
  const isExtreme = aqi.value > 300;
  const isSevere = isHazardous || isExtreme;

  // Calculate equivalent cigarettes (roughly 1 cigarette = 22 µg/m³ PM2.5)
  const cigaretteEquivalent = aqi.pm25 ? Math.round(aqi.pm25 / 22) : 0;

  return (
    <div className={`card aqi-card ${isHazardous ? 'hazardous' : ''} ${isExtreme ? 'extreme' : ''}`}>
      <div className="card-glow" style={{ background: aqi.color }} />

      {/* Smoke Effect for Severe AQI */}
      {isSevere && (
        <div className="smoke-container">
          <div className="smoke-particle smoke-1"></div>
          <div className="smoke-particle smoke-2"></div>
          <div className="smoke-particle smoke-3"></div>
          <div className="smoke-particle smoke-4"></div>
          <div className="smoke-particle smoke-5"></div>
          <div className="smoke-particle smoke-6"></div>
        </div>
      )}

      <div className="aqi-header">
        <div className="aqi-icon-box">
          <Wind />
        </div>
        <div>
          <p className="aqi-label">Air Quality Index</p>
          <p className="aqi-level">{aqi.level}</p>
        </div>
      </div>

      {/* Severity Corner Badge with Cigarette */}
      {isSevere && (
        <div className="severity-corner-container">
          <div className="severity-icon-badge">
            <div className="severity-icon-bg">
              {isExtreme ? <Skull size={20} /> : <CloudFog size={20} />}
            </div>
            <div className="severity-health-icon">
              <HeartPulse size={12} />
            </div>
          </div>
          <div className="cigarette-corner">
            <img src="/cigarette.svg" alt="cigarette" className="cigarette-icon-small" />
            <div className="cigarette-smoke-effect">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span className="cigarette-text">≈{cigaretteEquivalent}/day</span>
          </div>
        </div>
      )}

      <div className="aqi-value-container">
        <span className="aqi-value" style={{ textShadow: `0 0 30px ${aqi.color}` }}>{aqi.value}</span>
        <span className="aqi-unit">AQI</span>
      </div>

      <div className="aqi-scale">
        <div className="aqi-indicator" style={{ left: `${Math.min((aqi.value / 300) * 100, 100)}%` }} />
      </div>

      <div className="pollutants-grid">
        <div className="pollutant-item">
          <p className="pollutant-label">PM2.5</p>
          <p className="pollutant-value">{aqi.pm25}</p>
          <p className="pollutant-unit">µg/m³</p>
        </div>
        <div className="pollutant-item">
          <p className="pollutant-label">PM10</p>
          <p className="pollutant-value">{aqi.pm10}</p>
          <p className="pollutant-unit">µg/m³</p>
        </div>
        <div className="pollutant-item">
          <p className="pollutant-label">O₃</p>
          <p className="pollutant-value">{aqi.o3}</p>
          <p className="pollutant-unit">ppb</p>
        </div>
        <div className="pollutant-item">
          <p className="pollutant-label">NO₂</p>
          <p className="pollutant-value">{aqi.no2}</p>
          <p className="pollutant-unit">ppb</p>
        </div>
        <div className="pollutant-item">
          <p className="pollutant-label">SO₂</p>
          <p className="pollutant-value">{aqi.so2}</p>
          <p className="pollutant-unit">ppb</p>
        </div>
        <div className="pollutant-item">
          <p className="pollutant-label">CO</p>
          <p className="pollutant-value">{aqi.co}</p>
          <p className="pollutant-unit">ppm</p>
        </div>
      </div>
    </div>
  );
}
