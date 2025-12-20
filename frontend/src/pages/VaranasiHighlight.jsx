import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { SEOHead } from '../components/SEOHead';
import { getHighlightBySlug } from '../data/varanasiHighlights';
import { ArrowLeft, MapPin, Sparkles, Camera, PlayCircle, Globe, Info } from 'lucide-react';
import { getOrigin } from '../utils/urlHelper';

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const VaranasiHighlight = () => {
  const { slug } = useParams();
  const highlight = getHighlightBySlug(slug);

  if (!highlight) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 flex items-center justify-center px-4">
          <div className="max-w-xl mx-auto text-center bg-white rounded-3xl shadow-2xl p-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-6">
              <Info className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">Story Not Found</h1>
            <p className="text-gray-600 mb-8">The Varanasi highlight you tried to open doesn’t exist or has been moved.</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold shadow-lg hover:bg-blue-700 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <SEOHead
        title={`${highlight.title} | Varanasi Experiences`}
        description={highlight.description}
        image={highlight.heroImage}
        url={`${getOrigin()}/varanasi/${highlight.slug}`}
        type="article"
      />
      <Navbar />
      <div className="bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100">
        {/* Hero */}
        <section className="relative min-h-[70vh] flex items-center">
          <div className="absolute inset-0">
            <img
              src={highlight.heroImage}
              alt={highlight.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/50 to-transparent"></div>
          </div>
          <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-3xl"
            >
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-white/70 text-sm font-semibold mb-6 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/15 rounded-full text-white/80 text-sm font-semibold mb-6">
                <Sparkles className="w-4 h-4" />
                Varanasi Experiences
              </span>
              <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-4">
                {highlight.title}
              </h1>
              <p className="text-lg md:text-xl text-white/80 mb-8">{highlight.description}</p>
              <div className="flex flex-wrap gap-4">
                {highlight.stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="px-5 py-3 bg-white/10 rounded-2xl border border-white/30 text-white"
                  >
                    <div className="text-sm text-white/70">{stat.label}</div>
                    <div className="text-2xl font-bold">{stat.value}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
          {/* Overview */}
          <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <div className="grid md:grid-cols-2 gap-10 items-center bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-gray-900">Why this place matters</h2>
                <p className="text-gray-600 leading-relaxed">{highlight.description}</p>
                <div className="flex flex-wrap gap-3">
                  {highlight.highlights.map((chip) => (
                    <span key={chip} className="px-4 py-2 rounded-full bg-blue-50 text-blue-600 text-sm font-semibold">
                      {chip}
                    </span>
                  ))}
                </div>
              </div>
              <div className="relative rounded-2xl overflow-hidden shadow-xl">
                <iframe
                  src={highlight.videoUrl}
                  title={highlight.title}
                  className="w-full h-64 rounded-2xl"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
                <div className="absolute inset-0 border-4 border-white rounded-2xl pointer-events-none"></div>
              </div>
            </div>
          </motion.section>

          {/* Map + Info */}
          <motion.section
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid lg:grid-cols-2 gap-10"
          >
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
                <MapPin className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-bold text-gray-900">Find it on the map</h3>
              </div>
              <iframe
                src={highlight.mapEmbed}
                title="Map"
                className="w-full h-72"
                loading="lazy"
                allowFullScreen
              ></iframe>
            </div>
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8">
              <div className="flex items-center gap-3 mb-6">
                <Globe className="w-6 h-6 text-purple-600" />
                <h3 className="text-xl font-bold text-gray-900">Plan your experience</h3>
              </div>
              <div className="space-y-5">
                {highlight.experiences.map((experience) => (
                  <div key={experience.title} className="p-4 rounded-2xl border border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                    <h4 className="text-lg font-semibold text-gray-900">{experience.title}</h4>
                    <p className="text-gray-600 mt-2 mb-4">{experience.details}</p>
                    <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold shadow-lg hover:bg-blue-700 transition">
                      <PlayCircle className="w-4 h-4" />
                      {experience.bookingLabel}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* Gallery */}
          <motion.section
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <Camera className="w-6 h-6 text-pink-600" />
              <h3 className="text-xl font-bold text-gray-900">Gallery</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {highlight.gallery.map((image, idx) => (
                <div key={idx} className="relative rounded-2xl overflow-hidden group shadow-lg">
                  <img src={image} alt={`${highlight.title} ${idx + 1}`} className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition"></div>
                </div>
              ))}
            </div>
          </motion.section>
        </main>
      </div>
      <Footer />
    </>
  );
};

export default VaranasiHighlight;

