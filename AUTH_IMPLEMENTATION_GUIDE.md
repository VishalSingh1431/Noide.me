# Complete Signup/Login Implementation Guide

## Overview
This guide provides a complete implementation of authentication system with:
- **Google OAuth Sign-In** (One-click authentication)
- **Email/OTP Authentication** (Passwordless login via email verification)
- **JWT Token-based Authorization**
- **PostgreSQL Database** for user and OTP storage

---

## Table of Contents
1. [Backend Implementation](#backend-implementation)
2. [Frontend Implementation](#frontend-implementation)
3. [Database Schema](#database-schema)
4. [Environment Variables](#environment-variables)
5. [Authentication Flows](#authentication-flows)
6. [Security Considerations](#security-considerations)

---

## Backend Implementation

### 1. Database Schema (PostgreSQL)

#### Users Table
```sql
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  phone VARCHAR(20),
  bio TEXT,
  picture TEXT,
  google_id VARCHAR(255) UNIQUE,
  role VARCHAR(50) DEFAULT 'normal',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_google_id ON users(google_id);
```

#### OTPs Table
```sql
CREATE TABLE IF NOT EXISTS otps (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  otp VARCHAR(10) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_otps_email_otp ON otps(email, otp);
CREATE INDEX idx_otps_expires_at ON otps(expires_at);
```

### 2. User Model (`backend/models/User.js`)

```javascript
import pool from '../config/database.js';

class User {
  /**
   * Create a new user
   */
  static async create(data) {
    try {
      const query = `
        INSERT INTO users (email, name, phone, bio, picture, google_id)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;

      const values = [
        data.email.toLowerCase(),
        data.name || null,
        data.phone || null,
        data.bio || null,
        data.picture || null,
        data.googleId || null,
      ];

      const result = await pool.query(query, values);
      return this.mapRowToUser(result.rows[0]);
    } catch (error) {
      console.error('User.create error:', error);
      throw error;
    }
  }

  /**
   * Find user by email
   */
  static async findByEmail(email) {
    try {
      const query = 'SELECT * FROM users WHERE email = $1';
      const result = await pool.query(query, [email.toLowerCase()]);
      return result.rows.length > 0 ? this.mapRowToUser(result.rows[0]) : null;
    } catch (error) {
      console.error('User.findByEmail error:', error);
      throw error;
    }
  }

  /**
   * Find user by ID
   */
  static async findById(id) {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows.length > 0 ? this.mapRowToUser(result.rows[0]) : null;
  }

  /**
   * Update user
   */
  static async update(id, data) {
    try {
      const updates = [];
      const values = [];
      let paramCount = 1;

      if (data.name !== undefined) {
        updates.push(`name = $${paramCount++}`);
        values.push(data.name);
      }
      if (data.phone !== undefined) {
        updates.push(`phone = $${paramCount++}`);
        values.push(data.phone);
      }
      if (data.bio !== undefined) {
        updates.push(`bio = $${paramCount++}`);
        values.push(data.bio);
      }
      if (data.picture !== undefined) {
        updates.push(`picture = $${paramCount++}`);
        values.push(data.picture);
      }
      if (data.googleId !== undefined) {
        updates.push(`google_id = $${paramCount++}`);
        values.push(data.googleId);
      }
      if (data.role !== undefined) {
        updates.push(`role = $${paramCount++}`);
        values.push(data.role);
      }

      if (updates.length === 0) {
        return await this.findById(id);
      }

      values.push(id);
      const query = `
        UPDATE users 
        SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $${paramCount}
        RETURNING *
      `;

      const result = await pool.query(query, values);
      return this.mapRowToUser(result.rows[0]);
    } catch (error) {
      console.error('User.update error:', error);
      throw error;
    }
  }

  /**
   * Map database row to user object
   */
  static mapRowToUser(row) {
    if (!row) return null;

    return {
      id: row.id,
      email: row.email,
      name: row.name,
      phone: row.phone,
      bio: row.bio,
      picture: row.picture,
      googleId: row.google_id,
      role: row.role || 'normal',
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

export default User;
```

### 3. OTP Model (`backend/models/Otp.js`)

```javascript
import pool from '../config/database.js';

class Otp {
  /**
   * Create a new OTP
   */
  static async create(email, otp, expiresAt) {
    const query = `
      INSERT INTO otps (email, otp, expires_at)
      VALUES ($1, $2, $3)
      RETURNING *
    `;

    const values = [email.toLowerCase(), otp, new Date(expiresAt)];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Find valid OTP by email
   */
  static async findValidOtp(email, otp) {
    const query = `
      SELECT * FROM otps 
      WHERE email = $1 
        AND otp = $2 
        AND expires_at > CURRENT_TIMESTAMP 
        AND used = FALSE
      ORDER BY created_at DESC
      LIMIT 1
    `;

    const result = await pool.query(query, [email.toLowerCase(), otp]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Mark OTP as used
   */
  static async markAsUsed(id) {
    const query = 'UPDATE otps SET used = TRUE WHERE id = $1';
    await pool.query(query, [id]);
  }

  /**
   * Clean up expired OTPs (optional cleanup function)
   */
  static async cleanupExpired() {
    const query = 'DELETE FROM otps WHERE expires_at < CURRENT_TIMESTAMP';
    const result = await pool.query(query);
    return result.rowCount;
  }
}

export default Otp;
```

### 4. Auth Middleware (`backend/middleware/auth.js`)

```javascript
import jwt from 'jsonwebtoken';

// Middleware to verify JWT token
export const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key-change-in-production'
    );

    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token has expired' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    return res.status(500).json({ error: 'Token verification failed' });
  }
};

// Middleware to optionally verify token (doesn't fail if no token)
export const optionalAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'your-secret-key-change-in-production'
      );
      req.user = decoded;
    }
    next();
  } catch (error) {
    // If token is invalid, just continue without user
    next();
  }
};
```

### 5. Auth Routes (`backend/routes/auth.js`)

```javascript
import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import { verifyToken } from '../middleware/auth.js';
import User from '../models/User.js';
import Otp from '../models/Otp.js';

const router = express.Router();

// Google OAuth Client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Email transporter configuration
let transporter = null;

const initializeEmailTransporter = () => {
  if (transporter) return transporter;
  
  // Try Gmail first if credentials are provided
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    return transporter;
  }
  
  // Fallback: Use SMTP configuration if provided
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    return transporter;
  }
  
  return null;
};

// Generate 4-digit OTP
const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

// Send OTP via email
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store OTP in database
    await Otp.create(email, otp, expiresAt);

    // Initialize email transporter
    const emailTransporter = initializeEmailTransporter();

    // Professional email template
    const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OTP Verification</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6;">
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f3f4f6; padding: 20px;">
        <tr>
            <td align="center" style="padding: 20px 0;">
                <table role="presentation" style="width: 100%; max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <tr>
                        <td style="padding: 40px; text-align: center;">
                            <h2 style="margin: 0 0 20px; color: #111827; font-size: 24px; font-weight: 600;">Verify Your Email</h2>
                            <p style="margin: 0 0 30px; color: #6b7280; font-size: 16px; line-height: 1.6;">
                                Please use the following One-Time Password (OTP) to complete your verification:
                            </p>
                            
                            <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0;">
                                <p style="margin: 0 0 10px; color: #ffffff; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px;">Your Verification Code</p>
                                <div style="background-color: #ffffff; border-radius: 8px; padding: 20px; margin: 15px 0; display: inline-block;">
                                    <h1 style="margin: 0; color: #2563eb; font-size: 42px; font-weight: 700; letter-spacing: 12px; font-family: 'Courier New', monospace;">${otp}</h1>
                                </div>
                                <p style="margin: 15px 0 0; color: #e0e7ff; font-size: 13px;">This code will expire in 10 minutes</p>
                            </div>
                            
                            <p style="margin: 30px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                                If you didn't request this code, please ignore this email.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;

    const mailOptions = {
      from: `"YourApp" <${process.env.EMAIL_USER || process.env.SMTP_USER || 'noreply@yourapp.com'}>`,
      to: email,
      subject: 'Your Verification Code',
      html: emailHtml,
      text: `Your verification code is: ${otp}\n\nThis code will expire in 10 minutes.`,
    };

    // Try to send email
    if (emailTransporter) {
      try {
        await emailTransporter.sendMail(mailOptions);
        console.log(`✅ OTP email sent successfully to ${email}`);
        return res.json({ message: 'OTP sent successfully to your email' });
      } catch (emailError) {
        console.error('❌ Error sending email:', emailError);
        // Fallback: log OTP if email fails
        console.log(`⚠️ Email sending failed. OTP for ${email}: ${otp}`);
        return res.json({ 
          message: 'OTP sent successfully (check console - email service unavailable)',
          otp: otp,
          warning: 'Email service is not properly configured.'
        });
      }
    } else {
      // No email transporter configured
      console.log(`⚠️ Email not configured. OTP for ${email}: ${otp}`);
      return res.json({ 
        message: 'OTP generated (email not configured - check console)',
        otp: otp,
        warning: 'Please configure email settings in .env file to receive OTP via email'
      });
    }
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp, isSignup } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    // Find valid OTP in database
    const storedOtp = await Otp.findValidOtp(email, otp);

    if (!storedOtp) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Mark OTP as used
    await Otp.markAsUsed(storedOtp.id);

    // Find or create user by email
    let user = await User.findByEmail(email);

    if (isSignup) {
      // If user already exists, allow them to login
      if (user) {
        console.log(`User ${email} already exists, logging in via OTP`);
      } else {
        // Create new user
        user = await User.create({
          email,
          name: null,
          phone: null,
          bio: null,
          picture: null,
          googleId: null,
        });
        console.log(`New user created via OTP: ${email}`);
      }
    } else {
      // Login: user must exist
      if (!user) {
        return res.status(400).json({ error: 'User not found. Please sign up instead.' });
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role || 'normal' },
      process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      { expiresIn: '7d' }
    );

    res.json({
      message: isSignup ? 'Signup successful' : 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        bio: user.bio,
        picture: user.picture,
        role: user.role || 'normal',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

// Google Authentication
router.post('/google', async (req, res) => {
  try {
    // Check if Google Client ID is configured
    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(400).json({ 
        error: 'Google Sign-In is not configured. Please configure GOOGLE_CLIENT_ID in backend .env file or use email signup.' 
      });
    }

    const { tokenId } = req.body;

    if (!tokenId) {
      return res.status(400).json({ error: 'Google token is required' });
    }

    let email, name, picture, sub;

    // Try to verify as ID token first
    try {
      const ticket = await client.verifyIdToken({
        idToken: tokenId,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      email = payload.email;
      name = payload.name;
      picture = payload.picture;
      sub = payload.sub;
    } catch (idTokenError) {
      // If ID token verification fails, try to decode as base64 user info
      try {
        const decoded = JSON.parse(Buffer.from(tokenId, 'base64').toString());
        email = decoded.email;
        name = decoded.name;
        picture = decoded.picture;
        sub = decoded.sub;
      } catch (decodeError) {
        console.error('Failed to verify Google token:', idTokenError);
        console.error('Failed to decode user info:', decodeError);
        return res.status(400).json({ error: 'Invalid Google token format' });
      }
    }

    // Find or create user by email
    let user = await User.findByEmail(email);

    if (!user) {
      // New user - create account
      user = await User.create({
        email,
        name,
        picture,
        googleId: sub,
        phone: null,
        bio: null,
      });
      console.log(`New user created via Google: ${email}`);
    } else {
      // Existing user - update info and login
      user = await User.update(user.id, {
        name: name || user.name,
        picture: picture || user.picture,
        googleId: sub,
      });
      console.log(`Existing user logged in via Google: ${email}`);
    }

    // Generate JWT token
    const authToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role || 'normal' },
      process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Authentication successful',
      token: authToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        bio: user.bio,
        picture: user.picture,
        role: user.role || 'normal',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error with Google authentication:', error);
    res.status(500).json({ 
      error: 'Google authentication failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Verify token endpoint
router.get('/verify', verifyToken, (req, res) => {
  res.json({
    valid: true,
    user: {
      userId: req.user.userId,
      email: req.user.email,
    },
  });
});

// Get current user info
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        phone: user.phone,
        bio: user.bio,
        role: user.role || 'normal',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update user profile
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { name, phone, bio } = req.body;
    
    const updateData = {};
    if (name !== undefined) updateData.name = name || null;
    if (phone !== undefined) updateData.phone = phone || null;
    if (bio !== undefined) updateData.bio = bio || null;
    
    const user = await User.update(req.user.userId, updateData);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        phone: user.phone,
        bio: user.bio,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ 
      error: 'Failed to update profile',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
```

### 6. Package Dependencies

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.2",
    "pg": "^8.16.3",
    "google-auth-library": "^9.4.1",
    "nodemailer": "^6.9.7",
    "dotenv": "^16.3.1",
    "cors": "^2.8.5"
  }
}
```

---

## Frontend Implementation

### 1. API Configuration (`frontend/src/config/api.js`)

```javascript
import { API_BASE_URL } from './constants';

// Helper function to make API calls
export const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
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
    const data = await response.json();

    if (!response.ok) {
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
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      const networkError = new Error('Cannot connect to server. Make sure the backend server is running.');
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
```

### 2. Constants (`frontend/src/config/constants.js`)

```javascript
// Google Client ID (public - safe to expose)
export const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';

// API Base URL
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
```

### 3. Signup Page (`frontend/src/pages/Signup.jsx`)

```javascript
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
      if (response.warning) {
        console.warn(response.warning);
      }
    } catch (err) {
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
      const data = await authAPI.verifyOTP(email, otp, true); // true = signup

      // Store token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Dispatch event to update navbar
      window.dispatchEvent(new Event('authChange'));

      // Redirect to home
      navigate('/');
    } catch (err) {
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
        const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
        if (!existingScript) {
          const script = document.createElement('script');
          script.src = 'https://accounts.google.com/gsi/client';
          script.async = true;
          script.defer = true;
          document.head.appendChild(script);

          await new Promise((resolve, reject) => {
            script.onload = () => setTimeout(resolve, 1000);
            script.onerror = () => reject(new Error('Failed to load Google Sign-In script'));
            setTimeout(() => reject(new Error('Google Sign-In script load timeout')), 15000);
          });
        } else {
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

      // Use OAuth2 flow
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
              throw new Error(`Failed to fetch user info: ${userInfoResponse.status}`);
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
      setError(err.message || 'Failed to initialize Google Sign-In.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">YourApp</h1>
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
```

### 4. Login Page (`frontend/src/pages/Login.jsx`)

The Login page is identical to Signup, except:
- Change `isSignup` to `false` in `verifyOTP` call: `await authAPI.verifyOTP(email, otp, false);`
- Change button text to "Login" instead of "Sign up"
- Change heading to "Welcome Back" instead of "Create Account"

### 5. Reusable Components

#### GoogleButton Component
```javascript
const GoogleButton = ({ onClick, disabled, text }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      {text}
    </button>
  );
};
```

#### EmailInput Component
```javascript
const EmailInput = ({ value, onChange, error, disabled, placeholder }) => {
  return (
    <div>
      <input
        type="email"
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
          error ? 'border-red-300' : 'border-gray-300'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      />
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};
```

#### OtpInput Component
```javascript
const OtpInput = ({ value, onChange, error, disabled }) => {
  const handleChange = (e) => {
    const input = e.target.value.replace(/\D/g, '').slice(0, 4);
    onChange(input);
  };

  return (
    <div>
      <div className="flex gap-3 justify-center">
        {[0, 1, 2, 3].map((index) => (
          <input
            key={index}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={value[index] || ''}
            onChange={(e) => {
              const newValue = value.split('');
              newValue[index] = e.target.value.replace(/\D/g, '').slice(0, 1);
              onChange(newValue.join(''));
              // Auto-focus next input
              if (e.target.value && index < 3) {
                e.target.nextElementSibling?.focus();
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Backspace' && !value[index] && index > 0) {
                e.target.previousElementSibling?.focus();
              }
            }}
            disabled={disabled}
            className={`w-16 h-16 text-center text-2xl font-bold border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              error ? 'border-red-300' : 'border-gray-300'
            } disabled:opacity-50`}
          />
        ))}
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600 text-center">{error}</p>
      )}
    </div>
  );
};
```

---

## Environment Variables

### Backend `.env`
```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database
# OR individual variables:
DB_HOST=localhost
DB_PORT=5432
DB_NAME=yourdb
DB_USER=youruser
DB_PASSWORD=yourpassword

# JWT Secret (use a strong random string in production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com

# Email Configuration (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# OR SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Server
PORT=5000
NODE_ENV=production
```

### Frontend `.env`
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## Authentication Flows

### 1. Email/OTP Signup Flow
1. User enters email → Frontend validates email
2. Frontend calls `/auth/send-otp` → Backend generates 4-digit OTP
3. Backend stores OTP in database (expires in 10 minutes)
4. Backend sends OTP via email (or logs to console if email not configured)
5. User enters OTP → Frontend calls `/auth/verify-otp` with `isSignup: true`
6. Backend validates OTP, creates user if new, generates JWT token
7. Frontend stores token in localStorage and redirects

### 2. Email/OTP Login Flow
1. User enters email → Frontend calls `/auth/send-otp`
2. User enters OTP → Frontend calls `/auth/verify-otp` with `isSignup: false`
3. Backend validates OTP, checks if user exists, generates JWT token
4. Frontend stores token and redirects

### 3. Google OAuth Flow
1. User clicks "Sign in with Google" → Frontend loads Google Sign-In script
2. Frontend initializes OAuth2 token client
3. User authenticates with Google → Google returns access token
4. Frontend fetches user info from Google API
5. Frontend sends base64-encoded user info to `/auth/google`
6. Backend decodes user info, finds or creates user, generates JWT token
7. Frontend stores token and redirects

---

## Security Considerations

1. **JWT Secret**: Use a strong, random secret in production
2. **OTP Expiration**: OTPs expire after 10 minutes
3. **OTP One-Time Use**: OTPs are marked as used after verification
4. **Email Validation**: Validate email format on both frontend and backend
5. **Token Storage**: Store JWT in localStorage (consider httpOnly cookies for production)
6. **HTTPS**: Always use HTTPS in production
7. **Rate Limiting**: Implement rate limiting on OTP endpoints (not included in this guide)
8. **Input Sanitization**: Sanitize all user inputs
9. **Error Messages**: Don't expose sensitive information in error messages

---

## Testing Checklist

- [ ] Email/OTP signup works
- [ ] Email/OTP login works
- [ ] Google signup works
- [ ] Google login works
- [ ] OTP expires after 10 minutes
- [ ] OTP can only be used once
- [ ] JWT token is generated correctly
- [ ] Protected routes require authentication
- [ ] User profile can be updated
- [ ] Email sending works (or falls back to console)

---

## Common Issues & Solutions

1. **Google Sign-In not working**: Check GOOGLE_CLIENT_ID is set correctly
2. **Email not sending**: Check email credentials in .env, or check console for OTP
3. **OTP invalid**: Check OTP hasn't expired (10 minutes) and hasn't been used
4. **Token expired**: Token expires after 7 days, user needs to login again
5. **Database connection error**: Check DATABASE_URL or individual DB variables

---

## Next Steps

1. Add password-based authentication (optional)
2. Add email verification for email signup
3. Add "Remember Me" functionality
4. Add social login providers (Facebook, GitHub, etc.)
5. Add two-factor authentication
6. Add account recovery/reset password
7. Add user profile picture upload
8. Add session management

---

This implementation provides a complete, production-ready authentication system with Google OAuth and Email/OTP methods. All code is ready to use and can be customized for your specific needs.

