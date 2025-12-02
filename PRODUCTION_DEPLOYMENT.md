# Production Deployment Guide

This guide covers all the changes and steps needed to deploy VaranasiHub to production.

## 📋 Pre-Deployment Checklist

### 1. Environment Variables

#### Backend Environment Variables (`backend/.env`)

Create a `.env` file in the `backend` directory with the following variables:

```env
# ============================================
# SERVER CONFIGURATION
# ============================================
PORT=5000
NODE_ENV=production

# ============================================
# POSTGRESQL DATABASE (AIVEN)
# ============================================
DATABASE_URL=postgres://avnadmin:YOUR_PASSWORD@YOUR_HOST.a.aivencloud.com:12345/defaultdb?sslmode=require

# ============================================
# JWT AUTHENTICATION
# ============================================
# IMPORTANT: Use a strong, random secret (minimum 32 characters)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-characters

# ============================================
# GOOGLE OAUTH
# ============================================
GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com

# ============================================
# EMAIL CONFIGURATION (for OTP)
# ============================================
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password

# ============================================
# CLOUDINARY (Image Uploads)
# ============================================
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# ============================================
# DOMAIN CONFIGURATION (PRODUCTION)
# ============================================
BASE_DOMAIN=varanasihub.com
FRONTEND_URL=https://www.varanasihub.com
CLIENT_URL=https://www.varanasihub.com
```

#### Frontend Environment Variables (`frontend/.env.production`)

Create a `.env.production` file in the `frontend` directory:

```env
# API Base URL - Use your production backend URL
VITE_API_URL=https://api.varanasihub.com/api

# Site URL (optional, used for SSR fallback)
VITE_SITE_URL=https://www.varanasihub.com

# Enable analytics in production
VITE_ENABLE_ANALYTICS=true
```

**Note:** If your backend and frontend are on the same domain, you can use a relative path:
```env
VITE_API_URL=/api
```

### 2. Security Checklist

- [ ] **JWT_SECRET**: Must be at least 32 characters, use a strong random string
- [ ] **Database Password**: Use a strong password from Aiven
- [ ] **Cloudinary Credentials**: Secure your API keys
- [ ] **Email Credentials**: Use app-specific passwords for Gmail
- [ ] **HTTPS**: Ensure all production URLs use HTTPS
- [ ] **CORS**: Verify CORS settings in `backend/server.js` match your frontend domain
- [ ] **Environment Variables**: Never commit `.env` files to version control

### 3. Domain & DNS Configuration

#### Required DNS Records:

1. **Main Domain**: `www.varanasihub.com` → Frontend server
2. **API Subdomain**: `api.varanasihub.com` → Backend server (optional, if separate)
3. **Wildcard Subdomain**: `*.varanasihub.com` → Backend server (for business subdomains)

#### Example DNS Configuration:

```
A Record:
  www.varanasihub.com → Frontend Server IP
  api.varanasihub.com → Backend Server IP (if separate)

CNAME Record:
  *.varanasihub.com → Backend Server (for business subdomains)
```

### 4. Build & Deploy Steps

#### Frontend Build:

```bash
cd frontend
npm install
npm run build
```

The build output will be in `frontend/dist/` directory.

#### Backend Setup:

```bash
cd backend
npm install --production
```

**Note:** The backend doesn't require a build step, but ensure:
- All dependencies are installed
- `.env` file is configured
- Database connection is working

### 5. Server Configuration

#### Frontend Server (Nginx Example):

```nginx
server {
    listen 80;
    server_name www.varanasihub.com varanasihub.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name www.varanasihub.com varanasihub.com;
    
    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/key.pem;
    
    root /path/to/frontend/dist;
    index index.html;
    
    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    # Serve static files
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### Backend Server (Nginx Reverse Proxy Example):

```nginx
# API endpoint (if using separate subdomain)
server {
    listen 443 ssl http2;
    server_name api.varanasihub.com;
    
    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/key.pem;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Wildcard subdomain for business websites
server {
    listen 443 ssl http2;
    server_name *.varanasihub.com;
    
    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/key.pem;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 6. Process Management (PM2 Example)

Install PM2:
```bash
npm install -g pm2
```

Create `ecosystem.config.js` in the backend directory:

```javascript
module.exports = {
  apps: [{
    name: 'varanasihub-backend',
    script: './server.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '1G'
  }]
};
```

Start the backend:
```bash
cd backend
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 7. SSL Certificate

Use Let's Encrypt (free SSL):

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d varanasihub.com -d www.varanasihub.com -d api.varanasihub.com -d *.varanasihub.com
```

### 8. Database Setup

1. Ensure your Aiven PostgreSQL database is accessible from your production server
2. Verify SSL connection is working
3. Run any pending migrations
4. Test database connectivity

### 9. Testing Production Deployment

1. **Health Check**: `https://api.varanasihub.com/api/health`
2. **Frontend**: `https://www.varanasihub.com`
3. **Business Subdomain**: `https://[business-slug].varanasihub.com`
4. **API Endpoints**: Test authentication and business creation
5. **File Uploads**: Test image uploads to Cloudinary
6. **Email**: Test OTP sending

### 10. Monitoring & Logging

- Set up error tracking (e.g., Sentry)
- Monitor server resources (CPU, Memory, Disk)
- Set up log rotation
- Monitor database connections
- Set up uptime monitoring

### 11. Backup Strategy

- **Database**: Set up automated backups for PostgreSQL
- **Files**: Backup any local files (if not using Cloudinary)
- **Environment**: Keep secure backups of `.env` files

## 🔄 Changes Made for Production

### Frontend Changes:
1. ✅ Updated `frontend/src/config/constants.js` to use environment variables
2. ✅ Fixed hardcoded localhost URLs in `CreateWebsite.jsx`
3. ✅ Updated `ShareButton.jsx` to use API_BASE_URL
4. ✅ Updated `analytics.js` to use centralized API configuration

### Backend Changes:
1. ✅ Updated `env.template` with production environment variables
2. ✅ Fixed Windows compatibility in `package.json` scripts
3. ✅ CORS already configured for production in `server.js`

## 🚀 Quick Deploy Commands

```bash
# Frontend
cd frontend
npm install
npm run build
# Deploy dist/ folder to your web server

# Backend
cd backend
npm install --production
# Set up .env file
# Start with PM2 or your process manager
pm2 start server.js --name varanasihub-backend
```

## ⚠️ Important Notes

1. **Never commit `.env` files** - They contain sensitive credentials
2. **Use HTTPS everywhere** - Required for OAuth, secure cookies, etc.
3. **Set NODE_ENV=production** - Enables production optimizations
4. **Use strong JWT_SECRET** - Minimum 32 characters, random string
5. **Monitor logs** - Check for errors and performance issues
6. **Test thoroughly** - Test all features before going live
7. **Set up backups** - Database and environment configurations

## 📞 Support

If you encounter issues during deployment:
1. Check server logs
2. Verify environment variables
3. Test database connectivity
4. Check DNS configuration
5. Verify SSL certificates

