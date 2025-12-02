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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white rounded-3xl p-8 md:p-12 border-2 border-gray-200 shadow-xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                    <Icon className="w-10 h-10 text-white" />
                  </div>
                  {loading ? (
                    <div className="text-5xl md:text-6xl font-black text-gray-900 mb-3 tracking-tight">
                      <div className="h-16 w-24 bg-gray-200 rounded-lg animate-pulse mx-auto"></div>
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.2 + 0.4 }}
                      className="text-5xl md:text-6xl font-black text-gray-900 mb-3 tracking-tight"
                    >
                      {stat.number}
                    </motion.div>
                  )}
                  <div className="text-gray-600 font-medium text-lg">{stat.label}</div>
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

