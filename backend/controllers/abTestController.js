import ABTest from '../models/ABTest.js';
import Business from '../models/Business.js';

/**
 * Track visitor for A/B test variant
 */
export const trackVisitor = async (req, res) => {
  try {
    const { businessId, variantName } = req.params;

    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    await ABTest.incrementVisitor(businessId, variantName);
    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking visitor:', error);
    res.status(500).json({ error: 'Failed to track visitor' });
  }
};

/**
 * Track conversion for A/B test variant
 */
export const trackConversion = async (req, res) => {
  try {
    const { businessId, variantName } = req.params;

    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    await ABTest.incrementConversion(businessId, variantName);
    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking conversion:', error);
    res.status(500).json({ error: 'Failed to track conversion' });
  }
};

/**
 * Get A/B test results
 */
export const getResults = async (req, res) => {
  try {
    const { businessId } = req.params;
    
    // This should be protected, but for now allow public access
    const variants = await ABTest.findByBusinessId(businessId);
    
    res.json({ variants });
  } catch (error) {
    console.error('Error getting A/B test results:', error);
    res.status(500).json({ error: 'Failed to get results' });
  }
};

