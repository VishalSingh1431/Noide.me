#!/bin/bash
# Complete VPS Update Script for Varanasihub.com
# Run this on your VPS to update the website

echo "=== Starting Varanasihub Update ==="

# Navigate to project directory
echo "1. Navigating to project directory..."
cd /var/www/Varanasihub/Varanasihub.com || { echo "❌ Failed to navigate to project directory"; exit 1; }

# Pull latest code from GitHub
echo "2. Pulling latest code from GitHub..."
git pull origin main || { echo "❌ Failed to pull from GitHub"; exit 1; }

# Update backend dependencies
echo "3. Updating backend dependencies..."
cd backend
npm install || { echo "❌ Failed to install backend dependencies"; exit 1; }

# Update frontend dependencies and build
echo "4. Building frontend..."
cd ../frontend
npm install || { echo "❌ Failed to install frontend dependencies"; exit 1; }
npm run build || { echo "❌ Failed to build frontend"; exit 1; }

# Restart backend with PM2
echo "5. Restarting backend..."
cd ../backend
pm2 restart backend --update-env || { echo "❌ Failed to restart backend"; exit 1; }

# Reload Nginx
echo "6. Reloading Nginx..."
sudo nginx -t && sudo systemctl reload nginx || { echo "❌ Failed to reload Nginx"; exit 1; }

# Check service status
echo "7. Checking service status..."
echo ""
echo "=== PM2 Status ==="
pm2 status

echo ""
echo "=== Nginx Status ==="
sudo systemctl status nginx --no-pager -l

echo ""
echo "=== Recent Backend Logs ==="
pm2 logs backend --lines 20 --nostream

echo ""
echo "✅ Update Complete!"
echo "🌐 Website: https://varanasihub.com"
echo "📊 Check logs: pm2 logs backend --lines 50"

