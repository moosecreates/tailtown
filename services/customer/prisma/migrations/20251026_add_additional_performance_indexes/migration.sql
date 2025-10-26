-- Additional Performance Optimization Indexes
-- Created: October 26, 2025
-- Purpose: Add indexes for training classes, grooming, and other new features
-- Note: Does not duplicate existing indexes from 20250415160840

-- Training Class Sessions indexes (NEW feature)
CREATE INDEX IF NOT EXISTS "class_sessions_date_idx" ON "ClassSession"("scheduledDate");
CREATE INDEX IF NOT EXISTS "class_sessions_class_idx" ON "ClassSession"("classId");
CREATE INDEX IF NOT EXISTS "class_sessions_tenant_idx" ON "ClassSession"("tenantId");

-- Training Class Enrollments indexes (NEW feature)
CREATE INDEX IF NOT EXISTS "enrollments_status_idx" ON "ClassEnrollment"("status");
CREATE INDEX IF NOT EXISTS "enrollments_class_idx" ON "ClassEnrollment"("classId");
CREATE INDEX IF NOT EXISTS "enrollments_customer_idx" ON "ClassEnrollment"("customerId");
CREATE INDEX IF NOT EXISTS "enrollments_pet_idx" ON "ClassEnrollment"("petId");

-- Training Classes indexes (NEW feature)
CREATE INDEX IF NOT EXISTS "training_classes_tenant_idx" ON "TrainingClass"("tenantId");
CREATE INDEX IF NOT EXISTS "training_classes_status_idx" ON "TrainingClass"("status");
CREATE INDEX IF NOT EXISTS "training_classes_dates_idx" ON "TrainingClass"("startDate", "endDate");

-- Staff Availability indexes (for grooming scheduler)
CREATE INDEX IF NOT EXISTS "staff_availability_staff_date_idx" ON "StaffAvailability"("staffId", "date");
CREATE INDEX IF NOT EXISTS "staff_availability_date_idx" ON "StaffAvailability"("date");

-- Groomer Appointment indexes (NEW feature)
CREATE INDEX IF NOT EXISTS "groomer_appointments_date_idx" ON "GroomerAppointment"("scheduledDate");
CREATE INDEX IF NOT EXISTS "groomer_appointments_groomer_idx" ON "GroomerAppointment"("groomerId");
CREATE INDEX IF NOT EXISTS "groomer_appointments_status_idx" ON "GroomerAppointment"("status");
CREATE INDEX IF NOT EXISTS "groomer_appointments_reservation_idx" ON "GroomerAppointment"("reservationId");

-- Invoice indexes (additional for reporting)
CREATE INDEX IF NOT EXISTS "invoices_customer_idx" ON "Invoice"("customerId");
CREATE INDEX IF NOT EXISTS "invoices_reservation_idx" ON "Invoice"("reservationId");
CREATE INDEX IF NOT EXISTS "invoices_status_idx" ON "Invoice"("status");
CREATE INDEX IF NOT EXISTS "invoices_tenant_idx" ON "Invoice"("tenantId");

-- Payment indexes (additional for reporting)
CREATE INDEX IF NOT EXISTS "payments_invoice_idx" ON "Payment"("invoiceId");
CREATE INDEX IF NOT EXISTS "payments_tenant_idx" ON "Payment"("tenantId");

-- Resource indexes
CREATE INDEX IF NOT EXISTS "resources_type_idx" ON "Resource"("type");
CREATE INDEX IF NOT EXISTS "resources_tenant_idx" ON "Resource"("tenantId");

-- Service indexes
CREATE INDEX IF NOT EXISTS "services_category_idx" ON "Service"("serviceCategory");
CREATE INDEX IF NOT EXISTS "services_tenant_idx" ON "Service"("tenantId");

-- Product indexes (NEW feature)
CREATE INDEX IF NOT EXISTS "products_tenant_idx" ON "Product"("tenantId");
CREATE INDEX IF NOT EXISTS "products_category_idx" ON "Product"("category");
CREATE INDEX IF NOT EXISTS "products_active_idx" ON "Product"("isActive");

-- Staff indexes
CREATE INDEX IF NOT EXISTS "staff_tenant_idx" ON "Staff"("tenantId");
CREATE INDEX IF NOT EXISTS "staff_active_idx" ON "Staff"("isActive");
CREATE INDEX IF NOT EXISTS "staff_role_idx" ON "Staff"("role");

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS "reservations_tenant_dates_idx" ON "Reservation"("tenantId", "startDate", "endDate");
CREATE INDEX IF NOT EXISTS "reservations_tenant_status_idx" ON "Reservation"("tenantId", "status");
CREATE INDEX IF NOT EXISTS "groomer_appointments_groomer_date_idx" ON "GroomerAppointment"("groomerId", "scheduledDate");
CREATE INDEX IF NOT EXISTS "class_sessions_class_date_idx" ON "ClassSession"("classId", "scheduledDate");
