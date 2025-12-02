import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';

const ApnaBanarasDetailed = () => {
  const ghats = [
    {
      name: 'Dashashwamedh Ghat',
      description: 'The most famous ghat, known for its spectacular evening Ganga Aarti. Legend says Lord Brahma performed a Dashashwamedh Yajna here.',
      location: 'Main Ghat, Near Kashi Vishwanath',
      image: '/images/Dashashwamedh Ghat.jpg'
    },
    {
      name: 'Manikarnika Ghat',
      description: 'One of the oldest and most sacred cremation ghats. It\'s believed that Goddess Parvati\'s earring (Manikarnika) fell here.',
      location: 'Sacred Cremation Ghat',
      image: '/images/Manikarnika Ghat.webp'
    },
    {
      name: 'Assi Ghat',
      description: 'The southernmost ghat where the Assi River meets the Ganges. Famous for Subah-e-Banaras morning ritual.',
      location: 'Southern End, Near BHU',
      image: '/images/Assi Ghat.jpg'
    },
    {
      name: 'Harishchandra Ghat',
      description: 'Another important cremation ghat named after the legendary King Harishchandra.',
      location: 'Near Manikarnika Ghat',
      image: '/images/Harishchandra Ghat.png'
    },
    {
      name: 'Tulsi Ghat',
      description: 'Named after the great poet-saint Tulsidas, who wrote the Ramcharitmanas here.',
      location: 'Near Assi Ghat',
      image: '/images/Tulsi Ghat.jpg'
    },
    {
      name: 'Pancaganga Ghat',
      description: 'A beautiful ghat where five rivers are believed to meet.',
      location: 'Central Varanasi',
      image: '/images/Pancaganga Ghat.jpg'
    }
  ];

  const temples = [
    {
      name: 'Kashi Vishwanath Temple',
      description: 'One of the twelve Jyotirlingas, dedicated to Lord Shiva. The current temple was built in 1780 by Queen Ahilyabai Holkar.',
      location: 'Near Dashashwamedh Ghat',
      image: '/images/Kashi Vishwanath Temple.jpg'
    },
    {
      name: 'Sankat Mochan Hanuman Temple',
      description: 'A famous temple dedicated to Lord Hanuman, established by Tulsidas.',
      location: 'Near BHU Campus',
      image: '/images/Sankat Mochan Hanuman Temple.jpg'
    },
    {
      name: 'Vishalakshi Temple',
      description: 'Dedicated to Goddess Vishalakshi, an aspect of Parvati. It\'s considered one of the 51 Shakti Pithas.',
      location: 'Mir Ghat Area',
      image: '/images/Vishalakshi Temple.png'
    },
    {
      name: 'Durga Temple',
      description: 'Also known as Monkey Temple, this 18th-century temple is dedicated to Goddess Durga.',
      location: 'Durga Kund Area',
      image: '/images/Durga Temple.jpeg'
    },
    {
      name: 'Bharat Mata Temple',
      description: 'A unique temple dedicated to Mother India, featuring a marble relief map of undivided India.',
      location: 'Mahatma Gandhi Kashi Vidyapith',
      image: '/images/Bharat Mata Temple.jpg'
    },
    {
      name: 'Tulsi Manas Temple',
      description: 'Built in 1964, this temple is dedicated to Lord Rama. The walls are inscribed with verses from the Ramcharitmanas.',
      location: 'Near Durga Temple',
      image: '/images/Tulsi Manas Temple.jpeg'
    }
  ];

  const culturalHeritage = [
    {
      title: 'Dev Deepawali',
      description: 'The Festival of Lights of the Gods, celebrated 15 days after Diwali. All ghats are illuminated with thousands of diyas, creating a magical spectacle.',
      image: '/images/Dev Deepawali.jpg',
      gradient: 'from-yellow-500 to-orange-500'
    },
    {
      title: 'Classical Arts',
      description: 'Varanasi is a hub for Hindustani classical music, dance, and traditional arts. The city has produced legendary artists.',
      image: '/images/Classical Arts.jpg',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Banarasi Cuisine',
      description: 'From kachori sabzi to malaiyyo, thandai to lassi, and the famous Banarasi paan - the city\'s culinary heritage is rich.',
      image: '/images/Banarasi Cuisine.webp',
      gradient: 'from-orange-500 to-red-500'
    },
    {
      title: 'Handicrafts',
      description: 'Beyond Banarasi silk, the city is known for brassware, wooden toys, stone carvings, and traditional crafts.',
      image: '/images/Handicrafts.jpg',
      gradient: 'from-blue-500 to-cyan-500'
    }
  ];

  return (
    <section id="apna-banaras" className="py-8 md:py-10 bg-white relative overflow-hidden shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.15)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-6"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-4 tracking-tight leading-tight">
            Apna <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Banaras</span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto font-light leading-relaxed">
            Discover the essence of Varanasi through its iconic ghats, sacred temples, and rich cultural heritage
          </p>
        </motion.div>

        {/* Ghats Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mb-6"
        >
          <h3 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-6">Famous Ghats of Varanasi</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ghats.map((ghat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.7, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -12, scale: 1.02 }}
                className="group relative bg-white rounded-3xl overflow-hidden border-2 border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-500"
              >
                <div className="h-64 relative overflow-hidden">
                  <img
                    src={ghat.image}
                    alt={`${ghat.name} - ${ghat.description ? ghat.description.substring(0, 60) : 'Famous ghat in Varanasi'}...`}
                    className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-700"
                    loading="lazy"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                </div>
                <div className="p-6">
                  <h4 className="text-2xl font-bold text-gray-900 mb-3">{ghat.name}</h4>
                  <p className="text-gray-600 mb-4 leading-relaxed">{ghat.description}</p>
                  <div className="flex items-center gap-2 text-blue-600 font-semibold">
                    <MapPin className="w-5 h-5" />
                    <span>{ghat.location}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Temples Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mb-6"
        >
          <h3 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-6">Sacred Temples of Varanasi</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {temples.map((temple, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.7, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -12, scale: 1.02 }}
                className="group relative bg-white rounded-3xl overflow-hidden border-2 border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-500"
              >
                <div className="h-64 relative overflow-hidden">
                  <img
                    src={temple.image}
                    alt={`${temple.name} - ${temple.description ? temple.description.substring(0, 60) : 'Sacred temple in Varanasi'}...`}
                    className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-700"
                    loading="lazy"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                </div>
                <div className="p-6">
                  <h4 className="text-2xl font-bold text-gray-900 mb-3">{temple.name}</h4>
                  <p className="text-gray-600 mb-4 leading-relaxed">{temple.description}</p>
                  <div className="flex items-center gap-2 text-purple-600 font-semibold">
                    <MapPin className="w-5 h-5" />
                    <span>{temple.location}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Cultural Heritage Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <h3 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-6">Cultural Heritage</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {culturalHeritage.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.7, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -12, scale: 1.02 }}
                className="group relative bg-white rounded-3xl overflow-hidden border-2 border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-500"
              >
                <div className="h-80 relative overflow-hidden">
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
                  <div className="absolute bottom-6 left-6 right-6">
                    <h4 className="text-3xl font-bold text-white mb-3">{item.title}</h4>
                    <p className="text-white/90 leading-relaxed text-lg">{item.description}</p>
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

export default ApnaBanarasDetailed;

