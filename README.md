# Tailtown Pet Resort Management System

![CI Status](https://github.com/moosecreates/tailtown/workflows/Continuous%20Integration/badge.svg)
![Frontend Tests](https://github.com/moosecreates/tailtown/workflows/Frontend%20Tests/badge.svg)

**Status:** 🟢 **LIVE IN PRODUCTION**  
**Production URL:** https://canicloud.com  
**Version:** 1.0.0  
**Last Updated:** November 5, 2025

A modern, full-featured management system for pet resorts, providing comprehensive tools for reservations, customer management, and pet care services.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 14+
- Git

### Installation
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

### Access the Application
- **Frontend:** http://localhost:3000
- **Customer API:** http://localhost:4004
- **Reservation API:** http://localhost:4003

---

## 📚 Documentation

### Essential Reading
- **[Documentation Index](DOCUMENTATION-INDEX.md)** - Master index of all documentation
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

---

## 🏗️ Architecture

### Technology Stack
- **Frontend:** React 18, TypeScript, Material-UI
- **Backend:** Node.js, Express, TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** JWT with bcrypt
- **Deployment:** PM2, Nginx, Let's Encrypt SSL

### Services
```
Frontend (Port 3000)           - React SPA
Customer Service (Port 4004)   - Customer, pet, staff management
Reservation Service (Port 4003) - Reservations, resources, scheduling
```

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
- **470+ automated tests**
- **80%+ code coverage**
- **Integration tests** for critical workflows

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

### Current Deployment (November 5, 2025)
- **Tenant:** Brangro (brangro.canicloud.com)
- **Customers:** 20
- **Pets:** 20
- **Reservations:** 10
- **Staff:** 4
- **Resources:** 15 suites, 5 runs
- **Training Classes:** 3

### System Health
- ✅ All services operational
- ✅ Zero critical errors
- ✅ SSL certificate valid
- ✅ Database backups running
- ✅ Monitoring active

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

### November 5, 2025
- ✅ Fixed phone number search in reservation modal
- ✅ Fixed products API localhost URLs
- ✅ Added SendGrid/Twilio to roadmap
- ✅ Documentation cleanup and organization

### November 4, 2025
- ✅ Production deployment to canicloud.com
- ✅ Brangro tenant fully configured
- ✅ Fixed 11 critical bugs
- ✅ Populated with test data

See [CHANGELOG.md](CHANGELOG.md) for complete history.

---

**Built with ❤️ for pet care professionals**
