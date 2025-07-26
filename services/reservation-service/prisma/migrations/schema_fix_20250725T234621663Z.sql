-- Migration script generated on 2025-07-25T23:46:21.662Z

-- Creating missing tables
-- Create Reservation table
CREATE TABLE IF NOT EXISTS "Reservation" (
  "id" TEXT NOT NULL,
  "customerId" TEXT NOT NULL,
  "petId" TEXT NOT NULL,
  "startDate" TIMESTAMP NOT NULL,
  "endDate" TIMESTAMP NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'CONFIRMED',
  "organizationId" TEXT NOT NULL,
  "orderNumber" TEXT,
  "resourceId" TEXT,
  "suiteType" TEXT,
  "price" DOUBLE PRECISION,
  "deposit" DOUBLE PRECISION,
  "balance" DOUBLE PRECISION,
  "notes" TEXT,
  "staffNotes" TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP,

  CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);

-- Create Customer table
CREATE TABLE IF NOT EXISTS "Customer" (
  "id" TEXT NOT NULL,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "phone" TEXT,
  "address" TEXT,
  "city" TEXT,
  "state" TEXT,
  "zipCode" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP,

  CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- Create Pet table
CREATE TABLE IF NOT EXISTS "Pet" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "customerId" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "breed" TEXT,
  "size" TEXT,
  "weight" DOUBLE PRECISION,
  "birthDate" TIMESTAMP,
  "notes" TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP,

  CONSTRAINT "Pet_pkey" PRIMARY KEY ("id")
);

-- Create Resource table
CREATE TABLE IF NOT EXISTS "Resource" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "description" TEXT,
  "capacity" INTEGER DEFAULT 1,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP,

  CONSTRAINT "Resource_pkey" PRIMARY KEY ("id")
);

-- Create Service table
CREATE TABLE IF NOT EXISTS "Service" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "price" DOUBLE PRECISION NOT NULL,
  "duration" INTEGER,
  "isActive" BOOLEAN DEFAULT true,
  "organizationId" TEXT NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP,

  CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- Create AddOnService table
CREATE TABLE IF NOT EXISTS "AddOnService" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "price" DOUBLE PRECISION NOT NULL,
  "duration" INTEGER,
  "serviceId" TEXT NOT NULL,
  "isActive" BOOLEAN DEFAULT true,
  "organizationId" TEXT NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP,

  CONSTRAINT "AddOnService_pkey" PRIMARY KEY ("id")
);

-- Create ReservationAddOn table
CREATE TABLE IF NOT EXISTS "ReservationAddOn" (
  "id" TEXT NOT NULL,
  "reservationId" TEXT NOT NULL,
  "addOnId" TEXT NOT NULL,
  "price" DOUBLE PRECISION NOT NULL,
  "notes" TEXT,
  "organizationId" TEXT NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP,

  CONSTRAINT "ReservationAddOn_pkey" PRIMARY KEY ("id")
);

