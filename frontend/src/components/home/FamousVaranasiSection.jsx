import { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, Sparkles, Building2, Music, Utensils, Map, ChevronDown } from 'lucide-react';

const FamousVaranasiSection = () => {
  const [showAll, setShowAll] = useState(false);
  const initialItems = 3;
  const famousItems = [
    {
      icon: Globe,
      title: 'Spiritual Capital',
      description: 'Varanasi, also known as Kashi or Banaras, is one of the world\'s oldest continuously inhabited cities and the spiritual capital of India.',
      image: '/images/Spiritual Capital.jpeg',
      gradient: 'from-blue-600 to-purple-600'
    },
    {
      icon: Sparkles,
      title: 'Ganga Aarti',
      description: 'The mesmerizing Ganga Aarti at Dashashwamedh Ghat is a daily evening ritual that attracts thousands of devotees and tourists.',
      image: '/images/Ganga Aarti.jpg',
      gradient: 'from-blue-600 to-purple-600'
    },
    {
      icon: Building2,
      title: 'Banarasi Silk',
      description: 'Varanasi is world-famous for its exquisite Banarasi silk sarees, known for their intricate zari work and traditional designs.',
      image: '/images/Banarasi Silk.webp',
      gradient: 'from-blue-600 to-purple-600'
    },
    {
      icon: Music,
      title: 'Classical Music',
      description: 'Varanasi is the birthplace of many legendary musicians and is a center for Hindustani classical music.',
      image: '/images/Classical Music.jpg',
      gradient: 'from-blue-600 to-purple-600'
    },
    {
      icon: Utensils,
      title: 'Street Food',
      description: 'Varanasi offers an incredible variety of street food including kachori sabzi, chaat, lassi, malaiyyo, and the famous Banarasi paan.',
      image: '/images/Street Food.webp',
      gradient: 'from-blue-600 to-purple-600'
    },
    {
      icon: Map,
      title: 'Ghats & Temples',
      description: 'The city is home to over 80 ghats along the Ganges River and countless ancient temples with unique histories.',
      image: '/images/Ghats & Temples.jpeg',
      gradient: 'from-blue-600 to-purple-600'
    }
  ];

  return (
    <section id="famous-varanasi" className="py-4 md:py-6 lg:py-8 bg-white relative overflow-hidden shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.15)]">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-3 md:mb-4"
        >
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black text-gray-900 mb-1 md:mb-2 tracking-tight leading-tight">
            Famous <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">Varanasi</span>
          </h2>
          <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-gray-700 max-w-3xl mx-auto font-light leading-relaxed">
            Discover what makes Varanasi one of the world's most spiritual and culturally rich cities
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          {(showAll ? famousItems : famousItems.slice(0, initialItems)).map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.7, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -12 }}
                className="group relative"
              >
                <div className="relative bg-white rounded-lg md:rounded-2xl lg:rounded-3xl overflow-hidden border-2 border-gray-200 h-full hover:border-blue-300 hover:shadow-xl transition-all duration-500">
                  <div className="h-48 sm:h-56 md:h-64 relative overflow-hidden">
                    <img
                      src={item.image}
                      alt={`${item.title} - ${item.description.substring(0, 50)}...`}
                      className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-700"
                      loading="lazy"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                    <div className="absolute top-2 sm:top-3 md:top-4 right-2 sm:right-3 md:right-4 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg md:rounded-xl lg:rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-white" />
                    </div>
                  </div>
                  <div className="p-3 sm:p-4 md:p-5 lg:p-6">
                    <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-1 sm:mb-2 md:mb-3">{item.title}</h3>
                    <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {famousItems.length > initialItems && (
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
              {showAll ? 'Show Less' : 'View All'}
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showAll ? 'rotate-180' : ''}`} />
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default FamousVaranasiSection;

