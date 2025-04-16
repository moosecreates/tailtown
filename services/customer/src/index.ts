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
import { errorHandler } from './middleware/error.middleware';

// Load environment variables
dotenv.config();

// Initialize the Express application
const app = express();
const PORT = process.env.PORT || 3002;

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Query:`, req.query);
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
      connectSrc: ["'self'", 'http://localhost:3002']
    }
  },
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginEmbedderPolicy: false
}));
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Ensure uploads directory exists and serve static files
const uploadsPath = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
if (!fs.existsSync(path.join(uploadsPath, 'pets'))) {
  fs.mkdirSync(path.join(uploadsPath, 'pets'), { recursive: true });
}
console.log('Static file directory:', uploadsPath);
app.use('/api/uploads', express.static(uploadsPath, {
  setHeaders: (res, filePath) => {
    res.setHeader('Cache-Control', 'no-cache');
    // Set correct Content-Type based on file extension
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
      case '.png':
        res.setHeader('Content-Type', 'image/png');
        break;
      case '.gif':
        res.setHeader('Content-Type', 'image/gif');
        break;
      case '.jpg':
      case '.jpeg':
      default:
        res.setHeader('Content-Type', 'image/jpeg');
        break;
    }
  }
}));

// Log the contents of the uploads directory
if (fs.existsSync(path.join(uploadsPath, 'pets'))) {
  const files = fs.readdirSync(path.join(uploadsPath, 'pets'));
  console.log('Files in uploads/pets:', files);
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
