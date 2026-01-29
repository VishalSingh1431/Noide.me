import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, ChevronDown } from 'lucide-react';

const ApnaNoidaDetailed = () => {
  const [showAllMalls, setShowAllMalls] = useState(false);
  const [showAllParks, setShowAllParks] = useState(false);
  const initialItems = 3;

  const malls = [
    {
      name: 'DLF Mall of India',
      description: 'One of the largest shopping malls in Noida, featuring over 300 retail stores, entertainment zones, fine dining restaurants, and a multiplex.',
      location: 'Sector 18, Noida',
      image: '/images/DLF Mall of India.jpeg'
    },
    {
      name: 'GIP Mall',
      description: 'Great India Place is a premier shopping destination with international brands, food courts, and entertainment facilities.',
      location: 'Sector 18, Noida',
      image: '/images/GIP Mall.webp'
    },
    {
      name: 'Centrestage Mall',
      description: 'A modern shopping mall offering a mix of retail stores, dining options, and entertainment in the heart of Noida.',
      location: 'Sector 18, Noida',
      image: '/images/Centrestage Mall.jpg'
    },
    {
      name: 'Gardenia Gateway',
      description: 'A luxury shopping destination featuring premium brands, fine dining restaurants, and lifestyle stores.',
      location: 'Sector 18, Noida',
      image: '/images/Gardenia Gateway.avif'
    },
    {
      name: 'Logix City Centre',
      description: 'A popular shopping and entertainment hub with multiple retail outlets, restaurants, and recreational facilities.',
      location: 'Sector 32, Noida',
      image: '/images/Logix City Centre.avif'
    },
    {
      name: 'Spice World Mall',
      description: 'A vibrant shopping mall offering diverse retail options, food courts, and entertainment for the whole family.',
      location: 'Sector 25, Noida',
      image: '/images/Spice World Mall.avif'
    }
  ];

  const parks = [
    {
      name: 'DLF IT Park',
      description: 'A major IT hub housing numerous tech companies, startups, and multinational corporations in modern office spaces.',
      location: 'Sector 5, Noida',
      image: '/images/IT & Business Hub.jpg'
    },
    {
      name: 'Techzone',
      description: 'A prominent IT park featuring state-of-the-art infrastructure for technology companies and business centers.',
      location: 'Sector 127, Noida',
      image: '/images/IT & Business Hub 1.jpg'
    },
    {
      name: 'Logix Cyber Park',
      description: 'A modern business park designed for IT companies with world-class facilities and excellent connectivity.',
      location: 'Sector 62, Noida',
      image: '/images/IT Hub.jpg'
    },
    {
      name: 'Mindspace IT Park',
      description: 'A premium business destination offering office spaces for leading technology companies and corporate headquarters.',
      location: 'Sector 62, Noida',
      image: '/images/IT & Business Hub.jpg'
    },
    {
      name: 'Noida Special Economic Zone',
      description: 'A designated SEZ area providing excellent infrastructure and facilities for export-oriented businesses.',
      location: 'Sector 81, Noida',
      image: '/images/IT & Business Hub 1.jpg'
    },
    {
      name: 'Sector 62 Business Hub',
      description: 'A thriving business district with multiple IT parks, corporate offices, and commercial establishments.',
      location: 'Sector 62, Noida',
      image: '/images/IT & Business Hub.jpg'
    }
  ];

  const culturalHeritage = [
    {
      title: 'Modern Shopping',
      description: 'Noida is home to numerous modern shopping malls offering international brands, entertainment zones, and diverse dining experiences.',
      image: '/images/Modern Shopping.jpg',
      gradient: 'from-yellow-500 to-orange-500'
    },
    {
      title: 'IT & Business Hub',
      description: 'Noida is a major IT and business hub, home to numerous tech companies, multinational corporations, and startups.',
      image: '/images/IT & Business Hub.jpg',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Diverse Dining',
      description: 'From fine dining restaurants to street food, Noida offers a wide variety of cuisines including North Indian, Chinese, Continental, and international flavors.',
      image: '/images/Diverse Dining.jpg',
      gradient: 'from-orange-500 to-red-500'
    },
    {
      title: 'Entertainment Centers',
      description: 'Noida features multiple entertainment centers, multiplexes, gaming zones, and recreational facilities for residents and visitors.',
      image: '/images/Entertainment.jpeg',
      gradient: 'from-blue-500 to-cyan-500'
    }
  ];

  return (
    <section id="apna-noida" className="py-4 md:py-6 lg:py-8 bg-white relative overflow-hidden shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.15)]">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 relative z-10">

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-3 md:mb-4"
        >
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black text-gray-900 mb-1 md:mb-2 tracking-tight leading-tight">
            Apna <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Noida</span>
          </h2>
          <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-gray-700 max-w-3xl mx-auto font-light leading-relaxed">

            Discover the essence of Noida through its modern infrastructure, IT hubs, shopping malls, and vibrant lifestyle
          </p>
        </motion.div>

        {/* Malls Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mb-3 md:mb-4"
        >
          <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black text-gray-900 tracking-tight mb-3 md:mb-4">Major Shopping Malls & Entertainment</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {(showAllMalls ? malls : malls.slice(0, initialItems)).map((mall, index) => (

              <motion.div
                key={index}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.7, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -12, scale: 1.02 }}
                className="group relative bg-white rounded-lg md:rounded-2xl lg:rounded-3xl overflow-hidden border-2 border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-500"
              >
                <div className="h-48 sm:h-56 md:h-64 relative overflow-hidden">

                  <img
                    src={mall.image}
                    alt={`${mall.name} - ${mall.description ? mall.description.substring(0, 60) : 'Popular destination in Noida'}...`}
                    className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-700"
                    loading="lazy"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                </div>
                <div className="p-3 sm:p-4 md:p-5 lg:p-6">
                  <h4 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-1 sm:mb-2 md:mb-3">{mall.name}</h4>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600 mb-2 sm:mb-3 md:mb-4 leading-relaxed">{mall.description}</p>
                  <div className="flex items-center gap-2 text-blue-600 font-semibold text-xs sm:text-sm">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />

                    <span>{mall.location}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          {malls.length > initialItems && (
            <div className="text-center mt-4">
              <button
                onClick={() => setShowAllMalls(!showAllMalls)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg md:rounded-xl font-semibold text-sm sm:text-base hover:shadow-lg transition-all duration-300"
              >
                {showAllMalls ? 'Show Less' : `View All Malls (${malls.length - initialItems} more)`}
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showAllMalls ? 'rotate-180' : ''}`} />
              </button>
            </div>
          )}

        </motion.div>

        {/* IT Parks Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mb-3 md:mb-4"
        >
          <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black text-gray-900 tracking-tight mb-3 md:mb-4">IT Parks & Business Centers</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {(showAllParks ? parks : parks.slice(0, initialItems)).map((park, index) => (

              <motion.div
                key={index}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.7, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -12, scale: 1.02 }}
                className="group relative bg-white rounded-lg md:rounded-2xl lg:rounded-3xl overflow-hidden border-2 border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-500"
              >
                <div className="h-48 sm:h-56 md:h-64 relative overflow-hidden">

                  <img
                    src={park.image}
                    alt={`${park.name} - ${park.description ? park.description.substring(0, 60) : 'Business center in Noida'}...`}
                    className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-700"
                    loading="lazy"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                </div>
                <div className="p-3 sm:p-4 md:p-5 lg:p-6">
                  <h4 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-1 sm:mb-2 md:mb-3">{park.name}</h4>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600 mb-2 sm:mb-3 md:mb-4 leading-relaxed">{park.description}</p>
                  <div className="flex items-center gap-2 text-purple-600 font-semibold text-xs sm:text-sm">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />

                    <span>{park.location}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          {parks.length > initialItems && (
            <div className="text-center mt-4">
              <button
                onClick={() => setShowAllParks(!showAllParks)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg md:rounded-xl font-semibold text-sm sm:text-base hover:shadow-lg transition-all duration-300"
              >
                {showAllParks ? 'Show Less' : `View All IT Parks (${parks.length - initialItems} more)`}
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showAllParks ? 'rotate-180' : ''}`} />
              </button>
            </div>
          )}

        </motion.div>

        {/* Cultural Heritage Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black text-gray-900 tracking-tight mb-3 md:mb-4">Cultural Heritage</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">

            {culturalHeritage.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.7, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -12, scale: 1.02 }}
                className="group relative bg-white rounded-lg md:rounded-2xl lg:rounded-3xl overflow-hidden border-2 border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-500"
              >
                <div className="h-48 sm:h-56 md:h-64 lg:h-80 relative overflow-hidden">

                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-700"
                    loading="lazy"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${item.gradient} opacity-80`}></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  <div className="absolute bottom-3 sm:bottom-4 md:bottom-6 left-3 sm:left-4 md:left-6 right-3 sm:right-4 md:right-6">
                    <h4 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white mb-1 sm:mb-2 md:mb-3">{item.title}</h4>
                    <p className="text-white/90 leading-relaxed text-xs sm:text-sm md:text-base lg:text-lg">{item.description}</p>

                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ApnaNoidaDetailed;

