import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Search } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { trackSearch, trackButtonClick } from '../../utils/analytics';

const HeroSection = ({ heroImages = [] }) => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1);
  const [imageErrorCount, setImageErrorCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const sliderRef = useRef(null);
  const searchInputRef = useRef(null);

  // Auto-play slider
  useEffect(() => {
    if (heroImages.length === 0) return;
    const interval = setInterval(() => {
      setDirection(1);
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft') {
        setDirection(-1);
        setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length);
      } else if (e.key === 'ArrowRight') {
        setDirection(1);
        setCurrentSlide((prev) => (prev + 1) % heroImages.length);
      }
    };

    if (sliderRef.current) {
      sliderRef.current.focus();
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, [heroImages.length]);

  if (heroImages.length === 0) return null;

  return (
    <section 
      ref={sliderRef}
      tabIndex={0}
      className="relative min-h-[70vh] flex items-center justify-center overflow-hidden pt-16 pb-24 focus:outline-none"
    >
      {/* Image Slider Background */}
      <div className="absolute inset-0 overflow-hidden">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentSlide}
            custom={direction}
            initial={{ x: direction > 0 ? '100%' : '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: direction > 0 ? '-100%' : '100%' }}
            transition={{ 
              duration: 1.2, 
              ease: [0.4, 0, 0.2, 1],
              type: "tween"
            }}
            className="absolute inset-0"
          >
            <img
              src={heroImages[currentSlide]}
              alt={`Noida landscape ${currentSlide + 1} - Modern city, IT hubs, and vibrant lifestyle`}
              className="w-full h-full object-cover object-center"
              loading="eager"
              onError={(e) => {
                if (imageErrorCount < 2) {
                  setImageErrorCount(prev => prev + 1);
                  e.target.src = '/images/Slider1.avif';
                } else {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '<div class="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center"><p class="text-white text-xl">Image unavailable</p></div>';
                }
              }}
            />
            {/* Enhanced gradient overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/75 via-black/60 to-black/75"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Slider Navigation Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center justify-center gap-3">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setDirection(index > currentSlide ? 1 : -1);
              setCurrentSlide(index);
            }}
            className={`h-3 rounded-full transition-all duration-300 ${
              currentSlide === index
                ? 'bg-white w-8'
                : 'bg-white/40 hover:bg-white/60 w-3'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Previous/Next Buttons */}
      <button
        onClick={() => {
          setDirection(-1);
          setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length);
        }}
        className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300 group"
        aria-label="Previous slide"
      >
        <motion.svg
          className="w-6 h-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          whileHover={{ x: -3 }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </motion.svg>
      </button>
      <button
        onClick={() => {
          setDirection(1);
          setCurrentSlide((prev) => (prev + 1) % heroImages.length);
        }}
        className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300 group"
        aria-label="Next slide"
      >
        <motion.svg
          className="w-6 h-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          whileHover={{ x: 3 }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </motion.svg>
      </button>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-16">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="text-center w-full flex flex-col items-center"
        >
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-white mb-3 md:mb-4 leading-[1.1] tracking-tight w-full px-4"
          >
            <motion.span
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Create Your Business
            </motion.span>
            <br />
            <motion.span 
              className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              Website in Minutes
            </motion.span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 max-w-4xl mx-auto mb-6 leading-relaxed font-light px-4"
          >
            Give your Noida shop, clinic, hotel, or service a stunning online presence. 
            <span className="text-yellow-300 font-semibold"> Zero coding. </span>
            <span className="text-green-300 font-semibold"> Instant results.</span>
          </motion.p>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-2xl w-full mx-auto mb-6"
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  trackSearch(searchQuery.trim());
                  navigate(`/businesses?search=${encodeURIComponent(searchQuery.trim())}`);
                }
              }}
              className="relative"
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search businesses, shops, clinics, hotels..."
                  className="w-full pl-10 sm:pl-12 pr-24 sm:pr-32 py-3 sm:py-4 border-2 border-white/30 bg-white/10 backdrop-blur-xl rounded-2xl focus:ring-2 focus:ring-white/50 focus:border-white/50 outline-none text-white placeholder-white/70 font-medium text-sm sm:text-base transition-all duration-300"
                />
                <button
                  type="submit"
                  onClick={() => trackButtonClick('hero_search', 'homepage')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 sm:px-6 py-1.5 sm:py-2 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl text-xs sm:text-sm md:text-base"
                >
                  Search
                </button>
              </div>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link to="/create-website">
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                whileHover={{ 
                  scale: 1.05, 
                  y: -4,
                  boxShadow: "0 20px 60px rgba(99, 102, 241, 0.5)"
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => trackButtonClick('create_website', 'homepage_hero')}
                className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold text-base shadow-[0_10px_40px_rgba(99,102,241,0.4)] overflow-hidden transition-all duration-300"
              >
                <span className="relative z-10 flex items-center gap-3">
                  Create My Website
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
                  </motion.div>
                </span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
                <motion.div
                  className="absolute inset-0 bg-white/20"
                  initial={{ scale: 0, opacity: 0 }}
                  whileHover={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
            </Link>
            <Link to="/businesses">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => trackButtonClick('explore_businesses', 'homepage_hero')}
                className="px-8 py-4 bg-white/10 backdrop-blur-xl border-2 border-white/30 text-white rounded-2xl font-bold text-base hover:bg-white/20 hover:border-white/50 transition-all duration-300 shadow-xl"
              >
                Explore Businesses
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>
      </div>

    </section>
  );
};

export default HeroSection;

