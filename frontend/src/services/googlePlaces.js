/**
 * Google Places API Service
 * Handles all Google Places API interactions via backend proxy
 */

import { API_BASE_URL } from '../config/constants';

/**
 * Get autocomplete suggestions from backend
 * @param {string} input - User input text
 * @param {Object} location - Optional location bias {lat, lng}
 * @returns {Promise<Array>} Array of predictions
 */
export const getAutocompleteSuggestions = async (input, location = null) => {
  try {
    const response = await fetch(`${API_BASE_URL}/google-places/autocomplete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ input, location }),
    });

    // Check if response is JSON before parsing
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      try {
        data = await response.json();
      } catch (jsonError) {
        const text = await response.text();
        throw new Error(`Invalid JSON response: ${text.substring(0, 100)}`);
      }
    } else {
      const text = await response.text();
      throw new Error(`Server returned non-JSON response (${response.status}): ${text.substring(0, 200)}`);
    }

    if (!response.ok) {
      const errorMsg = data.error || 'Failed to get autocomplete suggestions';
      const helpMsg = data.help ? `\n\n${data.help}` : '';
      throw new Error(`${errorMsg}${helpMsg}`);
    }

    return data.predictions || [];
  } catch (error) {
    console.error('Error fetching autocomplete suggestions:', error);
    throw error;
  }
};

/**
 * Get place details from backend
 * @param {string} placeId - Google Place ID
 * @returns {Promise<Object>} Place details
 */
export const getPlaceDetails = async (placeId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/google-places/details`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ placeId }),
    });

    // Check if response is JSON before parsing
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      try {
        data = await response.json();
      } catch (jsonError) {
        const text = await response.text();
        throw new Error(`Invalid JSON response: ${text.substring(0, 100)}`);
      }
    } else {
      const text = await response.text();
      throw new Error(`Server returned non-JSON response (${response.status}): ${text.substring(0, 200)}`);
    }

    if (!response.ok) {
      throw new Error(data.error || 'Failed to get place details');
    }

    return data.place;
  } catch (error) {
    console.error('Error getting place details:', error);
    throw error;
  }
};

/**
 * Extract business information from place details
 * Backend already formats the data, so we just pass it through
 * @param {Object} place - Place data from backend
 * @returns {Object} Formatted business data
 */
export const extractBusinessData = (place) => {
  // Backend already extracts and formats the data
  // Just ensure we have the right field names
  return {
    businessName: place.businessName || '',
    address: place.address || '',
    phoneNumber: place.phoneNumber || '',
    website: place.website || '',
    googleMapLink: place.googleMapLink || '',
    coordinates: place.coordinates || null,
    rating: place.rating || null,
    totalRatings: place.totalRatings || 0,
    types: place.types || [],
    primaryType: place.primaryType || null,
    primaryTypeDisplayName: place.primaryTypeDisplayName || null,
    openingHours: place.openingHours || null,
    businessHours: place.businessHours || null, // Parsed format for form
    photoUrl: place.photoUrl || null,
    photos: place.photos || [], // Array of photo objects with URLs
    city: place.city || null,
    state: place.state || null,
    country: place.country || null,
    postalCode: place.postalCode || null,
    description: place.description || '',
    businessStatus: place.businessStatus || null,
    priceLevel: place.priceLevel || null,
    // New fields
    reviews: place.reviews || [],
    attributes: place.attributes || {},
    paymentOptions: place.paymentOptions || null,
    parkingOptions: place.parkingOptions || null,
    plusCode: place.plusCode || null,
    utcOffsetMinutes: place.utcOffsetMinutes || null,
    currentOpeningHours: place.currentOpeningHours || null,
  };
};

/**
 * Format phone number to 10 digits (for Indian numbers)
 * @param {string} phoneNumber - Phone number in any format
 * @returns {string} 10-digit phone number
 */
export const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return '';
  
  // Remove all non-digit characters
  const digits = phoneNumber.replace(/\D/g, '');
  
  // If it's an Indian number starting with +91 or 91, remove country code
  if (digits.startsWith('91') && digits.length === 12) {
    return digits.substring(2);
  }
  
  // If it starts with 0, remove it
  if (digits.startsWith('0') && digits.length === 11) {
    return digits.substring(1);
  }
  
  // Return last 10 digits if longer
  if (digits.length > 10) {
    return digits.substring(digits.length - 10);
  }
  
  return digits;
};

