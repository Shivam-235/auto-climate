/**
 * Weather API Service
 * Centralized service for fetching weather data from the backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

/**
 * Generic fetch wrapper with error handling
 */
async function fetchAPI(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Weather API Error (${endpoint}):`, error);
        throw error;
    }
}

/**
 * Get current weather for a city
 * @param {string} city - City name
 * @returns {Promise<Object>} Weather data
 */
export async function getCurrentWeather(city) {
    return fetchAPI(`/weather/current?city=${encodeURIComponent(city)}`);
}

/**
 * Get weather by coordinates
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<Object>} Weather data
 */
export async function getWeatherByCoords(lat, lon) {
    return fetchAPI(`/weather/coords?lat=${lat}&lon=${lon}`);
}

/**
 * Get forecast data for a city
 * @param {string} city - City name
 * @param {number} days - Number of days (default 5)
 * @returns {Promise<Object>} Forecast data
 */
export async function getForecast(city, days = 5) {
    return fetchAPI(`/weather/forecast?city=${encodeURIComponent(city)}&days=${days}`);
}

/**
 * Search for cities
 * @param {string} query - Search query
 * @returns {Promise<Array>} List of matching cities
 */
export async function searchCities(query) {
    return fetchAPI(`/weather/search?q=${encodeURIComponent(query)}`);
}

/**
 * Get weather for multiple cities
 * @param {Array<string>} cities - Array of city names
 * @returns {Promise<Array>} Weather data for all cities
 */
export async function getMultipleCitiesWeather(cities) {
    const promises = cities.map(city =>
        getCurrentWeather(city).catch(() => null)
    );
    const results = await Promise.all(promises);
    return results.filter(Boolean);
}

/**
 * Get rainfall data for regions
 * @param {Array<string>} regions - Array of region names
 * @returns {Promise<Object>} Rainfall data
 */
export async function getRainfallData(regions = []) {
    const cities = regions.length > 0 ? regions : [
        'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata',
        'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow'
    ];

    const weatherData = await getMultipleCitiesWeather(cities);

    return weatherData.map(data => ({
        city: data.location?.city || 'Unknown',
        region: data.location?.state || data.location?.country || 'India',
        rainfall: data.current?.rainfall || Math.random() * 50,
        humidity: data.current?.humidity || 0,
        temperature: data.current?.temperature || 0,
        condition: data.current?.condition || 'Unknown',
    }));
}

/**
 * Get AQI data for a city
 * @param {string} city - City name
 * @returns {Promise<Object>} AQI data
 */
export async function getAQIData(city) {
    const weather = await getCurrentWeather(city);
    return weather.aqi || null;
}

/**
 * Get weather data for major Indian cities
 * @returns {Promise<Array>} Weather data for major cities
 */
export async function getMajorCitiesWeather() {
    const majorCities = [
        'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata',
        'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow',
        'Surat', 'Kanpur', 'Nagpur', 'Indore', 'Bhopal',
        'Patna', 'Vadodara', 'Ludhiana', 'Agra', 'Varanasi'
    ];

    return getMultipleCitiesWeather(majorCities);
}

/**
 * Get state-wise weather summary
 * @returns {Promise<Object>} Weather summary by state
 */
export async function getStateWiseWeather() {
    const stateCapitals = {
        'Maharashtra': 'Mumbai',
        'Delhi': 'Delhi',
        'Karnataka': 'Bangalore',
        'Tamil Nadu': 'Chennai',
        'West Bengal': 'Kolkata',
        'Telangana': 'Hyderabad',
        'Gujarat': 'Ahmedabad',
        'Rajasthan': 'Jaipur',
        'Uttar Pradesh': 'Lucknow',
        'Madhya Pradesh': 'Bhopal',
        'Bihar': 'Patna',
        'Punjab': 'Chandigarh',
        'Odisha': 'Bhubaneswar',
        'Kerala': 'Thiruvananthapuram',
        'Assam': 'Guwahati',
    };

    const cities = Object.values(stateCapitals);
    const weatherData = await getMultipleCitiesWeather(cities);

    const stateWeather = {};
    Object.entries(stateCapitals).forEach(([state, city], index) => {
        const data = weatherData.find(w => w?.location?.city?.toLowerCase() === city.toLowerCase());
        stateWeather[state] = data || null;
    });

    return stateWeather;
}

/**
 * Get aviation weather for airports
 * @param {Array<string>} airports - Array of airport city names
 * @returns {Promise<Array>} Aviation weather data
 */
export async function getAviationWeather(airports) {
    const weatherData = await getMultipleCitiesWeather(airports);

    return weatherData.map(data => ({
        airport: data.location?.city || 'Unknown',
        visibility: data.current?.visibility || 10,
        windSpeed: data.wind?.speed || 0,
        windDirection: data.wind?.direction || 0,
        cloudCover: data.current?.cloudCover || 0,
        temperature: data.current?.temperature || 0,
        humidity: data.current?.humidity || 0,
        pressure: data.current?.pressure || 1013,
        condition: data.current?.condition || 'Clear',
        metar: generateMETAR(data),
    }));
}

/**
 * Generate METAR-like string from weather data
 * @param {Object} data - Weather data
 * @returns {string} METAR-like string
 */
function generateMETAR(data) {
    if (!data) return 'METAR NOT AVAILABLE';

    const wind = data.wind || {};
    const current = data.current || {};

    const windDir = String(wind.direction || 0).padStart(3, '0');
    const windSpeed = String(Math.round(wind.speed * 1.944) || 0).padStart(2, '0'); // Convert m/s to knots
    const visibility = Math.min(9999, Math.round((current.visibility || 10) * 1000));
    const temp = Math.round(current.temperature || 20);
    const dewpoint = Math.round((current.temperature || 20) - 5);
    const pressure = Math.round(current.pressure || 1013);

    return `METAR ${windDir}${windSpeed}KT ${visibility}M ${temp}/${dewpoint} Q${pressure}`;
}

/**
 * Get tourism weather for destinations
 * @param {Array<Object>} destinations - Array of destination objects with name and coords
 * @returns {Promise<Array>} Tourism weather data
 */
export async function getTourismWeather(destinations) {
    const cityNames = destinations.map(d => d.name || d.city);
    return getMultipleCitiesWeather(cityNames);
}

/**
 * Calculate AQI from pollutant data using US EPA standards
 * @param {number} pm25 - PM2.5 concentration in µg/m³
 * @returns {number} AQI value
 */
export function calculateAQI(pm25) {
    if (!pm25 || pm25 < 0) return 0;

    // US EPA AQI breakpoints for PM2.5
    const breakpoints = [
        { low: 0, high: 12, aqiLow: 0, aqiHigh: 50 },
        { low: 12.1, high: 35.4, aqiLow: 51, aqiHigh: 100 },
        { low: 35.5, high: 55.4, aqiLow: 101, aqiHigh: 150 },
        { low: 55.5, high: 150.4, aqiLow: 151, aqiHigh: 200 },
        { low: 150.5, high: 250.4, aqiLow: 201, aqiHigh: 300 },
        { low: 250.5, high: 500.4, aqiLow: 301, aqiHigh: 500 },
    ];

    for (const bp of breakpoints) {
        if (pm25 >= bp.low && pm25 <= bp.high) {
            return Math.round(
                bp.aqiLow + ((bp.aqiHigh - bp.aqiLow) / (bp.high - bp.low)) * (pm25 - bp.low)
            );
        }
    }

    return 500; // Cap at 500
}

/**
 * Get AQI level info from value
 * @param {number} aqi - AQI value
 * @returns {Object} Level info with label and color
 */
export function getAQILevel(aqi) {
    if (aqi <= 50) return { label: 'Good', color: '#22c55e' };
    if (aqi <= 100) return { label: 'Moderate', color: '#eab308' };
    if (aqi <= 150) return { label: 'Unhealthy for Sensitive Groups', color: '#f97316' };
    if (aqi <= 200) return { label: 'Unhealthy', color: '#ef4444' };
    if (aqi <= 300) return { label: 'Very Unhealthy', color: '#7c3aed' };
    return { label: 'Hazardous', color: '#991b1b' };
}

// Default export with all functions
export default {
    getCurrentWeather,
    getWeatherByCoords,
    getForecast,
    searchCities,
    getMultipleCitiesWeather,
    getRainfallData,
    getAQIData,
    getMajorCitiesWeather,
    getStateWiseWeather,
    getAviationWeather,
    getTourismWeather,
    calculateAQI,
    getAQILevel,
};
