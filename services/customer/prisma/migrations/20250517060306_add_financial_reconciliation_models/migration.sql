-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('PAYMENT', 'REFUND', 'ADJUSTMENT', 'CREDIT', 'DEBIT', 'VOID', 'FEE', 'TAX', 'DISCOUNT');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'VOIDED', 'RECONCILED', 'DISPUTED');

-- CreateEnum
CREATE TYPE "LedgerEntryType" AS ENUM ('DEPOSIT', 'WITHDRAWAL', 'ADJUSTMENT', 'FEE', 'INTEREST', 'REFUND', 'PAYMENT');

-- CreateEnum
CREATE TYPE "ReconciliationType" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'MANUAL', 'SYSTEM');

-- CreateEnum
CREATE TYPE "ReconciliationStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'DISCREPANCIES_FOUND', 'VERIFIED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ReconciliationFrequency" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY');

-- CreateTable
CREATE TABLE "financial_transactions" (
    "id" TEXT NOT NULL,
    "transactionNumber" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "relatedAmount" DOUBLE PRECISION,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "paymentMethod" "PaymentMethod",
    "notes" TEXT,
    "metadata" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "customerId" TEXT,
    "invoiceId" TEXT,
    "paymentId" TEXT,
    "reservationId" TEXT,
    "createdById" TEXT,
    "processedById" TEXT,
    "processedAt" TIMESTAMP(3),
    "relatedTransactionId" TEXT,

    CONSTRAINT "financial_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaction_items" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "taxable" BOOLEAN NOT NULL DEFAULT true,
    "taxRate" DOUBLE PRECISION,
    "taxAmount" DOUBLE PRECISION,
    "discountAmount" DOUBLE PRECISION,
    "discountType" "DiscountType",
    "discountRuleId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "invoiceLineItemId" TEXT,
    "serviceId" TEXT,
    "addOnServiceId" TEXT,
    "reservationId" TEXT,

    CONSTRAINT "transaction_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_accounts" (
    "id" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "currentBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "availableBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastTransaction" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "financial_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ledger_entries" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "transactionId" TEXT,
    "entryType" "LedgerEntryType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "balanceAfter" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ledger_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_reconciliations" (
    "id" TEXT NOT NULL,
    "reconciliationDate" TIMESTAMP(3) NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "reconciliationType" "ReconciliationType" NOT NULL,
    "status" "ReconciliationStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "discrepancies" JSONB,
    "notes" TEXT,
    "performedById" TEXT,
    "verifiedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "financial_reconciliations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reconciliation_schedules" (
    "id" TEXT NOT NULL,
    "frequency" "ReconciliationFrequency" NOT NULL,
    "reconciliationType" "ReconciliationType" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastRun" TIMESTAMP(3),
    "nextRun" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reconciliation_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reconciliation_notifications" (
    "id" TEXT NOT NULL,
    "reconciliationId" TEXT NOT NULL,
    "notificationType" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "recipientIds" TEXT[],
    "readBy" TEXT[],
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reconciliation_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reconciliation_resolutions" (
    "id" TEXT NOT NULL,
    "reconciliationId" TEXT NOT NULL,
    "discrepancyIndex" INTEGER NOT NULL,
    "resolution" TEXT NOT NULL,
    "actionTaken" TEXT NOT NULL,
    "resolvedById" TEXT NOT NULL,
    "resolvedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reconciliation_resolutions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "financial_transactions_transactionNumber_key" ON "financial_transactions"("transactionNumber");

-- CreateIndex
CREATE INDEX "financial_transactions_type_status_idx" ON "financial_transactions"("type", "status");

-- CreateIndex
CREATE INDEX "financial_transactions_customer_date_idx" ON "financial_transactions"("customerId", "timestamp");

-- CreateIndex
CREATE INDEX "financial_transactions_invoice_idx" ON "financial_transactions"("invoiceId");

-- CreateIndex
CREATE INDEX "financial_transactions_number_idx" ON "financial_transactions"("transactionNumber");

-- CreateIndex
CREATE INDEX "transaction_items_transaction_idx" ON "transaction_items"("transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "financial_accounts_accountNumber_key" ON "financial_accounts"("accountNumber");

-- CreateIndex
CREATE INDEX "financial_accounts_customer_idx" ON "financial_accounts"("customerId");

-- CreateIndex
CREATE INDEX "ledger_entries_account_date_idx" ON "ledger_entries"("accountId", "timestamp");

-- CreateIndex
CREATE INDEX "financial_reconciliations_date_idx" ON "financial_reconciliations"("reconciliationDate");

-- CreateIndex
CREATE INDEX "financial_reconciliations_status_idx" ON "financial_reconciliations"("status");

-- AddForeignKey
ALTER TABLE "financial_transactions" ADD CONSTRAINT "financial_transactions_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_transactions" ADD CONSTRAINT "financial_transactions_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_transactions" ADD CONSTRAINT "financial_transactions_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_transactions" ADD CONSTRAINT "financial_transactions_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "reservations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_transactions" ADD CONSTRAINT "financial_transactions_relatedTransactionId_fkey" FOREIGN KEY ("relatedTransactionId") REFERENCES "financial_transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_items" ADD CONSTRAINT "transaction_items_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "financial_transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_accounts" ADD CONSTRAINT "financial_accounts_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "financial_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;