import { motion } from 'framer-motion';
import { Sparkles, Star, Map, MapPin, CheckCircle, Building2 } from 'lucide-react';

const ApnaBanarasSection = () => {
  const features = [
    {
      title: 'Spiritual Experience',
      description: 'Witness the mesmerizing Ganga Aarti at Dashashwamedh Ghat, perform rituals at sacred ghats, experience divine peace, and immerse yourself in the spiritual energy that flows through every corner of this ancient city.'
    },
    {
      title: 'Rich Heritage',
      description: 'Explore ancient temples like Kashi Vishwanath, wander through narrow lanes filled with history, discover traditional crafts including world-famous Banarasi silk, and experience timeless Banarasi culture that has been preserved for millennia.'
    },
    {
      title: 'Vibrant Life',
      description: 'From sunrise yoga at Assi Ghat to evening boat rides on the Ganges, from street food adventures to classical music performances, Banaras never stops amazing with its 24/7 spiritual and cultural activities.'
    },
    {
      title: 'Sacred Ghats',
      description: 'With 88 sacred ghats along the holy Ganges River, each with its own unique history and significance, Varanasi offers countless opportunities for spiritual reflection, ritual ceremonies, and peaceful contemplation.'
    },
    {
      title: 'Cultural Capital',
      description: 'As the birthplace of Hindustani classical music, home to legendary artists, center of Sanskrit learning, and hub of traditional arts, Varanasi continues to be India\'s cultural and spiritual heart.'
    }
  ];

  const stats = [
    { number: '3000+', label: 'Years Old', icon: Building2 },
    { number: '88', label: 'Sacred Ghats', icon: Map },
    { number: '100+', label: 'Temples', icon: Sparkles },
    { number: '24/7', label: 'Spiritual Energy', icon: Star }
  ];

  const highlights = [
    { title: '3,000+ Years Old', description: 'One of the oldest continuously inhabited cities in the world, with a rich history spanning millennia' },
    { title: '88 Sacred Ghats', description: 'On the banks of holy Ganges River, each ghat has unique spiritual significance and history' },
    { title: '100+ Ancient Temples', description: 'Home to Kashi Vishwanath, Sankat Mochan, and countless other sacred temples' },
    { title: 'World Heritage Site', description: 'Recognized by UNESCO for its cultural and spiritual significance to humanity' },
    { title: 'Banarasi Silk Capital', description: 'Famous worldwide for exquisite Banarasi silk sarees with intricate zari work' },
    { title: 'Classical Music Hub', description: 'Birthplace of legendary musicians and center for Hindustani classical music' }
  ];

  return (
    <section className="py-4 md:py-6 lg:py-8 bg-white relative overflow-hidden shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.15)]">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-3 md:mb-4"
        >
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black text-gray-900 mb-1 md:mb-2 tracking-tight leading-tight">
            Apna <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Banaras</span>
          </h2>
          <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-gray-700 max-w-3xl mx-auto font-light leading-relaxed">
            The spiritual capital of India, where tradition meets timelessness
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6 mb-3 md:mb-4">
          {/* What's Great About It Card */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl md:rounded-2xl lg:rounded-3xl shadow-2xl p-3 sm:p-4 md:p-6 lg:p-8 text-white relative overflow-hidden h-full flex flex-col"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px]"></div>
            <div className="relative z-10 flex-1 flex flex-col">
              <div className="flex items-center gap-3 sm:gap-4 mb-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xl sm:text-2xl font-bold leading-tight">What Makes It Great</h3>
                  <p className="text-white/90 text-sm sm:text-base mt-1">The essence of spiritual India</p>
                </div>
              </div>
              
              <div className="space-y-3 sm:space-y-4 flex-1">
                {features.map((feature, index) => (
                  <div key={index} className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/20">
                    <h4 className="font-bold text-base sm:text-lg mb-2 flex items-center gap-2">
                      <Star className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                      <span>{feature.title}</span>
                    </h4>
                    <p className="text-white/90 text-xs sm:text-sm leading-relaxed">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Explore Varanasi & Location Card */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white rounded-xl md:rounded-2xl lg:rounded-3xl overflow-hidden border-2 border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-500 flex flex-col h-full"
          >
            <div className="p-3 sm:p-4 md:p-6 lg:p-8 flex-1 flex flex-col">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
                <Map className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 flex-shrink-0" />
                <span>Explore Varanasi</span>
              </h3>
              
              <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="relative rounded-xl overflow-hidden h-28 sm:h-32 md:h-36 group cursor-pointer">
                  <img
                    src="/images/2-sarnath-varanasi-2-city-hero.jpeg"
                    alt="Varanasi Ghats"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                  <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 right-2 sm:right-3">
                    <p className="text-white text-xs sm:text-sm font-semibold drop-shadow-lg">Varanasi Ghats</p>
                  </div>
                </div>
                <div className="relative rounded-xl overflow-hidden h-28 sm:h-32 md:h-36 group cursor-pointer">
                  <img
                    src="/images/Kashi V temple.jpg"
                    alt="Kashi Vishwanath"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1548013146-72479768bada?w=400&h=300&fit=crop';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                  <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 right-2 sm:right-3">
                    <p className="text-white text-xs sm:text-sm font-semibold drop-shadow-lg">Kashi Vishwanath</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                {highlights.map((highlight, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5 sm:mt-1" />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-gray-900 text-sm sm:text-base mb-1">{highlight.title}</h4>
                      <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">{highlight.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Map Section */}
            <div className="relative h-56 sm:h-64 md:h-72 lg:h-80 w-full border-t border-gray-200">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d115132.8324682005!2d82.97391573955075!3d25.31764526077926!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x398e2e2ef5a0e36f%3A0xd2a3f752f10c90d2!2sVaranasi%2C%20Uttar%20Pradesh!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
                title="Varanasi Location Map"
              ></iframe>
              <div className="absolute top-3 sm:top-4 left-3 sm:left-4 bg-white/95 backdrop-blur-md px-3 sm:px-4 py-2 rounded-xl shadow-lg">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 flex-shrink-0" />
                  <span className="font-bold text-gray-900 text-sm sm:text-base">Varanasi, UP</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-white rounded-lg md:rounded-xl lg:rounded-2xl p-2 sm:p-3 md:p-4 lg:p-6 border-2 border-gray-200 text-center hover:border-blue-300 hover:shadow-xl transition-all duration-300"
              >
                <div className="inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg md:rounded-xl mb-2 sm:mb-3 shadow-lg">
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-black text-gray-900 mb-1 leading-tight">{stat.number}</div>
                <div className="text-gray-600 font-medium text-xs sm:text-xs md:text-sm">{stat.label}</div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default ApnaBanarasSection;

