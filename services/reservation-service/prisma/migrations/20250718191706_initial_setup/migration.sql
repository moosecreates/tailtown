-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('DRAFT', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED', 'NO_SHOW', 'COMPLETED', 'PENDING_PAYMENT', 'PARTIALLY_PAID');

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pet" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "breed" TEXT,
    "size" TEXT,
    "weight" DOUBLE PRECISION,
    "birthDate" TIMESTAMP(3),
    "notes" TEXT,
    "customerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "Pet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resource" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "capacity" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "Resource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reservation" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT,
    "customerId" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "resourceId" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "ReservationStatus" NOT NULL DEFAULT 'CONFIRMED',
    "suiteType" TEXT NOT NULL,
    "price" DOUBLE PRECISION,
    "deposit" DOUBLE PRECISION,
    "balance" DOUBLE PRECISION,
    "notes" TEXT,
    "staffNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AddOnService" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "duration" INTEGER,
    "serviceId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "AddOnService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReservationAddOn" (
    "id" TEXT NOT NULL,
    "reservationId" TEXT NOT NULL,
    "addOnId" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "ReservationAddOn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "duration" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Customer_organizationId_idx" ON "Customer"("organizationId");

-- CreateIndex
CREATE INDEX "Customer_organizationId_email_idx" ON "Customer"("organizationId", "email");

-- CreateIndex
CREATE INDEX "Customer_organizationId_lastName_firstName_idx" ON "Customer"("organizationId", "lastName", "firstName");

-- CreateIndex
CREATE INDEX "Pet_organizationId_idx" ON "Pet"("organizationId");

-- CreateIndex
CREATE INDEX "Pet_customerId_idx" ON "Pet"("customerId");

-- CreateIndex
CREATE INDEX "Pet_organizationId_customerId_idx" ON "Pet"("organizationId", "customerId");

-- CreateIndex
CREATE INDEX "Resource_organizationId_idx" ON "Resource"("organizationId");

-- CreateIndex
CREATE INDEX "Resource_organizationId_type_idx" ON "Resource"("organizationId", "type");

-- CreateIndex
CREATE INDEX "Resource_organizationId_isActive_idx" ON "Resource"("organizationId", "isActive");

-- CreateIndex
CREATE INDEX "Reservation_organizationId_idx" ON "Reservation"("organizationId");

-- CreateIndex
CREATE INDEX "Reservation_organizationId_startDate_endDate_idx" ON "Reservation"("organizationId", "startDate", "endDate");

-- CreateIndex
CREATE INDEX "Reservation_organizationId_status_idx" ON "Reservation"("organizationId", "status");

-- CreateIndex
CREATE INDEX "Reservation_customerId_idx" ON "Reservation"("customerId");

-- CreateIndex
CREATE INDEX "Reservation_petId_idx" ON "Reservation"("petId");

-- CreateIndex
CREATE INDEX "Reservation_resourceId_idx" ON "Reservation"("resourceId");

-- CreateIndex
CREATE INDEX "Reservation_organizationId_customerId_idx" ON "Reservation"("organizationId", "customerId");

-- CreateIndex
CREATE INDEX "Reservation_orderNumber_idx" ON "Reservation"("orderNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Reservation_orderNumber_organizationId_key" ON "Reservation"("orderNumber", "organizationId");

-- CreateIndex
CREATE INDEX "AddOnService_organizationId_idx" ON "AddOnService"("organizationId");

-- CreateIndex
CREATE INDEX "AddOnService_organizationId_isActive_idx" ON "AddOnService"("organizationId", "isActive");

-- CreateIndex
CREATE INDEX "AddOnService_serviceId_idx" ON "AddOnService"("serviceId");

-- CreateIndex
CREATE INDEX "ReservationAddOn_organizationId_idx" ON "ReservationAddOn"("organizationId");

-- CreateIndex
CREATE INDEX "ReservationAddOn_reservationId_idx" ON "ReservationAddOn"("reservationId");

-- CreateIndex
CREATE INDEX "ReservationAddOn_addOnId_idx" ON "ReservationAddOn"("addOnId");

-- CreateIndex
CREATE INDEX "Service_organizationId_idx" ON "Service"("organizationId");

-- CreateIndex
CREATE INDEX "Service_organizationId_isActive_idx" ON "Service"("organizationId", "isActive");

-- AddForeignKey
ALTER TABLE "Pet" ADD CONSTRAINT "Pet_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservationAddOn" ADD CONSTRAINT "ReservationAddOn_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservationAddOn" ADD CONSTRAINT "ReservationAddOn_addOnId_fkey" FOREIGN KEY ("addOnId") REFERENCES "AddOnService"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
