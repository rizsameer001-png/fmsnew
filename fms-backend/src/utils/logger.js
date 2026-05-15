const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Create logs directory if it doesn't exist
const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Define console format
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} ${level}: ${message}`;
    if (Object.keys(meta).length > 0 && meta.stack) {
      log += ` ${meta.stack}`;
    } else if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta)}`;
    }
    return log;
  })
);

// Create logger instance
const winstonLogger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  transports: [
    // Error log file
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Combined log file
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880,
      maxFiles: 5,
    }),
  ],
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  winstonLogger.add(new winston.transports.Console({
    format: consoleFormat,
  }));
}

// Create a wrapper object with all logging methods
const logger = {
  info: (message, ...meta) => {
    winstonLogger.info(message, ...meta);
  },
  error: (message, ...meta) => {
    winstonLogger.error(message, ...meta);
  },
  warn: (message, ...meta) => {
    winstonLogger.warn(message, ...meta);
  },
  debug: (message, ...meta) => {
    winstonLogger.debug(message, ...meta);
  },
  verbose: (message, ...meta) => {
    winstonLogger.verbose(message, ...meta);
  },
  silly: (message, ...meta) => {
    winstonLogger.silly(message, ...meta);
  },
};

// Create a stream for Morgan
const morganStream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

// Log request start
const logRequest = (req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl} - IP: ${req.ip}`);
  next();
};

// Log response completion
const logResponse = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
  });
  next();
};

// Log database query (for debugging)
const logQuery = (query, params) => {
  if (process.env.NODE_ENV === 'development') {
    logger.debug(`DB Query: ${query}`, { params });
  }
};

// Log socket events
const logSocket = (event, data) => {
  logger.debug(`Socket Event: ${event}`, { data });
};

module.exports = {
  logger,
  morganStream,
  logRequest,
  logResponse,
  logQuery,
  logSocket
};