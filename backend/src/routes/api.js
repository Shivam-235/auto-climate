const express = require("express");
const router = express.Router();
const { getSensorHistory, getCurrentReadings } = require("../socket");

// Get current sensor readings
router.get("/sensors/current", (req, res) => {
  res.json(getCurrentReadings());
});

// Get sensor history
router.get("/sensors/history", (req, res) => {
  res.json(getSensorHistory());
});

// Get specific sensor data
router.get("/sensors/:type", (req, res) => {
  const { type } = req.params;
  const history = getSensorHistory();
  
  if (history[type]) {
    res.json({
      type,
      current: getCurrentReadings()[type],
      history: history[type],
    });
  } else {
    res.status(404).json({ error: "Sensor type not found" });
  }
});

// System status
router.get("/status", (req, res) => {
  const current = getCurrentReadings();
  
  // Determine climate status based on readings
  let status = "optimal";
  let alerts = [];

  if (current.temperature > 28) {
    alerts.push({ type: "warning", message: "High temperature detected" });
    status = "warning";
  }
  if (current.temperature < 18) {
    alerts.push({ type: "warning", message: "Low temperature detected" });
    status = "warning";
  }
  if (current.humidity > 70) {
    alerts.push({ type: "warning", message: "High humidity detected" });
    status = "warning";
  }
  if (current.co2 > 1000) {
    alerts.push({ type: "danger", message: "High CO2 levels - ventilate area" });
    status = "danger";
  }
  if (current.pm25 > 35) {
    alerts.push({ type: "danger", message: "Poor air quality detected" });
    status = "danger";
  }

  res.json({
    status,
    alerts,
    lastUpdate: current.timestamp,
  });
});

module.exports = router;