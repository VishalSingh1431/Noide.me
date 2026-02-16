import 'dotenv/config';
import pool from './config/database.js';

const result = await pool.query(
    "UPDATE businesses SET status = 'approved' WHERE status = 'pending' RETURNING id, business_name"
);

console.log(`✅ Approved ${result.rowCount} businesses:`);
result.rows.forEach(b => console.log(`  - ${b.business_name}`));
process.exit(0);
