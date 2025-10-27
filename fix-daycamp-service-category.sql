-- Fix Day Camp service category from BOARDING to DAYCARE
-- Run this SQL against your database

UPDATE services 
SET "serviceCategory" = 'DAYCARE'
WHERE name LIKE '%Day Camp%' 
  OR name LIKE '%Daycare%'
  OR name LIKE '%Day Care%';

-- Verify the changes
SELECT id, name, "serviceCategory", price 
FROM services 
WHERE "serviceCategory" = 'DAYCARE';
