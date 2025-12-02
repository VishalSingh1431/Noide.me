import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Rocket } from 'lucide-react';

const ReadyToGoLiveCTA = () => {
  return (
    <section className="relative py-8 md:py-10 overflow-hidden bg-white shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.15)]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.h2
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-8 tracking-tight leading-tight"
          >
            Ready to Go Live? 🚀
          </motion.h2>
          <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-2xl mx-auto font-light leading-relaxed">
            Create your Varanasi website now — starting at ₹1,000/year with 14-day free trial!
          </p>
          <Link to="/create-website">
            <motion.button
              whileHover={{ scale: 1.08, y: -4 }}
              whileTap={{ scale: 0.98 }}
              className="group relative px-14 py-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold text-xl shadow-2xl hover:shadow-[0_25px_60px_rgba(99,102,241,0.4)] overflow-hidden transition-all duration-300"
            >
              <span className="relative z-10 flex items-center gap-3">
                Create My Website Now
                <Rocket className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
              </span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-yellow-200 to-orange-200"
                initial={{ x: "-100%" }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
              />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default ReadyToGoLiveCTA;

