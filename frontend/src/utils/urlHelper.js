/**
 * Safe URL helper functions that work in both SSR and client-side
 */

/**
 * Get the current origin URL safely
 * @returns {string} The origin URL
 */
export const getOrigin = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  // Fallback for SSR - use environment variable or default
  return import.meta.env.VITE_SITE_URL || 'https://www.noida.me';
};

/**
 * Get the full URL for a path
 * @param {string} path - The path to append
 * @returns {string} The full URL
 */
export const getFullUrl = (path = '') => {
  const origin = getOrigin();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${origin}${cleanPath}`;
};

/**
 * Get business subdomain URL (production style)
 * @param {string} slug - Business slug
 * @returns {string} The business URL
 */
export const getBusinessUrl = (slug) => {
  if (!slug) return '';
  if (import.meta.env.PROD) {
    return `https://${slug}.noida.me`;
  }
  return `http://${slug}.localhost:50002`;
};

/**
 * Get the URL to open a business page (works on localhost and production).
 * On localhost uses subdirectory /b/:slug so it works without subdomain setup.
 * @param {object} business - { slug, subdomainUrl }
 * @returns {string} URL to the business page
 */
export const getBusinessPageUrl = (business) => {
  if (!business?.slug) return '';
  const origin = getOrigin();
  const isLocalhost = typeof window !== 'undefined' && origin.includes('localhost');
  if (isLocalhost) {
    return `${origin}/b/${business.slug}`;
  }
  return business.subdomainUrl || getBusinessUrl(business.slug);
};

