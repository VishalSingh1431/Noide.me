import express from 'express';
import { generateSitemap } from '../controllers/sitemapController.js';

const router = express.Router();

// Sitemap route - accessible at /sitemap.xml
router.get('/sitemap.xml', generateSitemap);

export default router;
