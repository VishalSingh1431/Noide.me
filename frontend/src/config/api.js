import { API_BASE_URL } from './constants';

// API Configuration

// Helper function to make API calls
export const apiCall = async (endpoint, options = {}) => {
  let token = null;
  try {
    token = localStorage.getItem('token');
  } catch (storageError) {
    console.warn('localStorage not available:', storageError);
  }
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    // Check if response is JSON before parsing
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      try {
        data = await response.json();
      } catch (jsonError) {
        // If JSON parsing fails, try to get text for error message
        const text = await response.text();
        throw new Error(`Invalid JSON response: ${text.substring(0, 100)}`);
      }
    } else {
      // If not JSON, get text response
      const text = await response.text();
      throw new Error(`Server returned non-JSON response (${response.status}): ${text.substring(0, 200)}`);
    }

    if (!response.ok) {
      // Check if token has expired - auto logout
      if (response.status === 401 && (data.error === 'Token has expired' || data.error === 'Invalid token')) {
        // Clear token and user data with error handling
        try {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        } catch (storageError) {
          console.warn('Failed to clear localStorage:', storageError);
        }
        // Dispatch event to update navbar and other components
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('authChange'));
          // Redirect to login page
          if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
            window.location.href = '/login';
          }
        }
        // Throw a special error that won't show alert
        const expiredError = new Error('Token has expired');
        expiredError.isTokenExpired = true;
        throw expiredError;
      }
      
      // If there's a help message, include it in the error
      const errorMessage = data.help 
        ? `${data.error}\n\n${data.help}`
        : data.error || 'Request failed';
      const error = new Error(errorMessage);
      error.help = data.help;
      error.code = data.code;
      throw error;
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    // If it's a network error, provide helpful message
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      const networkError = new Error('Cannot connect to server. Make sure the backend server is running on port 5000.');
      networkError.help = 'Start the backend server with: cd backend && npm run dev';
      throw networkError;
    }
    throw error;
  }
};

// Auth API functions
export const authAPI = {
  sendOTP: async (email) => {
    return apiCall('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  verifyOTP: async (email, otp, isSignup) => {
    return apiCall('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp, isSignup }),
    });
  },

  googleAuth: async (tokenId) => {
    return apiCall('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ tokenId }),
    });
  },

  verifyToken: async () => {
    return apiCall('/auth/verify', {
      method: 'GET',
    });
  },

  getCurrentUser: async () => {
    return apiCall('/auth/me', {
      method: 'GET',
    });
  },

  updateProfile: async (profileData) => {
    return apiCall('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },
};

// Business API functions
export const analyticsAPI = {
  getAnalytics: async (businessId, period = 'all') => {
    return apiCall(`/analytics/${businessId}?period=${period}`, { method: 'GET' });
  },
  getUserAnalytics: async () => {
    return apiCall('/analytics/user/all', { method: 'GET' });
  },
};

export const businessAPI = {
  getPublicStats: async () => {
    return apiCall('/business/stats', {
      method: 'GET',
    });
  },

  getUserBusinesses: async () => {
    return apiCall('/business/my-businesses', {
      method: 'GET',
    });
  },

  getBusinessById: async (id) => {
    return apiCall(`/business/edit/${id}`, {
      method: 'GET',
    });
  },

  checkSubdomainAvailability: async (slug) => {
    return apiCall(`/business/check-subdomain?slug=${encodeURIComponent(slug)}`, {
      method: 'GET',
    });
  },

  getPendingApprovals: async () => {
    return apiCall('/admin/pending-approvals', {
      method: 'GET',
    });
  },

  getPendingEditApprovals: async () => {
    return apiCall('/admin/pending-edit-approvals', {
      method: 'GET',
    });
  },

  approveWebsite: async (id) => {
    return apiCall(`/admin/approve-website/${id}`, {
      method: 'POST',
    });
  },

  rejectWebsite: async (id, reason) => {
    return apiCall(`/admin/reject-website/${id}`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  approveEdit: async (id) => {
    return apiCall(`/admin/approve-edit/${id}`, {
      method: 'POST',
    });
  },

  rejectEdit: async (id, reason) => {
    return apiCall(`/admin/reject-edit/${id}`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  getAllUsers: async () => {
    return apiCall('/admin/users', {
      method: 'GET',
    });
  },

  updateUserRole: async (id, role) => {
    return apiCall(`/admin/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  },

  getAdminStats: async () => {
    return apiCall('/admin/stats', {
      method: 'GET',
    });
  },

  // Admin business management
  getAllBusinesses: async () => {
    return apiCall('/admin/businesses', { method: 'GET' });
  },

  deleteBusiness: async (id) => {
    return apiCall(`/admin/businesses/${id}`, { method: 'DELETE' });
  },

  updateBusinessAdmin: async (id, formData) => {
    const submitData = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === 'services' || key === 'specialOffers' || key === 'businessHours' || key === 'appointmentSettings') {
        submitData.append(key, JSON.stringify(formData[key] || (key === 'businessHours' || key === 'appointmentSettings' ? {} : [])));
      } else if (key !== 'logo' && key !== 'images' && !key.startsWith('serviceImage_')) {
        submitData.append(key, formData[key] || '');
      }
    });

    // Add files
    if (formData.logo) {
      submitData.append('logo', formData.logo);
    }
    if (formData.images && Array.isArray(formData.images)) {
      formData.images.forEach((image) => {
        submitData.append('images', image);
      });
    }
    if (formData.services && Array.isArray(formData.services)) {
      formData.services.forEach((service, index) => {
        if (service.image) {
          submitData.append(`serviceImage_${index}`, service.image);
        }
      });
    }

    let token = null;
    try {
      token = localStorage.getItem('token');
    } catch (storageError) {
      console.warn('localStorage not available:', storageError);
    }
    
    const response = await fetch(`${API_BASE_URL}/admin/businesses/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: submitData,
    });

    // Check if response is JSON before parsing
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      try {
        data = await response.json();
      } catch (jsonError) {
        const text = await response.text();
        throw new Error(`Invalid JSON response: ${text.substring(0, 100)}`);
      }
    } else {
      const text = await response.text();
      throw new Error(`Server returned non-JSON response (${response.status}): ${text.substring(0, 200)}`);
    }
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to update business');
    }
    return data;
  },

  // Unified analytics
  getAllAnalytics: async () => {
    return apiCall('/admin/analytics/all', { method: 'GET' });
  },

  // Premium upgrade
  upgradeToPremium: async (businessId) => {
    return apiCall(`/business/${businessId}/upgrade-premium`, { method: 'POST' });
  },

  // QR Code
  getQRCode: async (businessId) => {
    return apiCall(`/business/${businessId}/qrcode`, { method: 'GET' });
  },

  updateBusiness: async (id, formData) => {
    const submitData = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === 'services' || key === 'specialOffers' || key === 'businessHours' || key === 'appointmentSettings') {
        submitData.append(key, JSON.stringify(formData[key] || (key === 'businessHours' || key === 'appointmentSettings' ? {} : [])));
      } else if (key !== 'logo' && key !== 'images' && !key.startsWith('serviceImage_')) {
        submitData.append(key, formData[key] || '');
      }
    });

    // Add files
    if (formData.logo) {
      submitData.append('logo', formData.logo);
    }
    if (formData.images && Array.isArray(formData.images)) {
      formData.images.forEach((image) => {
        submitData.append('images', image);
      });
    }
    if (formData.services && Array.isArray(formData.services)) {
      formData.services.forEach((service, index) => {
        if (service.image) {
          submitData.append(`serviceImage_${index}`, service.image);
        }
      });
    }

    let token = null;
    try {
      token = localStorage.getItem('token');
    } catch (storageError) {
      console.warn('localStorage not available:', storageError);
    }
    
    const response = await fetch(`${API_BASE_URL}/business/edit/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: submitData,
    });

    // Check if response is JSON before parsing
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      try {
        data = await response.json();
      } catch (jsonError) {
        const text = await response.text();
        throw new Error(`Invalid JSON response: ${text.substring(0, 100)}`);
      }
    } else {
      const text = await response.text();
      throw new Error(`Server returned non-JSON response (${response.status}): ${text.substring(0, 200)}`);
    }
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to update business');
    }
    return data;
  },
};

// Contact & Newsletter API functions
export const contactAPI = {
  sendMessage: async (formData) => {
    return apiCall('/contact', {
      method: 'POST',
      body: JSON.stringify(formData),
    });
  },
};

export const newsletterAPI = {
  subscribe: async (email) => {
    return apiCall('/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },
};

export default API_BASE_URL;

