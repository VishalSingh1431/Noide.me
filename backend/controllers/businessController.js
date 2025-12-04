import Business from '../models/Business.js';
import User from '../models/User.js';
import { slugify } from '../utils/slugify.js';
import { getCloudinaryUrl } from '../middleware/cloudinaryUpload.js';
import { generateBusinessHTML } from '../views/businessTemplate.js';
import pool from '../config/database.js';

/**
 * Check subdomain/slug availability
 */
export const checkSubdomainAvailability = async (req, res) => {
  try {
    const { slug } = req.query;
    
    if (!slug || typeof slug !== 'string') {
      return res.status(400).json({ error: 'Slug is required' });
    }

    // Validate slug format (alphanumeric only, no hyphens, 3-50 chars)
    const slugRegex = /^[a-z0-9]{3,50}$/;
    if (!slugRegex.test(slug)) {
      return res.status(400).json({ 
        error: 'Invalid slug format. Use only lowercase letters and numbers (3-50 characters, no spaces or hyphens).',
        available: false 
      });
    }

    const exists = await Business.slugExists(slug);
    
    if (exists) {
      // Generate suggestions with numbers (no hyphens)
      const suggestions = [];
      for (let i = 1; i <= 10; i++) {
        const suggestedSlug = `${slug}${i}`;
        const suggestedExists = await Business.slugExists(suggestedSlug);
        if (!suggestedExists) {
          suggestions.push(suggestedSlug);
          if (suggestions.length >= 3) break;
        }
      }
      
      return res.json({
        available: false,
        slug,
        suggestions: suggestions.length > 0 ? suggestions : null,
      });
    }

    return res.json({
      available: true,
      slug,
    });
  } catch (error) {
    console.error('Error checking subdomain availability:', error);
    res.status(500).json({ error: 'Failed to check subdomain availability' });
  }
};

/**
 * Create a new business website
 */
export const createBusiness = async (req, res) => {
  try {
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
      preferredSlug,
    } = req.body;

    // Validate required fields - check for empty strings too
    if (!businessName || !businessName.trim()) {
      return res.status(400).json({
        error: 'Business name is required',
      });
    }
    if (!category || (typeof category === 'string' && !category.trim())) {
      return res.status(400).json({
        error: 'Category is required',
      });
    }
    if (!address || !address.trim()) {
      return res.status(400).json({
        error: 'Address is required',
      });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({
        error: 'Description is required',
      });
    }

    // Validate and normalize category - FORCE to valid value
    const validCategories = ['Shop', 'Clinic', 'Library', 'Hotel', 'Restaurant', 'Services'];
    
    // Extract category from any format (string, object, etc.)
    let categoryValue = category;
    if (typeof category === 'object' && category !== null) {
      categoryValue = category.value || category.name || category.category || 'Services';
    }
    
    // Normalize: convert to string, trim, handle null/undefined
    const normalizedCategory = categoryValue ? String(categoryValue).trim() : '';
    const lowerCategory = normalizedCategory.toLowerCase();
    
    // COMPREHENSIVE MAPPING - Map ALL 45+ frontend categories to backend's 6 valid categories
    const categoryMap = {
      // Shop category (retail, stores, products)
      'shop': 'Shop', 'shops': 'Shop', 'store': 'Shop', 'stores': 'Shop', 'retail': 'Shop',
      'jewelry': 'Shop', 'fashion': 'Shop', 'electronics': 'Shop', 'furniture': 'Shop',
      'automobile': 'Shop', 'wholesale': 'Shop', 'manufacturing': 'Shop', 'construction': 'Shop',
      'bakery': 'Shop', 'pharmacy': 'Shop', 'bank': 'Shop',
      
      // Clinic category (health, medical, beauty)
      'clinic': 'Clinic', 'clinics': 'Clinic', 'hospital': 'Clinic', 'medical': 'Clinic',
      'healthcare': 'Clinic', 'spa': 'Clinic', 'salon': 'Clinic', 'beauty': 'Clinic',
      
      // Library category (education, learning)
      'library': 'Library', 'libraries': 'Library', 'book': 'Library', 'school': 'Library',
      'college': 'Library', 'education': 'Library',
      
      // Hotel category (hospitality, travel, accommodation)
      'hotel': 'Hotel', 'hotels': 'Hotel', 'lodging': 'Hotel', 'accommodation': 'Hotel',
      'tourism': 'Hotel', 'travel agency': 'Hotel', 'travel': 'Hotel',
      
      // Restaurant category (food, dining)
      'restaurant': 'Restaurant', 'restaurants': 'Restaurant', 'food': 'Restaurant', 
      'dining': 'Restaurant', 'food & beverage': 'Restaurant', 'catering': 'Restaurant',
      
      // Services category (everything else - default)
      'services': 'Services', 'service': 'Services', 'other': 'Services', 'others': 'Services',
      'general': 'Services', 'misc': 'Services', 'miscellaneous': 'Services', 'default': 'Services',
      'temple': 'Services', 'gym': 'Services', 'fitness': 'Services', 'real estate': 'Services',
      'law firm': 'Services', 'accounting': 'Services', 'it services': 'Services',
      'photography': 'Services', 'event management': 'Services', 'repair services': 'Services',
      'entertainment': 'Services'
    };
    
    // Force to valid category - default to Services if anything fails
    let finalCategory = 'Services'; // ALWAYS default to Services
    
    if (normalizedCategory && validCategories.includes(normalizedCategory)) {
      finalCategory = normalizedCategory;
    } else if (normalizedCategory && categoryMap[lowerCategory]) {
      finalCategory = categoryMap[lowerCategory];
    }
    // If still not valid, finalCategory is already 'Services'
    
    console.log('🔍 Category input:', category, 'Normalized:', normalizedCategory, 'Lower:', lowerCategory, '→ Final:', finalCategory);

    // Set default email and phone if not provided
    const finalEmail = email || 'example@gmail.com';
    const finalMobileNumber = mobileNumber || '0123456789';

    // Get user ID from token if available
    const userId = req.user?.userId || null;

    // Check user role and restrict content_admin to one website only
    if (userId) {
      const user = await User.findById(userId);
      if (user) {
        // If user is content_admin, check if they already have a business
        if (user.role === 'content_admin') {
          const existingBusinesses = await Business.findByUserId(userId);
          // Count only approved or pending businesses (not rejected)
          const activeBusinesses = existingBusinesses.filter(
            biz => biz.status === 'approved' || biz.status === 'pending'
          );
          
          if (activeBusinesses.length > 0) {
            return res.status(403).json({
              error: 'Content admins can only create one website. You already have a website. Please contact the main admin if you need to create additional websites.',
              existingBusiness: {
                id: activeBusinesses[0].id,
                businessName: activeBusinesses[0].businessName,
                status: activeBusinesses[0].status,
              }
            });
          }
        }
        // main_admin can create unlimited websites, so no restriction needed
      }
    }

    // Generate slug from business name or use preferred slug
    let slug;
    if (preferredSlug && typeof preferredSlug === 'string') {
      // Use preferred slug if provided and valid
      const preferredSlugClean = preferredSlug.toLowerCase().trim();
      const slugRegex = /^[a-z0-9]{3,50}$/;
      if (slugRegex.test(preferredSlugClean)) {
        const preferredExists = await Business.slugExists(preferredSlugClean);
        if (!preferredExists) {
          slug = preferredSlugClean;
        } else {
          // Preferred slug is taken, fall back to auto-generation
          slug = slugify(businessName);
        }
      } else {
        // Invalid preferred slug, fall back to auto-generation
        slug = slugify(businessName);
      }
    } else {
      // Auto-generate slug from business name
      slug = slugify(businessName);
    }
    
    // If slug is still not set or exists, append a number
    if (!slug) {
      slug = slugify(businessName);
    }
    
    let slugExists = await Business.slugExists(slug);
    let counter = 1;
    while (slugExists) {
      slug = `${slugify(businessName)}${counter}`;
      slugExists = await Business.slugExists(slug);
      counter++;
    }

    // Get uploaded files from Cloudinary (already processed by middleware)
    const logoUrl = req.files?.logo?.[0] ? getCloudinaryUrl(req.files.logo[0]) : null;
    const imagesUrl = req.files?.images
      ? req.files.images.map((file) => getCloudinaryUrl(file)).filter(Boolean)
      : [];

    // Process service images
    let servicesData = [];
    try {
      servicesData = typeof services === 'string' ?
        JSON.parse(services) :
        (services || []);
    } catch (error) {
      servicesData = [];
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
    let specialOffersData = [];
    try {
      specialOffersData = typeof specialOffers === 'string' ?
        JSON.parse(specialOffers) :
        (specialOffers || []);
    } catch (error) {
      specialOffersData = [];
    }

    // Parse business hours
    let businessHoursData = {};
    try {
      businessHoursData = typeof businessHours === 'string' ?
        JSON.parse(businessHours) :
        (businessHours || {});
    } catch (error) {
      businessHoursData = {};
    }

    // Parse appointment settings
    let appointmentSettingsData = {};
    try {
      appointmentSettingsData = typeof appointmentSettings === 'string' ?
        JSON.parse(appointmentSettings) :
        (appointmentSettings || {});
    } catch (error) {
      appointmentSettingsData = {};
    }

    // Generate subdomain and subdirectory URLs
    // Default to production unless explicitly in development mode
    const isDevelopment = process.env.NODE_ENV === 'development';
    const baseDomain = process.env.BASE_DOMAIN || 'varanasihub.com';
    
    let subdomainUrl, subdirectoryUrl;
    
    if (isDevelopment) {
      // For localhost: use http://subdomain.localhost:PORT
      const port = process.env.PORT || 5000;
      subdomainUrl = `http://${slug}.localhost:${port}`;
      subdirectoryUrl = `http://localhost:${port}/${slug}`;
    } else {
      // For production: use https://subdomain.domain.com
      subdomainUrl = `https://${slug}.${baseDomain}`;
      subdirectoryUrl = `https://${baseDomain}/${slug}`;
    }

    // FINAL SAFETY CHECK - ensure category is ALWAYS valid before database
    const validCategories = ['Shop', 'Clinic', 'Library', 'Hotel', 'Restaurant', 'Services'];
    let safeCategory = 'Services'; // Default fallback
    
    // Triple check: if finalCategory is valid, use it; otherwise force to Services
    if (finalCategory && validCategories.includes(finalCategory)) {
      safeCategory = finalCategory;
    } else {
      safeCategory = 'Services';
      console.log('⚠️ Category was invalid, forcing to Services. Original:', finalCategory);
    }
    
    console.log('🛡️ Final safety check - Category:', finalCategory, '→ Safe:', safeCategory);
    console.log('🛡️ Safe category type:', typeof safeCategory, 'Value:', JSON.stringify(safeCategory));
    
    // Create business record
    const business = await Business.create({
      businessName,
      ownerName: ownerName || '',
      category: safeCategory, // Use safe category
      mobile: finalMobileNumber,
      email: finalEmail.toLowerCase(),
      address,
      mapLink: googleMapLink || '',
      whatsapp: whatsappNumber || '',
      description,
      logoUrl,
      imagesUrl,
      youtubeVideo: youtubeVideo || '',
      navbarTagline: navbarTagline || '',
      footerDescription: footerDescription || '',
      services: servicesData,
      specialOffers: specialOffersData,
      businessHours: businessHoursData,
      appointmentSettings: appointmentSettingsData,
      theme: theme || 'modern',
      socialLinks: {
        instagram: instagram || '',
        facebook: facebook || '',
        website: website || '',
      },
      slug,
      subdomainUrl,
      subdirectoryUrl,
      status: 'pending', // Require admin approval
      userId,
    });

    // Return success response
    res.status(201).json({
      message: 'Business website created successfully! Your website is pending admin approval. You will be notified once it\'s approved.',
      business: {
        id: business.id,
        businessName: business.businessName,
        slug: business.slug,
        subdomainUrl: business.subdomainUrl,
        subdirectoryUrl: business.subdirectoryUrl,
        status: business.status,
      },
      requiresApproval: true,
    });
  } catch (error) {
    console.error('❌ Error creating business:', error.message);
    console.error('Error code:', error.code);
    console.error('Category received from request:', req.body?.category);
    console.error('Final category that was used:', typeof finalCategory !== 'undefined' ? finalCategory : 'NOT SET');
    console.error('Safe category that was used:', typeof safeCategory !== 'undefined' ? safeCategory : 'NOT SET');
    console.error('Request body keys:', Object.keys(req.body || {}));
    console.error('Request files keys:', Object.keys(req.files || {}));
    
    // Handle PostgreSQL unique constraint violation
    if (error.code === '23505') {
      const field = error.constraint?.includes('slug') ? 'slug' : 'email';
      return res.status(400).json({
        error: `${field} already exists. Please choose a different ${field === 'slug' ? 'business name' : 'email'}.`,
      });
    }

    // Handle PostgreSQL check constraint violation
    if (error.code === '23514') {
      console.error('❌ Database constraint error:', error.message);
      console.error('❌ Constraint name:', error.constraint);
      console.error('❌ Error detail:', error.detail);
      console.error('❌ Category that was sent:', safeCategory);
      console.error('❌ Status that was sent:', 'pending');
      
      // Common constraint violations: category or status
      let errorMsg = 'Invalid data provided. ';
      if (error.constraint?.includes('category')) {
        errorMsg += `Category "${safeCategory || 'unknown'}" is invalid. Must be one of: Shop, Clinic, Library, Hotel, Restaurant, Services`;
        console.error('❌ CATEGORY CONSTRAINT VIOLATION - This should never happen!');
        console.error('❌ Received category:', category);
        console.error('❌ Normalized category:', normalizedCategory);
        console.error('❌ Final category:', finalCategory);
        console.error('❌ Safe category:', safeCategory);
      } else if (error.constraint?.includes('status')) {
        errorMsg += 'Status must be one of: pending, approved, rejected, active';
      } else {
        errorMsg += 'Please check your input values.';
        console.error('❌ UNKNOWN CONSTRAINT VIOLATION:', error.constraint);
      }
      return res.status(400).json({
        error: errorMsg,
        ...(process.env.NODE_ENV === 'development' && { 
          constraint: error.constraint, 
          details: error.message,
          detail: error.detail,
          receivedCategory: category,
          finalCategory: finalCategory,
          safeCategory: safeCategory
        }),
      });
    }

    // Return detailed error in development, generic in production
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? error.message || 'Failed to create business website'
      : 'Failed to create business website';
    
    res.status(500).json({ 
      error: errorMessage,
      ...(process.env.NODE_ENV === 'development' && { details: error.stack })
    });
  }
};

/**
 * Get user's businesses
 */
export const getUserBusinesses = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const businesses = await Business.findByUserId(userId);
    res.json({ businesses });
  } catch (error) {
    console.error('Error fetching user businesses:', error);
    res.status(500).json({ error: 'Failed to fetch businesses' });
  }
};

/**
 * Get business by ID for editing
 */
export const getBusinessById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const business = await Business.findById(id);

    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    // Check if user owns this business
    if (business.userId !== userId) {
      return res.status(403).json({ error: 'You do not have permission to edit this business' });
    }

    res.json({ business });
  } catch (error) {
    console.error('Error fetching business:', error);
    res.status(500).json({ error: 'Failed to fetch business' });
  }
};

/**
 * Update business
 */
export const updateBusiness = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get existing business
    const existingBusiness = await Business.findById(id);

    if (!existingBusiness) {
      return res.status(404).json({ error: 'Business not found' });
    }

    // Check if user owns this business
    if (existingBusiness.userId !== userId) {
      return res.status(403).json({ error: 'You do not have permission to edit this business' });
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

    // Check user role - content admins need approval for edits
    // Fetch user from database to get current role (more reliable than JWT)
    const user = await User.findById(req.user?.userId);
    const userRole = user?.role || 'normal';
    const needsApproval = userRole === 'content_admin';
    
    // Normalize category if provided (same logic as create)
    let finalCategory = existingBusiness.category; // Default to existing
    if (category) {
      const validCategories = ['Shop', 'Clinic', 'Library', 'Hotel', 'Restaurant', 'Services'];
      const categoryMap = {
        'shop': 'Shop', 'shops': 'Shop', 'store': 'Shop', 'stores': 'Shop', 'retail': 'Shop',
        'jewelry': 'Shop', 'fashion': 'Shop', 'electronics': 'Shop', 'furniture': 'Shop',
        'automobile': 'Shop', 'wholesale': 'Shop', 'manufacturing': 'Shop', 'construction': 'Shop',
        'bakery': 'Shop', 'pharmacy': 'Shop', 'bank': 'Shop',
        'clinic': 'Clinic', 'clinics': 'Clinic', 'hospital': 'Clinic', 'medical': 'Clinic',
        'healthcare': 'Clinic', 'spa': 'Clinic', 'salon': 'Clinic', 'beauty': 'Clinic',
        'library': 'Library', 'libraries': 'Library', 'book': 'Library', 'school': 'Library',
        'college': 'Library', 'education': 'Library',
        'hotel': 'Hotel', 'hotels': 'Hotel', 'lodging': 'Hotel', 'accommodation': 'Hotel',
        'tourism': 'Hotel', 'travel agency': 'Hotel', 'travel': 'Hotel',
        'restaurant': 'Restaurant', 'restaurants': 'Restaurant', 'food': 'Restaurant',
        'dining': 'Restaurant', 'food & beverage': 'Restaurant', 'catering': 'Restaurant',
        'services': 'Services', 'service': 'Services', 'other': 'Services', 'others': 'Services',
        'general': 'Services', 'misc': 'Services', 'miscellaneous': 'Services', 'default': 'Services',
        'temple': 'Services', 'gym': 'Services', 'fitness': 'Services', 'real estate': 'Services',
        'law firm': 'Services', 'accounting': 'Services', 'it services': 'Services',
        'photography': 'Services', 'event management': 'Services', 'repair services': 'Services',
        'entertainment': 'Services'
      };
      
      const normalizedCategory = String(category).trim();
      const lowerCategory = normalizedCategory.toLowerCase();
      
      if (validCategories.includes(normalizedCategory)) {
        finalCategory = normalizedCategory;
      } else if (categoryMap[lowerCategory]) {
        finalCategory = categoryMap[lowerCategory];
      } else {
        finalCategory = 'Services'; // Default fallback
      }
      
      console.log('🔍 Update Category input:', category, '→ Final:', finalCategory);
    }
    
    // Update business
    const updatedBusiness = await Business.update(id, {
      businessName: businessName || existingBusiness.businessName,
      ownerName: ownerName || existingBusiness.ownerName,
      category: finalCategory,
      mobile: mobileNumber || existingBusiness.mobile || '0123456789',
      email: email ? email.toLowerCase() : existingBusiness.email || 'example@gmail.com',
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
      editApprovalStatus: needsApproval ? 'pending' : 'none',
    });

    const message = needsApproval 
      ? 'Your changes have been submitted for admin approval. They will be live once approved.'
      : 'Business updated successfully';
    
    res.json({
      message,
      business: updatedBusiness,
      requiresApproval: needsApproval,
    });
  } catch (error) {
    console.error('Error updating business:', error);
    res.status(500).json({ error: 'Failed to update business' });
  }
};

/**
 * Get business by slug (for subdirectory routing)
 */
export const getBusinessBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const business = await Business.findBySlug(slug, ['approved']);

    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    // Return HTML template for business page
    const html = generateBusinessHTML(business);
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    console.error('Error fetching business:', error);
    res.status(500).json({ error: 'Failed to fetch business' });
  }
};

/**
 * Get business by subdomain (for subdomain routing)
 */
export const getBusinessBySubdomain = async (req, res) => {
  try {
    // Extract subdomain from hostname
    let subdomain = req.subdomain;
    
    if (!subdomain) {
      return res.status(404).json({ error: 'No subdomain found' });
    }
    
    const business = await Business.findBySlug(subdomain, ['approved']);

    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    // Return HTML template for business page
    const html = generateBusinessHTML(business);
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    console.error('Error fetching business by subdomain:', error);
    res.status(500).json({ error: 'Failed to fetch business' });
  }
};

/**
 * Get all businesses (public directory - shows approved businesses)
 */
export const getAllBusinesses = async (req, res) => {
  try {
    const { status } = req.query;
    
    // If status filter is provided, use it; otherwise default to approved
    let businesses;
    if (status) {
      businesses = await Business.findAll(status);
    } else {
      // Default to showing only approved businesses in directory
      businesses = await Business.findAll('approved');
    }
    
    res.json({ businesses });
  } catch (error) {
    console.error('Error fetching businesses:', error);
    res.status(500).json({ error: 'Failed to fetch businesses' });
  }
};

/**
 * Get public statistics for homepage
 * No authentication required
 */
export const getPublicStats = async (req, res) => {
  try {
    const [
      totalBusinesses,
      approvedBusinesses,
      totalUsers,
    ] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM businesses'),
      pool.query("SELECT COUNT(*) FROM businesses WHERE status = 'approved'"),
      pool.query('SELECT COUNT(*) FROM users'),
    ]);

    const totalBusinessesCount = parseInt(totalBusinesses.rows[0].count);
    const approvedBusinessesCount = parseInt(approvedBusinesses.rows[0].count);
    const totalUsersCount = parseInt(totalUsers.rows[0].count);

    // Calculate trust percentage (approved businesses / total businesses * 100)
    // If no businesses, default to 98%
    const trustPercentage = totalBusinessesCount > 0 
      ? Math.round((approvedBusinessesCount / totalBusinessesCount) * 100)
      : 98;

    res.json({
      stats: {
        totalBusinesses: totalBusinessesCount,
        approvedBusinesses: approvedBusinessesCount,
        totalUsers: totalUsersCount,
        trustPercentage: trustPercentage,
      },
    });
  } catch (error) {
    console.error('Error fetching public stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};
