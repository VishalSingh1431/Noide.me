import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { businessAPI } from '../config/api';
import Navbar from '../components/Navbar';

const WA_ICON = (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
);

// Format number for WhatsApp
const formatWhatsApp = (num) => {
    if (!num) return '';
    const digits = num.replace(/\D/g, '');
    if (digits.length === 10) return '91' + digits;
    if (digits.startsWith('91') && digits.length === 12) return digits;
    return digits;
};

const buildWaLink = (business) => {
    const phone = business.whatsapp || business.mobile;
    if (!phone) return '#';
    const cleaned = formatWhatsApp(phone);
    const url = business.subdomain_url || 'https://noida.me';
    const message = `Hello,

We are from the Noida.me team. We help local businesses build a simple online presence so customers can easily find them on the internet.

As part of this initiative, we have created a simple website for your business. You can view it here:

${url}

Currently, we are offering this service free for the first month so you can try it and share it with your customers.

If you would like to update any details or make changes to the website, feel free to reply to this message and our team will assist you.

Thank you.
— Team Noida.me
https://noida.me


नमस्ते,

हम Noida.me टीम से हैं। हम local businesses को online लाने में मदद कर रहे हैं ताकि लोग उन्हें इंटरनेट पर आसानी से ढूंढ सकें।

इसी पहल के तहत हमने आपके business के लिए एक simple website बनाई है। आप इसे यहाँ देख सकते हैं:

${url}

फिलहाल हम पहले महीने के लिए यह सेवा मुफ्त दे रहे हैं ताकि आप इसे आज़मा सकें और अपने ग्राहकों के साथ शेयर कर सकें।

यदि आप अपनी website में कोई जानकारी बदलना चाहते हैं, तो बेझिझक इस मैसेज का जवाब दें। हमारी टीम आपकी पूरी मदद करेगी।

धन्यवाद।
— टीम Noida.me
https://noida.me`;
    return `https://api.whatsapp.com/send?phone=${cleaned}&text=${encodeURIComponent(message)}`;
};

const validCategories = ['All', 'Shop', 'Restaurant', 'Hotel', 'Clinic', 'Library', 'Services', 'Temple', 'School', 'College', 'Gym', 'Salon', 'Spa', 'Pharmacy', 'Bank', 'Travel Agency', 'Real Estate', 'Law Firm', 'Accounting', 'IT Services', 'Photography', 'Event Management', 'Catering', 'Bakery', 'Jewelry', 'Fashion', 'Electronics', 'Furniture', 'Automobile', 'Repair Services', 'Education', 'Healthcare', 'Beauty', 'Fitness', 'Entertainment', 'Tourism', 'Food & Beverage', 'Retail', 'Wholesale', 'Manufacturing', 'Construction', 'Coaching Center', 'Hospital', 'Cafe', 'Dentist', 'Physiotherapist', 'Yoga Center', 'Dance Academy', 'Pet Shop', 'Veterinary', 'Car Repair', 'Bike Repair', 'Electrician', 'Plumber', 'Grocery Store', 'Supermarket', 'Sweet Shop', 'Clothing Store', 'Electronics Store', 'Mobile Shop', 'Jewellery Store', 'Optical Store', 'Book Store', 'Stationery Shop', 'Furniture Store', 'Hardware Store', 'Paint Store', 'Nursery', 'Florist', 'Laundry', 'Dry Cleaner', 'Tailor', 'Photographer', 'Caterer', 'Event Planner', 'Real Estate Agent', 'Lawyer', 'CA', 'Insurance Agent', 'ATM', 'Petrol Pump', 'Parking', 'Mosque', 'Church', 'Gurudwara', 'Park', 'Playground', 'Swimming Pool', 'Sports Complex', 'Other'];

// ─── Automation Panel ────────────────────────────────────────────────
function AutomationPanel() {
    const [serviceStatus, setServiceStatus] = useState('disconnected');
    const [workerRunning, setWorkerRunning] = useState(false);
    const [qrCode, setQrCode] = useState(null);
    const [log, setLog] = useState([]);
    const [stats, setStats] = useState({ totalSent: 0, sentToday: 0, dailyLimit: 30 });
    const [loading, setLoading] = useState(false);
    const [connecting, setConnecting] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const pollRef = useRef(null);
    const logRef = useRef(null);

    const refreshStatus = useCallback(async () => {
        try {
            const data = await businessAPI.waGetStatus();
            setServiceStatus(data.service?.status || 'disconnected');
            setWorkerRunning(data.worker?.isRunning || false);
            setLog(data.worker?.log || []);
            setStats({
                totalSent: data.worker?.totalSent || 0,
                sentToday: data.worker?.sentToday || 0,
                dailyLimit: data.worker?.dailyLimit || 30,
            });
        } catch { }
    }, []);

    const refreshQR = useCallback(async () => {
        try {
            const data = await businessAPI.waGetQR();
            if (data.qr) setQrCode(data.qr);
            else setQrCode(null);
        } catch { }
    }, []);

    useEffect(() => {
        refreshStatus();
        refreshQR();
        pollRef.current = setInterval(() => {
            refreshStatus();
            refreshQR();
        }, 3000);
        return () => clearInterval(pollRef.current);
    }, [refreshStatus, refreshQR]);

    useEffect(() => {
        if (logRef.current) {
            logRef.current.scrollTop = logRef.current.scrollHeight;
        }
    }, [log]);

    const handleConnect = async () => {
        setConnecting(true);
        try {
            await businessAPI.waConnect();
        } catch (e) {
            alert('Error: ' + e.message);
        } finally {
            setConnecting(false);
        }
    };

    const handleStart = async () => {
        setLoading(true);
        try {
            const res = await businessAPI.waStart(selectedCategory);
            if (!res.success) alert(res.message);
        } catch (e) {
            alert('Error: ' + e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleStop = async () => {
        setLoading(true);
        try {
            await businessAPI.waStop();
        } catch (e) {
            alert('Error: ' + e.message);
        } finally {
            setLoading(false);
        }
    };

    const statusColor = {
        connected: 'bg-green-500',
        qr_ready: 'bg-yellow-400',
        connecting: 'bg-blue-400',
        disconnected: 'bg-gray-400',
    }[serviceStatus] || 'bg-gray-400';

    const statusLabel = {
        connected: 'Connected',
        qr_ready: 'Scan QR Code',
        connecting: 'Connecting...',
        disconnected: 'Disconnected',
    }[serviceStatus] || 'Disconnected';

    const remainingToday = Math.max(0, stats.dailyLimit - stats.sentToday);

    return (
        <div className="mb-8 bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
            {/* Stats row */}
            <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100">
                <div className="px-5 py-4 text-center">
                    <p className="text-2xl font-bold text-gray-900">{stats.totalSent}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Total People Messaged</p>
                </div>
                <div className="px-5 py-4 text-center">
                    <p className="text-2xl font-bold text-[#25D366]">{stats.sentToday}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Sent Today</p>
                </div>
                <div className="px-5 py-4 text-center">
                    <p className="text-2xl font-bold text-orange-500">{remainingToday}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Remaining Today (of {stats.dailyLimit})</p>
                </div>
            </div>

            {/* Category Selector for Auto Send */}
            {serviceStatus === 'connected' && !workerRunning && (
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex flex-col sm:flex-row items-center gap-4">
                    <label className="text-sm font-semibold text-gray-700 whitespace-nowrap"> Target Category:</label>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="flex-1 min-w-[200px] border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#25D366] outline-none"
                    >
                        {validCategories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    <p className="text-xs text-gray-500 italic">Select 'All' to target every approved business</p>
                </div>
            )}

            {/* Connection bar */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className={`w-3 h-3 rounded-full ${statusColor} animate-pulse`} />
                    <span className="font-semibold text-gray-800">WhatsApp Bot — {statusLabel}</span>
                </div>
                <div className="flex items-center gap-2">
                    {!['connected', 'connecting', 'qr_ready'].includes(serviceStatus) && (
                        <button
                            onClick={handleConnect}
                            disabled={connecting}
                            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
                        >
                            {connecting ? 'Connecting...' : 'Connect WhatsApp'}
                        </button>
                    )}
                    {serviceStatus === 'connected' && !workerRunning && (
                        <button
                            onClick={handleStart}
                            disabled={loading || remainingToday === 0}
                            className="px-5 py-2 rounded-lg bg-[#25D366] text-white text-sm font-bold hover:bg-[#1ebe5d] disabled:opacity-50 flex items-center gap-2 shadow"
                        >
                            {WA_ICON}
                            {loading ? 'Starting...' : remainingToday === 0 ? 'Daily Limit Reached' : `Start Auto Send (${selectedCategory})`}
                        </button>
                    )}
                    {workerRunning && (
                        <button
                            onClick={handleStop}
                            disabled={loading}
                            className="px-5 py-2 rounded-lg bg-red-500 text-white text-sm font-bold hover:bg-red-600 disabled:opacity-50"
                        >
                            {loading ? 'Stopping...' : '⏹ Stop'}
                        </button>
                    )}
                </div>
            </div>

            {/* QR Code display */}
            {serviceStatus === 'qr_ready' && qrCode && (
                <div className="flex flex-col items-center gap-3 py-6 bg-yellow-50">
                    <p className="text-sm font-semibold text-yellow-800">Open WhatsApp on your phone → Linked Devices → Scan QR</p>
                    <img src={qrCode} alt="WhatsApp QR Code" className="w-48 h-48 rounded-xl border-4 border-yellow-300 shadow-md" />
                    <p className="text-xs text-yellow-600">QR refreshes automatically</p>
                </div>
            )}

            {/* Activity Log */}
            {log.length > 0 && (
                <div
                    ref={logRef}
                    className="bg-gray-950 text-green-400 text-xs font-mono px-4 py-3 max-h-44 overflow-y-auto"
                >
                    {log.map((entry, i) => (
                        <div key={i}>{entry}</div>
                    ))}
                </div>
            )}

            {serviceStatus === 'connected' && !workerRunning && log.length === 0 && (
                <div className="px-6 py-3 text-sm text-gray-500 bg-green-50">
                    ✅ WhatsApp connected. Click <strong>Start Auto Send</strong> to begin (max {stats.dailyLimit}/day, with safe delays).
                </div>
            )}
        </div>
    );
}

// ─── Manual send row ──────────────────────────────────────────────────
function BusinessRow({ business, onSent, sent }) {
    const phone = (business.whatsapp || business.mobile || '—').replace(/\D/g, '') || '—';
    const url = business.subdomain_url || '—';

    const handleMarkSent = async () => {
        try {
            await businessAPI.markWhatsAppSent(business.id);
            setTimeout(() => onSent(business.id), 2000);
        } catch (e) {
            console.error('Failed to mark sent:', e);
        }
    };

    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{business.business_name}</p>
                <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline truncate block">
                    {url}
                </a>
                <p className="text-xs text-gray-500 mt-0.5">📞 {phone}</p>
                {sent && business.whatsapp_notified_at && (
                    <p className="text-xs text-green-600 mt-0.5">
                        ✅ Sent: {new Date(business.whatsapp_notified_at).toLocaleString('en-IN')}
                    </p>
                )}
            </div>
            {!sent && (
                <a
                    href={buildWaLink(business)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleMarkSent}
                    className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 bg-[#25D366] hover:bg-[#1ebe5d] text-white rounded-xl font-semibold text-sm transition-all shadow-sm"
                >
                    {WA_ICON}
                    Send
                </a>
            )}
        </div>
    );
}

// ─── Main page ────────────────────────────────────────────────────────
export default function WhatsAppAdmin() {
    const navigate = useNavigate();
    const [tab, setTab] = useState('pending');

    const [pending, setPending] = useState([]);
    const [pendingTotal, setPendingTotal] = useState(0);
    const [pendingPage, setPendingPage] = useState(1);
    const [loadingPending, setLoadingPending] = useState(false);

    const [sent, setSent] = useState([]);
    const [sentTotal, setSentTotal] = useState(0);
    const [sentPage, setSentPage] = useState(1);
    const [loadingSent, setLoadingSent] = useState(false);

    const fetchPending = useCallback(async (page = 1, append = false) => {
        setLoadingPending(true);
        try {
            const res = await businessAPI.getWhatsAppStatus('pending', page);
            setPending(prev => append ? [...prev, ...res.businesses] : res.businesses);
            setPendingTotal(res.total);
            setPendingPage(page);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingPending(false);
        }
    }, []);

    const fetchSent = useCallback(async (page = 1, append = false) => {
        setLoadingSent(true);
        try {
            const res = await businessAPI.getWhatsAppStatus('sent', page);
            setSent(prev => append ? [...prev, ...res.businesses] : res.businesses);
            setSentTotal(res.total);
            setSentPage(page);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingSent(false);
        }
    }, []);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user?.role !== 'main_admin') {
            navigate('/profile');
            return;
        }
        fetchPending(1);
        fetchSent(1);
    }, [fetchPending, fetchSent, navigate]);

    const handleSent = (id) => {
        const moved = pending.find(b => b.id === id);
        setPending(prev => prev.filter(b => b.id !== id));
        setPendingTotal(t => t - 1);
        if (moved) {
            const updated = { ...moved, whatsapp_notified: true, whatsapp_notified_at: new Date().toISOString() };
            setSent(prev => [updated, ...prev]);
            setSentTotal(t => t + 1);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <Navbar />
            <div className="max-w-5xl mx-auto px-4 py-8">

                {/* Header */}
                <div className="mb-6 bg-gradient-to-r from-[#25D366] to-[#128C7E] rounded-2xl p-6 text-white shadow-xl">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                            {WA_ICON && <span className="scale-[2.5] text-white">{WA_ICON}</span>}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">WhatsApp Notification Manager</h1>
                            <p className="text-white/80 text-sm mt-0.5">Max 30 automated messages/day · Safe delays · One-time only</p>
                        </div>
                    </div>
                    <div className="mt-5 grid grid-cols-2 gap-4">
                        <div className="bg-white/15 rounded-xl p-3 text-center">
                            <p className="text-2xl font-bold">{pendingTotal}</p>
                            <p className="text-white/80 text-xs mt-0.5">Need to Send</p>
                        </div>
                        <div className="bg-white/15 rounded-xl p-3 text-center">
                            <p className="text-2xl font-bold">{sentTotal}</p>
                            <p className="text-white/80 text-xs mt-0.5">Already Sent</p>
                        </div>
                    </div>
                </div>

                {/* ─── Automation Panel ─── */}
                <AutomationPanel />

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setTab('pending')}
                        className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${tab === 'pending' ? 'bg-[#25D366] text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:border-[#25D366]'}`}
                    >
                        📤 Need to Send ({pendingTotal})
                    </button>
                    <button
                        onClick={() => setTab('sent')}
                        className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${tab === 'sent' ? 'bg-gray-800 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-800'}`}
                    >
                        ✅ Already Sent ({sentTotal})
                    </button>
                </div>

                {/* Pending Tab */}
                {tab === 'pending' && (
                    <div>
                        <p className="text-sm text-gray-500 mb-4">Showing {pending.length} of {pendingTotal} businesses · 100 per page</p>
                        {loadingPending && pending.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#25D366] mx-auto" />
                                <p className="mt-3 text-gray-500">Loading...</p>
                            </div>
                        ) : pending.length === 0 ? (
                            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
                                <p className="text-4xl mb-3">🎉</p>
                                <p className="text-gray-600 font-semibold">All businesses have been notified!</p>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-3">
                                    {pending.map(b => (<BusinessRow key={b.id} business={b} onSent={handleSent} sent={false} />))}
                                </div>
                                {pending.length < pendingTotal && (
                                    <button
                                        onClick={() => fetchPending(pendingPage + 1, true)}
                                        disabled={loadingPending}
                                        className="mt-6 w-full py-3 bg-white border-2 border-[#25D366] text-[#25D366] rounded-xl font-semibold hover:bg-[#25D366] hover:text-white transition-all"
                                    >
                                        {loadingPending ? 'Loading...' : `Load More (${pendingTotal - pending.length} remaining)`}
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                )}

                {/* Sent Tab */}
                {tab === 'sent' && (
                    <div>
                        <p className="text-sm text-gray-500 mb-4">Showing {sent.length} of {sentTotal} businesses</p>
                        {loadingSent && sent.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-400 mx-auto" />
                                <p className="mt-3 text-gray-500">Loading...</p>
                            </div>
                        ) : sent.length === 0 ? (
                            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
                                <p className="text-4xl mb-3">📭</p>
                                <p className="text-gray-600 font-semibold">No messages sent yet</p>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-3">
                                    {sent.map(b => (<BusinessRow key={b.id} business={b} onSent={() => { }} sent={true} />))}
                                </div>
                                {sent.length < sentTotal && (
                                    <button
                                        onClick={() => fetchSent(sentPage + 1, true)}
                                        disabled={loadingSent}
                                        className="mt-6 w-full py-3 bg-white border-2 border-gray-300 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                                    >
                                        {loadingSent ? 'Loading...' : `Load More (${sentTotal - sent.length} remaining)`}
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
