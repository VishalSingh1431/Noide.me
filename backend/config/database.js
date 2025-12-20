import pkg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load .env from backend directory (works even when run from different directory)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

const { Pool } = pkg;

// Parse Aiven Service URI if provided
let dbConfig = {};

if (process.env.DATABASE_URL || process.env.POSTGRES_SERVICE_URI) {
  try {
    // Aiven Service URI format: postgres://user:password@host:port/database?sslmode=require
    const uri = process.env.DATABASE_URL || process.env.POSTGRES_SERVICE_URI;
    
    // Validate URI format
    if (!uri.startsWith('postgres://') && !uri.startsWith('postgresql://')) {
      throw new Error('DATABASE_URL must start with postgres:// or postgresql://');
    }
    
    const url = new URL(uri);
    
    // Validate required components
    if (!url.hostname) {
      throw new Error('DATABASE_URL is missing hostname');
    }
    if (!url.username) {
      throw new Error('DATABASE_URL is missing username');
    }
    if (!url.password) {
      throw new Error('DATABASE_URL is missing password');
    }
    
    dbConfig = {
      host: url.hostname,
      port: parseInt(url.port) || 5432,
      database: url.pathname.replace(/^\//, '') || 'defaultdb', // Remove leading '/'
      user: url.username,
      password: url.password,
      ssl: {
        rejectUnauthorized: false
      },
    };
    
    console.log('🔗 Database Config:', {
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database,
      user: dbConfig.user,
      ssl: 'enabled'
    });
  } catch (error) {
    console.error('❌ Invalid DATABASE_URL format:', error.message);
    console.error('📝 Expected format: postgres://username:password@host:port/database?sslmode=require');
    console.error('📝 Get your connection string from: https://console.aiven.io/');
    throw error;
  }
} else {
  // Use individual environment variables
  dbConfig = {
    host: process.env.DB_HOST || process.env.POSTGRES_HOST,
    port: parseInt(process.env.DB_PORT || process.env.POSTGRES_PORT || '5432'),
    database: process.env.DB_NAME || process.env.POSTGRES_DB || 'defaultdb',
    user: process.env.DB_USER || process.env.POSTGRES_USER,
    password: process.env.DB_PASSWORD || process.env.POSTGRES_PASSWORD,
    ssl: process.env.DB_SSL === 'true' || process.env.POSTGRES_SSL === 'true' ? {
      rejectUnauthorized: false
    } : false,
  };
}

// PostgreSQL connection pool (optimized for production)
const pool = new Pool({
  ...dbConfig,
  max: process.env.NODE_ENV === 'production' ? 30 : 20, // More connections in production
  min: process.env.NODE_ENV === 'production' ? 5 : 2, // Keep minimum connections alive
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  allowExitOnIdle: false, // Keep pool alive
});

// Test connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL connection error:', err);
  console.error('Error code:', err.code);
  console.error('Error message:', err.message);
  // Don't exit on error - let the app handle it gracefully
});

// Test database connection function
export const testConnection = async () => {
  try {
    const result = await pool.query('SELECT NOW() as current_time');
    console.log('✅ Database connection test successful');
    console.log('   Current database time:', result.rows[0].current_time);
    return true;
  } catch (error) {
    console.error('❌ Database connection test failed:');
    console.error('   Error code:', error.code);
    console.error('   Error message:', error.message);
    console.error('   Error details:', error);
    if (error.code === 'ENOTFOUND') {
      console.error('   → DNS resolution failed. The hostname cannot be found.');
      console.error('   → FIX: Check your Aiven dashboard at https://console.aiven.io/');
      console.error('   → Get the correct Service URI from: Project → PostgreSQL → Connection Information');
      console.error('   → Make sure your database service is running (not paused)');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('   → Connection refused. The database server is not accepting connections.');
      console.error('   → FIX: Check if the database service is running in Aiven dashboard');
      console.error('   → Verify the port number is correct');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('   → Connection timeout. Network or firewall issue.');
      console.error('   → FIX: Check your internet connection and firewall settings');
    } else if (error.code === '28P01') {
      console.error('   → Authentication failed. Wrong username or password.');
      console.error('   → FIX: Get the correct password from Aiven dashboard');
    } else if (error.code === '3D000') {
      console.error('   → Database does not exist.');
      console.error('   → FIX: Check the database name in your DATABASE_URL');
    } else {
      console.error('   → Unknown error. Check your DATABASE_URL in .env file');
    }
    console.error('');
    console.error('📝 QUICK FIX:');
    console.error('   1. Go to https://console.aiven.io/');
    console.error('   2. Select your PostgreSQL service');
    console.error('   3. Click "Connection information"');
    console.error('   4. Copy the "Service URI"');
    console.error('   5. Paste it in backend/.env as: DATABASE_URL=<your-service-uri>');
    console.error('');
    return false;
  }
};

// Initialize database tables
export const initializeDatabase = async () => {
  // First test the connection
  const connectionOk = await testConnection();
  if (!connectionOk) {
    throw new Error('Database connection failed. Please check your database configuration in .env file.');
  }

  try {
    // Create users table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        name VARCHAR(255),
        phone VARCHAR(20),
        bio TEXT,
        picture TEXT,
        google_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add missing columns if they don't exist (for existing tables)
    // Check and add picture column
    const pictureColumnCheck = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'picture'
    `);
    if (pictureColumnCheck.rows.length === 0) {
      await pool.query(`ALTER TABLE users ADD COLUMN picture TEXT`);
      console.log('✅ Added missing "picture" column to users table');
    }

    // Check and add google_id column
    const googleIdColumnCheck = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'google_id'
    `);
    if (googleIdColumnCheck.rows.length === 0) {
      await pool.query(`ALTER TABLE users ADD COLUMN google_id VARCHAR(255)`);
      console.log('✅ Added missing "google_id" column to users table');
    }

    // Check and add role column
    const roleColumnCheck = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'role'
    `);
    if (roleColumnCheck.rows.length === 0) {
      await pool.query(`ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'normal' CHECK (role IN ('normal', 'content_admin', 'main_admin'))`);
      console.log('✅ Added missing "role" column to users table');
    }

    // Create otps table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS otps (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        otp VARCHAR(10) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create businesses table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS businesses (
        id SERIAL PRIMARY KEY,
        business_name VARCHAR(255) NOT NULL,
        owner_name VARCHAR(255),
        category VARCHAR(50) NOT NULL CHECK (category IN ('Shop', 'Restaurant', 'Hotel', 'Clinic', 'Library', 'Services', 'Temple', 'School', 'College', 'Gym', 'Salon', 'Spa', 'Pharmacy', 'Bank', 'Travel Agency', 'Real Estate', 'Law Firm', 'Accounting', 'IT Services', 'Photography', 'Event Management', 'Catering', 'Bakery', 'Jewelry', 'Fashion', 'Electronics', 'Furniture', 'Automobile', 'Repair Services', 'Education', 'Healthcare', 'Beauty', 'Fitness', 'Entertainment', 'Tourism', 'Food & Beverage', 'Retail', 'Wholesale', 'Manufacturing', 'Construction', 'Other')),
        mobile VARCHAR(20) NOT NULL,
        email VARCHAR(255) NOT NULL,
        address TEXT NOT NULL,
        map_link TEXT,
        whatsapp VARCHAR(20),
        description TEXT NOT NULL,
        logo_url TEXT,
        images_url JSONB DEFAULT '[]'::jsonb,
        youtube_video TEXT,
        social_links JSONB DEFAULT '{"instagram": "", "facebook": "", "website": ""}'::jsonb,
        slug VARCHAR(255) NOT NULL UNIQUE,
        subdomain_url TEXT NOT NULL,
        subdirectory_url TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'active')),
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Check and add missing columns to businesses table if they don't exist
    const missingColumns = [
      { name: 'user_id', sql: 'INTEGER REFERENCES users(id) ON DELETE SET NULL' },
      { name: 'navbar_tagline', sql: 'TEXT' },
      { name: 'footer_description', sql: 'TEXT' },
      { name: 'services', sql: 'JSONB DEFAULT \'[]\'::jsonb' },
      { name: 'special_offers', sql: 'JSONB DEFAULT \'[]\'::jsonb' },
      { name: 'business_hours', sql: 'JSONB DEFAULT \'{}\'::jsonb' },
      { name: 'appointment_settings', sql: 'JSONB DEFAULT \'{}\'::jsonb' },
      { name: 'theme', sql: 'VARCHAR(50) DEFAULT \'modern\'' },
      { name: 'is_premium', sql: 'BOOLEAN DEFAULT FALSE' },
      { name: 'google_places_data', sql: 'JSONB' },
      { name: 'edit_approval_status', sql: 'VARCHAR(50) DEFAULT NULL CHECK (edit_approval_status IN (\'pending\', \'approved\', \'rejected\'))' },
    ];

    for (const column of missingColumns) {
      const columnCheck = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'businesses' AND column_name = $1
      `, [column.name]);
      
      if (columnCheck.rows.length === 0) {
        try {
          await pool.query(`ALTER TABLE businesses ADD COLUMN ${column.name} ${column.sql}`);
          console.log(`✅ Added missing "${column.name}" column to businesses table`);
        } catch (error) {
          console.error(`⚠️ Error adding column "${column.name}":`, error.message);
        }
      }
    }

    // Create indexes for better query performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
      CREATE INDEX IF NOT EXISTS idx_otps_email ON otps(email);
      CREATE INDEX IF NOT EXISTS idx_otps_expires_at ON otps(expires_at);
      CREATE INDEX IF NOT EXISTS idx_businesses_slug ON businesses(slug);
      CREATE INDEX IF NOT EXISTS idx_businesses_email ON businesses(email);
      CREATE INDEX IF NOT EXISTS idx_businesses_status ON businesses(status);
    `);

    // Create function to update updated_at timestamp
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Create triggers to automatically update updated_at
    await pool.query(`
      DROP TRIGGER IF EXISTS update_users_updated_at ON users;
      CREATE TRIGGER update_users_updated_at
      BEFORE UPDATE ON users
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `);

    await pool.query(`
      DROP TRIGGER IF EXISTS update_businesses_updated_at ON businesses;
      CREATE TRIGGER update_businesses_updated_at
      BEFORE UPDATE ON businesses
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `);

    // Create analytics table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS analytics (
        id SERIAL PRIMARY KEY,
        business_id INTEGER NOT NULL UNIQUE REFERENCES businesses(id) ON DELETE CASCADE,
        visitor_count INTEGER DEFAULT 0,
        call_clicks INTEGER DEFAULT 0,
        whatsapp_clicks INTEGER DEFAULT 0,
        gallery_views INTEGER DEFAULT 0,
        map_clicks INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create analytics_events table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS analytics_events (
        id SERIAL PRIMARY KEY,
        business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
        event_type VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for analytics tables
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_analytics_business_id ON analytics(business_id);
      CREATE INDEX IF NOT EXISTS idx_analytics_events_business_id ON analytics_events(business_id);
      CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
      CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);
    `);

    // Create trigger to update analytics updated_at
    await pool.query(`
      DROP TRIGGER IF EXISTS update_analytics_updated_at ON analytics;
      CREATE TRIGGER update_analytics_updated_at
      BEFORE UPDATE ON analytics
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `);

    // Create appointments table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id SERIAL PRIMARY KEY,
        business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255),
        customer_phone VARCHAR(20) NOT NULL,
        appointment_date DATE NOT NULL,
        appointment_time TIME NOT NULL,
        service_type VARCHAR(255),
        notes TEXT,
        status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for appointments table
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_appointments_business_id ON appointments(business_id);
      CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
      CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
      CREATE INDEX IF NOT EXISTS idx_appointments_business_date ON appointments(business_id, appointment_date);
    `);

    // Create trigger to update appointments updated_at
    await pool.query(`
      DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;
      CREATE TRIGGER update_appointments_updated_at
      BEFORE UPDATE ON appointments
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `);

    console.log('✅ Database tables initialized');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
};

export default pool;

