import express from 'express';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
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
import invoiceRoutes from './routes/invoice.routes';
import paymentRoutes from './routes/payment.routes';
import { errorHandler } from './middleware/error.middleware';

// Load environment variables
dotenv.config();

// Initialize the Express application
const app = express();
const PORT = process.env.PORT || 3002; // Using port 3002 as standard for backend

// Increase HTTP header limits to prevent 431 errors
app.set('etag', false); // Disable ETag generation to reduce header size
app.set('x-powered-by', false); // Remove unnecessary headers

// Request logging middleware
app.use((req, res, next) => {
  // Request logging handled by Morgan middleware
  next();
});

// Middleware
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
// Minimal middleware configuration to reduce header overhead
app.use(cors());
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
app.use('/api/customers', customerRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/suites', suiteRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/price-rules', priceRuleRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/payments', paymentRoutes);

// Additional routes without /api prefix for staff (to match frontend API calls)
app.use('/staff', staffRoutes);
app.use('/schedules', scheduleRoutes);

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
