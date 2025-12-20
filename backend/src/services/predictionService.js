const SensorReading = require('../models/SensorReading');

/**
 * AI-based Climate Prediction Service
 * Uses statistical methods and simple ML for predictions
 * Can be extended to use TensorFlow.js or external AI APIs
 */

// Simple moving average calculation
function movingAverage(data, window = 5) {
  const result = [];
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - window + 1);
    const values = data.slice(start, i + 1);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    result.push(avg);
  }
  return result;
}

// Simple linear regression for trend prediction
function linearRegression(data) {
  const n = data.length;
  if (n < 2) return { slope: 0, intercept: data[0] || 0 };
  
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += data[i];
    sumXY += i * data[i];
    sumXX += i * i;
  }
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  return { slope, intercept };
}

// Predict next value using linear regression
function predictNext(data, steps = 1) {
  const { slope, intercept } = linearRegression(data);
  const predictions = [];
  const n = data.length;
  
  for (let i = 1; i <= steps; i++) {
    predictions.push(slope * (n + i - 1) + intercept);
  }
  
  return predictions;
}

// Detect trend direction
function detectTrend(data) {
  if (data.length < 3) return 'stable';
  
  const { slope } = linearRegression(data);
  const avgValue = data.reduce((a, b) => a + b, 0) / data.length;
  const relativeSlope = slope / avgValue;
  
  if (relativeSlope > 0.02) return 'increasing';
  if (relativeSlope < -0.02) return 'decreasing';
  return 'stable';
}

// Calculate seasonality component (for hourly patterns)
function calculateSeasonality(hourlyData) {
  const hourlyAverages = new Array(24).fill(0);
  const hourlyCounts = new Array(24).fill(0);
  
  for (const reading of hourlyData) {
    const hour = new Date(reading.timestamp).getHours();
    hourlyAverages[hour] += reading.value;
    hourlyCounts[hour]++;
  }
  
  return hourlyAverages.map((sum, i) => 
    hourlyCounts[i] > 0 ? sum / hourlyCounts[i] : null
  );
}

// Generate prediction for a specific metric
async function predictMetric(metricName, hoursAhead = 6) {
  try {
    // Get last 48 hours of data
    const readings = await SensorReading.find({
      timestamp: { $gte: new Date(Date.now() - 48 * 60 * 60 * 1000) }
    }).sort({ timestamp: 1 });
    
    if (readings.length < 10) {
      return {
        success: false,
        message: 'Insufficient data for prediction',
        predictions: []
      };
    }
    
    const values = readings.map(r => r[metricName]).filter(v => v !== null && v !== undefined);
    
    if (values.length < 10) {
      return {
        success: false,
        message: `Insufficient ${metricName} data for prediction`,
        predictions: []
      };
    }
    
    // Apply moving average to smooth data
    const smoothed = movingAverage(values, 5);
    
    // Predict future values
    const predictions = predictNext(smoothed, hoursAhead);
    const trend = detectTrend(values.slice(-20));
    
    // Calculate confidence based on data variability
    const variance = calculateVariance(values.slice(-20));
    const confidence = Math.max(0.5, 1 - variance / (values[values.length - 1] || 1));
    
    return {
      success: true,
      metric: metricName,
      currentValue: values[values.length - 1],
      trend,
      confidence: Math.round(confidence * 100),
      predictions: predictions.map((value, index) => ({
        hoursAhead: index + 1,
        predictedValue: Math.round(value * 100) / 100,
        timestamp: new Date(Date.now() + (index + 1) * 60 * 60 * 1000)
      }))
    };
  } catch (error) {
    console.error(`Prediction error for ${metricName}:`, error);
    return {
      success: false,
      message: error.message,
      predictions: []
    };
  }
}

// Calculate variance
function calculateVariance(data) {
  if (data.length < 2) return 0;
  const mean = data.reduce((a, b) => a + b, 0) / data.length;
  const squaredDiffs = data.map(x => Math.pow(x - mean, 2));
  return squaredDiffs.reduce((a, b) => a + b, 0) / data.length;
}

// Generate full climate prediction
async function generateClimatePrediction(hoursAhead = 6) {
  const metrics = ['temperature', 'humidity', 'co2', 'pm25'];
  const predictions = {};
  
  for (const metric of metrics) {
    predictions[metric] = await predictMetric(metric, hoursAhead);
  }
  
  // Generate overall climate outlook
  const outlook = generateOutlook(predictions);
  
  return {
    generatedAt: new Date(),
    hoursAhead,
    predictions,
    outlook
  };
}

// Generate climate outlook based on predictions
function generateOutlook(predictions) {
  const warnings = [];
  let overallStatus = 'good';
  
  // Check temperature predictions
  if (predictions.temperature?.success) {
    const tempPreds = predictions.temperature.predictions;
    const maxTemp = Math.max(...tempPreds.map(p => p.predictedValue));
    const minTemp = Math.min(...tempPreds.map(p => p.predictedValue));
    
    if (maxTemp > 35) {
      warnings.push(`High temperature expected: up to ${maxTemp.toFixed(1)}°C`);
      overallStatus = 'warning';
    }
    if (minTemp < 10) {
      warnings.push(`Low temperature expected: down to ${minTemp.toFixed(1)}°C`);
      overallStatus = 'warning';
    }
  }
  
  // Check air quality predictions
  if (predictions.pm25?.success) {
    const pm25Preds = predictions.pm25.predictions;
    const maxPm25 = Math.max(...pm25Preds.map(p => p.predictedValue));
    
    if (maxPm25 > 55) {
      warnings.push(`Poor air quality expected: PM2.5 up to ${maxPm25.toFixed(0)} µg/m³`);
      overallStatus = 'danger';
    } else if (maxPm25 > 35) {
      warnings.push(`Moderate air quality expected: PM2.5 up to ${maxPm25.toFixed(0)} µg/m³`);
      if (overallStatus !== 'danger') overallStatus = 'warning';
    }
  }
  
  // Check CO2 predictions
  if (predictions.co2?.success) {
    const co2Preds = predictions.co2.predictions;
    const maxCo2 = Math.max(...co2Preds.map(p => p.predictedValue));
    
    if (maxCo2 > 2000) {
      warnings.push(`High CO₂ levels expected: up to ${maxCo2.toFixed(0)} ppm`);
      overallStatus = 'danger';
    } else if (maxCo2 > 1000) {
      warnings.push(`Elevated CO₂ levels expected: up to ${maxCo2.toFixed(0)} ppm`);
      if (overallStatus !== 'danger') overallStatus = 'warning';
    }
  }
  
  return {
    status: overallStatus,
    warnings,
    summary: warnings.length > 0 
      ? `${warnings.length} climate concern${warnings.length > 1 ? 's' : ''} predicted`
      : 'Climate conditions expected to remain stable'
  };
}

// Predict with in-memory data (fallback when DB not available)
function predictFromRecentData(recentReadings, hoursAhead = 6) {
  const metrics = ['temperature', 'humidity', 'co2', 'pm25'];
  const predictions = {};
  
  for (const metric of metrics) {
    const values = recentReadings.map(r => r[metric]).filter(v => v !== null);
    
    if (values.length < 5) {
      predictions[metric] = {
        success: false,
        message: 'Insufficient data',
        predictions: []
      };
      continue;
    }
    
    const smoothed = movingAverage(values, 3);
    const predicted = predictNext(smoothed, hoursAhead);
    const trend = detectTrend(values);
    
    predictions[metric] = {
      success: true,
      metric,
      currentValue: values[values.length - 1],
      trend,
      confidence: 65, // Lower confidence for in-memory predictions
      predictions: predicted.map((value, index) => ({
        hoursAhead: index + 1,
        predictedValue: Math.round(value * 100) / 100,
        timestamp: new Date(Date.now() + (index + 1) * 60 * 60 * 1000)
      }))
    };
  }
  
  return {
    generatedAt: new Date(),
    hoursAhead,
    predictions,
    outlook: generateOutlook(predictions),
    source: 'in-memory'
  };
}

module.exports = {
  predictMetric,
  generateClimatePrediction,
  predictFromRecentData,
  movingAverage,
  linearRegression,
  detectTrend
};
