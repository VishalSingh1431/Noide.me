/**
 * Generate HTML template for business website
 * This can be used to render business pages for subdomain/subdirectory routing
 */
export const generateBusinessHTML = (business, apiBaseUrl = null) => {
  // Determine API base URL
  // Use provided apiBaseUrl, or compute from environment
  let apiUrl;
  if (apiBaseUrl) {
    apiUrl = apiBaseUrl;
  } else {
    // Determine API base URL from current window location if available (client-side)
    // or fall back to environment variables (server-side rendering)
    const isDevelopment = process.env.NODE_ENV === 'development';
    const baseDomain = process.env.BASE_DOMAIN || 'varanasihub.com';
    const port = process.env.PORT || 5000;

    apiUrl = isDevelopment
      ? `http://localhost:${port}/api`
      : `https://${baseDomain}/api`;
  }
  // Helper function to get first name from full name
  const getFirstName = (fullName) => {
    if (!fullName) return '';
    return fullName.split(' ')[0];
  };

  const ownerFirstName = getFirstName(business.ownerName);

  // Theme configurations - Matching WebsitePreview.jsx
  const themes = {
    modern: {
      primary: 'from-blue-600 via-indigo-600 to-purple-600',
      primarySolid: 'bg-blue-600',
      primaryHover: 'hover:bg-blue-700',
      button: 'bg-blue-600 hover:bg-blue-700',
      accent: 'text-purple-600',
      accentBorder: 'border-purple-600',
      bgGradient: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600'
    },
    classic: {
      primary: 'from-amber-600 via-orange-600 to-red-600',
      primarySolid: 'bg-amber-600',
      primaryHover: 'hover:bg-amber-700',
      button: 'bg-amber-600 hover:bg-amber-700',
      accent: 'text-amber-600',
      accentBorder: 'border-amber-600',
      bgGradient: 'bg-gradient-to-r from-amber-600 via-orange-600 to-red-600'
    },
    minimal: {
      primary: 'from-gray-100 via-gray-200 to-gray-300',
      primarySolid: 'bg-gray-600',
      primaryHover: 'hover:bg-gray-700',
      button: 'bg-gray-600 hover:bg-gray-700',
      accent: 'text-gray-600',
      accentBorder: 'border-gray-600',
      bgGradient: 'bg-gradient-to-r from-gray-100 via-gray-200 to-gray-300'
    },
  };

  const theme = themes[business.theme] || themes.modern;

  // Extract YouTube video ID from URL (supports regular videos and Shorts)
  const getYouTubeId = (url) => {
    if (!url) return null;
    // Support regular YouTube URLs, Shorts URLs, and youtu.be links
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  // Handle both array and string for backward compatibility
  const youtubeVideos = Array.isArray(business.youtubeVideo) 
    ? business.youtubeVideo 
    : (business.youtubeVideo ? [business.youtubeVideo] : []);

  // Escape HTML to prevent XSS (robustly handles non-strings)
  const escapeHtml = (text) => {
    if (text === null || text === undefined) return '';
    const str = String(text);
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return str.replace(/[&<>"']/g, m => map[m]);
  };

  // Generate SEO-friendly slug for URL
  const businessSlug = business.slug || business.businessName.toLowerCase().replace(/\s+/g, '-');
  const canonicalUrl = business.subdomainUrl || '';


  // Extract location details from address
  const addressParts = business.address ? business.address.split(',') : [];
  const area = addressParts[0]?.trim() || 'Varanasi';
  const city = 'Varanasi';
  const state = 'Uttar Pradesh';
  const country = 'India';

  // Generate comprehensive keywords from business data
  const keywords = [
    business.businessName,
    business.category,
    business.ownerName,
    area,
    city,
    state,
    `${business.businessName} ${city}`,
    `${business.category} ${city}`,
    `${business.category} near me`,
    `${business.businessName} ${area}`,
    'Varanasi business',
    'Varanasi services',
    'online business',
    'local business',
    'best ' + business.category + ' in ' + city
  ].filter(Boolean).join(', ');

  // Generate optimized meta description
  const metaDescription = business.description
    ? business.description.substring(0, 155).replace(/\s+/g, ' ').trim() + (business.description.length > 155 ? '...' : '')
    : `${business.businessName} - ${business.category} in ${city}. ${business.ownerName ? `Owner: ${business.ownerName}. ` : ''}Contact us for quality services.`;

  // Extract coordinates from map link if available
  let latitude = "25.3176";
  let longitude = "82.9739";
  if (business.mapLink) {
    const coordMatch = business.mapLink.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (coordMatch) {
      latitude = coordMatch[1];
      longitude = coordMatch[2];
    }
  }

  // Generate image alt text helper
  const generateImageAlt = (imageUrl, index, type = 'gallery') => {
    const imageName = imageUrl.split('/').pop().replace(/\.(jpg|jpeg|png|webp)$/i, '').replace(/[-_]/g, ' ');
    if (type === 'logo') {
      return `${business.businessName} logo - ${business.category} in ${city}`;
    }
    return `${business.businessName} - ${business.category} ${type} image ${index + 1} in ${city}, ${state}`;
  };

  // Generate comprehensive structured data (JSON-LD) - Enhanced
  const structuredData = {
    "@context": "https://schema.org",
    "@type": getBusinessType(business.category),
    "@id": canonicalUrl,
    "name": business.businessName,
    "alternateName": business.navbarTagline || business.businessName,
    "description": business.description || `${business.businessName} is a ${business.category} located in ${city}, ${state}. ${business.ownerName ? `Owned by ${business.ownerName}. ` : ''}Contact us for quality services.`,
    "image": [
      business.logoUrl,
      ...(business.imagesUrl || []).slice(0, 10)
    ].filter(Boolean).map((img, idx) => ({
      "@type": "ImageObject",
      "url": img,
      "caption": generateImageAlt(img, idx)
    })),
    "logo": {
      "@type": "ImageObject",
      "url": business.logoUrl || '',
      "caption": generateImageAlt(business.logoUrl || '', 0, 'logo')
    },
    "address": {
      "@type": "PostalAddress",
      "streetAddress": business.address,
      "addressLocality": city,
      "addressRegion": state,
      "postalCode": "221001",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": latitude,
      "longitude": longitude
    },
    "telephone": business.mobile,
    "email": business.email,
    "url": canonicalUrl,
    "priceRange": "$$",
    "currenciesAccepted": "INR",
    "paymentAccepted": "Cash, Card, UPI, Digital Payment",
    "openingHoursSpecification": Object.keys(business.businessHours || {}).map(day => {
      const hours = business.businessHours[day];
      if (hours && hours.open) {
        const dayName = day.charAt(0).toUpperCase() + day.slice(1);
        return {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": `https://schema.org/${dayName}`,
          "opens": hours.start || "09:00",
          "closes": hours.end || "18:00"
        };
      }
      return null;
    }).filter(Boolean),
    "areaServed": [
      {
        "@type": "City",
        "name": city,
        "@id": "https://www.wikidata.org/wiki/Q79980"
      },
      {
        "@type": "State",
        "name": state
      }
    ],
    "knowsAbout": [business.category, city, `${business.category} services`],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.5",
      "reviewCount": "10",
      "bestRating": "5",
      "worstRating": "1"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": business.mobile,
      "contactType": "Customer Service",
      "areaServed": "IN",
      "availableLanguage": ["en", "hi"],
      ...(business.whatsapp ? { "contactOption": "TollFree", "hoursAvailable": { "@type": "OpeningHoursSpecification", "dayOfWeek": "https://schema.org/Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday", "opens": "00:00", "closes": "23:59" } } : {})
    },
    ...(business.socialLinks?.website ? {
      "sameAs": [
        business.socialLinks.website,
        ...(business.socialLinks.instagram ? [`https://instagram.com/${business.socialLinks.instagram.replace(/^https?:\/\/(www\.)?instagram\.com\//, '').replace(/\/$/, '')}`] : []),
        ...(business.socialLinks.facebook ? [business.socialLinks.facebook] : []),
        canonicalUrl
      ].filter(Boolean)
    } : {}),
    ...(business.ownerName ? { "founder": { "@type": "Person", "name": business.ownerName } } : {}),
    ...(business.whatsapp ? { "additionalProperty": { "@type": "PropertyValue", "name": "WhatsApp", "value": business.whatsapp } } : {})
  };

  // Helper function to get proper business type
  function getBusinessType(category) {
    const typeMap = {
      'Restaurant': 'Restaurant',
      'Hotel': 'Hotel',
      'Clinic': 'MedicalBusiness',
      'Shop': 'Store',
      'Library': 'Library',
      'Services': 'LocalBusiness'
    };
    return typeMap[category] || 'LocalBusiness';
  }

  // Generate Organization schema
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": business.businessName,
    "url": canonicalUrl,
    "logo": business.logoUrl || '',
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": business.mobile,
      "contactType": "Customer Service",
      "areaServed": "IN",
      "availableLanguage": ["en", "hi"]
    },
    "sameAs": [
      ...(business.socialLinks?.website ? [business.socialLinks.website] : []),
      ...(business.socialLinks?.instagram ? [`https://instagram.com/${business.socialLinks.instagram.replace(/^https?:\/\/(www\.)?instagram\.com\//, '').replace(/\/$/, '')}`] : []),
      ...(business.socialLinks?.facebook ? [business.socialLinks.facebook] : [])
    ].filter(Boolean)
  };

  // Generate Breadcrumb schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://varanasihub.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": business.category || 'Services',
        "item": `https://varanasihub.com/category/${(business.category || 'Services').toLowerCase().replace(/\s+/g, '-')}`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": business.businessName,
        "item": canonicalUrl
      }
    ]
  };

  // Generate Service schema if services exist - Enhanced
  const serviceSchemas = business.services && business.services.length > 0 ? business.services.map((service, index) => ({
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": service.title,
    "name": service.title,
    "description": service.description || `${service.title} service by ${business.businessName} in ${city}`,
    "provider": {
      "@type": "LocalBusiness",
      "name": business.businessName,
      "url": canonicalUrl
    },
    "areaServed": {
      "@type": "City",
      "name": city,
      "@id": "https://www.wikidata.org/wiki/Q79980"
    },
    "availableChannel": {
      "@type": "ServiceChannel",
      "serviceUrl": canonicalUrl,
      "servicePhone": business.mobile
    },
    ...(service.price ? {
      "offers": {
        "@type": "Offer",
        "price": service.price,
        "priceCurrency": "INR",
        "availability": "https://schema.org/InStock",
        "url": canonicalUrl,
        "priceValidUntil": new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }
    } : {}),
    ...(service.image ? {
      "image": {
        "@type": "ImageObject",
        "url": service.image,
        "caption": `${service.title} - ${business.businessName}`
      }
    } : {})
  })) : [];

  // Generate Video schema if YouTube video exists
  const videoSchema = videoId ? {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": `${business.businessName} - ${business.category} Video`,
    "description": business.description || `${business.businessName} video introduction`,
    "thumbnailUrl": `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    "uploadDate": business.createdAt || new Date().toISOString(),
    "duration": "PT1M",
    "contentUrl": `https://www.youtube.com/watch?v=${videoId}`,
    "embedUrl": embedUrl,
    "publisher": {
      "@type": "Organization",
      "name": business.businessName,
      "logo": {
        "@type": "ImageObject",
        "url": business.logoUrl || ''
      }
    }
  } : null;

  // Generate Image Gallery schema
  const imageGallerySchema = business.imagesUrl && business.imagesUrl.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    "name": `${business.businessName} Photo Gallery`,
    "description": `Photo gallery of ${business.businessName} - ${business.category} in ${city}`,
    "image": business.imagesUrl.slice(0, 20).map((img, idx) => ({
      "@type": "ImageObject",
      "url": img,
      "caption": generateImageAlt(img, idx),
      "name": `${business.businessName} - Image ${idx + 1}`
    }))
  } : null;

  return `
<!DOCTYPE html>
<html lang="en" itemscope itemtype="https://schema.org/LocalBusiness">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- Primary Meta Tags -->
  <title>${escapeHtml(business.businessName)} - ${escapeHtml(business.category)} in ${city} | VaranasiHub</title>
  <meta name="title" content="${escapeHtml(business.businessName)} - ${escapeHtml(business.category)} in ${city} | VaranasiHub">
  <meta name="description" content="${escapeHtml(metaDescription)}">
  <meta name="keywords" content="${escapeHtml(keywords)}">
  <meta name="author" content="${escapeHtml(business.ownerName || business.businessName)}">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
  <meta name="googlebot" content="index, follow">
  <meta name="bingbot" content="index, follow">
  <meta name="language" content="English">
  <meta name="revisit-after" content="7 days">
  <meta name="rating" content="general">
  <meta name="distribution" content="global">
  <meta name="coverage" content="worldwide">
  <meta name="target" content="all">
  <meta name="audience" content="all">
  
  <!-- Canonical URL -->
  ${canonicalUrl ? `<link rel="canonical" href="${escapeHtml(canonicalUrl)}">` : ''}
  

  
  <!-- Hreflang Tags for Multi-language Support -->
  <link rel="alternate" hreflang="en" href="${escapeHtml(canonicalUrl)}">
  <link rel="alternate" hreflang="hi" href="${escapeHtml(canonicalUrl)}?lang=hi">
  <link rel="alternate" hreflang="x-default" href="${escapeHtml(canonicalUrl)}">
  
  <!-- DNS Prefetch for Performance -->
  <link rel="dns-prefetch" href="https://cdn.tailwindcss.com">
  <link rel="dns-prefetch" href="https://fonts.googleapis.com">
  <link rel="dns-prefetch" href="https://fonts.gstatic.com">
  <link rel="dns-prefetch" href="https://www.google.com">
  <link rel="dns-prefetch" href="https://www.googletagmanager.com">
  <link rel="preconnect" href="https://fonts.googleapis.com" crossorigin>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  ${business.logoUrl && business.logoUrl.startsWith('http') ? `<link rel="preconnect" href="${new URL(business.logoUrl).origin}" crossorigin>` : ''}
  ${business.imagesUrl && business.imagesUrl[0] && business.imagesUrl[0].startsWith('http') ? `<link rel="preconnect" href="${new URL(business.imagesUrl[0]).origin}" crossorigin>` : ''}
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${escapeHtml(canonicalUrl)}">
  <meta property="og:title" content="${escapeHtml(business.businessName)} - ${escapeHtml(business.category)} in ${city}">
  <meta property="og:description" content="${escapeHtml(metaDescription)}">
  <meta property="og:image" content="${escapeHtml(business.logoUrl || (business.imagesUrl && business.imagesUrl[0]) || '')}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${escapeHtml(business.businessName)} - ${escapeHtml(business.category)}">
  <meta property="og:site_name" content="VaranasiHub">
  <meta property="og:locale" content="en_IN">
  <meta property="og:locale:alternate" content="hi_IN">
  ${business.address ? `<meta property="og:street_address" content="${escapeHtml(business.address)}">` : ''}
  <meta property="og:locality" content="${city}">
  <meta property="og:region" content="${state}">
  <meta property="og:postal_code" content="">
  <meta property="og:country_name" content="${country}">
  ${business.mobile ? `<meta property="og:phone_number" content="${escapeHtml(business.mobile)}">` : ''}
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${escapeHtml(canonicalUrl)}">
  <meta name="twitter:title" content="${escapeHtml(business.businessName)} - ${escapeHtml(business.category)} in ${city}">
  <meta name="twitter:description" content="${escapeHtml(metaDescription)}">
  <meta name="twitter:image" content="${escapeHtml(business.logoUrl || (business.imagesUrl && business.imagesUrl[0]) || '')}">
  <meta name="twitter:image:alt" content="${escapeHtml(business.businessName)} - ${escapeHtml(business.category)}">
  <meta name="twitter:site" content="@VaranasiHub">
  <meta name="twitter:creator" content="@VaranasiHub">
  
  <!-- Additional SEO Meta Tags -->
  <meta name="geo.region" content="IN-UP">
  <meta name="geo.placename" content="${city}">
  <meta name="geo.position" content="25.3176;82.9739">
  <meta name="ICBM" content="25.3176, 82.9739">
  ${business.address ? `<meta name="DC.title" content="${escapeHtml(business.businessName)}">` : ''}
  <meta name="DC.creator" content="${escapeHtml(business.ownerName || business.businessName)}">
  <meta name="DC.subject" content="${escapeHtml(business.category)}">
  <meta name="DC.description" content="${escapeHtml(metaDescription)}">
  <meta name="DC.publisher" content="VaranasiHub">
  <meta name="DC.contributor" content="${escapeHtml(business.ownerName || business.businessName)}">
  <meta name="DC.date" content="${new Date().toISOString()}">
  <meta name="DC.type" content="Text">
  <meta name="DC.format" content="text/html">
  <meta name="DC.identifier" content="${escapeHtml(canonicalUrl)}">
  <meta name="DC.language" content="en">
  <meta name="DC.coverage" content="${city}, ${state}, ${country}">
  
  <!-- Apple Touch Icons -->
  ${business.logoUrl ? `
  <link rel="apple-touch-icon" href="${escapeHtml(business.logoUrl)}">
  <link rel="apple-touch-icon" sizes="180x180" href="${escapeHtml(business.logoUrl)}">
  ` : ''}
  
  <!-- Favicon -->
  ${business.logoUrl ? `<link rel="icon" type="image/png" href="${escapeHtml(business.logoUrl)}">` : ''}
  
  <!-- Structured Data (JSON-LD) - LocalBusiness -->
  <script type="application/ld+json">
  ${JSON.stringify(structuredData)}
  </script>
  
  <!-- Structured Data (JSON-LD) - Organization -->
  <script type="application/ld+json">
  ${JSON.stringify(organizationSchema)}
  </script>
  
  <!-- Structured Data (JSON-LD) - Breadcrumb -->
  <script type="application/ld+json">
  ${JSON.stringify(breadcrumbSchema)}
  </script>
  
  ${serviceSchemas.length > 0 ? serviceSchemas.map(schema => `
  <!-- Structured Data (JSON-LD) - Service -->
  <script type="application/ld+json">
  ${JSON.stringify(schema)}
  </script>
  `).join('') : ''}
  
  ${videoSchema ? `
  <!-- Structured Data (JSON-LD) - Video -->
  <script type="application/ld+json">
  ${JSON.stringify(videoSchema)}
  </script>
  ` : ''}
  
  ${imageGallerySchema ? `
  <!-- Structured Data (JSON-LD) - Image Gallery -->
  <script type="application/ld+json">
  ${JSON.stringify(imageGallerySchema)}
  </script>
  ` : ''}
  
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    /* Glassmorphism Utilities */
    .glass {
      background: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.3);
    }
    .glass-dark {
      background: rgba(0, 0, 0, 0.3);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    /* Custom Cursor Zoom Effect */
    body {
      cursor: default;
    }
    a, button, .cursor-zoom, img, .card-hover, .service-card, .gallery-item, .share-option {
      cursor: pointer;
    }

    /* Professional Card Styles */
    .section-card {
      background: white;
      border-radius: 20px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      border: 1px solid #e5e7eb;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .section-card:hover {
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      transform: translateY(-4px);
    }

    /* Enhanced hover effects for interactive elements */
    .hover-zoom {
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease;
    }
    .hover-zoom:hover {
      transform: scale(1.05) translateY(-4px);
    }

    /* Prevent horizontal overflow */
    html {
      scroll-behavior: smooth;
      scroll-padding-top: 80px;
    }
    body {
      overflow-x: hidden;
      width: 100%;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
      /* Hide scrollbar for Chrome, Safari and Opera */
      &::-webkit-scrollbar {
        display: none;
      }
      /* Hide scrollbar for IE, Edge and Firefox */
      -ms-overflow-style: none;  /* IE and Edge */
      scrollbar-width: none;  /* Firefox */
    }
    main, section {
      width: 100%;
      position: relative;
      clear: both;
    }
    .max-w-7xl {
      max-width: 1280px;
      margin-left: auto;
      margin-right: auto;
    }

    /* Animation Keyframes */
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-20px); }
    }
    .animate-float {
      animation: float 6s ease-in-out infinite;
    }
    .animate-float-delayed {
      animation: float 8s ease-in-out infinite;
      animation-delay: 2s;
    }

    /* Text truncate */
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .line-clamp-3 {
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    /* Global Responsive Improvements */
    @media (max-width: 640px) {
      body {
        font-size: 14px;
      }
      h1 {
        font-size: 1.875rem;
        line-height: 2.25rem;
      }
      h2 {
        font-size: 1.5rem;
        line-height: 2rem;
      }
      h3 {
        font-size: 1.25rem;
        line-height: 1.75rem;
      }
      .container, .max-w-7xl {
        padding-left: 1rem;
        padding-right: 1rem;
      }
    }
    /* Prevent text overflow */
    * {
      word-wrap: break-word;
      overflow-wrap: break-word;
      box-sizing: border-box;
    }
    /* Text truncation */
    .line-clamp-3 {
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    /* Prevent container overflow */
    .section-card, .service-card-item {
      max-width: 100%;
      overflow: hidden;
    }
    /* Touch-friendly tap targets */
    @media (max-width: 768px) {
      a, button {
        min-height: 44px;
        min-width: 44px;
      }
    }

    /* Image Lightbox Modal Styles */
    .lightbox-modal {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.95);
      z-index: 9999;
      cursor: pointer;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    .lightbox-modal.active {
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 1;
    }
    .lightbox-content {
      position: relative;
      max-width: 90vw;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: default;
    }
    .lightbox-image {
      max-width: 100%;
      max-height: 85vh;
      object-fit: contain;
      border-radius: 8px;
      transition: transform 0.3s ease;
      user-select: none;
      -webkit-user-drag: none;
      touch-action: pan-x pan-y pinch-zoom;
    }
    .lightbox-close {
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border: 2px solid rgba(255, 255, 255, 0.3);
      color: white;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 10000;
      transition: all 0.3s ease;
    }
    .lightbox-close:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: scale(1.1);
    }
    .lightbox-prev,
    .lightbox-next {
      position: fixed;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border: 2px solid rgba(255, 255, 255, 0.3);
      color: white;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 10000;
      transition: all 0.3s ease;
    }
    .lightbox-prev {
      left: 20px;
    }
    .lightbox-next {
      right: 20px;
    }
    .lightbox-prev:hover,
    .lightbox-next:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: translateY(-50%) scale(1.1);
    }
    .lightbox-counter {
      position: absolute;
      bottom: -40px;
      left: 50%;
      transform: translateX(-50%);
      color: white;
      font-size: 16px;
      font-weight: 600;
      background: rgba(0, 0, 0, 0.5);
      padding: 8px 16px;
      border-radius: 20px;
      backdrop-filter: blur(10px);
    }
    .lightbox-zoom-controls {
      position: absolute;
      bottom: -90px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 12px;
      background: rgba(0, 0, 0, 0.5);
      padding: 12px;
      border-radius: 24px;
      backdrop-filter: blur(10px);
    }
    .lightbox-zoom-btn {
      background: rgba(255, 255, 255, 0.1);
      border: 2px solid rgba(255, 255, 255, 0.3);
      color: white;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    .lightbox-zoom-btn:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: scale(1.1);
    }
    @media (max-width: 768px) {
      .lightbox-prev,
      .lightbox-next {
        width: 40px;
        height: 40px;
      }
      .lightbox-prev {
        left: 10px;
      }
      .lightbox-next {
        right: 10px;
      }
      .lightbox-close {
        width: 40px;
        height: 40px;
        top: 10px;
        right: 10px;
      }
      .lightbox-zoom-controls {
        bottom: -80px;
      }
    }

    /* Mobile Bottom Navigation Bar */
    .mobile-bottom-nav {
      display: none;
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: white;
      border-top: 2px solid #e5e7eb;
      box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.1);
      z-index: 1000;
      padding: 8px 0 max(8px, env(safe-area-inset-bottom));
    }
    @media (max-width: 768px) {
      .mobile-bottom-nav {
        display: flex;
        justify-content: space-around;
        align-items: center;
      }
      body {
        padding-bottom: 70px;
      }
      /* Adjust WhatsApp widget position when bottom nav is visible */
      .whatsapp-widget {
        bottom: 85px !important;
      }
    }
    .mobile-nav-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 4px;
      padding: 8px 12px;
      color: #6b7280;
      text-decoration: none;
      font-size: 12px;
      font-weight: 500;
      transition: all 0.3s ease;
      border-radius: 12px;
      min-width: 60px;
    }
    .mobile-nav-item:hover,
    .mobile-nav-item.active {
      color: #3b82f6;
      background: #eff6ff;
    }
    .mobile-nav-item svg {
      transition: transform 0.3s ease;
    }
    .mobile-nav-item:hover svg,
    .mobile-nav-item.active svg {
      transform: scale(1.1);
    }

    /* Pull to Refresh Styles */
    .pull-to-refresh {
      position: fixed;
      top: -60px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      background: white;
      border-radius: 0 0 24px 24px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      z-index: 9998;
      transition: top 0.3s ease;
      pointer-events: none;
    }
    .pull-to-refresh.active {
      top: 0;
    }
    .pull-to-refresh-spinner {
      color: #3b82f6;
    }
    .pull-to-refresh-text {
      font-size: 14px;
      font-weight: 600;
      color: #3b82f6;
    }
    @media (min-width: 769px) {
      .pull-to-refresh {
        display: none;
      }
    }
    /* Button zoom effects */
    button, .btn, a[class*="button"], a[class*="btn"] {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    button:hover, .btn:hover, a[class*="button"]:hover, a[class*="btn"]:hover {
      transform: scale(1.05);
    }
    button:active, .btn:active, a[class*="button"]:active, a[class*="btn"]:active {
      transform: scale(0.98);
    }
    /* Card zoom effects */
    .card, [class*="card"], [class*="rounded"] {
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease;
    }
    .card:hover, [class*="card"]:hover, [class*="rounded"]:hover {
      transform: scale(1.02) translateY(-2px);
    }
    .nav-active { color: #2563eb; background-color: #eff6ff; }
    .edit-button-float {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 1000;
      animation: pulse 2s infinite;
    }
    @media (max-width: 640px) {
      .edit-button-float {
        bottom: 15px;
        right: 15px;
      }
      .edit-button-float a {
        padding: 12px 16px;
        font-size: 12px;
      }
      .edit-button-float svg {
        width: 16px;
        height: 16px;
      }
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .whatsapp-widget {
      position: fixed !important;
      bottom: 20px !important;
      right: 20px !important;
      z-index: 99999 !important;
      width: 60px;
      height: 60px;
      display: block !important;
      visibility: visible !important;
    }
    .whatsapp-widget.has-edit-button {
      bottom: 90px;
    }
    .whatsapp-widget-button {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: #25D366;
      box-shadow: 0 4px 12px rgba(37, 211, 102, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
      text-decoration: none;
    }
    .whatsapp-widget-button:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 20px rgba(37, 211, 102, 0.6);
      background: #20BA5A;
    }
    .whatsapp-widget-button:active {
      transform: scale(0.95);
    }
    .whatsapp-icon {
      width: 36px;
      height: 36px;
      fill: white;
    }
    @media (max-width: 640px) {
      .whatsapp-widget {
        bottom: 15px;
        right: 15px;
        width: 56px;
        height: 56px;
      }
      .whatsapp-widget.has-edit-button {
        bottom: 85px;
      }
      .whatsapp-widget-button {
        width: 56px;
        height: 56px;
      }
      .whatsapp-icon {
        width: 32px;
        height: 32px;
      }
    }
    /* FAQ Styles */
    .faq-item {
      transition: all 0.3s ease;
    }
    .faq-item.active .faq-icon {
      transform: rotate(180deg);
    }
    .faq-item.active .faq-answer {
      display: block !important;
      animation: slideDown 0.3s ease;
    }
    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    /* Service Inquiry Modal */
    .service-inquiry-modal {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 99999;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(4px);
    }
    .service-inquiry-modal.active {
      display: flex;
    }
    .service-inquiry-modal-content {
      background: white;
      border-radius: 24px;
      padding: 32px;
      max-width: 500px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      animation: modalSlideIn 0.3s ease;
    }
    .service-inquiry-form-group {
      margin-bottom: 20px;
    }
    .service-inquiry-form-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
      color: #1F2937;
    }
    .service-inquiry-form-group input,
    .service-inquiry-form-group textarea {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #E5E7EB;
      border-radius: 12px;
      font-size: 14px;
      outline: none;
      transition: all 0.2s ease;
      box-sizing: border-box;
    }
    .service-inquiry-form-group input:focus,
    .service-inquiry-form-group textarea:focus {
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    .service-inquiry-submit-btn {
      width: 100%;
      padding: 14px;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .service-inquiry-submit-btn:hover {
      background: #2563eb;
    }
    .service-inquiry-submit-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    @media (max-width: 768px) {
      .share-button-widget {
        bottom: 80px !important;
      }
      .floating-actions {
        bottom: 20px !important;
      }
    }
  </style>
</head>
<body class="bg-gray-50" style="background-color: #f9fafb;">
  <!-- Service Inquiry Modal -->
  <div id="serviceInquiryModal" class="service-inquiry-modal" onclick="closeServiceInquiryModalOnBackdrop(event)">
    <div class="service-inquiry-modal-content" onclick="event.stopPropagation()">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-2xl font-bold text-gray-900">Inquire About Service</h3>
        <button onclick="closeServiceInquiryModal()" class="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors" aria-label="Close">
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      
      <div class="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p class="text-sm text-gray-600 mb-2"><strong>Service:</strong></p>
        <p class="text-lg font-semibold text-gray-900" id="inquiryServiceName"></p>
        <p class="text-sm text-gray-600 mt-2" id="inquiryServiceDescription"></p>
        <p class="text-sm text-blue-600 font-semibold mt-2" id="inquiryServicePrice"></p>
      </div>

      <form id="serviceInquiryForm" onsubmit="submitServiceInquiry(event)">
        <div class="service-inquiry-form-group">
          <label for="inquiryName">Your Name <span class="text-red-500">*</span></label>
          <input type="text" id="inquiryName" name="name" required placeholder="Enter your full name">
        </div>
        
        <div class="service-inquiry-form-group">
          <label for="inquiryEmail">Your Email <span class="text-red-500">*</span></label>
          <input type="email" id="inquiryEmail" name="email" required placeholder="Enter your email address">
        </div>
        
        <div class="service-inquiry-form-group">
          <label for="inquiryPhone">Phone Number</label>
          <input type="tel" id="inquiryPhone" name="phone" placeholder="Enter your phone number (optional)">
        </div>
        
        <div class="service-inquiry-form-group">
          <label for="inquiryMessage">Message <span class="text-red-500">*</span></label>
          <textarea id="inquiryMessage" name="message" rows="4" required placeholder="Tell us about your requirements..."></textarea>
        </div>
        
        <div id="inquiryMessageDiv" class="hidden mb-4 p-4 rounded-lg"></div>
        
        <button type="submit" id="inquirySubmitBtn" class="service-inquiry-submit-btn">
          Send Inquiry
        </button>
      </form>
    </div>
  </div>


  
  <!-- Edit Button (shown only to owner) -->
  <div id="editButtonContainer" style="display: none;" class="edit-button-float">
    <a 
      href="/edit-website/${business.id}" 
      class="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 font-bold text-sm md:text-base"
      style="box-shadow: 0 10px 25px rgba(37, 99, 235, 0.4);"
      title="Edit Your Website"
    >
      <svg class="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
      </svg>
      <span class="hidden sm:inline">Edit Website</span>
      <span class="sm:hidden">Edit</span>
    </a>
  </div>
  
  <script>
    // Check if current user is the owner
    (function() {
      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (token && userData) {
          const user = JSON.parse(userData);
          const businessUserId = ${business.userId ? business.userId : 'null'};
          
          // If user ID matches business owner ID, show edit button
          if (user.id === businessUserId) {
            const editButton = document.getElementById('editButtonContainer');
            if (editButton) {
              editButton.style.display = 'block';
              // Adjust WhatsApp widget position if edit button is visible
              const floatingActions = document.querySelector('.floating-actions');
              if (floatingActions) {
                floatingActions.classList.add('has-edit-button');
              }
            }
          }
        }
      } catch (error) {
        console.error('Error checking ownership:', error);
      }
    })();
  </script>
  <!-- Navbar -->
  <nav class="bg-white/95 backdrop-blur-md border-b-2 ${theme.accent.replace('text-', 'border-')} sticky top-0 z-50 shadow-lg transition-all duration-300">
    <div class="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4">
      <div class="flex items-center justify-between gap-2 sm:gap-4">
        <a href="#home" class="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          ${business.logoUrl ? `
            <img src="${escapeHtml(business.logoUrl)}" alt="${escapeHtml(business.businessName)}" class="w-10 h-10 sm:w-12 sm:h-12 object-contain rounded-lg flex-shrink-0 shadow-md" />
          ` : `
            <div class="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
              <span class="text-white font-bold text-lg sm:text-xl">${escapeHtml(business.businessName.charAt(0).toUpperCase())}</span>
            </div>
          `}
          <div class="min-w-0 flex-1">
            <h1 class="text-base sm:text-lg md:text-xl font-bold text-gray-900 truncate">${escapeHtml(business.businessName)}</h1>
          </div>
        </a>

        <!-- Desktop Navigation -->
        <div class="hidden md:flex items-center gap-6 text-base">
          <a href="#home" class="text-gray-700 hover:text-blue-600 font-bold whitespace-nowrap transition-colors">Home</a>
          ${business.description ? `<a href="#about" class="text-gray-700 hover:text-blue-600 font-bold whitespace-nowrap transition-colors">About</a>` : ''}
          ${business.services && business.services.length > 0 ? `<a href="#services" class="text-gray-700 hover:text-blue-600 font-bold whitespace-nowrap transition-colors">Services</a>` : ''}
          ${business.imagesUrl && business.imagesUrl.length > 0 ? `<a href="#gallery" class="text-gray-700 hover:text-blue-600 font-bold whitespace-nowrap transition-colors">Gallery</a>` : ''}
          <a href="#contact" class="text-gray-700 hover:text-blue-600 font-bold whitespace-nowrap transition-colors">Contact</a>
          
          <!-- Quick Contact Icons -->
          <div class="flex items-center gap-3 pl-4 border-l border-gray-100">
            ${business.mobile ? `
              <a href="tel:${escapeHtml(business.mobile)}" class="p-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 transition-all hover:scale-110" title="Call Now">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
              </a>
            ` : ''}
            
            <button onclick="shareBusiness()" class="p-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-600 transition-all hover:scale-110" title="Share Website">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
            </button>
          </div>
        </div>

        <!-- Mobile Menu Button -->
        <button id="mobileMenuBtn" class="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors" aria-label="Toggle menu">
          <svg id="menuIcon" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          <svg id="closeIcon" class="w-5 h-5 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>

      <!-- Mobile Menu -->
      <div id="mobileMenu" class="hidden md:hidden mt-4 pt-4 border-t border-gray-200 space-y-2">
        <a href="#home" class="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors">Home</a>
        ${business.description ? `<a href="#about" class="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors">About</a>` : ''}
        ${business.services && business.services.length > 0 ? `<a href="#services" class="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors">Services</a>` : ''}
        ${business.imagesUrl && business.imagesUrl.length > 0 ? `<a href="#gallery" class="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors">Gallery</a>` : ''}
        <a href="#contact" class="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors">Contact</a>
        <div class="flex gap-2 pt-2">
          ${business.mobile ? `
            <a href="tel:${escapeHtml(business.mobile)}" class="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl text-center font-bold hover:bg-blue-700 transition-colors">
              <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
              Call
            </a>
          ` : ''}
          <button onclick="shareBusiness()" class="flex-1 px-4 py-3 bg-purple-600 text-white rounded-xl text-center font-bold hover:bg-purple-700 transition-colors">
            <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
            Share
          </button>
        </div>
      </div>
    </div>
  </nav>

  <!-- Main Content -->
  <main class="w-full pb-20 md:pb-0">
      <section id="home" class="relative min-h-[90vh] flex items-center pt-24 pb-12 overflow-hidden bg-blue-600">
        <div class="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-600"></div>
        <div class="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-white/10 to-transparent skew-x-12 translate-x-1/4"></div>
        
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div class="space-y-8 text-center lg:text-left">
              <div class="space-y-4">
                <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white text-sm font-black uppercase tracking-widest animate-fade-in border border-white/20">
                  <span class="relative flex h-2 w-2">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                  </span>
                  ${escapeHtml(business.category || 'Premium Service')}
                </div>
                <h1 class="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-[1.1] tracking-tight">
                  <span class="block">${escapeHtml(business.businessName)}</span>
                  <span class="opacity-90">Varanasi's Finest</span>
                </h1>
                <p class="text-lg md:text-xl text-blue-50 font-medium max-w-xl mx-auto lg:mx-0 leading-relaxed">
                  ${escapeHtml(business.navbarTagline || 'Experience excellence in every detail. Your trusted partner in Varanasi for premium services.')}
                </p>
              </div>

              <div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                ${business.mobile ? `
                  <a href="tel:${escapeHtml(business.mobile)}" class="inline-flex items-center justify-center gap-3 px-10 py-5 bg-white text-blue-600 rounded-2xl font-black text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all transform active:scale-95 group">
                    <svg class="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                    Book Now
                  </a>
                ` : ''}
                <a href="#about" class="inline-flex items-center justify-center gap-3 px-10 py-5 bg-white/10 text-white border-2 border-white/20 rounded-2xl font-black text-lg hover:bg-white/20 transition-all transform hover:-translate-y-1 active:scale-95 backdrop-blur-md">
                  Learn More
                </a>
              </div>
            </div>

            <div class="relative lg:block">
              <div class="absolute -inset-4 bg-gradient-to-tr ${theme.primary} rounded-[40px] opacity-10 blur-2xl animate-pulse"></div>
              <div class="relative bg-white rounded-[40px] shadow-2xl border-4 border-white overflow-hidden aspect-[4/3]">
                <img src="${business.imagesUrl && business.imagesUrl[0] ? escapeHtml(business.imagesUrl[0]) : 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2070&auto=format&fit=crop'}" 
                     alt="${escapeHtml(business.businessName)}" 
                     class="w-full h-full object-cover transform hover:scale-105 transition-transform duration-1000" />
                
                <div class="absolute bottom-6 left-6 right-6 grid grid-cols-2 gap-4">
                  <div class="bg-white/90 backdrop-blur-md p-5 rounded-3xl shadow-lg border border-white/50 transform hover:-translate-y-1 transition-transform">
                    <div class="flex items-center gap-3 mb-1">
                      <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      </div>
                      <span class="text-xs font-black text-gray-400 uppercase tracking-widest">Opening</span>
                    </div>
                    <p class="text-sm font-bold text-gray-900">${(() => {
      const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      const hours = business.businessHours && business.businessHours[today];
      return hours && hours.open ? `${hours.start} - ${hours.end}` : "Open Daily";
    })()}</p>
                  </div>
                  <div class="bg-white/90 backdrop-blur-md p-5 rounded-3xl shadow-lg border border-white/50 transform hover:-translate-y-1 transition-transform">
                    <div class="flex items-center gap-3 mb-1">
                      <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                      </div>
                      <span class="text-xs font-black text-gray-400 uppercase tracking-widest">Location</span>
                    </div>
                    <p class="text-sm font-bold text-gray-900 truncate">${escapeHtml(business.address || 'Varanasi, UP')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white to-transparent"></div>
      </section>


      <!-- Amenities & Features Section -->
      ${(business.amenities?.length || business.paymentMethods?.length || business.parkingInfo?.length) ? `
      <section class="py-12 md:py-16 bg-white border-t border-gray-100">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 class="text-3xl md:text-4xl font-black text-gray-900 mb-8 md:mb-12 text-center">
            Amenities & <span class="bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent">Features</span>
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <!-- Amenities -->
            ${business.amenities?.length ? `
            <div class="bg-gray-50 rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm">
              <div class="flex items-center gap-3 mb-6">
                <div class="w-10 h-10 ${theme.accent.replace('text-', 'bg-')}/10 ${theme.accent} rounded-lg flex items-center justify-center">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h3 class="text-xl font-bold text-gray-900">Amenities</h3>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                ${business.amenities.map(item => `
                  <div class="flex items-center gap-2 text-sm text-gray-600">
                    <span class="w-1.5 h-1.5 ${theme.primarySolid.replace('bg-', 'bg-')} rounded-full"></span>
                    ${escapeHtml(item)}
                  </div>
                `).join('')}
              </div>
            </div>
            ` : ''}

            <!-- Payment Methods -->
            ${business.paymentMethods?.length ? `
            <div class="bg-gray-50 rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm">
              <div class="flex items-center gap-3 mb-6">
                <div class="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                </div>
                <h3 class="text-xl font-bold text-gray-900">Payment Modes</h3>
              </div>
              <div class="flex flex-wrap gap-2">
                ${business.paymentMethods.map(mode => `
                  <span class="px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 shadow-sm">
                    ${escapeHtml(mode)}
                  </span>
                `).join('')}
              </div>
            </div>
            ` : ''}

            <!-- Parking & Others -->
            ${business.parkingInfo?.length ? `
            <div class="bg-gray-50 rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm">
              <div class="flex items-center gap-3 mb-6">
                <div class="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <h3 class="text-xl font-bold text-gray-900">Parking & More</h3>
              </div>
              <div class="space-y-3">
                ${business.parkingInfo.map(info => `
                  <div class="flex items-center gap-2 text-sm text-gray-600">
                    <svg class="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                    ${escapeHtml(info)}
                  </div>
                `).join('')}
              </div>
            </div>
            ` : ''}
          </div>
        </div>
      </section>
      ` : ''}

      <!-- Gallery -->
      ${business.imagesUrl && business.imagesUrl.length > 0 ? `
      <section id="gallery" class="py-12 bg-white border-y border-gray-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-12">
            <div class="inline-block px-4 py-2 rounded-full ${theme.accent.replace('text-', 'bg-')}/10 ${theme.accent} text-sm font-bold mb-4">
              Our Showcase
            </div>
            <h2 class="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-6 font-primary uppercase tracking-tight">Our Gallery</h2>
            <div class="h-1.5 w-24 ${theme.primarySolid.replace('bg-', 'bg-')} mx-auto rounded-full"></div>
          </div>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            ${(business.imagesUrl || []).map((img, idx) => `
              <div class="group relative aspect-square overflow-hidden rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-500 cursor-pointer" onclick="openLightbox(${idx})">
                <img src="${escapeHtml(img)}" 
                     alt="Business Image ${idx + 1}" 
                     class="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 loading-shimmer" 
                     loading="lazy" />
                <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                  <div class="text-white">
                    <div class="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-2">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path></svg>
                    </div>
                    <p class="text-xs font-black uppercase tracking-widest">View Full</p>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </section>
      ` : ''}

      <!-- Enhanced Services Section -->
      ${business.services && business.services.length > 0 ? `
      <section id="services" class="py-12 md:py-20 bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-12 md:mb-16">
            <h2 class="text-3xl md:text-5xl font-black text-gray-900 mb-4">
              Our <span class="bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent">Services</span>
            </h2>
            <div class="w-24 h-2 bg-gradient-to-r ${theme.primary} mx-auto rounded-full"></div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            ${business.services.map((service, index) => `
              <div class="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border-2 ${service.featured ? 'border-yellow-400 ring-4 ring-yellow-50' : 'border-gray-100 hover:border-blue-200'} flex flex-col h-full transform hover:-translate-y-2">
                <div class="relative h-64 overflow-hidden">
                  ${service.imageUrl ? `
                    <img src="${escapeHtml(service.imageUrl)}" alt="${escapeHtml(service.title || service.name)}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  ` : `
                    <div class="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                      <svg class="w-16 h-16 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-1.343 3-3s-1.343-3-3-3m0 12c-1.657 0-3-1.343-3-3s1.343-3 3-3m-3-3a3 3 0 100-6 3 3 0 000 6zm6 6a3 3 0 100-6 3 3 0 000 6z"></path></svg>
                    </div>
                  `}
                  ${service.featured ? `
                    <div class="absolute top-4 left-4 px-4 py-2 bg-yellow-400 text-yellow-900 text-xs font-black rounded-full shadow-lg flex items-center gap-2">
                      <span class="animate-pulse">⭐</span> FEATURED
                    </div>
                  ` : ''}
                  <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                    <button onclick="openServiceInquiry('${escapeHtml(service.title || service.name)}')" class="w-full py-3 bg-white text-gray-900 rounded-xl font-bold shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                      Inquire Now
                    </button>
                  </div>
                </div>
                
                <div class="p-8 flex flex-col flex-1">
                  <h3 class="text-2xl font-black text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">${escapeHtml(service.title || service.name)}</h3>
                  <p class="text-gray-600 leading-relaxed mb-6 flex-1 line-clamp-3">${escapeHtml(service.description || '')}</p>
                  ${service.price ? `
                    <div class="flex items-center justify-between pt-6 border-t border-gray-100">
                      <div>
                        <p class="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Starting from</p>
                        <p class="text-3xl font-black text-blue-600">₹${escapeHtml(service.price)}</p>
                      </div>
                      <div class="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                      </div>
                    </div>
                  ` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </section>
      ` : ''}


  ${business.specialOffers && business.specialOffers.length > 0 ? `
      <section id="offers" class="py-12 md:py-20 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 relative overflow-hidden">
        <div class="absolute inset-0 opacity-5">
          <div class="absolute top-0 left-0 w-64 h-64 bg-red-500 rounded-full blur-[100px]"></div>
          <div class="absolute bottom-0 right-0 w-64 h-64 bg-yellow-500 rounded-full blur-[100px]"></div>
        </div>

        <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-12 md:mb-16">
            <h2 class="text-3xl md:text-5xl font-black text-gray-900 mb-4">
              Special <span class="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">Offers</span>
            </h2>
            <p class="text-gray-600 font-bold uppercase tracking-widest text-sm">Limited Time Opportunities</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
            ${business.specialOffers.map((offer, index) => {
      const daysLeft = offer.expiryDate ? Math.ceil((new Date(offer.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)) : null;
      const isUrgent = daysLeft !== null && daysLeft <= 3 && daysLeft > 0;
      const isExpired = daysLeft !== null && daysLeft <= 0;

      return `
                <div class="group relative bg-white rounded-3xl p-8 md:p-10 shadow-xl border-2 transition-all duration-300 transform hover:-translate-y-2 ${isUrgent ? 'border-red-400 ring-8 ring-red-50' : isExpired ? 'border-gray-200 opacity-60' : 'border-orange-200 hover:border-orange-400'}">
                  ${isUrgent ? `
                    <div class="absolute -top-4 -right-4 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-2 rounded-2xl shadow-xl transform rotate-12 flex items-center gap-2">
                       <span class="animate-pulse">⚡</span> <span class="font-black text-sm uppercase tracking-tighter">URGENT</span>
                    </div>
                  ` : ''}
                  
                  ${isExpired ? `
                    <div class="absolute -top-4 -right-4 bg-gray-600 text-white px-6 py-2 rounded-2xl shadow-xl transform rotate-12">
                       <span class="font-black text-sm uppercase tracking-tighter">EXPIRED</span>
                    </div>
                  ` : ''}

                  <div class="flex items-start gap-6 mb-8">
                    <div class="w-16 h-16 ${isUrgent ? 'bg-red-50 text-red-600' : isExpired ? 'bg-gray-50 text-gray-400' : 'bg-orange-50 text-orange-600'} rounded-2xl flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform">
                      <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"></path></svg>
                    </div>
                    <div>
                      <h3 class="text-2xl md:text-3xl font-black text-gray-900 mb-2">${escapeHtml(offer.title)}</h3>
                      <p class="text-gray-600 leading-relaxed">${escapeHtml(offer.description || '')}</p>
                    </div>
                  </div>

                  ${offer.expiryDate ? `
                    <div class="flex items-center justify-between p-6 ${isUrgent ? 'bg-red-50' : isExpired ? 'bg-gray-100' : 'bg-orange-50'} rounded-2xl border ${isUrgent ? 'border-red-100' : 'border-orange-100'}">
                      <div class="flex items-center gap-3">
                        <svg class="w-5 h-5 ${isUrgent ? 'text-red-500' : 'text-orange-500'}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <span class="font-bold text-gray-700 text-sm">
                          ${isExpired ? 'Offer Ended' : `Expires: ${new Date(offer.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                        </span>
                      </div>
                      ${!isExpired ? `
                        <div class="px-4 py-1 rounded-full font-black text-xs uppercase tracking-widest ${isUrgent ? 'bg-red-200 text-red-700 animate-pulse' : 'bg-orange-200 text-orange-700'}">
                          ${daysLeft} Days Left
                        </div>
                      ` : ''}
                    </div>
                  ` : ''}
                </div>
              `;
    }).join('')}
          </div>
        </div>
      </section>
      ` : ''
    }


  ${youtubeVideos.length > 0 ? `
      <section id="video" class="py-8 sm:py-12 md:py-20 bg-white px-4 sm:px-6 lg:px-8">
        <div class="max-w-7xl mx-auto">
          <div class="text-center mb-8 sm:mb-12 md:mb-16">
            <div class="inline-block px-3 sm:px-4 py-1.5 sm:py-2 rounded-full ${theme.accent.replace('text-', 'bg-')}/10 ${theme.accent} text-xs sm:text-sm font-bold mb-3 sm:mb-4">
              Watch Our Videos
            </div>
            <h2 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-4 sm:mb-6">Our Video Tour</h2>
            <div class="h-1 sm:h-1.5 w-20 sm:w-24 ${theme.primarySolid.replace('bg-', 'bg-')} mx-auto rounded-full"></div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 max-w-7xl mx-auto">
            ${youtubeVideos.map((video, index) => {
              const videoId = getYouTubeId(video);
              if (!videoId) return '';
              return `
                <div class="aspect-video rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden shadow-xl sm:shadow-2xl border-2 sm:border border-gray-100">
                  <iframe 
                    width="100%" 
                    height="100%" 
                    src="https://www.youtube.com/embed/${escapeHtml(videoId)}" 
                    title="YouTube video player ${index + 1}" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen
                    referrerpolicy="strict-origin-when-cross-origin">
                  </iframe>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </section>
      ` : ''}


      <section id="reviews" class="py-12 md:py-20 bg-gray-50 border-y border-gray-100/50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-12 md:mb-16">
            <div class="inline-block px-4 py-2 rounded-full ${theme.accent.replace('text-', 'bg-')}/10 ${theme.accent} text-sm font-bold mb-4">
              Testimonials
            </div>
            <h2 class="text-3xl md:text-5xl font-black text-gray-900 mb-6">
              What Our <span class="bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent">Clients Say</span>
            </h2>
            <div class="w-24 h-2 bg-gradient-to-r ${theme.primary} mx-auto rounded-full"></div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            <!-- Summary Card -->
            <div class="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-gray-100 flex flex-col items-center text-center relative overflow-hidden group h-full">
              <div class="absolute inset-0 bg-gradient-to-br ${theme.primary} opacity-0 group-hover:opacity-[0.02] transition-opacity duration-500"></div>
              <div class="text-6xl font-black text-gray-900 mb-2">${business.googlePlacesData?.rating || '4.9'}</div>
              <div class="flex gap-1 mb-4">
                ${[1, 2, 3, 4, 5].map(i => `<svg class="w-5 h-5 ${i <= Math.round(business.googlePlacesData?.rating || 4.9) ? 'text-yellow-400 fill-current' : 'text-gray-200 fill-current'}" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>`).join('')}
              </div>
              <p class="text-gray-500 font-bold uppercase tracking-wider text-[10px]">Verified Customer Satisfaction</p>
              
              <div class="mt-10 space-y-3 w-full">
                ${[5, 4, 3, 2, 1].map(star => `
                  <div class="flex items-center gap-4">
                    <span class="text-xs font-black text-gray-400 w-3">${star}</span>
                    <div class="flex-1 h-2 bg-gray-50 rounded-full overflow-hidden">
                      <div class="h-full bg-yellow-400 rounded-full" style="width: ${star === 5 ? '92' : star === 4 ? '6' : '2'}%"></div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Review Carousel -->
            <div class="lg:col-span-2 relative h-full">
              <div class="overflow-hidden h-full">
                <div id="review-carousel" class="flex transition-transform duration-500 ease-in-out h-full items-stretch">
                  ${(business.googlePlacesData?.reviews || business.reviews || [
      { author: 'Rahul Sharma', rating: 5, text: 'Excellent service! The team was professional and the results exceeded my expectations. Highly recommend!', relativeTimeDescription: '2 days ago' },
      { author: 'Priya Verma', rating: 5, text: 'Great experience from start to finish. Very communicative and skilled at what they do.', relativeTimeDescription: '1 week ago' },
      { author: 'Amit Singh', rating: 5, text: 'Best in the business! Quality is top-notch and prices are very reasonable.', relativeTimeDescription: '3 weeks ago' }
    ]).slice(0, 6).map((review, idx) => `
                    <div class="min-w-full px-2 h-full">
                      <div class="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 flex flex-col h-full relative overflow-hidden group">
                        <div class="absolute top-0 right-0 p-8 text-gray-100 group-hover:text-gray-200 transition-colors opacity-30">
                          <svg class="w-16 h-16" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19C19.5523 16 20 15.5523 20 15V9C20 8.44772 19.5523 8 19 8H15C14.4477 8 14 7.55228 14 7V5C14 4.44772 14.4477 4 15 4H20C21.1046 4 22 4.89543 22 6V15C22 18.3137 19.3137 21 16 21H14.017ZM4.017 21L4.017 18C4.017 16.8954 4.91243 16 6.017 16H9C9.55228 16 10 15.5523 10 15V9C10 8.44772 9.55228 8 9 8H5C4.44772 8 4 7.55228 4 7V5C4 4.44772 4.44772 4 5 4H10C11.1046 4 12 4.89543 12 6V15C12 18.3137 9.31371 21 6 21H4.017Z"/></svg>
                        </div>
                        <div class="flex items-center gap-5 mb-8 relative">
                          <div class="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-black text-xl shadow-sm">
                            ${escapeHtml((review.author || review.name || 'G').charAt(0))}
                          </div>
                          <div>
                            <h4 class="text-xl font-black text-gray-900">${escapeHtml(review.author || review.name)}</h4>
                            <div class="flex gap-1 mt-1">
                              ${[1, 2, 3, 4, 5].map(s => `<svg class="w-4 h-4 ${s <= (review.rating || 5) ? 'text-yellow-400 fill-current' : 'text-gray-200'}" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>`).join('')}
                            </div>
                          </div>
                        </div>
                        <p class="text-lg text-gray-600 leading-relaxed italic relative mb-6">"${escapeHtml(review.text || review.comment || '')}"</p>
                        <span class="text-sm text-gray-400 font-bold uppercase tracking-widest mt-auto">${escapeHtml(review.relativeTimeDescription || review.date || 'Customer')}</span>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
              
              <!-- Carousel Controls -->
              <div class="flex justify-center gap-3 mt-8">
                ${(business.googlePlacesData?.reviews || business.reviews || [1, 2, 3]).slice(0, 6).map((_, idx) => `
                  <button onclick="scrollReview(${idx})" class="w-3 h-3 rounded-full transition-all duration-300 review-dot ${idx === 0 ? 'bg-blue-600 scale-125' : 'bg-gray-200 hover:bg-gray-300'}"></button>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      </section>


  ${business.appointmentSettings && business.appointmentSettings.enabled ? `
      <section id="appointments" class="py-12 bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 items-center">
            <div class="space-y-8">
              <div class="space-y-4">
                <h2 class="text-3xl md:text-5xl font-black text-gray-900 leading-tight">
                  Ready to Experience <span class="bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent">Excellence?</span>
                </h2>
                <div class="w-24 h-2 bg-gradient-to-r ${theme.primary} rounded-full"></div>
              </div>
              <p class="text-lg text-gray-600 leading-relaxed">
                Book your personalized session today. Our experts are ready to provide you with the best service in Varanasi. Quick, easy, and guaranteed satisfaction.
              </p>
              <div class="space-y-4">
                <div class="flex items-center gap-4 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                  <div class="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-600">⚡</div>
                  <p class="font-bold text-blue-900 text-sm">Instant Confirmation</p>
                </div>
                <div class="flex items-center gap-4 p-4 bg-green-50 rounded-2xl border border-green-100">
                  <div class="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-green-600">🛡️</div>
                  <p class="font-bold text-green-900 text-sm">Verified Professional Service</p>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-[40px] shadow-2xl border border-gray-100 p-8 md:p-10 relative overflow-hidden group">
              <div class="absolute -top-20 -right-20 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50 group-hover:scale-110 transition-transform duration-700"></div>
              
              <div id="appointment-booking-form" class="relative">
                <form id="appointment-form" class="space-y-6">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="space-y-2">
                      <label class="text-sm font-black text-gray-700 uppercase tracking-wider ml-1">Your Name</label>
                      <input type="text" id="customer-name" required class="w-full px-6 py-4 bg-gray-50 border-2 border-gray-50 rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all" placeholder="John Doe">
                    </div>
                    <div class="space-y-2">
                      <label class="text-sm font-black text-gray-700 uppercase tracking-wider ml-1">Phone Number</label>
                      <input type="tel" id="customer-phone" required class="w-full px-6 py-4 bg-gray-50 border-2 border-gray-50 rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all" placeholder="+91 00000 00000">
                    </div>
                  </div>

                  <div class="space-y-2">
                    <label class="text-sm font-black text-gray-700 uppercase tracking-wider ml-1">Preferred Date</label>
                    <input type="date" id="appointment-date" required class="w-full px-6 py-4 bg-gray-50 border-2 border-gray-50 rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all" min="${new Date().toISOString().split('T')[0]}">
                  </div>

                  <div id="time-selection-container" class="space-y-4" style="display: none;">
                    <label class="text-sm font-black text-gray-700 uppercase tracking-wider ml-1">Select Time Slot</label>
                    <div id="slots-loading" class="text-center py-4 hidden">
                      <div class="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    </div>
                    <div id="available-slots" class="grid grid-cols-3 sm:grid-cols-4 gap-3"></div>
                    <p id="no-slots" class="text-center py-4 text-red-500 font-bold hidden text-sm">No slots available for this date.</p>
                  </div>

                  <div class="space-y-2">
                    <label class="text-sm font-black text-gray-700 uppercase tracking-wider ml-1">Additional Notes</label>
                    <textarea id="appointment-notes" rows="3" class="w-full px-6 py-4 bg-gray-50 border-2 border-gray-50 rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all resize-none" placeholder="Any special requests?"></textarea>
                  </div>

                  <button type="submit" id="submit-appointment" class="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:bg-blue-700 hover:shadow-blue-200 transition-all transform hover:-translate-y-1 active:scale-95">
                    Confirm Booking
                  </button>
                </form>
              </div>

              <div id="appointment-success" class="hidden text-center py-10 relative">
                <div class="w-24 h-24 bg-green-100 rounded-[32px] flex items-center justify-center mx-auto mb-6 shadow-green-100 shadow-xl">
                  <svg class="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h3 class="text-3xl font-black text-gray-900 mb-2">Wonderful!</h3>
                <p class="text-gray-500 mb-8 font-medium">Your request has been received. Our team will contact you shortly.</p>
                <button onclick="window.location.reload()" class="px-10 py-4 bg-gray-900 text-white rounded-2xl font-black hover:bg-black transition-all shadow-xl">Great, Thanks!</button>
              </div>
            </div>
          </div>
        </div>
      </section>
      ` : ''
    }




    }

  ${business.faqs && business.faqs.length > 0 ? `
      <section id="faq" class="py-12 bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div class="max-w-3xl mx-auto">
          <div class="text-center mb-12">
            <h2 class="text-3xl sm:text-4xl font-black text-gray-900 mb-4 text-center">Common Questions</h2>
            <div class="h-1.5 w-24 ${theme.primarySolid.replace('bg-', 'bg-')} mx-auto rounded-full"></div>
          </div>
          <div class="space-y-4">
            ${business.faqs.map((faq, index) => `
              <div class="faq-item bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300">
                <button class="faq-question w-full px-8 py-6 text-left flex items-center justify-between group" onclick="toggleFaq(${index})">
                  <span class="font-bold text-lg text-gray-900 group-hover:${theme.accent} transition-colors">${escapeHtml(faq.question || '')}</span>
                  <div class="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center transition-transform duration-300 faq-icon-box">
                    <svg class="w-5 h-5 text-gray-400 faq-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </button>
                <div class="faq-answer hidden px-8 pb-8 text-gray-600 leading-relaxed">
                  ${escapeHtml(faq.answer || '')}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </section>
      ` : ''
    }



    </main>

      <div id="pullToRefresh" class="fixed top-0 left-0 w-full h-16 flex items-center justify-center -translate-y-full z-[100] transition-transform duration-300">
        <div class="bg-white p-3 rounded-full shadow-xl border border-gray-100 flex items-center gap-3">
          <svg class="w-6 h-6 animate-spin ${theme.accent}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
          <span class="text-sm font-black text-gray-900">Refreshing...</span>
        </div>
      </div>
      <footer id="contact" class="relative pt-20 pb-12 overflow-hidden bg-blue-600">
        <div class="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-600"></div>
        <div class="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-white/10 to-transparent skew-x-12 translate-x-1/4"></div>
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <!-- Brand Column -->
            <div class="space-y-6">
              <div class="flex items-center gap-3">
                ${business.logoUrl ? `
                  <img src="${escapeHtml(business.logoUrl)}" alt="${escapeHtml(business.businessName)}" class="w-12 h-12 rounded-xl object-contain bg-white p-1" />
                ` : `
                  <div class="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center font-bold text-xl text-white shadow-lg border border-white/20">
                    ${escapeHtml(business.businessName.charAt(0).toUpperCase())}
                  </div>
                `}
                <span class="text-xl font-black tracking-tight text-white">${escapeHtml(business.businessName)}</span>
              </div>
              <p class="text-blue-50 text-sm leading-relaxed">
                ${business.description ? escapeHtml(business.description.substring(0, 120)) + (business.description.length > 120 ? '...' : '') : `Connecting businesses with customers through premium digital experiences.`}
              </p>
              <div class="flex gap-4">
                ${[
      { key: 'facebook', icon: '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>' },
      { key: 'instagram', icon: '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.332 3.608 1.308.975.975 1.247 2.242 1.308 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.332 2.633-1.308 3.608-.975.975-2.242 1.247-3.608 1.308-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.332-3.608-1.308-.975-.975-1.247-2.242-1.308-3.608-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.062-1.366.332-2.633 1.308-3.608.975-.975 2.242-1.247 3.608-1.308 1.266-.058 1.646-.07 4.85-.07m0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>' }
    ].map(social => business[social.key] ? `
                  <a href="${escapeHtml(business[social.key])}" target="_blank" class="w-10 h-10 bg-white/10 text-white rounded-xl flex items-center justify-center hover:bg-white/20 hover:scale-110 transition-all shadow-lg backdrop-blur-sm border border-white/10">
                    ${social.icon}
                  </a>
                ` : '').join('')}
              </div>
            </div>

            <!-- Services Column -->
            <div>
              <h4 class="text-white font-bold mb-6">Our Services</h4>
              <ul class="space-y-3 text-sm text-blue-100">
                ${(business.services || []).slice(0, 5).map(service => `
                  <li><a href="#services" class="hover:text-white transition-colors capitalize">${escapeHtml(service.name)}</a></li>
                `).join('')}
              </ul>
            </div>

            <!-- Quick Links -->
            <div>
              <h4 class="text-white font-bold mb-6">Quick Links</h4>
              <ul class="space-y-3 text-sm text-blue-100">
                <li><a href="#about" class="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#gallery" class="hover:text-white transition-colors">Photo Gallery</a></li>
                <li><a href="#reviews" class="hover:text-white transition-colors">Customer Reviews</a></li>
                <li><a href="#faq" class="hover:text-white transition-colors">FAQs</a></li>
              </ul>
            </div>

            <!-- Contact Column -->
            <div>
              <h4 class="text-white font-bold mb-6">Get In Touch</h4>
              <ul class="space-y-4 text-sm text-blue-100">
                ${(business.mobile || business.mobileNumber) ? `
                  <li class="flex items-start gap-3">
                    <svg class="w-5 h-5 text-white shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                    <a href="tel:${escapeHtml(business.mobile || business.mobileNumber)}" class="hover:text-white transition-colors">${escapeHtml(business.mobile || business.mobileNumber)}</a>
                  </li>
                ` : ''}
                ${business.email ? `
                  <li class="flex items-start gap-3">
                    <svg class="w-5 h-5 text-white shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                    <a href="mailto:${escapeHtml(business.email)}" class="hover:text-white transition-colors break-all">${escapeHtml(business.email)}</a>
                  </li>
                ` : ''}
                ${business.address ? `
                  <li class="flex items-start gap-3">
                    <svg class="w-5 h-5 text-white shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    <span>${escapeHtml(business.address)}</span>
                  </li>
                ` : ''}
              </ul>
            </div>
          </div>


          <div class="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-blue-100 font-medium">
            <p>© ${new Date().getFullYear()} ${escapeHtml(business.businessName)}. All rights reserved.</p>
            <div class="flex items-center gap-1">
              Crafted with <svg class="w-3 h-3 text-red-400 fill-current" viewBox="0 0 20 20"><path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"></path></svg> by <a href="https://varanasihub.com" target="_blank" class="text-white hover:underline font-bold">VaranasiHub</a>
            </div>
          </div>
        </div>
      </footer>




      <div class="fixed bottom-6 right-6 z-40 flex flex-col gap-3 floating-actions">
        ${(business.mobile || business.mobileNumber) ? `
          <a href="tel:${escapeHtml(business.mobile || business.mobileNumber)}" class="w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all duration-300">
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
          </a>
        ` : ''}
        ${(business.whatsapp || business.whatsappNumber || business.mobile || business.mobileNumber) ? `
          <a href="https://wa.me/${escapeHtml((business.whatsapp || business.whatsappNumber || business.mobile || business.mobileNumber).replace(/\D/g, ''))}" target="_blank" rel="noopener noreferrer" class="w-14 h-14 bg-green-500 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all duration-300">
            <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
          </a>
        ` : ''}
      </div>


      <div id="lightbox" class="fixed inset-0 bg-black/95 z-[100] hidden flex flex-col backdrop-blur-sm" onclick="closeLightboxOnBackdrop(event)">
        <div class="flex items-center justify-between p-4 md:p-8 text-white relative z-10">
          <div class="flex items-center gap-4">
            <span id="lightbox-counter" class="text-xs font-black uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full">0 / 0</span>
            <h4 class="text-sm font-bold truncate max-w-[200px] hidden sm:block">${escapeHtml(business.businessName)}</h4>
          </div>
          <button onclick="closeLightbox()" class="group p-2 hover:bg-white/10 rounded-full transition-all">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <div class="flex-1 flex items-center justify-center p-4 relative">
          <img id="lightbox-img" class="max-w-full max-h-full object-contain rounded-lg shadow-2xl transition-transform duration-300" src="" alt="Gallery Image" />

          <!-- Navigation Arrows -->
          <button onclick="changeLightboxImage(-1)" class="absolute left-4 p-4 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all group">
            <svg class="w-10 h-10 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
          </button>
          <button onclick="changeLightboxImage(1)" class="absolute right-4 p-4 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all group">
            <svg class="w-10 h-10 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
          </button>
        </div>
      </div>

      <script>
        // Global State
        let currentLightboxIdx = 0;
        const galleryImages = ${JSON.stringify(business.imagesUrl || [])};
        let currentReviewIdx = 0;

        // Mobile Menu Toggle
        function toggleMobileMenu() {
          const menu = document.getElementById('mobileMenu');
          const menuIcons = document.querySelectorAll('.menu-icon');
          if (menu) {
            menu.classList.toggle('hidden');
            menuIcons.forEach(icon => icon.classList.toggle('hidden'));
          }
        }

        // Scroll Logic (Sticky Header & Back to Top)
        window.addEventListener('scroll', () => {
          const header = document.querySelector('nav');
          const backToTop = document.getElementById('back-to-top');
          
          if (window.scrollY > 100) {
            header?.classList.add('shadow-xl', 'py-2');
            header?.classList.remove('py-4');
          } else {
            header?.classList.remove('shadow-xl', 'py-2');
            header?.classList.add('py-4');
          }
        });


        // Review Carousel Logic
        function scrollReview(idx) {
          const carousel = document.getElementById('review-carousel');
          const dots = document.querySelectorAll('.review-dot');
          if (carousel) {
            carousel.style.transform = 'translateX(-' + (idx * 100) + '%)';
            currentReviewIdx = idx;
            dots.forEach((dot, i) => {
              if (i === idx) {
                dot.classList.add('bg-blue-600', 'w-12');
                dot.classList.remove('bg-gray-300');
              } else {
                dot.classList.remove('bg-blue-600', 'w-12');
                dot.classList.add('bg-gray-300');
              }
            });
          }
        }

        // Auto-scroll Reviews
        setInterval(() => {
          const totalReviews = ${(business.reviews || [1, 2, 3]).length};
          currentReviewIdx = (currentReviewIdx + 1) % totalReviews;
          scrollReview(currentReviewIdx);
        }, 5000);

        // Lightbox Logic
        function openLightbox(idx) {
          const lightbox = document.getElementById('lightbox');
          const img = document.getElementById('lightbox-img');
          const counter = document.getElementById('lightbox-counter');
          
          if (lightbox && img && galleryImages.length > 0) {
            currentLightboxIdx = idx;
            img.src = galleryImages[idx];
            counter.textContent = (idx + 1) + ' / ' + galleryImages.length;
            lightbox.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
            trackEvent('gallery_view');
          }
        }

        function closeLightbox() {
          const lightbox = document.getElementById('lightbox');
          if (lightbox) {
            lightbox.classList.add('hidden');
            document.body.style.overflow = '';
          }
        }

        function closeLightboxOnBackdrop(e) {
          if (e.target.id === 'lightbox' || e.target.id === 'lightbox-img-container') {
            closeLightbox();
          }
        }

        function changeLightboxImage(dir) {
          currentLightboxIdx = (currentLightboxIdx + dir + galleryImages.length) % galleryImages.length;
          const img = document.getElementById('lightbox-img');
          const counter = document.getElementById('lightbox-counter');
          if (img && counter) {
            img.style.opacity = '0';
            setTimeout(() => {
              img.src = galleryImages[currentLightboxIdx];
              counter.textContent = (currentLightboxIdx + 1) + ' / ' + galleryImages.length;
              img.style.opacity = '1';
            }, 200)
          }
        }

        // FAQ Toggle
        function toggleFaq(idx) {
          const items = document.querySelectorAll('.faq-item');
          items.forEach((item, i) => {
            const answer = item.querySelector('.faq-answer');
            const icon = item.querySelector('.faq-icon');
            const box = item.querySelector('.faq-icon-box');

            if (i === idx) {
              const isHidden = answer.classList.contains('hidden');
              answer.classList.toggle('hidden');
              icon.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
              if (box) {
                box.classList.toggle('bg-blue-50');
                box.classList.toggle('text-blue-600');
              }
            } else {
              answer.classList.add('hidden');
              icon.style.transform = 'rotate(0deg)';
              if (box) {
                box.classList.remove('bg-blue-50', 'text-blue-600');
              }
            }
          });
        }

        // Inquiry Functions
        function openServiceInquiry(serviceName) {
          const contactSection = document.getElementById('contact');
          const messageArea = document.querySelector('textarea[name="message"]');
          if (contactSection && messageArea) {
            contactSection.scrollIntoView({ behavior: 'smooth' });
            messageArea.value = "I'm interested in the service: " + serviceName + ". Please provide more details.";
            messageArea.focus();
          }
        }

        function openOfferInquiry(offerName) {
          const contactSection = document.getElementById('contact');
          const messageArea = document.querySelector('textarea[name="message"]');
          if (contactSection && messageArea) {
            contactSection.scrollIntoView({ behavior: 'smooth' });
            messageArea.value = "I'd like to grab the special offer: " + offerName + ". How can I proceed?";
            messageArea.focus();
          }
        }

        // Contact Form Submission
        document.getElementById('contact-form')?.addEventListener('submit', async (e) => {
          e.preventDefault();
          const form = e.target;
          const btn = form.querySelector('button[type="submit"]');
          const successMsg = document.getElementById('contact-success');

          const formData = new FormData(form);
          const data = Object.fromEntries(formData.entries());

          btn.disabled = true;
          btn.textContent = 'Sending...';

          try {
            const businessSlug = '${business.slug}';
            const API_BASE_URL = '${apiUrl}';
            const response = await fetch(API_BASE_URL + '/ecommerce/' + businessSlug + '/contact', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
            });

            const result = await response.json();
            if (result.success) {
              successMsg.classList.remove('hidden');
              form.reset();
              setTimeout(() => successMsg.classList.add('hidden'), 5000);
            } else {
              alert(result.error || 'Failed to send message.');
            }
          } catch (err) {
            alert('Failed to send message. Please try again.');
          } finally {
            btn.disabled = false;
            btn.textContent = 'Send Message';
          }
        });

        // Share Functionality (Robust Fallback)
        async function shareBusiness() {
          const shareData = {
            title: '${escapeHtml(business.businessName)}',
            text: 'Check out ${escapeHtml(business.businessName)} on VaranasiHub!',
            url: window.location.href
          };

          if (navigator.share) {
            try {
              await navigator.share(shareData);
              trackEvent('share_success');
            } catch (err) {
              if (err.name !== 'AbortError') {
                copyFallback();
              }
            }
          } else {
            copyFallback();
          }

          function copyFallback() {
            navigator.clipboard.writeText(shareData.url).then(() => {
              const btn = event?.currentTarget;
              const originalContent = btn ? btn.innerHTML : null;
              if (btn) {
                btn.innerHTML = '<span class="text-xs">Link Copied!</span>';
                setTimeout(() => {
                  btn.innerHTML = originalContent;
                }, 2000);
              } else {
                alert('Link copied to clipboard!');
              }
              trackEvent('share_copy');
            }).catch(() => {
              alert('Please copy the URL from the browser bar.');
            });
          }
        }

        // Mobile Navigation Handling
        window.handleMobileNavClick = (e, targetId) => {
          e.preventDefault();
          const target = document.querySelector(targetId);
          if (target) {
            const headerHeight = 80;
            window.scrollTo({
              top: target.offsetTop - headerHeight,
              behavior: 'smooth'
            });
          }
        };

        // Analytics Tracking Logic
        const trackEvent = async (eventType) => {
          try {
            const businessId = ${business.id};
            const API_BASE_URL = '${apiUrl}';
            await fetch(API_BASE_URL + '/analytics/track', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ businessId, eventType })
            });
          } catch (err) {
            console.warn('Analytics error:', err);
          }
        };

        // Track page view
        window.addEventListener('load', () => trackEvent('visitor'));

        // Track clicks
        document.addEventListener('click', (e) => {
          const target = e.target.closest('a, button');
          if (!target) return;

          const href = target.getAttribute('href') || '';
          
          if (href.startsWith('tel:')) {
            trackEvent('call_click');
          } else if (href.includes('wa.me')) {
            trackEvent('whatsapp_click');
          } else if (href.includes('maps.google.com') || href.includes('maps.app.goo.gl') || target.innerText.toLowerCase().includes('view on maps')) {
            trackEvent('map_click');
          }
        });
      </script>
    </body >
  </html >
  `;
};
