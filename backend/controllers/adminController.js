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

    // Promote user to content_admin if they are currently a normal user
    if (business.userId) {
      const businessOwner = await User.findById(business.userId);
      if (businessOwner && businessOwner.role === 'normal') {
        await User.update(business.userId, { role: 'content_admin' });
        console.log(`✓ Promoted user ${business.userId} to content_admin`);
      } else {
        console.log(`ℹ️ User ${business.userId} already has role: ${businessOwner?.role}, skipping promotion.`);
      }
    }

    // Send approval email
    await sendApprovalEmail(
      business.email,
      business.businessName,
      business.subdomainUrl
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
      bulkImportStats,
    ] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM users'),
      pool.query('SELECT COUNT(*) FROM businesses'),
      pool.query("SELECT COUNT(*) FROM businesses WHERE status = 'pending'"),
      pool.query("SELECT COUNT(*) FROM businesses WHERE edit_approval_status = 'pending'"),
      pool.query("SELECT COUNT(*) FROM businesses WHERE status = 'approved'"),
      pool.query("SELECT COUNT(*) FROM businesses WHERE status = 'rejected'"),
      pool.query(`
        SELECT 
          TRIM(category) as category, 
          COUNT(*) as count, 
          MAX(created_at) as last_run 
        FROM businesses 
        GROUP BY TRIM(category) 
        ORDER BY count DESC
      `),
    ]);

    const stats = {
      totalUsers: parseInt(totalUsers.rows[0].count),
      totalBusinesses: parseInt(totalBusinesses.rows[0].count),
      pendingApprovals: parseInt(pendingApprovals.rows[0].count),
      pendingEdits: parseInt(pendingEdits.rows[0].count),
      approvedBusinesses: parseInt(approvedBusinesses.rows[0].count),
      rejectedBusinesses: parseInt(rejectedBusinesses.rows[0].count),
      bulkImportStats: [
        { category: 'DEBUG_TEST', count: 123, lastRun: new Date() },
        ...bulkImportStats.rows.map(row => ({
          category: row.category,
          count: parseInt(row.count),
          lastRun: row.last_run
        }))
      ],
      allCategories: ['Shop', 'Restaurant', 'Hotel', 'Clinic', 'Library', 'Services', 'Temple', 'School', 'College', 'Gym', 'Salon', 'Spa', 'Pharmacy', 'Bank', 'Travel Agency', 'Real Estate', 'Law Firm', 'Accounting', 'IT Services', 'Photography', 'Event Management', 'Catering', 'Bakery', 'Jewelry', 'Fashion', 'Electronics', 'Furniture', 'Automobile', 'Repair Services', 'Education', 'Healthcare', 'Beauty', 'Fitness', 'Entertainment', 'Tourism', 'Food & Beverage', 'Retail', 'Wholesale', 'Manufacturing', 'Construction', 'Coaching Center', 'Hospital', 'Cafe', 'Dentist', 'Physiotherapist', 'Yoga Center', 'Dance Academy', 'Pet Shop', 'Veterinary', 'Car Repair', 'Bike Repair', 'Electrician', 'Plumber', 'Grocery Store', 'Supermarket', 'Sweet Shop', 'Clothing Store', 'Electronics Store', 'Mobile Shop', 'Jewellery Store', 'Optical Store', 'Book Store', 'Stationery Shop', 'Furniture Store', 'Hardware Store', 'Paint Store', 'Nursery', 'Florist', 'Laundry', 'Dry Cleaner', 'Tailor', 'Photographer', 'Caterer', 'Event Planner', 'Real Estate Agent', 'Lawyer', 'CA', 'Insurance Agent', 'ATM', 'Petrol Pump', 'Parking', 'Mosque', 'Church', 'Gurudwara', 'Park', 'Playground', 'Swimming Pool', 'Sports Complex']
    };

    try {
      const fs = await import('fs');
      fs.writeFileSync('live_stats_debug.json', JSON.stringify(stats, null, 2));
    } catch (e) { }

    res.json({ stats });
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
        try {
          if (business.userId) {
            const owner = await User.findById(business.userId);
            return {
              ...business,
              ownerName: owner?.name || 'Unknown',
              ownerEmail: owner?.email || 'Unknown',
            };
          }
          return business;
        } catch (err) {
          console.error(`Error fetching owner for business ${business.id}:`, err);
          return {
            ...business,
            ownerName: 'Error',
            ownerEmail: 'Error'
          };
        }
      })
    );

    res.json({ businesses: businessesWithOwners });
  } catch (error) {
    console.error('Error fetching all businesses (OUTER):', error);
    console.error(error.stack);
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
        const serviceImageFile = req.files[serviceImageField]?.[0];
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

    // Optimized single query to fetch all approved businesses and their analytics
    const result = await pool.query(`
      SELECT 
        b.id as "businessId", 
        b.business_name as "businessName",
        COALESCE(a.visitor_count, 0) as visitor_count,
        COALESCE(a.call_clicks, 0) as call_clicks,
        COALESCE(a.whatsapp_clicks, 0) as whatsapp_clicks,
        COALESCE(a.gallery_views, 0) as gallery_views,
        COALESCE(a.map_clicks, 0) as map_clicks,
        COALESCE(a.inquiry_clicks, 0) as inquiry_clicks
      FROM businesses b
      LEFT JOIN analytics a ON b.id = a.business_id
      WHERE b.status = 'approved'
    `);

    const allAnalytics = result.rows.map(stats => ({
      businessId: stats.businessId,
      businessName: stats.businessName,
      visitor_count: parseInt(stats.visitor_count),
      call_clicks: parseInt(stats.call_clicks),
      whatsapp_clicks: parseInt(stats.whatsapp_clicks),
      gallery_views: parseInt(stats.gallery_views),
      map_clicks: parseInt(stats.map_clicks),
      inquiry_clicks: parseInt(stats.inquiry_clicks),
      totalInteractions: parseInt(stats.call_clicks) +
        parseInt(stats.whatsapp_clicks) +
        parseInt(stats.gallery_views) +
        parseInt(stats.map_clicks) +
        parseInt(stats.inquiry_clicks),
    }));

    // Calculate totals
    const totals = allAnalytics.reduce((acc, analytics) => ({
      totalVisitors: acc.totalVisitors + (analytics.visitor_count || 0),
      totalCallClicks: acc.totalCallClicks + (analytics.call_clicks || 0),
      totalWhatsAppClicks: acc.totalWhatsAppClicks + (analytics.whatsapp_clicks || 0),
      totalGalleryViews: acc.totalGalleryViews + (analytics.gallery_views || 0),
      totalMapClicks: acc.totalMapClicks + (analytics.map_clicks || 0),
      totalInquiryClicks: acc.totalInquiryClicks + (analytics.inquiry_clicks || 0),
      totalInteractions: acc.totalInteractions + (analytics.totalInteractions || 0),
    }), {
      totalVisitors: 0,
      totalCallClicks: 0,
      totalWhatsAppClicks: 0,
      totalGalleryViews: 0,
      totalMapClicks: 0,
      totalInquiryClicks: 0,
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

