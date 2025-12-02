/**
 * Analytics tracking utility for frontend
 * Tracks user interactions and page views
 */

import { API_BASE_URL } from '../config/constants';

/**
 * Track an analytics event
 * @param {string} eventType - Type of event (e.g., 'button_click', 'form_submit')
 * @param {object} data - Additional event data
 */
export const trackEvent = async (eventType, data = {}) => {
  try {
    // Only track in production or if explicitly enabled
    if (import.meta.env.PROD || import.meta.env.VITE_ENABLE_ANALYTICS === 'true') {
      await fetch(`${API_BASE_URL}/analytics/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventType,
          ...data,
          timestamp: new Date().toISOString(),
          url: window.location.href,
          userAgent: navigator.userAgent,
        }),
      });
    }
  } catch (error) {
    // Silently fail - analytics should never break the app
    if (import.meta.env.DEV) {
      console.log('Analytics tracking error:', error);
    }
  }
};

/**
 * Track page view
 */
export const trackPageView = (pageName) => {
  trackEvent('page_view', { pageName });
};

/**
 * Track button click
 */
export const trackButtonClick = (buttonName, location = '') => {
  trackEvent('button_click', { buttonName, location });
};

/**
 * Track form submission
 */
export const trackFormSubmit = (formName, success = true) => {
  trackEvent('form_submit', { formName, success });
};

/**
 * Track search query
 */
export const trackSearch = (query, resultsCount = 0) => {
  trackEvent('search', { query, resultsCount });
};

/**
 * Track share action
 */
export const trackShare = (platform, contentType = '') => {
  trackEvent('share', { platform, contentType });
};

/**
 * Track business view
 */
export const trackBusinessView = (businessId, businessName) => {
  trackEvent('business_view', { businessId, businessName });
};

/**
 * Initialize Google Analytics if configured
 */
export const initGoogleAnalytics = () => {
  const gaId = import.meta.env.VITE_GA_ID;
  if (gaId && typeof window !== 'undefined' && !window.gtag) {
    // Load Google Analytics script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', gaId);
  }
};

