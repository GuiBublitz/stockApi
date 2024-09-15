const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, errors } = format;

let io;

const logFormat = printf(({ level, message, timestamp, stack, user }) => {
  const logMessage = `${timestamp} ${level}: ${user ? `[User: ${user}] ` : ''}${stack || message}`;

  if (io) {
    io.emit('logs', [logMessage]);
  }

  return logMessage;
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

logger.setIo = (socketIoInstance) => {
  io = socketIoInstance;
};

module.exports = logger;
