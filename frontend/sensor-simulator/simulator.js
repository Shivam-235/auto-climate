/**
 * Sensor Simulator for Auto Climate Monitor
 * This script simulates sensor data by sending HTTP requests to the backend.
 * Run with: node simulator.js
 */

const BACKEND_URL = 'http://localhost:4000';

// Simulated sensor readings
let readings = {
  temperature: 22,
  humidity: 45,
  co2: 400,
  pm25: 12,
};

function generateReading() {
  // Simulate realistic sensor fluctuations
  readings = {
    temperature: Math.max(15, Math.min(35, 
      readings.temperature + (Math.random() - 0.5) * 3
    )),
    humidity: Math.max(20, Math.min(80, 
      readings.humidity + (Math.random() - 0.5) * 8
    )),
    co2: Math.max(300, Math.min(2000, 
      readings.co2 + (Math.random() - 0.5) * 100
    )),
    pm25: Math.max(0, Math.min(100, 
      readings.pm25 + (Math.random() - 0.5) * 10
    )),
  };

  return {
    temperature: Math.round(readings.temperature * 10) / 10,
    humidity: Math.round(readings.humidity),
    co2: Math.round(readings.co2),
    pm25: Math.round(readings.pm25 * 10) / 10,
    timestamp: new Date().toISOString(),
  };
}

async function checkBackend() {
  try {
    const response = await fetch(`${BACKEND_URL}/health`);
    const data = await response.json();
    console.log('Backend status:', data);
    return true;
  } catch (error) {
    console.error('Cannot connect to backend. Make sure the server is running.');
    return false;
  }
}

async function startSimulation() {
  console.log('=================================');
  console.log('  Auto Climate Sensor Simulator');
  console.log('=================================\n');

  const connected = await checkBackend();
  if (!connected) {
    console.log('\nStart the backend server first:');
    console.log('  cd backend && npm run dev\n');
    process.exit(1);
  }

  console.log('\nSimulating sensor data...');
  console.log('The backend generates its own simulated data via Socket.IO.');
  console.log('This simulator is for testing the API endpoints.\n');

  // Display simulated readings every 2 seconds
  setInterval(() => {
    const data = generateReading();
    console.log(`[${new Date().toLocaleTimeString()}] Sensor Reading:`);
    console.log(`  Temperature: ${data.temperature}°C`);
    console.log(`  Humidity: ${data.humidity}%`);
    console.log(`  CO2: ${data.co2} ppm`);
    console.log(`  PM2.5: ${data.pm25} µg/m³`);
    console.log('');
  }, 2000);
}

startSimulation();
