-- Add new fields to calls table for enhanced commission tracking

-- Sales platform (where the sale came from)
ALTER TABLE calls ADD COLUMN IF NOT EXISTS sales_platform TEXT;
COMMENT ON COLUMN calls.sales_platform IS 'Platform where sale originated: Elective, Whop, Fanbasis, etc.';

-- Payment method
ALTER TABLE calls ADD COLUMN IF NOT EXISTS payment_method TEXT;
COMMENT ON COLUMN calls.payment_method IS 'Payment type: Debit, Bank, Financing, etc.';

-- Commission override (allows manual adjustment per sale)
ALTER TABLE calls ADD COLUMN IF NOT EXISTS commission_override NUMERIC;
COMMENT ON COLUMN calls.commission_override IS 'Manual commission override amount for this specific sale';

-- Commission rate override (different % per sale if needed)
ALTER TABLE calls ADD COLUMN IF NOT EXISTS commission_rate_override NUMERIC;
COMMENT ON COLUMN calls.commission_rate_override IS 'Override commission percentage for this sale (e.g., 15.5 for 15.5%)';

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_calls_sales_platform ON calls(sales_platform);
CREATE INDEX IF NOT EXISTS idx_calls_payment_method ON calls(payment_method);

-- Update existing calls to have NULL values (no defaults, so we know what's been filled)
-- This is safe since we're adding new columns
