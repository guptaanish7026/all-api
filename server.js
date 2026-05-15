const express = require('express');
const cloudscraper = require('cloudscraper');

const app = express();
const PORT = process.env.PORT || 3000;
const API_BASE_URL = 'https://nt.rarestudy.in';

// CORS middleware (unchanged)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

// Enhanced proxy endpoint
app.use('/api', async (req, res) => {
    const targetUrl = API_BASE_URL + req.originalUrl;
    try {
        const response = await cloudscraper({
            method: req.method,
            url: targetUrl,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
                'Accept': 'application/json, text/html, */*',
                'Accept-Language': 'en-US,en;q=0.9',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            },
            // Important: tell cloudscraper to use a more robust challenge solver
            challengesToSolve: 3,        // retry up to 3 times
            maxTimeout: 15000,           // 15 seconds per challenge
            // Optional: set a custom cookie jar to maintain session
            jar: true
        });
        res.json(response);
    } catch (error) {
        console.error(`Proxy error for ${targetUrl}:`, error.message);
        res.status(502).json({
            error: 'Failed to fetch data from the target API.',
            detail: error.message
        });
    }
});

// Serve static files (unchanged)
app.use(express.static(__dirname));

app.listen(PORT, () => {
    console.log(`Proxy running on port ${PORT}`);
});
