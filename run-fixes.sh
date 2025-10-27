#!/bin/bash

# Quick fix script for Day Camp color and Check-In errors
# Run this with: bash run-fixes.sh

echo "🔧 Applying database fixes..."
echo ""

# Run the SQL fixes
PGPASSWORD=postgres psql -h localhost -p 5433 -U postgres -d customer << 'EOF'

-- Fix 1: Change Day Camp service category to DAYCARE
UPDATE services 
SET "serviceCategory" = 'DAYCARE'
WHERE name LIKE '%Day Camp%' 
  OR name LIKE '%Daycare%'
  OR name LIKE '%Day Care%';

-- Fix 2: Create default check-in template
INSERT INTO check_in_templates (
  id,
  "tenantId",
  name,
  description,
  "isDefault",
  "isActive",
  "createdAt",
  "updatedAt"
)
VALUES (
  gen_random_uuid(),
  'dev',
  'Standard Check-In',
  'Default check-in template for all reservations',
  true,
  true,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- Verify fixes
\echo ''
\echo '✅ Day Camp Services:'
SELECT name, "serviceCategory" FROM services WHERE name LIKE '%Day Camp%';

\echo ''
\echo '✅ Check-In Templates:'
SELECT name, "isDefault", "isActive" FROM check_in_templates WHERE "tenantId" = 'dev';

EOF

echo ""
echo "✨ Fixes applied! Please refresh your browser (Cmd+Shift+R)"
echo ""
