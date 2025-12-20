import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowRight, Search } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { SEOHead } from '../components/SEOHead';
import { getOrigin } from '../utils/urlHelper';

// Placeholder blog posts data
// In production, this would come from an API
const blogPosts = [
  {
    id: 1,
    slug: 'how-to-create-website-for-varanasi-business',
    title: 'How to Create a Website for Your Varanasi Business in 2024',
    excerpt: 'Step-by-step guide to creating a professional website for your Varanasi business. Learn how to get online in minutes without any technical skills.',
    image: '/images/Home page Silder 1.jpg',
    author: 'VaranasiHub Team',
    date: '2024-01-15',
    readTime: '5 min read',
    category: 'Guide'
  },
  {
    id: 2,
    slug: 'top-features-every-varanasi-business-website-needs',
    title: 'Top 10 Features Every Varanasi Business Website Needs',
    excerpt: 'Discover the essential features that will help your Varanasi business website attract customers and drive sales.',
    image: '/images/Home page Silder 2.jpg',
    author: 'VaranasiHub Team',
    date: '2024-01-10',
    readTime: '7 min read',
    category: 'Tips'
  },
  {
    id: 3,
    slug: 'why-your-varanasi-business-needs-website',
    title: 'Why Your Varanasi Business Needs a Website in 2024',
    excerpt: 'Learn why having an online presence is crucial for Varanasi businesses and how it can help you reach more customers.',
    image: '/images/Home page Silder 1.jpg',
    author: 'VaranasiHub Team',
    date: '2024-01-05',
    readTime: '6 min read',
    category: 'Business'
  },
  {
    id: 4,
    slug: 'digital-marketing-tips-varanasi-businesses',
    title: 'Digital Marketing Tips for Varanasi Businesses',
    excerpt: 'Simple and effective digital marketing strategies that Varanasi businesses can use to grow their online presence.',
    image: '/images/Home page Silder 2.jpg',
    author: 'VaranasiHub Team',
    date: '2024-01-01',
    readTime: '8 min read',
    category: 'Marketing'
  }
];

const Blog = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPosts, setFilteredPosts] = useState(blogPosts);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Guide', 'Tips', 'Business', 'Marketing'];

  useEffect(() => {
    let filtered = blogPosts;

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(post => post.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredPosts(filtered);
  }, [searchQuery, selectedCategory]);

  const faqItems = [
    {
      question: 'How often do you publish new blog posts?',
      answer: 'We publish new blog posts regularly with helpful tips, guides, and insights for Varanasi businesses. Check back often for the latest content!'
    },
    {
      question: 'Can I suggest a blog topic?',
      answer: 'Absolutely! We love hearing from our community. Contact us with your topic suggestions and we\'ll consider them for future posts.'
    },
    {
      question: 'Are the blog posts free to read?',
      answer: 'Yes! All our blog content is completely free to read. We want to help Varanasi businesses succeed online.'
    }
  ];

  return (
    <>
      <SEOHead
        title="Blog - VaranasiHub | Tips, Guides & Insights for Varanasi Businesses"
        description="Read helpful guides, tips, and insights for Varanasi businesses. Learn how to create websites, grow your online presence, and reach more customers."
        keywords="Varanasi business blog, website tips, business guides, digital marketing Varanasi, online presence tips"
        url={`${getOrigin()}/blog`}
        faqItems={faqItems}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Blog', path: '/blog' }
        ]}
      />
      <Navbar />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30">
        {/* Hero Section */}
        <section className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 mb-4">
                VaranasiHub <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Blog</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                Tips, guides, and insights to help your Varanasi business succeed online
              </p>
            </motion.div>

            {/* Search and Filter */}
            <div className="max-w-4xl mx-auto mb-12">
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search blog posts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                          selectedCategory === category
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Blog Posts Grid */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {filteredPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPosts.map((post, index) => (
                  <motion.article
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
                  >
                    <Link to={`/blog/${post.slug}`}>
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-6">
                        <div className="flex items-center gap-4 mb-3 text-sm text-gray-500">
                          <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full font-semibold">
                            {post.category}
                          </span>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(post.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </div>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3 hover:text-blue-600 transition-colors">
                          {post.title}
                        </h2>
                        <p className="text-gray-600 mb-4 line-clamp-3">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Clock className="w-4 h-4" />
                            {post.readTime}
                          </div>
                          <div className="flex items-center gap-2 text-blue-600 font-semibold">
                            Read More
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.article>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-xl text-gray-600">No blog posts found matching your criteria.</p>
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-white"
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Ready to Create Your Website?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Put these tips into practice and create your professional website today!
              </p>
              <Link
                to="/create-website"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </motion.div>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
};

export default Blog;


