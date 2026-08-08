const app = require("./src/app");
const logger = require("./src/config/logger");
const connectDB = require("./src/config/db");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
};

startServer();