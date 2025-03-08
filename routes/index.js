const express = require('express');

const router = express.Router();
const siteController = require('../controllers/siteController');

router.get('/', siteController.home);
router.get('/services', siteController.services);
router.get('/careers', siteController.careers);
router.get('/contact', siteController.contact);
router.get('/about', siteController.about);
router.get('/privacy', siteController.privacy);
router.get('/terms', siteController.terms);
router.get('/sitemap', siteController.sitemap);

module.exports = router;
