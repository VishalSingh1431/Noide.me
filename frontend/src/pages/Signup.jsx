import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import GoogleButton from '../components/auth/GoogleButton';
import EmailInput from '../components/auth/EmailInput';
import OtpInput from '../components/auth/OtpInput';
import { authAPI } from '../config/api';
import { GOOGLE_CLIENT_ID } from '../config/constants';

const Signup = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('email'); // 'email' or 'otp'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [otpError, setOtpError] = useState('');

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setEmailError('');

    if (!email) {
      setEmailError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.sendOTP(email);
      setStep('otp');
      setError('');
      // Show warning if email not configured
      if (response.warning) {
        console.warn(response.warning);
      }
    } catch (err) {
      // Show user-friendly error message
      let errorMessage = err.message || 'Failed to send OTP';
      if (err.help) {
        errorMessage = `${errorMessage}\n\n💡 ${err.help}`;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setOtpError('');

    if (otp.length !== 4) {
      setOtpError('Please enter the 4-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const data = await authAPI.verifyOTP(email, otp, true);

      // Store token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Dispatch event to update navbar
      window.dispatchEvent(new Event('authChange'));

      // Redirect to home
      navigate('/');
    } catch (err) {
      // Show user-friendly error message
      let errorMessage = err.message || 'Failed to verify OTP';
      if (err.help) {
        errorMessage = `${errorMessage}\n\n💡 ${err.help}`;
      }
      setOtpError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError('');
    setLoading(true);

    try {
      const clientId = GOOGLE_CLIENT_ID;
      
      if (!clientId) {
        setError('Google Client ID is not configured.');
        setLoading(false);
        return;
      }

      // Load Google Sign-In script if not already loaded
      if (!window.google || !window.google.accounts) {
        // Check if script already exists
        const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
        if (!existingScript) {
          const script = document.createElement('script');
          script.src = 'https://accounts.google.com/gsi/client';
          script.async = true;
          script.defer = true;
          document.head.appendChild(script);

          await new Promise((resolve, reject) => {
            script.onload = () => {
              // Wait a bit for Google API to fully initialize
              setTimeout(resolve, 1000);
            };
            script.onerror = () => reject(new Error('Failed to load Google Sign-In script'));
            setTimeout(() => reject(new Error('Google Sign-In script load timeout')), 15000);
          });
        } else {
          // Script exists, wait for it to load
          await new Promise((resolve) => {
            if (window.google && window.google.accounts) {
              resolve();
            } else {
              const checkInterval = setInterval(() => {
                if (window.google && window.google.accounts) {
                  clearInterval(checkInterval);
                  resolve();
                }
              }, 100);
              setTimeout(() => {
                clearInterval(checkInterval);
                resolve();
              }, 5000);
            }
          });
        }
      }

      // Verify Google API is available
      if (!window.google || !window.google.accounts || !window.google.accounts.oauth2) {
        throw new Error('Google Sign-In API is not available. Please refresh the page and try again.');
      }

      // Use OAuth2 flow directly (works without origin registration)
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'openid email profile',
        callback: async (tokenResponse) => {
          try {
            if (tokenResponse.error) {
              setError('Google authentication failed: ' + tokenResponse.error);
              setLoading(false);
              return;
            }
            
            if (!tokenResponse.access_token) {
              setError('No access token received from Google');
              setLoading(false);
              return;
            }
            
            // Get user info using access token
            const userInfoResponse = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokenResponse.access_token}`);
            if (!userInfoResponse.ok) {
              const errorText = await userInfoResponse.text();
              throw new Error(`Failed to fetch user info: ${userInfoResponse.status} ${errorText}`);
            }
            const userInfo = await userInfoResponse.json();
            
            if (!userInfo.email) {
              throw new Error('Email not provided by Google');
            }
            
            // Send to backend - backend will handle user creation/login
            const data = await authAPI.googleAuth(btoa(JSON.stringify({
              sub: userInfo.id,
              email: userInfo.email,
              name: userInfo.name,
              picture: userInfo.picture,
            })));

            // Store token and user data
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            // Dispatch event to update navbar
            window.dispatchEvent(new Event('authChange'));

            // Redirect to home
            navigate('/');
          } catch (err) {
            console.error('Error in Google Sign-In callback:', err);
            // Show user-friendly error message
            let errorMessage = err.message || 'Failed to complete Google Sign-In';
            if (err.help) {
              errorMessage = `${errorMessage}\n\n💡 ${err.help}`;
            }
            setError(errorMessage);
            setLoading(false);
          }
        },
      });

      // Request access token
      tokenClient.requestAccessToken();
    } catch (err) {
      console.error('Google Sign-In initialization error:', err);
      setError(err.message || 'Failed to initialize Google Sign-In. Please check your Google Client ID configuration.');
      setLoading(false);
    }
  };

  const handleGoogleCallback = async (response) => {
    try {
      if (!response || !response.credential) {
        setError('Google authentication failed: No credential received');
        setLoading(false);
        return;
      }
      
      const data = await authAPI.googleAuth(response.credential);

      // Store token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Dispatch event to update navbar
      window.dispatchEvent(new Event('authChange'));

      // Redirect to home
      navigate('/');
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">VaranasiHub</h1>
          <h2 className="text-2xl font-semibold text-gray-800">Create Account</h2>
          <p className="text-gray-600 mt-2">Sign up to get started</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm whitespace-pre-line">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Google Signup */}
          {GOOGLE_CLIENT_ID && (
            <>
              <GoogleButton
                onClick={handleGoogleSignup}
                disabled={loading}
                text="Sign up with Google"
              />
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or sign up with email</span>
                </div>
              </div>
            </>
          )}

          {/* Email/OTP Form */}
          {step === 'email' ? (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <EmailInput
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError('');
                }}
                error={emailError}
                disabled={loading}
                placeholder="Enter your email"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  'Send OTP'
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-4 text-center">
                  We've sent a 4-digit OTP to <span className="font-semibold">{email}</span>
                </p>
                <OtpInput
                  value={otp}
                  onChange={setOtp}
                  error={otpError}
                  disabled={loading}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setStep('email');
                    setOtp('');
                    setOtpError('');
                  }}
                  disabled={loading}
                  className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 disabled:opacity-50"
                >
                  Change Email
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify OTP'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-700">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;

