import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Sun, 
  Clock, 
  AlertTriangle, 
  Moon, 
  Map,
  Activity
} from 'lucide-react';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/uv-index', icon: Sun, label: 'UV Index' },
  { path: '/hourly', icon: Clock, label: 'Hourly Forecast' },
  { path: '/alerts', icon: AlertTriangle, label: 'Weather Alerts' },
  { path: '/astronomy', icon: Moon, label: 'Moon & Astronomy' },
  { path: '/maps', icon: Map, label: 'Weather Maps' },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <Activity className="sidebar-logo-icon" />
        </div>
        <span className="sidebar-title">Envizio</span>
      </div>
      
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <item.icon className="sidebar-link-icon" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      
      <div className="sidebar-footer">
        <p>Real-time Weather</p>
        <p className="sidebar-version">v2.0</p>
      </div>
    </aside>
  );
}
