import express from 'express';
import {
  getAutocompleteSuggestions,
  getPlaceDetails,
} from '../controllers/googlePlacesController.js';
import { apiLimiter } from '../middleware/security.js';

const router = express.Router();

// Rate limit these endpoints to prevent abuse
router.post('/autocomplete', apiLimiter, getAutocompleteSuggestions);
router.post('/details', apiLimiter, getPlaceDetails);

export default router;

