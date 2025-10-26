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
import { errorHandler } from './middleware/error.middleware';
import { extractTenantContext, requireTenant } from './middleware/tenant.middleware';

// Load environment variables
dotenv.config();

// Initialize the Express application
const app = express();
const PORT = 4004; // Explicitly setting port 4004 for customer service

// Increase HTTP header limits to prevent 431 errors
app.set('etag', false); // Disable ETag generation to reduce header size
app.set('x-powered-by', false); // Remove unnecessary headers

// Request logging middleware
app.use((req, res, next) => {
  // Request logging handled by Morgan middleware
  next();
});

// Middleware
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
app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-tenant-id', 'x-api-key', 'X-API-Key', 'X-Tenant-Subdomain'],
  credentials: true
}));

// Add OPTIONS handling for preflight requests
app.options('*', cors());

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

// Request body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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
// Tenant management routes (no tenant context required - for super admins)
app.use('/api/tenants', tenantRoutes);

// Apply tenant context middleware to all other routes
// This extracts the subdomain and attaches tenant info to the request
app.use('/api', extractTenantContext);

// Tenant-specific routes (require tenant context)
app.use('/api/customers', requireTenant, customerRoutes);
app.use('/api/pets', requireTenant, petRoutes);
app.use('/api/reservations', requireTenant, reservationRoutes);
app.use('/api/services', requireTenant, serviceRoutes);
app.use('/api/resources', requireTenant, resourceRoutes);
app.use('/api/suites', requireTenant, suiteRoutes);
app.use('/api/staff', requireTenant, staffRoutes);
app.use('/api/price-rules', requireTenant, priceRuleRoutes);
app.use('/api/coupons', requireTenant, couponRoutes);
app.use('/api/availability', requireTenant, availabilityRoutes);
app.use('/api/loyalty', requireTenant, loyaltyRoutes);
app.use('/api/deposits', requireTenant, depositRoutes);
app.use('/api/multi-pet', requireTenant, multiPetRoutes);
app.use('/api/checklists', requireTenant, checklistRoutes);
app.use('/api/schedules', requireTenant, scheduleRoutes);
app.use('/api/invoices', requireTenant, invoiceRoutes);
app.use('/api/payments', requireTenant, paymentRoutes);
app.use('/api/addons', requireTenant, addonRoutes);
app.use('/api/analytics', requireTenant, analyticsRoutes);
app.use('/api/emails', requireTenant, emailRoutes);
app.use('/api/sms', requireTenant, smsRoutes);
app.use('/api/pets', requireTenant, vaccineUploadRoutes);

// Advanced Scheduling Routes
app.use('/api', requireTenant, groomerAppointmentRoutes);
app.use('/api', requireTenant, trainingClassRoutes);
app.use('/api', requireTenant, enrollmentRoutes);

// Vaccine Requirement Routes
app.use('/api', requireTenant, vaccineRequirementRoutes);

// Custom Icon Routes
app.use('/api/custom-icons', requireTenant, customIconRoutes);

// Products & POS Routes
app.use('/api', requireTenant, productsRoutes);

// Reports Routes
app.use('/api/reports', requireTenant, reportRoutes);

// Serve uploaded icons statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Additional routes without /api prefix for staff (to match frontend API calls)
app.use('/staff', staffRoutes);
app.use('/schedules', scheduleRoutes);

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

// Start the server
app.listen(PORT, () => {
  console.log(`Customer service running on port ${PORT}`);
});

export default app;
