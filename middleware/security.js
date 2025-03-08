const helmet = require('helmet');
const morgan = require('morgan');
const { logger, getCallerInfo } = require('../utils/logger');
const siteConfig = require('../config/siteConfig');

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
const responseLoggingMiddleware = function(req, res, next) {
  const startTime = Date.now();
  const originalEnd = res.end;
  res.end = function(chunk, encoding, callback) {
    const responseTime = Date.now() - startTime;
    const info = req.callerInfo || { file: 'unknown', lineNumber: 'unknown' };
    logger.info(`Response for ${req.method} ${req.url} - Status: ${res.statusCode}, Time: ${responseTime}ms [${info.file}:${info.lineNumber}]`);
    res.end = originalEnd;
    res.end(chunk, encoding, callback);
  };
  next();
};

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
const securityMiddleware = function() {
// Define the custom token with a new name: 'origin'
  morgan.token('origin', function(req, res) {
    const info = req.callerInfo || res.locals.callerInfo || { file: 'unknown', line: 'unknown' };
    return `${info.file}:${info.line}`;
  });

  // Update the format string to use [:origin]
  const customMorganFormat = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" [:origin]';

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
