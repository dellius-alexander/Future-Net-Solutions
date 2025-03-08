const {logger} = require('../utils/logger');

// Test the logger (example usage from project files)
function testLogger () {
  logger.info('Logger initialized...');
  logger.debug('Processing request...');
  logger.warn('Potential issue detected...');
  logger.error('Error occurred...');
}

// Simulate usage from a project file (e.g., siteController.js)
if (process.env.NODE_ENV !== 'production') {
  testLogger();
}
