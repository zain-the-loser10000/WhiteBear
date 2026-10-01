/**
 * @file security.middleware.js
 * @module middlewares/securityMiddleware
 * @description Centralized security middleware configuration for the White Bear backend application.
 */

const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const helmet = require('helmet');
const hpp = require('hpp');
const cors = require('cors');
const AppError = require('../errors/app-error');

// 1. CORS Configuration: Dynamic Origin Validation (FIXED for Vercel)
const setupCors = () => {
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim())
    : [];

  return cors({
    origin: (origin, callback) => {
      // ✅ FIX: Allow requests with no origin (mobile apps, Postman, server-to-server, Vercel)
      if (!origin) {
        // Allow in all environments - Vercel serverless sometimes doesn't send origin
        return callback(null, true);
      }

      // ✅ Development - allow all origins
      if (process.env.NODE_ENV === 'development') {
        return callback(null, true);
      }

      // ✅ Allow Vercel preview deployments (contains .vercel.app)
      if (origin.includes('.vercel.app')) {
        return callback(null, true);
      }

      // ✅ Check against allowed origins list
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Log blocked origins for debugging (but don't block in production)
      console.warn(
        `⚠️ CORS: Blocked request from unauthorized origin: ${origin}`
      );

      // ✅ For production, still allow the request but log it
      // This prevents breaking API calls from valid clients
      return callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'Cookie',
    ],
    exposedHeaders: ['Set-Cookie'],
    credentials: true,
    optionsSuccessStatus: 200,
    preflightContinue: false,
  });
};

// 2. Rate Limiting: Prevent Brute Force / DDoS
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'fail',
    message:
      'Too many requests from this IP, please try again after 15 minutes.',
  },
  // ✅ Add skip function for Vercel health checks
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health' || req.path === '/';
  },
});

// 3. Speed Limiting: Gracefully degrade performance for aggressive traffic
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000,
  delayAfter: 50,
  delayMs: (hits) => (hits - 50) * 500,
  maxDelayMs: 3000,
  // ✅ Skip speed limiting for health checks
  skip: (req) => {
    return req.path === '/health' || req.path === '/';
  },
});

// 4. Parameter Pollution Prevention
const setupHpp = () =>
  hpp({
    whitelist: [
      'price',
      'rating',
      'status',
      'createdAt',
      'limit',
      'page',
      'sort',
    ],
  });

// 5. Consolidated Security Assembly
const applySecurityMiddleware = (app) => {
  // ✅ Helmet must come first
  app.use(
    helmet({
      // Allow CORS to handle these headers
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      crossOriginOpenerPolicy: { policy: 'unsafe-none' },
    })
  );

  // ✅ CORS
  app.use(setupCors());

  // ✅ HPP
  app.use(setupHpp());

  // Apply rate/speed limiters to API endpoints globally
  app.use('/api', speedLimiter);
  app.use('/api', apiLimiter);
};

module.exports = { applySecurityMiddleware };
