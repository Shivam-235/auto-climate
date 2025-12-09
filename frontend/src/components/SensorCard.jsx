import { Thermometer, Droplets, Wind, Gauge } from 'lucide-react';

const iconMap = {
  temperature: Thermometer,
  humidity: Droplets,
  co2: Wind,
  pm25: Gauge,
};

const unitMap = {
  temperature: '°C',
  humidity: '%',
  co2: 'ppm',
  pm25: 'µg/m³',
};

const labelMap = {
  temperature: 'Temperature',
  humidity: 'Humidity',
  co2: 'CO₂ Level',
  pm25: 'PM2.5',
};

function getStatus(type, value) {
  const thresholds = {
    temperature: { low: 18, high: 26 },
    humidity: { low: 30, high: 60 },
    co2: { low: 0, high: 800 },
    pm25: { low: 0, high: 25 },
  };

  const { low, high } = thresholds[type];
  if (value >= low && value <= high) return 'optimal';
  return 'warning';
}

export default function SensorCard({ type, value }) {
  const Icon = iconMap[type];
  const unit = unitMap[type];
  const label = labelMap[type];
  const status = getStatus(type, value);

  return (
    <div className={`card sensor-card ${type}`}>
      <div className={`card-glow ${type}`} />
      
      <div className="sensor-header">
        <div className={`sensor-icon ${type}`}>
          <Icon />
        </div>
        <span className={`sensor-status ${status}`}>
          {status === 'optimal' ? '● Optimal' : '● Warning'}
        </span>
      </div>
      
      <p className="sensor-label">{label}</p>
      
      <div className="sensor-value">
        <span className="value">{value ?? '--'}</span>
        <span className="unit">{unit}</span>
      </div>
    </div>
  );
}