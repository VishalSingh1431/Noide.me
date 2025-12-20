import { motion } from 'framer-motion';
import { Check, Star, Zap, Crown, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { SEOHead } from '../components/SEOHead';
import { getOrigin } from '../utils/urlHelper';

const Pricing = () => {
  const plans = [
    {
      name: 'Basic',
      price: '₹1,000',
      period: '/year',
      description: 'Perfect for small businesses getting started',
      icon: Zap,
      features: [
        'Domain (Subdomain)',
        'Hosting Included',
        'Database Storage',
        'Mobile Responsive Design',
        'SSL Certificate',
        'WhatsApp Integration',
        'Google Maps',
        'Photo Gallery (up to 10 images)',
        'Video Embedding',
        'Basic SEO Optimization',
        'Analytics Dashboard',
        'Email Support'
      ],
      popular: false,
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50'
    },
    {
      name: 'Professional',
      price: '₹2,000',
      period: '/year',
      description: 'Ideal for growing businesses',
      icon: Star,
      features: [
        'Everything in Basic',
        'Photo Gallery (up to 30 images)',
        'Advanced SEO Features',
        'Custom Themes',
        'Priority Support',
        'Social Media Integration',
        'Cloud Storage (Enhanced)',
        'Advanced Analytics',
        'Online Booking System'
      ],
      popular: true,
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-50 to-pink-50'
    },
    {
      name: 'Enterprise',
      price: '₹3,000',
      period: '/year',
      description: 'For established businesses with advanced needs',
      icon: Crown,
      features: [
        'Everything in Professional',
        'Unlimited Images & Media',
        'Custom Design & Branding',
        'E-commerce Integration',
        'Multi-language Support',
        '24/7 Priority Support',
        'Dedicated Account Manager',
        'Custom Integrations',
        'Advanced Analytics & Reports',
        'API Access'
      ],
      popular: false,
      gradient: 'from-orange-500 to-red-500',
      bgGradient: 'from-orange-50 to-red-50'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  return (
    <>
      <SEOHead
        title="Pricing Plans - Affordable Website Builder for Varanasi Businesses | VaranasiHub"
        description="Choose the perfect plan for your Varanasi business. Starting at ₹1,000/year. All plans include domain, hosting, database, and 14-day free trial. Mobile-responsive design, SEO optimization, and WhatsApp integration included. Transparent pricing, no hidden fees."
        image="/og-image.jpg"
        url={`${getOrigin()}/pricing`}
        keywords="Varanasi website pricing, business website cost, affordable website builder Varanasi, website plans, pricing plans Varanasi, cheap website builder"
        breadcrumbs={[
          { name: 'Home', path: '/', url: '/' },
          { name: 'Pricing', path: '/pricing', url: '/pricing' }
        ]}
        faqItems={[
          {
            question: 'What is included in the free trial?',
            answer: 'All plans include a 14-day free trial with full access to all features. No credit card required. Cancel anytime during the trial period.'
          },
          {
            question: 'Can I change plans later?',
            answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we\'ll prorate the billing.'
          },
          {
            question: 'What payment methods do you accept?',
            answer: 'We accept all major credit cards, debit cards, UPI, and bank transfers. All payments are secure and encrypted.'
          },
          {
            question: 'Is there a setup fee?',
            answer: 'No, there are no setup fees or hidden charges. You only pay the yearly subscription fee for your chosen plan.'
          },
          {
            question: 'What happens if I cancel?',
            answer: 'You can cancel anytime. Your website will remain active until the end of your billing period. No cancellation fees.'
          },
          {
            question: 'What payment methods do you accept?',
            answer: 'We accept all major credit cards, debit cards, UPI, and bank transfers. All payments are secure and encrypted.'
          },
          {
            question: 'What happens after one year?',
            answer: 'Your plan will automatically renew at the same yearly rate. You can cancel anytime before renewal.'
          }
        ]}
      />
      <Navbar />
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-white py-4 md:py-6 lg:py-8 shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.15)]">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 text-center"
          >
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black text-gray-900 mb-2 md:mb-3 tracking-tight leading-tight px-2 sm:px-4">
              Simple, Transparent <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Pricing</span>
            </h1>
            <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-600 max-w-3xl mx-auto font-light px-2 sm:px-4">
              Choose the perfect plan for your business. All plans include a 14-day free trial.
            </p>
          </motion.div>
        </section>

        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 md:py-6 lg:py-8">
          {/* Pricing Cards */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-4 md:mb-6 lg:mb-8 shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.15)] py-3 sm:py-4 md:py-6"
          >
            {plans.map((plan, index) => {
              const Icon = plan.icon;
              
              return (
                <motion.div
                  key={index}
                  variants={cardVariants}
                  whileHover={{ y: -12, scale: 1.02 }}
                  className={`relative bg-white rounded-lg md:rounded-2xl lg:rounded-3xl shadow-xl border-2 overflow-hidden transition-all duration-500 ${
                    plan.popular 
                      ? 'border-purple-500 md:scale-105 lg:scale-110 shadow-2xl' 
                      : 'border-gray-100 hover:border-purple-300 hover:shadow-2xl'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 sm:px-4 md:px-6 py-1 sm:py-1.5 md:py-2 text-xs sm:text-sm font-bold rounded-bl-lg md:rounded-bl-xl lg:rounded-bl-2xl shadow-lg">
                      Most Popular
                    </div>
                  )}
                  
                  <div className="bg-white p-4 sm:p-6 md:p-8 text-center relative overflow-hidden border-b border-gray-100">
                    <div className="relative z-10">
                      <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-br ${plan.gradient} rounded-lg md:rounded-xl lg:rounded-2xl mb-2 sm:mb-3 md:mb-4 shadow-lg`}>
                        <Icon className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white" />
                      </div>
                      <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black text-gray-900 mb-1 sm:mb-2">{plan.name}</h3>
                      <p className="text-xs sm:text-sm md:text-base text-gray-600 mb-2 sm:mb-3 md:mb-4 font-medium">{plan.description}</p>
                      <div className="mb-2 sm:mb-3 md:mb-4">
                        <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-gray-900">{plan.price}</span>
                        <span className="text-gray-600 ml-1 sm:ml-2 text-sm sm:text-base md:text-lg">{plan.period}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 sm:p-6 md:p-8">
                    <ul className="space-y-2 sm:space-y-2.5 md:space-y-3 mb-3 sm:mb-4 md:mb-6">
                      {plan.features.map((feature, featureIndex) => (
                        <motion.li
                          key={featureIndex}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: featureIndex * 0.05 }}
                          className="flex items-start gap-3"
                        >
                          <div className={`w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br ${plan.gradient} rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm`}>
                            <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                          </div>
                          <span className="text-xs sm:text-sm md:text-base text-gray-700 font-medium">{feature}</span>
                        </motion.li>
                      ))}
                    </ul>

                    <Link to="/create-website">
                    <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full bg-gradient-to-r ${plan.gradient} text-white py-2 sm:py-3 md:py-4 px-4 sm:px-5 md:px-6 rounded-lg md:rounded-xl font-bold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all duration-300`}
                    >
                      Get Started
                    </motion.button>
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white rounded-lg md:rounded-2xl lg:rounded-3xl border border-gray-100 p-4 sm:p-6 md:p-8 lg:p-12 shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.15)]"
          >
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-gray-900 tracking-tight mb-3 sm:mb-4 md:mb-6">
              Frequently Asked Questions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
              {[
          {
            question: 'Can I change plans later?',
            answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle. We\'ll prorate the difference.'
          },
          {
            question: 'Is there a setup fee?',
            answer: 'No, there are no setup fees. You only pay the yearly subscription fee for your chosen plan.'
          },
                {
                  question: 'What payment methods do you accept?',
                  answer: 'We accept all major credit cards, debit cards, UPI, and bank transfers.'
                },
                {
                  question: 'Do you offer refunds?',
                  answer: 'Yes, we offer a 30-day money-back guarantee if you\'re not satisfied with our service.'
                }
              ].map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-lg md:rounded-xl lg:rounded-2xl p-4 sm:p-5 md:p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
                >
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
                    {faq.question}
                </h3>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed">
                    {faq.answer}
                </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Pricing;
