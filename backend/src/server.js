const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const apiRoutes = require("./routes/api");
const { initSocket } = require("./socket");

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

app.use(cors());
app.use(express.json());

// API Routes
app.use("/api", apiRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Initialize Socket.IO
initSocket(io);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.IO enabled for real-time sensor data`);
});
