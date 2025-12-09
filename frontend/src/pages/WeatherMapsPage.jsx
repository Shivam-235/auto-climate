import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Map, Layers, Cloud, CloudRain, Wind, Thermometer, Droplets, Eye, Navigation, ZoomIn, ZoomOut, Locate, X, Loader2, Sunrise, Sunset } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icon
const createCustomIcon = (color = '#3b82f6') => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 24px;
        height: 24px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

const mapLayers = [
  { id: 'clouds_new', label: 'Cloud Cover', icon: Cloud, color: '#94a3b8', description: 'Real-time cloud coverage' },
  { id: 'precipitation_new', label: 'Precipitation', icon: CloudRain, color: '#3b82f6', description: 'Rain & snow intensity' },
  { id: 'wind_new', label: 'Wind Speed', icon: Wind, color: '#22c55e', description: 'Wind velocity overlay' },
  { id: 'temp_new', label: 'Temperature', icon: Thermometer, color: '#ef4444', description: 'Temperature heatmap' },
  { id: 'pressure_new', label: 'Pressure', icon: Eye, color: '#8b5cf6', description: 'Atmospheric pressure' },
];

const mapStyles = [
  { id: 'dark', label: 'Dark', url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' },
  { id: 'light', label: 'Light', url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png' },
  { id: 'satellite', label: 'Satellite', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}' },
  { id: 'terrain', label: 'Terrain', url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png' },
];

// Component to handle map center changes
function MapController({ center, zoom }) {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || map.getZoom(), { animate: true });
    }
  }, [center, zoom, map]);
  
  return null;
}

// Component for custom controls
function CustomControls({ onLocate }) {
  const map = useMap();
  
  return (
    <div className="leaflet-custom-controls">
      <button 
        className="leaflet-control-btn"
        onClick={() => map.zoomIn()}
        title="Zoom In"
      >
        <ZoomIn size={18} />
      </button>
      <button 
        className="leaflet-control-btn"
        onClick={() => map.zoomOut()}
        title="Zoom Out"
      >
        <ZoomOut size={18} />
      </button>
      <button 
        className="leaflet-control-btn"
        onClick={onLocate}
        title="Go to Location"
      >
        <Locate size={18} />
      </button>
    </div>
  );
}

// Component to handle map clicks
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onMapClick(lat, lng);
    },
  });
  return null;
}

// Weather Panel Component for clicked location
function WeatherPanel({ data, loading, error, onClose }) {
  if (!data && !loading && !error) return null;

  return (
    <div className={`weather-panel ${data || loading || error ? 'open' : ''}`}>
      <div className="weather-panel-header">
        <h3>
          {loading ? 'Loading...' : error ? 'Error' : data?.location?.city || 'Location'}
        </h3>
        <button className="weather-panel-close" onClick={onClose}>
          <X size={20} />
        </button>
      </div>
      
      {loading && (
        <div className="weather-panel-loading">
          <Loader2 className="spin" size={32} />
          <p>Fetching weather data...</p>
        </div>
      )}
      
      {error && (
        <div className="weather-panel-error">
          <p>{error}</p>
        </div>
      )}
      
      {data && !loading && (
        <div className="weather-panel-content">
          {/* Current Weather */}
          <div className="panel-section">
            <div className="panel-temp-main">
              <span className="panel-temp">{data.current?.temperature}°C</span>
              <span className="panel-feels">Feels like {data.current?.feelsLike}°C</span>
            </div>
            <p className="panel-description">{data.current?.description}</p>
          </div>
          
          {/* Weather Details Grid */}
          <div className="panel-grid">
            <div className="panel-stat">
              <Droplets size={16} />
              <span>Humidity</span>
              <strong>{data.current?.humidity}%</strong>
            </div>
            <div className="panel-stat">
              <Wind size={16} />
              <span>Wind</span>
              <strong>{data.wind?.speed} km/h</strong>
            </div>
            <div className="panel-stat">
              <Eye size={16} />
              <span>Visibility</span>
              <strong>{data.current?.visibility} km</strong>
            </div>
            <div className="panel-stat">
              <Thermometer size={16} />
              <span>Pressure</span>
              <strong>{data.current?.pressure} hPa</strong>
            </div>
          </div>
          
          {/* AQI */}
          {data.aqi && (
            <div className="panel-section">
              <h4>Air Quality</h4>
              <div className="panel-aqi" style={{ borderColor: data.aqi.color }}>
                <span className="panel-aqi-value" style={{ color: data.aqi.color }}>{data.aqi.value}</span>
                <span className="panel-aqi-level">{data.aqi.level}</span>
              </div>
              <div className="panel-pollutants">
                <span>PM2.5: {data.aqi.pm25}</span>
                <span>PM10: {data.aqi.pm10}</span>
                <span>O₃: {data.aqi.o3}</span>
              </div>
            </div>
          )}
          
          {/* Sun Times */}
          {data.sun && (
            <div className="panel-section">
              <div className="panel-sun">
                <div className="panel-sun-item">
                  <Sunrise size={18} />
                  <span>{data.sun.sunrise}</span>
                </div>
                <div className="panel-sun-item">
                  <Sunset size={18} />
                  <span>{data.sun.sunset}</span>
                </div>
              </div>
            </div>
          )}
          
          {/* 5-Day Forecast */}
          {data.forecast && data.forecast.length > 0 && (
            <div className="panel-section">
              <h4>5-Day Forecast</h4>
              <div className="panel-forecast">
                {data.forecast.map((day, idx) => (
                  <div key={idx} className="panel-forecast-day">
                    <span className="forecast-day-name">{day.day}</span>
                    <span className="forecast-icon">{day.icon}</span>
                    <span className="forecast-temps">
                      <strong>{day.highTemp}°</strong> / {day.lowTemp}°
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Coordinates */}
          <div className="panel-coords">
            <Navigation size={14} />
            <span>{data.location?.lat?.toFixed(4)}, {data.location?.lon?.toFixed(4)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WeatherMapsPage({ weatherData, socket }) {
  const [activeLayer, setActiveLayer] = useState('temp_new');
  const [mapStyle, setMapStyle] = useState('dark');
  const [showWeatherLayer, setShowWeatherLayer] = useState(true);
  const [clickedMarker, setClickedMarker] = useState(null);
  const [panelData, setPanelData] = useState(null);
  const [panelLoading, setPanelLoading] = useState(false);
  const [panelError, setPanelError] = useState(null);
  const mapRef = useRef(null);
  
  const location = weatherData?.location || { city: 'Mumbai', lat: 19.076, lon: 72.8777 };
  const center = [location.lat, location.lon];
  
  // Handle map click - fetch weather for clicked coordinates
  const handleMapClick = (lat, lng) => {
    if (!socket) {
      setPanelError('Socket not connected');
      return;
    }
    
    setClickedMarker([lat, lng]);
    setPanelLoading(true);
    setPanelError(null);
    setPanelData(null);
    
    socket.emit('getWeatherByCoords', { lat, lon: lng });
  };
  
  // Listen for weather data response
  useEffect(() => {
    if (!socket) return;
    
    const handleCoordsWeather = (response) => {
      setPanelLoading(false);
      if (response.success) {
        setPanelData(response.data);
      } else {
        setPanelError(response.error || 'Failed to fetch weather data');
      }
    };
    
    socket.on('coordsWeatherData', handleCoordsWeather);
    
    return () => {
      socket.off('coordsWeatherData', handleCoordsWeather);
    };
  }, [socket]);
  
  const closePanel = () => {
    setPanelData(null);
    setPanelLoading(false);
    setPanelError(null);
    setClickedMarker(null);
  };
  
  // OpenWeatherMap API key - uses the same one from backend or a demo key
  const OWM_API_KEY = import.meta.env.OPENWEATHER_API_KEY || 'demo';
  
  const getWeatherTileUrl = (layer) => {
    return `https://tile.openweathermap.org/map/${layer}/{z}/{x}/{y}.png?appid=${OWM_API_KEY}`;
  };
  
  const currentMapStyle = mapStyles.find(s => s.id === mapStyle);
  const currentLayer = mapLayers.find(l => l.id === activeLayer);
  
  const handleLocate = () => {
    if (mapRef.current) {
      mapRef.current.setView(center, 10, { animate: true });
    }
  };
  
  return (
    <div className="page-content">
      <header className="page-header">
        <Map className="page-header-icon" style={{ color: '#3b82f6' }} />
        <div>
          <h1 className="page-title">Weather Maps</h1>
          <p className="page-subtitle">Interactive weather visualization for {location.city}</p>
        </div>
      </header>
      
      {/* Map Style Selector */}
      <div className="map-type-selector">
        {mapStyles.map(style => (
          <button
            key={style.id}
            className={`map-type-btn ${mapStyle === style.id ? 'active' : ''}`}
            onClick={() => setMapStyle(style.id)}
          >
            <span className="map-type-label">{style.label}</span>
            <span className="map-type-desc">Base map style</span>
          </button>
        ))}
      </div>
      
      {/* Weather Layer Selector */}
      <div className="card mt-6">
        <div className="card-header">
          <Layers className="card-icon" />
          <h3>Weather Layers</h3>
          <label className="layer-toggle">
            <input
              type="checkbox"
              checked={showWeatherLayer}
              onChange={(e) => setShowWeatherLayer(e.target.checked)}
            />
            <span>Show Layer</span>
          </label>
        </div>
        <div className="layer-selector">
          {mapLayers.map(layer => {
            const Icon = layer.icon;
            return (
              <button
                key={layer.id}
                className={`layer-btn ${activeLayer === layer.id ? 'active' : ''}`}
                onClick={() => setActiveLayer(layer.id)}
                style={{ '--layer-color': layer.color }}
              >
                <Icon className="layer-icon" style={{ color: layer.color }} />
                <span>{layer.label}</span>
              </button>
            );
          })}
        </div>
        {currentLayer && (
          <p className="layer-description">{currentLayer.description}</p>
        )}
      </div>
      
      {/* Interactive Leaflet Map */}
      <div className="card mt-6 map-container-card">
        <div className="leaflet-map-wrapper">
          <MapContainer
            center={center}
            zoom={8}
            className="leaflet-map"
            ref={mapRef}
            zoomControl={false}
          >
            {/* Base Map Layer */}
            <TileLayer
              url={currentMapStyle.url}
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            />
            
            {/* Weather Overlay Layer */}
            {showWeatherLayer && (
              <TileLayer
                url={getWeatherTileUrl(activeLayer)}
                opacity={0.7}
                attribution='&copy; <a href="https://openweathermap.org/">OpenWeatherMap</a>'
              />
            )}
            
            {/* Location Marker */}
            <Marker position={center} icon={createCustomIcon('#3b82f6')}>
              <Popup>
                <div className="map-popup">
                  <h4>{location.city}</h4>
                  {weatherData?.current && (
                    <>
                      <p><strong>{weatherData.current.temperature}°C</strong></p>
                      <p>{weatherData.current.description}</p>
                    </>
                  )}
                </div>
              </Popup>
            </Marker>
            
            {/* Clicked Location Marker */}
            {clickedMarker && (
              <Marker position={clickedMarker} icon={createCustomIcon('#ef4444')}>
                <Popup>
                  <div className="map-popup">
                    <h4>{panelData?.location?.city || 'Selected Location'}</h4>
                    <p>{clickedMarker[0].toFixed(4)}, {clickedMarker[1].toFixed(4)}</p>
                  </div>
                </Popup>
              </Marker>
            )}
            
            {/* Map Controller for programmatic updates */}
            <MapController center={center} />
            
            {/* Custom Controls */}
            <CustomControls onLocate={handleLocate} />
            
            {/* Map Click Handler */}
            <MapClickHandler onMapClick={handleMapClick} />
          </MapContainer>
          
          {/* Weather Panel Sidebar */}
          <WeatherPanel 
            data={panelData} 
            loading={panelLoading} 
            error={panelError} 
            onClose={closePanel} 
          />
          
          {/* Map Legend */}
          <div className="leaflet-legend">
            <div className="legend-header">
              {currentLayer && <currentLayer.icon size={16} style={{ color: currentLayer.color }} />}
              <span>{currentLayer?.label}</span>
            </div>
            <div className="legend-scale">
              <span>Low</span>
              <div 
                className="legend-gradient"
                style={{ 
                  background: `linear-gradient(to right, transparent, ${currentLayer?.color || '#3b82f6'})` 
                }}
              />
              <span>High</span>
            </div>
          </div>
          
          {/* Coordinates Display */}
          <div className="leaflet-coords">
            <Navigation size={14} />
            <span>{location.lat.toFixed(4)}, {location.lon.toFixed(4)}</span>
          </div>
        </div>
      </div>
      
      {/* Regional Overview */}
      <div className="grid-3 mt-6">
        <div className="card regional-card">
          <h4>Northern Region</h4>
          <div className="regional-weather">
            <span className="regional-icon">⛅</span>
            <span className="regional-temp">28°C</span>
            <span className="regional-condition">Partly Cloudy</span>
          </div>
        </div>
        <div className="card regional-card">
          <h4>Central Region</h4>
          <div className="regional-weather">
            <span className="regional-icon">☀️</span>
            <span className="regional-temp">32°C</span>
            <span className="regional-condition">Sunny</span>
          </div>
        </div>
        <div className="card regional-card">
          <h4>Southern Region</h4>
          <div className="regional-weather">
            <span className="regional-icon">🌧️</span>
            <span className="regional-temp">26°C</span>
            <span className="regional-condition">Light Rain</span>
          </div>
        </div>
      </div>
      
      {/* Weather Radar Info */}
      <div className="card mt-6">
        <div className="card-header">
          <Eye className="card-icon" />
          <h3>Understanding Weather Maps</h3>
        </div>
        <div className="map-info-grid">
          <div className="map-info-item">
            <Cloud className="map-info-icon" />
            <div>
              <h4>Cloud Cover</h4>
              <p>Shows cloud density and distribution. Darker areas indicate heavier cloud cover.</p>
            </div>
          </div>
          <div className="map-info-item">
            <CloudRain className="map-info-icon" />
            <div>
              <h4>Precipitation</h4>
              <p>Displays rain, snow, and other precipitation. Blue indicates rain, white indicates snow.</p>
            </div>
          </div>
          <div className="map-info-item">
            <Wind className="map-info-icon" />
            <div>
              <h4>Wind Speed</h4>
              <p>Shows wind intensity across regions. Brighter colors indicate stronger winds.</p>
            </div>
          </div>
          <div className="map-info-item">
            <Thermometer className="map-info-icon" />
            <div>
              <h4>Temperature</h4>
              <p>Heat map showing temperature distribution. Red = hot, blue = cold.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
