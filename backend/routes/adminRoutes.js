import express from 'express';
import {
  getPendingApprovals,
  getPendingEditApprovals,
  approveWebsite,
  rejectWebsite,
  approveEdit,
  rejectEdit,
  getAllUsers,
  updateUserRole,
  getAdminStats,
  getAllBusinesses,
  deleteBusiness,
  updateBusinessAdmin,
  getAllAnalytics,
  toggleBusinessVerification,
  getWhatsAppStatus,
  markWhatsAppSent,
} from '../controllers/adminController.js';
import {
  getWAQR,
  getWAStatus,
  connectWA,
  startWAWorker,
  stopWAWorker,
} from '../controllers/whatsappController.js';
import { verifyToken } from '../middleware/auth.js';
import upload from '../config/cloudinary.js';

const router = express.Router();

// All admin routes require authentication
router.use(verifyToken);

// Admin dashboard stats
router.get('/stats', getAdminStats);

// Website approvals
router.get('/pending-approvals', getPendingApprovals);
router.post('/approve-website/:id', approveWebsite);
router.post('/reject-website/:id', rejectWebsite);

// Edit approvals
router.get('/pending-edit-approvals', getPendingEditApprovals);
router.post('/approve-edit/:id', approveEdit);
router.post('/reject-edit/:id', rejectEdit);

// User management
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);

// Business management (admin can manage all businesses)
router.get('/businesses', getAllBusinesses);
router.delete('/businesses/:id', deleteBusiness);
router.put('/businesses/:id', upload.any(), updateBusinessAdmin);

// Unified analytics
router.get('/analytics/all', getAllAnalytics);

// Business verification
router.post('/businesses/:id/verify', toggleBusinessVerification);

// WhatsApp notification manager (manual click-to-send)
router.get('/whatsapp-status', getWhatsAppStatus);
router.post('/whatsapp-sent/:id', markWhatsAppSent);

// WhatsApp Automation (Baileys)
router.post('/wa/connect', connectWA);
router.get('/wa/qr', getWAQR);
router.get('/wa/status', getWAStatus);
router.post('/wa/start', startWAWorker);
router.post('/wa/stop', stopWAWorker);

export default router;

