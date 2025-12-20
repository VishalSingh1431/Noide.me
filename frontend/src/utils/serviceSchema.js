/**
 * Service Schema Generator Utility
 * Generates Service structured data for businesses
 */

/**
 * Generate Service schema for a business service
 * @param {Object} service - Service object
 * @param {string} service.name - Service name
 * @param {string} service.description - Service description
 * @param {number} service.price - Service price (optional)
 * @param {string} service.currency - Currency code (default: INR)
 * @param {string} businessName - Name of the business offering the service
 * @param {string} businessUrl - URL of the business
 * @returns {Object} Service schema object
 */
export const generateServiceSchema = (service, businessName, businessUrl) => {
  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: service.name || 'Business Service',
    description: service.description || '',
    provider: {
      '@type': 'LocalBusiness',
      name: businessName,
      url: businessUrl
    },
    areaServed: {
      '@type': 'City',
      name: 'Varanasi',
      '@id': 'https://www.wikidata.org/wiki/Q79980'
    }
  };

  // Add offer if price is provided
  if (service.price) {
    serviceSchema.offers = {
      '@type': 'Offer',
      price: service.price,
      priceCurrency: service.currency || 'INR',
      availability: 'https://schema.org/InStock',
      url: businessUrl
    };
  }

  return serviceSchema;
};

/**
 * Generate multiple Service schemas for a business
 * @param {Array} services - Array of service objects
 * @param {string} businessName - Name of the business
 * @param {string} businessUrl - URL of the business
 * @returns {Array} Array of Service schema objects
 */
export const generateServiceSchemas = (services, businessName, businessUrl) => {
  if (!services || services.length === 0) {
    return [];
  }

  return services.map(service => 
    generateServiceSchema(service, businessName, businessUrl)
  );
};

/**
 * Generate Service schema with aggregate data
 * @param {Array} services - Array of service objects
 * @param {string} businessName - Name of the business
 * @param {string} businessUrl - URL of the business
 * @returns {Object} Service schema with hasOfferCatalog
 */
export const generateServiceCatalogSchema = (services, businessName, businessUrl) => {
  if (!services || services.length === 0) {
    return null;
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: businessName,
    url: businessUrl,
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: `${businessName} Services`,
      itemListElement: services.map((service, index) => ({
        '@type': 'Offer',
        position: index + 1,
        itemOffered: {
          '@type': 'Service',
          name: service.name,
          description: service.description
        },
        ...(service.price && {
          price: service.price,
          priceCurrency: service.currency || 'INR'
        })
      }))
    }
  };
};

