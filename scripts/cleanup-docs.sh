#!/bin/bash

# Documentation Cleanup Script
# Removes work-in-progress and obsolete documentation
# Keeps reference documentation

echo "🧹 Tailtown Documentation Cleanup"
echo "=================================="
echo ""

# Create archive directory for removed docs
mkdir -p docs/archive

# Work-in-progress documents to remove (superseded by final versions)
WIP_DOCS=(
  "docs/COLOR-CODING-DAYCARE-BOARDING.md"  # Superseded by COLOR-CODING-COMPLETE.md
  "docs/DAY-2-COMPLETION-PLAN.md"          # Old planning doc
  "docs/DAY-2-PROGRESS-UPDATE.md"          # Old progress doc
  "docs/DAY-2-REPORTING-PROGRESS.md"       # Old progress doc
  "docs/DAY-2-COMPLETE-SUMMARY.md"         # Old summary
  "docs/FIX-DAYCAMP-COLOR-AND-CHECKIN.md"  # Old bug fix doc
  "docs/GINGR-MIGRATION-STATUS.md"         # Superseded by GINGR-MIGRATION-COMPLETE.md
  "docs/GINGR-MIGRATION-ISSUES.md"         # Old issues doc
  "docs/GINGR-KENNEL-SYNC-STRATEGY.md"     # Old strategy doc
  "docs/GINGR-RESOURCE-MAPPING-STRATEGY.md" # Old strategy doc
  "docs/GINGR-API-ANALYSIS.md"             # Old analysis doc
  "docs/POS-INTEGRATION-PLAN.md"           # Superseded by POS-INTEGRATION-COMPLETE.md
  "docs/POS-INTEGRATION-PROGRESS.md"       # Old progress doc
  "docs/POS-COMPLETION-GUIDE.md"           # Old guide
  "docs/POS-ACTUAL-STATUS.md"              # Old status doc
  "docs/POS-FINAL-STATUS.md"               # Superseded by POS-INTEGRATION-COMPLETE.md
  "docs/POS-TESTING-SUMMARY.md"            # Old testing doc
  "docs/NEXT-STEPS-CHECKLIST.md"           # Old checklist
  "docs/PRE-LAUNCH-OPTIMIZATIONS.md"       # Old optimization doc
  "docs/REMAINING-OPTIMIZATIONS.md"        # Old optimization doc
  "docs/CODE-CLEANUP-RECOMMENDATIONS.md"   # Old recommendations
  "docs/CURRENT_STATE.md"                  # Old state doc
  "docs/DATA-MIGRATION-STRATEGY.md"        # Old strategy doc
  "docs/INDEXING-STATUS.md"                # Old status doc
  "docs/PRE-PRODUCTION-CHECKLIST.md"       # Old checklist
  "docs/SECURITY-STATUS.md"                # Old status doc
  "docs/TESTING-CHECKLIST-OCT25.md"        # Old checklist
  "docs/TESTING-GUIDE-OCT26.md"            # Old guide
  "docs/TESTING-SUMMARY.md"                # Old summary
  "docs/TRAINING-ENROLLMENT-STATUS.md"     # Old status doc
)

# Session summaries to remove (historical, not reference)
SESSION_DOCS=(
  "docs/SESSION-SUMMARY-OCT25-EVENING-FINAL.md"
  "docs/SESSION-SUMMARY-OCT25-EVENING.md"
  "docs/SESSION-SUMMARY-OCT26-2025.md"
  "docs/SESSION-SUMMARY.md"
  "docs/TONIGHT-FINAL-SUMMARY.md"
)

# Move WIP docs to archive
echo "📦 Archiving work-in-progress documents..."
for doc in "${WIP_DOCS[@]}"; do
  if [ -f "$doc" ]; then
    echo "  Moving: $doc"
    mv "$doc" "docs/archive/"
  fi
done

# Move session summaries to archive
echo ""
echo "📦 Archiving session summaries..."
for doc in "${SESSION_DOCS[@]}"; do
  if [ -f "$doc" ]; then
    echo "  Moving: $doc"
    mv "$doc" "docs/archive/"
  fi
done

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "📋 Remaining documentation:"
echo "  - Reference docs (system features, APIs, guides)"
echo "  - Current status docs (MVP readiness, roadmap)"
echo "  - Completion docs (final versions only)"
echo ""
echo "📁 Archived docs moved to: docs/archive/"
echo ""
echo "Total archived: $((${#WIP_DOCS[@]} + ${#SESSION_DOCS[@]})) files"
