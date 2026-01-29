import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const LivingNoidaStories = ({ highlights = [] }) => {
  if (!highlights || highlights.length === 0) return null;

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
            Living Noida <span className="bg-gradient-to-r from-orange-400 to-yellow-300 bg-clip-text text-transparent">Stories</span>
          </h2>
          <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-gray-600 max-w-3xl mx-auto font-light leading-relaxed">
            From modern shopping malls to tech parks, from fine dining to street food, Noida offers a vibrant lifestyle. Explore the experiences locals love.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
          {highlights.map((highlight, index) => (
            <motion.div
              key={highlight.slug}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.7, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="relative overflow-hidden rounded-lg md:rounded-2xl lg:rounded-3xl border-2 border-gray-200 bg-white hover:border-blue-300 hover:shadow-xl transition-all duration-500"
            >
              <Link to={`/noida/${highlight.slug}`} className="grid grid-cols-1 lg:grid-cols-2 h-full">
                <div className="p-3 sm:p-4 md:p-6 lg:p-8 flex flex-col gap-2 sm:gap-3 md:gap-4">
                  <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900">{highlight.title}</h3>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed">{highlight.tagline}</p>
                  <div className="flex items-center gap-2 text-amber-600 font-semibold text-xs sm:text-sm">
                    {highlight.stats?.[0]?.value} {highlight.stats?.[0]?.label}
                  </div>
                </div>
                <div className="relative h-48 sm:h-56 md:h-64 lg:h-full">
                  <div className="absolute inset-0">
                    <img
                      src={highlight.heroImage}
                      alt={`${highlight.title} - ${highlight.subtitle || 'Noida experience'}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LivingNoidaStories;

