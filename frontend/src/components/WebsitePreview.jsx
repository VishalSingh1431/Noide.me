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
  const [shareFeedback, setShareFeedback] = useState(false);
  const [callbackNumber, setCallbackNumber] = useState('');
  const [callbackStatus, setCallbackStatus] = useState(null);
  const [isSubmittingCallback, setIsSubmittingCallback] = useState(false);

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    const container = document.querySelector('.preview-content');
    if (section && container) {
      const top = section.offsetTop - 80; // Offset for sticky nav
      container.scrollTo({ top, behavior: 'smooth' });
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: formData.businessName,
      text: `Check out ${formData.businessName} on NoidaHub!`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (err.name !== 'AbortError') {
          copyToClipboard(shareData.url);
        }
      }
    } else {
      copyToClipboard(shareData.url);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text).then(() => {
      if (label) {
        setCopiedText(label);
        setTimeout(() => setCopiedText(''), 2000);
      } else {
        setShareFeedback(true);
        setTimeout(() => setShareFeedback(false), 2000);
      }
    }).catch(() => {
      console.error('Failed to copy to clipboard');
    });
  };

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
    // Support regular YouTube URLs, Shorts URLs, and youtu.be links
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  // Handle both array and string for backward compatibility
  const youtubeVideos = Array.isArray(formData.youtubeVideo) 
    ? formData.youtubeVideo.filter(v => v && typeof v === 'string' && v.trim().length > 0)
    : (formData.youtubeVideo ? [formData.youtubeVideo] : []);

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
    return !!(formData.mobileNumber || formData.mobile || formData.email || formData.address);
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
                <div className="hidden md:flex items-center gap-6 text-base">
                  <a onClick={() => scrollToSection('home')} className="text-gray-700 hover:text-blue-600 font-bold whitespace-nowrap transition-colors cursor-pointer">Home</a>
                  {formData.description && (
                    <a onClick={() => scrollToSection('about')} className="text-gray-700 hover:text-blue-600 font-bold whitespace-nowrap transition-colors cursor-pointer">About</a>
                  )}
                  {(formData.services && formData.services.length > 0) && (
                    <a onClick={() => scrollToSection('services')} className="text-gray-700 hover:text-blue-600 font-bold whitespace-nowrap transition-colors cursor-pointer">Services</a>
                  )}
                  {images.length > 0 && (
                    <a onClick={() => scrollToSection('gallery')} className="text-gray-700 hover:text-blue-600 font-bold whitespace-nowrap transition-colors cursor-pointer">Gallery</a>
                  )}
                  {hasContactInfo() && (
                    <a onClick={() => scrollToSection('contact')} className="text-gray-700 hover:text-blue-600 font-bold whitespace-nowrap transition-colors cursor-pointer">Contact</a>
                  )}
                  {/* Quick Contact Icons */}
                  <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
                    {(formData.mobileNumber || formData.mobile) && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-xl border border-blue-100">
                        <Phone className="w-5 h-5 text-blue-600" />
                        <span className="text-blue-600 font-black text-sm">
                          {formData.mobileNumber || formData.mobile}
                        </span>
                      </div>
                    )}
                    <button
                      onClick={handleShare}
                      className="p-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-600 transition-all hover:scale-110"
                      title="Share Website"
                    >
                      {shareFeedback ? <Check className="w-6 h-6" /> : <Share2 className="w-6 h-6" />}
                    </button>
                  </div>
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
                    {(formData.mobileNumber || formData.mobile) && (
                      <a href={`tel:${formData.mobileNumber || formData.mobile}`} className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl text-center font-bold hover:bg-blue-700 transition-colors">
                        <Phone className="w-5 h-5 inline mr-2" />
                        Call
                      </a>
                    )}
                    <button
                      onClick={handleShare}
                      className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-xl text-center font-bold hover:bg-purple-700 transition-colors"
                    >
                      {shareFeedback ? <Check className="w-5 h-5 inline mr-2" /> : <Share2 className="w-5 h-5 inline mr-2" />}
                      {shareFeedback ? 'Link Copied' : 'Share'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Enhanced Hero Section - Premium Layout */}
          <section id="home" className="relative min-h-[80vh] flex items-center pt-24 pb-12 overflow-hidden bg-blue-600">
            <div className={`absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-600`}></div>
            <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-white/10 to-transparent skew-x-12 translate-x-1/4"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-8 text-center lg:text-left">
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white text-sm font-black uppercase tracking-widest animate-fade-in border border-white/20">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                      </span>
                      {formData.category || 'Premium Service'}
                    </div>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-[1.1] tracking-tight">
                      <span className="block">{formData.businessName}</span>
                      <span className="opacity-90">Noida's Finest</span>
                    </h1>
                    <p className="text-lg md:text-xl text-blue-50 font-medium max-w-xl mx-auto lg:mx-0 leading-relaxed">
                      {formData.navbarTagline || 'Experience excellence in every detail. Your trusted partner in Noida for premium services.'}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                    {(formData.mobileNumber || formData.mobile) && (
                      <button className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-white text-blue-600 rounded-2xl font-black text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all transform active:scale-95 group">
                        <Phone className="w-6 h-6 animate-pulse" />
                        Book Now
                      </button>
                    )}
                    <a href="#about" className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-white/10 text-white border-2 border-white/20 rounded-2xl font-black text-lg hover:bg-white/20 transition-all transform hover:-translate-y-1 active:scale-95 backdrop-blur-md">
                      Learn More
                    </a>
                  </div>
                </div>

                <div className="relative lg:block">
                  <div className={`absolute -inset-4 bg-gradient-to-tr ${theme.primary} rounded-[40px] opacity-10 blur-2xl animate-pulse`}></div>
                  <div className="relative bg-white rounded-[40px] shadow-2xl border-4 border-white overflow-hidden aspect-[4/3]">
                    <img src={images[0] || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2070&auto=format&fit=crop'}
                      alt={formData.businessName}
                      className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-1000" />

                    <div className="absolute bottom-6 left-6 right-6 grid grid-cols-2 gap-4">
                      <div className="bg-white/90 backdrop-blur-md p-5 rounded-3xl shadow-lg border border-white/50 transform hover:-translate-y-1 transition-transform">
                        <div className="flex items-center gap-3 mb-1">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                            <Clock className="w-5 h-5" />
                          </div>
                          <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Opening</span>
                        </div>
                        <p className="text-sm font-bold text-gray-900">{formatHours(new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase())}</p>
                      </div>
                      <div className="bg-white/90 backdrop-blur-md p-5 rounded-3xl shadow-lg border border-white/50 transform hover:-translate-y-1 transition-transform">
                        <div className="flex items-center gap-3 mb-1">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                            <MapPin className="w-5 h-5" />
                          </div>
                          <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Location</span>
                        </div>
                        <p className="text-sm font-bold text-gray-900 truncate">{formData.address || 'Noida, UP'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white to-transparent"></div>
          </section>

          {/* Quick Contact Info Section */}
          {
            (formData.businessHours || formData.address) && (
              <section className="py-4 md:py-6 bg-gradient-to-br from-gray-50 to-white border-b border-gray-200">
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
                              src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyCYlXSxKwiSFqoPhivOu7Ev028HnNV42us&q=${encodeURIComponent(formData.address)}`}
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

          {/* Enhanced About Section - Always Visible */}
          <section id="about" className="py-6 md:py-8 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-8 md:mb-12 text-center">
                About <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Us</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
                <div className="order-2 md:order-1">
                  <div className="prose prose-lg max-w-none">
                    {/* Business Name and Category */}
                    <div className="flex flex-wrap items-center gap-4 mb-8">
                      <h3 className="text-2xl md:text-3xl font-black text-gray-900">{formData.businessName}</h3>
                      {formData.category && (
                        <span className={`inline-block px-4 py-1.5 rounded-full ${theme.accent.replace('text-', 'bg-')}/10 ${theme.accent} text-xs font-black uppercase tracking-widest`}>
                          {formData.category}
                        </span>
                      )}
                    </div>

                    {/* Owner Info */}
                    {formData.ownerName && (
                      <div className="mb-8 flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm w-fit">
                        <div className={`w-12 h-12 bg-gradient-to-br ${theme.primary} rounded-xl flex items-center justify-center text-white shadow-md`}>
                          <Star className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Founder & Owner</p>
                          <p className="text-lg font-black text-gray-900">{formData.ownerName}</p>
                        </div>
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
                        Welcome to {formData.businessName}! We are committed to providing excellent service and quality products to our customers in Noida.
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

          {/* Enhanced Services Section - Better Cards with Hover Effects */}
          {
            formData.services && formData.services.length > 0 && (
              <section id="services" className="py-6 md:py-8 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-8 md:mb-12 text-center">
                    Our <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Services</span>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                    {formData.services.map((service, index) => (
                      <div key={index} className={`group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border-2 ${service.featured ? 'border-yellow-400 ring-4 ring-yellow-50' : 'border-gray-100 hover:border-blue-200'} flex flex-col h-full transform hover:-translate-y-2`}>
                        <div className="relative h-64 overflow-hidden">
                          {serviceImageUrls[index] ? (
                            <img
                              src={serviceImageUrls[index]}
                              alt={service.title || 'Service'}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                              <Star className="w-16 h-16 text-blue-200" />
                            </div>
                          )}

                          {service.featured && (
                            <div className="absolute top-4 left-4 px-4 py-2 bg-yellow-400 text-yellow-900 text-xs font-black rounded-full shadow-lg flex items-center gap-2">
                              <span className="animate-pulse">⭐</span> FEATURED
                            </div>
                          )}

                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                            <button
                              onClick={() => {
                                const contactSection = document.getElementById('contact');
                                if (contactSection) {
                                  contactSection.scrollIntoView({ behavior: 'smooth' });
                                  // In a real app we'd pre-fill the form here, but for preview we just scroll
                                }
                              }}
                              className="w-full py-3 bg-white text-gray-900 rounded-xl font-bold shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-500"
                            >
                              Inquire Now
                            </button>
                          </div>
                        </div>

                        <div className="p-8 flex flex-col flex-1">
                          <h3 className="text-2xl font-black text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">{service.title || 'Service Title'}</h3>
                          <p className="text-gray-600 leading-relaxed mb-6 flex-1 line-clamp-3">{service.description}</p>

                          {service.price && (
                            <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                              <div>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Starting from</p>
                                <p className="text-3xl font-black text-blue-600">₹{service.price}</p>
                              </div>
                              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                                <ArrowRight className="w-6 h-6" />
                              </div>
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

          {/* Enhanced Special Offers Section - Carousel with Countdown */}
          {
            formData.specialOffers && formData.specialOffers.length > 0 && (
              <section className="py-6 md:py-8 bg-gradient-to-r from-red-50 via-orange-50 to-yellow-50 relative overflow-hidden">
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

          {/* Business Attributes Section */}
          {
            (hasAttributes() || hasPaymentOptions() || hasParkingOptions()) && (
              <section className="py-6 md:py-8 bg-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                  {hasAttributes() && (
                    <>
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8 text-center">Amenities & Features</h2>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
                        {formData.googlePlacesData.attributes.takeout && (
                          <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3 shadow-sm group hover:shadow-md transition-shadow">
                            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500">
                              <ShoppingBag className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-black text-gray-700">Takeout</span>
                          </div>
                        )}
                        {formData.googlePlacesData.attributes.delivery && (
                          <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3 shadow-sm group hover:shadow-md transition-shadow">
                            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-500">
                              <Check className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-black text-gray-700">Delivery</span>
                          </div>
                        )}
                        {formData.googlePlacesData.attributes.dineIn && (
                          <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3 shadow-sm group hover:shadow-md transition-shadow">
                            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-500">
                              <div className="w-4 h-4 border-2 border-current rounded-sm" />
                            </div>
                            <span className="text-xs font-black text-gray-700">Dine In</span>
                          </div>
                        )}
                        {formData.googlePlacesData.attributes.outdoorSeating && (
                          <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3 shadow-sm group hover:shadow-md transition-shadow">
                            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-500">
                              <Map className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-black text-gray-700">Outdoor</span>
                          </div>
                        )}
                        {formData.googlePlacesData.attributes.reservable && (
                          <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3 shadow-sm group hover:shadow-md transition-shadow">
                            <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center text-pink-500">
                              <Calendar className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-black text-gray-700">Reservable</span>
                          </div>
                        )}
                        {formData.googlePlacesData.attributes.servesBreakfast && (
                          <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3 shadow-sm group hover:shadow-md transition-shadow">
                            <div className="w-8 h-8 rounded-lg bg-yellow-50 flex items-center justify-center text-yellow-600">
                              <Clock className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-black text-gray-700">Breakfast</span>
                          </div>
                        )}
                        {formData.googlePlacesData.attributes.servesLunch && (
                          <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3 shadow-sm group hover:shadow-md transition-shadow">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500">
                              <div className="w-4 h-4 border-2 border-current rounded-full" />
                            </div>
                            <span className="text-xs font-black text-gray-700">Lunch</span>
                          </div>
                        )}
                        {formData.googlePlacesData.attributes.liveMusic && (
                          <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3 shadow-sm group hover:shadow-md transition-shadow">
                            <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center text-violet-500">
                              <Youtube className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-black text-gray-700">Live Music</span>
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

          {/* Appointment Section */}
          {
            formData.appointmentSettings && formData.appointmentSettings.contactMethod && (formData.whatsappNumber || formData.mobileNumber) && (
              <section className="py-6 md:py-8 bg-blue-50">
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

          {/* Enhanced Video Section */}
          {
            youtubeVideos.length > 0 && (
              <section className="py-4 sm:py-6 md:py-8 bg-gradient-to-br from-gray-50 to-blue-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-6 sm:mb-8 md:mb-12 text-center">
                    Our <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Videos</span>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                    {youtubeVideos.map((video, index) => {
                      const videoId = getYouTubeId(video);
                      if (!videoId) return null;
                      return (
                        <div key={index} className="relative aspect-video rounded-xl sm:rounded-2xl overflow-hidden shadow-xl sm:shadow-2xl border-2 sm:border-4 border-white">
                          <iframe
                            src={`https://www.youtube.com/embed/${videoId}`}
                            title={`Business Video ${index + 1}`}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            referrerPolicy="strict-origin-when-cross-origin"
                          ></iframe>
                          <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/20 to-transparent"></div>
                          <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4">
                            <a
                              href={video}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-black/70 hover:bg-black/90 text-white rounded-lg text-xs sm:text-sm font-semibold transition-colors backdrop-blur-sm"
                            >
                              <Youtube className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span className="hidden sm:inline">Watch on YouTube</span>
                              <span className="sm:hidden">YouTube</span>
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            )
          }

          {/* Enhanced Gallery Section - Sync with Premium Template */}
          {
            images.length > 0 && (
              <section id="gallery" className="py-6 md:py-8 bg-white border-y border-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center mb-12">
                    <div className={`inline-block px-4 py-2 rounded-full bg-blue-600/10 text-blue-600 text-sm font-bold mb-4`}>
                      Our Showcase
                    </div>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-6 font-primary uppercase tracking-tight">Our Gallery</h2>
                    <div className={`h-1.5 w-24 bg-blue-600 mx-auto rounded-full`}></div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {images.map((img, idx) => (
                      <div
                        key={idx}
                        className="group relative aspect-square overflow-hidden rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-500 cursor-pointer"
                        onClick={() => openLightbox(idx)}
                      >
                        <img
                          src={img}
                          alt={`Gallery ${idx + 1}`}
                          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                          <div className="text-white">
                            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-2">
                              <Star className="w-4 h-4 fill-white" />
                            </div>
                            <p className="text-xs font-black uppercase tracking-widest">View Full</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )
          }

          {/* Lightbox Modal */}
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

          {/* Contact Section */}
          {
            hasContactInfo() && (
              <section id="contact" className="py-6 md:py-8 bg-white border-y border-gray-100/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center mb-12 md:mb-16">
                    <div className={`inline-block px-4 py-2 rounded-full bg-blue-600/10 text-blue-600 text-sm font-bold mb-4`}>
                      Get In Touch
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-6">Contact <span className={`bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent`}>Us Today</span></h2>
                    <div className={`w-24 h-2 bg-gradient-to-r ${theme.primary} mx-auto rounded-full`}></div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
                    <div className="space-y-10">
                      <div>
                        <h3 className="text-2xl font-black text-gray-900 mb-8 border-l-4 border-blue-600 pl-4">Our Information</h3>
                        <div className="space-y-6">
                          {formData.mobileNumber && (
                            <div className="flex items-start gap-5 p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
                              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                                <Phone className="w-6 h-6" />
                              </div>
                              <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Call Us</p>
                                <a href={`tel:${formData.mobileNumber}`} className="text-lg font-black text-gray-900 hover:text-blue-600 transition-colors uppercase">{formData.mobileNumber}</a>
                              </div>
                            </div>
                          )}
                          {formData.email && (
                            <div className="flex items-start gap-5 p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
                              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                                <Mail className="w-6 h-6" />
                              </div>
                              <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Email Us</p>
                                <a href={`mailto:${formData.email}`} className="text-lg font-black text-gray-900 hover:text-blue-600 transition-colors">{formData.email}</a>
                              </div>
                            </div>
                          )}
                          {formData.address && (
                            <div className="flex items-start gap-5 p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
                              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                                <MapPin className="w-6 h-6" />
                              </div>
                              <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Visit Us</p>
                                <span className="text-lg font-black text-gray-900 leading-tight">{formData.address}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {hasSocialMedia() && (
                        <div>
                          <h3 className="text-2xl font-black text-gray-900 mb-8 border-l-4 border-blue-600 pl-4">Follow Our Journey</h3>
                          <div className="flex gap-4">
                            {formData.instagram && (
                              <a href={formData.instagram} target="_blank" rel="noopener noreferrer" className="w-14 h-14 bg-white border border-gray-200 rounded-2xl flex items-center justify-center shadow-sm hover:shadow-lg hover:border-blue-200 transition-all group">
                                <Instagram className="w-6 h-6 text-gray-400 group-hover:text-pink-600 transition-colors" />
                              </a>
                            )}
                            {formData.facebook && (
                              <a href={formData.facebook} target="_blank" rel="noopener noreferrer" className="w-14 h-14 bg-white border border-gray-200 rounded-2xl flex items-center justify-center shadow-sm hover:shadow-lg hover:border-blue-200 transition-all group">
                                <Facebook className="w-6 h-6 text-gray-400 group-hover:text-blue-600 transition-colors" />
                              </a>
                            )}
                            {formData.website && (
                              <a href={formData.website} target="_blank" rel="noopener noreferrer" className="w-14 h-14 bg-white border border-gray-200 rounded-2xl flex items-center justify-center shadow-sm hover:shadow-lg hover:border-blue-200 transition-all group">
                                <Globe className="w-6 h-6 text-gray-400 group-hover:text-gray-900 transition-colors" />
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
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
                  </div>
                </div>

              </section>
            )
          }

          {/* Video Section */}
          {youtubeVideos.length > 0 && (
            <section id="video" className="py-6 md:py-8 bg-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-8 md:mb-12 text-center">
                  Watch Our <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Videos</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                  {youtubeVideos.map((video, index) => {
                    const videoId = getYouTubeId(video);
                    if (!videoId) return null;
                    return (
                      <div key={index} className="relative aspect-video rounded-[32px] overflow-hidden shadow-2xl border-4 border-white">
                        <iframe
                          className="absolute inset-0 w-full h-full"
                          src={`https://www.youtube.com/embed/${videoId}`}
                          title={`Business Video ${index + 1}`}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          referrerPolicy="strict-origin-when-cross-origin"
                        ></iframe>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {/* Enhanced Reviews Section */}
          {
            formData.googlePlacesData?.reviews && formData.googlePlacesData.reviews.length > 0 && (
              <section id="reviews" className="py-6 md:py-8 bg-gray-50 border-y border-gray-100/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center mb-12 md:mb-16">
                    <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-6">
                      What Our <span className={`bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent`}>Clients Say</span>
                    </h2>
                    <div className={`w-24 h-2 bg-gradient-to-r ${theme.primary} mx-auto rounded-full`}></div>
                  </div>

                  <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
                    {/* Summary Card */}
                    <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-gray-100 flex flex-col items-center text-center relative overflow-hidden group flex-shrink-0 w-full max-w-sm">
                      <div className="text-6xl font-black text-gray-900 mb-2">{formData.googlePlacesData.rating || '4.9'}</div>
                      <div className="flex gap-1 mb-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star key={i} className={`w-5 h-5 ${i <= Math.round(formData.googlePlacesData.rating || 5) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                        ))}
                      </div>
                      <p className="text-gray-500 font-bold uppercase tracking-wider text-[10px]">Verified Customer Satisfaction</p>
                    </div>

                    {/* Review Cards */}
                    {formData.googlePlacesData.reviews.slice(0, 5).map((review, idx) => (
                      <div key={idx} className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all italic flex-shrink-0 w-full max-w-sm">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                            {review.author?.charAt(0) || 'G'}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{review.author}</p>
                            <div className="flex text-yellow-500">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-yellow-500' : ''}`} />
                              ))}
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed">&quot;{review.text}&quot;</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )
          }

          {/* Gallery Section */}
          {
            images.length > 0 && (
              <section id="gallery" className="py-6 md:py-8 bg-white border-y border-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center mb-12">
                    <div className={`inline-block px-4 py-2 rounded-full bg-blue-600/10 text-blue-600 text-sm font-bold mb-4`}>
                      Our Showcase
                    </div>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-6 font-primary uppercase tracking-tight">Our Gallery</h2>
                    <div className={`h-1.5 w-24 bg-blue-600 mx-auto rounded-full`}></div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {images.map((img, idx) => (
                      <div
                        key={idx}
                        className="group relative aspect-square overflow-hidden rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-500 cursor-pointer"
                        onClick={() => openLightbox(idx)}
                      >
                        <img
                          src={img}
                          alt={`Gallery ${idx + 1}`}
                          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                          <div className="text-white">
                            <p className="text-xs font-black uppercase tracking-widest">View Full</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )
          }

          {/* Lightbox Modal */}
          {
            lightboxOpen && images.length > 0 && (
              <div
                className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center p-4"
                onClick={closeLightbox}
              >
                <button
                  onClick={closeLightbox}
                  className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-[10000] bg-black/50 rounded-full p-2 hover:bg-black/70"
                >
                  <X className="w-6 h-6 sm:w-8 sm:h-8" />
                </button>

                {images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); prevImage(); }}
                      className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-[10000] bg-black/50 rounded-full p-2 sm:p-3 hover:bg-black/70"
                    >
                      <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); nextImage(); }}
                      className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-[10000] bg-black/50 rounded-full p-2 sm:p-3 hover:bg-black/70"
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
                </div>
              </div>
            )
          }

          {/* Footer */}
          <footer className="relative pt-20 pb-10 overflow-hidden bg-blue-600">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-600"></div>
            <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-white/10 to-transparent skew-x-12 translate-x-1/4"></div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-white text-left">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-16">
                <div className="space-y-6">
                  <h3 className="text-3xl font-black text-white italic">
                    {formData.businessName}
                  </h3>
                  <p className="text-blue-50 text-sm leading-relaxed max-w-xs text-left">{formData.footerDescription || `Premium services in Noida. Quality and trust you can count on.`}</p>
                  <div className="flex gap-4">
                    {formData.instagram && (
                      <a href={formData.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all scale-100 hover:scale-110 shadow-lg backdrop-blur-sm border border-white/10 cursor-pointer">
                        <Instagram className="w-5 h-5" />
                      </a>
                    )}
                    {formData.facebook && (
                      <a href={formData.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all scale-100 hover:scale-110 shadow-lg backdrop-blur-sm border border-white/10 cursor-pointer">
                        <Facebook className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-black mb-6 uppercase tracking-widest text-white/50">Quick Links</h4>
                  <ul className="space-y-4 text-sm font-bold">
                    <li><a onClick={() => scrollToSection('home')} className="text-blue-50 hover:text-white transition-colors cursor-pointer">Home</a></li>
                    <li><a onClick={() => scrollToSection('about')} className="text-blue-50 hover:text-white transition-colors cursor-pointer">About Us</a></li>
                    <li><a onClick={() => scrollToSection('services')} className="text-blue-50 hover:text-white transition-colors cursor-pointer">Services</a></li>
                    <li><a onClick={() => scrollToSection('gallery')} className="text-blue-50 hover:text-white transition-colors cursor-pointer">Gallery</a></li>
                  </ul>
                </div>

                <div id="contact">
                  <h4 className="text-lg font-black mb-6 uppercase tracking-widest text-white/50 text-left">Contact Us</h4>
                  <div className="space-y-4 text-sm font-bold text-left">
                    {(formData.mobileNumber || formData.mobile) && (
                      <div className="flex items-center gap-3 text-blue-50">
                        <Phone className="w-5 h-5" />
                        {formData.mobileNumber || formData.mobile}
                      </div>
                    )}
                    {formData.email && (
                      <div className="flex items-center gap-3 text-blue-50">
                        <Mail className="w-5 h-5" />
                        {formData.email}
                      </div>
                    )}
                    {formData.address && (
                      <div className="flex items-start gap-3 text-blue-50">
                        <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <span>{formData.address}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-10 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
                <p className="text-blue-50 text-xs font-bold uppercase tracking-[0.2em]">&copy; {new Date().getFullYear()} {formData.businessName}</p>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                  <p className="text-blue-50 text-xs font-bold uppercase tracking-widest">Powered by <a className="text-white hover:underline cursor-pointer">NoidaHub</a></p>
                </div>
              </div>
            </div>
          </footer>

          {/* FAB */}
          {(formData.whatsappNumber || formData.whatsapp || formData.mobileNumber || formData.mobile) && (
            <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3">
              <a
                href={`https://wa.me/${(formData.whatsappNumber || formData.whatsapp || formData.mobileNumber || formData.mobile).replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-14 h-14 bg-green-600 text-white rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.3)] flex items-center justify-center hover:bg-green-700 transition-all duration-300 hover:scale-110 animate-bounce cursor-pointer"
                title="Chat with us"
              >
                <MessageCircle className="w-8 h-8" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WebsitePreview;
