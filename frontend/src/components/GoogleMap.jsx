import { useEffect, useRef } from 'react';

export const GoogleMap = ({ 
  address, 
  googleMapLink, 
  businessName,
  className = 'w-full h-64 rounded-xl overflow-hidden'
}) => {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!googleMapLink && !address) return;

    // Extract coordinates from Google Maps link if available
    const extractCoordinates = (link) => {
      if (!link) return null;
      
      // Try to extract from different Google Maps URL formats
      const patterns = [
        /@(-?\d+\.\d+),(-?\d+\.\d+)/, // @lat,lng
        /place\/[^/]+\/@(-?\d+\.\d+),(-?\d+\.\d+)/, // place/name/@lat,lng
        /ll=(-?\d+\.\d+),(-?\d+\.\d+)/, // ll=lat,lng
      ];

      for (const pattern of patterns) {
        const match = link.match(pattern);
        if (match) {
          return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
        }
      }
      return null;
    };

    const coords = extractCoordinates(googleMapLink);

    if (coords && window.google && window.google.maps) {
      const map = new window.google.maps.Map(mapRef.current, {
        center: coords,
        zoom: 15,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'on' }],
          },
        ],
      });

      new window.google.maps.Marker({
        position: coords,
        map: map,
        title: businessName || 'Business Location',
      });
    } else if (address) {
      // Fallback: Use geocoding API or embed
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: address }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const map = new window.google.maps.Map(mapRef.current, {
            center: results[0].geometry.location,
            zoom: 15,
          });

          new window.google.maps.Marker({
            position: results[0].geometry.location,
            map: map,
            title: businessName || address,
          });
        }
      });
    }
  }, [address, googleMapLink, businessName]);

  // If we have a Google Maps link, show embed as fallback
  if (googleMapLink && !window.google) {
    const embedUrl = googleMapLink
      .replace('/maps/', '/maps/embed?pb=')
      .replace('@', '!3d') + '&output=embed';

    return (
      <iframe
        src={embedUrl}
        className={className}
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title={`Map for ${businessName || 'Business'}`}
      />
    );
  }

  return (
    <div ref={mapRef} className={className} />
  );
};

// Component to load Google Maps script
export const GoogleMapsScript = () => {
  useEffect(() => {
    if (!window.google && !document.querySelector('script[src*="maps.googleapis.com"]')) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}&libraries=places`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }, []);

  return null;
};

