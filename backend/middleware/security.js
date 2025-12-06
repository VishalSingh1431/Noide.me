import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

/**
 * Security middleware configuration
 */
export const securityMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'self'", "https://www.youtube.com"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
});

/**
 * Rate limiting for API routes - DISABLED (no limits)
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000000, // Very high limit (effectively unlimited)
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use req.ip which is already set correctly by trust proxy
    // This bypasses the validation warning
    return req.ip || req.socket.remoteAddress || 'unknown';
  },
});

/**
 * Rate limiting for auth routes - DISABLED (no limits)
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000000, // Very high limit (effectively unlimited)
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => {
    // Use req.ip which is already set correctly by trust proxy
    // This bypasses the validation warning
    return req.ip || req.socket.remoteAddress || 'unknown';
  },
});

/**
 * Rate limiting for file uploads - DISABLED (no limits)
 */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 1000000, // Very high limit (effectively unlimited)
  message: 'Too many file uploads, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use req.ip which is already set correctly by trust proxy
    // This bypasses the validation warning
    return req.ip || req.socket.remoteAddress || 'unknown';
  },
});


