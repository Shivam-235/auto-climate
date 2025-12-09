import { Navigation, Wind } from 'lucide-react';

export default function WindCompass({ wind }) {
  if (!wind) return null;

  const getWindStrength = (speed) => {
    if (speed < 5) return { label: 'Calm', cls: 'calm' };
    if (speed < 15) return { label: 'Light', cls: 'light' };
    if (speed < 25) return { label: 'Moderate', cls: 'moderate' };
    if (speed < 40) return { label: 'Strong', cls: 'strong' };
    return { label: 'Very Strong', cls: 'strong' };
  };

  const strength = getWindStrength(wind.speed);

  return (
    <div className="card wind-card">
      <div className="wind-header">
        <div className="wind-icon-box">
          <Wind />
        </div>
        <div>
          <p className="wind-label">Wind</p>
          <p className={`wind-strength ${strength.cls}`}>{strength.label}</p>
        </div>
      </div>

      <div className="wind-content">
        <div className="compass">
          <div className="compass-ring" />
          <div className="compass-inner" />
          <span className="compass-direction n">N</span>
          <span className="compass-direction e">E</span>
          <span className="compass-direction s">S</span>
          <span className="compass-direction w">W</span>
          <div className="compass-arrow" style={{ transform: `rotate(${wind.direction}deg)` }}>
            <Navigation />
          </div>
        </div>

        <div className="wind-stats">
          <div className="wind-stat">
            <p className="wind-stat-label">Speed</p>
            <p className="wind-stat-value">{wind.speed} <span>km/h</span></p>
          </div>
          <div className="wind-stat">
            <p className="wind-stat-label">Direction</p>
            <p className="wind-stat-value">{wind.directionText} <span>{wind.direction}°</span></p>
          </div>
          <div className="wind-stat">
            <p className="wind-stat-label">Gusts</p>
            <p className="wind-stat-value">{wind.gust} <span>km/h</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
