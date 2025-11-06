# Deployment Safeguards

This document describes the safeguards put in place to prevent common deployment issues.

## Overview

After experiencing issues with localhost references in production builds, we've implemented several layers of protection to catch configuration problems before they reach production.

## Safeguards Implemented

### 1. Build Verification Script (`frontend/scripts/check-build.js`)

**Purpose**: Automatically scans the production build for localhost references and other common issues.

**What it checks**:
- ✅ Build directory exists
- ✅ No `localhost:4004` or `localhost:4003` references in JavaScript files
- ⚠️  Warns if `.env` contains localhost references

**Usage**:
```bash
cd frontend
npm run verify-build
```

**Integration**: Automatically runs before deployment via `predeploy` script.

### 2. Environment Configuration Tests (`frontend/src/__tests__/environment.test.ts`)

**Purpose**: Unit tests that validate environment configuration.

**What it tests**:
- ✅ `NODE_ENV` is defined
- ✅ Production builds don't use localhost URLs
- ✅ Required environment variables are present in production
- ✅ No sensitive data exposed in environment variables

**Usage**:
```bash
cd frontend
npm test -- environment.test.ts
```

### 3. Deployment Checklist (`DEPLOYMENT.md`)

**Purpose**: Comprehensive checklist for manual verification before deployment.

**Sections**:
- Pre-deployment checks (environment, build, code quality, security)
- Deployment commands (frontend, backend, SSL)
- Post-deployment verification (smoke tests, monitoring)
- Common issues and solutions
- Rollback procedures

**Usage**: Review and check off items before each deployment.

### 4. Package.json Scripts

**New scripts added**:
```json
{
  "verify-build": "node scripts/check-build.js",
  "predeploy": "npm run verify-build"
}
```

The `predeploy` script automatically runs before any deployment, catching issues early.

## Deployment Workflow

### Recommended Workflow

1. **Make code changes**
2. **Run tests**: `npm test`
3. **Build for production**: `NODE_ENV=production npm run build`
4. **Verify build**: `npm run verify-build` (runs automatically)
5. **Review checklist**: Check `DEPLOYMENT.md`
6. **Deploy**: Run deployment commands
7. **Verify**: Run post-deployment smoke tests

### Automated Checks

The following checks run automatically:

```bash
# When you run npm run build
NODE_ENV=production npm run build
↓
# predeploy hook runs automatically
npm run verify-build
↓
# Checks for localhost references
node scripts/check-build.js
↓
# ✅ Pass: Deploy proceeds
# ❌ Fail: Deployment blocked
```

## Common Issues Prevented

### Issue 1: Localhost in Production Build
**Problem**: Frontend calls `localhost:4004` instead of production API  
**Prevention**: `check-build.js` scans for localhost references  
**Detection**: Build verification fails with clear error message

### Issue 2: Wrong NODE_ENV
**Problem**: Build created with development settings  
**Prevention**: Environment tests check `NODE_ENV`  
**Detection**: Tests fail if production build has wrong config

### Issue 3: Missing Environment Variables
**Problem**: Required API URLs not set  
**Prevention**: Tests verify required vars are present  
**Detection**: Tests fail if vars are missing

### Issue 4: SSL Certificate Issues
**Problem**: Subdomain not in certificate  
**Prevention**: Deployment checklist includes SSL verification  
**Detection**: Manual check before deployment

## Continuous Improvement

### Adding New Checks

To add a new check:

1. **For build-time checks**: Edit `frontend/scripts/check-build.js`
2. **For runtime checks**: Add tests to `frontend/src/__tests__/environment.test.ts`
3. **For manual checks**: Update `DEPLOYMENT.md` checklist

### Example: Adding a New Check

```javascript
// In check-build.js
if (content.includes('YOUR_PATTERN_HERE')) {
  console.error('❌ ERROR: Found problematic pattern!');
  hasErrors = true;
}
```

## Testing the Safeguards

### Test the Build Verification

```bash
# Create a bad build (for testing)
cd frontend
echo "const api = 'http://localhost:4004';" > build/static/js/test.js

# Run verification (should fail)
npm run verify-build
# Expected: ❌ ERROR: test.js contains localhost API references!

# Clean up
rm build/static/js/test.js
```

### Test the Environment Tests

```bash
# Run environment tests
cd frontend
npm test -- environment.test.ts

# Should pass in development
# Should validate production config when NODE_ENV=production
```

## Maintenance

### Regular Tasks

- **Weekly**: Review deployment logs for patterns
- **Monthly**: Update `DEPLOYMENT.md` with new learnings
- **Per deployment**: Check all items in deployment checklist
- **After incidents**: Add new checks to prevent recurrence

### Updating Safeguards

When you discover a new deployment issue:

1. Document the issue in `DEPLOYMENT.md` under "Common Issues"
2. Add automated check if possible (build script or test)
3. Update deployment checklist
4. Share learnings with team

## Resources

- **Build Verification**: `frontend/scripts/check-build.js`
- **Environment Tests**: `frontend/src/__tests__/environment.test.ts`
- **Deployment Checklist**: `DEPLOYMENT.md`
- **Package Scripts**: `frontend/package.json`

## Summary

These safeguards work together to catch deployment issues at multiple stages:

1. **Development**: Tests catch config issues early
2. **Build**: Verification script validates build output
3. **Pre-deployment**: Checklist ensures manual verification
4. **Post-deployment**: Smoke tests confirm everything works

By following this multi-layered approach, we significantly reduce the risk of deployment issues reaching production.
