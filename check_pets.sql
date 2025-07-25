-- Simple SQL query to check for pets in the database
SELECT p.id, p.name, p.breed, c.id as customer_id, c."firstName" as customer_first_name, c."lastName" as customer_last_name
FROM "Pet" p
JOIN "Customer" c ON p."customerId" = c.id
LIMIT 20;
