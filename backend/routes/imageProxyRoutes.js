import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

/**
 * Image proxy endpoint for Google Places photos
 * Reduces image sizes by requesting smaller dimensions from the Places API
 * Adds aggressive cache headers so browsers cache images for 30 days
 * 
 * Usage: /api/img?url=<encoded-google-places-url>&w=800&h=600
 */
router.get('/img', async (req, res) => {
    try {
        const { url, w = '800', h = '600', type = 'hero' } = req.query;

        if (!url) {
            return res.status(400).json({ error: 'Missing url parameter' });
        }

        // Only allow proxying from trusted domains (Google APIs)
        const decodedUrl = decodeURIComponent(url);
        const allowedDomains = [
            'lh3.googleusercontent.com',
            'maps.googleapis.com',
            'places.googleapis.com',
            'streetviewpixels-pa.googleapis.com',
        ];
        const isAllowed = allowedDomains.some(domain => decodedUrl.includes(domain));

        if (!isAllowed) {
            return res.status(403).json({ error: 'Domain not allowed' });
        }

        // Adjust dimensions per type to serve appropriately sized images
        let maxW, maxH;
        switch (type) {
            case 'thumb': maxW = 200; maxH = 200; break;
            case 'gallery': maxW = 600; maxH = 600; break;
            case 'hero': maxW = 900; maxH = 700; break;
            default: maxW = parseInt(w); maxH = parseInt(h);
        }

        // Modify Google Places photo URL to request smaller size
        let proxyUrl = decodedUrl;
        proxyUrl = proxyUrl.replace(/maxHeightPx=\d+/, `maxHeightPx=${maxH}`);
        proxyUrl = proxyUrl.replace(/maxWidthPx=\d+/, `maxWidthPx=${maxW}`);
        // If no size params in URL, append them
        if (!proxyUrl.includes('maxHeightPx') && !proxyUrl.includes('=w')) {
            proxyUrl += (proxyUrl.includes('?') ? '&' : '?') + `maxWidthPx=${maxW}&maxHeightPx=${maxH}`;
        }

        const response = await fetch(proxyUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; NoidaHubBot/1.0)',
                'Accept': 'image/*',
            },
            timeout: 8000,
        });

        if (!response.ok) {
            return res.status(response.status).send('Failed to fetch image');
        }

        const contentType = response.headers.get('content-type') || 'image/jpeg';
        const buffer = await response.buffer();

        // Aggressive caching — Google Places images don't change often
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=2592000, immutable'); // 30 days
        res.setHeader('Vary', 'Accept-Encoding');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('Content-Length', buffer.length);
        res.send(buffer);

    } catch (error) {
        console.error('[ImageProxy] Error:', error.message);
        res.status(500).send('Image proxy error');
    }
});

export default router;
