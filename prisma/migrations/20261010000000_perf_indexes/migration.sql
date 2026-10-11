-- Additive performance indexes (no data changes).
CREATE INDEX IF NOT EXISTS "Customer_userId_name_idx" ON "Customer"("userId", "name");
CREATE INDEX IF NOT EXISTS "Invoice_userId_issueDate_idx" ON "Invoice"("userId", "issueDate");
CREATE INDEX IF NOT EXISTS "Invoice_userId_status_issueDate_idx" ON "Invoice"("userId", "status", "issueDate");
CREATE INDEX IF NOT EXISTS "Receipt_userId_receiptDate_idx" ON "Receipt"("userId", "receiptDate");
CREATE INDEX IF NOT EXISTS "JournalLine_accountId_entryId_idx" ON "JournalLine"("accountId", "entryId");
CREATE INDEX IF NOT EXISTS "AuditLog_userId_timestamp_idx" ON "AuditLog"("userId", "timestamp");
