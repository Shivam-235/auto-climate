const mongoose = require('mongoose');

const sensorReadingSchema = new mongoose.Schema({
  temperature: {
    type: Number,
    required: true
  },
  humidity: {
    type: Number,
    required: true
  },
  co2: {
    type: Number,
    required: true
  },
  pm25: {
    type: Number,
    required: true
  },
  aqi: {
    type: Number,
    default: null
  },
  windSpeed: {
    type: Number,
    default: null
  },
  pressure: {
    type: Number,
    default: null
  },
  location: {
    city: String,
    lat: Number,
    lon: Number
  },
  weatherCondition: {
    type: String,
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now,
    expires: 2592000 // Auto-delete after 30 days
  }
});

// Indexes for efficient time-series queries
sensorReadingSchema.index({ timestamp: -1 });
sensorReadingSchema.index({ 'location.city': 1, timestamp: -1 });

// Static method to get readings for a time range
sensorReadingSchema.statics.getReadingsInRange = async function(startDate, endDate, city = null) {
  const query = {
    timestamp: { $gte: startDate, $lte: endDate }
  };
  
  if (city) {
    query['location.city'] = city;
  }
  
  return this.find(query).sort({ timestamp: 1 });
};

// Static method to get hourly averages
sensorReadingSchema.statics.getHourlyAverages = async function(hours = 24, city = null) {
  const startDate = new Date(Date.now() - hours * 60 * 60 * 1000);
  
  const matchStage = { timestamp: { $gte: startDate } };
  if (city) {
    matchStage['location.city'] = city;
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          year: { $year: '$timestamp' },
          month: { $month: '$timestamp' },
          day: { $dayOfMonth: '$timestamp' },
          hour: { $hour: '$timestamp' }
        },
        avgTemperature: { $avg: '$temperature' },
        avgHumidity: { $avg: '$humidity' },
        avgCo2: { $avg: '$co2' },
        avgPm25: { $avg: '$pm25' },
        avgAqi: { $avg: '$aqi' },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.hour': 1 } }
  ]);
};

const SensorReading = mongoose.model('SensorReading', sensorReadingSchema);

module.exports = SensorReading;
