import pool from '../config/database.js';

class Analytics {
  /**
   * Log an analytics event
   */
  static async logEvent(businessId, eventType) {
    try {
      const query = `
        INSERT INTO analytics_events (business_id, event_type)
        VALUES ($1, $2)
        RETURNING *
      `;
      const result = await pool.query(query, [businessId, eventType]);
      return result.rows[0];
    } catch (error) {
      console.error('Error logging event:', error);
      throw error;
    }
  }

  /**
   * Get analytics data grouped by time period
   */
  static async getTimeBasedStats(businessId, period = 'all') {
    try {
      let dateFilter = '';
      const params = [businessId];

      if (period === 'week') {
        dateFilter = 'AND created_at >= NOW() - INTERVAL \'7 days\'';
      } else if (period === 'month') {
        dateFilter = 'AND created_at >= NOW() - INTERVAL \'30 days\'';
      }

      // Get event counts by type
      const eventCountsQuery = `
        SELECT 
          event_type,
          COUNT(*) as count
        FROM analytics_events
        WHERE business_id = $1 ${dateFilter}
        GROUP BY event_type
        ORDER BY event_type
      `;
      const eventCounts = await pool.query(eventCountsQuery, params);

      // Get daily breakdown for the selected period
      let dailyBreakdownQuery = '';
      if (period === 'week') {
        dailyBreakdownQuery = `
          SELECT 
            DATE(created_at) as date,
            event_type,
            COUNT(*) as count
          FROM analytics_events
          WHERE business_id = $1 AND created_at >= NOW() - INTERVAL '7 days'
          GROUP BY DATE(created_at), event_type
          ORDER BY date, event_type
        `;
      } else if (period === 'month') {
        dailyBreakdownQuery = `
          SELECT 
            DATE(created_at) as date,
            event_type,
            COUNT(*) as count
          FROM analytics_events
          WHERE business_id = $1 AND created_at >= NOW() - INTERVAL '30 days'
          GROUP BY DATE(created_at), event_type
          ORDER BY date, event_type
        `;
      } else {
        // All-time: group by week
        dailyBreakdownQuery = `
          SELECT 
            DATE_TRUNC('week', created_at) as date,
            event_type,
            COUNT(*) as count
          FROM analytics_events
          WHERE business_id = $1
          GROUP BY DATE_TRUNC('week', created_at), event_type
          ORDER BY date, event_type
        `;
      }

      const dailyBreakdown = dailyBreakdownQuery 
        ? await pool.query(dailyBreakdownQuery, params)
        : { rows: [] };

      // Format event counts
      const stats = {
        visitor: 0,
        call_click: 0,
        whatsapp_click: 0,
        gallery_view: 0,
        map_click: 0
      };

      eventCounts.rows.forEach(row => {
        stats[row.event_type] = parseInt(row.count);
      });

      // Format daily breakdown
      const breakdown = {};
      dailyBreakdown.rows.forEach(row => {
        const dateKey = row.date.toISOString().split('T')[0];
        if (!breakdown[dateKey]) {
          breakdown[dateKey] = {
            visitor: 0,
            call_click: 0,
            whatsapp_click: 0,
            gallery_view: 0,
            map_click: 0
          };
        }
        breakdown[dateKey][row.event_type] = parseInt(row.count);
      });

      return {
        period,
        totals: {
          visitorCount: stats.visitor || 0,
          callClicks: stats.call_click || 0,
          whatsappClicks: stats.whatsapp_click || 0,
          galleryViews: stats.gallery_view || 0,
          mapClicks: stats.map_click || 0,
          totalInteractions: (stats.call_click || 0) + (stats.whatsapp_click || 0) + (stats.gallery_view || 0) + (stats.map_click || 0)
        },
        breakdown: breakdown
      };
    } catch (error) {
      console.error('Error getting time-based stats:', error);
      throw error;
    }
  }
  /**
   * Get analytics for a business
   */
  static async findByBusinessId(businessId) {
    try {
      const query = 'SELECT * FROM analytics WHERE business_id = $1';
      const result = await pool.query(query, [businessId]);
      
      if (result.rows.length === 0) {
        // Create analytics record if it doesn't exist
        return await this.create(businessId);
      }
      
      return this.mapRowToAnalytics(result.rows[0]);
    } catch (error) {
      console.error('Error finding analytics by business ID:', error);
      throw error;
    }
  }

  /**
   * Create analytics record for a business
   */
  static async create(businessId) {
    try {
      const query = `
        INSERT INTO analytics (business_id)
        VALUES ($1)
        ON CONFLICT (business_id) DO NOTHING
        RETURNING *
      `;
      const result = await pool.query(query, [businessId]);
      
      if (result.rows.length === 0) {
        // Record already exists, fetch it
        return await this.findByBusinessId(businessId);
      }
      
      return this.mapRowToAnalytics(result.rows[0]);
    } catch (error) {
      console.error('Error creating analytics:', error);
      throw error;
    }
  }

  /**
   * Increment a specific metric
   */
  static async increment(businessId, metric) {
    try {
      const validMetrics = ['visitor_count', 'call_clicks', 'whatsapp_clicks', 'gallery_views', 'map_clicks'];
      
      if (!validMetrics.includes(metric)) {
        throw new Error(`Invalid metric: ${metric}`);
      }

      // Ensure analytics record exists
      await this.create(businessId);

      const query = `
        UPDATE analytics
        SET ${metric} = ${metric} + 1,
            updated_at = CURRENT_TIMESTAMP
        WHERE business_id = $1
        RETURNING *
      `;
      
      const result = await pool.query(query, [businessId]);
      
      if (result.rows.length === 0) {
        throw new Error('Analytics record not found');
      }
      
      return this.mapRowToAnalytics(result.rows[0]);
    } catch (error) {
      console.error(`Error incrementing ${metric}:`, error);
      throw error;
    }
  }

  /**
   * Get analytics stats for a business
   */
  static async getStats(businessId) {
    try {
      const analytics = await this.findByBusinessId(businessId);
      
      return {
        visitorCount: analytics.visitorCount || 0,
        callClicks: analytics.callClicks || 0,
        whatsappClicks: analytics.whatsappClicks || 0,
        galleryViews: analytics.galleryViews || 0,
        mapClicks: analytics.mapClicks || 0,
        totalInteractions: 
          (analytics.callClicks || 0) + 
          (analytics.whatsappClicks || 0) + 
          (analytics.galleryViews || 0) + 
          (analytics.mapClicks || 0),
        lastUpdated: analytics.updatedAt
      };
    } catch (error) {
      console.error('Error getting analytics stats:', error);
      throw error;
    }
  }

  /**
   * Map database row to Analytics object
   */
  static mapRowToAnalytics(row) {
    if (!row) return null;
    
    return {
      id: row.id,
      businessId: row.business_id,
      visitorCount: row.visitor_count || 0,
      callClicks: row.call_clicks || 0,
      whatsappClicks: row.whatsapp_clicks || 0,
      galleryViews: row.gallery_views || 0,
      mapClicks: row.map_clicks || 0,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}

export default Analytics;

