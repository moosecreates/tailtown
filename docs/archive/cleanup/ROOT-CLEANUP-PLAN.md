# Root Directory Cleanup Plan

**Current State:** 100+ files in root directory  
**Goal:** Clean, organized root with only essential files

---

## ✅ Keep in Root (Essential)

### Package Management
- `package.json` ✅
- `package-lock.json` ✅

### Documentation
- `README.md` ✅
- `CHANGELOG.md` ✅

### Configuration
- `docker-compose.yml` ✅
- `docker-compose.dev.yml` ✅
- `docker-compose.prod.yml` ✅
- `playwright.config.ts` ✅
- `ecosystem.config.js` ✅ (PM2 config)

### Deployment
- `deploy.sh` ✅ (main deployment script)

**Total to keep:** ~10 files

---

## 📁 Move to `/scripts/`

### Database Scripts
- `backup_*.sql` → `/scripts/database/backups/`
- `clean-and-import-staff.sql` → `/scripts/database/`
- `create-default-checkin-template.sql` → `/scripts/database/`
- `fix-*.sql` → `/scripts/database/fixes/`
- `*-import*.sql` → `/scripts/database/imports/`
- `gingr-*.sql` → `/scripts/database/gingr/`

### Python Scripts
- `check-*.py` → `/scripts/python/`
- `verify-*.py` → `/scripts/python/`

### JavaScript Scripts
- `extract-*.js` → `/scripts/js/`
- `find-*.js` → `/scripts/js/`
- `inspect-*.js` → `/scripts/js/`
- `run-fixes.js` → `/scripts/js/`
- `test-*.js` → `/scripts/js/`

### Shell Scripts
- `fix-tt-commands.sh` → `/scripts/shell/`
- `git-commit-and-push.sh` → `/scripts/shell/`
- `node-installer.sh` → `/scripts/shell/`
- `QUICK-DEPLOY-*.sh` → `/scripts/deployment/`
- `restart*.sh` → `/scripts/shell/`
- `run-fixes.sh` → `/scripts/shell/`
- `setup-automation.sh` → `/scripts/shell/`
- `start-*.sh` → `/scripts/shell/`
- `test-urls.sh` → `/scripts/shell/`

### HTML Test Files
- `debug-calendar.html` → `/scripts/test-pages/`
- `suite-availability-test.html` → `/scripts/test-pages/`
- `test-availability.html` → `/scripts/test-pages/`

---

## 📁 Move to `/docs/archive/`

### Session Summaries
- `SESSION-SUMMARY-*.md` → `/docs/archive/sessions/`
- `DOCUMENTATION-UPDATE-NOV-5-2025.md` → `/docs/archive/sessions/`

### Deployment Docs (Historical)
- `DEPLOYMENT-CHECKLIST-NOV-6-2025.md` → `/docs/archive/deployment/`
- `DEPLOYMENT-NOTES-NOV-5-2025.md` → `/docs/archive/deployment/`
- `DEPLOYMENT-SUMMARY-NOV-6-2025.md` → `/docs/archive/deployment/`
- `MULTI-TENANT-DEPLOYMENT-SUMMARY.md` → `/docs/archive/deployment/`
- `PR-PRODUCTION-DEPLOYMENT.md` → `/docs/archive/deployment/`
- `PRODUCTION-DEPLOYMENT-NOV-2025.md` → `/docs/archive/deployment/`
- `PROFILE-PHOTO-FIXES-NOV-5-2025.md` → `/docs/archive/fixes/`
- `TEST-IMPROVEMENTS-NOV-5-2025.md` → `/docs/archive/testing/`

### Feature Docs (Historical)
- `AUTH-AND-TESTING-IMPROVEMENTS.md` → `/docs/archive/features/`
- `CODE-CLEANUP-*.md` → `/docs/archive/cleanup/`
- `CONTROLLER-AUDIT-RESULTS.md` → `/docs/archive/audits/`
- `KENNEL-CARDS-PERFORMANCE-FIX.md` → `/docs/archive/fixes/`
- `LOYALTY-PROGRAM-ADDED.md` → `/docs/archive/features/`
- `MULTI-PET-RESERVATION-FEATURE.md` → `/docs/archive/features/`
- `MULTI-TENANCY-TESTS-SUMMARY.md` → `/docs/archive/testing/`
- `TENANT-CLARIFICATION-UPDATE.md` → `/docs/archive/features/`

### Checklists & Guides (Outdated)
- `DEPLOYMENT-CHECKLIST.md` → `/docs/archive/deployment/`
- `DEPLOYMENT-GUIDE.md` → `/docs/archive/deployment/`
- `DEPLOYMENT-SAFEGUARDS.md` → `/docs/archive/deployment/`
- `DEPLOYMENT.md` → `/docs/archive/deployment/`
- `MANUAL-DEPLOY-STEPS.md` → `/docs/archive/deployment/`
- `REMAINING-WORK-BEFORE-ROADMAP.md` → `/docs/archive/planning/`

### README Files
- `README-STAFF-IMPORT.md` → `/docs/archive/imports/`
- `README-ZOMBIE-PREVENTION.md` → `/docs/archive/troubleshooting/`
- `gingr-users-summary.md` → `/docs/archive/imports/`

### Other Docs
- `DEVELOPER-TOOLKIT.md` → `/docs/archive/`
- `DOCUMENTATION-CLEANUP-SUMMARY.md` → `/docs/archive/`
- `DOCUMENTATION-INDEX.md` → `/docs/archive/`
- `KILL-ZOMBIES.md` → `/docs/archive/troubleshooting/`
- `OVERVIEW.md` → `/docs/archive/`
- `QUICK-REFERENCE.md` → `/docs/archive/`

---

## 🗑️ Delete (Temporary/Obsolete)

### Temporary Files
- `COMMIT_MESSAGE.txt` ❌ (temporary)
- `import-log.txt` ❌ (old log)
- `tailtown_data_export.sql` ❌ (old export)

### Security Audit Files (Completed)
- `security-audit-customer.json` ❌ (move to /docs/archive/security/)
- `security-audit-frontend.json` ❌ (move to /docs/archive/security/)
- `security-audit-reservation.json` ❌ (move to /docs/archive/security/)

### Dockerfiles (Move)
- `Dockerfile.health` → `/docker/`

---

## 📊 Summary

### Current
- **Total files in root:** ~100
- **Essential files:** ~10
- **To organize:** ~90

### After Cleanup
- **Root directory:** ~10 essential files
- **Scripts organized:** `/scripts/` with subdirectories
- **Docs archived:** `/docs/archive/` with categories
- **Deleted:** ~5 temporary files

---

## 🚀 Execution Plan

### Phase 1: Create Directory Structure
```bash
mkdir -p scripts/{database/{backups,fixes,imports,gingr},python,js,shell,deployment,test-pages}
mkdir -p docs/archive/{sessions,deployment,features,cleanup,audits,fixes,testing,planning,imports,troubleshooting,security}
mkdir -p docker
```

### Phase 2: Move Scripts
```bash
# Database scripts
mv backup_*.sql scripts/database/backups/
mv *-import*.sql scripts/database/imports/
mv fix-*.sql scripts/database/fixes/
mv gingr-*.sql scripts/database/gingr/
mv *.sql scripts/database/

# Python scripts
mv *.py scripts/python/

# JavaScript scripts
mv extract-*.js find-*.js inspect-*.js run-fixes.js test-*.js scripts/js/

# Shell scripts
mv *-deploy*.sh scripts/deployment/
mv restart*.sh start-*.sh scripts/shell/
mv *.sh scripts/shell/

# HTML test files
mv *.html scripts/test-pages/
```

### Phase 3: Archive Documentation
```bash
# Session summaries
mv SESSION-SUMMARY-*.md DOCUMENTATION-UPDATE-*.md docs/archive/sessions/

# Deployment docs
mv *DEPLOYMENT*.md docs/archive/deployment/

# Feature docs
mv *-FEATURE.md *-ADDED.md docs/archive/features/

# Cleanup docs
mv CODE-CLEANUP-*.md DOCUMENTATION-CLEANUP-*.md docs/archive/cleanup/

# Test docs
mv *-TESTS-*.md TEST-IMPROVEMENTS-*.md docs/archive/testing/

# Audit docs
mv *-AUDIT-*.md docs/archive/audits/

# Fix docs
mv *-FIX*.md *-FIXES-*.md docs/archive/fixes/

# Other
mv REMAINING-WORK-*.md docs/archive/planning/
mv README-*.md gingr-users-summary.md docs/archive/imports/
mv KILL-ZOMBIES.md docs/archive/troubleshooting/
mv security-audit-*.json docs/archive/security/
```

### Phase 4: Delete Temporary Files
```bash
rm COMMIT_MESSAGE.txt import-log.txt tailtown_data_export.sql
```

### Phase 5: Move Docker Files
```bash
mv Dockerfile.health docker/
```

---

## ✅ Final Root Directory

After cleanup, root should contain only:
```
/
├── package.json
├── package-lock.json
├── README.md
├── CHANGELOG.md
├── docker-compose.yml
├── docker-compose.dev.yml
├── docker-compose.prod.yml
├── playwright.config.ts
├── ecosystem.config.js
├── deploy.sh
├── docs/
├── scripts/
├── docker/
├── frontend/
├── services/
└── mcp-server/
```

**Clean, organized, professional!** ✨
