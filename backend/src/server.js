const app = require('./app');
const connectDB = require('./config/db');
const logger = require('./config/logger');
const { initSlaJob } = require('./jobs/slaCheckerJob');

const PORT = process.env.PORT || 5000;

// Connect Database & Start Server
connectDB().then(() => {
  // Start SLA Background Cron Job
  initSlaJob();

  const server = app.listen(PORT, () => {
    logger.info(`=================================================`);
    logger.info(`ResolveIT Backend Server running on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`API Docs: http://localhost:${PORT}/api-docs`);
    logger.info(`Metrics: http://localhost:${PORT}/metrics`);
    logger.info(`Health: http://localhost:${PORT}/health`);
    logger.info(`=================================================`);
  });

  // Handle Unhandled Rejections
  process.on('unhandledRejection', (err) => {
    logger.error(`Unhandled Rejection Error: ${err.message}`);
    server.close(() => process.exit(1));
  });
});
