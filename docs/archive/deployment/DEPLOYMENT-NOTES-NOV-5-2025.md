# Deployment Notes - November 5, 2025

## Session Summary
Major bug fixes and feature improvements deployed to production.

## 🎯 Issues Fixed

### 1. **Tenant Context Bug in Products API** (CRITICAL)
- **Issue**: Products controller was using `req.headers['x-tenant-id']` instead of `req.tenantId` from middleware
- **Impact**: All tenants were seeing dev tenant products instead of their own
- **Fix**: Updated all controller functions to use `TenantRequest` type and `req.tenantId`
- **Files Modified**:
  - `/services/customer/src/controllers/products.controller.ts`
- **Status**: ✅ Fixed and deployed

### 2. **Login API URL Hardcoded to Localhost**
- **Issue**: AuthContext was using hardcoded localhost URL for login endpoint
- **Impact**: Login failed in production with ERR_CONNECTION_REFUSED
- **Fix**: Use dynamic API URL based on environment (`window.location.origin` in production)
- **Files Modified**:
  - `/frontend/src/contexts/AuthContext.tsx` (line 99)
- **Status**: ✅ Fixed and deployed

### 3. **Profile Photo Not Included in User Session**
- **Issue**: `profilePhoto` field wasn't being saved to user object during login
- **Impact**: Profile pictures didn't display in header avatar
- **Fix**: Added `profilePhoto` to userData object in login response
- **Files Modified**:
  - `/frontend/src/contexts/AuthContext.tsx` (line 122)
- **Status**: ✅ Fixed and deployed

### 4. **Login Form Label Overlap**
- **Issue**: Input labels overlapped with values on page refresh
- **Impact**: Poor UX - labels appeared over input text
- **Fix**: Added `InputLabelProps={{ shrink: true }}` to TextField components
- **Files Modified**:
  - `/frontend/src/pages/auth/Login.tsx` (lines 84, 98)
- **Status**: ✅ Fixed and deployed

### 5. **Announcement Count Persistence**
- **Issue**: Announcement count disappeared when modal was closed (not dismissed)
- **Impact**: Users couldn't track undismissed announcements
- **Fix**: Added useEffect to reload announcements on route change
- **Files Modified**:
  - `/frontend/src/components/layouts/MainLayout.tsx` (lines 98-100)
- **Status**: ✅ Fixed and deployed

### 6. **Announcement Dismissals for Default User**
- **Issue**: All unauthenticated users shared same 'default-user' ID, so dismissals affected everyone
- **Impact**: Dismissing announcement for one user dismissed it for all
- **Fix**: Cleared dismissals for default-user in database (temporary fix)
- **Note**: ⚠️ This is a known limitation - proper user authentication needed
- **Status**: ✅ Workaround applied

## 🆕 Features Added

### 1. **POS Products for BranGro Tenant**
- Added 5 template products with proper categories:
  - Flea & Tick Treatment ($24.99) - Health & Wellness
  - Premium Dog Shampoo ($18.50) - Grooming
  - Dental Chew Treats 30pk ($32.99) - Food & Treats
  - Nail Trim Service ($15.00) - Services
  - Pet Waste Bags 200ct ($12.99) - Supplies
- Created 5 product categories for organization
- **Status**: ✅ Complete

### 2. **Profile Picture Display in Header**
- Added support for displaying user profile photos in header avatar
- Falls back to initials if no photo exists
- Constructs full URL for profile photo paths
- **Files Modified**:
  - `/frontend/src/components/layouts/MainLayout.tsx` (line 407)
- **Status**: ✅ Complete

## 📊 Deployment Statistics

- **Frontend Deployments**: 8
- **Backend Deployments**: 2
- **Database Updates**: 3
- **Total Files Modified**: 6
- **Lines of Code Changed**: ~150

## 🔧 Technical Details

### Backend Changes
- **Language**: TypeScript
- **Build Command**: `npm run build` (compiles to `/dist`)
- **Restart Command**: `pm2 restart customer-service`
- **Server**: Oracle Cloud (129.212.178.244)

### Frontend Changes
- **Framework**: React + TypeScript
- **Build Command**: `NODE_ENV=production npm run build`
- **Deploy Method**: tar + scp + pm2 restart
- **Build Size**: ~7.97 kB main bundle (gzipped)

## ⚠️ Known Issues & Technical Debt

### 1. **Default User Authentication**
- **Issue**: Unauthenticated users share 'default-user' ID
- **Impact**: Announcement dismissals affect all unauthenticated users
- **Recommendation**: Implement proper session-based or JWT authentication
- **Priority**: Medium
- **Files to Update**:
  - `/services/customer/src/controllers/announcement.controller.ts` (lines 23, 214)

### 2. **Tenant Middleware Consistency**
- **Issue**: Some controllers may still use `req.headers['x-tenant-id']` pattern
- **Impact**: Potential tenant isolation bugs
- **Recommendation**: Audit all controllers to ensure they use `TenantRequest` type
- **Priority**: High
- **Files to Audit**:
  - All files in `/services/customer/src/controllers/`

### 3. **Profile Photo Upload Path**
- **Issue**: Profile photos stored locally, not in cloud storage
- **Impact**: Photos lost on server restart/rebuild
- **Recommendation**: Implement S3 or similar cloud storage
- **Priority**: Low
- **Files to Update**:
  - `/services/customer/src/controllers/staff.controller.ts`

### 4. **Console Logging in Production**
- **Issue**: Debug console.log statements in production code
- **Impact**: Performance and security concerns
- **Recommendation**: Remove or use proper logging library
- **Priority**: Low
- **Files to Clean**:
  - `/frontend/src/components/layouts/MainLayout.tsx` (line 104)

## 🧪 Testing Checklist

### Completed ✅
- [x] Login works on production URL
- [x] Products display correctly per tenant
- [x] Announcement count persists after closing modal
- [x] Login form displays correctly on refresh
- [x] Profile photo field included in user session
- [x] 5 POS products created for BranGro

### Recommended Testing 🔍
- [ ] Test profile photo upload and display
- [ ] Test announcement dismissal across multiple users
- [ ] Test products CRUD operations
- [ ] Test tenant isolation (create product in one tenant, verify not visible in another)
- [ ] Test login/logout flow completely
- [ ] Test all POS features with new products

## 🚀 Next Steps

1. **Code Cleanup**
   - Remove debug console.log statements
   - Add JSDoc comments to modified functions
   - Audit other controllers for tenant context usage

2. **Documentation**
   - Update API documentation for products endpoints
   - Document tenant middleware usage for developers
   - Create runbook for common deployment tasks

3. **Monitoring**
   - Set up alerts for 500 errors
   - Monitor tenant context failures
   - Track announcement engagement metrics

4. **Future Enhancements**
   - Implement proper user authentication
   - Add cloud storage for uploads
   - Create automated deployment pipeline
   - Add unit tests for tenant middleware

## 📞 Support

- **Production URL**: https://brangro.canicloud.com
- **Default Tenant**: https://canicloud.com/dashboard
- **Server**: 129.212.178.244
- **SSH Key**: ~/ttkey
- **PM2 Logs**: `pm2 logs customer-service`

---

**Deployed by**: Cascade AI Assistant  
**Date**: November 5, 2025  
**Session Duration**: ~2 hours  
**Status**: ✅ All systems operational
