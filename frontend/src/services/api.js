import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Saved Locations API
export const locationsAPI = {
  getAll: async () => {
    const response = await axios.get(`${API_URL}/locations`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  add: async (location) => {
    const response = await axios.post(`${API_URL}/locations`, location, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  update: async (id, updates) => {
    const response = await axios.put(`${API_URL}/locations/${id}`, updates, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  delete: async (id) => {
    const response = await axios.delete(`${API_URL}/locations/${id}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  reorder: async (locationIds) => {
    const response = await axios.post(`${API_URL}/locations/reorder`, 
      { locationIds },
      { headers: getAuthHeader() }
    );
    return response.data;
  }
};

// Weather History API
export const weatherHistoryAPI = {
  getHistory: async (params = {}) => {
    const response = await axios.get(`${API_URL}/weather-history`, {
      headers: getAuthHeader(),
      params
    });
    return response.data;
  },

  addSnapshot: async (location, weatherData) => {
    const response = await axios.post(`${API_URL}/weather-history`, 
      { location, weatherData },
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  getTrends: async (city, days = 30) => {
    const response = await axios.get(`${API_URL}/weather-history/trends/${city}`, {
      headers: getAuthHeader(),
      params: { days }
    });
    return response.data;
  },

  cleanup: async (days = 90) => {
    const response = await axios.delete(`${API_URL}/weather-history/cleanup`, {
      headers: getAuthHeader(),
      params: { days }
    });
    return response.data;
  }
};

// Weather Alerts API
export const weatherAlertsAPI = {
  getAll: async (isActive) => {
    const response = await axios.get(`${API_URL}/weather-alerts`, {
      headers: getAuthHeader(),
      params: isActive !== undefined ? { isActive } : {}
    });
    return response.data;
  },

  create: async (alert) => {
    const response = await axios.post(`${API_URL}/weather-alerts`, alert, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  update: async (id, updates) => {
    const response = await axios.put(`${API_URL}/weather-alerts/${id}`, updates, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  delete: async (id) => {
    const response = await axios.delete(`${API_URL}/weather-alerts/${id}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  check: async (location, weatherData) => {
    const response = await axios.post(`${API_URL}/weather-alerts/check`, 
      { location, weatherData },
      { headers: getAuthHeader() }
    );
    return response.data;
  }
};

// Reverse Geocoding (get city name from coordinates)
export const reverseGeocode = async (lat, lon) => {
  console.log('[reverseGeocode] Called with lat:', lat, 'lon:', lon);
  try {
    const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY || '9655a6735e2260dc45cb2a24365e37c8';
    const url = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`;
    console.log('[reverseGeocode] API URL:', url);
    
    const response = await axios.get(url);
    console.log('[reverseGeocode] API Response:', response.data);
    
    if (response.data && response.data.length > 0) {
      const { name, country } = response.data[0];
      console.log('[reverseGeocode] Success! City:', name, 'Country:', country);
      return { city: name, country };
    }
    console.warn('[reverseGeocode] No data in response');
    return null;
  } catch (error) {
    console.error('[reverseGeocode] Error:', error.message);
    console.error('[reverseGeocode] Error details:', error);
    return null;
  }
};
