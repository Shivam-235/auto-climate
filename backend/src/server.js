const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const { connectDB } = require("./config/database");
const apiRoutes = require("./routes/api");
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const alertRoutes = require("./routes/alerts");
const predictionRoutes = require("./routes/predictions");
const { initSocket } = require("./socket");
const { authenticateSocket } = require("./middleware/auth");

require("dotenv").config();

const app = express();
const server = http.createServer(app);

// Socket.IO setup with CORS
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:5174"],
    methods: ["GET", "POST"],
  },
});

// Socket.IO authentication middleware
io.use(authenticateSocket);

app.use(cors());
app.use(express.json());

// API Routes
app.use("/api", apiRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/predictions", predictionRoutes);

// Health check
app.get("/health", (req, res) => {
  const mongoose = require("mongoose");
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    uptime: process.uptime()
  });
});

// Initialize Socket.IO
initSocket(io);

// Connect to database and start server
const PORT = process.env.PORT || 4000;

const startServer = async () => {
  // Connect to MongoDB (non-blocking, app works without it)
  await connectDB();
  
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Socket.IO enabled for real-time sensor data`);
    console.log(`API endpoints available at http://localhost:${PORT}/api`);
  });
};

startServer();
