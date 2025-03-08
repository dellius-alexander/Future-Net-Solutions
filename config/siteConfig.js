const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');

const {logger} = require('../utils/logger');

// Project root directory (assuming logger.js is in utils/)
const ROOT_DIR = path.resolve(__dirname, '..');

/**
 * Load the site configuration from the yaml file.
 * @return {{}|*}
 * @example const siteConfig = loadSiteConfig();
 * @example logger.info(`Site config: \n${JSON.stringify(siteConfig, null, 2)}`);
 */
const loadSiteConfig = () => {
  try {
    const configFilePath = path.join(`${ROOT_DIR}`, `${process.env.SITE_CONFIGURATION_FILE}`);
    logger.info(`Loading site config from: ${configFilePath}`);
    // Check if the configuration file exists
    if (!fs.existsSync(configFilePath)) {
      logger.error('SITE_CONFIGURATION_FILE does not exist.');
      throw new Error('SITE_CONFIGURATION_FILE environment variable is not set.');
    }

    logger.info('Site config file exists');

    const siteConfig = yaml.load(
      fs.readFileSync(
        configFilePath,'utf8'
      )
    );

    logger.info('Site config loaded successfully');
    logger.info(`Site config: \n${JSON.stringify(siteConfig, null, 2)}`);
    return siteConfig;
  } catch (error) {
    logger.error('Error loading site config: ', error);
    return {};
  }
};


module.exports = loadSiteConfig();

