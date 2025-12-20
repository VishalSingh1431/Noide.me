import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BarChart3, Phone, MessageCircle, Image, MapPin, Users, TrendingUp, ArrowLeft, Loader2, Calendar } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { analyticsAPI } from '../config/api';

const Analytics = () => {
  const { businessId } = useParams();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('all'); // 'week', 'month', 'all'

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await analyticsAPI.getAnalytics(businessId, period);
        setAnalytics(response);
        setError(null);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError(err.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    if (businessId) {
      fetchAnalytics();
    }
  }, [businessId, period]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 py-8 md:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center h-96">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 py-8 md:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
              <p className="text-red-600 font-semibold">{error}</p>
              <Link to="/profile" className="mt-4 inline-block text-blue-600 hover:text-blue-700">
                ← Back to Profile
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!analytics || !analytics.analytics) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 py-8 md:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 text-center">
              <p className="text-yellow-600 font-semibold">No analytics data available yet.</p>
              <Link to="/profile" className="mt-4 inline-block text-blue-600 hover:text-blue-700">
                ← Back to Profile
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const stats = analytics.analytics;
  const breakdown = stats.breakdown || {};
  const maxValue = Math.max(
    stats.visitorCount,
    stats.callClicks,
    stats.whatsappClicks,
    stats.galleryViews,
    stats.mapClicks
  ) || 1;

  // Prepare chart data from breakdown (Indian format)
  const chartData = Object.keys(breakdown).sort().map(date => {
    const dayData = breakdown[date];
    const dateObj = new Date(date);
    let formattedDate;
    if (period === 'all') {
      formattedDate = dateObj.toLocaleDateString('en-IN', { 
        day: 'numeric',
        month: 'short', 
        year: 'numeric'
      });
    } else {
      formattedDate = dateObj.toLocaleDateString('en-IN', { 
        day: 'numeric',
        month: 'short'
      });
    }
    return {
      date: formattedDate,
      Visitors: dayData.visitor || 0,
      'Call Clicks': dayData.call_click || 0,
      'WhatsApp Clicks': dayData.whatsapp_click || 0,
      'Gallery Views': dayData.gallery_view || 0,
      'Map Clicks': dayData.map_click || 0,
    };
  });

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 py-4 sm:py-6 md:py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <Link 
              to="/profile" 
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-3 sm:mb-4 transition-colors text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Back to Profile</span>
            </Link>
            <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 border border-gray-200">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 lg:gap-6">
                <div className="flex items-center gap-3 sm:gap-4 w-full lg:w-auto">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                    <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 truncate">Analytics Dashboard</h1>
                    <p className="text-sm sm:text-base text-gray-600 mt-1 truncate">{analytics.businessName}</p>
                  </div>
                </div>
                {/* Period Selector */}
                <div className="flex items-center gap-1.5 sm:gap-2 bg-gray-100 rounded-xl p-1 w-full lg:w-auto justify-center lg:justify-start">
                  <button
                    onClick={() => setPeriod('week')}
                    className={`flex-1 lg:flex-none px-3 sm:px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all ${
                      period === 'week'
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                    <span className="hidden sm:inline">Weekly</span>
                    <span className="sm:hidden">Week</span>
                  </button>
                  <button
                    onClick={() => setPeriod('month')}
                    className={`flex-1 lg:flex-none px-3 sm:px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all ${
                      period === 'month'
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                    <span className="hidden sm:inline">Monthly</span>
                    <span className="sm:hidden">Month</span>
                  </button>
                  <button
                    onClick={() => setPeriod('all')}
                    className={`flex-1 lg:flex-none px-3 sm:px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all ${
                      period === 'all'
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                    <span className="hidden sm:inline">All Time</span>
                    <span className="sm:hidden">All</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Cards - Above Charts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Total Visitors */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-600 mb-1">Total Visitors</h3>
              <p className="text-3xl font-bold text-gray-900">{stats.visitorCount.toLocaleString()}</p>
            </div>

            {/* Total Interactions */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-purple-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-600 mb-1">Total Interactions</h3>
              <p className="text-3xl font-bold text-gray-900">{stats.totalInteractions.toLocaleString()}</p>
            </div>

            {/* Conversion Rate */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-2xl">📈</span>
              </div>
              <h3 className="text-sm font-semibold text-gray-600 mb-1">Engagement Rate</h3>
              <p className="text-3xl font-bold text-gray-900">
                {stats.visitorCount > 0 
                  ? ((stats.totalInteractions / stats.visitorCount) * 100).toFixed(1)
                  : '0'
                }%
              </p>
            </div>
          </div>

          {/* Detailed Metrics */}
          <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 border border-gray-200 mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Detailed Metrics</h2>
            
            <div className="space-y-4 sm:space-y-6">
              {/* Call Clicks */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 mb-2">
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm sm:text-base font-semibold text-gray-900">Call Clicks</h3>
                      <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Number of times visitors clicked the call button</p>
                    </div>
                  </div>
                  <span className="text-xl sm:text-2xl font-bold text-blue-600 flex-shrink-0">{stats.callClicks.toLocaleString('en-IN')}</span>
                </div>
                <p className="text-xs text-gray-600 sm:hidden mb-2">Number of times visitors clicked the call button</p>
                <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
                  <div 
                    className="bg-blue-600 h-2 sm:h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(stats.callClicks / maxValue) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* WhatsApp Clicks */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 mb-2">
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm sm:text-base font-semibold text-gray-900">WhatsApp Clicks</h3>
                      <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Number of times visitors clicked the WhatsApp button</p>
                    </div>
                  </div>
                  <span className="text-xl sm:text-2xl font-bold text-green-600 flex-shrink-0">{stats.whatsappClicks.toLocaleString('en-IN')}</span>
                </div>
                <p className="text-xs text-gray-600 sm:hidden mb-2">Number of times visitors clicked the WhatsApp button</p>
                <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
                  <div 
                    className="bg-green-600 h-2 sm:h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(stats.whatsappClicks / maxValue) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Gallery Views */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 mb-2">
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Image className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm sm:text-base font-semibold text-gray-900">Gallery Views</h3>
                      <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Number of times visitors viewed the gallery section</p>
                    </div>
                  </div>
                  <span className="text-xl sm:text-2xl font-bold text-purple-600 flex-shrink-0">{stats.galleryViews.toLocaleString('en-IN')}</span>
                </div>
                <p className="text-xs text-gray-600 sm:hidden mb-2">Number of times visitors viewed the gallery section</p>
                <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
                  <div 
                    className="bg-purple-600 h-2 sm:h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(stats.galleryViews / maxValue) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Map Clicks */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 mb-2">
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm sm:text-base font-semibold text-gray-900">Map Clicks</h3>
                      <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Number of times visitors clicked on the map</p>
                    </div>
                  </div>
                  <span className="text-xl sm:text-2xl font-bold text-red-600 flex-shrink-0">{stats.mapClicks.toLocaleString('en-IN')}</span>
                </div>
                <p className="text-xs text-gray-600 sm:hidden mb-2">Number of times visitors clicked on the map</p>
                <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
                  <div 
                    className="bg-red-600 h-2 sm:h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(stats.mapClicks / maxValue) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Time-Based Charts - Prominent Display Like Sharing Apps */}
          {chartData.length > 0 ? (
            <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
              {/* Visitor Trends - Large Line Chart */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 border-2 border-blue-200">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-6">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                      📊 Visitor Analytics
                    </h2>
                    <p className="text-sm sm:text-base text-gray-600">
                      {period === 'week' ? 'Last 7 Days' : period === 'month' ? 'Last 30 Days' : 'All Time'} Performance
                    </p>
                  </div>
                  <div className="text-left sm:text-right flex-shrink-0">
                    <p className="text-2xl sm:text-3xl font-bold text-blue-600">{stats.visitorCount.toLocaleString('en-IN')}</p>
                    <p className="text-xs sm:text-sm text-gray-600">Total Visitors</p>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-3 sm:p-4 shadow-lg overflow-x-auto">
                  <div className="min-w-[300px]">
                    <ResponsiveContainer width="100%" height={280} className="sm:h-[350px]">
                    <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#6b7280"
                        style={{ fontSize: '12px', fontWeight: '600' }}
                      />
                      <YAxis 
                        stroke="#6b7280"
                        style={{ fontSize: '12px', fontWeight: '600' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          border: '2px solid #3b82f6',
                          borderRadius: '12px',
                          boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Legend 
                        wrapperStyle={{ paddingTop: '20px' }}
                        iconType="line"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="Visitors" 
                        stroke="#3b82f6" 
                        strokeWidth={3} 
                        dot={{ r: 6, fill: '#3b82f6' }}
                        activeDot={{ r: 8, fill: '#2563eb' }}
                        name="Visitors"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Interaction Trends - Large Bar Chart */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 border-2 border-purple-200">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-6">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                      🎯 Interaction Analytics
                    </h2>
                    <p className="text-sm sm:text-base text-gray-600">
                      User Engagement Breakdown
                    </p>
                  </div>
                  <div className="text-left sm:text-right flex-shrink-0">
                    <p className="text-2xl sm:text-3xl font-bold text-purple-600">{stats.totalInteractions.toLocaleString('en-IN')}</p>
                    <p className="text-xs sm:text-sm text-gray-600">Total Interactions</p>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-3 sm:p-4 shadow-lg overflow-x-auto">
                  <div className="min-w-[300px]">
                    <ResponsiveContainer width="100%" height={280} className="sm:h-[350px]">
                    <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#6b7280"
                        style={{ fontSize: '12px', fontWeight: '600' }}
                      />
                      <YAxis 
                        stroke="#6b7280"
                        style={{ fontSize: '12px', fontWeight: '600' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          border: '2px solid #8b5cf6',
                          borderRadius: '12px',
                          boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Legend 
                        wrapperStyle={{ paddingTop: '20px' }}
                      />
                      <Bar dataKey="Call Clicks" fill="#3b82f6" radius={[8, 8, 0, 0]} name="📞 Call Clicks" />
                      <Bar dataKey="WhatsApp Clicks" fill="#10b981" radius={[8, 8, 0, 0]} name="💬 WhatsApp Clicks" />
                      <Bar dataKey="Gallery Views" fill="#8b5cf6" radius={[8, 8, 0, 0]} name="🖼️ Gallery Views" />
                      <Bar dataKey="Map Clicks" fill="#ef4444" radius={[8, 8, 0, 0]} name="📍 Map Clicks" />
                    </BarChart>
                  </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Mini Stats Cards for Quick View */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white rounded-xl p-3 sm:p-4 shadow-lg border-2 border-blue-200 hover:shadow-xl transition-shadow">
                  <div className="text-xl sm:text-2xl font-bold text-blue-600 break-words">{stats.callClicks.toLocaleString('en-IN')}</div>
                  <div className="text-xs sm:text-sm text-gray-600 mt-1">📞 Calls</div>
                </div>
                <div className="bg-white rounded-xl p-3 sm:p-4 shadow-lg border-2 border-green-200 hover:shadow-xl transition-shadow">
                  <div className="text-xl sm:text-2xl font-bold text-green-600 break-words">{stats.whatsappClicks.toLocaleString('en-IN')}</div>
                  <div className="text-xs sm:text-sm text-gray-600 mt-1">💬 WhatsApp</div>
                </div>
                <div className="bg-white rounded-xl p-3 sm:p-4 shadow-lg border-2 border-purple-200 hover:shadow-xl transition-shadow">
                  <div className="text-xl sm:text-2xl font-bold text-purple-600 break-words">{stats.galleryViews.toLocaleString('en-IN')}</div>
                  <div className="text-xs sm:text-sm text-gray-600 mt-1">🖼️ Gallery</div>
                </div>
                <div className="bg-white rounded-xl p-3 sm:p-4 shadow-lg border-2 border-red-200 hover:shadow-xl transition-shadow">
                  <div className="text-xl sm:text-2xl font-bold text-red-600 break-words">{stats.mapClicks.toLocaleString('en-IN')}</div>
                  <div className="text-xs sm:text-sm text-gray-600 mt-1">📍 Maps</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 sm:p-8 text-center mb-6 sm:mb-8">
              <p className="text-yellow-600 font-semibold text-base sm:text-lg">
                📈 No chart data available for the selected period. Data will appear as visitors interact with your website.
              </p>
            </div>
          )}

          {/* Last Updated */}
          {stats.overall?.lastUpdated && (
            <div className="bg-gray-50 rounded-xl p-3 sm:p-4 text-center">
              <p className="text-xs sm:text-sm text-gray-600">
                Last updated: {new Date(stats.overall.lastUpdated).toLocaleString('en-IN', { 
                  day: 'numeric',
                  month: 'short', 
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                })}
              </p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Analytics;
