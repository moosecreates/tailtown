-- Query to find all pets in the database
-- Can be run with: docker exec -i [container_name] psql -U postgres -d [database_name] < find_all_pets.sql

-- First check if the Pet table exists (PascalCase version used by Prisma)
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'Pet'
) AS "Pet_table_exists";

-- Check if the pets table exists (lowercase version)
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'pets'
) AS "pets_table_exists";

-- Query the Pet table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'Pet') THEN
    RAISE NOTICE '--- Pets from "Pet" table ---';
    -- Using PERFORM for the RAISE NOTICE to work
    PERFORM (SELECT 'ID: ' || id || ', Name: ' || name || ', Customer ID: ' || "customerId" 
            FROM "Pet" LIMIT 100);
  END IF;
END $$;

-- List all pets in the Pet table
SELECT id, name, "customerId" FROM "Pet" LIMIT 100;

-- Query the pets table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'pets') THEN
    RAISE NOTICE '--- Pets from "pets" table ---';
    -- Using PERFORM for the RAISE NOTICE to work
    PERFORM (SELECT 'ID: ' || id || ', Name: ' || name || ', Customer ID: ' || customer_id 
            FROM pets LIMIT 100);
  END IF;
END $$;

-- List all pets in the pets table
SELECT id, name, customer_id FROM pets LIMIT 100;

-- List all tables that might contain pet data
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
  AND table_name ILIKE '%pet%';

-- List all columns in the database that might contain pet names
SELECT table_name, column_name
FROM information_schema.columns
WHERE column_name ILIKE '%name%'
  AND table_schema = 'public'
ORDER BY table_name;
