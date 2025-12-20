const express = require('express');
const router = express.Router();
const { authenticate, optionalAuth } = require('../middleware/auth');
const {
  getRecentAlerts,
  getAlertsBySeverity,
  getUnacknowledgedAlerts,
  acknowledgeAlert,
  resolveAlert,
  getAlertStats,
  getActiveAlerts
} = require('../services/alertService');
const { THRESHOLDS } = require('../config/thresholds');

// Get current thresholds configuration
router.get('/thresholds', (req, res) => {
  res.json({ thresholds: THRESHOLDS });
});

// Get active alerts (real-time, in-memory)
router.get('/active', (req, res) => {
  const alerts = getActiveAlerts();
  res.json({ alerts, count: alerts.length });
});

// Get recent alerts
router.get('/recent', async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const alerts = await getRecentAlerts(parseInt(limit));
    res.json({ alerts });
  } catch (error) {
    console.error('Get recent alerts error:', error);
    res.status(500).json({ error: 'Failed to fetch recent alerts' });
  }
});

// Get alerts by severity
router.get('/severity/:severity', async (req, res) => {
  try {
    const { severity } = req.params;
    const { limit = 50 } = req.query;
    
    if (!['info', 'warning', 'danger', 'critical'].includes(severity)) {
      return res.status(400).json({ error: 'Invalid severity level' });
    }
    
    const alerts = await getAlertsBySeverity(severity, parseInt(limit));
    res.json({ alerts });
  } catch (error) {
    console.error('Get alerts by severity error:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// Get unacknowledged alerts
router.get('/unacknowledged', async (req, res) => {
  try {
    const alerts = await getUnacknowledgedAlerts();
    res.json({ alerts, count: alerts.length });
  } catch (error) {
    console.error('Get unacknowledged alerts error:', error);
    res.status(500).json({ error: 'Failed to fetch unacknowledged alerts' });
  }
});

// Get alert statistics
router.get('/stats', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const stats = await getAlertStats(parseInt(days));
    res.json(stats);
  } catch (error) {
    console.error('Get alert stats error:', error);
    res.status(500).json({ error: 'Failed to fetch alert statistics' });
  }
});

// Acknowledge an alert (requires authentication)
router.post('/:id/acknowledge', authenticate, async (req, res) => {
  try {
    const alert = await acknowledgeAlert(req.params.id, req.userId);
    
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    
    res.json({ message: 'Alert acknowledged', alert });
  } catch (error) {
    console.error('Acknowledge alert error:', error);
    res.status(500).json({ error: 'Failed to acknowledge alert' });
  }
});

// Resolve an alert (requires authentication)
router.post('/:id/resolve', authenticate, async (req, res) => {
  try {
    const alert = await resolveAlert(req.params.id);
    
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    
    res.json({ message: 'Alert resolved', alert });
  } catch (error) {
    console.error('Resolve alert error:', error);
    res.status(500).json({ error: 'Failed to resolve alert' });
  }
});

module.exports = router;
