#!/bin/bash

# Gingr Sync Helper Script
# Quick commands for syncing data from Gingr

set -e  # Exit on error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Print colored message
print_msg() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Show usage
show_usage() {
    echo "Gingr Sync Helper"
    echo ""
    echo "Usage: ./scripts/sync-gingr.sh [command]"
    echo ""
    echo "Commands:"
    echo "  full          - Sync all data (customers, pets, reservations)"
    echo "  reservations  - Sync reservations only"
    echo "  validate      - Check for overlapping reservations"
    echo "  fix-overlaps  - Fix any overlapping reservations"
    echo "  status        - Show sync status and statistics"
    echo "  help          - Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./scripts/sync-gingr.sh full"
    echo "  ./scripts/sync-gingr.sh reservations"
    echo "  ./scripts/sync-gingr.sh validate"
}

# Full sync
sync_full() {
    print_msg "Starting full Gingr sync..."
    node scripts/sync-all-gingr-data.mjs
    print_success "Full sync complete!"
}

# Reservations only
sync_reservations() {
    print_msg "Syncing reservations from Gingr..."
    node scripts/sync-gingr-reservations.mjs
    print_success "Reservation sync complete!"
}

# Validate overlaps
validate_overlaps() {
    print_msg "Checking for overlapping reservations..."
    docker exec -i tailtown-postgres psql -U postgres -d customer < scripts/validate-no-overlaps.sql
}

# Fix overlaps
fix_overlaps() {
    print_msg "Fixing overlapping reservations..."
    docker exec -i tailtown-postgres psql -U postgres -d customer < scripts/fix-overlapping-reservations.sql
    print_success "Overlaps fixed!"
    
    print_msg "Validating..."
    validate_overlaps
}

# Show status
show_status() {
    print_msg "Fetching sync status..."
    echo ""
    
    docker exec tailtown-postgres psql -U postgres -d customer << 'EOF'
\echo '📊 SYNC STATUS'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo ''
\echo '📅 Last Sync Time:'
SELECT 
  MAX("updatedAt") as last_sync_time,
  COUNT(*) as total_synced_reservations
FROM reservations
WHERE "externalId" IS NOT NULL;

\echo ''
\echo '📈 Reservation Status Breakdown:'
SELECT 
  status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) as percentage
FROM reservations
WHERE "externalId" IS NOT NULL
GROUP BY status
ORDER BY count DESC;

\echo ''
\echo '🏠 Suite Distribution:'
SELECT 
  SUBSTRING(res.name, 1, 1) as room_prefix,
  COUNT(*) as reservation_count
FROM reservations r
JOIN resources res ON r."resourceId" = res.id
WHERE r.status IN ('CONFIRMED', 'CHECKED_IN', 'PENDING')
  AND r."externalId" IS NOT NULL
GROUP BY SUBSTRING(res.name, 1, 1)
ORDER BY room_prefix;

\echo ''
\echo '⚠️  Overlap Check:'
WITH overlaps AS (
  SELECT COUNT(*) as overlap_count
  FROM reservations r1
  JOIN reservations r2 ON r1."resourceId" = r2."resourceId" AND r1.id < r2.id
  WHERE r1.status IN ('CONFIRMED', 'CHECKED_IN', 'PENDING')
    AND r2.status IN ('CONFIRMED', 'CHECKED_IN', 'PENDING')
    AND r1."startDate" < r2."endDate"
    AND r1."endDate" > r2."startDate"
)
SELECT 
  CASE 
    WHEN overlap_count = 0 THEN '✅ No overlaps detected'
    ELSE '❌ ' || overlap_count || ' overlaps found - run fix-overlaps'
  END as status
FROM overlaps;

\echo ''
\echo '📊 Data Completeness:'
SELECT 
  (SELECT COUNT(*) FROM customers WHERE "externalId" IS NOT NULL) as customers_synced,
  (SELECT COUNT(*) FROM pets WHERE "externalId" IS NOT NULL) as pets_synced,
  (SELECT COUNT(*) FROM reservations WHERE "externalId" IS NOT NULL) as reservations_synced,
  (SELECT COUNT(*) FROM services WHERE "externalId" IS NOT NULL) as services_synced;

\echo ''
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
EOF
}

# Main command handler
case "${1:-help}" in
    full)
        sync_full
        ;;
    reservations)
        sync_reservations
        ;;
    validate)
        validate_overlaps
        ;;
    fix-overlaps)
        fix_overlaps
        ;;
    status)
        show_status
        ;;
    help|--help|-h)
        show_usage
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_usage
        exit 1
        ;;
esac
