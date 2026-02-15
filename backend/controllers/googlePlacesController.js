import fetch from 'node-fetch';

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

/**
 * Parse Google's weekdayDescriptions format to form's businessHours format
 * Input: ["Monday: 9:00 AM – 6:00 PM", "Tuesday: Closed", ...]
 * Output: {monday: {open: true, start: '09:00', end: '18:00'}, ...}
 */
const parseOpeningHours = (weekdayDescriptions) => {
  if (!weekdayDescriptions || !Array.isArray(weekdayDescriptions)) {
    return null;
  }

  const dayMap = {
    'monday': 'monday',
    'tuesday': 'tuesday',
    'wednesday': 'wednesday',
    'thursday': 'thursday',
    'friday': 'friday',
    'saturday': 'saturday',
    'sunday': 'sunday',
  };

  const businessHours = {
    monday: { open: false, start: '09:00', end: '18:00' },
    tuesday: { open: false, start: '09:00', end: '18:00' },
    wednesday: { open: false, start: '09:00', end: '18:00' },
    thursday: { open: false, start: '09:00', end: '18:00' },
    friday: { open: false, start: '09:00', end: '18:00' },
    saturday: { open: false, start: '09:00', end: '18:00' },
    sunday: { open: false, start: '09:00', end: '18:00' },
  };

  weekdayDescriptions.forEach((description) => {
    if (!description) return;

    const lowerDesc = description.toLowerCase();

    // Find the day
    let matchedDay = null;
    for (const [dayName, dayKey] of Object.entries(dayMap)) {
      if (lowerDesc.includes(dayName)) {
        matchedDay = dayKey;
        break;
      }
    }

    if (!matchedDay) return;

    // Check if closed
    if (lowerDesc.includes('closed')) {
      businessHours[matchedDay].open = false;
      return;
    }

    // Parse time range (e.g., "9:00 AM – 6:00 PM" or "9:00 AM - 6:00 PM")
    const timeMatch = description.match(/(\d{1,2}):(\d{2})\s*(AM|PM)\s*[–-]\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i);

    if (timeMatch) {
      const [, startHour, startMin, startPeriod, endHour, endMin, endPeriod] = timeMatch;

      // Convert to 24-hour format
      const convertTo24Hour = (hour, min, period) => {
        let h = parseInt(hour);
        const m = parseInt(min);

        if (period.toUpperCase() === 'PM' && h !== 12) {
          h += 12;
        } else if (period.toUpperCase() === 'AM' && h === 12) {
          h = 0;
        }

        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      };

      businessHours[matchedDay] = {
        open: true,
        start: convertTo24Hour(startHour, startMin, startPeriod),
        end: convertTo24Hour(endHour, endMin, endPeriod),
      };
    }
  });

  return businessHours;
};

/**
 * Get place autocomplete suggestions
 * POST /api/google-places/autocomplete
 */
export const getAutocompleteSuggestions = async (req, res) => {
  try {
    const { input, location } = req.body;

    if (!input || input.trim().length < 2) {
      return res.status(400).json({
        error: 'Input must be at least 2 characters long'
      });
    }

    if (!GOOGLE_PLACES_API_KEY) {
      console.error('GOOGLE_PLACES_API_KEY is not set in environment variables');
      return res.status(500).json({
        error: 'Google Places API key is not configured. Please add GOOGLE_PLACES_API_KEY to your backend .env file.',
        help: 'Add GOOGLE_PLACES_API_KEY=your_api_key_here to backend/.env and restart the server'
      });
    }

    // Use NEW Places API (not legacy)
    const requestBody = {
      input: input,
      languageCode: 'en',
      includedRegionCodes: ['IN'], // Restrict to India
    };

    // Add location bias if provided
    if (location && location.lat && location.lng) {
      requestBody.locationBias = {
        circle: {
          center: {
            latitude: location.lat,
            longitude: location.lng,
          },
          radius: 50000.0, // 50km in meters
        },
      };
    }

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(
      'https://places.googleapis.com/v1/places:autocomplete',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
          'X-Goog-FieldMask': 'suggestions.placePrediction.placeId,suggestions.placePrediction.text,suggestions.placePrediction.structuredFormat',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      }
    ).finally(() => clearTimeout(timeoutId));

    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      console.error('Failed to parse response:', parseError);
      const text = await response.text();
      console.error('Response text:', text);
      return res.status(500).json({
        error: 'Invalid response from Google Places API',
        message: 'Could not parse response',
      });
    }

    // Log response for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('Google Places API Response Status:', response.status);
      if (!response.ok) {
        console.log('Error Response:', JSON.stringify(data, null, 2));
      }
    }

    // Handle new Places API response format
    if (response.ok && data.suggestions) {
      // Convert new API format to old format for compatibility
      const predictions = data.suggestions.map(suggestion => {
        const placePrediction = suggestion.placePrediction;
        return {
          place_id: placePrediction.placeId,
          description: typeof placePrediction.text === 'string'
            ? placePrediction.text
            : placePrediction.text?.text || '',
          structured_formatting: {
            main_text: typeof placePrediction.structuredFormat?.mainText === 'string'
              ? placePrediction.structuredFormat.mainText
              : placePrediction.structuredFormat?.mainText?.text || '',
            secondary_text: typeof placePrediction.structuredFormat?.secondaryText === 'string'
              ? placePrediction.structuredFormat.secondaryText
              : placePrediction.structuredFormat?.secondaryText?.text || '',
          },
        };
      });

      return res.json({
        success: true,
        predictions: predictions,
        status: 'OK',
      });
    } else if (!response.ok) {
      // Handle HTTP errors
      const errorData = data.error || data;
      let errorMessage = `Google Places API error: ${response.status}`;
      let helpMessage = '';

      // Extract detailed error message from Google
      const googleErrorMsg = errorData?.message || errorData?.error_message || JSON.stringify(errorData);

      if (response.status === 403) {
        errorMessage = 'Google Places API request denied (403 Forbidden)';
        helpMessage = `Google says: ${googleErrorMsg}\n\nPossible fixes:\n1. Enable "Places API (New)" in Google Cloud Console (NOT the old "Places API")\n2. Check API key restrictions - make sure "Places API (New)" is allowed\n3. Verify billing is enabled (even for free tier)\n4. Check if API key has correct permissions`;
      } else if (response.status === 400) {
        errorMessage = 'Invalid request to Google Places API';
        helpMessage = `Google says: ${googleErrorMsg}`;
      } else if (response.status === 401) {
        errorMessage = 'Google Places API authentication failed';
        helpMessage = 'API key is invalid or missing. Check your GOOGLE_PLACES_API_KEY in backend/.env';
      } else if (response.status === 429) {
        errorMessage = 'Google Places API quota exceeded';
        helpMessage = 'You have exceeded your API quota. Check your Google Cloud Console billing.';
      }

      // Log full error details for debugging
      console.error('❌ Google Places API error details:');
      console.error('  HTTP Status:', response.status);
      console.error('  Full Error Response:', JSON.stringify(data, null, 2));
      console.error('  Error Message:', googleErrorMsg);
      console.error('  API Key present:', !!GOOGLE_PLACES_API_KEY);
      console.error('  API Key starts with:', GOOGLE_PLACES_API_KEY?.substring(0, 10) || 'N/A');
      console.error('  Request URL:', 'https://places.googleapis.com/v1/places:autocomplete');
      console.error('  Request Body:', JSON.stringify(requestBody, null, 2));

      return res.status(response.status).json({
        error: errorMessage,
        status: response.status,
        help: helpMessage,
        errorMessage: googleErrorMsg,
        googleError: data,
        debug: process.env.NODE_ENV === 'development' ? {
          apiKeyPresent: !!GOOGLE_PLACES_API_KEY,
          apiKeyLength: GOOGLE_PLACES_API_KEY?.length || 0,
          apiKeyPrefix: GOOGLE_PLACES_API_KEY?.substring(0, 10) || 'N/A',
        } : undefined,
      });
    } else {
      // No suggestions returned
      return res.json({
        success: true,
        predictions: [],
        status: 'ZERO_RESULTS',
      });
    }
  } catch (error) {
    console.error('Error fetching autocomplete suggestions:', error);
    return res.status(500).json({
      error: 'Failed to fetch autocomplete suggestions',
      message: error.message,
    });
  }
};

/**
 * Get place details by place ID
 * POST /api/google-places/details
 */
export const getPlaceDetails = async (req, res) => {
  try {
    const { placeId } = req.body;

    if (!placeId) {
      return res.status(400).json({
        error: 'Place ID is required'
      });
    }

    if (!GOOGLE_PLACES_API_KEY) {
      console.error('GOOGLE_PLACES_API_KEY is not set in environment variables');
      return res.status(500).json({
        error: 'Google Places API key is not configured. Please add GOOGLE_PLACES_API_KEY to your backend .env file.',
        help: 'Add GOOGLE_PLACES_API_KEY=your_api_key_here to backend/.env and restart the server'
      });
    }

    // Use NEW Places API (not legacy)
    // The placeId from autocomplete is already in format "places/ChIJ..." or just "ChIJ..."
    // New API requires format "places/ChIJ..."
    const placeName = placeId.startsWith('places/') ? placeId : `places/${placeId}`;

    // Request available fields from Google Places API
    // Using only core fields that are definitely valid
    const fieldMask = [
      'id',
      'displayName',
      'formattedAddress',
      'nationalPhoneNumber',
      'internationalPhoneNumber',
      'websiteUri',
      'location',
      'googleMapsUri',
      'regularOpeningHours',
      'photos',
      'types',
      'rating',
      'userRatingCount',
      'reviews',
      'addressComponents',
      'editorialSummary', // Business description from Google
      'paymentOptions',
      'parkingOptions',
      'accessibilityOptions',
      'servesBreakfast',
      'servesLunch',
      'servesDinner',
      'servesBrunch',
      'servesBeer',
      'servesWine',
      'servesVegetarianFood',
      'servesCocktails',
      'servesDessert',
      'servesCoffee',
      'liveMusic',
      'menuForChildren',
      'takeout',
      'delivery',
      'dineIn',
      'outdoorSeating',
      'reservable',
      'priceLevel',
      'utcOffsetMinutes',
      'currentOpeningHours',
    ].join(',');

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    // Log request details for debugging
    console.log('🔍 Requesting place details:');
    console.log('  Place Name:', placeName);
    console.log('  Field Mask:', fieldMask);

    const response = await fetch(
      `https://places.googleapis.com/v1/${placeName}`,
      {
        method: 'GET',
        headers: {
          'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
          'X-Goog-FieldMask': fieldMask,
        },
        signal: controller.signal,
      }
    ).finally(() => clearTimeout(timeoutId));

    console.log('📥 Response Status:', response.status);

    let place;
    try {
      place = await response.json();
    } catch (parseError) {
      console.error('Failed to parse place details response:', parseError);
      const text = await response.text();
      console.error('Response text:', text);
      return res.status(500).json({
        error: 'Invalid response from Google Places API',
        message: 'Could not parse response',
      });
    }

    // Log response for debugging
    console.log('Google Places Details Response Status:', response.status);
    if (!response.ok) {
      console.error('❌ Google Places API Error Response:');
      console.error(JSON.stringify(place, null, 2));
      if (place?.error?.details) {
        console.error('Error Details:', JSON.stringify(place.error.details, null, 2));
      }
    }

    if (response.ok && place) {

      // Extract business data from NEW Places API format
      // Handle displayName which can be string or object with text property
      const businessName = typeof place.displayName === 'string'
        ? place.displayName
        : place.displayName?.text || '';

      // Handle editorialSummary which can be string or object
      const description = typeof place.editorialSummary === 'string'
        ? place.editorialSummary
        : place.editorialSummary?.text || '';

      // Parse opening hours to form format
      const parsedBusinessHours = place.regularOpeningHours?.weekdayDescriptions
        ? parseOpeningHours(place.regularOpeningHours.weekdayDescriptions)
        : null;

      // Extract reviews
      const reviews = place.reviews && Array.isArray(place.reviews)
        ? place.reviews.map((review) => ({
          authorName: review.authorAttribution?.displayName || 'Anonymous',
          authorPhoto: review.authorAttribution?.photoUri || null,
          rating: review.rating || 0,
          text: typeof review.text === 'string'
            ? review.text
            : review.text?.text || '',
          time: review.publishTime || review.relativePublishTimeDescription || null,
          originalText: review.originalText || null,
        }))
        : [];

      // Extract business attributes (only fields we requested)
      const attributes = {
        // Food & Dining (common attributes)
        takeout: place.takeout || false,
        delivery: place.delivery || false,
        dineIn: place.dineIn || false,
        outdoorSeating: place.outdoorSeating || false,
        reservable: place.reservable || false,

        // Accessibility
        wheelchairAccessibleEntrance: place.accessibilityOptions?.wheelchairAccessibleEntrance || false,
        wheelchairAccessibleParking: place.accessibilityOptions?.wheelchairAccessibleParking || false,
        wheelchairAccessibleRestroom: place.accessibilityOptions?.wheelchairAccessibleRestroom || false,
        wheelchairAccessibleSeating: place.accessibilityOptions?.wheelchairAccessibleSeating || false,

        // Additional attributes if available (not in field mask but might be in response)
        servesBreakfast: place.servesBreakfast || false,
        servesLunch: place.servesLunch || false,
        servesDinner: place.servesDinner || false,
        servesBrunch: place.servesBrunch || false,
        servesBeer: place.servesBeer || false,
        servesWine: place.servesWine || false,
        servesVegetarianFood: place.servesVegetarianFood || false,
        servesCocktails: place.servesCocktails || false,
        servesDessert: place.servesDessert || false,
        servesCoffee: place.servesCoffee || false,
        liveMusic: place.liveMusic || false,
        menuForChildren: place.menuForChildren || false,
      };

      // Extract payment options
      const paymentOptions = place.paymentOptions
        ? {
          acceptsCreditCards: place.paymentOptions.acceptsCreditCards || false,
          acceptsDebitCards: place.paymentOptions.acceptsDebitCards || false,
          acceptsCashOnly: place.paymentOptions.acceptsCashOnly || false,
          acceptsNfc: place.paymentOptions.acceptsNfc || false,
        }
        : null;

      // Extract parking options
      const parkingOptions = place.parkingOptions
        ? {
          parkingLot: place.parkingOptions.parkingLot || false,
          streetParking: place.parkingOptions.streetParking || false,
          valetParking: place.parkingOptions.valetParking || false,
          garageParking: place.parkingOptions.garageParking || false,
          freeGarageParking: place.parkingOptions.freeGarageParking || false,
          freeParkingLot: place.parkingOptions.freeParkingLot || false,
          paidParkingLot: place.parkingOptions.paidParkingLot || false,
          paidStreetParking: place.parkingOptions.paidStreetParking || false,
          valetFreeParking: place.parkingOptions.valetFreeParking || false,
          valetPaidParking: place.parkingOptions.valetPaidParking || false,
        }
        : null;

      const businessData = {
        businessName: businessName,
        address: place.formattedAddress || place.shortFormattedAddress || '',
        phoneNumber: place.nationalPhoneNumber || place.internationalPhoneNumber || '',
        website: place.websiteUri || '',
        googleMapLink: place.googleMapsUri || '',
        coordinates: place.location ? {
          lat: place.location.latitude,
          lng: place.location.longitude,
        } : null,
        rating: place.rating || null,
        totalRatings: place.userRatingCount || 0,
        types: place.types || [],
        primaryType: place.primaryType || null,
        // Opening hours in both formats
        openingHours: place.regularOpeningHours ? {
          weekdayText: place.regularOpeningHours.weekdayDescriptions || [],
          isOpen: place.regularOpeningHours.openNow || false,
        } : null,
        businessHours: parsedBusinessHours, // Parsed format for form
        // Get multiple photos (up to 5) for better coverage
        photos: place.photos && place.photos.length > 0
          ? place.photos.slice(0, 5).map((photo, index) => {
            if (photo.name) {
              return {
                url: `https://places.googleapis.com/v1/${photo.name}/media?maxHeightPx=800&maxWidthPx=1200&key=${GOOGLE_PLACES_API_KEY}`,
                name: photo.name,
                widthPx: photo.widthPx || 1200,
                heightPx: photo.heightPx || 800,
              };
            }
            return null;
          }).filter(Boolean)
          : [],
        // Keep photoUrl for backward compatibility (first photo)
        photoUrl: place.photos && place.photos.length > 0 && place.photos[0].name
          ? `https://places.googleapis.com/v1/${place.photos[0].name}/media?maxHeightPx=800&maxWidthPx=1200&key=${GOOGLE_PLACES_API_KEY}`
          : null,
        city: null,
        state: null,
        country: null,
        postalCode: null,
        description: description,
        businessStatus: place.businessStatus || null,
        priceLevel: place.priceLevel || null,
        // New fields
        reviews: reviews,
        attributes: attributes,
        paymentOptions: paymentOptions,
        parkingOptions: parkingOptions,
        plusCode: place.plusCode?.globalCode || place.plusCode?.compoundCode || null,
        utcOffsetMinutes: place.utcOffsetMinutes || null,
        currentOpeningHours: place.currentOpeningHours ? {
          weekdayDescriptions: place.currentOpeningHours.weekdayDescriptions || [],
          openNow: place.currentOpeningHours.openNow || false,
        } : null,
      };

      // Extract address components
      if (place.addressComponents && Array.isArray(place.addressComponents)) {
        place.addressComponents.forEach((component) => {
          if (!component || !component.types || !Array.isArray(component.types)) return;

          // Handle longText which can be string or object
          const longText = typeof component.longText === 'string'
            ? component.longText
            : component.longText?.text || component.longText || '';

          if (component.types.includes('postal_code')) {
            businessData.postalCode = longText;
          }
          if (component.types.includes('locality')) {
            businessData.city = longText;
          }
          if (component.types.includes('administrative_area_level_1')) {
            businessData.state = longText;
          }
          if (component.types.includes('country')) {
            businessData.country = longText;
          }
        });
      }

      // Log extracted data for debugging
      if (process.env.NODE_ENV === 'development') {
        console.log('📦 Extracted business data:', {
          businessName: businessData.businessName,
          address: businessData.address,
          phoneNumber: businessData.phoneNumber,
          website: businessData.website,
          city: businessData.city,
          state: businessData.state,
          country: businessData.country,
        });
      }

      return res.json({
        success: true,
        place: businessData,
      });
    } else {
      // Handle HTTP errors
      const errorData = place.error || place;
      let errorMessage = `Google Places API error: ${response.status}`;
      let helpMessage = '';

      if (response.status === 403 || errorData?.message?.includes('API key')) {
        errorMessage = 'Google Places API request denied';
        helpMessage = 'Possible causes: 1) API key is missing or invalid, 2) Places API (New) is not enabled in Google Cloud Console, 3) API key restrictions are blocking the request. Make sure you enabled "Places API (New)" not the old "Places API".';
      } else if (response.status === 400) {
        errorMessage = 'Invalid request to Google Places API';
        helpMessage = `The request parameters are invalid. ${errorData?.message || 'Please check the place ID and field mask.'}`;

        // Log the actual error for debugging
        console.error('400 Error Details:', JSON.stringify(errorData, null, 2));
      } else if (response.status === 404) {
        errorMessage = 'Place not found';
        helpMessage = 'The place ID is invalid or the place no longer exists.';
      } else if (response.status === 429) {
        errorMessage = 'Google Places API quota exceeded';
        helpMessage = 'You have exceeded your API quota. Check your Google Cloud Console billing.';
      }

      // Log full error details for debugging
      console.error('Google Places API error details:');
      console.error('  HTTP Status:', response.status);
      console.error('  Error:', JSON.stringify(errorData, null, 2));
      console.error('  API Key present:', !!GOOGLE_PLACES_API_KEY);
      console.error('  API Key length:', GOOGLE_PLACES_API_KEY?.length || 0);

      return res.status(response.status).json({
        error: errorMessage,
        status: response.status,
        help: helpMessage,
        errorMessage: errorData?.message || errorData?.error_message || '',
        debug: process.env.NODE_ENV === 'development' ? {
          apiKeyPresent: !!GOOGLE_PLACES_API_KEY,
          apiKeyLength: GOOGLE_PLACES_API_KEY?.length || 0,
        } : undefined,
      });
    }
  } catch (error) {
    console.error('Error fetching place details:', error);
    return res.status(500).json({
      error: 'Failed to fetch place details',
      message: error.message,
    });
  }
};


/**
 * Search places by text query (New Places API)
 * POST /api/google-places/text-search
 */
export const textSearch = async (req, res) => {
  try {
    const { query, location } = req.body;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        error: 'Query must be at least 2 characters long'
      });
    }

    if (!GOOGLE_PLACES_API_KEY) {
      console.error('GOOGLE_PLACES_API_KEY is not set in environment variables');
      return res.status(500).json({
        error: 'Google Places API key is not configured'
      });
    }

    // Request fields: only essentials for the list view
    // id, displayName, formattedAddress are essential
    // photos are useful for thumbnails
    const fieldMask = [
      'places.id',
      'places.displayName',
      'places.formattedAddress',
      'places.photos',
      'places.types',
      'places.rating',
      'places.userRatingCount',
      'places.businessStatus'
    ].join(',');

    const requestBody = {
      textQuery: query,
      languageCode: 'en',
    };

    // Add location bias if provided
    if (location && location.lat && location.lng) {
      requestBody.locationBias = {
        circle: {
          center: {
            latitude: location.lat,
            longitude: location.lng,
          },
          radius: 10000.0, // 10km bias
        },
      };
    }

    const response = await fetch(
      'https://places.googleapis.com/v1/places:searchText',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
          'X-Goog-FieldMask': fieldMask,
        },
        body: JSON.stringify(requestBody),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Google Places Text Search Error:', data);
      return res.status(response.status).json({
        error: 'Failed to search places',
        details: data.error?.message || data.error || 'Unknown error'
      });
    }

    // Transform results
    const places = (data.places || []).map(place => {
      // Extract business name
      const businessName = typeof place.displayName === 'string'
        ? place.displayName
        : place.displayName?.text || '';

      // Get first photo if available
      const photoUrl = place.photos && place.photos.length > 0 && place.photos[0].name
        ? `https://places.googleapis.com/v1/${place.photos[0].name}/media?maxHeightPx=400&maxWidthPx=400&key=${GOOGLE_PLACES_API_KEY}`
        : null;

      return {
        id: place.id, // placeId
        name: businessName,
        address: place.formattedAddress,
        rating: place.rating,
        userRatingCount: place.userRatingCount,
        businessStatus: place.businessStatus,
        photoUrl: photoUrl,
        types: place.types || []
      };
    });

    // Check for duplicates in our database
    try {
      // Import Business model dynamically to avoid circular dependencies if any
      const { default: Business } = await import('../models/Business.js');

      const namesToCheck = places.map(p => p.name).filter(Boolean);
      const existingNames = await Business.checkExistingBusinesses(namesToCheck);

      // Mark duplicates
      places.forEach(place => {
        if (place.name && existingNames.has(place.name.toLowerCase())) {
          place.exists = true;
        } else {
          place.exists = false;
        }
      });
    } catch (dbError) {
      console.error('Error checking for duplicates:', dbError);
      // Continue without duplicate info rather than failing
    }

    return res.json({
      success: true,
      places: places
    });

  } catch (error) {
    console.error('Error in text search:', error);
    return res.status(500).json({
      error: 'Internal server error during search',
      message: error.message
    });
  }
};
