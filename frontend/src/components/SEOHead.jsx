import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getOrigin } from '../utils/urlHelper';

export const SEOHead = ({

  title = 'VaranasiHub - Create Your Business Website in Minutes',
  description = 'Help your Varanasi business go online. Create a professional website in minutes with zero coding skills.',
  image = '/og-image.jpg',
  url,
  type = 'website',
  businessName,
  businessAddress,
  businessPhone,
  businessCategory,
  keywords,
  author = 'VaranasiHub',
  publishedTime,
  modifiedTime,
  breadcrumbs,
  faqItems,
  noindex = false,
  nofollow = false,
  // New props for enhanced schemas
  serviceType,
  serviceArea,
  howToSteps,
  videoUrl,
  videoThumbnail,
  videoDuration,
  videoPublishedDate,
  productPrice,
  productCurrency = 'INR',
  productAvailability = 'InStock',
  // Props for dynamic business data (to avoid fake/hardcoded data)
  actualRating,
  actualReviewCount,
  geoLatitude,
  geoLongitude,
  openingHours,
  socialLinks,

}) => {
  const location = useLocation();
  const origin = getOrigin();
  const currentUrl = url || `${origin}${location.pathname}`;
  const siteUrl = origin;

  useEffect(() => {
    // Update document title
    document.title = title;

    // Update or create meta tags
    const updateMetaTag = (name, content, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`);


      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }


      element.setAttribute('content', content);
    };

    // Basic meta tags
    updateMetaTag('description', description);
    updateMetaTag('viewport', 'width=device-width, initial-scale=1');
    updateMetaTag('author', author);
    updateMetaTag('robots', noindex || nofollow
      ? `${noindex ? 'noindex' : 'index'}, ${nofollow ? 'nofollow' : 'follow'}`

      : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
    );
    updateMetaTag('googlebot', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    updateMetaTag('bingbot', 'index, follow');

    if (keywords) {
      updateMetaTag('keywords', keywords);
    }

    if (publishedTime) {
      updateMetaTag('article:published_time', publishedTime, true);
    }


    if (modifiedTime) {
      updateMetaTag('article:modified_time', modifiedTime, true);
    }

    // Open Graph tags - Enhanced
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', image.startsWith('http') ? image : `${siteUrl}${image}`, true);
    updateMetaTag('og:image:width', '1200', true);
    updateMetaTag('og:image:height', '630', true);
    updateMetaTag('og:image:alt', title, true);
    updateMetaTag('og:url', currentUrl, true);
    updateMetaTag('og:type', type, true);
    updateMetaTag('og:site_name', 'VaranasiHub', true);
    updateMetaTag('og:locale', 'en_IN', true);
    updateMetaTag('og:locale:alternate', 'hi_IN', true);

    // Twitter Card tags - Enhanced
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', image.startsWith('http') ? image : `${siteUrl}${image}`);
    updateMetaTag('twitter:image:alt', title);
    updateMetaTag('twitter:site', '@VaranasiHub');
    updateMetaTag('twitter:creator', '@VaranasiHub');

    // Canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', currentUrl);

    // Remove all existing structured data scripts
    const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
    existingScripts.forEach(script => script.remove());

    const structuredDataArray = [];

    // WebSite Schema (always add)
    const websiteSchema = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'VaranasiHub',
      url: siteUrl,
      description: 'Platform for Varanasi businesses to create professional websites',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${siteUrl}/businesses?search={search_term_string}`
        },
        'query-input': 'required name=search_term_string'
      }
    };
    structuredDataArray.push(websiteSchema);

    // Organization Schema (always add)
    const organizationSchema = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'VaranasiHub',
      description: 'Platform for Varanasi businesses to create professional websites',
      url: siteUrl,
      logo: `${siteUrl}/logo.png`,
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'Customer Service',
        areaServed: 'IN',
        availableLanguage: ['en', 'hi']
      },
      // Only add social links if real profiles exist
      ...(socialLinks && socialLinks.length > 0 && { sameAs: socialLinks }),

      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Varanasi',
        addressRegion: 'Uttar Pradesh',
        addressCountry: 'IN'
      }
    };
    structuredDataArray.push(organizationSchema);

    // Breadcrumb Schema
    if (breadcrumbs && breadcrumbs.length > 0) {
      const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((crumb, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: crumb.name,
          item: crumb.url || `${siteUrl}${crumb.path}`
        }))
      };
      structuredDataArray.push(breadcrumbSchema);
    }

    // FAQ Schema
    if (faqItems && faqItems.length > 0) {
      const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems.map(faq => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer
          }
        }))
      };
      structuredDataArray.push(faqSchema);
    }

    // Business-specific structured data
    if (businessName) {
      let businessSchema = {
        '@context': 'https://schema.org',
        '@type': getBusinessType(businessCategory),
        name: businessName,
        description: description,
        url: currentUrl,
        image: image.startsWith('http') ? image : `${siteUrl}${image}`,
      };

      if (businessAddress) {
        businessSchema.address = {
          '@type': 'PostalAddress',
          streetAddress: businessAddress,
          addressLocality: 'Varanasi',
          addressRegion: 'Uttar Pradesh',
          postalCode: '221001',
          addressCountry: 'IN',
        };
        businessSchema.areaServed = {
          '@type': 'City',
          name: 'Varanasi'
        };
      }

      if (businessPhone) {
        businessSchema.telephone = businessPhone;
        businessSchema.contactPoint = {
          '@type': 'ContactPoint',
          telephone: businessPhone,
          contactType: 'Customer Service',
          areaServed: 'IN',
          availableLanguage: ['en', 'hi']
        };
      }

      if (businessCategory) {
        businessSchema.additionalType = `https://schema.org/${getBusinessType(businessCategory)}`;
        businessSchema.serviceType = businessCategory;
      }

      businessSchema.priceRange = '$$';

      // Only add aggregateRating if we have real data (avoid Google penalties for fake ratings)
      if (actualRating && actualReviewCount && actualReviewCount > 0) {
        businessSchema.aggregateRating = {
          '@type': 'AggregateRating',
          ratingValue: actualRating.toString(),
          reviewCount: actualReviewCount.toString()
        };
      }

      // Add GeoCoordinates only if real coordinates are provided
      if (geoLatitude && geoLongitude) {
        businessSchema.geo = {
          '@type': 'GeoCoordinates',
          latitude: geoLatitude.toString(),
          longitude: geoLongitude.toString()
        };
      }

      // Add openingHours only if real data is provided
      if (openingHours && Array.isArray(openingHours) && openingHours.length > 0) {
        businessSchema.openingHoursSpecification = openingHours.map(hours => ({
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: hours.dayOfWeek,
          opens: hours.opens,
          closes: hours.closes
        }));
      }


      // Add ServiceArea
      businessSchema.areaServed = {
        '@type': 'City',
        name: 'Varanasi',
        '@id': 'https://www.wikidata.org/wiki/Q79980'
      };

      structuredDataArray.push(businessSchema);
    }

    // Article Schema (if type is article)
    if (type === 'article' && publishedTime) {
      const articleSchema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: title,
        description: description,
        image: image.startsWith('http') ? image : `${siteUrl}${image}`,
        datePublished: publishedTime,
        dateModified: modifiedTime || publishedTime,
        author: {
          '@type': 'Organization',
          name: author
        },
        publisher: {
          '@type': 'Organization',
          name: 'VaranasiHub',
          logo: {
            '@type': 'ImageObject',
            url: `${siteUrl}/logo.png`
          }
        }
      };
      structuredDataArray.push(articleSchema);
    }

    // Service Schema (for service pages)
    if (serviceType) {
      const serviceSchema = {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: title,
        description: description,
        provider: {
          '@type': 'Organization',
          name: 'VaranasiHub',
          url: siteUrl,
          address: {
            '@type': 'PostalAddress',
            addressLocality: 'Varanasi',
            addressRegion: 'Uttar Pradesh',
            addressCountry: 'IN'
          }
        },
        serviceType: serviceType,
        areaServed: serviceArea || {
          '@type': 'City',
          name: 'Varanasi',
          '@id': 'https://www.wikidata.org/wiki/Q79980'
        },
        availableChannel: {
          '@type': 'ServiceChannel',
          serviceUrl: currentUrl,
          serviceType: 'Online'
        }
      };
      structuredDataArray.push(serviceSchema);
    }

    // HowTo Schema (for tutorial/guide pages)
    if (howToSteps && Array.isArray(howToSteps) && howToSteps.length > 0) {
      const howToSchema = {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: title,
        description: description,
        image: image.startsWith('http') ? image : `${siteUrl}${image}`,
        totalTime: 'PT15M', // Default 15 minutes, can be customized
        step: howToSteps.map((step, index) => ({
          '@type': 'HowToStep',
          position: index + 1,
          name: step.name || `Step ${index + 1}`,
          text: step.text || step.description || '',
          image: step.image ? (step.image.startsWith('http') ? step.image : `${siteUrl}${step.image}`) : undefined,
          url: step.url || currentUrl
        })).filter(step => step.name) // Remove empty steps
      };
      structuredDataArray.push(howToSchema);
    }

    // Video Schema (for video content)
    if (videoUrl) {
      const videoSchema = {
        '@context': 'https://schema.org',
        '@type': 'VideoObject',
        name: title,
        description: description,
        thumbnailUrl: videoThumbnail || image.startsWith('http') ? image : `${siteUrl}${image}`,
        uploadDate: videoPublishedDate || publishedTime || new Date().toISOString(),
        duration: videoDuration || 'PT5M', // Default 5 minutes
        contentUrl: videoUrl,
        embedUrl: videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')
          ? videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')
          : videoUrl,
        publisher: {
          '@type': 'Organization',
          name: 'VaranasiHub',
          logo: {
            '@type': 'ImageObject',
            url: `${siteUrl}/logo.png`
          }
        }
      };
      structuredDataArray.push(videoSchema);
    }

    // Product Schema (for pricing/plan pages)
    if (productPrice !== undefined) {
      const productSchema = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: title,
        description: description,
        image: image.startsWith('http') ? image : `${siteUrl}${image}`,
        brand: {
          '@type': 'Brand',
          name: 'VaranasiHub'
        },
        offers: {
          '@type': 'Offer',
          price: productPrice,
          priceCurrency: productCurrency,
          availability: `https://schema.org/${productAvailability}`,
          url: currentUrl,
          priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 1 year from now
        }
      };
      structuredDataArray.push(productSchema);
    }


    // Add hreflang tags for multi-language support
    let hreflangEn = document.querySelector('link[hreflang="en"]');
    if (!hreflangEn) {
      hreflangEn = document.createElement('link');
      hreflangEn.setAttribute('rel', 'alternate');
      hreflangEn.setAttribute('hreflang', 'en');
      hreflangEn.setAttribute('href', currentUrl);
      document.head.appendChild(hreflangEn);
    } else {
      hreflangEn.setAttribute('href', currentUrl);
    }

    let hreflangHi = document.querySelector('link[hreflang="hi"]');
    if (!hreflangHi) {
      hreflangHi = document.createElement('link');
      hreflangHi.setAttribute('rel', 'alternate');
      hreflangHi.setAttribute('hreflang', 'hi');
      hreflangHi.setAttribute('href', `${currentUrl}?lang=hi`);
      document.head.appendChild(hreflangHi);
    } else {
      hreflangHi.setAttribute('href', `${currentUrl}?lang=hi`);
    }

    // Add resource hints for performance
    const preconnectUrls = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://www.google-analytics.com'
    ];

    preconnectUrls.forEach(url => {
      let link = document.querySelector(`link[rel="preconnect"][href="${url}"]`);
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'preconnect');
        link.setAttribute('href', url);
        link.setAttribute('crossorigin', 'anonymous');
        document.head.appendChild(link);
      }
    });

    // Add DNS prefetch for external resources
    const dnsPrefetchUrls = [
      'https://www.google.com',
      'https://www.googletagmanager.com'
    ];

    dnsPrefetchUrls.forEach(url => {
      let link = document.querySelector(`link[rel="dns-prefetch"][href="${url}"]`);
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'dns-prefetch');
        link.setAttribute('href', url);
        document.head.appendChild(link);
      }
    });

    // Add all structured data
    structuredDataArray.forEach((schema, index) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = `structured-data-${index}`;
      script.text = JSON.stringify(schema);
      document.head.appendChild(script);
    });
  }, [title, description, image, currentUrl, type, businessName, businessAddress, businessPhone, businessCategory, keywords, author, publishedTime, modifiedTime, breadcrumbs, faqItems, noindex, nofollow, siteUrl, serviceType, serviceArea, howToSteps, videoUrl, videoThumbnail, videoDuration, videoPublishedDate, productPrice, productCurrency, productAvailability, actualRating, actualReviewCount, geoLatitude, geoLongitude, openingHours, socialLinks]);


  return null;
};

const getBusinessType = (category) => {
  const typeMap = {
    'Restaurant': 'Restaurant',
    'Hotel': 'Hotel',
    'Clinic': 'MedicalBusiness',
    'Shop': 'Store',
    'Library': 'Library',
    'Services': 'LocalBusiness',
  };
  return typeMap[category] || 'LocalBusiness';
};

