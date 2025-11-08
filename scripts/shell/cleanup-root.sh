#!/bin/bash

# Root Directory Cleanup Script
# Organizes files into proper directories

echo "🧹 Starting root directory cleanup..."

# Database scripts
echo "Moving database scripts..."
mv backup_*.sql scripts/database/backups/ 2>/dev/null
mv clean-and-import-staff.sql create-default-checkin-template.sql scripts/database/ 2>/dev/null
mv fix-*.sql scripts/database/fixes/ 2>/dev/null
mv *-import*.sql staff-import*.sql scripts/database/imports/ 2>/dev/null
mv gingr-*.sql scripts/database/gingr/ 2>/dev/null
mv tailtown_data_export.sql scripts/database/ 2>/dev/null

# Python scripts
echo "Moving Python scripts..."
mv *.py scripts/python/ 2>/dev/null

# JavaScript scripts
echo "Moving JavaScript scripts..."
mv extract-*.js find-*.js inspect-*.js run-fixes.js test-*.js scripts/js/ 2>/dev/null

# Shell scripts (except this one and deploy.sh)
echo "Moving shell scripts..."
mv QUICK-DEPLOY-*.sh scripts/deployment/ 2>/dev/null
mv restart*.sh start-*.sh scripts/shell/ 2>/dev/null
mv fix-tt-commands.sh git-commit-and-push.sh node-installer.sh run-fixes.sh setup-automation.sh test-urls.sh scripts/shell/ 2>/dev/null

# HTML test files
echo "Moving HTML test files..."
mv *.html scripts/test-pages/ 2>/dev/null

# Session summaries
echo "Archiving session summaries..."
mv SESSION-SUMMARY-*.md DOCUMENTATION-UPDATE-*.md docs/archive/sessions/ 2>/dev/null

# Deployment docs
echo "Archiving deployment docs..."
mv DEPLOYMENT-CHECKLIST-NOV-6-2025.md DEPLOYMENT-NOTES-NOV-5-2025.md DEPLOYMENT-SUMMARY-NOV-6-2025.md docs/archive/deployment/ 2>/dev/null
mv MULTI-TENANT-DEPLOYMENT-SUMMARY.md PR-PRODUCTION-DEPLOYMENT.md PRODUCTION-DEPLOYMENT-NOV-2025.md docs/archive/deployment/ 2>/dev/null
mv DEPLOYMENT-CHECKLIST.md DEPLOYMENT-GUIDE.md DEPLOYMENT-SAFEGUARDS.md DEPLOYMENT.md MANUAL-DEPLOY-STEPS.md docs/archive/deployment/ 2>/dev/null

# Feature docs
echo "Archiving feature docs..."
mv AUTH-AND-TESTING-IMPROVEMENTS.md LOYALTY-PROGRAM-ADDED.md MULTI-PET-RESERVATION-FEATURE.md docs/archive/features/ 2>/dev/null
mv TENANT-CLARIFICATION-UPDATE.md docs/archive/features/ 2>/dev/null

# Cleanup docs
echo "Archiving cleanup docs..."
mv CODE-CLEANUP-*.md DOCUMENTATION-CLEANUP-SUMMARY.md docs/archive/cleanup/ 2>/dev/null

# Audit docs
echo "Archiving audit docs..."
mv CONTROLLER-AUDIT-RESULTS.md docs/archive/audits/ 2>/dev/null

# Fix docs
echo "Archiving fix docs..."
mv KENNEL-CARDS-PERFORMANCE-FIX.md PROFILE-PHOTO-FIXES-NOV-5-2025.md docs/archive/fixes/ 2>/dev/null

# Test docs
echo "Archiving test docs..."
mv MULTI-TENANCY-TESTS-SUMMARY.md TEST-IMPROVEMENTS-NOV-5-2025.md docs/archive/testing/ 2>/dev/null

# Planning docs
echo "Archiving planning docs..."
mv REMAINING-WORK-BEFORE-ROADMAP.md docs/archive/planning/ 2>/dev/null

# Import docs
echo "Archiving import docs..."
mv README-STAFF-IMPORT.md gingr-users-summary.md docs/archive/imports/ 2>/dev/null

# Troubleshooting docs
echo "Archiving troubleshooting docs..."
mv README-ZOMBIE-PREVENTION.md KILL-ZOMBIES.md docs/archive/troubleshooting/ 2>/dev/null

# Security audit files
echo "Archiving security audit files..."
mv security-audit-*.json docs/archive/security/ 2>/dev/null

# Other docs
echo "Archiving other docs..."
mv DEVELOPER-TOOLKIT.md DOCUMENTATION-INDEX.md OVERVIEW.md QUICK-REFERENCE.md docs/archive/ 2>/dev/null

# Docker files
echo "Moving Docker files..."
mv Dockerfile.health docker/ 2>/dev/null

# Delete temporary files
echo "Deleting temporary files..."
rm -f COMMIT_MESSAGE.txt import-log.txt

# Move cleanup plan to docs
mv ROOT-CLEANUP-PLAN.md docs/archive/cleanup/ 2>/dev/null

echo "✅ Cleanup complete!"
echo ""
echo "Root directory now contains only essential files:"
ls -1 | grep -E "\.(json|md|yml|ts|js|sh)$" | head -20
