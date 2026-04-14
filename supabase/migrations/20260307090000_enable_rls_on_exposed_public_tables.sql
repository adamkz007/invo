-- Remediate Supabase linter 0013 (rls_disabled_in_public)
-- Enable RLS on public tables exposed through PostgREST.
DO $$
DECLARE
  table_name text;
  target_tables text[] := ARRAY[
    'pos_orders',
    'pos_order_items',
    'pos_settings',
    'pos_tables',
    'JournalEntry',
    'JournalLine',
    'TaxRate',
    'Account',
    'BankAccount',
    'BankTransaction',
    'Reconciliation',
    'Expense',
    'AuditLog',
    'invoice_payments',
    'einvoice_config',
    'einvoice_documents',
    'einvoice_events'
  ];
BEGIN
  FOREACH table_name IN ARRAY target_tables LOOP
    IF to_regclass(format('public.%I', table_name)) IS NOT NULL THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
    END IF;
  END LOOP;
END
$$;
