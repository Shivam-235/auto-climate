import { CloudRain, Droplets } from 'lucide-react';

export default function ForecastCard({ forecast }) {
  if (!forecast || forecast.length === 0) return null;

  return (
    <div className="card forecast-card">
      <div className="forecast-header">
        <div className="forecast-icon-box">
          <CloudRain />
        </div>
        <div>
          <p className="forecast-title">5-Day Forecast</p>
          <p className="forecast-subtitle">Weather outlook</p>
        </div>
      </div>

      <div className="forecast-grid">
        {forecast.map((day, index) => (
          <div key={index} className="forecast-day">
            <p className="forecast-day-name">{day.day}</p>
            <p className="forecast-day-date">{day.date}</p>
            <div className="forecast-icon">{day.icon}</div>
            <div className="forecast-temps">
              <span className="forecast-high">{day.highTemp}°</span>
              <span className="forecast-low">{day.lowTemp}°</span>
            </div>
            <div className="forecast-precip">
              <Droplets />
              <span>{day.precipitation}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
