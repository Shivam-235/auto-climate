import { Sunrise, Sunset, Sun, Moon } from 'lucide-react';

export default function SunCard({ sun }) {
  if (!sun) return null;

  return (
    <div className="card sun-card">
      <div className="sun-bg-icon">
        {sun.isDaytime ? <Sun /> : <Moon />}
      </div>

      <p className="aqi-label" style={{ marginBottom: '1rem' }}>Sunrise & Sunset</p>

      <div className="sun-times">
        <div className="sun-time">
          <div className="sun-time-icon sunrise">
            <Sunrise />
          </div>
          <div>
            <p className="sun-time-label">Sunrise</p>
            <p className="sun-time-value">{sun.sunrise}</p>
          </div>
        </div>

        <div className="sun-time">
          <div>
            <p className="sun-time-label" style={{ textAlign: 'right' }}>Sunset</p>
            <p className="sun-time-value">{sun.sunset}</p>
          </div>
          <div className="sun-time-icon sunset">
            <Sunset />
          </div>
        </div>
      </div>

      <div className="sun-progress">
        <div className="sun-arc">
          <div className="sun-arc-bg" />
        </div>
        <div className="sun-progress-text">
          <span>6 AM</span>
          <span>{sun.dayProgress}% of day</span>
          <span>6 PM</span>
        </div>
      </div>

      <div className="sun-status">
        <p className="sun-status-label">Current Status</p>
        <p className="sun-status-value">
          {sun.isDaytime ? <Sun /> : <Moon />}
          <span>{sun.isDaytime ? 'Daytime' : 'Nighttime'}</span>
        </p>
      </div>
    </div>
  );
}
