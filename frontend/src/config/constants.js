// Public configuration - Google Client ID
export const GOOGLE_CLIENT_ID = '615226246647-8eeg93jcdfivjqdh4rv5so4traivbv25.apps.googleusercontent.com';

// API Base URL - automatically detects development vs production
export const API_BASE_URL = import.meta.env.DEV 
  ? 'http://localhost:50002/api'  // Local development
  : 'https://noida.me/api';  // Production