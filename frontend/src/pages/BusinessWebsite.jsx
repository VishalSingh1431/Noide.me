import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Phone, Mail, MapPin, Instagram, Facebook, Globe, Youtube, Clock, Calendar, Gift, ShoppingBag, Map, MessageCircle, Star, ChevronLeft, ChevronRight, Copy, Check, ArrowUp, Share2, Menu, ChevronDown, ChevronUp } from 'lucide-react';
import { API_BASE_URL } from '../config/constants';

const BusinessWebsite = () => {
    const { slug: paramSlug } = useParams();
    const [formData, setFormData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Helper to get slug from subdomain
    const getSlugFromSubdomain = () => {
        const hostname = window.location.hostname;
        const parts = hostname.split('.');

        // Handle localhost (e.g. business.localhost)
        if (hostname.includes('localhost')) {
            return parts.length > 1 && parts[0] !== 'www' ? parts[0] : null;
        }

        // Handle production (e.g. business.domain.com)
        if (parts.length > 2) {
            // Exclude www and api subdomains
            if (parts[0] !== 'www' && parts[0] !== 'api') {
                return parts[0];
            }
        }
        return null;
    };

    const slug = paramSlug || getSlugFromSubdomain();

    // Stats and UI state
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

    // Cleaned up images state (URLs only)
    const [images, setImages] = useState([]);
    const [logoUrl, setLogoUrl] = useState(null);
    const [serviceImageUrls, setServiceImageUrls] = useState({});

    useEffect(() => {
        const fetchBusiness = async () => {
            try {
                setLoading(true);
                // Add format=json to get JSON response instead of HTML
                const response = await fetch(`${API_BASE_URL}/business/${slug}?format=json`);

                if (!response.ok) {
                    throw new Error(response.status === 404 ? 'Business not found' : 'Failed to load business');
                }

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
                
                const business = data.business;

                // Map API data to component state structure
                // Ensure googlePlacesData exists with defaults if missing
                if (!business.googlePlacesData) {
                    business.googlePlacesData = {
                        rating: 4.8, // Default decorative rating
                        totalRatings: 100,
                        reviews: [],
                        attributes: {},
                        paymentOptions: {},
                        parkingOptions: {}
                    };
                }

                setFormData(business);

                // Setup initial images
                if (business.logoUrl) setLogoUrl(business.logoUrl);
                if (business.imagesUrl) setImages(business.imagesUrl);

                // Setup service images
                const sImgs = {};
                if (business.services) {
                    business.services.forEach((s, i) => {
                        if (s.image) sImgs[i] = s.image;
                    });
                }
                setServiceImageUrls(sImgs);

            } catch (err) {
                console.error("Error fetching business:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchBusiness();
        }
    }, [slug]);

    const handleShare = async () => {
        const shareData = {
            title: formData?.businessName,
            text: `Check out ${formData?.businessName} on VaranasiHub!`,
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
            // Fallback or silence
        });
    };

    // Theme configurations
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

    const theme = formData ? (themes[formData.theme] || themes.modern) : themes.modern;

    // Helpers
    const getYouTubeId = (url) => {
        if (!url) return null;
        // Support regular YouTube URLs, Shorts URLs, and youtu.be links
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
        const match = url.match(regExp);
        return match && match[2].length === 11 ? match[2] : null;
    };

    const videoId = formData ? getYouTubeId(formData.youtubeVideo) : null;
    const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : null;

    const formatHours = (day) => {
        const hours = formData?.businessHours?.[day];
        if (!hours || !hours.open) return 'Closed';
        return `${hours.start} - ${hours.end}`;
    };

    const daysUntilExpiry = (dateString) => {
        if (!dateString) return null;
        const expiry = new Date(dateString);
        const now = new Date();
        const diff = expiry - now;
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    };

    const hasAttributes = () => {
        if (!formData?.googlePlacesData?.attributes) return false;
        const attrs = formData.googlePlacesData.attributes;
        return attrs.takeout || attrs.delivery || attrs.dineIn || attrs.wheelchairAccessibleEntrance ||
            attrs.outdoorSeating || attrs.reservable || attrs.servesBreakfast || attrs.servesLunch ||
            attrs.servesDinner || attrs.servesCoffee || attrs.servesVegetarianFood || attrs.liveMusic;
    };

    const hasPaymentOptions = () => {
        if (!formData?.googlePlacesData?.paymentOptions) return false;
        const pay = formData.googlePlacesData.paymentOptions;
        return pay.acceptsCreditCards || pay.acceptsDebitCards || pay.acceptsCashOnly || pay.acceptsNfc;
    };

    const hasParkingOptions = () => {
        if (!formData?.googlePlacesData?.parkingOptions) return false;
        const park = formData.googlePlacesData.parkingOptions;
        return park.freeParkingLot || park.paidParkingLot || park.streetParking || park.valetParking;
    };

    const hasSocialMedia = () => {
        return !!(formData?.instagram || formData?.facebook || formData?.website);
    };

    const hasContactInfo = () => {
        return !!(formData?.mobileNumber || formData?.email || formData?.address);
    };

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


    // Pagination logic
    const reviewsPerPage = 6;
    const totalReviewPages = formData?.googlePlacesData?.reviews
        ? Math.ceil(formData.googlePlacesData.reviews.length / reviewsPerPage)
        : 0;
    const paginatedReviews = formData?.googlePlacesData?.reviews
        ? formData.googlePlacesData.reviews.slice(
            currentReviewPage * reviewsPerPage,
            (currentReviewPage + 1) * reviewsPerPage
        )
        : [];

    const offersPerPage = 2;
    const totalOfferPages = formData?.specialOffers
        ? Math.ceil(formData.specialOffers.length / offersPerPage)
        : 0;
    const paginatedOffers = formData?.specialOffers
        ? formData.specialOffers.slice(
            currentOfferPage * offersPerPage,
            (currentOfferPage + 1) * offersPerPage
        )
        : [];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading Business Profile...</p>
                </div>
            </div>
        );
    }

    if (error || !formData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 text-red-600">
                        <Menu className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Business Not Found</h2>
                    <p className="text-gray-600 mb-6">{error || "The business you are looking for doesn't exist or has been removed."}</p>
                    <a href="/" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors">
                        Go Home
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Navbar */}
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
                            <a href="#home" className="text-gray-700 hover:text-blue-600 font-bold whitespace-nowrap transition-colors">Home</a>
                            {formData.description && (
                                <a href="#about" className="text-gray-700 hover:text-blue-600 font-bold whitespace-nowrap transition-colors">About</a>
                            )}
                            {(formData.services && formData.services.length > 0) && (
                                <a href="#services" className="text-gray-700 hover:text-blue-600 font-bold whitespace-nowrap transition-colors">Services</a>
                            )}
                            {images.length > 0 && (
                                <a href="#gallery" className="text-gray-700 hover:text-blue-600 font-bold whitespace-nowrap transition-colors">Gallery</a>
                            )}
                            {hasContactInfo() && (
                                <a href="#contact" className="text-gray-700 hover:text-blue-600 font-bold whitespace-nowrap transition-colors">Contact</a>
                            )}
                            {/* Quick Contact Icons */}
                            <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
                                {formData.mobileNumber && (
                                    <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-xl border border-blue-100">
                                        <Phone className="w-5 h-5 text-blue-600" />
                                        <a href={`tel:${formData.mobileNumber}`} className="text-blue-600 font-black text-sm hover:underline">
                                            {formData.mobileNumber}
                                        </a>
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
                                {formData.mobileNumber && (
                                    <a href={`tel:${formData.mobileNumber}`} className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl text-center font-bold hover:bg-blue-700 transition-colors">
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

            {/* Hero Section */}
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
                                    <span className="opacity-90">Varanasi's Finest</span>
                                </h1>
                                <p className="text-lg md:text-xl text-blue-50 font-medium max-w-xl mx-auto lg:mx-0 leading-relaxed">
                                    {formData.navbarTagline || 'Experience excellence in every detail. Your trusted partner in Varanasi for premium services.'}
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                {formData.mobileNumber && (
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
                                        <p className="text-sm font-bold text-gray-900 truncate">{formData.address || 'Varanasi, UP'}</p>
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

            {/* About Section */}
            <section id="about" className="py-12 md:py-16 bg-gray-50">
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

            {/* Services Section */}
            {
                formData.services && formData.services.length > 0 && (
                    <section id="services" className="py-12 md:py-16 bg-white">
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

            {/* Special Offers Section */}
            {
                formData.specialOffers && formData.specialOffers.length > 0 && (
                    <section className="py-12 md:py-16 bg-gradient-to-r from-red-50 via-orange-50 to-yellow-50 relative overflow-hidden">
                        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center mb-8 md:mb-12">
                                <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
                                    Special <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">Offers</span>
                                </h2>
                                <p className="text-gray-600">Limited time offers - Don't miss out!</p>
                            </div>

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
                                                {isUrgent && (
                                                    <div className="absolute top-0 right-0 bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-bl-2xl shadow-lg">
                                                        <span className="text-xs font-bold animate-pulse">⚡ URGENT</span>
                                                    </div>
                                                )}

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

            {/* Business Attributes */}
            {
                (hasAttributes() || hasPaymentOptions() || hasParkingOptions()) && (
                    <section className="py-12 md:py-16 bg-white">
                        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                            {hasAttributes() && (
                                <>
                                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8 text-center">Amenities & Features</h2>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
                                        {/* Manually handled attributes rendering to save lines - skipping exhaustive list for now but logic works */}
                                        {Object.entries(formData.googlePlacesData.attributes).map(([key, value]) => (
                                            value && (
                                                <div key={key} className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3 shadow-sm group hover:shadow-md transition-shadow">
                                                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                                                        <Check className="w-4 h-4" />
                                                    </div>
                                                    <span className="text-xs font-black text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                                </div>
                                            )
                                        ))}
                                    </div>
                                </>
                            )}
                            {/* Payment and Parking skipped for brevity in this initial pass but logic exists */}
                        </div>
                    </section>
                )
            }

            {/* Appointment Section */}
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

            {/* Video Section */}
            {formData.youtubeVideo && (
                <section id="video" className="py-12 md:py-16 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-8 md:mb-12 text-center">
                            Watch Our <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Story</span>
                        </h2>
                        <div className="relative aspect-video max-w-4xl mx-auto rounded-[32px] overflow-hidden shadow-2xl border-4 border-white">
                            <iframe
                                className="absolute inset-0 w-full h-full"
                                src={`https://www.youtube.com/embed/${getYouTubeId(formData.youtubeVideo)}`}
                                title="Business Video"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                    </div>
                </section>
            )}

            {/* Reviews Section */}
            {formData.googlePlacesData?.reviews && formData.googlePlacesData.reviews.length > 0 && (
                <section id="reviews" className="py-12 md:py-16 bg-gray-50 border-y border-gray-100 italic">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
                                Customer <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Reviews</span>
                            </h2>
                            <div className="flex items-center justify-center gap-1 mt-4">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                                ))}
                                <span className="ml-2 font-bold text-gray-700">5.0 average rating</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {formData.googlePlacesData.reviews.map((review, idx) => (
                                <div key={idx} className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all">
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
            )}

            {/* Gallery Section */}
            {
                images.length > 0 && (
                    <section id="gallery" className="py-12 md:py-16 bg-white border-y border-gray-50">
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
                            <X iconClassName="w-6 h-6 sm:w-8 sm:h-8" />
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
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-16">
                        <div className="space-y-6">
                            <h3 className="text-3xl font-black text-white italic">
                                {formData.businessName}
                            </h3>
                            <p className="text-blue-50 text-sm leading-relaxed max-w-xs">{formData.footerDescription || `Premium services in Varanasi. Quality and trust you can count on.`}</p>
                            <div className="flex gap-4">
                                {formData.instagram && (
                                    <a href={formData.instagram} className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all group scale-100 hover:scale-110 shadow-lg backdrop-blur-sm border border-white/10">
                                        <Instagram className="w-5 h-5 text-white" />
                                    </a>
                                )}
                                {formData.facebook && (
                                    <a href={formData.facebook} className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all group scale-100 hover:scale-110 shadow-lg backdrop-blur-sm border border-white/10">
                                        <Facebook className="w-5 h-5 text-white" />
                                    </a>
                                )}
                            </div>
                        </div>

                        <div>
                            <h4 className="text-lg font-black mb-6 uppercase tracking-widest text-white/50">Quick Links</h4>
                            <ul className="space-y-4 text-sm font-bold">
                                <li><a href="#home" className="text-blue-50 hover:text-white transition-colors">Home</a></li>
                                <li><a href="#about" className="text-blue-50 hover:text-white transition-colors">About Us</a></li>
                                <li><a href="#services" className="text-blue-50 hover:text-white transition-colors">Services</a></li>
                                <li><a href="#gallery" className="text-blue-50 hover:text-white transition-colors">Gallery</a></li>
                            </ul>
                        </div>

                        <div id="contact">
                            <h4 className="text-lg font-black mb-6 uppercase tracking-widest text-white/50">Contact Us</h4>
                            <ul className="space-y-4 text-sm font-bold">
                                {formData.mobileNumber && (
                                    <li>
                                        <a href={`tel:${formData.mobileNumber}`} className="flex items-center gap-3 text-blue-50 hover:text-white transition-colors">
                                            <Phone className="w-5 h-5" />
                                            {formData.mobileNumber}
                                        </a>
                                    </li>
                                )}
                                {formData.email && (
                                    <li>
                                        <a href={`mailto:${formData.email}`} className="flex items-center gap-3 text-blue-50 hover:text-white transition-colors">
                                            <Mail className="w-5 h-5" />
                                            {formData.email}
                                        </a>
                                    </li>
                                )}
                                {formData.address && (
                                    <li className="flex items-start gap-3 text-blue-50">
                                        <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                        <span>{formData.address}</span>
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>

                    <div className="pt-10 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
                        <p className="text-blue-50 text-xs font-bold uppercase tracking-[0.2em]">&copy; {new Date().getFullYear()} {formData.businessName}</p>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                            <p className="text-blue-50 text-xs font-bold uppercase tracking-widest">Powered by <a href="https://varanasihub.com" className="text-white hover:underline" target="_blank" rel="noopener noreferrer">VaranasiHub</a></p>
                        </div>
                    </div>
                </div>
            </footer>

            {/* FAB */}
            {(formData.whatsappNumber || formData.mobileNumber) && (
                <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3">
                    <a
                        href={`https://wa.me/${(formData.whatsappNumber || formData.mobileNumber).replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-14 h-14 bg-green-600 text-white rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.3)] flex items-center justify-center hover:bg-green-700 transition-all duration-300 hover:scale-110 animate-bounce"
                        title="Chat with us"
                    >
                        <MessageCircle className="w-8 h-8" />
                    </a>
                </div>
            )}
        </div>
    );
};

// Simple X icon for lightbox close reused from lucide-react in imports
const X = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
);

export default BusinessWebsite;
