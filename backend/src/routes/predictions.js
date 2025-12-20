const express = require('express');
const router = express.Router();
const { generateClimatePrediction, predictMetric, predictFromRecentData } = require('../services/predictionService');
const { getSensorHistory } = require('../socket');

// Get full climate prediction
router.get('/', async (req, res) => {
  try {
    const { hours = 6 } = req.query;
    const prediction = await generateClimatePrediction(parseInt(hours));
    res.json(prediction);
  } catch (error) {
    console.error('Climate prediction error:', error);
    
    // Fallback to in-memory prediction
    try {
      const history = getSensorHistory();
      const readings = [];
      
      // Convert history format to readings format
      const temps = history.temperature || [];
      for (let i = 0; i < temps.length; i++) {
        readings.push({
          temperature: temps[i]?.value,
          humidity: history.humidity[i]?.value,
          co2: history.co2[i]?.value,
          pm25: history.pm25[i]?.value
        });
      }
      
      if (readings.length >= 5) {
        const prediction = predictFromRecentData(readings, parseInt(req.query.hours) || 6);
        return res.json(prediction);
      }
    } catch (fallbackError) {
      console.error('Fallback prediction error:', fallbackError);
    }
    
    res.status(500).json({ 
      error: 'Failed to generate prediction',
      message: 'Insufficient data available'
    });
  }
});

// Get prediction for specific metric
router.get('/:metric', async (req, res) => {
  try {
    const { metric } = req.params;
    const { hours = 6 } = req.query;
    
    const validMetrics = ['temperature', 'humidity', 'co2', 'pm25'];
    if (!validMetrics.includes(metric)) {
      return res.status(400).json({ error: 'Invalid metric. Valid options: ' + validMetrics.join(', ') });
    }
    
    const prediction = await predictMetric(metric, parseInt(hours));
    res.json(prediction);
  } catch (error) {
    console.error('Metric prediction error:', error);
    res.status(500).json({ error: 'Failed to generate prediction for ' + req.params.metric });
  }
});

// Get trend analysis
router.get('/analysis/trends', async (req, res) => {
  try {
    const prediction = await generateClimatePrediction(6);
    
    const trends = {};
    for (const [metric, data] of Object.entries(prediction.predictions)) {
      if (data.success) {
        trends[metric] = {
          current: data.currentValue,
          trend: data.trend,
          confidence: data.confidence,
          nextHour: data.predictions[0]?.predictedValue
        };
      }
    }
    
    res.json({
      trends,
      outlook: prediction.outlook,
      generatedAt: prediction.generatedAt
    });
  } catch (error) {
    console.error('Trend analysis error:', error);
    res.status(500).json({ error: 'Failed to generate trend analysis' });
  }
});

module.exports = router;
