import pool from '../config/database.js';
import fetch from 'node-fetch';

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

/**
 * Re-fetches fresh image URLs from Google Places for a business
 * @param {string} slug - Business slug
 * @returns {Promise<Array>} - New images_url array
 */
export const refreshBusinessImages = async (slug) => {
    const client = await pool.connect();
    try {
        // 1. Get Google Place ID from business data
        const res = await client.query(
            "SELECT id, google_places_data FROM businesses WHERE slug = $1",
            [slug]
        );

        if (res.rows.length === 0) throw new Error('Business not found');
        const business = res.rows[0];

        let placeId = null;
        if (business.google_places_data) {
            const data = typeof business.google_places_data === 'string'
                ? JSON.parse(business.google_places_data)
                : business.google_places_data;
            placeId = data.id || data.place_id;
        }

        if (!placeId) throw new Error('No Google Place ID found for business');

        // 2. Fetch fresh details from Google
        const googleUrl = `https://places.googleapis.com/v1/places/${placeId}?fields=id,photos,displayName&key=${GOOGLE_PLACES_API_KEY}`;
        const response = await fetch(googleUrl);

        if (!response.ok) {
            throw new Error(`Google API returned ${response.status}`);
        }

        const freshData = await response.json();
        const photos = freshData.photos || [];

        // 3. Construct new URLs
        const newImagesUrl = photos.slice(0, 10).map(photo =>
            `https://places.googleapis.com/v1/${photo.name}/media?maxHeightPx=1000&maxWidthPx=1600&key=${GOOGLE_PLACES_API_KEY}`
        );

        // Logo is usually the first photo or a specific one, but for now we take the first as fallback if needed
        const newLogoUrl = newImagesUrl[0] || business.logo_url;

        // 4. Update Database
        await client.query(
            "UPDATE businesses SET images_url = $1, logo_url = $2, google_places_data = $3 WHERE id = $4",
            [
                JSON.stringify(newImagesUrl),
                newLogoUrl,
                JSON.stringify({ ...freshData, last_refreshed: new Date().toISOString() }),
                business.id
            ]
        );

        console.log(`[SmartProxy] Refreshed images for ${slug}`);
        return { imagesUrl: newImagesUrl, logoUrl: newLogoUrl };

    } catch (error) {
        console.error(`[SmartProxy Error] Failed to refresh ${slug}:`, error.message);
        throw error;
    } finally {
        client.release();
    }
};
