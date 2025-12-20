import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowLeft, Share2, User } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { SEOHead } from '../components/SEOHead';
import { getOrigin } from '../utils/urlHelper';

// Placeholder blog post data
// In production, this would come from an API based on slug
const blogPostData = {
  'how-to-create-website-for-varanasi-business': {
    title: 'How to Create a Website for Your Varanasi Business in 2024',
    excerpt: 'Step-by-step guide to creating a professional website for your Varanasi business.',
    content: `
      <p>Creating a website for your Varanasi business has never been easier. In this comprehensive guide, we'll walk you through the entire process step by step.</p>
      
      <h2>Why Your Business Needs a Website</h2>
      <p>In today's digital age, having an online presence is crucial for any business. A website helps you:</p>
      <ul>
        <li>Reach more customers who search online</li>
        <li>Build credibility and trust</li>
        <li>Showcase your products and services 24/7</li>
        <li>Make it easy for customers to contact you</li>
      </ul>

      <h2>Getting Started with VaranasiHub</h2>
      <p>Creating your website with VaranasiHub is simple and takes just minutes:</p>
      <ol>
        <li>Sign up for a free account</li>
        <li>Fill in your business details</li>
        <li>Add photos and information</li>
        <li>Your website goes live instantly!</li>
      </ol>

      <h2>What to Include on Your Website</h2>
      <p>Make sure your website includes:</p>
      <ul>
        <li>Business name and description</li>
        <li>Contact information (phone, WhatsApp, address)</li>
        <li>High-quality photos of your business</li>
        <li>Business hours</li>
        <li>Location with Google Maps</li>
      </ul>

      <h2>Tips for Success</h2>
      <p>To make your website effective:</p>
      <ul>
        <li>Use clear, high-quality photos</li>
        <li>Write a compelling description</li>
        <li>Keep your information up to date</li>
        <li>Share your website link on social media</li>
      </ul>

      <h2>Conclusion</h2>
      <p>Creating a website for your Varanasi business is now easier than ever. With VaranasiHub, you can have a professional website online in minutes, helping you reach more customers and grow your business.</p>
    `,
    author: 'VaranasiHub Team',
    date: '2024-01-15',
    readTime: '5 min read',
    category: 'Guide',
    image: '/images/Home page Silder 1.jpg'
  }
};

const BlogPost = () => {
  const { slug } = useParams();
  const post = blogPostData[slug] || blogPostData['how-to-create-website-for-varanasi-business'];

  const faqItems = [
    {
      question: 'How long does it take to create a website?',
      answer: 'With VaranasiHub, you can create your website in just minutes. Simply fill in your business details and your website goes live instantly.'
    },
    {
      question: 'Do I need technical skills?',
      answer: 'No technical skills needed! Our platform is designed for business owners with zero coding knowledge.'
    }
  ];

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.excerpt,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <>
      <SEOHead
        title={`${post.title} | VaranasiHub Blog`}
        description={post.excerpt}
        image={post.image}
        url={`${getOrigin()}/blog/${slug}`}
        type="article"
        publishedTime={post.date}
        modifiedTime={post.date}
        author={post.author}
        faqItems={faqItems}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Blog', path: '/blog' },
          { name: post.title, path: `/blog/${slug}` }
        ]}
      />
      <Navbar />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30">
        {/* Article Header */}
        <article className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Link>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="mb-6">
                <span className="px-4 py-2 bg-blue-100 text-blue-600 rounded-full font-semibold text-sm">
                  {post.category}
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 mb-6">
                {post.title}
              </h1>

              <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-8">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  <span className="font-semibold">{post.author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span>{new Date(post.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>{post.readTime}</span>
                </div>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                  Share
                </button>
              </div>

              <div className="aspect-video rounded-2xl overflow-hidden mb-8 shadow-xl">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Article Content */}
              <div
                className="prose prose-lg max-w-none bg-white rounded-2xl p-8 md:p-12 shadow-lg"
                dangerouslySetInnerHTML={{ __html: post.content }}
                style={{
                  lineHeight: '1.8',
                  fontSize: '1.125rem'
                }}
              />
            </motion.div>
          </div>
        </article>

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
                Put what you learned into practice and create your professional website today!
              </p>
              <Link
                to="/create-website"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Get Started Free
              </Link>
            </motion.div>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
};

export default BlogPost;


