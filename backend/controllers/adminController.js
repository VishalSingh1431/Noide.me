import Business from '../models/Business.js';
import User from '../models/User.js';
import pool from '../config/database.js';
import { getCloudinaryUrl } from '../middleware/cloudinaryUpload.js';
import { sendApprovalEmail, sendRejectionEmail } from '../utils/emailService.js';

/**
 * Get all pending website approvals
 */
export const getPendingApprovals = async (req, res) => {
  try {
    // Fetch user from database to get current role (more reliable than JWT)
    const user = await User.findById(req.user?.userId);
    if (!user || user.role !== 'main_admin') {
      return res.status(403).json({ error: 'Only main admin can access this' });
    }

    const query = "SELECT * FROM businesses WHERE status = 'pending' ORDER BY created_at DESC";
    const result = await pool.query(query);
    const businesses = result.rows.map(row => Business.mapRowToBusiness(row));
    res.json({ businesses });
  } catch (error) {
    console.error('Error fetching pending approvals:', error);
    res.status(500).json({ error: 'Failed to fetch pending approvals' });
  }
};

/**
 * Get all pending edit approvals
 */
export const getPendingEditApprovals = async (req, res) => {
  try {
    // Fetch user from database to get current role
    const user = await User.findById(req.user?.userId);
    if (!user || user.role !== 'main_admin') {
      return res.status(403).json({ error: 'Only main admin can access this' });
    }

    const query = `
      SELECT * FROM businesses 
      WHERE edit_approval_status = 'pending' 
      ORDER BY updated_at DESC
    `;
    const result = await pool.query(query);
    const businesses = result.rows.map(row => Business.mapRowToBusiness(row));
    res.json({ businesses });
  } catch (error) {
    console.error('Error fetching pending edit approvals:', error);
    res.status(500).json({ error: 'Failed to fetch pending edit approvals' });
  }
};

/**
 * Approve website creation
 */
export const approveWebsite = async (req, res) => {
  try {
    // Fetch user from database to get current role
    const user = await User.findById(req.user?.userId);
    if (!user || user.role !== 'main_admin') {
      return res.status(403).json({ error: 'Only main admin can approve websites' });
    }

    const { id } = req.params;
    const business = await Business.findById(id);

    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    if (business.status !== 'pending') {
      return res.status(400).json({ error: 'Business is not pending approval' });
    }

    // Update business status to approved
    await pool.query(`
      UPDATE businesses SET status = 'approved', updated_at = CURRENT_TIMESTAMP WHERE id = $1
    `, [id]);
    const updatedBusiness = await Business.findById(id);

    // Auto-promote user to content_admin
    if (business.userId) {
      await User.update(business.userId, { role: 'content_admin' });
      console.log(`✓ Promoted user ${business.userId} to content_admin`);
    }

    // Send approval email
    await sendApprovalEmail(
      business.email,
      business.businessName,
      business.subdomainUrl || business.subdirectoryUrl
    );

    res.json({
      message: 'Website approved successfully. User has been promoted to content admin.',
      business: updatedBusiness,
    });
  } catch (error) {
    console.error('Error approving website:', error);
    res.status(500).json({ error: 'Failed to approve website' });
  }
};

/**
 * Reject website creation
 */
export const rejectWebsite = async (req, res) => {
  try {
    // Fetch user from database to get current role
    const user = await User.findById(req.user?.userId);
    if (!user || user.role !== 'main_admin') {
      return res.status(403).json({ error: 'Only main admin can reject websites' });
    }

    const { id } = req.params;
    const { reason } = req.body;

    const business = await Business.findById(id);

    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    if (business.status !== 'pending') {
      return res.status(400).json({ error: 'Business is not pending approval' });
    }

    // Update business status to rejected
    await pool.query(`
      UPDATE businesses SET status = 'rejected', updated_at = CURRENT_TIMESTAMP WHERE id = $1
    `, [id]);
    const updatedBusiness = await Business.findById(id);

    // Send rejection email
    await sendRejectionEmail(
      business.email,
      business.businessName,
      reason || 'Please review your business information and resubmit.'
    );

    res.json({
      message: 'Website rejected',
      business: updatedBusiness,
      reason: reason || 'No reason provided',
    });
  } catch (error) {
    console.error('Error rejecting website:', error);
    res.status(500).json({ error: 'Failed to reject website' });
  }
};

/**
 * Approve website edit
 */
export const approveEdit = async (req, res) => {
  try {
    // Fetch user from database to get current role
    const user = await User.findById(req.user?.userId);
    if (!user || user.role !== 'main_admin') {
      return res.status(403).json({ error: 'Only main admin can approve edits' });
    }

    const { id } = req.params;
    const business = await Business.findById(id);

    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    if (business.editApprovalStatus !== 'pending') {
      return res.status(400).json({ error: 'Edit is not pending approval' });
    }

    // Update edit approval status
    const updatedBusiness = await Business.update(id, {
      editApprovalStatus: 'approved',
    });

    res.json({
      message: 'Edit approved successfully',
      business: updatedBusiness,
    });
  } catch (error) {
    console.error('Error approving edit:', error);
    res.status(500).json({ error: 'Failed to approve edit' });
  }
};

/**
 * Reject website edit
 */
export const rejectEdit = async (req, res) => {
  try {
    // Fetch user from database to get current role
    const user = await User.findById(req.user?.userId);
    if (!user || user.role !== 'main_admin') {
      return res.status(403).json({ error: 'Only main admin can reject edits' });
    }

    const { id } = req.params;
    const { reason } = req.body;

    const business = await Business.findById(id);

    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    if (business.editApprovalStatus !== 'pending') {
      return res.status(400).json({ error: 'Edit is not pending approval' });
    }

    // Update edit approval status to rejected
    const updatedBusiness = await Business.update(id, {
      editApprovalStatus: 'rejected',
    });

    res.json({
      message: 'Edit rejected',
      business: updatedBusiness,
      reason: reason || 'No reason provided',
    });
  } catch (error) {
    console.error('Error rejecting edit:', error);
    res.status(500).json({ error: 'Failed to reject edit' });
  }
};

/**
 * Get all users (for admin panel)
 */
export const getAllUsers = async (req, res) => {
  try {
    // Fetch user from database to get current role
    const user = await User.findById(req.user?.userId);
    if (!user || user.role !== 'main_admin') {
      return res.status(403).json({ error: 'Only main admin can access this' });
    }

    const query = 'SELECT * FROM users ORDER BY created_at DESC';
    const result = await pool.query(query);
    const users = result.rows.map(row => User.mapRowToUser(row));

    res.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

/**
 * Update user role (promote to content_admin)
 */
export const updateUserRole = async (req, res) => {
  try {
    // Fetch user from database to get current role
    const user = await User.findById(req.user?.userId);
    if (!user || user.role !== 'main_admin') {
      return res.status(403).json({ error: 'Only main admin can update user roles' });
    }

    const { id } = req.params;
    const { role } = req.body;

    if (!['normal', 'content_admin', 'main_admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const updatedUser = await User.update(id, { role });

    res.json({
      message: 'User role updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
};

/**
 * Get admin dashboard stats
 */
export const getAdminStats = async (req, res) => {
  try {
    // Fetch user from database to get current role
    const user = await User.findById(req.user?.userId);
    if (!user || user.role !== 'main_admin') {
      return res.status(403).json({ error: 'Only main admin can access this' });
    }

    const [
      totalUsers,
      totalBusinesses,
      pendingApprovals,
      pendingEdits,
      approvedBusinesses,
      rejectedBusinesses,
    ] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM users'),
      pool.query('SELECT COUNT(*) FROM businesses'),
      pool.query("SELECT COUNT(*) FROM businesses WHERE status = 'pending'"),
      pool.query("SELECT COUNT(*) FROM businesses WHERE edit_approval_status = 'pending'"),
      pool.query("SELECT COUNT(*) FROM businesses WHERE status = 'approved'"),
      pool.query("SELECT COUNT(*) FROM businesses WHERE status = 'rejected'"),
    ]);

    res.json({
      stats: {
        totalUsers: parseInt(totalUsers.rows[0].count),
        totalBusinesses: parseInt(totalBusinesses.rows[0].count),
        pendingApprovals: parseInt(pendingApprovals.rows[0].count),
        pendingEdits: parseInt(pendingEdits.rows[0].count),
        approvedBusinesses: parseInt(approvedBusinesses.rows[0].count),
        rejectedBusinesses: parseInt(rejectedBusinesses.rows[0].count),
      },
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
};

/**
 * Get all businesses (for admin)
 */
export const getAllBusinesses = async (req, res) => {
  try {
    // Fetch user from database to get current role
    const user = await User.findById(req.user?.userId);
    if (!user || user.role !== 'main_admin') {
      return res.status(403).json({ error: 'Only main admin can access this' });
    }

    const query = 'SELECT * FROM businesses ORDER BY created_at DESC';
    const result = await pool.query(query);
    const businesses = result.rows.map(row => Business.mapRowToBusiness(row));

    // Get owner info for each business
    const businessesWithOwners = await Promise.all(
      businesses.map(async (business) => {
        if (business.userId) {
          const owner = await User.findById(business.userId);
          return {
            ...business,
            ownerName: owner?.name || 'Unknown',
            ownerEmail: owner?.email || 'Unknown',
          };
        }
        return business;
      })
    );

    res.json({ businesses: businessesWithOwners });
  } catch (error) {
    console.error('Error fetching all businesses:', error);
    res.status(500).json({ error: 'Failed to fetch businesses' });
  }
};

/**
 * Delete any business (admin only)
 */
export const deleteBusiness = async (req, res) => {
  try {
    // Fetch user from database to get current role
    const user = await User.findById(req.user?.userId);
    if (!user || user.role !== 'main_admin') {
      return res.status(403).json({ error: 'Only main admin can delete businesses' });
    }

    const { id } = req.params;
    const business = await Business.findById(id);

    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    // Delete analytics records
    await pool.query('DELETE FROM analytics WHERE business_id = $1', [id]);
    await pool.query('DELETE FROM analytics_events WHERE business_id = $1', [id]);

    // Delete business
    await pool.query('DELETE FROM businesses WHERE id = $1', [id]);

    res.json({ message: 'Business deleted successfully' });
  } catch (error) {
    console.error('Error deleting business:', error);
    res.status(500).json({ error: 'Failed to delete business' });
  }
};

/**
 * Update any business (admin only)
 */
export const updateBusinessAdmin = async (req, res) => {
  try {
    // Fetch user from database to get current role
    const user = await User.findById(req.user?.userId);
    if (!user || user.role !== 'main_admin') {
      return res.status(403).json({ error: 'Only main admin can update businesses' });
    }

    const { id } = req.params;
    const existingBusiness = await Business.findById(id);

    if (!existingBusiness) {
      return res.status(404).json({ error: 'Business not found' });
    }

    const {
      businessName,
      ownerName,
      category,
      mobileNumber,
      email,
      address,
      googleMapLink,
      whatsappNumber,
      description,
      youtubeVideo,
      instagram,
      facebook,
      website,
      navbarTagline,
      footerDescription,
      services,
      specialOffers,
      businessHours,
      appointmentSettings,
      theme,
    } = req.body;

    // Get uploaded files from Cloudinary (already processed by middleware)
    let logoUrl = existingBusiness.logoUrl;
    if (req.files?.logo?.[0]) {
      logoUrl = getCloudinaryUrl(req.files.logo[0]);
    }

    let imagesUrl = existingBusiness.imagesUrl || [];
    if (req.files?.images && req.files.images.length > 0) {
      const newImages = req.files.images.map((file) => getCloudinaryUrl(file));
      imagesUrl = [...imagesUrl, ...newImages];
    }

    // Process service images
    let servicesData = existingBusiness.services || [];
    try {
      servicesData = typeof services === 'string' ? JSON.parse(services) : (services || existingBusiness.services || []);
    } catch (error) {
      servicesData = existingBusiness.services || [];
    }

    // Process service images from req.files
    if (servicesData && Array.isArray(servicesData) && req.files) {
      servicesData = servicesData.map((service, index) => {
        const serviceImageField = `serviceImage_${index}`;
        const serviceImageFile = req.files.find(f => f.fieldname === serviceImageField);
        if (serviceImageFile) {
          return {
            ...service,
            image: getCloudinaryUrl(serviceImageFile),
          };
        }
        return service;
      });
    }

    // Parse special offers
    let specialOffersData = existingBusiness.specialOffers || [];
    try {
      specialOffersData = typeof specialOffers === 'string' ? JSON.parse(specialOffers) : (specialOffers || existingBusiness.specialOffers || []);
    } catch (error) {
      specialOffersData = existingBusiness.specialOffers || [];
    }

    // Parse business hours
    let businessHoursData = existingBusiness.businessHours || {};
    try {
      businessHoursData = typeof businessHours === 'string' ? JSON.parse(businessHours) : (businessHours || existingBusiness.businessHours || {});
    } catch (error) {
      businessHoursData = existingBusiness.businessHours || {};
    }

    // Parse appointment settings
    let appointmentSettingsData = existingBusiness.appointmentSettings || {};
    try {
      appointmentSettingsData = typeof appointmentSettings === 'string' ? JSON.parse(appointmentSettings) : (appointmentSettings || existingBusiness.appointmentSettings || {});
    } catch (error) {
      appointmentSettingsData = existingBusiness.appointmentSettings || {};
    }
    
    // Update business - admin edits are auto-approved
    const updatedBusiness = await Business.update(id, {
      businessName: businessName || existingBusiness.businessName,
      ownerName: ownerName || existingBusiness.ownerName,
      category: category || existingBusiness.category,
      mobile: mobileNumber || existingBusiness.mobile,
      email: email ? email.toLowerCase() : existingBusiness.email,
      address: address || existingBusiness.address,
      mapLink: googleMapLink || existingBusiness.mapLink,
      whatsapp: whatsappNumber || existingBusiness.whatsapp,
      description: description || existingBusiness.description,
      logoUrl,
      imagesUrl,
      youtubeVideo: youtubeVideo || existingBusiness.youtubeVideo,
      navbarTagline: navbarTagline || existingBusiness.navbarTagline,
      footerDescription: footerDescription || existingBusiness.footerDescription,
      services: servicesData,
      specialOffers: specialOffersData,
      businessHours: businessHoursData,
      appointmentSettings: appointmentSettingsData,
      theme: theme || existingBusiness.theme,
      socialLinks: {
        instagram: instagram || existingBusiness.socialLinks?.instagram || '',
        facebook: facebook || existingBusiness.socialLinks?.facebook || '',
        website: website || existingBusiness.socialLinks?.website || '',
      },
      editApprovalStatus: 'approved', // Auto-approve admin edits
    });

    res.json({
      message: 'Business updated successfully',
      business: updatedBusiness,
    });
  } catch (error) {
    console.error('Error updating business:', error);
    res.status(500).json({ error: 'Failed to update business' });
  }
};

/**
 * Get unified analytics for all businesses
 */
export const getAllAnalytics = async (req, res) => {
  try {
    // Fetch user from database to get current role
    const user = await User.findById(req.user?.userId);
    if (!user || user.role !== 'main_admin') {
      return res.status(403).json({ error: 'Only main admin can access this' });
    }

    // Get all businesses
    const businessesResult = await pool.query('SELECT id, business_name FROM businesses WHERE status = $1', ['approved']);
    const businesses = businessesResult.rows;

    // Get analytics for all businesses
    const analyticsPromises = businesses.map(async (business) => {
      try {
        const statsResult = await pool.query(
          'SELECT * FROM analytics WHERE business_id = $1',
          [business.id]
        );

        const stats = statsResult.rows[0] || {
          visitor_count: 0,
          call_clicks: 0,
          whatsapp_clicks: 0,
          gallery_views: 0,
          map_clicks: 0,
        };

        return {
          businessId: business.id,
          businessName: business.business_name,
          visitor_count: parseInt(stats.visitor_count || 0),
          call_clicks: parseInt(stats.call_clicks || 0),
          whatsapp_clicks: parseInt(stats.whatsapp_clicks || 0),
          gallery_views: parseInt(stats.gallery_views || 0),
          map_clicks: parseInt(stats.map_clicks || 0),
          totalInteractions: parseInt(stats.call_clicks || 0) + 
                            parseInt(stats.whatsapp_clicks || 0) + 
                            parseInt(stats.gallery_views || 0) + 
                            parseInt(stats.map_clicks || 0),
        };
      } catch (error) {
        console.error(`Error fetching analytics for business ${business.id}:`, error);
        // Return default stats if there's an error
        return {
          businessId: business.id,
          businessName: business.business_name,
          visitor_count: 0,
          call_clicks: 0,
          whatsapp_clicks: 0,
          gallery_views: 0,
          map_clicks: 0,
          totalInteractions: 0,
        };
      }
    });

    const allAnalytics = await Promise.all(analyticsPromises);

    // Calculate totals
    const totals = allAnalytics.reduce((acc, analytics) => ({
      totalVisitors: acc.totalVisitors + (analytics.visitor_count || 0),
      totalCallClicks: acc.totalCallClicks + (analytics.call_clicks || 0),
      totalWhatsAppClicks: acc.totalWhatsAppClicks + (analytics.whatsapp_clicks || 0),
      totalGalleryViews: acc.totalGalleryViews + (analytics.gallery_views || 0),
      totalMapClicks: acc.totalMapClicks + (analytics.map_clicks || 0),
      totalInteractions: acc.totalInteractions + (analytics.totalInteractions || 0),
    }), {
      totalVisitors: 0,
      totalCallClicks: 0,
      totalWhatsAppClicks: 0,
      totalGalleryViews: 0,
      totalMapClicks: 0,
      totalInteractions: 0,
    });

    res.json({
      businesses: allAnalytics,
      totals,
    });
  } catch (error) {
    console.error('Error fetching all analytics:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to fetch analytics',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Toggle business verification status
 */
export const toggleBusinessVerification = async (req, res) => {
  try {
    const user = await User.findById(req.user?.userId);
    if (!user || user.role !== 'main_admin') {
      return res.status(403).json({ error: 'Only main admin can verify businesses' });
    }

    const { id } = req.params;
    const business = await Business.findById(id);

    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    // Toggle verification status
    const newVerifiedStatus = !business.verified;
    await pool.query(
      `UPDATE businesses SET verified = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
      [newVerifiedStatus, id]
    );

    const updatedBusiness = await Business.findById(id);

    res.json({
      message: `Business ${newVerifiedStatus ? 'verified' : 'unverified'} successfully`,
      business: updatedBusiness,
    });
  } catch (error) {
    console.error('Error toggling verification:', error);
    res.status(500).json({ error: 'Failed to toggle verification' });
  }
};

