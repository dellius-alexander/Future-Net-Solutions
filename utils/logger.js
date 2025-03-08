// utils/logger.js (modified)
const path = require('path');
const stackTrace = require('stack-trace');
const { createLogger, format, transports } = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');


// Project root directory (assuming logger.js is in utils/)
const ROOT_DIR = path.resolve(__dirname, '..');

/**
 * Extracts caller info (file and line number) from the stack trace.
 * Prioritizes frames from project-specific directories (e.g., tests, controllers, routes),
 * skipping internal frames like winston, logger.js, and node_modules.
 * @returns {Object} { file, lineNumber }
 */
const getCallerInfo = () => {
    try {
        const trace = stackTrace.get();
        // Find the first frame outside of internal modules, logger.js, and node_modules
        const callerFrame = trace.find((frame) => {
            const fileName = frame.getFileName();
            return (
                fileName && // Ensure fileName exists
                !fileName.includes('node_modules') && // Exclude node_modules
                !fileName.includes('winston') && // Exclude Winston internals
                !fileName.includes('logger.js') && // Exclude this file
                !fileName.includes('security.js') && // Exclude this file
                (
                    fileName.includes('controllers') ||
                    fileName.includes('routes') ||
                    fileName.includes('middleware') ||
                    fileName.includes('services') ||
                    fileName.includes('utils') ||
                    fileName.includes('scripts') ||
                    fileName.includes('views') ||
                    fileName.includes('public') ||
                    fileName.includes('tests') ||
                    fileName.includes('config') ||
                    fileName.includes('server.js')
                ) // Add tests directory
            );
        }) || trace[4]; // Fallback to fourth[3]/firth[4] frame (caller of logger function, skipping logger.js and winston)

        // Extract details from the caller frame
        const fullFileName = callerFrame.getFileName() || 'unknown';
        const fileName = path.basename(fullFileName);
        const lineNumber = callerFrame.getLineNumber() || 'unknown';

        // Ensure it's a project file (additional validation)
        const isProjectFile = fullFileName.startsWith(ROOT_DIR) &&
            !fullFileName.includes('node_modules') && // Exclude node_modules
            !fullFileName.includes('winston') && // Exclude Winston internals
            !fullFileName.includes('logger.js') && // Exclude logger.js
            !fullFileName.includes('security.js') && // Exclude this file
            (
                fullFileName.includes('controllers') ||
                fullFileName.includes('routes') ||
                fullFileName.includes('middleware') ||
                fullFileName.includes('services') ||
                fullFileName.includes('utils') ||
                fullFileName.includes('scripts') ||
                fullFileName.includes('views') ||
                fullFileName.includes('public') ||
                fullFileName.includes('tests') ||
                fullFileName.includes('config') ||
                fullFileName.includes('server.js') // Add config directory
            );

        if (!isProjectFile) {
            return { file: 'unknown', lineNumber: 'unknown' };
        }

        return { file: fileName, lineNumber };
    } catch (error) {
        // console.log('Error getting caller info: ', error);
        return { file: 'unknown', lineNumber: 'unknown' };
    }
};

/**
 * Winston logger with daily rotating file transport.
 * Logs to error.log (error level), combined.log (info level), and exceptions.log (uncaught exceptions).
 * Console transport is added in non-production environments.
 * @type {winston.Logger}
 */
const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }), // Include stack traces for errors
    format.splat(), // Support string interpolation (e.g., %s)
    format.json(), // Base format as JSON for structured logging
    format.printf(({ timestamp, level, message }) => {
      const { file, lineNumber } = getCallerInfo();
      return `[${level}] [${timestamp}] [${file}:${lineNumber}] - ${message}`;
    })
  ),
  defaultMeta: { service: 'telco-solutions' },
  transports: [
    // Error log file (non-rotating)
    new transports.File({
      filename: path.join(ROOT_DIR, process.env.LOG_FILE_ERROR || 'logs/error.log'),
      level: 'error'
    }),
    // Combined log with daily rotation
    new DailyRotateFile({
      filename: path.join(ROOT_DIR, process.env.LOG_FILE_COMBINED || 'logs/combined-%DATE%.log'),
      level: 'debug',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d', // Keep logs for 14 days
      maxSize: '20m', // Rotate if file exceeds 20MB
      zippedArchive: true // Compress old logs
    }),
    // Exceptions log with daily rotation
    new DailyRotateFile({
      filename: path.join(ROOT_DIR, process.env.LOG_FILE_EXCEPTIONS || 'logs/exceptions-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxFiles: '30d', // Keep exceptions for 30 days
      maxSize: '20m',
      zippedArchive: true,
      handleExceptions: true // Handle uncaught exceptions
    })
  ],
  exceptionHandlers: [
    new DailyRotateFile({
      filename: path.join(ROOT_DIR, process.env.LOG_FILE_EXCEPTIONS || 'logs/exceptions-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxFiles: '30d',
      maxSize: '20m',
      zippedArchive: true,
      handleExceptions: true // Handle uncaught exceptions
    })
  ],
  exitOnError: false // Prevent process exit on uncaught exceptions
});

// Add console transport in non-production environments
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new transports.Console({
      format: format.combine(
        format.colorize({ all: true }),
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.errors({ stack: true }), // Include stack traces for errors
        format.splat(), // Support string interpolation (e.g., %s)
        // format.align(), // Align message timestamps
        format.json(), // Base format as JSON for structured logging
        format.printf(({ timestamp, level, message }) => {
          const { file, lineNumber } = getCallerInfo();
          return `[${level}] [${timestamp}] [${file}:${lineNumber}] - ${message}`;
        })
      )
    })
  );
}

module.exports = {logger, getCallerInfo};

