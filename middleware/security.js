const helmet = require('helmet');
const morgan = require('morgan'); // Import morgan explicitly
const {logger, getCallerInfo} = require('../utils/logger'); // Import custom logger
const siteConfig = require('../config/siteConfig');

// // Custom morgan token for caller info
// morgan.token('caller', () => {
//   const { file, lineNumber } = getCallerInfo(); // Use logger's getCallerInfo
//   return `${file}:${lineNumber}`;
// });

// Custom middleware to log responses
const responseLoggingMiddleware = (req, res, next) => {
  const startTime = Date.now();

  // Capture the original end method to log after response
  const originalEnd = res.end;
  res.end = function (chunk, encoding, callback) {
    const responseTime = Date.now() - startTime;
    const { file, lineNumber } = getCallerInfo();
    logger.info(`Response for ${req.method} ${req.url} - Status: ${res.statusCode}, Time: ${responseTime}ms [${file}:${lineNumber}]`);
    res.end = originalEnd; // Restore the original end method
    res.end(chunk, encoding, callback);
  };

  next();
};
// Custom morgan format for logging requests with caller info
const customMorganFormat = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" [:caller]';

// Custom stream for morgan to use logger
const morganStream = {
  write: (message) => {
    // Remove newline and parse the morgan message
    logger.info(message.trim()); // Log to combined log with caller info
  }
};


/**
 * @description Security middleware including HTTP logging
 * @return {Array<Function>} Array of middleware functions
 */
const securityMiddleware = () => {
  return [
    // HTTP request logging middleware
    morgan(customMorganFormat, { stream: morganStream }),
    responseLoggingMiddleware,
    // Security middleware from helmet
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
