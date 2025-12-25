import Business from '../models/Business.js';
import User from '../models/User.js';
import { slugify } from '../utils/slugify.js';
import { getCloudinaryUrl } from '../middleware/cloudinaryUpload.js';
import { generateBusinessHTML } from '../views/businessTemplate.js';
import pool from '../config/database.js';
import ContactForm from '../models/ContactForm.js';

/**
 * TEST ENDPOINT - Create actual test business with College category
 */
export const testCreateCollege = async (req, res) => {
  try {
    console.log('🧪 TEST: Creating actual test business with College category');

    const {
      businessName = 'Test College Business',
      ownerName = 'Test Owner',
      category = 'College',
      mobileNumber = '0123456789',
      email = `test-college-${Date.now()}@example.com`,
      address = 'Test Address, Varanasi, UP',
      description = 'This is a test business with College category to verify it works correctly',
    } = req.body;

    // Validate and normalize category using the same logic as createBusiness
    const validCategories = ['Shop', 'Restaurant', 'Hotel', 'Clinic', 'Library', 'Services', 'Temple', 'School', 'College', 'Gym', 'Salon', 'Spa', 'Pharmacy', 'Bank', 'Travel Agency', 'Real Estate', 'Law Firm', 'Accounting', 'IT Services', 'Photography', 'Event Management', 'Catering', 'Bakery', 'Jewelry', 'Fashion', 'Electronics', 'Furniture', 'Automobile', 'Repair Services', 'Education', 'Healthcare', 'Beauty', 'Fitness', 'Entertainment', 'Tourism', 'Food & Beverage', 'Retail', 'Wholesale', 'Manufacturing', 'Construction', 'Other'];

    const categoryMap = {
      'shop': 'Shop', 'shops': 'Shop', 'store': 'Shop', 'stores': 'Shop',
      'restaurant': 'Restaurant', 'restaurants': 'Restaurant',
      'hotel': 'Hotel', 'hotels': 'Hotel',
      'clinic': 'Clinic', 'clinics': 'Clinic',
      'library': 'Library', 'libraries': 'Library',
      'services': 'Services', 'service': 'Services',
      'temple': 'Temple', 'school': 'School', 'college': 'College', 'gym': 'Gym',
      'salon': 'Salon', 'spa': 'Spa', 'pharmacy': 'Pharmacy', 'bank': 'Bank',
      'travel agency': 'Travel Agency', 'real estate': 'Real Estate', 'law firm': 'Law Firm',
      'accounting': 'Accounting', 'it services': 'IT Services', 'photography': 'Photography',
      'event management': 'Event Management', 'catering': 'Catering', 'bakery': 'Bakery',
      'jewelry': 'Jewelry', 'fashion': 'Fashion', 'electronics': 'Electronics',
      'furniture': 'Furniture', 'automobile': 'Automobile', 'repair services': 'Repair Services',
      'education': 'Education', 'healthcare': 'Healthcare', 'beauty': 'Beauty',
      'fitness': 'Fitness', 'entertainment': 'Entertainment', 'tourism': 'Tourism',
      'food & beverage': 'Food & Beverage', 'retail': 'Retail', 'wholesale': 'Wholesale',
      'manufacturing': 'Manufacturing', 'construction': 'Construction', 'other': 'Other',
      'hospital': 'Clinic', 'lodging': 'Hotel', 'food': 'Restaurant', 'general': 'Services', 'misc': 'Other'
    };

    let categoryValue = category;
    if (typeof category === 'object' && category !== null) {
      categoryValue = category.value || category.name || category.category || 'Services';
    }

    const normalizedCategory = categoryValue ? String(categoryValue).trim() : '';
    const lowerCategory = normalizedCategory.toLowerCase();

    let finalCategory = 'Services';
    if (normalizedCategory && validCategories.includes(normalizedCategory)) {
      finalCategory = normalizedCategory;
    } else if (normalizedCategory && lowerCategory && categoryMap[lowerCategory]) {
      finalCategory = categoryMap[lowerCategory];
    }

    console.log('🧪 TEST - Category mapping:');
    console.log('  Input:', category);
    console.log('  Normalized:', normalizedCategory);
    console.log('  Lower:', lowerCategory);
    console.log('  Final:', finalCategory);
    console.log('  Is valid?', validCategories.includes(finalCategory));

    // Create the test business
    const testBusinessData = {
      businessName,
      ownerName: ownerName || '',
      category: finalCategory,
      mobile: mobileNumber || '0123456789',
      email: email.toLowerCase(),
      address,
      mapLink: '',
      whatsapp: '',
      description,
      logoUrl: null,
      imagesUrl: [],
      youtubeVideo: '',
      navbarTagline: '',
      footerDescription: '',
      services: [],
      specialOffers: [],
      businessHours: {},
      appointmentSettings: {},
      theme: 'modern',
      socialLinks: {
        instagram: '',
        facebook: '',
        website: '',
      },
      slug: `test-college-${Date.now()}`,
      subdomainUrl: `https://test-college-${Date.now()}.varanasihub.com`,
      subdirectoryUrl: null,
      status: 'pending',
      userId: null,
    };

    console.log('🧪 TEST - Creating business with data:', {
      businessName: testBusinessData.businessName,
      category: testBusinessData.category,
      slug: testBusinessData.slug,
    });

    const business = await Business.create(testBusinessData);

    console.log('✅ TEST SUCCESS - Business created:', {
      id: business.id,
      businessName: business.businessName,
      category: business.category,
      slug: business.slug,
    });

    return res.json({
      success: true,
      message: 'Test business created successfully with College category',
      test: {
        inputCategory: category,
        finalCategory: finalCategory,
        isValid: validCategories.includes(finalCategory),
        testPassed: finalCategory === 'College',
        categoryInDatabase: business.category,
      },
      business: {
        id: business.id,
        businessName: business.businessName,
        category: business.category,
        slug: business.slug,
        subdomainUrl: business.subdomainUrl,
        subdirectoryUrl: business.subdirectoryUrl,
      }
    });
  } catch (error) {
    console.error('❌ TEST ERROR:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);

    return res.status(500).json({
      success: false,
      error: error.message,
      errorCode: error.code,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

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
    const slugRegex = /^[a-z0-9-]{3,50}$/;
    if (!slugRegex.test(slug)) {
      return res.status(400).json({
        error: 'Invalid slug format. Use only lowercase letters, numbers, and hyphens (3-50 characters).',
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

    // Validate and normalize category - ALL categories are separate
    const validCategories = ['Shop', 'Restaurant', 'Hotel', 'Clinic', 'Library', 'Services', 'Temple', 'School', 'College', 'Gym', 'Salon', 'Spa', 'Pharmacy', 'Bank', 'Travel Agency', 'Real Estate', 'Law Firm', 'Accounting', 'IT Services', 'Photography', 'Event Management', 'Catering', 'Bakery', 'Jewelry', 'Fashion', 'Electronics', 'Furniture', 'Automobile', 'Repair Services', 'Education', 'Healthcare', 'Beauty', 'Fitness', 'Entertainment', 'Tourism', 'Food & Beverage', 'Retail', 'Wholesale', 'Manufacturing', 'Construction', 'Other'];

    // Extract category from any format (string, object, etc.)
    let categoryValue = category;
    if (typeof category === 'object' && category !== null) {
      categoryValue = category.value || category.name || category.category || 'Services';
    }

    // Normalize: convert to string, trim, handle null/undefined
    const normalizedCategory = categoryValue ? String(categoryValue).trim() : '';
    const lowerCategory = normalizedCategory.toLowerCase();

    // MAPPING - Each category maps to itself (all separate categories)
    const categoryMap = {
      // Direct matches - keep as is
      'shop': 'Shop', 'shops': 'Shop', 'store': 'Shop', 'stores': 'Shop',
      'restaurant': 'Restaurant', 'restaurants': 'Restaurant',
      'hotel': 'Hotel', 'hotels': 'Hotel',
      'clinic': 'Clinic', 'clinics': 'Clinic',
      'library': 'Library', 'libraries': 'Library',
      'services': 'Services', 'service': 'Services',

      // All other categories - SEPARATE (map to themselves)
      'temple': 'Temple', 'temples': 'Temple',
      'school': 'School', 'schools': 'School',
      'college': 'College', 'colleges': 'College',
      'gym': 'Gym', 'gyms': 'Gym',
      'salon': 'Salon', 'salons': 'Salon',
      'spa': 'Spa', 'spas': 'Spa',
      'pharmacy': 'Pharmacy', 'pharmacies': 'Pharmacy',
      'bank': 'Bank', 'banks': 'Bank',
      'travel agency': 'Travel Agency', 'travel': 'Travel Agency',
      'real estate': 'Real Estate',
      'law firm': 'Law Firm', 'law firms': 'Law Firm',
      'accounting': 'Accounting',
      'it services': 'IT Services', 'it service': 'IT Services',
      'photography': 'Photography',
      'event management': 'Event Management',
      'catering': 'Catering',
      'bakery': 'Bakery', 'bakeries': 'Bakery',
      'jewelry': 'Jewelry',
      'fashion': 'Fashion',
      'electronics': 'Electronics',
      'furniture': 'Furniture',
      'automobile': 'Automobile', 'automobiles': 'Automobile',
      'repair services': 'Repair Services',
      'education': 'Education', 'educational': 'Education',
      'healthcare': 'Healthcare',
      'beauty': 'Beauty',
      'fitness': 'Fitness',
      'entertainment': 'Entertainment',
      'tourism': 'Tourism',
      'food & beverage': 'Food & Beverage', 'food and beverage': 'Food & Beverage',
      'retail': 'Retail',
      'wholesale': 'Wholesale',
      'manufacturing': 'Manufacturing',
      'construction': 'Construction',
      'other': 'Other', 'others': 'Other',

      // Fallbacks for variations
      'hospital': 'Clinic', 'medical': 'Clinic',
      'lodging': 'Hotel', 'accommodation': 'Hotel',
      'food': 'Restaurant', 'dining': 'Restaurant',
      'general': 'Services', 'misc': 'Other', 'miscellaneous': 'Other', 'default': 'Services'
    };

    // Force to valid category - default to Services if anything fails
    let finalCategory = 'Services'; // ALWAYS default to Services

    console.log('🔍 STEP 1 - Category input:', category);
    console.log('🔍 STEP 2 - Normalized:', normalizedCategory);
    console.log('🔍 STEP 3 - Lower:', lowerCategory);
    console.log('🔍 STEP 4 - CategoryMap has key?', categoryMap.hasOwnProperty(lowerCategory));
    console.log('🔍 STEP 5 - CategoryMap value:', categoryMap[lowerCategory]);

    // First check if it's already a valid category (exact match)
    if (normalizedCategory && validCategories.includes(normalizedCategory)) {
      finalCategory = normalizedCategory;
      console.log('✅ Direct match with valid category:', finalCategory);
    }
    // Then check the mapping (case-insensitive) - THIS IS WHERE COLLEGE SHOULD MAP TO LIBRARY
    else if (normalizedCategory && lowerCategory) {
      if (categoryMap[lowerCategory]) {
        finalCategory = categoryMap[lowerCategory];
        console.log('✅ Category mapped via categoryMap:', normalizedCategory, '→', finalCategory);
      } else {
        console.log('⚠️ Category NOT in map, using default Services. Key:', lowerCategory, 'Available keys:', Object.keys(categoryMap).slice(0, 10));
      }
    }
    // If still not valid, finalCategory is already 'Services'
    else {
      console.log('⚠️ No normalized category, using default Services');
    }

    console.log('🔍 FINAL RESULT - Category:', category, '→ Final:', finalCategory);

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
      const slugRegex = /^[a-z0-9-]{3,50}$/;
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

    // Generate subdomain URL only
    // Default to production unless explicitly in development mode
    const isDevelopment = process.env.NODE_ENV === 'development';
    const baseDomain = process.env.BASE_DOMAIN || 'varanasihub.com';

    let subdomainUrl;
    let subdirectoryUrl;

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
    // validCategories already defined above at line 256, reuse it
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

    // Check if user owns this business or is main_admin
    const userRole = req.user?.role;
    if (business.userId !== userId && userRole !== 'main_admin') {
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

    // Fetch user from database to get current role (more reliable than JWT)
    const user = await User.findById(req.user?.userId);
    const userRole = user?.role || req.user?.role || 'normal';

    // Check if user owns this business or is main_admin
    if (existingBusiness.userId !== userId && userRole !== 'main_admin') {
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
    // userRole already fetched above
    const needsApproval = userRole === 'content_admin';

    // Normalize category if provided (same logic as create)
    let finalCategory = existingBusiness.category; // Default to existing
    if (category) {
      const validCategories = ['Shop', 'Restaurant', 'Hotel', 'Clinic', 'Library', 'Services', 'Temple', 'School', 'College', 'Gym', 'Salon', 'Spa', 'Pharmacy', 'Bank', 'Travel Agency', 'Real Estate', 'Law Firm', 'Accounting', 'IT Services', 'Photography', 'Event Management', 'Catering', 'Bakery', 'Jewelry', 'Fashion', 'Electronics', 'Furniture', 'Automobile', 'Repair Services', 'Education', 'Healthcare', 'Beauty', 'Fitness', 'Entertainment', 'Tourism', 'Food & Beverage', 'Retail', 'Wholesale', 'Manufacturing', 'Construction', 'Other'];
      const categoryMap = {
        'shop': 'Shop', 'shops': 'Shop', 'store': 'Shop', 'stores': 'Shop',
        'restaurant': 'Restaurant', 'restaurants': 'Restaurant',
        'hotel': 'Hotel', 'hotels': 'Hotel',
        'clinic': 'Clinic', 'clinics': 'Clinic',
        'library': 'Library', 'libraries': 'Library',
        'services': 'Services', 'service': 'Services',
        'temple': 'Temple', 'school': 'School', 'college': 'College', 'gym': 'Gym',
        'salon': 'Salon', 'spa': 'Spa', 'pharmacy': 'Pharmacy', 'bank': 'Bank',
        'travel agency': 'Travel Agency', 'real estate': 'Real Estate', 'law firm': 'Law Firm',
        'accounting': 'Accounting', 'it services': 'IT Services', 'photography': 'Photography',
        'event management': 'Event Management', 'catering': 'Catering', 'bakery': 'Bakery',
        'jewelry': 'Jewelry', 'fashion': 'Fashion', 'electronics': 'Electronics',
        'furniture': 'Furniture', 'automobile': 'Automobile', 'repair services': 'Repair Services',
        'education': 'Education', 'healthcare': 'Healthcare', 'beauty': 'Beauty',
        'fitness': 'Fitness', 'entertainment': 'Entertainment', 'tourism': 'Tourism',
        'food & beverage': 'Food & Beverage', 'retail': 'Retail', 'wholesale': 'Wholesale',
        'manufacturing': 'Manufacturing', 'construction': 'Construction', 'other': 'Other',
        'hospital': 'Clinic', 'lodging': 'Hotel', 'food': 'Restaurant', 'general': 'Services', 'misc': 'Other'
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

    // Check if JSON format is requested
    if (req.query.format === 'json') {
      return res.json({ business });
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
    const NODE_ENV = process.env.NODE_ENV || 'development';
    const PORT = process.env.PORT || 5000;
    const apiBaseUrl = NODE_ENV === 'production'
      ? `https://${process.env.BASE_DOMAIN || 'varanasihub.com'}/api`
      : `http://localhost:${PORT}/api`;
    const html = generateBusinessHTML(business, apiBaseUrl);
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
/**
 * Submit a callback request for a business
 */
export const submitCallbackRequest = async (req, res) => {
  try {
    const { businessId, phone, businessName } = req.body;

    if (!businessId || !phone) {
      return res.status(400).json({ error: 'Business ID and phone number are required' });
    }

    // Create a contact form submission as a callback request
    await ContactForm.create({
      businessId,
      name: 'Callback Request',
      email: 'no-email@provided.com',
      phone,
      subject: `Call back request for ${businessName || 'Business'}`,
      message: `User requested a call back at: ${phone}. (Submitted via Business Website Footer)`
    });

    res.json({ success: true, message: 'Callback request received successfully' });
  } catch (error) {
    console.error('Error submitting callback request:', error);
    res.status(500).json({ error: 'Failed to submit callback request' });
  }
};
