const helmet = require('helmet');
const morgan = require('morgan');
const { logger, getCallerInfo } = require('../utils/logger');
const siteConfig = require('../config/siteConfig');

//
/**
 * Custom middleware to log responses. This middleware captures the caller info
 * at the start of the request for better accuracy and logs the response time
 * after the response is sent.
 * @name responseLoggingMiddleware
 * @description Middleware to log responses with caller info
 * @param req The request object
 * @param res The response object
 * @param next The next middleware function
 */
const responseLoggingMiddleware = (req, res, next) => {
  const startTime = Date.now();

  // Store caller info at the start of the request for better accuracy
  const callerInfo = getCallerInfo();

  // Capture the original end method to log after response
  const originalEnd = res.end;
  res.end = function (chunk, encoding, callback) {
    const responseTime = Date.now() - startTime;
    const { file, lineNumber } = callerInfo; // Use captured info
    logger.info(`Response for ${req.method} ${req.url} - Status: ${res.statusCode}, Time: ${responseTime}ms [${file}:${lineNumber}]`);
    res.end = originalEnd; // Restore original method
    res.end(chunk, encoding, callback);
  };

  next();
};

// Custom morgan format for logging requests with caller info
const customMorganFormat = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" [:caller]';

// Custom stream for morgan to use logger
const morganStream = {
  write: (message) => {
    logger.info(message.trim());
  }
};

/**
 * @description Security middleware including HTTP logging
 * @return {Array<Function>} Array of middleware functions
 */
const securityMiddleware = () => {
  return [
    morgan(customMorganFormat, { stream: morganStream }),
    responseLoggingMiddleware,
    helmet.contentSecurityPolicy({
      directives: siteConfig.site.content_security_policy
    }),
    helmet.referrerPolicy({ policy: 'no-referrer' }),
    helmet.hsts({ maxAge: 31536000, includeSubDomains: true }),
    helmet.noSniff(),
    helmet.xssFilter()
  ];
};

module.exports = securityMiddleware;
