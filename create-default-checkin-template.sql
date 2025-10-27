-- Create default check-in template
-- Run this SQL against your database

-- First, check if a default template already exists
SELECT * FROM check_in_templates WHERE "tenantId" = 'dev' AND "isDefault" = true;

-- If none exists, create one
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

-- Verify the template was created
SELECT id, name, "isDefault", "isActive", "tenantId" 
FROM check_in_templates 
WHERE "tenantId" = 'dev';
