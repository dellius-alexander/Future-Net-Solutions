const fs = require('fs');
const path = require('path');
const certsDir = process.env.CERTS_DIR || 'certs';
const hostname = process.env.HOSTNAME.split('.')[0] || 'localhost';

const sslOptions = {
  ca: fs.readFileSync(path.resolve(certsDir, 'ca.crt'), {encoding: 'utf8'}),
  cert: fs.readFileSync(path.resolve(certsDir, `${hostname}.x509.crt`), {encoding: 'utf8'}),
  key: fs.readFileSync(path.resolve(certsDir, `${hostname}.key.pem`), {encoding: 'utf8'}),
  ciphers: 'ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-SHA:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA:ECDHE-RSA-AES256-SHA384',
  honorCipherOrder: true,
  secureProtocol: 'TLSv1_2_method'
};

const cfg = {
  port: process.env.NODE_ENV === 'production' ? process.env.PORT : process.env.PORT || 3000,
  hostname: process.env.NODE_ENV === 'production' ? process.env.HOSTNAME : 'localhost'
};

module.exports = { sslOptions, cfg };
