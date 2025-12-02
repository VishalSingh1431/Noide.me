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
  return import.meta.env.VITE_SITE_URL || 'https://www.varanasihub.com';
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
 * Get business subdomain URL
 * @param {string} slug - Business slug
 * @returns {string} The business URL
 */
export const getBusinessUrl = (slug) => {
  if (!slug) return '';
  
  // In production, use actual subdomain
  if (import.meta.env.PROD) {
    return `https://${slug}.varanasihub.com`;
  }
  
  // In development, use localhost with port
  return `http://${slug}.localhost:5000`;
};

