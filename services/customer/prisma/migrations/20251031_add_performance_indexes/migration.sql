-- Performance Optimization Indexes
-- Created: 2025-10-31
-- Purpose: Add indexes for frequently queried fields to improve query performance

-- Reservations: Date range queries (most common query pattern)
CREATE INDEX IF NOT EXISTS "idx_reservations_date_range" ON "reservations"("start_date", "end_date");

-- Reservations: Status and tenant filtering (used in dashboards and lists)
CREATE INDEX IF NOT EXISTS "idx_reservations_status_tenant" ON "reservations"("status", "tenant_id");

-- Reservations: Customer lookups (customer reservation history)
CREATE INDEX IF NOT EXISTS "idx_reservations_customer_dates" ON "reservations"("customer_id", "start_date" DESC);

-- Reservations: Resource availability checks
CREATE INDEX IF NOT EXISTS "idx_reservations_resource_dates" ON "reservations"("resource_id", "start_date", "end_date") WHERE status IN ('CONFIRMED', 'CHECKED_IN');

-- Pets: Customer relationship (most common join)
CREATE INDEX IF NOT EXISTS "idx_pets_customer_active" ON "pets"("customer_id", "is_active");

-- Pets: External ID lookups (Gingr integration)
CREATE INDEX IF NOT EXISTS "idx_pets_external_id" ON "pets"("external_id") WHERE "external_id" IS NOT NULL;

-- Staff: Specialty filtering with GIN index for array queries
CREATE INDEX IF NOT EXISTS "idx_staff_specialties_active" ON "staff" USING GIN("specialties") WHERE "is_active" = true;

-- Staff: Active staff lookups
CREATE INDEX IF NOT EXISTS "idx_staff_active_tenant" ON "staff"("is_active", "tenant_id");

-- Staff Availability: Day of week lookups (groomer scheduling)
CREATE INDEX IF NOT EXISTS "idx_staff_availability_day" ON "staff_availability"("staff_id", "day_of_week", "is_available");

-- Groomer Appointments: Date and groomer lookups
CREATE INDEX IF NOT EXISTS "idx_groomer_appointments_date_groomer" ON "groomer_appointments"("scheduled_date", "groomer_id", "status");

-- Customers: Active customer filtering
CREATE INDEX IF NOT EXISTS "idx_customers_active_tenant" ON "customers"("is_active", "tenant_id");

-- Customers: External ID lookups (Gingr integration)
CREATE INDEX IF NOT EXISTS "idx_customers_external_id" ON "customers"("external_id") WHERE "external_id" IS NOT NULL;

-- Medical Records: Pet lookups
CREATE INDEX IF NOT EXISTS "idx_medical_records_pet" ON "medical_records"("pet_id", "created_at" DESC);

-- Invoices: Customer and date lookups
CREATE INDEX IF NOT EXISTS "idx_invoices_customer_date" ON "invoices"("customer_id", "created_at" DESC);

-- Invoices: Status filtering
CREATE INDEX IF NOT EXISTS "idx_invoices_status_tenant" ON "invoices"("status", "tenant_id");

-- Services: Active services by category
CREATE INDEX IF NOT EXISTS "idx_services_category_active" ON "services"("service_category", "is_active", "tenant_id");

-- Resources: Type and availability
CREATE INDEX IF NOT EXISTS "idx_resources_type_active" ON "resources"("type", "is_active", "tenant_id");

-- Training Classes: Date range queries
CREATE INDEX IF NOT EXISTS "idx_training_classes_dates" ON "training_classes"("start_date", "end_date", "tenant_id");

-- Class Enrollments: Student lookups
CREATE INDEX IF NOT EXISTS "idx_class_enrollments_customer" ON "class_enrollments"("customer_id", "class_id");

-- Composite index for common dashboard queries (today's reservations)
CREATE INDEX IF NOT EXISTS "idx_reservations_today_dashboard" ON "reservations"("tenant_id", "start_date", "status") WHERE "status" IN ('CONFIRMED', 'CHECKED_IN');
