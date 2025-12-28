import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, ChevronLeft, ChevronRight, User } from 'lucide-react';


const Navbar = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isMobileCategoriesOpen, setIsMobileCategoriesOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(true);
  const categorySliderRef = useRef(null);


  const checkAuthStatus = () => {
    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      if (token && userData) {
        setIsLoggedIn(true);
        setUser(JSON.parse(userData));
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
    } catch (storageError) {
      console.warn('localStorage not available:', storageError);
      setIsLoggedIn(false);
      setUser(null);
    }
  };

  useEffect(() => {
    // Check if user is logged in on mount
    checkAuthStatus();

    // Listen for storage changes (when login/logout happens from other tabs)
    window.addEventListener('storage', checkAuthStatus);

    // Listen for custom auth event (for same-tab updates)
    const handleAuthChange = () => checkAuthStatus();
    window.addEventListener('authChange', handleAuthChange);

    return () => {
      window.removeEventListener('storage', checkAuthStatus);
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    setIsMobileMenuOpen(false);
    // Dispatch event to update navbar in other components
    window.dispatchEvent(new Event('authChange'));
  };

  const categories = [
    'Shops',
    'Restaurants',
    'Hotels',
    'Clinics',
    'Libraries',
    'Services',
    'Temples',
    'Schools',
    'Colleges',
    'Gyms',
    'Salons',
    'Spas',
    'Pharmacies',
    'Banks',
    'Travel Agencies',
    'Real Estate',
    'Law Firms',
    'Accounting',
    'IT Services',
    'Photography',
    'Event Management',
    'Catering',
    'Bakeries',
    'Jewelry',
    'Fashion',
    'Electronics',
    'Furniture',
    'Automobile',
    'Repair Services',
    'Education',
    'Healthcare',
    'Beauty',
    'Fitness',
    'Entertainment',
    'Tourism',
    'Food & Beverage',
    'Retail',
    'Wholesale',
    'Manufacturing',
    'Construction',
    'Other'
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleCategories = () => {
    setIsCategoriesOpen(!isCategoriesOpen);
  };

  const toggleMobileCategories = () => {
    setIsMobileCategoriesOpen(!isMobileCategoriesOpen);
  };

  // Check scroll position for category slider
  const checkScrollPosition = () => {
    if (categorySliderRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = categorySliderRef.current;
      setCanScrollUp(scrollTop > 0);
      setCanScrollDown(scrollTop < scrollHeight - clientHeight - 1);
    }
  };

  // Scroll category slider
  const scrollCategories = (direction) => {
    if (categorySliderRef.current) {
      const scrollAmount = 150;
      const currentScroll = categorySliderRef.current.scrollTop;
      const newScroll = direction === 'up'
        ? currentScroll - scrollAmount
        : currentScroll + scrollAmount;

      categorySliderRef.current.scrollTo({
        top: newScroll,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    checkScrollPosition();
    const slider = categorySliderRef.current;
    if (slider) {
      slider.addEventListener('scroll', checkScrollPosition);
      window.addEventListener('resize', checkScrollPosition);
      return () => {
        slider.removeEventListener('scroll', checkScrollPosition);
        window.removeEventListener('resize', checkScrollPosition);
      };
    }
  }, []);

  return (
    <>
      <style>{`
        .category-slider::-webkit-scrollbar {
          width: 6px;
        }
        .category-slider::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .category-slider::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 10px;
        }
        .category-slider::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
      <nav className="sticky top-0 z-[100] bg-white/95 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.08)] border-b border-gray-200/50 relative transition-all duration-300">

        <div className="w-full px-4 sm:px-4 lg:px-6 relative z-10">
          <div className="flex justify-between items-center h-20">
            {/* Logo with Image at Left */}
            <div className="flex-shrink-0 flex items-center gap-2">
              <img
                src="/images/Indian Flag.webp"
                alt="Indian Flag"
                className="h-8 md:h-10 w-auto drop-shadow-md object-contain"
              />
              <Link to="/" className="text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 transition-all duration-300 tracking-tight">
                VaranasiHub
              </Link>
              <img
                src="/images/Kashi V temple.jpg"
                alt="Kashi Vishwanath Temple"
                className="h-10 md:h-12 w-auto rounded-lg object-cover drop-shadow-md"
              />
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:space-x-1 flex-1 justify-center">
              <Link
                to="/"
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${location.pathname === '/'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                  }`}
              >
                Home
              </Link>
              <Link
                to="/businesses"
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${location.pathname === '/businesses'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                  }`}
              >
                Businesses
              </Link>
              <Link
                to="/about"
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${location.pathname === '/about'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                  }`}
              >
                About
              </Link>

              {/* Categories Dropdown with Slider */}
              <div className="relative z-[110]">
                <button
                  onClick={toggleCategories}
                  onMouseEnter={() => setIsCategoriesOpen(true)}
                  onMouseLeave={() => setIsCategoriesOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300 flex items-center gap-1"
                >
                  Categories
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-300 ${isCategoriesOpen ? 'rotate-180' : ''
                      }`}
                  />
                </button>

                {/* Dropdown Menu with Slider */}
                {isCategoriesOpen && (
                  <div
                    onMouseEnter={() => setIsCategoriesOpen(true)}
                    onMouseLeave={() => setIsCategoriesOpen(false)}
                    className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.15)] border border-gray-200 py-2 z-[110]"
                  >
                    {/* Category Slider */}
                    <div className="relative flex flex-col gap-2 px-2">
                      {/* Up Scroll Button */}
                      {canScrollUp && (
                        <button
                          onClick={() => scrollCategories('up')}
                          className="flex-shrink-0 p-1 rounded-full bg-gray-100 hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-all duration-200 shadow-sm border border-gray-200 z-10 self-center"
                          aria-label="Scroll up"
                        >
                          <ChevronLeft className="w-3 h-3 rotate-90" />
                        </button>
                      )}

                      {/* Category Slider Container */}
                      <div
                        ref={categorySliderRef}
                        className="category-slider flex flex-col gap-1 overflow-y-auto scroll-smooth max-h-80 px-2"
                        onScroll={checkScrollPosition}
                      >
                        {categories.map((category) => (
                          <Link
                            key={category}
                            to={`/businesses?category=${category}`}
                            className="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 border border-transparent hover:border-blue-200"
                            onClick={() => setIsCategoriesOpen(false)}
                          >
                            {category}
                          </Link>
                        ))}
                      </div>

                      {/* Down Scroll Button */}
                      {canScrollDown && (
                        <button
                          onClick={() => scrollCategories('down')}
                          className="flex-shrink-0 p-1 rounded-full bg-gray-100 hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-all duration-200 shadow-sm border border-gray-200 z-10 self-center"
                          aria-label="Scroll down"
                        >
                          <ChevronRight className="w-3 h-3 rotate-90" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <Link
                to="/pricing"
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${location.pathname === '/pricing'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                  }`}
              >
                Pricing
              </Link>
              <Link
                to="/contact"
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${location.pathname === '/contact'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                  }`}
              >
                Contact
              </Link>
            </div>

            {/* Desktop Right Side - Sign Up and Create Website */}
            <div className="hidden md:flex md:items-center md:gap-2">
              {isLoggedIn ? (
                <>
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-black hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300"
                  >
                    <User className="w-4 h-4" />
                    <span>{user?.name || user?.email || 'User'}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm font-semibold text-black hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300"
                  >
                    Logout
                  </button>
                  <Link
                    to="/create-website"
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-bold text-sm shadow-lg hover:shadow-xl"
                  >
                    Create Website
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/signup"
                    className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl transition-all duration-300 shadow-lg"
                  >
                    Sign Up
                  </Link>
                  <Link
                    to="/create-website"
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-bold text-sm shadow-lg hover:shadow-xl"
                  >
                    Create Website
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="p-2 rounded-md text-black hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu Overlay */}
          {isMobileMenuOpen && (
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-hidden="true"
            />
          )}

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t-2 border-black py-4 relative z-50">

              <div className="flex flex-col space-y-1">
                <Link
                  to="/"
                  className={`px-4 py-2 text-base font-medium rounded-md transition-all duration-200 ${location.pathname === '/'
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-black hover:text-blue-600 hover:bg-blue-50'
                    }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  to="/businesses"
                  className={`px-4 py-2 text-base font-medium rounded-md transition-all duration-200 ${location.pathname === '/businesses'
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-black hover:text-blue-600 hover:bg-blue-50'
                    }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Businesses
                </Link>
                <Link
                  to="/about"
                  className={`px-4 py-2 text-base font-medium rounded-md transition-all duration-200 ${location.pathname === '/about'
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-black hover:text-blue-600 hover:bg-blue-50'
                    }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  About
                </Link>

                {/* Mobile Categories Dropdown with Slider */}
                <div>
                  <button
                    onClick={toggleMobileCategories}
                    className="w-full px-4 py-2 text-base font-medium text-black hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all duration-200 flex items-center justify-between"
                  >
                    <span>Categories</span>
                    <ChevronDown
                      className={`w-5 h-5 transition-transform duration-200 ${isMobileCategoriesOpen ? 'rotate-180' : ''
                        }`}
                    />
                  </button>

                  {/* Mobile Dropdown with Slider */}
                  {isMobileCategoriesOpen && (
                    <div className="pl-4 mt-2 pr-4">
                      <div className="relative flex flex-col gap-2">
                        {/* Up Scroll Button */}
                        {canScrollUp && (
                          <button
                            onClick={() => scrollCategories('up')}
                            className="flex-shrink-0 p-1 rounded-full bg-gray-100 hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-all duration-200 shadow-sm border border-gray-200 self-center"
                            aria-label="Scroll up"
                          >
                            <ChevronLeft className="w-3 h-3 rotate-90" />
                          </button>
                        )}

                        <div
                          ref={categorySliderRef}
                          className="category-slider flex flex-col gap-1 overflow-y-auto scroll-smooth max-h-64"
                          onScroll={checkScrollPosition}
                        >
                          {categories.map((category) => (
                            <Link
                              key={category}
                              to={`/businesses?category=${category}`}
                              className="px-3 py-2 rounded-lg text-sm font-medium text-black hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 border border-transparent hover:border-blue-200"
                              onClick={() => {
                                setIsMobileMenuOpen(false);
                                setIsMobileCategoriesOpen(false);
                              }}
                            >
                              {category}
                            </Link>
                          ))}
                        </div>

                        {/* Down Scroll Button */}
                        {canScrollDown && (
                          <button
                            onClick={() => scrollCategories('down')}
                            className="flex-shrink-0 p-1 rounded-full bg-gray-100 hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-all duration-200 shadow-sm border border-gray-200 self-center"
                            aria-label="Scroll down"
                          >
                            <ChevronRight className="w-3 h-3 rotate-90" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <Link
                  to="/pricing"
                  className={`px-4 py-2 text-base font-medium rounded-md transition-all duration-200 ${location.pathname === '/pricing'
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-black hover:text-blue-600 hover:bg-blue-50'
                    }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Pricing
                </Link>
                <Link
                  to="/contact"
                  className={`px-4 py-2 text-base font-medium rounded-md transition-all duration-200 ${location.pathname === '/contact'
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-black hover:text-blue-600 hover:bg-blue-50'
                    }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Contact
                </Link>

                {/* Mobile Auth Buttons */}
                {isLoggedIn ? (
                  <>
                    <div className="pt-2 border-t-2 border-black mt-2">
                      <Link
                        to="/profile"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-black hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        <span className="font-medium">{user?.name || user?.email || 'User'}</span>
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full mt-2 px-4 py-2 text-sm font-medium text-black hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
                      >
                        Logout
                      </button>
                    </div>
                    <div className="pt-2">
                      <Link
                        to="/create-website"
                        className="block w-full px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium text-sm shadow-sm hover:shadow-md text-center"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Create Website
                      </Link>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="pt-2 border-t-2 border-black mt-2 space-y-2">
                      <Link
                        to="/login"
                        className="block w-full px-4 py-2 text-center text-sm font-medium text-black hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Login
                      </Link>
                      <Link
                        to="/signup"
                        className="block w-full px-4 py-2 text-center text-sm font-medium text-white bg-[#22c55e] hover:bg-[#16a34a] rounded-xl transition-all duration-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Sign Up
                      </Link>
                    </div>
                    <div className="pt-2">
                      <Link
                        to="/create-website"
                        className="block w-full px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium text-sm shadow-sm hover:shadow-md text-center"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Create Website
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
    </>

  );
};

export default Navbar;
