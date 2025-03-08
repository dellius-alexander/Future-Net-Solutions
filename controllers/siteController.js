const siteConfig = require('../config/siteConfig');
const fs = require('fs');
const path = require('path');
const {logger} = require('../utils/logger');

const ROOT_DIR = path.resolve(__dirname, '..');

/**
 * Render the page with the given title, structure, and components.
 * @param req request object from the client
 * @param res response object to send back to the client
 * @param page the page to render
 * @param title the title of the page
 * @param next the next middleware function
 * @returns void
 * @example renderPage(req, res, 'homepage', 'Home');
 */
const renderPage = async (req, res, page, title, next) => {
  res
      .render(`pages/${page}`, {
    site: siteConfig.site,
    components: siteConfig.site.components,
    structure: siteConfig.site.structure[page],
    title: `${siteConfig.site.title} || ${title}`
  }, async (err, html) => {
    if (err) {
        logger.error(`Error rendering page: ${err}`);
        res.status(500).send('Internal Server Error');
        return next(err);
      } else {
      // Write the rendered page to a file
      await fs.writeFileSync(path.join(ROOT_DIR, 'public', `${page}.html`), Buffer.from(html), (error) => {
        if (error) {
          logger.error(`Error writing file: ${error}`);
            return next(error);
            }
      });
    }
    res
        .setHeader('Content-Type',
            [
                'text/html; charset=utf-8'
            ])
        .status(200)
        .send(html);
    });
};

exports.home = (req, res) => renderPage(req, res, 'index', 'Home'); // Home page
exports.services = (req, res) => renderPage(req, res, 'services', 'Services');
exports.careers = (req, res) => renderPage(req, res, 'careers', 'Careers');
exports.contact = (req, res) => renderPage(req, res, 'contact', 'Contact');
exports.about = (req, res) => renderPage(req, res, 'about', 'About');

// Add if needed, or remove from routes/index.js if not implemented
exports.privacy = (req, res) => renderPage(req, res, 'privacy', 'Privacy Policy');
exports.terms = (req, res) => renderPage(req, res, 'terms', 'Terms of Service');
exports.sitemap = (req, res) => renderPage(req, res, 'sitemap', 'Sitemap');

module.exports = exports;
