import { useState, useEffect } from 'react';
import { Moon, Sun, Star, Sunrise, Sunset, Clock, Calendar } from 'lucide-react';

const moonPhases = [
  { name: 'New Moon', icon: '🌑', illumination: 0 },
  { name: 'Waxing Crescent', icon: '🌒', illumination: 25 },
  { name: 'First Quarter', icon: '🌓', illumination: 50 },
  { name: 'Waxing Gibbous', icon: '🌔', illumination: 75 },
  { name: 'Full Moon', icon: '🌕', illumination: 100 },
  { name: 'Waning Gibbous', icon: '🌖', illumination: 75 },
  { name: 'Last Quarter', icon: '🌗', illumination: 50 },
  { name: 'Waning Crescent', icon: '🌘', illumination: 25 },
];

const zodiacSigns = [
  { name: 'Aries', symbol: '♈', dates: 'Mar 21 - Apr 19' },
  { name: 'Taurus', symbol: '♉', dates: 'Apr 20 - May 20' },
  { name: 'Gemini', symbol: '♊', dates: 'May 21 - Jun 20' },
  { name: 'Cancer', symbol: '♋', dates: 'Jun 21 - Jul 22' },
  { name: 'Leo', symbol: '♌', dates: 'Jul 23 - Aug 22' },
  { name: 'Virgo', symbol: '♍', dates: 'Aug 23 - Sep 22' },
  { name: 'Libra', symbol: '♎', dates: 'Sep 23 - Oct 22' },
  { name: 'Scorpio', symbol: '♏', dates: 'Oct 23 - Nov 21' },
  { name: 'Sagittarius', symbol: '♐', dates: 'Nov 22 - Dec 21' },
  { name: 'Capricorn', symbol: '♑', dates: 'Dec 22 - Jan 19' },
  { name: 'Aquarius', symbol: '♒', dates: 'Jan 20 - Feb 18' },
  { name: 'Pisces', symbol: '♓', dates: 'Feb 19 - Mar 20' },
];

function getMoonPhase(date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  // Simplified moon phase calculation
  const c = Math.floor(365.25 * year);
  const e = Math.floor(30.6 * month);
  const jd = c + e + day - 694039.09;
  const phase = jd / 29.53058867;
  const phaseIndex = Math.floor((phase - Math.floor(phase)) * 8);
  
  return moonPhases[phaseIndex % 8];
}

function getMoonCalendar() {
  const calendar = [];
  const today = new Date();
  
  for (let i = -3; i <= 10; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const phase = getMoonPhase(date);
    
    calendar.push({
      date,
      dateStr: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      phase,
      isToday: i === 0,
    });
  }
  
  return calendar;
}

function getCurrentZodiac() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  
  const zodiacDates = [
    { sign: 0, start: [3, 21], end: [4, 19] },   // Aries
    { sign: 1, start: [4, 20], end: [5, 20] },   // Taurus
    { sign: 2, start: [5, 21], end: [6, 20] },   // Gemini
    { sign: 3, start: [6, 21], end: [7, 22] },   // Cancer
    { sign: 4, start: [7, 23], end: [8, 22] },   // Leo
    { sign: 5, start: [8, 23], end: [9, 22] },   // Virgo
    { sign: 6, start: [9, 23], end: [10, 22] },  // Libra
    { sign: 7, start: [10, 23], end: [11, 21] }, // Scorpio
    { sign: 8, start: [11, 22], end: [12, 21] }, // Sagittarius
    { sign: 9, start: [12, 22], end: [1, 19] },  // Capricorn
    { sign: 10, start: [1, 20], end: [2, 18] },  // Aquarius
    { sign: 11, start: [2, 19], end: [3, 20] },  // Pisces
  ];
  
  for (const z of zodiacDates) {
    const [sm, sd] = z.start;
    const [em, ed] = z.end;
    
    if (sm <= em) {
      if ((month === sm && day >= sd) || (month === em && day <= ed) || (month > sm && month < em)) {
        return zodiacSigns[z.sign];
      }
    } else {
      if ((month === sm && day >= sd) || (month === em && day <= ed) || month > sm || month < em) {
        return zodiacSigns[z.sign];
      }
    }
  }
  
  return zodiacSigns[0];
}

export default function AstronomyPage({ weatherData }) {
  const [moonCalendar, setMoonCalendar] = useState([]);
  const currentPhase = getMoonPhase();
  const currentZodiac = getCurrentZodiac();
  
  useEffect(() => {
    setMoonCalendar(getMoonCalendar());
  }, []);
  
  const sunData = weatherData?.sun || {
    sunrise: '6:23 AM',
    sunset: '6:12 PM',
    dayProgress: 50,
  };
  
  // Calculate day length
  const sunriseTime = sunData.sunrise;
  const sunsetTime = sunData.sunset;
  
  return (
    <div className="page-content">
      <header className="page-header">
        <Moon className="page-header-icon" style={{ color: '#a78bfa' }} />
        <div>
          <h1 className="page-title">Moon & Astronomy</h1>
          <p className="page-subtitle">Lunar phases and celestial information</p>
        </div>
      </header>
      
      <div className="grid-2 mt-6">
        {/* Current Moon Phase */}
        <div className="card moon-phase-card">
          <div className="moon-display">
            <div className="moon-icon-large">{currentPhase.icon}</div>
            <div className="moon-info">
              <h2 className="moon-phase-name">{currentPhase.name}</h2>
              <div className="moon-illumination">
                <span className="illumination-value">{currentPhase.illumination}%</span>
                <span className="illumination-label">Illumination</span>
              </div>
            </div>
          </div>
          <div className="moon-details">
            <div className="moon-detail">
              <Moon size={18} />
              <span>Moonrise: 7:45 PM</span>
            </div>
            <div className="moon-detail">
              <Moon size={18} />
              <span>Moonset: 6:30 AM</span>
            </div>
            <div className="moon-detail">
              <Clock size={18} />
              <span>Moon Age: 8 days</span>
            </div>
          </div>
        </div>
        
        {/* Sun Times Card */}
        <div className="card sun-times-card">
          <div className="card-header">
            <Sun className="card-icon sun-icon" />
            <h3>Sun Times</h3>
          </div>
          <div className="sun-times-display">
            <div className="sun-time-item">
              <Sunrise className="sun-time-icon sunrise" />
              <div>
                <span className="sun-time-label">Sunrise</span>
                <span className="sun-time-value">{sunriseTime}</span>
              </div>
            </div>
            <div className="sun-arc">
              <div className="sun-arc-track">
                <div 
                  className="sun-arc-progress"
                  style={{ width: `${sunData.dayProgress}%` }}
                />
                <div 
                  className="sun-position"
                  style={{ left: `${sunData.dayProgress}%` }}
                >
                  ☀️
                </div>
              </div>
            </div>
            <div className="sun-time-item">
              <Sunset className="sun-time-icon sunset" />
              <div>
                <span className="sun-time-label">Sunset</span>
                <span className="sun-time-value">{sunsetTime}</span>
              </div>
            </div>
          </div>
          <div className="day-length">
            <Clock size={16} />
            <span>Day Length: ~12h 0m</span>
          </div>
        </div>
      </div>
      
      {/* Moon Calendar */}
      <div className="card mt-6">
        <div className="card-header">
          <Calendar className="card-icon" />
          <h3>Moon Calendar</h3>
        </div>
        <div className="moon-calendar">
          {moonCalendar.map((day, i) => (
            <div 
              key={i} 
              className={`moon-calendar-day ${day.isToday ? 'today' : ''}`}
            >
              <span className="calendar-date">{day.dateStr}</span>
              <span className="calendar-moon">{day.phase.icon}</span>
              <span className="calendar-phase">{day.phase.name}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Zodiac */}
      <div className="card mt-6">
        <div className="card-header">
          <Star className="card-icon" />
          <h3>Zodiac Signs</h3>
        </div>
        <div className="zodiac-display">
          <div className="current-zodiac">
            <span className="zodiac-symbol-large">{currentZodiac.symbol}</span>
            <div className="zodiac-info">
              <h4>{currentZodiac.name}</h4>
              <span>{currentZodiac.dates}</span>
              <span className="zodiac-current">Current Sign</span>
            </div>
          </div>
          <div className="zodiac-wheel">
            {zodiacSigns.map((sign, i) => (
              <div 
                key={i}
                className={`zodiac-item ${sign.name === currentZodiac.name ? 'active' : ''}`}
                title={`${sign.name} (${sign.dates})`}
              >
                <span className="zodiac-symbol">{sign.symbol}</span>
                <span className="zodiac-name">{sign.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Astronomy Facts */}
      <div className="card mt-6">
        <div className="card-header">
          <Star className="card-icon" />
          <h3>Astronomy Insights</h3>
        </div>
        <div className="astronomy-facts">
          <div className="fact-card">
            <span className="fact-icon">🌍</span>
            <h4>Earth's Position</h4>
            <p>Earth is currently 147.5 million km from the Sun (Perihelion season)</p>
          </div>
          <div className="fact-card">
            <span className="fact-icon">🌙</span>
            <h4>Lunar Distance</h4>
            <p>The Moon is approximately 384,400 km from Earth</p>
          </div>
          <div className="fact-card">
            <span className="fact-icon">⭐</span>
            <h4>Visible Planets Tonight</h4>
            <p>Venus, Mars, and Jupiter are visible in the night sky</p>
          </div>
          <div className="fact-card">
            <span className="fact-icon">🌌</span>
            <h4>Golden Hour</h4>
            <p>Best photography light ~1 hour after sunrise and before sunset</p>
          </div>
        </div>
      </div>
    </div>
  );
}
