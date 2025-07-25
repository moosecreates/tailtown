-- Check Pet table (uppercase)
SELECT * FROM "Pet" LIMIT 10;

-- Check pets table (lowercase)
SELECT * FROM pets LIMIT 10;

-- Count all pets in Pet table
SELECT COUNT(*) FROM "Pet";

-- Count all pets in pets table
SELECT COUNT(*) FROM pets;

-- List all tables in the database
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
