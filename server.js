// server.js
// Node.js + Express server for the weather forecast site.
// Install dependencies: `npm install express node-fetch dotenv`

const express = require('express');
// Support native fetch (Node 18+) or dynamic-import node-fetch (for older/node-fetch ESM)
let fetchFn = globalThis.fetch;
if (!fetchFn) {
  fetchFn = (...args) => import('node-fetch').then(mod => mod.default(...args));
}
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Load API key from .env
const API_KEY = process.env.API_KEY; // Get a free key at https://openweathermap.org/api

// Serve static files from `public/` so `PrevisaoT.html` and `style.css` are accessible
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint to fetch weather data for a given city
app.get('/weather', async (req, res) => {
  const city = req.query.city;
  if (!city) {
    return res.status(400).json({ error: 'City is required' });
  }

  if (!API_KEY) {
    return res.status(500).json({ error: 'API_KEY not configured in .env' });
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=pt_br`;
    const response = await fetchFn(url);
    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Failed to fetch weather data: ${response.status} ${body}`);
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching weather:', error.message || error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Note: HTTP server (redirect) will be started after HTTPS is created in `startHttps()`.
// If HTTPS cannot be started, we'll fall back to running the app over plain HTTP below.

// Optional: simple DB test route to verify Postgres/Supabase connection
// Requires `pg` and `DATABASE_URL` set in `.env` (see .env DATABASE_URL placeholder)
try {
  const db = require('./supabase_db');

  app.get('/dbtest', async (req, res) => {
    if (!process.env.DATABASE_URL) {
      return res.status(500).json({ error: 'DATABASE_URL not configured in .env' });
    }
    try {
      const { rows } = await db.query('SELECT NOW() as now');
      res.json({ ok: true, now: rows[0].now });
    } catch (err) {
      console.error('DB test error:', err.message || err);
      res.status(500).json({ error: err.message || 'DB error' });
    }
  });
} catch (e) {
  // supabase_db.js not present or `pg` not installed — ignore silently
}

// HTTPS support (optional)
// If `SSL_KEY_PATH` and `SSL_CERT_PATH` are set in .env, load them.
// Otherwise generate a self-signed certificate for local development using `selfsigned`.
const httpsPort = process.env.HTTPS_PORT || 3443;
const sslKeyPath = process.env.SSL_KEY_PATH;
const sslCertPath = process.env.SSL_CERT_PATH;

async function startHttps() {
  try {
    let key, cert;
    if (sslKeyPath && sslCertPath && fs.existsSync(sslKeyPath) && fs.existsSync(sslCertPath)) {
      key = fs.readFileSync(sslKeyPath);
      cert = fs.readFileSync(sslCertPath);
    } else {
      // generate self-signed
      try {
        const selfsigned = require('selfsigned');
        const attrs = [{ name: 'commonName', value: 'localhost' }];
        const pems = selfsigned.generate(attrs, { days: 365 });
        key = pems.private;
        cert = pems.cert;
        console.log('Generated self-signed certificate for HTTPS (development only)');
      } catch (err) {
        console.warn('selfsigned not available, skipping HTTPS server');
        return;
      }
    }

    const server = https.createServer({ key, cert }, app);
    server.listen(httpsPort, () => {
      console.log(`HTTPS server running at https://localhost:${httpsPort} (insecure/self-signed cert)`);

      // add a simple secure route for testing
      app.get('/secure', (req, res) => {
        res.json({ ok: true, msg: 'Secure route (HTTPS) is reachable' });
      });

      // Start an HTTP server that redirects all traffic to HTTPS
      const redirectServer = http.createServer((req, res) => {
        const hostHeader = req.headers.host ? req.headers.host.split(':')[0] : 'localhost';
        const redirectUrl = `https://${hostHeader}:${httpsPort}${req.url}`;
        res.writeHead(301, { Location: redirectUrl });
        res.end();
      });

      redirectServer.listen(port, () => {
        console.log(`HTTP -> HTTPS redirect server listening on http://localhost:${port} and redirecting to https://localhost:${httpsPort}`);
      });
    });
  } catch (err) {
    console.error('Failed to start HTTPS server:', err.message || err);
  }
}

startHttps();

