const express = require('express');

const router = express.Router();
const siteConfig = require('../config/siteConfig');
const { logger } = require('../utils/logger');

/**
 * Explicit 404 Route: Handles requests to the '/404' path by
 * rendering an error page with a 404 status code. This route
 * is typically used for testing or redirecting to a custom
 * 404 page explicitly.
 * @param {Request} req - The Express request object
 * @param {Response} res - The Express response object
 * @returns {void} - Renders the 'pages/error' template with 404 details
 * @route GET /404
 * @example
 *   // Accessing /404
 *   // Response: Renders error page with "Page Not Found" message
 */
router.get('/404', (req, res) => {
  res.status(404).render('pages/error', {
    error: { status: 404, message: 'Page Not Found' },
    site: siteConfig.site,
    components: siteConfig.site.components
  });
});

/**
 * Catch-all Route for Undefined Paths: Captures all unmatched
 * routes and renders an error page with a 404 status code.
 * This acts as a fallback for any path not handled by other
 * defined routes in the application.
 * @param {Request} req - The Express request object
 * @param {Response} res - The Express response object
 * @returns {void} - Renders the 'pages/error' template with 404 details
 * @route GET *
 * @example
 *   // Accessing /nonexistent/path
 *   // Response: Renders error page with "Page Not Found" message
 */
router.get('*', (req, res) => {
  res.status(404).render('pages/error', {
    error: { status: 404, message: 'Page Not Found' },
    site: siteConfig.site,
    components: siteConfig.site.components
  });
});

/**
 * General Error Handler: This middleware function is called
 * when an error is passed to next() in another middleware
 * function. It logs the error and renders the error page with
 * a status code (defaulting to 500 if not specified).
 * In Express, error-handling middleware must follow the
 * signature (err, req, res, next) with four parameters,
 * where err is the first argument.
 * @param {Error} err - The error object
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 * @param {Function} next - The next middleware function
 * @returns {void} - Renders the 'pages/error' template with error details
 * @see {@link https://expressjs.com/en/guide/error-handling.html}
 * @example
 *   // In another route: next(new Error('Something broke'))
 *   // Response: Renders error page with 500 status and error message
 */
router.use((err, req, res, next) => {
  logger.error(err.stack);

  // Use err.status if provided, otherwise default to 500
  const statusCode = err.status || 500;

  res.status(statusCode).render('pages/error', {
    error: {
      status: statusCode,
      message: err.message || 'Internal Server Error',
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined // Optional stack trace in dev
    },
    site: siteConfig.site,
    components: siteConfig.site.components
  });
});

module.exports = router;
