const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Alert = require('../models/Alert');
const SensorReading = require('../models/SensorReading');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { getAlertStats, getRecentAlerts } = require('../services/alertService');

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

// Get dashboard statistics
router.get('/dashboard', async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    
    // User stats
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const newUsersToday = await User.countDocuments({ createdAt: { $gte: today } });
    const newUsersThisWeek = await User.countDocuments({ createdAt: { $gte: weekAgo } });
    
    // Alert stats
    const alertStats = await getAlertStats(7);
    
    // Sensor reading stats
    const totalReadings = await SensorReading.countDocuments();
    const readingsToday = await SensorReading.countDocuments({ timestamp: { $gte: today } });
    
    // Recent activity
    const recentLogins = await User.find({ lastLogin: { $gte: weekAgo } })
      .select('name email lastLogin')
      .sort({ lastLogin: -1 })
      .limit(10);
    
    res.json({
      users: {
        total: totalUsers,
        active: activeUsers,
        newToday: newUsersToday,
        newThisWeek: newUsersThisWeek
      },
      alerts: alertStats,
      sensors: {
        totalReadings,
        readingsToday
      },
      recentLogins,
      timestamp: now
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, role, status } = req.query;
    const query = {};
    
    if (role) query.role = role;
    if (status === 'active') query.isActive = true;
    if (status === 'inactive') query.isActive = false;
    
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await User.countDocuments(query);
    
    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get single user
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update user (admin can change role, status)
router.put('/users/:id', async (req, res) => {
  try {
    const { role, isActive, name } = req.body;
    const updates = {};
    
    if (role && ['user', 'admin'].includes(role)) updates.role = role;
    if (typeof isActive === 'boolean') updates.isActive = isActive;
    if (name) updates.name = name;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user, message: 'User updated successfully' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    // Prevent deleting yourself
    if (req.params.id === req.userId.toString()) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }
    
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Get all alerts (with filters)
router.get('/alerts', async (req, res) => {
  try {
    const { page = 1, limit = 50, severity, type, acknowledged } = req.query;
    const query = {};
    
    if (severity) query.severity = severity;
    if (type) query.type = type;
    if (acknowledged !== undefined) query.acknowledged = acknowledged === 'true';
    
    const alerts = await Alert.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('acknowledgedBy', 'name email');
    
    const total = await Alert.countDocuments(query);
    
    res.json({
      alerts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get alerts error:', error);
    // Fallback to in-memory alerts
    const recentAlerts = await getRecentAlerts(50);
    res.json({ alerts: recentAlerts, pagination: { page: 1, total: recentAlerts.length } });
  }
});

// Get alert statistics
router.get('/alerts/stats', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const stats = await getAlertStats(parseInt(days));
    res.json(stats);
  } catch (error) {
    console.error('Get alert stats error:', error);
    res.status(500).json({ error: 'Failed to fetch alert statistics' });
  }
});

// Bulk acknowledge alerts
router.post('/alerts/acknowledge', async (req, res) => {
  try {
    const { alertIds } = req.body;
    
    if (!alertIds || !Array.isArray(alertIds)) {
      return res.status(400).json({ error: 'Alert IDs array is required' });
    }
    
    const result = await Alert.updateMany(
      { _id: { $in: alertIds } },
      {
        $set: {
          acknowledged: true,
          acknowledgedBy: req.userId,
          acknowledgedAt: new Date()
        }
      }
    );
    
    res.json({
      message: `${result.modifiedCount} alerts acknowledged`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Bulk acknowledge error:', error);
    res.status(500).json({ error: 'Failed to acknowledge alerts' });
  }
});

// Get sensor readings history
router.get('/sensors/history', async (req, res) => {
  try {
    const { hours = 24, city } = req.query;
    const startDate = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    const query = { timestamp: { $gte: startDate } };
    if (city) query['location.city'] = city;
    
    const readings = await SensorReading.find(query)
      .sort({ timestamp: -1 })
      .limit(1000);
    
    res.json({ readings, count: readings.length });
  } catch (error) {
    console.error('Get sensor history error:', error);
    res.status(500).json({ error: 'Failed to fetch sensor history' });
  }
});

// Get system health
router.get('/system/health', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    res.json({
      status: 'ok',
      database: dbStatus,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message });
  }
});

// Create admin user (one-time setup)
router.post('/setup/create-admin', async (req, res) => {
  try {
    const adminCount = await User.countDocuments({ role: 'admin' });
    
    if (adminCount > 0) {
      return res.status(400).json({ error: 'Admin user already exists' });
    }
    
    const { email, password, name } = req.body;
    
    const admin = new User({
      email,
      password,
      name,
      role: 'admin'
    });
    
    await admin.save();
    
    res.status(201).json({ message: 'Admin user created successfully' });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ error: 'Failed to create admin user' });
  }
});

module.exports = router;
