-- Validate No Overlapping Reservations
-- Run this script to verify that no reservations overlap in the same suite

\echo '🔍 Checking for overlapping reservations...'
\echo ''

WITH overlapping_reservations AS (
  SELECT 
    r1.id as res1_id,
    r2.id as res2_id,
    res.name as suite,
    p1.name as pet1,
    p2.name as pet2,
    TO_CHAR(r1."startDate", 'YYYY-MM-DD') as start1,
    TO_CHAR(r1."endDate", 'YYYY-MM-DD') as end1,
    TO_CHAR(r2."startDate", 'YYYY-MM-DD') as start2,
    TO_CHAR(r2."endDate", 'YYYY-MM-DD') as end2
  FROM reservations r1
  JOIN reservations r2 ON r1."resourceId" = r2."resourceId" AND r1.id < r2.id
  JOIN resources res ON r1."resourceId" = res.id
  JOIN pets p1 ON r1."petId" = p1.id
  JOIN pets p2 ON r2."petId" = p2.id
  WHERE r1.status IN ('CONFIRMED', 'CHECKED_IN', 'PENDING')
    AND r2.status IN ('CONFIRMED', 'CHECKED_IN', 'PENDING')
    AND r1."startDate" < r2."endDate"
    AND r1."endDate" > r2."startDate"
  ORDER BY res.name, r1."startDate"
)
SELECT 
  COUNT(*) as total_overlaps,
  COUNT(DISTINCT suite) as affected_suites
FROM overlapping_reservations;

\echo ''

-- Show details if any overlaps found
WITH overlapping_reservations AS (
  SELECT 
    res.name as suite,
    p1.name as pet1,
    p2.name as pet2,
    TO_CHAR(r1."startDate", 'MM/DD') as start1,
    TO_CHAR(r1."endDate", 'MM/DD') as end1,
    TO_CHAR(r2."startDate", 'MM/DD') as start2,
    TO_CHAR(r2."endDate", 'MM/DD') as end2
  FROM reservations r1
  JOIN reservations r2 ON r1."resourceId" = r2."resourceId" AND r1.id < r2.id
  JOIN resources res ON r1."resourceId" = res.id
  JOIN pets p1 ON r1."petId" = p1.id
  JOIN pets p2 ON r2."petId" = p2.id
  WHERE r1.status IN ('CONFIRMED', 'CHECKED_IN', 'PENDING')
    AND r2.status IN ('CONFIRMED', 'CHECKED_IN', 'PENDING')
    AND r1."startDate" < r2."endDate"
    AND r1."endDate" > r2."startDate"
  ORDER BY res.name, r1."startDate"
  LIMIT 10
)
SELECT 
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ No overlaps found!'
    ELSE '❌ Overlaps detected (showing first 10):'
  END as status
FROM overlapping_reservations;

-- Show overlap details if any exist
SELECT 
  suite,
  pet1 || ' (' || start1 || ' to ' || end1 || ')' as reservation_1,
  pet2 || ' (' || start2 || ' to ' || end2 || ')' as reservation_2
FROM (
  SELECT 
    res.name as suite,
    p1.name as pet1,
    p2.name as pet2,
    TO_CHAR(r1."startDate", 'MM/DD') as start1,
    TO_CHAR(r1."endDate", 'MM/DD') as end1,
    TO_CHAR(r2."startDate", 'MM/DD') as start2,
    TO_CHAR(r2."endDate", 'MM/DD') as end2
  FROM reservations r1
  JOIN reservations r2 ON r1."resourceId" = r2."resourceId" AND r1.id < r2.id
  JOIN resources res ON r1."resourceId" = res.id
  JOIN pets p1 ON r1."petId" = p1.id
  JOIN pets p2 ON r2."petId" = p2.id
  WHERE r1.status IN ('CONFIRMED', 'CHECKED_IN', 'PENDING')
    AND r2.status IN ('CONFIRMED', 'CHECKED_IN', 'PENDING')
    AND r1."startDate" < r2."endDate"
    AND r1."endDate" > r2."startDate"
  ORDER BY res.name, r1."startDate"
  LIMIT 10
) as overlap_details;
