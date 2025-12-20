import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Target, Users, Award, Heart, MapPin, Globe, Sparkles, Map, Building2, Music, Utensils, Camera, CheckCircle, Rocket } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { SEOHead } from '../components/SEOHead';
import { getOrigin } from '../utils/urlHelper';

const About = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const values = [
    {
      icon: Target,
      title: 'Our Mission',
      description: 'To help local businesses in Varanasi establish a strong online presence and reach more customers through professional websites.',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Users,
      title: 'Our Vision',
      description: 'To become the leading platform for businesses in Varanasi to showcase their services and connect with their community.',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: Heart,
      title: 'Our Values',
      description: 'We believe in supporting local businesses, providing exceptional service, and building long-term relationships with our clients.',
      gradient: 'from-green-500 to-emerald-500'
    }
  ];

  const stats = [
    { number: '500+', label: 'Businesses Served', gradient: 'from-blue-500 to-cyan-500' },
    { number: '98%', label: 'Client Satisfaction', gradient: 'from-purple-500 to-pink-500' },
    { number: '24/7', label: 'Support Available', gradient: 'from-green-500 to-emerald-500' },
    { number: '5+', label: 'Years of Experience', gradient: 'from-orange-500 to-red-500' }
  ];

  const team = [
    {
      name: 'Local Expertise',
      role: 'Deep understanding of Varanasi market',
      description: 'We know the local business landscape and what works best for Varanasi businesses.',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      name: 'Professional Team',
      role: 'Skilled designers and developers',
      description: 'Our team combines creativity with technical expertise to deliver outstanding results.',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      name: 'Customer First',
      role: 'Your success is our priority',
      description: 'We go above and beyond to ensure your website helps grow your business.',
      gradient: 'from-green-500 to-emerald-500'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  return (
    <>
      <SEOHead
        title="About Us - VaranasiHub | Empowering Varanasi Businesses Online Since 2019"
        description="VaranasiHub helps local businesses in Varanasi create professional websites in minutes. Learn about our mission, vision, and team. We've helped 500+ businesses go online. Trusted by shop owners, clinics, hotels, and services across Varanasi."
        image="/og-image.jpg"
        url={`${getOrigin()}/about`}
        keywords="about VaranasiHub, Varanasi website builder, local business support Varanasi, digital transformation Varanasi, business website platform"
        breadcrumbs={[
          { name: 'Home', path: '/', url: '/' },
          { name: 'About', path: '/about', url: '/about' }
        ]}
        faqItems={[
          {
            question: 'When was VaranasiHub founded?',
            answer: 'VaranasiHub was founded in 2019 with a mission to help local businesses in Varanasi establish their online presence.'
          },
          {
            question: 'How many businesses have you helped?',
            answer: 'We have successfully helped over 500 businesses in Varanasi create their professional websites and establish their online presence.'
          },
          {
            question: 'What makes VaranasiHub different?',
            answer: 'We specialize in the Varanasi market, understand local business needs, and provide personalized support. Our platform is designed specifically for Varanasi businesses with local features and integrations.'
          },
          {
            question: 'Do you only serve Varanasi?',
            answer: 'Yes, we focus exclusively on Varanasi businesses to provide the best localized service and support for the local market.'
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
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black text-gray-900 mb-2 md:mb-3 tracking-tight leading-tight">
              About <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">VaranasiHub</span>
            </h1>
            <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-gray-600 max-w-3xl mx-auto font-light">

              Empowering local businesses in Varanasi with professional websites and digital presence.
            </p>
          </motion.div>
        </section>

        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 md:py-6 lg:py-8">

          {/* Story Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white rounded-lg md:rounded-2xl lg:rounded-3xl border border-gray-100 p-4 sm:p-6 md:p-8 lg:p-12 mb-4 sm:mb-6 md:mb-8 shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.15)]"
          >
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-black text-gray-900 tracking-tight mb-3 sm:mb-4 md:mb-6">Our Story</h2>
            <div className="prose prose-sm sm:prose-base md:prose-lg max-w-none text-gray-600 space-y-3 sm:space-y-4 md:space-y-6 text-sm sm:text-base md:text-lg leading-relaxed">

              <p>
                VaranasiHub was born from a simple idea: every local business in Varanasi deserves
                a professional online presence. In today's digital age, having a website is not just
                a luxury—it's a necessity.
              </p>
              <p>
                We started with a mission to help small and medium businesses in Varanasi establish
                their digital footprint without the complexity and high costs typically associated
                with web development. Our team understands the unique needs of local businesses and
                creates websites that truly represent their brand and connect with their customers.
              </p>
              <p>
                Today, we're proud to have helped hundreds of businesses in Varanasi grow their
                online presence, reach more customers, and thrive in the digital marketplace.
              </p>
            </div>
          </motion.div>

          {/* Stats Section */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-6 mb-4 sm:mb-6 md:mb-8 shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.15)] py-3 sm:py-4 md:py-6 lg:py-8"

          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -8 }}
                className="bg-white rounded-lg md:rounded-xl lg:rounded-2xl shadow-xl border border-gray-100 p-3 sm:p-4 md:p-5 lg:p-6 text-center hover:shadow-2xl transition-all duration-300"
              >
                <div className={`inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 bg-gradient-to-br ${stat.gradient} rounded-lg md:rounded-xl lg:rounded-2xl mb-2 sm:mb-3 shadow-lg`}>
                  <Award className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:w-7 lg:w-8 lg:h-8 text-white" />
                </div>
                <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black text-gray-900 mb-1 sm:mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-semibold text-xs sm:text-xs md:text-sm">{stat.label}</div>

              </motion.div>
            ))}
          </motion.div>

          {/* Values Section */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8 mb-4 sm:mb-6 md:mb-8 shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.15)] py-3 sm:py-4 md:py-6 lg:py-8"

          >
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ y: -12, scale: 1.02 }}
                  className="bg-white rounded-lg md:rounded-2xl lg:rounded-3xl shadow-xl border border-gray-100 p-4 sm:p-6 md:p-8 text-center hover:shadow-2xl transition-all duration-500 overflow-hidden relative group"
                >
                  <div className={`absolute top-0 right-0 w-24 md:w-32 h-24 md:h-32 bg-gradient-to-br ${value.gradient} opacity-10 rounded-full blur-3xl -z-10 group-hover:opacity-20 transition-opacity duration-500`}></div>
                  <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-br ${value.gradient} rounded-lg md:rounded-xl lg:rounded-2xl mb-2 sm:mb-3 md:mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                    <Icon className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white" />
                  </div>
                  <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">{value.title}</h3>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed">{value.description}</p>

                </motion.div>
              );
            })}
          </motion.div>

          {/* Why Choose Us Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white rounded-lg md:rounded-2xl lg:rounded-3xl border border-gray-100 p-4 sm:p-6 md:p-8 lg:p-12 mb-4 sm:mb-6 md:mb-8 shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.15)]"
          >
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-black text-gray-900 tracking-tight mb-3 sm:mb-4 md:mb-6">Why Choose Us</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8">

              {team.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="bg-white rounded-lg md:rounded-xl lg:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
                >
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br ${item.gradient} rounded-lg md:rounded-xl flex items-center justify-center mb-2 sm:mb-3 shadow-lg`}>
                    <Rocket className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" />
                  </div>
                  <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-gray-900 mb-1 sm:mb-2">{item.name}</h3>
                  <p className="text-xs sm:text-sm md:text-base text-blue-600 font-semibold mb-1 sm:mb-2">{item.role}</p>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed">{item.description}</p>

                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white rounded-lg md:rounded-2xl lg:rounded-3xl shadow-xl border border-gray-100 p-4 sm:p-6 md:p-8 lg:p-12 text-center relative overflow-hidden shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.15)]"
          >
            <div className="relative z-10">
              <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-black text-gray-900 mb-2 sm:mb-3 md:mb-4 tracking-tight">
                Join the VaranasiHub Community
              </h2>
              <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-gray-600 mb-4 sm:mb-6 md:mb-8 max-w-2xl mx-auto font-light">

                Be part of the growing network of successful businesses in Varanasi.
              </p>
              <Link to="/create-website">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 sm:px-8 md:px-10 py-2 sm:py-3 md:py-4 rounded-lg md:rounded-xl lg:rounded-2xl font-bold text-sm sm:text-base md:text-lg shadow-xl hover:shadow-2xl transition-all duration-300"

                >
                  Get Started Today
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default About;
