require('dotenv').config();
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const { SSLError } = require('./errors'); // From your project
const {logger} = require('./logger');


// Project root directory (assuming sslGenerator.js is in utils/)
const ROOT_DIR = path.resolve(__dirname, '..');

/**
 * Generates OpenSSL configuration file.
 * @param {string} prefix - Hostname prefix
 * @param {number} port - Port number
 * @param {string} hostname - Hostname
 * @param {string} certsDir - Certificates directory
 * @param organization - Organization name
 * @returns {string} Path to config file
 */
async function generateConfigFile (prefix, port, hostname, certsDir, organization) {
  const configFilePath = path.join(certsDir, `${prefix}.cnf`);
  const configFileData = `
[req]
default_bits        = 4096
default_keyfile     = ${prefix}.key.pem
distinguished_name  = subject
req_extensions      = req_ext
x509_extensions     = x509_ext
string_mask         = utf8only
prompt              = no
port                = ${port}

[subject]
countryName         = US
stateOrProvinceName = GA
localityName        = Atlanta
organizationName    = ${organization}
organizationalUnitName = ${organization}
commonName          = ${hostname}
emailAddress        = admin@${hostname}

# Section x509_ext is used when generating a self-signed certificate.
[x509_ext]
subjectKeyIdentifier    = hash
authorityKeyIdentifier  = keyid,issuer
basicConstraints        = CA:FALSE
keyUsage                = digitalSignature, keyEncipherment
subjectAltName          = @alternate_names
nsComment               = "OpenSSL Generated Certificate"
extendedKeyUsage        = serverAuth, clientAuth

# Section req_ext is used when generating a certificate signing request.
[req_ext]
subjectKeyIdentifier = hash
basicConstraints     = CA:FALSE
keyUsage             = digitalSignature, keyEncipherment
subjectAltName       = @alternate_names
nsComment            = "OpenSSL Generated Certificate"
extendedKeyUsage     = serverAuth, clientAuth

# Add additional DNS options for the server hostname lookup
[alternate_names]
DNS.1 = ${hostname}
DNS.2 = www.${hostname}
DNS.3 = https://${hostname}
DNS.4 = https://${hostname}:${port}
DNS.5 = https://www.${hostname}
DNS.6 = https://www.${hostname}:${port}
DNS.7 = http://${hostname}
DNS.8 = http://${hostname}:${port}
DNS.9 = http://www.${hostname}
DNS.10 = http://www.${hostname}:${port}
DNS.11 = localhost
DNS.12 = localhost:${port}
DNS.13 = https://127.0.0.1
DNS.14 = https://127.0.0.1:${port}
DNS.15 = 127.0.0.1:${port}
  `.trim();

  if (fs.existsSync(configFilePath)) {
    logger.info(`SSL configuration file found at: ${configFilePath}`);
    return configFilePath;
  }

  logger.info(`Creating SSL configuration file at: ${configFilePath}`);
  fs.writeFileSync(configFilePath, configFileData, { encoding: 'utf8', flag: 'w' });
  return configFilePath;
}

/**
 * Executes an OpenSSL command and logs the result.
 * @param {string} command - OpenSSL command to execute
 * @param {string} description - Description for logging
 * @returns {Promise<void>} Resolves on success, rejects on failure
 */
async function execShellCommand (command, description) {
  try {
    logger.info(`Executing OpenSSL command for ${description}: ${command}`);
    await execSync(`${command}`, { stdio: 'pipe' });
    logger.info(`${description} generated successfully.`);
  } catch (error) {
    logger.error(`Failed to execute OpenSSL command for ${description}: ${error.message}`);
    throw new SSLError(`OpenSSL command failed: ${error.message}`, 'OPENSSL_EXECUTION_FAILED');
  }
}


/**
 * Generates SSL certificates (CA, server cert, and key) using OpenSSL.
 * @param {Object} options - Configuration options
 * @param {string} options.certsDir - Directory for certificate files (default: 'certs')
 * @param {string} options.hostname - Hostname for the server cert (default: 'localhost')
 * @param {number} options.port - Port number (default: 443)
 * @param {string} options.organization - Organization name (default: 'FutureNet Telecom Solutions Inc.')
 * @returns {Promise<void>} Resolves on success, rejects on failure
 */
async function generateSSLCertificates ({
  certsDir = `${ROOT_DIR}/certs`,
  hostname = 'localhost',
  port = 443,
  organization = 'FutureNet Telecom Solutions Inc.'
} = {}) {
  try {
    // Ensure certs directory exists
    const certsPath = path.resolve(certsDir);
    if (!fs.existsSync(certsPath)) {
      logger.info(`Creating certificate directory at: ${certsPath}`);
      fs.mkdirSync(certsPath, { recursive: true });
    }

    // Remove domain suffix for prefix (e.g., 'localhost' → 'localhost')
    const prefix = hostname.replace(/\.com|\.net|\.org|\.edu|\.gov|\.biz|\.info|\.io|\.co|\.uk|\.ca/gi, '');

    // Define certificate file paths
    const caKeyFile = path.join(certsPath, 'ca.key.pem');
    const caCertFile = path.join(certsPath, 'ca.crt');
    const caCsrFile = path.join(certsPath, 'ca.csr');
    const serverKeyFile = path.join(certsPath, `${prefix}.key.pem`);
    const serverCertFile = path.join(certsPath, `${prefix}.x509.crt`);
    const serverCsrFile = path.join(certsPath, `${prefix}.csr`);
    const serverFullChain = path.join(certsPath, `${prefix}.fullchain.pem`);
    const serverPublicKey = path.join(certsPath, `${prefix}.pub`);

    // Check if certificates already exist (skip generation if all required files are present)
    const requiredFiles = [
      caKeyFile, caCertFile, serverKeyFile, serverCertFile
    ];
    const filesExist = requiredFiles.every((file) => fs.existsSync(file));
    if (filesExist) {
      logger.info('SSL certificates already exist, skipping generation.');
      return;
    }

    logger.info('Generating SSL certificates...');

    // Generate OpenSSL configuration file
    const configFile = await generateConfigFile(prefix, port, hostname, certsPath, organization);

    // Step 1: Generate CA private key (4096-bit RSA)
    await execShellCommand(
      `openssl genrsa -out "${caKeyFile}" 4096`,
      'CA private key');

    // Step 2: Generate CA CSR
    await execShellCommand(
      `openssl req -new -key "${caKeyFile}" -out "${caCsrFile}" -config "${configFile}"`,
      'CA CSR');

    // Step 3: Self-sign CA certificate (365 days)
    await execShellCommand(
      `openssl x509 -req -in "${caCsrFile}" -signkey "${caKeyFile}" -out "${caCertFile}" -days 365 -sha256`,
      'CA certificate');

    // Step 4: Generate server private key (4096-bit RSA)
    await execShellCommand(
      `openssl genrsa -out "${serverKeyFile}" 4096`,
      'Server private key');

    // Step 5: Generate server CSR
    await execShellCommand(
      `openssl req -new -key "${serverKeyFile}" -out "${serverCsrFile}" -config "${configFile}"`,
      'Server CSR');

    // Step 6: Sign server certificate with CA (365 days)
    await execShellCommand(
      `openssl x509 -req -in "${serverCsrFile}" -CA "${caCertFile}" -CAkey "${caKeyFile}" -CAcreateserial -out "${serverCertFile}" -days 365 -sha256`,
      'Server certificate');

    // Step 7: Generate full chain (concatenate key and cert)
    await execShellCommand(
      `cat "${serverKeyFile}" "${serverCertFile}" > "${serverFullChain}"`,
      'Full chain');

    // Step 8: Extract public key from server certificate
    await execShellCommand(
      `openssl x509 -pubkey -noout -in "${serverCertFile}" > "${serverPublicKey}"`,
      'Public key');

    logger.info('SSL certificates generated successfully.');
  } catch (error) {
    throw new SSLError(`Failed to generate SSL certificates: ${error.message}`, 'SSL_GENERATION_FAILED');
  }
}


module.exports = { generateSSLCertificates };
