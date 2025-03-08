const {
  describe,
  afterAll,
  it,
  beforeAll,
  expect
} = require('@jest/globals');
const fs = require('fs'); // Added for SSL file checking
const http = require('http');
const https = require('https'); // Added for production mode
const path = require('path');
const request = require('supertest');

const app = require('../server'); // Adjust path as necessary
const {logger} = require('../utils/logger'); // For logging test errors
const { sslOptions, cfg } = require('../utils/sslOptions');

describe('Server Initialization', () => {
  let server;

  beforeAll((done) => {
    // Determine environment and server type
    const isProduction = process.env.NODE_ENV === 'production';

    if (isProduction) {
      // Check SSL files exist for production testing
      const sslFilesExist = ['ca', 'cert', 'key'].every((key) => {
        const filePath = path.resolve(process.env[key.toUpperCase() + '_FILE'] || sslOptions[key]);
        return fs.existsSync(filePath);
      });

      if (!sslFilesExist) {
        logger.error('SSL files missing in production mode for testing');
        done(new Error('SSL files required for production tests are missing'));
        return;
      }

      // Create HTTPS server for production
      server = https.createServer(sslOptions, app);
    } else {
      logger.info('Server running in development mode');
      // Create HTTP server for development
      server = http.createServer(app);
    }

    // Start server and handle errors
    server.listen(cfg.port, cfg.hostname, (err) => {
      if (err) {
        logger.error(`Failed to start server for testing: ${err.stack}`);
        done(err);
      } else {
        done();
      }
    });
  });

  afterAll((done) => {
    if (server) {
      server.close((err) => {
        if (err) {
          logger.error(`Failed to close server: ${err.stack}`);
        }
        done(err);
      });
    } else {
      done();
    }
  });

  it('should respond with 200 status code on the root path', async () => {
    try {
      const response = await request(server)
        .get('/')
        .expect(200); // Use .expect() for explicit status check
      expect(response.status).toBe(200);
    } catch (error) {
      logger.error(`Test failed for root path: ${error.stack}`);
      throw error;
    }
  });

  it('should respond with 404 status code on an unknown path', async () => {
    try {
      const response = await request(server)
        .get('/nonexistent')
        .expect(404); // Expect 404 for unknown routes
      expect(response.status).toBe(404);
    } catch (error) {
      logger.error(`Test failed for unknown path: ${error.stack}`);
      throw error;
    }
  });
});
