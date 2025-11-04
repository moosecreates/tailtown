-- Fix Overlapping Reservations
-- This script finds overlapping reservations and moves them to available suites

\echo '🔍 Finding overlapping reservations...'

-- Find all overlaps
WITH overlaps AS (
  SELECT DISTINCT
    r1.id as reservation_id,
    r1."resourceId" as current_resource,
    res.name as current_suite,
    p.name as pet_name,
    r1."startDate",
    r1."endDate",
    -- Count how many other reservations overlap with this one
    (SELECT COUNT(*)
     FROM reservations r2
     WHERE r2."resourceId" = r1."resourceId"
       AND r2.id != r1.id
       AND r2.status IN ('CONFIRMED', 'CHECKED_IN', 'PENDING')
       AND r2."startDate" < r1."endDate"
       AND r2."endDate" > r1."startDate"
    ) as overlap_count
  FROM reservations r1
  JOIN resources res ON r1."resourceId" = res.id
  JOIN pets p ON r1."petId" = p.id
  WHERE r1.status IN ('CONFIRMED', 'CHECKED_IN', 'PENDING')
    AND EXISTS (
      SELECT 1
      FROM reservations r2
      WHERE r2."resourceId" = r1."resourceId"
        AND r2.id != r1.id
        AND r2.status IN ('CONFIRMED', 'CHECKED_IN', 'PENDING')
        AND r2."startDate" < r1."endDate"
        AND r2."endDate" > r1."startDate"
    )
  ORDER BY overlap_count DESC, r1."startDate"
)
SELECT 
  current_suite,
  pet_name,
  TO_CHAR("startDate", 'MM/DD/YY') as check_in,
  TO_CHAR("endDate", 'MM/DD/YY') as check_out,
  overlap_count
FROM overlaps
LIMIT 20;

\echo ''
\echo '🔧 Moving overlapping reservations to available suites...'
\echo ''

-- Process each overlapping reservation and find it a new home
DO $$
DECLARE
  res_record RECORD;
  new_resource_id TEXT;
  moved_count INTEGER := 0;
BEGIN
  -- Loop through all reservations that have overlaps
  FOR res_record IN
    SELECT DISTINCT
      r1.id,
      r1."startDate",
      r1."endDate",
      r1."resourceId"
    FROM reservations r1
    WHERE r1.status IN ('CONFIRMED', 'CHECKED_IN', 'PENDING')
      AND EXISTS (
        SELECT 1
        FROM reservations r2
        WHERE r2."resourceId" = r1."resourceId"
          AND r2.id != r1.id
          AND r2.status IN ('CONFIRMED', 'CHECKED_IN', 'PENDING')
          AND r2."startDate" < r1."endDate"
          AND r2."endDate" > r1."startDate"
      )
    ORDER BY r1."startDate"
  LOOP
    -- Find an available resource for this reservation
    SELECT id INTO new_resource_id
    FROM resources
    WHERE type IN ('STANDARD_SUITE', 'STANDARD_PLUS_SUITE', 'VIP_SUITE')
      AND name ~ '^[A-D]'
      AND id != res_record."resourceId"
      AND NOT EXISTS (
        -- Check that no other reservation in this resource overlaps
        SELECT 1
        FROM reservations r3
        WHERE r3."resourceId" = resources.id
          AND r3.status IN ('CONFIRMED', 'CHECKED_IN', 'PENDING')
          AND r3."startDate" < res_record."endDate"
          AND r3."endDate" > res_record."startDate"
      )
    ORDER BY name
    LIMIT 1;
    
    -- If we found an available resource, move the reservation
    IF new_resource_id IS NOT NULL THEN
      UPDATE reservations
      SET "resourceId" = new_resource_id
      WHERE id = res_record.id;
      
      moved_count := moved_count + 1;
    END IF;
  END LOOP;
  
  RAISE NOTICE '✅ Moved % reservations to eliminate overlaps', moved_count;
END $$;

\echo ''
\echo '🔍 Checking for remaining overlaps...'

WITH remaining_overlaps AS (
  SELECT 
    r1.id as res1_id,
    r2.id as res2_id,
    res.name as suite,
    p1.name as pet1,
    p2.name as pet2,
    r1."startDate" as start1,
    r1."endDate" as end1,
    r2."startDate" as start2,
    r2."endDate" as end2
  FROM reservations r1
  JOIN reservations r2 ON r1."resourceId" = r2."resourceId" AND r1.id < r2.id
  JOIN resources res ON r1."resourceId" = res.id
  JOIN pets p1 ON r1."petId" = p1.id
  JOIN pets p2 ON r2."petId" = p2.id
  WHERE r1.status IN ('CONFIRMED', 'CHECKED_IN', 'PENDING')
    AND r2.status IN ('CONFIRMED', 'CHECKED_IN', 'PENDING')
    AND r1."startDate" < r2."endDate"
    AND r1."endDate" > r2."startDate"
)
SELECT 
  COUNT(*) as remaining_overlaps,
  COUNT(DISTINCT suite) as affected_suites
FROM remaining_overlaps;

\echo ''
\echo '📊 Final Distribution:'

SELECT 
  SUBSTRING(res.name, 1, 1) as room_prefix,
  COUNT(*) as count
FROM reservations r
JOIN resources res ON r."resourceId" = res.id
WHERE r.status IN ('CONFIRMED', 'CHECKED_IN', 'PENDING')
GROUP BY SUBSTRING(res.name, 1, 1)
ORDER BY room_prefix;
