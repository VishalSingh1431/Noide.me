import express from 'express';
import { getProducts, createOrder } from '../controllers/ecommerceController.js';
import { submitContactForm } from '../controllers/contactController.js';

const router = express.Router();

// Get products for a business (public)
router.get('/:slug/products', getProducts);

// Create order (public)
router.post('/:slug/orders', createOrder);

// Submit contact form (public)
router.post('/:slug/contact', submitContactForm);

export default router;

