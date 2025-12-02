/**
 * Review Schema Generator Utility
 * Generates Review and AggregateRating structured data
 */

/**
 * Generate Review schema for a business
 * @param {Object} review - Review object
 * @param {string} review.authorName - Name of reviewer
 * @param {number} review.rating - Rating (1-5)
 * @param {string} review.reviewText - Review text
 * @param {string} review.datePublished - ISO date string
 * @param {string} businessName - Name of the business
 * @param {string} businessUrl - URL of the business
 * @returns {Object} Review schema object
 */
export const generateReviewSchema = (review, businessName, businessUrl) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    author: {
      '@type': 'Person',
      name: review.authorName || 'Customer'
    },
    datePublished: review.datePublished || new Date().toISOString(),
    reviewBody: review.reviewText || '',
    reviewRating: {
      '@type': 'Rating',
      ratingValue: review.rating || 5,
      bestRating: 5,
      worstRating: 1
    },
    itemReviewed: {
      '@type': 'LocalBusiness',
      name: businessName,
      url: businessUrl
    }
  };
};

/**
 * Generate AggregateRating schema
 * @param {number} ratingValue - Average rating (1-5)
 * @param {number} reviewCount - Total number of reviews
 * @returns {Object} AggregateRating schema object
 */
export const generateAggregateRatingSchema = (ratingValue, reviewCount) => {
  return {
    '@type': 'AggregateRating',
    ratingValue: ratingValue || 4.5,
    reviewCount: reviewCount || 0,
    bestRating: 5,
    worstRating: 1
  };
};

/**
 * Generate complete Review schema with multiple reviews
 * @param {Array} reviews - Array of review objects
 * @param {string} businessName - Name of the business
 * @param {string} businessUrl - URL of the business
 * @returns {Object} Complete review schema with aggregate rating
 */
export const generateCompleteReviewSchema = (reviews, businessName, businessUrl) => {
  if (!reviews || reviews.length === 0) {
    return null;
  }

  // Calculate aggregate rating
  const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 5), 0);
  const averageRating = totalRating / reviews.length;

  const reviewSchemas = reviews.map(review => generateReviewSchema(review, businessName, businessUrl));

  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: businessName,
    url: businessUrl,
    aggregateRating: generateAggregateRatingSchema(averageRating, reviews.length),
    review: reviewSchemas
  };
};

