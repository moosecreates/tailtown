-- Aiden Weinstein (aidenweinstein@gmail.com)
INSERT INTO staff (
  id, 
  "firstName", 
  "lastName", 
  email, 
  password, 
  role, 
  department, 
  position,
  phone,
  address,
  city,
  state,
  "zipCode",
  specialties,
  "isActive", 
  "permissions",
  "tenantId", 
  "createdAt", 
  "updatedAt"
)
VALUES (
  gen_random_uuid(),
  'Aiden',
  'Weinstein',
  'aidenweinstein@gmail.com',
  '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', -- Password: TempPass@2024! (must be hashed with bcrypt)
  'STAFF',
  'FRONT DESK',
  'FRONT DESK ASSOCIATE',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  ARRAY[]::TEXT[],
  true,
  '{"canManageStaff":false,"canManageCustomers":false,"canManageReservations":true,"canManageBilling":false,"canManageReports":false,"canManageSchedule":false,"canViewReports":true,"canCheckInPets":true,"canManageInventory":false,"canManageGrooming":false,"canManageTraining":false,"canManageKennels":false}',
  'dev',
  NOW(),
  NOW()
)
ON CONFLICT (email, "tenantId") DO NOTHING;

-- Amy Rudd (adobedogsco@gmail.com)
INSERT INTO staff (
  id, 
  "firstName", 
  "lastName", 
  email, 
  password, 
  role, 
  department, 
  position,
  phone,
  address,
  city,
  state,
  "zipCode",
  specialties,
  "isActive", 
  "permissions",
  "tenantId", 
  "createdAt", 
  "updatedAt"
)
VALUES (
  gen_random_uuid(),
  'Amy',
  'Rudd',
  'adobedogsco@gmail.com',
  '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', -- Password: TempPass@2024! (must be hashed with bcrypt)
  'STAFF',
  'FRONT DESK',
  'FRONT DESK ASSOCIATE',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  ARRAY[]::TEXT[],
  true,
  '{"canManageStaff":false,"canManageCustomers":false,"canManageReservations":true,"canManageBilling":false,"canManageReports":false,"canManageSchedule":false,"canViewReports":true,"canCheckInPets":true,"canManageInventory":false,"canManageGrooming":false,"canManageTraining":false,"canManageKennels":false}',
  'dev',
  NOW(),
  NOW()
)
ON CONFLICT (email, "tenantId") DO NOTHING;

-- Annie Chavez (corrgiful@gmail.com)
INSERT INTO staff (
  id, 
  "firstName", 
  "lastName", 
  email, 
  password, 
  role, 
  department, 
  position,
  phone,
  address,
  city,
  state,
  "zipCode",
  specialties,
  "isActive", 
  "permissions",
  "tenantId", 
  "createdAt", 
  "updatedAt"
)
VALUES (
  gen_random_uuid(),
  'Annie',
  'Chavez',
  'corrgiful@gmail.com',
  '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', -- Password: TempPass@2024! (must be hashed with bcrypt)
  'STAFF',
  'FRONT DESK',
  'FRONT DESK ASSOCIATE',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  ARRAY[]::TEXT[],
  true,
  '{"canManageStaff":false,"canManageCustomers":false,"canManageReservations":true,"canManageBilling":false,"canManageReports":false,"canManageSchedule":false,"canViewReports":true,"canCheckInPets":true,"canManageInventory":false,"canManageGrooming":false,"canManageTraining":false,"canManageKennels":false}',
  'dev',
  NOW(),
  NOW()
)
ON CONFLICT (email, "tenantId") DO NOTHING;

-- Antonia Weinstein (antonia@tailtownpetresort.com)
INSERT INTO staff (
  id, 
  "firstName", 
  "lastName", 
  email, 
  password, 
  role, 
  department, 
  position,
  phone,
  address,
  city,
  state,
  "zipCode",
  specialties,
  "isActive", 
  "permissions",
  "tenantId", 
  "createdAt", 
  "updatedAt"
)
VALUES (
  gen_random_uuid(),
  'Antonia',
  'Weinstein',
  'antonia@tailtownpetresort.com',
  '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', -- Password: TempPass@2024! (must be hashed with bcrypt)
  'MANAGER',
  'MANAGEMENT',
  'GENERAL MANAGER',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  ARRAY[]::TEXT[],
  true,
  '{"canManageStaff":true,"canManageCustomers":true,"canManageReservations":true,"canManageBilling":true,"canManageReports":true,"canManageSchedule":true,"canViewReports":true,"canCheckInPets":true,"canManageInventory":true,"canManageGrooming":true,"canManageTraining":true,"canManageKennels":true}',
  'dev',
  NOW(),
  NOW()
)
ON CONFLICT (email, "tenantId") DO NOTHING;

-- Cadence Reed (cadencereed9319@gmail.com)
INSERT INTO staff (
  id, 
  "firstName", 
  "lastName", 
  email, 
  password, 
  role, 
  department, 
  position,
  phone,
  address,
  city,
  state,
  "zipCode",
  specialties,
  "isActive", 
  "permissions",
  "tenantId", 
  "createdAt", 
  "updatedAt"
)
VALUES (
  gen_random_uuid(),
  'Cadence',
  'Reed',
  'cadencereed9319@gmail.com',
  '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', -- Password: TempPass@2024! (must be hashed with bcrypt)
  'STAFF',
  'FRONT DESK',
  'FRONT DESK ASSOCIATE',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  ARRAY[]::TEXT[],
  true,
  '{"canManageStaff":false,"canManageCustomers":false,"canManageReservations":true,"canManageBilling":false,"canManageReports":false,"canManageSchedule":false,"canViewReports":true,"canCheckInPets":true,"canManageInventory":false,"canManageGrooming":false,"canManageTraining":false,"canManageKennels":false}',
  'dev',
  NOW(),
  NOW()
)
ON CONFLICT (email, "tenantId") DO NOTHING;

-- Caty Mccarthy (caitlin.mccarthy@hotmail.com)
INSERT INTO staff (
  id, 
  "firstName", 
  "lastName", 
  email, 
  password, 
  role, 
  department, 
  position,
  phone,
  address,
  city,
  state,
  "zipCode",
  specialties,
  "isActive", 
  "permissions",
  "tenantId", 
  "createdAt", 
  "updatedAt"
)
VALUES (
  gen_random_uuid(),
  'Caty',
  'Mccarthy',
  'caitlin.mccarthy@hotmail.com',
  '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', -- Password: TempPass@2024! (must be hashed with bcrypt)
  'STAFF',
  'FRONT DESK',
  'FRONT DESK ASSOCIATE',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  ARRAY[]::TEXT[],
  true,
  '{"canManageStaff":false,"canManageCustomers":false,"canManageReservations":true,"canManageBilling":false,"canManageReports":false,"canManageSchedule":false,"canViewReports":true,"canCheckInPets":true,"canManageInventory":false,"canManageGrooming":false,"canManageTraining":false,"canManageKennels":false}',
  'dev',
  NOW(),
  NOW()
)
ON CONFLICT (email, "tenantId") DO NOTHING;

-- Cristian Ramirez (rcristian200@gmail.com)
INSERT INTO staff (
  id, 
  "firstName", 
  "lastName", 
  email, 
  password, 
  role, 
  department, 
  position,
  phone,
  address,
  city,
  state,
  "zipCode",
  specialties,
  "isActive", 
  "permissions",
  "tenantId", 
  "createdAt", 
  "updatedAt"
)
VALUES (
  gen_random_uuid(),
  'Cristian',
  'Ramirez',
  'rcristian200@gmail.com',
  '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', -- Password: TempPass@2024! (must be hashed with bcrypt)
  'STAFF',
  'FRONT DESK',
  'FRONT DESK ASSOCIATE',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  ARRAY[]::TEXT[],
  true,
  '{"canManageStaff":false,"canManageCustomers":false,"canManageReservations":true,"canManageBilling":false,"canManageReports":false,"canManageSchedule":false,"canViewReports":true,"canCheckInPets":true,"canManageInventory":false,"canManageGrooming":false,"canManageTraining":false,"canManageKennels":false}',
  'dev',
  NOW(),
  NOW()
)
ON CONFLICT (email, "tenantId") DO NOTHING;

-- Emily Parks (emilyparks9319@gmail.com)
INSERT INTO staff (
  id, 
  "firstName", 
  "lastName", 
  email, 
  password, 
  role, 
  department, 
  position,
  phone,
  address,
  city,
  state,
  "zipCode",
  specialties,
  "isActive", 
  "permissions",
  "tenantId", 
  "createdAt", 
  "updatedAt"
)
VALUES (
  gen_random_uuid(),
  'Emily',
  'Parks',
  'emilyparks9319@gmail.com',
  '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', -- Password: TempPass@2024! (must be hashed with bcrypt)
  'STAFF',
  'FRONT DESK',
  'FRONT DESK ASSOCIATE',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  ARRAY[]::TEXT[],
  true,
  '{"canManageStaff":false,"canManageCustomers":false,"canManageReservations":true,"canManageBilling":false,"canManageReports":false,"canManageSchedule":false,"canViewReports":true,"canCheckInPets":true,"canManageInventory":false,"canManageGrooming":false,"canManageTraining":false,"canManageKennels":false}',
  'dev',
  NOW(),
  NOW()
)
ON CONFLICT (email, "tenantId") DO NOTHING;

-- Emma Cohee (encohee@icloud.com)
INSERT INTO staff (
  id, 
  "firstName", 
  "lastName", 
  email, 
  password, 
  role, 
  department, 
  position,
  phone,
  address,
  city,
  state,
  "zipCode",
  specialties,
  "isActive", 
  "permissions",
  "tenantId", 
  "createdAt", 
  "updatedAt"
)
VALUES (
  gen_random_uuid(),
  'Emma',
  'Cohee',
  'encohee@icloud.com',
  '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', -- Password: TempPass@2024! (must be hashed with bcrypt)
  'STAFF',
  'FRONT DESK',
  'FRONT DESK ASSOCIATE',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  ARRAY[]::TEXT[],
  true,
  '{"canManageStaff":false,"canManageCustomers":false,"canManageReservations":true,"canManageBilling":false,"canManageReports":false,"canManageSchedule":false,"canViewReports":true,"canCheckInPets":true,"canManageInventory":false,"canManageGrooming":false,"canManageTraining":false,"canManageKennels":false}',
  'dev',
  NOW(),
  NOW()
)
ON CONFLICT (email, "tenantId") DO NOTHING;

-- Esmeralda Hernandez (ezzyhornets@gmail.com)
INSERT INTO staff (
  id, 
  "firstName", 
  "lastName", 
  email, 
  password, 
  role, 
  department, 
  position,
  phone,
  address,
  city,
  state,
  "zipCode",
  specialties,
  "isActive", 
  "permissions",
  "tenantId", 
  "createdAt", 
  "updatedAt"
)
VALUES (
  gen_random_uuid(),
  'Esmeralda',
  'Hernandez',
  'ezzyhornets@gmail.com',
  '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', -- Password: TempPass@2024! (must be hashed with bcrypt)
  'STAFF',
  'FRONT DESK',
  'FRONT DESK ASSOCIATE',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  ARRAY[]::TEXT[],
  true,
  '{"canManageStaff":false,"canManageCustomers":false,"canManageReservations":true,"canManageBilling":false,"canManageReports":false,"canManageSchedule":false,"canViewReports":true,"canCheckInPets":true,"canManageInventory":false,"canManageGrooming":false,"canManageTraining":false,"canManageKennels":false}',
  'dev',
  NOW(),
  NOW()
)
ON CONFLICT (email, "tenantId") DO NOTHING;

-- Gingr Support User (appadmin@gingrapp.com)
INSERT INTO staff (
  id, 
  "firstName", 
  "lastName", 
  email, 
  password, 
  role, 
  department, 
  position,
  phone,
  address,
  city,
  state,
  "zipCode",
  specialties,
  "isActive", 
  "permissions",
  "tenantId", 
  "createdAt", 
  "updatedAt"
)
VALUES (
  gen_random_uuid(),
  'Gingr',
  'Support',
  'appadmin@gingrapp.com',
  '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', -- Password: TempPass@2024! (must be hashed with bcrypt)
  'STAFF',
  'FRONT DESK',
  'FRONT DESK ASSOCIATE',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  ARRAY[]::TEXT[],
  true,
  '{"canManageStaff":false,"canManageCustomers":false,"canManageReservations":true,"canManageBilling":false,"canManageReports":false,"canManageSchedule":false,"canViewReports":true,"canCheckInPets":true,"canManageInventory":false,"canManageGrooming":false,"canManageTraining":false,"canManageKennels":false}',
  'dev',
  NOW(),
  NOW()
)
ON CONFLICT (email, "tenantId") DO NOTHING;

-- Heather Webb (heather@tailtownpetresort.com)
INSERT INTO staff (
  id, 
  "firstName", 
  "lastName", 
  email, 
  password, 
  role, 
  department, 
  position,
  phone,
  address,
  city,
  state,
  "zipCode",
  specialties,
  "isActive", 
  "permissions",
  "tenantId", 
  "createdAt", 
  "updatedAt"
)
VALUES (
  gen_random_uuid(),
  'Heather',
  'Webb',
  'heather@tailtownpetresort.com',
  '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', -- Password: TempPass@2024! (must be hashed with bcrypt)
  'MANAGER',
  'MANAGEMENT',
  'GENERAL MANAGER',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  ARRAY[]::TEXT[],
  true,
  '{"canManageStaff":true,"canManageCustomers":true,"canManageReservations":true,"canManageBilling":true,"canManageReports":true,"canManageSchedule":true,"canViewReports":true,"canCheckInPets":true,"canManageInventory":true,"canManageGrooming":true,"canManageTraining":true,"canManageKennels":true}',
  'dev',
  NOW(),
  NOW()
)
ON CONFLICT (email, "tenantId") DO NOTHING;

-- Isabel Gonzalez (isabelg915@gmail.com)
INSERT INTO staff (
  id, 
  "firstName", 
  "lastName", 
  email, 
  password, 
  role, 
  department, 
  position,
  phone,
  address,
  city,
  state,
  "zipCode",
  specialties,
  "isActive", 
  "permissions",
  "tenantId", 
  "createdAt", 
  "updatedAt"
)
VALUES (
  gen_random_uuid(),
  'Isabel',
  'Gonzalez',
  'isabelg915@gmail.com',
  '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', -- Password: TempPass@2024! (must be hashed with bcrypt)
  'STAFF',
  'FRONT DESK',
  'FRONT DESK ASSOCIATE',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  ARRAY[]::TEXT[],
  true,
  '{"canManageStaff":false,"canManageCustomers":false,"canManageReservations":true,"canManageBilling":false,"canManageReports":false,"canManageSchedule":false,"canViewReports":true,"canCheckInPets":true,"canManageInventory":false,"canManageGrooming":false,"canManageTraining":false,"canManageKennels":false}',
  'dev',
  NOW(),
  NOW()
)
ON CONFLICT (email, "tenantId") DO NOTHING;

-- Jeannine Kosel (jeannine@tailtownpetresort.com)
INSERT INTO staff (
  id, 
  "firstName", 
  "lastName", 
  email, 
  password, 
  role, 
  department, 
  position,
  phone,
  address,
  city,
  state,
  "zipCode",
  specialties,
  "isActive", 
  "permissions",
  "tenantId", 
  "createdAt", 
  "updatedAt"
)
VALUES (
  gen_random_uuid(),
  'Jeannine',
  'Kosel',
  'jeannine@tailtownpetresort.com',
  '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', -- Password: TempPass@2024! (must be hashed with bcrypt)
  'MANAGER',
  'MANAGEMENT',
  'GENERAL MANAGER',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  ARRAY[]::TEXT[],
  true,
  '{"canManageStaff":true,"canManageCustomers":true,"canManageReservations":true,"canManageBilling":true,"canManageReports":true,"canManageSchedule":true,"canViewReports":true,"canCheckInPets":true,"canManageInventory":true,"canManageGrooming":true,"canManageTraining":true,"canManageKennels":true}',
  'dev',
  NOW(),
  NOW()
)
ON CONFLICT (email, "tenantId") DO NOTHING;

-- Jenny Spinola (jspinola73@outlook.com)
INSERT INTO staff (
  id, 
  "firstName", 
  "lastName", 
  email, 
  password, 
  role, 
  department, 
  position,
  phone,
  address,
  city,
  state,
  "zipCode",
  specialties,
  "isActive", 
  "permissions",
  "tenantId", 
  "createdAt", 
  "updatedAt"
)
VALUES (
  gen_random_uuid(),
  'Jenny',
  'Spinola',
  'jspinola73@outlook.com',
  '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', -- Password: TempPass@2024! (must be hashed with bcrypt)
  'STAFF',
  'FRONT DESK',
  'FRONT DESK ASSOCIATE',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  ARRAY[]::TEXT[],
  true,
  '{"canManageStaff":false,"canManageCustomers":false,"canManageReservations":true,"canManageBilling":false,"canManageReports":false,"canManageSchedule":false,"canViewReports":true,"canCheckInPets":true,"canManageInventory":false,"canManageGrooming":false,"canManageTraining":false,"canManageKennels":false}',
  'dev',
  NOW(),
  NOW()
)
ON CONFLICT (email, "tenantId") DO NOTHING;

-- Joanna Lopez (joannalopez5501@icloud.com)
INSERT INTO staff (
  id, 
  "firstName", 
  "lastName", 
  email, 
  password, 
  role, 
  department, 
  position,
  phone,
  address,
  city,
  state,
  "zipCode",
  specialties,
  "isActive", 
  "permissions",
  "tenantId", 
  "createdAt", 
  "updatedAt"
)
VALUES (
  gen_random_uuid(),
  'Joanna',
  'Lopez',
  'joannalopez5501@icloud.com',
  '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', -- Password: TempPass@2024! (must be hashed with bcrypt)
  'STAFF',
  'FRONT DESK',
  'FRONT DESK ASSOCIATE',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  ARRAY[]::TEXT[],
  true,
  '{"canManageStaff":false,"canManageCustomers":false,"canManageReservations":true,"canManageBilling":false,"canManageReports":false,"canManageSchedule":false,"canViewReports":true,"canCheckInPets":true,"canManageInventory":false,"canManageGrooming":false,"canManageTraining":false,"canManageKennels":false}',
  'dev',
  NOW(),
  NOW()
)
ON CONFLICT (email, "tenantId") DO NOTHING;

-- Kate Lewis (kjlew0429@gmail.com)
INSERT INTO staff (
  id, 
  "firstName", 
  "lastName", 
  email, 
  password, 
  role, 
  department, 
  position,
  phone,
  address,
  city,
  state,
  "zipCode",
  specialties,
  "isActive", 
  "permissions",
  "tenantId", 
  "createdAt", 
  "updatedAt"
)
VALUES (
  gen_random_uuid(),
  'Kate',
  'Lewis',
  'kjlew0429@gmail.com',
  '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', -- Password: TempPass@2024! (must be hashed with bcrypt)
  'STAFF',
  'FRONT DESK',
  'FRONT DESK ASSOCIATE',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  ARRAY[]::TEXT[],
  true,
  '{"canManageStaff":false,"canManageCustomers":false,"canManageReservations":true,"canManageBilling":false,"canManageReports":false,"canManageSchedule":false,"canViewReports":true,"canCheckInPets":true,"canManageInventory":false,"canManageGrooming":false,"canManageTraining":false,"canManageKennels":false}',
  'dev',
  NOW(),
  NOW()
)
ON CONFLICT (email, "tenantId") DO NOTHING;

-- Mich Cowan (mich@tailtownpetresort.com)
INSERT INTO staff (
  id, 
  "firstName", 
  "lastName", 
  email, 
  password, 
  role, 
  department, 
  position,
  phone,
  address,
  city,
  state,
  "zipCode",
  specialties,
  "isActive", 
  "permissions",
  "tenantId", 
  "createdAt", 
  "updatedAt"
)
VALUES (
  gen_random_uuid(),
  'Mich',
  'Cowan',
  'mich@tailtownpetresort.com',
  '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', -- Password: TempPass@2024! (must be hashed with bcrypt)
  'MANAGER',
  'MANAGEMENT',
  'GENERAL MANAGER',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  ARRAY[]::TEXT[],
  true,
  '{"canManageStaff":true,"canManageCustomers":true,"canManageReservations":true,"canManageBilling":true,"canManageReports":true,"canManageSchedule":true,"canViewReports":true,"canCheckInPets":true,"canManageInventory":true,"canManageGrooming":true,"canManageTraining":true,"canManageKennels":true}',
  'dev',
  NOW(),
  NOW()
)
ON CONFLICT (email, "tenantId") DO NOTHING;

-- Rio Rancho House Groomer (riogroomer@gingrapp.com)
INSERT INTO staff (
  id, 
  "firstName", 
  "lastName", 
  email, 
  password, 
  role, 
  department, 
  position,
  phone,
  address,
  city,
  state,
  "zipCode",
  specialties,
  "isActive", 
  "permissions",
  "tenantId", 
  "createdAt", 
  "updatedAt"
)
VALUES (
  gen_random_uuid(),
  'Rio',
  'Groomer',
  'riogroomer@gingrapp.com',
  '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', -- Password: TempPass@2024! (must be hashed with bcrypt)
  'STAFF',
  'GROOMING',
  'GROOMER',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  ARRAY[]::TEXT[],
  true,
  '{"canManageStaff":false,"canManageCustomers":false,"canManageReservations":true,"canManageBilling":false,"canManageReports":false,"canManageSchedule":false,"canViewReports":true,"canCheckInPets":true,"canManageInventory":false,"canManageGrooming":true,"canManageTraining":false,"canManageKennels":false}',
  'dev',
  NOW(),
  NOW()
)
ON CONFLICT (email, "tenantId") DO NOTHING;

-- Rob Weinstein (rob@tailtownpetresort.com)
INSERT INTO staff (
  id, 
  "firstName", 
  "lastName", 
  email, 
  password, 
  role, 
  department, 
  position,
  phone,
  address,
  city,
  state,
  "zipCode",
  specialties,
  "isActive", 
  "permissions",
  "tenantId", 
  "createdAt", 
  "updatedAt"
)
VALUES (
  gen_random_uuid(),
  'Rob',
  'Weinstein',
  'rob@tailtownpetresort.com',
  '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', -- Password: TempPass@2024! (must be hashed with bcrypt)
  'MANAGER',
  'MANAGEMENT',
  'GENERAL MANAGER',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  ARRAY[]::TEXT[],
  true,
  '{"canManageStaff":true,"canManageCustomers":true,"canManageReservations":true,"canManageBilling":true,"canManageReports":true,"canManageSchedule":true,"canViewReports":true,"canCheckInPets":true,"canManageInventory":true,"canManageGrooming":true,"canManageTraining":true,"canManageKennels":true}',
  'dev',
  NOW(),
  NOW()
)
ON CONFLICT (email, "tenantId") DO NOTHING;

-- Sadie Lott (sadie@tailtownpetresort.com)
INSERT INTO staff (
  id, 
  "firstName", 
  "lastName", 
  email, 
  password, 
  role, 
  department, 
  position,
  phone,
  address,
  city,
  state,
  "zipCode",
  specialties,
  "isActive", 
  "permissions",
  "tenantId", 
  "createdAt", 
  "updatedAt"
)
VALUES (
  gen_random_uuid(),
  'Sadie',
  'Lott',
  'sadie@tailtownpetresort.com',
  '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', -- Password: TempPass@2024! (must be hashed with bcrypt)
  'MANAGER',
  'MANAGEMENT',
  'GENERAL MANAGER',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  ARRAY[]::TEXT[],
  true,
  '{"canManageStaff":true,"canManageCustomers":true,"canManageReservations":true,"canManageBilling":true,"canManageReports":true,"canManageSchedule":true,"canViewReports":true,"canCheckInPets":true,"canManageInventory":true,"canManageGrooming":true,"canManageTraining":true,"canManageKennels":true}',
  'dev',
  NOW(),
  NOW()
)
ON CONFLICT (email, "tenantId") DO NOTHING;

-- Sydney Spencer (slspencer12@comcast.net)
INSERT INTO staff (
  id, 
  "firstName", 
  "lastName", 
  email, 
  password, 
  role, 
  department, 
  position,
  phone,
  address,
  city,
  state,
  "zipCode",
  specialties,
  "isActive", 
  "permissions",
  "tenantId", 
  "createdAt", 
  "updatedAt"
)
VALUES (
  gen_random_uuid(),
  'Sydney',
  'Spencer',
  'slspencer12@comcast.net',
  '$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', -- Password: TempPass@2024! (must be hashed with bcrypt)
  'STAFF',
  'FRONT DESK',
  'FRONT DESK ASSOCIATE',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  ARRAY[]::TEXT[],
  true,
  '{"canManageStaff":false,"canManageCustomers":false,"canManageReservations":true,"canManageBilling":false,"canManageReports":false,"canManageSchedule":false,"canViewReports":true,"canCheckInPets":true,"canManageInventory":false,"canManageGrooming":false,"canManageTraining":false,"canManageKennels":false}',
  'dev',
  NOW(),
  NOW()
)
ON CONFLICT (email, "tenantId") DO NOTHING;