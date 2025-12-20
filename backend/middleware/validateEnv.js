/**
 * Validate required environment variables
 */
export const validateEnv = () => {
  const required = [
    'DATABASE_URL',
    'JWT_SECRET',
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(key => {
      console.error(`   - ${key}`);
    });
    console.error('\n⚠️  Please check your .env file');
    
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    } else {
      console.warn('⚠️  Continuing in development mode, but some features may not work');
    }
  }

  // Validate JWT_SECRET length in production
  if (process.env.NODE_ENV === 'production' && process.env.JWT_SECRET) {
    if (process.env.JWT_SECRET.length < 32) {
      console.error('❌ JWT_SECRET must be at least 32 characters in production');
      process.exit(1);
    }
  }

  // Validate DATABASE_URL format
  if (process.env.DATABASE_URL) {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl.startsWith('postgres://') && !dbUrl.startsWith('postgresql://')) {
      console.error('❌ DATABASE_URL must start with postgres:// or postgresql://');
      if (process.env.NODE_ENV === 'production') {
        process.exit(1);
      }
    }
  }

  console.log('✅ Environment variables validated');
};


