import { motion } from 'framer-motion';
import { Users, Zap, Rocket, MessageCircle, Star, CheckCircle } from 'lucide-react';

const WhyChooseSection = () => {
  const whyPoints = [
    { text: 'Reach real customers in Varanasi', icon: Users },
    { text: 'Zero technical skills needed', icon: Zap },
    { text: 'Your business gets a clean, fast website', icon: Rocket },
    { text: 'One-tap WhatsApp & Call buttons', icon: MessageCircle },
    { text: 'Perfect for shops, clinics, homestays, services', icon: Star }
  ];

  return (
    <section className="py-12 md:py-16 bg-white relative overflow-hidden shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.15)]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-6"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-4 tracking-tight leading-tight">
            Why Choose <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">VaranasiHub</span>?
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 font-light">Everything you need to succeed online</p>
        </motion.div>

        <div className="space-y-4">
          {whyPoints.map((point, index) => {
            const Icon = point.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -60 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.7, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ x: 10, scale: 1.01 }}
                className="group relative"
              >
                <div className="relative bg-white rounded-2xl p-6 border-2 border-gray-200 flex items-center gap-6 hover:border-blue-300 hover:shadow-xl transition-all duration-500">
                  <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-xl text-gray-900 font-semibold flex-1">{point.text}</p>
                  <CheckCircle className="w-7 h-7 text-green-500 flex-shrink-0" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseSection;

