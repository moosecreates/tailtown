# API Gateway Design

## Overview

Centralized API Gateway for Tailtown microservices architecture.

## Architecture

```
Client → API Gateway → [Customer Service, Reservation Service, ...]
```

## Benefits

1. **Single Entry Point**: One URL for all services
2. **Unified Authentication**: Centralized auth/authorization
3. **Rate Limiting**: Global and per-service limits
4. **Load Balancing**: Distribute traffic across instances
5. **Request Routing**: Intelligent routing based on path/headers
6. **Monitoring**: Centralized logging and metrics
7. **Security**: WAF, DDoS protection, SSL termination

## Implementation Options

### Option 1: Node.js Gateway (Recommended for MVP)
**Pros:**
- Same stack as services
- Easy to customize
- Fast development
- Full control

**Cons:**
- Need to maintain
- Scaling requires work

### Option 2: NGINX
**Pros:**
- Battle-tested
- High performance
- Built-in load balancing
- SSL termination

**Cons:**
- Configuration complexity
- Less flexible for custom logic

### Option 3: Cloud Gateway (AWS API Gateway, Google Cloud Endpoints)
**Pros:**
- Fully managed
- Auto-scaling
- Built-in monitoring

**Cons:**
- Vendor lock-in
- Cost
- Less control

## Recommended: Node.js Gateway

### Routes

```
/api/customers/*     → Customer Service (4004)
/api/pets/*          → Customer Service (4004)
/api/reservations/*  → Reservation Service (4003)
/api/resources/*     → Reservation Service (4003)
/api/services/*      → Reservation Service (4003)
```

### Features

1. **Request Routing**
   ```typescript
   if (path.startsWith('/api/customers')) {
     proxy.web(req, res, { target: 'http://localhost:4004' });
   }
   ```

2. **Authentication**
   ```typescript
   const token = req.headers.authorization;
   const user = await verifyToken(token);
   req.user = user;
   ```

3. **Rate Limiting**
   ```typescript
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000,
     max: 1000,
     keyGenerator: (req) => req.tenantId,
   });
   ```

4. **Load Balancing**
   ```typescript
   const targets = [
     'http://localhost:4004',
     'http://localhost:4005',
   ];
   const target = targets[Math.floor(Math.random() * targets.length)];
   ```

5. **Logging**
   ```typescript
   console.log(`[${req.method}] ${req.path} → ${target}`);
   ```

## Implementation

### 1. Create Gateway Service

```bash
mkdir services/api-gateway
cd services/api-gateway
npm init -y
npm install express http-proxy-middleware cors helmet
```

### 2. Gateway Server

```typescript
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();

// Customer Service proxy
app.use('/api/customers', createProxyMiddleware({
  target: 'http://localhost:4004',
  changeOrigin: true,
}));

// Reservation Service proxy
app.use('/api/reservations', createProxyMiddleware({
  target: 'http://localhost:4003',
  changeOrigin: true,
}));

app.listen(3000, () => {
  console.log('API Gateway running on port 3000');
});
```

### 3. Add Authentication

```typescript
app.use(async (req, res, next) => {
  const token = req.headers.authorization;
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const user = await verifyToken(token);
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});
```

### 4. Add Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  keyGenerator: (req) => req.tenantId || req.ip,
});

app.use(limiter);
```

## Deployment

### Development
```bash
npm run dev
```

### Production
```bash
# Using PM2
pm2 start dist/index.js --name api-gateway

# Using Docker
docker build -t api-gateway .
docker run -p 3000:3000 api-gateway
```

## Configuration

### Environment Variables
```bash
# Gateway
PORT=3000
NODE_ENV=production

# Services
CUSTOMER_SERVICE_URL=http://localhost:4004
RESERVATION_SERVICE_URL=http://localhost:4003

# Auth
JWT_SECRET=your-secret-key

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=1000
```

## Monitoring

### Metrics to Track
- Request count by service
- Response times by service
- Error rates by service
- Rate limit hits
- Authentication failures

### Health Checks
```typescript
app.get('/health', async (req, res) => {
  const services = await Promise.all([
    checkService('customer', 'http://localhost:4004/health'),
    checkService('reservation', 'http://localhost:4003/health'),
  ]);
  
  res.json({
    status: services.every(s => s.healthy) ? 'healthy' : 'degraded',
    services,
  });
});
```

## Security

### 1. HTTPS Only
```typescript
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (!req.secure) {
      return res.redirect(`https://${req.headers.host}${req.url}`);
    }
    next();
  });
}
```

### 2. CORS
```typescript
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(','),
  credentials: true,
}));
```

### 3. Helmet
```typescript
app.use(helmet());
```

### 4. Request Validation
```typescript
app.use((req, res, next) => {
  // Validate tenant ID
  if (!isValidTenantId(req.tenantId)) {
    return res.status(400).json({ error: 'Invalid tenant ID' });
  }
  next();
});
```

## Load Balancing

### Round Robin
```typescript
let currentIndex = 0;
const targets = ['http://server1', 'http://server2'];

function getNextTarget() {
  const target = targets[currentIndex];
  currentIndex = (currentIndex + 1) % targets.length;
  return target;
}
```

### Health-Based
```typescript
const healthyTargets = targets.filter(t => t.healthy);
const target = healthyTargets[Math.floor(Math.random() * healthyTargets.length)];
```

## Caching

### Response Caching
```typescript
import apicache from 'apicache';

const cache = apicache.middleware('5 minutes');

app.get('/api/services', cache, proxy);
```

## Testing

### Integration Tests
```typescript
describe('API Gateway', () => {
  it('should route to customer service', async () => {
    const res = await request(gateway)
      .get('/api/customers')
      .set('Authorization', 'Bearer token');
    
    expect(res.status).toBe(200);
  });
});
```

## Migration Plan

### Phase 1: Parallel Run
- Deploy gateway alongside direct service access
- Monitor performance
- Gradually shift traffic

### Phase 2: Full Migration
- Update all clients to use gateway
- Disable direct service access
- Monitor for issues

### Phase 3: Optimization
- Add caching
- Implement advanced routing
- Fine-tune performance

## Next Steps

1. ✅ Design complete
2. ⏭️ Implement basic gateway
3. ⏭️ Add authentication
4. ⏭️ Add rate limiting
5. ⏭️ Add monitoring
6. ⏭️ Deploy to production
7. ⏭️ Migrate clients

## Resources

- [http-proxy-middleware](https://github.com/chimurai/http-proxy-middleware)
- [Express Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
- [API Gateway Pattern](https://microservices.io/patterns/apigateway.html)
