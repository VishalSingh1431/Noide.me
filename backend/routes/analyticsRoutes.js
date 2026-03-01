import express from 'express';
import { trackEvent, getAnalytics, getUserAnalytics } from '../controllers/analyticsController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Track analytics event (public endpoint, no auth required)
router.post('/track', trackEvent);

// Get analytics for all user's businesses (requires authentication)
// MUST be defined BEFORE /:businessId to prevent 'user' being treated as a businessId
router.get('/user/all', verifyToken, getUserAnalytics);

// Get analytics for a specific business (requires authentication)
router.get('/:businessId', verifyToken, getAnalytics);

export default router;

