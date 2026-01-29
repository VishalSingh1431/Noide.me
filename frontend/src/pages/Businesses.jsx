import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, MapPin, Phone, Mail, ExternalLink, Grid, List, Building2, X, BadgeCheck, ArrowUpDown, Filter } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { BusinessesGridSkeleton } from '../components/LoadingSkeleton';
import { LazyImage } from '../components/LazyImage';
import { VerifiedBadge } from '../components/VerifiedBadge';
import { useToast } from '../contexts/ToastContext';
import { API_BASE_URL } from '../config/constants';
import { SEOHead } from '../components/SEOHead';
import { getBusinessUrl, getBusinessPageUrl, getOrigin } from '../utils/urlHelper';
import Pagination from '../components/Pagination';
import ShareButton from '../components/ShareButton';
import { trackSearch, trackButtonClick } from '../utils/analytics';

const Businesses = () => {
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [sortBy, setSortBy] = useState('name'); // 'name', 'category', 'newest'
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const categories = ['All', 'Shop', 'Clinic', 'Library', 'Hotel', 'Restaurant', 'Services'];

  useEffect(() => {
    fetchBusinesses();
  }, []);

  useEffect(() => {
    // Update URL params
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (selectedCategory !== 'All') params.set('category', selectedCategory);
    setSearchParams(params, { replace: true });
    setCurrentPage(1); // Reset to first page on filter change
  }, [searchTerm, selectedCategory, setSearchParams]);

  // Handle URL search param on mount
  useEffect(() => {
    const urlSearch = searchParams.get('search');
    if (urlSearch && urlSearch !== searchTerm) {
      setSearchTerm(urlSearch);
      trackSearch(urlSearch);
    }
  }, []);

  const fetchBusinesses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/business`);
      
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

      // Backend already filters to approved only, but add extra safety check
      const activeBusinesses = data.businesses.filter(
        business => business.status === 'approved'
      );

      setBusinesses(activeBusinesses);
    } catch (error) {
      console.error('Error fetching businesses:', error);
      toast.error('Failed to load businesses. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Optimize filtering with useMemo - only recalculates when dependencies change
  const filteredBusinesses = useMemo(() => {
    let filtered = [...businesses];

    // Category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(business => business.category === selectedCategory);
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(business =>
        business.businessName?.toLowerCase().includes(term) ||
        business.description?.toLowerCase().includes(term) ||
        business.address?.toLowerCase().includes(term) ||
        business.category?.toLowerCase().includes(term)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.businessName || '').localeCompare(b.businessName || '');
        case 'category':
          return (a.category || '').localeCompare(b.category || '');
        case 'newest':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [businesses, selectedCategory, searchTerm, sortBy]);

  // Pagination - memoized
  const { totalPages, paginatedBusinesses } = useMemo(() => {
    const total = Math.ceil(filteredBusinesses.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginated = filteredBusinesses.slice(startIndex, endIndex);
    return { totalPages: total, paginatedBusinesses: paginated };
  }, [filteredBusinesses, currentPage, itemsPerPage]);

  const getCategoryColor = useCallback((category) => {
    const colors = {
      Shop: 'bg-blue-100 text-blue-700 border-blue-200',
      Clinic: 'bg-red-100 text-red-700 border-red-200',
      Library: 'bg-purple-100 text-purple-700 border-purple-200',
      Hotel: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      Restaurant: 'bg-orange-100 text-orange-700 border-orange-200',
      Services: 'bg-green-100 text-green-700 border-green-200',
    };
    return colors[category] || 'bg-gray-100 text-gray-700 border-gray-200';
  }, []);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedCategory('All');
  }, []);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="h-12 bg-gray-200 rounded-lg mb-8 w-1/3"></div>
            <BusinessesGridSkeleton count={6} />
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <SEOHead
        title="Businesses in Noida - Discover Local Shops, Clinics, Hotels & More | Noida"
        description="Discover amazing businesses in Noida. Browse shops, clinics, hotels, restaurants, libraries, and services. Find local businesses with verified listings, contact information, and direct website links."
        image="/og-image.jpg"
        url={`${getOrigin()}/businesses`}
        keywords="Noida businesses, shops in Noida, clinics Noida, hotels Noida, restaurants Noida, local business directory Noida, business listings Noida"
        breadcrumbs={[
          { name: 'Home', path: '/', url: '/' },
          { name: 'Businesses', path: '/businesses', url: '/businesses' }
        ]}
      />
      <Navbar />
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white text-gray-900 py-8 md:py-10 shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.15)]"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-3 tracking-tight leading-tight px-4" itemProp="name">
              Businesses in Noida
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto font-light px-4">
              Discover amazing businesses. Find shops, clinics, hotels, and more.
            </p>
          </div>
        </motion.div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Search and Filter Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 mb-8 border border-gray-100"
          >
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                <input
                  type="text"
                  placeholder="Search by business name, category, or location..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    if (e.target.value) {
                      trackSearch(e.target.value);
                    }
                  }}
                  className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm sm:text-base md:text-lg transition-all bg-white text-gray-900 placeholder-gray-400"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Filters Row */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4 mb-6">
              {/* Category Filters */}
              <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 -mx-2 px-2 md:overflow-x-visible md:pb-0 md:mx-0">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      setSelectedCategory(category);
                      trackButtonClick(`filter_category_${category}`, 'businesses_page');
                    }}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-200 whitespace-nowrap ${selectedCategory === category
                        ? 'bg-blue-600 text-white shadow-lg scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {/* Sort & View Controls */}
              <div className="flex items-center gap-3">
                {/* Sort Dropdown */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      trackButtonClick('sort_businesses', 'businesses_page');
                    }}
                    className="appearance-none px-4 py-2 pr-8 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm font-semibold bg-white cursor-pointer"
                  >
                    <option value="name">Sort by Name</option>
                    <option value="category">Sort by Category</option>
                    <option value="newest">Newest First</option>
                  </select>
                  <ArrowUpDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => {
                      setViewMode('grid');
                      trackButtonClick('grid_view', 'businesses_page');
                    }}
                    className={`p-2 rounded transition-all ${viewMode === 'grid' ? 'bg-white shadow-md text-blue-600' : 'text-gray-600'
                      }`}
                    title="Grid View"
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      setViewMode('list');
                      trackButtonClick('list_view', 'businesses_page');
                    }}
                    className={`p-2 rounded transition-all ${viewMode === 'list' ? 'bg-white shadow-md text-blue-600' : 'text-gray-600'
                      }`}
                    title="List View"
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Active Filters & Results Count */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-gray-200">
              <div className="text-gray-600">
                <span className="font-semibold text-gray-800">{filteredBusinesses.length}</span> of{' '}
                <span className="font-semibold text-gray-800">{businesses.length}</span> businesses
                {(searchTerm || selectedCategory !== 'All') && (
                  <button
                    onClick={clearFilters}
                    className="ml-3 text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
                  >
                    <X className="w-4 h-4" />
                    Clear filters
                  </button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Businesses Grid/List */}
          {filteredBusinesses.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-2xl shadow-xl p-12 md:p-16 text-center"
            >
              <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No businesses found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || selectedCategory !== 'All'
                  ? 'Try adjusting your search or filters to find what you\'re looking for.'
                  : 'Be the first to create a business website!'}
              </p>
              {(searchTerm || selectedCategory !== 'All') && (
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  Clear All Filters
                </button>
              )}
            </motion.div>
          ) : (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
              }
            >
              {paginatedBusinesses.map((business, index) => (
                <motion.div
                  key={business.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className={`bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-blue-200 transform hover:-translate-y-2 ${viewMode === 'list' ? 'flex flex-col md:flex-row' : ''
                    }`}
                >
                  {/* Business Image */}
                  <div
                    className={`${viewMode === 'list'
                        ? 'md:w-72 md:h-56 flex-shrink-0'
                        : 'h-56'
                      } bg-gradient-to-br from-blue-100 to-purple-100 relative overflow-hidden`}
                  >
                    {business.logoUrl ? (
                      <LazyImage
                        src={business.logoUrl}
                        alt={business.businessName}
                        className="w-full h-full"
                      />
                    ) : business.imagesUrl && business.imagesUrl.length > 0 ? (
                      <LazyImage
                        src={business.imagesUrl[0]}
                        alt={business.businessName}
                        className="w-full h-full"
                      />
                    ) : null}
                    {/* Fallback gradient if no image */}
                    {(!business.logoUrl && (!business.imagesUrl || business.imagesUrl.length === 0)) && (
                      <div className="w-full h-full bg-gradient-to-br from-blue-400 via-purple-500 to-blue-600 flex items-center justify-center">
                        <Building2 className="w-16 h-16 text-white opacity-50" />
                      </div>
                    )}
                    {/* Category Badge */}
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 ${getCategoryColor(
                          business.category
                        )}`}
                      >
                        {business.category}
                      </span>
                      {business.verified && (
                        <VerifiedBadge size="sm" />
                      )}
                    </div>
                  </div>

                  {/* Business Info */}
                  <div className={`p-4 sm:p-6 flex flex-col ${viewMode === 'list' ? 'flex-1' : ''}`}>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 line-clamp-1 min-w-0 flex-1">
                          {business.businessName}
                        </h3>
                        {business.verified && (
                          <VerifiedBadge size="sm" />
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2 min-h-[2.5rem]">
                        {business.description || 'No description available.'}
                      </p>

                      <div className="space-y-2 mb-4">
                        {business.address && (
                          <div className="flex items-start gap-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-600" />
                            <span className="line-clamp-2">{business.address}</span>
                          </div>
                        )}
                        {business.mobile && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-4 h-4 flex-shrink-0 text-blue-600" />
                            <a
                              href={`tel:${business.mobile}`}
                              className="hover:text-blue-600 transition-colors font-medium"
                            >
                              {business.mobile}
                            </a>
                          </div>
                        )}
                        {business.whatsapp && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <svg className="w-4 h-4 flex-shrink-0 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                            </svg>
                            <a
                              href={`https://wa.me/${business.whatsapp.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-green-600 transition-colors font-medium"
                            >
                              {business.whatsapp}
                            </a>
                          </div>
                        )}
                        {business.email && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="w-4 h-4 flex-shrink-0 text-blue-600" />
                            <a
                              href={`mailto:${business.email}`}
                              className="hover:text-blue-600 transition-colors truncate"
                            >
                              {business.email}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-2 mt-auto pt-4 border-t border-gray-100">
                      <a
                        href={getBusinessPageUrl(business)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => trackButtonClick('visit_website', `business_${business.id}`)}
                        className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-all duration-200 font-semibold text-center flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Visit Website
                      </a>
                      {business.whatsapp && (
                        <a
                          href={`https://wa.me/${business.whatsapp.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => trackButtonClick('whatsapp_click', `business_${business.id}`)}
                          className="px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-200 font-semibold text-center flex items-center justify-center gap-2 shadow-md hover:shadow-lg whitespace-nowrap"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                          </svg>
                          WhatsApp
                        </a>
                      )}
                      <ShareButton
                        url={getBusinessPageUrl(business)}
                        title={business.businessName}
                        description={business.description}
                        businessId={business.id}
                        businessName={business.businessName}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {filteredBusinesses.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => {
                setCurrentPage(page);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              itemsPerPage={itemsPerPage}
              totalItems={filteredBusinesses.length}
            />
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Businesses;

