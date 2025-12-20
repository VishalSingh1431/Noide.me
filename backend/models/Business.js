import pool from '../config/database.js';

/**
 * Business Model - PostgreSQL operations
 */
class Business {
  /**
   * Create a new business
   */
  static async create(data) {
    // FINAL SAFETY CHECK - ensure category is ALWAYS valid
    const validCategories = ['Shop', 'Restaurant', 'Hotel', 'Clinic', 'Library', 'Services', 'Temple', 'School', 'College', 'Gym', 'Salon', 'Spa', 'Pharmacy', 'Bank', 'Travel Agency', 'Real Estate', 'Law Firm', 'Accounting', 'IT Services', 'Photography', 'Event Management', 'Catering', 'Bakery', 'Jewelry', 'Fashion', 'Electronics', 'Furniture', 'Automobile', 'Repair Services', 'Education', 'Healthcare', 'Beauty', 'Fitness', 'Entertainment', 'Tourism', 'Food & Beverage', 'Retail', 'Wholesale', 'Manufacturing', 'Construction', 'Other'];
    
    // Comprehensive mapping for any category that slips through - matches controller mapping
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
    
    let safeCategory = 'Services'; // Default
    const categoryStr = String(data.category || '').trim();
    const lowerCategory = categoryStr.toLowerCase();
    
    // First check if it's already a valid category (exact match)
    if (data.category && validCategories.includes(categoryStr)) {
      safeCategory = categoryStr;
      console.log('✅ Category is already valid:', safeCategory);
    } 
    // Then check the mapping (case-insensitive)
    else if (data.category && lowerCategory && categoryMap[lowerCategory]) {
      safeCategory = categoryMap[lowerCategory];
      console.log('✅ Category mapped in model:', categoryStr, '→', safeCategory);
    } 
    // If still not valid, force to Services
    else {
      safeCategory = 'Services';
      console.log('⚠️ Category not found in model map, using default Services:', categoryStr);
    }
    
    // Final validation - ensure it's definitely one of the valid categories
    if (!validCategories.includes(safeCategory)) {
      console.error('❌ CRITICAL: safeCategory is still invalid:', safeCategory, 'Forcing to Services');
      safeCategory = 'Services';
    }
    
    if (data.category !== safeCategory) {
      console.log('🛡️ Business.create: Category converted', data.category, '→', safeCategory);
    }
    
    console.log('🛡️ Business.create: Final category being inserted:', safeCategory, 'Type:', typeof safeCategory);
    
    const query = `
      INSERT INTO businesses (
        business_name, owner_name, category, mobile, email, address,
        map_link, whatsapp, description, logo_url, images_url,
        youtube_video, navbar_tagline, footer_description, services, special_offers, business_hours, appointment_settings, theme, social_links, slug, subdomain_url, subdirectory_url, status, user_id, is_premium
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26)
      RETURNING *
    `;

    // ABSOLUTE FINAL CHECK - ensure category is a valid string
    const finalCategoryForDB = (validCategories.includes(String(safeCategory).trim())) 
      ? String(safeCategory).trim() 
      : 'Services';
    
    console.log('🛡️ ABSOLUTE FINAL - Category for DB:', finalCategoryForDB, 'Type:', typeof finalCategoryForDB);
    
    const values = [
      data.businessName,
      data.ownerName || null,
      finalCategoryForDB, // Use absolutely safe category
      data.mobile,
      data.email.toLowerCase(),
      data.address,
      data.mapLink || null,
      data.whatsapp || null,
      data.description,
      data.logoUrl || null,
      JSON.stringify(data.imagesUrl || []),
      data.youtubeVideo || null,
      data.navbarTagline || null,
      data.footerDescription || null,
      JSON.stringify(data.services || []),
      JSON.stringify(data.specialOffers || []),
      JSON.stringify(data.businessHours || {}),
      JSON.stringify(data.appointmentSettings || {}),
      data.theme || 'modern',
      JSON.stringify(data.socialLinks || { instagram: '', facebook: '', website: '' }),
      data.slug,
      data.subdomainUrl,
      data.subdirectoryUrl,
      data.status || 'pending',
      data.userId || null,
      data.isPremium || false,
    ];

    const result = await pool.query(query, values);
    return Business.mapRowToBusiness(result.rows[0]);
  }

  /**
   * Find businesses by user ID
   */
  static async findByUserId(userId) {
    const query = 'SELECT * FROM businesses WHERE user_id = $1 ORDER BY created_at DESC';
    const result = await pool.query(query, [userId]);
    return result.rows.map(row => Business.mapRowToBusiness(row));
  }

  /**
   * Find business by slug
   */
  static async findBySlug(slug, statusFilter = null) {
    let query = 'SELECT * FROM businesses WHERE slug = $1';
    const values = [slug];

    if (statusFilter && Array.isArray(statusFilter) && statusFilter.length > 0) {
      query += ' AND status = ANY($2)';
      values.push(statusFilter);
    }

    const result = await pool.query(query, values);
    return result.rows.length > 0 ? Business.mapRowToBusiness(result.rows[0]) : null;
  }

  /**
   * Find business by ID
   */
  static async findById(id) {
    const query = 'SELECT * FROM businesses WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows.length > 0 ? Business.mapRowToBusiness(result.rows[0]) : null;
  }

  /**
   * Find business by email
   */
  static async findByEmail(email) {
    const query = 'SELECT * FROM businesses WHERE email = $1';
    const result = await pool.query(query, [email.toLowerCase()]);
    return result.rows.length > 0 ? Business.mapRowToBusiness(result.rows[0]) : null;
  }

  /**
   * Update business
   */
  static async update(id, data) {
    // FINAL SAFETY CHECK for category in update too
    let safeCategory = data.category;
    if (data.category) {
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
        'hospital': 'Clinic', 'lodging': 'Hotel', 'food': 'Restaurant', 'general': 'Services', 'misc': 'Other',
      };
      
      const lowerCategory = String(data.category).toLowerCase();
      if (validCategories.includes(data.category)) {
        safeCategory = data.category;
      } else if (categoryMap[lowerCategory]) {
        safeCategory = categoryMap[lowerCategory];
      } else {
        safeCategory = 'Services';
      }
      
      if (data.category !== safeCategory) {
        console.log('🛡️ Business.update: Category converted', data.category, '→', safeCategory);
      }
    }
    
    const query = `
      UPDATE businesses SET
        business_name = COALESCE($1, business_name),
        owner_name = COALESCE($2, owner_name),
        category = COALESCE($3, category),
        mobile = COALESCE($4, mobile),
        email = COALESCE($5, email),
        address = COALESCE($6, address),
        map_link = COALESCE($7, map_link),
        whatsapp = COALESCE($8, whatsapp),
        description = COALESCE($9, description),
        logo_url = COALESCE($10, logo_url),
        images_url = COALESCE($11, images_url),
        youtube_video = COALESCE($12, youtube_video),
        navbar_tagline = COALESCE($13, navbar_tagline),
        footer_description = COALESCE($14, footer_description),
        services = COALESCE($15, services),
        special_offers = COALESCE($16, special_offers),
        business_hours = COALESCE($17, business_hours),
        appointment_settings = COALESCE($18, appointment_settings),
        theme = COALESCE($19, theme),
        social_links = COALESCE($20, social_links),
        is_premium = COALESCE($21, is_premium),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $22
      RETURNING *
    `;

    const values = [
      data.businessName || null,
      data.ownerName || null,
      safeCategory || null,
      data.mobile || null,
      data.email ? data.email.toLowerCase() : null,
      data.address || null,
      data.mapLink || null,
      data.whatsapp || null,
      data.description || null,
      data.logoUrl || null,
      data.imagesUrl ? JSON.stringify(data.imagesUrl) : null,
      data.youtubeVideo || null,
      data.navbarTagline || null,
      data.footerDescription || null,
      data.services ? JSON.stringify(data.services) : null,
      data.specialOffers ? JSON.stringify(data.specialOffers) : null,
      data.businessHours ? JSON.stringify(data.businessHours) : null,
      data.appointmentSettings ? JSON.stringify(data.appointmentSettings) : null,
      data.theme || null,
      data.socialLinks ? JSON.stringify(data.socialLinks) : null,
      data.isPremium !== undefined ? data.isPremium : null,
      id,
    ];

    const result = await pool.query(query, values);
    return result.rows.length > 0 ? Business.mapRowToBusiness(result.rows[0]) : null;
  }

  /**
   * Find all businesses
   */
  static async findAll(statusFilter = null) {
    let query = 'SELECT * FROM businesses';
    const values = [];
    
    if (statusFilter) {
      query += ' WHERE status = $1';
      values.push(statusFilter);
    }
    
    // Premium businesses first, then by creation date
    query += ' ORDER BY is_premium DESC, created_at DESC';
    
    const result = await pool.query(query, values);
    return result.rows.map(row => Business.mapRowToBusiness(row));
  }

  /**
   * Check if slug exists
   */
  static async slugExists(slug) {
    const query = 'SELECT COUNT(*) FROM businesses WHERE slug = $1';
    const result = await pool.query(query, [slug]);
    return parseInt(result.rows[0].count) > 0;
  }

  /**
   * Map database row to business object
   */
  static mapRowToBusiness(row) {
    if (!row) return null;

    return {
      _id: row.id,
      id: row.id,
      businessName: row.business_name,
      ownerName: row.owner_name,
      category: row.category,
      mobile: row.mobile,
      email: row.email,
      address: row.address,
      mapLink: row.map_link,
      whatsapp: row.whatsapp,
      description: row.description,
      logoUrl: row.logo_url,
      imagesUrl: Array.isArray(row.images_url) ? row.images_url : JSON.parse(row.images_url || '[]'),
      youtubeVideo: row.youtube_video,
      navbarTagline: row.navbar_tagline || '',
      footerDescription: row.footer_description || '',
      services: typeof row.services === 'object' && row.services !== null ? row.services : JSON.parse(row.services || '[]'),
      specialOffers: typeof row.special_offers === 'object' && row.special_offers !== null ? row.special_offers : JSON.parse(row.special_offers || '[]'),
      businessHours: typeof row.business_hours === 'object' && row.business_hours !== null ? row.business_hours : JSON.parse(row.business_hours || '{}'),
      appointmentSettings: typeof row.appointment_settings === 'object' && row.appointment_settings !== null ? row.appointment_settings : JSON.parse(row.appointment_settings || '{}'),
      theme: row.theme || 'modern',
      socialLinks: typeof row.social_links === 'object' ? row.social_links : JSON.parse(row.social_links || '{}'),
      slug: row.slug,
      subdomainUrl: row.subdomain_url,
      subdirectoryUrl: row.subdirectory_url,
      status: row.status,
      editApprovalStatus: row.edit_approval_status || 'none',
      isPremium: row.is_premium || false,
      userId: row.user_id,
      ecommerceEnabled: row.ecommerce_enabled || false,
      abTestEnabled: row.ab_test_enabled || false,
      currentVariant: row.current_variant || 'default',
      products: typeof row.products === 'object' && row.products !== null ? row.products : JSON.parse(row.products || '[]'),
      verified: row.verified || false,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

export default Business;
