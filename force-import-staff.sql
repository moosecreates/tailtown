-- Force import staff by temporarily disabling foreign key constraints

-- Step 1: Temporarily disable foreign key constraints
ALTER TABLE staff_availability DISABLE TRIGGER ALL;
ALTER TABLE staff_schedules DISABLE TRIGGER ALL; 
ALTER TABLE staff_time_off DISABLE TRIGGER ALL;

-- Step 2: Clear existing staff data (to avoid conflicts)
TRUNCATE TABLE staff_availability RESTART IDENTITY CASCADE;
TRUNCATE TABLE staff_schedules RESTART IDENTITY CASCADE;
TRUNCATE TABLE staff_time_off RESTART IDENTITY CASCADE;
TRUNCATE TABLE staff RESTART IDENTITY CASCADE;

-- Step 3: Import all Gingr staff as STAFF level
-- Password: TempPass@2024! (bcrypt hash: $2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm)

INSERT INTO staff ("firstName", "lastName", email, password, role, department, position, phone, "isActive", "tenantId", "createdAt", "updatedAt") VALUES
('Aiden', 'Weinstein', 'aidenweinstein@gmail.com', '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'STAFF', 'FRONT DESK', 'FRONT DESK ASSOCIATE', '5054000295', true, 'dev', NOW(), NOW()),
('Amy', 'Rudd', 'adobedogsco@gmail.com', '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'STAFF', 'FRONT DESK', 'FRONT DESK ASSOCIATE', '5056001312', true, 'dev', NOW(), NOW()),
('Annie', 'Chavez', 'corrgiful@gmail.com', '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'STAFF', 'FRONT DESK', 'FRONT DESK ASSOCIATE', '5052363310', true, 'dev', NOW(), NOW()),
('Antonia', 'Weinstein', 'antonia@tailtownpetresort.com', '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'STAFF', 'FRONT DESK', 'FRONT DESK ASSOCIATE', '5054109618', true, 'dev', NOW(), NOW()),
('Cadence', 'Reed', 'cadencereed9319@gmail.com', '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'STAFF', 'FRONT DESK', 'FRONT DESK ASSOCIATE', '5059333169', true, 'dev', NOW(), NOW()),
('Caty', 'McCarthy', 'caitlin.mccarthy@hotmail.com', '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'STAFF', 'FRONT DESK', 'FRONT DESK ASSOCIATE', '5059332917', true, 'dev', NOW(), NOW()),
('Cristian', 'Ramirez', 'rcristian200@gmail.com', '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'STAFF', 'FRONT DESK', 'FRONT DESK ASSOCIATE', '5052259827', true, 'dev', NOW(), NOW()),
('Emily', 'Parks', 'emilyparks9319@gmail.com', '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'STAFF', 'FRONT DESK', 'FRONT DESK ASSOCIATE', '5054536547', true, 'dev', NOW(), NOW()),
('Emma', 'Cohee', 'encohee@icloud.com', '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'STAFF', 'FRONT DESK', 'FRONT DESK ASSOCIATE', '5056047858', true, 'dev', NOW(), NOW()),
('Esmeralda', 'Hernandez', 'ezzyhornets@gmail.com', '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'STAFF', 'FRONT DESK', 'FRONT DESK ASSOCIATE', '5059743063', true, 'dev', NOW(), NOW()),
('Heather', 'Webb', 'heather@tailtownpetresort.com', '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'STAFF', 'FRONT DESK', 'FRONT DESK ASSOCIATE', NULL, true, 'dev', NOW(), NOW()),
('Isabel', 'Gonzalez', 'isabelg915@gmail.com', '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'STAFF', 'FRONT DESK', 'FRONT DESK ASSOCIATE', '19152281107', true, 'dev', NOW(), NOW()),
('Jeannine', 'Kosel', 'jeannine@tailtownpetresort.com', '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'STAFF', 'FRONT DESK', 'FRONT DESK ASSOCIATE', '5052805665', true, 'dev', NOW(), NOW()),
('Jenny', 'Spinola', 'jspinola73@outlook.com', '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'STAFF', 'FRONT DESK', 'FRONT DESK ASSOCIATE', '5054351668', true, 'dev', NOW(), NOW()),
('Joanna', 'Lopez', 'joannalopez5501@icloud.com', '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'STAFF', 'FRONT DESK', 'FRONT DESK ASSOCIATE', '5056591215', true, 'dev', NOW(), NOW()),
('Kate', 'Lewis', 'kjlew0429@gmail.com', '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'STAFF', 'FRONT DESK', 'FRONT DESK ASSOCIATE', '5053075512', true, 'dev', NOW(), NOW()),
('Mich', 'Cowan', 'mich@tailtownpetresort.com', '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'STAFF', 'FRONT DESK', 'FRONT DESK ASSOCIATE', '5054502563', true, 'dev', NOW(), NOW()),
('Rio Rancho', 'House Groomer', 'riogroomer@gingrapp.com', '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'STAFF', 'FRONT DESK', 'FRONT DESK ASSOCIATE', NULL, true, 'dev', NOW(), NOW()),
('Rob', 'Weinstein', 'rob@tailtownpetresort.com', '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'STAFF', 'FRONT DESK', 'FRONT DESK ASSOCIATE', '5055536754', true, 'dev', NOW(), NOW()),
('Sadie', 'Lott', 'sadie@tailtownpetresort.com', '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'STAFF', 'FRONT DESK', 'FRONT DESK ASSOCIATE', '4437714975', true, 'dev', NOW(), NOW()),
('Sydney', 'Spencer', 'slspencer12@comcast.net', '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'STAFF', 'FRONT DESK', 'FRONT DESK ASSOCIATE', '5056106642', true, 'dev', NOW(), NOW());

-- Step 4: Re-enable foreign key constraints
ALTER TABLE staff_availability ENABLE TRIGGER ALL;
ALTER TABLE staff_schedules ENABLE TRIGGER ALL;
ALTER TABLE staff_time_off ENABLE TRIGGER ALL;

-- Step 5: Show results
SELECT COUNT(*) as total_staff_imported FROM staff;
