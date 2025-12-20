import QRCode from 'qrcode';
import Business from '../models/Business.js';
import User from '../models/User.js';
import pool from '../config/database.js';

/**
 * Generate QR code for a business website
 */
export const generateQRCode = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    // Get business
    const business = await Business.findById(id);

    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    // Check if user owns this business or is admin
    if (userId) {
      const user = await User.findById(userId);
      const isOwner = business.userId === userId;
      const isAdmin = user?.role === 'main_admin';

      if (!isOwner && !isAdmin) {
        return res.status(403).json({ error: 'You do not have permission to access this QR code' });
      }
    }

    // Determine the URL to encode (prefer subdomain, fallback to subdirectory)
    const qrUrl = business.subdomainUrl || business.subdirectoryUrl;

    if (!qrUrl) {
      return res.status(400).json({ error: 'Business URL not available' });
    }

    // Generate QR code as data URL (PNG)
    const qrCodeDataUrl = await QRCode.toDataURL(qrUrl, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.92,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      width: 512,
    });

    res.json({
      qrCode: qrCodeDataUrl,
      url: qrUrl,
      businessName: business.businessName,
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
};

/**
 * Generate QR code PNG buffer for download
 */
export const downloadQRCodePNG = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    // Get business
    const business = await Business.findById(id);

    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    // Check if user owns this business or is admin
    if (userId) {
      const user = await User.findById(userId);
      const isOwner = business.userId === userId;
      const isAdmin = user?.role === 'main_admin';

      if (!isOwner && !isAdmin) {
        return res.status(403).json({ error: 'You do not have permission to download this QR code' });
      }
    }

    // Determine the URL to encode
    const qrUrl = business.subdomainUrl || business.subdirectoryUrl;

    if (!qrUrl) {
      return res.status(400).json({ error: 'Business URL not available' });
    }

    // Generate QR code as PNG buffer
    const qrCodeBuffer = await QRCode.toBuffer(qrUrl, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.92,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      width: 1024, // Higher resolution for download
    });

    // Set headers for download
    const filename = `${business.businessName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_qrcode.png`;
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(qrCodeBuffer);
  } catch (error) {
    console.error('Error generating QR code PNG:', error);
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
};

