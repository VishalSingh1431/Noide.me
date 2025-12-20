import { motion } from 'framer-motion';
import { FileText, Shield, Lock, AlertCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Terms = () => {
  const sections = [
    {
      icon: FileText,
      title: 'Acceptance of Terms',
      content: 'By accessing and using VaranasiHub, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.'
    },
    {
      icon: Shield,
      title: 'Service Description',
      content: 'VaranasiHub provides website creation and hosting services for businesses in Varanasi. We offer various plans with different features and pricing. All services are subject to availability and our terms of service.'
    },
    {
      icon: Lock,
      title: 'User Responsibilities',
      content: 'Users are responsible for maintaining the confidentiality of their account information and for all activities that occur under their account. You agree to provide accurate, current, and complete information during registration.'
    },
    {
      icon: AlertCircle,
      title: 'Payment and Billing',
      content: 'All fees are charged on a monthly basis unless otherwise stated. Payments are due in advance. We reserve the right to change our pricing with 30 days notice. Refunds are available within 30 days of initial purchase if you are not satisfied.'
    },
    {
      icon: Shield,
      title: 'Intellectual Property',
      content: 'All content, features, and functionality of VaranasiHub are owned by us or our licensors. You may not copy, modify, distribute, or create derivative works without our express written permission.'
    },
    {
      icon: Lock,
      title: 'Limitation of Liability',
      content: 'VaranasiHub shall not be liable for any indirect, incidental, special, or consequential damages resulting from the use or inability to use our services. Our total liability shall not exceed the amount paid by you in the past 12 months.'
    }
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16 md:py-24"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              Terms of Service
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
              Please read these terms carefully before using our services.
            </p>
          </div>
        </motion.div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl shadow-xl p-8 md:p-12"
          >
            <div className="mb-8 text-gray-600">
              <p className="mb-4">
                <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-IN', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
              <p>
                These Terms of Service ("Terms") govern your access to and use of VaranasiHub's 
                website and services. By using our services, you agree to be bound by these Terms.
              </p>
            </div>

            <div className="space-y-8">
              {sections.map((section, index) => {
                const Icon = section.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="border-l-4 border-blue-600 pl-6"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Icon className="w-6 h-6 text-blue-600" />
                      <h2 className="text-2xl font-bold text-gray-800">{section.title}</h2>
                    </div>
                    <p className="text-gray-600 leading-relaxed">{section.content}</p>
                  </motion.div>
                );
              })}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="mt-12 p-6 bg-blue-50 rounded-lg border border-blue-200"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-3">Contact Us</h3>
              <p className="text-gray-600 mb-2">
                If you have any questions about these Terms, please contact us at:
              </p>
              <p className="text-blue-600">
                Email: legal@varanasihub.com
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Terms;

