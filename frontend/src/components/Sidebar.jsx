import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Sun,
  Clock,
  AlertTriangle,
  Moon,
  Map,
  Layers,
  TrendingUp,
  Building2,
  User,
  LogOut,
  Monitor
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import EnvizioLogo from './EnvizioLogo';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/services', icon: Layers, label: 'Our Services' },
  { path: '/forecasts', icon: TrendingUp, label: 'Forecasts' },
  { path: '/major-cities', icon: Building2, label: 'Major Cities' },
  { path: '/uv-index', icon: Sun, label: 'UV Index' },
  { path: '/hourly', icon: Clock, label: 'Hourly Forecast' },
  { path: '/alerts', icon: AlertTriangle, label: 'Weather Alerts' },
  { path: '/astronomy', icon: Moon, label: 'Moon & Astronomy' },
  { path: '/maps', icon: Map, label: 'Weather Maps' },
];

export default function Sidebar({ onLoginClick, onRegisterClick, theme, onThemeChange, isDark, isOpen, onClose }) {
  const { user, logout, isAuthenticated } = useAuth();

  const themeOptions = [
    { value: 'auto', icon: Monitor, label: 'Auto' },
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
  ];

  return (
    <aside className={`sidebar ${isDark ? 'dark' : ''} ${isOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <EnvizioLogo size={32} className="sidebar-logo-icon" />
        </div>
        <span className="sidebar-title">Envizio</span>
      </div>

      {/* Theme Toggle */}
      <div className="theme-toggle-container">
        <span className="theme-label">Theme</span>
        <div className="theme-toggle-buttons">
          {themeOptions.map((option) => (
            <button
              key={option.value}
              className={`theme-btn ${theme === option.value ? 'active' : ''}`}
              onClick={() => onThemeChange(option.value)}
              title={option.label}
            >
              <option.icon size={16} />
            </button>
          ))}
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
            onClick={() => onClose && onClose()}
          >
            <item.icon className="sidebar-link-icon" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        {isAuthenticated ? (
          <div className="sidebar-user">
            <div className="user-info">
              <User size={18} />
              <span>{user?.name}</span>
            </div>
            <button className="logout-btn" onClick={logout} title="Logout">
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <div className="sidebar-auth">
            <button className="auth-btn login" onClick={onLoginClick}>
              <User size={18} />
              Login
            </button>
            <button className="auth-btn register" onClick={onRegisterClick}>
              Sign Up
            </button>
          </div>
        )}
        <p className="sidebar-version">v2.0</p>
      </div>
    </aside>
  );
}
