import { useState, useRef, useCallback, useEffect } from 'react';
import { Search, Loader2, CheckCircle2, XCircle, AlertCircle, RefreshCw, Upload, Building2, MapPin, Zap, StopCircle, Play, Sparkles } from 'lucide-react';
import Navbar from '../components/Navbar';
import { textSearch, getPlaceDetails, extractBusinessData } from '../services/googlePlaces';
import { businessAPI } from '../config/api';

// All Noida + Greater Noida sectors
const NOIDA_SECTORS = [];
for (let i = 1; i <= 168; i++) {
    NOIDA_SECTORS.push(`Noida Sector ${i}`);
}
const GREATER_NOIDA_SECTORS = [
    'Greater Noida Sector Alpha',
    'Greater Noida Sector Beta',
    'Greater Noida Sector Gamma',
    'Greater Noida Sector Delta',
    'Greater Noida Sector Zeta',
    'Greater Noida Sector Mu',
    'Greater Noida Sector Omicron',
    'Greater Noida Sector Pi',
    'Greater Noida Sector Chi',
    'Greater Noida Sector Phi',
    'Greater Noida Sector Eta',
    'Greater Noida Sector Sigma',
    'Greater Noida Knowledge Park 1',
    'Greater Noida Knowledge Park 2',
    'Greater Noida Knowledge Park 3',
    'Greater Noida Knowledge Park 4',
    'Greater Noida Knowledge Park 5',
    'Greater Noida Pari Chowk',
    'Greater Noida Tech Zone',
    'Greater Noida Sector 1',
    'Greater Noida Sector 2',
    'Greater Noida Sector 3',
    'Greater Noida Sector 4',
    'Greater Noida Sector 5',
    'Greater Noida Sector 6',
    'Greater Noida Sector 7',
    'Greater Noida Sector 8',
    'Greater Noida Sector 9',
    'Greater Noida Sector 10',
    'Greater Noida Sector 11',
    'Greater Noida Sector 12',
    'Noida Extension Sector 1',
    'Noida Extension Sector 2',
    'Noida Extension Sector 3',
    'Noida Extension Sector 4',
    'Noida Extension Sector 5',
    'Noida Extension Sector 6',
    'Noida Extension Sector 7',
    'Noida Extension Sector 8',
    'Noida Extension Sector 10',
    'Noida Extension Sector 12',
    'Noida Extension Sector 16',
];

const ALL_SECTORS = [...NOIDA_SECTORS, ...GREATER_NOIDA_SECTORS];

const CATEGORIES = [
    'Gym', 'Restaurant', 'Salon', 'Hospital', 'School', 'College',
    'Coaching Center', 'Pharmacy', 'Hotel', 'Cafe', 'Dentist',
    'Physiotherapist', 'Yoga Center', 'Dance Academy', 'Spa',
    'Pet Shop', 'Veterinary', 'Car Repair', 'Bike Repair',
    'Electrician', 'Plumber', 'Grocery Store', 'Supermarket',
    'Bakery', 'Sweet Shop', 'Clothing Store', 'Electronics Store',
    'Mobile Shop', 'Jewellery Store', 'Optical Store', 'Book Store',
    'Library', 'Stationery Shop', 'Furniture Store', 'Hardware Store',
    'Paint Store', 'Nursery', 'Florist', 'Laundry', 'Dry Cleaner',
    'Tailor', 'Photographer', 'Caterer', 'Event Planner',
    'Travel Agency', 'Real Estate Agent', 'Lawyer', 'CA',
    'Insurance Agent', 'Bank', 'ATM', 'Petrol Pump',
    'Parking', 'Temple', 'Mosque', 'Church', 'Gurudwara',
    'Park', 'Playground', 'Swimming Pool', 'Sports Complex',
];

const BulkImport = () => {
    // Manual search mode states
    const [query, setQuery] = useState('');
    const [location, setLocation] = useState('Noida');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [importing, setImporting] = useState(false);
    const [importProgress, setImportProgress] = useState({ current: 0, total: 0, success: 0, failed: 0 });
    const [selectedPlaces, setSelectedPlaces] = useState(new Set());
    const [importLogs, setImportLogs] = useState([]);
    const [error, setError] = useState(null);

    // Auto-import mode states
    const [mode, setMode] = useState('manual'); // 'manual' or 'auto'
    const [selectedCategory, setSelectedCategory] = useState('');
    const [customCategory, setCustomCategory] = useState('');
    const [autoRunning, setAutoRunning] = useState(false);
    const [autoProgress, setAutoProgress] = useState({
        currentSector: '',
        sectorIndex: 0,
        totalSectors: ALL_SECTORS.length,
        totalFound: 0,
        totalImported: 0,
        totalSkipped: 0,
        totalFailed: 0,
    });
    const [autoLogs, setAutoLogs] = useState([]);

    // Admin Dashboard States
    const [adminStats, setAdminStats] = useState(null);
    const [bulkSearch, setBulkSearch] = useState('');
    const [loadingAdmin, setLoadingAdmin] = useState(false);

    useEffect(() => {
        const fetchAdminStats = async () => {
            try {
                setLoadingAdmin(true);
                const res = await businessAPI.getAdminStats();
                setAdminStats(res.stats);
            } catch (error) {
                console.error('Error fetching admin stats:', error);
            } finally {
                setLoadingAdmin(false);
            }
        };
        fetchAdminStats();
    }, []);
    const stopRef = useRef(false);
    const logsEndRef = useRef(null);

    // Scroll logs to bottom
    const scrollLogsToBottom = useCallback(() => {
        if (logsEndRef.current) {
            logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, []);

    // --- Manual Mode Functions ---
    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setError(null);
        setResults([]);
        setSelectedPlaces(new Set());
        setImportLogs([]);

        try {
            const finalQuery = `${query} in ${location}`;
            const places = await textSearch(finalQuery);
            setResults(places);
            setSelectedPlaces(new Set(places.filter(p => !p.exists).map(p => p.id)));
            if (places.length === 0) {
                setError('No businesses found. Try a different query.');
            }
        } catch (err) {
            console.error('Search failed:', err);
            setError('Search failed. Please try again. ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const togglePlace = (id) => {
        setSelectedPlaces(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleAll = () => {
        if (selectedPlaces.size === results.filter(p => !p.exists).length) {
            setSelectedPlaces(new Set());
        } else {
            setSelectedPlaces(new Set(results.filter(p => !p.exists).map(p => p.id)));
        }
    };

    const addLog = (message, status = 'info') => {
        setImportLogs(prev => [...prev, { message, status, time: new Date().toLocaleTimeString() }]);
    };

    const handleImport = async () => {
        const placesToImport = results.filter(p => selectedPlaces.has(p.id));
        if (placesToImport.length === 0) return;

        setImporting(true);
        setImportProgress({ current: 0, total: placesToImport.length, success: 0, failed: 0 });
        setImportLogs([]);

        for (let i = 0; i < placesToImport.length; i++) {
            const place = placesToImport[i];
            setImportProgress(prev => ({ ...prev, current: i + 1 }));
            addLog(`Processing ${place.name}...`, 'info');

            try {
                addLog(`Fetching details for ${place.name}...`, 'info');
                const details = await getPlaceDetails(place.id);
                const businessData = extractBusinessData(details);

                const submitData = new FormData();
                submitData.append('businessName', businessData.businessName);
                submitData.append('address', businessData.address);
                submitData.append('description', businessData.description || `${businessData.businessName} is a premier destination in ${location}.`);
                submitData.append('category', query || 'Other');
                submitData.append('ownerName', 'Admin Import');
                submitData.append('mobileNumber', businessData.phoneNumber ? businessData.phoneNumber.replace(/\D/g, '').slice(-10) : '9792894561');
                submitData.append('email', 'vishalsingh05072003@gmail.com');
                submitData.append('googlePlacesData', JSON.stringify({
                    rating: businessData.rating,
                    totalRatings: businessData.totalRatings,
                    reviews: businessData.reviews || [],
                    attributes: businessData.attributes,
                    photos: businessData.photos,
                    googleMapsUri: businessData.googleMapsUri
                }));

                const mappedServices = [];
                const attrs = businessData.attributes || {};
                if (attrs.outdoorSeating) mappedServices.push({ title: 'Outdoor Seating', description: 'Enjoy our comfortable outdoor seating area.', featured: false });
                if (attrs.takeout) mappedServices.push({ title: 'Takeout Available', description: 'Quick and easy takeout service.', featured: false });
                if (attrs.delivery) mappedServices.push({ title: 'Delivery Service', description: 'Get your order delivered to your doorstep.', featured: true });
                if (attrs.dineIn) mappedServices.push({ title: 'Dine-In', description: 'Experience our warm hospitality.', featured: true });
                submitData.append('services', JSON.stringify(mappedServices));

                if (businessData.photos && businessData.photos.length > 0) {
                    businessData.photos.forEach(photo => {
                        const url = typeof photo === 'string' ? photo : (photo.url || photo);
                        if (url) submitData.append('imagesUrl', url);
                    });
                }
                if (!businessData.phoneNumber) submitData.set('mobileNumber', '9792894561');
                if (businessData.businessHours) submitData.append('businessHours', JSON.stringify(businessData.businessHours));
                submitData.append('theme', 'modern');

                await businessAPI.create(submitData);
                addLog(`✅ Successfully imported ${place.name}`, 'success');
                setImportProgress(prev => ({ ...prev, success: prev.success + 1 }));
            } catch (err) {
                console.error(`Import failed for ${place.name}:`, err);
                addLog(`❌ Failed to import ${place.name}: ${err.message}`, 'error');
                setImportProgress(prev => ({ ...prev, failed: prev.failed + 1 }));
            }

            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        setImporting(false);
        addLog('Import process completed!', 'success');
    };

    // --- Auto-Import Mode Functions ---
    const addAutoLog = useCallback((message, status = 'info') => {
        setAutoLogs(prev => {
            const newLogs = [...prev, { message, status, time: new Date().toLocaleTimeString() }];
            // Keep max 500 logs to avoid memory issues
            if (newLogs.length > 500) return newLogs.slice(-400);
            return newLogs;
        });
        setTimeout(scrollLogsToBottom, 100);
    }, [scrollLogsToBottom]);

    const importSinglePlace = async (place, category) => {
        try {
            const details = await getPlaceDetails(place.id);
            const businessData = extractBusinessData(details);

            const submitData = new FormData();
            submitData.append('businessName', businessData.businessName);
            submitData.append('address', businessData.address);
            submitData.append('description', businessData.description || `${businessData.businessName} is a premier ${category.toLowerCase()} in Noida.`);
            submitData.append('category', category);
            submitData.append('ownerName', 'Admin Import');
            submitData.append('mobileNumber', businessData.phoneNumber ? businessData.phoneNumber.replace(/\D/g, '').slice(-10) : '9792894561');
            submitData.append('email', 'vishalsingh05072003@gmail.com');
            submitData.append('googlePlacesData', JSON.stringify({
                rating: businessData.rating,
                totalRatings: businessData.totalRatings,
                reviews: businessData.reviews || [],
                attributes: businessData.attributes,
                photos: businessData.photos,
                googleMapsUri: businessData.googleMapsUri
            }));

            const mappedServices = [];
            const attrs = businessData.attributes || {};
            if (attrs.outdoorSeating) mappedServices.push({ title: 'Outdoor Seating', description: 'Enjoy our comfortable outdoor seating area.', featured: false });
            if (attrs.takeout) mappedServices.push({ title: 'Takeout Available', description: 'Quick and easy takeout service.', featured: false });
            if (attrs.delivery) mappedServices.push({ title: 'Delivery Service', description: 'Get your order delivered to your doorstep.', featured: true });
            if (attrs.dineIn) mappedServices.push({ title: 'Dine-In', description: 'Experience our warm hospitality.', featured: true });
            submitData.append('services', JSON.stringify(mappedServices));

            if (businessData.photos && businessData.photos.length > 0) {
                businessData.photos.forEach(photo => {
                    const url = typeof photo === 'string' ? photo : (photo.url || photo);
                    if (url) submitData.append('imagesUrl', url);
                });
            }
            if (!businessData.phoneNumber) submitData.set('mobileNumber', '9792894561');
            if (businessData.businessHours) submitData.append('businessHours', JSON.stringify(businessData.businessHours));
            submitData.append('theme', 'modern');

            await businessAPI.create(submitData);
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    const handleAutoImport = async () => {
        const category = selectedCategory === 'custom' ? customCategory : selectedCategory;
        if (!category.trim()) return;

        stopRef.current = false;
        setAutoRunning(true);
        setAutoLogs([]);
        setAutoProgress({
            currentSector: '',
            sectorIndex: 0,
            totalSectors: ALL_SECTORS.length,
            totalFound: 0,
            totalImported: 0,
            totalSkipped: 0,
            totalFailed: 0,
        });

        addAutoLog(`🚀 Starting auto-import: "${category}" across ${ALL_SECTORS.length} sectors`, 'success');

        for (let i = 0; i < ALL_SECTORS.length; i++) {
            if (stopRef.current) {
                addAutoLog(`⛔ Stopped by user at sector ${i + 1}/${ALL_SECTORS.length}`, 'error');
                break;
            }

            const sector = ALL_SECTORS[i];
            const searchQuery = `${category} in ${sector}`;

            setAutoProgress(prev => ({
                ...prev,
                currentSector: sector,
                sectorIndex: i + 1,
            }));

            addAutoLog(`🔍 Searching: "${searchQuery}" (${i + 1}/${ALL_SECTORS.length})`, 'info');

            try {
                // Search Google Places for this sector
                const places = await textSearch(searchQuery);

                if (!places || places.length === 0) {
                    addAutoLog(`   ↳ No results in ${sector}`, 'info');
                    await new Promise(r => setTimeout(r, 500));
                    continue;
                }

                // Filter out already existing ones
                const newPlaces = places.filter(p => !p.exists);
                const skipped = places.length - newPlaces.length;

                addAutoLog(`   ↳ Found ${places.length} (${newPlaces.length} new, ${skipped} already exist)`, 'info');

                setAutoProgress(prev => ({
                    ...prev,
                    totalFound: prev.totalFound + places.length,
                    totalSkipped: prev.totalSkipped + skipped,
                }));

                // Import each new place
                for (let j = 0; j < newPlaces.length; j++) {
                    if (stopRef.current) break;

                    const place = newPlaces[j];
                    addAutoLog(`   📥 Importing: ${place.name}`, 'info');

                    const result = await importSinglePlace(place, category);

                    if (result.success) {
                        addAutoLog(`   ✅ ${place.name}`, 'success');
                        setAutoProgress(prev => ({ ...prev, totalImported: prev.totalImported + 1 }));
                    } else {
                        addAutoLog(`   ❌ ${place.name}: ${result.error}`, 'error');
                        setAutoProgress(prev => ({ ...prev, totalFailed: prev.totalFailed + 1 }));
                    }

                    // Delay between imports (1.5s to respect API rate limits)
                    await new Promise(r => setTimeout(r, 1500));
                }

            } catch (err) {
                addAutoLog(`   ⚠️ Search failed for ${sector}: ${err.message}`, 'error');
            }

            // Delay between sector searches (1s)
            await new Promise(r => setTimeout(r, 1000));
        }

        setAutoRunning(false);
        addAutoLog(`\n🏁 Auto-import completed!`, 'success');
    };

    const handleStop = () => {
        stopRef.current = true;
        addAutoLog('⏳ Stopping after current operation...', 'info');
    };

    const percentComplete = autoProgress.totalSectors > 0
        ? Math.round((autoProgress.sectorIndex / autoProgress.totalSectors) * 100)
        : 0;

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                            <Upload className="w-8 h-8 inline-block mr-2 text-blue-600" />
                            Bulk Import Businesses
                        </h1>
                        <p className="text-gray-600">Search Google Maps and import businesses to populate the directory</p>
                    </div>

                    {/* Bulk Import Control Center */}
                    {adminStats && (
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-8">
                            <div className="bg-gray-50/50 px-6 py-6 border-b border-gray-100">
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                            <Sparkles className="w-6 h-6 text-indigo-600" />
                                            Bulk Import Control Center
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1 font-medium">Manage and track data coverage across all categories</p>
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-center gap-3">
                                        <div className="relative w-full sm:w-64">
                                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Search categories..."
                                                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm shadow-sm"
                                                value={bulkSearch}
                                                onChange={(e) => setBulkSearch(e.target.value)}
                                            />
                                        </div>
                                        <div className="flex items-center bg-white border border-gray-200 rounded-xl p-1 shadow-sm font-black text-[10px] uppercase tracking-tighter">
                                            <div className="px-3 py-1 flex items-center gap-2 border-r border-gray-100">
                                                <span className="text-gray-400">DONE</span>
                                                <span className="text-green-600 text-sm">{(adminStats.bulkImportStats || []).length}</span>
                                            </div>
                                            <div className="px-3 py-1 flex items-center gap-2">
                                                <span className="text-gray-400">REMAINS</span>
                                                <span className="text-orange-600 text-sm">
                                                    {(adminStats.allCategories || []).length - (adminStats.bulkImportStats || []).length}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-x-auto max-h-[400px]">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50 uppercase text-[10px] font-black text-gray-500 tracking-widest sticky top-0 z-10">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left">Category</th>
                                            <th scope="col" className="px-6 py-3 text-left">Status</th>
                                            <th scope="col" className="px-6 py-3 text-left">Count</th>
                                            <th scope="col" className="px-6 py-3 text-left">Last Run</th>
                                            <th scope="col" className="px-6 py-3 text-right">Act</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100 font-bold uppercase">
                                        {(() => {
                                            const bulkStats = adminStats.bulkImportStats || [];
                                            const allCats = adminStats.allCategories || [
                                                'Gym', 'Restaurant', 'Salon', 'Hospital', 'School', 'College',
                                                'Pharmacy', 'Hotel', 'Cafe', 'Library'
                                            ];

                                            const tableData = allCats.map(cat => {
                                                const match = bulkStats.find(s =>
                                                    s.category?.trim().toLowerCase() === cat.trim().toLowerCase()
                                                );
                                                return {
                                                    category: cat,
                                                    count: match ? match.count : 0,
                                                    lastRun: match ? match.lastRun : null,
                                                    status: match ? 'Completed' : 'Remaining'
                                                };
                                            }).filter(item =>
                                                item.category.toLowerCase().includes(bulkSearch.toLowerCase())
                                            ).sort((a, b) => {
                                                if (a.status !== b.status) return a.status === 'Completed' ? -1 : 1;
                                                return b.count - a.count;
                                            });

                                            if (tableData.length === 0) return <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-500">No matches found</td></tr>;

                                            return tableData.map((item, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-3 text-gray-900 text-sm">
                                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.status === 'Completed' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                                                                <Building2 className="w-4 h-4" />
                                                            </div>
                                                            {item.category}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black tracking-tighter ${item.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                                            }`}>
                                                            {item.status === 'Completed' ? 'RUNNED' : 'REMAINS'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-gray-900">
                                                        {item.count} <span className="text-[10px] text-gray-400">BIZ</span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                        {item.lastRun ? new Date(item.lastRun).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '---'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                                        <button
                                                            onClick={() => {
                                                                if (mode === 'manual') {
                                                                    setQuery(item.category);
                                                                    window.scrollTo({ top: document.querySelector('form')?.offsetTop - 100, behavior: 'smooth' });
                                                                } else {
                                                                    setSelectedCategory(item.category);
                                                                    window.scrollTo({ top: document.querySelector('.bg-white.rounded-2xl.shadow-lg.border.border-gray-100.p-6')?.offsetTop - 100, behavior: 'smooth' });
                                                                }
                                                            }}
                                                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${item.status === 'Completed' ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-orange-600 text-white hover:bg-orange-700'
                                                                }`}
                                                        >
                                                            {item.status === 'Completed' ? 'Update' : 'Run'}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ));
                                        })()}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Mode Toggle */}
                    <div className="flex justify-center gap-2 mb-8">
                        <button
                            onClick={() => setMode('manual')}
                            className={`px-6 py-3 rounded-xl font-semibold transition-all ${mode === 'manual'
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                                : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-blue-300'}`}
                        >
                            <Search className="w-4 h-4 inline mr-2" />
                            Manual Search
                        </button>
                        <button
                            onClick={() => setMode('auto')}
                            className={`px-6 py-3 rounded-xl font-semibold transition-all ${mode === 'auto'
                                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-200'
                                : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-purple-300'}`}
                        >
                            <Zap className="w-4 h-4 inline mr-2" />
                            Auto-Import (All Sectors)
                        </button>
                    </div>

                    {/* ==================== MANUAL MODE ==================== */}
                    {mode === 'manual' && (
                        <div className="space-y-6">
                            {/* Search Form */}
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                                    <div className="flex-1">
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Category / Query</label>
                                        <select
                                            value={query}
                                            onChange={(e) => setQuery(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors bg-white"
                                        >
                                            <option value="">-- Select category --</option>
                                            {CATEGORIES.map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                            <option value="__custom__">✏️ Custom query...</option>
                                        </select>
                                    </div>
                                    {query === '__custom__' && (
                                        <div className="flex-1">
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Custom Query</label>
                                            <input
                                                type="text"
                                                value={location === 'Noida' ? '' : ''}
                                                onChange={(e) => setQuery(e.target.value)}
                                                placeholder="e.g., Tuition Center, Yoga Studio..."
                                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                                            />
                                        </div>
                                    )}
                                    <div className="w-full md:w-48">
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Location</label>
                                        <input
                                            type="text"
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                            placeholder="Noida"
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                                        />
                                    </div>
                                    <div className="flex items-end">
                                        <button
                                            type="submit"
                                            disabled={loading || !query.trim()}
                                            className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                                        >
                                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                                            Search
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                                    <p className="text-red-700">{error}</p>
                                </div>
                            )}

                            {/* Results */}
                            {results.length > 0 && (
                                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                                    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Building2 className="w-5 h-5 text-blue-600" />
                                            <h3 className="font-bold text-gray-900">Found {results.length} businesses</h3>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button onClick={toggleAll} className="text-sm text-blue-600 hover:underline font-medium">
                                                {selectedPlaces.size === results.filter(p => !p.exists).length ? 'Deselect All' : 'Select All'}
                                            </button>
                                            <button
                                                onClick={handleImport}
                                                disabled={importing || selectedPlaces.size === 0}
                                                className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center gap-2"
                                            >
                                                {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                                Import ({selectedPlaces.size})
                                            </button>
                                        </div>
                                    </div>

                                    {importing && (
                                        <div className="px-4 py-3 bg-blue-50 border-b border-blue-100">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-blue-700">
                                                    Importing {importProgress.current}/{importProgress.total}
                                                </span>
                                                <span className="text-sm text-blue-600">
                                                    ✅ {importProgress.success} | ❌ {importProgress.failed}
                                                </span>
                                            </div>
                                            <div className="w-full bg-blue-200 rounded-full h-2">
                                                <div
                                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                    style={{ width: `${importProgress.total > 0 ? (importProgress.current / importProgress.total) * 100 : 0}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="max-h-[500px] overflow-y-auto divide-y divide-gray-50">
                                        {results.map((place) => (
                                            <div
                                                key={place.id}
                                                className={`p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors ${place.exists ? 'opacity-50' : ''}`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedPlaces.has(place.id)}
                                                    onChange={() => togglePlace(place.id)}
                                                    disabled={place.exists}
                                                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                {place.photoUrl ? (
                                                    <img src={place.photoUrl} alt={place.name} className="w-12 h-12 rounded-lg object-cover" />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                                                        <Building2 className="w-6 h-6 text-gray-400" />
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-semibold text-gray-900 truncate">{place.name}</h4>
                                                    <p className="text-sm text-gray-500 truncate">{place.address}</p>
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                    {place.rating && (
                                                        <div className="text-sm font-bold text-yellow-600">⭐ {place.rating}</div>
                                                    )}
                                                    {place.exists && (
                                                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium">Already exists</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Manual Import Logs */}
                            {importLogs.length > 0 && (
                                <div className="bg-gray-900 rounded-2xl p-4 max-h-64 overflow-y-auto">
                                    <h4 className="text-green-400 font-mono text-sm mb-2">Import Logs</h4>
                                    {importLogs.map((log, i) => (
                                        <div key={i} className={`text-xs font-mono py-0.5 ${log.status === 'success' ? 'text-green-400' : log.status === 'error' ? 'text-red-400' : 'text-gray-400'}`}>
                                            <span className="text-gray-600">[{log.time}]</span> {log.message}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ==================== AUTO-IMPORT MODE ==================== */}
                    {mode === 'auto' && (
                        <div className="space-y-6">
                            {/* Category Selection */}
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-purple-600" />
                                    Auto-Import Settings
                                </h3>
                                <p className="text-sm text-gray-500 mb-4">
                                    Select a category and click Start. The system will automatically search through all <strong>{ALL_SECTORS.length} sectors</strong> (Noida + Greater Noida + Noida Extension)
                                    and import every business found.
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Select Category</label>
                                        <select
                                            value={selectedCategory}
                                            onChange={(e) => setSelectedCategory(e.target.value)}
                                            disabled={autoRunning}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors bg-white"
                                        >
                                            <option value="">-- Choose a category --</option>
                                            {CATEGORIES.map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                            <option value="custom">✏️ Custom category...</option>
                                        </select>
                                    </div>
                                    {selectedCategory === 'custom' && (
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Custom Category</label>
                                            <input
                                                type="text"
                                                value={customCategory}
                                                onChange={(e) => setCustomCategory(e.target.value)}
                                                disabled={autoRunning}
                                                placeholder="e.g., Tuition Center, Yoga Studio..."
                                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-3">
                                    {!autoRunning ? (
                                        <button
                                            onClick={handleAutoImport}
                                            disabled={!(selectedCategory && (selectedCategory !== 'custom' || customCategory.trim()))}
                                            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-lg shadow-purple-200"
                                        >
                                            <Play className="w-5 h-5" />
                                            Start Auto-Import
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleStop}
                                            className="px-8 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors flex items-center gap-2 shadow-lg shadow-red-200"
                                        >
                                            <StopCircle className="w-5 h-5" />
                                            Stop
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Progress Dashboard */}
                            {(autoRunning || autoLogs.length > 0) && (
                                <>
                                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                                {autoRunning && <Loader2 className="w-5 h-5 animate-spin text-purple-600" />}
                                                <MapPin className="w-5 h-5 text-purple-600" />
                                                {autoRunning ? `Scanning: ${autoProgress.currentSector}` : 'Import Complete'}
                                            </h3>
                                            <span className="text-sm font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                                                {autoProgress.sectorIndex}/{autoProgress.totalSectors} sectors
                                            </span>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="w-full bg-gray-100 rounded-full h-4 mb-4 overflow-hidden">
                                            <div
                                                className="h-4 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500 flex items-center justify-center"
                                                style={{ width: `${percentComplete}%` }}
                                            >
                                                {percentComplete > 10 && (
                                                    <span className="text-[10px] font-bold text-white">{percentComplete}%</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Stats Grid */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="bg-blue-50 rounded-xl p-4 text-center">
                                                <div className="text-2xl font-black text-blue-600">{autoProgress.totalFound}</div>
                                                <div className="text-xs font-semibold text-blue-500 uppercase tracking-wide">Found</div>
                                            </div>
                                            <div className="bg-green-50 rounded-xl p-4 text-center">
                                                <div className="text-2xl font-black text-green-600">{autoProgress.totalImported}</div>
                                                <div className="text-xs font-semibold text-green-500 uppercase tracking-wide">Imported</div>
                                            </div>
                                            <div className="bg-yellow-50 rounded-xl p-4 text-center">
                                                <div className="text-2xl font-black text-yellow-600">{autoProgress.totalSkipped}</div>
                                                <div className="text-xs font-semibold text-yellow-500 uppercase tracking-wide">Skipped</div>
                                            </div>
                                            <div className="bg-red-50 rounded-xl p-4 text-center">
                                                <div className="text-2xl font-black text-red-600">{autoProgress.totalFailed}</div>
                                                <div className="text-xs font-semibold text-red-500 uppercase tracking-wide">Failed</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Live Logs */}
                                    <div className="bg-gray-900 rounded-2xl overflow-hidden">
                                        <div className="px-4 py-3 bg-gray-800 flex items-center justify-between">
                                            <h4 className="text-green-400 font-mono text-sm font-bold">📋 Live Import Logs</h4>
                                            <span className="text-xs text-gray-500 font-mono">{autoLogs.length} entries</span>
                                        </div>
                                        <div className="p-4 max-h-[400px] overflow-y-auto font-mono text-xs">
                                            {autoLogs.map((log, i) => (
                                                <div key={i} className={`py-0.5 ${log.status === 'success' ? 'text-green-400' :
                                                    log.status === 'error' ? 'text-red-400' :
                                                        'text-gray-400'
                                                    }`}>
                                                    <span className="text-gray-600">[{log.time}]</span> {log.message}
                                                </div>
                                            ))}
                                            <div ref={logsEndRef} />
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default BulkImport;
