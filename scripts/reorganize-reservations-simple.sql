-- Simple Reorganization Script
-- Spreads out reservations to avoid overlaps

\echo '📊 Current state: All reservations on A01'
SELECT COUNT(*) as total_reservations
FROM reservations
WHERE status IN ('CONFIRMED', 'CHECKED_IN', 'PENDING');

\echo ''
\echo '🔄 Reorganizing reservations across suites...'
\echo ''

-- Update reservations one by one, assigning to next available suite
-- We'll use a simple round-robin approach across all suites

WITH numbered_reservations AS (
  SELECT 
    r.id,
    r."startDate",
    r."endDate",
    p.name as pet_name,
    p.weight,
    s."serviceCategory",
    ROW_NUMBER() OVER (ORDER BY r."startDate", r.id) as rn
  FROM reservations r
  JOIN pets p ON r."petId" = p.id
  JOIN services s ON r."serviceId" = s.id
  WHERE r.status IN ('CONFIRMED', 'CHECKED_IN', 'PENDING')
),
available_suites AS (
  SELECT 
    id,
    name,
    ROW_NUMBER() OVER (ORDER BY name) as suite_num
  FROM resources
  WHERE type IN ('STANDARD_SUITE', 'STANDARD_PLUS_SUITE', 'VIP_SUITE')
    AND name ~ '^[A-D]'  -- Only A, B, C, D rooms
  ORDER BY name
),
suite_count AS (
  SELECT COUNT(*) as total FROM available_suites
)
UPDATE reservations r
SET "resourceId" = (
  SELECT id
  FROM available_suites
  WHERE suite_num = ((nr.rn - 1) % sc.total) + 1
)
FROM numbered_reservations nr, suite_count sc
WHERE r.id = nr.id;

\echo '✅ Reservations redistributed!'
\echo ''
\echo '📊 New Distribution:'

SELECT 
  SUBSTRING(res.name, 1, 1) as room_prefix,
  COUNT(*) as count
FROM reservations r
JOIN resources res ON r."resourceId" = res.id
WHERE r.status IN ('CONFIRMED', 'CHECKED_IN', 'PENDING')
GROUP BY SUBSTRING(res.name, 1, 1)
ORDER BY room_prefix;

\echo ''
\echo '📋 Sample of new assignments:'

SELECT 
  res.name as suite,
  p.name as pet,
  ROUND(p.weight::numeric, 0) as weight_lbs,
  s."serviceCategory" as service,
  TO_CHAR(r."startDate", 'MM/DD') as check_in,
  TO_CHAR(r."endDate", 'MM/DD') as check_out
FROM reservations r
JOIN resources res ON r."resourceId" = res.id
JOIN pets p ON r."petId" = p.id
JOIN services s ON r."serviceId" = s.id
WHERE r.status IN ('CONFIRMED', 'CHECKED_IN', 'PENDING')
ORDER BY res.name, r."startDate"
LIMIT 30;
