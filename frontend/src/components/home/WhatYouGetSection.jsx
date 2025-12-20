import { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, Server, Database, Smartphone, Shield, Zap, Cloud, Lock, BarChart3, MessageCircle, MapPin, Video, Palette, ChevronDown } from 'lucide-react';

const WhatYouGetSection = () => {
  const [showAll, setShowAll] = useState(false);
  const initialItems = 8;

  const features = [
    {
      icon: Globe,
      title: 'Domain',
      description: 'Get your own domain instantly (yourbusiness.varanasihub.com)',
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50'
    },
    {
      icon: Server,
      title: 'Hosting',
      description: 'Fast, reliable hosting included. No server management needed.',
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-50 to-pink-50'
    },
    {
      icon: Database,
      title: 'Database Included',
      description: 'Secure database storage for all your business data and content.',
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-50 to-emerald-50'
    },
    {
      icon: Smartphone,
      title: 'Mobile Responsive',
      description: 'Your website looks perfect on phones, tablets, and desktops.',
      gradient: 'from-orange-500 to-red-500',
      bgGradient: 'from-orange-50 to-red-50'
    },
    {
      icon: Shield,
      title: 'SSL Certificate',
      description: 'SSL encryption for secure, trusted connections.',
      gradient: 'from-indigo-500 to-blue-500',
      bgGradient: 'from-indigo-50 to-blue-50'
    },
    {
      icon: Zap,
      title: 'Fast Loading',
      description: 'Optimized for speed. Your website loads in seconds.',
      gradient: 'from-yellow-500 to-orange-500',
      bgGradient: 'from-yellow-50 to-orange-50'
    },
    {
      icon: Cloud,
      title: 'Cloud Storage',
      description: 'Unlimited image and file storage on secure cloud servers.',
      gradient: 'from-teal-500 to-cyan-500',
      bgGradient: 'from-teal-50 to-cyan-50'
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Track visitors, clicks, and engagement with built-in analytics.',
      gradient: 'from-pink-500 to-rose-500',
      bgGradient: 'from-pink-50 to-rose-50'
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp Integration',
      description: 'One-click WhatsApp chat button for instant customer contact.',
      gradient: 'from-green-600 to-emerald-600',
      bgGradient: 'from-green-50 to-emerald-50'
    },
    {
      icon: MapPin,
      title: 'Google Maps',
      description: 'Embedded Google Maps so customers can find you easily.',
      gradient: 'from-red-500 to-pink-500',
      bgGradient: 'from-red-50 to-pink-50'
    },
    {
      icon: Video,
      title: 'Video Embedding',
      description: 'Add YouTube videos to showcase your business.',
      gradient: 'from-red-600 to-rose-600',
      bgGradient: 'from-red-50 to-rose-50'
    },
    {
      icon: Palette,
      title: 'Custom Themes',
      description: 'Choose from beautiful themes or customize your own.',
      gradient: 'from-violet-500 to-purple-500',
      bgGradient: 'from-violet-50 to-purple-50'
    },
    {
      icon: Lock,
      title: 'Secure & Safe',
      description: 'Enterprise-grade security to protect your data.',
      gradient: 'from-gray-700 to-gray-900',
      bgGradient: 'from-gray-50 to-gray-100'
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
    <section className="relative py-4 md:py-6 lg:py-8 xl:py-12 bg-white shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.15)]">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-4 md:mb-6 lg:mb-8"

        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black text-gray-900 mb-1 md:mb-2 tracking-tight"

          >
            Everything You{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Get Included
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-600 max-w-3xl mx-auto font-light"

          >
            No hidden costs. No technical setup. Everything you need to run your business online is included.
          </motion.p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6"
        >
          {(showAll ? features : features.slice(0, initialItems)).map((feature, index) => {

            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -8 }}
                className="group relative bg-white rounded-lg md:rounded-xl lg:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6 border-2 border-gray-100 hover:border-blue-300 transition-all duration-300 shadow-lg hover:shadow-2xl overflow-hidden"

              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>

                {/* Content */}
                <div className="relative z-10">
                  {/* Icon */}
                  <div className={`inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br ${feature.gradient} rounded-lg md:rounded-xl mb-2 sm:mb-3 md:mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" />
                  </div>

                  {/* Title */}
                  <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-gray-900 mb-1 sm:mb-2 group-hover:text-blue-600 transition-colors">

                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 text-xs sm:text-xs md:text-sm leading-relaxed">

                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* View More Button */}
        {features.length > initialItems && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-4 md:mt-6"
          >
            <button
              onClick={() => setShowAll(!showAll)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg md:rounded-xl font-semibold text-sm sm:text-base hover:shadow-lg transition-all duration-300"
            >
              {showAll ? 'Show Less' : `View All (${features.length - initialItems} more)`}
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showAll ? 'rotate-180' : ''}`} />
            </button>
          </motion.div>
        )}

      </div>
    </section>
  );
};

export default WhatYouGetSection;

