import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, Sparkles } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { SEOHead } from '../components/SEOHead';
import { contactAPI } from '../config/api';
import { useToast } from '../contexts/ToastContext';
import { getOrigin } from '../utils/urlHelper';

const Contact = () => {
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitStatus(null);
      await contactAPI.sendMessage(formData);
      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
      toast.success('Message sent successfully! We\'ll get back to you soon.');
      setTimeout(() => setSubmitStatus(null), 5000);
    } catch (error) {
      setSubmitStatus('error');
      toast.error(error.message || 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email Us',
      content: 'info@varanasihub.com',
      link: 'mailto:info@varanasihub.com',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Phone,
      title: 'Call Us',
      content: '+91 9305715031',
      link: 'tel:+919305715031',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      content: 'Varanasi, Uttar Pradesh, India',
      link: null,
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: Clock,
      title: 'Business Hours',
      content: 'Mon - Sat: 9:00 AM - 6:00 PM',
      link: null,
      gradient: 'from-orange-500 to-red-500'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  return (
    <>
      <SEOHead
        title="Contact Us - VaranasiHub | Get Support & Business Inquiries"
        description="Contact VaranasiHub for support, questions, or business inquiries. Email: info@varanasihub.com | Phone: +91 9305715031 | Located in Varanasi, Uttar Pradesh. We're here 24/7 to help you create your online presence."
        image="/og-image.jpg"
        url={`${getOrigin()}/contact`}
        keywords="contact VaranasiHub, VaranasiHub support, business inquiry Varanasi, website help Varanasi, customer support"
        breadcrumbs={[
          { name: 'Home', path: '/', url: '/' },
          { name: 'Contact', path: '/contact', url: '/contact' }
        ]}
        faqItems={[
          {
            question: 'What are your business hours?',
            answer: 'Our support team is available 24/7 via email. For phone support, we\'re available Monday to Saturday, 9 AM to 6 PM IST.'
          },
          {
            question: 'How quickly will you respond?',
            answer: 'We typically respond to emails within 2-4 hours during business hours. For urgent matters, please call us directly.'
          },
          {
            question: 'Do you offer in-person consultations?',
            answer: 'Yes, we offer in-person consultations for businesses in Varanasi. Contact us to schedule a meeting at your location or our office.'
          },
          {
            question: 'Can I visit your office?',
            answer: 'Yes, you can visit our office in Varanasi. Please contact us in advance to schedule an appointment.'
          }
        ]}
      />
      <Navbar />
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-white py-8 md:py-10 shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.15)]">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 mb-4 tracking-tight leading-tight" itemProp="name">
              Get In <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Touch</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto font-light">
              We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </motion.div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
          {/* Contact Info Cards */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.15)] py-8"
          >
            {contactInfo.map((info, index) => {
              const Icon = info.icon;
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05, y: -8 }}
                  className="bg-white rounded-2xl border-2 border-gray-200 p-6 text-center hover:border-blue-300 hover:shadow-xl transition-all duration-300 relative group overflow-hidden"
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${info.gradient} opacity-10 rounded-full blur-3xl -z-10 group-hover:opacity-20 transition-opacity duration-500`}></div>
                  <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${info.gradient} rounded-2xl mb-3 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{info.title}</h3>
                  {info.link ? (
                    <a
                      href={info.link}
                      className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
                    >
                      {info.content}
                    </a>
                  ) : (
                    <p className="text-gray-600 font-medium">{info.content}</p>
                  )}
                </motion.div>
              );
            })}
          </motion.div>

          {/* Contact Form and Map Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white rounded-3xl border border-gray-100 p-8 shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.15)]"
            >
              <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-6">Send us a Message</h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="relative">
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 pt-6 pb-2 border-2 rounded-xl focus:ring-2 transition-all duration-200 outline-none peer ${
                      errors.name 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                    placeholder=" "
                  />
                  <label htmlFor="name" className={`absolute left-4 top-2 text-xs font-semibold transition-colors ${
                    errors.name ? 'text-red-600' : 'text-gray-500 peer-focus:text-blue-600'
                  }`}>
                    Your Name
                  </label>
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div className="relative">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 pt-6 pb-2 border-2 rounded-xl focus:ring-2 transition-all duration-200 outline-none peer ${
                      errors.email 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                    placeholder=" "
                  />
                  <label htmlFor="email" className={`absolute left-4 top-2 text-xs font-semibold transition-colors ${
                    errors.email ? 'text-red-600' : 'text-gray-500 peer-focus:text-blue-600'
                  }`}>
                    Email Address
                  </label>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                <div className="relative">
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 pt-6 pb-2 border-2 rounded-xl focus:ring-2 transition-all duration-200 outline-none peer ${
                      errors.subject 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                    placeholder=" "
                  />
                  <label htmlFor="subject" className={`absolute left-4 top-2 text-xs font-semibold transition-colors ${
                    errors.subject ? 'text-red-600' : 'text-gray-500 peer-focus:text-blue-600'
                  }`}>
                    Subject
                  </label>
                  {errors.subject && (
                    <p className="mt-1 text-sm text-red-600">{errors.subject}</p>
                  )}
                </div>

                <div className="relative">
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className={`w-full px-4 pt-6 pb-2 border-2 rounded-xl focus:ring-2 transition-all duration-200 outline-none resize-none peer ${
                      errors.message 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                    placeholder=" "
                  />
                  <label htmlFor="message" className={`absolute left-4 top-2 text-xs font-semibold transition-colors ${
                    errors.message ? 'text-red-600' : 'text-gray-500 peer-focus:text-blue-600'
                  }`}>
                    Message
                  </label>
                  {errors.message && (
                    <p className="mt-1 text-sm text-red-600">{errors.message}</p>
                  )}
                </div>

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send Message
                    </>
                  )}
                </motion.button>

                {submitStatus === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-50 border-2 border-green-200 text-green-800 px-4 py-3 rounded-xl font-medium"
                  >
                    Thank you! Your message has been sent successfully.
                  </motion.div>
                )}
                {submitStatus === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border-2 border-red-200 text-red-800 px-4 py-3 rounded-xl font-medium"
                  >
                    Failed to send message. Please try again.
                  </motion.div>
                )}
              </form>
            </motion.div>

            {/* Map/Additional Info */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-6"
            >
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.15)]">
                <h2 className="text-3xl font-black text-gray-900 mb-6 tracking-tight">Find Us</h2>
                <div className="bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl h-64 flex items-center justify-center mb-6">
                  <MapPin className="w-16 h-16 text-gray-400" />
                </div>
                <div className="space-y-4 text-gray-600">
                  <p className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                    <span className="font-medium">Varanasi, Uttar Pradesh, India</span>
                  </p>
                  <p className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                    <span className="font-medium">info@varanasihub.com</span>
                  </p>
                  <p className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                    <span className="font-medium">+91 9305715031</span>
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 relative overflow-hidden shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.15)]">
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Need Immediate Assistance?</h3>
                  <p className="mb-6 text-gray-600 leading-relaxed">
                    Our support team is available during business hours to help you with any questions or concerns.
                  </p>
                  <a
                    href="mailto:support@varanasihub.com"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <Mail className="w-5 h-5" />
                    Contact Support
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Contact;
