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
import pool from '../config/database.js';
import { refreshBusinessImages } from '../services/imageService.js';

/**
 * Smart Image Proxy for Businesses
 * Usage: /api/smart-img/:slug/:index?type=hero
 */
router.get('/smart-img/:slug/:index', async (req, res) => {
    try {
        const { slug, index } = req.params;
        const { type = 'hero' } = req.query;
        // const idx = parseInt(index) || 0; // This line is effectively removed from global scope here

        // 1. Get business data
        const bRes = await pool.query("SELECT id, images_url, logo_url FROM businesses WHERE slug = $1", [slug]);
        if (bRes.rows.length === 0) return res.status(404).send('Business not found');

        const business = bRes.rows[0];
        let imageUrl = null;

        if (index === 'logo') {
            imageUrl = business.logo_url;
        } else {
            const idx = parseInt(index) || 0;
            let imagesArray = [];
            if (Array.isArray(business.images_url)) {
                imagesArray = business.images_url;
            } else if (typeof business.images_url === 'string') {
                try {
                    imagesArray = JSON.parse(business.images_url);
                } catch (e) {
                    if (business.images_url.includes(',')) {
                        imagesArray = business.images_url.split(',').map(s => s.trim());
                    } else {
                        imagesArray = [business.images_url];
                    }
                }
            }
            imageUrl = imagesArray[idx];
        }

        if (!imageUrl) return res.status(404).send('Image source not found');

        // 2. Prepare proxy fetch
        const processImage = async (url) => {
            // Adjust dimensions for Google Places URLs
            let finalUrl = url;
            if (url.includes('places.googleapis.com')) {
                let maxW, maxH;
                switch (type) {
                    case 'thumb': maxW = 200; maxH = 200; break;
                    case 'gallery': maxW = 600; maxH = 600; break;
                    case 'hero': maxW = 1200; maxH = 800; break;
                    default: maxW = 1200; maxH = 800;
                }
                finalUrl = url.replace(/maxHeightPx=\d+/, `maxHeightPx=${maxH}`).replace(/maxWidthPx=\d+/, `maxWidthPx=${maxW}`);

                // Enforce current API key from environment
                const apiKey = process.env.GOOGLE_PLACES_API_KEY;
                if (apiKey) {
                    if (finalUrl.includes('key=')) {
                        finalUrl = finalUrl.replace(/key=[^&]*/, `key=${apiKey}`);
                    } else {
                        finalUrl += (finalUrl.includes('?') ? '&' : '?') + `key=${apiKey}`;
                    }
                }
            }

            const response = await fetch(finalUrl, { timeout: 8000 });
            return response;
        };

        let response = await processImage(imageUrl);

        // 3. Self-healing: If 400 (Expired) and it's a Google URL, refresh it!
        if (response.status === 400 && imageUrl.includes('places.googleapis.com')) {
            console.log(`[SmartProxy] Detected expired URL for ${slug}. Refreshing...`);
            try {
                const refreshResult = await refreshBusinessImages(slug);
                if (index === 'logo') {
                    imageUrl = refreshResult.logoUrl;
                } else {
                    imageUrl = refreshResult.imagesUrl[parseInt(index) || 0];
                }

                if (imageUrl) {
                    response = await processImage(imageUrl);
                }
            } catch (err) {
                console.error(`[SmartProxy] Refresh failed for ${slug}:`, err.message);
            }
        }

        if (!response.ok) {
            return res.status(response.status).send('Failed to serve image');
        }

        const contentType = response.headers.get('content-type') || 'image/jpeg';
        const buffer = await response.buffer();

        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=2592000'); // 30 days
        res.send(buffer);

    } catch (error) {
        console.error('[SmartImageProxy] Error:', error.message);
        res.status(500).send('Proxy error');
    }
});

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

        // Enforce current API key from environment
        const apiKey = process.env.GOOGLE_PLACES_API_KEY;
        if (proxyUrl.includes('places.googleapis.com') && apiKey) {
            if (proxyUrl.includes('key=')) {
                proxyUrl = proxyUrl.replace(/key=[^&]*/, `key=${apiKey}`);
            } else {
                proxyUrl += (proxyUrl.includes('?') ? '&' : '?') + `key=${apiKey}`;
            }
        }

        // If no size params in URL, append them
        if (proxyUrl.includes('places.googleapis.com') && !proxyUrl.includes('maxHeightPx') && !proxyUrl.includes('=w')) {
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
