-- Fix Service Categories for Day Camp Services
-- Date: November 1, 2025
-- Issue: All services imported from Gingr had serviceCategory = 'BOARDING'
-- Fix: Update day camp services to have serviceCategory = 'DAYCARE'

-- Update all services with "Day Camp" or "Camp" in the name
UPDATE services 
SET "serviceCategory" = 'DAYCARE' 
WHERE name LIKE '%Day Camp%' 
   OR name LIKE '%Camp%';

-- Verify the changes
SELECT 
  name, 
  "serviceCategory", 
  COUNT(r.id) as active_reservations
FROM services s
LEFT JOIN reservations r ON s.id = r."serviceId" 
  AND r.status IN ('PENDING', 'CONFIRMED', 'CHECKED_IN')
GROUP BY s.id, s.name, s."serviceCategory"
ORDER BY active_reservations DESC;

-- Expected results:
-- Day Camp | Full Day -> DAYCARE (224 reservations)
-- Day Camp | Dog Camp Employee -> DAYCARE (43 reservations)
-- Day Camp | Individual Play Camp -> DAYCARE (32 reservations)
-- Day Camp | Half Day -> DAYCARE (18 reservations)
-- Boarding services remain BOARDING
