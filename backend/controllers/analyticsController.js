import Analytics from '../models/Analytics.js';
import Business from '../models/Business.js';
import User from '../models/User.js';

/**
 * Track an analytics event
 */
export const trackEvent = async (req, res, next) => {
  try {
    const { businessId, eventType } = req.body;

    if (!businessId || !eventType) {
      return res.json({ success: true, message: 'Missing businessId or eventType' });
    }

    // Map common event types to their database counterparts (if needed)
    // Analytics.js uses: visitor, call_click, whatsapp_click, gallery_view, map_click
    // And metrics: visitor_count, call_clicks, whatsapp_clicks, gallery_views, map_clicks

    const metricMap = {
      'visitor': 'visitor_count',
      'call_click': 'call_clicks',
      'whatsapp_click': 'whatsapp_clicks',
      'gallery_view': 'gallery_views',
      'map_click': 'map_clicks',
      'inquiry_click': 'inquiry_clicks'
    };

    const metric = metricMap[eventType];

    // Log the event, increment daily stats, and update all-time totals
    await Analytics.logEvent(businessId, eventType);

    res.json({ success: true, message: 'Event tracked' });
  } catch (error) {
    console.error('Analytics tracking error:', error);
    // Analytics should NEVER break the app - always succeed for the client
    res.json({ success: true, message: 'Event tracked (with error)' });
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

    // Fetch user from database to get current role (more reliable than JWT)
    const user = await User.findById(userId);
    const userRole = user?.role || 'normal';

    // Check if user owns the business or is admin
    if (business.userId !== userId && userRole !== 'main_admin') {
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

