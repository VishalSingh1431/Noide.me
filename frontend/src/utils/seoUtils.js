/**
 * seoUtils.js - Comprehensive SEO Utility for NoidaHub Business Websites
 * Handles: Local Business Schema, Breadcrumb Schema, Meta Tags, Open Graph, Canonical URLs
 */

// Maps NoidaHub categories to official Schema.org types
const CATEGORY_TO_SCHEMA_TYPE = {
    'Restaurant': 'Restaurant',
    'Cafe': 'CafeOrCoffeeShop',
    'Hotel': 'Hotel',
    'Bakery': 'Bakery',
    'Bar': 'BarOrPub',
    'Sweet Shop': 'Bakery',
    'Food & Beverage': 'FoodEstablishment',
    'Catering': 'FoodEstablishment',

    'Clinic': 'MedicalClinic',
    'Hospital': 'Hospital',
    'Dentist': 'Dentist',
    'Pharmacy': 'Pharmacy',
    'Physiotherapist': 'Physiotherapy',
    'Healthcare': 'MedicalOrganization',

    'Gym': 'ExerciseGym',
    'Spa': 'DaySpa',
    'Salon': 'HairSalon',
    'Yoga Center': 'SportsActivityLocation',
    'Dance Academy': 'DanceSchool',
    'Sports Complex': 'SportsActivityLocation',
    'Swimming Pool': 'SportsActivityLocation',
    'Fitness': 'ExerciseGym',

    'School': 'School',
    'College': 'CollegeOrUniversity',
    'Coaching Center': 'EducationalOrganization',
    'Education': 'EducationalOrganization',
    'Library': 'Library',
    'Dance School': 'DanceSchool',

    'Bank': 'BankOrCreditUnion',
    'ATM': 'AutomatedTeller',
    'Insurance Agent': 'InsuranceAgency',
    'Real Estate': 'RealEstateAgent',
    'Real Estate Agent': 'RealEstateAgent',
    'Law Firm': 'LegalService',
    'Lawyer': 'Attorney',
    'Accounting': 'AccountingService',
    'CA': 'AccountingService',
    'IT Services': 'ProfessionalService',

    'Shop': 'Store',
    'Grocery Store': 'GroceryStore',
    'Supermarket': 'GroceryStore',
    'Clothing Store': 'ClothingStore',
    'Jewellery Store': 'JewelryStore',
    'Jewelry': 'JewelryStore',
    'Electronics Store': 'ElectronicsStore',
    'Electronics': 'ElectronicsStore',
    'Mobile Shop': 'ElectronicsStore',
    'Furniture Store': 'FurnitureStore',
    'Furniture': 'FurnitureStore',
    'Book Store': 'BookStore',
    'Pet Shop': 'PetStore',
    'Florist': 'Florist',
    'Hardware Store': 'HardwareStore',
    'Optical Store': 'Optician',
    'Stationery Shop': 'Store',
    'Paint Store': 'HomeGoodsStore',
    'Fashion': 'ClothingStore',
    'Retail': 'Store',
    'Wholesale': 'Store',

    'Automobile': 'AutoDealer',
    'Car Repair': 'AutoRepair',
    'Bike Repair': 'AutoRepair',
    'Petrol Pump': 'GasStation',

    'Electrician': 'Electrician',
    'Plumber': 'Plumber',
    'Repair Services': 'HomeAndConstructionBusiness',
    'Construction': 'GeneralContractor',
    'Manufacturing': 'Organization',

    'Photography': 'ProfessionalService',
    'Photographer': 'ProfessionalService',
    'Event Management': 'EventVenue',
    'Event Planner': 'EventVenue',

    'Temple': 'PlaceOfWorship',
    'Mosque': 'PlaceOfWorship',
    'Church': 'PlaceOfWorship',
    'Gurudwara': 'PlaceOfWorship',

    'Travel Agency': 'TravelAgency',
    'Tourism': 'TravelAgency',
    'Park': 'Park',
    'Playground': 'Park',

    'Veterinary': 'VeterinaryCare',
    'Laundry': 'DryCleaningOrLaundry',
    'Dry Cleaner': 'DryCleaningOrLaundry',
    'Tailor': 'ClothingStore',
    'Other': 'LocalBusiness',
    'Services': 'LocalBusiness',
};

/**
 * Formats business hours for Schema.org openingHoursSpecification.
 * Handles common string formats like "Mon-Fri: 9am-6pm"
 */
const formatOpeningHours = (businessHours) => {
    if (!businessHours || typeof businessHours !== 'object') return undefined;

    const dayMap = {
        Monday: 'Mo', Tuesday: 'Tu', Wednesday: 'We', Thursday: 'Th',
        Friday: 'Fr', Saturday: 'Sa', Sunday: 'Su',
    };

    const schemaHours = [];
    Object.entries(businessHours).forEach(([day, hours]) => {
        if (!hours || hours === 'Closed' || hours === 'closed' || !hours.open || !hours.close) return;
        const schemaDay = dayMap[day];
        if (schemaDay) {
            schemaHours.push({
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: `https://schema.org/${day}`,
                opens: hours.open,
                closes: hours.close,
            });
        }
    });
    return schemaHours.length > 0 ? schemaHours : undefined;
};

/**
 * Generates the main LocalBusiness JSON-LD schema object.
 */
export const generateBusinessSchema = (business, canonicalUrl) => {
    if (!business) return null;

    const schemaType = CATEGORY_TO_SCHEMA_TYPE[business.category] || 'LocalBusiness';
    const rating = business.googlePlacesData?.rating;
    const totalRatings = business.googlePlacesData?.totalRatings;
    const openingHours = formatOpeningHours(business.businessHours);

    const schema = {
        '@context': 'https://schema.org',
        '@type': schemaType,
        name: business.businessName,
        description: business.description?.substring(0, 500) || `${business.businessName} - ${business.category} in Noida`,
        url: canonicalUrl || window.location.href,
        telephone: business.mobile || undefined,
        email: business.email || undefined,
    };

    // Address
    if (business.address) {
        schema.address = {
            '@type': 'PostalAddress',
            streetAddress: business.address,
            addressLocality: 'Noida',
            addressRegion: 'Uttar Pradesh',
            addressCountry: 'IN',
        };
    }

    // Logo / Image
    if (business.logoUrl) {
        schema.image = business.logoUrl;
        schema.logo = {
            '@type': 'ImageObject',
            url: business.logoUrl,
        };
    } else if (business.imagesUrl?.length > 0) {
        schema.image = business.imagesUrl[0];
    }

    // Aggregate Rating
    if (rating && totalRatings) {
        schema.aggregateRating = {
            '@type': 'AggregateRating',
            ratingValue: rating,
            reviewCount: totalRatings,
            bestRating: 5,
            worstRating: 1,
        };
    }

    // Opening Hours
    if (openingHours) {
        schema.openingHoursSpecification = openingHours;
    }

    return schema;
};

/**
 * Generates BreadcrumbList JSON-LD schema.
 * e.g., NoidaHub > Salon > Arjun's Salon
 */
export const generateBreadcrumbSchema = (business) => {
    if (!business) return null;

    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'NoidaHub',
                item: 'https://noida.me',
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: business.category || 'Business',
                item: `https://noida.me/category/${(business.category || 'business').toLowerCase().replace(/\s+/g, '-')}`,
            },
            {
                '@type': 'ListItem',
                position: 3,
                name: business.businessName,
                item: window.location.href,
            },
        ],
    };
};

/**
 * Updates all <head> meta tags dynamically.
 * Handles: Title, Description, Canonical, Open Graph, Twitter Cards
 */
export const updateMetaTags = (business, canonicalUrl) => {
    if (!business) return;

    const name = business.businessName;
    const category = business.category || 'Business';
    const desc = business.description?.substring(0, 160) ||
        `${name} - ${category} in Noida. Contact, location, and all details.`;
    const title = `${name} | ${category} in Noida | NoidaHub`;
    const image = business.logoUrl || business.imagesUrl?.[0] || 'https://noida.me/og-default.png';
    const url = canonicalUrl || window.location.href;

    // Page Title
    document.title = title;

    const setMeta = (selector, value) => {
        let el = document.querySelector(selector);
        if (!el) {
            el = document.createElement('meta');
            const match = selector.match(/\[name="(.+?)"\]|\[property="(.+?)"\]/);
            if (match) {
                el.setAttribute(match[1] ? 'name' : 'property', match[1] || match[2]);
            }
            document.head.appendChild(el);
        }
        el.setAttribute('content', value);
    };

    const setLink = (rel, href) => {
        let el = document.querySelector(`link[rel="${rel}"]`);
        if (!el) {
            el = document.createElement('link');
            el.setAttribute('rel', rel);
            document.head.appendChild(el);
        }
        el.setAttribute('href', href);
    };

    // Standard Meta
    setMeta('meta[name="description"]', desc);
    setMeta('meta[name="keywords"]', `${name}, ${category}, Noida, NoidaHub, local business`);
    setMeta('meta[name="robots"]', 'index, follow');

    // Canonical
    setLink('canonical', url);

    // Open Graph (Facebook, WhatsApp)
    setMeta('meta[property="og:type"]', 'business.business');
    setMeta('meta[property="og:title"]', title);
    setMeta('meta[property="og:description"]', desc);
    setMeta('meta[property="og:image"]', image);
    setMeta('meta[property="og:url"]', url);
    setMeta('meta[property="og:site_name"]', 'NoidaHub');
    setMeta('meta[property="og:locale"]', 'en_IN');

    // Twitter Cards
    setMeta('meta[name="twitter:card"]', 'summary_large_image');
    setMeta('meta[name="twitter:title"]', title);
    setMeta('meta[name="twitter:description"]', desc);
    setMeta('meta[name="twitter:image"]', image);
};

/**
 * Injects JSON-LD scripts into the <head> safely (avoids duplicates).
 */
export const injectJsonLd = (schemaObject, id) => {
    // Remove existing tag with same ID to prevent duplicates
    const existing = document.getElementById(id);
    if (existing) existing.remove();

    if (!schemaObject) return;

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = id;
    script.text = JSON.stringify(schemaObject, null, 2);
    document.head.appendChild(script);
};

/**
 * Removes all SEO tags injected by this utility (called on component unmount).
 */
export const cleanupSeoTags = () => {
    // Remove JSON-LD scripts
    ['noidahub-business-schema', 'noidahub-breadcrumb-schema'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.remove();
    });

    // Reset title
    document.title = 'NoidaHub - Noida\'s Business Directory';
};
