import pool from './backend/config/database.js';
import Analytics from './backend/models/Analytics.js';

async function seedAnalytics() {
    try {
        console.log('🚀 Starting analytics seeding...');

        // Get all businesses
        const result = await pool.query('SELECT id, business_name FROM businesses');
        const businesses = result.rows;
        console.log(`📊 Found ${businesses.length} businesses.`);

        let createdCount = 0;
        let skippedCount = 0;

        for (const business of businesses) {
            // Check if analytics record exists
            const checkRes = await pool.query('SELECT id FROM analytics WHERE business_id = $1', [business.id]);

            if (checkRes.rows.length === 0) {
                await Analytics.create(business.id);
                createdCount++;
                console.log(`✅ Created analytics for: ${business.business_name}`);
            } else {
                skippedCount++;
            }
        }

        console.log(`\n✨ Seeding complete!`);
        console.log(`📈 Created: ${createdCount}`);
        console.log(`⏭️  Skipped: ${skippedCount}`);

    } catch (error) {
        console.error('❌ Seeding failed:', error);
    } finally {
        process.exit();
    }
}

seedAnalytics();
