import { Wind } from 'lucide-react';

export default function AQICard({ aqi }) {
  if (!aqi) return null;

  return (
    <div className="card aqi-card">
      <div className="card-glow" style={{ background: aqi.color }} />
      
      <div className="aqi-header">
        <div className="aqi-icon-box">
          <Wind />
        </div>
        <div>
          <p className="aqi-label">Air Quality Index</p>
          <p className="aqi-level">{aqi.level}</p>
        </div>
      </div>

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
