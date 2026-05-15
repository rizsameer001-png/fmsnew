const logger = require('./logger');

// Custom error class
class AppError extends Error {
  constructor(message, statusCode, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Handle MongoDB duplicate key error
const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyPattern)[0];
  const message = `${field} already exists`;
  return new AppError(message, 409);
};

// Handle MongoDB validation error
const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map(e => e.message);
  return new AppError('Validation error', 400, errors);
};

// Handle JWT errors
const handleJWTError = () => new AppError('Invalid token', 401);
const handleJWTExpiredError = () => new AppError('Token expired', 401);

// Handle CastError (invalid ObjectId)
const handleCastError = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  
  // Log error
  logger.error(`${err.statusCode || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  
  // Handle specific errors
  if (err.code === 11000) error = handleDuplicateKeyError(err);
  if (err.name === 'ValidationError') error = handleValidationError(err);
  if (err.name === 'JsonWebTokenError') error = handleJWTError();
  if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();
  if (err.name === 'CastError') error = handleCastError(err);
  
  const statusCode = error.statusCode || 500;
  const response = {
    success: false,
    message: error.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    ...(error.errors && { errors: error.errors })
  };
  
  res.status(statusCode).json(response);
};

// Async wrapper to catch errors
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

// Not found handler
const notFound = (req, res, next) => {
  const error = new AppError(`Cannot find ${req.originalUrl} on this server`, 404);
  next(error);
};

module.exports = {
  AppError,
  errorHandler,
  catchAsync,
  notFound
};