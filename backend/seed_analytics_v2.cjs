const pkg = require('pg');
const { Pool } = pkg;
require('dotenv').config({ path: './backend/.env' });

// Brute force SSL bypass
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function run() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL || process.env.POSTGRES_SERVICE_URI,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        console.log('🔗 Connecting to database...');
        const businesses = await pool.query('SELECT id, business_name FROM businesses');
        console.log(`📊 Found ${businesses.rows.length} businesses.`);

        let created = 0;
        for (const b of businesses.rows) {
            const check = await pool.query('SELECT id FROM analytics WHERE business_id = $1', [b.id]);
            if (check.rows.length === 0) {
                await pool.query('INSERT INTO analytics (business_id) VALUES ($1)', [b.id]);
                created++;
                console.log(`✅ Initialized: ${b.business_name}`);
            }
        }
        console.log(`\n✨ Done! Created ${created} records.`);
    } catch (err) {
        console.error('❌ Error:', err);
    } finally {
        await pool.end();
    }
}

run();
