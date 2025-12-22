import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import LandingPageNew from './pages/LandingPageNew';
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar';
import NightSkyBackground from './components/NightSkyBackground';
import DaySkyBackground from './components/DaySkyBackground';
import LoginModal from './components/Auth/LoginModal';
import RegisterModal from './components/Auth/RegisterModal';
import { useAuth } from './context/AuthContext';
import { User, LogOut } from 'lucide-react';
import HamburgerMenu from './components/HamburgerMenu';
import UVIndexPage from './pages/UVIndexPage';
import HourlyForecastPage from './pages/HourlyForecastPage';
import WeatherAlertsPage from './pages/WeatherAlertsPage';
import AstronomyPage from './pages/AstronomyPage';
import WeatherMapsPage from './pages/WeatherMapsPage';
import ServicesPage from './pages/ServicesPage';
import ForecastsPage from './pages/ForecastsPage';
import MajorCitiesPage from './pages/MajorCitiesPage';
// Forecast Sub-pages
import ShortMediumRangePage from './pages/forecasts/ShortMediumRangePage';
import ExtendedRangePage from './pages/forecasts/ExtendedRangePage';
import SeasonalForecastPage from './pages/forecasts/SeasonalForecastPage';
import PrecipitationForecastPage from './pages/forecasts/PrecipitationForecastPage';
import AllIndiaForecastPage from './pages/forecasts/AllIndiaForecastPage';
import SubdivisionalRainfallPage from './pages/forecasts/SubdivisionalRainfallPage';
import DistrictRainfallPage from './pages/forecasts/DistrictRainfallPage';
import TourismForecastPage from './pages/forecasts/TourismForecastPage';
import CycloneTrackPage from './pages/forecasts/CycloneTrackPage';
import PublicObservationPage from './pages/forecasts/PublicObservationPage';
import CAPAlertsPage from './pages/forecasts/CAPAlertsPage';
import FlashFloodPage from './pages/forecasts/FlashFloodPage';
// Service Sub-pages
import RainfallServicePage from './pages/services/RainfallServicePage';
import MonsoonServicePage from './pages/services/MonsoonServicePage';
import CycloneServicePage from './pages/services/CycloneServicePage';
import AgrometServicePage from './pages/services/AgrometServicePage';
import ClimateServicePage from './pages/services/ClimateServicePage';
import UrbanMetServicePage from './pages/services/UrbanMetServicePage';
import AviationServicePage from './pages/services/AviationServicePage';
import HazardAtlasPage from './pages/services/HazardAtlasPage';
import GeospatialServicePage from './pages/services/GeospatialServicePage';
import './App.css';
import './components/ResponsiveFixes.css';

const SOCKET_URL = 'http://localhost:4000';

function App() {
  const [weatherData, setWeatherData] = useState(null);
  const [sensorData, setSensorData] = useState({
    temperature: null,
    humidity: null,
    co2: null,
    pm25: null,
    timestamp: null,
  });
  const [history, setHistory] = useState({
    temperature: [],
    humidity: [],
    co2: [],
    pm25: [],
  });
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();

  // Theme state management
  const [theme, setTheme] = useState(() => {
    // Load saved theme from localStorage or default to 'auto'
    return localStorage.getItem('theme') || 'auto';
  });

  const isDarkModeForTheme = useCallback((themeValue) => {
    if (themeValue === 'dark') return true;
    if (themeValue === 'light') return false;
    // Auto mode - dark at night (6pm to 6am)
    const hour = new Date().getHours();
    return hour < 6 || hour >= 18;
  }, []);

  // Handle theme change
  const handleThemeChange = useCallback((newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);

    // Update document class for CSS styling
    document.documentElement.classList.remove('theme-light', 'theme-dark', 'theme-auto');
    document.documentElement.classList.add(`theme-${newTheme}`);

    // Apply dark mode class for Tailwind
    document.documentElement.classList.toggle('dark', isDarkModeForTheme(newTheme));
  }, [isDarkModeForTheme]);

  // Apply theme class on mount and theme change
  useEffect(() => {
    document.documentElement.classList.remove('theme-light', 'theme-dark', 'theme-auto');
    document.documentElement.classList.add(`theme-${theme}`);

    // Ensure dark class is in sync with theme
    document.documentElement.classList.toggle('dark', isDarkModeForTheme(theme));
  }, [theme, isDarkModeForTheme]);

  const isDark = isDarkModeForTheme(theme);

  useEffect(() => {
    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to server');
      setConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnected(false);
    });

    socket.on('sensorData', (data) => {
      setSensorData(data);
    });

    socket.on('sensorHistory', (data) => {
      setHistory(data);
    });

    socket.on('weatherData', (data) => {
      setWeatherData(data);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <Router>
      {/* Animated Sky Backgrounds - switch based on theme */}
      <NightSkyBackground isDark={isDark} />
      <DaySkyBackground isDark={isDark} />
      
      <Routes>
        <Route path="/" element={<LandingPageNew />} />
        
        <Route path="/*" element={
          <div className={`app-layout ${isDark ? 'dark' : ''}`}>
            {/* Mobile Menu Backdrop */}
            {isMobileMenuOpen && (
              <div 
                className="mobile-menu-backdrop active" 
                onClick={() => setIsMobileMenuOpen(false)}
              />
            )}
            
            <HamburgerMenu 
              isOpen={isMobileMenuOpen}
              onToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
            <Sidebar 
              isOpen={isMobileMenuOpen}
              onClose={() => setIsMobileMenuOpen(false)}
              onLoginClick={() => setShowLoginModal(true)}
              onRegisterClick={() => setShowRegisterModal(true)}
              theme={theme}
              onThemeChange={handleThemeChange}
              isDark={isDark}
            />
            <main className="app-main">
              <Routes>
                <Route 
                  path="/dashboard" 
                  element={
                    <Dashboard 
                      weatherData={weatherData}
                      sensorData={sensorData}
                      history={history}
                      connected={connected}
                      socket={socketRef.current}
                    />
                  } 
                />
            <Route 
              path="/uv-index" 
              element={<UVIndexPage weatherData={weatherData} />} 
            />
            <Route 
              path="/hourly" 
              element={<HourlyForecastPage weatherData={weatherData} />} 
            />
            <Route 
              path="/alerts" 
              element={<WeatherAlertsPage weatherData={weatherData} />} 
            />
            <Route 
              path="/astronomy" 
              element={<AstronomyPage weatherData={weatherData} />} 
            />
            <Route 
              path="/maps" 
              element={<WeatherMapsPage weatherData={weatherData} socket={socketRef.current} />} 
            />
            <Route 
              path="/services" 
              element={<ServicesPage />} 
            />
            <Route 
              path="/forecasts" 
              element={<ForecastsPage />} 
            />
            <Route 
              path="/major-cities" 
              element={<MajorCitiesPage socket={socketRef.current} />} 
            />
            {/* Forecast Sub-pages */}
            <Route 
              path="/forecasts/short-medium-range" 
              element={<ShortMediumRangePage weatherData={weatherData} socket={socketRef.current} />} 
            />
            <Route 
              path="/forecasts/extended-range" 
              element={<ExtendedRangePage weatherData={weatherData} />} 
            />
            <Route 
              path="/forecasts/seasonal" 
              element={<SeasonalForecastPage weatherData={weatherData} />} 
            />
            <Route 
              path="/forecasts/precipitation" 
              element={<PrecipitationForecastPage weatherData={weatherData} />} 
            />
            <Route 
              path="/forecasts/all-india" 
              element={<AllIndiaForecastPage weatherData={weatherData} />} 
            />
            <Route 
              path="/forecasts/7day-rainfall" 
              element={<SubdivisionalRainfallPage weatherData={weatherData} />} 
            />
            <Route 
              path="/forecasts/5day-district" 
              element={<DistrictRainfallPage weatherData={weatherData} />} 
            />
            <Route 
              path="/forecasts/tourism" 
              element={<TourismForecastPage weatherData={weatherData} />} 
            />
            <Route 
              path="/forecasts/cyclone-track" 
              element={<CycloneTrackPage weatherData={weatherData} />} 
            />
            <Route 
              path="/forecasts/public-observation" 
              element={<PublicObservationPage weatherData={weatherData} />} 
            />
            <Route 
              path="/forecasts/cap-alerts" 
              element={<CAPAlertsPage weatherData={weatherData} />} 
            />
            <Route 
              path="/forecasts/flash-flood" 
              element={<FlashFloodPage weatherData={weatherData} />} 
            />
            {/* Service Sub-pages */}
            <Route 
              path="/services/rainfall" 
              element={<RainfallServicePage weatherData={weatherData} />} 
            />
            <Route 
              path="/services/monsoon" 
              element={<MonsoonServicePage weatherData={weatherData} />} 
            />
            <Route 
              path="/services/cyclone" 
              element={<CycloneServicePage weatherData={weatherData} />} 
            />
            <Route 
              path="/services/agromet" 
              element={<AgrometServicePage weatherData={weatherData} />} 
            />
            <Route 
              path="/services/climate" 
              element={<ClimateServicePage weatherData={weatherData} />} 
            />
            <Route 
              path="/services/urban" 
              element={<UrbanMetServicePage weatherData={weatherData} />} 
            />
            <Route 
              path="/services/aviation" 
              element={<AviationServicePage weatherData={weatherData} />} 
            />
            <Route 
              path="/services/hazard" 
              element={<HazardAtlasPage weatherData={weatherData} />} 
            />
                <Route 
                  path="/services/geospatial" 
                  element={<GeospatialServicePage weatherData={weatherData} />} 
                />
              </Routes>
            </main>
          </div>
        } />
      </Routes>

      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToRegister={() => {
          setShowLoginModal(false);
          setShowRegisterModal(true);
        }}
      />

      <RegisterModal 
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSwitchToLogin={() => {
          setShowRegisterModal(false);
          setShowLoginModal(true);
        }}
      />
    </Router>
  );
}

export default App;
