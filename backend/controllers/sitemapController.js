import Business from '../models/Business.js';

/**
 * Generate dynamic XML sitemap for VaranasiHub
 * Includes all static pages and approved business listings
 */
export const generateSitemap = async (req, res) => {
    try {
        const baseUrl = process.env.NODE_ENV === 'production'
            ? `https://${process.env.BASE_DOMAIN || 'varanasihub.com'}`
            : 'http://localhost:5173';

        // Static pages with priority and change frequency
        const staticPages = [
            { url: '/', priority: '1.0', changefreq: 'daily' },
            { url: '/about', priority: '0.8', changefreq: 'monthly' },
            { url: '/pricing', priority: '0.9', changefreq: 'weekly' },
            { url: '/contact', priority: '0.7', changefreq: 'monthly' },
            { url: '/businesses', priority: '0.9', changefreq: 'daily' },
            { url: '/blog', priority: '0.8', changefreq: 'weekly' },
            { url: '/terms', priority: '0.5', changefreq: 'yearly' },
            { url: '/privacy', priority: '0.5', changefreq: 'yearly' },
            { url: '/services/website-design-varanasi', priority: '0.8', changefreq: 'monthly' },
            { url: '/services/website-hosting-varanasi', priority: '0.8', changefreq: 'monthly' },
            { url: '/services/online-presence-varanasi', priority: '0.8', changefreq: 'monthly' },
        ];

        // Fetch all approved businesses
        let businesses = [];
        try {
            businesses = await Business.findAll(['approved']);
        } catch (error) {
            console.error('Error fetching businesses for sitemap:', error);
            // Continue with static pages even if business fetch fails
        }

        // Build XML sitemap
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

        // Add static pages
        staticPages.forEach(page => {
            xml += '  <url>\n';
            xml += `    <loc>${baseUrl}${page.url}</loc>\n`;
            xml += `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`;
            xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
            xml += `    <priority>${page.priority}</priority>\n`;
            xml += '  </url>\n';
        });

        // Add business pages
        businesses.forEach(business => {
            if (business.slug) {
                xml += '  <url>\n';
                xml += `    <loc>${baseUrl}/${business.slug}</loc>\n`;
                // Use business updatedAt or createdAt for lastmod
                const lastmod = business.updatedAt || business.createdAt || new Date();
                xml += `    <lastmod>${new Date(lastmod).toISOString().split('T')[0]}</lastmod>\n`;
                xml += `    <changefreq>weekly</changefreq>\n`;
                xml += `    <priority>0.7</priority>\n`;
                xml += '  </url>\n';
            }
        });

        xml += '</urlset>';

        // Set proper headers for XML
        res.setHeader('Content-Type', 'application/xml; charset=utf-8');
        res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
        res.send(xml);
    } catch (error) {
        console.error('Error generating sitemap:', error);
        res.status(500).send('Error generating sitemap');
    }
};
