require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pinoHttp = require("pino-http");

const logger = require("./config/logger");
const healthRoutes = require("./routes/health.routes");
const errorHandler = require("./middleware/errorHandler");
const authRoutes = require("./routes/auth.routes");
const notesRoutes = require("./routes/notes.routes");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { method: req.method, url: req.url };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  })
);

//Routes
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/notes", notesRoutes);

// Handle unknown routes (404)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;