const express = require("express");
const helmet = require("helmet");
const cors = require("cors");

const { errorHandler } = require("./middlewares/error.middleware");

const app = express();

const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  }),
  helmet({
    frameguard: { action: "sameorigin" },
    noSniff: true,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https:"],
        styleSrc: ["'self'", "'unsafe-inline'", "https:"],
        imgSrc: ["'self'", "https:", "data:"],
        // Fixed: this now points at the port this server actually listens on
        // (was hardcoded to ws://localhost:8080, which matched nothing)
        connectSrc: ["'self'", `ws://localhost:${PORT}`, "wss:"],
      },
    },
  })
);

app.use(express.json());

// Routes


// Health check
app.get("/", (req, res) => {
  res.send("API is running");
});

// Error handling middleware
app.use(errorHandler);

module.exports = app;