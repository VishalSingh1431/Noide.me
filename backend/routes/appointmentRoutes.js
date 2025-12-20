import express from 'express';
import {
  createAppointment,
  getBusinessAppointments,
  updateAppointmentStatus,
  getAvailableSlots,
} from '../controllers/appointmentController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/business/:businessId/available-slots', getAvailableSlots);
router.post('/business/:businessId', createAppointment);

// Protected routes (business owners)
router.get('/business/:businessId/appointments', verifyToken, getBusinessAppointments);
router.patch('/:appointmentId/status', verifyToken, updateAppointmentStatus);

export default router;

