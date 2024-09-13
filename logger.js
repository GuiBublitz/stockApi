const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, errors } = format;

// Define a format that will include the user information
const logFormat = printf(({ level, message, timestamp, stack, user }) => {
  return `${timestamp} ${level}: ${user ? `[User: ${user}] ` : ''}${stack || message}`;
});

// Create a Winston logger instance
const logger = createLogger({
  level: 'info', // Log at 'info' level or higher
  format: combine(
    timestamp(),
    errors({ stack: true }), // Log stack trace for errors
    logFormat
  ),
  transports: [
    new transports.Console(), // Log to the console
    new transports.File({ filename: 'error.log', level: 'error' }), // Log errors to a file
    new transports.File({ filename: 'combined.log' }) // Log all messages to a file
  ]
});

// Helper function to create logs with user info
logger.withUser = (user) => {
  return {
    info: (message) => logger.info(message, { user }),
    error: (message) => logger.error(message, { user }),
    warn: (message) => logger.warn(message, { user }),
    debug: (message) => logger.debug(message, { user }),
  };
};

module.exports = logger;
