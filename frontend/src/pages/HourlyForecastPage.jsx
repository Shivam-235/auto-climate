import { useState, useEffect } from 'react';
import { Clock, Droplets, Wind, Thermometer, Eye, CloudRain } from 'lucide-react';

const weatherConditions = [
  { id: 'sunny', icon: '☀️', label: 'Sunny' },
  { id: 'partly-cloudy', icon: '⛅', label: 'Partly Cloudy' },
  { id: 'cloudy', icon: '☁️', label: 'Cloudy' },
  { id: 'rainy', icon: '🌧️', label: 'Rainy' },
  { id: 'thunderstorm', icon: '⛈️', label: 'Thunderstorm' },
];

function generateHourlyForecast(currentTemp = 25, currentHumidity = 60) {
  const hours = [];
  const now = new Date();
  
  for (let i = 0; i < 48; i++) {
    const hour = new Date(now);
    hour.setHours(now.getHours() + i);
    const hourNum = hour.getHours();
    
    // Temperature variation based on time
    const baseTemp = currentTemp;
    const tempVariation = Math.sin((hourNum - 6) * Math.PI / 12) * 5;
    const temp = baseTemp + tempVariation + (Math.random() - 0.5) * 2;
    
    // Determine condition based on temp and randomness
    const rand = Math.random();
    let condition;
    if (hourNum >= 6 && hourNum <= 18 && rand > 0.3) {
      condition = rand > 0.7 ? weatherConditions[0] : weatherConditions[1];
    } else if (rand > 0.8) {
      condition = weatherConditions[3];
    } else {
      condition = weatherConditions[2];
    }
    
    hours.push({
      time: hour,
      timeStr: hour.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
      dateStr: hour.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      temp: Math.round(temp),
      feelsLike: Math.round(temp + (Math.random() - 0.5) * 3),
      humidity: Math.round(currentHumidity + (Math.random() - 0.5) * 20),
      windSpeed: Math.round(10 + Math.random() * 15),
      windDir: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.floor(Math.random() * 8)],
      precipitation: condition.id === 'rainy' || condition.id === 'thunderstorm' ? Math.round(Math.random() * 80 + 20) : Math.round(Math.random() * 20),
      visibility: Math.round(8 + Math.random() * 4),
      condition,
      isNow: i === 0,
    });
  }
  return hours;
}

export default function HourlyForecastPage({ weatherData }) {
  const [hourlyData, setHourlyData] = useState([]);
  const [selectedDay, setSelectedDay] = useState(0);
  
  useEffect(() => {
    const currentTemp = weatherData?.current?.temperature || 25;
    const currentHumidity = weatherData?.current?.humidity || 60;
    setHourlyData(generateHourlyForecast(currentTemp, currentHumidity));
  }, [weatherData]);
  
  // Group by day
  const days = [];
  let currentDay = null;
  hourlyData.forEach(hour => {
    const dayKey = hour.time.toDateString();
    if (dayKey !== currentDay) {
      currentDay = dayKey;
      days.push({
        date: hour.time,
        dateStr: hour.dateStr,
        hours: [],
      });
    }
    days[days.length - 1].hours.push(hour);
  });
  
  const selectedHours = days[selectedDay]?.hours || [];
  const minTemp = selectedHours.length ? Math.min(...selectedHours.map(h => h.temp)) : 0;
  const maxTemp = selectedHours.length ? Math.max(...selectedHours.map(h => h.temp)) : 30;
  
  return (
    <div className="page-content">
      <header className="page-header">
        <Clock className="page-header-icon" />
        <div>
          <h1 className="page-title">Hourly Forecast</h1>
          <p className="page-subtitle">48-hour detailed weather forecast</p>
        </div>
      </header>
      
      {/* Day Selector */}
      <div className="day-selector">
        {days.map((day, i) => (
          <button
            key={i}
            className={`day-btn ${selectedDay === i ? 'active' : ''}`}
            onClick={() => setSelectedDay(i)}
          >
            <span className="day-btn-label">
              {i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : day.dateStr.split(',')[0]}
            </span>
            <span className="day-btn-date">{day.dateStr}</span>
          </button>
        ))}
      </div>
      
      {/* Summary Stats */}
      <div className="grid-4 mt-6">
        <div className="stat-card">
          <Thermometer className="stat-icon temp" />
          <div className="stat-info">
            <span className="stat-label">Temperature Range</span>
            <span className="stat-value">{minTemp}° - {maxTemp}°C</span>
          </div>
        </div>
        <div className="stat-card">
          <Droplets className="stat-icon humidity" />
          <div className="stat-info">
            <span className="stat-label">Avg Humidity</span>
            <span className="stat-value">
              {selectedHours.length ? Math.round(selectedHours.reduce((a, b) => a + b.humidity, 0) / selectedHours.length) : 0}%
            </span>
          </div>
        </div>
        <div className="stat-card">
          <Wind className="stat-icon wind" />
          <div className="stat-info">
            <span className="stat-label">Avg Wind</span>
            <span className="stat-value">
              {selectedHours.length ? Math.round(selectedHours.reduce((a, b) => a + b.windSpeed, 0) / selectedHours.length) : 0} km/h
            </span>
          </div>
        </div>
        <div className="stat-card">
          <CloudRain className="stat-icon rain" />
          <div className="stat-info">
            <span className="stat-label">Rain Chance</span>
            <span className="stat-value">
              {selectedHours.length ? Math.round(selectedHours.reduce((a, b) => a + b.precipitation, 0) / selectedHours.length) : 0}%
            </span>
          </div>
        </div>
      </div>
      
      {/* Hourly Timeline */}
      <div className="card mt-6">
        <h3 className="card-title">Hour by Hour</h3>
        <div className="hourly-timeline">
          {selectedHours.map((hour, i) => (
            <div key={i} className={`hourly-item ${hour.isNow ? 'now' : ''}`}>
              <div className="hourly-time">
                {hour.isNow ? 'Now' : hour.timeStr}
              </div>
              <div className="hourly-icon">{hour.condition.icon}</div>
              <div className="hourly-temp">{hour.temp}°</div>
              <div className="hourly-details">
                <span className="hourly-detail">
                  <Droplets size={14} />
                  {hour.humidity}%
                </span>
                <span className="hourly-detail">
                  <Wind size={14} />
                  {hour.windSpeed} km/h
                </span>
                <span className="hourly-detail">
                  <CloudRain size={14} />
                  {hour.precipitation}%
                </span>
              </div>
              <div className="hourly-bar">
                <div 
                  className="hourly-bar-fill"
                  style={{ 
                    height: `${((hour.temp - minTemp + 5) / (maxTemp - minTemp + 10)) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Detailed Table */}
      <div className="card mt-6">
        <h3 className="card-title">Detailed Breakdown</h3>
        <div className="hourly-table-container">
          <table className="hourly-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Condition</th>
                <th>Temp</th>
                <th>Feels Like</th>
                <th>Humidity</th>
                <th>Wind</th>
                <th>Precip</th>
                <th>Visibility</th>
              </tr>
            </thead>
            <tbody>
              {selectedHours.map((hour, i) => (
                <tr key={i} className={hour.isNow ? 'now-row' : ''}>
                  <td className="time-cell">{hour.isNow ? 'Now' : hour.timeStr}</td>
                  <td>
                    <span className="condition-cell">
                      {hour.condition.icon} {hour.condition.label}
                    </span>
                  </td>
                  <td className="temp-cell">{hour.temp}°C</td>
                  <td>{hour.feelsLike}°C</td>
                  <td>{hour.humidity}%</td>
                  <td>{hour.windSpeed} km/h {hour.windDir}</td>
                  <td className={hour.precipitation > 50 ? 'high-precip' : ''}>{hour.precipitation}%</td>
                  <td>{hour.visibility} km</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
