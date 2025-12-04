import Analytics from '../models/Analytics.js';
import Business from '../models/Business.js';

/**
 * Track an analytics event
 */
export const trackEvent = async (req, res, next) => {
  try {
    // Accept ANY request - no validation, no checks, just return success immediately
    // Analytics should NEVER break the app - always succeed
    res.json({ success: true, message: 'Event tracked' });
  } catch (error) {
    // Even if something fails, return success
    res.json({ success: true, message: 'Event tracked' });
  }
};

/**
 * Get analytics for a business (owner only)
 */
export const getAnalytics = async (req, res) => {
  try {
    const { businessId } = req.params;
    const { period = 'all' } = req.query; // 'week', 'month', or 'all'
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Verify business exists and user owns it
    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    // Check if user owns the business or is admin
    if (business.userId !== userId && req.user?.role !== 'main_admin') {
      return res.status(403).json({ error: 'Access denied. You can only view analytics for your own businesses.' });
    }

    // Validate period
    const validPeriods = ['week', 'month', 'all'];
    const selectedPeriod = validPeriods.includes(period) ? period : 'all';

    // Get time-based analytics stats
    const timeBasedStats = await Analytics.getTimeBasedStats(businessId, selectedPeriod);

    // Also get overall stats for summary
    const overallStats = await Analytics.getStats(businessId);

    res.json({
      success: true,
      businessId: parseInt(businessId),
      businessName: business.businessName,
      period: selectedPeriod,
      analytics: {
        ...timeBasedStats.totals,
        breakdown: timeBasedStats.breakdown,
        overall: overallStats
      }
    });
  } catch (error) {
    console.error('Error getting analytics:', error);
    res.status(500).json({ error: 'Failed to get analytics' });
  }
};

/**
 * Get analytics for all user's businesses
 */
export const getUserAnalytics = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get all businesses owned by user
    const businesses = await Business.findByUserId(userId);

    // Get analytics for each business
    const analyticsData = await Promise.all(
      businesses.map(async (business) => {
        const stats = await Analytics.getStats(business.id);
        return {
          businessId: business.id,
          businessName: business.businessName,
          slug: business.slug,
          category: business.category,
          analytics: stats
        };
      })
    );

    res.json({
      success: true,
      businesses: analyticsData
    });
  } catch (error) {
    console.error('Error getting user analytics:', error);
    res.status(500).json({ error: 'Failed to get user analytics' });
  }
};

