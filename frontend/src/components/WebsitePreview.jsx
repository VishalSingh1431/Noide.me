import { useState, useEffect } from 'react';
import { X, Phone, Mail, MapPin, Instagram, Facebook, Globe, Youtube, Clock, Calendar, Gift, ShoppingBag, Map, MessageCircle, Star, ChevronLeft, ChevronRight, Copy, Check, ArrowUp, Share2, Menu, ChevronDown, ChevronUp } from 'lucide-react';

const WebsitePreview = ({ formData, onClose }) => {
  const [imageUrls, setImageUrls] = useState([]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [showReadMore, setShowReadMore] = useState(false);
  const [currentReviewPage, setCurrentReviewPage] = useState(0);
  const [currentOfferPage, setCurrentOfferPage] = useState(0);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [copiedText, setCopiedText] = useState('');

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

  // Lightbox functions
  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const nextImage = () => {
    setLightboxIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setLightboxIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Copy to clipboard
  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedText(label);
      setTimeout(() => setCopiedText(''), 2000);
    });
  };

  // Scroll to top
  const scrollToTop = () => {
    const previewContent = document.querySelector('.preview-content');
    if (previewContent) {
      previewContent.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Show back to top button on scroll
  useEffect(() => {
    const handleScroll = () => {
      const previewContent = document.querySelector('.preview-content');
      if (previewContent) {
        setShowBackToTop(previewContent.scrollTop > 300);
      }
    };
    const previewContent = document.querySelector('.preview-content');
    if (previewContent) {
      previewContent.addEventListener('scroll', handleScroll);
      return () => previewContent.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKeyPress = (e) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [lightboxOpen, lightboxIndex, images.length]);

  // Calculate stats
  const stats = {
    yearsInBusiness: formData.googlePlacesData?.yearsInBusiness || 5,
    customersServed: formData.googlePlacesData?.customersServed || 1000,
    rating: formData.googlePlacesData?.rating || 4.5,
    totalRatings: formData.googlePlacesData?.totalRatings || 50,
  };

  // Reviews pagination
  const reviewsPerPage = 6;
  const totalReviewPages = formData.googlePlacesData?.reviews
    ? Math.ceil(formData.googlePlacesData.reviews.length / reviewsPerPage)
    : 0;
  const paginatedReviews = formData.googlePlacesData?.reviews
    ? formData.googlePlacesData.reviews.slice(
      currentReviewPage * reviewsPerPage,
      (currentReviewPage + 1) * reviewsPerPage
    )
    : [];

  // Special offers pagination
  const offersPerPage = 2;
  const totalOfferPages = formData.specialOffers
    ? Math.ceil(formData.specialOffers.length / offersPerPage)
    : 0;
  const paginatedOffers = formData.specialOffers
    ? formData.specialOffers.slice(
      currentOfferPage * offersPerPage,
      (currentOfferPage + 1) * offersPerPage
    )
    : [];

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
    <div className="fixed inset-0 bg-transparent z-50 flex items-center justify-center p-4 overflow-y-auto">

      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full my-4 sm:my-8 max-h-[90vh] overflow-y-auto">
        {/* Preview Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 z-10">
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Website Preview</h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">This is how your website will look</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg self-start sm:self-auto"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Preview Content */}
        <div className="p-0 preview-content overflow-y-auto" style={{ maxHeight: 'calc(90vh - 80px)' }}>
          {/* Enhanced Navbar with Glassmorphism */}
          <nav className={`bg-white/95 backdrop-blur-md border-b-2 ${theme.accent.replace('text-', 'border-')} sticky top-0 z-50 shadow-lg transition-all duration-300`}>
            <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4">
              <div className="flex items-center justify-between gap-2 sm:gap-4">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  {logoUrl ? (
                    <img src={logoUrl} alt={formData.businessName} className="w-10 h-10 sm:w-12 sm:h-12 object-contain rounded-lg flex-shrink-0 shadow-md" />
                  ) : (
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                      <span className="text-white font-bold text-lg sm:text-xl">{formData.businessName.charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h1 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 truncate">{formData.businessName}</h1>

                  </div>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-4 text-sm">
                  <a href="#home" className="text-gray-700 hover:text-blue-600 font-medium whitespace-nowrap transition-colors">Home</a>
                  {formData.description && (
                    <a href="#about" className="text-gray-700 hover:text-blue-600 font-medium whitespace-nowrap transition-colors">About</a>
                  )}
                  {(formData.services && formData.services.length > 0) && (
                    <a href="#services" className="text-gray-700 hover:text-blue-600 font-medium whitespace-nowrap transition-colors">Services</a>
                  )}
                  {images.length > 0 && (
                    <a href="#gallery" className="text-gray-700 hover:text-blue-600 font-medium whitespace-nowrap transition-colors">Gallery</a>
                  )}
                  {hasContactInfo() && (
                    <a href="#contact" className="text-gray-700 hover:text-blue-600 font-medium whitespace-nowrap transition-colors">Contact</a>
                  )}
                  {/* Quick Contact Icons */}
                  {formData.mobileNumber && (
                    <a href={`tel:${formData.mobileNumber}`} className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors" title="Call Now">
                      <Phone className="w-4 h-4" />
                    </a>
                  )}
                  {formData.whatsappNumber && (
                    <a href={`https://wa.me/${formData.whatsappNumber.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-green-50 hover:bg-green-100 text-green-600 transition-colors" title="WhatsApp">
                      <MessageCircle className="w-4 h-4" />
                    </a>
                  )}
                </div>

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Toggle menu"
                >
                  {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>

              {/* Mobile Menu */}
              {showMobileMenu && (
                <div className="md:hidden mt-4 pt-4 border-t border-gray-200 space-y-2">
                  <a href="#home" onClick={() => setShowMobileMenu(false)} className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors">Home</a>
                  {formData.description && (
                    <a href="#about" onClick={() => setShowMobileMenu(false)} className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors">About</a>
                  )}
                  {(formData.services && formData.services.length > 0) && (
                    <a href="#services" onClick={() => setShowMobileMenu(false)} className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors">Services</a>
                  )}
                  {images.length > 0 && (
                    <a href="#gallery" onClick={() => setShowMobileMenu(false)} className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors">Gallery</a>
                  )}
                  {hasContactInfo() && (
                    <a href="#contact" onClick={() => setShowMobileMenu(false)} className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors">Contact</a>
                  )}
                  <div className="flex gap-2 pt-2">
                    {formData.mobileNumber && (
                      <a href={`tel:${formData.mobileNumber}`} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-center font-medium hover:bg-blue-700 transition-colors">
                        <Phone className="w-4 h-4 inline mr-2" />
                        Call
                      </a>
                    )}
                    {formData.whatsappNumber && (
                      <a href={`https://wa.me/${formData.whatsappNumber.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-center font-medium hover:bg-green-700 transition-colors">
                        <MessageCircle className="w-4 h-4 inline mr-2" />
                        WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Enhanced Hero Section - Name/Address Left, Image Right (Circular) */}
          <section id="home" className={`relative bg-gradient-to-r ${theme.primary} text-white py-12 md:py-16 lg:py-20 overflow-hidden`}>

            {/* Animated Background Elements */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
                {/* Left Side - Name and Address */}
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-3 md:mb-4 break-words leading-tight tracking-tight">
                    {formData.businessName}
                  </h1>

                  {formData.address && (
                    <div className="flex items-start gap-2 text-white/90 mb-2">
                      <MapPin className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0 mt-0.5" />
                      <p className="text-base sm:text-lg md:text-xl font-medium leading-relaxed">
                        {formData.address}
                      </p>
                    </div>
                  )}

                  {formData.category && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold mt-3 border border-white/30">

                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                      {formData.category}
                    </div>
                  )}
                </div >

  {/* Right Side - Quarter Circle Image */ }
  < div className = "flex-shrink-0" >
  {
    logoUrl?(
                    <div 
                      className = "w-64 h-40 sm:w-80 sm:h-52 md:w-96 md:h-64 lg:w-[28rem] lg:h-[20rem] bg-white/20 backdrop-blur-md p-2 md:p-3 shadow-2xl border-4 border-white/30 overflow-hidden transition-transform duration-300 hover:scale-105"
                      style = {{
        clipPath: 'ellipse(400% 400% at 100% 0%)',
        borderRadius: '0'
                      }}
    >
    <img
      src={logoUrl}
      alt={formData.businessName}
      className="w-full h-full object-cover"
      style={{
        clipPath: 'ellipse(400% 400% at 100% 0%)'
      }}
    />
                    </div >
                  ) : (
  <div
    className="w-64 h-40 sm:w-80 sm:h-52 md:w-96 md:h-64 lg:w-[28rem] lg:h-[20rem] bg-white/20 backdrop-blur-md flex items-center justify-center shadow-2xl border-4 border-white/30"
    style={{
      clipPath: 'ellipse(400% 400% at 100% 0%)'
    }}
  >
    <span className="text-white text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold">
      {formData.businessName.charAt(0).toUpperCase()}
    </span>
      </div>
    )}
  </div>
              </div >
            </div >
          </section >

  {/* Quick Contact Info Section */ }
{
  (formData.businessHours || formData.address) && (
    <section className="py-8 md:py-12 bg-gradient-to-br from-gray-50 to-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {formData.businessHours && Object.keys(formData.businessHours).length > 0 && (
            <div className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900">Business Hours</h3>
              </div>
              <div className="space-y-2">
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                  const hours = formData.businessHours[day];
                  if (!hours) return null;
                  const now = new Date();
                  const currentDay = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];
                  const isToday = day === currentDay;

                  return (
                    <div
                      key={day}
                      className={`flex items-center justify-between p-3 rounded-lg border ${isToday
                        ? 'bg-blue-50 border-blue-300'
                        : 'bg-gray-50 border-gray-200'
                        }`}
                    >
                      <span className={`font-semibold text-sm md:text-base capitalize ${isToday ? 'text-blue-700' : 'text-gray-700'}`}>
                        {day}
                      </span>
                      {hours.open ? (
                        <span className={`font-medium text-sm md:text-base ${isToday ? 'text-blue-700' : 'text-gray-600'}`}>
                          {hours.start} - {hours.end}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic text-sm md:text-base">Closed</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {formData.address && (
            <div className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900">Location</h3>
              </div>
              <div className="text-gray-700 text-sm md:text-base leading-relaxed mb-4">
                {formData.address}
              </div>
              {formData.address && (
                <div className="mt-4 rounded-lg overflow-hidden border-2 border-gray-200 shadow-md">
                  <iframe
                    width="100%"
                    height="300"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps?q=${encodeURIComponent(formData.address)}&output=embed`}
                    title={`Map showing ${formData.address}`}
                    className="w-full"
                  ></iframe>
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </section>
  )
}

{/* Enhanced About Section - Always Visible */ }
<section id="about" className="py-12 md:py-16 bg-gray-50">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-8 md:mb-12 text-center">
      About <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Us</span>
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
      <div className="order-2 md:order-1">
        <div className="prose prose-lg max-w-none">
          {/* Business Name and Category */}
          <div className="mb-4">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{formData.businessName}</h3>
            {formData.category && (
              <span className="inline-block px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-semibold mb-4">
                {formData.category}
              </span>
            )}
          </div>

          {/* Owner Name */}
          {formData.ownerName && (
            <div className="mb-4">
              <p className="text-gray-600 text-sm font-medium mb-1">Owner</p>
              <p className="text-lg font-semibold text-gray-900">{formData.ownerName}</p>
            </div>
          )}

          {/* Description */}
          {formData.description && formData.description.trim() ? (
            <>
              {formData.description.length > 300 && !showReadMore ? (
                <>
                  <p className="text-base md:text-lg text-gray-700 leading-relaxed whitespace-pre-line">
                    {formData.description.substring(0, 300)}...
                  </p>
                  <button
                    onClick={() => setShowReadMore(true)}
                    className="mt-4 text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-2"
                  >
                    Read More
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <p className="text-base md:text-lg text-gray-700 leading-relaxed whitespace-pre-line">
                    {formData.description}
                  </p>
                  {formData.description.length > 300 && showReadMore && (
                    <button
                      onClick={() => setShowReadMore(false)}
                      className="mt-4 text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-2"
                    >
                      Read Less
                      <ChevronUp className="w-4 h-4" />
                    </button>
                  )}
                </>
              )}
            </>
          ) : (
            <p className="text-base md:text-lg text-gray-600 leading-relaxed italic">
              Welcome to {formData.businessName}! We are committed to providing excellent service and quality products to our customers in Varanasi.
            </p>
          )}
        </div>
      </div>
      {images.length > 0 ? (
        <div className="order-1 md:order-2">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl">
            <img
              src={images[0]}
              alt={formData.businessName}
              className="w-full h-64 md:h-80 object-cover cursor-pointer"
              onClick={() => openLightbox(0)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
              <span className="text-white text-sm font-medium">Click to view gallery</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="order-1 md:order-2">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-blue-100 to-purple-100 h-64 md:h-80 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-4xl font-bold">{formData.businessName.charAt(0).toUpperCase()}</span>
              </div>
              <p className="text-gray-600 font-medium">{formData.businessName}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
</section>

{/* Enhanced Services Section - Better Cards with Hover Effects */ }
{
  formData.services && formData.services.length > 0 && (
    <section id="services" className="py-12 md:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-8 md:mb-12 text-center">
          Our <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Services</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {formData.services.map((service, idx) => (
            <div
              key={idx}
              className={`group bg-white rounded-2xl shadow-lg overflow-hidden border-2 transition-all duration-300 hover:scale-105 hover:shadow-2xl ${service.featured
                ? 'border-yellow-400 ring-4 ring-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50'
                : 'border-gray-200 hover:border-blue-300'
                }`}
            >
              {serviceImageUrls[idx] ? (
                <div className="relative overflow-hidden h-56">
                  <img
                    src={serviceImageUrls[idx]}
                    alt={service.title || 'Service'}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  {service.featured && (
                    <div className="absolute top-4 left-4 px-3 py-1 bg-yellow-400 text-yellow-900 text-xs font-black rounded-full shadow-lg">
                      ⭐ FEATURED
                    </div>
                  )}
                </div>
              ) : (
                <div className={`h-56 bg-gradient-to-br ${service.featured ? 'from-yellow-200 to-orange-200' : 'from-blue-100 to-purple-100'} flex items-center justify-center`}>
                  <ShoppingBag className={`w-16 h-16 ${service.featured ? 'text-yellow-700' : 'text-blue-600'} opacity-50`} />
                </div>
              )}
              <div className="p-6">
                {service.featured && !serviceImageUrls[idx] && (
                  <span className="inline-block px-3 py-1 bg-yellow-400 text-yellow-900 text-xs font-black rounded-full mb-3 shadow-md">
                    ⭐ FEATURED
                  </span>
                )}
                <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-3">{service.title || 'Service Title'}</h3>
                {service.description && (
                  <p className="text-gray-600 mb-4 leading-relaxed line-clamp-3">{service.description}</p>
                )}
                {service.price && (
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-blue-600">₹{service.price}</span>
                    <span className="text-sm text-gray-500">per service</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

{/* Enhanced Special Offers Section - Carousel with Countdown */ }
{
  formData.specialOffers && formData.specialOffers.length > 0 && (
    <section className="py-12 md:py-16 bg-gradient-to-r from-red-50 via-orange-50 to-yellow-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-64 h-64 bg-red-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-orange-500 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
            Special <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">Offers</span>
          </h2>
          <p className="text-gray-600">Limited time offers - Don't miss out!</p>
        </div>

        {/* Offers Carousel */}
        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {paginatedOffers.map((offer, idx) => {
              const daysLeft = daysUntilExpiry(offer.expiryDate);
              const isUrgent = daysLeft !== null && daysLeft <= 3;
              const isExpired = daysLeft !== null && daysLeft <= 0;

              return (
                <div
                  key={idx}
                  className={`bg-white rounded-2xl shadow-xl p-6 md:p-8 border-2 relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl ${isUrgent ? 'border-red-400 ring-4 ring-red-200' :
                    isExpired ? 'border-gray-300 opacity-60' :
                      'border-orange-300'
                    }`}
                >
                  {/* Urgent Badge */}
                  {isUrgent && (
                    <div className="absolute top-0 right-0 bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-bl-2xl shadow-lg">
                      <span className="text-xs font-bold animate-pulse">⚡ URGENT</span>
                    </div>
                  )}

                  {/* Expired Badge */}
                  {isExpired && (
                    <div className="absolute top-0 right-0 bg-gray-600 text-white px-4 py-2 rounded-bl-2xl">
                      <span className="text-xs font-bold">EXPIRED</span>
                    </div>
                  )}

                  <div className="flex items-start gap-3 mb-4">
                    <Gift className={`w-8 h-8 ${isUrgent ? 'text-red-600' : 'text-orange-600'}`} />
                    <div className="flex-1">
                      <h3 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">{offer.title || 'Special Offer'}</h3>
                      {offer.description && (
                        <p className="text-gray-600 mb-4 leading-relaxed">{offer.description}</p>
                      )}
                    </div>
                  </div>

                  {offer.expiryDate && (
                    <div className="flex items-center justify-between flex-wrap gap-3 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium">
                          Expires: {new Date(offer.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      {daysLeft !== null && (
                        <div className={`px-4 py-2 rounded-full font-bold text-sm ${isUrgent ? 'bg-red-100 text-red-700 animate-pulse' :
                          isExpired ? 'bg-gray-100 text-gray-500' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                          {isExpired ? 'Expired' : isUrgent ? `⚠️ ${daysLeft} days left!` : `⏰ ${daysLeft} days left`}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Carousel Navigation */}
          {totalOfferPages > 1 && (
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setCurrentOfferPage(prev => Math.max(0, prev - 1))}
                disabled={currentOfferPage === 0}
                className="p-2 rounded-full bg-white border-2 border-gray-300 hover:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm text-gray-600 font-medium">
                {currentOfferPage + 1} / {totalOfferPages}
              </span>
              <button
                onClick={() => setCurrentOfferPage(prev => Math.min(totalOfferPages - 1, prev + 1))}
                disabled={currentOfferPage === totalOfferPages - 1}
                className="p-2 rounded-full bg-white border-2 border-gray-300 hover:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

{/* Business Attributes Section */ }
{
  (hasAttributes() || hasPaymentOptions() || hasParkingOptions()) && (
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
  )
}

{/* Appointment Section */ }
{
  formData.appointmentSettings && formData.appointmentSettings.contactMethod && (formData.whatsappNumber || formData.mobileNumber) && (
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
  )
}

{/* Enhanced Video Section */ }
{
  embedUrl && (
    <section className="py-12 md:py-16 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-8 md:mb-12 text-center">
  Our < span className = "bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent" > Video</span >
                </h2 >
    <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
      <iframe
        src={embedUrl}
        title="Business Video"
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/20 to-transparent"></div>
    </div>
  {
    formData.youtubeVideo && (
      <div className="text-center mt-6">
        <a
          href={formData.youtubeVideo}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors"
        >
          <Youtube className="w-5 h-5" />
          Watch on YouTube
        </a>
      </div>
    )
  }
              </div >
            </section >
          )
}

{/* Enhanced Gallery Section - Masonry Grid with Lightbox */ }
{
  images.length > 0 && (
    <section id="gallery" className="py-12 md:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-8 md:mb-12 text-center">
          Photo <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Gallery</span>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {images.map((img, idx) => (
            <div
              key={idx}
              className="relative group cursor-pointer rounded-lg overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300"
              onClick={() => openLightbox(idx)}
            >
              <img
                src={img}
                alt={`Gallery ${idx + 1}`}
                className="w-full h-48 md:h-56 object-cover transition-transform duration-300 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-white/90 backdrop-blur-sm rounded-full p-3">
                    <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

{/* Lightbox Modal */ }
{
  lightboxOpen && images.length > 0 && (
    <div
      className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center p-4"
      onClick={closeLightbox}
    >
      <button
        onClick={closeLightbox}
        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-[10000] bg-black/50 rounded-full p-2 hover:bg-black/70"
        aria-label="Close lightbox"
      >
        <X className="w-6 h-6 sm:w-8 sm:h-8" />
      </button>

      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); prevImage(); }}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-[10000] bg-black/50 rounded-full p-2 sm:p-3 hover:bg-black/70"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); nextImage(); }}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-[10000] bg-black/50 rounded-full p-2 sm:p-3 hover:bg-black/70"
            aria-label="Next image"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </>
      )}

      <div
        className="max-w-6xl w-full max-h-[85vh] px-4"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={images[lightboxIndex]}
          alt={`Gallery ${lightboxIndex + 1}`}
          className="w-full h-auto max-h-[75vh] object-contain rounded-lg mx-auto"
        />
        {images.length > 1 && (
          <div className="text-center text-white mt-4 text-sm sm:text-base">
            {lightboxIndex + 1} / {images.length}
          </div>
        )}
      </div>
    </div>
  )
}

{/* Contact Section */ }
{
  hasContactInfo() && (
    <section id="contact" className="py-12 md:py-16 bg-white text-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 md:mb-12 text-center text-gray-900">Contact Us</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900">Get in Touch</h3>
            <div className="space-y-4">
              {formData.mobileNumber && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 flex-shrink-0 text-gray-600" />
                  <a href={`tel:${formData.mobileNumber}`} className="text-gray-700 hover:text-blue-600 break-all transition-colors">{formData.mobileNumber}</a>
                              </div>
                            )}
                            {formData.email && (
                              <div className="flex items-center gap-3">
                          <Mail className="w-5 h-5 flex-shrink-0 text-gray-600" />
                          <a href={`mailto:${formData.email}`} className="text-gray-700 hover:text-blue-600 break-all transition-colors">{formData.email}</a>
                        </div >
                      )
}
{
  formData.address && (
    <div className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 mt-1 flex-shrink-0 text-gray-600" />
                          <span className="break-words text-gray-700">{formData.address}</span>
                        </div >
                      )
}
                    </div >
                  </div >
  { hasSocialMedia() && (
    <div>
      <h3 className="text-xl font-semibold mb-4 text-gray-900">Follow Us</h3>

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
    </div >
  )}
                </div >
{
  formData.googleMapLink && (
    <div className="mt-8">
      <h3 className="text-2xl font-bold mb-6 text-center flex items-center justify-center gap-2">
        <Map className="w-6 h-6" />
        Find Us on Map
      </h3>
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 md:p-6 space-y-4 border border-white/20">
        {/* Enhanced Embedded Google Map */}
        <div className="w-full h-64 md:h-80 rounded-xl overflow-hidden bg-gray-700 shadow-2xl border-2 border-white/20">
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
                className="w-full h-full"
              ></iframe>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <p>Map unavailable</p>
              </div>
            );
          })()}
        </div>
        {/* Enhanced Link to open in Google Maps */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href={formData.googleMapLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
          >
            <Map className="w-5 h-5" />
            Open in Google Maps
          </a>
          {formData.address && (
            <button
              onClick={() => copyToClipboard(formData.address, 'map')}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition-all duration-300 border border-white/20"
            >
              {copiedText === 'map' ? (
                <>
                  <Check className="w-5 h-5 text-green-400" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  Copy Address
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
              </div >
            </section >
          )}

{/* Enhanced Google Reviews Section - Carousel */ }
{
  formData.googlePlacesData?.reviews && formData.googlePlacesData.reviews.length > 0 && (
    <section className="py-12 md:py-16 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-6">
            Customer <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Reviews</span>
          </h2>
          {formData.googlePlacesData.rating && (
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white rounded-full shadow-lg border-2 border-blue-200 mb-4">
              <div className="flex items-center gap-1">
                <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                <span className="text-3xl font-black text-gray-900">{formData.googlePlacesData.rating}</span>
              </div>
              <div className="h-8 w-px bg-gray-300"></div>
              <div className="flex text-yellow-400 text-lg">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-5 h-5 ${i < Math.round(formData.googlePlacesData.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                ))}
              </div>
              {formData.googlePlacesData.totalRatings > 0 && (
                <>
                  <div className="h-8 w-px bg-gray-300"></div>
                  <span className="text-gray-600 font-semibold">({formData.googlePlacesData.totalRatings} reviews)</span>
                </>
              )}
            </div>
          )}
          {formData.googlePlacesData.priceLevel !== null && formData.googlePlacesData.priceLevel !== undefined && (
            <p className="text-gray-600 font-medium">Price Level: <span className="text-green-600 font-bold">{'$'.repeat(formData.googlePlacesData.priceLevel + 1)}</span></p>
          )}
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {paginatedReviews.map((review, idx) => (
            <div key={idx} className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100 hover:border-blue-200 transition-all duration-300 hover:shadow-xl">
              <div className="flex items-start gap-4 mb-4">
                {review.authorPhoto ? (
                  <img src={review.authorPhoto} alt={review.authorName} className="w-14 h-14 rounded-full object-cover border-2 border-gray-200" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center flex-shrink-0 border-2 border-gray-200">
                    <span className="text-white font-bold text-lg">{review.authorName?.charAt(0) || 'U'}</span>
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-gray-900 truncate mb-1">{review.authorName || 'Anonymous'}</p>
                  <div className="flex text-yellow-400 text-sm mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  {review.time && (
                    <p className="text-gray-500 text-xs">{review.time}</p>
                  )}
                </div>
              </div>
              {review.text && (
                <p className="text-gray-700 text-sm leading-relaxed line-clamp-5">{review.text}</p>
              )}
            </div>
          ))}
        </div>

        {/* Reviews Pagination */}
        {totalReviewPages > 1 && (
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setCurrentReviewPage(prev => Math.max(0, prev - 1))}
              disabled={currentReviewPage === 0}
              className="px-4 py-2 rounded-lg bg-white border-2 border-gray-300 hover:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              <ChevronLeft className="w-5 h-5 inline mr-1" />
              Previous
            </button>
            <span className="text-sm text-gray-600 font-medium px-4">
              Page {currentReviewPage + 1} of {totalReviewPages}
            </span>
            <button
              onClick={() => setCurrentReviewPage(prev => Math.min(totalReviewPages - 1, prev + 1))}
              disabled={currentReviewPage === totalReviewPages - 1}
              className="px-4 py-2 rounded-lg bg-white border-2 border-gray-300 hover:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Next
              <ChevronRight className="w-5 h-5 inline ml-1" />
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

{/* Enhanced Footer - Multi-column with Newsletter */ }
<footer className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white py-12 md:py-16">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
        {/* Business Info */}
        <div className="lg:col-span-1">
          <h3 className="text-2xl font-black mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            {formData.businessName}
          </h3>
          {formData.footerDescription && formData.footerDescription.trim() && (
            <p className="text-gray-300 text-sm leading-relaxed mb-4">{formData.footerDescription}</p>
          )}
          {formData.category && (
            <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-gray-300">
              {formData.category}
            </span>
          )}
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
            <span>Quick Links</span>
          </h4>
          <ul className="space-y-2 text-gray-300">
            <li><a href="#home" className="hover:text-white transition-colors flex items-center gap-2 group">
              <span className="w-0 group-hover:w-2 h-0.5 bg-white transition-all"></span>
              Home
            </a></li>
            {formData.description && (
              <li><a href="#about" className="hover:text-white transition-colors flex items-center gap-2 group">
                <span className="w-0 group-hover:w-2 h-0.5 bg-white transition-all"></span>
                About
              </a></li>
            )}
            {(formData.services && formData.services.length > 0) && (
              <li><a href="#services" className="hover:text-white transition-colors flex items-center gap-2 group">
                <span className="w-0 group-hover:w-2 h-0.5 bg-white transition-all"></span>
                Services
              </a></li>
            )}
            {images.length > 0 && (
              <li><a href="#gallery" className="hover:text-white transition-colors flex items-center gap-2 group">
                <span className="w-0 group-hover:w-2 h-0.5 bg-white transition-all"></span>
                Gallery
              </a></li>
            )}
            {hasContactInfo() && (
              <li><a href="#contact" className="hover:text-white transition-colors flex items-center gap-2 group">
                <span className="w-0 group-hover:w-2 h-0.5 bg-white transition-all"></span>
                Contact
              </a></li>
            )}
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Contact
          </h4>
          <ul className="space-y-3 text-gray-300">
            {formData.mobileNumber && (
              <li className="flex items-start gap-2">
                <Phone className="w-4 h-4 mt-1 flex-shrink-0" />
                <a href={`tel:${formData.mobileNumber}`} className="hover:text-white transition-colors break-all">
                  {formData.mobileNumber}
                </a>
              </li>
            )}
            {formData.email && (
              <li className="flex items-start gap-2">
                <Mail className="w-4 h-4 mt-1 flex-shrink-0" />
                <a href={`mailto:${formData.email}`} className="hover:text-white transition-colors break-all">
                  {formData.email}
                </a>
              </li>
            )}
            {formData.address && (
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                <span className="break-words text-sm">{formData.address}</span>
              </li>
            )}
          </ul>
        </div>

        {/* Social Media */}
        {hasSocialMedia() && (
          <div>
            <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              Follow Us
            </h4>
            <div className="flex flex-wrap gap-3">
              {formData.instagram && (
                <a href={formData.instagram} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center hover:scale-110 transition-transform shadow-lg">
                  <Instagram className="w-6 h-6" />
                </a>
              )}
              {formData.facebook && (
                <a href={formData.facebook} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center hover:scale-110 transition-transform shadow-lg">
                  <Facebook className="w-6 h-6" />
                </a>
              )}
              {formData.website && (
                <a href={formData.website} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-gray-600 rounded-xl flex items-center justify-center hover:scale-110 transition-transform shadow-lg">
                  <Globe className="w-6 h-6" />
                </a>
              )}
              {formData.youtubeVideo && (
                <a href={formData.youtubeVideo} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center hover:scale-110 transition-transform shadow-lg">
                  <Youtube className="w-6 h-6" />
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700 pt-8 mt-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm text-center md:text-left">
            &copy; {new Date().getFullYear()} <span className="font-semibold text-white">{formData.businessName}</span>. All rights reserved.
          </p>
          <p className="text-gray-400 text-sm">
            Made with ❤️ by <a href="https://varanasihub.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">VaranasiHub</a>
          </p>
        </div>
      </div>
    </div>
  </footer>

  {/* Floating Action Buttons - Mobile */}
  <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-3 md:hidden">
    {/* Back to Top */}
    {showBackToTop && (
      <button
        onClick={scrollToTop}
        className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-blue-700 transition-all duration-300 hover:scale-110"
        aria-label="Back to top"
      >
        <ArrowUp className="w-6 h-6" />
      </button>
    )}

    {/* WhatsApp FAB */}
    {formData.whatsappNumber && (
      <a
        href={`https://wa.me/${formData.whatsappNumber.replace(/\D/g, '')}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-14 h-14 bg-green-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-green-700 transition-all duration-300 hover:scale-110 animate-bounce"
        aria-label="WhatsApp"
      >
        <MessageCircle className="w-7 h-7" />
      </a>
    )}

    {/* Call FAB */}
    {formData.mobileNumber && (
      <a
        href={`tel:${formData.mobileNumber}`}
        className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-blue-700 transition-all duration-300 hover:scale-110"
        aria-label="Call"
      >
        <Phone className="w-7 h-7" />
      </a>
    )}
  </div>

  {/* Back to Top Button - Desktop */}
  {showBackToTop && (
    <button
      onClick={scrollToTop}
      className="hidden md:fixed md:bottom-8 md:right-8 z-[100] w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all duration-300"
      aria-label="Back to top"
    >
      <ArrowUp className="w-6 h-6" />
    </button>
  )}
</div>
      </div >
    </div >
  );
};

export default WebsitePreview;
