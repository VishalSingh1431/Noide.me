import { pool } from '../config/database.js';

/**
 * Generate dynamic XML sitemap for noida.me
 * Includes static pages + all approved business subdomain URLs
 */
export const generateSitemap = async (req, res) => {
    try {
        const BASE_DOMAIN = process.env.BASE_DOMAIN || 'noida.me';
        const baseUrl = process.env.NODE_ENV === 'production'
            ? `https://${BASE_DOMAIN}`
            : 'http://localhost:5173';

        const today = new Date().toISOString().split('T')[0];

        // Static pages
        const staticPages = [
            { url: '/', priority: '1.0', changefreq: 'daily' },
            { url: '/about', priority: '0.8', changefreq: 'monthly' },
            { url: '/contact', priority: '0.7', changefreq: 'monthly' },
            { url: '/businesses', priority: '0.9', changefreq: 'daily' },
            { url: '/terms', priority: '0.5', changefreq: 'yearly' },
            { url: '/privacy', priority: '0.5', changefreq: 'yearly' },
        ];

        // Category pages - one per category for local SEO
        const categoryPages = [
            'Restaurant', 'Hotel', 'Clinic', 'Gym', 'Salon', 'School',
            'Hospital', 'Pharmacy', 'Grocery Store', 'Coaching Center',
            'Nursery', 'Cafe', 'Dentist', 'Yoga Center', 'Jewellery Store',
            'Furniture Store', 'Electronics Store', 'Real Estate', 'Bakery',
            'Pet Shop', 'Photography', 'Event Management', 'Catering'
        ].map(cat => ({
            url: `/category/${encodeURIComponent(cat.toLowerCase().replace(/ /g, '-'))}`,
            priority: '0.8',
            changefreq: 'weekly'
        }));

        // Fetch all approved businesses from DB
        let businesses = [];
        try {
            const result = await pool.query(
                `SELECT slug, subdomain_url, category, updated_at, created_at 
                 FROM businesses 
                 WHERE status IN ('approved', 'active') 
                 ORDER BY updated_at DESC`
            );
            businesses = result.rows;
        } catch (error) {
            console.error('[Sitemap] Error fetching businesses:', error.message);
        }

        // Build XML
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

        // Static pages
        [...staticPages, ...categoryPages].forEach(page => {
            xml += '  <url>\n';
            xml += `    <loc>${baseUrl}${page.url}</loc>\n`;
            xml += `    <lastmod>${today}</lastmod>\n`;
            xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
            xml += `    <priority>${page.priority}</priority>\n`;
            xml += '  </url>\n';
        });

        // Business subdomain pages (primary - best for SEO)
        businesses.forEach(business => {
            if (business.subdomain_url) {
                const lastmod = business.updated_at || business.created_at
                    ? new Date(business.updated_at || business.created_at).toISOString().split('T')[0]
                    : today;

                xml += '  <url>\n';
                xml += `    <loc>${business.subdomain_url}</loc>\n`;
                xml += `    <lastmod>${lastmod}</lastmod>\n`;
                xml += `    <changefreq>weekly</changefreq>\n`;
                xml += `    <priority>0.8</priority>\n`;
                xml += '  </url>\n';
            }
        });

        xml += '</urlset>';

        res.setHeader('Content-Type', 'application/xml; charset=utf-8');
        res.setHeader('Cache-Control', 'public, max-age=3600'); // cache 1 hour
        res.setHeader('X-Robots-Tag', 'noindex'); // sitemap itself shouldn't be indexed
        res.send(xml);

        console.log(`[Sitemap] Generated with ${businesses.length} businesses + ${staticPages.length + categoryPages.length} static pages`);
    } catch (error) {
        console.error('[Sitemap] Error generating sitemap:', error);
        res.status(500).send('Error generating sitemap');
    }
};
