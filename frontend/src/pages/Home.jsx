import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { SEOHead } from '../components/SEOHead';
import HeroSection from '../components/home/HeroSection';
import TrustStrip from '../components/home/TrustStrip';
import ApnaNoidaSection from '../components/home/ApnaNoidaSection';
import HowItWorks from '../components/home/HowItWorks';
import KeyFeatures from '../components/home/KeyFeatures';
import WhatYouGetSection from '../components/home/WhatYouGetSection';
import WhyChooseSection from '../components/home/WhyChooseSection';
import FamousNoidaSection from '../components/home/FamousNoidaSection';
import ApnaNoidaDetailed from '../components/home/ApnaNoidaDetailed';
import LivingNoidaStories from '../components/home/LivingNoidaStories';
import ReadyToGoLiveCTA from '../components/home/ReadyToGoLiveCTA';
import { noidaHighlights as highlightData } from '../data/noidaHighlights';
import { businessAPI } from '../config/api';
import { getOrigin } from '../utils/urlHelper';

const Home = () => {
  // Statistics state
  const [stats, setStats] = useState({
    totalBusinesses: 500,
    approvedBusinesses: 300,
    trustPercentage: 98,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  const heroImages = [
    '/images/Slider1.avif',
    '/images/slider2.jpg',
    '/images/Slider3.webp',
    '/images/slider4.webp',
  ];

  // Fetch public statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        const response = await businessAPI.getPublicStats();
        if (response.stats) {
          setStats({
            totalBusinesses: response.stats.totalBusinesses || 500,
            approvedBusinesses: response.stats.approvedBusinesses || 300,
            trustPercentage: response.stats.trustPercentage || 98,
          });
        }
      } catch (error) {
        // Only log in development
        if (import.meta.env.DEV) {
          console.error('Error fetching stats:', error);
        }
        // Keep default values on error
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const featuredHighlights = highlightData.slice(0, 4);

  return (
    <>
      <SEOHead
        title="NoidaHub - Create Your Business Website in Minutes | Affordable Website Builder for Noida"
        description="Help your Noida business go online. Create a professional website in minutes with zero coding skills. Get domain, hosting, database, and all features starting at ₹1,000/year. 14-day free trial included!"
        image="/og-image.jpg"
        url={getOrigin()}
        keywords="Noida business website, create website Noida, affordable website builder, business website maker, Noida online presence, local business website, website for shop Noida, clinic website, hotel website Noida"
        breadcrumbs={[{ name: 'Home', path: '/', url: '/' }]}
        faqItems={[
          {
            question: 'How do I create a website for my Noida business?',
            answer: 'Simply sign up with Google or Email OTP, add your business details (name, category, address, photos), and your website will be live instantly on your domain. All plans include 14-day free trial.'
          },
          {
            question: 'What is included in the plans?',
            answer: 'All plans include domain (subdomain), hosting, database, mobile-responsive design, SSL certificate, WhatsApp integration, Google Maps, photo gallery, video embedding, analytics, and more. Starting at ₹1,000/year.'
          },
          {
            question: 'Do I need technical skills?',
            answer: 'No technical skills needed! Our platform is designed for business owners with zero coding knowledge. Just fill in your details and your website is ready.'
          },
          {
            question: 'What features are included?',
            answer: 'Domain, hosting, database, mobile-responsive design, photo gallery, WhatsApp & call buttons, Google Maps integration, YouTube video embedding, analytics dashboard, SSL certificate, and more.'
          }
        ]}
      />
      <Navbar />

      {/* 1. Hero Section */}
      <HeroSection heroImages={heroImages} />

      {/* 2. Trust Strip */}
      <TrustStrip stats={stats} loading={statsLoading} />

      {/* 2.5. Apna Noida Section */}
      <ApnaNoidaSection />

      {/* 3. How It Works */}
      <HowItWorks />

      {/* 4. Key Features */}
      <KeyFeatures />

      {/* 4.5. What You Get Section */}
      <WhatYouGetSection />

      {/* 6. Why Choose NoidaHub */}
      <WhyChooseSection />

      {/* 7. Famous Noida */}
      <FamousNoidaSection />

      {/* 8. Apna Noida Detailed */}
      <ApnaNoidaDetailed />

      {/* 9. Living Noida Stories */}
      <LivingNoidaStories highlights={featuredHighlights} />

      {/* 10. Ready to Go Live CTA */}
      <ReadyToGoLiveCTA />

      <Footer />
    </>
  );
};

export default Home;
