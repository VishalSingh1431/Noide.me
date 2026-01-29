import { useState, useEffect, useRef, useCallback } from 'react';
import { Building2, User, Phone, Mail, MapPin, Link as LinkIcon, MessageCircle, Instagram, Facebook, Globe, Loader2, Youtube, CheckCircle2, XCircle, Sparkles, Navigation, Plus, X, Clock, Calendar, Gift, ShoppingBag, Map, Palette, CheckCircle, AlertCircle, Edit3, Eye, ChevronRight, ChevronLeft } from 'lucide-react';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FormInput from '../components/forms/FormInput';
import TextArea from '../components/forms/TextArea';
import CategorySelect from '../components/forms/CategorySelect';
import FileUploader from '../components/forms/FileUploader';
import SubmitButton from '../components/forms/SubmitButton';
import WebsitePreview from '../components/WebsitePreview';
import PlacesAutocomplete from '../components/google/PlacesAutocomplete';
import HelpTooltip from '../components/forms/HelpTooltip';

import { businessAPI } from '../config/api';
import { API_BASE_URL } from '../config/constants';
import { formatPhoneNumber } from '../services/googlePlaces';

/**
 * Get default business description based on category
 * @param {string} category - Business category
 * @param {string} businessName - Business name (optional, for personalization)
 * @returns {string} Default description
 */
const getDefaultDescription = (category, businessName = '') => {
  const name = businessName || 'We';
  const descriptions = {
    'Restaurant': `${name} is a delightful restaurant offering authentic flavors and exceptional dining experiences. Our carefully crafted menu features a variety of delicious dishes made with fresh, locally sourced ingredients. Whether you're looking for a casual meal or a special occasion, we provide warm hospitality and a welcoming atmosphere. Visit us for an unforgettable culinary journey in the heart of the city.`,

    'Hotel': `${name} offers comfortable and affordable accommodation for travelers. Our well-appointed rooms provide a relaxing stay with modern amenities and excellent service. Located in a convenient area, we ensure easy access to local attractions and business centers. Experience hospitality at its finest with us.`,

    'Clinic': `${name} is a trusted healthcare facility dedicated to providing quality medical care. Our experienced team of healthcare professionals is committed to your well-being and offers comprehensive medical services. We prioritize patient comfort and ensure a caring environment for all your healthcare needs. Your health is our priority.`,

    'Shop': `${name} is your one-stop destination for quality products and excellent service. We offer a wide range of items to meet your needs, from everyday essentials to special finds. Our friendly staff is always ready to assist you in finding exactly what you're looking for. Visit us for a great shopping experience.`,

    'Library': `${name} is a community resource center providing access to books, digital resources, and educational materials. We offer a quiet and welcoming space for reading, research, and learning. Our collection includes a diverse range of books and resources for all ages. Join us in fostering a love for reading and knowledge.`,

    'Services': `${name} provides professional and reliable services to meet your needs. Our experienced team is dedicated to delivering high-quality solutions with attention to detail and customer satisfaction. We pride ourselves on excellent service and building lasting relationships with our clients. Trust us for all your service requirements.`,

    'Temple': `${name} is a sacred place of worship and spiritual guidance. We welcome devotees from all walks of life to experience peace, devotion, and divine blessings. Our temple serves as a center for religious activities, festivals, and community gatherings. Join us in prayer and spiritual growth.`,

    'School': `${name} is committed to providing quality education and holistic development for students. Our experienced faculty and modern facilities create an environment where students can excel academically and personally. We focus on nurturing young minds and preparing them for a bright future.`,

    'College': `${name} offers comprehensive higher education programs designed to prepare students for successful careers. Our experienced faculty, modern infrastructure, and industry-relevant curriculum ensure students receive the best education. We are dedicated to academic excellence and student success.`,

    'Gym': `${name} is a modern fitness center equipped with state-of-the-art equipment and professional trainers. We offer personalized fitness programs, group classes, and expert guidance to help you achieve your health and fitness goals. Join us on your journey to a healthier lifestyle.`,

    'Salon': `${name} offers professional hair styling, beauty treatments, and grooming services. Our skilled stylists and beauticians use quality products and latest techniques to help you look and feel your best. Experience luxury and pampering at our salon.`,

    'Spa': `${name} provides rejuvenating spa treatments and wellness services. Our expert therapists offer a range of massages, facials, and body treatments designed to relax, refresh, and restore. Escape the daily stress and indulge in ultimate relaxation with us.`,

    'Pharmacy': `${name} is your trusted pharmacy providing genuine medicines and healthcare products. Our qualified pharmacists offer expert advice and ensure you get the right medications. We stock a wide range of prescription and over-the-counter medicines for all your health needs.`,

    'Bank': `${name} offers comprehensive banking services including savings accounts, loans, investments, and digital banking solutions. Our experienced staff provides personalized service and expert financial advice. We are committed to helping you achieve your financial goals.`,

    'Travel Agency': `${name} is your trusted travel partner for all your vacation and business travel needs. We offer customized travel packages, flight bookings, hotel reservations, and visa assistance. Let us help you plan your perfect trip with the best deals and services.`,

    'Real Estate': `${name} specializes in buying, selling, and renting properties. Our experienced real estate agents help you find your dream home or investment property. We offer transparent transactions, legal assistance, and expert guidance throughout the process.`,

    'Law Firm': `${name} provides expert legal services and representation. Our experienced lawyers handle various legal matters including property disputes, family law, business law, and criminal cases. We are committed to protecting your rights and achieving the best outcomes for our clients.`,

    'Accounting': `${name} offers professional accounting, tax, and financial consulting services. Our certified accountants help businesses and individuals with bookkeeping, tax filing, audits, and financial planning. Trust us for accurate and reliable financial services.`,

    'IT Services': `${name} provides comprehensive IT solutions including software development, website design, digital marketing, and technical support. Our expert team helps businesses establish a strong online presence and streamline their operations with modern technology.`,

    'Photography': `${name} specializes in professional photography services for weddings, events, portraits, and commercial projects. Our skilled photographers capture your precious moments with creativity and artistry. We deliver high-quality images that you'll treasure forever.`,

    'Event Management': `${name} is a full-service event management company specializing in weddings, corporate events, and celebrations. We handle every detail from planning to execution, ensuring your event is memorable and successful. Let us make your special day perfect.`,

    'Catering': `${name} offers professional catering services for weddings, parties, corporate events, and special occasions. Our delicious food, professional service, and attention to detail ensure your guests are satisfied. We create memorable dining experiences tailored to your needs.`,

    'Bakery': `${name} is a delightful bakery offering fresh, handmade baked goods including cakes, pastries, breads, and sweets. We use quality ingredients and traditional recipes to create delicious treats. Visit us for your daily bread or special occasion cakes.`,

    'Jewelry': `${name} offers exquisite jewelry collections including gold, silver, diamonds, and precious stones. Our skilled craftsmen create beautiful designs for every occasion. We provide authentic jewelry with proper certification and guarantee. Find your perfect piece with us.`,

    'Fashion': `${name} is a fashion boutique offering trendy clothing, accessories, and style solutions. We curate the latest fashion trends and help you express your unique style. From casual wear to formal attire, we have something for every occasion and taste.`,

    'Electronics': `${name} is your trusted electronics store offering the latest gadgets, appliances, and technology products. We provide genuine products with warranty and excellent after-sales service. Our knowledgeable staff helps you choose the right products for your needs.`,

    'Furniture': `${name} offers quality furniture for home and office including sofas, beds, tables, and storage solutions. We provide stylish and durable furniture that fits your space and budget. Visit our showroom to explore our wide range of furniture collections.`,

    'Automobile': `${name} is an automobile dealership offering new and used vehicles, spare parts, and servicing. Our experienced team helps you find the perfect vehicle and provides comprehensive after-sales support. We ensure quality vehicles and excellent customer service.`,

    'Repair Services': `${name} provides professional repair services for appliances, electronics, vehicles, and more. Our skilled technicians diagnose and fix issues quickly and efficiently. We use quality parts and offer warranty on our services. Trust us for reliable repair solutions.`,

    'Education': `${name} is an educational institution committed to providing quality learning experiences. We offer various courses, training programs, and educational services designed to enhance knowledge and skills. Our experienced educators ensure effective learning outcomes.`,

    'Healthcare': `${name} is a healthcare facility providing comprehensive medical services and wellness programs. Our team of healthcare professionals is dedicated to improving your health and well-being. We offer quality care with compassion and expertise.`,

    'Beauty': `${name} is a beauty salon offering a wide range of beauty treatments and services. Our expert beauticians provide facials, hair treatments, makeup, and grooming services. We use quality products and latest techniques to enhance your natural beauty.`,

    'Fitness': `${name} is a fitness center offering personalized training, group classes, and wellness programs. Our certified trainers help you achieve your fitness goals with customized workout plans. Join us for a healthier and fitter lifestyle.`,

    'Entertainment': `${name} provides entertainment services and experiences for all ages. We organize events, shows, and activities that bring joy and excitement. Whether it's music, dance, or fun activities, we create memorable entertainment experiences.`,

    'Tourism': `${name} offers tourism services including guided tours, travel packages, and local experiences. We help visitors explore the city's rich culture, heritage, and attractions. Discover the best of the region with our expert tour guides and services.`,

    'Food & Beverage': `${name} offers delicious food and beverages prepared with fresh ingredients and authentic recipes. We serve a variety of dishes and drinks to satisfy your cravings. Experience great taste and quality service at our establishment.`,

    'Retail': `${name} is a retail store offering a wide variety of products for your daily needs. We provide quality goods at competitive prices with excellent customer service. Visit us for all your shopping needs in one convenient location.`,

    'Wholesale': `${name} is a wholesale supplier offering bulk products at competitive prices. We serve retailers, businesses, and institutions with quality goods and reliable supply. Our extensive inventory and efficient service make us your trusted wholesale partner.`,

    'Manufacturing': `${name} is a manufacturing company producing quality products for various industries. We use modern technology and quality control processes to ensure excellence. Our products meet high standards and customer specifications.`,

    'Construction': `${name} is a construction company providing building, renovation, and infrastructure services. Our experienced team handles projects of all sizes with quality workmanship and timely completion. We build your dreams into reality.`,

    'Other': `${name} is a trusted local business committed to providing excellent products and services to our community. We value our customers and strive to exceed expectations with every interaction. Visit us to experience quality service and personalized attention.`,
  };

  return descriptions[category] || `${name} is a trusted local business committed to providing excellent products and services to our community. We value our customers and strive to exceed expectations with every interaction. Visit us to experience quality service and personalized attention.`;
};

/**
 * Get default navbar tagline/slogan based on category
 * @param {string} category - Business category
 * @returns {string} Default tagline
 */
const getDefaultTagline = (category) => {
  const taglines = {
    'Restaurant': 'Serving Authentic Flavors with a Smile',
    'Hotel': 'Your Home Away From Home',
    'Clinic': 'Caring for Your Health, Always',
    'Shop': 'Quality Products, Exceptional Service',
    'Library': 'Knowledge for Everyone, Always',
    'Services': 'Professional Service, Trusted Results',
    'Temple': 'A Place of Peace and Devotion',
    'School': 'Nurturing Young Minds for Tomorrow',
    'College': 'Excellence in Higher Education',
    'Gym': 'Transform Your Body, Transform Your Life',
    'Salon': 'Beauty and Style, Redefined',
    'Spa': 'Relax, Rejuvenate, Restore',
    'Pharmacy': 'Your Health, Our Priority',
    'Bank': 'Your Trusted Financial Partner',
    'Travel Agency': 'Your Journey, Our Passion',
    'Real Estate': 'Finding Your Perfect Property',
    'Law Firm': 'Justice, Integrity, Excellence',
    'Accounting': 'Your Financial Success Partner',
    'IT Services': 'Technology Solutions for Your Business',
    'Photography': 'Capturing Life\'s Precious Moments',
    'Event Management': 'Making Your Events Memorable',
    'Catering': 'Delicious Food, Perfect Service',
    'Bakery': 'Fresh Baked, Daily Delivered',
    'Jewelry': 'Timeless Beauty, Enduring Value',
    'Fashion': 'Style That Speaks Your Language',
    'Electronics': 'Technology at Your Fingertips',
    'Furniture': 'Furnishing Your Dreams',
    'Automobile': 'Your Trusted Auto Partner',
    'Repair Services': 'Fixing It Right, Every Time',
    'Education': 'Empowering Minds, Shaping Futures',
    'Healthcare': 'Your Health, Our Commitment',
    'Beauty': 'Enhancing Your Natural Beauty',
    'Fitness': 'Your Journey to Fitness Starts Here',
    'Entertainment': 'Fun, Excitement, Memories',
    'Tourism': 'Explore, Experience, Enjoy',
    'Food & Beverage': 'Taste the Difference',
    'Retail': 'Everything You Need, One Place',
    'Wholesale': 'Quality Products, Best Prices',
    'Manufacturing': 'Quality Made, Trust Delivered',
    'Construction': 'Building Dreams, Creating Spaces',
    'Other': 'Excellence in Every Detail',
  };

  return taglines[category] || 'Excellence in Every Detail';
};

/**
 * Get default footer description based on category
 * @param {string} category - Business category
 * @param {string} businessName - Business name
 * @returns {string} Default footer description
 */
const getDefaultFooterDescription = (category, businessName = '') => {
  const name = businessName || 'We';
  const descriptions = {
    'Restaurant': `${name} is committed to providing exceptional dining experiences with authentic flavors and warm hospitality.`,
    'Hotel': `${name} offers comfortable accommodation and excellent service for all travelers.`,
    'Clinic': `${name} is dedicated to providing quality healthcare services with care and compassion.`,
    'Shop': `${name} offers quality products and excellent customer service for all your needs.`,
    'Library': `${name} provides access to knowledge and resources for the entire community.`,
    'Services': `${name} delivers professional and reliable services you can trust.`,
    'Temple': `${name} is a sacred place of worship serving the community with devotion and spiritual guidance.`,
    'School': `${name} is committed to providing quality education and holistic development for every student.`,
    'College': `${name} offers comprehensive higher education programs designed for student success and career readiness.`,
    'Gym': `${name} is dedicated to helping you achieve your fitness goals with expert guidance and modern facilities.`,
    'Salon': `${name} provides professional beauty and grooming services to help you look and feel your best.`,
    'Spa': `${name} offers rejuvenating spa treatments and wellness services for ultimate relaxation and renewal.`,
    'Pharmacy': `${name} is your trusted pharmacy providing genuine medicines and expert healthcare advice.`,
    'Bank': `${name} offers comprehensive banking services and financial solutions for all your needs.`,
    'Travel Agency': `${name} is your trusted travel partner helping you explore the world with the best deals and services.`,
    'Real Estate': `${name} specializes in helping you find your perfect property with transparent and professional service.`,
    'Law Firm': `${name} provides expert legal services and representation to protect your rights and interests.`,
    'Accounting': `${name} offers professional accounting and financial services to help you manage your finances effectively.`,
    'IT Services': `${name} provides comprehensive IT solutions to help your business thrive in the digital world.`,
    'Photography': `${name} specializes in capturing your precious moments with creativity, artistry, and professionalism.`,
    'Event Management': `${name} creates memorable events with meticulous planning and flawless execution.`,
    'Catering': `${name} offers delicious food and professional catering services for all your special occasions.`,
    'Bakery': `${name} creates fresh, handmade baked goods using quality ingredients and traditional recipes.`,
    'Jewelry': `${name} offers exquisite jewelry collections with authentic certification and guaranteed quality.`,
    'Fashion': `${name} curates the latest fashion trends to help you express your unique style and personality.`,
    'Electronics': `${name} provides genuine electronics products with warranty and excellent after-sales service.`,
    'Furniture': `${name} offers quality furniture solutions for home and office that combine style and functionality.`,
    'Automobile': `${name} is your trusted automobile partner offering quality vehicles and comprehensive support.`,
    'Repair Services': `${name} provides reliable repair services with skilled technicians and quality parts.`,
    'Education': `${name} is committed to providing quality education and learning experiences for all students.`,
    'Healthcare': `${name} is dedicated to improving your health and well-being with quality medical care.`,
    'Beauty': `${name} enhances your natural beauty with professional treatments and quality products.`,
    'Fitness': `${name} helps you achieve your fitness goals with personalized training and expert guidance.`,
    'Entertainment': `${name} creates fun and memorable entertainment experiences for all ages.`,
    'Tourism': `${name} helps you explore and experience the best of the region with expert guidance.`,
    'Food & Beverage': `${name} serves delicious food and beverages prepared with fresh ingredients and care.`,
    'Retail': `${name} provides quality products and excellent service for all your shopping needs.`,
    'Wholesale': `${name} offers quality products at competitive prices for retailers and businesses.`,
    'Manufacturing': `${name} produces quality products using modern technology and strict quality control.`,
    'Construction': `${name} provides quality construction services with skilled workmanship and timely completion.`,
    'Other': `${name} is committed to excellence and customer satisfaction in all that we do.`,
  };

  return descriptions[category] || `${name} is committed to excellence and customer satisfaction.`;
};

/**
 * Get default business hours based on category
 * @param {string} category - Business category
 * @returns {object|null} Default business hours object
 */
const getDefaultBusinessHours = (category) => {
  const defaultHours = {
    monday: { open: true, start: '09:00', end: '18:00' },
    tuesday: { open: true, start: '09:00', end: '18:00' },
    wednesday: { open: true, start: '09:00', end: '18:00' },
    thursday: { open: true, start: '09:00', end: '18:00' },
    friday: { open: true, start: '09:00', end: '18:00' },
    saturday: { open: true, start: '09:00', end: '18:00' },
    sunday: { open: false, start: '09:00', end: '18:00' },
  };

  const categoryHours = {
    'Restaurant': {
      monday: { open: true, start: '11:00', end: '22:00' },
      tuesday: { open: true, start: '11:00', end: '22:00' },
      wednesday: { open: true, start: '11:00', end: '22:00' },
      thursday: { open: true, start: '11:00', end: '22:00' },
      friday: { open: true, start: '11:00', end: '23:00' },
      saturday: { open: true, start: '11:00', end: '23:00' },
      sunday: { open: true, start: '11:00', end: '22:00' },
    },
    'Hotel': {
      monday: { open: true, start: '00:00', end: '23:59' },
      tuesday: { open: true, start: '00:00', end: '23:59' },
      wednesday: { open: true, start: '00:00', end: '23:59' },
      thursday: { open: true, start: '00:00', end: '23:59' },
      friday: { open: true, start: '00:00', end: '23:59' },
      saturday: { open: true, start: '00:00', end: '23:59' },
      sunday: { open: true, start: '00:00', end: '23:59' },
    },
    'Clinic': {
      monday: { open: true, start: '09:00', end: '18:00' },
      tuesday: { open: true, start: '09:00', end: '18:00' },
      wednesday: { open: true, start: '09:00', end: '18:00' },
      thursday: { open: true, start: '09:00', end: '18:00' },
      friday: { open: true, start: '09:00', end: '18:00' },
      saturday: { open: true, start: '09:00', end: '14:00' },
      sunday: { open: false, start: '09:00', end: '18:00' },
    },
    'Gym': {
      monday: { open: true, start: '06:00', end: '22:00' },
      tuesday: { open: true, start: '06:00', end: '22:00' },
      wednesday: { open: true, start: '06:00', end: '22:00' },
      thursday: { open: true, start: '06:00', end: '22:00' },
      friday: { open: true, start: '06:00', end: '22:00' },
      saturday: { open: true, start: '07:00', end: '20:00' },
      sunday: { open: true, start: '08:00', end: '18:00' },
    },
    'Salon': {
      monday: { open: true, start: '10:00', end: '20:00' },
      tuesday: { open: true, start: '10:00', end: '20:00' },
      wednesday: { open: true, start: '10:00', end: '20:00' },
      thursday: { open: true, start: '10:00', end: '20:00' },
      friday: { open: true, start: '10:00', end: '20:00' },
      saturday: { open: true, start: '09:00', end: '21:00' },
      sunday: { open: true, start: '10:00', end: '19:00' },
    },
    'Spa': {
      monday: { open: true, start: '10:00', end: '20:00' },
      tuesday: { open: true, start: '10:00', end: '20:00' },
      wednesday: { open: true, start: '10:00', end: '20:00' },
      thursday: { open: true, start: '10:00', end: '20:00' },
      friday: { open: true, start: '10:00', end: '20:00' },
      saturday: { open: true, start: '09:00', end: '21:00' },
      sunday: { open: true, start: '10:00', end: '19:00' },
    },
    'Pharmacy': {
      monday: { open: true, start: '08:00', end: '21:00' },
      tuesday: { open: true, start: '08:00', end: '21:00' },
      wednesday: { open: true, start: '08:00', end: '21:00' },
      thursday: { open: true, start: '08:00', end: '21:00' },
      friday: { open: true, start: '08:00', end: '21:00' },
      saturday: { open: true, start: '08:00', end: '21:00' },
      sunday: { open: true, start: '09:00', end: '20:00' },
    },
    'Bank': {
      monday: { open: true, start: '10:00', end: '16:00' },
      tuesday: { open: true, start: '10:00', end: '16:00' },
      wednesday: { open: true, start: '10:00', end: '16:00' },
      thursday: { open: true, start: '10:00', end: '16:00' },
      friday: { open: true, start: '10:00', end: '16:00' },
      saturday: { open: true, start: '10:00', end: '14:00' },
      sunday: { open: false, start: '10:00', end: '16:00' },
    },
  };

  return categoryHours[category] || defaultHours;
};

/**
 * Get default services based on category
 * @param {string} category - Business category
 * @returns {array} Default services array
 */
const getDefaultServices = (category) => {
  const defaultServices = {
    'Restaurant': [
      { title: 'Dine-In', description: 'Enjoy our delicious meals in a comfortable dining atmosphere', price: '', featured: true },
      { title: 'Takeaway', description: 'Order your favorite dishes for takeaway', price: '', featured: false },
      { title: 'Home Delivery', description: 'Get food delivered to your doorstep', price: '', featured: false },
    ],
    'Hotel': [
      { title: 'Room Booking', description: 'Comfortable and well-appointed rooms for your stay', price: '', featured: true },
      { title: 'Room Service', description: '24/7 room service for your convenience', price: '', featured: false },
      { title: 'WiFi & Amenities', description: 'Free WiFi and modern amenities included', price: '', featured: false },
    ],
    'Clinic': [
      { title: 'General Consultation', description: 'Comprehensive health check-ups and consultations', price: '', featured: true },
      { title: 'Health Checkup', description: 'Regular health screenings and preventive care', price: '', featured: false },
      { title: 'Emergency Care', description: 'Immediate medical attention when you need it', price: '', featured: false },
    ],
    'Gym': [
      { title: 'Personal Training', description: 'One-on-one training sessions with expert trainers', price: '', featured: true },
      { title: 'Group Classes', description: 'Join our fitness classes and stay motivated', price: '', featured: false },
      { title: 'Cardio & Strength', description: 'State-of-the-art equipment for all fitness levels', price: '', featured: false },
    ],
    'Salon': [
      { title: 'Hair Styling', description: 'Professional haircuts and styling services', price: '', featured: true },
      { title: 'Hair Coloring', description: 'Expert hair coloring and treatment', price: '', featured: false },
      { title: 'Beauty Treatments', description: 'Facial, manicure, and other beauty services', price: '', featured: false },
    ],
    'Spa': [
      { title: 'Full Body Massage', description: 'Relaxing full body massage therapy', price: '', featured: true },
      { title: 'Facial Treatment', description: 'Rejuvenating facial treatments', price: '', featured: false },
      { title: 'Aromatherapy', description: 'Therapeutic aromatherapy sessions', price: '', featured: false },
    ],
  };

  return defaultServices[category] || [];
};


const CreateWebsite = () => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [subdomainStatus, setSubdomainStatus] = useState(null); // { checking: false, available: null, slug: '', suggestions: [] }
  const [customSlug, setCustomSlug] = useState('');
  const [showCustomSlug, setShowCustomSlug] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const checkTimeoutRef = useRef(null);

  // Form sections/steps state
  const totalSteps = 5;
  const autoSaveTimeoutRef = useRef(null);

  // Form steps configuration
  const formSteps = [
    { id: 1, name: 'Basic Info', icon: Building2, description: 'Business name, category, and owner details' },
    { id: 2, name: 'Contact', icon: Phone, description: 'Phone, email, address, and social media' },
    { id: 3, name: 'Media', icon: Eye, description: 'Logo, images, videos, and description' },
    { id: 4, name: 'Services', icon: ShoppingBag, description: 'Services, offers, and business hours' },
    { id: 5, name: 'Review', icon: CheckCircle, description: 'Review and submit your website' },
  ];

  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    category: '',
    mobileNumber: '',
    email: '',
    address: '',
    googleMapLink: '',
    whatsappNumber: '',
    description: '',
    images: [],
    logo: null,
    youtubeVideos: [],
    instagram: '',
    facebook: '',
    website: '',
    navbarTagline: '',
    footerDescription: '',
    services: [],
    specialOffers: [],
    businessHours: {
      monday: { open: true, start: '09:00', end: '18:00' },
      tuesday: { open: true, start: '09:00', end: '18:00' },
      wednesday: { open: true, start: '09:00', end: '18:00' },
      thursday: { open: true, start: '09:00', end: '18:00' },
      friday: { open: true, start: '09:00', end: '18:00' },
      saturday: { open: true, start: '09:00', end: '18:00' },
      sunday: { open: true, start: '09:00', end: '18:00' },
    },
    googlePlacesData: null, // Store Google Places extracted data (reviews, attributes, etc.)
    appointmentSettings: {
      contactMethod: 'whatsapp', // 'whatsapp' or 'call'
      availableSlots: [],
    },
    theme: 'modern', // 'modern', 'classic', 'minimal'
  });

  // Slugify function - allow hyphens for spaces
  const slugify = (text) => {
    if (!text) return '';
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '')         // Remove all spaces (no hyphens)
      .replace(/[^\w]+/g, '')      // Remove all non-word chars
      .replace(/^[^a-z]+/, '')     // Remove non-letters from start
      .substring(0, 50);            // Limit to 50 chars
  };

  // Check subdomain availability
  const checkSubdomain = async (slug) => {
    if (!slug || slug.length < 3) {
      setSubdomainStatus(null);
      return;
    }

    setSubdomainStatus({ checking: true, available: null, slug, suggestions: [] });

    try {
      const response = await businessAPI.checkSubdomainAvailability(slug);
      setSubdomainStatus({
        checking: false,
        available: response.available,
        slug: response.slug,
        suggestions: response.suggestions || [],
      });
    } catch (error) {
      console.error('Error checking subdomain:', error);
      setSubdomainStatus({
        checking: false,
        available: null,
        slug,
        suggestions: [],
        error: error.message,
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = {
        ...prev,
        [name]: value,
      };

      // Enhanced smart defaults based on category
      if (name === 'category' && value) {
        // Auto-fill description if empty
        if (!prev.description.trim()) {
          updated.description = getDefaultDescription(value, prev.businessName);
        }
        // Auto-fill tagline if empty
        if (!prev.navbarTagline.trim()) {
          updated.navbarTagline = getDefaultTagline(value);
        }
        // Auto-fill footer description if empty
        if (!prev.footerDescription.trim()) {
          updated.footerDescription = getDefaultFooterDescription(value, prev.businessName);
        }

        // Smart defaults for business hours based on category
        const categoryHours = getDefaultBusinessHours(value);
        if (categoryHours) {
          updated.businessHours = categoryHours;
        }

        // Smart defaults for services based on category
        if (prev.services.length === 0) {
          const defaultServices = getDefaultServices(value);
          if (defaultServices.length > 0) {
            updated.services = defaultServices;
          }
        }
      }

      // Auto-fill business name in description/tagline if business name changes
      if (name === 'businessName' && value && prev.category) {
        if (prev.description && prev.description.includes('We ') && !prev.description.includes(value)) {
          updated.description = getDefaultDescription(prev.category, value);
        }
        if (prev.navbarTagline && !prev.navbarTagline.includes(value)) {
          updated.navbarTagline = getDefaultTagline(prev.category);
        }

      }

      return updated;
    });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }

    // Check subdomain availability when business name changes
    if (name === 'businessName' && !showCustomSlug) {
      // Clear previous timeout
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }

      // Debounce the check (wait 500ms after user stops typing)
      checkTimeoutRef.current = setTimeout(() => {
        const slug = slugify(value);
        if (slug.length >= 3) {
          checkSubdomain(slug);
          setCustomSlug(slug);
        } else {
          setSubdomainStatus(null);
          setCustomSlug('');
        }
      }, 500);
    }
  };

  // Handle custom slug change
  const handleCustomSlugChange = (e) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setCustomSlug(value);

    // Clear previous timeout
    if (checkTimeoutRef.current) {
      clearTimeout(checkTimeoutRef.current);
    }

    // Debounce the check
    checkTimeoutRef.current = setTimeout(() => {
      if (value.length >= 3) {
        checkSubdomain(value);
      } else {
        setSubdomainStatus({ checking: false, available: null, slug: value, suggestions: [] });
      }
    }, 500);
  };

  // Auto-save to localStorage
  const saveToLocalStorage = useCallback((data) => {
    try {
      // Don't save file objects (they can't be serialized)
      const dataToSave = {
        ...data,
        images: [], // Don't save file objects
        logo: null, // Don't save file objects
        services: data.services.map(s => ({ ...s, image: null })), // Remove file objects
        specialOffers: data.specialOffers.map(o => ({ ...o, image: null })), // Remove file objects
      };
      localStorage.setItem('noida_form_draft', JSON.stringify(dataToSave));
      localStorage.setItem('noida_form_timestamp', Date.now().toString());
    } catch (error) {
      console.warn('Failed to save form to localStorage:', error);
    }
  }, []);

  // Check step completion based on form data
  const getStepCompletion = (stepId) => {
    switch (stepId) {
      case 1: // Basic Info
        return !!(formData.businessName && formData.category);
      case 2: // Contact
        return !!(formData.mobileNumber && formData.email && formData.address);
      case 3: // Media
        return !!(formData.images && formData.images.length > 0);
      case 4: // Services
        return true; // Services are optional, so always consider complete
      case 5: // Review
        return false; // Review step is never "completed" until submission
      default:
        return false;
    }
  };

  // Calculate completed steps count
  const getCompletedStepsCount = () => {
    return formSteps.filter(step => getStepCompletion(step.id)).length;
  };

  // Get current active step (highest completed step + 1, or 1 if none completed)
  const getCurrentStep = () => {
    const completedCount = getCompletedStepsCount();
    return Math.min(completedCount + 1, totalSteps);
  };

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('noida_form_draft');
      const savedTimestamp = localStorage.getItem('noida_form_timestamp');

      if (savedData && savedTimestamp) {
        // Check if saved data is less than 7 days old
        const daysSinceSave = (Date.now() - parseInt(savedTimestamp)) / (1000 * 60 * 60 * 24);
        if (daysSinceSave < 7) {
          const parsed = JSON.parse(savedData);
          // Restore form data (excluding files)
          setFormData(prev => ({
            ...prev,
            ...parsed,
            images: prev.images, // Keep current images
            logo: prev.logo, // Keep current logo
          }));
          if (parsed.customSlug) {
            setCustomSlug(parsed.customSlug);
          }
        } else {
          // Clear old data
          localStorage.removeItem('noida_form_draft');
          localStorage.removeItem('noida_form_timestamp');
        }
      }
    } catch (error) {
      console.warn('Failed to load form from localStorage:', error);
    }
  }, []);

  // Auto-save when formData changes (debounced)
  useEffect(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      saveToLocalStorage({
        ...formData,
        customSlug,
      });
    }, 1000); // Save 1 second after user stops typing

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [formData, customSlug, saveToLocalStorage]);

  // Cleanup timeouts on unmount

  useEffect(() => {
    return () => {
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }

    };
  }, []);

  const handleFileChange = (name, files) => {
    setFormData(prev => ({
      ...prev,
      [name]: files,
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Services handlers
  const addService = () => {
    setFormData(prev => ({
      ...prev,
      services: [...prev.services, { title: '', description: '', price: '', image: null, featured: false }]
    }));
  };

  const removeService = (index) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }));
  };

  const updateService = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.map((service, i) =>
        i === index ? { ...service, [field]: value } : service
      )
    }));
  };

  const toggleServiceFeatured = (index) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.map((service, i) =>
        i === index ? { ...service, featured: !service.featured } : service
      )
    }));
  };

  // Special Offers handlers
  const addSpecialOffer = () => {
    setFormData(prev => ({
      ...prev,
      specialOffers: [...prev.specialOffers, { title: '', description: '', expiryDate: '' }]
    }));
  };

  const removeSpecialOffer = (index) => {
    setFormData(prev => ({
      ...prev,
      specialOffers: prev.specialOffers.filter((_, i) => i !== index)
    }));
  };

  const updateSpecialOffer = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      specialOffers: prev.specialOffers.map((offer, i) =>
        i === index ? { ...offer, [field]: value } : offer
      )
    }));
  };

  // YouTube Videos handlers
  const addYouTubeVideo = () => {
    setFormData(prev => ({
      ...prev,
      youtubeVideos: [...prev.youtubeVideos, '']
    }));
  };

  const removeYouTubeVideo = (index) => {
    setFormData(prev => ({
      ...prev,
      youtubeVideos: prev.youtubeVideos.filter((_, i) => i !== index)
    }));
  };

  const updateYouTubeVideo = (index, value) => {
    setFormData(prev => ({
      ...prev,
      youtubeVideos: prev.youtubeVideos.map((video, i) =>
        i === index ? value : video
      )
    }));
  };

  // Business Hours handlers
  const updateBusinessHours = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: {
          ...prev.businessHours[day],
          [field]: value
        }
      }
    }));
  };

  // Appointment handlers
  const updateAppointmentSettings = (field, value) => {
    setFormData(prev => ({
      ...prev,
      appointmentSettings: {
        ...prev.appointmentSettings,
        [field]: value
      }
    }));
  };

  const addTimeSlot = () => {
    setFormData(prev => ({
      ...prev,
      appointmentSettings: {
        ...prev.appointmentSettings,
        availableSlots: [...prev.appointmentSettings.availableSlots, { time: '', label: '' }]
      }
    }));
  };

  const removeTimeSlot = (index) => {
    setFormData(prev => ({
      ...prev,
      appointmentSettings: {
        ...prev.appointmentSettings,
        availableSlots: prev.appointmentSettings.availableSlots.filter((_, i) => i !== index)
      }
    }));
  };

  const updateTimeSlot = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      appointmentSettings: {
        ...prev.appointmentSettings,
        availableSlots: prev.appointmentSettings.availableSlots.map((slot, i) =>
          i === index ? { ...slot, [field]: value } : slot
        )
      }
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Business name is required';
    }

    if (!formData.category) {
      newErrors.category = 'Business category is required';
    }

    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required';
    } else if (!/^[0-9]{10}$/.test(formData.mobileNumber.replace(/\D/g, ''))) {
      newErrors.mobileNumber = 'Please enter a valid 10-digit mobile number';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Full address is required';
    }

    // Description is optional - no validation needed
    // Users can leave it empty or Google Places will auto-fill it if available

    // Validate subdomain availability
    const finalSlug = showCustomSlug ? customSlug : slugify(formData.businessName);
    if (!finalSlug || finalSlug.length < 3) {
      if (formData.businessName.trim()) {
        newErrors.businessName = 'Business name must be at least 3 characters';
      }
    } else if (subdomainStatus && subdomainStatus.available === false) {
      newErrors.businessName = 'This subdomain is already taken. Please customize it or choose a different name.';
    } else if (subdomainStatus && subdomainStatus.checking) {
      newErrors.businessName = 'Please wait while we check subdomain availability...';
    }

    // Logo is optional - will use first letter of business name if not provided
    // if (!formData.logo) {
    //   newErrors.logo = 'Logo is required';
    // }

    if (formData.images.length === 0) {
      newErrors.images = 'At least one image is required';
    }

    if (formData.whatsappNumber && !/^[0-9]{10}$/.test(formData.whatsappNumber.replace(/\D/g, ''))) {
      newErrors.whatsappNumber = 'Please enter a valid 10-digit WhatsApp number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Create FormData for file uploads
      const submitData = new FormData();
      submitData.append('businessName', formData.businessName);

      // If custom slug is set and available, send it as preferred slug
      const preferredSlug = showCustomSlug && customSlug ? customSlug : null;
      if (preferredSlug && subdomainStatus?.available === true) {
        submitData.append('preferredSlug', preferredSlug);
      }

      submitData.append('ownerName', formData.ownerName);
      submitData.append('category', formData.category);
      submitData.append('mobileNumber', formData.mobileNumber);
      submitData.append('email', formData.email);
      submitData.append('address', formData.address);
      submitData.append('googleMapLink', formData.googleMapLink);
      submitData.append('whatsappNumber', formData.whatsappNumber);
      submitData.append('description', formData.description);
      // Handle YouTube videos as JSON array (filter out empty strings)
      const youtubeVideosArray = formData.youtubeVideos.filter(v => v && v.trim());
      submitData.append('youtubeVideo', JSON.stringify(youtubeVideosArray));
      submitData.append('instagram', formData.instagram);
      submitData.append('facebook', formData.facebook);
      submitData.append('website', formData.website);
      submitData.append('navbarTagline', formData.navbarTagline || '');
      submitData.append('footerDescription', formData.footerDescription || '');
      submitData.append('services', JSON.stringify(formData.services || []));
      submitData.append('specialOffers', JSON.stringify(formData.specialOffers || []));
      submitData.append('businessHours', JSON.stringify(formData.businessHours || {}));
      submitData.append('appointmentSettings', JSON.stringify(formData.appointmentSettings || {}));
      submitData.append('theme', formData.theme || 'modern');
      submitData.append('googlePlacesData', JSON.stringify(formData.googlePlacesData || null));

      if (formData.logo) {
        submitData.append('logo', formData.logo);
      }

      formData.images.forEach((image, index) => {
        submitData.append(`images`, image);
      });

      // Add service images
      formData.services.forEach((service, index) => {
        if (service.image) {
          submitData.append(`serviceImage_${index}`, service.image);
        }
      });

      // Send to backend API
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/business/create`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: submitData,
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
        throw new Error(data.error || 'Failed to create business website');
      }

      setSuccessMessage({
        title: data.requiresApproval ? 'Website Submitted for Approval!' : 'Website Created Successfully!',
        message: data.requiresApproval
          ? 'Your website has been submitted and is pending admin approval. You will be promoted to Content Admin once approved. You can check the status in your profile.'
          : 'Your website is live!',
        subdomain: data.business.subdomainUrl,
        status: data.business.status
      });
      setErrorMessage(null);

      // Reset form
      setFormData({
        businessName: '',
        ownerName: '',
        category: '',
        mobileNumber: '',
        email: '',
        address: '',
        googleMapLink: '',
        whatsappNumber: '',
        description: '',
        images: [],
        logo: null,
        youtubeVideos: [],
        instagram: '',
        facebook: '',
        website: '',
        navbarTagline: '',
        footerDescription: '',
        services: [],
        specialOffers: [],
        businessHours: {
          monday: { open: true, start: '09:00', end: '18:00' },
          tuesday: { open: true, start: '09:00', end: '18:00' },
          wednesday: { open: true, start: '09:00', end: '18:00' },
          thursday: { open: true, start: '09:00', end: '18:00' },
          friday: { open: true, start: '09:00', end: '18:00' },
          saturday: { open: true, start: '09:00', end: '18:00' },
          sunday: { open: true, start: '09:00', end: '18:00' },
        },
        appointmentSettings: {
          contactMethod: 'whatsapp',
          availableSlots: [],
        },
        theme: 'modern',
      });

      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrorMessage(error.message || 'Failed to submit form. Please try again.');
      setSuccessMessage(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">

          {/* Hero Section */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-6 shadow-lg">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Create Your Website
            </h1>
            <p className="text-base sm:text-lg text-gray-600 max-w-4xl mx-auto px-4">

              Build your online presence in minutes. Fill in your business details below and get your professional website ready.
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="mb-8 bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                  Form Progress
                </h2>
                <p className="text-sm text-gray-600 mt-1">Complete each section to build your website</p>
              </div>
              <div className="text-sm text-gray-500 font-medium">
                {Math.round((getCompletedStepsCount() / totalSteps) * 100)}% Complete
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
              <div
                className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(getCompletedStepsCount() / totalSteps) * 100}%` }}
              />
            </div>

            {/* Step Indicators */}
            <div className="flex items-center justify-between">
              {formSteps.map((step, index) => {
                const StepIcon = step.icon;
                const isCompleted = getStepCompletion(step.id);
                const currentStepNum = getCurrentStep();
                const isActive = currentStepNum === step.id;

                return (
                  <div key={step.id} className="flex-1 flex items-center">
                    <div className="flex flex-col items-center flex-1">
                      <div
                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300 ${isActive
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-110'
                          : isCompleted
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-400'
                          }`}
                      >
                        {isCompleted ? (
                          <CheckCircle className="w-6 h-6" />
                        ) : (
                          <StepIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                        )}
                      </div>
                      <span className={`text-xs sm:text-sm mt-2 text-center font-medium ${isActive ? 'text-blue-600 font-bold' : isCompleted ? 'text-green-600' : 'text-gray-500'
                        }`}>
                        {step.name}
                      </span>
                    </div>
                    {index < formSteps.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-2 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'
                        }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Auto-save indicator */}
          <div className="mb-4 text-center">
            <div className="inline-flex items-center gap-2 text-xs text-gray-500 bg-white px-3 py-1.5 rounded-full border border-gray-200">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>Auto-saving your progress...</span>
            </div>
          </div>

          {/* Success Message */}
          {
            successMessage && (
              <div className="mb-6 bg-green-50 border-2 border-green-200 rounded-2xl p-6 shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-green-900 mb-2">{successMessage.title}</h3>
                    {successMessage.message && (
                      <p className="text-sm text-green-800 mb-3">{successMessage.message}</p>
                    )}
                    {successMessage.status === 'pending' && (
                      <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3 mb-3">
                        <p className="text-sm text-yellow-800 font-semibold">⏳ Status: Pending Approval</p>
                        <p className="text-xs text-yellow-700 mt-1">Your website will be live once the admin approves it.</p>
                      </div>
                    )}
                    {successMessage.status === 'approved' && (
                      <div className="space-y-2 text-sm text-green-800">
                        <p><strong>Subdomain:</strong> <a href={successMessage.subdomain} target="_blank" rel="noopener noreferrer" className="underline hover:text-green-600">{successMessage.subdomain}</a></p>
                      </div>
                    )}
                    <button
                      onClick={() => setSuccessMessage(null)}
                      className="mt-4 text-sm text-green-700 hover:text-green-900 underline"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            )
          }

          {/* Error Message */}
          {
            errorMessage && (
              <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-2xl p-6 shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <XCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-red-900 mb-2">Error</h3>
                    <p className="text-sm text-red-800">{errorMessage}</p>
                    <button
                      onClick={() => setErrorMessage(null)}
                      className="mt-4 text-sm text-red-700 hover:text-red-900 underline"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            )
          }

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 lg:p-10 border border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Quick Search - Auto Fill Section */}
              <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-6 md:p-8 border-2 border-blue-200 mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Quick Start: Search Your Business</h2>
                    <p className="text-xs sm:text-sm text-gray-600">Find your business and auto-fill all details instantly</p>
                  </div>
                </div>
                <div className="mt-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    🔍 Search Your Business Here
                  </label>
                  <PlacesAutocomplete
                    value={formData.address}
                    onChange={handleChange}
                    onPlaceSelect={async (businessData) => {
                      if (businessData) {
                        console.log('📥 Received business data:', businessData);

                        // Download and add images if available
                        let newImages = [...formData.images];
                        let newLogo = formData.logo; // Keep existing logo if user already set one

                        if ((businessData.photos?.length > 0 || businessData.photoUrl) && formData.images.length === 0) {
                          try {
                            // Use photos array if available, otherwise fall back to photoUrl
                            const photoUrls = businessData.photos?.length > 0
                              ? businessData.photos.map(p => typeof p === 'string' ? p : (p.url || p))
                              : businessData.photoUrl ? [businessData.photoUrl] : [];

                            console.log('📸 Downloading images:', photoUrls.length);
                            setLoading(true);

                            // Download first image as logo (if logo not already set)
                            if (photoUrls.length > 0 && !formData.logo) {
                              try {
                                const logoResponse = await fetch(photoUrls[0]);
                                if (logoResponse.ok) {
                                  const logoBlob = await logoResponse.blob();
                                  const logoFileName = `google-place-logo-${Date.now()}.jpg`;
                                  const logoFile = new File([logoBlob], logoFileName, { type: logoBlob.type || 'image/jpeg' });
                                  newLogo = logoFile;
                                  console.log('✅ Logo downloaded from first image');
                                }
                              } catch (error) {
                                console.warn('⚠️ Failed to download logo:', error);
                              }
                            }

                            // Download all photos (up to 5) for gallery
                            const downloadedFiles = [];
                            for (const photoUrl of photoUrls.slice(0, 5)) {
                              try {
                                const response = await fetch(photoUrl);
                                if (response.ok) {
                                  const blob = await response.blob();
                                  // Create a File object from the blob
                                  const fileName = `google-place-${Date.now()}-${downloadedFiles.length}.jpg`;
                                  const file = new File([blob], fileName, { type: blob.type || 'image/jpeg' });
                                  downloadedFiles.push(file);
                                }
                              } catch (error) {
                                console.warn('⚠️ Failed to download one image:', error);
                                // Continue with other images
                              }
                            }

                            if (downloadedFiles.length > 0) {
                              newImages = downloadedFiles;
                              console.log(`✅ ${downloadedFiles.length} image(s) downloaded successfully`);
                            }
                          } catch (error) {
                            console.error('❌ Error downloading images:', error);
                            // Continue without images - don't block the form
                          } finally {
                            setLoading(false);
                          }
                        }

                        // Auto-fill form fields with place data
                        setFormData(prev => ({
                          ...prev,
                          address: businessData.address || prev.address,
                          googleMapLink: businessData.googleMapLink || prev.googleMapLink,
                          // Only auto-fill business name if it's empty
                          businessName: prev.businessName || businessData.businessName || '',
                          // Only auto-fill phone if it's empty
                          mobileNumber: prev.mobileNumber || formatPhoneNumber(businessData.phoneNumber) || '',
                          // Only auto-fill website if it's empty
                          website: prev.website || businessData.website || '',
                          // Auto-fill description: Google Places first, then category-based, then keep existing
                          description: prev.description || businessData.description || (prev.category ? getDefaultDescription(prev.category, businessData.businessName || prev.businessName) : ''),
                          // Auto-fill tagline: category-based if empty
                          navbarTagline: prev.navbarTagline || (prev.category ? getDefaultTagline(prev.category) : ''),
                          // Auto-fill footer description: category-based if empty
                          footerDescription: prev.footerDescription || (prev.category ? getDefaultFooterDescription(prev.category, businessData.businessName || prev.businessName) : ''),
                          // Add downloaded images
                          images: newImages,
                          // Set logo from first image (if not already set)
                          logo: newLogo,
                          // Auto-fill business hours if available and form is empty
                          businessHours: (() => {
                            if (businessData.businessHours && Object.keys(businessData.businessHours).length > 0) {
                              // Check if form has any hours set
                              const hasHours = Object.values(prev.businessHours).some(day => day.open);
                              return hasHours ? prev.businessHours : businessData.businessHours;
                            }
                            return prev.businessHours;
                          })(),
                          // Store additional data for website display (reviews, attributes, etc.)
                          googlePlacesData: {
                            rating: businessData.rating,
                            totalRatings: businessData.totalRatings,
                            reviews: businessData.reviews || [],
                            attributes: businessData.attributes || {},
                            paymentOptions: businessData.paymentOptions,
                            parkingOptions: businessData.parkingOptions,
                            priceLevel: businessData.priceLevel,
                            primaryType: businessData.primaryType,
                            primaryTypeDisplayName: businessData.primaryTypeDisplayName,
                            businessStatus: businessData.businessStatus,
                            plusCode: businessData.plusCode,
                            currentOpeningHours: businessData.currentOpeningHours,
                          },
                        }));

                        // Show success message
                        setSuccessMessage({
                          title: '✅ Business Details Extracted!',
                          message: `We've auto-filled your business details from Google. Please review and update as needed.`,
                          temporary: true,
                        });

                        // Clear temporary message after 5 seconds
                        setTimeout(() => {
                          setSuccessMessage(prev =>
                            prev?.temporary ? null : prev
                          );
                        }, 5000);
                      }
                    }}
                    placeholder="Type your business name or address (e.g., 'Restaurant in Noida', 'Sector 18 Market')"
                    error={errors.address}
                    className="text-lg"
                  />
                  <div className="mt-4 p-4 bg-white rounded-xl border border-blue-200">
                    <p className="text-sm font-medium text-gray-800 mb-2">
                      ✨ What gets auto-filled:
                    </p>
                    <ul className="text-xs text-gray-600 space-y-1 ml-4 list-disc">
                      <li>Business Name</li>
                      <li>Complete Address (with City, State, Country)</li>
                      <li>Phone Number</li>
                      <li>Website URL</li>
                      <li>Google Maps Link</li>
                      <li>Business Description (if available)</li>
                      <li>Business Photos (up to 5 images)</li>
                    </ul>
                    <p className="text-xs text-gray-500 mt-3 italic">
                      Note: Some fields like Email, Owner Name, and Category need to be filled manually as they're not available from Google Places.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 1: Basic Information */}
              <div className="mb-8">

                {/* Theme Selection Section */}
                <div className="border-b border-gray-200 pb-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                      <Palette className="w-5 h-5 text-purple-600" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Choose Your Theme <span className="text-xs sm:text-sm font-normal text-gray-500">(Can be changed later)</span></h2>
                  </div>
                  <p className="text-sm text-gray-600 mb-6">
                    Select a theme that best represents your business. You can change this anytime after creating your website.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Modern Theme */}
                    <div
                      onClick={() => setFormData(prev => ({ ...prev, theme: 'modern' }))}
                      className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all ${formData.theme === 'modern'
                        ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200'
                        : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50/50'
                        }`}
                    >
                      {formData.theme === 'modern' && (
                        <div className="absolute top-4 right-4 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div className="mb-4">
                        <div className="h-32 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-xl mb-3"></div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Modern</h3>
                        <p className="text-sm text-gray-600">
                          Bold gradients, vibrant colors, and contemporary design. Perfect for tech startups and modern businesses.
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <div className="w-8 h-8 bg-blue-500 rounded"></div>
                        <div className="w-8 h-8 bg-indigo-500 rounded"></div>
                        <div className="w-8 h-8 bg-purple-500 rounded"></div>
                      </div>
                    </div>

                    {/* Classic Theme */}
                    <div
                      onClick={() => setFormData(prev => ({ ...prev, theme: 'classic' }))}
                      className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all ${formData.theme === 'classic'
                        ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-200'
                        : 'border-gray-200 bg-white hover:border-amber-300 hover:bg-amber-50/50'
                        }`}
                    >
                      {formData.theme === 'classic' && (
                        <div className="absolute top-4 right-4 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div className="mb-4">
                        <div className="h-32 bg-gradient-to-br from-amber-600 via-orange-600 to-red-600 rounded-xl mb-3"></div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Classic</h3>
                        <p className="text-sm text-gray-600">
                          Warm tones, elegant design, and traditional aesthetics. Ideal for restaurants, salons, and service businesses.
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <div className="w-8 h-8 bg-amber-500 rounded"></div>
                        <div className="w-8 h-8 bg-orange-500 rounded"></div>
                        <div className="w-8 h-8 bg-red-500 rounded"></div>
                      </div>
                    </div>

                    {/* Minimal Theme */}
                    <div
                      onClick={() => setFormData(prev => ({ ...prev, theme: 'minimal' }))}
                      className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all ${formData.theme === 'minimal'
                        ? 'border-gray-500 bg-gray-50 ring-2 ring-gray-200'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50'
                        }`}
                    >
                      {formData.theme === 'minimal' && (
                        <div className="absolute top-4 right-4 w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div className="mb-4">
                        <div className="h-32 bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 rounded-xl mb-3 border-2 border-gray-300"></div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Minimal</h3>
                        <p className="text-sm text-gray-600">
                          Clean lines, subtle colors, and focus on content. Great for professional services and consultants.
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <div className="w-8 h-8 bg-gray-400 rounded"></div>
                        <div className="w-8 h-8 bg-gray-500 rounded"></div>
                        <div className="w-8 h-8 bg-gray-600 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Business Information Section */}
                <div className="border-b border-gray-200 pb-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Business Information</h2>
                    <HelpTooltip text="Enter your business name and category. The business name will be used to create your website URL (subdomain)." />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <label className="block text-sm font-medium text-gray-700">Business Name</label>
                        <HelpTooltip text="This will be your business name displayed on your website and used to create your unique URL." />
                      </div>
                      <FormInput
                        label=""

                        name="businessName"
                        value={formData.businessName}
                        onChange={handleChange}
                        placeholder="Enter business name"
                        required
                        error={errors.businessName}
                        icon={Building2}
                      />

                      {/* Subdomain Availability Checker */}
                      {formData.businessName && (
                        <div className="mt-3 space-y-2">
                          {!showCustomSlug ? (
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <span className="font-medium">Subdomain:</span>
                                  <code className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
                                    {customSlug || slugify(formData.businessName) || '...'}
                                  </code>
                                  {subdomainStatus?.checking && (
                                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                                  )}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setShowCustomSlug(true);
                                  if (!customSlug) {
                                    const slug = slugify(formData.businessName);
                                    setCustomSlug(slug);
                                    if (slug.length >= 3) {
                                      checkSubdomain(slug);
                                    }
                                  }
                                }}
                                className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 whitespace-nowrap"
                              >
                                <Edit3 className="w-3 h-3" />
                                Customize
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <label className="text-sm font-medium text-gray-700">Custom Subdomain:</label>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setShowCustomSlug(false);
                                    const slug = slugify(formData.businessName);
                                    setCustomSlug(slug);
                                    if (slug.length >= 3) {
                                      checkSubdomain(slug);
                                    }
                                  }}
                                  className="text-xs text-gray-500 hover:text-gray-700"
                                >
                                  Use auto-generated
                                </button>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 relative">
                                  <input
                                    type="text"
                                    value={customSlug}
                                    onChange={handleCustomSlugChange}
                                    placeholder="your-custom-slug"
                                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm font-mono pr-32"
                                    pattern="[a-z0-9-]{3,50}"
                                    maxLength={50}
                                  />
                                  <span className="absolute right-3 top-2.5 text-xs text-gray-400 font-mono">.noida.me</span>
                                </div>
                                {subdomainStatus?.checking && (
                                  <Loader2 className="w-5 h-5 animate-spin text-blue-600 flex-shrink-0" />
                                )}
                              </div>
                            </div>
                          )}

                          {/* Status Messages */}
                          {subdomainStatus && !subdomainStatus.checking && (
                            <div className={`rounded-lg p-3 border-2 ${subdomainStatus.available === true
                              ? 'bg-green-50 border-green-200'
                              : subdomainStatus.available === false
                                ? 'bg-red-50 border-red-200'
                                : 'bg-yellow-50 border-yellow-200'
                              }`}>
                              {subdomainStatus.available === true ? (
                                <div className="flex items-start gap-2">
                                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                  <div className="flex-1">
                                    <p className="text-sm font-semibold text-green-900">Available!</p>
                                    <p className="text-xs text-green-700 mt-0.5">
                                      Your website will be at: <code className="bg-green-100 px-1.5 py-0.5 rounded font-mono">{subdomainStatus.slug}.noida.me</code>
                                    </p>
                                  </div>
                                </div>
                              ) : subdomainStatus.available === false ? (
                                <div className="flex items-start gap-2">
                                  <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                  <div className="flex-1">
                                    <p className="text-sm font-semibold text-red-900">Already Taken</p>
                                    {subdomainStatus.suggestions && subdomainStatus.suggestions.length > 0 ? (
                                      <div className="mt-2">
                                        <p className="text-xs text-red-700 mb-1">Available alternatives:</p>
                                        <div className="flex flex-wrap gap-2">
                                          {subdomainStatus.suggestions.map((suggestion, idx) => (
                                            <button
                                              key={idx}
                                              type="button"
                                              onClick={() => {
                                                setCustomSlug(suggestion);
                                                checkSubdomain(suggestion);
                                              }}
                                              className="px-2 py-1 bg-white border border-red-300 rounded text-xs font-mono text-red-700 hover:bg-red-50 transition-colors"
                                            >
                                              {suggestion}
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                    ) : (
                                      <p className="text-xs text-red-700 mt-0.5">Please try a different name or customize the subdomain.</p>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-start gap-2">
                                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                  <div className="flex-1">
                                    <p className="text-sm font-semibold text-yellow-900">Invalid Format</p>
                                    <p className="text-xs text-yellow-700 mt-0.5">
                                      Use only lowercase letters, numbers, and hyphens (3-50 characters).
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Validation Error */}
                          {subdomainStatus && subdomainStatus.available === false && !showCustomSlug && (
                            <p className="text-xs text-red-600 mt-1">
                              Please customize the subdomain or choose a different business name.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    <FormInput
                      label="Owner Name"
                      name="ownerName"
                      value={formData.ownerName}
                      onChange={handleChange}
                      placeholder="Enter owner name (optional)"
                      error={errors.ownerName}
                      icon={User}
                    />
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <label className="block text-sm font-medium text-gray-700">Business Category</label>
                        <HelpTooltip text="Select your business category. This will help auto-fill descriptions, taglines, and business hours based on your industry." />
                      </div>
                      <CategorySelect
                        label=""
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                        error={errors.category}
                      />
                    </div>

                    <FormInput
                      label="Mobile Number"
                      name="mobileNumber"
                      type="tel"
                      value={formData.mobileNumber}
                      onChange={handleChange}
                      placeholder="10-digit mobile number"
                      required
                      error={errors.mobileNumber}
                      icon={Phone}
                    />
                  </div >
                </div >
              </div>

              {/* Step 2: Contact Information */}
              <div className="mb-8">

                {/* Contact Information Section */}
                < div className="border-b border-gray-200 pb-8" >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                      <Mail className="w-5 h-5 text-indigo-600" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Contact Information</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <HelpTooltip text="Your business email address. This will be displayed on your website for customer inquiries." />
                      </div>
                      <FormInput
                        label=""
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="business@example.com"
                        required
                        error={errors.email}
                        icon={Mail}
                      />
                    </div>

                    <FormInput
                      label="WhatsApp Number"
                      name="whatsappNumber"
                      type="tel"
                      value={formData.whatsappNumber}
                      onChange={handleChange}
                      placeholder="10-digit WhatsApp number (optional)"
                      error={errors.whatsappNumber}
                      icon={MessageCircle}
                    />
                  </div >
                </div >

                {/* Location Information Section */}
                < div className="border-b border-gray-200 pb-8" >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-purple-600" />
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Location Information</h2>
                    </div>
                    <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                      <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <span className="text-xs sm:text-sm font-medium text-blue-700">Auto-Fill Available</span>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <FormInput
                      label="Full Address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Enter complete business address"
                      required
                      error={errors.address}
                      icon={MapPin}
                    />
                    <p className="text-sm text-gray-500 -mt-4">
                      💡 <strong>Tip:</strong> Use the search box at the top of the form to auto-fill this and other details.
                    </p>
                    <FormInput
                      label="Google Map Link"
                      name="googleMapLink"
                      type="url"
                      value={formData.googleMapLink}
                      onChange={handleChange}
                      placeholder="https://maps.google.com/... (auto-filled if address found)"
                      error={errors.googleMapLink}
                      icon={LinkIcon}
                    />
                  </div>
                </div >

                {/* Business Description */}
                < div className="border-b border-gray-200 pb-8" >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-pink-600" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Business Description <span className="text-xs sm:text-sm font-normal text-gray-500">(Optional)</span></h2>
                  </div>
                  <TextArea
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe your business in detail. This will be auto-filled from Google Places if available..."
                    rows={6}
                    error={errors.description}
                  />
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      {formData.description ? (
                        <span className="text-gray-600">{formData.description.length} characters</span>
                      ) : (
                        <span className="text-gray-400">Leave empty or let Google Places auto-fill it</span>
                      )}
                    </p>
                  </div>
                </div >
              </div>

              {/* Step 3: Media */}
              <div className="mb-8">

                {/* YouTube Video Section */}
                < div className="border-b border-gray-200 pb-8" >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Youtube className="w-5 h-5 text-red-600" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Video Content <span className="text-xs sm:text-sm font-normal text-gray-500">(Optional)</span></h2>
                  </div>
                  <p className="text-sm text-gray-600 mb-4 sm:mb-6">
                    Add multiple YouTube videos to showcase your business. Each video will be embedded on your website.
                  </p>

                  <div className="space-y-3 sm:space-y-4">
                    {formData.youtubeVideos.map((video, index) => (
                      <div key={index} className="p-3 sm:p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
                        <div className="flex items-center justify-between mb-2 sm:mb-3">
                          <label className="block text-xs sm:text-sm font-semibold text-gray-700">
                            Video {index + 1}
                          </label>
                          <button
                            type="button"
                            onClick={() => removeYouTubeVideo(index)}
                            className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                            aria-label={`Remove video ${index + 1}`}
                          >
                            <X className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                        </div>
                        <FormInput
                          label=""
                          name={`youtubeVideo_${index}`}
                          type="url"
                          value={video}
                          onChange={(e) => updateYouTubeVideo(index, e.target.value)}
                          placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                          error={errors[`youtubeVideo_${index}`]}
                          icon={Youtube}
                        />
                        {video && (
                          <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-xs text-green-700 font-medium">
                              ✓ Video URL added
                            </p>
                          </div>
                        )}
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={addYouTubeVideo}
                      className="w-full py-2.5 sm:py-3 border-2 border-dashed border-red-300 rounded-xl text-red-600 font-semibold hover:bg-red-50 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                    >
                      <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                      Add Another Video
                    </button>
                  </div>

                  {formData.youtubeVideos.length === 0 && (
                    <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs sm:text-sm text-blue-800">
                        <strong>💡 Tip:</strong> Click "Add Another Video" to add your first video, or leave empty if you don't want to add videos.
                      </p>
                    </div>
                  )}
                </div >

                {/* Media Upload Section */}
                < div className="border-b border-gray-200 pb-8" >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-amber-600" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Media</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FileUploader
                      label="Business Logo"
                      name="logo"
                      accept="image/*"
                      multiple={false}
                      required
                      value={formData.logo}
                      onChange={(file) => handleFileChange('logo', file)}
                      error={errors.logo}
                    />
                    <FileUploader
                      label="Business Images"
                      name="images"
                      accept="image/*"
                      multiple={true}
                      required
                      value={formData.images}
                      onChange={(files) => handleFileChange('images', files)}
                      maxFiles={10}
                      error={errors.images}
                    />
                  </div>
                </div >

                {/* Social Links Section */}
                < div className="border-b border-gray-200 pb-8" >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                      <LinkIcon className="w-5 h-5 text-green-600" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Social Links <span className="text-xs sm:text-sm font-normal text-gray-500">(Optional)</span></h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormInput
                      label="Instagram"
                      name="instagram"
                      type="url"
                      value={formData.instagram}
                      onChange={handleChange}
                      placeholder="https://instagram.com/..."
                      error={errors.instagram}
                      icon={Instagram}
                    />
                    <FormInput
                      label="Facebook"
                      name="facebook"
                      type="url"
                      value={formData.facebook}
                      onChange={handleChange}
                      placeholder="https://facebook.com/..."
                      error={errors.facebook}
                      icon={Facebook}
                    />
                    <FormInput
                      label="Website"
                      name="website"
                      type="url"
                      value={formData.website}
                      onChange={handleChange}
                      placeholder="https://yourwebsite.com"
                      error={errors.website}
                      icon={Globe}
                    />
                  </div>
                </div >

                {/* Navbar & Footer Customization Section */}
                < div className="border-b border-gray-200 pb-8" >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-cyan-100 rounded-xl flex items-center justify-center">
                      <Navigation className="w-5 h-5 text-cyan-600" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Navbar & Footer Customization <span className="text-xs sm:text-sm font-normal text-gray-500">(Optional)</span></h2>
                  </div>
                  <div className="space-y-6">
                    <FormInput
                      label="Navbar Tagline/Slogan"
                      name="navbarTagline"
                      value={formData.navbarTagline}
                      onChange={handleChange}
                      placeholder="e.g., 'Your Trusted Partner Since 2010' or 'Quality Service, Every Time'"
                      error={errors.navbarTagline}
                      icon={Navigation}
                    />
                    <p className="text-sm text-gray-500 -mt-4">
                      A short tagline that will appear in your website's navbar below the business name
                    </p>

                    <div className="mt-6">
                      <TextArea
                        label="Footer Description"
                        name="footerDescription"
                        value={formData.footerDescription}
                        onChange={handleChange}
                        placeholder="Add a custom description or message for your footer (Auto-filled based on category)"
                        rows={4}
                        error={errors.footerDescription}
                      />
                      <p className="mt-2 text-sm text-gray-500">
                        This text will appear in your website's footer section
                      </p>
                    </div>
                  </div>
                </div >
              </div>

              {/* Step 4: Services & Business Hours */}
              <div className="mb-8">

                {/* Services / Menu / Pricing Section */}
                < div className="border-b border-gray-200 pb-8" >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5 text-purple-600" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Services / Menu / Pricing <span className="text-xs sm:text-sm font-normal text-gray-500">(Optional)</span></h2>
                  </div>
                  <p className="text-sm text-gray-600 mb-6">
                    Perfect for Salons, Restaurants, Tuition classes, Pandit ji, Photographers, etc.
                  </p>

                  <div className="space-y-6">
                    {formData.services.map((service, index) => (
                      <div key={index} className="p-6 bg-gray-50 rounded-xl border-2 border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-800">Service {index + 1}</h3>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => toggleServiceFeatured(index)}
                              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${service.featured
                                ? 'bg-yellow-500 text-white'
                                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                }`}
                            >
                              {service.featured ? '⭐ Featured' : 'Mark Featured'}
                            </button>
                            <button
                              type="button"
                              onClick={() => removeService(index)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormInput
                            label="Service Title"
                            value={service.title}
                            onChange={(e) => updateService(index, 'title', e.target.value)}
                            placeholder="e.g., Haircut, Pizza, Math Tuition"
                          />
                          <FormInput
                            label="Price (Optional)"
                            type="text"
                            value={service.price}
                            onChange={(e) => updateService(index, 'price', e.target.value)}
                            placeholder="e.g., ₹500 or $20"
                          />
                        </div>
                        <div className="mt-4">
                          <TextArea
                            label="Description"
                            value={service.description}
                            onChange={(e) => updateService(index, 'description', e.target.value)}
                            placeholder="Brief description of the service..."
                            rows={3}
                          />
                        </div>
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Service Image (Optional)
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => updateService(index, 'image', e.target.files[0])}
                            className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          />
                          {service.image && (
                            <p className="mt-2 text-sm text-green-600">✓ Image selected</p>
                          )}
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addService}
                      className="w-full py-3 border-2 border-dashed border-purple-300 rounded-xl text-purple-600 font-semibold hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      Add Service
                    </button>
                  </div>
                </div >

                {/* Special Offers / Deals Section */}
                < div className="border-b border-gray-200 pb-8" >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                      <Gift className="w-5 h-5 text-orange-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Special Offers / Deals <span className="text-sm font-normal text-gray-500">(Optional)</span></h2>
                  </div>

                  <div className="space-y-6">
                    {formData.specialOffers.map((offer, index) => (
                      <div key={index} className="p-6 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border-2 border-orange-200">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-800">Offer {index + 1}</h3>
                          <button
                            type="button"
                            onClick={() => removeSpecialOffer(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormInput
                            label="Offer Title"
                            value={offer.title}
                            onChange={(e) => updateSpecialOffer(index, 'title', e.target.value)}
                            placeholder="e.g., 50% Off on All Services"
                          />
                          <FormInput
                            label="Expiry Date"
                            type="date"
                            value={offer.expiryDate}
                            onChange={(e) => updateSpecialOffer(index, 'expiryDate', e.target.value)}
                          />
                        </div>
                        <div className="mt-4">
                          <TextArea
                            label="Offer Description"
                            value={offer.description}
                            onChange={(e) => updateSpecialOffer(index, 'description', e.target.value)}
                            placeholder="Describe your special offer..."
                            rows={3}
                          />
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addSpecialOffer}
                      className="w-full py-3 border-2 border-dashed border-orange-300 rounded-xl text-orange-600 font-semibold hover:bg-orange-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      Add Special Offer
                    </button>
                  </div>
                </div >

                {/* Business Hours Section */}
                < div className="border-b border-gray-200 pb-8" >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
                      <Clock className="w-5 h-5 text-teal-600" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Business Hours <span className="text-xs sm:text-sm font-normal text-gray-500">(Optional)</span></h2>
                  </div>
                  <p className="text-sm text-gray-600 mb-6">
                    Set your business hours. The website will automatically show "Open Now" or "Closed" status.
                  </p>

                  <div className="space-y-4">
                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                      <div key={day} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <input
                              type="checkbox"
                              checked={formData.businessHours[day].open}
                              onChange={(e) => updateBusinessHours(day, 'open', e.target.checked)}
                              className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500 flex-shrink-0"
                            />
                            <label className="text-base sm:text-lg font-semibold text-gray-800 capitalize min-w-[80px] sm:min-w-[100px]">
                              {day}
                            </label>
                          </div>
                          {formData.businessHours[day].open ? (
                            <div className="flex items-center gap-2 sm:gap-3 flex-1 flex-wrap sm:flex-nowrap">
                              <input
                                type="time"
                                value={formData.businessHours[day].start}
                                onChange={(e) => updateBusinessHours(day, 'start', e.target.value)}
                                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm sm:text-base min-w-[120px]"
                              />
                              <span className="text-gray-600 font-medium text-sm sm:text-base">to</span>
                              <input
                                type="time"
                                value={formData.businessHours[day].end}
                                onChange={(e) => updateBusinessHours(day, 'end', e.target.value)}
                                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm sm:text-base min-w-[120px]"
                              />
                            </div>
                          ) : (
                            <span className="text-gray-400 italic text-sm sm:text-base">Closed</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div >

                {/* Appointment / Booking Section */}
                < div className="border-b border-gray-200 pb-8" >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-pink-600" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Appointment / Booking <span className="text-xs sm:text-sm font-normal text-gray-500">(Optional)</span></h2>
                  </div>
                  <p className="text-sm text-gray-600 mb-6">
                    Enable customers to book appointments. The form will automatically send a message via WhatsApp or call.
                  </p>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Preferred Contact Method
                      </label>
                      <div className="flex gap-4">
                        <button
                          type="button"
                          onClick={() => updateAppointmentSettings('contactMethod', 'whatsapp')}
                          className={`flex-1 px-6 py-4 rounded-xl font-semibold transition-all ${formData.appointmentSettings.contactMethod === 'whatsapp'
                            ? 'bg-green-600 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                          WhatsApp
                        </button>
                        <button
                          type="button"
                          onClick={() => updateAppointmentSettings('contactMethod', 'call')}
                          className={`flex-1 px-6 py-4 rounded-xl font-semibold transition-all ${formData.appointmentSettings.contactMethod === 'call'
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                          Call
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Available Time Slots (Optional)
                      </label>
                      <div className="space-y-3">
                        {formData.appointmentSettings.availableSlots.map((slot, index) => (
                          <div key={index} className="flex gap-3">
                            <input
                              type="time"
                              value={slot.time}
                              onChange={(e) => updateTimeSlot(index, 'time', e.target.value)}
                              placeholder="Time"
                              className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                            />
                            <input
                              type="text"
                              value={slot.label}
                              onChange={(e) => updateTimeSlot(index, 'label', e.target.value)}
                              placeholder="Label (e.g., Morning, Evening)"
                              className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                            />
                            <button
                              type="button"
                              onClick={() => removeTimeSlot(index)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={addTimeSlot}
                          className="w-full py-2 border-2 border-dashed border-pink-300 rounded-lg text-pink-600 font-semibold hover:bg-pink-50 transition-colors flex items-center justify-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Add Time Slot
                        </button>
                      </div>
                    </div>
                  </div>
                </div >
              </div>

              {/* Step 5: Review & Submit */}
              <div className="mb-8">
                {/* Review Section */}
                <div className="border-b border-gray-200 pb-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Review Your Information</h2>
                    <HelpTooltip text="Review all your information before submitting. You can go back to any step to make changes." />
                  </div>
                  <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Business: {formData.businessName || 'Not set'}</h3>
                      <p className="text-sm text-gray-600">Category: {formData.category || 'Not set'}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Contact</h3>
                      <p className="text-sm text-gray-600">Phone: {formData.mobileNumber || 'Not set'}</p>
                      <p className="text-sm text-gray-600">Email: {formData.email || 'Not set'}</p>
                      <p className="text-sm text-gray-600">Address: {formData.address || 'Not set'}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Media</h3>
                      <p className="text-sm text-gray-600">Logo: {formData.logo ? '✓ Uploaded' : 'Not uploaded'}</p>
                      <p className="text-sm text-gray-600">Images: {formData.images.length} uploaded</p>
                      <p className="text-sm text-gray-600">Description: {formData.description ? `${formData.description.substring(0, 50)}...` : 'Not set'}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Services & Hours</h3>
                      <p className="text-sm text-gray-600">Services: {formData.services.length} added</p>
                      <p className="text-sm text-gray-600">Special Offers: {formData.specialOffers.length} added</p>
                      <p className="text-sm text-gray-600">Business Hours: Configured</p>
                    </div>
                  </div>
                </div>


                {/* Google Maps Section */}
                < div className="border-b border-gray-200 pb-8" >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                      <Map className="w-5 h-5 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Google Maps <span className="text-sm font-normal text-gray-500">(Optional)</span></h2>
                  </div>
                  <FormInput
                    label="Google Maps Link"
                    name="googleMapLink"
                    type="url"
                    value={formData.googleMapLink}
                    onChange={handleChange}
                    placeholder="https://maps.google.com/... or Google Maps embed URL"
                    error={errors.googleMapLink}
                    icon={Map}
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Paste your Google Maps link. An interactive map will be embedded on your website's contact section.
                  </p>
                </div >
              </div>

              {/* Submit Section */}

              < div className="pt-6" >
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <button
                    type="button"
                    onClick={() => setShowPreview(true)}
                    className="flex-1 px-6 py-4 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    <Eye className="w-5 h-5" />
                    Preview Website
                  </button>
                  <div className="flex-1 relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl blur opacity-75"></div>
                    <div className="relative">
                      <SubmitButton loading={loading} text="Create Your Website" />
                    </div>
                  </div>
                </div>
                <p className="text-center text-sm text-gray-500">
                  By submitting, you agree to our Terms of Service and Privacy Policy
                </p>
              </div >
            </form >
          </div >

          {/* Help Section */}
          < div className="mt-8 bg-white rounded-2xl shadow-lg p-6 border border-gray-100" >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Need Help?</h3>
                <p className="text-sm text-gray-600 mb-3">
                  If you have any questions or need assistance while creating your website, feel free to contact us.
                </p>
                <a href="/contact" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                  Contact Support →
                </a>
              </div>
            </div>
          </div >
        </div >
      </div >
      <Footer />

      {/* Website Preview Modal */}
      {
        showPreview && (
          <WebsitePreview formData={formData} onClose={() => setShowPreview(false)} />
        )
      }
    </>
  );
};

export default CreateWebsite;

