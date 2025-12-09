/**
 * Weather Service - Fetches real-time weather and air quality data
 * Uses OpenWeatherMap API for live data
 */

const axios = require('axios'); 

// Get API key dynamically to support hot-reload
const getApiKey = () => process.env.OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const GEO_URL = 'https://api.openweathermap.org/geo/1.0';

// City database for quick lookups and fallback
const cityDatabase = {
  "mumbai": { city: "Mumbai", country: "IN", lat: 19.076, lon: 72.8777, timezone: "Asia/Kolkata" },
  "delhi": { city: "Delhi", country: "IN", lat: 28.6139, lon: 77.209, timezone: "Asia/Kolkata" },
  "bangalore": { city: "Bangalore", country: "IN", lat: 12.9716, lon: 77.5946, timezone: "Asia/Kolkata" },
  "chennai": { city: "Chennai", country: "IN", lat: 13.0827, lon: 80.2707, timezone: "Asia/Kolkata" },
  "kolkata": { city: "Kolkata", country: "IN", lat: 22.5726, lon: 88.3639, timezone: "Asia/Kolkata" },
  "hyderabad": { city: "Hyderabad", country: "IN", lat: 17.385, lon: 78.4867, timezone: "Asia/Kolkata" },
  "pune": { city: "Pune", country: "IN", lat: 18.5204, lon: 73.8567, timezone: "Asia/Kolkata" },
  "ahmedabad": { city: "Ahmedabad", country: "IN", lat: 23.0225, lon: 72.5714, timezone: "Asia/Kolkata" },
  "jaipur": { city: "Jaipur", country: "IN", lat: 26.9124, lon: 75.7873, timezone: "Asia/Kolkata" },
  "lucknow": { city: "Lucknow", country: "IN", lat: 26.8467, lon: 80.9462, timezone: "Asia/Kolkata" },
  "new york": { city: "New York", country: "US", lat: 40.7128, lon: -74.006, timezone: "America/New_York" },
  "los angeles": { city: "Los Angeles", country: "US", lat: 34.0522, lon: -118.2437, timezone: "America/Los_Angeles" },
  "london": { city: "London", country: "GB", lat: 51.5074, lon: -0.1278, timezone: "Europe/London" },
  "paris": { city: "Paris", country: "FR", lat: 48.8566, lon: 2.3522, timezone: "Europe/Paris" },
  "tokyo": { city: "Tokyo", country: "JP", lat: 35.6762, lon: 139.6503, timezone: "Asia/Tokyo" },
  "sydney": { city: "Sydney", country: "AU", lat: -33.8688, lon: 151.2093, timezone: "Australia/Sydney" },
  "dubai": { city: "Dubai", country: "AE", lat: 25.2048, lon: 55.2708, timezone: "Asia/Dubai" },
  "singapore": { city: "Singapore", country: "SG", lat: 1.3521, lon: 103.8198, timezone: "Asia/Singapore" },
  "hong kong": { city: "Hong Kong", country: "HK", lat: 22.3193, lon: 114.1694, timezone: "Asia/Hong_Kong" },
  "berlin": { city: "Berlin", country: "DE", lat: 52.52, lon: 13.405, timezone: "Europe/Berlin" },
  "moscow": { city: "Moscow", country: "RU", lat: 55.7558, lon: 37.6173, timezone: "Europe/Moscow" },
  "cairo": { city: "Cairo", country: "EG", lat: 30.0444, lon: 31.2357, timezone: "Africa/Cairo" },
  "toronto": { city: "Toronto", country: "CA", lat: 43.6532, lon: -79.3832, timezone: "America/Toronto" },
  "san francisco": { city: "San Francisco", country: "US", lat: 37.7749, lon: -122.4194, timezone: "America/Los_Angeles" },
  "bangkok": { city: "Bangkok", country: "TH", lat: 13.7563, lon: 100.5018, timezone: "Asia/Bangkok" },
};

// Current location state
let currentLocation = cityDatabase["mumbai"];

// Cache for API responses (to avoid rate limiting)
let weatherCache = {
  data: null,
  timestamp: 0,
  cacheDuration: 60000, // 1 minute cache
};

// Function to get all available cities for search
function getAvailableCities() {
  return Object.values(cityDatabase).map(city => ({
    city: city.city,
    country: city.country,
    key: `${city.city.toLowerCase()}`
  }));
}

// Function to change location
async function setLocation(cityName) {
  const key = cityName.toLowerCase().trim();
  if (cityDatabase[key]) {
    currentLocation = cityDatabase[key];
    // Clear cache when location changes
    weatherCache.data = null;
    weatherCache.timestamp = 0;
    return { success: true, location: currentLocation };
  }
  
  // Try to find city via API
  const apiKey = getApiKey();
  try {
    const geoResponse = await axios.get(`${GEO_URL}/direct`, {
      params: {
        q: cityName,
        limit: 1,
        appid: apiKey,
      }
    });
    
    if (geoResponse.data && geoResponse.data.length > 0) {
      const city = geoResponse.data[0];
      currentLocation = {
        city: city.name,
        country: city.country,
        lat: city.lat,
        lon: city.lon,
        timezone: "UTC",
      };
      weatherCache.data = null;
      weatherCache.timestamp = 0;
      return { success: true, location: currentLocation };
    }
  } catch (error) {
    console.error('Geo API error:', error.message);
  }
  
  return { success: false, message: "City not found" };
}

// Function to search cities
async function searchCities(query) {
  const searchTerm = query.toLowerCase().trim();
  
  // First search local database
  const localResults = Object.values(cityDatabase)
    .filter(city => city.city.toLowerCase().includes(searchTerm))
    .map(city => ({
      city: city.city,
      country: city.country,
      key: city.city.toLowerCase()
    }));
  
  // If API key is available, also search via API
  const apiKey = getApiKey();
  if (apiKey && apiKey !== 'your_api_key_here') {
    try {
      const geoResponse = await axios.get(`${GEO_URL}/direct`, {
        params: {
          q: query,
          limit: 5,
          appid: apiKey,
        }
      });
      
      if (geoResponse.data) {
        const apiResults = geoResponse.data.map(city => ({
          city: city.name,
          country: city.country,
          key: city.name.toLowerCase(),
          lat: city.lat,
          lon: city.lon,
        }));
        
        // Merge results, removing duplicates
        const merged = [...localResults];
        apiResults.forEach(apiCity => {
          if (!merged.find(c => c.city.toLowerCase() === apiCity.city.toLowerCase())) {
            merged.push(apiCity);
          }
        });
        return merged;
      }
    } catch (error) {
      console.error('City search API error:', error.message);
    }
  }
  
  return localResults;
}

function calculateAQI(pm25) {
  if (pm25 <= 12) return { value: Math.round(pm25 * 4.17), level: "Good", color: "#22c55e" };
  if (pm25 <= 35.4) return { value: Math.round(50 + (pm25 - 12) * 2.1), level: "Moderate", color: "#eab308" };
  if (pm25 <= 55.4) return { value: Math.round(100 + (pm25 - 35.4) * 2.5), level: "Unhealthy for Sensitive", color: "#f97316" };
  if (pm25 <= 150.4) return { value: Math.round(150 + (pm25 - 55.4) * 0.53), level: "Unhealthy", color: "#ef4444" };
  if (pm25 <= 250.4) return { value: Math.round(200 + (pm25 - 150.4) * 0.5), level: "Very Unhealthy", color: "#7c3aed" };
  return { value: Math.round(300 + (pm25 - 250.4) * 0.5), level: "Hazardous", color: "#991b1b" };
}

function getWindDirection(degrees) {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

function formatSunTime(timestamp) {
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function getSunProgress(sunrise, sunset) {
  const now = Date.now() / 1000;
  if (now < sunrise) return 0;
  if (now > sunset) return 100;
  return Math.round(((now - sunrise) / (sunset - sunrise)) * 100);
}

function mapWeatherCondition(weatherId) {
  if (weatherId >= 200 && weatherId < 300) return { condition: 'thunderstorm', icon: '⛈️' };
  if (weatherId >= 300 && weatherId < 500) return { condition: 'rainy', icon: '🌧️' };
  if (weatherId >= 500 && weatherId < 600) return { condition: 'rainy', icon: '🌧️' };
  if (weatherId >= 600 && weatherId < 700) return { condition: 'snowy', icon: '❄️' };
  if (weatherId >= 700 && weatherId < 800) return { condition: 'foggy', icon: '🌫️' };
  if (weatherId === 800) return { condition: 'sunny', icon: '☀️' };
  if (weatherId > 800) return { condition: 'partly-cloudy', icon: '⛅' };
  return { condition: 'cloudy', icon: '☁️' };
}

// Fetch real weather data from OpenWeatherMap API
async function fetchWeatherData() {
  const { lat, lon } = currentLocation;
  const apiKey = getApiKey();
  
  try {
    // Fetch weather, air quality, and forecast in parallel
    const [weatherResponse, aqiResponse, forecastResponse] = await Promise.all([
      axios.get(`${BASE_URL}/weather`, {
        params: { lat, lon, appid: apiKey, units: 'metric' }
      }),
      axios.get(`${BASE_URL}/air_pollution`, {
        params: { lat, lon, appid: apiKey }
      }),
      axios.get(`${BASE_URL}/forecast`, {
        params: { lat, lon, appid: apiKey, units: 'metric', cnt: 40 }
      })
    ]);

    const weather = weatherResponse.data;
    const aqi = aqiResponse.data;
    const forecastData = forecastResponse.data;

    // Process AQI data
    const aqiComponents = aqi.list[0].components;
    const pm25 = aqiComponents.pm2_5 || 0;
    const calculatedAqi = calculateAQI(pm25);

    // Process 5-day forecast (take one reading per day)
    const dailyForecast = [];
    const seenDates = new Set();
    
    forecastData.list.forEach(item => {
      const date = new Date(item.dt * 1000);
      const dateKey = date.toDateString();
      
      if (!seenDates.has(dateKey) && dailyForecast.length < 5) {
        seenDates.add(dateKey);
        const { condition, icon } = mapWeatherCondition(item.weather[0].id);
        
        dailyForecast.push({
          day: date.toLocaleDateString('en-US', { weekday: 'short' }),
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          condition,
          icon,
          highTemp: Math.round(item.main.temp_max),
          lowTemp: Math.round(item.main.temp_min),
          precipitation: Math.round((item.pop || 0) * 100),
          humidity: item.main.humidity,
        });
      }
    });

    return {
      location: currentLocation,
      current: {
        temperature: Math.round(weather.main.temp * 10) / 10,
        feelsLike: Math.round(weather.main.feels_like * 10) / 10,
        humidity: weather.main.humidity,
        pressure: weather.main.pressure,
        visibility: Math.round((weather.visibility / 1000) * 10) / 10,
        uvIndex: 0, // UV index requires separate API call (One Call API)
        cloudCover: weather.clouds.all,
        description: weather.weather[0].description,
        icon: weather.weather[0].icon,
      },
      wind: {
        speed: Math.round(weather.wind.speed * 3.6 * 10) / 10, // Convert m/s to km/h
        direction: weather.wind.deg || 0,
        directionText: getWindDirection(weather.wind.deg || 0),
        gust: Math.round((weather.wind.gust || weather.wind.speed * 1.3) * 3.6 * 10) / 10,
      },
      aqi: {
        ...calculatedAqi,
        pm25: Math.round(aqiComponents.pm2_5 * 10) / 10,
        pm10: Math.round(aqiComponents.pm10 * 10) / 10,
        o3: Math.round(aqiComponents.o3 * 10) / 10,
        no2: Math.round(aqiComponents.no2 * 10) / 10,
        so2: Math.round(aqiComponents.so2 * 10) / 10,
        co: Math.round((aqiComponents.co / 1000) * 100) / 100, // Convert µg/m³ to ppm
      },
      sun: {
        sunrise: formatSunTime(weather.sys.sunrise),
        sunset: formatSunTime(weather.sys.sunset),
        dayProgress: getSunProgress(weather.sys.sunrise, weather.sys.sunset),
        isDaytime: Date.now() / 1000 >= weather.sys.sunrise && Date.now() / 1000 <= weather.sys.sunset,
      },
      forecast: dailyForecast,
      timestamp: new Date().toISOString(),
      isLiveData: true,
    };
  } catch (error) {
    console.error('OpenWeatherMap API error:', error.message);
    throw error;
  }
}

// Generate fallback simulated data
function generateSimulatedData() {
  const now = new Date();
  const sunrise = new Date(now);
  sunrise.setHours(6, 23, 0, 0);
  const sunset = new Date(now);
  sunset.setHours(18, 12, 0, 0);
  
  const dayStart = sunrise.getTime();
  const dayEnd = sunset.getTime();
  const current = now.getTime();
  let dayProgress = 0;
  if (current >= dayStart && current <= dayEnd) {
    dayProgress = ((current - dayStart) / (dayEnd - dayStart)) * 100;
  } else if (current > dayEnd) {
    dayProgress = 100;
  }

  const pm25 = 35 + (Math.random() - 0.5) * 20;
  const calculatedAqi = calculateAQI(pm25);

  return {
    location: currentLocation,
    current: {
      temperature: 25 + (Math.random() - 0.5) * 10,
      feelsLike: 26 + (Math.random() - 0.5) * 10,
      humidity: 60 + Math.round((Math.random() - 0.5) * 20),
      pressure: 1013 + Math.round((Math.random() - 0.5) * 10),
      visibility: 10,
      uvIndex: 5 + Math.round((Math.random() - 0.5) * 4),
      cloudCover: 40 + Math.round((Math.random() - 0.5) * 30),
    },
    wind: {
      speed: 12 + Math.round((Math.random() - 0.5) * 10),
      direction: Math.round(Math.random() * 360),
      directionText: 'SW',
      gust: 18 + Math.round((Math.random() - 0.5) * 8),
    },
    aqi: {
      ...calculatedAqi,
      pm25: Math.round(pm25 * 10) / 10,
      pm10: Math.round((55 + (Math.random() - 0.5) * 20) * 10) / 10,
      o3: Math.round((45 + (Math.random() - 0.5) * 15) * 10) / 10,
      no2: Math.round((25 + (Math.random() - 0.5) * 10) * 10) / 10,
      so2: Math.round((8 + (Math.random() - 0.5) * 5) * 10) / 10,
      co: Math.round((0.5 + (Math.random() - 0.5) * 0.3) * 100) / 100,
    },
    sun: {
      sunrise: sunrise.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      sunset: sunset.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      dayProgress: Math.round(dayProgress),
      isDaytime: current >= dayStart && current <= dayEnd,
    },
    forecast: generateSimulatedForecast(),
    timestamp: new Date().toISOString(),
    isLiveData: false,
  };
}

function generateSimulatedForecast() {
  const forecast = [];
  const conditions = ['sunny', 'partly-cloudy', 'cloudy', 'rainy', 'thunderstorm'];
  const conditionIcons = {
    'sunny': '☀️',
    'partly-cloudy': '⛅',
    'cloudy': '☁️',
    'rainy': '🌧️',
    'thunderstorm': '⛈️',
  };
  
  for (let i = 1; i <= 5; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const condition = conditions[Math.floor(Math.random() * conditions.length)];
    const highTemp = Math.round(25 + Math.random() * 6 - 2);
    const lowTemp = Math.round(highTemp - 5 - Math.random() * 4);
    
    forecast.push({
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      condition,
      icon: conditionIcons[condition],
      highTemp,
      lowTemp,
      precipitation: Math.round(Math.random() * 80),
      humidity: Math.round(50 + Math.random() * 30),
    });
  }
  
  return forecast;
}

// Track if we've already logged the API key status
let hasLoggedApiStatus = false;

// Main function to get weather data (with caching)
async function getFullWeatherData() {
  const now = Date.now();
  const apiKey = getApiKey();
  
  // Return cached data if still valid
  if (weatherCache.data && (now - weatherCache.timestamp) < weatherCache.cacheDuration) {
    return weatherCache.data;
  }
  
  // Check if API key is configured
  if (!apiKey || apiKey === 'your_api_key_here') {
    if (!hasLoggedApiStatus) {
      console.log('No API key configured, using simulated data');
      hasLoggedApiStatus = true;
    }
    return generateSimulatedData();
  }
  
  try {
    if (!hasLoggedApiStatus) {
      console.log('Fetching real-time weather data from OpenWeatherMap API');
      hasLoggedApiStatus = true;
    }
    const data = await fetchWeatherData();
    weatherCache.data = data;
    weatherCache.timestamp = now;
    console.log(`✓ Live weather data fetched for ${currentLocation.city}`);
    return data;
  } catch (error) {
    if (error.response?.status === 401) {
      console.error('API Key Error: Invalid or not yet activated (new keys take 2-10 mins to activate)');
    } else {
      console.error('Failed to fetch live data:', error.message);
    }
    return generateSimulatedData();
  }
}

// Fetch weather data for specific coordinates (for map clicks)
async function getWeatherByCoords(lat, lon) {
  const apiKey = getApiKey();
  
  if (!apiKey || apiKey === 'your_api_key_here') {
    throw new Error('API key not configured');
  }
  
  try {
    // Fetch weather, air quality, forecast, and reverse geocode in parallel
    const [weatherResponse, aqiResponse, forecastResponse, geoResponse] = await Promise.all([
      axios.get(`${BASE_URL}/weather`, {
        params: { lat, lon, appid: apiKey, units: 'metric' }
      }),
      axios.get(`${BASE_URL}/air_pollution`, {
        params: { lat, lon, appid: apiKey }
      }),
      axios.get(`${BASE_URL}/forecast`, {
        params: { lat, lon, appid: apiKey, units: 'metric', cnt: 40 }
      }),
      axios.get(`${GEO_URL}/reverse`, {
        params: { lat, lon, limit: 1, appid: apiKey }
      })
    ]);

    const weather = weatherResponse.data;
    const aqi = aqiResponse.data;
    const forecastData = forecastResponse.data;
    const geoData = geoResponse.data;

    // Get location name from reverse geocoding
    const locationName = geoData.length > 0 
      ? { city: geoData[0].name, country: geoData[0].country, lat, lon }
      : { city: `${lat.toFixed(2)}, ${lon.toFixed(2)}`, country: '', lat, lon };

    // Process AQI data
    const aqiComponents = aqi.list[0].components;
    const pm25 = aqiComponents.pm2_5 || 0;
    const calculatedAqi = calculateAQI(pm25);

    // Process 5-day forecast
    const dailyForecast = [];
    const seenDates = new Set();
    
    forecastData.list.forEach(item => {
      const date = new Date(item.dt * 1000);
      const dateKey = date.toDateString();
      
      if (!seenDates.has(dateKey) && dailyForecast.length < 5) {
        seenDates.add(dateKey);
        const { condition, icon } = mapWeatherCondition(item.weather[0].id);
        
        dailyForecast.push({
          day: date.toLocaleDateString('en-US', { weekday: 'short' }),
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          condition,
          icon,
          highTemp: Math.round(item.main.temp_max),
          lowTemp: Math.round(item.main.temp_min),
          precipitation: Math.round((item.pop || 0) * 100),
          humidity: item.main.humidity,
        });
      }
    });

    return {
      location: locationName,
      current: {
        temperature: Math.round(weather.main.temp * 10) / 10,
        feelsLike: Math.round(weather.main.feels_like * 10) / 10,
        humidity: weather.main.humidity,
        pressure: weather.main.pressure,
        visibility: Math.round((weather.visibility / 1000) * 10) / 10,
        uvIndex: 0,
        cloudCover: weather.clouds.all,
        description: weather.weather[0].description,
        icon: weather.weather[0].icon,
      },
      wind: {
        speed: Math.round(weather.wind.speed * 3.6 * 10) / 10,
        direction: weather.wind.deg || 0,
        directionText: getWindDirection(weather.wind.deg || 0),
        gust: Math.round((weather.wind.gust || weather.wind.speed * 1.3) * 3.6 * 10) / 10,
      },
      aqi: {
        ...calculatedAqi,
        pm25: Math.round(aqiComponents.pm2_5 * 10) / 10,
        pm10: Math.round(aqiComponents.pm10 * 10) / 10,
        o3: Math.round(aqiComponents.o3 * 10) / 10,
        no2: Math.round(aqiComponents.no2 * 10) / 10,
        so2: Math.round(aqiComponents.so2 * 10) / 10,
        co: Math.round((aqiComponents.co / 1000) * 100) / 100,
      },
      sun: {
        sunrise: formatSunTime(weather.sys.sunrise),
        sunset: formatSunTime(weather.sys.sunset),
        dayProgress: getSunProgress(weather.sys.sunrise, weather.sys.sunset),
        isDaytime: Date.now() / 1000 >= weather.sys.sunrise && Date.now() / 1000 <= weather.sys.sunset,
      },
      forecast: dailyForecast,
      timestamp: new Date().toISOString(),
      isLiveData: true,
    };
  } catch (error) {
    console.error('Error fetching weather by coords:', error.message);
    throw error;
  }
}

module.exports = { 
  getFullWeatherData, 
  setLocation, 
  searchCities, 
  getAvailableCities,
  getWeatherByCoords
};
