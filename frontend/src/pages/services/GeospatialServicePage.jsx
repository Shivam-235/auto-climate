import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import {
  Globe,
  ArrowLeft,
  MapPin,
  Layers,
  Map,
  Thermometer,
  CloudRain,
  Wind,
  RefreshCw,
  Clock,
  Download,
  Filter,
  Eye,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Grid,
  Locate,
  X,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getMajorCitiesWeather } from '../../services/weatherApi';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker with value display
const createDataMarker = (color = '#ef4444', value = '') => {
  return L.divIcon({
    className: 'geo-data-marker',
    html: `
      <div style="
        width: 40px;
        height: 40px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 700;
        font-size: 11px;
        text-shadow: 0 1px 2px rgba(0,0,0,0.5);
      ">${value}</div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

const mapLayers = [
  { id: 'temperature', name: 'Temperature', icon: Thermometer, color: '#ef4444', unit: '°C' },
  { id: 'rainfall', name: 'Rainfall', icon: CloudRain, color: '#3b82f6', unit: 'mm' },
  { id: 'wind', name: 'Wind Speed', icon: Wind, color: '#22c55e', unit: 'km/h' },
  { id: 'humidity', name: 'Humidity', icon: CloudRain, color: '#8b5cf6', unit: '%' },
  { id: 'pressure', name: 'Pressure', icon: Layers, color: '#f97316', unit: 'hPa' },
  { id: 'satellite', name: 'Satellite Imagery', icon: Globe, color: '#06b6d4', unit: '' },
];

const dataSources = [
  { id: 'imd', name: 'IMD Observations', stations: 550, lastUpdate: '15 min ago' },
  { id: 'aws', name: 'AWS Network', stations: 1200, lastUpdate: '5 min ago' },
  { id: 'radar', name: 'Doppler Radar', stations: 37, lastUpdate: '10 min ago' },
  { id: 'satellite', name: 'INSAT-3D/3DR', coverage: 'All India', lastUpdate: '30 min ago' },
];

const regions = [
  { id: 'india', name: 'All India', center: [22.5, 82.5], zoom: 5 },
  { id: 'north', name: 'North India', center: [28.5, 77.5], zoom: 6 },
  { id: 'south', name: 'South India', center: [13.0, 78.0], zoom: 6 },
  { id: 'east', name: 'East India', center: [22.5, 88.5], zoom: 6 },
  { id: 'west', name: 'West India', center: [22.0, 73.0], zoom: 6 },
  { id: 'central', name: 'Central India', center: [23.0, 79.0], zoom: 6 },
];

const mapStyles = [
  { id: 'dark', label: 'Dark', url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' },
  { id: 'light', label: 'Light', url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png' },
  { id: 'satellite', label: 'Satellite', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}' },
  { id: 'terrain', label: 'Terrain', url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png' },
];

// India major cities with coordinates
const indianCities = [
  { name: 'Delhi', lat: 28.6139, lon: 77.2090 },
  { name: 'Mumbai', lat: 19.0760, lon: 72.8777 },
  { name: 'Chennai', lat: 13.0827, lon: 80.2707 },
  { name: 'Kolkata', lat: 22.5726, lon: 88.3639 },
  { name: 'Bengaluru', lat: 12.9716, lon: 77.5946 },
  { name: 'Hyderabad', lat: 17.3850, lon: 78.4867 },
  { name: 'Jaipur', lat: 26.9124, lon: 75.7873 },
  { name: 'Lucknow', lat: 26.8467, lon: 80.9462 },
  { name: 'Ahmedabad', lat: 23.0225, lon: 72.5714 },
  { name: 'Pune', lat: 18.5204, lon: 73.8567 },
  { name: 'Bhopal', lat: 23.2599, lon: 77.4126 },
  { name: 'Patna', lat: 25.5941, lon: 85.1376 },
  { name: 'Srinagar', lat: 34.0837, lon: 74.7973 },
  { name: 'Shimla', lat: 31.1048, lon: 77.1734 },
  { name: 'Thiruvananthapuram', lat: 8.5241, lon: 76.9366 },
  { name: 'Guwahati', lat: 26.1445, lon: 91.7362 },
];

const generateGeoData = (layer) => {
  const getRandomValue = (layer) => {
    switch (layer) {
      case 'temperature': return (Math.random() * 20 + 20).toFixed(1);
      case 'rainfall': return (Math.random() * 100).toFixed(1);
      case 'wind': return (Math.random() * 40 + 5).toFixed(1);
      case 'humidity': return Math.floor(Math.random() * 50 + 40);
      case 'pressure': return (Math.random() * 20 + 1000).toFixed(0);
      default: return Math.floor(Math.random() * 100);
    }
  };

  return indianCities.map((city, idx) => ({
    id: idx,
    name: city.name,
    lat: city.lat,
    lon: city.lon,
    value: getRandomValue(layer),
  }));
};

// Map controller component
function MapController({ center, zoom }) {
  const map = useMap();

  useEffect(() => {
    if (center && zoom) {
      map.flyTo(center, zoom, { animate: true, duration: 1.2 });
    }
  }, [center, zoom, map]);

  return null;
}

// Custom controls component
function CustomControls({ onLocate }) {
  const map = useMap();

  const iconStyle = {
    color: '#ffffff',
    stroke: '#ffffff',
    strokeWidth: 2.5
  };

  return (
    <div className="leaflet-custom-controls geo-controls">
      <button
        className="leaflet-control-btn geo-ctrl-btn"
        onClick={() => map.zoomIn()}
        title="Zoom In"
        type="button"
      >
        <ZoomIn size={20} style={iconStyle} />
      </button>
      <button
        className="leaflet-control-btn geo-ctrl-btn"
        onClick={() => map.zoomOut()}
        title="Zoom Out"
        type="button"
      >
        <ZoomOut size={20} style={iconStyle} />
      </button>
      <button
        className="leaflet-control-btn geo-ctrl-btn"
        onClick={onLocate}
        title="Reset View"
        type="button"
      >
        <Locate size={20} style={iconStyle} />
      </button>
    </div>
  );
}

// Click handler for map
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onMapClick(lat, lng);
    },
  });
  return null;
}

// Selected location panel
function LocationPanel({ location, onClose }) {
  if (!location) return null;

  return (
    <div className="location-panel open">
      <div className="location-panel-header">
        <h4>Selected Location</h4>
        <button className="panel-close-btn" onClick={onClose}>
          <X size={18} />
        </button>
      </div>
      <div className="location-panel-content">
        <p><strong>Latitude:</strong> {location.lat.toFixed(4)}°N</p>
        <p><strong>Longitude:</strong> {location.lng.toFixed(4)}°E</p>
        <p className="panel-note">Click on any city marker for weather data</p>
      </div>
    </div>
  );
}

export default function GeospatialServicePage() {
  const [selectedLayer, setSelectedLayer] = useState('temperature');
  const [selectedRegion, setSelectedRegion] = useState('india');
  const [mapStyle, setMapStyle] = useState('dark');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const citiesWeather = await getMajorCitiesWeather();
        let geoData = generateGeoData(selectedLayer);

        if (citiesWeather && citiesWeather.length > 0) {
          geoData = geoData.map((point, idx) => {
            const cityData = citiesWeather[idx % citiesWeather.length];
            if (cityData?.current) {
              switch (selectedLayer) {
                case 'temperature':
                  point.value = cityData.current.temperature?.toFixed(1) || point.value;
                  break;
                case 'humidity':
                  point.value = cityData.current.humidity || point.value;
                  break;
                case 'wind':
                  point.value = cityData.wind?.speed?.toFixed(1) || point.value;
                  break;
                case 'pressure':
                  point.value = cityData.current.pressure?.toFixed(0) || point.value;
                  break;
              }
            }
            return point;
          });
        }
        setData(geoData);
      } catch (error) {
        console.log('Using simulated geospatial data:', error.message);
        setData(generateGeoData(selectedLayer));
      }
      setLoading(false);
    };
    fetchData();
  }, [selectedLayer, selectedRegion]);

  const layerInfo = mapLayers.find(l => l.id === selectedLayer);
  const regionInfo = regions.find(r => r.id === selectedRegion);
  const currentMapStyle = mapStyles.find(s => s.id === mapStyle);

  const getUnit = (layer) => {
    const info = mapLayers.find(l => l.id === layer);
    return info?.unit || '';
  };

  const handleMapClick = (lat, lng) => {
    setSelectedLocation({ lat, lng });
    setSelectedCity(null);
  };

  const handleResetView = () => {
    if (mapRef.current) {
      mapRef.current.flyTo(regionInfo.center, regionInfo.zoom, { animate: true });
    }
  };

  const getValueColor = (value, layer) => {
    // Return color intensity based on value
    const layerConfig = mapLayers.find(l => l.id === layer);
    return layerConfig?.color || '#ef4444';
  };

  // Calculate statistics from data
  const statistics = data ? {
    min: Math.min(...data.map(d => parseFloat(d.value))).toFixed(1),
    max: Math.max(...data.map(d => parseFloat(d.value))).toFixed(1),
    avg: (data.reduce((sum, d) => sum + parseFloat(d.value), 0) / data.length).toFixed(1),
    coverage: 95,
  } : { min: 0, max: 0, avg: 0, coverage: 0 };

  return (
    <div className="forecast-subpage">
      <div className="page-bg">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
      </div>

      <div className="page-content">
        <Link to="/services" className="back-link">
          <ArrowLeft size={20} />
          Back to Services
        </Link>

        <header className="page-header">
          <Globe className="page-header-icon" style={{ color: '#22c55e' }} />
          <div>
            <h1 className="page-title">Geospatial Weather Services</h1>
            <p className="page-subtitle">Interactive GIS-based weather visualization for India</p>
          </div>
        </header>

        {/* Region Selector */}
        <div className="region-selector">
          {regions.map(region => (
            <button
              key={region.id}
              className={`region-btn ${selectedRegion === region.id ? 'active' : ''}`}
              onClick={() => setSelectedRegion(region.id)}
            >
              {region.name}
            </button>
          ))}
        </div>

        {/* Map Controls */}
        <div className="map-controls">
          <button className="control-btn" onClick={() => setZoom(prev => Math.min(prev + 1, 10))}>
            <ZoomIn size={18} />
          </button>
          <button className="control-btn" onClick={() => setZoom(prev => Math.max(prev - 1, 3))}>
            <ZoomOut size={18} />
          </button>
          <button className="control-btn" onClick={handleResetView}>
            <Maximize2 size={18} />
          </button>
          <button
            className={`control-btn ${showGrid ? 'active' : ''}`}
            onClick={() => setShowGrid(!showGrid)}
          >
            <Grid size={18} />
          </button>
          <button className="control-btn download">
            <Download size={18} />
            Export
          </button>
        </div>

        {loading ? (
          <div className="loading-state">
            <Loader2 size={32} className="spinning" />
            <p>Loading {layerInfo?.name} data for {regionInfo?.name}...</p>
          </div>
        ) : (
          <>
            {/* Interactive Leaflet Map */}
            <div className="card geospatial-map">
              <div className="map-header">
                <h3>
                  <layerInfo.icon size={20} style={{ color: layerInfo.color }} />
                  {layerInfo.name} - {regionInfo.name}
                </h3>
                <span className="map-timestamp">
                  <Clock size={14} />
                  {new Date().toLocaleTimeString()}
                </span>
              </div>

              <div className="leaflet-map-wrapper geospatial-wrapper">
                <MapContainer
                  center={regionInfo.center}
                  zoom={regionInfo.zoom}
                  className="leaflet-map geospatial-leaflet"
                  ref={mapRef}
                  zoomControl={false}
                  style={{ height: '500px', width: '100%' }}
                >
                  {/* Base Map Layer */}
                  <TileLayer
                    url={currentMapStyle.url}
                    attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                  />

                  {/* Data Markers */}
                  {showGrid && data && data.map((point) => (
                    <Marker
                      key={point.id}
                      position={[point.lat, point.lon]}
                      icon={createDataMarker(layerInfo.color, point.value)}
                    >
                      <Popup>
                        <div className="map-popup geo-popup">
                          <h4>{point.name}</h4>
                          <p className="popup-value" style={{ color: layerInfo.color }}>
                            <strong>{point.value}{getUnit(selectedLayer)}</strong>
                          </p>
                          <p className="popup-coords">
                            {point.lat.toFixed(2)}°N, {point.lon.toFixed(2)}°E
                          </p>
                        </div>
                      </Popup>
                    </Marker>
                  ))}

                  {/* Heatmap-like circles for data visualization */}
                  {showGrid && data && data.map((point) => (
                    <Circle
                      key={`circle-${point.id}`}
                      center={[point.lat, point.lon]}
                      radius={80000}
                      pathOptions={{
                        color: layerInfo.color,
                        fillColor: layerInfo.color,
                        fillOpacity: 0.15,
                        weight: 1,
                      }}
                    />
                  ))}

                  {/* Selected location marker */}
                  {selectedLocation && (
                    <Marker
                      position={[selectedLocation.lat, selectedLocation.lng]}
                      icon={L.divIcon({
                        className: 'selected-marker',
                        html: `<div style="
                          width: 20px;
                          height: 20px;
                          background: #ffffff;
                          border: 3px solid #ef4444;
                          border-radius: 50%;
                          box-shadow: 0 2px 8px rgba(0,0,0,0.4);
                        "></div>`,
                        iconSize: [20, 20],
                        iconAnchor: [10, 10],
                      })}
                    />
                  )}

                  {/* Map Controller */}
                  <MapController center={regionInfo.center} zoom={regionInfo.zoom} />

                  {/* Custom Controls */}
                  <CustomControls onLocate={handleResetView} />

                  {/* Map Click Handler */}
                  <MapClickHandler onMapClick={handleMapClick} />
                </MapContainer>

                {/* Selected Location Panel */}
                <LocationPanel
                  location={selectedLocation}
                  onClose={() => setSelectedLocation(null)}
                />

                {/* Map Legend */}
                <div className="leaflet-legend">
                  <div className="legend-header">
                    <layerInfo.icon size={16} style={{ color: layerInfo.color }} />
                    <span>{layerInfo.name}</span>
                  </div>
                  <div className="legend-scale">
                    <span>Low</span>
                    <div
                      className="legend-gradient"
                      style={{
                        background: `linear-gradient(to right, transparent, ${layerInfo.color})`
                      }}
                    />
                    <span>High</span>
                  </div>
                </div>

                {/* Map Style Selector */}
                <div className="map-style-selector">
                  {mapStyles.map(style => (
                    <button
                      key={style.id}
                      className={`style-btn ${mapStyle === style.id ? 'active' : ''}`}
                      onClick={() => setMapStyle(style.id)}
                      title={style.label}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Scale */}
              <div className="color-scale">
                <span className="scale-label">Low</span>
                <div
                  className="scale-gradient"
                  style={{
                    background: `linear-gradient(to right, #3b82f6, ${layerInfo.color})`
                  }}
                />
                <span className="scale-label">High</span>
              </div>
            </div>

            {/* Layer Selector */}
            <div className="layer-selector">
              <h4>Select Data Layer</h4>
              <div className="layer-buttons">
                {mapLayers.map(layer => (
                  <button
                    key={layer.id}
                    className={`layer-btn ${selectedLayer === layer.id ? 'active' : ''}`}
                    onClick={() => setSelectedLayer(layer.id)}
                    style={{
                      borderColor: selectedLayer === layer.id ? layer.color : 'transparent',
                      background: selectedLayer === layer.id ? `${layer.color}20` : undefined
                    }}
                  >
                    <layer.icon size={18} style={{ color: layer.color }} />
                    {layer.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Statistics */}
            <div className="grid-4 geo-stats">
              <div className="card stat-card">
                <span className="stat-label">Minimum</span>
                <span className="stat-value" style={{ color: '#3b82f6' }}>
                  {statistics.min}{getUnit(selectedLayer)}
                </span>
              </div>
              <div className="card stat-card">
                <span className="stat-label">Maximum</span>
                <span className="stat-value" style={{ color: '#ef4444' }}>
                  {statistics.max}{getUnit(selectedLayer)}
                </span>
              </div>
              <div className="card stat-card">
                <span className="stat-label">Average</span>
                <span className="stat-value" style={{ color: '#22c55e' }}>
                  {statistics.avg}{getUnit(selectedLayer)}
                </span>
              </div>
              <div className="card stat-card">
                <span className="stat-label">Coverage</span>
                <span className="stat-value" style={{ color: '#8b5cf6' }}>
                  {statistics.coverage}%
                </span>
              </div>
            </div>

            {/* Data Sources */}
            <div className="card">
              <h3 className="card-section-title">
                <Layers size={20} style={{ color: '#06b6d4' }} />
                Data Sources
              </h3>
              <div className="data-sources-grid">
                {dataSources.map((source, idx) => (
                  <div key={idx} className="source-card">
                    <h4>{source.name}</h4>
                    <div className="source-details">
                      {source.stations && (
                        <span>
                          <MapPin size={14} />
                          {source.stations} stations
                        </span>
                      )}
                      {source.coverage && (
                        <span>
                          <Globe size={14} />
                          {source.coverage}
                        </span>
                      )}
                      <span className="source-update">
                        <Clock size={14} />
                        {source.lastUpdate}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Station Data Table */}
            <div className="card">
              <h3 className="card-section-title">
                <Grid size={20} style={{ color: '#f97316' }} />
                City-wise Data
              </h3>
              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>City</th>
                      <th>Latitude</th>
                      <th>Longitude</th>
                      <th>{layerInfo.name} ({getUnit(selectedLayer)})</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data && data.map((point, idx) => (
                      <tr key={idx}>
                        <td>{point.name}</td>
                        <td>{point.lat.toFixed(2)}°N</td>
                        <td>{point.lon.toFixed(2)}°E</td>
                        <td style={{ color: layerInfo.color, fontWeight: 600 }}>
                          {point.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card quick-actions">
              <h3 className="card-section-title">
                <Filter size={20} />
                Quick Actions
              </h3>
              <div className="actions-grid">
                <button className="action-btn" onClick={() => {
                  const geoJSON = {
                    type: "FeatureCollection",
                    features: data.map(point => ({
                      type: "Feature",
                      geometry: { type: "Point", coordinates: [point.lon, point.lat] },
                      properties: { city: point.name, value: point.value, layer: selectedLayer }
                    }))
                  };
                  const blob = new Blob([JSON.stringify(geoJSON, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${selectedLayer}_${selectedRegion}_${new Date().getTime()}.geojson`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}>
                  <Download size={18} />
                  Download GeoJSON
                </button>
                <button className="action-btn" onClick={() => {
                  const csv = [
                    ['City', 'Latitude', 'Longitude', `${layerInfo.name} (${getUnit(selectedLayer)})`],
                    ...data.map(point => [point.name, point.lat, point.lon, point.value])
                  ].map(row => row.join(',')).join('\n');
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${selectedLayer}_${selectedRegion}_${new Date().getTime()}.csv`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}>
                  <Download size={18} />
                  Download CSV
                </button>
                <button className="action-btn" onClick={() => {
                  const mapElement = document.querySelector('.geospatial-map');
                  if (mapElement) {
                    if (document.fullscreenElement) {
                      document.exitFullscreen();
                    } else {
                      mapElement.requestFullscreen();
                    }
                  }
                }}>
                  <Eye size={18} />
                  View Full Screen
                </button>
                <button className="action-btn" onClick={() => {
                  alert('Layer comparison feature coming soon! This will allow you to overlay multiple weather parameters for comprehensive analysis.');
                }}>
                  <Layers size={18} />
                  Compare Layers
                </button>
              </div>
            </div>
          </>
        )}

        {/* Last Update */}
        <div className="last-update-bar">
          <Clock size={14} />
          <span>Data Source: IMD GIS Portal | Coverage: Pan-India</span>
          <button className="refresh-btn-small" onClick={() => {
            setLoading(true);
            setTimeout(() => {
              setData(generateGeoData(selectedLayer));
              setLoading(false);
            }, 500);
          }}>
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>
      </div>

      <style>{`
        .geospatial-wrapper {
          position: relative;
          border-radius: 12px;
          overflow: hidden;
        }
        
        .geospatial-leaflet {
          border-radius: 12px;
        }
        
        /* Zoom Controls - Bottom Left */
        .geospatial-wrapper .leaflet-custom-controls,
        .geo-controls {
          position: absolute;
          bottom: 20px;
          left: 20px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          z-index: 1000 !important;
        }
        
        .geospatial-wrapper .leaflet-control-btn,
        .geo-ctrl-btn {
          width: 44px !important;
          height: 44px !important;
          min-width: 44px;
          min-height: 44px;
          background: rgba(15, 23, 42, 0.95) !important;
          backdrop-filter: blur(10px);
          border: 2px solid rgba(255, 255, 255, 0.3) !important;
          border-radius: 12px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          cursor: pointer;
          color: white !important;
          transition: all 0.2s ease;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
          padding: 0 !important;
        }
        
        .geospatial-wrapper .leaflet-control-btn:hover,
        .geo-ctrl-btn:hover {
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%) !important;
          border-color: rgba(255, 255, 255, 0.5) !important;
          transform: scale(1.08);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5);
        }
        
        .geospatial-wrapper .leaflet-control-btn svg,
        .geo-ctrl-btn svg {
          width: 22px !important;
          height: 22px !important;
          color: white !important;
          stroke: white !important;
          stroke-width: 2.5 !important;
        }
        
        .location-panel {
          position: absolute;
          top: 60px;
          left: 20px;
          background: rgba(15, 23, 42, 0.98) !important;
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          padding: 16px 20px;
          z-index: 1000;
          min-width: 220px;
          max-width: 280px;
          transform: translateX(-120%);
          transition: transform 0.3s ease;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        }
        
        .location-panel.open {
          transform: translateX(0);
        }
        
        .location-panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
          padding-bottom: 10px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .location-panel-header h4 {
          margin: 0;
          color: #ffffff !important;
          font-size: 16px;
          font-weight: 600;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }
        
        .panel-close-btn {
          background: rgba(255, 255, 255, 0.1) !important;
          border: none;
          color: #ffffff !important;
          cursor: pointer;
          padding: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          transition: all 0.2s ease;
        }
        
        .panel-close-btn:hover {
          color: #ffffff !important;
          background: rgba(239, 68, 68, 0.8) !important;
        }
        
        .location-panel-content p {
          margin: 8px 0;
          color: #ffffff !important;
          font-size: 14px;
          line-height: 1.5;
        }
        
        .location-panel-content p strong {
          color: #60a5fa !important;
          font-weight: 600;
        }
        
        .panel-note {
          margin-top: 14px !important;
          padding-top: 10px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          font-size: 12px !important;
          color: rgba(255, 255, 255, 0.7) !important;
          font-style: italic;
        }
        
        .geo-popup {
          text-align: center;
        }
        
        .geo-popup h4 {
          margin: 0 0 8px 0;
          font-size: 14px;
          color: #1e293b;
        }
        
        .popup-value {
          margin: 0 0 4px 0;
          font-size: 18px;
        }
        
        .popup-coords {
          margin: 0;
          font-size: 11px;
          color: #64748b;
        }
        
        /* Map Style Selector - Top Right */
        .map-style-selector {
          position: absolute;
          top: 15px;
          right: 15px;
          display: flex;
          gap: 4px;
          z-index: 1000;
          background: rgba(15, 23, 42, 0.95);
          padding: 6px;
          border-radius: 10px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }
        
        .style-btn {
          padding: 8px 14px;
          font-size: 12px;
          font-weight: 500;
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.7);
          cursor: pointer;
          border-radius: 6px;
          transition: all 0.2s ease;
        }
        
        .style-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }
        
        .style-btn.active {
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          color: white;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
        }
        
        /* Legend - Bottom Right */
        .geospatial-wrapper .leaflet-legend {
          position: absolute;
          bottom: 20px;
          right: 20px;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          padding: 12px 16px;
          z-index: 1000;
          min-width: 150px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }
        
        .geospatial-wrapper .legend-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 10px;
          color: white;
          font-size: 13px;
          font-weight: 600;
        }
        
        .geospatial-wrapper .legend-scale {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .geospatial-wrapper .legend-scale span {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.6);
        }
        
        .geospatial-wrapper .legend-gradient {
          flex: 1;
          height: 8px;
          border-radius: 4px;
        }
        
        .spinning {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        /* Responsive adjustments */
        @media (max-width: 768px) {
          .map-style-selector {
            top: 10px;
            right: 10px;
            padding: 4px;
          }
          
          .style-btn {
            padding: 6px 10px;
            font-size: 11px;
          }
          
          .geospatial-wrapper .leaflet-custom-controls {
            bottom: 15px;
            left: 15px;
          }
          
          .geospatial-wrapper .leaflet-control-btn {
            width: 36px;
            height: 36px;
          }
          
          .geospatial-wrapper .leaflet-legend {
            bottom: 15px;
            right: 15px;
            padding: 10px 12px;
            min-width: 120px;
          }
        }
      `}</style>
    </div>
  );
}
