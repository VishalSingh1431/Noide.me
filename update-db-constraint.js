// Update database constraint to include all categories
import pool from './backend/config/database.js';

async function updateConstraint() {
  try {
    console.log('🔄 Updating database constraint...');
    
    // Drop old constraint
    await pool.query(`
      ALTER TABLE businesses DROP CONSTRAINT IF EXISTS businesses_category_check;
    `);
    console.log('✅ Dropped old constraint');
    
    // Add new constraint with all categories
    await pool.query(`
      ALTER TABLE businesses ADD CONSTRAINT businesses_category_check 
      CHECK (category IN ('Shop', 'Restaurant', 'Hotel', 'Clinic', 'Library', 'Services', 'Temple', 'School', 'College', 'Gym', 'Salon', 'Spa', 'Pharmacy', 'Bank', 'Travel Agency', 'Real Estate', 'Law Firm', 'Accounting', 'IT Services', 'Photography', 'Event Management', 'Catering', 'Bakery', 'Jewelry', 'Fashion', 'Electronics', 'Furniture', 'Automobile', 'Repair Services', 'Education', 'Healthcare', 'Beauty', 'Fitness', 'Entertainment', 'Tourism', 'Food & Beverage', 'Retail', 'Wholesale', 'Manufacturing', 'Construction', 'Other'));
    `);
    console.log('✅ Added new constraint with all categories');
    
    // Verify
    const result = await pool.query(`
      SELECT constraint_name, check_clause 
      FROM information_schema.check_constraints 
      WHERE constraint_name = 'businesses_category_check';
    `);
    
    console.log('✅ Constraint updated successfully!');
    console.log('Constraint details:', result.rows[0]);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating constraint:', error.message);
    process.exit(1);
  }
}

updateConstraint();

