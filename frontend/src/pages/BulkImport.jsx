import { useState } from 'react';
import { Search, Loader2, CheckCircle2, XCircle, AlertCircle, RefreshCw, Upload, Building2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import { textSearch, getPlaceDetails, extractBusinessData } from '../services/googlePlaces';
import { businessAPI } from '../config/api';

const BulkImport = () => {
    const [query, setQuery] = useState('');
    const [location, setLocation] = useState('Noida');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [importing, setImporting] = useState(false);
    const [importProgress, setImportProgress] = useState({ current: 0, total: 0, success: 0, failed: 0 });
    const [selectedPlaces, setSelectedPlaces] = useState(new Set());
    const [importLogs, setImportLogs] = useState([]);
    const [error, setError] = useState(null);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setError(null);
        setResults([]);
        setSelectedPlaces(new Set());
        setImportLogs([]);

        try {
            // Combine query and location
            const finalQuery = `${query} in ${location}`;
            const places = await textSearch(finalQuery);

            setResults(places);
            setResults(places);
            // Select all NOT existing by default
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
        const newSelected = new Set(selectedPlaces);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedPlaces(newSelected);
    };

    const toggleAll = () => {
        const availablePlaces = results.filter(p => !p.exists);
        if (selectedPlaces.size === availablePlaces.length) {
            setSelectedPlaces(new Set());
        } else {
            setSelectedPlaces(new Set(availablePlaces.map(p => p.id)));
        }
    };

    const addLog = (message, status = 'info') => {
        setImportLogs(prev => [{ message, status, time: new Date().toLocaleTimeString() }, ...prev]);
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
                // 1. Fetch details
                addLog(`Fetching details for ${place.name}...`, 'info'); // Updated log
                const details = await getPlaceDetails(place.id);
                const businessData = extractBusinessData(details);

                // 2. Prepare form data matching CreateWebsite structure
                const submitData = new FormData();
                submitData.append('businessName', businessData.businessName);
                submitData.append('address', businessData.address);
                submitData.append('description', businessData.description || `${businessData.businessName} is a premier destination in ${location}.`);
                submitData.append('category', query.split(' ')[0] || 'Other'); // Simple heuristic

                // Mock required fields if missing from Google
                submitData.append('ownerName', 'Admin Import');
                submitData.append('mobileNumber', businessData.phoneNumber ? businessData.phoneNumber.replace(/\D/g, '').slice(-10) : '9792894561');
                submitData.append('email', 'vishalsingh05072003@gmail.com');

                submitData.append('googlePlacesData', JSON.stringify({
                    rating: businessData.rating,
                    totalRatings: businessData.totalRatings,
                    reviews: businessData.reviews || [],
                    attributes: businessData.attributes,
                    photos: businessData.photos // Keep here for reference
                }));

                // Map attributes to services
                const mappedServices = [];
                const attrs = businessData.attributes || {};

                if (attrs.outdoorSeating) mappedServices.push({ title: 'Outdoor Seating', description: 'Enjoy our comfortable outdoor seating area.', featured: false });
                if (attrs.takeout) mappedServices.push({ title: 'Takeout Available', description: 'Quick and easy takeout service.', featured: false });
                if (attrs.delivery) mappedServices.push({ title: 'Delivery Service', description: 'Get your order delivered to your doorstep.', featured: true });
                if (attrs.dineIn) mappedServices.push({ title: 'Dine-In', description: 'Experience our warm hospitality.', featured: true });
                if (attrs.wheelchairAccessibleEntrance) mappedServices.push({ title: 'Wheelchair Accessible', description: 'Easy access for everyone.', featured: false });
                if (attrs.liveMusic) mappedServices.push({ title: 'Live Music', description: 'Enjoy live performances.', featured: true });
                if (attrs.servesVegetarianFood) mappedServices.push({ title: 'Vegetarian Options', description: 'Delicious vegetarian dishes available.', featured: false });

                submitData.append('services', JSON.stringify(mappedServices));

                // Handle photos (pass URLs directly)
                if (businessData.photos && businessData.photos.length > 0) {
                    businessData.photos.forEach(photo => {
                        const url = typeof photo === 'string' ? photo : (photo.url || photo);
                        if (url) {
                            submitData.append('imagesUrl', url);
                        }
                    });
                }

                // 3. Create
                // Note: Using a special flag or endpoint for bulk import would be better to bypass validation
                // For now, we try standard creation

                // Quick fix to avoid validation errors:
                if (!businessData.phoneNumber) submitData.set('mobileNumber', '9792894561');

                // Append business hours if available
                if (businessData.businessHours) {
                    submitData.append('businessHours', JSON.stringify(businessData.businessHours));
                }

                // Explicitly set theme to modern
                submitData.append('theme', 'modern');

                await businessAPI.create(submitData); // Assuming businessAPI.create handles FormData

                addLog(`Successfully imported ${place.name}`, 'success');
                setImportProgress(prev => ({ ...prev, success: getPlaceDetails.success + 1 }));

            } catch (err) {
                console.error(`Import failed for ${place.name}:`, err);
                addLog(`Failed to import ${place.name}: ${err.message}`, 'error');
                setImportProgress(prev => ({ ...prev, failed: prev.failed + 1 }));
            }

            // Artificial delay to be nice to the API rate limit
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        setImporting(false);
        addLog('Import process completed!', 'success');
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                        <div className="p-8 bg-gradient-to-r from-blue-600 to-indigo-600">
                            <div className="flex items-center gap-4 text-white">
                                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                    <Upload className="w-8 h-8" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold">Bulk Business Import</h1>
                                    <p className="text-blue-100 mt-1">Search and import multiple businesses from Google Maps</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-8">
                            {/* Search Section */}
                            <form onSubmit={handleSearch} className="flex gap-4 mb-8">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category / Keyword</label>
                                    <input
                                        type="text"
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        placeholder="e.g. Gym, Library, Restaurant"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                                <div className="w-1/3">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                    <input
                                        type="text"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        placeholder="City or Area"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div className="flex items-end">
                                    <button
                                        type="submit"
                                        disabled={loading || importing}
                                        className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                                        Search
                                    </button>
                                </div>
                            </form>

                            {/* Error Message */}
                            {error && (
                                <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-3">
                                    <AlertCircle className="w-5 h-5" />
                                    {error}
                                </div>
                            )}

                            {/* Results & Import Section */}
                            <div className="flex gap-8">
                                {/* Left: Results List */}
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-xl font-bold text-gray-900">
                                            Results ({results.length})
                                        </h2>
                                        {results.length > 0 && (
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={toggleAll}
                                                    className="text-sm text-blue-600 font-medium hover:underline"
                                                >
                                                    {selectedPlaces.size === results.length ? 'Deselect All' : 'Select All'}
                                                </button>
                                                <span className="text-gray-300">|</span>
                                                <span className="text-sm text-gray-500">
                                                    {selectedPlaces.size} selected
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {loading && (
                                            <div className="col-span-full text-center py-12 text-gray-500">
                                                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-500" />
                                                Searching Google Maps...
                                            </div>
                                        )}

                                        {!loading && results.length === 0 && !error && (
                                            <div className="col-span-full text-center py-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                                                Enter a category and location to start searching
                                            </div>
                                        )}

                                        {results.map((place) => (
                                            <div
                                                key={place.id}
                                                onClick={() => !place.exists && togglePlace(place.id)}
                                                className={`
                                                    relative flex flex-col p-4 rounded-xl border-2 transition-all cursor-pointer hover:shadow-md
                                                    ${place.exists
                                                        ? 'border-gray-200 bg-gray-50 opacity-70 cursor-not-allowed'
                                                        : selectedPlaces.has(place.id)
                                                            ? 'border-blue-500 bg-blue-50'
                                                            : 'border-gray-100 bg-white hover:border-blue-300'
                                                    }
                                                `}
                                            >
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className={`
                                                        w-5 h-5 rounded border flex items-center justify-center flex-shrink-0
                                                        ${place.exists
                                                            ? 'bg-gray-200 border-gray-300'
                                                            : selectedPlaces.has(place.id)
                                                                ? 'bg-blue-600 border-blue-600'
                                                                : 'border-gray-300 bg-white'
                                                        }
                                                    `}>
                                                        {place.exists && <CheckCircle2 className="w-3.5 h-3.5 text-gray-500" />}
                                                        {!place.exists && selectedPlaces.has(place.id) && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                                                    </div>

                                                    {place.exists && (
                                                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                                                            Already Imported
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex gap-4">
                                                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                                                        {place.photoUrl ? (
                                                            <img src={place.photoUrl} alt={place.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                                <Building2 className="w-8 h-8" />
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-semibold text-gray-900 truncate" title={place.name}>{place.name}</h3>
                                                        <p className="text-sm text-gray-500 truncate" title={place.address}>{place.address}</p>
                                                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                                            {place.rating && (
                                                                <span className="flex items-center gap-1 text-amber-600 font-medium">
                                                                    ★ {place.rating} ({place.userRatingCount})
                                                                </span>
                                                            )}
                                                            {place.businessStatus && (
                                                                <span className="px-2 py-0.5 bg-gray-100 rounded-full capitalize">
                                                                    {place.businessStatus.toLowerCase().replace('_', ' ')}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Right: Actions & Logs */}
                                <div className="w-80 flex-shrink-0">
                                    <div className="bg-gray-50 rounded-xl p-6 sticky top-24 border border-gray-200">
                                        <h3 className="font-bold text-gray-900 mb-4">Import Actions</h3>

                                        <button
                                            onClick={handleImport}
                                            disabled={importing || selectedPlaces.size === 0}
                                            className="w-full py-3 bg-green-600 text-white font-bold rounded-xl shadow-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-6"
                                        >
                                            {importing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                                            {importing ? 'Importing...' : `Import ${selectedPlaces.size} Businesses`}
                                        </button>

                                        {importing && (
                                            <div className="mb-6">
                                                <div className="flex justify-between text-sm mb-2">
                                                    <span className="text-gray-600">Progress</span>
                                                    <span className="font-medium">{Math.round((importProgress.current / importProgress.total) * 100)}%</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                                    <div
                                                        className="bg-green-500 h-2.5 rounded-full transition-all duration-300"
                                                        style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
                                                    ></div>
                                                </div>
                                                <div className="flex gap-4 mt-2 text-xs text-center">
                                                    <div className="flex-1 bg-green-100 text-green-700 py-1 rounded">
                                                        Success: {importProgress.success}
                                                    </div>
                                                    <div className="flex-1 bg-red-100 text-red-700 py-1 rounded">
                                                        Failed: {importProgress.failed}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="border-t border-gray-200 pt-4">
                                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Activity Log</h4>
                                            <div className="h-60 overflow-y-auto space-y-2 pr-2 text-xs font-mono">
                                                {importLogs.map((log, idx) => (
                                                    <div key={idx} className={`
                            p-2 rounded border
                            ${log.status === 'error' ? 'bg-red-50 border-red-100 text-red-700' :
                                                            log.status === 'success' ? 'bg-green-50 border-green-100 text-green-700' :
                                                                'bg-white border-gray-200 text-gray-600'}
                          `}>
                                                        <span className="opacity-50 mr-2">{log.time}</span>
                                                        {log.message}
                                                    </div>
                                                ))}
                                                {importLogs.length === 0 && (
                                                    <p className="text-gray-400 italic text-center py-4">Logs will appear here...</p>
                                                )}
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default BulkImport;
