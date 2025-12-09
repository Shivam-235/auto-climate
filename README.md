

# 🌍 Auto Climate Monitoring System

![Node.js](https://img.shields.io/badge/Node.js-18.x-green)
![React](https://img.shields.io/badge/React-Vite-blue)
![Socket.IO](https://img.shields.io/badge/WebSockets-Socket.IO-black)
![License](https://img.shields.io/badge/License-MIT-brightgreen)
![Status](https://img.shields.io/badge/Status-Active-success)

A **real-time Auto Climate Monitoring Dashboard** that tracks and visualizes **temperature, humidity, air quality (AQI), CO₂, PM2.5**, and **live weather conditions** with **interactive maps and live charts**.

This project is fully **full-stack**, built for **smart cities, IoT dashboards, air pollution monitoring, and climate research**.

---

## 🚀 Live Features

✅ Real-time sensor simulation via **Socket.IO**  
✅ Live weather data via **OpenWeather API**  
✅ Interactive **Map View (Leaflet)**  
✅ AQI, PM2.5, and CO₂ monitoring  
✅ Auto-refreshing live charts  
✅ Clean modern responsive UI  
✅ Scalable full-stack architecture  
✅ Ready for Docker & cloud deployment  

---

## 🧠 Use Cases

- 🏙️ Smart City Climate Monitoring  
- 🏭 Industrial Air Quality Tracking  
- 🏫 Smart Campus Environment Monitoring  
- 🧪 Environmental Research Projects  
- 📊 IoT Data Visualization Systems  

---

## 🛠️ Tech Stack

### Frontend
- ⚛️ React (Vite)
- 🎨 Tailwind CSS
- 📊 Chart.js
- 🗺️ Leaflet
- 🔌 Socket.IO Client

### Backend
- 🟢 Node.js
- 🚂 Express.js
- 🔌 Socket.IO
- ☁️ OpenWeather API
- 🔐 Dotenv (Environment Variables)

---

## 📸 Screenshots (Add Your Own)

> 📌 Add screenshots inside a `/screenshots` folder

```md
![Dashboard](screenshots/dashboard.png)
![Map View](screenshots/map.png)
![AQI Chart](screenshots/aqi.png)

📁 Project Structure
auto-climate/
├── backend/
│   ├── server.js
│   ├── socket.js
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   ├── index.html
│   └── vite.config.js
│
└── README.md

⚙️ Installation & Setup
1️⃣ Clone Repository
git clone https://github.com/your-username/auto-climate.git
cd auto-climate

2️⃣ Backend Setup
cd backend
npm install


Create a .env file:

PORT=4000
FRONTEND_URL=http://localhost:5173
OPENWEATHER_API_KEY=YOUR_API_KEY_HERE


Run backend:

npm run dev


Backend runs at:

http://localhost:4000

3️⃣ Frontend Setup
cd frontend
npm install
npm run dev


Frontend runs at:

http://localhost:5173

🔄 Real-Time Data Flow
OpenWeather API → Backend → Socket.IO → React Dashboard

📡 API Endpoints
Method	Endpoint	Description
GET	/api/sensors/current	Get current climate data
GET	/api/sensors/history	Get sensor history
GET	/api/status	Backend + socket status
GET	/health	Server health check
📊 Data Metrics Tracked

🌡️ Temperature (°C)

💧 Humidity (%)

🌫️ Air Quality Index (AQI)

🧪 CO₂ Levels (ppm)

🏭 PM2.5 Concentration (µg/m³)

🌍 Latitude & Longitude

🌬️ Wind Speed & Pressure

🔔 Upcoming Features

✅ Threshold-based danger alerts

✅ Browser notifications

✅ Database support (Postgres/Mongo)

✅ User authentication

✅ Admin monitoring panel

✅ AI-based climate prediction

✅ Progressive Web App (PWA)

✅ Cloud deployment (Render / AWS / Vercel)
