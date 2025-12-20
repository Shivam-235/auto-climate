import { 
  TrendingUp,
  Calendar,
  Sun,
  CloudRain,
  FileText,
  MapPin,
  Palmtree,
  Navigation,
  Users,
  AlertCircle,
  Waves,
  ExternalLink
} from 'lucide-react';

const forecasts = [
  {
    id: 1,
    title: 'Short to Medium Range Model Guidance',
    description: 'Weather predictions for 1-10 days using numerical weather models',
    icon: TrendingUp,
    link: '/forecasts/short-medium-range'
  },
  {
    id: 2,
    title: 'Extended Range Outlook',
    description: 'Weather outlook for 2-4 weeks ahead',
    icon: Calendar,
    link: '/forecasts/extended-range'
  },
  {
    id: 3,
    title: 'Seasonal Forecast',
    description: 'Long-term seasonal weather predictions and trends',
    icon: Sun,
    link: '/forecasts/seasonal'
  },
  {
    id: 4,
    title: 'Quantitative Precipitation Forecast',
    description: 'Detailed precipitation amount predictions',
    icon: CloudRain,
    link: '/forecasts/precipitation'
  },
  {
    id: 5,
    title: 'All India Weather Forecast Bulletin',
    description: 'Comprehensive daily weather bulletin for entire India',
    icon: FileText,
    link: '/forecasts/all-india'
  },
  {
    id: 6,
    title: '7-day Sub-Divisional Rainfall Forecast',
    description: 'Week-long rainfall forecast by meteorological sub-divisions',
    icon: CloudRain,
    link: '/forecasts/7day-rainfall'
  },
  {
    id: 7,
    title: '5-day District-Wise Rainfall Forecast',
    description: 'District-level rainfall predictions for 5 days',
    icon: MapPin,
    link: '/forecasts/5day-district'
  },
  {
    id: 8,
    title: 'Tourism Forecast',
    description: 'Weather forecasts for popular tourist destinations',
    icon: Palmtree,
    link: '/forecasts/tourism'
  },
  {
    id: 9,
    title: 'Interactive Track of Cyclone',
    description: 'Real-time cyclone tracking with interactive maps',
    icon: Navigation,
    link: '/forecasts/cyclone-track'
  },
  {
    id: 10,
    title: 'Public Observation',
    description: 'Crowd-sourced weather observations from citizens',
    icon: Users,
    link: '/forecasts/public-observation'
  },
  {
    id: 11,
    title: 'Latest CAP Alerts',
    description: 'Common Alerting Protocol based weather warnings',
    icon: AlertCircle,
    link: '/forecasts/cap-alerts'
  },
  {
    id: 12,
    title: 'Flash Flood Bulletin',
    description: 'Early warnings and bulletins for flash flood events',
    icon: Waves,
    link: '/forecasts/flash-flood'
  }
];

export default function ForecastsPage() {
  return (
    <div className="forecasts-page">
      <div className="page-bg">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />
      </div>

      <div className="page-content">
        <header className="page-header">
          <h1 className="page-title">Forecasts</h1>
          <p className="page-subtitle">Access various weather forecasts and bulletins</p>
        </header>

        <main className="forecasts-grid">
          {forecasts.map((forecast) => (
            <a 
              key={forecast.id} 
              href={forecast.link}
              className="forecast-link-card"
            >
              <div className="forecast-link-icon">
                <forecast.icon size={20} />
              </div>
              <div className="forecast-link-content">
                <h3 className="forecast-link-title">{forecast.title}</h3>
                <p className="forecast-link-description">{forecast.description}</p>
              </div>
              <ExternalLink size={16} className="forecast-link-arrow" />
            </a>
          ))}
        </main>
      </div>
    </div>
  );
}
