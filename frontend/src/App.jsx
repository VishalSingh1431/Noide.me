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
import VaranasiHighlight from './pages/VaranasiHighlight'
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
          <Route path="/edit-website/:id" element={<EditWebsite />} />
          <Route path="/analytics/:businessId" element={<Analytics />} />
          <Route path="/qrcode/:id" element={<QRCodeGenerator />} />
          <Route path="/businesses" element={<Businesses />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/about" element={<About />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/varanasi/:slug" element={<VaranasiHighlight />} />
          </Routes>
        </ErrorBoundary>
      </Router>
    </ToastProvider>
  )
}

export default App
