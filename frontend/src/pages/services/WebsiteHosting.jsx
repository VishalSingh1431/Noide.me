import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, Server, Zap, Shield, Globe, Clock, Headphones } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { SEOHead } from '../../components/SEOHead';
import { getOrigin } from '../../utils/urlHelper';

const WebsiteHosting = () => {
  const features = [
    {
      icon: Server,
      title: 'Reliable Hosting',
      description: '99.9% uptime guarantee with fast, reliable servers'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Optimized servers for maximum speed and performance'
    },
    {
      icon: Shield,
      title: 'Secure & Protected',
      description: 'SSL certificate, daily backups, and security monitoring'
    },
    {
      icon: Globe,
      title: 'Global CDN',
      description: 'Content delivery network for fast loading worldwide'
    },
    {
      icon: Clock,
      title: '24/7 Monitoring',
      description: 'Round-the-clock monitoring to ensure your website is always online'
    },
    {
      icon: Headphones,
      title: 'Expert Support',
      description: 'Dedicated support team to help you whenever you need'
    }
  ];

  const faqItems = [
    {
      question: 'What is included in the hosting service?',
      answer: 'Our hosting includes domain (subdomain), SSL certificate, unlimited bandwidth, daily backups, email support, and 24/7 monitoring. Everything you need to keep your website online.'
    },
    {
      question: 'How reliable is the hosting?',
      answer: 'We guarantee 99.9% uptime, meaning your website will be online almost all the time. Our servers are monitored 24/7 to ensure maximum reliability.'
    },
    {
      question: 'Is SSL certificate included?',
      answer: 'Yes! Every website gets a free SSL certificate, which encrypts your website and shows the secure padlock icon in browsers. This is essential for customer trust and SEO.'
    },
    {
      question: 'What happens if my website goes down?',
      answer: 'Our monitoring system detects issues immediately, and our team works to resolve them quickly. We also provide daily backups so your data is always safe.'
    },
    {
      question: 'Can I upgrade my hosting plan?',
      answer: 'Yes, you can upgrade your plan anytime as your business grows. Contact our support team to discuss your needs and we\'ll help you choose the right plan.'
    }
  ];

  return (
    <>
      <SEOHead
        title="Website Hosting Services in Varanasi | Reliable & Fast | VaranasiHub"
        description="Professional website hosting for Varanasi businesses. 99.9% uptime, SSL certificate, daily backups, starting at ₹1,000/year. Free trial available."
        keywords="website hosting Varanasi, web hosting, reliable hosting, SSL certificate, website hosting India"
        url={`${getOrigin()}/services/website-hosting-varanasi`}
        serviceType="Web Hosting"
        serviceArea="Varanasi"
        faqItems={faqItems}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Services', path: '/services' },
          { name: 'Website Hosting', path: '/services/website-hosting-varanasi' }
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
                Reliable <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Website Hosting</span> in Varanasi
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                99.9% uptime guarantee, SSL certificate, daily backups, and expert support. Keep your website online 24/7.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/create-website"
                  className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  Get Started Now
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
              Hosting Features
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
              Why Choose Our Hosting Service?
            </h2>
            <div className="space-y-6">
              {[
                '99.9% uptime guarantee - your website stays online',
                'Free SSL certificate for secure connections',
                'Daily automatic backups - your data is safe',
                'Fast loading speeds with optimized servers',
                '24/7 monitoring and support',
                'Unlimited bandwidth - no traffic limits',
                'Easy to use - no technical knowledge needed',
                'Affordable pricing starting at ₹1,000/year'
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
                Ready for Reliable Hosting?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Get your website online with our professional hosting service. Start your free trial today!
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

export default WebsiteHosting;


