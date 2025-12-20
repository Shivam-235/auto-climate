import { useState, useEffect } from 'react';
import { 
  Users, 
  MapPin,
  ArrowLeft,
  RefreshCw,
  ThumbsUp,
  MessageCircle,
  Camera,
  Send,
  Cloud,
  CloudRain,
  Sun,
  Wind,
  Thermometer,
  Clock,
  Filter
} from 'lucide-react';
import { Link } from 'react-router-dom';

const conditions = [
  { id: 'sunny', label: 'Sunny', icon: Sun },
  { id: 'cloudy', label: 'Cloudy', icon: Cloud },
  { id: 'rainy', label: 'Rainy', icon: CloudRain },
  { id: 'windy', label: 'Windy', icon: Wind },
];

const generateObservations = () => {
  const locations = [
    'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 
    'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow'
  ];
  const conditionTypes = ['sunny', 'cloudy', 'rainy', 'windy'];
  const comments = [
    'Clear skies with mild breeze',
    'Overcast conditions, expecting rain',
    'Heavy rainfall in the area',
    'Strong winds, trees swaying',
    'Partly cloudy with occasional sunshine',
    'Thunder in the distance',
    'Pleasant weather for outdoor activities',
    'Foggy morning conditions',
    'Hot and humid afternoon',
    'Cool evening breeze',
  ];

  const observations = [];
  
  for (let i = 0; i < 15; i++) {
    const hoursAgo = Math.floor(Math.random() * 24);
    const time = new Date();
    time.setHours(time.getHours() - hoursAgo);
    
    observations.push({
      id: i + 1,
      location: locations[Math.floor(Math.random() * locations.length)],
      condition: conditionTypes[Math.floor(Math.random() * conditionTypes.length)],
      temperature: Math.round(20 + Math.random() * 18),
      comment: comments[Math.floor(Math.random() * comments.length)],
      time: time.toLocaleString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true,
        month: 'short',
        day: 'numeric'
      }),
      likes: Math.floor(Math.random() * 50),
      userName: `Observer_${Math.floor(Math.random() * 1000)}`,
      hasPhoto: Math.random() > 0.6,
    });
  }

  return observations.sort((a, b) => new Date(b.time) - new Date(a.time));
};

export default function PublicObservationPage({ weatherData }) {
  const [observations, setObservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [newObservation, setNewObservation] = useState({
    location: '',
    condition: 'sunny',
    temperature: '',
    comment: '',
  });

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setObservations(generateObservations());
      setLoading(false);
    }, 600);
  }, []);

  const filteredObservations = filter === 'all' 
    ? observations 
    : observations.filter(o => o.condition === filter);

  const getConditionIcon = (condition) => {
    const cond = conditions.find(c => c.id === condition);
    const Icon = cond?.icon || Cloud;
    return <Icon size={20} className={`condition-icon-${condition}`} />;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newObs = {
      id: observations.length + 1,
      ...newObservation,
      temperature: parseInt(newObservation.temperature) || 25,
      time: new Date().toLocaleString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true,
        month: 'short',
        day: 'numeric'
      }),
      likes: 0,
      userName: 'You',
      hasPhoto: false,
    };
    setObservations([newObs, ...observations]);
    setShowSubmitForm(false);
    setNewObservation({ location: '', condition: 'sunny', temperature: '', comment: '' });
  };

  const handleLike = (id) => {
    setObservations(observations.map(o => 
      o.id === id ? { ...o, likes: o.likes + 1 } : o
    ));
  };

  // Stats
  const stats = {
    total: observations.length,
    today: observations.filter(o => o.time.includes(new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))).length,
    locations: new Set(observations.map(o => o.location)).size,
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
          <Users className="page-header-icon" style={{ color: '#8b5cf6' }} />
          <div>
            <h1 className="page-title">Public Weather Observations</h1>
            <p className="page-subtitle">Crowd-sourced weather reports from citizens</p>
          </div>
        </header>

        {/* Stats */}
        <div className="grid-3">
          <div className="card stat-card">
            <span className="stat-number">{stats.total}</span>
            <span className="stat-label">Total Observations</span>
          </div>
          <div className="card stat-card">
            <span className="stat-number">{stats.today}</span>
            <span className="stat-label">Today's Reports</span>
          </div>
          <div className="card stat-card">
            <span className="stat-number">{stats.locations}</span>
            <span className="stat-label">Active Locations</span>
          </div>
        </div>

        {/* Submit Button */}
        <div className="card">
          <button 
            className="submit-observation-btn"
            onClick={() => setShowSubmitForm(!showSubmitForm)}
          >
            <Send size={18} />
            Submit Your Observation
          </button>

          {showSubmitForm && (
            <form className="observation-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    placeholder="Enter your city"
                    value={newObservation.location}
                    onChange={(e) => setNewObservation({ ...newObservation, location: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Temperature (°C)</label>
                  <input
                    type="number"
                    placeholder="e.g., 28"
                    value={newObservation.temperature}
                    onChange={(e) => setNewObservation({ ...newObservation, temperature: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Current Condition</label>
                <div className="condition-selector">
                  {conditions.map(cond => (
                    <button
                      key={cond.id}
                      type="button"
                      className={`condition-btn ${newObservation.condition === cond.id ? 'active' : ''}`}
                      onClick={() => setNewObservation({ ...newObservation, condition: cond.id })}
                    >
                      <cond.icon size={20} />
                      {cond.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Comment</label>
                <textarea
                  placeholder="Describe the weather..."
                  value={newObservation.comment}
                  onChange={(e) => setNewObservation({ ...newObservation, comment: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowSubmitForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Submit Observation
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Filter */}
        <div className="card filter-card">
          <div className="filter-header">
            <Filter size={18} />
            <span>Filter by condition:</span>
          </div>
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            {conditions.map(cond => (
              <button
                key={cond.id}
                className={`filter-btn ${filter === cond.id ? 'active' : ''}`}
                onClick={() => setFilter(cond.id)}
              >
                <cond.icon size={16} />
                {cond.label}
              </button>
            ))}
          </div>
        </div>

        {/* Observations List */}
        <div className="card">
          <div className="card-header-row">
            <h3 className="card-section-title">Recent Observations</h3>
            <button className="refresh-btn-small" onClick={() => setObservations(generateObservations())}>
              <RefreshCw size={16} className={loading ? 'spinning' : ''} />
            </button>
          </div>

          {loading ? (
            <div className="loading-state">
              <RefreshCw size={32} className="spinning" />
              <p>Loading observations...</p>
            </div>
          ) : (
            <div className="observations-list">
              {filteredObservations.map(obs => (
                <div key={obs.id} className="observation-item">
                  <div className="observation-header">
                    <div className="observation-user">
                      <div className="user-avatar">
                        <Users size={16} />
                      </div>
                      <span className="user-name">{obs.userName}</span>
                    </div>
                    <div className="observation-time">
                      <Clock size={14} />
                      {obs.time}
                    </div>
                  </div>

                  <div className="observation-content">
                    <div className="observation-location">
                      <MapPin size={16} />
                      {obs.location}
                    </div>

                    <div className="observation-weather">
                      {getConditionIcon(obs.condition)}
                      <span className="condition-label">
                        {conditions.find(c => c.id === obs.condition)?.label}
                      </span>
                      <span className="observation-temp">
                        <Thermometer size={14} />
                        {obs.temperature}°C
                      </span>
                    </div>

                    {obs.comment && (
                      <p className="observation-comment">{obs.comment}</p>
                    )}

                    {obs.hasPhoto && (
                      <div className="observation-photo">
                        <Camera size={14} />
                        <span>Photo attached</span>
                      </div>
                    )}
                  </div>

                  <div className="observation-actions">
                    <button 
                      className="like-btn"
                      onClick={() => handleLike(obs.id)}
                    >
                      <ThumbsUp size={16} />
                      {obs.likes}
                    </button>
                    <button className="comment-btn">
                      <MessageCircle size={16} />
                      Reply
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
