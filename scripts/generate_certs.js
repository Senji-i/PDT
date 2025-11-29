// generate_certs.js
// Generates self-signed certificate and key in ./certs using `selfsigned`.
// Run with: node scripts/generate_certs.js

const fs = require('fs');
const path = require('path');

(async () => {
  try {
    const selfsigned = require('selfsigned');
    const attrs = [{ name: 'commonName', value: 'localhost' }];
    const pems = selfsigned.generate(attrs, { days: 365 });

    const certDir = path.join(__dirname, '..', 'certs');
    if (!fs.existsSync(certDir)) fs.mkdirSync(certDir, { recursive: true });

    const keyPath = path.join(certDir, 'key.pem');
    const certPath = path.join(certDir, 'cert.pem');

    fs.writeFileSync(keyPath, pems.private);
    fs.writeFileSync(certPath, pems.cert);

    console.log(`WROTE ${keyPath}`);
    console.log(`WROTE ${certPath}`);
  } catch (err) {
    console.error('Error generating certs:', err);
    process.exit(1);
  }
})();