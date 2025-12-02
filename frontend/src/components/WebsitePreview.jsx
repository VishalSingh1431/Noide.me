import { useState, useEffect } from 'react';
import { X, Phone, Mail, MapPin, Instagram, Facebook, Globe, Youtube, Clock, Calendar, Gift, ShoppingBag, Map, MessageCircle } from 'lucide-react';

const WebsitePreview = ({ formData, onClose }) => {
  const [imageUrls, setImageUrls] = useState([]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      imageUrls.forEach(url => {
        if (url && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [imageUrls]);

  // Theme configurations (matching backend)
  const themes = {
    modern: {
      primary: 'from-blue-600 via-indigo-600 to-purple-600',
      primarySolid: 'bg-blue-600',
      primaryHover: 'hover:bg-blue-700',
      button: 'bg-blue-600 hover:bg-blue-700',
      accent: 'text-purple-600',
    },
    classic: {
      primary: 'from-amber-600 via-orange-600 to-red-600',
      primarySolid: 'bg-amber-600',
      primaryHover: 'hover:bg-amber-700',
      button: 'bg-amber-600 hover:bg-amber-700',
      accent: 'text-amber-600',
    },
    minimal: {
      primary: 'from-gray-100 via-gray-200 to-gray-300',
      primarySolid: 'bg-gray-600',
      primaryHover: 'hover:bg-gray-700',
      button: 'bg-gray-600 hover:bg-gray-700',
      accent: 'text-gray-600',
    },
  };

  const theme = themes[formData.theme] || themes.modern;

  // Generate object URLs for files and store them
  const [logoUrl, setLogoUrl] = useState(null);
  const [images, setImages] = useState([]);
  const [serviceImageUrls, setServiceImageUrls] = useState({});

  useEffect(() => {
    const urls = [];
    
    // Logo
    if (formData.logo) {
      if (typeof formData.logo === 'string') {
        setLogoUrl(formData.logo);
      } else if (formData.logo instanceof File) {
        const url = URL.createObjectURL(formData.logo);
        setLogoUrl(url);
        urls.push(url);
      }
    } else {
      setLogoUrl(null);
    }
    
    // Images
    const imageUrls = [];
    if (formData.images) {
      formData.images.forEach(img => {
        if (typeof img === 'string') {
          imageUrls.push(img);
        } else if (img instanceof File) {
          const url = URL.createObjectURL(img);
          imageUrls.push(url);
          urls.push(url);
        }
      });
    }
    setImages(imageUrls);
    
    // Service images
    const serviceUrls = {};
    if (formData.services) {
      formData.services.forEach((service, idx) => {
        if (service.image) {
          if (typeof service.image === 'string') {
            serviceUrls[idx] = service.image;
          } else if (service.image instanceof File) {
            const url = URL.createObjectURL(service.image);
            serviceUrls[idx] = url;
            urls.push(url);
          }
        }
      });
    }
    setServiceImageUrls(serviceUrls);
    
    return () => {
      urls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [formData.logo, formData.images, formData.services]);

  // Extract YouTube video ID
  const getYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const videoId = getYouTubeId(formData.youtubeVideo);
  const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : null;

  // Check if business is open now
  const isOpenNow = () => {
    if (!formData.businessHours) return false;
    const now = new Date();
    const day = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];
    const hours = formData.businessHours[day];
    
    if (!hours || !hours.open) return false;
    
    const [startHour, startMin] = hours.start.split(':').map(Number);
    const [endHour, endMin] = hours.end.split(':').map(Number);
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();
    const currentTime = currentHour * 60 + currentMin;
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;
    
    return currentTime >= startTime && currentTime <= endTime;
  };

  // Format business hours
  const formatHours = (day) => {
    const hours = formData.businessHours?.[day];
    if (!hours || !hours.open) return 'Closed';
    return `${hours.start} - ${hours.end}`;
  };

  // Calculate days until expiry
  const daysUntilExpiry = (dateString) => {
    if (!dateString) return null;
    const expiry = new Date(dateString);
    const now = new Date();
    const diff = expiry - now;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  // Check if business hours has any open days
  const hasBusinessHours = () => {
    if (!formData.businessHours) return false;
    return Object.values(formData.businessHours).some(day => day.open);
  };

  // Check if attributes section should be shown
  const hasAttributes = () => {
    if (!formData.googlePlacesData?.attributes) return false;
    const attrs = formData.googlePlacesData.attributes;
    return attrs.takeout || attrs.delivery || attrs.dineIn || attrs.wheelchairAccessibleEntrance || 
           attrs.outdoorSeating || attrs.reservable || attrs.servesBreakfast || attrs.servesLunch || 
           attrs.servesDinner || attrs.servesCoffee || attrs.servesVegetarianFood || attrs.liveMusic;
  };

  // Check if payment options should be shown
  const hasPaymentOptions = () => {
    if (!formData.googlePlacesData?.paymentOptions) return false;
    const pay = formData.googlePlacesData.paymentOptions;
    return pay.acceptsCreditCards || pay.acceptsDebitCards || pay.acceptsCashOnly || pay.acceptsNfc;
  };

  // Check if parking options should be shown
  const hasParkingOptions = () => {
    if (!formData.googlePlacesData?.parkingOptions) return false;
    const park = formData.googlePlacesData.parkingOptions;
    return park.freeParkingLot || park.paidParkingLot || park.streetParking || park.valetParking;
  };

  // Check if social media links exist
  const hasSocialMedia = () => {
    return !!(formData.instagram || formData.facebook || formData.website);
  };

  // Check if contact info exists
  const hasContactInfo = () => {
    return !!(formData.mobileNumber || formData.email || formData.address);
  };

  if (!formData.businessName) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Preview Website</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="text-center py-12">
            <p className="text-gray-600">Please fill in at least the business name to see a preview.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full my-8 max-h-[90vh] overflow-y-auto">
        {/* Preview Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Website Preview</h2>
            <p className="text-sm text-gray-600 mt-1">This is how your website will look</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Preview Content */}
        <div className="p-0">
          {/* Navbar */}
          <nav className={`bg-white border-b-2 ${theme.accent.replace('text-', 'border-')} sticky top-0 z-50 shadow-sm`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {logoUrl ? (
                    <img src={logoUrl} alt={formData.businessName} className="w-12 h-12 object-contain rounded-lg flex-shrink-0" />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-gray-600 font-bold text-xl">{formData.businessName.charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h1 className="text-xl font-bold text-gray-900 truncate">{formData.businessName}</h1>
                    {formData.navbarTagline && (
                      <p className="text-xs text-gray-600 truncate">{formData.navbarTagline}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                  <a href="#home" className="text-gray-700 hover:text-blue-600 font-medium whitespace-nowrap">Home</a>
                  {(formData.services && formData.services.length > 0) && (
                    <a href="#services" className="text-gray-700 hover:text-blue-600 font-medium whitespace-nowrap">Services</a>
                  )}
                  {hasContactInfo() && (
                    <a href="#contact" className="text-gray-700 hover:text-blue-600 font-medium whitespace-nowrap">Contact</a>
                  )}
                </div>
              </div>
            </div>
          </nav>

          {/* Hero Section */}
          <section id="home" className={`bg-gradient-to-r ${theme.primary} text-white py-16 md:py-20`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12">
                {logoUrl ? (
                  <div className="flex-shrink-0">
                    <img src={logoUrl} alt={formData.businessName} className="w-32 h-32 md:w-40 md:h-40 object-contain rounded-2xl bg-white p-4 md:p-6 shadow-2xl" />
                  </div>
                ) : (
                  <div className="flex-shrink-0 w-32 h-32 md:w-40 md:h-40 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-2xl">
                    <span className="text-white text-5xl md:text-6xl font-bold">{formData.businessName.charAt(0).toUpperCase()}</span>
                  </div>
                )}
                <div className="flex-1 text-center md:text-left max-w-2xl">
                  {formData.category && (
                    <div className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold mb-4">
                      {formData.category}
                    </div>
                  )}
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 break-words">{formData.businessName}</h1>
                  {formData.ownerName && (
                    <p className="text-lg md:text-xl text-blue-100 mb-3">Owner: {formData.ownerName}</p>
                  )}
                  {formData.navbarTagline && (
                    <p className="text-base md:text-lg text-blue-100 mb-6 md:mb-8 italic">{formData.navbarTagline}</p>
                  )}
                  {(formData.mobileNumber || formData.whatsappNumber) && (
                    <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                      {formData.mobileNumber && (
                        <a href={`tel:${formData.mobileNumber}`} className={`px-6 py-3 ${theme.button} text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-transform hover:scale-105`}>
                          <Phone className="w-5 h-5" />
                          Call Now
                        </a>
                      )}
                      {formData.whatsappNumber && (
                        <a href={`https://wa.me/${formData.whatsappNumber.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-transform hover:scale-105">
                          <MessageCircle className="w-5 h-5" />
                          WhatsApp
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Description Section */}
          {formData.description && formData.description.trim() && (
            <section className="py-12 md:py-16 bg-gray-50">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 text-center">About Us</h2>
                <p className="text-base md:text-lg text-gray-700 leading-relaxed whitespace-pre-line text-center md:text-left">{formData.description}</p>
              </div>
            </section>
          )}

          {/* Services Section */}
          {formData.services && formData.services.length > 0 && (
            <section id="services" className="py-12 md:py-16 bg-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 md:mb-12 text-center">Our Services</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {formData.services.map((service, idx) => (
                    <div key={idx} className={`bg-white rounded-xl shadow-lg overflow-hidden border-2 ${service.featured ? 'border-yellow-400 ring-2 ring-yellow-200' : 'border-gray-200'} transition-transform hover:scale-105`}>
                      {serviceImageUrls[idx] && (
                        <img src={serviceImageUrls[idx]} alt={service.title || 'Service'} className="w-full h-48 object-cover" />
                      )}
                      <div className="p-6">
                        {service.featured && (
                          <span className="inline-block px-2 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded mb-2">FEATURED</span>
                        )}
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{service.title || 'Service Title'}</h3>
                        {service.description && (
                          <p className="text-gray-600 mb-3">{service.description}</p>
                        )}
                        {service.price && (
                          <p className="text-2xl font-bold text-blue-600">₹{service.price}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Special Offers Section */}
          {formData.specialOffers && formData.specialOffers.length > 0 && (
            <section className="py-12 md:py-16 bg-gradient-to-r from-red-50 to-orange-50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 md:mb-12 text-center">Special Offers</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {formData.specialOffers.map((offer, idx) => {
                    const daysLeft = daysUntilExpiry(offer.expiryDate);
                    return (
                      <div key={idx} className="bg-white rounded-xl shadow-lg p-6 border-2 border-red-300 relative overflow-hidden transition-transform hover:scale-105">
                        {daysLeft !== null && daysLeft <= 3 && (
                          <span className="absolute top-4 right-4 px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full">URGENT</span>
                        )}
                        <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">{offer.title || 'Special Offer'}</h3>
                        {offer.description && (
                          <p className="text-gray-600 mb-4">{offer.description}</p>
                        )}
                        {offer.expiryDate && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 flex-wrap">
                            <Clock className="w-4 h-4" />
                            <span>Expires: {new Date(offer.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            {daysLeft !== null && (
                              <span className={`ml-2 px-2 py-1 rounded ${daysLeft <= 3 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                {daysLeft > 0 ? `${daysLeft} days left` : 'Expired'}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {/* Business Hours Section */}
          {hasBusinessHours() && (
            <section className="py-12 md:py-16 bg-white">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8 text-center">Business Hours</h2>
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center justify-center gap-3 mb-6">
                    <div className={`w-4 h-4 rounded-full ${isOpenNow() ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className={`text-lg font-semibold ${isOpenNow() ? 'text-green-700' : 'text-red-700'}`}>
                      {isOpenNow() ? 'Open Now' : 'Closed Now'}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                      <div key={day} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0">
                        <span className="font-medium text-gray-900 capitalize">{day}</span>
                        <span className="text-gray-600">{formatHours(day)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Google Reviews Section */}
          {formData.googlePlacesData?.reviews && formData.googlePlacesData.reviews.length > 0 && (
            <section className="py-12 md:py-16 bg-gray-50">
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8 md:mb-12">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Google Reviews</h2>
                  {formData.googlePlacesData.rating && (
                    <div className="flex items-center justify-center gap-2 mb-2 flex-wrap">
                      <span className="text-3xl font-bold text-gray-900">{formData.googlePlacesData.rating}</span>
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <span key={i}>{i < Math.round(formData.googlePlacesData.rating) ? '★' : '☆'}</span>
                        ))}
                      </div>
                      {formData.googlePlacesData.totalRatings > 0 && (
                        <span className="text-gray-600">({formData.googlePlacesData.totalRatings} reviews)</span>
                      )}
                    </div>
                  )}
                  {formData.googlePlacesData.priceLevel !== null && formData.googlePlacesData.priceLevel !== undefined && (
                    <p className="text-gray-600">Price Level: {'$'.repeat(formData.googlePlacesData.priceLevel + 1)}</p>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {formData.googlePlacesData.reviews.slice(0, 6).map((review, idx) => (
                    <div key={idx} className="bg-white rounded-xl shadow-md p-6">
                      <div className="flex items-center gap-3 mb-4">
                        {review.authorPhoto ? (
                          <img src={review.authorPhoto} alt={review.authorName} className="w-12 h-12 rounded-full object-cover" />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-blue-600 font-semibold">{review.authorName?.charAt(0) || 'U'}</span>
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-900 truncate">{review.authorName || 'Anonymous'}</p>
                          <div className="flex text-yellow-400 text-sm">
                            {[...Array(5)].map((_, i) => (
                              <span key={i}>{i < review.rating ? '★' : '☆'}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                      {review.text && (
                        <p className="text-gray-700 text-sm line-clamp-4">{review.text}</p>
                      )}
                      {review.time && (
                        <p className="text-gray-500 text-xs mt-3">{review.time}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Business Attributes Section */}
          {(hasAttributes() || hasPaymentOptions() || hasParkingOptions()) && (
            <section className="py-12 md:py-16 bg-white">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {hasAttributes() && (
                  <>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8 text-center">Amenities & Features</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                      {formData.googlePlacesData.attributes.takeout && (
                        <div className="bg-blue-50 rounded-lg p-4 text-center">
                          <span className="text-sm font-semibold text-blue-700">✓ Takeout</span>
                        </div>
                      )}
                      {formData.googlePlacesData.attributes.delivery && (
                        <div className="bg-green-50 rounded-lg p-4 text-center">
                          <span className="text-sm font-semibold text-green-700">✓ Delivery</span>
                        </div>
                      )}
                      {formData.googlePlacesData.attributes.dineIn && (
                        <div className="bg-purple-50 rounded-lg p-4 text-center">
                          <span className="text-sm font-semibold text-purple-700">✓ Dine In</span>
                        </div>
                      )}
                      {formData.googlePlacesData.attributes.wheelchairAccessibleEntrance && (
                        <div className="bg-orange-50 rounded-lg p-4 text-center">
                          <span className="text-sm font-semibold text-orange-700">♿ Wheelchair Accessible</span>
                        </div>
                      )}
                      {formData.googlePlacesData.attributes.outdoorSeating && (
                        <div className="bg-teal-50 rounded-lg p-4 text-center">
                          <span className="text-sm font-semibold text-teal-700">✓ Outdoor Seating</span>
                        </div>
                      )}
                      {formData.googlePlacesData.attributes.reservable && (
                        <div className="bg-pink-50 rounded-lg p-4 text-center">
                          <span className="text-sm font-semibold text-pink-700">✓ Reservations</span>
                        </div>
                      )}
                      {formData.googlePlacesData.attributes.servesBreakfast && (
                        <div className="bg-yellow-50 rounded-lg p-4 text-center">
                          <span className="text-sm font-semibold text-yellow-700">🍳 Breakfast</span>
                        </div>
                      )}
                      {formData.googlePlacesData.attributes.servesLunch && (
                        <div className="bg-indigo-50 rounded-lg p-4 text-center">
                          <span className="text-sm font-semibold text-indigo-700">🍽️ Lunch</span>
                        </div>
                      )}
                      {formData.googlePlacesData.attributes.servesDinner && (
                        <div className="bg-red-50 rounded-lg p-4 text-center">
                          <span className="text-sm font-semibold text-red-700">🍷 Dinner</span>
                        </div>
                      )}
                      {formData.googlePlacesData.attributes.servesCoffee && (
                        <div className="bg-amber-50 rounded-lg p-4 text-center">
                          <span className="text-sm font-semibold text-amber-700">☕ Coffee</span>
                        </div>
                      )}
                      {formData.googlePlacesData.attributes.servesVegetarianFood && (
                        <div className="bg-lime-50 rounded-lg p-4 text-center">
                          <span className="text-sm font-semibold text-lime-700">🌱 Vegetarian</span>
                        </div>
                      )}
                      {formData.googlePlacesData.attributes.liveMusic && (
                        <div className="bg-violet-50 rounded-lg p-4 text-center">
                          <span className="text-sm font-semibold text-violet-700">🎵 Live Music</span>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Payment Options */}
                {hasPaymentOptions() && (
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">Payment Methods</h3>
                    <div className="flex flex-wrap justify-center gap-3">
                      {formData.googlePlacesData.paymentOptions.acceptsCreditCards && (
                        <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">💳 Credit Cards</span>
                      )}
                      {formData.googlePlacesData.paymentOptions.acceptsDebitCards && (
                        <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium">💳 Debit Cards</span>
                      )}
                      {formData.googlePlacesData.paymentOptions.acceptsCashOnly && (
                        <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">💵 Cash Only</span>
                      )}
                      {formData.googlePlacesData.paymentOptions.acceptsNfc && (
                        <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">📱 NFC Payment</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Parking Options */}
                {hasParkingOptions() && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">Parking</h3>
                    <div className="flex flex-wrap justify-center gap-3">
                      {formData.googlePlacesData.parkingOptions.freeParkingLot && (
                        <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium">🅿️ Free Parking Lot</span>
                      )}
                      {formData.googlePlacesData.parkingOptions.paidParkingLot && (
                        <span className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">🅿️ Paid Parking Lot</span>
                      )}
                      {formData.googlePlacesData.parkingOptions.streetParking && (
                        <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">🅿️ Street Parking</span>
                      )}
                      {formData.googlePlacesData.parkingOptions.valetParking && (
                        <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">🅿️ Valet Parking</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Appointment Section */}
          {formData.appointmentSettings && formData.appointmentSettings.contactMethod && (formData.whatsappNumber || formData.mobileNumber) && (
            <section className="py-12 md:py-16 bg-blue-50">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8 text-center">Book an Appointment</h2>
                <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                  <Calendar className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                  <p className="text-lg text-gray-700 mb-6">Ready to get started? Book your appointment now!</p>
                  {formData.appointmentSettings.contactMethod === 'whatsapp' && formData.whatsappNumber ? (
                    <a
                      href={`https://wa.me/${formData.whatsappNumber.replace(/\D/g, '')}?text=Hello, I would like to book an appointment.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold text-lg transition-transform hover:scale-105"
                    >
                      Book via WhatsApp
                    </a>
                  ) : formData.mobileNumber ? (
                    <a
                      href={`tel:${formData.mobileNumber}`}
                      className={`inline-block px-8 py-4 ${theme.button} text-white rounded-lg font-semibold text-lg transition-transform hover:scale-105`}
                    >
                      Call to Book
                    </a>
                  ) : null}
                </div>
              </div>
            </section>
          )}

          {/* Video Section */}
          {embedUrl && (
            <section className="py-12 md:py-16 bg-gray-50">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8 text-center">Watch Our Video</h2>
                <div className="aspect-video rounded-xl overflow-hidden shadow-2xl">
                  <iframe
                    src={embedUrl}
                    title="Business Video"
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            </section>
          )}

          {/* Gallery Section */}
          {images.length > 0 && (
            <section className="py-12 md:py-16 bg-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 md:mb-12 text-center">Gallery</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {images.map((img, idx) => (
                    <img key={idx} src={img} alt={`Gallery ${idx + 1}`} className="w-full h-48 object-cover rounded-lg shadow-md transition-transform hover:scale-105" />
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Contact Section */}
          {hasContactInfo() && (
            <section id="contact" className="py-12 md:py-16 bg-gray-900 text-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-2xl md:text-3xl font-bold mb-8 md:mb-12 text-center">Contact Us</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Get in Touch</h3>
                    <div className="space-y-4">
                      {formData.mobileNumber && (
                        <div className="flex items-center gap-3">
                          <Phone className="w-5 h-5 flex-shrink-0" />
                          <a href={`tel:${formData.mobileNumber}`} className="hover:text-blue-400 break-all">{formData.mobileNumber}</a>
                        </div>
                      )}
                      {formData.email && (
                        <div className="flex items-center gap-3">
                          <Mail className="w-5 h-5 flex-shrink-0" />
                          <a href={`mailto:${formData.email}`} className="hover:text-blue-400 break-all">{formData.email}</a>
                        </div>
                      )}
                      {formData.address && (
                        <div className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 mt-1 flex-shrink-0" />
                          <span className="break-words">{formData.address}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {hasSocialMedia() && (
                    <div>
                      <h3 className="text-xl font-semibold mb-4">Follow Us</h3>
                      <div className="flex gap-4 flex-wrap">
                        {formData.instagram && (
                          <a href={formData.instagram} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-pink-600 rounded-full flex items-center justify-center hover:bg-pink-700 transition-transform hover:scale-110">
                            <Instagram className="w-6 h-6" />
                          </a>
                        )}
                        {formData.facebook && (
                          <a href={formData.facebook} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-transform hover:scale-110">
                            <Facebook className="w-6 h-6" />
                          </a>
                        )}
                        {formData.website && (
                          <a href={formData.website} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center hover:bg-gray-700 transition-transform hover:scale-110">
                            <Globe className="w-6 h-6" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                {formData.googleMapLink && (
                  <div className="mt-8">
                    <h3 className="text-xl font-semibold mb-4 text-center">Find Us</h3>
                    <div className="bg-gray-800 rounded-lg p-4 space-y-4">
                      {/* Embedded Google Map */}
                      <div className="w-full h-64 rounded-lg overflow-hidden bg-gray-700">
                        {(() => {
                          // Extract place ID or use address for embedding
                          let embedUrl = '';
                          const mapLink = formData.googleMapLink;
                          
                          // Try to extract place ID from URL (format: .../place/PLACE_ID/...)
                          const placeIdMatch = mapLink.match(/\/place\/([^\/]+)/);
                          if (placeIdMatch) {
                            const placeId = placeIdMatch[1];
                            // Use Google Maps Embed API with place_id
                            embedUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyCYlXSxKwiSFqoPhivOu7Ev028HnNV42us&q=place_id:${placeId}`;
                          } else if (formData.address) {
                            // Fallback: use the address for embedding
                            embedUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyCYlXSxKwiSFqoPhivOu7Ev028HnNV42us&q=${encodeURIComponent(formData.address)}`;
                          }
                          
                          return embedUrl ? (
                            <iframe
                              src={embedUrl}
                              width="100%"
                              height="100%"
                              style={{ border: 0 }}
                              allowFullScreen=""
                              loading="lazy"
                              referrerPolicy="no-referrer-when-downgrade"
                              title="Business Location"
                            ></iframe>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <p>Map unavailable</p>
                            </div>
                          );
                        })()}
                      </div>
                      {/* Link to open in Google Maps */}
                      <a 
                        href={formData.googleMapLink} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-400 hover:text-blue-300 flex items-center gap-2 justify-center transition-colors"
                      >
                        <Map className="w-5 h-5" />
                        Open in Google Maps
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Footer */}
          <footer className={`bg-gradient-to-r ${theme.footer || 'from-gray-900 via-gray-800 to-gray-900'} text-white py-8 md:py-12`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <h3 className="text-xl font-bold mb-4">{formData.businessName}</h3>
                  {formData.footerDescription && formData.footerDescription.trim() && (
                    <p className="text-gray-300">{formData.footerDescription}</p>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold mb-4">Quick Links</h4>
                  <ul className="space-y-2 text-gray-300">
                    <li><a href="#home" className="hover:text-white transition-colors">Home</a></li>
                    {(formData.services && formData.services.length > 0) && (
                      <li><a href="#services" className="hover:text-white transition-colors">Services</a></li>
                    )}
                    {hasContactInfo() && (
                      <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
                    )}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-4">Contact</h4>
                  <ul className="space-y-2 text-gray-300">
                    {formData.mobileNumber && <li className="break-all">{formData.mobileNumber}</li>}
                    {formData.email && <li className="break-all">{formData.email}</li>}
                  </ul>
                </div>
              </div>
              <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
                <p>&copy; {new Date().getFullYear()} {formData.businessName}. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default WebsitePreview;
