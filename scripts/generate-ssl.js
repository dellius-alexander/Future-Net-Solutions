require('dotenv').config();
const {logger} = require('../utils/logger');
const { generateSSLCertificates } = require('../utils/sslGenerator');

/**
 * Generate SSL certificates for the server.
 * @returns {Promise<void>}
 */
async function generateSSL () {
  try {
    await generateSSLCertificates({
      certsDir: process.env.CERTS_DIR || 'certs',
      hostname: process.env.HOSTNAME || 'localhost',
      port: parseInt(process.env.PORT) || 443,
      organization: process.env.ORGANIZATION || 'FutureNet Telecom Solutions Inc.'
      }).then(() => {
        logger.info('SSL certificates generated successfully.');
      }).catch((error) => {
        logger.error('Error generating SSL certificates: ', error);
      });

    // process.exit(0);
  } catch (error) {
    logger.error(`SSL generation failed: ${error.message}`);

    // process.exit(1);
  }
}

generateSSL().then((r) => logger.info(r)).catch((e) => logger.error(e));
