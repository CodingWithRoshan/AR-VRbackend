require("dotenv").config();
const http = require("http");
const app = require("./app");
const connectDB = require("./config/db");
const { attachRecordingSocket } = require("./websocket/recording.socket");

const PORT = process.env.PORT || 5000;

// connectDB();

// Wrap the Express app in a raw HTTP server so WebSocket can share the same port
const server = http.createServer(app);

attachRecordingSocket(server);

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🎥 WebSocket recording endpoint: ws://localhost:${PORT}/webrtc`);
});