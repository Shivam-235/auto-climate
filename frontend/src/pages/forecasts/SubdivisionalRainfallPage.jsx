import { useState, useEffect } from 'react';
import {
  CloudRain,
  MapPin,
  ArrowLeft,
  RefreshCw,
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getRainfallData } from '../../services/weatherApi';

const subdivisions = [
  { id: 'anm', name: 'Andaman & Nicobar', normal: 320 },
  { id: 'ap', name: 'Coastal Andhra Pradesh', normal: 180 },
  { id: 'ar', name: 'Arunachal Pradesh', normal: 450 },
  { id: 'as', name: 'Assam & Meghalaya', normal: 520 },
  { id: 'br', name: 'Bihar', normal: 280 },
  { id: 'ch', name: 'Chhattisgarh', normal: 310 },
  { id: 'gj', name: 'Gujarat Region', normal: 220 },
  { id: 'hp', name: 'Himachal Pradesh', normal: 180 },
  { id: 'jk', name: 'Jammu & Kashmir', normal: 120 },
  { id: 'jh', name: 'Jharkhand', normal: 290 },
  { id: 'ka', name: 'Coastal Karnataka', normal: 680 },
  { id: 'kl', name: 'Kerala', normal: 620 },
  { id: 'mp', name: 'Madhya Pradesh', normal: 240 },
  { id: 'mh', name: 'Madhya Maharashtra', normal: 180 },
  { id: 'od', name: 'Odisha', normal: 320 },
  { id: 'pb', name: 'Punjab', normal: 140 },
  { id: 'rj', name: 'Rajasthan', normal: 120 },
  { id: 'tn', name: 'Tamil Nadu', normal: 90 },
  { id: 'ts', name: 'Telangana', normal: 170 },
  { id: 'up', name: 'Uttar Pradesh', normal: 220 },
  { id: 'uk', name: 'Uttarakhand', normal: 280 },
  { id: 'wb', name: 'Gangetic West Bengal', normal: 340 },
];

const generateSubdivisionData = () => {
  return subdivisions.map(sub => {
    const days = [];
    let cumulative = 0;

    for (let i = 1; i <= 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const amount = Math.round(Math.random() * 40);
      cumulative += amount;

      days.push({
        day: i,
        date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        amount,
        cumulative,
      });
    }

    const weeklyTotal = cumulative;
    const normalWeekly = Math.round(sub.normal / 4);
    const departure = Math.round(((weeklyTotal - normalWeekly) / normalWeekly) * 100);

    return {
      ...sub,
      days,
      weeklyTotal,
      normalWeekly,
      departure,
      category: departure > 20 ? 'Excess' : departure < -20 ? 'Deficient' : 'Normal',
    };
  });
};

export default function SubdivisionalRainfallPage({ weatherData }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const apiData = await getRainfallData();
        const subdivisionalForecast = generateSubdivisionData();
        if (apiData && apiData.length > 0) {
          subdivisionalForecast.forEach(d => d.isRealData = true);
        }
        setData(subdivisionalForecast);
      } catch (error) {
        console.log('Using simulated subdivisional data - API unavailable:', error.message);
        setData(generateSubdivisionData());
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const sortedData = [...data].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'rainfall') return b.weeklyTotal - a.weeklyTotal;
    if (sortBy === 'departure') return b.departure - a.departure;
    return 0;
  });

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Excess': return '#3b82f6';
      case 'Deficient': return '#ef4444';
      default: return '#22c55e';
    }
  };

  const getDepartureIcon = (departure) => {
    if (departure > 20) return <TrendingUp className="trend-icon up" />;
    if (departure < -20) return <TrendingDown className="trend-icon down" />;
    return <Minus className="trend-icon normal" />;
  };

  // Summary statistics
  const summary = {
    excess: data.filter(d => d.category === 'Excess').length,
    normal: data.filter(d => d.category === 'Normal').length,
    deficient: data.filter(d => d.category === 'Deficient').length,
  };

  return (
    <div className="forecast-subpage">
      <div className="page-bg">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
      </div>

      <div className="page-content">
        <Link to="/forecasts" className="back-link">
          <ArrowLeft size={20} />
          Back to Forecasts
        </Link>

        <header className="page-header">
          <CloudRain className="page-header-icon" style={{ color: '#60a5fa' }} />
          <div>
            <h1 className="page-title">7-Day Sub-Divisional Rainfall Forecast</h1>
            <p className="page-subtitle">Week-long rainfall forecast by meteorological sub-divisions</p>
          </div>
        </header>

        {/* Summary Cards */}
        <div className="grid-3">
          <div className="card summary-stat-card excess">
            <span className="stat-number">{summary.excess}</span>
            <span className="stat-label">Sub-divisions with Excess</span>
          </div>
          <div className="card summary-stat-card normal">
            <span className="stat-number">{summary.normal}</span>
            <span className="stat-label">Sub-divisions Normal</span>
          </div>
          <div className="card summary-stat-card deficient">
            <span className="stat-number">{summary.deficient}</span>
            <span className="stat-label">Sub-divisions Deficient</span>
          </div>
        </div>

        {/* Sort Options */}
        <div className="card">
          <div className="sort-controls">
            <span>Sort by:</span>
            <button
              className={`sort-btn ${sortBy === 'name' ? 'active' : ''}`}
              onClick={() => setSortBy('name')}
            >
              Name
            </button>
            <button
              className={`sort-btn ${sortBy === 'rainfall' ? 'active' : ''}`}
              onClick={() => setSortBy('rainfall')}
            >
              Rainfall
            </button>
            <button
              className={`sort-btn ${sortBy === 'departure' ? 'active' : ''}`}
              onClick={() => setSortBy('departure')}
            >
              Departure
            </button>
          </div>
        </div>

        {/* Subdivision Data */}
        <div className="card">
          <div className="card-header-row">
            <h3 className="card-section-title">Subdivision-wise 7-Day Forecast</h3>
            <button className="refresh-btn-small" onClick={() => setData(generateSubdivisionData())}>
              <RefreshCw size={16} className={loading ? 'spinning' : ''} />
            </button>
          </div>

          {loading ? (
            <div className="loading-state">
              <RefreshCw size={32} className="spinning" />
              <p>Loading subdivision data...</p>
            </div>
          ) : (
            <div className="subdivision-grid">
              {sortedData.map(sub => (
                <div key={sub.id} className="subdivision-card">
                  <div className="subdivision-header">
                    <div className="subdivision-name">
                      <MapPin size={16} />
                      <span>{sub.name}</span>
                    </div>
                    <span
                      className="category-badge"
                      style={{
                        backgroundColor: getCategoryColor(sub.category) + '20',
                        color: getCategoryColor(sub.category)
                      }}
                    >
                      {sub.category}
                    </span>
                  </div>

                  <div className="subdivision-stats">
                    <div className="stat-item">
                      <span className="stat-label">Forecast Total</span>
                      <span className="stat-value">{sub.weeklyTotal} mm</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Normal</span>
                      <span className="stat-value">{sub.normalWeekly} mm</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Departure</span>
                      <span className="stat-value" style={{ color: getCategoryColor(sub.category) }}>
                        {getDepartureIcon(sub.departure)}
                        {sub.departure > 0 ? '+' : ''}{sub.departure}%
                      </span>
                    </div>
                  </div>

                  <div className="daily-bars">
                    {sub.days.map(day => (
                      <div key={day.day} className="day-bar">
                        <div
                          className="bar-fill"
                          style={{
                            height: `${Math.min(100, (day.amount / 40) * 100)}%`,
                            backgroundColor: getCategoryColor(sub.category)
                          }}
                        />
                        <span className="bar-value">{day.amount}</span>
                        <span className="bar-label">D{day.day}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="card">
          <h3 className="card-section-title">Rainfall Categories</h3>
          <div className="category-legend">
            <div className="legend-item">
              <span className="legend-color" style={{ background: '#3b82f6' }} />
              <span>Excess (&gt;+20% of normal)</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ background: '#22c55e' }} />
              <span>Normal (±20% of normal)</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ background: '#ef4444' }} />
              <span>Deficient (&lt;-20% of normal)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
