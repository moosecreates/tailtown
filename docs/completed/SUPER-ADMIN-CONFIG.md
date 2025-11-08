# Super Admin Portal - Configuration Decisions

**Date:** November 1, 2025  
**Status:** Approved for Implementation

---

## 🔐 Security Configuration

### Initial Super Admin Account
- **Name:** Rob Weinstein
- **Email:** TBD (to be provided during setup)
- **Role:** SUPER_ADMIN
- **Status:** Will be created during Phase 1 deployment

### Two-Factor Authentication (2FA)
- **MVP Status:** Not required
- **Future Plan:** Mandatory for all super admins
- **Implementation:** Phase 5 (Advanced Features)
- **Note:** Infrastructure will be built to support 2FA, but not enforced initially

### Impersonation Sessions
- **Time Limit:** 30 minutes per session (default)
- **Auto-Timeout:** Yes
- **Re-authentication:** Not required (2FA not mandatory for MVP)
- **Session Extension:** Allowed (can start new session)
- **Reason Required:** Yes (must provide reason for impersonation)

### IP Whitelisting
- **MVP Status:** Disabled
- **Reason:** Remote work with varying IPs
- **Future Plan:** Can be enabled per super admin account
- **Implementation:** Infrastructure ready, but not enforced

---

## 📊 Data Retention

### Audit Logs
- **Retention Period:** 90 days
- **Auto-Cleanup:** Yes (scheduled job to delete logs older than 90 days)
- **Export Before Deletion:** Optional (can export before cleanup)
- **Critical Events:** May be retained longer (to be determined)
- **Review Schedule:** Quarterly review to adjust retention if needed

### Deleted Tenants
- **Soft Delete Period:** 1 year
- **Recovery Window:** 365 days from deletion
- **Data Status:** Marked as DELETED, not physically removed
- **Purge Schedule:** After 1 year, data is permanently deleted
- **Recovery Process:** Super admin can reactivate within 1 year window

### Impersonation Session Logs
- **Retention:** Same as audit logs (90 days)
- **Includes:** Start time, end time, reason, actions performed
- **Purpose:** Compliance and security auditing

---

## 🎯 MVP Scope (Phase 1-3)

### Included Features
✅ Super admin authentication (without 2FA)  
✅ Tenant management (create, edit, suspend, delete)  
✅ Tenant impersonation (30 min sessions)  
✅ Audit logging (90 day retention)  
✅ Soft delete with 1 year recovery  

### Deferred to Post-MVP
⏳ Two-factor authentication  
⏳ IP whitelisting  
⏳ Multiple super admin roles (Support, Developer)  
⏳ Advanced analytics  
⏳ Billing integration  

---

## 🔧 Technical Configuration

### Database Settings
```javascript
// Audit log retention
AUDIT_LOG_RETENTION_DAYS=90

// Deleted tenant recovery period
DELETED_TENANT_RECOVERY_DAYS=365

// Impersonation session timeout
IMPERSONATION_SESSION_TIMEOUT_MINUTES=30

// 2FA enforcement
REQUIRE_2FA=false

// IP whitelist enforcement
ENFORCE_IP_WHITELIST=false
```

### Scheduled Jobs
1. **Daily:** Clean up expired impersonation sessions
2. **Daily:** Clean up audit logs older than 90 days
3. **Weekly:** Identify tenants eligible for permanent deletion (>365 days deleted)
4. **Monthly:** Generate audit log summary report

---

## 👤 Initial Super Admin Setup

### Account Details
```json
{
  "firstName": "Rob",
  "lastName": "Weinstein",
  "email": "[TO BE PROVIDED]",
  "role": "SUPER_ADMIN",
  "isActive": true,
  "require2FA": false,
  "ipWhitelist": null
}
```

### Setup Script
Location: `/scripts/create-initial-super-admin.mjs`

Usage:
```bash
node scripts/create-initial-super-admin.mjs \
  --email rob@example.com \
  --password [secure-password]
```

---

## 📋 Tenant Status Lifecycle

### Status Values
- **ACTIVE** - Normal operation, all features available
- **SUSPENDED** - Temporarily disabled, data preserved, no access
- **INACTIVE** - Soft deleted, recoverable for 1 year
- **DELETED** - Permanently deleted after 1 year (not recoverable)

### Transitions
```
ACTIVE ←→ SUSPENDED (reversible, immediate)
ACTIVE → INACTIVE (soft delete, recoverable for 1 year)
INACTIVE → ACTIVE (recovery within 1 year)
INACTIVE → DELETED (automatic after 1 year, permanent)
```

### Suspension
- **Reason Required:** Yes
- **Notification:** Optional (can notify tenant)
- **Data Access:** Read-only for super admin
- **Reactivation:** Immediate, by super admin

### Soft Delete (INACTIVE)
- **Recovery Period:** 365 days
- **Data Status:** Preserved, not accessible
- **Automatic Purge:** After 365 days → DELETED
- **Recovery Process:** Super admin can reactivate

### Hard Delete (DELETED)
- **Trigger:** Automatic after 365 days in INACTIVE status
- **Data Status:** Permanently removed
- **Reversible:** No
- **Cascade:** Deletes all tenant data (customers, pets, reservations, etc.)

---

## 🔒 Security Best Practices

### Password Requirements (Super Admin)
- Minimum 12 characters
- Must include: uppercase, lowercase, number, special character
- Cannot reuse last 5 passwords
- Must change every 90 days (recommended, not enforced in MVP)

### Session Management
- Session timeout: 8 hours of inactivity
- Concurrent sessions: Allowed (can be logged in on multiple devices)
- Session invalidation: On password change, all sessions terminated

### Audit Requirements
All super admin actions must be logged:
- Login/logout
- Tenant creation/modification/deletion
- Impersonation start/end
- Configuration changes
- User management actions

---

## 📊 Monitoring & Alerts

### Alert Triggers (Future)
- Failed login attempts (5+ in 15 minutes)
- Impersonation session exceeds 2 hours
- Tenant deletion
- Multiple concurrent impersonation sessions
- Unusual access patterns

### Metrics to Track
- Number of active tenants
- Number of suspended tenants
- Number of deleted tenants (recoverable)
- Super admin login frequency
- Impersonation session count/duration
- Audit log growth rate

---

## 🚀 Deployment Checklist

### Phase 1 Deployment (Authentication)
- [ ] Create super_admins table
- [ ] Create audit_logs table
- [ ] Run initial super admin setup script
- [ ] Verify Rob Weinstein can login
- [ ] Test audit logging
- [ ] Document super admin credentials (secure storage)

### Phase 2 Deployment (Tenant Management)
- [ ] Add status fields to tenants table
- [ ] Create tenant lifecycle service
- [ ] Test suspend/activate flow
- [ ] Test soft delete flow
- [ ] Verify 1 year recovery period

### Phase 3 Deployment (Impersonation)
- [ ] Create impersonation_sessions table
- [ ] Test 30 minute timeout
- [ ] Test tenant context switching
- [ ] Verify audit logging of impersonation
- [ ] Test impersonation banner display

---

## 📝 Future Enhancements

### Post-MVP Features (Prioritized)
1. **Two-Factor Authentication** (High Priority)
   - SMS or authenticator app
   - Mandatory for all super admins
   - Grace period for existing accounts

2. **Role-Based Permissions** (Medium Priority)
   - SUPER_ADMIN (full access)
   - SUPPORT (read-only + impersonation)
   - DEVELOPER (system access, no tenant data)

3. **IP Whitelisting** (Low Priority)
   - Optional per super admin
   - VPN integration
   - Dynamic IP support

4. **Advanced Audit Features** (Medium Priority)
   - Real-time alerts
   - Anomaly detection
   - Compliance reports

5. **Tenant Billing Integration** (High Priority)
   - Subscription management
   - Usage tracking
   - Payment processing

---

## 🔄 Review Schedule

### Configuration Review
- **Quarterly:** Review audit log retention (adjust if needed)
- **Bi-Annual:** Review deleted tenant recovery period
- **Annual:** Review security policies and update as needed

### Access Review
- **Monthly:** Review active super admin accounts
- **Quarterly:** Review impersonation session logs
- **Annual:** Audit all super admin permissions

---

## 📞 Support & Escalation

### Super Admin Issues
- **Primary Contact:** Rob Weinstein
- **Backup:** TBD
- **Emergency:** TBD

### Security Incidents
- **Report To:** Rob Weinstein
- **Response Time:** Immediate
- **Escalation:** TBD

---

**Last Updated:** November 1, 2025  
**Approved By:** Rob Weinstein  
**Next Review:** February 1, 2026
