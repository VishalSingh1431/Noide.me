import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { ToastProvider } from './contexts/ToastContext'
import ErrorBoundary from './components/ErrorBoundary'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Profile from './pages/Profile'
import CreateWebsite from './pages/CreateWebsite'

import Contact from './pages/Contact'
import Pricing from './pages/Pricing'
import About from './pages/About'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import Businesses from './pages/Businesses'
import EditWebsite from './pages/EditWebsite'
import Analytics from './pages/Analytics'
import QRCodeGenerator from './pages/QRCodeGenerator'
import NoidaHighlight from './pages/NoidaHighlight'
import WebsiteDesign from './pages/services/WebsiteDesign'
import WebsiteHosting from './pages/services/WebsiteHosting'
import OnlinePresence from './pages/services/OnlinePresence'
import Blog from './pages/Blog'
import BlogPost from './pages/BlogPost'
import BusinessWebsite from './pages/BusinessWebsite'
import BulkImport from './pages/BulkImport'
import WhatsAppWidget from './components/WhatsAppWidget'
import { initGoogleAnalytics, trackPageView } from './utils/analytics'
import './App.css'

// Component to track page views
const PageTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // Initialize Google Analytics
    initGoogleAnalytics();

    // Track page view
    const pageName = location.pathname;
    trackPageView(pageName);
  }, [location]);

  return null;
};

function App() {
  const isSubdomain = () => {
    const hostname = window.location.hostname;
    const parts = hostname.split('.');

    // Handle production: ONLY redirect for *.noida.me
    if (hostname.endsWith('noida.me')) {
      const parts = hostname.split('.');
      // valid: sub.noida.me (3 parts)
      // invalid: noida.me (2 parts), www.noida.me, api.noida.me
      return parts.length > 2 && parts[0] !== 'www' && parts[0] !== 'api';
    }

    // Block all other domains (no generic fallback)
    return false;
  };

  // If on a subdomain, render the BusinessWebsite component directly
  if (isSubdomain()) {
    return (
      <ToastProvider>
        <Router>
          <ErrorBoundary>
            <PageTracker />
            <WhatsAppWidget />
            <Routes>
              <Route path="*" element={<BusinessWebsite />} />
            </Routes>
          </ErrorBoundary>
        </Router>
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <Router>
        <ErrorBoundary>
          <PageTracker />
          <WhatsAppWidget />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/create-website" element={<CreateWebsite />} />
            <Route path="/admin/bulk-import" element={<BulkImport />} />
            <Route path="/edit-website/:id" element={<EditWebsite />} />
            <Route path="/analytics/:businessId" element={<Analytics />} />
            <Route path="/qrcode/:id" element={<QRCodeGenerator />} />
            <Route path="/businesses" element={<Businesses />} />

            <Route path="/contact" element={<Contact />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/about" element={<About />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/noida/:slug" element={<NoidaHighlight />} />
            <Route path="/services/website-design-noida" element={<WebsiteDesign />} />
            <Route path="/services/website-hosting-noida" element={<WebsiteHosting />} />
            <Route path="/services/online-presence-noida" element={<OnlinePresence />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
          </Routes >
        </ErrorBoundary >
      </Router >
    </ToastProvider >
  )
}

export default App
