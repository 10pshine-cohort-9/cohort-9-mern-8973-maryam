const app = require("./src/app");
const logger = require("./src/config/logger");
const connectDB = require("./src/config/db");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
  await connectDB();

  app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();