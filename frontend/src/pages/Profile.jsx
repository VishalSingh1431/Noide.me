import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Calendar, Edit2, Save, X, Building2, ExternalLink, Plus, Shield, CheckCircle, XCircle, Clock, Users, FileText, Settings, BarChart3, AlertCircle, Trash2, Eye, BadgeCheck, Sparkles, QrCode, RefreshCw, Upload } from 'lucide-react';
import Navbar from '../components/Navbar';
import { authAPI, businessAPI } from '../config/api';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [businesses, setBusinesses] = useState([]);
  const [loadingBusinesses, setLoadingBusinesses] = useState(true);
  const [userRole, setUserRole] = useState('normal');
  const [adminStats, setAdminStats] = useState(null);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [selectedApprovals, setSelectedApprovals] = useState([]);
  const [pendingEditApprovals, setPendingEditApprovals] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loadingAdmin, setLoadingAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('websites'); // 'websites', 'admin', 'all-businesses', 'analytics'
  const [allBusinesses, setAllBusinesses] = useState([]);
  const [loadingAllBusinesses, setLoadingAllBusinesses] = useState(false);
  const [unifiedAnalytics, setUnifiedAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
  });
  const [refreshing, setRefreshing] = useState(false);

  const refetchUserData = useCallback(async () => {
    try {
      setRefreshing(true);
      const response = await authAPI.getCurrentUser();
      const userData = response.user;
      setUser(userData);
      setUserRole(userData.role || 'normal');
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        bio: userData.bio || '',
      });
      try {
        localStorage.setItem('user', JSON.stringify(userData));
        window.dispatchEvent(new Event('authChange'));
      } catch (e) { }
    } catch (error) {
      console.error('Error refreshing user:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    // Check if user is logged in
    let token = null;
    try {
      token = localStorage.getItem('token');
    } catch (storageError) {
      console.warn('localStorage not available:', storageError);
      navigate('/login');
      return;
    }

    if (!token) {
      navigate('/login');
      return;
    }

    // Fetch fresh user data from the database
    const fetchUserData = async () => {
      try {
        const response = await authAPI.getCurrentUser();
        const userData = response.user;

        setUser(userData);
        setUserRole(userData.role || 'normal');
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          bio: userData.bio || '',
        });

        // Update localStorage with fresh data so Navbar and other components see latest role
        try {
          localStorage.setItem('user', JSON.stringify(userData));
          window.dispatchEvent(new Event('authChange'));
        } catch (storageError) {
          console.warn('Failed to save user to localStorage:', storageError);
          // Continue anyway - user data is still in state
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Fallback to localStorage if API fails (e.g. on prod after role was updated in DB)
        const userData = localStorage.getItem('user');
        if (userData) {
          try {
            const userObj = JSON.parse(userData);
            setUser(userObj);
            setUserRole(userObj.role || 'normal');
            setFormData({
              name: userObj.name || '',
              email: userObj.email || '',
              phone: userObj.phone || '',
              bio: userObj.bio || '',
            });
          } catch (parseError) {
            console.error('Error parsing user data:', parseError);
            navigate('/login');
          }
        } else {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();

    // Fetch user's businesses
    const fetchBusinesses = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('No token found');
          setLoadingBusinesses(false);
          return;
        }

        console.log('Fetching businesses for user...');
        const response = await businessAPI.getUserBusinesses();
        console.log('Businesses response:', response);
        setBusinesses(response.businesses || []);

        if (!response.businesses || response.businesses.length === 0) {
          console.log('No businesses found for this user');
        }
      } catch (error) {
        console.error('Error fetching businesses:', error);
        console.error('Error details:', error.message, error.stack);
        setBusinesses([]);
        // Don't show alert for token expiration - auto-logout handles it
        if (!error.isTokenExpired) {
          alert(`Error loading your websites: ${error.message || 'Please try refreshing the page'}`);
        }
      } finally {
        setLoadingBusinesses(false);
      }
    };

    fetchBusinesses();

    // Fetch admin data if user is main_admin
    const fetchAdminData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const userData = JSON.parse(localStorage.getItem('user') || '{}');
          if (userData.role === 'main_admin') {
            setLoadingAdmin(true);
            const [statsRes, approvalsRes, editApprovalsRes, usersRes] = await Promise.all([
              businessAPI.getAdminStats(),
              businessAPI.getPendingApprovals(),
              businessAPI.getPendingEditApprovals(),
              businessAPI.getAllUsers(),
            ]);
            setAdminStats(statsRes.stats);
            setPendingApprovals(approvalsRes.businesses || []);
            setPendingEditApprovals(editApprovalsRes.businesses || []);
            setAllUsers(usersRes.users || []);
          }
        }
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoadingAdmin(false);
      }
    };

    fetchAdminData();
  }, [navigate]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data to original user data
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      bio: user?.bio || '',
    });
  };

  const handleSave = async () => {
    try {
      // Send update to backend API
      const response = await authAPI.updateProfile({
        name: formData.name || '',
        phone: formData.phone || '',
        bio: formData.bio || '',
      });

      // Update user data in localStorage
      const updatedUser = {
        ...user,
        ...response.user,
      };
      try {
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } catch (storageError) {
        console.warn('Failed to save user to localStorage:', storageError);
        // Continue anyway - user data is still updated in state
      }
      setUser(updatedUser);
      setIsEditing(false);

      // Dispatch event to update navbar
      window.dispatchEvent(new Event('authChange'));
    } catch (error) {
      console.error('Error updating profile:', error);
      console.error('Error details:', error.message);
      console.error('Error code:', error.code);

      // Show more detailed error message
      const errorMessage = error.details
        ? `${error.message || 'Failed to update profile'}\n\n${error.details}`
        : error.message || 'Failed to update profile. Please try again.';

      alert(errorMessage);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 md:px-8 py-8 md:py-12">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto">
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-full flex items-center justify-center shadow-xl flex-shrink-0">
                    {user.picture ? (
                      <img
                        src={user.picture}
                        alt={user.name || 'User'}
                        className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-10 h-10 md:w-12 md:h-12 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 truncate">
                      {isEditing ? (
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="bg-white/20 text-white placeholder-white/70 border border-white/30 rounded-lg px-4 py-2 w-full max-w-md"
                          placeholder="Your Name"
                        />
                      ) : (
                        user.name || 'User'
                      )}
                    </h1>
                    <div className="flex items-center gap-2 text-blue-100 text-sm md:text-base">
                      <Mail className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{user.email}</span>
                    </div>
                    {userRole === 'main_admin' && (
                      <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-purple-500/30 backdrop-blur-sm rounded-full">
                        <Shield className="w-4 h-4 text-white" />
                        <span className="text-xs md:text-sm font-semibold text-white">Main Admin</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-shrink-0 w-full md:w-auto flex items-center gap-2">
                  <button
                    type="button"
                    onClick={refetchUserData}
                    disabled={refreshing}
                    className="p-2 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-all disabled:opacity-50"
                    title="Refresh profile (get latest role from server)"
                  >
                    <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                  </button>
                  {isEditing ? (
                    <div className="flex gap-2 w-full md:w-auto">
                      <button
                        onClick={handleSave}
                        className="flex-1 md:flex-none px-6 py-2.5 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-lg"
                      >
                        <Save className="w-4 h-4" />
                        Save
                      </button>
                      <button
                        onClick={handleCancel}
                        className="flex-1 md:flex-none px-6 py-2.5 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all duration-200 flex items-center justify-center gap-2 font-medium border border-white/30"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleEdit}
                      className="w-full md:w-auto px-6 py-2.5 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-lg"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit Profile
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <div className="px-6 md:px-8 py-6 md:py-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                {/* Email */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-5 md:p-6 border border-gray-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <label className="text-sm font-semibold text-gray-700">Email</label>
                  </div>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-all bg-white"
                    />
                  ) : (
                    <p className="text-gray-800 font-medium break-all">{user.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-5 md:p-6 border border-gray-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <User className="w-5 h-5 text-green-600" />
                    </div>
                    <label className="text-sm font-semibold text-gray-700">Phone</label>
                  </div>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter your phone number"
                      className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-all bg-white"
                    />
                  ) : (
                    <p className="text-gray-800 font-medium">{user.phone || 'Not provided'}</p>
                  )}
                </div>

                {/* Account Created */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-5 md:p-6 border border-gray-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-purple-600" />
                    </div>
                    <label className="text-sm font-semibold text-gray-700">Member Since</label>
                  </div>
                  <p className="text-gray-800 font-medium">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })
                      : 'Recently'}
                  </p>
                </div>

                {/* User ID */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-5 md:p-6 border border-gray-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <User className="w-5 h-5 text-indigo-600" />
                    </div>
                    <label className="text-sm font-semibold text-gray-700">User ID</label>
                  </div>
                  <p className="text-gray-800 font-medium">#{user.id}</p>
                </div>
              </div>

              {/* Bio */}
              <div className="mt-6 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-5 md:p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-amber-600" />
                  </div>
                  <label className="text-sm font-semibold text-gray-700">Bio</label>
                </div>
                {isEditing ? (
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell us about yourself..."
                    rows="4"
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-all resize-none bg-white"
                  />
                ) : (
                  <p className="text-gray-800 leading-relaxed">
                    {user.bio || 'No bio added yet. Click "Edit Profile" to add one.'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Admin Panel Section (Only for main_admin) */}
          {userRole === 'main_admin' && (
            <div className="mb-8 bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="px-6 md:px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 via-pink-50 to-rose-50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Admin Panel</h2>
                    <p className="text-sm text-gray-600 mt-0.5">Manage websites, users, and approvals</p>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
                  <button
                    onClick={() => setActiveTab('websites')}
                    className={`px-4 md:px-6 py-3 font-semibold transition-all whitespace-nowrap ${activeTab === 'websites'
                      ? 'text-purple-600 border-b-2 border-purple-600'
                      : 'text-gray-500 hover:text-gray-700'
                      }`}
                  >
                    My Websites
                  </button>
                  <button
                    onClick={() => setActiveTab('admin')}
                    className={`px-4 md:px-6 py-3 font-semibold transition-all relative whitespace-nowrap ${activeTab === 'admin'
                      ? 'text-purple-600 border-b-2 border-purple-600'
                      : 'text-gray-500 hover:text-gray-700'
                      }`}
                  >
                    Admin Dashboard
                    {(pendingApprovals.length > 0 || pendingEditApprovals.length > 0) && (
                      <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                        {pendingApprovals.length + pendingEditApprovals.length}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={async () => {
                      setActiveTab('all-businesses');
                      if (allBusinesses.length === 0) {
                        setLoadingAllBusinesses(true);
                        try {
                          const res = await businessAPI.getAllBusinesses();
                          setAllBusinesses(res.businesses || []);
                        } catch (error) {
                          console.error('Error fetching all businesses:', error);
                          alert('Error: ' + error.message);
                        } finally {
                          setLoadingAllBusinesses(false);
                        }
                      }
                    }}
                    className={`px-4 md:px-6 py-3 font-semibold transition-all whitespace-nowrap ${activeTab === 'all-businesses'
                      ? 'text-purple-600 border-b-2 border-purple-600'
                      : 'text-gray-500 hover:text-gray-700'
                      }`}
                  >
                    All Websites
                  </button>
                  <button
                    onClick={async () => {
                      setActiveTab('analytics');
                      if (!unifiedAnalytics) {
                        setLoadingAnalytics(true);
                        try {
                          const res = await businessAPI.getAllAnalytics();
                          setUnifiedAnalytics(res);
                        } catch (error) {
                          console.error('Error fetching unified analytics:', error);
                          alert('Error: ' + error.message);
                        } finally {
                          setLoadingAnalytics(false);
                        }
                      }
                    }}
                    className={`px-4 md:px-6 py-3 font-semibold transition-all whitespace-nowrap ${activeTab === 'analytics'
                      ? 'text-purple-600 border-b-2 border-purple-600'
                      : 'text-gray-500 hover:text-gray-700'
                      }`}
                  >
                    📊 All Analytics
                  </button>
                </div>
              </div>

              {activeTab === 'admin' && (
                <div className="p-6 md:p-8">
                  {loadingAdmin ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                      <p className="mt-4 text-gray-600">Loading admin data...</p>
                    </div>
                  ) : (
                    <div className="space-y-6 md:space-y-8">
                      {/* Bulk Import Action */}
                      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
                        <div>
                          <h3 className="text-xl font-bold flex items-center gap-2">
                            <Upload className="w-6 h-6" />
                            Bulk Business Import
                          </h3>
                          <p className="text-blue-100 mt-1">
                            Search Google Maps and import multiple businesses at once to populate the directory.
                          </p>
                        </div>
                        <Link
                          to="/admin/bulk-import"
                          className="px-6 py-3 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition-all shadow-md whitespace-nowrap"
                        >
                          Go to Bulk Import
                        </Link>
                      </div>

                      {/* Admin Stats */}
                      {adminStats && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
                          <div className="bg-blue-50 rounded-xl p-3 md:p-4 border-2 border-blue-200">
                            <div className="flex items-center gap-2 mb-2">
                              <Users className="w-4 h-4 md:w-5 md:h-5 text-blue-600 flex-shrink-0" />
                              <span className="text-xs md:text-sm font-medium text-blue-900 truncate">Total Users</span>
                            </div>
                            <p className="text-xl md:text-2xl font-bold text-blue-700">{adminStats.totalUsers}</p>
                          </div>
                          <div className="bg-green-50 rounded-xl p-3 md:p-4 border-2 border-green-200">
                            <div className="flex items-center gap-2 mb-2">
                              <Building2 className="w-4 h-4 md:w-5 md:h-5 text-green-600 flex-shrink-0" />
                              <span className="text-xs md:text-sm font-medium text-green-900 truncate">Total Websites</span>
                            </div>
                            <p className="text-xl md:text-2xl font-bold text-green-700">{adminStats.totalBusinesses}</p>
                          </div>
                          <div className="bg-yellow-50 rounded-xl p-3 md:p-4 border-2 border-yellow-200">
                            <div className="flex items-center gap-2 mb-2">
                              <Clock className="w-4 h-4 md:w-5 md:h-5 text-yellow-600 flex-shrink-0" />
                              <span className="text-xs md:text-sm font-medium text-yellow-900 truncate">Pending Approvals</span>
                            </div>
                            <p className="text-xl md:text-2xl font-bold text-yellow-700">{adminStats.pendingApprovals}</p>
                          </div>
                          <div className="bg-orange-50 rounded-xl p-3 md:p-4 border-2 border-orange-200">
                            <div className="flex items-center gap-2 mb-2">
                              <FileText className="w-4 h-4 md:w-5 md:h-5 text-orange-600 flex-shrink-0" />
                              <span className="text-xs md:text-sm font-medium text-orange-900 truncate">Pending Edits</span>
                            </div>
                            <p className="text-xl md:text-2xl font-bold text-orange-700">{adminStats.pendingEdits}</p>
                          </div>
                          <div className="bg-emerald-50 rounded-xl p-3 md:p-4 border-2 border-emerald-200">
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-emerald-600 flex-shrink-0" />
                              <span className="text-xs md:text-sm font-medium text-emerald-900 truncate">Approved</span>
                            </div>
                            <p className="text-xl md:text-2xl font-bold text-emerald-700">{adminStats.approvedBusinesses}</p>
                          </div>
                          <div className="bg-red-50 rounded-xl p-3 md:p-4 border-2 border-red-200">
                            <div className="flex items-center gap-2 mb-2">
                              <XCircle className="w-4 h-4 md:w-5 md:h-5 text-red-600 flex-shrink-0" />
                              <span className="text-xs md:text-sm font-medium text-red-900 truncate">Rejected</span>
                            </div>
                            <p className="text-xl md:text-2xl font-bold text-red-700">{adminStats.rejectedBusinesses}</p>
                          </div>
                        </div>
                      )}

                      {/* Pending Website Approvals */}
                      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-5 md:p-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                          <div className="flex items-center gap-3 flex-wrap">
                            <Clock className="w-6 h-6 text-yellow-700 flex-shrink-0" />
                            <h3 className="text-lg md:text-xl font-bold text-gray-900">Pending Website Approvals</h3>
                            {pendingApprovals.length > 0 && (
                              <label className="flex items-center gap-2 ml-4 cursor-pointer select-none bg-white px-3 py-1 rounded-full border border-yellow-300">
                                <input
                                  type="checkbox"
                                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  checked={selectedApprovals.length === pendingApprovals.length && pendingApprovals.length > 0}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedApprovals(pendingApprovals.map(b => b.id));
                                    } else {
                                      setSelectedApprovals([]);
                                    }
                                  }}
                                />
                                <span className="text-sm font-bold text-yellow-800">Select All ({pendingApprovals.length})</span>
                              </label>
                            )}
                          </div>

                          {/* Bulk Action Buttons */}
                          {selectedApprovals.length > 0 && (
                            <div className="flex gap-2 animate-fade-in w-full sm:w-auto mt-2 sm:mt-0">
                              <button
                                onClick={async () => {
                                  if (!window.confirm(`Approve ${selectedApprovals.length} websites?`)) return;
                                  try {
                                    // Optimistic UI update
                                    const approvedIds = [...selectedApprovals];
                                    setPendingApprovals(pendingApprovals.filter(b => !approvedIds.includes(b.id)));
                                    setSelectedApprovals([]);

                                    // Process in parallel
                                    await Promise.all(approvedIds.map(id => businessAPI.approveWebsite(id)));

                                    // Refresh stats
                                    const statsRes = await businessAPI.getAdminStats();
                                    setAdminStats(statsRes.stats);
                                    alert('Selected websites approved!');
                                  } catch (error) {
                                    alert('Error during bulk approval: ' + error.message);
                                    const approvalsRes = await businessAPI.getPendingApprovals();
                                    setPendingApprovals(approvalsRes.businesses || []);
                                  }
                                }}
                                className="flex-1 sm:flex-none px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center justify-center gap-2 font-bold text-sm shadow-md whitespace-nowrap"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Approve ({selectedApprovals.length})
                              </button>
                              <button
                                onClick={async () => {
                                  const reason = prompt(`Enter rejection reason for ${selectedApprovals.length} websites (optional):`);
                                  if (reason === null) return;

                                  try {
                                    const rejectedIds = [...selectedApprovals];
                                    setPendingApprovals(pendingApprovals.filter(b => !rejectedIds.includes(b.id)));
                                    setSelectedApprovals([]);

                                    await Promise.all(rejectedIds.map(id => businessAPI.rejectWebsite(id, reason)));

                                    const statsRes = await businessAPI.getAdminStats();
                                    setAdminStats(statsRes.stats);
                                    alert('Selected websites rejected.');
                                  } catch (error) {
                                    alert('Error during bulk rejection: ' + error.message);
                                    const approvalsRes = await businessAPI.getPendingApprovals();
                                    setPendingApprovals(approvalsRes.businesses || []);
                                  }
                                }}
                                className="flex-1 sm:flex-none px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all flex items-center justify-center gap-2 font-bold text-sm shadow-md whitespace-nowrap"
                              >
                                <XCircle className="w-4 h-4" />
                                Reject ({selectedApprovals.length})
                              </button>
                            </div>
                          )}
                        </div>
                        {pendingApprovals.length === 0 ? (
                          <p className="text-gray-600 text-center py-4">No pending website approvals</p>
                        ) : (
                          <div className="space-y-4">
                            {pendingApprovals.map((business) => (
                              <div key={business.id} className={`bg-white rounded-lg p-4 md:p-5 border-2 transition-colors ${selectedApprovals.includes(business.id) ? 'border-blue-500 bg-blue-50' : 'border-yellow-300'}`}>
                                <div className="flex gap-4">
                                  <div className="pt-1">
                                    <input
                                      type="checkbox"
                                      className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                      checked={selectedApprovals.includes(business.id)}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setSelectedApprovals([...selectedApprovals, business.id]);
                                        } else {
                                          setSelectedApprovals(selectedApprovals.filter(id => id !== business.id));
                                        }
                                      }}
                                    />
                                  </div>
                                  <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-bold text-gray-900 mb-1 truncate">{business.businessName}</h4>
                                      <p className="text-sm text-gray-600 mb-2 truncate">{business.category} • {business.email}</p>
                                      <p className="text-xs text-gray-500">Created: {new Date(business.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                    </div>
                                    <div className="flex gap-2 w-full sm:w-auto flex-shrink-0">
                                      <button
                                        onClick={async () => {
                                          try {
                                            await businessAPI.approveWebsite(business.id);
                                            setPendingApprovals(pendingApprovals.filter(b => b.id !== business.id));
                                            const statsRes = await businessAPI.getAdminStats();
                                            setAdminStats(statsRes.stats);
                                            alert('Website approved! User has been promoted to Content Admin.');
                                          } catch (error) {
                                            alert('Error: ' + error.message);
                                          }
                                        }}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center gap-2 font-medium text-sm"
                                      >
                                        <CheckCircle className="w-4 h-4" />
                                        Approve
                                      </button>
                                      <button
                                        onClick={async () => {
                                          const reason = prompt('Enter rejection reason (optional):');
                                          try {
                                            await businessAPI.rejectWebsite(business.id, reason);
                                            setPendingApprovals(pendingApprovals.filter(b => b.id !== business.id));
                                            const statsRes = await businessAPI.getAdminStats();
                                            setAdminStats(statsRes.stats);
                                            alert('Website rejected.');
                                          } catch (error) {
                                            alert('Error: ' + error.message);
                                          }
                                        }}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all flex items-center gap-2 font-medium text-sm"
                                      >
                                        <XCircle className="w-4 h-4" />
                                        Reject
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Pending Edit Approvals */}
                      <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-5 md:p-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                          <div className="flex items-center gap-3 flex-wrap">
                            <FileText className="w-6 h-6 text-orange-700 flex-shrink-0" />
                            <h3 className="text-lg md:text-xl font-bold text-gray-900">Pending Edit Approvals</h3>
                            {pendingEditApprovals.length > 0 && (
                              <span className="px-3 py-1 bg-orange-600 text-white rounded-full text-sm font-bold">
                                {pendingEditApprovals.length}
                              </span>
                            )}
                          </div>
                        </div>
                        {pendingEditApprovals.length === 0 ? (
                          <p className="text-gray-600 text-center py-4">No pending edit approvals</p>
                        ) : (
                          <div className="space-y-4">
                            {pendingEditApprovals.map((business) => (
                              <div key={business.id} className="bg-white rounded-lg p-4 md:p-5 border-2 border-orange-300">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-gray-900 mb-1 truncate">{business.businessName}</h4>
                                    <p className="text-sm text-gray-600 mb-2 truncate">{business.category}</p>
                                    <p className="text-xs text-gray-500">Updated: {new Date(business.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                  </div>
                                  <div className="flex gap-2 w-full sm:w-auto flex-shrink-0">
                                    <a
                                      href={business.subdirectoryUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2 font-medium text-sm"
                                    >
                                      <ExternalLink className="w-4 h-4" />
                                      View
                                    </a>
                                    <button
                                      onClick={async () => {
                                        try {
                                          await businessAPI.approveEdit(business.id);
                                          setPendingEditApprovals(pendingEditApprovals.filter(b => b.id !== business.id));
                                          const statsRes = await businessAPI.getAdminStats();
                                          setAdminStats(statsRes.stats);
                                          alert('Edit approved!');
                                        } catch (error) {
                                          alert('Error: ' + error.message);
                                        }
                                      }}
                                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center gap-2 font-medium text-sm"
                                    >
                                      <CheckCircle className="w-4 h-4" />
                                      Approve
                                    </button>
                                    <button
                                      onClick={async () => {
                                        const reason = prompt('Enter rejection reason (optional):');
                                        try {
                                          await businessAPI.rejectEdit(business.id, reason);
                                          setPendingEditApprovals(pendingEditApprovals.filter(b => b.id !== business.id));
                                          const statsRes = await businessAPI.getAdminStats();
                                          setAdminStats(statsRes.stats);
                                          alert('Edit rejected.');
                                        } catch (error) {
                                          alert('Error: ' + error.message);
                                        }
                                      }}
                                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all flex items-center gap-2 font-medium text-sm"
                                    >
                                      <XCircle className="w-4 h-4" />
                                      Reject
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* User Management */}
                      <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-5 md:p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <Users className="w-6 h-6 text-gray-700 flex-shrink-0" />
                          <h3 className="text-lg md:text-xl font-bold text-gray-900">User Management</h3>
                        </div>
                        {allUsers.length === 0 ? (
                          <p className="text-gray-600 text-center py-4">No users found</p>
                        ) : (
                          <div className="overflow-x-auto -mx-2 md:mx-0">
                            <div className="inline-block min-w-full align-middle">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-100">
                                  <tr>
                                    <th className="px-3 md:px-4 py-3 text-left text-xs md:text-sm font-semibold text-gray-700 uppercase tracking-wider">Name</th>
                                    <th className="px-3 md:px-4 py-3 text-left text-xs md:text-sm font-semibold text-gray-700 uppercase tracking-wider">Email</th>
                                    <th className="px-3 md:px-4 py-3 text-left text-xs md:text-sm font-semibold text-gray-700 uppercase tracking-wider">Role</th>
                                    <th className="px-3 md:px-4 py-3 text-left text-xs md:text-sm font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {allUsers.map((u) => (
                                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                                      <td className="px-3 md:px-4 py-3 whitespace-nowrap text-sm text-gray-900">{u.name || 'N/A'}</td>
                                      <td className="px-3 md:px-4 py-3 whitespace-nowrap text-sm text-gray-600 truncate max-w-xs">{u.email}</td>
                                      <td className="px-3 md:px-4 py-3 whitespace-nowrap">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${u.role === 'main_admin' ? 'bg-purple-100 text-purple-700' :
                                          u.role === 'content_admin' ? 'bg-blue-100 text-blue-700' :
                                            'bg-gray-100 text-gray-700'
                                          }`}>
                                          {u.role || 'normal'}
                                        </span>
                                      </td>
                                      <td className="px-3 md:px-4 py-3 whitespace-nowrap">
                                        {u.role !== 'main_admin' && (
                                          <select
                                            value={u.role || 'normal'}
                                            onChange={async (e) => {
                                              try {
                                                await businessAPI.updateUserRole(u.id, e.target.value);
                                                setAllUsers(allUsers.map(user =>
                                                  user.id === u.id ? { ...user, role: e.target.value } : user
                                                ));
                                                alert('User role updated!');
                                              } catch (error) {
                                                alert('Error: ' + error.message);
                                              }
                                            }}
                                            className="px-2 md:px-3 py-1.5 border-2 border-gray-300 rounded-lg text-xs md:text-sm font-medium bg-white"
                                          >
                                            <option value="normal">Normal</option>
                                            <option value="content_admin">Content Admin</option>
                                          </select>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {/* All Businesses Tab */}
              {activeTab === 'all-businesses' && (
                <div className="p-6 md:p-8">
                  {loadingAllBusinesses ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                      <p className="mt-4 text-gray-600">Loading all businesses...</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl md:text-2xl font-bold text-gray-900">All Websites ({allBusinesses.length})</h3>
                      </div>
                      {allBusinesses.length === 0 ? (
                        <p className="text-gray-600 text-center py-8">No businesses found</p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                          {allBusinesses.map((business) => (
                            <div key={business.id} className="bg-white rounded-xl shadow-lg p-4 md:p-6 border-2 border-gray-200 hover:shadow-xl transition-shadow">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-lg md:text-xl font-bold text-gray-900 mb-1 truncate">{business.businessName}</h4>
                                  <p className="text-sm text-gray-600 mb-2 truncate">{business.category}</p>
                                  <p className="text-xs text-gray-500 mb-1">Owner: {business.ownerName || 'N/A'}</p>
                                  <p className="text-xs text-gray-500 mb-2">{business.ownerEmail || 'N/A'}</p>
                                  <div className="flex flex-wrap gap-2 mb-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${business.status === 'approved' ? 'bg-green-100 text-green-700' :
                                      business.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-red-100 text-red-700'
                                      }`}>
                                      {business.status}
                                    </span>
                                    {business.isPremium && (
                                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 flex items-center gap-1">
                                        <BadgeCheck className="w-3 h-3" />
                                        Verified
                                      </span>
                                    )}
                                    {business.editApprovalStatus === 'pending' && (
                                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                                        Edit Pending
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col gap-2">
                                <div className="flex gap-2">
                                  <Link
                                    to={`/edit-website/${business.id}`}
                                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 font-medium text-sm"
                                    title="Edit this website"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                    Edit
                                  </Link>
                                  <a
                                    href={business.subdirectoryUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all flex items-center justify-center gap-2 font-medium text-sm"
                                    title="View website"
                                  >
                                    <Eye className="w-4 h-4" />
                                    View
                                  </a>
                                  <button
                                    onClick={async () => {
                                      if (window.confirm(`Are you sure you want to delete "${business.businessName}"? This action cannot be undone.`)) {
                                        try {
                                          await businessAPI.deleteBusiness(business.id);
                                          setAllBusinesses(allBusinesses.filter(b => b.id !== business.id));
                                          alert('Business deleted successfully!');
                                        } catch (error) {
                                          alert('Error: ' + error.message);
                                        }
                                      }
                                    }}
                                    className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all flex items-center justify-center gap-2 font-medium text-sm"
                                    title="Delete this website"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                                <Link
                                  to={`/analytics/${business.id}`}
                                  className="w-full px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all flex items-center justify-center gap-2 font-medium text-sm"
                                  title="View analytics"
                                >
                                  <BarChart3 className="w-4 h-4" />
                                  Analytics
                                </Link>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Unified Analytics Tab */}
              {activeTab === 'analytics' && (
                <div className="p-6 md:p-8">
                  {loadingAnalytics ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                      <p className="mt-4 text-gray-600">Loading unified analytics...</p>
                    </div>
                  ) : unifiedAnalytics ? (
                    <div className="space-y-6">
                      {/* Overall Totals */}
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-xl p-6 md:p-8 border-2 border-purple-200">
                        <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Overall Platform Analytics</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                          <div className="bg-white rounded-xl p-4 shadow-lg">
                            <p className="text-sm text-gray-600 mb-1">Total Visitors</p>
                            <p className="text-2xl md:text-3xl font-bold text-blue-600">{unifiedAnalytics.totals.totalVisitors.toLocaleString('en-IN')}</p>
                          </div>
                          <div className="bg-white rounded-xl p-4 shadow-lg">
                            <p className="text-sm text-gray-600 mb-1">Call Clicks</p>
                            <p className="text-2xl md:text-3xl font-bold text-green-600">{unifiedAnalytics.totals.totalCallClicks.toLocaleString('en-IN')}</p>
                          </div>
                          <div className="bg-white rounded-xl p-4 shadow-lg">
                            <p className="text-sm text-gray-600 mb-1">WhatsApp Clicks</p>
                            <p className="text-2xl md:text-3xl font-bold text-emerald-600">{unifiedAnalytics.totals.totalWhatsAppClicks.toLocaleString('en-IN')}</p>
                          </div>
                          <div className="bg-white rounded-xl p-4 shadow-lg">
                            <p className="text-sm text-gray-600 mb-1">Gallery Views</p>
                            <p className="text-2xl md:text-3xl font-bold text-purple-600">{unifiedAnalytics.totals.totalGalleryViews.toLocaleString('en-IN')}</p>
                          </div>
                          <div className="bg-white rounded-xl p-4 shadow-lg">
                            <p className="text-sm text-gray-600 mb-1">Map Clicks</p>
                            <p className="text-2xl md:text-3xl font-bold text-red-600">{unifiedAnalytics.totals.totalMapClicks.toLocaleString('en-IN')}</p>
                          </div>
                          <div className="bg-white rounded-xl p-4 shadow-lg">
                            <p className="text-sm text-gray-600 mb-1">Total Interactions</p>
                            <p className="text-2xl md:text-3xl font-bold text-indigo-600">{unifiedAnalytics.totals.totalInteractions.toLocaleString('en-IN')}</p>
                          </div>
                        </div>
                      </div>

                      {/* Individual Business Analytics */}
                      <div>
                        <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Business-wise Analytics</h3>
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Business</th>
                                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Visitors</th>
                                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Calls</th>
                                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">WhatsApp</th>
                                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Gallery</th>
                                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Maps</th>
                                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Total</th>
                                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {unifiedAnalytics.businesses.map((analytics) => (
                                  <tr key={analytics.businessId} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 whitespace-nowrap">
                                      <div className="text-sm font-semibold text-gray-900">{analytics.businessName}</div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-center">
                                      <span className="text-sm font-bold text-blue-600">{parseInt(analytics.visitor_count || 0).toLocaleString('en-IN')}</span>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-center">
                                      <span className="text-sm font-bold text-green-600">{parseInt(analytics.call_clicks || 0).toLocaleString('en-IN')}</span>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-center">
                                      <span className="text-sm font-bold text-emerald-600">{parseInt(analytics.whatsapp_clicks || 0).toLocaleString('en-IN')}</span>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-center">
                                      <span className="text-sm font-bold text-purple-600">{parseInt(analytics.gallery_views || 0).toLocaleString('en-IN')}</span>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-center">
                                      <span className="text-sm font-bold text-red-600">{parseInt(analytics.map_clicks || 0).toLocaleString('en-IN')}</span>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-center">
                                      <span className="text-sm font-bold text-indigo-600">{analytics.totalInteractions.toLocaleString('en-IN')}</span>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-center">
                                      <Link
                                        to={`/analytics/${analytics.businessId}`}
                                        className="inline-flex items-center gap-1 px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all text-xs font-medium"
                                      >
                                        <BarChart3 className="w-3 h-3" />
                                        Details
                                      </Link>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-600 text-center py-8">No analytics data available</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* My Businesses Section */}
          <div className="mt-8 bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="px-6 md:px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900">My Websites</h2>
                    <p className="text-sm text-gray-600 mt-0.5">Manage and edit your business websites</p>
                  </div>
                </div>
                <Link
                  to="/create-website"
                  className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-lg hover:shadow-xl"
                >
                  <Plus className="w-5 h-5" />
                  Create New
                </Link>
              </div>
              {businesses.length > 0 && (
                <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 flex items-start gap-3">
                  <Edit2 className="w-5 h-5 text-blue-700 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-blue-900">Quick Edit:</p>
                    <p className="text-sm text-blue-800 mt-1">Click the <strong>"✏️ Edit Website"</strong> button on any business card below to edit your website details, change theme, update services, and more!</p>
                  </div>
                </div>
              )}
              {!loadingBusinesses && businesses.length === 0 && (
                <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-yellow-700 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-yellow-900">No Websites Found</p>
                    <p className="text-sm text-yellow-800 mt-1">If you've created websites before, they might not be linked to your account. Please create a new website or contact support.</p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 md:p-8">
              {loadingBusinesses ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading your websites...</p>
                </div>
              ) : businesses.length === 0 ? (
                <div className="text-center py-12">
                  <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg mb-4">You haven't created any websites yet.</p>
                  <Link
                    to="/create-website"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-lg"
                  >
                    <Plus className="w-5 h-5" />
                    Create Your First Website
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {businesses.slice(0, 5).map((business) => (
                    <div key={business.id} className="border-2 border-blue-200 rounded-xl p-5 md:p-6 hover:border-blue-400 hover:shadow-xl transition-all bg-white flex flex-col">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1 truncate">{business.businessName}</h3>
                          <p className="text-sm text-gray-500 truncate">{business.category}</p>
                        </div>
                        {business.logoUrl && (
                          <img src={business.logoUrl} alt={business.businessName} className="w-12 h-12 md:w-14 md:h-14 rounded-lg object-cover border-2 border-gray-200 flex-shrink-0 ml-2" />
                        )}
                      </div>
                      <div className="space-y-2 mb-4 flex-1">
                        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                          <span className="font-medium">Status:</span>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${business.status === 'approved' ? 'bg-green-100 text-green-700' :
                            business.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                            {business.status}
                          </span>
                          {business.editApprovalStatus === 'pending' && (
                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                              Edit Pending
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="font-medium">Theme:</span>
                          <span className="capitalize px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">{business.theme || 'modern'}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-3 mt-auto">
                        <div className="flex flex-col sm:flex-row gap-2 w-full">
                          <Link
                            to={`/edit-website/${business.id}`}
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2 font-bold text-sm md:text-base shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                            title="Edit this website - Change theme, update details, modify services"
                          >
                            <Edit2 className="w-5 h-5 md:w-6 md:h-6" />
                            <span>✏️ Edit Website</span>
                          </Link>
                          <Link
                            to={`/analytics/${business.id}`}
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center justify-center gap-2 font-bold text-sm md:text-base shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                            title="View analytics - Visitors, clicks, and engagement metrics"
                          >
                            <BarChart3 className="w-5 h-5 md:w-6 md:h-6" />
                            <span>📊 Analytics</span>
                          </Link>
                        </div>
                        <div className="flex gap-2">
                          <a
                            href={business.subdomainUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 px-3 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-all duration-200 flex items-center justify-center gap-2 font-medium text-xs md:text-sm border border-indigo-300"
                            title="View your website via subdomain"
                          >
                            <ExternalLink className="w-4 h-4" />
                            View Website
                          </a>
                        </div>
                        <Link
                          to={`/qrcode/${business.id}`}
                          className="w-full px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 flex items-center justify-center gap-2 font-medium text-xs md:text-sm shadow-md hover:shadow-lg mt-2"
                          title="Generate QR code for your website"
                        >
                          <QrCode className="w-4 h-4" />
                          QR Code
                        </Link>
                        {!business.isPremium && business.status === 'approved' && (
                          <button
                            onClick={async () => {
                              if (window.confirm('Upgrade to Premium?\n\nBenefits:\n✓ Blue verified badge\n✓ Higher ranking in directory\n✓ Increased visibility\n\nProceed with upgrade?')) {
                                try {
                                  await businessAPI.upgradeToPremium(business.id);
                                  // Refresh businesses list
                                  const res = await businessAPI.getUserBusinesses();
                                  setBusinesses(res.businesses || []);
                                  alert('🎉 Congratulations! Your business is now Premium with a verified badge!');
                                } catch (error) {
                                  alert('Error: ' + error.message);
                                }
                              }
                            }}
                            className="w-full px-4 py-3 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white rounded-xl hover:from-yellow-600 hover:via-orange-600 hover:to-red-600 transition-all duration-200 flex items-center justify-center gap-2 font-bold text-sm md:text-base shadow-lg hover:shadow-xl transform hover:scale-[1.02] mt-2"
                            title="Upgrade to Premium - Get verified badge and higher ranking"
                          >
                            <Sparkles className="w-5 h-5 md:w-6 md:h-6" />
                            <span>⭐ Upgrade to Premium</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>


        </div>
      </div>
    </>
  );
};

export default Profile;

