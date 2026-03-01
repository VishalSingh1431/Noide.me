import pool, { initializeDatabase } from './config/database.js';

async function migrate() {
    console.log('🚀 Starting migration to Daily Stats Table...');
    try {
        // 1. Ensure tables are created
        console.log('🛠️ Initializing database schema...');
        await initializeDatabase();
        const query = `
      INSERT INTO daily_business_stats (business_id, date, visitor_count, call_clicks, whatsapp_clicks, gallery_views, map_clicks, inquiry_clicks)
      SELECT 
        business_id, 
        DATE(created_at) as date,
        COUNT(*) FILTER (WHERE event_type = 'visitor') as visitor_count,
        COUNT(*) FILTER (WHERE event_type = 'call_click') as call_clicks,
        COUNT(*) FILTER (WHERE event_type = 'whatsapp_click') as whatsapp_clicks,
        COUNT(*) FILTER (WHERE event_type = 'gallery_view') as gallery_views,
        COUNT(*) FILTER (WHERE event_type = 'map_click') as map_clicks,
        COUNT(*) FILTER (WHERE event_type = 'inquiry_click') as inquiry_clicks
      FROM analytics_events
      GROUP BY business_id, DATE(created_at)
      ON CONFLICT (business_id, date) DO UPDATE SET
        visitor_count = EXCLUDED.visitor_count,
        call_clicks = EXCLUDED.call_clicks,
        whatsapp_clicks = EXCLUDED.whatsapp_clicks,
        gallery_views = EXCLUDED.gallery_views,
        map_clicks = EXCLUDED.map_clicks,
        inquiry_clicks = EXCLUDED.inquiry_clicks;
    `;

        console.log('📊 Aggregating and migrating historical data...');
        const result = await pool.query(query);
        console.log(`✅ Migration complete! Processed ${result.rowCount} daily records.`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

migrate();
