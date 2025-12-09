import { useState, useEffect } from 'react';
import { Activity, Wifi, WifiOff, Clock } from 'lucide-react';
import SensorCard from './SensorCard';
import Chart from './chart';
import AQICard from './AQICard';
import SunCard from './SunCard';
import WindCompass from './WindCompass';
import PressureCard from './PressureCard';
import ForecastCard from './ForecastCard';
import LocationSearch from './LocationSearch';

export default function Dashboard({ weatherData, sensorData, history, connected, socket }) {
  const [lastUpdate, setLastUpdate] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timeInterval);
    };
  }, []);

  useEffect(() => {
    if (sensorData?.timestamp) {
      setLastUpdate(new Date().toLocaleTimeString());
    }
  }, [sensorData]);

  return (
    <div className="dashboard">
      <div className="dashboard-bg">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />
      </div>

      <div className="dashboard-content">
        <header className="header">
          <div className="header-inner">
            <div className="header-left">
              
              <div>
                
                <LocationSearch 
                  socket={socket} 
                  currentLocation={weatherData?.location}
                />
              </div>
            </div>

            <div className="header-right">
              <div className="header-time">
                <Clock />
                <span>{currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}</span>
              </div>
              
              <div className={`connection-status ${connected ? 'connected' : 'disconnected'}`}>
                {connected ? <Wifi /> : <WifiOff />}
                <span>{connected ? 'Live' : 'Offline'}</span>
              </div>

              {lastUpdate && <span className="last-update">Updated: {lastUpdate}</span>}
            </div>
          </div>
        </header>

        <main className="main-content">
          <section className="section">
            <div className="section-header">
              <span className="section-bar indigo" />
              <h2 className="section-title">Indoor Sensors</h2>
            </div>
            <div className="grid-4">
              <SensorCard type="temperature" value={sensorData.temperature} />
              <SensorCard type="humidity" value={sensorData.humidity} />
              <SensorCard type="co2" value={sensorData.co2} />
              <SensorCard type="pm25" value={sensorData.pm25} />
            </div>
          </section>

          <section className="section">
            <div className="section-header">
              <span className="section-bar cyan" />
              <h2 className="section-title">Weather Conditions</h2>
            </div>
            <div className="grid-2">
              <AQICard aqi={weatherData?.aqi} />
              <SunCard sun={weatherData?.sun} />
              <WindCompass wind={weatherData?.wind} />
              <PressureCard pressure={weatherData?.current?.pressure} />
            </div>
          </section>

          <section className="section">
            <div className="section-header">
              <span className="section-bar orange" />
              <h2 className="section-title">5-Day Forecast</h2>
            </div>
            <ForecastCard forecast={weatherData?.forecast} />
          </section>

          <section className="section">
            <div className="section-header">
              <span className="section-bar emerald" />
              <h2 className="section-title">Real-time Trends</h2>
            </div>
            <div className="grid-2">
              <Chart type="temperature" data={history.temperature} />
              <Chart type="humidity" data={history.humidity} />
              <Chart type="co2" data={history.co2} />
              <Chart type="pm25" data={history.pm25} />
            </div>
          </section>
        </main>

        <footer className="footer">
          <div className="footer-inner">
            <p>Envizio • Real-time Environmental Monitoring System</p>
          </div>
        </footer>
      </div>
    </div>
  );
}