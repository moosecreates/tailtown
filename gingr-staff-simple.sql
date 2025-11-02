-- Gingr Staff Import - Simplified Version
-- Password: TempPass@2024! (bcrypt hash: $2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm)

-- Aiden Weinstein - Administrator
INSERT INTO staff (id, "firstName", "lastName", email, password, role, department, position, phone, "isActive", "tenantId", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'Aiden', 'Weinstein', 'aidenweinstein@gmail.com', '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'ADMINISTRATOR', 'MANAGEMENT', 'GENERAL MANAGER', '5054000295', true, 'dev', NOW(), NOW())
ON CONFLICT (email, "tenantId") DO NOTHING;

-- Amy Rudd - Instructor  
INSERT INTO staff (id, "firstName", "lastName", email, password, role, department, position, phone, "isActive", "tenantId", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'Amy', 'Rudd', 'adobedogsco@gmail.com', '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'INSTRUCTOR', 'TRAINING', 'DOG TRAINER', '5056001312', true, 'dev', NOW(), NOW())
ON CONFLICT (email, "tenantId") DO NOTHING;

-- Annie Chavez - Staff (Grooming)
INSERT INTO staff (id, "firstName", "lastName", email, password, role, department, position, phone, "isActive", "tenantId", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'Annie', 'Chavez', 'corrgiful@gmail.com', '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'STAFF', 'GROOMING', 'GROOMER', '5052363310', true, 'dev', NOW(), NOW())
ON CONFLICT (email, "tenantId") DO NOTHING;

-- Antonia Weinstein - Administrator
INSERT INTO staff (id, "firstName", "lastName", email, password, role, department, position, phone, "isActive", "tenantId", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'Antonia', 'Weinstein', 'antonia@tailtownpetresort.com', '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'ADMINISTRATOR', 'MANAGEMENT', 'GENERAL MANAGER', '5054109618', true, 'dev', NOW(), NOW())
ON CONFLICT (email, "tenantId") DO NOTHING;

-- Cadence Reed - Staff
INSERT INTO staff (id, "firstName", "lastName", email, password, role, department, position, phone, "isActive", "tenantId", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'Cadence', 'Reed', 'cadencereed9319@gmail.com', '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'STAFF', 'FRONT DESK', 'FRONT DESK ASSOCIATE', '5059333169', true, 'dev', NOW(), NOW())
ON CONFLICT (email, "tenantId") DO NOTHING;

-- Caty McCarthy - Manager
INSERT INTO staff (id, "firstName", "lastName", email, password, role, department, position, phone, "isActive", "tenantId", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'Caty', 'McCarthy', 'caitlin.mccarthy@hotmail.com', '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'MANAGER', 'MANAGEMENT', 'GENERAL MANAGER', '5059332917', true, 'dev', NOW(), NOW())
ON CONFLICT (email, "tenantId") DO NOTHING;

-- Cristian Ramirez - Manager
INSERT INTO staff (id, "firstName", "lastName", email, password, role, department, position, phone, "isActive", "tenantId", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'Cristian', 'Ramirez', 'rcristian200@gmail.com', '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'MANAGER', 'MANAGEMENT', 'GENERAL MANAGER', '5052259827', true, 'dev', NOW(), NOW())
ON CONFLICT (email, "tenantId") DO NOTHING;

-- Emily Parks - Staff (Grooming)
INSERT INTO staff (id, "firstName", "lastName", email, password, role, department, position, phone, "isActive", "tenantId", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'Emily', 'Parks', 'emilyparks9319@gmail.com', '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'STAFF', 'GROOMING', 'GROOMER', '5054536547', true, 'dev', NOW(), NOW())
ON CONFLICT (email, "tenantId") DO NOTHING;

-- Emma Cohee - Staff
INSERT INTO staff (id, "firstName", "lastName", email, password, role, department, position, phone, "isActive", "tenantId", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'Emma', 'Cohee', 'encohee@icloud.com', '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'STAFF', 'FRONT DESK', 'FRONT DESK ASSOCIATE', '5056047858', true, 'dev', NOW(), NOW())
ON CONFLICT (email, "tenantId") DO NOTHING;

-- Esmeralda Hernandez - Manager
INSERT INTO staff (id, "firstName", "lastName", email, password, role, department, position, phone, "isActive", "tenantId", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'Esmeralda', 'Hernandez', 'ezzyhornets@gmail.com', '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'MANAGER', 'MANAGEMENT', 'GENERAL MANAGER', '5059743063', true, 'dev', NOW(), NOW())
ON CONFLICT (email, "tenantId") DO NOTHING;

-- Heather Webb - Administrator
INSERT INTO staff (id, "firstName", "lastName", email, password, role, department, position, phone, "isActive", "tenantId", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'Heather', 'Webb', 'heather@tailtownpetresort.com', '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'ADMINISTRATOR', 'MANAGEMENT', 'GENERAL MANAGER', NULL, true, 'dev', NOW(), NOW())
ON CONFLICT (email, "tenantId") DO NOTHING;

-- Isabel Gonzalez - Staff (Grooming)
INSERT INTO staff (id, "firstName", "lastName", email, password, role, department, position, phone, "isActive", "tenantId", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'Isabel', 'Gonzalez', 'isabelg915@gmail.com', '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'STAFF', 'GROOMING', 'GROOMER', '19152281107', true, 'dev', NOW(), NOW())
ON CONFLICT (email, "tenantId") DO NOTHING;

-- Jeannine Kosel - Administrator
INSERT INTO staff (id, "firstName", "lastName", email, password, role, department, position, phone, "isActive", "tenantId", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'Jeannine', 'Kosel', 'jeannine@tailtownpetresort.com', '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'ADMINISTRATOR', 'MANAGEMENT', 'GENERAL MANAGER', '5052805665', true, 'dev', NOW(), NOW())
ON CONFLICT (email, "tenantId") DO NOTHING;

-- Jenny Spinola - Manager (Grooming)
INSERT INTO staff (id, "firstName", "lastName", email, password, role, department, position, phone, "isActive", "tenantId", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'Jenny', 'Spinola', 'jspinola73@outlook.com', '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'MANAGER', 'MANAGEMENT', 'GENERAL MANAGER', '5054351668', true, 'dev', NOW(), NOW())
ON CONFLICT (email, "tenantId") DO NOTHING;

-- Joanna Lopez - Staff (Grooming)
INSERT INTO staff (id, "firstName", "lastName", email, password, role, department, position, phone, "isActive", "tenantId", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'Joanna', 'Lopez', 'joannalopez5501@icloud.com', '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'STAFF', 'GROOMING', 'GROOMER', '5056591215', true, 'dev', NOW(), NOW())
ON CONFLICT (email, "tenantId") DO NOTHING;

-- Kate Lewis - Staff
INSERT INTO staff (id, "firstName", "lastName", email, password, role, department, position, phone, "isActive", "tenantId", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'Kate', 'Lewis', 'kjlew0429@gmail.com', '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'STAFF', 'FRONT DESK', 'FRONT DESK ASSOCIATE', '5053075512', true, 'dev', NOW(), NOW())
ON CONFLICT (email, "tenantId") DO NOTHING;

-- Mich Cowan - Manager
INSERT INTO staff (id, "firstName", "lastName", email, password, role, department, position, phone, "isActive", "tenantId", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'Mich', 'Cowan', 'mich@tailtownpetresort.com', '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'MANAGER', 'MANAGEMENT', 'GENERAL MANAGER', '5054502563', true, 'dev', NOW(), NOW())
ON CONFLICT (email, "tenantId") DO NOTHING;

-- Rio Rancho House Groomer - Staff (Grooming)
INSERT INTO staff (id, "firstName", "lastName", email, password, role, department, position, phone, "isActive", "tenantId", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'Rio Rancho', 'House Groomer', 'riogroomer@gingrapp.com', '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'STAFF', 'GROOMING', 'GROOMER', NULL, true, 'dev', NOW(), NOW())
ON CONFLICT (email, "tenantId") DO NOTHING;

-- Rob Weinstein - Administrator
INSERT INTO staff (id, "firstName", "lastName", email, password, role, department, position, phone, "isActive", "tenantId", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'Rob', 'Weinstein', 'rob@tailtownpetresort.com', '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'ADMINISTRATOR', 'MANAGEMENT', 'GENERAL MANAGER', '5055536754', true, 'dev', NOW(), NOW())
ON CONFLICT (email, "tenantId") DO NOTHING;

-- Sadie Lott - Manager
INSERT INTO staff (id, "firstName", "lastName", email, password, role, department, position, phone, "isActive", "tenantId", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'Sadie', 'Lott', 'sadie@tailtownpetresort.com', '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'MANAGER', 'MANAGEMENT', 'GENERAL MANAGER', '4437714975', true, 'dev', NOW(), NOW())
ON CONFLICT (email, "tenantId") DO NOTHING;

-- Sydney Spencer - Manager
INSERT INTO staff (id, "firstName", "lastName", email, password, role, department, position, phone, "isActive", "tenantId", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'Sydney', 'Spencer', 'slspencer12@comcast.net', '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'MANAGER', 'MANAGEMENT', 'GENERAL MANAGER', '5056106642', true, 'dev', NOW(), NOW())
ON CONFLICT (email, "tenantId") DO NOTHING;
