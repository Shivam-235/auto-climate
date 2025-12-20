const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['temperature', 'humidity', 'co2', 'pm25', 'aqi', 'windSpeed', 'weather']
  },
  severity: {
    type: String,
    required: true,
    enum: ['info', 'warning', 'danger', 'critical']
  },
  message: {
    type: String,
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  threshold: {
    type: Number
  },
  location: {
    city: String,
    lat: Number,
    lon: Number
  },
  acknowledged: {
    type: Boolean,
    default: false
  },
  acknowledgedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  acknowledgedAt: {
    type: Date,
    default: null
  },
  resolved: {
    type: Boolean,
    default: false
  },
  resolvedAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 604800 // Auto-delete after 7 days
  }
});

// Index for efficient queries
alertSchema.index({ createdAt: -1 });
alertSchema.index({ severity: 1, acknowledged: 1 });
alertSchema.index({ type: 1 });

const Alert = mongoose.model('Alert', alertSchema);

module.exports = Alert;
