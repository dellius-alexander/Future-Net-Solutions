// Error Classes
const {logger} = require('./logger');

/**
 * BaseError class to extend custom error classes
 * @class BaseError
 * @extends Error
 * @param {string} message - Error message
 * @example throw new BaseError('Custom error message');
 */
class BaseError extends Error {
  constructor (message) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Custom error class for SASSVariablesError
 * @class SASSVariablesError
 * @extends BaseError
 * @param {string} message - Error message
 * @example throw new SASSVariablesError('Error generating SCSS variables');
 */
class SASSVariablesError extends BaseError {
  constructor (message) {
    super(message);
  }
}

/**
 * Custom error class for SiteConfigError
 * @class SiteConfigError
 * @extends BaseError
 * @param {string} message - Error message
 * @example throw new SiteConfigError('Error loading site config');
 */
class SiteConfigError extends BaseError {
  constructor (message) {
    super(message);
  }
}

/**
 * Custom error class for ServerError
 * @class ServerError
 * @extends BaseError
 * @param {string} message - Error message
 * @example throw new ServerError('Server error occurred');
 */
class ServerError extends BaseError {
  constructor (message) {
    super(message);
  }
}

/**
 * Custom error class for SSLError
 * @class SSLError
 * @extends BaseError
 * @param {string} message - Error message
 * @param {string} code - Error code
 * @example throw new SSLError('Failed to generate SSL certificates', 'SSL_GENERATION_FAILED');
 * @example throw new SSLError('Failed to generate SSL certificates');
 */
class SSLError extends BaseError {
  constructor (message, code = 'SSL_ERROR') {
    super(message);
    this.name = 'SSLError';
    this.code = code;
  }
}

/**
 * Handles server errors by logging the error and exiting the process.
 * @param {Error} error - The error that occurred.
 */
function handleServerError (error) {
  if (error instanceof SASSVariablesError) {
    logger.error('Error generating SCSS variables: ', error);
  } else if (error instanceof ServerError) {
    logger.error('Server error occurred: ', error);
  } else if (error instanceof BaseError) {
    logger.error('Base error occurred: ', error);
  } else {
    logger.error('Unexpected error: ', error);
  }
  // process.exit(1);
}



module.exports = {
  BaseError,
  SASSVariablesError,
  SiteConfigError,
  ServerError,
  SSLError,
  handleServerError
};
