import { Gauge, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function PressureCard({ pressure }) {
  const [prevPressure, setPrevPressure] = useState(pressure);
  const [trend, setTrend] = useState('stable');

  useEffect(() => {
    if (pressure && prevPressure) {
      if (pressure > prevPressure + 1) setTrend('rising');
      else if (pressure < prevPressure - 1) setTrend('falling');
      else setTrend('stable');
    }
    setPrevPressure(pressure);
  }, [pressure]);

  if (!pressure) return null;

  const getPressureStatus = (value) => {
    if (value < 1000) return { label: 'Low', cls: 'low', desc: 'Stormy weather likely' };
    if (value > 1020) return { label: 'High', cls: 'high', desc: 'Fair weather expected' };
    return { label: 'Normal', cls: 'normal', desc: 'Stable conditions' };
  };

  const status = getPressureStatus(pressure);
  const gaugeRotation = ((pressure - 980) / 60) * 180 - 90;

  const TrendIcon = trend === 'rising' ? TrendingUp : trend === 'falling' ? TrendingDown : Minus;

  return (
    <div className="card pressure-card">
      <div className="pressure-header">
        <div className="pressure-info">
          <div className="pressure-icon-box">
            <Gauge />
          </div>
          <div>
            <p className="pressure-label">Atmospheric Pressure</p>
            <p className={`pressure-status ${status.cls}`}>{status.label}</p>
          </div>
        </div>
        <div className={`pressure-trend ${trend}`}>
          <TrendIcon />
          <span>{trend}</span>
        </div>
      </div>

      <div className="pressure-gauge">
        <div className="gauge-bg">
          <div className="gauge-arc" />
        </div>
        <div className="gauge-needle" style={{ transform: `translateX(-50%) rotate(${gaugeRotation}deg)` }}>
          <div className="gauge-needle-dot" />
        </div>
        <div className="gauge-center" />
      </div>

      <div className="pressure-value-container">
        <span className="pressure-value">{pressure}</span>
        <span className="pressure-unit">hPa</span>
      </div>

      <div className="pressure-scale">
        <span>980</span>
        <span>1010</span>
        <span>1040</span>
      </div>

      <div className="pressure-desc">{status.desc}</div>
    </div>
  );
}
