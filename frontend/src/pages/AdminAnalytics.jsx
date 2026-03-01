import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Phone, MessageCircle, Image, MapPin, Users, TrendingUp, ArrowLeft, Loader2, Calendar, FileText } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { businessAPI } from '../config/api';

const AdminAnalytics = () => {
    const [data, setData] = useState(null);
    const [businesses, setBusinesses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ total: 0, pages: 0 });

    const fetchAllAnalytics = async (pageNumber = 1, append = false) => {
        try {
            if (append) setLoadingMore(true);
            else setLoading(true);

            const response = await businessAPI.getAllAnalytics(pageNumber, 100);

            if (append) {
                setBusinesses(prev => [...prev, ...response.businesses]);
            } else {
                setData(response);
                setBusinesses(response.businesses);
            }

            setPagination(response.pagination);
            setError(null);
        } catch (err) {
            console.error('Error fetching admin analytics:', err);
            setError(err.message || 'Failed to load analytics');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        fetchAllAnalytics(1, false);
    }, []);

    const loadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchAllAnalytics(nextPage, true);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex items-center justify-center h-[60vh]">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                </div>
                <Footer />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="max-w-7xl mx-auto px-4 py-12">
                    <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
                        <p className="text-red-600 font-semibold">{error}</p>
                        <Link to="/profile" className="mt-4 inline-block text-blue-600 hover:text-blue-700 font-bold">
                            ← Back to Profile
                        </Link>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    const totals = data.totals;

    // Prepare chart data for top 10 businesses by interactions
    const chartData = businesses
        .sort((a, b) => b.totalInteractions - a.totalInteractions)
        .slice(0, 10)
        .map(b => ({
            name: b.businessName,
            'Visitors': b.visitor_count,
            'Interactions': b.totalInteractions,
            'Calls': b.call_clicks,
            'WhatsApp': b.whatsapp_clicks
        }));

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        to="/profile"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Admin Profile
                    </Link>
                    <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-200">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                                    <BarChart3 className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">Overall Platform Analytics</h1>
                                    <p className="text-gray-600">Aggregated performance across all {businesses.length} businesses</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 px-4 py-2 bg-purple-50 rounded-xl border border-purple-100">
                                <Shield className="w-5 h-5 text-purple-600" />
                                <span className="font-bold text-purple-700 uppercase text-xs tracking-wider">Admin View</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Global Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                    <StatCard title="Total Visitors" value={totals.totalVisitors} icon={<Users className="w-5 h-5 text-blue-600" />} color="blue" />
                    <StatCard title="Call Clicks" value={totals.totalCallClicks} icon={<Phone className="w-5 h-5 text-green-600" />} color="green" />
                    <StatCard title="WhatsApp" value={totals.totalWhatsAppClicks} icon={<MessageCircle className="w-5 h-5 text-emerald-600" />} color="emerald" />
                    <StatCard title="Gallery Views" value={totals.totalGalleryViews} icon={<Image className="w-5 h-5 text-purple-600" />} color="purple" />
                    <StatCard title="Map Clicks" value={totals.totalMapClicks} icon={<MapPin className="w-5 h-5 text-red-600" />} color="red" />
                    <StatCard title="Total Engagement" value={totals.totalInteractions} icon={<TrendingUp className="w-5 h-5 text-indigo-600" />} color="indigo" />
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Top 10 Businesses Chart */}
                    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <TrendingUp className="w-6 h-6 text-blue-600" />
                            Top 10 Businesses by Engagement
                        </h3>
                        <div className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} layout="vertical" margin={{ left: 40, right: 30 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        stroke="#4b5563"
                                        fontSize={12}
                                        width={100}
                                        tickFormatter={(value) => value.length > 15 ? value.substring(0, 15) + '...' : value}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#f3f4f6' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px rgba(0,0,0,0.1)' }}
                                    />
                                    <Bar dataKey="Interactions" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Engagement Breakdown */}
                    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <BarChart3 className="w-6 h-6 text-purple-600" />
                            Metric Distribution
                        </h3>
                        <div className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={[{
                                    name: 'Distribution',
                                    'Calls': totals.totalCallClicks,
                                    'WhatsApp': totals.totalWhatsAppClicks,
                                    'Gallery': totals.totalGalleryViews,
                                    'Maps': totals.totalMapClicks,
                                    'Inquiry': totals.totalInquiryClicks || 0
                                }]}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" hide />
                                    <YAxis />
                                    <Tooltip contentStyle={{ borderRadius: '12px' }} />
                                    <Legend />
                                    <Bar dataKey="Calls" fill="#3b82f6" />
                                    <Bar dataKey="WhatsApp" fill="#10b981" />
                                    <Bar dataKey="Gallery" fill="#8b5cf6" />
                                    <Bar dataKey="Maps" fill="#ef4444" />
                                    <Bar dataKey="Inquiry" fill="#f59e0b" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Business List Table */}
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-900 font-mono">ALL BUSINESSES PERFORMANCE</h3>
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-black uppercase tracking-widest">{businesses.length} LISTINGS</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-100/50">
                                    <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest border-b">Business</th>
                                    <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest border-b text-center">Visitors</th>
                                    <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest border-b text-center">Interactions</th>
                                    <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest border-b text-center">Conversion</th>
                                    <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest border-b text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {businesses.map((b) => (
                                    <tr key={b.businessId} className="hover:bg-blue-50/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{b.businessName}</div>
                                            <div className="text-xs text-gray-500">ID: #{b.businessId}</div>
                                        </td>
                                        <td className="px-6 py-4 text-center font-bold text-blue-600">{b.visitor_count.toLocaleString('en-IN')}</td>
                                        <td className="px-6 py-4 text-center font-bold text-indigo-600">{b.totalInteractions.toLocaleString('en-IN')}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-black text-xs">
                                                {b.visitor_count > 0 ? ((b.totalInteractions / b.visitor_count) * 100).toFixed(1) : 0}%
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <Link
                                                to={`/analytics/${b.businessId}`}
                                                className="inline-flex items-center gap-1 text-purple-600 hover:text-purple-700 font-bold text-sm"
                                            >
                                                <BarChart3 className="w-4 h-4" />
                                                Details
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination / Load More */}
                    {page < pagination.pages && (
                        <div className="p-8 bg-gray-50 border-t border-gray-200 flex justify-center">
                            <button
                                onClick={loadMore}
                                disabled={loadingMore}
                                className="px-8 py-3 bg-white border-2 border-blue-600 text-blue-600 font-black rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center gap-2"
                            >
                                {loadingMore ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        LOADING MORE...
                                    </>
                                ) : (
                                    <>
                                        LOAD MORE BUSINESSES
                                        <span className="text-[10px] ml-2 px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full">
                                            {businesses.length} / {pagination.total}
                                        </span>
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
};

const StatCard = ({ title, value, icon, color }) => {
    const colors = {
        blue: 'border-blue-200 bg-blue-50/30',
        green: 'border-green-200 bg-green-50/30',
        emerald: 'border-emerald-200 bg-emerald-50/30',
        purple: 'border-purple-200 bg-purple-50/30',
        red: 'border-red-200 bg-red-50/30',
        indigo: 'border-indigo-200 bg-indigo-50/30',
    };

    return (
        <div className={`rounded-xl p-4 border-2 shadow-sm hover:shadow-md transition-all ${colors[color]}`}>
            <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-white rounded-lg shadow-sm">{icon}</div>
            </div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{title}</p>
            <p className="text-xl font-black text-gray-900">{value.toLocaleString('en-IN')}</p>
        </div>
    );
};

// Re-using shield icon
const Shield = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
);

export default AdminAnalytics;
