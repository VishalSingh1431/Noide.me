import { Link } from 'react-router-dom';
import { MessageCircle, Facebook, Instagram, Mail, Phone, MapPin, Zap, Globe, Shield, Rocket, ArrowRight } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'Businesses', path: '/businesses' },
    { name: 'Create Website', path: '/create-website' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' }
  ];

  const legalLinks = [
    { name: 'Privacy Policy', path: '/privacy' },
    { name: 'Terms of Service', path: '/terms' }
  ];

  const features = [
    { icon: Zap, text: 'Instant Setup' },
    { icon: Globe, text: 'Domain & Hosting' },
    { icon: Shield, text: 'Secure & Fast' },
    { icon: Rocket, text: 'Mobile Ready' }
  ];

  const socialLinks = [
    { icon: MessageCircle, name: 'WhatsApp', url: 'https://wa.me/919305715031', color: 'hover:from-green-500 hover:to-green-600' },
    { icon: Facebook, name: 'Facebook', url: 'https://facebook.com', color: 'hover:from-blue-500 hover:to-blue-600' },
    { icon: Instagram, name: 'Instagram', url: 'https://instagram.com', color: 'hover:from-pink-500 hover:to-purple-600' }
  ];

  return (
    <footer className="bg-white text-gray-900 border-t-2 border-gray-200 shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.1)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="mb-6">
              <h3 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent tracking-tight mb-4">
                VaranasiHub
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                Empowering Varanasi businesses with stunning websites. Create your online presence in minutes.
              </p>
            </div>
            
            {/* Features */}
            <div className="space-y-2 mb-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                    <Icon className="w-4 h-4 text-blue-600" />
                    <span>{feature.text}</span>
                  </div>
                );
              })}
            </div>

            {/* Social Links */}
            <div className="flex space-x-3">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gradient-to-br ${social.color} hover:text-white transition-all duration-300 border border-gray-200 hover:border-transparent hover:scale-110 shadow-md hover:shadow-lg`}
                    aria-label={social.name}
                  >
                    <Icon className="w-5 h-5 text-gray-700 transition-colors" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-gray-900 font-bold text-base mb-4 tracking-tight flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-blue-600" />
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.path}
                    className="hover:text-blue-600 transition-all duration-300 text-gray-600 hover:translate-x-1 inline-block text-sm font-medium"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-gray-900 font-bold text-base mb-4 tracking-tight flex items-center gap-2">
              <Phone className="w-4 h-4 text-blue-600" />
              Contact
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-gray-600">
                <Phone className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <a href="tel:+919305715031" className="hover:text-blue-600 transition-colors">
                  +91 93057 15031
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-600">
                <Mail className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <a href="mailto:info@varansihub.com" className="hover:text-blue-600 transition-colors break-all">
                  info@varansihub.com
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>Varanasi, Uttar Pradesh, India</span>
              </li>
            </ul>
          </div>

          {/* Legal & CTA */}
          <div>
            <h4 className="text-gray-900 font-bold text-base mb-4 tracking-tight flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600" />
              Legal
            </h4>
            <ul className="space-y-2.5 mb-6">
              {legalLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.path}
                    className="hover:text-blue-600 transition-all duration-300 text-gray-600 hover:translate-x-1 inline-block text-sm font-medium"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              to="/create-website"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-sm shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 group"
            >
              Create Your Website
              <Rocket className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              © {currentYear} <span className="font-semibold text-gray-700">VaranasiHub</span>. All rights reserved.
            </p>
            <p className="text-gray-500 text-sm">
              Made with ❤️ for Varanasi businesses
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
