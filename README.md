# Tailtown Pet Resort Management System

![CI Status](https://github.com/moosecreates/tailtown/workflows/Continuous%20Integration/badge.svg)
![Frontend Tests](https://github.com/moosecreates/tailtown/workflows/Frontend%20Tests/badge.svg)

**Status:** 🟢 **LIVE IN PRODUCTION**  
**Production URL:** https://canicloud.com (multi-tenant subdomains)  
**Version:** 1.2.6  
**Last Updated:** November 20, 2025

A modern, full-featured SaaS management system for pet resorts, providing comprehensive tools for reservations, customer management, and pet care services.

**🆕 NEW**: Mobile Web App now available! Staff can access checklists, team chat, and schedules from mobile devices at `/mobile` routes.

## 🌐 Access the Application

### For Users & Staff
- **Production (Tailtown):** https://tailtown.canicloud.com
- **Demo Site (BranGro):** https://brangro.canicloud.com

### For Developers Only
- **Local Development:** http://localhost:3000 (requires setup below)

---

## 📚 Documentation

### For Developers (Quick Guides)
- **[📖 Wiki Home](docs/HOME.md)** - Complete documentation hub
- **[Quick Start](docs/human/QUICK-START.md)** - Get running in 10 minutes
- **[Common Tasks](docs/human/COMMON-TASKS.md)** - How to add features, run tests, deploy
- **[Best Practices](docs/human/BEST-PRACTICES.md)** - Code standards and patterns
- **[Security](docs/human/SECURITY.md)** - Security features and how to use them
- **[Roadmap](docs/human/ROADMAP.md)** - What's next for Tailtown

### For Technical Leadership
- **[Senior Dev Review](docs/SENIOR-DEV-REVIEW.md)** - ⭐ Architecture review & scaling roadmap (4/5 stars)
- **[System Architecture](docs/CURRENT-SYSTEM-ARCHITECTURE.md)** - Complete architecture overview
- **[Disaster Recovery](docs/operations/DISASTER-RECOVERY-PLAN.md)** - Backup & recovery procedures

### For AI Assistants (Complete Context)
- **[Security Implementation](docs/ai-context/security/)** - Complete security details
- **[Testing](docs/ai-context/testing/)** - Test analysis and maintenance
- **[Documentation Strategy](docs/DOCUMENTATION-STRATEGY.md)** - How we organize docs

### Reference
- **[Security Checklist](docs/SECURITY-CHECKLIST.md)** - Security verification
- **[Development Best Practices](docs/DEVELOPMENT-BEST-PRACTICES.md)** - Code standards

---

## 🚀 Quick Start

### For End Users
**Just visit the production site** - no setup needed!
- **Tailtown (Production):** https://tailtown.canicloud.com
- **BranGro (Demo):** https://brangro.canicloud.com

### For Developers (Local Setup)

**Prerequisites:**
- Node.js 18+ and npm
- PostgreSQL 14+
- Git

**Installation:**
```bash
# Clone the repository
git clone https://github.com/moosecreates/tailtown.git
cd tailtown

# Install dependencies
npm install
cd frontend && npm install && cd ..
cd services/customer && npm install && cd ../..
cd services/reservation && npm install && cd ../..

# Set up environment variables
cp services/customer/.env.example services/customer/.env
cp services/reservation/.env.example services/reservation/.env
# Edit .env files with your database credentials

# Start all services
npm run start:services

# In a new terminal, start the frontend
cd frontend && npm start
```

**Local Development URLs:**
- **Frontend:** http://localhost:3000
- **Customer API:** http://localhost:4004
- **Reservation API:** http://localhost:4003

**See:** [Quick Start Guide](docs/human/QUICK-START.md) for detailed setup instructions

---

## 📚 Documentation

### Essential Reading
- **[Documentation Index](DOCUMENTATION-INDEX.md)** - Master index of all documentation
- **[Development Best Practices](docs/DEVELOPMENT-BEST-PRACTICES.md)** - ⭐ Common patterns & pitfalls
- **[Developer Toolkit](DEVELOPER-TOOLKIT.md)** - Essential commands and tools
- **[Deployment Guide](deployment/DEPLOYMENT-GUIDE.md)** - How to deploy to production
- **[Product Roadmap](docs/ROADMAP.md)** - Feature roadmap and priorities

### By Audience
- **For Developers:** [Development Guides](docs/development/)
- **For DevOps:** [Operations Guides](docs/operations/)
- **For Product:** [Feature Overview](docs/SYSTEM-FEATURES-OVERVIEW.md)

---

## 🎯 Key Features

### Core Functionality
- **Reservation Management** - Boarding, daycare, grooming, training
- **Customer & Pet Management** - Complete profiles with medical records
- **Resource Scheduling** - Kennel/suite availability and assignment
- **Staff Management** - Schedules, roles, and permissions
- **Point of Sale** - Checkout, invoicing, and inventory
- **Reporting** - Financial, operational, and compliance reports

### Advanced Features
- **Multi-Tenant Support** - Isolated data per business
- **Training Classes** - Class management and enrollment
- **Vaccine Compliance** - Automatic requirement checking
- **Email & SMS Notifications** - Automated customer communications
- **Customer Portal** - Online booking and account management
- **Loyalty & Coupons** - Rewards and promotional campaigns

### 🆕 In Development (Q4 2025 - Q1 2026)
- **📱 Mobile Web App (PWA)** - Mobile-optimized staff portal
  - Daily checklists with photo upload
  - Pet health notes with camera integration
  - Real-time team communication
  - Personal schedule viewing
  - Quick pet lookup
  - Works on iOS, Android, tablets
  - Installable as PWA (no app store needed)
  
- **💬 Internal Communications (Slack-like)** - Team collaboration platform
  - Public and private channels
  - Direct messages (1-on-1 and group)
  - Threaded replies and reactions
  - File attachments and @mentions
  - Read receipts and typing indicators
  - Customizable notifications
  - Real-time WebSocket messaging
  - **Status**: Database schema complete ✅

---

## 🏗️ Architecture

### Technology Stack
- **Frontend:** React 18, TypeScript, Material-UI
- **Backend:** Node.js, Express, TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** JWT with bcrypt, automatic token management
- **Deployment:** PM2 (cluster mode), Nginx, Let's Encrypt SSL
- **Testing:** Jest with 18+ test cases for critical middleware

### Services
```
Frontend (Port 3000)           - React SPA with JWT auth
Customer Service (Port 4004)   - Customer, pet, staff, products, announcements
Reservation Service (Port 4003) - Reservations, resources, scheduling
```

### Multi-Tenant Architecture
- Subdomain-based tenant detection (e.g., brangro.canicloud.com)
- Complete data isolation per tenant
- 13 controllers with proper tenant context
- Middleware-based tenant extraction and validation

For detailed architecture, see [CURRENT-SYSTEM-ARCHITECTURE.md](docs/CURRENT-SYSTEM-ARCHITECTURE.md)

---

## 🧪 Testing

### Run Tests
```bash
# All tests
npm test

# Specific service
cd services/customer && npm test
cd services/reservation && npm test

# Frontend tests
cd frontend && npm test

# Integration tests
npm run test:integration
```

### Test Coverage
- **488+ automated tests** (18 new middleware tests added Nov 5)
- **80%+ code coverage**
- **Integration tests** for critical workflows
- **Middleware tests** for tenant isolation and authentication

---

## 🚢 Deployment

### Production Deployment
See [PRODUCTION-DEPLOYMENT-NOV-2025.md](PRODUCTION-DEPLOYMENT-NOV-2025.md) for the latest deployment summary.

### Quick Deploy
```bash
# Build frontend
cd frontend && NODE_ENV=production npm run build

# Deploy to server
scp -i ~/ttkey build.tar.gz root@129.212.178.244:/opt/tailtown/frontend/
ssh -i ~/ttkey root@129.212.178.244 "cd /opt/tailtown/frontend && tar -xzf build.tar.gz && pm2 restart frontend"

# Deploy backend
ssh -i ~/ttkey root@129.212.178.244 "cd /opt/tailtown && git pull && cd services/customer && npm run build && pm2 restart customer-service"
```

For detailed deployment instructions, see [deployment/DEPLOYMENT-GUIDE.md](deployment/DEPLOYMENT-GUIDE.md).

---

## 🛠️ Development

### Common Commands
```bash
# Start all services
npm run start:services

# Stop all services
npm run stop:services

# Check service health
npm run health:check

# Kill zombie processes
npm run kill:zombies

# Run database migrations
cd services/customer && npx prisma migrate dev
```

See [DEVELOPER-TOOLKIT.md](DEVELOPER-TOOLKIT.md) for complete command reference.

### Code Quality
```bash
# Lint
npm run lint

# Format
npm run format

# Type check
npm run type-check
```

---

## 📊 Production Status

### Current Deployment (November 7, 2025)

**Production Tenant**: Tailtown (https://tailtown.canicloud.com)
- 🔴 **CRITICAL** - Your business, real data
- Real customers, pets, and reservations
- Daily operations and staff usage

**Demo Tenant**: BranGro (https://brangro.canicloud.com)
- 🟡 **DEMO** - Customer demos, mock data
- 20 demo customers, 20 demo pets
- 10 sample reservations, 4 staff accounts
- 6 template POS products

**Dev Tenant**: Dev (http://localhost:3000 - developers only)
- 🟢 **DEVELOPMENT** - Safe to break
- Local testing and experiments

### System Health
- ✅ All services operational
- ✅ Zero critical errors
- ✅ SSL certificate valid (Let's Encrypt)
- ✅ **Daily automated backups** (DigitalOcean)
- ✅ PM2 cluster mode (2 instances per service)
- ✅ Nginx reverse proxy with SSL

For tenant strategy details, see [docs/TENANT-STRATEGY.md](docs/TENANT-STRATEGY.md)

---

## 🤝 Contributing

### Development Workflow
1. Create a feature branch from `main`
2. Make your changes with tests
3. Run `npm test` to verify
4. Commit with descriptive messages
5. Push and create a pull request

### Code Standards
- **TypeScript** for type safety
- **ESLint** for code quality
- **Prettier** for formatting
- **Jest** for testing
- **Conventional Commits** for commit messages

---

## 📝 License

Proprietary - All rights reserved

---

## 📞 Support

- **Documentation:** [DOCUMENTATION-INDEX.md](DOCUMENTATION-INDEX.md)
- **Issues:** GitHub Issues
- **Email:** rob@tailtownpetresort.com

---

## 🎉 Recent Updates

### November 7, 2025 - Documentation & Operations
- ✅ **Senior Dev Review**: Comprehensive architecture review (4/5 stars, top 20% of startups)
- ✅ **Backup Strategy**: Enabled DigitalOcean daily automated backups
- ✅ **Disaster Recovery**: Updated recovery plan for production setup
- ✅ **Documentation**: Added scaling roadmap and immediate action items

### November 5, 2025 - Major Cleanup & Testing
- ✅ **Code Cleanup**: Fixed 13 controllers (86+ functions) for proper tenant context
- ✅ **Authentication**: Implemented proper JWT flow, removed 'default-user' fallback
- ✅ **Testing**: Created comprehensive test suite (18 test cases)
- ✅ **Bug Fixes**: Profile photo display, login API URLs, announcement persistence
- ✅ **POS**: Added 5 template products for BranGro tenant
- ✅ **Deployments**: 11 frontend + 5 backend deployments, all successful

### November 4, 2025
- ✅ Production deployment to canicloud.com
- ✅ Brangro tenant fully configured
- ✅ Fixed 11 critical bugs
- ✅ Populated with test data

See [CHANGELOG.md](CHANGELOG.md) for complete history.

---

**Built with ❤️ for pet care professionals**
