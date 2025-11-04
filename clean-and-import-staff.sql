-- Clean up existing foreign key references and import staff
-- This resolves the constraint conflicts

-- Step 1: Clean up orphaned records in related tables
DELETE FROM staff_availability WHERE "staffId" NOT IN (SELECT id FROM staff);
DELETE FROM staff_schedules WHERE "staffId" NOT IN (SELECT id FROM staff);
DELETE FROM staff_time_off WHERE "staffId" NOT IN (SELECT id FROM staff);

-- Step 2: Import all Gingr staff as STAFF level
-- Password: TempPass@2024! (bcrypt hash: $2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm)

-- Aiden Weinstein
INSERT INTO staff (id, "firstName", "lastName", email, password, role, department, position, phone, "isActive", "tenantId", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'Aiden', 'Weinstein', 'aidenweinstein@gmail.com', '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'STAFF', 'FRONT DESK', 'FRONT DESK ASSOCIATE', '5054000295', true, 'dev', NOW(), NOW())
ON CONFLICT (email, "tenantId") DO UPDATE SET 
  "firstName" = EXCLUDED."firstName",
  "lastName" = EXCLUDED."lastName",
  password = EXCLUDED.password,
  role = EXCLUDED.role,
  department = EXCLUDED.department,
  position = EXCLUDED.position,
  phone = EXCLUDED.phone,
  "isActive" = EXCLUDED."isActive",
  "updatedAt" = NOW();

-- Amy Rudd
INSERT INTO staff (id, "firstName", "lastName", email, password, role, department, position, phone, "isActive", "tenantId", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'Amy', 'Rudd', 'adobedogsco@gmail.com', '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'STAFF', 'FRONT DESK', 'FRONT DESK ASSOCIATE', '5056001312', true, 'dev', NOW(), NOW())
ON CONFLICT (email, "tenantId") DO UPDATE SET 
  "firstName" = EXCLUDED."firstName",
  "lastName" = EXCLUDED."lastName",
  password = EXCLUDED.password,
  role = EXCLUDED.role,
  department = EXCLUDED.department,
  position = EXCLUDED.position,
  phone = EXCLUDED.phone,
  "isActive" = EXCLUDED."isActive",
  "updatedAt" = NOW();

-- Annie Chavez
INSERT INTO staff (id, "firstName", "lastName", email, password, role, department, position, phone, "isActive", "tenantId", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'Annie', 'Chavez', 'corrgiful@gmail.com', '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'STAFF', 'FRONT DESK', 'FRONT DESK ASSOCIATE', '5052363310', true, 'dev', NOW(), NOW())
ON CONFLICT (email, "tenantId") DO UPDATE SET 
  "firstName" = EXCLUDED."firstName",
  "lastName" = EXCLUDED."lastName",
  password = EXCLUDED.password,
  role = EXCLUDED.role,
  department = EXCLUDED.department,
  position = EXCLUDED.position,
  phone = EXCLUDED.phone,
  "isActive" = EXCLUDED."isActive",
  "updatedAt" = NOW();

-- Antonia Weinstein
INSERT INTO staff (id, "firstName", "lastName", email, password, role, department, position, phone, "isActive", "tenantId", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'Antonia', 'Weinstein', 'antonia@tailtownpetresort.com', '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'STAFF', 'FRONT DESK', 'FRONT DESK ASSOCIATE', '5054109618', true, 'dev', NOW(), NOW())
ON CONFLICT (email, "tenantId") DO UPDATE SET 
  "firstName" = EXCLUDED."firstName",
  "lastName" = EXCLUDED."lastName",
  password = EXCLUDED.password,
  role = EXCLUDED.role,
  department = EXCLUDED.department,
  position = EXCLUDED.position,
  phone = EXCLUDED.phone,
  "isActive" = EXCLUDED."isActive",
  "updatedAt" = NOW();

-- Cadence Reed
INSERT INTO staff (id, "firstName", "lastName", email, password, role, department, position, phone, "isActive", "tenantId", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'Cadence', 'Reed', 'cadencereed9319@gmail.com', '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'STAFF', 'FRONT DESK', 'FRONT DESK ASSOCIATE', '5059333169', true, 'dev', NOW(), NOW())
ON CONFLICT (email, "tenantId") DO UPDATE SET 
  "firstName" = EXCLUDED."firstName",
  "lastName" = EXCLUDED."lastName",
  password = EXCLUDED.password,
  role = EXCLUDED.role,
  department = EXCLUDED.department,
  position = EXCLUDED.position,
  phone = EXCLUDED.phone,
  "isActive" = EXCLUDED."isActive",
  "updatedAt" = NOW();

-- Caty McCarthy
INSERT INTO staff (id, "firstName", "lastName", email, password, role, department, position, phone, "isActive", "tenantId", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'Caty', 'McCarthy', 'caitlin.mccarthy@hotmail.com', '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'STAFF', 'FRONT DESK', 'FRONT DESK ASSOCIATE', '5059332917', true, 'dev', NOW(), NOW())
ON CONFLICT (email, "tenantId") DO UPDATE SET 
  "firstName" = EXCLUDED."firstName",
  "lastName" = EXCLUDED."lastName",
  password = EXCLUDED.password,
  role = EXCLUDED.role,
  department = EXCLUDED.department,
  position = EXCLUDED.position,
  phone = EXCLUDED.phone,
  "isActive" = EXCLUDED."isActive",
  "updatedAt" = NOW();

-- Cristian Ramirez
INSERT INTO staff (id, "firstName", "lastName", email, password, role, department, position, phone, "isActive", "tenantId", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'Cristian', 'Ramirez', 'rcristian200@gmail.com', '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'STAFF', 'FRONT DESK', 'FRONT DESK ASSOCIATE', '5052259827', true, 'dev', NOW(), NOW())
ON CONFLICT (email, "tenantId") DO UPDATE SET 
  "firstName" = EXCLUDED."firstName",
  "lastName" = EXCLUDED."lastName",
  password = EXCLUDED.password,
  role = EXCLUDED.role,
  department = EXCLUDED.department,
  position = EXCLUDED.position,
  phone = EXCLUDED.phone,
  "isActive" = EXCLUDED."isActive",
  "updatedAt" = NOW();

-- Emily Parks
INSERT INTO staff (id, "firstName", "lastName", email, password, role, department, position, phone, "isActive", "tenantId", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'Emily', 'Parks', 'emilyparks9319@gmail.com', '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'STAFF', 'FRONT DESK', 'FRONT DESK ASSOCIATE', '5054536547', true, 'dev', NOW(), NOW())
ON CONFLICT (email, "tenantId") DO UPDATE SET 
  "firstName" = EXCLUDED."firstName",
  "lastName" = EXCLUDED."lastName",
  password = EXCLUDED.password,
  role = EXCLUDED.role,
  department = EXCLUDED.department,
  position = EXCLUDED.position,
  phone = EXCLUDED.phone,
  "isActive" = EXCLUDED."isActive",
  "updatedAt" = NOW();

-- Emma Cohee
INSERT INTO staff (id, "firstName", "lastName", email, password, role, department, position, phone, "isActive", "tenantId", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'Emma', 'Cohee', 'encohee@icloud.com', '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'STAFF', 'FRONT DESK', 'FRONT DESK ASSOCIATE', '5056047858', true, 'dev', NOW(), NOW())
ON CONFLICT (email, "tenantId") DO UPDATE SET 
  "firstName" = EXCLUDED."firstName",
  "lastName" = EXCLUDED."lastName",
  password = EXCLUDED.password,
  role = EXCLUDED.role,
  department = EXCLUDED.department,
  position = EXCLUDED.position,
  phone = EXCLUDED.phone,
  "isActive" = EXCLUDED."isActive",
  "updatedAt" = NOW();

-- Esmeralda Hernandez
INSERT INTO staff (id, "firstName", "lastName", email, password, role, department, position, phone, "isActive", "tenantId", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'Esmeralda', 'Hernandez', 'ezzyhornets@gmail.com', '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'STAFF', 'FRONT DESK', 'FRONT DESK ASSOCIATE', '5059743063', true, 'dev', NOW(), NOW())
ON CONFLICT (email, "tenantId") DO UPDATE SET 
  "firstName" = EXCLUDED."firstName",
  "lastName" = EXCLUDED."lastName",
  password = EXCLUDED.password,
  role = EXCLUDED.role,
  department = EXCLUDED.department,
  position = EXCLUDED.position,
  phone = EXCLUDED.phone,
  "isActive" = EXCLUDED."isActive",
  "updatedAt" = NOW();

-- Heather Webb
INSERT INTO staff (id, "firstName", "lastName", email, password, role, department, position, phone, "isActive", "tenantId", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'Heather', 'Webb', 'heather@tailtownpetresort.com', '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'STAFF', 'FRONT DESK', 'FRONT DESK ASSOCIATE', NULL, true, 'dev', NOW(), NOW())
ON CONFLICT (email, "tenantId") DO UPDATE SET 
  "firstName" = EXCLUDED."firstName",
  "lastName" = EXCLUDED."lastName",
  password = EXCLUDED.password,
  role = EXCLUDED.role,
  department = EXCLUDED.department,
  position = EXCLUDED.position,
  phone = EXCLUDED.phone,
  "isActive" = EXCLUDED."isActive",
  "updatedAt" = NOW();

-- Isabel Gonzalez
INSERT INTO staff (id, "firstName", "lastName", email, password, role, department, position, phone, "isActive", "tenantId", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'Isabel', 'Gonzalez', 'isabelg915@gmail.com', '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'STAFF', 'FRONT DESK', 'FRONT DESK ASSOCIATE', '19152281107', true, 'dev', NOW(), NOW())
ON CONFLICT (email, "tenantId") DO UPDATE SET 
  "firstName" = EXCLUDED."firstName",
  "lastName" = EXCLUDED."lastName",
  password = EXCLUDED.password,
  role = EXCLUDED.role,
  department = EXCLUDED.department,
  position = EXCLUDED.position,
  phone = EXCLUDED.phone,
  "isActive" = EXCLUDED."isActive",
  "updatedAt" = NOW();

-- Jeannine Kosel
INSERT INTO staff (id, "firstName", "lastName", email, password, role, department, position, phone, "isActive", "tenantId", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'Jeannine', 'Kosel', 'jeannine@tailtownpetresort.com', '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'STAFF', 'FRONT DESK', 'FRONT DESK ASSOCIATE', '5052805665', true, 'dev', NOW(), NOW())
ON CONFLICT (email, "tenantId") DO UPDATE SET 
  "firstName" = EXCLUDED."firstName",
  "lastName" = EXCLUDED."lastName",
  password = EXCLUDED.password,
  role = EXCLUDED.role,
  department = EXCLUDED.department,
  position = EXCLUDED.position,
  phone = EXCLUDED.phone,
  "isActive" = EXCLUDED."isActive",
  "updatedAt" = NOW();

-- Jenny Spinola
INSERT INTO staff (id, "firstName", "lastName", email, password, role, department, position, phone, "isActive", "tenantId", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'Jenny', 'Spinola', 'jspinola73@outlook.com', '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'STAFF', 'FRONT DESK', 'FRONT DESK ASSOCIATE', '5054351668', true, 'dev', NOW(), NOW())
ON CONFLICT (email, "tenantId") DO UPDATE SET 
  "firstName" = EXCLUDED."firstName",
  "lastName" = EXCLUDED."lastName",
  password = EXCLUDED.password,
  role = EXCLUDED.role,
  department = EXCLUDED.department,
  position = EXCLUDED.position,
  phone = EXCLUDED.phone,
  "isActive" = EXCLUDED."isActive",
  "updatedAt" = NOW();

-- Joanna Lopez
INSERT INTO staff (id, "firstName", "lastName", email, password, role, department, position, phone, "isActive", "tenantId", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'Joanna', 'Lopez', 'joannalopez5501@icloud.com', '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'STAFF', 'FRONT DESK', 'FRONT DESK ASSOCIATE', '5056591215', true, 'dev', NOW(), NOW())
ON CONFLICT (email, "tenantId") DO UPDATE SET 
  "firstName" = EXCLUDED."firstName",
  "lastName" = EXCLUDED."lastName",
  password = EXCLUDED.password,
  role = EXCLUDED.role,
  department = EXCLUDED.department,
  position = EXCLUDED.position,
  phone = EXCLUDED.phone,
  "isActive" = EXCLUDED."isActive",
  "updatedAt" = NOW();

-- Kate Lewis
INSERT INTO staff (id, "firstName", "lastName", email, password, role, department, position, phone, "isActive", "tenantId", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'Kate', 'Lewis', 'kjlew0429@gmail.com', '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'STAFF', 'FRONT DESK', 'FRONT DESK ASSOCIATE', '5053075512', true, 'dev', NOW(), NOW())
ON CONFLICT (email, "tenantId") DO UPDATE SET 
  "firstName" = EXCLUDED."firstName",
  "lastName" = EXCLUDED."lastName",
  password = EXCLUDED.password,
  role = EXCLUDED.role,
  department = EXCLUDED.department,
  position = EXCLUDED.position,
  phone = EXCLUDED.phone,
  "isActive" = EXCLUDED."isActive",
  "updatedAt" = NOW();

-- Mich Cowan
INSERT INTO staff (id, "firstName", "lastName", email, password, role, department, position, phone, "isActive", "tenantId", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'Mich', 'Cowan', 'mich@tailtownpetresort.com', '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'STAFF', 'FRONT DESK', 'FRONT DESK ASSOCIATE', '5054502563', true, 'dev', NOW(), NOW())
ON CONFLICT (email, "tenantId") DO UPDATE SET 
  "firstName" = EXCLUDED."firstName",
  "lastName" = EXCLUDED."lastName",
  password = EXCLUDED.password,
  role = EXCLUDED.role,
  department = EXCLUDED.department,
  position = EXCLUDED.position,
  phone = EXCLUDED.phone,
  "isActive" = EXCLUDED."isActive",
  "updatedAt" = NOW();

-- Rio Rancho House Groomer
INSERT INTO staff (id, "firstName", "lastName", email, password, role, department, position, phone, "isActive", "tenantId", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'Rio Rancho', 'House Groomer', 'riogroomer@gingrapp.com', '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'STAFF', 'FRONT DESK', 'FRONT DESK ASSOCIATE', NULL, true, 'dev', NOW(), NOW())
ON CONFLICT (email, "tenantId") DO UPDATE SET 
  "firstName" = EXCLUDED."firstName",
  "lastName" = EXCLUDED."lastName",
  password = EXCLUDED.password,
  role = EXCLUDED.role,
  department = EXCLUDED.department,
  position = EXCLUDED.position,
  phone = EXCLUDED.phone,
  "isActive" = EXCLUDED."isActive",
  "updatedAt" = NOW();

-- Rob Weinstein
INSERT INTO staff (id, "firstName", "lastName", email, password, role, department, position, phone, "isActive", "tenantId", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'Rob', 'Weinstein', 'rob@tailtownpetresort.com', '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'STAFF', 'FRONT DESK', 'FRONT DESK ASSOCIATE', '5055536754', true, 'dev', NOW(), NOW())
ON CONFLICT (email, "tenantId") DO UPDATE SET 
  "firstName" = EXCLUDED."firstName",
  "lastName" = EXCLUDED."lastName",
  password = EXCLUDED.password,
  role = EXCLUDED.role,
  department = EXCLUDED.department,
  position = EXCLUDED.position,
  phone = EXCLUDED.phone,
  "isActive" = EXCLUDED."isActive",
  "updatedAt" = NOW();

-- Sadie Lott
INSERT INTO staff (id, "firstName", "lastName", email, password, role, department, position, phone, "isActive", "tenantId", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'Sadie', 'Lott', 'sadie@tailtownpetresort.com', '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'STAFF', 'FRONT DESK', 'FRONT DESK ASSOCIATE', '4437714975', true, 'dev', NOW(), NOW())
ON CONFLICT (email, "tenantId") DO UPDATE SET 
  "firstName" = EXCLUDED."firstName",
  "lastName" = EXCLUDED."lastName",
  password = EXCLUDED.password,
  role = EXCLUDED.role,
  department = EXCLUDED.department,
  position = EXCLUDED.position,
  phone = EXCLUDED.phone,
  "isActive" = EXCLUDED."isActive",
  "updatedAt" = NOW();

-- Sydney Spencer
INSERT INTO staff (id, "firstName", "lastName", email, password, role, department, position, phone, "isActive", "tenantId", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'Sydney', 'Spencer', 'slspencer12@comcast.net', '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'STAFF', 'FRONT DESK', 'FRONT DESK ASSOCIATE', '5056106642', true, 'dev', NOW(), NOW())
ON CONFLICT (email, "tenantId") DO UPDATE SET 
  "firstName" = EXCLUDED."firstName",
  "lastName" = EXCLUDED."lastName",
  password = EXCLUDED.password,
  role = EXCLUDED.role,
  department = EXCLUDED.department,
  position = EXCLUDED.position,
  phone = EXCLUDED.phone,
  "isActive" = EXCLUDED."isActive",
  "updatedAt" = NOW();
