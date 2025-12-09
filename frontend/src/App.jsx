import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar';
import UVIndexPage from './pages/UVIndexPage';
import HourlyForecastPage from './pages/HourlyForecastPage';
import WeatherAlertsPage from './pages/WeatherAlertsPage';
import AstronomyPage from './pages/AstronomyPage';
import WeatherMapsPage from './pages/WeatherMapsPage';
import './App.css';

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
      <div className="app-layout">
        <Sidebar />
        <main className="app-main">
          <Routes>
            <Route 
              path="/" 
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
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
