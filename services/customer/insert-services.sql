-- Insert sample services directly into the database
INSERT INTO services (id, name, description, duration, price, "serviceCategory", "isActive", "requiresStaff", "capacityLimit", "createdAt", "updatedAt") VALUES
('service-1', 'Full Day Daycare', 'Full day care for your dog with supervised play and activities', 480, 45.00, 'DAYCARE', true, true, 20, NOW(), NOW()),
('service-2', 'Half Day Daycare', 'Half day care for your dog with supervised play', 240, 25.00, 'DAYCARE', true, true, 20, NOW(), NOW()),
('service-3', 'Overnight Boarding', 'Overnight boarding with comfortable accommodations', 1440, 65.00, 'BOARDING', true, true, 50, NOW(), NOW()),
('service-4', 'Basic Grooming', 'Basic grooming package including bath, brush, and nail trim', 120, 55.00, 'GROOMING', true, true, 5, NOW(), NOW()),
('service-5', 'Full Grooming', 'Complete grooming package with bath, cut, style, and nail trim', 180, 85.00, 'GROOMING', true, true, 3, NOW(), NOW()),
('service-6', 'Basic Training Session', 'One-on-one basic obedience training session', 60, 75.00, 'TRAINING', true, true, 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  duration = EXCLUDED.duration,
  price = EXCLUDED.price,
  "serviceCategory" = EXCLUDED."serviceCategory",
  "isActive" = EXCLUDED."isActive",
  "requiresStaff" = EXCLUDED."requiresStaff",
  "capacityLimit" = EXCLUDED."capacityLimit",
  "updatedAt" = NOW();
