import { useState, useEffect } from 'react';
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
  Grid
} from 'lucide-react';
import { Link } from 'react-router-dom';

const mapLayers = [
  { id: 'temperature', name: 'Temperature', icon: Thermometer, color: '#ef4444' },
  { id: 'rainfall', name: 'Rainfall', icon: CloudRain, color: '#3b82f6' },
  { id: 'wind', name: 'Wind Speed', icon: Wind, color: '#22c55e' },
  { id: 'humidity', name: 'Humidity', icon: CloudRain, color: '#8b5cf6' },
  { id: 'pressure', name: 'Pressure', icon: Layers, color: '#f97316' },
  { id: 'satellite', name: 'Satellite Imagery', icon: Globe, color: '#06b6d4' },
];

const dataSources = [
  { id: 'imd', name: 'IMD Observations', stations: 550, lastUpdate: '15 min ago' },
  { id: 'aws', name: 'AWS Network', stations: 1200, lastUpdate: '5 min ago' },
  { id: 'radar', name: 'Doppler Radar', stations: 37, lastUpdate: '10 min ago' },
  { id: 'satellite', name: 'INSAT-3D/3DR', coverage: 'All India', lastUpdate: '30 min ago' },
];

const regions = [
  { id: 'india', name: 'All India', bounds: [8, 68, 37, 98] },
  { id: 'north', name: 'North India', bounds: [25, 70, 37, 90] },
  { id: 'south', name: 'South India', bounds: [8, 72, 20, 85] },
  { id: 'east', name: 'East India', bounds: [18, 82, 28, 98] },
  { id: 'west', name: 'West India', bounds: [15, 68, 28, 78] },
  { id: 'central', name: 'Central India', bounds: [18, 74, 27, 85] },
];

const generateGeoData = (layer, region) => {
  const getRandomValue = (layer) => {
    switch (layer) {
      case 'temperature': return (Math.random() * 20 + 20).toFixed(1);
      case 'rainfall': return (Math.random() * 100).toFixed(1);
      case 'wind': return (Math.random() * 40 + 5).toFixed(1);
      case 'humidity': return Math.floor(Math.random() * 50 + 40);
      case 'pressure': return (Math.random() * 20 + 1000).toFixed(1);
      default: return Math.floor(Math.random() * 100);
    }
  };

  return {
    layer,
    region,
    gridData: Array(20).fill(null).map((_, i) => ({
      id: i,
      lat: Math.random() * 20 + 10,
      lon: Math.random() * 25 + 70,
      value: getRandomValue(layer),
      station: `Station_${i + 1}`,
    })),
    statistics: {
      min: getRandomValue(layer),
      max: getRandomValue(layer),
      avg: getRandomValue(layer),
      coverage: Math.floor(Math.random() * 20 + 80),
    },
    colorScale: {
      min: layer === 'temperature' ? '#3b82f6' : '#22c55e',
      max: layer === 'temperature' ? '#ef4444' : '#3b82f6',
    },
    timestamp: new Date().toISOString(),
  };
};

export default function GeospatialServicePage() {
  const [selectedLayer, setSelectedLayer] = useState('temperature');
  const [selectedRegion, setSelectedRegion] = useState('india');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(true);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setData(generateGeoData(selectedLayer, selectedRegion));
      setLoading(false);
    }, 800);
  }, [selectedLayer, selectedRegion]);

  const layerInfo = mapLayers.find(l => l.id === selectedLayer);
  const regionInfo = regions.find(r => r.id === selectedRegion);

  const getUnit = (layer) => {
    switch (layer) {
      case 'temperature': return '°C';
      case 'rainfall': return 'mm';
      case 'wind': return 'km/h';
      case 'humidity': return '%';
      case 'pressure': return 'hPa';
      default: return '';
    }
  };

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
            <p className="page-subtitle">GIS-based weather visualization and analysis</p>
          </div>
        </header>

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
          <button className="control-btn" onClick={() => setZoom(Math.min(zoom + 0.2, 2))}>
            <ZoomIn size={18} />
          </button>
          <button className="control-btn" onClick={() => setZoom(Math.max(zoom - 0.2, 0.5))}>
            <ZoomOut size={18} />
          </button>
          <button className="control-btn" onClick={() => setZoom(1)}>
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
            <RefreshCw size={32} className="spinning" />
            <p>Loading {layerInfo?.name} data for {regionInfo?.name}...</p>
          </div>
        ) : (
          <>
            {/* Map Display */}
            <div className="card geospatial-map">
              <div className="map-header">
                <h3>
                  <layerInfo.icon size={20} style={{ color: layerInfo.color }} />
                  {layerInfo.name} - {regionInfo.name}
                </h3>
                <span className="map-timestamp">
                  <Clock size={14} />
                  {new Date(data.timestamp).toLocaleTimeString()}
                </span>
              </div>
              
              <div className="map-container" style={{ transform: `scale(${zoom})` }}>
                <div className="map-placeholder geo-map">
                  <Map size={80} style={{ color: 'rgba(255,255,255,0.2)' }} />
                  <h4>{layerInfo.name} Distribution</h4>
                  <p>{regionInfo.name} Region</p>
                  
                  {/* Simulated data points */}
                  {showGrid && data.gridData.slice(0, 10).map((point, idx) => (
                    <div 
                      key={idx}
                      className="data-point"
                      style={{
                        left: `${20 + (idx % 5) * 15}%`,
                        top: `${20 + Math.floor(idx / 5) * 30}%`,
                        background: layerInfo.color,
                      }}
                      title={`${point.station}: ${point.value}${getUnit(selectedLayer)}`}
                    >
                      <span>{point.value}</span>
                    </div>
                  ))}
                </div>
                
                {/* Color Scale */}
                <div className="color-scale">
                  <span className="scale-label">Low</span>
                  <div 
                    className="scale-gradient"
                    style={{ 
                      background: `linear-gradient(to right, ${data.colorScale.min}, ${data.colorScale.max})` 
                    }}
                  />
                  <span className="scale-label">High</span>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="grid-4 geo-stats">
              <div className="card stat-card">
                <span className="stat-label">Minimum</span>
                <span className="stat-value" style={{ color: '#3b82f6' }}>
                  {data.statistics.min}{getUnit(selectedLayer)}
                </span>
              </div>
              <div className="card stat-card">
                <span className="stat-label">Maximum</span>
                <span className="stat-value" style={{ color: '#ef4444' }}>
                  {data.statistics.max}{getUnit(selectedLayer)}
                </span>
              </div>
              <div className="card stat-card">
                <span className="stat-label">Average</span>
                <span className="stat-value" style={{ color: '#22c55e' }}>
                  {data.statistics.avg}{getUnit(selectedLayer)}
                </span>
              </div>
              <div className="card stat-card">
                <span className="stat-label">Coverage</span>
                <span className="stat-value" style={{ color: '#8b5cf6' }}>
                  {data.statistics.coverage}%
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
                Station-wise Data
              </h3>
              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Station</th>
                      <th>Latitude</th>
                      <th>Longitude</th>
                      <th>{layerInfo.name} ({getUnit(selectedLayer)})</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.gridData.slice(0, 10).map((point, idx) => (
                      <tr key={idx}>
                        <td>{point.station}</td>
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
                <button className="action-btn">
                  <Download size={18} />
                  Download GeoJSON
                </button>
                <button className="action-btn">
                  <Download size={18} />
                  Download CSV
                </button>
                <button className="action-btn">
                  <Eye size={18} />
                  View Full Screen
                </button>
                <button className="action-btn">
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
              setData(generateGeoData(selectedLayer, selectedRegion));
              setLoading(false);
            }, 500);
          }}>
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
