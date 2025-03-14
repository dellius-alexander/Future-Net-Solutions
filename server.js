require('dotenv').config();
const http = require('http');
const https = require('https');
const path = require('path');

const {logger} = require('./utils/logger');
const securityMiddleware = require('./middleware/security');
const errorRoutes = require('./routes/error'); // Add error routes
const routes = require('./routes/index');
const { handleServerError } = require('./utils/errors');
const { sslOptions, cfg } = require('./utils/sslOptions');
const express = require('express');
const morgan = require("morgan");

// Create Express App
const app = express();


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(require('cookie-parser')());
app.use(require('cors')());
app.use(securityMiddleware());

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static Files
app.use('/assets', express.static(path.join(__dirname, 'public/assets'), {
  setHeaders: (res, path, stat) => {
    res.locals.callerInfo = { file: 'static', line: 'n/a' };
  }
}));
app.use('/', express.static(path.join(__dirname,'public/robots.txt'))); // Ensures robots.txt is accessible
app.use('/', express.static(path.join(__dirname,'public/sitemap.xml'))); // Ensures sitemap.xml is accessible

// In server.js, before your routes
app.use((req, res, next) => {
  if (!req.callerInfo) {
    req.callerInfo = { file: 'static', line: 'n/a' }; // Default for static files or unknown sources
  }
  next();
});

// Routes
app.use('/', routes);
app.use('/', errorRoutes); // Add error handling routes

/**
 * Start the server based on the environment.
 * @return {Promise<void>}
 */
async function startServer(){
  try {
    // Start Server based on environment
    const isProduction = process.env.NODE_ENV === 'production';

    logger.info(`Starting server in ${isProduction ? 'production' : 'development'} mode... ${isProduction}`);

    if (isProduction) {
      logger.info('Creating HTTPS server...');
      const server = https.createServer(sslOptions, app);
      server.listen(cfg.port, cfg.hostname, () => {
        logger.info(`Server running at https://${cfg.hostname}:${cfg.port}`);
      });
    } else {
      const server = http.createServer(app);
      server.listen(cfg.port, cfg.hostname, () => {
        logger.info(`Server running at http://${cfg.hostname}:${cfg.port}`);
      });
    }
  } catch (error) {
    handleServerError(error);
  }

}

startServer()
    .then(() => {
      logger.info('Server started successfully');
    })
    .catch((error) => {
        handleServerError(error);
    });
