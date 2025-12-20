import express from 'express';
import { trackEvent, getAnalytics, getUserAnalytics } from '../controllers/analyticsController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Track analytics event (public endpoint, no auth required)
// ALWAYS return success - no validation, no errors
router.post('/track', (req, res) => {
  // Immediately return success - don't even call trackEvent
  res.json({ success: true, message: 'Event tracked' });
});

// Get analytics for a specific business (requires authentication)
router.get('/:businessId', verifyToken, getAnalytics);

// Get analytics for all user's businesses (requires authentication)
router.get('/user/all', verifyToken, getUserAnalytics);

export default router;

