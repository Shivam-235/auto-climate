import { useState, useEffect } from 'react';
import {
  Palmtree,
  MapPin,
  ArrowLeft,
  RefreshCw,
  Sun,
  Cloud,
  CloudRain,
  Thermometer,
  Droplets,
  Wind,
  Eye,
  Calendar,
  Star
} from 'lucide-react';
import { Link } from 'react-router-dom';
import './TourismForecastPage.css';
import { getTourismWeather } from '../../services/weatherApi';

const touristDestinations = [
  {
    name: 'Goa',
    type: 'Beach',
    bestSeason: 'Nov - Feb',
    description: 'Famous beaches and vibrant nightlife',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80'
  },
  {
    name: 'Manali',
    type: 'Hill Station',
    bestSeason: 'Mar - Jun, Oct - Feb',
    description: 'Snow-capped mountains and adventure sports',
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&q=80'
  },
  {
    name: 'Kerala Backwaters',
    type: 'Nature',
    bestSeason: 'Sep - Mar',
    description: 'Serene backwaters and houseboat cruises',
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&q=80'
  },
  {
    name: 'Rajasthan (Jaipur)',
    type: 'Heritage',
    bestSeason: 'Oct - Mar',
    description: 'Royal palaces and rich cultural heritage',
    image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&q=80'
  },
  {
    name: 'Shimla',
    type: 'Hill Station',
    bestSeason: 'Mar - Jun, Dec - Feb',
    description: 'Colonial charm and mountain views',
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&q=80'
  },
  {
    name: 'Andaman Islands',
    type: 'Beach',
    bestSeason: 'Oct - May',
    description: 'Pristine beaches and water sports',
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80'
  },
  {
    name: 'Darjeeling',
    type: 'Hill Station',
    bestSeason: 'Mar - May, Oct - Dec',
    description: 'Tea gardens and Himalayan views',
    image: 'https://images.unsplash.com/photo-1605640840605-14ac1855827b?w=800&q=80'
  },
  {
    name: 'Varanasi',
    type: 'Spiritual',
    bestSeason: 'Oct - Mar',
    description: 'Ancient spiritual city on the Ganges',
    image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800&q=80'
  },
  {
    name: 'Agra',
    type: 'Heritage',
    bestSeason: 'Oct - Mar',
    description: 'Home of the iconic Taj Mahal',
    image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&q=80'
  },
  {
    name: 'Leh-Ladakh',
    type: 'Adventure',
    bestSeason: 'May - Sep',
    description: 'High-altitude desert and Buddhist monasteries',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80'
  },
  {
    name: 'Ooty',
    type: 'Hill Station',
    bestSeason: 'Mar - Jun, Sep - Nov',
    description: 'Queen of hill stations with tea estates',
    image: 'https://images.unsplash.com/photo-1605649487212-47a7d24f08eb?w=800&q=80'
  },
  {
    name: 'Udaipur',
    type: 'Heritage',
    bestSeason: 'Sep - Mar',
    description: 'City of lakes and royal palaces',
    image: 'https://images.unsplash.com/photo-1585217935108-c88a7e6cecd8?w=800&q=80'
  },
];

const generateTourismData = () => {
  const conditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Showers', 'Rainy'];
  const ratings = ['Excellent', 'Good', 'Fair', 'Not Ideal'];

  return touristDestinations.map(dest => {
    const days = [];

    for (let i = 1; i <= 5; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);

      days.push({
        day: i,
        date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        condition: conditions[Math.floor(Math.random() * conditions.length)],
        maxTemp: Math.round(20 + Math.random() * 18),
        minTemp: Math.round(10 + Math.random() * 12),
        humidity: Math.round(40 + Math.random() * 40),
        rainfall: Math.round(Math.random() * 20),
      });
    }

    const avgCondition = days.filter(d => d.condition === 'Sunny' || d.condition === 'Partly Cloudy').length;
    const visitRating = avgCondition >= 4 ? 'Excellent' : avgCondition >= 3 ? 'Good' : avgCondition >= 2 ? 'Fair' : 'Not Ideal';

    return {
      ...dest,
      days,
      visitRating,
      avgTemp: Math.round(days.reduce((sum, d) => sum + d.maxTemp, 0) / days.length),
    };
  });
};

export default function TourismForecastPage({ weatherData }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('All');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const destinations = touristDestinations.map(d => d.name);
        const apiData = await getTourismWeather(destinations);

        let tourismData = generateTourismData();
        if (apiData && Object.keys(apiData).length > 0) {
          tourismData = tourismData.map(dest => {
            const realData = apiData[dest.name];
            if (realData?.current) {
              dest.isRealData = true;
              dest.avgTemp = Math.round(realData.current.temperature) || dest.avgTemp;
              if (dest.days?.length > 0) {
                dest.days[0].maxTemp = Math.round(realData.current.temperature) || dest.days[0].maxTemp;
                dest.days[0].humidity = realData.current.humidity || dest.days[0].humidity;
              }
            }
            return dest;
          });
        }
        setData(tourismData);
      } catch (error) {
        console.log('Using simulated tourism data - API unavailable:', error.message);
        setData(generateTourismData());
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const types = ['All', 'Beach', 'Hill Station', 'Heritage', 'Nature', 'Spiritual', 'Adventure'];

  const filteredData = selectedType === 'All'
    ? data
    : data.filter(d => d.type === selectedType);

  const getConditionIcon = (condition) => {
    if (condition.includes('Rain') || condition.includes('Shower')) return <CloudRain size={16} className="icon-rain" />;
    if (condition.includes('Cloud')) return <Cloud size={16} className="icon-cloud" />;
    return <Sun size={16} className="icon-sun" />;
  };

  const getRatingColor = (rating) => {
    switch (rating) {
      case 'Excellent': return '#22c55e';
      case 'Good': return '#84cc16';
      case 'Fair': return '#eab308';
      default: return '#f97316';
    }
  };

  const getRatingStars = (rating) => {
    const stars = rating === 'Excellent' ? 5 : rating === 'Good' ? 4 : rating === 'Fair' ? 3 : 2;
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} size={12} className={i < stars ? 'star-filled' : 'star-empty'} />
    ));
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
          <Palmtree className="page-header-icon" style={{ color: '#22c55e' }} />
          <div>
            <h1 className="page-title">Tourism Weather Forecast</h1>
            <p className="page-subtitle">5-Day weather forecasts for popular tourist destinations</p>
          </div>
        </header>

        {/* Type Filter */}
        <div className="card">
          <div className="type-filter">
            {types.map(type => (
              <button
                key={type}
                className={`type-btn ${selectedType === type ? 'active' : ''}`}
                onClick={() => setSelectedType(type)}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Destination Cards */}
        {loading ? (
          <div className="card">
            <div className="loading-state">
              <RefreshCw size={32} className="spinning" />
              <p>Loading tourism forecasts...</p>
            </div>
          </div>
        ) : (
          <div className="tourism-grid">
            {filteredData.map(dest => (
              <div key={dest.name} className="card tourism-card">
                {/* Destination Image */}
                <div className="dest-image-container">
                  <img
                    src={dest.image}
                    alt={dest.name}
                    className="dest-image"
                    loading="lazy"
                  />
                  <span className="dest-type-badge">{dest.type}</span>
                </div>

                {/* Card Content */}
                <div className="tourism-card-content">
                  <div className="tourism-header">
                    <div className="dest-info">
                      <h3 className="dest-name">{dest.name}</h3>
                    </div>
                    <div
                      className="visit-rating"
                      style={{ color: getRatingColor(dest.visitRating) }}
                    >
                      <div className="rating-stars">
                        {getRatingStars(dest.visitRating)}
                      </div>
                      <span>{dest.visitRating}</span>
                    </div>
                  </div>

                  <p className="dest-description">{dest.description}</p>

                  <div className="dest-meta">
                    <div className="meta-item">
                      <Calendar size={14} />
                      <span>Best: {dest.bestSeason}</span>
                    </div>
                    <div className="meta-item">
                      <Thermometer size={14} />
                      <span>Avg: {dest.avgTemp}°C</span>
                    </div>
                  </div>

                  <div className="tourism-forecast">
                    {dest.days.map(day => (
                      <div key={day.day} className="tourism-day">
                        <span className="day-label">{day.date.split(' ')[0]}</span>
                        {getConditionIcon(day.condition)}
                        <span className="day-temp">{day.maxTemp}°</span>
                        <span className="day-rain">{day.rainfall}mm</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Travel Tips */}
        <div className="card">
          <h3 className="card-section-title">Travel Weather Tips</h3>
          <div className="travel-tips">
            <div className="tip-item">
              <Sun size={20} />
              <div>
                <strong>Sunny Days</strong>
                <p>Carry sunscreen (SPF 30+), sunglasses, and stay hydrated</p>
              </div>
            </div>
            <div className="tip-item">
              <CloudRain size={20} />
              <div>
                <strong>Rainy Weather</strong>
                <p>Pack waterproof gear, umbrella, and quick-dry clothing</p>
              </div>
            </div>
            <div className="tip-item">
              <Thermometer size={20} />
              <div>
                <strong>Hill Stations</strong>
                <p>Layer your clothing and carry warm jackets for evenings</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
