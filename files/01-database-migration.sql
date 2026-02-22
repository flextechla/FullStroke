-- =============================================================
-- RUN THIS IN SUPABASE SQL EDITOR
-- Adds: resolution_notes column + fixes status constraint
-- =============================================================

-- 1. Add resolution_notes to tickets table
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS resolution_notes TEXT;

-- 2. Make sure the status constraint matches your app
ALTER TABLE tickets DROP CONSTRAINT IF EXISTS tickets_status_check;
ALTER TABLE tickets ADD CONSTRAINT tickets_status_check
  CHECK (status = ANY (ARRAY[
    'intake',
    'diagnosing',
    'waiting_parts',
    'in_progress',
    'ready',
    'picked_up',
    'invoiced',
    'cancelled'
  ]));

-- 3. Make sure ticket_labor table exists (in case it doesn't yet)
CREATE TABLE IF NOT EXISTS ticket_labor (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  description TEXT,
  hours NUMERIC(10,2) DEFAULT 0,
  rate NUMERIC(10,2) DEFAULT 0,
  total_price NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Enable RLS on ticket_labor if not already
ALTER TABLE ticket_labor ENABLE ROW LEVEL SECURITY;

-- 5. RLS policy so authenticated users can manage labor rows
-- (adjust if you have workspace-based policies)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'ticket_labor' AND policyname = 'Users can manage ticket labor'
  ) THEN
    CREATE POLICY "Users can manage ticket labor" ON ticket_labor
      FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;
