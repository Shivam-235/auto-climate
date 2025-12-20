// Climate thresholds configuration for danger alerts
const THRESHOLDS = {
  temperature: {
    min: 10,
    max: 35,
    criticalMin: 5,
    criticalMax: 40,
    unit: '°C',
    name: 'Temperature'
  },
  humidity: {
    min: 30,
    max: 70,
    criticalMin: 20,
    criticalMax: 85,
    unit: '%',
    name: 'Humidity'
  },
  co2: {
    max: 1000,
    criticalMax: 2000,
    unit: 'ppm',
    name: 'CO₂ Level'
  },
  pm25: {
    max: 35,
    criticalMax: 55,
    unit: 'µg/m³',
    name: 'PM2.5'
  },
  aqi: {
    max: 100,
    criticalMax: 150,
    unit: '',
    name: 'Air Quality Index'
  },
  windSpeed: {
    max: 50,
    criticalMax: 75,
    unit: 'km/h',
    name: 'Wind Speed'
  }
};

// Alert severity levels
const SEVERITY = {
  INFO: 'info',
  WARNING: 'warning',
  DANGER: 'danger',
  CRITICAL: 'critical'
};

// Check a value against thresholds
function checkThreshold(type, value) {
  const threshold = THRESHOLDS[type];
  if (!threshold) return null;

  const alerts = [];

  // Check maximum thresholds
  if (threshold.criticalMax && value >= threshold.criticalMax) {
    alerts.push({
      type,
      severity: SEVERITY.CRITICAL,
      message: `${threshold.name} critically high: ${value}${threshold.unit}`,
      value,
      threshold: threshold.criticalMax
    });
  } else if (threshold.max && value >= threshold.max) {
    alerts.push({
      type,
      severity: SEVERITY.DANGER,
      message: `${threshold.name} too high: ${value}${threshold.unit}`,
      value,
      threshold: threshold.max
    });
  }

  // Check minimum thresholds
  if (threshold.criticalMin !== undefined && value <= threshold.criticalMin) {
    alerts.push({
      type,
      severity: SEVERITY.CRITICAL,
      message: `${threshold.name} critically low: ${value}${threshold.unit}`,
      value,
      threshold: threshold.criticalMin
    });
  } else if (threshold.min !== undefined && value <= threshold.min) {
    alerts.push({
      type,
      severity: SEVERITY.WARNING,
      message: `${threshold.name} too low: ${value}${threshold.unit}`,
      value,
      threshold: threshold.min
    });
  }

  return alerts;
}

// Check all readings against thresholds
function checkAllThresholds(readings) {
  const allAlerts = [];
  
  for (const [type, value] of Object.entries(readings)) {
    if (value !== null && value !== undefined) {
      const alerts = checkThreshold(type, value);
      if (alerts && alerts.length > 0) {
        allAlerts.push(...alerts);
      }
    }
  }
  
  return allAlerts;
}

module.exports = { THRESHOLDS, SEVERITY, checkThreshold, checkAllThresholds };
