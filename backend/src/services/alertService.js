const Alert = require('../models/Alert');
const { checkAllThresholds, SEVERITY } = require('../config/thresholds');

// In-memory store for active alerts (for real-time broadcasting)
let activeAlerts = [];

// Store for connected sockets (to broadcast alerts)
let connectedSockets = new Map();

// Register a socket for alert broadcasts
function registerSocket(socketId, socket) {
  connectedSockets.set(socketId, socket);
}

// Unregister a socket
function unregisterSocket(socketId) {
  connectedSockets.delete(socketId);
}

// Process sensor readings and generate alerts
async function processReadings(readings, location = null) {
  const alerts = checkAllThresholds(readings);
  
  if (alerts.length === 0) {
    return [];
  }
  
  const newAlerts = [];
  
  for (const alert of alerts) {
    // Check if similar alert exists in last 5 minutes (avoid duplicates)
    const recentAlert = activeAlerts.find(a => 
      a.type === alert.type && 
      a.severity === alert.severity &&
      Date.now() - new Date(a.createdAt).getTime() < 5 * 60 * 1000
    );
    
    if (!recentAlert) {
      const alertDoc = {
        ...alert,
        location: location || { city: 'Unknown', lat: 0, lon: 0 },
        createdAt: new Date()
      };
      
      // Save to database if connected
      try {
        const savedAlert = await Alert.create(alertDoc);
        alertDoc._id = savedAlert._id;
      } catch (error) {
        // Database might not be connected, continue with in-memory
        alertDoc._id = Date.now().toString();
      }
      
      newAlerts.push(alertDoc);
      activeAlerts.push(alertDoc);
      
      // Keep only last 100 alerts in memory
      if (activeAlerts.length > 100) {
        activeAlerts = activeAlerts.slice(-100);
      }
    }
  }
  
  // Broadcast new alerts to all connected clients
  if (newAlerts.length > 0) {
    broadcastAlerts(newAlerts);
  }
  
  return newAlerts;
}

// Broadcast alerts to all connected sockets
function broadcastAlerts(alerts) {
  for (const [socketId, socket] of connectedSockets) {
    try {
      socket.emit('dangerAlerts', alerts);
    } catch (error) {
      console.error(`Failed to send alert to socket ${socketId}:`, error.message);
    }
  }
}

// Get recent alerts
async function getRecentAlerts(limit = 50) {
  try {
    const alerts = await Alert.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('acknowledgedBy', 'name email');
    return alerts;
  } catch (error) {
    // Return in-memory alerts if database not available
    return activeAlerts.slice(-limit).reverse();
  }
}

// Get alerts by severity
async function getAlertsBySeverity(severity, limit = 50) {
  try {
    return await Alert.find({ severity })
      .sort({ createdAt: -1 })
      .limit(limit);
  } catch (error) {
    return activeAlerts.filter(a => a.severity === severity).slice(-limit).reverse();
  }
}

// Get unacknowledged alerts
async function getUnacknowledgedAlerts() {
  try {
    return await Alert.find({ acknowledged: false })
      .sort({ createdAt: -1 });
  } catch (error) {
    return activeAlerts.filter(a => !a.acknowledged);
  }
}

// Acknowledge an alert
async function acknowledgeAlert(alertId, userId) {
  try {
    const alert = await Alert.findByIdAndUpdate(
      alertId,
      {
        acknowledged: true,
        acknowledgedBy: userId,
        acknowledgedAt: new Date()
      },
      { new: true }
    );
    
    // Update in-memory store
    const idx = activeAlerts.findIndex(a => a._id.toString() === alertId);
    if (idx !== -1) {
      activeAlerts[idx].acknowledged = true;
    }
    
    return alert;
  } catch (error) {
    console.error('Failed to acknowledge alert:', error);
    return null;
  }
}

// Resolve an alert
async function resolveAlert(alertId) {
  try {
    const alert = await Alert.findByIdAndUpdate(
      alertId,
      {
        resolved: true,
        resolvedAt: new Date()
      },
      { new: true }
    );
    
    // Remove from active alerts
    activeAlerts = activeAlerts.filter(a => a._id.toString() !== alertId);
    
    return alert;
  } catch (error) {
    console.error('Failed to resolve alert:', error);
    return null;
  }
}

// Get alert statistics
async function getAlertStats(days = 7) {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  try {
    const stats = await Alert.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { severity: '$severity', type: '$type' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    const bySeverity = {};
    const byType = {};
    
    for (const stat of stats) {
      const { severity, type } = stat._id;
      bySeverity[severity] = (bySeverity[severity] || 0) + stat.count;
      byType[type] = (byType[type] || 0) + stat.count;
    }
    
    const total = await Alert.countDocuments({ createdAt: { $gte: startDate } });
    const unacknowledged = await Alert.countDocuments({ 
      createdAt: { $gte: startDate },
      acknowledged: false 
    });
    
    return { total, unacknowledged, bySeverity, byType, period: `${days} days` };
  } catch (error) {
    return {
      total: activeAlerts.length,
      unacknowledged: activeAlerts.filter(a => !a.acknowledged).length,
      bySeverity: {},
      byType: {},
      period: `${days} days`
    };
  }
}

// Get active (in-memory) alerts
function getActiveAlerts() {
  return activeAlerts;
}

module.exports = {
  registerSocket,
  unregisterSocket,
  processReadings,
  getRecentAlerts,
  getAlertsBySeverity,
  getUnacknowledgedAlerts,
  acknowledgeAlert,
  resolveAlert,
  getAlertStats,
  getActiveAlerts,
  broadcastAlerts
};
