import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, TrendingUp, Search, Users, Smartphone, Share2, BarChart3 } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { SEOHead } from '../../components/SEOHead';
import { getOrigin } from '../../utils/urlHelper';

const OnlinePresence = () => {
  const features = [
    {
      icon: Search,
      title: 'SEO Optimized',
      description: 'Built-in SEO features to help customers find you on Google'
    },
    {
      icon: Users,
      title: 'Reach More Customers',
      description: 'Expand your customer base with a professional online presence'
    },
    {
      icon: Smartphone,
      title: 'Mobile Accessible',
      description: 'Customers can find and contact you from any device, anywhere'
    },
    {
      icon: Share2,
      title: 'Social Media Ready',
      description: 'Easy sharing on WhatsApp, Facebook, and other platforms'
    },
    {
      icon: BarChart3,
      title: 'Track Performance',
      description: 'Analytics dashboard to see how many people visit your website'
    },
    {
      icon: TrendingUp,
      title: 'Grow Your Business',
      description: 'Increase sales and reach with a strong online presence'
    }
  ];

  const faqItems = [
    {
      question: 'Why does my business need an online presence?',
      answer: 'In today\'s digital age, most customers search online before visiting a business. Having a website helps customers find you, learn about your services, and contact you easily. It builds trust and credibility.'
    },
    {
      question: 'How will an online presence help my business?',
      answer: 'An online presence helps you reach more customers, especially those searching on Google. It allows customers to find your business 24/7, see your services, read reviews, and contact you easily. This can significantly increase your customer base and sales.'
    },
    {
      question: 'Do I need social media too?',
      answer: 'While social media is helpful, a website is more important. Your website is your permanent online home where customers can find all your information. Social media can drive traffic to your website.'
    },
    {
      question: 'How long does it take to establish an online presence?',
      answer: 'With VaranasiHub, you can have your website online in just minutes! Simply fill in your business details and your professional website goes live instantly. No waiting, no delays.'
    },
    {
      question: 'Will customers actually find my website?',
      answer: 'Yes! We include SEO optimization so your website can appear in Google search results. Plus, you can share your website link on WhatsApp, social media, business cards, and QR codes to drive traffic.'
    }
  ];

  return (
    <>
      <SEOHead
        title="Build Your Online Presence in Varanasi | Get Found Online | VaranasiHub"
        description="Establish a strong online presence for your Varanasi business. Get found on Google, reach more customers, and grow your business. Starting at ₹1,000/year."
        keywords="online presence Varanasi, get found online, business online presence, digital presence, online visibility Varanasi"
        url={`${getOrigin()}/services/online-presence-varanasi`}
        serviceType="Online Presence"
        serviceArea="Varanasi"
        faqItems={faqItems}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Services', path: '/services' },
          { name: 'Online Presence', path: '/services/online-presence-varanasi' }
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
                Build Your <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Online Presence</span> in Varanasi
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                Get found online, reach more customers, and grow your business with a professional website. Be where your customers are searching.
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
              Benefits of Online Presence
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
              Why Your Business Needs Online Presence
            </h2>
            <div className="space-y-6">
              {[
                '80% of customers search online before visiting a business',
                'Be found 24/7 - customers can find you anytime, anywhere',
                'Build trust and credibility with a professional website',
                'Showcase your services, photos, and customer reviews',
                'Easy contact - WhatsApp, call, and email buttons',
                'Share your website link on social media and WhatsApp',
                'Get listed on Google Maps and local search results',
                'Track how many customers visit your website'
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

        {/* Stats Section */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl p-8 text-white text-center"
              >
                <div className="text-4xl font-bold mb-2">80%</div>
                <div className="text-lg opacity-90">Customers search online first</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-8 text-white text-center"
              >
                <div className="text-4xl font-bold mb-2">24/7</div>
                <div className="text-lg opacity-90">Available online always</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-gradient-to-br from-pink-500 to-red-500 rounded-2xl p-8 text-white text-center"
              >
                <div className="text-4xl font-bold mb-2">3x</div>
                <div className="text-lg opacity-90">More customers with website</div>
              </motion.div>
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
                Ready to Build Your Online Presence?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Join hundreds of Varanasi businesses already online. Get found, get customers, grow your business!
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

export default OnlinePresence;


