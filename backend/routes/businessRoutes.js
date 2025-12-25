import express from 'express';
import multer from 'multer';
import {
  createBusiness,
  getBusinessBySlug,
  getBusinessBySubdomain,
  getAllBusinesses,
  getUserBusinesses,
  getBusinessById,
  updateBusiness,
  checkSubdomainAvailability,
  getPublicStats,
  testCreateCollege,
  submitCallbackRequest,
} from '../controllers/businessController.js';
import { uploadBusinessMedia, processCloudinaryUploads } from '../middleware/cloudinaryUpload.js';
import { verifyToken } from '../middleware/auth.js';
import { generateQRCode, downloadQRCodePNG } from '../controllers/qrController.js';
import { upgradeToPremium, removePremium } from '../controllers/premiumController.js';

const router = express.Router();

// Create business website (with file uploads)
router.post('/create', verifyToken, (req, res, next) => {
  uploadBusinessMedia(req, res, (err) => {
    if (err) {
      // Handle multer errors
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'File size too large. Maximum size is 5MB.' });
        }
        return res.status(400).json({ error: `Upload error: ${err.message}` });
      }
      // Handle other upload errors
      return res.status(400).json({ error: err.message || 'File upload error' });
    }
    next();
  });
}, processCloudinaryUploads, createBusiness);

// TEST ENDPOINT - Create test business with College category (POST to create, GET to test mapping)
router.post('/test-college', verifyToken, testCreateCollege);
router.get('/test-college', verifyToken, testCreateCollege);

// Get public statistics (must come before /:slug to avoid conflicts)
router.get('/stats', getPublicStats);

// Get all businesses (must come before /:slug to avoid conflicts)
router.get('/', getAllBusinesses);

// Check subdomain availability (must come before /:slug to avoid conflicts)
router.get('/check-subdomain', checkSubdomainAvailability);

// Get user's businesses (requires authentication)
router.get('/my-businesses', verifyToken, getUserBusinesses);

// Get business by ID for editing (requires authentication)
router.get('/edit/:id', verifyToken, getBusinessById);

// Update business (requires authentication)
router.put('/edit/:id', verifyToken, (req, res, next) => {
  uploadBusinessMedia(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'File size too large. Maximum size is 5MB.' });
        }
        return res.status(400).json({ error: `Upload error: ${err.message}` });
      }
      return res.status(400).json({ error: err.message || 'File upload error' });
    }
    next();
  });
}, processCloudinaryUploads, updateBusiness);

// QR Code routes (must come before /:slug to avoid conflicts)
router.get('/:id/qrcode', verifyToken, generateQRCode);
router.get('/:id/qrcode/download/png', verifyToken, downloadQRCodePNG);

// Premium upgrade routes (must come before /:slug to avoid conflicts)
router.post('/:id/upgrade-premium', verifyToken, upgradeToPremium);
router.post('/:id/remove-premium', verifyToken, removePremium);

// Submit callback request
router.post('/callback-request', submitCallbackRequest);

// Get business by slug (for subdirectory: /slug) - must be last
router.get('/:slug', getBusinessBySlug);

export default router;

