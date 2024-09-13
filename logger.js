const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, errors } = format;

const logFormat = printf(({ level, message, timestamp, stack, user }) => {
  return `${timestamp} ${level}: ${user ? `[User: ${user}] ` : ''}${stack || message}`;
});

const logger = createLogger({
  level: 'info',
  format: combine(
    timestamp(),
    errors({ stack: true }),
    logFormat
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'error.log', level: 'error' }),
    new transports.File({ filename: 'combined.log' })
  ]
});

logger.withUser = (user) => {
  return {
    info: (message) => logger.info(message, { user }),
    error: (message) => logger.error(message, { user }),
    warn: (message) => logger.warn(message, { user }),
    debug: (message) => logger.debug(message, { user }),
  };
};

module.exports = logger;
