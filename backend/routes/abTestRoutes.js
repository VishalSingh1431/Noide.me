import express from 'express';
import { trackVisitor, trackConversion, getResults } from '../controllers/abTestController.js';

const router = express.Router();

// Track visitor (public)
router.post('/track-visitor/:businessId/:variantName', trackVisitor);

// Track conversion (public)
router.post('/track-conversion/:businessId/:variantName', trackConversion);

// Get results (should be protected in production)
router.get('/results/:businessId', getResults);

export default router;

