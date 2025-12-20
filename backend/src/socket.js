const { getFullWeatherData, setLocation, searchCities, getAvailableCities, getWeatherByCoords } = require("./services/weatherService");
const { registerSocket, unregisterSocket, processReadings, getActiveAlerts, acknowledgeAlert } = require("./services/alertService");
const { predictFromRecentData } = require("./services/predictionService");

// Try to import models (may fail if mongoose not connected)
let SensorReading = null;
try {
  SensorReading = require("./models/SensorReading");
} catch (e) {
  console.log("SensorReading model not available");
}

// In-memory store for sensor data history (derived from weather API data)
let sensorHistory = {
  temperature: [],
  humidity: [],
  co2: [],
  pm25: [],
};

// Store for full readings (for predictions)
let fullReadingsHistory = [];
const MAX_FULL_HISTORY = 100;

const MAX_HISTORY = 20; // Keep last 20 readings

// Store latest readings for API access
let latestReadings = {
  temperature: 25,
  humidity: 60,
  co2: 400,
  pm25: 25,
  aqi: 50,
  timestamp: new Date().toISOString(),
};

// Store current location
let currentLocation = {
  city: 'Delhi',
  lat: 28.6139,
  lon: 77.2090
};

// Update sensor history from weather data
function updateSensorHistory(weatherData) {
  if (!weatherData) return;
  
  const now = new Date();
  const timeLabel = now.toLocaleTimeString('en-US', { 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit' 
  });

  // Use real data from weather API
  const readings = {
    temperature: weatherData.current?.temperature || 25,
    humidity: weatherData.current?.humidity || 60,
    co2: 400 + Math.round((Math.random() - 0.5) * 50), // CO2 not available from OpenWeatherMap
    pm25: weatherData.aqi?.pm25 || 25,
  };

  Object.keys(sensorHistory).forEach((key) => {
    sensorHistory[key].push({ time: timeLabel, value: readings[key] });
    if (sensorHistory[key].length > MAX_HISTORY) {
      sensorHistory[key].shift();
    }
  });

  const result = {
    ...readings,
    timestamp: now.toISOString(),
  };
  
  // Update latest readings for API access
  latestReadings = result;
  
  return result;
}

function initSocket(io) {
  io.on("connection", async (socket) => {
    console.log(`Client connected: ${socket.id}${socket.user ? ` (${socket.user.email})` : ''}`);

    // Register socket for alert broadcasts
    registerSocket(socket.id, socket);

    // Send initial data (async)
    try {
      const weatherData = await getFullWeatherData();
      const sensorData = updateSensorHistory(weatherData);
      socket.emit("sensorData", sensorData);
      socket.emit("sensorHistory", sensorHistory);
      socket.emit("weatherData", weatherData);
      
      // Send any active alerts
      const activeAlerts = getActiveAlerts();
      if (activeAlerts.length > 0) {
        socket.emit("activeAlerts", activeAlerts);
      }
      
      // Update current location from weather data
      if (weatherData.location) {
        currentLocation = {
          city: weatherData.location.city || currentLocation.city,
          lat: weatherData.location.lat || currentLocation.lat,
          lon: weatherData.location.lon || currentLocation.lon
        };
      }
    } catch (error) {
      console.error('Error fetching initial data:', error.message);
    }

    // Set up interval to fetch and send real-time data every 5 seconds
    const dataInterval = setInterval(async () => {
      try {
        const weatherData = await getFullWeatherData();
        const sensorData = updateSensorHistory(weatherData);
        socket.emit("sensorData", sensorData);
        socket.emit("sensorHistory", sensorHistory);
        socket.emit("weatherData", weatherData);
        
        // Process readings for alerts
        const readingsForAlerts = {
          temperature: sensorData.temperature,
          humidity: sensorData.humidity,
          co2: sensorData.co2,
          pm25: sensorData.pm25,
          aqi: weatherData.aqi?.value,
          windSpeed: weatherData.current?.windSpeed
        };
        
        // Check thresholds and generate alerts
        await processReadings(readingsForAlerts, currentLocation);
        
        // Store full reading for predictions
        fullReadingsHistory.push({
          ...readingsForAlerts,
          timestamp: new Date()
        });
        if (fullReadingsHistory.length > MAX_FULL_HISTORY) {
          fullReadingsHistory.shift();
        }
        
        // Save to database if available
        if (SensorReading) {
          try {
            await SensorReading.create({
              ...readingsForAlerts,
              location: currentLocation,
              weatherCondition: weatherData.current?.description,
              pressure: weatherData.current?.pressure
            });
          } catch (dbError) {
            // Silently fail if DB not available
          }
        }
      } catch (error) {
        console.error('Error fetching real-time data:', error.message);
      }
    }, 5000);

    // Handle location change request (async)
    socket.on("changeLocation", async (cityName) => {
      console.log(`Location change requested: ${cityName}`);
      try {
        const result = await setLocation(cityName);
        if (result.success) {
          // Update current location
          currentLocation = {
            city: result.location.city || cityName,
            lat: result.location.lat,
            lon: result.location.lon
          };
          
          // Fetch and send updated weather data immediately
          const weatherData = await getFullWeatherData();
          socket.emit("weatherData", weatherData);
          socket.emit("locationChanged", { success: true, location: result.location });
        } else {
          socket.emit("locationChanged", { success: false, message: result.message });
        }
      } catch (error) {
        socket.emit("locationChanged", { success: false, message: error.message });
      }
    });

    // Handle city search request (async)
    socket.on("searchCities", async (query) => {
      try {
        const results = await searchCities(query);
        socket.emit("citySearchResults", results);
      } catch (error) {
        console.error('City search error:', error.message);
        socket.emit("citySearchResults", []);
      }
    });

    // Handle request for all available cities
    socket.on("getAvailableCities", () => {
      socket.emit("availableCities", getAvailableCities());
    });

    // Handle request for weather by coordinates (map click)
    socket.on("getWeatherByCoords", async ({ lat, lon }) => {
      console.log(`Weather by coords requested: ${lat}, ${lon}`);
      try {
        const weatherData = await getWeatherByCoords(lat, lon);
        socket.emit("coordsWeatherData", { success: true, data: weatherData });
      } catch (error) {
        console.error('Error fetching weather by coords:', error.message);
        socket.emit("coordsWeatherData", { success: false, error: error.message });
      }
    });

    // Handle request for weather data for multiple cities
    socket.on("getMajorCitiesWeather", async (cities) => {
      console.log(`Major cities weather requested for ${cities.length} cities`);
      try {
        const weatherPromises = cities.map(async (city) => {
          try {
            const weatherData = await getWeatherByCoords(city.lat, city.lon);
            return {
              ...weatherData,
              cityName: city.name,
              success: true
            };
          } catch (error) {
            console.error(`Error fetching weather for ${city.name}:`, error.message);
            return {
              cityName: city.name,
              success: false,
              error: error.message
            };
          }
        });
        
        const results = await Promise.all(weatherPromises);
        socket.emit("majorCitiesWeatherData", { success: true, data: results });
      } catch (error) {
        console.error('Error fetching major cities weather:', error.message);
        socket.emit("majorCitiesWeatherData", { success: false, error: error.message });
      }
    });

    // Handle request for climate prediction
    socket.on("getPrediction", async (hoursAhead = 6) => {
      try {
        if (fullReadingsHistory.length >= 5) {
          const prediction = predictFromRecentData(fullReadingsHistory, hoursAhead);
          socket.emit("climatePrediction", prediction);
        } else {
          socket.emit("climatePrediction", { 
            success: false, 
            message: "Insufficient data for prediction. Please wait for more readings." 
          });
        }
      } catch (error) {
        console.error('Prediction error:', error.message);
        socket.emit("climatePrediction", { success: false, message: error.message });
      }
    });

    // Handle alert acknowledgment
    socket.on("acknowledgeAlert", async (alertId) => {
      if (socket.userId) {
        const result = await acknowledgeAlert(alertId, socket.userId);
        socket.emit("alertAcknowledged", { success: !!result, alertId });
      } else {
        socket.emit("alertAcknowledged", { success: false, message: "Authentication required" });
      }
    });

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
      unregisterSocket(socket.id);
      clearInterval(dataInterval);
    });
  });
}

function getSensorHistory() {
  return sensorHistory;
}

function getCurrentReadings() {
  return latestReadings;
}

module.exports = { initSocket, getSensorHistory, getCurrentReadings };