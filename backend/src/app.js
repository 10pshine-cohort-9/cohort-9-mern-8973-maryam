require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pinoHttp = require("pino-http");

const logger = require("./config/logger");
const healthRoutes = require("./routes/health.routes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(pinoHttp({ logger }));

// Routes
app.use("/api/health", healthRoutes);

// Global Error Handler
app.use(errorHandler);

module.exports = app;