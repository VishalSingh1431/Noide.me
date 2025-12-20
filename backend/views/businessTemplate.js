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
    const isDevelopment = process.env.NODE_ENV === 'development';
    const baseDomain = process.env.BASE_DOMAIN || 'varanasihub.com';
    apiUrl = isDevelopment 
      ? `http://localhost:${process.env.PORT || 5000}/api`
      : `https://${baseDomain}/api`;
  }
  // Helper function to get first name from full name
  const getFirstName = (fullName) => {
    if (!fullName) return '';
    return fullName.split(' ')[0];
  };
  
  const ownerFirstName = getFirstName(business.ownerName);
  
  // Theme configurations
  const themes = {
    modern: {
      primary: 'from-blue-600 via-indigo-600 to-purple-600',
      primarySolid: 'bg-blue-600',
      primaryHover: 'hover:bg-blue-700',
      secondary: 'bg-indigo-600',
      accent: 'text-purple-600',
      navBorder: 'border-blue-200',
      navBg: 'bg-white',
      button: 'bg-blue-600 hover:bg-blue-700',
      cardBg: 'bg-white',
      textPrimary: 'text-gray-900',
      textSecondary: 'text-gray-600',
      footer: 'from-gray-900 via-gray-800 to-gray-900',
    },
    classic: {
      primary: 'from-amber-600 via-orange-600 to-red-600',
      primarySolid: 'bg-amber-600',
      primaryHover: 'hover:bg-amber-700',
      secondary: 'bg-orange-600',
      accent: 'text-amber-600',
      navBorder: 'border-amber-200',
      navBg: 'bg-white',
      button: 'bg-amber-600 hover:bg-amber-700',
      cardBg: 'bg-white',
      textPrimary: 'text-gray-900',
      textSecondary: 'text-gray-600',
      footer: 'from-amber-900 via-orange-900 to-red-900',
    },
    minimal: {
      primary: 'from-gray-100 via-gray-200 to-gray-300',
      primarySolid: 'bg-gray-600',
      primaryHover: 'hover:bg-gray-700',
      secondary: 'bg-gray-500',
      accent: 'text-gray-600',
      navBorder: 'border-gray-200',
      navBg: 'bg-white',
      button: 'bg-gray-600 hover:bg-gray-700',
      cardBg: 'bg-white',
      textPrimary: 'text-gray-900',
      textSecondary: 'text-gray-600',
      footer: 'from-gray-800 via-gray-700 to-gray-800',
    },
  };

  const theme = themes[business.theme] || themes.modern;

  // Extract YouTube video ID from URL
  const getYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const videoId = getYouTubeId(business.youtubeVideo);
  const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : null;

  // Escape HTML to prevent XSS
  const escapeHtml = (text) => {
    if (!text) return '';
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  };

  // Generate SEO-friendly slug for URL
  const businessSlug = business.slug || business.businessName.toLowerCase().replace(/\s+/g, '-');
  const canonicalUrl = business.subdomainUrl || business.subdirectoryUrl || '';
  
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
        "name": business.category,
        "item": `https://varanasihub.com/category/${business.category.toLowerCase().replace(/\s+/g, '-')}`
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
  
  <!-- Alternate URLs (if subdomain and subdirectory both exist) -->
  ${business.subdomainUrl && business.subdirectoryUrl && business.subdomainUrl !== business.subdirectoryUrl ? `
  <link rel="alternate" href="${escapeHtml(business.subdomainUrl)}">
  <link rel="alternate" href="${escapeHtml(business.subdirectoryUrl)}">
  ` : ''}
  
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
    html { scroll-behavior: smooth; }
    * {
      cursor: default;
    }
    /* Custom Cursor Zoom Effect */
    body {
      cursor: default;
    }
    a, button, .cursor-zoom, img, .card-hover, .service-card, .gallery-item, .share-option {
      cursor: pointer;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    a:hover, button:hover, .cursor-zoom:hover, img:hover, .card-hover:hover, 
    .service-card:hover, .gallery-item:hover, .share-option:hover {
      transform: scale(1.05);
    }
    /* Professional Card Styles */
    .section-card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
      border: 1px solid #e5e7eb;
      transition: all 0.3s ease;
    }
    .section-card:hover {
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    }
    .service-card-item {
      background: white;
      border-radius: 12px;
      border: 1px solid #e5e7eb;
      transition: all 0.3s ease;
    }
    .service-card-item:hover {
      border-color: #3b82f6;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      transform: translateY(-2px);
    }
    /* Section Header Consistency */
    .section-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 32px;
    }
    .section-icon {
      width: 48px;
      height: 48px;
      background: #f3f4f6;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .section-title {
      font-size: 2rem;
      font-weight: 700;
      color: #111827;
      margin: 0;
    }
    @media (min-width: 768px) {
      .section-title {
        font-size: 2.5rem;
      }
    }
    /* Enhanced hover effects for interactive elements */
    .hover-zoom {
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease;
    }
    .hover-zoom:hover {
      transform: scale(1.08) translateY(-4px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    }
    .hover-zoom-sm {
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .hover-zoom-sm:hover {
      transform: scale(1.03);
    }
    .hover-zoom-lg {
      transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .hover-zoom-lg:hover {
      transform: scale(1.1) translateY(-8px);
    }
    /* Image handling - prevent overflow */
    img {
      max-width: 100%;
      height: auto;
      display: block;
      object-fit: cover;
    }
    .image-zoom-container {
      overflow: hidden;
      border-radius: 12px;
      width: 100%;
      height: 100%;
    }
    .image-zoom-container img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }
    .image-zoom-container img:hover {
      transform: scale(1.05);
    }
    /* Prevent horizontal overflow */
    body, html {
      overflow-x: hidden;
      max-width: 100vw;
    }
    main, section {
      max-width: 100%;
      overflow-x: hidden;
    }
    /* Container constraints */
    .max-w-7xl {
      max-width: 100%;
      width: 100%;
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
    /* Share Button */
    .share-button-widget {
      position: fixed;
      bottom: 90px;
      right: 20px;
      z-index: 9998;
    }
    .share-button-widget.has-edit-button {
      bottom: 160px;
    }
    .share-button-main {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
      border: none;
    }
    .share-button-main:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 25px rgba(102, 126, 234, 0.6);
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
    /* Share Modal */
    .share-modal {
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
    .share-modal.active {
      display: flex;
    }
    .share-modal-content {
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
    @keyframes modalSlideIn {
      from {
        opacity: 0;
        transform: translateY(-20px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
    .share-modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    .share-modal-title {
      font-size: 24px;
      font-weight: bold;
      color: #1F2937;
    }
    .share-modal-close {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #F3F4F6;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }
    .share-modal-close:hover {
      background: #E5E7EB;
      transform: rotate(90deg);
    }
    .share-options-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }
    .share-option {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 16px;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
      text-decoration: none;
      color: #374151;
    }
    .share-option:hover {
      background: #F9FAFB;
      transform: translateY(-2px);
    }
    .share-option-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
    }
    .share-option-label {
      font-size: 12px;
      font-weight: 600;
      text-align: center;
    }
    .share-whatsapp-icon { background: #25D366; }
    .share-facebook-icon { background: #1877F2; }
    .share-twitter-icon { background: #1DA1F2; }
    .share-linkedin-icon { background: #0077B5; }
    .share-telegram-icon { background: #0088CC; }
    .share-email-icon { background: #EA4335; }
    .share-reddit-icon { background: #FF4500; }
    .share-pinterest-icon { background: #BD081C; }
    .share-copy-icon { background: #6B7280; }
    .qr-code-section {
      background: #F9FAFB;
      border-radius: 16px;
      padding: 24px;
      text-align: center;
      margin-bottom: 24px;
    }
    .qr-code-container {
      background: white;
      padding: 20px;
      border-radius: 12px;
      display: inline-block;
      margin: 16px 0;
    }
    .qr-code-image {
      width: 200px;
      height: 200px;
      display: block;
    }
    .qr-code-text {
      font-size: 14px;
      color: #6B7280;
      margin-top: 12px;
    }
    .share-link-section {
      margin-bottom: 24px;
    }
    .share-link-input-group {
      display: flex;
      gap: 8px;
    }
    .share-link-input {
      flex: 1;
      padding: 12px 16px;
      border: 2px solid #E5E7EB;
      border-radius: 12px;
      font-size: 14px;
      outline: none;
      transition: all 0.2s ease;
    }
    .share-link-input:focus {
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
    .share-link-copy-btn {
      padding: 12px 24px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .share-link-copy-btn:hover {
      background: #5568d3;
    }
    .share-link-copy-btn.copied {
      background: #10B981;
    }
    @media (max-width: 640px) {
      .share-button-widget {
        bottom: 85px;
        right: 15px;
      }
      .share-button-widget.has-edit-button {
        bottom: 155px;
      }
      .share-button-main {
        width: 52px;
        height: 52px;
      }
      .share-modal-content {
        padding: 24px;
      }
      .share-options-grid {
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
      }
      .qr-code-image {
        width: 180px;
        height: 180px;
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

  <!-- Share Button Widget -->
  <div id="shareButtonWidget" class="share-button-widget">
    <button 
      onclick="openShareModal()"
      class="share-button-main"
      aria-label="Share Website"
      title="Share Website"
    >
      <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
      </svg>
    </button>
  </div>

  <!-- Share Modal -->
  <div id="shareModal" class="share-modal" onclick="closeShareModalOnBackdrop(event)">
    <div class="share-modal-content" onclick="event.stopPropagation()">
      <div class="share-modal-header">
        <h3 class="share-modal-title">Share ${escapeHtml(business.businessName)}</h3>
        <button onclick="closeShareModal()" class="share-modal-close" aria-label="Close">
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- Social Media Share Options -->
      <div class="share-options-grid">
        <a 
          href="https://wa.me/?text=${encodeURIComponent(`${escapeHtml(business.businessName)} - ${canonicalUrl}`)}" 
          target="_blank"
          rel="noopener noreferrer"
          class="share-option"
          onclick="trackShare('whatsapp')"
        >
          <div class="share-option-icon share-whatsapp-icon">
            <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
          </div>
          <span class="share-option-label">WhatsApp</span>
        </a>
        <a 
          href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(canonicalUrl)}" 
          target="_blank"
          rel="noopener noreferrer"
          class="share-option"
          onclick="trackShare('facebook')"
        >
          <div class="share-option-icon share-facebook-icon">
            <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </div>
          <span class="share-option-label">Facebook</span>
        </a>
        <a 
          href="https://twitter.com/intent/tweet?url=${encodeURIComponent(canonicalUrl)}&text=${encodeURIComponent(escapeHtml(business.businessName))}" 
          target="_blank"
          rel="noopener noreferrer"
          class="share-option"
          onclick="trackShare('twitter')"
        >
          <div class="share-option-icon share-twitter-icon">
            <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
            </svg>
          </div>
          <span class="share-option-label">Twitter</span>
        </a>
        <a 
          href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(canonicalUrl)}" 
          target="_blank"
          rel="noopener noreferrer"
          class="share-option"
          onclick="trackShare('linkedin')"
        >
          <div class="share-option-icon share-linkedin-icon">
            <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </div>
          <span class="share-option-label">LinkedIn</span>
        </a>
        <a 
          href="https://t.me/share/url?url=${encodeURIComponent(canonicalUrl)}&text=${encodeURIComponent(escapeHtml(business.businessName))}" 
          target="_blank"
          rel="noopener noreferrer"
          class="share-option"
          onclick="trackShare('telegram')"
        >
          <div class="share-option-icon share-telegram-icon">
            <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.559z"/>
            </svg>
          </div>
          <span class="share-option-label">Telegram</span>
        </a>
        <a 
          href="mailto:?subject=${encodeURIComponent(escapeHtml(business.businessName))}&body=${encodeURIComponent(`Check out ${escapeHtml(business.businessName)}: ${canonicalUrl}`)}" 
          class="share-option"
          onclick="trackShare('email')"
        >
          <div class="share-option-icon share-email-icon">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
          </div>
          <span class="share-option-label">Email</span>
        </a>
        <a 
          href="https://www.reddit.com/submit?url=${encodeURIComponent(canonicalUrl)}&title=${encodeURIComponent(escapeHtml(business.businessName))}" 
          target="_blank"
          rel="noopener noreferrer"
          class="share-option"
          onclick="trackShare('reddit')"
        >
          <div class="share-option-icon share-reddit-icon">
            <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
            </svg>
          </div>
          <span class="share-option-label">Reddit</span>
        </a>
        <a 
          href="https://pinterest.com/pin/create/button/?url=${encodeURIComponent(canonicalUrl)}&description=${encodeURIComponent(escapeHtml(business.businessName))}" 
          target="_blank"
          rel="noopener noreferrer"
          class="share-option"
          onclick="trackShare('pinterest')"
        >
          <div class="share-option-icon share-pinterest-icon">
            <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
            </svg>
          </div>
          <span class="share-option-label">Pinterest</span>
        </a>
        <button 
          onclick="copyShareLink()"
          class="share-option"
          style="border: none; background: none;"
        >
          <div class="share-option-icon share-copy-icon">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
            </svg>
          </div>
          <span class="share-option-label">Copy Link</span>
        </button>
      </div>

      <!-- QR Code Section -->
      <div class="qr-code-section">
        <h4 class="text-lg font-bold text-gray-900 mb-4">Scan QR Code</h4>
        <div class="qr-code-container">
          <img 
            id="qrCodeImage" 
            src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(canonicalUrl)}" 
            alt="QR Code for ${escapeHtml(business.businessName)}"
            class="qr-code-image"
          />
        </div>
        <p class="qr-code-text">Scan to visit our website</p>
        <button 
          onclick="downloadQRCode()"
          class="mt-4 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          Download QR Code
        </button>
      </div>

      <!-- Link Share Section -->
      <div class="share-link-section">
        <h4 class="text-lg font-bold text-gray-900 mb-4">Share Link</h4>
        <div class="share-link-input-group">
          <input 
            type="text" 
            id="shareLinkInput" 
            value="${canonicalUrl}" 
            readonly
            class="share-link-input"
          />
          <button 
            onclick="copyShareLink()"
            id="copyShareBtn"
            class="share-link-copy-btn"
          >
            Copy
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- WhatsApp Chat Widget -->
  ${(business.whatsapp || business.mobile) ? `
  <div id="whatsappWidget" class="whatsapp-widget" style="position: fixed !important; bottom: 20px !important; right: 20px !important; z-index: 99999 !important; display: block !important; visibility: visible !important;">
    <a 
      href="https://wa.me/${escapeHtml((business.whatsapp || business.mobile || '').replace(/[^0-9]/g, ''))}" 
      target="_blank"
      rel="noopener noreferrer"
      class="whatsapp-widget-button"
      aria-label="Chat on WhatsApp"
      title="Chat on WhatsApp"
    >
      <svg class="whatsapp-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" fill="currentColor"/>
      </svg>
    </a>
  </div>
  ` : ''}
  
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
              const whatsappWidget = document.getElementById('whatsappWidget');
              if (whatsappWidget) {
                whatsappWidget.classList.add('has-edit-button');
              }
              // Adjust share button widget position if edit button is visible
              const shareButtonWidget = document.getElementById('shareButtonWidget');
              if (shareButtonWidget) {
                shareButtonWidget.classList.add('has-edit-button');
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
  <nav class="sticky top-0 z-50 ${theme.navBg} shadow-2xl border-b-2 ${theme.navBorder}">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full" style="max-width: 100%; box-sizing: border-box;">
      <div class="flex justify-between items-center h-20 md:h-24">
        <!-- Logo/Brand -->
        <a href="#home" class="flex items-center gap-2 md:gap-4 group hover-zoom-sm">
          ${business.logoUrl ? `
          <div class="relative flex-shrink-0">
            <img src="${escapeHtml(business.logoUrl)}" alt="${escapeHtml(generateImageAlt(business.logoUrl || '', 0, 'logo'))}" class="h-12 w-12 md:h-14 md:w-14 object-contain rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300 ring-2 ring-gray-100 group-hover:ring-blue-200" style="max-width: 100%; height: auto; display: block;" itemProp="logo">
          </div>
          ` : `
          <div class="h-12 w-12 md:h-14 md:w-14 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 ring-2 ring-gray-100 group-hover:ring-blue-200 flex-shrink-0">
            <span class="text-white text-xl md:text-2xl font-bold">${escapeHtml(business.businessName.charAt(0).toUpperCase())}</span>
          </div>
          `}
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-1 md:gap-2">
              <div class="text-lg md:text-2xl font-bold text-gray-900 truncate ${theme.accent === 'text-purple-600' ? 'group-hover:text-purple-600' : theme.accent === 'text-amber-600' ? 'group-hover:text-amber-600' : 'group-hover:text-gray-600'} transition-colors">${escapeHtml(business.businessName)}</div>
              ${business.isPremium ? '<svg class="w-4 h-4 md:w-5 md:h-5 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" title="Verified Premium Business"><path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>' : ''}
            </div>
            <div class="flex items-center gap-1 md:gap-2 flex-wrap">
              <div class="text-xs md:text-sm text-gray-500 font-medium truncate">${escapeHtml(business.category)}</div>
              ${business.ownerName ? `<span class="text-xs text-gray-400 hidden sm:inline">• ${escapeHtml(ownerFirstName)}</span>` : ''}
            </div>
            ${business.navbarTagline ? `<div class="text-xs text-gray-400 mt-0.5 md:mt-1 italic hidden md:block truncate">${escapeHtml(business.navbarTagline)}</div>` : ''}
          </div>
        </a>

        <!-- Desktop Navigation -->
        <div class="hidden lg:flex items-center gap-1">
          <a href="#home" class="nav-link hover-zoom-sm px-4 xl:px-5 py-2.5 text-gray-700 ${theme.accent.replace('text-', 'hover:text-')} hover:bg-gray-50 rounded-xl transition-all duration-200 font-semibold text-sm flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
            </svg>
            <span class="hidden xl:inline">Home</span>
          </a>
          <a href="#about" class="nav-link hover-zoom-sm px-4 xl:px-5 py-2.5 text-gray-700 ${theme.accent === 'text-purple-600' ? 'hover:text-purple-600' : theme.accent === 'text-amber-600' ? 'hover:text-amber-600' : 'hover:text-gray-600'} hover:bg-gray-50 rounded-xl transition-all duration-200 font-semibold text-sm flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span class="hidden xl:inline">About</span>
          </a>
          ${business.services && business.services.length > 0 ? `<a href="#services" class="nav-link hover-zoom-sm px-4 xl:px-5 py-2.5 text-gray-700 ${theme.accent === 'text-purple-600' ? 'hover:text-purple-600' : theme.accent === 'text-amber-600' ? 'hover:text-amber-600' : 'hover:text-gray-600'} hover:bg-gray-50 rounded-xl transition-all duration-200 font-semibold text-sm flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
            </svg>
            <span class="hidden xl:inline">Services</span>
          </a>` : ''}
          ${business.imagesUrl && business.imagesUrl.length > 0 ? `<a href="#gallery" class="nav-link hover-zoom-sm px-4 xl:px-5 py-2.5 text-gray-700 ${theme.accent === 'text-purple-600' ? 'hover:text-purple-600' : theme.accent === 'text-amber-600' ? 'hover:text-amber-600' : 'hover:text-gray-600'} hover:bg-gray-50 rounded-xl transition-all duration-200 font-semibold text-sm flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            <span class="hidden xl:inline">Gallery</span>
          </a>` : ''}
          ${business.faqs && business.faqs.length > 0 ? `<a href="#faq" class="nav-link hover-zoom-sm px-4 xl:px-5 py-2.5 text-gray-700 ${theme.accent === 'text-purple-600' ? 'hover:text-purple-600' : theme.accent === 'text-amber-600' ? 'hover:text-amber-600' : 'hover:text-gray-600'} hover:bg-gray-50 rounded-xl transition-all duration-200 font-semibold text-sm flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span class="hidden xl:inline">FAQ</span>
          </a>` : ''}
          <a href="#contact" class="nav-link hover-zoom-sm px-4 xl:px-5 py-2.5 text-gray-700 ${theme.accent.replace('text-', 'hover:text-')} hover:bg-gray-50 rounded-xl transition-all duration-200 font-semibold text-sm flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
            <span class="hidden xl:inline">Contact</span>
          </a>
        </div>

        <!-- Action Buttons -->
        <div class="hidden md:flex items-center gap-2 lg:gap-3">
          ${business.mobile ? `
          <a href="tel:${escapeHtml(business.mobile)}" class="hover-zoom-sm flex items-center gap-2 px-4 lg:px-5 py-2.5 ${theme.button} text-white rounded-xl transition-all duration-200 font-semibold text-xs lg:text-sm shadow-lg hover:shadow-xl">
            <svg class="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
            </svg>
            <span class="hidden lg:inline">Call</span>
          </a>
          ` : ''}
          ${business.whatsapp ? `
          <a href="https://wa.me/${escapeHtml(business.whatsapp.replace(/[^0-9]/g, ''))}" target="_blank" class="hover-zoom-sm flex items-center gap-2 px-4 lg:px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 font-semibold text-xs lg:text-sm shadow-lg hover:shadow-xl">
            <svg class="w-4 h-4 lg:w-5 lg:h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            <span class="hidden lg:inline">WhatsApp</span>
          </a>
          ` : ''}
        </div>

        <!-- Mobile Menu Button -->
        <button id="mobileMenuBtn" class="lg:hidden p-2 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors">
          <svg id="menuIcon" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
          <svg id="closeIcon" class="w-6 h-6 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- Mobile Menu -->
      <div id="mobileMenu" class="hidden lg:hidden border-t border-gray-200 py-4 bg-white">
        <div class="flex flex-col space-y-2">
          <a href="#home" class="px-4 py-3 text-gray-700 hover:bg-gray-50 ${theme.accent === 'text-purple-600' ? 'hover:text-purple-600' : theme.accent === 'text-amber-600' ? 'hover:text-amber-600' : 'hover:text-gray-600'} rounded-xl transition-all font-semibold flex items-center gap-3">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
            </svg>
            Home
          </a>
          <a href="#about" class="px-4 py-3 text-gray-700 hover:bg-gray-50 ${theme.accent === 'text-purple-600' ? 'hover:text-purple-600' : theme.accent === 'text-amber-600' ? 'hover:text-amber-600' : 'hover:text-gray-600'} rounded-xl transition-all font-semibold flex items-center gap-3">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            About
          </a>
          ${business.services && business.services.length > 0 ? `<a href="#services" class="px-4 py-3 text-gray-700 hover:bg-gray-50 ${theme.accent === 'text-purple-600' ? 'hover:text-purple-600' : theme.accent === 'text-amber-600' ? 'hover:text-amber-600' : 'hover:text-gray-600'} rounded-xl transition-all font-semibold flex items-center gap-3">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
            </svg>
            Services
          </a>` : ''}
          ${business.imagesUrl && business.imagesUrl.length > 0 ? `<a href="#gallery" class="px-4 py-3 text-gray-700 hover:bg-gray-50 ${theme.accent === 'text-purple-600' ? 'hover:text-purple-600' : theme.accent === 'text-amber-600' ? 'hover:text-amber-600' : 'hover:text-gray-600'} rounded-xl transition-all font-semibold flex items-center gap-3">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            Gallery
          </a>` : ''}
          ${business.faqs && business.faqs.length > 0 ? `<a href="#faq" class="px-4 py-3 text-gray-700 hover:bg-gray-50 ${theme.accent === 'text-purple-600' ? 'hover:text-purple-600' : theme.accent === 'text-amber-600' ? 'hover:text-amber-600' : 'hover:text-gray-600'} rounded-xl transition-all font-semibold flex items-center gap-3">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            FAQ
          </a>` : ''}
          <a href="#contact" class="px-4 py-3 text-gray-700 hover:bg-gray-50 ${theme.accent === 'text-purple-600' ? 'hover:text-purple-600' : theme.accent === 'text-amber-600' ? 'hover:text-amber-600' : 'hover:text-gray-600'} rounded-xl transition-all font-semibold flex items-center gap-3">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
            Contact
          </a>
          <div class="pt-2 space-y-2">
            ${business.mobile ? `
            <a href="tel:${escapeHtml(business.mobile)}" class="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold shadow-lg">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
              </svg>
              Call Us
            </a>
            ` : ''}
            ${business.whatsapp ? `
            <a href="https://wa.me/${escapeHtml(business.whatsapp.replace(/[^0-9]/g, ''))}" target="_blank" class="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold shadow-lg">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              WhatsApp
            </a>
            ` : ''}
          </div>
        </div>
      </div>
    </div>
  </nav>

    <!-- Main Content -->
    <main style="max-width: 100vw; overflow-x: hidden; box-sizing: border-box;">
    <!-- Enhanced Hero Section - Full Width with Better Design -->
    <section id="home" class="relative bg-gradient-to-r ${theme.primary} text-white py-20 md:py-28 lg:py-32 overflow-hidden">
      <!-- Animated Background Elements -->
      <div class="absolute inset-0 opacity-10">
        <div class="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        <div class="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>
      
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full" style="max-width: 100%; box-sizing: border-box;">
        <div class="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12">
          ${business.logoUrl ? `
          <div class="flex-shrink-0">
            <img src="${escapeHtml(business.logoUrl)}" alt="${escapeHtml(generateImageAlt(business.logoUrl || '', 0, 'logo'))}" class="w-40 h-40 md:w-48 md:h-48 object-contain rounded-3xl bg-white/20 backdrop-blur-md p-4 md:p-6 shadow-2xl border-4 border-white/30" style="max-width: 100%; height: auto;" itemProp="logo">
          </div>
          ` : `
          <div class="flex-shrink-0 w-40 h-40 md:w-48 md:h-48 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center shadow-2xl border-4 border-white/30">
            <span class="text-white text-6xl md:text-7xl font-bold">${escapeHtml(business.businessName.charAt(0).toUpperCase())}</span>
          </div>
          `}
          <div class="flex-1 text-center md:text-left max-w-3xl">
            ${business.category ? `
            <div class="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold mb-4 border border-white/30">
              <span class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              ${escapeHtml(business.category)}
            </div>
            ` : ''}
            
            <!-- Trust Badge -->
            ${business.googlePlacesData?.rating ? `
            <div class="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium mb-4 border border-white/30">
              <svg class="w-3 h-3 fill-yellow-400 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
              </svg>
              <span>${business.googlePlacesData.rating} Rating</span>
            </div>
            ` : ''}
            
            <h1 class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-4 break-words leading-tight tracking-tight" itemProp="name">
              ${escapeHtml(business.businessName)}
            </h1>
            
            ${business.ownerName ? `
            <p class="text-base sm:text-lg md:text-xl text-white/90 mb-3 font-medium">
              Owner: <span class="font-semibold">${escapeHtml(business.ownerName)}</span>
            </p>
            ` : ''}
            
            ${business.navbarTagline ? `
            <p class="text-lg sm:text-xl md:text-2xl text-white/90 mb-6 md:mb-8 italic font-light leading-relaxed">
              ${escapeHtml(business.navbarTagline)}
            </p>
            ` : ''}
            
            <!-- Enhanced CTAs -->
            ${(business.mobile || business.whatsapp) ? `
            <div class="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              ${business.mobile ? `
              <a href="tel:${escapeHtml(business.mobile)}" class="group px-8 py-4 ${theme.button} text-white rounded-xl font-bold flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 hover:shadow-2xl text-base sm:text-lg shadow-lg">
                <svg class="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                </svg>
                Call Now
              </a>
              ` : ''}
              ${business.whatsapp ? `
              <a href="https://wa.me/${escapeHtml(business.whatsapp.replace(/[^0-9]/g, ''))}" target="_blank" rel="noopener noreferrer" class="group px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 hover:shadow-2xl text-base sm:text-lg shadow-lg">
                <svg class="w-5 h-5 group-hover:rotate-12 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                WhatsApp
              </a>
              ` : ''}
            </div>
            ` : ''}
          </div>
        </div>
      </div>
    </section>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full" style="max-width: 100%; box-sizing: border-box;">

      <!-- About Section -->
      ${business.description && business.description.trim() ? `
      <section id="about" class="section-card p-8 md:p-12 mb-12">
        <div class="section-header">
          <div class="section-icon">
            <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h2 class="section-title">About Us</h2>
        </div>
        <div class="prose prose-lg max-w-none">
          <p class="text-gray-700 whitespace-pre-line leading-relaxed text-base md:text-lg text-center md:text-left">${escapeHtml(business.description)}</p>
        </div>
        ${business.ownerName ? `
        <div class="mt-8 p-6 bg-gray-50 rounded-lg border-l-4 border-blue-600">
          <p class="text-gray-700 font-semibold text-base md:text-lg">
            <span class="text-blue-600">Owner:</span> ${escapeHtml(ownerFirstName)}
          </p>
        </div>
        ` : ''}
      </section>
      ` : ''}

      <!-- Quick Contact Info Section -->
      ${business.address ? `
      <section id="location" class="section-card p-8 md:p-12 mb-12">
        <div class="section-header">
          <div class="section-icon">
            <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
          </div>
          <h2 class="section-title">Find Us</h2>
        </div>
        <div class="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 md:p-8 border-2 border-gray-200 shadow-lg">
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
            </div>
            <div class="flex-1">
              <h3 class="text-xl md:text-2xl font-bold text-gray-900 mb-3">Our Location</h3>
              <p class="text-gray-700 text-base md:text-lg leading-relaxed mb-4">${escapeHtml(business.address)}</p>
              <div class="mt-4 rounded-lg overflow-hidden border-2 border-gray-200 shadow-md">
                <iframe
                  width="100%"
                  height="300"
                  style="border: 0;"
                  loading="lazy"
                  allowfullscreen
                  referrerpolicy="no-referrer-when-downgrade"
                  src="https://www.google.com/maps?q=${encodeURIComponent(business.address)}&output=embed"
                  title="Map showing ${escapeHtml(business.address)}"
                  class="w-full"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>
      ` : ''}

      <!-- Trust Badges Section -->
      <section class="section-card p-8 md:p-12 mb-12">
        <div class="section-header">
          <div class="section-icon">
            <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
            </svg>
          </div>
          <h2 class="section-title">Why Trust Us</h2>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          ${(() => {
            const badges = business.trustBadges || [];
            const defaultBadges = [
              { title: 'Verified Business', icon: '✓', description: 'Authenticated and verified' },
              { title: 'Premium Quality', icon: '⭐', description: 'Top-notch services' },
              { title: '24/7 Support', icon: '🕐', description: 'Always here to help' },
              { title: 'Satisfaction Guaranteed', icon: '💯', description: '100% customer satisfaction' }
            ];
            const displayBadges = badges.length > 0 ? badges : defaultBadges;
            return displayBadges.map((badge, index) => `
              <div class="text-center p-6 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-500 transition-all duration-300">
                <div class="text-4xl mb-4">${badge.icon || '✓'}</div>
                <h3 class="text-lg font-bold text-gray-900 mb-2">${escapeHtml(badge.title)}</h3>
                <p class="text-gray-600 text-sm">${escapeHtml(badge.description || '')}</p>
              </div>
            `).join('');
          })()}
        </div>
      </section>

      <!-- YouTube Video -->
      ${embedUrl ? `
      <section class="section-card p-8 md:p-12 mb-12">
        <div class="section-header">
          <div class="section-icon">
            <svg class="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </div>
          <h2 class="section-title">Watch Our Video</h2>
        </div>
        <div class="aspect-video rounded-xl overflow-hidden shadow-xl w-full max-w-full">
          <iframe 
            src="${embedUrl}" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen
            class="w-full h-full max-w-full"
            style="max-width: 100%;"
          ></iframe>
        </div>
      </section>
      ` : ''}

      <!-- Gallery -->
      ${business.imagesUrl && business.imagesUrl.length > 0 ? `
      <section id="gallery" class="section-card p-8 md:p-12 mb-12">
        <div class="section-header">
          <div class="section-icon">
            <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
          </div>
          <h2 class="section-title">Our Gallery</h2>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          ${business.imagesUrl.map((img, idx) => `
            <div class="group gallery-item overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer aspect-square" onclick="openLightbox(${idx})" data-image-index="${idx}">
              <img src="${escapeHtml(img)}" alt="${escapeHtml(generateImageAlt(img, idx))}" class="w-full h-full object-cover transition-transform duration-300" loading="lazy" itemProp="image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
              <div class="w-full h-full bg-gray-200 flex items-center justify-center hidden">
                <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
            </div>
          `).join('')}
        </div>
      </section>
      ` : ''}

      <!-- Services / Menu / Pricing Section -->
      ${business.services && business.services.length > 0 ? `
      <section id="services" class="section-card p-8 md:p-12 mb-12">
        <div class="section-header">
          <div class="section-icon">
            <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
            </svg>
          </div>
          <h2 class="section-title">Our Services</h2>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${business.services.map((service, index) => {
            const serviceName = service.title || service.name || 'Service';
            const serviceDescription = service.description || '';
            const servicePrice = service.price || '';
            // Escape for HTML attributes
            const serviceNameAttr = escapeHtml(serviceName).replace(/'/g, "&#39;").replace(/"/g, "&quot;");
            const serviceDescAttr = escapeHtml(serviceDescription).replace(/'/g, "&#39;").replace(/"/g, "&quot;");
            const servicePriceAttr = escapeHtml(servicePrice).replace(/'/g, "&#39;").replace(/"/g, "&quot;");
            return `
            <div class="service-card-item flex flex-col h-full" 
                 data-service-name="${serviceNameAttr}" 
                 data-service-description="${serviceDescAttr}" 
                 data-service-price="${servicePriceAttr}"
                 onclick="handleServiceCardClick(this)">
              ${service.imageUrl ? `
              <div class="h-48 w-full overflow-hidden rounded-t-lg relative">
                <img src="${escapeHtml(service.imageUrl)}" alt="${escapeHtml(`${business.businessName} - ${serviceName} service in ${city}`)}" class="w-full h-full object-cover" loading="lazy" itemProp="image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div class="w-full h-full bg-gray-100 flex items-center justify-center hidden absolute inset-0">
                  <svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
                  </svg>
                </div>
              </div>
              ` : `
              <div class="h-48 w-full bg-gray-100 flex items-center justify-center rounded-t-lg">
                <svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
                </svg>
              </div>
              `}
              <div class="p-6 flex-1 flex flex-col">
                ${service.featured ? `
                <div class="mb-3">
                  <span class="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                    ⭐ Featured
                  </span>
                </div>
                ` : ''}
                <h3 class="text-xl font-bold text-gray-900 mb-2 break-words">${escapeHtml(serviceName)}</h3>
                <p class="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">${escapeHtml(serviceDescription)}</p>
                ${service.price ? `
                <div class="flex items-center justify-between pt-4 border-t border-gray-200 mt-auto">
                  <span class="text-xl font-bold text-blue-600 break-words">${escapeHtml(servicePrice)}</span>
                </div>
                ` : ''}
                <div class="mt-4 pt-4 border-t border-gray-200">
                  <button class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all text-sm" onclick="event.stopPropagation(); handleServiceCardClick(this.closest('.service-card-item'))">
                    Inquire About This Service
                  </button>
                </div>
              </div>
            </div>
          `;
          }).join('')}
        </div>
      </section>
      ` : ''}

      <!-- Special Offers / Deals Section -->
      ${business.specialOffers && business.specialOffers.length > 0 ? `
      <section id="offers" class="section-card p-8 md:p-12 mb-12">
        <div class="section-header">
          <div class="section-icon">
            <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"></path>
            </svg>
          </div>
          <h2 class="section-title">Special Offers</h2>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          ${business.specialOffers.map((offer, index) => {
            const expiryDate = offer.expiryDate ? new Date(offer.expiryDate) : null;
            const now = new Date();
            const isExpired = expiryDate && expiryDate < now;
            const daysUntilExpiry = expiryDate ? Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24)) : null;
            const isUrgent = daysUntilExpiry !== null && daysUntilExpiry <= 3 && daysUntilExpiry >= 0;
            
            return `
            <div class="service-card-item">
              ${isUrgent ? `
              <div class="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold z-10">
                🔥 Urgent!
              </div>
              ` : ''}
              ${isExpired ? `
              <div class="absolute top-4 right-4 bg-gray-600 text-white px-3 py-1 rounded-full text-xs font-bold z-10">
                Expired
              </div>
              ` : ''}
              <div class="p-6">
                <h3 class="text-xl font-bold text-gray-900 mb-3">${escapeHtml(offer.title)}</h3>
                <p class="text-gray-600 mb-4">${escapeHtml(offer.description || '')}</p>
                ${expiryDate && !isExpired ? `
                <div class="flex items-center gap-2 text-sm pt-4 border-t border-gray-200">
                  <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span class="text-gray-600 font-medium">Expires: ${expiryDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  ${daysUntilExpiry !== null ? `
                  <span class="ml-auto px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">
                    ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''} left
                  </span>
                  ` : ''}
                </div>
                ` : ''}
              </div>
            </div>
            `;
          }).join('')}
        </div>
      </section>
      ` : ''}

      <!-- Business Hours Section -->
      ${business.businessHours && Object.keys(business.businessHours).length > 0 && Object.values(business.businessHours).some(day => day && day.open) ? `
      <section id="hours" class="section-card p-8 md:p-12 mb-12">
        <div class="section-header">
          <div class="section-icon">
            <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div class="flex-1">
            <h2 class="section-title">Business Hours</h2>
            ${(() => {
              const now = new Date();
              const currentDay = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];
              const currentTime = now.getHours() * 100 + now.getMinutes();
              const todayHours = business.businessHours[currentDay];
              let isOpen = false;
              if (todayHours && todayHours.open) {
                const start = parseInt(todayHours.start.replace(':', ''));
                const end = parseInt(todayHours.end.replace(':', ''));
                isOpen = currentTime >= start && currentTime <= end;
              }
              return `
              <div class="mt-2 flex items-center gap-3">
                <div class="px-4 py-2 rounded-full font-bold text-sm ${isOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">
                  ${isOpen ? '🟢 Open Now' : '🔴 Closed Now'}
                </div>
              </div>
              `;
            })()}
          </div>
        </div>
        <div class="space-y-3">
          ${['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => {
            const hours = business.businessHours[day];
            if (!hours) return '';
            const isOpen = hours.open;
            const now = new Date();
            const currentDay = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];
            const isToday = day === currentDay;
            
            return `
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl border-2 ${isToday ? 'border-teal-400 bg-teal-50' : 'border-gray-200'}">
              <span class="text-lg font-semibold text-gray-800 capitalize">${day}</span>
              ${isOpen ? `
              <div class="flex items-center gap-3">
                <span class="text-gray-700 font-medium">${escapeHtml(hours.start)} - ${escapeHtml(hours.end)}</span>
                ${isToday ? '<span class="px-3 py-1 bg-teal-600 text-white rounded-full text-xs font-bold">Today</span>' : ''}
              </div>
              ` : `
              <span class="text-gray-400 italic">Closed</span>
              `}
            </div>
            `;
          }).join('')}
        </div>
      </section>
      ` : ''}

      <!-- Appointment / Booking Section -->
      ${business.appointmentSettings && business.appointmentSettings.contactMethod ? `
      <section id="booking" class="section-card p-8 md:p-12 mb-12">
        <div class="section-header">
          <div class="section-icon">
            <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
          </div>
          <h2 class="section-title">Book an Appointment</h2>
        </div>
        <div class="max-w-2xl mx-auto">
          <p class="text-gray-700 text-lg mb-6 text-center">
            Ready to get started? Book your appointment now and we'll get back to you!
          </p>
          
          <!-- Appointment Booking Form -->
          <div id="appointment-booking-form" class="bg-white rounded-xl p-6 shadow-lg">
            <form id="appointment-form" class="space-y-4">
              <!-- Date Selection -->
              <div>
                <label class="block text-sm font-semibold text-gray-800 mb-2">Select Date *</label>
                <input type="date" id="appointment-date" required min="${new Date().toISOString().split('T')[0]}" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
              </div>

              <!-- Time Selection -->
              <div id="time-selection-container" style="display: none;">
                <label class="block text-sm font-semibold text-gray-800 mb-2">Select Time *</label>
                <div id="available-slots" class="grid grid-cols-3 gap-2"></div>
                <div id="slots-loading" class="text-center py-4 text-gray-500" style="display: none;">Loading available slots...</div>
                <div id="no-slots" class="text-center py-4 text-red-500" style="display: none;">No available slots for this date. Please select another date.</div>
              </div>

              <!-- Customer Name -->
              <div>
                <label class="block text-sm font-semibold text-gray-800 mb-2">Your Name *</label>
                <input type="text" id="customer-name" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="John Doe" />
              </div>

              <!-- Phone -->
              <div>
                <label class="block text-sm font-semibold text-gray-800 mb-2">Phone Number *</label>
                <input type="tel" id="customer-phone" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="+91 9305715031" />
              </div>

              <!-- Email -->
              <div>
                <label class="block text-sm font-semibold text-gray-800 mb-2">Email (Optional)</label>
                <input type="email" id="customer-email" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="john@example.com" />
              </div>

              <!-- Service Type -->
              ${business.appointmentSettings.serviceTypes && business.appointmentSettings.serviceTypes.length > 0 ? `
              <div>
                <label class="block text-sm font-semibold text-gray-800 mb-2">Service Type</label>
                <select id="service-type" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                  <option value="">Select a service</option>
                  ${business.appointmentSettings.serviceTypes.map(service => `
                    <option value="${escapeHtml(service)}">${escapeHtml(service)}</option>
                  `).join('')}
                </select>
              </div>
              ` : ''}

              <!-- Notes -->
              <div>
                <label class="block text-sm font-semibold text-gray-800 mb-2">Additional Notes (Optional)</label>
                <textarea id="appointment-notes" rows="4" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none" placeholder="Any special requirements or notes..."></textarea>
              </div>

              <!-- Submit Button -->
              <button type="submit" id="submit-appointment" class="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed">Book Appointment</button>
            </form>

            <!-- Success Message -->
            <div id="appointment-success" class="hidden text-center py-6">
              <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 class="text-2xl font-bold text-gray-900 mb-2">Appointment Booked!</h3>
              <p class="text-gray-600 mb-4">Your appointment has been confirmed. We'll send you a confirmation email shortly.</p>
              <button onclick="document.getElementById('appointment-form').reset(); document.getElementById('appointment-success').classList.add('hidden'); document.getElementById('appointment-booking-form').classList.remove('hidden');" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Book Another Appointment</button>
            </div>
          </div>
        </div>
      </section>

      <script>
        (function() {
          const businessId = ${business.id};
          const API_BASE_URL = '${apiUrl}';
          const appointmentDateInput = document.getElementById('appointment-date');
          const timeSelectionContainer = document.getElementById('time-selection-container');
          const availableSlotsDiv = document.getElementById('available-slots');
          const slotsLoading = document.getElementById('slots-loading');
          const noSlots = document.getElementById('no-slots');
          const appointmentForm = document.getElementById('appointment-form');
          const submitButton = document.getElementById('submit-appointment');
          let selectedTime = '';

          appointmentDateInput.addEventListener('change', async function() {
            const selectedDate = this.value;
            selectedTime = '';
            if (!selectedDate) {
              timeSelectionContainer.style.display = 'none';
              return;
            }
            timeSelectionContainer.style.display = 'block';
            availableSlotsDiv.innerHTML = '';
            slotsLoading.style.display = 'block';
            noSlots.style.display = 'none';
            try {
              const response = await fetch(API_BASE_URL + '/appointments/business/' + businessId + '/available-slots?date=' + selectedDate);
              const data = await response.json();
              slotsLoading.style.display = 'none';
              if (response.ok && data.availableSlots && data.availableSlots.length > 0) {
                availableSlotsDiv.innerHTML = data.availableSlots.map(slot => 
                  '<button type="button" class="slot-btn px-4 py-2 rounded-lg border-2 transition-all bg-white text-gray-700 border-gray-300 hover:border-blue-500" data-time="' + slot + '">' + slot + '</button>'
                ).join('');
                document.querySelectorAll('.slot-btn').forEach(btn => {
                  btn.addEventListener('click', function() {
                    document.querySelectorAll('.slot-btn').forEach(b => {
                      b.classList.remove('bg-blue-600', 'text-white', 'border-blue-600');
                      b.classList.add('bg-white', 'text-gray-700', 'border-gray-300');
                    });
                    this.classList.remove('bg-white', 'text-gray-700', 'border-gray-300');
                    this.classList.add('bg-blue-600', 'text-white', 'border-blue-600');
                    selectedTime = this.dataset.time;
                  });
                });
              } else {
                noSlots.style.display = 'block';
              }
            } catch (error) {
              console.error('Error fetching slots:', error);
              slotsLoading.style.display = 'none';
              noSlots.style.display = 'block';
              noSlots.textContent = 'Failed to load available slots. Please try again.';
            }
          });

          appointmentForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            if (!selectedTime) {
              alert('Please select a time slot');
              return;
            }
            const formData = {
              customerName: document.getElementById('customer-name').value,
              customerPhone: document.getElementById('customer-phone').value,
              customerEmail: document.getElementById('customer-email').value,
              appointmentDate: appointmentDateInput.value,
              appointmentTime: selectedTime,
              serviceType: document.getElementById('service-type')?.value || '',
              notes: document.getElementById('appointment-notes').value
            };
            submitButton.disabled = true;
            submitButton.textContent = 'Booking...';
            try {
              const response = await fetch(API_BASE_URL + '/appointments/business/' + businessId, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
              });
              const data = await response.json();
              if (response.ok) {
                document.getElementById('appointment-booking-form').classList.add('hidden');
                document.getElementById('appointment-success').classList.remove('hidden');
                appointmentForm.reset();
                timeSelectionContainer.style.display = 'none';
              } else {
                alert(data.error || 'Failed to book appointment. Please try again.');
                submitButton.disabled = false;
                submitButton.textContent = 'Book Appointment';
              }
            } catch (error) {
              console.error('Error booking appointment:', error);
              alert('Failed to book appointment. Please try again.');
              submitButton.disabled = false;
              submitButton.textContent = 'Book Appointment';
            }
          });
        })();
      </script>
      ` : ''}

      <!-- E-Commerce / Products Section -->
      ${business.ecommerceEnabled ? `
      <section id="products" class="bg-white rounded-2xl shadow-2xl p-10 md:p-12 mb-12 border border-gray-100">
        <div class="flex items-center gap-4 mb-8">
          <div class="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
            </svg>
          </div>
          <h2 class="text-4xl md:text-5xl font-bold text-gray-900">Our Products</h2>
        </div>
        <div id="products-container" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <p class="text-gray-500">Loading products...</p>
        </div>
      </section>

      <!-- Shopping Cart Sidebar -->
      <div id="cart-sidebar" class="fixed top-0 right-0 h-full w-full md:w-96 bg-white shadow-2xl z-[100] transform translate-x-full transition-transform duration-300">
        <div class="flex flex-col h-full">
          <div class="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 class="text-2xl font-bold text-gray-900">Shopping Cart</h3>
            <button onclick="window.closeCart()" class="text-gray-500 hover:text-gray-700">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <div id="cart-items" class="flex-1 overflow-y-auto p-6">
            <p class="text-gray-500 text-center">Your cart is empty</p>
          </div>
          <div class="border-t border-gray-200 p-6 space-y-4">
            <div class="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span id="cart-total">₹0</span>
            </div>
            <button onclick="window.checkout()" id="checkout-btn" class="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed" disabled>
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
      <div id="cart-overlay" class="fixed inset-0 bg-black bg-opacity-50 z-[90] hidden" onclick="window.closeCart()"></div>

      <!-- Cart Button -->
      <button onclick="window.openCart()" id="cart-button" class="fixed ${business.whatsapp ? 'bottom-24' : 'bottom-6'} right-6 w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 flex items-center justify-center z-40">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
        </svg>
        <span id="cart-badge" class="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center hidden">0</span>
      </button>
      ` : ''}

      <!-- FAQ Section -->
      ${business.faqs && business.faqs.length > 0 ? `
      <section id="faq" class="bg-white rounded-2xl shadow-2xl p-10 md:p-12 mb-12 border border-gray-100">
        <div class="flex items-center gap-4 mb-8">
          <div class="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h2 class="text-4xl md:text-5xl font-bold text-gray-900">Frequently Asked Questions</h2>
        </div>
        <div class="max-w-3xl mx-auto space-y-4">
          ${business.faqs.map((faq, index) => `
            <div class="faq-item border-2 border-gray-200 rounded-xl overflow-hidden hover:border-${theme.primarySolid.replace('bg-', '')} transition-all duration-300">
              <button class="faq-question w-full px-6 py-4 text-left flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors duration-200" onclick="toggleFaq(${index})">
                <span class="font-bold text-lg text-gray-900">${escapeHtml(faq.question || '')}</span>
                <svg class="faq-icon w-6 h-6 text-gray-600 transform transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              <div class="faq-answer hidden px-6 py-4 bg-white text-gray-700 leading-relaxed">
                ${escapeHtml(faq.answer || '').replace(/\n/g, '<br>')}
              </div>
            </div>
          `).join('')}
        </div>
      </section>
      ` : ''}

      <!-- Contact Section -->
      <section id="contact" class="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 md:p-10 lg:p-12 mb-8 sm:mb-12 border border-gray-100">
        <div class="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div class="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
          </div>
          <h2 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">Contact Us</h2>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <!-- Contact Information -->
          <div class="space-y-6">
            <div>
              <h3 class="text-2xl font-bold text-gray-800 mb-6">Get in Touch</h3>
              <p class="text-gray-600 mb-6">We'd love to hear from you. Reach out to us through any of the following channels.</p>
            </div>
            <div class="space-y-5">
              ${business.mobile ? `
              <div class="flex items-start gap-4 p-5 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors border border-blue-100">
                <div class="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                  </svg>
                </div>
                <div class="flex-1">
                  <p class="text-sm text-gray-500 font-medium mb-1">Phone</p>
                  <a href="tel:${escapeHtml(business.mobile)}" class="text-lg font-bold text-blue-600 hover:text-blue-700 transition-colors">${escapeHtml(business.mobile)}</a>
                </div>
              </div>
              ` : ''}
              ${business.email ? `
              <div class="flex items-start gap-4 p-5 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors border border-indigo-100">
                <div class="flex-shrink-0 w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <div class="flex-1">
                  <p class="text-sm text-gray-500 font-medium mb-1">Email</p>
                  <a href="mailto:${escapeHtml(business.email)}" class="text-lg font-bold text-indigo-600 hover:text-indigo-700 transition-colors break-all">${escapeHtml(business.email)}</a>
                </div>
              </div>
              ` : ''}
              ${business.whatsapp ? `
              <div class="flex items-start gap-4 p-5 bg-green-50 rounded-xl hover:bg-green-100 transition-colors border border-green-100">
                <div class="flex-shrink-0 w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                  <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                </div>
                <div class="flex-1">
                  <p class="text-sm text-gray-500 font-medium mb-1">WhatsApp</p>
                  <a href="https://wa.me/${escapeHtml(business.whatsapp.replace(/[^0-9]/g, ''))}" target="_blank" class="text-lg font-bold text-green-600 hover:text-green-700 transition-colors">${escapeHtml(business.whatsapp)}</a>
                </div>
              </div>
              ` : ''}
            </div>
          </div>

          <!-- Contact Form -->
          <div class="space-y-6">
            <div>
              <h3 class="text-2xl font-bold text-gray-800 mb-6">Send us a Message</h3>
              <p class="text-gray-600 mb-6">Fill out the form below and we'll get back to you as soon as possible.</p>
            </div>
            <form id="contact-form" class="space-y-4">
              <div>
                <label for="contact-name" class="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                <input type="text" id="contact-name" name="name" required class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
              </div>
              <div>
                <label for="contact-email" class="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input type="email" id="contact-email" name="email" required class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
              </div>
              <div>
                <label for="contact-phone" class="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input type="tel" id="contact-phone" name="phone" class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
              </div>
              <div>
                <label for="contact-subject" class="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <input type="text" id="contact-subject" name="subject" class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
              </div>
              <div>
                <label for="contact-message" class="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                <textarea id="contact-message" name="message" rows="5" required class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"></textarea>
              </div>
              <button type="submit" class="hover-zoom w-full px-6 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-base sm:text-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl">
                Send Message
              </button>
              <div id="contact-form-message" class="hidden mt-4 p-4 rounded-xl"></div>
            </form>
          </div>

          <!-- Location Information -->
          <div class="space-y-6">
            <div>
              <h3 class="text-2xl font-bold text-gray-800 mb-6">Visit Us</h3>
              <p class="text-gray-600 mb-6">Come and visit our location. We're always happy to welcome you!</p>
            </div>
            <div class="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
              <div class="flex items-start gap-4 mb-6">
                <div class="flex-shrink-0 w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                </div>
                <div class="flex-1">
                  <p class="text-sm text-gray-500 font-medium mb-2">Address</p>
                  <p class="text-gray-800 font-semibold text-lg leading-relaxed">${escapeHtml(business.address)}</p>
                </div>
              </div>
              ${business.mapLink ? `
              <div class="space-y-4">
                <a href="${escapeHtml(business.mapLink)}" target="_blank" class="inline-flex items-center justify-center gap-3 w-full px-6 py-4 bg-purple-600 text-white rounded-xl font-bold text-lg hover:bg-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                  </svg>
                  View on Google Maps
                </a>
                ${(() => {
                  // Try to extract embed URL from Google Maps link
                  let embedUrl = null;
                  if (business.mapLink.includes('google.com/maps')) {
                    // Extract place ID or coordinates from URL
                    const placeIdMatch = business.mapLink.match(/place\/([^\/]+)/);
                    const queryMatch = business.mapLink.match(/q=([^&]+)/);
                    if (placeIdMatch) {
                      embedUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6d_s6q4Zb1L3uY&q=place_id:${placeIdMatch[1]}`;
                    } else if (queryMatch) {
                      embedUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6d_s6q4Zb1L3uY&q=${encodeURIComponent(queryMatch[1])}`;
                    } else {
                      // Try to extract coordinates
                      const coordMatch = business.mapLink.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
                      if (coordMatch) {
                        embedUrl = `https://www.google.com/maps/embed/v1/view?key=AIzaSyBFw0Qbyq9zTFTd-tUY6d_s6q4Zb1L3uY&center=${coordMatch[1]},${coordMatch[2]}&zoom=15`;
                      }
                    }
                  }
                  // If it's already an embed URL, use it directly
                  if (business.mapLink.includes('google.com/maps/embed')) {
                    embedUrl = business.mapLink;
                  }
                  
                  return embedUrl ? `
                  <div class="mt-4 rounded-xl overflow-hidden shadow-lg border-2 border-gray-200">
                    <iframe 
                      src="${escapeHtml(embedUrl)}" 
                      width="100%" 
                      height="300" 
                      style="border:0;" 
                      allowfullscreen="" 
                      loading="lazy" 
                      referrerpolicy="no-referrer-when-downgrade"
                      class="w-full"
                    ></iframe>
                  </div>
                  ` : '';
                })()}
              </div>
              ` : ''}
            </div>
          </div>
        </div>
      </section>
    </div>
  </main>

  <!-- Image Lightbox Modal -->
  ${business.imagesUrl && business.imagesUrl.length > 0 ? `
  <div id="lightboxModal" class="lightbox-modal" onclick="closeLightboxOnBackdrop(event)">
    <button class="lightbox-close" onclick="closeLightbox()" aria-label="Close lightbox">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
    </button>
    <button class="lightbox-prev" onclick="changeLightboxImage(-1)" aria-label="Previous image">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
      </svg>
    </button>
    <button class="lightbox-next" onclick="changeLightboxImage(1)" aria-label="Next image">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
      </svg>
    </button>
    <div class="lightbox-content" onclick="event.stopPropagation()">
      <img id="lightboxImage" class="lightbox-image" src="" alt="" />
      <div class="lightbox-counter">
        <span id="lightboxCurrent">1</span> / <span id="lightboxTotal">${business.imagesUrl.length}</span>
      </div>
      <div class="lightbox-zoom-controls">
        <button class="lightbox-zoom-btn" onclick="zoomIn()" aria-label="Zoom in">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
        </button>
        <button class="lightbox-zoom-btn" onclick="zoomOut()" aria-label="Zoom out">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
          </svg>
        </button>
        <button class="lightbox-zoom-btn" onclick="resetZoom()" aria-label="Reset zoom">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
        </button>
      </div>
    </div>
  </div>
  ` : ''}

  <!-- Mobile Bottom Navigation Bar -->
  <nav id="mobileBottomNav" class="mobile-bottom-nav">
    <a href="#home" class="mobile-nav-item" onclick="handleMobileNavClick(event, '#home')">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
      </svg>
      <span>Home</span>
    </a>
    ${business.description ? `
    <a href="#about" class="mobile-nav-item" onclick="handleMobileNavClick(event, '#about')">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <span>About</span>
    </a>
    ` : ''}
    ${business.imagesUrl && business.imagesUrl.length > 0 ? `
    <a href="#gallery" class="mobile-nav-item" onclick="handleMobileNavClick(event, '#gallery')">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
      </svg>
      <span>Gallery</span>
    </a>
    ` : ''}
    ${business.services && business.services.length > 0 ? `
    <a href="#services" class="mobile-nav-item" onclick="handleMobileNavClick(event, '#services')">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
      </svg>
      <span>Services</span>
    </a>
    ` : ''}
    <a href="#contact" class="mobile-nav-item" onclick="handleMobileNavClick(event, '#contact')">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
      </svg>
      <span>Contact</span>
    </a>
  </nav>

  <!-- Pull to Refresh Indicator -->
  <div id="pullToRefresh" class="pull-to-refresh">
    <div class="pull-to-refresh-spinner">
      <svg class="w-6 h-6 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
      </svg>
    </div>
    <span class="pull-to-refresh-text">Pull to refresh</span>
  </div>

  <!-- Footer -->
  <footer class="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white mt-16 border-t border-blue-500">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <!-- Business Info -->
        <div>
          <h3 class="text-white font-bold text-xl mb-4">${escapeHtml(business.businessName)}</h3>
          <p class="text-gray-400 mb-2 font-medium">${escapeHtml(business.category)}</p>
          <p class="text-gray-400 text-sm leading-relaxed mb-4">${escapeHtml(business.address)}</p>
          ${business.footerDescription ? `<p class="text-gray-400 text-sm leading-relaxed italic border-l-2 border-blue-600 pl-4">${escapeHtml(business.footerDescription)}</p>` : ''}
        </div>

        <!-- Quick Links -->
        <div>
          <h4 class="text-white font-semibold text-lg mb-4">Quick Links</h4>
          <ul class="space-y-3">
            <li><a href="#home" class="hover:text-blue-400 transition-colors duration-200 flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
              </svg>
              Home
            </a></li>
            <li><a href="#about" class="hover:text-blue-400 transition-colors duration-200 flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              About
            </a></li>
            ${business.imagesUrl && business.imagesUrl.length > 0 ? `<li><a href="#gallery" class="hover:text-blue-400 transition-colors duration-200 flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              Gallery
            </a></li>` : ''}
            <li><a href="#contact" class="hover:text-blue-400 transition-colors duration-200 flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
              Contact
            </a></li>
          </ul>
        </div>

        <!-- Contact & Social -->
        <div>
          <h4 class="text-white font-semibold text-lg mb-4">Connect With Us</h4>
          <div class="space-y-4 mb-6">
            ${business.mobile ? `
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                </svg>
              </div>
              <a href="tel:${escapeHtml(business.mobile)}" class="hover:text-blue-400 transition-colors duration-200 font-medium">${escapeHtml(business.mobile)}</a>
            </div>
            ` : ''}
            ${business.email ? `
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
              </div>
              <a href="mailto:${escapeHtml(business.email)}" class="hover:text-blue-400 transition-colors duration-200 font-medium break-all">${escapeHtml(business.email)}</a>
            </div>
            ` : ''}
            ${business.whatsapp ? `
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </div>
              <a href="https://wa.me/${escapeHtml(business.whatsapp.replace(/[^0-9]/g, ''))}" target="_blank" class="hover:text-green-400 transition-colors duration-200 font-medium">${escapeHtml(business.whatsapp)}</a>
            </div>
            ` : ''}
          </div>
          ${(business.socialLinks?.instagram || business.socialLinks?.facebook || business.socialLinks?.website) ? `
          <div class="flex gap-3">
            ${business.socialLinks.instagram ? `
            <a href="${escapeHtml(business.socialLinks.instagram)}" target="_blank" class="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center hover:bg-gradient-to-br hover:from-pink-500 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-110" aria-label="Instagram">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            ` : ''}
            ${business.socialLinks.facebook ? `
            <a href="${escapeHtml(business.socialLinks.facebook)}" target="_blank" class="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center hover:bg-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-110" aria-label="Facebook">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            ` : ''}
            ${business.socialLinks.website ? `
            <a href="${escapeHtml(business.socialLinks.website)}" target="_blank" class="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center hover:bg-gray-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-110" aria-label="Website">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path>
              </svg>
            </a>
            ` : ''}
          </div>
          ` : ''}
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="border-t border-gray-700 mt-8 pt-8 text-center">
        <p class="text-gray-400 text-base">
          © ${new Date().getFullYear()} <span class="font-semibold text-white">${escapeHtml(business.businessName)}</span>. All rights reserved.
        </p>
        <p class="text-gray-500 text-sm mt-3">
          Powered by <a href="https://varanasihub.com" target="_blank" class="text-blue-400 hover:text-blue-300 transition-colors duration-200 font-medium">VaranasiHub</a>
        </p>
      </div>
    </div>
  </footer>

  <script>
    // FAQ Toggle Function
    function toggleFaq(index) {
      const faqItem = document.querySelectorAll('.faq-item')[index];
      if (faqItem) {
        const isActive = faqItem.classList.contains('active');
        // Close all FAQs
        document.querySelectorAll('.faq-item').forEach(item => {
          item.classList.remove('active');
        });
        // Toggle current FAQ
        if (!isActive) {
          faqItem.classList.add('active');
        }
      }
    }

    // Share Modal Functions
    function openShareModal() {
      try {
        const modal = document.getElementById('shareModal');
        if (modal) {
          modal.classList.add('active');
          document.body.style.overflow = 'hidden';
        } else {
          console.error('Share modal not found');
        }
      } catch (error) {
        console.error('Error opening share modal:', error);
      }
    }

    function closeShareModal() {
      const modal = document.getElementById('shareModal');
      if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
      }
    }

    function closeShareModalOnBackdrop(event) {
      if (event.target.id === 'shareModal') {
        closeShareModal();
      }
    }

    // Copy Share Link Function
    function copyShareLink() {
      const input = document.getElementById('shareLinkInput');
      const btn = document.getElementById('copyShareBtn');
      if (!input) {
        console.error('Share link input not found');
        return;
      }
      
      const textToCopy = input.value;
      
      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(textToCopy).then(() => {
          if (btn) {
            const originalText = btn.textContent;
            btn.textContent = 'Copied!';
            btn.classList.add('copied');
            setTimeout(function() {
              btn.textContent = originalText;
              btn.classList.remove('copied');
            }, 2000);
          }
          showNotification('Link copied to clipboard!');
        }).catch(function(err) {
          console.error('Clipboard API failed, trying fallback:', err);
          fallbackCopyTextToClipboard(textToCopy, btn);
        });
      } else {
        // Fallback for older browsers
        fallbackCopyTextToClipboard(textToCopy, btn);
      }
    }
    
    // Fallback copy function for older browsers
    function fallbackCopyTextToClipboard(text, btn) {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        const successful = document.execCommand('copy');
        if (successful) {
          if (btn) {
            const originalText = btn.textContent;
            btn.textContent = 'Copied!';
            btn.classList.add('copied');
            setTimeout(function() {
              btn.textContent = originalText;
              btn.classList.remove('copied');
            }, 2000);
          }
          showNotification('Link copied to clipboard!');
        } else {
          showNotification('Failed to copy link', 'error');
        }
      } catch (err) {
        console.error('Fallback copy failed:', err);
        showNotification('Failed to copy link', 'error');
      } finally {
        document.body.removeChild(textArea);
      }
    }

    // Download QR Code
    function downloadQRCode() {
      const qrImage = document.getElementById('qrCodeImage');
      if (qrImage) {
        const link = document.createElement('a');
        link.href = qrImage.src;
        link.download = '${escapeHtml(business.businessName).replace(/[^a-z0-9]/gi, '-')}-QR-Code.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showNotification('QR Code downloaded!');
      }
    }

    // Track Share Analytics
    function trackShare(platform) {
      const businessId = ${business.id};
      const API_BASE_URL = '${apiUrl}';
      
      fetch(API_BASE_URL + '/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessId: businessId,
          eventType: 'share_' + platform
        })
      }).catch(function(err) {
        console.log('Analytics tracking error:', err);
      });
    }

    // Close modal on Escape key
    document.addEventListener('keydown', function(event) {
      if (event.key === 'Escape') {
        closeShareModal();
      }
    });

    // Show Notification
    function showNotification(message, type) {
      type = type || 'success';
      const notification = document.createElement('div');
      const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
      notification.className = 'fixed top-20 right-5 z-[99999] px-6 py-4 rounded-xl shadow-2xl transform transition-all duration-300 ' + bgColor + ' text-white';
      notification.textContent = message;
      document.body.appendChild(notification);
      
      setTimeout(function() {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(function() { notification.remove(); }, 300);
      }, 3000);
    }

    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const menuIcon = document.getElementById('menuIcon');
    const closeIcon = document.getElementById('closeIcon');
    
    if (mobileMenuBtn && mobileMenu && menuIcon && closeIcon) {
      mobileMenuBtn.addEventListener('click', () => {
        const isHidden = mobileMenu.classList.contains('hidden');
        mobileMenu.classList.toggle('hidden');
        menuIcon.classList.toggle('hidden');
        closeIcon.classList.toggle('hidden');
      });
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // Close mobile menu if open
          if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
            mobileMenu.classList.add('hidden');
            if (menuIcon) menuIcon.classList.remove('hidden');
            if (closeIcon) closeIcon.classList.add('hidden');
          }
        }
      });
    });

    // Highlight active nav link on scroll
    window.addEventListener('scroll', () => {
      const sections = document.querySelectorAll('section[id]');
      const navLinks = document.querySelectorAll('.nav-link');
      
      let current = '';
      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.pageYOffset >= sectionTop - 100) {
          current = section.getAttribute('id');
        }
      });

      navLinks.forEach(link => {
        link.classList.remove('nav-active');
        if (link.getAttribute('href') === '#' + current) {
          link.classList.add('nav-active');
        }
      });
    });
  </script>

  <!-- Analytics Tracking Script -->
  <script>
    (function() {
      const businessId = ${business.id};
      const API_BASE_URL = '${apiUrl}';
      
      // Track page view (once per session)
      if (!sessionStorage.getItem('analytics_tracked_' + businessId)) {
        fetch(API_BASE_URL + '/analytics/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            businessId: businessId,
            eventType: 'visitor'
          })
        }).catch(err => console.log('Analytics tracking error:', err));
        
        sessionStorage.setItem('analytics_tracked_' + businessId, 'true');
      }

      // Track Call button clicks
      document.querySelectorAll('a[href^="tel:"]').forEach(link => {
        link.addEventListener('click', function() {
          fetch(API_BASE_URL + '/analytics/track', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              businessId: businessId,
              eventType: 'call_click'
            })
          }).catch(err => console.log('Analytics tracking error:', err));
        });
      });

      // Track WhatsApp button clicks (including widget)
      document.querySelectorAll('a[href*="wa.me"], a[href*="whatsapp"]').forEach(link => {
        link.addEventListener('click', function() {
          const isWidget = this.closest('#whatsappWidget') !== null;
          fetch(API_BASE_URL + '/analytics/track', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              businessId: businessId,
              eventType: isWidget ? 'whatsapp_widget_click' : 'whatsapp_click'
            })
          }).catch(err => console.log('Analytics tracking error:', err));
        });
      });

      // Track Gallery views (when gallery section comes into viewport)
      const gallerySection = document.getElementById('gallery');
      if (gallerySection) {
        let galleryViewed = false;
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting && !galleryViewed) {
              galleryViewed = true;
              fetch(API_BASE_URL + '/analytics/track', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  businessId: businessId,
                  eventType: 'gallery_view'
                })
              }).catch(err => console.log('Analytics tracking error:', err));
              observer.unobserve(entry.target);
            }
          });
        }, { threshold: 0.5 });
        
        observer.observe(gallerySection);
      }

      // Track Map clicks
      document.querySelectorAll('a[href*="google.com/maps"]').forEach(link => {
        link.addEventListener('click', function() {
          fetch(API_BASE_URL + '/analytics/track', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              businessId: businessId,
              eventType: 'map_click'
            })
          }).catch(err => console.log('Analytics tracking error:', err));
        });
      });

      // Track iframe map clicks (add overlay)
      document.querySelectorAll('iframe[src*="google.com/maps"]').forEach(iframe => {
        const mapContainer = iframe.closest('div');
        if (mapContainer) {
          mapContainer.style.position = 'relative';
          const overlay = document.createElement('div');
          overlay.style.cssText = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1; cursor: pointer;';
          overlay.addEventListener('click', function() {
            overlay.remove();
            fetch(API_BASE_URL + '/analytics/track', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                businessId: businessId,
                eventType: 'map_click'
              })
            }).catch(err => console.log('Analytics tracking error:', err));
          });
          mapContainer.appendChild(overlay);
        }
      });
    })();

    // A/B Testing - Track variant and visitor
    (function() {
      const businessId = ${business.id};
      const API_BASE_URL = '${apiUrl}';
      const currentVariant = '${business.currentVariant || 'default'}';
      
      // Track variant visit
      if (businessId && currentVariant) {
        fetch(\`\${API_BASE_URL}/ab-test/track-visitor/\${businessId}/\${currentVariant}\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        }).catch(err => console.log('A/B test tracking error:', err));
      }
    })();

    // Shopping Cart Functionality
    (function() {
      const businessSlug = '${business.slug}';
      const API_BASE_URL = '${apiUrl}';
      let cart = JSON.parse(localStorage.getItem('cart_' + businessSlug) || '[]');
      let products = [];

      // Load products
      async function loadProducts() {
        try {
          const response = await fetch(\`\${API_BASE_URL}/ecommerce/\${businessSlug}/products\`);
          const data = await response.json();
          products = data.products || [];
          renderProducts();
        } catch (error) {
          console.error('Error loading products:', error);
          document.getElementById('products-container').innerHTML = '<p class="text-red-500">Error loading products. Please try again later.</p>';
        }
      }

      // Render products
      function renderProducts() {
        const container = document.getElementById('products-container');
        if (!container) return;
        
        if (products.length === 0) {
          container.innerHTML = '<p class="text-gray-500">No products available at the moment.</p>';
          return;
        }

        container.innerHTML = products.map(product => \`
          <div class="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-200 overflow-hidden">
            \${product.imageUrl ? \`<img src="\${product.imageUrl}" alt="\${product.name}" class="w-full h-48 object-cover">\` : \`<div class="w-full h-48 bg-gray-200 flex items-center justify-center"><svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>\`}
            <div class="p-6">
              <h3 class="text-xl font-bold text-gray-900 mb-2">\${product.name}</h3>
              \${product.description ? \`<p class="text-gray-600 text-sm mb-4 line-clamp-2">\${product.description}</p>\` : ''}
              <div class="flex items-center justify-between mb-4">
                <div>
                  <span class="text-2xl font-bold text-blue-600">₹\${(typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0).toFixed(2)}</span>
                  \${product.compareAtPrice ? \`<span class="text-sm text-gray-400 line-through ml-2">₹\${(typeof product.compareAtPrice === 'number' ? product.compareAtPrice : parseFloat(product.compareAtPrice) || 0).toFixed(2)}</span>\` : ''}
                </div>
                \${product.stockQuantity > 0 ? \`<span class="text-sm text-green-600 font-medium">In Stock</span>\` : \`<span class="text-sm text-red-600 font-medium">Out of Stock</span>\`}
              </div>
              <button onclick="window.addToCart(\${product.id})" \${product.stockQuantity <= 0 ? 'disabled' : ''} class="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                Add to Cart
              </button>
            </div>
          </div>
        \`).join('');
      }

      // Add to cart
      window.addToCart = function(productId) {
        const product = products.find(p => p.id === productId);
        if (!product || product.stockQuantity <= 0) return;

        const existingItem = cart.find(item => item.productId === productId);
        if (existingItem) {
          if (existingItem.quantity >= product.stockQuantity) {
            alert('Maximum stock available reached');
            return;
          }
          existingItem.quantity++;
        } else {
          cart.push({ 
            productId: product.id, 
            name: product.name, 
            price: parseFloat(product.price), 
            quantity: 1, 
            imageUrl: product.imageUrl 
          });
        }

        saveCart();
        updateCartUI();
      };

      // Remove from cart
      window.removeFromCart = function(productId) {
        cart = cart.filter(item => item.productId !== productId);
        saveCart();
        updateCartUI();
      };

      // Update quantity
      window.updateQuantity = function(productId, change) {
        const item = cart.find(i => i.productId === productId);
        if (!item) return;
        
        const product = products.find(p => p.id === productId);
        const newQuantity = item.quantity + change;
        
        if (newQuantity <= 0) {
          window.removeFromCart(productId);
          return;
        }
        
        if (product && newQuantity > product.stockQuantity) {
          alert('Maximum stock available reached');
          return;
        }
        
        item.quantity = newQuantity;
        saveCart();
        updateCartUI();
      };

      // Save cart
      function saveCart() {
        localStorage.setItem('cart_' + businessSlug, JSON.stringify(cart));
      }

      // Update cart UI
      function updateCartUI() {
        const cartItems = document.getElementById('cart-items');
        const cartTotal = document.getElementById('cart-total');
        const cartBadge = document.getElementById('cart-badge');
        const checkoutBtn = document.getElementById('checkout-btn');
        
        if (!cartItems) return;

        const total = cart.reduce((sum, item) => {
          const price = typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0;
          const qty = typeof item.quantity === 'number' ? item.quantity : parseInt(item.quantity) || 0;
          return sum + (price * qty);
        }, 0);

        if (cart.length === 0) {
          cartItems.innerHTML = '<p class="text-gray-500 text-center">Your cart is empty</p>';
          if (checkoutBtn) checkoutBtn.disabled = true;
        } else {
          cartItems.innerHTML = cart.map(item => \`
            <div class="flex items-center gap-4 p-4 bg-gray-50 rounded-lg mb-4">
              \${item.imageUrl ? \`<img src="\${item.imageUrl}" alt="\${item.name}" class="w-16 h-16 object-cover rounded-lg">\` : \`<div class="w-16 h-16 bg-gray-200 rounded-lg"></div>\`}
              <div class="flex-1">
                <h4 class="font-semibold text-gray-900">\${item.name}</h4>
                <p class="text-blue-600 font-bold">₹\${(typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0).toFixed(2)} × \${item.quantity} = ₹\${((typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0) * (typeof item.quantity === 'number' ? item.quantity : parseInt(item.quantity) || 0)).toFixed(2)}</p>
              </div>
              <div class="flex items-center gap-2">
                <button onclick="window.updateQuantity(\${item.productId}, -1)" class="w-8 h-8 bg-gray-200 rounded-lg hover:bg-gray-300">-</button>
                <span class="w-8 text-center font-semibold">\${item.quantity}</span>
                <button onclick="window.updateQuantity(\${item.productId}, 1)" class="w-8 h-8 bg-gray-200 rounded-lg hover:bg-gray-300">+</button>
                <button onclick="window.removeFromCart(\${item.productId})" class="ml-2 text-red-500 hover:text-red-700">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              </div>
            </div>
          \`).join('');
          if (cartTotal) cartTotal.textContent = \`₹\${total.toFixed(2)}\`;
          if (checkoutBtn) checkoutBtn.disabled = false;
        }

        if (cartBadge) {
          const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
          if (itemCount > 0) {
            cartBadge.textContent = itemCount;
            cartBadge.classList.remove('hidden');
          } else {
            cartBadge.classList.add('hidden');
          }
        }
      }

      // Open cart
      window.openCart = function() {
        const sidebar = document.getElementById('cart-sidebar');
        const overlay = document.getElementById('cart-overlay');
        if (sidebar) sidebar.classList.remove('translate-x-full');
        if (overlay) overlay.classList.remove('hidden');
      };

      // Close cart
      window.closeCart = function() {
        const sidebar = document.getElementById('cart-sidebar');
        const overlay = document.getElementById('cart-overlay');
        if (sidebar) sidebar.classList.add('translate-x-full');
        if (overlay) overlay.classList.add('hidden');
      };

      // Checkout
      window.checkout = async function() {
        if (cart.length === 0) return;

        const customerName = prompt('Enter your name:');
        if (!customerName) return;

        const customerPhone = prompt('Enter your phone number:');
        if (!customerPhone) return;

        const customerEmail = prompt('Enter your email (optional):') || '';
        const customerAddress = prompt('Enter your address (optional):') || '';
        const notes = prompt('Any special instructions (optional):') || '';

        const notificationMethod = confirm('Would you like to receive order confirmation via WhatsApp? (OK for WhatsApp, Cancel for Email)') ? 'whatsapp' : 'email';

        try {
          const response = await fetch(\`\${API_BASE_URL}/ecommerce/\${businessSlug}/orders\`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              items: cart,
              customerName,
              customerEmail,
              customerPhone,
              customerAddress,
              notes,
              notificationMethod
            })
          });

          const data = await response.json();
          
          if (data.success) {
            let message = \`Order placed successfully!\\n\\nOrder Number: \${data.order.orderNumber}\\nTotal: ₹\${data.order.total}\`;
            if (data.order.whatsappUrl && data.notificationSent?.whatsapp) {
              message += \`\\n\\nClick OK to open WhatsApp and confirm your order.\`;
              if (confirm(message)) {
                window.open(data.order.whatsappUrl, '_blank');
              }
            } else {
              alert(message);
            }
            
            cart = [];
            saveCart();
            updateCartUI();
            window.closeCart();
            
            // Track conversion for A/B testing
            const businessId = ${business.id};
            const currentVariant = '${business.currentVariant || 'default'}';
            if (businessId && currentVariant) {
              fetch(\`\${API_BASE_URL}/ab-test/track-conversion/\${businessId}/\${currentVariant}\`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
              }).catch(err => console.log('A/B test conversion tracking error:', err));
            }
          } else {
            alert('Error placing order: ' + (data.error || 'Unknown error'));
          }
        } catch (error) {
          console.error('Checkout error:', error);
          alert('Error placing order. Please try again.');
        }
      };
      

      // Initialize
      if (document.getElementById('products-container')) {
        loadProducts();
        updateCartUI();
      }
    })();

    // Service Inquiry Modal Functions
    let currentServiceName = '';
    let currentServiceDescription = '';
    let currentServicePrice = '';

    function handleServiceCardClick(element) {
      const serviceName = element.getAttribute('data-service-name') || '';
      const serviceDescription = element.getAttribute('data-service-description') || '';
      const servicePrice = element.getAttribute('data-service-price') || '';
      openServiceInquiryModal(serviceName, serviceDescription, servicePrice);
    }

    function openServiceInquiryModal(serviceName, serviceDescription, servicePrice) {
      currentServiceName = serviceName;
      currentServiceDescription = serviceDescription;
      currentServicePrice = servicePrice;
      
      document.getElementById('inquiryServiceName').textContent = serviceName;
      document.getElementById('inquiryServiceDescription').textContent = serviceDescription || 'No description available';
      document.getElementById('inquiryServicePrice').textContent = servicePrice ? 'Price: ' + servicePrice : '';
      
      const modal = document.getElementById('serviceInquiryModal');
      if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    }

    function closeServiceInquiryModal() {
      const modal = document.getElementById('serviceInquiryModal');
      if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        document.getElementById('serviceInquiryForm').reset();
        document.getElementById('inquiryMessageDiv').classList.add('hidden');
      }
    }

    function closeServiceInquiryModalOnBackdrop(event) {
      if (event.target.id === 'serviceInquiryModal') {
        closeServiceInquiryModal();
      }
    }

    async function submitServiceInquiry(event) {
      event.preventDefault();
      
      const businessSlug = '${business.slug}';
      const API_BASE_URL = '${apiUrl}';
      const submitBtn = document.getElementById('inquirySubmitBtn');
      const messageDiv = document.getElementById('inquiryMessageDiv');
      
      const formData = {
        name: document.getElementById('inquiryName').value.trim(),
        email: document.getElementById('inquiryEmail').value.trim(),
        phone: document.getElementById('inquiryPhone').value.trim() || '',
        subject: \`Inquiry about: \${currentServiceName}\`,
        message: \`Service: \${currentServiceName}\n\${currentServicePrice ? 'Price: ' + currentServicePrice + '\\n' : ''}\nMessage:\\n\${document.getElementById('inquiryMessage').value.trim()}\`
      };

      if (!formData.name || !formData.email || !formData.message) {
        messageDiv.className = 'p-4 rounded-lg bg-red-100 text-red-700 border border-red-300';
        messageDiv.textContent = 'Please fill in all required fields.';
        messageDiv.classList.remove('hidden');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';

      try {
        const response = await fetch(\`\${API_BASE_URL}/ecommerce/\${businessSlug}/contact\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        const result = await response.json();
        
        if (result.success || response.ok) {
          messageDiv.className = 'p-4 rounded-lg bg-green-100 text-green-700 border border-green-300';
          messageDiv.textContent = result.message || 'Your inquiry has been sent successfully! The owner will contact you soon.';
          messageDiv.classList.remove('hidden');
          
          document.getElementById('serviceInquiryForm').reset();
          
          setTimeout(() => {
            closeServiceInquiryModal();
          }, 2000);
        } else {
          messageDiv.className = 'p-4 rounded-lg bg-red-100 text-red-700 border border-red-300';
          messageDiv.textContent = result.error || 'Error sending inquiry. Please try again.';
          messageDiv.classList.remove('hidden');
        }
      } catch (error) {
        console.error('Service inquiry error:', error);
        messageDiv.className = 'p-4 rounded-lg bg-red-100 text-red-700 border border-red-300';
        messageDiv.textContent = 'Error sending inquiry. Please try again.';
        messageDiv.classList.remove('hidden');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Inquiry';
      }
    }

    // Contact Form
    (function() {
      const businessSlug = '${business.slug}';
      const API_BASE_URL = '${apiUrl}';
      const form = document.getElementById('contact-form');
      const messageDiv = document.getElementById('contact-form-message');

      if (form) {
        form.addEventListener('submit', async function(e) {
          e.preventDefault();
          
          const formData = new FormData(form);
          const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone') || '',
            subject: formData.get('subject') || '',
            message: formData.get('message')
          };

          try {
            const response = await fetch(\`\${API_BASE_URL}/ecommerce/\${businessSlug}/contact\`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
            });

            const result = await response.json();
            
            if (result.success) {
              messageDiv.className = 'mt-4 p-4 rounded-xl bg-green-100 text-green-700 border border-green-300';
              messageDiv.textContent = result.message || 'Message sent successfully! We will get back to you soon.';
              messageDiv.classList.remove('hidden');
              form.reset();
              
              setTimeout(() => {
                messageDiv.classList.add('hidden');
              }, 5000);
            } else {
              messageDiv.className = 'mt-4 p-4 rounded-xl bg-red-100 text-red-700 border border-red-300';
              messageDiv.textContent = result.error || 'Error sending message. Please try again.';
              messageDiv.classList.remove('hidden');
            }
          } catch (error) {
            console.error('Contact form error:', error);
            messageDiv.className = 'mt-4 p-4 rounded-xl bg-red-100 text-red-700 border border-red-300';
            messageDiv.textContent = 'Error sending message. Please try again.';
            messageDiv.classList.remove('hidden');
          }
        });
      }
    })();

    // Image Lightbox Functionality
    (function() {
      const galleryImages = ${JSON.stringify(business.imagesUrl || [])};
      let currentImageIndex = 0;
      let currentZoom = 1;
      let isDragging = false;
      let translateX = 0;
      let translateY = 0;
      let touchStartDistance = 0;
      let initialZoom = 1;

      const lightboxModal = document.getElementById('lightboxModal');
      const lightboxImage = document.getElementById('lightboxImage');
      const lightboxCurrent = document.getElementById('lightboxCurrent');
      const lightboxTotal = document.getElementById('lightboxTotal');

      if (!lightboxModal || !lightboxImage || galleryImages.length === 0) return;

      // Initialize lightbox
      if (lightboxTotal) {
        lightboxTotal.textContent = galleryImages.length;
      }

      // Open lightbox
      window.openLightbox = function(index) {
        if (index < 0 || index >= galleryImages.length) return;
        currentImageIndex = index;
        currentZoom = 1;
        translateX = 0;
        translateY = 0;
        updateLightboxImage();
        lightboxModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        resetImageTransform();
      };

      // Close lightbox
      window.closeLightbox = function() {
        lightboxModal.classList.remove('active');
        document.body.style.overflow = '';
        currentZoom = 1;
        translateX = 0;
        translateY = 0;
        resetImageTransform();
      };

      // Close on backdrop click
      window.closeLightboxOnBackdrop = function(event) {
        if (event.target === lightboxModal) {
          closeLightbox();
        }
      };

      // Change image
      window.changeLightboxImage = function(direction) {
        currentImageIndex += direction;
        if (currentImageIndex < 0) {
          currentImageIndex = galleryImages.length - 1;
        } else if (currentImageIndex >= galleryImages.length) {
          currentImageIndex = 0;
        }
        currentZoom = 1;
        translateX = 0;
        translateY = 0;
        updateLightboxImage();
        resetImageTransform();
      };

      // Update lightbox image
      function updateLightboxImage() {
        if (lightboxImage && galleryImages[currentImageIndex]) {
          lightboxImage.src = galleryImages[currentImageIndex];
          lightboxImage.alt = 'Gallery image ' + (currentImageIndex + 1);
        }
        if (lightboxCurrent) {
          lightboxCurrent.textContent = currentImageIndex + 1;
        }
      }

      // Reset image transform
      function resetImageTransform() {
        if (lightboxImage) {
          lightboxImage.style.transform = 'scale(1) translate(0, 0)';
        }
      }

      // Zoom functions
      window.zoomIn = function() {
        currentZoom = Math.min(currentZoom + 0.25, 3);
        applyZoom();
      };

      window.zoomOut = function() {
        currentZoom = Math.max(currentZoom - 0.25, 1);
        if (currentZoom === 1) {
          translateX = 0;
          translateY = 0;
        }
        applyZoom();
      };

      window.resetZoom = function() {
        currentZoom = 1;
        translateX = 0;
        translateY = 0;
        applyZoom();
      };

      function applyZoom() {
        if (lightboxImage) {
          lightboxImage.style.transform = \`scale(\${currentZoom}) translate(\${translateX}px, \${translateY}px)\`;
        }
      }

      // Keyboard navigation
      document.addEventListener('keydown', function(e) {
        if (!lightboxModal.classList.contains('active')) return;
        if (e.key === 'Escape') {
          closeLightbox();
        } else if (e.key === 'ArrowLeft') {
          changeLightboxImage(-1);
        } else if (e.key === 'ArrowRight') {
          changeLightboxImage(1);
        } else if (e.key === '+' || e.key === '=') {
          zoomIn();
        } else if (e.key === '-') {
          zoomOut();
        } else if (e.key === '0') {
          resetZoom();
        }
      });

      // Touch events for swipe and pinch-to-zoom
      let touchStartX = 0;
      let touchStartY = 0;
      let touchEndX = 0;
      let touchEndY = 0;

      lightboxImage.addEventListener('touchstart', function(e) {
        if (e.touches.length === 1) {
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
          isDragging = currentZoom > 1;
        } else if (e.touches.length === 2) {
          // Pinch gesture
          const touch1 = e.touches[0];
          const touch2 = e.touches[1];
          touchStartDistance = Math.hypot(
            touch2.clientX - touch1.clientX,
            touch2.clientY - touch1.clientY
          );
          initialZoom = currentZoom;
          e.preventDefault();
        }
      }, { passive: false });

      lightboxImage.addEventListener('touchmove', function(e) {
        if (e.touches.length === 1 && isDragging) {
          // Pan when zoomed
          const deltaX = e.touches[0].clientX - touchStartX;
          const deltaY = e.touches[0].clientY - touchStartY;
          translateX += deltaX / currentZoom;
          translateY += deltaY / currentZoom;
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
          applyZoom();
          e.preventDefault();
        } else if (e.touches.length === 2) {
          // Pinch-to-zoom
          const touch1 = e.touches[0];
          const touch2 = e.touches[1];
          const currentDistance = Math.hypot(
            touch2.clientX - touch1.clientX,
            touch2.clientY - touch1.clientY
          );
          const scale = currentDistance / touchStartDistance;
          currentZoom = Math.max(1, Math.min(initialZoom * scale, 3));
          applyZoom();
          e.preventDefault();
        }
      }, { passive: false });

      lightboxImage.addEventListener('touchend', function(e) {
        if (e.changedTouches.length === 1 && !isDragging) {
          // Swipe gesture
          touchEndX = e.changedTouches[0].clientX;
          touchEndY = e.changedTouches[0].clientY;
          const deltaX = touchEndX - touchStartX;
          const deltaY = touchEndY - touchStartY;
          const minSwipeDistance = 50;

          if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
            if (deltaX > 0) {
              // Swipe right - previous image
              changeLightboxImage(-1);
            } else {
              // Swipe left - next image
              changeLightboxImage(1);
            }
          }
        }
        isDragging = false;
      });

      // Mouse wheel zoom
      lightboxImage.addEventListener('wheel', function(e) {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          if (e.deltaY < 0) {
            zoomIn();
          } else {
            zoomOut();
          }
        }
      }, { passive: false });
    })();

    // Mobile Bottom Navigation
    (function() {
      function handleMobileNavClick(event, target) {
        event.preventDefault();
        const targetElement = document.querySelector(target);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // Update active state
          document.querySelectorAll('.mobile-nav-item').forEach(item => {
            item.classList.remove('active');
          });
          event.currentTarget.classList.add('active');
        }
      }
      window.handleMobileNavClick = handleMobileNavClick;

      // Update active nav item on scroll
      function updateActiveNavItem() {
        const sections = document.querySelectorAll('section[id]');
        const navItems = document.querySelectorAll('.mobile-nav-item');
        
        let current = '';
        sections.forEach(section => {
          const sectionTop = section.offsetTop;
          const sectionHeight = section.clientHeight;
          if (window.pageYOffset >= sectionTop - 150) {
            current = section.getAttribute('id');
          }
        });

        navItems.forEach(item => {
          item.classList.remove('active');
          const href = item.getAttribute('href');
          if (href === '#' + current) {
            item.classList.add('active');
          }
        });
      }

      window.addEventListener('scroll', updateActiveNavItem);
      updateActiveNavItem();
    })();

    // Pull to Refresh
    (function() {
      if (window.innerWidth > 768) return; // Only on mobile

      const pullToRefresh = document.getElementById('pullToRefresh');
      if (!pullToRefresh) return;

      let startY = 0;
      let currentY = 0;
      let isPulling = false;
      let pullDistance = 0;
      const threshold = 80;

      document.addEventListener('touchstart', function(e) {
        if (window.scrollY === 0) {
          startY = e.touches[0].clientY;
          isPulling = true;
        }
      }, { passive: true });

      document.addEventListener('touchmove', function(e) {
        if (!isPulling) return;
        currentY = e.touches[0].clientY;
        pullDistance = currentY - startY;

        if (pullDistance > 0 && window.scrollY === 0) {
          e.preventDefault();
          const progress = Math.min(pullDistance / threshold, 1);
          pullToRefresh.style.top = (pullDistance - 60) + 'px';
          pullToRefresh.style.opacity = progress;

          if (pullDistance > threshold) {
            pullToRefresh.classList.add('active');
            const spinner = pullToRefresh.querySelector('.pull-to-refresh-spinner');
            if (spinner) {
              spinner.style.animation = 'spin 1s linear infinite';
            }
          } else {
            pullToRefresh.classList.remove('active');
          }
        }
      }, { passive: false });

      document.addEventListener('touchend', function() {
        if (!isPulling) return;
        isPulling = false;

        if (pullDistance > threshold) {
          // Trigger refresh
          pullToRefresh.classList.add('active');
          location.reload();
        } else {
          // Reset
          pullToRefresh.style.top = '-60px';
          pullToRefresh.style.opacity = '0';
          pullToRefresh.classList.remove('active');
        }
        pullDistance = 0;
      });
    })();
  </script>
</body>
</html>
  `;
};

