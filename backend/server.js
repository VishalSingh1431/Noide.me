import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import compression from 'compression';
import morgan from 'morgan';
import { initializeDatabase } from './config/database.js';
import { validateEnv } from './middleware/validateEnv.js';
import { securityMiddleware } from './middleware/security.js';
import authRoutes from './routes/auth.js';
import businessRoutes from './routes/businessRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import ecommerceRoutes from './routes/ecommerceRoutes.js';
import abTestRoutes from './routes/abTestRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import googlePlacesRoutes from './routes/googlePlacesRoutes.js';
import sitemapRoutes from './routes/sitemapRoutes.js';

// Load .env from backend directory (works even when run from different directory)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

// Validate environment variables
validateEnv();

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Trust proxy - Required when behind Nginx reverse proxy
// Trust only the first proxy (Nginx) - more secure than trusting all proxies
// This allows Express to trust the X-Forwarded-For header from Nginx
app.set('trust proxy', 1);

// Initialize PostgreSQL database (non-blocking)
initializeDatabase()
  .then(() => {
    console.log('✅ Database initialized successfully');
  })
  .catch((error) => {
    console.error('❌ Database initialization error:', error.message);
    console.warn('⚠️  Server will continue running, but database features may not work');
    console.warn('⚠️  Please check your DATABASE_URL in .env file');
  });

// Security middleware
app.use(securityMiddleware);

// Compression middleware (gzip)
app.use(compression());

// CORS configuration
const corsOptions = {
  origin: NODE_ENV === 'production'
    ? (process.env.FRONTEND_URL
      ? [process.env.FRONTEND_URL]
      : ['https://varanasihub.com', 'https://www.varanasihub.com'])
    : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));

// Request logging
if (NODE_ENV === 'production') {
  app.use(morgan('combined')); // Apache combined log format
} else {
  app.use(morgan('dev')); // Colored output for development
}

// Body parsing middleware - no size limit (only count limit for images)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting removed - no limits

// Extract subdomain from hostname (for subdomain routing)
app.use((req, res, next) => {
  const hostname = req.hostname || req.headers.host || '';
  const parts = hostname.split('.');

  // Handle localhost subdomains: subdomain.localhost:PORT
  if (hostname.includes('localhost')) {
    const localhostParts = hostname.split(':')[0].split('.');
    if (localhostParts.length > 1 && localhostParts[1] === 'localhost') {
      req.subdomain = localhostParts[0];
    }
  }
  // Handle production subdomains: subdomain.domain.com
  else if (parts.length > 2) {
    req.subdomain = parts[0];
  }

  next();
});

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const pool = (await import('./config/database.js')).default;
    await pool.query('SELECT 1');
    res.json({
      status: 'OK',
      message: 'VaranasiHub API is running',
      database: 'connected',
    });
  } catch (error) {
    res.json({
      status: 'OK',
      message: 'VaranasiHub API is running',
      database: 'disconnected',
      error: process.env.NODE_ENV === 'development' ? {
        code: error.code,
        message: error.message,
      } : undefined,
    });
  }
});

// API Routes (must come before subdomain routing)
// Analytics route FIRST - bypass everything, always return success
app.post('/api/analytics/track', (req, res) => {
  res.json({ success: true, message: 'Event tracked' });
});

app.use('/api/auth', authRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/ecommerce', ecommerceRoutes);
app.use('/api/ab-test', abTestRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/google-places', googlePlacesRoutes);

// Sitemap route (must come before subdomain routing)
app.use('/', sitemapRoutes);

// Subdomain routing handler (for business websites)
// This will be called when accessing: business-slug.varanasihub.com
app.use(async (req, res, next) => {
  const subdomain = req.subdomain;

  // If there's a subdomain and it's not 'www' or 'api', treat it as a business slug
  if (subdomain && subdomain !== 'www' && subdomain !== 'api' && !req.path.startsWith('/api')) {
    const { getBusinessBySubdomain } = await import('./controllers/businessController.js');
    return getBusinessBySubdomain(req, res, next);
  }

  next();
});

// Subdirectory routing handler (for business websites)
// This will be called when accessing: varanasihub.com/business-slug
app.get('/:slug', async (req, res, next) => {
  const { slug } = req.params;

  console.log(`[Subdirectory Route] Checking slug: ${slug}, path: ${req.path}, subdomain: ${req.subdomain}`);

  // Skip if it's an API route
  if (req.path.startsWith('/api')) {
    console.log(`[Subdirectory Route] Skipping API route: ${req.path}`);
    return next();
  }

  // Skip if there's a subdomain (subdomain routing takes precedence)
  if (req.subdomain && req.subdomain !== 'www' && req.subdomain !== 'api') {
    console.log(`[Subdirectory Route] Skipping - subdomain present: ${req.subdomain}`);
    return next();
  }

  // Skip if the path looks like a file (has an extension)
  if (slug.includes('.')) {
    console.log(`[Subdirectory Route] Skipping - looks like a file: ${slug}`);
    return next();
  }

  try {
    console.log(`[Subdirectory Route] Looking up business with slug: ${slug}`);
    const Business = (await import('./models/Business.js')).default;
    const business = await Business.findBySlug(slug, ['approved']);

    if (!business) {
      // Business not found, let it fall through to 404 handler
      console.log(`[Subdirectory Route] Business not found for slug: ${slug}`);
      return next();
    }

    console.log(`[Subdirectory Route] Business found: ${business.businessName}, generating HTML...`);
    // Business found, generate and return HTML
    const { generateBusinessHTML } = await import('./views/businessTemplate.js');
    const apiBaseUrl = NODE_ENV === 'production'
      ? `https://${process.env.BASE_DOMAIN || 'varanasihub.com'}/api`
      : `http://localhost:${PORT}/api`;
    const html = generateBusinessHTML(business, apiBaseUrl);
    res.setHeader('Content-Type', 'text/html');
    return res.send(html);
  } catch (error) {
    console.error('[Subdirectory Route] Error:', error);
    console.error('[Subdirectory Route] Error stack:', error.stack);
    // On error, fall through to 404 handler
    return next();
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
  });
});

// Error handling middleware (must be last)
app.use((err, req, res, next) => {
  console.error('Error:', {
    message: err.message,
    stack: NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  const statusCode = err.statusCode || err.status || 500;
  const isDevelopment = NODE_ENV === 'development';

  res.status(statusCode).json({
    error: err.message || 'Internal server error',
    ...(isDevelopment && {
      stack: err.stack,
      path: req.path,
    }),
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📝 Environment: ${NODE_ENV}`);
  console.log(`📝 Database: PostgreSQL (Aiven)`);
  const apiUrl = NODE_ENV === 'production'
    ? `https://${process.env.BASE_DOMAIN || 'varanasihub.com'}/api`
    : `http://localhost:${PORT}/api`;
  console.log(`🌐 API Base URL: ${apiUrl}`);
  if (NODE_ENV === 'production') {
    console.log(`🔒 Security: Enabled (Helmet)`);
    console.log(`📊 Logging: Enabled (Morgan)`);
  }
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use.`);
    console.error(`   Please stop the process using port ${PORT} or change the PORT in .env`);
    console.error(`   To find and kill the process: Get-NetTCPConnection -LocalPort ${PORT} | Select-Object -ExpandProperty OwningProcess | Stop-Process -Force`);
    process.exit(1);
  } else {
    console.error('❌ Server error:', err);
    process.exit(1);
  }
});

