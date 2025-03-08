const express = require('express');

const router = express.Router();
const siteConfig = require('../config/siteConfig');
const {logger} = require('../utils/logger');

// Explicit 404 Route
router.get('/404', (req, res) => {
  res.status(404).render('pages/error', {
    error: { status: 404, message: 'Page Not Found' },
    site: siteConfig.site,
    components: siteConfig.site.components
  });
});

// Catch-all Route for Undefined Paths
router.get('*', (req, res) => {
  res.status(404).render('pages/error', {
    error: { status: 404, message: 'Page Not Found' },
    site: siteConfig.site,
    components: siteConfig.site.components
  });
});

// General Error Handler
router.use((req, res, next, err) => {
  logger.error(err.stack);
  res.status(500).render('pages/error', {
    error: { status: 500, message: 'Internal Server Error' },
    site: siteConfig.site,
    components: siteConfig.site.components
  });
});

module.exports = router;
