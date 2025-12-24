import { Link } from 'react-router-dom';
import {
  CloudRain,
  Cloud,
  Wind,
  Tractor,
  BarChart3,
  Building2,
  Plane,
  AlertTriangle,
  Globe,
  ArrowRight
} from 'lucide-react';

const services = [
  {
    id: 'rainfall',
    title: 'Rainfall Information',
    description: 'Real-time rainfall data, monitoring, and historical precipitation analysis across regions.',
    icon: CloudRain,
    color: 'blue',
    path: '/services/rainfall'
  },
  {
    id: 'monsoon',
    title: 'Monsoon Information',
    description: 'Comprehensive monsoon tracking, onset predictions, and seasonal rainfall patterns.',
    icon: Cloud,
    color: 'yellow',
    path: '/services/monsoon'
  },
  {
    id: 'cyclone',
    title: 'Cyclone Information',
    description: 'Cyclone tracking, intensity forecasts, and early warning systems for coastal regions.',
    icon: Wind,
    color: 'green',
    path: '/services/cyclone'
  },
  {
    id: 'agromet',
    title: 'Agromet Advisory Services',
    description: 'Weather-based agricultural advisories for farmers to optimize crop management.',
    icon: Tractor,
    color: 'blue',
    path: '/services/agromet'
  },
  {
    id: 'climate',
    title: 'Climate Services',
    description: 'Long-term climate data, trends analysis, and climate change projections.',
    icon: BarChart3,
    color: 'yellow',
    path: '/services/climate'
  },
  {
    id: 'urban',
    title: 'Urban Meteorological Services',
    description: 'City-specific weather services including urban heat islands and air quality.',
    icon: Building2,
    color: 'green',
    path: '/services/urban'
  },
  {
    id: 'aviation',
    title: 'Aviation Services',
    description: 'Weather services for aviation including turbulence, visibility, and flight safety.',
    icon: Plane,
    color: 'blue',
    path: '/services/aviation'
  },
  {
    id: 'hazard',
    title: 'Climate Hazard & Vulnerability Atlas',
    description: 'Interactive maps showing climate hazards and vulnerability assessments.',
    icon: AlertTriangle,
    color: 'yellow',
    path: '/services/hazard'
  },
  {
    id: 'geospatial',
    title: 'Geospatial Services',
    description: 'GIS-based weather and climate data visualization and analysis tools.',
    icon: Globe,
    color: 'green',
    path: '/services/geospatial'
  }
];

export default function ServicesPage() {
  return (
    <div className="services-page">
      <div className="page-bg">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />
      </div>

      <div className="page-content">
        <header className="page-header">
          <h1 className="page-title">Our Services</h1>
          <p className="page-subtitle">Comprehensive meteorological and climate services with live data</p>
        </header>

        <main className="services-grid">
          {services.map((service) => (
            <div
              key={service.id}
              className={`service-card service-card-${service.color}`}
            >
              <div className="service-card-icon">
                <service.icon size={32} />
              </div>
              <div className="service-card-content">
                <h3 className="service-card-title">{service.title}</h3>
                <p className="service-card-description">{service.description}</p>
                <Link
                  to={service.path}
                  className="service-card-link"
                >
                  Explore Service <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </main>
      </div>
    </div>
  );
}
