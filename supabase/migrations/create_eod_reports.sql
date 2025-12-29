-- Create EOD (End of Day) Reports table
CREATE TABLE IF NOT EXISTS eod_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_role TEXT NOT NULL,
  calls_made INTEGER DEFAULT 0,
  appointments_set INTEGER DEFAULT 0,
  shows_expected INTEGER DEFAULT 0,
  follow_ups_scheduled INTEGER DEFAULT 0,
  wins TEXT,
  challenges TEXT,
  tomorrow_goals TEXT,
  notes TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on user_id and date for faster queries
CREATE INDEX IF NOT EXISTS idx_eod_reports_user_id ON eod_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_eod_reports_date ON eod_reports(date);
CREATE INDEX IF NOT EXISTS idx_eod_reports_user_date ON eod_reports(user_id, date);

-- Enable Row Level Security
ALTER TABLE eod_reports ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can view their own EOD reports
CREATE POLICY "Users can view own EOD reports" ON eod_reports
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own EOD reports
CREATE POLICY "Users can insert own EOD reports" ON eod_reports
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own EOD reports
CREATE POLICY "Users can update own EOD reports" ON eod_reports
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can view all EOD reports (you'll need to add a custom claim or role check)
-- For now, we'll use service role for admin access

-- Add comment to table
COMMENT ON TABLE eod_reports IS 'Stores end of day reports from closers and setters';
