#!/bin/bash

echo "🧹 Organizing docs folder..."

cd docs

# Features
echo "Moving feature docs..."
mv AVAILABILITY-SYSTEM.md COUPON-SYSTEM.md CUSTOMER-BOOKING-PORTAL.md features/ 2>/dev/null
mv DEPOSIT-RULES.md DYNAMIC-PRICING.md LOYALTY-REWARDS.md features/ 2>/dev/null
mv MULTI-PET-SUITES.md PAYMENT-SERVICE.md PET-ICONS-SYSTEM.md features/ 2>/dev/null
mv POS-SYSTEM-IMPLEMENTATION.md REPORTING-SYSTEM-SPEC.md RESERVATION-MANAGEMENT.md features/ 2>/dev/null
mv RESERVATION-OVERLAP-PREVENTION.md SERVICE-CATEGORY-SEPARATION.md features/ 2>/dev/null
mv SUPER-ADMIN-PORTAL-ROADMAP.md TENANT-ISOLATION.md TENANT-STRATEGY.md features/ 2>/dev/null
mv TIMEZONE-HANDLING.md sms-notifications.md vaccine-upload.md features/ 2>/dev/null

# Deployment
echo "Moving deployment docs..."
mv AWS-MIGRATION-GUIDE.md DIGITALOCEAN-DEPLOYMENT.md GITHUB-SETUP.md deployment/ 2>/dev/null
mv PRODUCTION-DEPLOYMENT.md AUTOMATION-SETUP.md deployment/ 2>/dev/null

# Gingr
echo "Moving Gingr docs..."
mv GINGR-*.md STAFF-*.md import-debugging.md gingr/ 2>/dev/null

# Testing
echo "Moving testing docs..."
mv TEST-COVERAGE.md TEST-INFRASTRUCTURE-FIXES.md TEST-STATUS-OCT30-2025.md testing/ 2>/dev/null
mv TESTING-LOYALTY-COUPONS.md TESTING-PHILOSOPHY.md TESTING.md testing/ 2>/dev/null

# Security
echo "Moving security docs..."
mv SECURITY-AUDIT-CHECKLIST.md SECURITY-AUDIT-FINDINGS.md security/ 2>/dev/null
mv SECURITY-IMPLEMENTATION.md SECURITY.md security/ 2>/dev/null

# Troubleshooting
echo "Moving troubleshooting docs..."
mv SERVICE-PERSISTENCE-FIX.md TROUBLESHOOTING-SERVICE-PERSISTENCE.md troubleshooting/ 2>/dev/null
mv ZOMBIE-PROCESS-PREVENTION.md VACCINATION-DATA-FIX.md troubleshooting/ 2>/dev/null

# Completed
echo "Moving completed project docs..."
mv COLOR-CODING-COMPLETE.md COMPLETED-FEATURES.md DASHBOARD-KENNEL-NUMBERS.md completed/ 2>/dev/null
mv MVP-READINESS-ANALYSIS.md PERFORMANCE-OPTIMIZATIONS.md POS-INTEGRATION-COMPLETE.md completed/ 2>/dev/null
mv SUPER-ADMIN-CONFIG.md completed/ 2>/dev/null

# Sessions
echo "Moving session summaries to archive..."
mv DEPLOYMENT-SUMMARY-NOV-4-2025.md SESSION-2025-11-03-RESPONSIVE-AND-FIXES.md archive/sessions/ 2>/dev/null
mv SESSION-SUMMARY-OCT30-2025.md archive/sessions/ 2>/dev/null

# Reference
echo "Moving reference docs..."
mv DOCUMENTATION-INDEX.md reference/ 2>/dev/null

# Move cleanup plan
mv DOCS-CLEANUP-PLAN.md archive/cleanup/ 2>/dev/null

cd ..

echo "✅ Docs organized!"
echo ""
echo "Remaining files in /docs root:"
ls -1 docs/*.md 2>/dev/null | wc -l
