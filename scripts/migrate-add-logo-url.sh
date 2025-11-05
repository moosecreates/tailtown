#!/bin/bash

# Safe migration to add logo_url column to tenants table
# This script only adds a new column and does not affect existing data

set -e

echo "🔄 Adding logo_url column to tenants table..."
echo ""

# Run the migration
psql $DATABASE_URL -f services/customer/prisma/migrations/add_tenant_logo_url.sql

echo ""
echo "✅ Migration complete!"
echo ""
echo "Next steps:"
echo "1. Generate Prisma client: cd services/customer && npx prisma generate"
echo "2. Rebuild services: npm run build"
echo "3. Restart services: pm2 restart all"
