import express from 'express';
import multer from 'multer';
import { parseResume, savePortfolio, getPortfolio } from '../controllers/portfolioController.js';

const router = express.Router();

// Multer setup for file uploads (stored in memory)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

router.post('/parse-resume', upload.single('resume'), parseResume);
router.post('/save', savePortfolio);
router.get('/me', getPortfolio);

export default router;
