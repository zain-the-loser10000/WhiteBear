/**
 * @file server.js
 * @module server
 * @description Entry point for the White Bear backend application.
 */

// 1. Critical Catch-All for Synchronous Faults
process.on('uncaughtException', (err) => {
  console.error(
    '💥 CRITICAL UNCAUGHT EXCEPTION! Shutting down process safely...'
  );
  console.error(err.name, err.message, err.stack);
  process.exit(1);
});

require('dotenv').config();

const express = require('express');
const cron = require('node-cron');
const cookieParser = require('cookie-parser');
const { connectDB, closeDB } = require('./src/config/db.config');
const {
  applySecurityMiddleware,
} = require('./src/middlewares/security.middleware');

const {
  initGoalReminderScheduler,
  initTrialReminderScheduler,
  initHabitReminderScheduler,
} = require('./src/services/notification.service');

const {
  executeDailyTodoRollOver,
} = require('./src/controllers/todo.controller');

const { initAnalyticsSchedulers } = require('./src/workers/analytic.schedular');

// Import Routers
const userRoutes = require('./src/routes/user.route');
const otpRoutes = require('./src/routes/otp.route');
const goalRoutes = require('./src/routes/goal.route');
const analyticRoutes = require('./src/routes/analytic.route');
const todoRoutes = require('./src/routes/todo.route');
const journalRoutes = require('./src/routes/journal.route');
const habitRoutes = require('./src/routes/habit.route');
const subscriptionRoutes = require('./src/routes/subscription.route');
const webhookRoutes = require('./src/routes/webhook.route');

const PORT = process.env.PORT || 5000;
const ENV = process.env.NODE_ENV || 'development';

// Initialize Express app
const app = express();

app.set('trust proxy', 1);

// Security Middleware
applySecurityMiddleware(app);

// Core Middleware
app.use(cookieParser());

// Stripe Webhook (Must be before body parsers)
app.use('/api/v1/webhook', webhookRoutes);

// Body Parsers
app.use(express.json({ limit: '20kb' }));
app.use(express.urlencoded({ extended: true, limit: '20kb' }));

// Routes
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'WHITE BEAR Backend API is Running Securely',
    uptime: process.uptime(),
    environment: ENV,
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Add this route to your Express application
app.get('/delete-account', (req, res) => {
  res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>White Bear - Instant Account Deletion</title>
            <style>
                body {
                    font-family: system-ui, -apple-system, sans-serif;
                    background-color: #F8FAFA;
                    color: #0A1D2D;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    margin: 0;
                    padding: 20px;
                }
                .card {
                    background: white;
                    padding: 40px;
                    border-radius: 16px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.05);
                    max-width: 500px;
                    width: 100%;
                    text-align: center;
                }
                h1 { font-size: 24px; color: #111; margin-bottom: 16px; }
                p { font-size: 16px; color: #444; line-height: 1.6; margin-bottom: 24px; }
                .method {
                    background: #F1F5F9;
                    padding: 20px;
                    border-radius: 8px;
                    text-align: left;
                    margin-bottom: 16px;
                    border-left: 4px solid #627a80;
                }
                .method h3 { margin: 0 0 8px 0; font-size: 16px; color: #111; }
                .method p { margin: 0; font-size: 14.5px; color: #444; line-height: 1.6; }
                .badge {
                    display: inline-block;
                    background-color: #FEE2E2;
                    color: #991B1B;
                    font-size: 12px;
                    font-weight: bold;
                    padding: 4px 8px;
                    border-radius: 4px;
                    margin-bottom: 12px;
                }
                ol {
                    margin-top: 10px;
                    padding-left: 20px;
                }
                li {
                    margin-bottom: 6px;
                    color: #444;
                }
            </style>
        </head>
        <body>
            <div class="card">
                <h1>🐻‍❄️ White Bear Data Sovereign Authority</h1>
                <p>You hold complete ownership over your data. We do not restrict, delay, or hold your digital history over retention windows.</p>
                
                <div class="method">
                    <span class="badge">Instant Data Purge</span>
                    <h3>How to Delete Your Account and Data:</h3>
                    <p>Account deletion is entirely self-service and executed in real-time directly through the mobile interface. Follow these steps:</p>
                    <ol>
                        <li>Open the White Bear app and tap on the <strong>Settings Card</strong> right from your main dashboard.</li>
                        <li>On the Settings screen, scroll down to the <strong>Danger Zone</strong> section.</li>
                        <li>Tap the <strong>Delete Account</strong> card.</li>
                    </ol>
                    <p style="margin-top: 12px; font-size: 13.5px; color: #666; font-style: italic;">
                        *Note: Confirming this action triggers an immediate, absolute server-side purge. All of your user credentials, history, habits, and analytics data will be permanently deleted with zero recovery options.
                    </p>
                </div>
            </div>
        </body>
        </html>
    `);
});

app.use('/api/v1/user', userRoutes);
app.use('/api/v1/otp', otpRoutes);
app.use('/api/v1/goal', goalRoutes);
app.use('/api/v1/analytic', analyticRoutes);
app.use('/api/v1/todo', todoRoutes);
app.use('/api/v1/journal', journalRoutes);
app.use('/api/v1/habit', habitRoutes);
app.use('/api/v1/subscription', subscriptionRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(ENV === 'development' && { stack: err.stack }),
  });
});

// ────────────────────────────────────────────────────────────────────────────────
// DATABASE CONNECTION (Critical for Vercel Serverless)
// ────────────────────────────────────────────────────────────────────────────────

let isDBConnected = false;

async function ensureDBConnection() {
  if (isDBConnected) return;

  try {
    await connectDB();
    isDBConnected = true;
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    // Do NOT exit process on Vercel — let it retry on next invocation
  }
}

// Connect on module load (Important for Vercel cold starts)
ensureDBConnection().catch(console.error);

// ────────────────────────────────────────────────────────────────────────────────
// BACKGROUND SERVICES (Local Development Only)
// ────────────────────────────────────────────────────────────────────────────────

async function initializeBackgroundServices() {
  try {
    // DB is already connected via ensureDBConnection()
    console.log('✅ Database already connected');

    // Notification Schedulers
    initGoalReminderScheduler();
    initTrialReminderScheduler();
    initHabitReminderScheduler();
    console.log('✅ Notification schedulers initialized');

    // Analytics Schedulers
    try {
      initAnalyticsSchedulers();
      console.log('🤖 Gemini AI Analytics initialized');
    } catch (e) {
      console.error('❌ Analytics scheduler failed:', e.message);
    }

    // Daily Todo Rollover
    cron.schedule(
      '0 0 * * *',
      async () => {
        console.log('🔄 Running daily todo rollover...');
        try {
          await executeDailyTodoRollOver();
        } catch (err) {
          console.error('❌ Todo rollover failed:', err.message);
        }
      },
      { timezone: 'UTC' }
    );

    console.log('🚀 All background services initialized');
  } catch (error) {
    console.error(
      '❌ Background services initialization failed:',
      error.message
    );
  }
}

// ────────────────────────────────────────────────────────────────────────────────
// VERCEL EXPORT
// ────────────────────────────────────────────────────────────────────────────────
module.exports = app;

// ────────────────────────────────────────────────────────────────────────────────
// LOCAL DEVELOPMENT SERVER
// ────────────────────────────────────────────────────────────────────────────────
if (require.main === module) {
  if (ENV !== 'production') {
    initializeBackgroundServices().catch(console.error);
  }

  const server = app.listen(PORT, () => {
    console.log(`🌐 MODE: ${ENV}`);
    console.log(`🔌 Server running on http://localhost:${PORT}`);
  });

  // Graceful Shutdown
  process.on('unhandledRejection', (err) => {
    console.error('⚠️ UNHANDLED PROMISE REJECTION:', err);
    handleGracefulShutdown('unhandledRejection');
  });

  process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));

  function handleGracefulShutdown(signal) {
    console.log(`\n👋 ${signal} received. Shutting down gracefully...`);

    server.close(async () => {
      try {
        await closeDB();
        console.log('💚 Clean shutdown completed');
        process.exit(0);
      } catch (err) {
        console.error('❌ Error during shutdown:', err);
        process.exit(1);
      }
    });

    setTimeout(() => process.exit(1), 10000);
  }
}