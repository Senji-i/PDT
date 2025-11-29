// server.js
// This is the Node.js server using Express to host the weather forecast website.
// First, install dependencies: npm init -y && npm install express node-fetch

const express = require('express');
const fetch = require('node-fetch');
const dotenv = require('dotenv');
dotenv.config();
const app = express();
const port = 3000;

// Replace with your OpenWeatherMap API key
const API_KEY = process.env.API_KEY; // Sign up at https://openweathermap.org/api for a free key

// Serve static files (HTML, CSS, JS)
app.use(express.static('public'));

// Endpoint to fetch weather data
app.get('/weather', async (req, res) => {
  const city = req.query.city;
  if (!city) {
    return res.status(400).json({ error: 'City is required' });
  }

  try {
    const url = 'http://api.openweathermap.org/data/2.5/forecast?id=524901&appid={2b099645c0e0c6d9436ca272c5b44b1d}';
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch weather data');
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at `);
});