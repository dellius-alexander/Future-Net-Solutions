// utils/logger.js
const path = require('path');
const stackTrace = require('stack-trace');
const { createLogger, format, transports } = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

const ROOT_DIR = path.resolve(__dirname, '..');

/**
 * Extracts caller info (file and line number) from the stack trace.
 * Prioritizes frames from project-specific directories, falls back to 'static' for static file requests,
 * and handles middleware or Express internals more gracefully.
 * @returns {Object} { file, lineNumber }
 */
const getCallerInfo = () => {
    try {
        const trace = stackTrace.get();
        // Find the first relevant frame
        const callerFrame = trace.find((frame) => {
            const fileName = frame.getFileName();
            return (
                fileName &&
                !fileName.includes('node_modules') &&
                !fileName.includes('winston') &&
                !fileName.includes('logger.js') &&
                !fileName.includes('security.js') &&
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
                )
            );
        }) || trace.find((frame) => {
            // Fallback for static files or middleware
            const fileName = frame.getFileName();
            return fileName && (fileName.includes('express') || fileName.includes('static'));
        }) || trace[4]; // Fallback to fifth frame if no better match

        const fullFileName = callerFrame.getFileName() || 'unknown';
        const fileName = path.basename(fullFileName);
        const lineNumber = callerFrame.getLineNumber() || 'unknown';

        if (fullFileName.includes('static') && req && req.path.match(/\.(css|js|png)$/)) {
            return { file: `static-${req.path.split('.').pop()}`, lineNumber: 'n/a' };
        }

        // Determine if it’s a project file or static/middleware
        const isProjectFile = fullFileName.startsWith(ROOT_DIR) &&
            !fullFileName.includes('node_modules') &&
            !fullFileName.includes('winston') &&
            !fullFileName.includes('logger.js') &&
            !fullFileName.includes('security.js') &&
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
                fullFileName.includes('server.js')
            );


        if (isProjectFile) {
            return { file: fileName, lineNumber };
        } else if (fullFileName.includes('express') || fullFileName.includes('static')) {
            return { file: 'static', lineNumber: 'n/a' }; // Indicate static file serving
        }



        return { file: 'unknown', lineNumber: 'unknown' };
    } catch (error) {
        return { file: 'unknown', lineNumber: 'unknown' };
    }
};

/**
 * Winston logger configuration with daily log rotation and exception handling.
 * Logs to 'logs/error.log' for error logs, 'logs/combined.log' for combined logs,
 * and 'logs/exceptions.log' for uncaught exceptions.
 * Supports log levels 'error', 'warn', 'info', 'http', 'verbose', 'debug', and 'silly'.
 * Defaults to 'info' level if not specified.
 * @type {winston.Logger}
 */
const logger = createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.errors({ stack: true }),
        format.splat(),
        format.json(),
        format.printf(({ timestamp, level, message }) => {
            const { file, lineNumber } = getCallerInfo();
            return `[${level}] [${timestamp}] [${file}:${lineNumber}] - ${message}`;
        })
    ),
    defaultMeta: { service: 'telco-solutions' },
    transports: [
        new transports.File({
            filename: path.join(ROOT_DIR, process.env.LOG_FILE_ERROR || 'logs/error.log'),
            level: 'error'
        }),
        new DailyRotateFile({
            filename: path.join(ROOT_DIR, process.env.LOG_FILE_COMBINED || 'logs/combined-%DATE%.log'),
            level: 'debug',
            datePattern: 'YYYY-MM-DD',
            maxFiles: '14d',
            maxSize: '20m',
            zippedArchive: true
        }),
        new DailyRotateFile({
            filename: path.join(ROOT_DIR, process.env.LOG_FILE_EXCEPTIONS || 'logs/exceptions-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            maxFiles: '30d',
            maxSize: '20m',
            zippedArchive: true,
            handleExceptions: true
        })
    ],
    exceptionHandlers: [
        new DailyRotateFile({
            filename: path.join(ROOT_DIR, process.env.LOG_FILE_EXCEPTIONS || 'logs/exceptions-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            maxFiles: '30d',
            maxSize: '20m',
            zippedArchive: true,
            handleExceptions: true
        })
    ],
    exitOnError: false
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(
        new transports.Console({
            format: format.combine(
                format.colorize({ all: true }),
                format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                format.errors({ stack: true }),
                format.splat(),
                format.json(),
                format.printf(({ timestamp, level, message }) => {
                    const { file, lineNumber } = getCallerInfo();
                    return `[${level}] [${timestamp}] [${file}:${lineNumber}] - ${message}`;
                })
            )
        })
    );
}

module.exports = { logger, getCallerInfo };
