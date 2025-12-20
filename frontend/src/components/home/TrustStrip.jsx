import { motion } from 'framer-motion';
import { Users, Globe, Shield } from 'lucide-react';
import { StatsSkeleton } from '../LoadingSkeleton';

const TrustStrip = ({ stats, loading = false }) => {
  const trustStats = [
    { icon: Users, number: `${stats.totalBusinesses}+`, label: 'Local Businesses', gradient: 'from-blue-600 to-purple-600' },
    { icon: Globe, number: `${stats.approvedBusinesses}+`, label: 'Websites Live', gradient: 'from-blue-600 to-purple-600' },
    { icon: Shield, number: `${stats.trustPercentage}%`, label: 'Trusted by Shop Owners', gradient: 'from-blue-600 to-purple-600' }
  ];

  if (loading) {
    return <StatsSkeleton />;
  }

  return (
    <section className="relative -mt-8 z-20 shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.15)]">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6 lg:p-8 border-2 border-gray-200 shadow-xl"
        >
          <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-6 lg:gap-8">
            {trustStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="text-center group"
                >
                  <div className="inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg md:rounded-xl mb-1 sm:mb-2 md:mb-3 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 text-white" />
                  </div>
                  {loading ? (
                    <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black text-gray-900 mb-1 sm:mb-2 md:mb-3 tracking-tight">
                      <div className="h-6 sm:h-8 md:h-12 lg:h-16 w-12 sm:w-16 md:w-20 lg:w-24 bg-gray-200 rounded-lg animate-pulse mx-auto"></div>
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.2 + 0.4 }}
                      className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black text-gray-900 mb-1 sm:mb-2 md:mb-3 tracking-tight"
                    >
                      {stat.number}
                    </motion.div>
                  )}
                  <div className="text-gray-600 font-medium text-xs sm:text-sm md:text-base lg:text-lg leading-tight">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TrustStrip;

