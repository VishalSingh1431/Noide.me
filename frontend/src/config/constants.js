// Public configuration - Google Client ID
export const GOOGLE_CLIENT_ID = '615226246647-8eeg93jcdfivjqdh4rv5so4traivbv25.apps.googleusercontent.com';

// API Base URL - Uses environment variable in production, localhost in development
export const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api');

