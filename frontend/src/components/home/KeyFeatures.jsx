import { motion } from 'framer-motion';
import { Globe, Smartphone, Cloud, Video, MessageCircle, LayoutDashboard } from 'lucide-react';

const KeyFeatures = () => {
  const features = [
    {
      icon: Globe,
      title: 'Instant Subdomain',
      description: 'Get your business URL instantly with zero configuration',
      gradient: 'from-blue-600 to-purple-600'
    },
    {
      icon: Smartphone,
      title: 'Mobile-Ready',
      description: 'Perfectly responsive design that looks stunning on all devices',
      gradient: 'from-blue-600 to-purple-600'
    },
    {
      icon: Cloud,
      title: 'Cloud Storage',
      description: 'Unlimited photo uploads with fast CDN delivery',
      gradient: 'from-blue-600 to-purple-600'
    },
    {
      icon: Video,
      title: 'Video Embedding',
      description: 'Showcase your videos with seamless YouTube integration',
      gradient: 'from-blue-600 to-purple-600'
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp & Call',
      description: 'One-tap contact options for instant customer connection',
      gradient: 'from-blue-600 to-purple-600'
    },
    {
      icon: LayoutDashboard,
      title: 'Easy Dashboard',
      description: 'Simple, intuitive interface for managing your website',
      gradient: 'from-blue-600 to-purple-600'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
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
    <section className="py-4 md:py-6 lg:py-8 bg-white shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.15)]">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-3 md:mb-4"
        >
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black text-gray-900 mb-1 md:mb-2 tracking-tight leading-tight px-2 sm:px-4">
            Powerful <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Features</span>
          </h2>
          <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-600 max-w-3xl mx-auto font-light leading-relaxed px-2 sm:px-4">

            Everything you need to create a professional business website
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6"

        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.05 }}
                className="group relative"
              >
                <div className="relative bg-white rounded-lg md:rounded-xl lg:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6 border-2 border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-500 overflow-hidden group/card flex flex-col items-center justify-center text-center">
                  <div className="absolute top-0 right-0 w-24 md:w-32 h-24 md:h-32 bg-gradient-to-br from-blue-500 to-purple-500 opacity-5 rounded-full blur-3xl -z-10 group-hover/card:opacity-15 transition-opacity duration-500"></div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg md:rounded-xl flex items-center justify-center mb-2 sm:mb-3 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 mb-1 sm:mb-2">{feature.title}</h3>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed">{feature.description}</p>

                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default KeyFeatures;

