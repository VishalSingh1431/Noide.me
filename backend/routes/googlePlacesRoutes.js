import express from 'express';
import {
  getAutocompleteSuggestions,
  getPlaceDetails,
  textSearch
} from '../controllers/googlePlacesController.js';

const router = express.Router();

router.post('/autocomplete', getAutocompleteSuggestions);
router.post('/details', getPlaceDetails);
router.post('/text-search', textSearch);

export default router;

