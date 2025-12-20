import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, Palette, Smartphone, Zap, Globe, Shield, BarChart3 } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { SEOHead } from '../../components/SEOHead';
import { getOrigin } from '../../utils/urlHelper';

const WebsiteDesign = () => {
  const features = [
    {
      icon: Palette,
      title: 'Custom Design',
      description: 'Unique, professional designs tailored to your business brand and identity'
    },
    {
      icon: Smartphone,
      title: 'Mobile Responsive',
      description: 'Perfect display on all devices - mobile, tablet, and desktop'
    },
    {
      icon: Zap,
      title: 'Fast Loading',
      description: 'Optimized for speed to ensure your customers have the best experience'
    },
    {
      icon: Globe,
      title: 'SEO Optimized',
      description: 'Built-in SEO features to help your website rank higher in search results'
    },
    {
      icon: Shield,
      title: 'Secure & Safe',
      description: 'SSL certificate and security features to protect your website and customers'
    },
    {
      icon: BarChart3,
      title: 'Analytics Ready',
      description: 'Track your website performance with built-in analytics dashboard'
    }
  ];

  const faqItems = [
    {
      question: 'How long does it take to design a website?',
      answer: 'With VaranasiHub, you can have your professional website ready in just minutes. Simply fill in your business details and your website goes live instantly.'
    },
    {
      question: 'Do I need design skills?',
      answer: 'No design skills needed! Our platform provides beautiful, professional templates that you can customize with your business information. No coding or design knowledge required.'
    },
    {
      question: 'Can I customize the design?',
      answer: 'Yes! You can choose from multiple themes, add your logo, customize colors, and upload your photos to make your website unique to your business.'
    },
    {
      question: 'Will my website work on mobile phones?',
      answer: 'Absolutely! All websites created on VaranasiHub are fully responsive and look perfect on mobile phones, tablets, and desktop computers.'
    },
    {
      question: 'What if I need help with the design?',
      answer: 'Our support team is available to help you create the perfect website for your business. You can contact us anytime for assistance.'
    }
  ];

  return (
    <>
      <SEOHead
        title="Professional Website Design Services in Varanasi | VaranasiHub"
        description="Get a custom-designed, mobile-responsive website for your Varanasi business. Professional design, SEO optimized, starting at ₹1,000/year. Free trial available."
        keywords="website design Varanasi, professional website design, custom website Varanasi, business website design, responsive website design"
        url={`${getOrigin()}/services/website-design-varanasi`}
        serviceType="Website Design"
        serviceArea="Varanasi"
        faqItems={faqItems}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Services', path: '/services' },
          { name: 'Website Design', path: '/services/website-design-varanasi' }
        ]}
      />
      <Navbar />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30">
        {/* Hero Section */}
        <section className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 mb-4">
                Professional <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Website Design</span> in Varanasi
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                Create a stunning, professional website for your Varanasi business. Mobile-responsive, SEO-optimized, and ready in minutes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/create-website"
                  className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  Create Your Website Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <Link
                  to="/pricing"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-900 rounded-xl font-semibold text-lg border-2 border-gray-300 hover:border-blue-600 transition-all duration-300"
                >
                  View Pricing
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-12">
              What You Get
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-12">
              Why Choose Our Website Design Service?
            </h2>
            <div className="space-y-6">
              {[
                'Zero technical skills needed - create your website in minutes',
                'Professional designs that represent your brand perfectly',
                'Mobile-responsive - works perfectly on all devices',
                'SEO optimized to help customers find you online',
                'Fast loading speeds for better user experience',
                'Secure with SSL certificate included',
                'Affordable pricing starting at just ₹1,000/year',
                '14-day free trial - no credit card required'
              ].map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <p className="text-lg text-gray-700">{benefit}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-white"
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Ready to Create Your Professional Website?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Join hundreds of Varanasi businesses already online. Start your free trial today!
              </p>
              <Link
                to="/create-website"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </motion.div>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
};

export default WebsiteDesign;


