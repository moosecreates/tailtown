-- Reorganize Reservations to Avoid Overlaps
-- This script redistributes reservations across suites to prevent overlaps
-- Priority: Daycare -> D rooms, Small -> A rooms, Medium -> B rooms, Large -> C rooms

-- First, let's see the current state
\echo '📊 Current Reservation Distribution:'
SELECT 
  SUBSTRING(res.name, 1, 1) as room_prefix,
  COUNT(*) as reservation_count
FROM reservations r
JOIN resources res ON r."resourceId" = res.id
WHERE r.status IN ('CONFIRMED', 'CHECKED_IN', 'PENDING')
GROUP BY SUBSTRING(res.name, 1, 1)
ORDER BY room_prefix;

\echo ''
\echo '🔄 Reorganizing reservations...'
\echo ''

-- Create a temporary table to track assignments
CREATE TEMP TABLE IF NOT EXISTS temp_assignments (
  reservation_id TEXT,
  new_resource_id TEXT,
  pet_name TEXT,
  pet_weight NUMERIC,
  service_category TEXT,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  assigned_room TEXT,
  reason TEXT
);

-- Clear any previous data
TRUNCATE temp_assignments;

-- Function to find next available room for a reservation
-- This will be done in multiple passes

-- Pass 1: Assign DAYCARE reservations to D rooms
WITH daycare_reservations AS (
  SELECT 
    r.id as reservation_id,
    r."startDate",
    r."endDate",
    p.name as pet_name,
    p.weight as pet_weight,
    s."serviceCategory"
  FROM reservations r
  JOIN pets p ON r."petId" = p.id
  JOIN services s ON r."serviceId" = s.id
  WHERE r.status IN ('CONFIRMED', 'CHECKED_IN', 'PENDING')
    AND s."serviceCategory" = 'DAYCARE'
  ORDER BY r."startDate"
),
d_rooms AS (
  SELECT id, name
  FROM resources
  WHERE name LIKE 'D%'
  ORDER BY name
)
INSERT INTO temp_assignments (reservation_id, new_resource_id, pet_name, pet_weight, service_category, start_date, end_date, assigned_room, reason)
SELECT DISTINCT ON (dr.reservation_id)
  dr.reservation_id::TEXT,
  rooms.id::TEXT as new_resource_id,
  dr.pet_name,
  dr.pet_weight,
  dr."serviceCategory",
  dr."startDate",
  dr."endDate",
  rooms.name as assigned_room,
  'Daycare -> D room' as reason
FROM daycare_reservations dr
CROSS JOIN d_rooms rooms
WHERE NOT EXISTS (
  -- Check for overlaps with already assigned reservations
  SELECT 1
  FROM temp_assignments ta
  WHERE ta.new_resource_id = rooms.id::TEXT
    AND dr."startDate" < ta.end_date
    AND dr."endDate" > ta.start_date
)
ORDER BY dr.reservation_id, rooms.name;

-- Pass 2: Assign SMALL dogs (< 25 lbs) to A rooms
WITH small_dog_reservations AS (
  SELECT 
    r.id as reservation_id,
    r."startDate",
    r."endDate",
    p.name as pet_name,
    p.weight as pet_weight,
    s."serviceCategory"
  FROM reservations r
  JOIN pets p ON r."petId" = p.id
  JOIN services s ON r."serviceId" = s.id
  WHERE r.status IN ('CONFIRMED', 'CHECKED_IN', 'PENDING')
    AND s."serviceCategory" != 'DAYCARE'
    AND p.weight < 25
    AND r.id NOT IN (SELECT reservation_id FROM temp_assignments)
  ORDER BY r."startDate"
),
a_rooms AS (
  SELECT id, name
  FROM resources
  WHERE name LIKE 'A%'
  ORDER BY name
)
INSERT INTO temp_assignments (reservation_id, new_resource_id, pet_name, pet_weight, service_category, start_date, end_date, assigned_room, reason)
SELECT DISTINCT ON (sdr.reservation_id)
  sdr.reservation_id,
  rooms.id as new_resource_id,
  sdr.pet_name,
  sdr.pet_weight,
  sdr."serviceCategory",
  sdr."startDate",
  sdr."endDate",
  rooms.name as assigned_room,
  'Small dog -> A room' as reason
FROM small_dog_reservations sdr
CROSS JOIN a_rooms rooms
WHERE NOT EXISTS (
  SELECT 1
  FROM temp_assignments ta
  WHERE ta.new_resource_id = rooms.id
    AND sdr."startDate" < ta.end_date
    AND sdr."endDate" > ta.start_date
)
ORDER BY sdr.reservation_id, rooms.name;

-- Pass 3: Assign MEDIUM dogs (25-60 lbs) to B rooms
WITH medium_dog_reservations AS (
  SELECT 
    r.id as reservation_id,
    r."startDate",
    r."endDate",
    p.name as pet_name,
    p.weight as pet_weight,
    s."serviceCategory"
  FROM reservations r
  JOIN pets p ON r."petId" = p.id
  JOIN services s ON r."serviceId" = s.id
  WHERE r.status IN ('CONFIRMED', 'CHECKED_IN', 'PENDING')
    AND s."serviceCategory" != 'DAYCARE'
    AND p.weight >= 25 AND p.weight < 60
    AND r.id NOT IN (SELECT reservation_id FROM temp_assignments)
  ORDER BY r."startDate"
),
b_rooms AS (
  SELECT id, name
  FROM resources
  WHERE name LIKE 'B%'
  ORDER BY name
)
INSERT INTO temp_assignments (reservation_id, new_resource_id, pet_name, pet_weight, service_category, start_date, end_date, assigned_room, reason)
SELECT DISTINCT ON (mdr.reservation_id)
  mdr.reservation_id,
  rooms.id as new_resource_id,
  mdr.pet_name,
  mdr.pet_weight,
  mdr."serviceCategory",
  mdr."startDate",
  mdr."endDate",
  rooms.name as assigned_room,
  'Medium dog -> B room' as reason
FROM medium_dog_reservations mdr
CROSS JOIN b_rooms rooms
WHERE NOT EXISTS (
  SELECT 1
  FROM temp_assignments ta
  WHERE ta.new_resource_id = rooms.id
    AND mdr."startDate" < ta.end_date
    AND mdr."endDate" > ta.start_date
)
ORDER BY mdr.reservation_id, rooms.name;

-- Pass 4: Assign LARGE dogs (>= 60 lbs) to C rooms
WITH large_dog_reservations AS (
  SELECT 
    r.id as reservation_id,
    r."startDate",
    r."endDate",
    p.name as pet_name,
    p.weight as pet_weight,
    s."serviceCategory"
  FROM reservations r
  JOIN pets p ON r."petId" = p.id
  JOIN services s ON r."serviceId" = s.id
  WHERE r.status IN ('CONFIRMED', 'CHECKED_IN', 'PENDING')
    AND s."serviceCategory" != 'DAYCARE'
    AND p.weight >= 60
    AND r.id NOT IN (SELECT reservation_id FROM temp_assignments)
  ORDER BY r."startDate"
),
c_rooms AS (
  SELECT id, name
  FROM resources
  WHERE name LIKE 'C%'
  ORDER BY name
)
INSERT INTO temp_assignments (reservation_id, new_resource_id, pet_name, pet_weight, service_category, start_date, end_date, assigned_room, reason)
SELECT DISTINCT ON (ldr.reservation_id)
  ldr.reservation_id,
  rooms.id as new_resource_id,
  ldr.pet_name,
  ldr.pet_weight,
  ldr."serviceCategory",
  ldr."startDate",
  ldr."endDate",
  rooms.name as assigned_room,
  'Large dog -> C room' as reason
FROM large_dog_reservations ldr
CROSS JOIN c_rooms rooms
WHERE NOT EXISTS (
  SELECT 1
  FROM temp_assignments ta
  WHERE ta.new_resource_id = rooms.id
    AND ldr."startDate" < ta.end_date
    AND ldr."endDate" > ta.start_date
)
ORDER BY ldr.reservation_id, rooms.name;

-- Pass 5: Assign remaining reservations (unknown weight or no room in preferred category) to any available room
WITH remaining_reservations AS (
  SELECT 
    r.id as reservation_id,
    r."startDate",
    r."endDate",
    p.name as pet_name,
    p.weight as pet_weight,
    s."serviceCategory"
  FROM reservations r
  JOIN pets p ON r."petId" = p.id
  JOIN services s ON r."serviceId" = s.id
  WHERE r.status IN ('CONFIRMED', 'CHECKED_IN', 'PENDING')
    AND r.id NOT IN (SELECT reservation_id FROM temp_assignments)
  ORDER BY r."startDate"
),
all_rooms AS (
  SELECT id, name
  FROM resources
  WHERE type IN ('STANDARD_SUITE', 'STANDARD_PLUS_SUITE', 'VIP_SUITE')
  ORDER BY name
)
INSERT INTO temp_assignments (reservation_id, new_resource_id, pet_name, pet_weight, service_category, start_date, end_date, assigned_room, reason)
SELECT DISTINCT ON (rr.reservation_id)
  rr.reservation_id,
  rooms.id as new_resource_id,
  rr.pet_name,
  rr.pet_weight,
  rr."serviceCategory",
  rr."startDate",
  rr."endDate",
  rooms.name as assigned_room,
  'Overflow -> Any available room' as reason
FROM remaining_reservations rr
CROSS JOIN all_rooms rooms
WHERE NOT EXISTS (
  SELECT 1
  FROM temp_assignments ta
  WHERE ta.new_resource_id = rooms.id
    AND rr."startDate" < ta.end_date
    AND rr."endDate" > ta.start_date
)
ORDER BY rr.reservation_id, rooms.name;

-- Show proposed changes
\echo '📝 Proposed Changes:'
SELECT 
  ta.pet_name,
  ROUND(ta.pet_weight::numeric, 1) as weight_lbs,
  ta.service_category,
  TO_CHAR(ta.start_date, 'YYYY-MM-DD') as check_in,
  TO_CHAR(ta.end_date, 'YYYY-MM-DD') as check_out,
  COALESCE(old_res.name, 'None') as old_room,
  ta.assigned_room as new_room,
  ta.reason
FROM temp_assignments ta
LEFT JOIN reservations r ON ta.reservation_id = r.id
LEFT JOIN resources old_res ON r."resourceId" = old_res.id
ORDER BY ta.start_date, ta.assigned_room;

-- Show summary
\echo ''
\echo '📊 Summary by Room Type:'
SELECT 
  SUBSTRING(assigned_room, 1, 1) as room_type,
  COUNT(*) as count,
  STRING_AGG(DISTINCT service_category, ', ') as services
FROM temp_assignments
GROUP BY SUBSTRING(assigned_room, 1, 1)
ORDER BY room_type;

-- Apply the changes
\echo ''
\echo '💾 Applying changes...'
UPDATE reservations r
SET "resourceId" = ta.new_resource_id
FROM temp_assignments ta
WHERE r.id = ta.reservation_id;

\echo ''
\echo '✅ Reorganization complete!'
\echo ''

-- Show final distribution
\echo '📊 Final Distribution:'
SELECT 
  SUBSTRING(res.name, 1, 1) as room_prefix,
  COUNT(*) as reservation_count,
  STRING_AGG(DISTINCT s."serviceCategory", ', ') as service_types
FROM reservations r
JOIN resources res ON r."resourceId" = res.id
JOIN services s ON r."serviceId" = s.id
WHERE r.status IN ('CONFIRMED', 'CHECKED_IN', 'PENDING')
GROUP BY SUBSTRING(res.name, 1, 1)
ORDER BY room_prefix;

-- Clean up
DROP TABLE temp_assignments;
