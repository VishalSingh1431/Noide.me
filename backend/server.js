import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load .env from backend directory (Must be before other imports that use env vars)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

import express from 'express';
console.log('🚀🚀🚀 NOIDAHUB SERVER STARTING - V1.1 🚀🚀🚀');
import cors from 'cors';
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
import portfolioRoutes from './routes/portfolioRoutes.js';
import imageProxyRoutes from './routes/imageProxyRoutes.js';

// Validate environment variables
validateEnv();

const app = express();

// Global request logger
app.use((req, res, next) => {
  console.log(`[REQ] ${req.method} ${req.url}`);
  next();
});

const PORT = process.env.PORT || 50002;
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

// CORS configuration
const corsOptions = {
  origin: NODE_ENV === 'production'
    ? (origin, callback) => {
      // Allow main domain and all subdomains
      const allowedDomains = [
        'https://noida.me',
        'https://www.noida.me',
        'http://localhost:5173',
        /^https:\/\/[\w-]+\.noida\.me$/  // Any subdomain
      ];

      if (!origin || allowedDomains.some(domain =>
        typeof domain === 'string' ? domain === origin : domain.test(origin)
      )) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
    : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));

app.use(securityMiddleware);

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
      message: 'NoidaHub API is running',
      database: 'connected',
    });
  } catch (error) {
    res.json({
      status: 'OK',
      message: 'NoidaHub API is running',
      database: 'disconnected',
      error: process.env.NODE_ENV === 'development' ? {
        code: error.code,
        message: error.message,
      } : undefined,
    });
  }
});

// API Routes (must come before subdomain routing)
app.use('/api/auth', authRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/ecommerce', ecommerceRoutes);
app.use('/api/ab-test', abTestRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/google-places', googlePlacesRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api', imageProxyRoutes); // Image proxy: /api/img?url=...


// Sitemap route (must come before subdomain routing)
app.use('/', sitemapRoutes);

// Subdomain routing handler — serves SSR HTML to Google and real users on business subdomains
// e.g. aaradhyagreennursery.noida.me → server fetches business data and renders full HTML
app.use(async (req, res, next) => {
  const subdomain = req.subdomain;

  // Only handle valid business subdomains (skip www, api, etc.)
  if (!subdomain || subdomain === 'www' || subdomain === 'api') {
    return next();
  }

  // Skip API calls even on subdomains
  if (req.path.startsWith('/api')) {
    return next();
  }

  // Skip asset/file requests
  if (req.path.includes('.') && !req.path.endsWith('/')) {
    return next();
  }

  try {
    const Business = (await import('./models/Business.js')).default;
    const business = await Business.findBySlug(subdomain, ['approved']);

    if (!business) {
      console.log(`[Subdomain SSR] No approved business found for slug: ${subdomain}`);
      return next();
    }

    console.log(`[Subdomain SSR] Rendering SSR HTML for: ${business.businessName}`);

    // Build canonical URL
    const baseDomain = process.env.BASE_DOMAIN || 'noida.me';
    const canonicalUrl = `https://${subdomain}.${baseDomain}`;
    business.subdomainUrl = business.subdomainUrl || canonicalUrl;

    const { generateBusinessHTML } = await import('./views/businessTemplate.js');
    const html = generateBusinessHTML(business);

    return res.send(html);
  } catch (error) {
    console.error('[Subdomain SSR] Error rendering business page:', error);
    return next();
  }
});


// Subdirectory routing handler (for business websites)
// This will be called when accessing: noida.me/business-slug
app.get('/:slug', async (req, res, next) => {
  const { slug } = req.params;

  console.log(`[Subdirectory Route] Checking slug: ${slug}, path: ${req.path}, subdomain: ${req.subdomain}`);

  // Skip if it's an API route
  if (req.path.startsWith('/api')) {
    return next();
  }

  // Skip if there's a subdomain (subdomain routing takes precedence)
  if (req.subdomain && req.subdomain !== 'www' && req.subdomain !== 'api') {
    return next();
  }

  // Skip if the path looks like a file (has an extension)
  if (slug.includes('.')) {
    return next();
  }

  try {
    console.log(`[Subdirectory Route] Looking up business for redirect: ${slug}`);
    const Business = (await import('./models/Business.js')).default;
    // We only redirect if the business actually exists and is approved
    const business = await Business.findBySlug(slug, ['approved']);

    if (!business) {
      console.log(`[Subdirectory Route] Business not found for slug: ${slug}`);
      return next();
    }

    console.log(`[Subdirectory Route] Business found: ${business.businessName}, redirecting to subdomain...`);

    // Construct subdomain URL dynamically to ensure it matches current environment
    const baseDomain = process.env.BASE_DOMAIN || 'noida.me';
    const subdomainUrl = NODE_ENV === 'production'
      ? `https://${business.slug}.${baseDomain}`
      : `http://${business.slug}.localhost:${PORT}`;

    return res.redirect(301, subdomainUrl);

  } catch (error) {
    console.error('[Subdirectory Route] Error:', error);
    return next();
  }
});

// Serve static files from backend public (business.css etc.)
app.use(express.static(join(__dirname, 'public'), {
  maxAge: '1y',
  immutable: true,
}));

// Serve static files from React build (production only)
if (NODE_ENV === 'production') {
  const frontendBuildPath = join(__dirname, '../frontend/dist');
  app.use(express.static(frontendBuildPath, { maxAge: '1h' }));


  // Catch-all route for subdomains - serve React app
  app.get('*', (req, res, next) => {
    // If there's a subdomain (and it's not www/api), serve the React app
    if (req.subdomain && req.subdomain !== 'www' && req.subdomain !== 'api') {
      console.log(`[Subdomain Route] Serving React app for subdomain: ${req.subdomain}`);
      return res.sendFile(join(frontendBuildPath, 'index.html'));
    }
    next();
  });
}

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
    ? `https://${process.env.BASE_DOMAIN || 'noida.me'}/api`
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


