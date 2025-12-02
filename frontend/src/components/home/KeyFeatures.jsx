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
    <section className="py-12 md:py-16 bg-white relative overflow-hidden shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.15)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-6"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-4 tracking-tight leading-tight">
            Powerful <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Features</span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto font-light leading-relaxed">
            Everything you need to create a professional business website
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -12, scale: 1.02 }}
                className="group relative"
              >
                <div className="relative bg-white rounded-3xl p-8 border-2 border-gray-200 h-full hover:border-blue-300 hover:shadow-xl transition-all duration-500 overflow-hidden group/card">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-500 to-purple-500 opacity-5 rounded-full blur-3xl -z-10 group-hover/card:opacity-15 transition-opacity duration-500"></div>
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
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

