/**
 * Customer Service - Main Entry Point
 * 
 * IMPORTANT: When modifying this file, follow patterns in:
 * /docs/DEVELOPMENT-BEST-PRACTICES.md
 * 
 * Key reminders:
 * - Auth middleware at ROUTE level, not router level (login must be public)
 * - Always set trust proxy when behind nginx
 * - Middleware order matters: tenant extraction → validation → auth
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { customerRoutes } from './routes/customer.routes';
import { petRoutes } from './routes/pet.routes';
import { reservationRoutes } from './routes/reservation.routes';
import { serviceRoutes } from './routes/service.routes';
import { resourceRoutes } from './routes/resource.routes';
import { suiteRoutes } from './routes/suite.routes';
import { staffRoutes } from './routes/staff.routes';
import { scheduleRoutes } from './routes/schedule.routes';
import priceRuleRoutes from './routes/priceRule.routes';
import couponRoutes from './routes/coupon.routes';
import availabilityRoutes from './routes/availability.routes';
import loyaltyRoutes from './routes/loyalty.routes';
import depositRoutes from './routes/deposit.routes';
import multiPetRoutes from './routes/multiPet.routes';
import checklistRoutes from './routes/checklist.routes';
import invoiceRoutes from './routes/invoice.routes';
import paymentRoutes from './routes/payment.routes';
import addonRoutes from './routes/addon.routes';
// Using fixed analytics routes to avoid schema issues
import analyticsRoutes from './routes/analytics-fixed.routes';
import tenantRoutes from './routes/tenant.routes';
import emailRoutes from './routes/email.routes';
import smsRoutes from './routes/sms.routes';
import vaccineUploadRoutes from './routes/vaccine-upload.routes';
import groomerAppointmentRoutes from './routes/groomerAppointment.routes';
import trainingClassRoutes from './routes/trainingClass.routes';
import enrollmentRoutes from './routes/enrollment.routes';
import vaccineRequirementRoutes from './routes/vaccineRequirement.routes';
import customIconRoutes from './routes/custom-icons.routes';
import productsRoutes from './routes/products.routes';
import reportRoutes from './routes/reports.routes';
import gingrRoutes from './routes/gingr.routes';
import referenceDataRoutes from './routes/referenceData.routes';
import messageTemplatesRoutes from './routes/messageTemplates.routes';
import announcementRoutes from './routes/announcement.routes';
import superAdminRoutes from './routes/super-admin.routes';
import businessSettingsRoutes from './routes/business-settings.routes';
import { errorHandler } from './middleware/error.middleware';
import { extractTenantContext, requireTenant } from './middleware/tenant.middleware';
import { enforceHTTPS, securityHeaders, sanitizeInput } from './middleware/security.middleware';
import { authenticate, requireTenantAdmin, optionalAuth } from './middleware/auth.middleware';
import { requireJsonContentType } from './middleware/content-type.middleware';

// Load environment variables
dotenv.config();

// Initialize the Express application
const app = express();
const PORT = 4004; // Explicitly setting port 4004 for customer service

// Trust proxy - required for rate limiting behind nginx/reverse proxy
app.set('trust proxy', 1);

// Increase HTTP header limits to prevent 431 errors
app.set('etag', false); // Disable ETag generation to reduce header size
app.set('x-powered-by', false); // Remove unnecessary headers

// Request logging middleware
app.use((req, res, next) => {
  // Request logging handled by Morgan middleware
  next();
});

// Middleware
// Security: Enforce HTTPS in production
app.use(enforceHTTPS);

// Security: Add security headers
app.use(securityHeaders);

// Enable gzip compression for all responses
app.use(compression());

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', '*'],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'", 'http://localhost:3003']
    }
  },
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginEmbedderPolicy: false
}));
// Enhanced CORS configuration to ensure frontend can connect
// In production, allow all subdomains of canicloud.com
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:3000', 'http://localhost:3001']; // Default for development

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // In development, allow all origins
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    // In production, allow canicloud.com and all its subdomains
    const allowedDomains = [
      'https://canicloud.com',
      'https://www.canicloud.com'
    ];
    
    // Check if origin matches canicloud.com or any subdomain
    if (allowedDomains.includes(origin) || origin.match(/^https:\/\/[a-z0-9-]+\.canicloud\.com$/)) {
      callback(null, true);
    } else if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-tenant-id', 'x-api-key', 'X-API-Key', 'X-Tenant-Subdomain'],
  credentials: true
}));

// Add OPTIONS handling for preflight requests
app.options('*', cors());

// Serve static files (uploaded photos)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rate limiting to prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Skip rate limiting for health checks
  skip: (req) => req.path === '/health',
});

// Apply rate limiting to all API routes
app.use('/api/', limiter);

// Stricter rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: 'Too many login attempts, please try again later.',
  skipSuccessfulRequests: true, // Don't count successful requests
});

// Apply to auth routes (if they exist)
app.use('/api/auth/login', authLimiter);

// Request body parsing middleware with security limits
// 10mb limit for JSON payloads (prevents DoS attacks)
// Most API requests should be under 1mb; 10mb allows for reasonable file uploads
app.use(express.json({ 
  limit: '10mb',
  strict: true, // Only accept arrays and objects
  verify: (req, res, buf, encoding) => {
    // Verify content length doesn't exceed limit
    if (buf.length > 10 * 1024 * 1024) {
      throw new Error('Request entity too large');
    }
  }
}));

// URL-encoded data limit (for form submissions)
app.use(express.urlencoded({ 
  limit: '10mb', 
  extended: true,
  parameterLimit: 10000 // Limit number of parameters to prevent parameter pollution
}));

// Security: Enforce JSON content-type for API endpoints
app.use('/api/', requireJsonContentType);

// Security: Sanitize user input
app.use(sanitizeInput);

// Use minimal logging in production to reduce overhead
app.use(morgan('tiny'));

// Ensure uploads directory exists and serve static files
const uploadsPath = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
if (!fs.existsSync(path.join(uploadsPath, 'pets'))) {
  fs.mkdirSync(path.join(uploadsPath, 'pets'), { recursive: true });
}
// Static file directory configured with minimal headers to prevent 431 errors
app.use('/uploads', express.static(uploadsPath, {
  etag: false,
  lastModified: false,
  maxAge: '1d',
  setHeaders: (res) => {
    // Remove unnecessary headers to reduce header size
    res.removeHeader('X-Powered-By');
    res.removeHeader('ETag');
    res.setHeader('Cache-Control', 'public, max-age=86400');
  }
}));

// Direct file serving endpoint as a fallback with minimal headers
app.get('/pet-image/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(uploadsPath, 'pets', filename);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('File not found');
  }
  
  // Send file with minimal headers to prevent 431 errors
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.removeHeader('X-Powered-By');
  res.removeHeader('ETag');
  res.sendFile(filePath, {
    headers: {
      'Cache-Control': 'public, max-age=86400'
    },
    lastModified: false,
    etag: false
  });
});

// Simplified backward compatibility for existing API references
// Using a more efficient approach to reduce header size
app.use('/api/uploads', (req, res, next) => {
  // Extract the path after /api/uploads
  const subPath = req.url;
  const newPath = path.join(uploadsPath, subPath);
  
  // Check if file exists
  if (fs.existsSync(newPath)) {
    // Set minimal headers to prevent 431 errors
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.removeHeader('X-Powered-By');
    res.removeHeader('ETag');
    return res.sendFile(newPath, {
      headers: {
        'Cache-Control': 'public, max-age=86400'
      },
      lastModified: false,
      etag: false
    });
  }
  
  // If not found, try the next middleware
  next();
});

// Log the contents of the uploads directory
if (fs.existsSync(path.join(uploadsPath, 'pets'))) {
  const files = fs.readdirSync(path.join(uploadsPath, 'pets'));
  // Upload directory initialized
}

// Add test endpoints
app.get('/test-static', (req, res) => {
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  const petsDir = path.join(uploadsDir, 'pets');
  
  if (!fs.existsSync(petsDir)) {
    return res.json({
      error: 'Pets directory does not exist',
      uploadsDir,
      petsDir
    });
  }

  const files = fs.readdirSync(petsDir);
  const fileDetails = files.map(file => {
    const filePath = path.join(petsDir, file);
    const stats = fs.statSync(filePath);
    return {
      name: file,
      size: stats.size,
      created: stats.birthtime,
      fullPath: filePath,
      url: `/uploads/pets/${file}`
    };
  });

  res.json({
    uploadsDir,
    petsDir,
    files: fileDetails
  });
});

// Test specific file
app.get('/test-file/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, '..', 'uploads', 'pets', filename);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      error: 'File not found',
      filePath
    });
  }

  const stats = fs.statSync(filePath);
  res.json({
    exists: true,
    size: stats.size,
    created: stats.birthtime,
    fullPath: filePath,
    url: `/uploads/pets/${filename}`
  });
});

// Routes
// Super Admin routes (no tenant context required - platform management)
app.use('/api/super-admin', superAdminRoutes);

// Tenant management routes (no tenant context required - for super admins)
app.use('/api/tenants', tenantRoutes);

// Apply tenant context middleware to all other routes
// This extracts the subdomain and attaches tenant info to the request
app.use('/api', extractTenantContext);

// ============================================
// ADMIN-ONLY ROUTES (require admin role)
// ============================================
// Note: Staff routes handle their own auth (login endpoint is public)
app.use('/api/staff', requireTenant, staffRoutes);
app.use('/api/price-rules', requireTenant, authenticate, requireTenantAdmin, priceRuleRoutes);
app.use('/api/coupons', requireTenant, authenticate, requireTenantAdmin, couponRoutes);
app.use('/api/loyalty', requireTenant, authenticate, requireTenantAdmin, loyaltyRoutes);
app.use('/api/analytics', requireTenant, authenticate, requireTenantAdmin, analyticsRoutes);
app.use('/api/emails', requireTenant, authenticate, requireTenantAdmin, emailRoutes);
app.use('/api/sms', requireTenant, authenticate, requireTenantAdmin, smsRoutes);
app.use('/api/reports', requireTenant, authenticate, requireTenantAdmin, reportRoutes);

// ============================================
// STAFF ROUTES (require authentication)
// ============================================
app.use('/api/customers', requireTenant, authenticate, customerRoutes);
app.use('/api/pets', requireTenant, authenticate, petRoutes);
app.use('/api/reservations', requireTenant, authenticate, reservationRoutes);
app.use('/api/services', requireTenant, authenticate, serviceRoutes);
app.use('/api/resources', requireTenant, authenticate, resourceRoutes);
app.use('/api/suites', requireTenant, authenticate, suiteRoutes);
app.use('/api/availability', requireTenant, authenticate, availabilityRoutes);
app.use('/api/deposits', requireTenant, authenticate, depositRoutes);
app.use('/api/multi-pet', requireTenant, authenticate, multiPetRoutes);
app.use('/api/checklists', requireTenant, authenticate, checklistRoutes);
app.use('/api/schedules', requireTenant, authenticate, scheduleRoutes);
app.use('/api/invoices', requireTenant, authenticate, invoiceRoutes);
app.use('/api/payments', requireTenant, authenticate, paymentRoutes);
app.use('/api/addons', requireTenant, authenticate, addonRoutes);
app.use('/api/pets', requireTenant, authenticate, vaccineUploadRoutes);

// Advanced Scheduling Routes
app.use('/api', requireTenant, authenticate, groomerAppointmentRoutes);
app.use('/api', requireTenant, authenticate, trainingClassRoutes);
app.use('/api', requireTenant, authenticate, enrollmentRoutes);

// Vaccine Requirement Routes (admin only)
app.use('/api', requireTenant, authenticate, requireTenantAdmin, vaccineRequirementRoutes);

// Custom Icon Routes (admin only)
app.use('/api/custom-icons', requireTenant, authenticate, requireTenantAdmin, customIconRoutes);

// Products & POS Routes
app.use('/api/products', requireTenant, authenticate, productsRoutes);

// Gingr Migration Routes (no tenant required - for super admin)
app.use('/api/gingr', gingrRoutes);

// Reference Data Routes (breeds, vets, temperaments) - read-only, optional auth
app.use('/api', requireTenant, optionalAuth, referenceDataRoutes);

// Message Templates Routes (admin only)
app.use('/api/message-templates', requireTenant, authenticate, requireTenantAdmin, messageTemplatesRoutes);

// Announcement Routes (read with optional auth, write requires admin)
app.use('/api', requireTenant, optionalAuth, announcementRoutes);

// Business Settings Routes (admin only)
app.use('/api/business-settings', requireTenant, authenticate, requireTenantAdmin, businessSettingsRoutes);

// Serve uploaded icons statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Additional routes without /api prefix for staff (to match frontend API calls)
// Note: Staff routes handle their own auth internally
app.use('/staff', staffRoutes);
app.use('/schedules', authenticate, scheduleRoutes);

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'up',
    service: 'customer-service',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use(errorHandler);

// Start the server only if not in test mode
if (process.env.NODE_ENV !== 'test') {
  // Initialize Sentry error tracking
  import('./utils/sentry').then(({ initSentry }) => {
    initSentry();
  });

  // Initialize Redis cache
  import('./utils/redis').then(({ initRedis }) => {
    initRedis().catch((error) => {
      console.error('Failed to initialize Redis, continuing without cache:', error);
    });
  });

  app.listen(PORT, () => {
    console.log(`Customer service running on port ${PORT}`);
  });
}

export default app;
