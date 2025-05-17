-- AlterTable
ALTER TABLE "financial_transactions" ADD COLUMN     "invoiceLineItemId" TEXT;

-- AlterTable
ALTER TABLE "invoices" ALTER COLUMN "taxRate" SET DEFAULT 7.44;

-- AddForeignKey
ALTER TABLE "financial_transactions" ADD CONSTRAINT "financial_transactions_invoiceLineItemId_fkey" FOREIGN KEY ("invoiceLineItemId") REFERENCES "invoice_line_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;
