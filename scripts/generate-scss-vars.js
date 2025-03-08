require('dotenv').config();
const fs = require('fs');
const path = require('path');
const siteConfig = require('../config/siteConfig');
const {logger} = require('../utils/logger');

// Project root directory (assuming logger.js is in utils/)
const ROOT_DIR = path.resolve(__dirname, '..');

const createSASSVariables = () => {
  const variables = siteConfig.site.settings.theme;

  // Theme Variables (from FutureNetTelecomSolutionsInc.yaml)
  const scssContent = `// Theme Variables (from FutureNetTelecomSolutionsInc.yaml)
$primary-color: ${variables.primary_color}; // Blue for buttons, links, headings
$secondary-color: ${variables.secondary_color}; // White for backgrounds
$accent-color: ${variables.accent_color || '#00CC66'};  // Green for highlights/hover
$background-color: ${variables.background_color || '#010615'};  // Dark blue for headers/footers
$text-color: ${variables.text_color || '#333'}; // Default text color
$link-color: ${variables.link_color || variables.primary_color};  // Matches primary color
$link-hover-color: ${variables.link_hover_color || variables.accent_color}; // Green for hover (using accent)
$font-family: ${variables.font_family}; // From site.settings.theme.font_family
`;

  logger.info(`SCSS Variables: \n${scssContent}`);

  fs.writeFileSync(
    path.join(ROOT_DIR, 'public/assets/scss/_variables.scss'),
    scssContent,
    'utf8'

  );

  logger.info('SCSS variables generated from siteConfig.');

};

module.exports = createSASSVariables;
