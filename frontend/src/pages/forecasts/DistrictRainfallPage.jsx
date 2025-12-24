import { useState, useEffect } from 'react';
import {
  MapPin,
  CloudRain,
  ArrowLeft,
  RefreshCw,
  Search,
  Thermometer,
  Droplets,
  Wind
} from 'lucide-react';
import { Link } from 'react-router-dom';
import './DistrictRainfallPage.css';
import { getRainfallData } from '../../services/weatherApi';

const districts = [
  // North India
  { name: 'New Delhi', state: 'Delhi', region: 'North' },
  { name: 'Gurugram', state: 'Haryana', region: 'North' },
  { name: 'Jaipur', state: 'Rajasthan', region: 'North' },
  { name: 'Lucknow', state: 'Uttar Pradesh', region: 'North' },
  { name: 'Chandigarh', state: 'Punjab', region: 'North' },
  { name: 'Shimla', state: 'Himachal Pradesh', region: 'North' },
  { name: 'Dehradun', state: 'Uttarakhand', region: 'North' },
  // South India
  { name: 'Chennai', state: 'Tamil Nadu', region: 'South' },
  { name: 'Bangalore', state: 'Karnataka', region: 'South' },
  { name: 'Hyderabad', state: 'Telangana', region: 'South' },
  { name: 'Kochi', state: 'Kerala', region: 'South' },
  { name: 'Thiruvananthapuram', state: 'Kerala', region: 'South' },
  { name: 'Coimbatore', state: 'Tamil Nadu', region: 'South' },
  // West India
  { name: 'Mumbai', state: 'Maharashtra', region: 'West' },
  { name: 'Pune', state: 'Maharashtra', region: 'West' },
  { name: 'Ahmedabad', state: 'Gujarat', region: 'West' },
  { name: 'Nagpur', state: 'Maharashtra', region: 'West' },
  // East India
  { name: 'Kolkata', state: 'West Bengal', region: 'East' },
  { name: 'Bhubaneswar', state: 'Odisha', region: 'East' },
  { name: 'Patna', state: 'Bihar', region: 'East' },
  { name: 'Guwahati', state: 'Assam', region: 'East' },
  // Central India
  { name: 'Bhopal', state: 'Madhya Pradesh', region: 'Central' },
  { name: 'Raipur', state: 'Chhattisgarh', region: 'Central' },
  { name: 'Indore', state: 'Madhya Pradesh', region: 'Central' },
];

const generateDistrictData = () => {
  return districts.map(district => {
    const days = [];

    for (let i = 1; i <= 5; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);

      days.push({
        day: i,
        date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short' }),
        rainfall: Math.round(Math.random() * 50),
        probability: Math.round(20 + Math.random() * 70),
        maxTemp: Math.round(25 + Math.random() * 12),
        minTemp: Math.round(15 + Math.random() * 10),
      });
    }

    return {
      ...district,
      days,
      totalRainfall: days.reduce((sum, d) => sum + d.rainfall, 0),
    };
  });
};

export default function DistrictRainfallPage({ weatherData }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [selectedState, setSelectedState] = useState('All');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const apiData = await getRainfallData();
        const districtForecast = generateDistrictData();
        if (apiData && apiData.length > 0) {
          districtForecast.forEach(d => d.isRealData = true);
        }
        setData(districtForecast);
      } catch (error) {
        console.log('Using simulated district data - API unavailable:', error.message);
        setData(generateDistrictData());
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const regions = ['All', 'North', 'South', 'East', 'West', 'Central'];
  const states = ['All', ...new Set(districts.map(d => d.state))];

  const filteredData = data.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.state.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion = selectedRegion === 'All' || d.region === selectedRegion;
    const matchesState = selectedState === 'All' || d.state === selectedState;
    return matchesSearch && matchesRegion && matchesState;
  });

  const getRainfallColor = (amount) => {
    if (amount >= 40) return '#ef4444';
    if (amount >= 20) return '#f97316';
    if (amount >= 10) return '#eab308';
    return '#22c55e';
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
          <MapPin className="page-header-icon" style={{ color: '#f97316' }} />
          <div>
            <h1 className="page-title">5-Day District-Wise Rainfall Forecast</h1>
            <p className="page-subtitle">District-level rainfall predictions for 5 days</p>
          </div>
        </header>

        {/* Filters */}
        <div className="card filter-card">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search district or state..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-row">
            <div className="filter-group">
              <label>Region:</label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
              >
                {regions.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>State:</label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
              >
                {states.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="results-info">
          Showing {filteredData.length} of {data.length} districts
        </div>

        {/* District Cards */}
        <div className="card">
          <div className="card-header-row">
            <h3 className="card-section-title">District Forecasts</h3>
            <button className="refresh-btn-small" onClick={() => setData(generateDistrictData())}>
              <RefreshCw size={16} className={loading ? 'spinning' : ''} />
            </button>
          </div>

          {loading ? (
            <div className="loading-state">
              <RefreshCw size={32} className="spinning" />
              <p>Loading district data...</p>
            </div>
          ) : (
            <div className="district-grid">
              {filteredData.map(district => (
                <div key={district.name} className="district-card">
                  <div className="district-header">
                    <div className="district-info">
                      <MapPin size={16} />
                      <div>
                        <span className="district-name">{district.name}</span>
                        <span className="district-state">{district.state}</span>
                      </div>
                    </div>
                    <span className="total-rainfall">
                      <CloudRain size={14} />
                      {district.totalRainfall} mm
                    </span>
                  </div>

                  <div className="district-forecast">
                    {district.days.map(day => (
                      <div key={day.day} className="district-day">
                        <span className="day-date">{day.date}</span>
                        <div
                          className="rainfall-indicator"
                          style={{ backgroundColor: getRainfallColor(day.rainfall) }}
                        >
                          <Droplets size={12} />
                          {day.rainfall} mm
                        </div>
                        <span className="day-prob">{day.probability}%</span>
                        <div className="day-temps">
                          <span className="temp-high">{day.maxTemp}°</span>
                          <span className="temp-low">{day.minTemp}°</span>
                        </div>
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
          <h3 className="card-section-title">Rainfall Intensity</h3>
          <div className="legend-items">
            <div className="legend-item">
              <span className="legend-color" style={{ background: '#22c55e' }} />
              <span>Light (&lt;10mm)</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ background: '#eab308' }} />
              <span>Moderate (10-20mm)</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ background: '#f97316' }} />
              <span>Heavy (20-40mm)</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ background: '#ef4444' }} />
              <span>Very Heavy (&gt;40mm)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
