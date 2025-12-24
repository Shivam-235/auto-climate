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
  Filter,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import './PublicObservation.css';

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
      replies: [],
    });
  }

  return observations.sort((a, b) => new Date(b.time) - new Date(a.time));
};

export default function PublicObservationPage({ weatherData }) {
  const [observations, setObservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
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
    return <Icon size={18} className={`condition-icon-${condition}`} />;
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
      replies: [],
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

  const handleReply = (obsId) => {
    if (!replyText.trim()) return;

    setObservations(observations.map(o => {
      if (o.id === obsId) {
        return {
          ...o,
          replies: [
            ...o.replies,
            {
              id: Date.now(),
              userName: 'You',
              text: replyText,
              time: new Date().toLocaleString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              }),
            }
          ]
        };
      }
      return o;
    }));

    setReplyText('');
    setReplyingTo(null);
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
                <div key={obs.id} className="observation-card">
                  {/* Header with user and time */}
                  <div className="obs-header">
                    <div className="obs-user">
                      <div className="obs-avatar">
                        <Users size={16} />
                      </div>
                      <div className="obs-user-info">
                        <span className="obs-username">{obs.userName}</span>
                        <span className="obs-time">
                          <Clock size={12} />
                          {obs.time}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Weather info */}
                  <div className="obs-weather-row">
                    <div className="obs-location">
                      <MapPin size={16} />
                      <span>{obs.location}</span>
                    </div>
                    <div className="obs-condition">
                      {getConditionIcon(obs.condition)}
                      <span>{conditions.find(c => c.id === obs.condition)?.label}</span>
                    </div>
                    <div className="obs-temp">
                      <Thermometer size={16} />
                      <span>{obs.temperature}°C</span>
                    </div>
                  </div>

                  {/* Comment */}
                  {obs.comment && (
                    <p className="obs-comment">{obs.comment}</p>
                  )}

                  {obs.hasPhoto && (
                    <div className="obs-photo-badge">
                      <Camera size={14} />
                      <span>Photo attached</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="obs-actions">
                    <button
                      className="obs-action-btn like"
                      onClick={() => handleLike(obs.id)}
                    >
                      <ThumbsUp size={16} />
                      <span>{obs.likes}</span>
                    </button>
                    <button
                      className="obs-action-btn reply"
                      onClick={() => setReplyingTo(replyingTo === obs.id ? null : obs.id)}
                    >
                      <MessageCircle size={16} />
                      <span>Reply {obs.replies.length > 0 && `(${obs.replies.length})`}</span>
                    </button>
                  </div>

                  {/* Replies Section */}
                  {obs.replies.length > 0 && (
                    <div className="obs-replies">
                      {obs.replies.map(reply => (
                        <div key={reply.id} className="obs-reply">
                          <div className="reply-avatar">
                            <Users size={12} />
                          </div>
                          <div className="reply-content">
                            <div className="reply-header">
                              <span className="reply-username">{reply.userName}</span>
                              <span className="reply-time">{reply.time}</span>
                            </div>
                            <p className="reply-text">{reply.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply Input */}
                  {replyingTo === obs.id && (
                    <div className="reply-input-container">
                      <input
                        type="text"
                        placeholder="Write a reply..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleReply(obs.id)}
                        autoFocus
                      />
                      <button
                        className="reply-send-btn"
                        onClick={() => handleReply(obs.id)}
                        disabled={!replyText.trim()}
                      >
                        <Send size={16} />
                      </button>
                      <button
                        className="reply-cancel-btn"
                        onClick={() => { setReplyingTo(null); setReplyText(''); }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
