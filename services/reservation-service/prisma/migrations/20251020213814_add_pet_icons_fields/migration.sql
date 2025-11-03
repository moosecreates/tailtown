/*
  Warnings:

  - You are about to drop the `reservation_errors` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum (with IF NOT EXISTS to handle existing types)
DO $$ BEGIN
    CREATE TYPE "PetType" AS ENUM ('DOG', 'CAT', 'BIRD', 'RABBIT', 'REPTILE', 'OTHER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'UNKNOWN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "ReservationStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED', 'NO_SHOW', 'COMPLETED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "PlayGroupType" AS ENUM ('SMALL_DOGS', 'MEDIUM_DOGS', 'LARGE_DOGS', 'HIGH_ENERGY', 'LOW_ENERGY', 'PUPPIES', 'SENIORS', 'SPECIAL_NEEDS');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "ContactMethod" AS ENUM ('EMAIL', 'SMS', 'BOTH', 'NONE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "PaymentMethod" AS ENUM ('CREDIT_CARD', 'DEBIT_CARD', 'CASH', 'CHECK', 'BANK_TRANSFER', 'STORE_CREDIT', 'GIFT_CARD');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED', 'REFUNDED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "ResourceType" AS ENUM ('KENNEL', 'RUN', 'SUITE', 'STANDARD_SUITE', 'STANDARD_PLUS_SUITE', 'VIP_SUITE', 'PLAY_AREA', 'OUTDOOR_PLAY_YARD', 'PRIVATE_PLAY_AREA', 'GROOMING_TABLE', 'BATHING_STATION', 'DRYING_STATION', 'TRAINING_ROOM', 'AGILITY_COURSE', 'GROOMER', 'TRAINER', 'ATTENDANT', 'BATHER', 'OTHER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "AvailabilityStatus" AS ENUM ('AVAILABLE', 'RESERVED', 'MAINTENANCE', 'OUT_OF_SERVICE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "TimeOffType" AS ENUM ('VACATION', 'SICK', 'PERSONAL', 'BEREAVEMENT', 'JURY_DUTY', 'OTHER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "TimeOffStatus" AS ENUM ('PENDING', 'APPROVED', 'DENIED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "ScheduleStatus" AS ENUM ('SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "ServiceCategory" AS ENUM ('DAYCARE', 'BOARDING', 'GROOMING', 'TRAINING', 'OTHER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "PriceRuleType" AS ENUM ('DAY_OF_WEEK', 'MULTI_DAY', 'MULTI_PET', 'SEASONAL', 'PROMOTIONAL', 'CUSTOM');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- DropTable
DROP TABLE "reservation_errors";

-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'dev',
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "alternatePhone" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "notes" TEXT,
    "portalEnabled" BOOLEAN NOT NULL DEFAULT true,
    "preferredContact" "ContactMethod" NOT NULL DEFAULT 'EMAIL',
    "emergencyContact" TEXT,
    "emergencyPhone" TEXT,
    "vatTaxId" TEXT,
    "referralSource" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pets" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'dev',
    "name" TEXT NOT NULL,
    "type" "PetType" NOT NULL,
    "breed" TEXT,
    "color" TEXT,
    "birthdate" TIMESTAMP(3),
    "weight" DOUBLE PRECISION,
    "gender" "Gender",
    "isNeutered" BOOLEAN NOT NULL DEFAULT false,
    "microchipNumber" TEXT,
    "rabiesTagNumber" TEXT,
    "specialNeeds" TEXT,
    "foodNotes" TEXT,
    "medicationNotes" TEXT,
    "behaviorNotes" TEXT,
    "allergies" TEXT,
    "idealPlayGroup" "PlayGroupType",
    "vaccinationStatus" JSONB,
    "vaccineExpirations" JSONB,
    "vetName" TEXT,
    "vetPhone" TEXT,
    "profilePhoto" TEXT,
    "petIcons" JSONB,
    "iconNotes" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastCheckIn" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "customerId" TEXT NOT NULL,

    CONSTRAINT "pets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservations" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'dev',
    "orderNumber" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "ReservationStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "staffNotes" TEXT,
    "checkInWindow" INTEGER,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurringPattern" TEXT,
    "preChecked" BOOLEAN NOT NULL DEFAULT false,
    "checkInDate" TIMESTAMP(3),
    "checkOutDate" TIMESTAMP(3),
    "earlyDropOff" BOOLEAN NOT NULL DEFAULT false,
    "latePickup" BOOLEAN NOT NULL DEFAULT false,
    "customPickupPerson" TEXT,
    "confirmedBy" TEXT,
    "cancelReason" TEXT,
    "cancelDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "customerId" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "resourceId" TEXT,
    "staffAssignedId" TEXT,

    CONSTRAINT "reservations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "services" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'dev',
    "name" TEXT NOT NULL,
    "description" TEXT,
    "duration" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "color" TEXT,
    "serviceCategory" "ServiceCategory" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "requiresStaff" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "capacityLimit" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "addon_services" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'dev',
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "duration" INTEGER,
    "serviceId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "addon_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservation_addons" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'dev',
    "reservationId" TEXT NOT NULL,
    "addOnId" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reservation_addons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resources" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'dev',
    "name" TEXT NOT NULL,
    "type" "ResourceType" NOT NULL,
    "description" TEXT,
    "capacity" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "attributes" JSONB,
    "availability" TEXT,
    "location" TEXT,
    "maintenanceSchedule" TEXT,
    "lastCleanedAt" TIMESTAMP(3),
    "maintenanceStatus" TEXT,
    "suiteNumber" INTEGER,

    CONSTRAINT "resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resource_availability" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'dev',
    "resourceId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "status" "AvailabilityStatus" NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resource_availability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'dev',
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "role" TEXT NOT NULL,
    "workSchedule" JSONB,
    "specialties" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "department" TEXT,
    "hireDate" TIMESTAMP(3),
    "lastLogin" TIMESTAMP(3),
    "password" TEXT NOT NULL,
    "position" TEXT,
    "resetToken" TEXT,
    "resetTokenExpiry" TIMESTAMP(3),
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,

    CONSTRAINT "staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_availability" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'dev',
    "staffId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "isRecurring" BOOLEAN NOT NULL DEFAULT true,
    "effectiveFrom" TIMESTAMP(3),
    "effectiveUntil" TIMESTAMP(3),
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_availability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_time_off" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'dev',
    "staffId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "type" "TimeOffType" NOT NULL,
    "status" "TimeOffStatus" NOT NULL DEFAULT 'PENDING',
    "reason" TEXT,
    "notes" TEXT,
    "approvedById" TEXT,
    "approvedDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_time_off_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_schedules" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'dev',
    "staffId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "status" "ScheduleStatus" NOT NULL DEFAULT 'SCHEDULED',
    "notes" TEXT,
    "location" TEXT,
    "startingLocation" TEXT,
    "role" TEXT,
    "createdById" TEXT,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'dev',
    "invoiceNumber" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "reservationId" TEXT,
    "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "subtotal" DOUBLE PRECISION NOT NULL,
    "taxRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_line_items" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'dev',
    "invoiceId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "taxable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoice_line_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'dev',
    "invoiceId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "transactionId" TEXT,
    "paymentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gatewayResponse" JSONB,
    "refundedAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "refundReason" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'dev',
    "customerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "uploaded" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_preferences" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'dev',
    "customerId" TEXT NOT NULL,
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "smsNotifications" BOOLEAN NOT NULL DEFAULT false,
    "pushNotifications" BOOLEAN NOT NULL DEFAULT false,
    "marketingEmails" BOOLEAN NOT NULL DEFAULT true,
    "appointmentReminders" BOOLEAN NOT NULL DEFAULT true,
    "checkinNotifications" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "check_ins" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'dev',
    "petId" TEXT NOT NULL,
    "reservationId" TEXT,
    "checkInTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checkOutTime" TIMESTAMP(3),
    "checkInNotes" TEXT,
    "checkOutNotes" TEXT,
    "checkInBy" TEXT,
    "checkOutBy" TEXT,
    "belongingsChecklist" JSONB,
    "foodProvided" BOOLEAN NOT NULL DEFAULT false,
    "medicationGiven" BOOLEAN NOT NULL DEFAULT false,
    "medicationNotes" TEXT,
    "behaviorDuringStay" TEXT,
    "photosTaken" BOOLEAN NOT NULL DEFAULT false,
    "photosShared" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "check_ins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activities" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'dev',
    "checkInId" TEXT NOT NULL,
    "activityType" TEXT NOT NULL,
    "notes" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recordedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medical_records" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'dev',
    "petId" TEXT NOT NULL,
    "recordType" TEXT NOT NULL,
    "recordDate" TIMESTAMP(3) NOT NULL,
    "expirationDate" TIMESTAMP(3),
    "description" TEXT NOT NULL,
    "veterinarian" TEXT,
    "fileUrl" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedBy" TEXT,
    "verifiedDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medical_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_rules" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'dev',
    "name" TEXT NOT NULL,
    "description" TEXT,
    "ruleType" "PriceRuleType" NOT NULL,
    "discountType" "DiscountType" NOT NULL,
    "discountValue" DOUBLE PRECISION NOT NULL,
    "minQuantity" INTEGER,
    "maxQuantity" INTEGER,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "daysOfWeek" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 10,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "price_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_rule_service_categories" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'dev',
    "priceRuleId" TEXT NOT NULL,
    "serviceCategory" "ServiceCategory" NOT NULL,

    CONSTRAINT "price_rule_service_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_rule_services" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL DEFAULT 'dev',
    "priceRuleId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,

    CONSTRAINT "price_rule_services_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "customers_name_search_idx" ON "customers"("firstName", "lastName");

-- CreateIndex
CREATE INDEX "customers_email_search_idx" ON "customers"("email");

-- CreateIndex
CREATE INDEX "customers_phone_search_idx" ON "customers"("phone");

-- CreateIndex
CREATE INDEX "customers_tenant_name_idx" ON "customers"("tenantId", "lastName", "firstName");

-- CreateIndex
CREATE INDEX "customers_tenant_email_idx" ON "customers"("tenantId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "customers_tenant_email_unique" ON "customers"("tenantId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "customers_tenant_id_unique" ON "customers"("tenantId", "id");

-- CreateIndex
CREATE INDEX "pets_customer_id_idx" ON "pets"("customerId");

-- CreateIndex
CREATE INDEX "pets_active_type_idx" ON "pets"("isActive", "type");

-- CreateIndex
CREATE INDEX "pets_last_checkin_idx" ON "pets"("lastCheckIn");

-- CreateIndex
CREATE INDEX "pets_tenant_customer_idx" ON "pets"("tenantId", "customerId");

-- CreateIndex
CREATE INDEX "reservations_date_range_idx" ON "reservations"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "reservations_status_date_idx" ON "reservations"("status", "startDate");

-- CreateIndex
CREATE INDEX "reservations_customer_status_idx" ON "reservations"("customerId", "status");

-- CreateIndex
CREATE INDEX "reservations_tenant_date_range_idx" ON "reservations"("tenantId", "startDate", "endDate");

-- CreateIndex
CREATE INDEX "reservations_tenant_status_date_idx" ON "reservations"("tenantId", "status", "startDate");

-- CreateIndex
CREATE INDEX "reservations_tenant_customer_status_idx" ON "reservations"("tenantId", "customerId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "reservations_tenant_order_unique" ON "reservations"("tenantId", "orderNumber");

-- CreateIndex
CREATE UNIQUE INDEX "reservations_tenant_id_unique" ON "reservations"("tenantId", "id");

-- CreateIndex
CREATE INDEX "services_tenant_active_idx" ON "services"("tenantId", "isActive");

-- CreateIndex
CREATE INDEX "services_tenant_name_idx" ON "services"("tenantId", "name");

-- CreateIndex
CREATE INDEX "addon_services_tenant_service_active_idx" ON "addon_services"("tenantId", "serviceId", "isActive");

-- CreateIndex
CREATE INDEX "reservation_addons_tenant_reservation_idx" ON "reservation_addons"("tenantId", "reservationId");

-- CreateIndex
CREATE INDEX "resources_tenant_type_active_idx" ON "resources"("tenantId", "type", "isActive");

-- CreateIndex
CREATE INDEX "resources_tenant_name_idx" ON "resources"("tenantId", "name");

-- CreateIndex
CREATE INDEX "resource_availability_tenant_range_idx" ON "resource_availability"("tenantId", "resourceId", "startTime", "endTime");

-- CreateIndex
CREATE INDEX "staff_tenant_active_idx" ON "staff"("tenantId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "staff_tenant_email_unique" ON "staff"("tenantId", "email");

-- CreateIndex
CREATE INDEX "staff_availability_staff_day_idx" ON "staff_availability"("staffId", "dayOfWeek");

-- CreateIndex
CREATE INDEX "staff_availability_day_status_idx" ON "staff_availability"("dayOfWeek", "isAvailable");

-- CreateIndex
CREATE INDEX "staff_availability_tenant_staff_day_idx" ON "staff_availability"("tenantId", "staffId", "dayOfWeek");

-- CreateIndex
CREATE INDEX "staff_time_off_staff_status_idx" ON "staff_time_off"("staffId", "status");

-- CreateIndex
CREATE INDEX "staff_time_off_date_range_idx" ON "staff_time_off"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "staff_time_off_tenant_staff_status_idx" ON "staff_time_off"("tenantId", "staffId", "status");

-- CreateIndex
CREATE INDEX "staff_schedules_staff_date_idx" ON "staff_schedules"("staffId", "date");

-- CreateIndex
CREATE INDEX "staff_schedules_date_status_idx" ON "staff_schedules"("date", "status");

-- CreateIndex
CREATE INDEX "staff_schedules_tenant_staff_date_idx" ON "staff_schedules"("tenantId", "staffId", "date");

-- CreateIndex
CREATE INDEX "invoices_tenant_customer_issue_idx" ON "invoices"("tenantId", "customerId", "issueDate");

-- CreateIndex
CREATE INDEX "invoices_tenant_status_issue_idx" ON "invoices"("tenantId", "status", "issueDate");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_tenant_number_unique" ON "invoices"("tenantId", "invoiceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_tenant_reservation_unique" ON "invoices"("tenantId", "reservationId");

-- CreateIndex
CREATE INDEX "invoice_line_items_tenant_invoice_idx" ON "invoice_line_items"("tenantId", "invoiceId");

-- CreateIndex
CREATE INDEX "payments_customer_date_idx" ON "payments"("customerId", "paymentDate");

-- CreateIndex
CREATE INDEX "payments_status_date_idx" ON "payments"("status", "paymentDate");

-- CreateIndex
CREATE INDEX "payments_tenant_customer_date_idx" ON "payments"("tenantId", "customerId", "paymentDate");

-- CreateIndex
CREATE INDEX "payments_tenant_status_date_idx" ON "payments"("tenantId", "status", "paymentDate");

-- CreateIndex
CREATE INDEX "documents_tenant_customer_idx" ON "documents"("tenantId", "customerId");

-- CreateIndex
CREATE UNIQUE INDEX "notification_preferences_tenant_customer_unique" ON "notification_preferences"("tenantId", "customerId");

-- CreateIndex
CREATE INDEX "check_ins_time_idx" ON "check_ins"("checkInTime");

-- CreateIndex
CREATE INDEX "check_ins_pet_time_idx" ON "check_ins"("petId", "checkInTime");

-- CreateIndex
CREATE INDEX "check_ins_tenant_pet_time_idx" ON "check_ins"("tenantId", "petId", "checkInTime");

-- CreateIndex
CREATE INDEX "activities_tenant_checkin_time_idx" ON "activities"("tenantId", "checkInId", "timestamp");

-- CreateIndex
CREATE INDEX "medical_records_tenant_pet_type_idx" ON "medical_records"("tenantId", "petId", "recordType");

-- CreateIndex
CREATE INDEX "price_rules_type_active_idx" ON "price_rules"("ruleType", "isActive");

-- CreateIndex
CREATE INDEX "price_rules_tenant_type_active_idx" ON "price_rules"("tenantId", "ruleType", "isActive");

-- CreateIndex
CREATE INDEX "price_rule_svc_cat_tenant_idx" ON "price_rule_service_categories"("tenantId", "priceRuleId", "serviceCategory");

-- CreateIndex
CREATE UNIQUE INDEX "price_rule_service_categories_priceRuleId_serviceCategory_key" ON "price_rule_service_categories"("priceRuleId", "serviceCategory");

-- CreateIndex
CREATE INDEX "price_rule_services_tenant_idx" ON "price_rule_services"("tenantId", "priceRuleId", "serviceId");

-- CreateIndex
CREATE UNIQUE INDEX "price_rule_services_priceRuleId_serviceId_key" ON "price_rule_services"("priceRuleId", "serviceId");

-- AddForeignKey
ALTER TABLE "pets" ADD CONSTRAINT "pets_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_petId_fkey" FOREIGN KEY ("petId") REFERENCES "pets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "resources"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_staffAssignedId_fkey" FOREIGN KEY ("staffAssignedId") REFERENCES "staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addon_services" ADD CONSTRAINT "addon_services_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation_addons" ADD CONSTRAINT "reservation_addons_addOnId_fkey" FOREIGN KEY ("addOnId") REFERENCES "addon_services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation_addons" ADD CONSTRAINT "reservation_addons_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "reservations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_availability" ADD CONSTRAINT "resource_availability_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "resources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_availability" ADD CONSTRAINT "staff_availability_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_time_off" ADD CONSTRAINT "staff_time_off_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_schedules" ADD CONSTRAINT "staff_schedules_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_tenantId_reservationId_fkey" FOREIGN KEY ("tenantId", "reservationId") REFERENCES "reservations"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_line_items" ADD CONSTRAINT "invoice_line_items_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_tenantId_customerId_fkey" FOREIGN KEY ("tenantId", "customerId") REFERENCES "customers"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "check_ins" ADD CONSTRAINT "check_ins_petId_fkey" FOREIGN KEY ("petId") REFERENCES "pets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "check_ins" ADD CONSTRAINT "check_ins_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "reservations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_checkInId_fkey" FOREIGN KEY ("checkInId") REFERENCES "check_ins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_petId_fkey" FOREIGN KEY ("petId") REFERENCES "pets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_rule_service_categories" ADD CONSTRAINT "price_rule_service_categories_priceRuleId_fkey" FOREIGN KEY ("priceRuleId") REFERENCES "price_rules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_rule_services" ADD CONSTRAINT "price_rule_services_priceRuleId_fkey" FOREIGN KEY ("priceRuleId") REFERENCES "price_rules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_rule_services" ADD CONSTRAINT "price_rule_services_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;
