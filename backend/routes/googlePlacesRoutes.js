import express from 'express';
import {
  getAutocompleteSuggestions,
  getPlaceDetails,
} from '../controllers/googlePlacesController.js';

const router = express.Router();

router.post('/autocomplete', getAutocompleteSuggestions);
router.post('/details', getPlaceDetails);

export default router;

