# Tailtown Developer Toolkit

**Complete Reference Guide** | Last Updated: November 3, 2025

## 🎯 Quick Reference

### Essential Commands
```bash
# Start Development
npm run dev:start          # Start all services
npm run dev:status         # Check status
npm run env:status         # Check environment

# Testing
npm run test:quick         # Fast tests
npm run test:changed       # Test changes only

# Database
npm run db:backup          # Backup database
npm run db:status          # Database info

# Utilities
npm run util:logs          # Analyze logs
npm run util:info          # Project info
```

---

## 🏗️ Complete System Overview

### 1. Workflow Management
**Purpose**: Unified service management

**Commands**:
- `npm run dev:start` - Start with validation
- `npm run dev:stop` - Graceful shutdown
- `npm run dev:restart` - Full restart
- `npm run dev:status` - Detailed status
- `npm run dev:check` - Pre-flight checks
- `npm run dev:logs` - Live logs

**Features**:
- Pre-flight validation
- Health monitoring
- PID tracking
- Automatic cleanup

### 2. Environment Management
**Purpose**: Safe environment switching

**Commands**:
- `npm run env:dev` - Development (localhost)
- `npm run env:prod` - Production (Digital Ocean)
- `npm run env:status` - Current environment
- `npm run env:backups` - List backups

**Features**:
- Automatic backups
- Production warnings
- Configuration validation
- Service restart reminders

### 3. Database Management
**Purpose**: Database operations

**Commands**:
- `npm run db:status` - Database info
- `npm run db:backup` - Create backup
- `npm run db:restore` - Restore backup
- `npm run db:reset` - Reset database
- `npm run db:seed` - Seed data
- `npm run db:migrate` - Run migrations
- `npm run db:console` - PostgreSQL console

**Features**:
- Compressed backups
- Automatic pre-reset backup
- Migration helpers
- Direct database access

### 4. Testing Automation
**Purpose**: Comprehensive testing

**Commands**:
- `npm run test:all` - Full suite
- `npm run test:quick` - Unit tests only
- `npm run test:changed` - Changed files
- `npm run test:watch` - Watch mode
- `npm run test:coverage` - Coverage reports
- `npm run test:status` - Test statistics

**Features**:
- Smart test selection
- Fast feedback
- Coverage tracking
- 79 test files ready

### 5. CI/CD Pipeline
**Purpose**: Automated quality & deployment

**Workflows**:
- **Test Suite** - Runs on every push
- **Deploy** - Deploys to production
- **PR Checks** - Validates pull requests

**Features**:
- Automatic testing
- Quality gates
- One-click deployment
- Health verification

### 6. Development Utilities
**Purpose**: Common development tasks

**Commands**:
- `npm run util:component <name>` - Generate component
- `npm run util:service <name>` - Generate service
- `npm run util:controller <name> <service>` - Generate controller
- `npm run util:seed` - Seed data
- `npm run util:logs` - Analyze logs
- `npm run util:fix-prisma` - Fix Prisma
- `npm run util:info` - Project info

**Features**:
- Code generators
- Data seeding
- Log analysis
- Quick fixes

---

## 📊 System Architecture

```
Development Environment
├── Workflow Management (dev:*)
│   ├── Service startup/shutdown
│   ├── Health monitoring
│   └── Log management
├── Environment Management (env:*)
│   ├── Development config
│   ├── Production config
│   └── Automatic backups
├── Database Management (db:*)
│   ├── Backup/restore
│   ├── Migrations
│   └── Seeding
├── Testing System (test:*)
│   ├── Unit tests
│   ├── Integration tests
│   └── Coverage reports
├── CI/CD Pipeline
│   ├── GitHub Actions
│   ├── Automated testing
│   └── Deployment
└── Development Utilities (util:*)
    ├── Code generators
    ├── Data tools
    └── Quick fixes
```

---

## 🔄 Daily Workflows

### Morning Routine
```bash
npm run env:status      # Verify environment
npm run dev:check       # Pre-flight checks
npm run dev:start       # Start services
```

### During Development
```bash
npm run dev:status      # Check services
npm run test:watch      # Auto-test
npm run dev:logs        # Monitor logs
```

### Before Committing
```bash
npm run test:changed    # Test changes
npm run env:status      # Verify environment
git add . && git commit
```

### End of Day
```bash
npm run dev:stop        # Stop services
npm run db:backup       # Backup database (optional)
```

---

## 🎓 Learning Path

### Week 1: Basics
1. Run `npm run dev:start`
2. Explore `npm run dev:status`
3. Try `npm run test:quick`
4. Check `npm run env:status`

### Week 2: Testing
1. Use `npm run test:watch`
2. Try `npm run test:changed`
3. Generate coverage with `npm run test:coverage`

### Week 3: Database
1. Create backup with `npm run db:backup`
2. Try `npm run db:console`
3. Experiment with `npm run db:seed`

### Week 4: Advanced
1. Use code generators
2. Analyze logs
3. Create pull requests
4. Monitor CI/CD

---

## 🚨 Emergency Procedures

### Services Won't Start
```bash
npm run dev:cleanup
npm run dev:check
npm run dev:start
```

### Database Issues
```bash
npm run db:status
docker-compose restart
npm run dev:restart
```

### Tests Failing
```bash
npm run util:fix-prisma
npm run test:quick
```

### Production Issues
```bash
npm run env:prod
npm run dev:restart
# Monitor logs
npm run env:dev  # Switch back
```

---

## 📈 Metrics & Monitoring

### Test Coverage
- Frontend: 45 test files
- Customer Service: 20 test files
- Reservation Service: 14 test files
- **Total**: 79 test files

### Service Ports
- Frontend: 3000
- Customer API: 4004
- Reservation API: 4003
- PostgreSQL: 5433

### Performance
- Test suite: ~5-8 minutes
- Quick tests: ~30 seconds
- Service startup: ~20-35 seconds

---

## 🔗 Related Documentation

- [Quick Start Guide](./docs/QUICK-START.md)
- [Development Workflow](./docs/development/WORKFLOW.md)
- [Environment Management](./docs/development/ENVIRONMENT-MANAGEMENT.md)
- [CI/CD Workflows](./.github/workflows/README.md)
- [Development Status](./DEVELOPMENT-STATUS.md)

---

## 🎉 Achievement Summary

### Systems Built (November 3, 2025)
1. ✅ Workflow Management - Service orchestration
2. ✅ Environment Management - Safe config switching
3. ✅ Database Management - Complete DB toolkit
4. ✅ Testing Automation - Comprehensive testing
5. ✅ CI/CD Pipeline - Automated deployment
6. ✅ Development Utilities - Code generators & tools

### Total Commands Added: 40+
### Total Scripts Created: 6
### Documentation Pages: 10+

---

**You now have a production-grade development environment! 🚀**
