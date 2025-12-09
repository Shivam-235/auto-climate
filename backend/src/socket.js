const { getFullWeatherData, setLocation, searchCities, getAvailableCities, getWeatherByCoords } = require("./services/weatherService");

// In-memory store for sensor data history (derived from weather API data)
let sensorHistory = {
  temperature: [],
  humidity: [],
  co2: [],
  pm25: [],
};

const MAX_HISTORY = 20; // Keep last 20 readings

// Store latest readings for API access
let latestReadings = {
  temperature: 25,
  humidity: 60,
  co2: 400,
  pm25: 25,
  timestamp: new Date().toISOString(),
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
    console.log(`Client connected: ${socket.id}`);

    // Send initial data (async)
    try {
      const weatherData = await getFullWeatherData();
      const sensorData = updateSensorHistory(weatherData);
      socket.emit("sensorData", sensorData);
      socket.emit("sensorHistory", sensorHistory);
      socket.emit("weatherData", weatherData);
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

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
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