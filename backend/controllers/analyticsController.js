import Analytics from '../models/Analytics.js';
import Business from '../models/Business.js';

/**
 * Track an analytics event
 */
export const trackEvent = async (req, res) => {
  try {
    const { businessId, eventType } = req.body;

    // Event types that don't require businessId
    const generalEventTypes = ['page_view', 'button_click', 'form_submit', 'search', 'share'];
    
    // If it's a general event type, businessId is optional
    if (!eventType) {
      return res.status(400).json({ error: 'eventType is required' });
    }

    // For business-specific events, businessId is required
    if (!generalEventTypes.includes(eventType) && !eventType.startsWith('share_') && !businessId) {
      return res.status(400).json({ error: 'businessId is required for this event type' });
    }

    // Validate event type - allow share events and widget clicks
    const validEventTypes = [
      'visitor', 
      'call_click', 
      'whatsapp_click', 
      'whatsapp_widget_click',
      'gallery_view', 
      'map_click',
      'share_whatsapp',
      'share_facebook',
      'share_twitter',
      'share_linkedin',
      'share_telegram',
      'share_reddit',
      'share_pinterest',
      'share_copy',
      'page_view',
      'button_click',
      'form_submit',
      'search',
      'share',
      'business_view'
    ];
    
    // Allow any event type that starts with 'share_' for flexibility
    if (!validEventTypes.includes(eventType) && !eventType.startsWith('share_')) {
      // Silently accept unknown event types for forward compatibility
      return res.json({ success: true, message: 'Event tracked (unknown type)' });
    }

    // Verify business exists (only if businessId is provided)
    if (businessId) {
      const business = await Business.findById(businessId);
      if (!business) {
        return res.status(404).json({ error: 'Business not found' });
      }
    }

    // Map event type to metric name
    const metricMap = {
      'visitor': 'visitor_count',
      'call_click': 'call_clicks',
      'whatsapp_click': 'whatsapp_clicks',
      'whatsapp_widget_click': 'whatsapp_clicks',
      'gallery_view': 'gallery_views',
      'map_click': 'map_clicks',
      'share_whatsapp': 'share_clicks',
      'share_facebook': 'share_clicks',
      'share_twitter': 'share_clicks',
      'share_linkedin': 'share_clicks',
      'share_telegram': 'share_clicks',
      'share_reddit': 'share_clicks',
      'share_pinterest': 'share_clicks',
      'share_copy': 'share_clicks'
    };

    const metric = metricMap[eventType] || 'other_events';
    
    // Log event for time-based analytics (only if businessId exists)
    if (businessId) {
      await Analytics.logEvent(businessId, eventType);
      
      // Also increment the metric (for backward compatibility) - only if metric exists
      if (metric && metric !== 'other_events') {
        await Analytics.increment(businessId, metric);
      }
    }

    res.json({ 
      success: true, 
      message: 'Event tracked successfully',
      eventType,
      businessId
    });
  } catch (error) {
    console.error('Error tracking event:', error);
    res.status(500).json({ error: 'Failed to track event' });
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

