import pool from '../config/database.js';

class Analytics {
  /**
   * Log an analytics event and increment counters
   */
  static async logEvent(businessId, eventType) {
    try {
      // 1. Log raw event for historical backup and custom reporting
      const query = `
        INSERT INTO analytics_events (business_id, event_type)
        VALUES ($1, $2)
        RETURNING *
      `;
      await pool.query(query, [businessId, eventType]);

      // 2. Map event type to column name
      const metricMap = {
        'visitor': 'visitor_count',
        'call_click': 'call_clicks',
        'whatsapp_click': 'whatsapp_clicks',
        'gallery_view': 'gallery_views',
        'map_click': 'map_clicks',
        'inquiry_click': 'inquiry_clicks'
      };
      const column = metricMap[eventType];

      if (column) {
        // 3. Increment daily stats (Fast)
        await this.incrementDaily(businessId, column);
        // 4. Increment all-time total (Fast)
        await this.increment(businessId, column);
      }

      return { success: true };
    } catch (error) {
      console.error('Error logging event:', error);
      throw error;
    }
  }

  /**
   * Increment daily statistics (Pre-aggregation)
   */
  static async incrementDaily(businessId, column) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const query = `
        INSERT INTO daily_business_stats (business_id, date, ${column})
        VALUES ($1, $2, 1)
        ON CONFLICT (business_id, date) 
        DO UPDATE SET ${column} = daily_business_stats.${column} + 1
      `;
      await pool.query(query, [businessId, today]);
    } catch (error) {
      console.error('Error incrementing daily stats:', error);
    }
  }

  /**
   * Get analytics data grouped by time period (Fast version using pre-aggregated data)
   */
  static async getTimeBasedStats(businessId, period = 'all') {
    try {
      let dateFilter = '';
      const params = [businessId];

      if (period === 'week') {
        dateFilter = 'AND date >= CURRENT_DATE - INTERVAL \'7 days\'';
      } else if (period === 'month') {
        dateFilter = 'AND date >= CURRENT_DATE - INTERVAL \'30 days\'';
      }

      // 1. Get Totals for the period from pre-aggregated daily table
      const totalsQuery = `
        SELECT 
          SUM(visitor_count) as visitor,
          SUM(call_clicks) as call_click,
          SUM(whatsapp_clicks) as whatsapp_click,
          SUM(gallery_views) as gallery_view,
          SUM(map_clicks) as map_click,
          SUM(inquiry_clicks) as inquiry_click
        FROM daily_business_stats
        WHERE business_id = $1 ${dateFilter}
      `;
      const totalsResult = await pool.query(totalsQuery, params);
      const row = totalsResult.rows[0] || {};

      // 2. Get Daily Breakdown
      let breakdownQuery = `
        SELECT 
          date,
          visitor_count as visitor,
          call_clicks as call_click,
          whatsapp_clicks as whatsapp_click,
          gallery_views as gallery_view,
          map_clicks as map_click,
          inquiry_clicks as inquiry_click
        FROM daily_business_stats
        WHERE business_id = $1 ${dateFilter}
        ORDER BY date ASC
      `;

      const breakdownResult = await pool.query(breakdownQuery, params);
      const breakdown = {};

      breakdownResult.rows.forEach(r => {
        const dateKey = r.date.toISOString().split('T')[0];
        breakdown[dateKey] = {
          visitor: parseInt(r.visitor || 0),
          call_click: parseInt(r.call_click || 0),
          whatsapp_click: parseInt(r.whatsapp_click || 0),
          gallery_view: parseInt(r.gallery_view || 0),
          map_click: parseInt(r.map_click || 0),
          inquiry_click: parseInt(r.inquiry_click || 0)
        };
      });

      return {
        period,
        totals: {
          visitorCount: parseInt(row.visitor || 0),
          callClicks: parseInt(row.call_click || 0),
          whatsappClicks: parseInt(row.whatsapp_click || 0),
          galleryViews: parseInt(row.gallery_view || 0),
          mapClicks: parseInt(row.map_click || 0),
          inquiryClicks: parseInt(row.inquiry_click || 0),
          totalInteractions:
            parseInt(row.call_click || 0) +
            parseInt(row.whatsapp_click || 0) +
            parseInt(row.gallery_view || 0) +
            parseInt(row.map_click || 0) +
            parseInt(row.inquiry_click || 0)
        },
        breakdown
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
      const validMetrics = ['visitor_count', 'call_clicks', 'whatsapp_clicks', 'gallery_views', 'map_clicks', 'inquiry_clicks'];

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

