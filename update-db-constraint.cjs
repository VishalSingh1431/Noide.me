// Update database constraint - CommonJS version
// Run from project root: node update-db-constraint.cjs
// OR from backend: node ../update-db-constraint.cjs
const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');

// Try to find .env file
let envPath = path.join(__dirname, 'backend', '.env');
if (!fs.existsSync(envPath)) {
  envPath = path.join(__dirname, '.env');
}
if (!fs.existsSync(envPath)) {
  console.error('❌ .env file not found. Please run from project root or backend directory.');
  process.exit(1);
}

require('dotenv').config({ path: envPath });

async function updateConstraint() {
  const pool = new Pool({
    host: process.env.DB_HOST || process.env.POSTGRES_HOST,
    port: parseInt(process.env.DB_PORT || process.env.POSTGRES_PORT || '5432'),
    database: process.env.DB_NAME || process.env.POSTGRES_DB || 'defaultdb',
    user: process.env.DB_USER || process.env.POSTGRES_USER,
    password: process.env.DB_PASSWORD || process.env.POSTGRES_PASSWORD,
    ssl: process.env.DB_SSL === 'true' || process.env.POSTGRES_SSL === 'true' || process.env.DB_SSL === 'enabled' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('🔄 Updating database constraint...');
    console.log('Connecting to:', process.env.DB_HOST || process.env.POSTGRES_HOST);
    
    // Drop old constraint
    await pool.query('ALTER TABLE businesses DROP CONSTRAINT IF EXISTS businesses_category_check;');
    console.log('✅ Dropped old constraint');
    
    // Add new constraint with all categories
    await pool.query(`ALTER TABLE businesses ADD CONSTRAINT businesses_category_check CHECK (category IN ('Shop', 'Restaurant', 'Hotel', 'Clinic', 'Library', 'Services', 'Temple', 'School', 'College', 'Gym', 'Salon', 'Spa', 'Pharmacy', 'Bank', 'Travel Agency', 'Real Estate', 'Law Firm', 'Accounting', 'IT Services', 'Photography', 'Event Management', 'Catering', 'Bakery', 'Jewelry', 'Fashion', 'Electronics', 'Furniture', 'Automobile', 'Repair Services', 'Education', 'Healthcare', 'Beauty', 'Fitness', 'Entertainment', 'Tourism', 'Food & Beverage', 'Retail', 'Wholesale', 'Manufacturing', 'Construction', 'Other'));`);
    console.log('✅ Added new constraint with all categories');
    
    // Verify
    const result = await pool.query(`
      SELECT constraint_name, check_clause 
      FROM information_schema.check_constraints 
      WHERE constraint_name = 'businesses_category_check';
    `);
    
    console.log('✅ Constraint updated successfully!');
    console.log('Constraint:', result.rows[0]?.constraint_name || 'Not found');
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating constraint:', error.message);
    console.error('Error code:', error.code);
    await pool.end();
    process.exit(1);
  }
}

updateConstraint();

