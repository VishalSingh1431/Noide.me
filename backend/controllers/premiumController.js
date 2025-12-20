import Business from '../models/Business.js';
import User from '../models/User.js';
import pool from '../config/database.js';

/**
 * Upgrade business to premium (verified badge)
 */
export const upgradeToPremium = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get business
    const business = await Business.findById(id);

    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    // Check if user owns this business or is admin
    const user = await User.findById(userId);
    const isOwner = business.userId === userId;
    const isAdmin = user?.role === 'main_admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'You do not have permission to upgrade this business' });
    }

    // Update business to premium
    const updatedBusiness = await Business.update(id, {
      isPremium: true,
    });

    res.json({
      message: 'Business upgraded to premium successfully! Your business now has a verified badge and higher ranking.',
      business: updatedBusiness,
    });
  } catch (error) {
    console.error('Error upgrading to premium:', error);
    res.status(500).json({ error: 'Failed to upgrade business to premium' });
  }
};

/**
 * Remove premium status (admin only)
 */
export const removePremium = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if user is admin
    const user = await User.findById(userId);
    if (user?.role !== 'main_admin') {
      return res.status(403).json({ error: 'Only main admin can remove premium status' });
    }

    const { id } = req.params;
    const business = await Business.findById(id);

    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    // Remove premium status
    const updatedBusiness = await Business.update(id, {
      isPremium: false,
    });

    res.json({
      message: 'Premium status removed successfully',
      business: updatedBusiness,
    });
  } catch (error) {
    console.error('Error removing premium status:', error);
    res.status(500).json({ error: 'Failed to remove premium status' });
  }
};

