/**
 * Sitemap Generator Utility
 * Generates sitemap.xml for SEO
 */

const BASE_URL = import.meta.env.VITE_SITE_URL || 'https://www.noida.me';

// Static routes that should always be in sitemap
const staticRoutes = [
  { path: '/', priority: '1.0', changefreq: 'daily' },
  { path: '/businesses', priority: '0.9', changefreq: 'daily' },
  { path: '/about', priority: '0.8', changefreq: 'monthly' },
  { path: '/contact', priority: '0.7', changefreq: 'monthly' },
  { path: '/pricing', priority: '0.8', changefreq: 'weekly' },
  { path: '/terms', priority: '0.5', changefreq: 'yearly' },
  { path: '/privacy', priority: '0.5', changefreq: 'yearly' },
];

/**
 * Generate sitemap XML string
 * @param {Array} businessRoutes - Array of business routes from API
 * @returns {string} XML sitemap string
 */
export const generateSitemap = (businessRoutes = []) => {
  const currentDate = new Date().toISOString().split('T')[0];
  
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">\n`;

  // Add static routes
  staticRoutes.forEach(route => {
    sitemap += `  <url>
    <loc>${BASE_URL}${route.path}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>\n`;
  });

  // Add business routes
  businessRoutes.forEach(business => {
    const businessPath = `/business/${business.slug || business.id}`;
    const lastmod = business.updatedAt 
      ? new Date(business.updatedAt).toISOString().split('T')[0]
      : currentDate;
    
    sitemap += `  <url>
    <loc>${BASE_URL}${businessPath}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>\n`;
  });

  sitemap += '</urlset>';
  return sitemap;
};

/**
 * Generate and download sitemap
 * Call this from backend API endpoint
 */
export const generateSitemapEndpoint = async (req, res) => {
  try {
    // Fetch all businesses from database
    // const businesses = await Business.find({ status: 'approved' }).select('id slug updatedAt');
    
    const sitemap = generateSitemap(/* businesses */);
    
    res.setHeader('Content-Type', 'application/xml');
    res.send(sitemap);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
};

