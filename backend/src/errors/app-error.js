/**
 * @file app-error.js
 * @module errors/appError
 * @description Defines a custom error class for application-wide error handling with support for HTTP status codes and error messages
 */

/**
 * Custom application error class extending the native Error
 */
class AppError extends Error {
  /**
   * Creates an instance of AppError
   */
  constructor(message, statusCode = 500) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    
    // Maintain proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

module.exports = AppError;
