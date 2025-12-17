-- Create enum types
CREATE TYPE call_result AS ENUM (
  'Closed',
  'Follow-Up Scheduled',
  'No Show',
  'DQ',
  'Reschedule',
  'Other'
);

CREATE TYPE user_role AS ENUM ('closer', 'setter', 'admin');

-- Users table (for authentication and role management)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'closer',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Closers table
CREATE TABLE closers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  total_calls INTEGER DEFAULT 0,
  live_calls INTEGER DEFAULT 0,
  no_shows INTEGER DEFAULT 0,
  closed_deals INTEGER DEFAULT 0,
  offers_made INTEGER DEFAULT 0,
  total_revenue DECIMAL(12, 2) DEFAULT 0,
  total_cash_collected DECIMAL(12, 2) DEFAULT 0,
  total_commission DECIMAL(12, 2) DEFAULT 0,
  commission_rate DECIMAL(5, 2) DEFAULT 10.0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Setters table
CREATE TABLE setters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  total_calls_booked INTEGER DEFAULT 0,
  total_shows INTEGER DEFAULT 0,
  total_closes INTEGER DEFAULT 0,
  show_rate DECIMAL(5, 2) DEFAULT 0,
  close_rate DECIMAL(5, 2) DEFAULT 0,
  total_revenue_generated DECIMAL(12, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Calls table (main data)
CREATE TABLE calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ,
  booking_date DATE,
  lead_name TEXT,
  lead_phone TEXT,
  lead_email TEXT,
  offer_made BOOLEAN DEFAULT FALSE,
  result call_result,
  closer_id UUID REFERENCES closers(id) ON DELETE SET NULL,
  closer_name TEXT NOT NULL,
  revenue DECIMAL(12, 2) DEFAULT 0,
  cash_collected DECIMAL(12, 2) DEFAULT 0,
  cash_collected_2 DECIMAL(12, 2) DEFAULT 0,
  lead_source TEXT,
  medium TEXT,
  campaign TEXT,
  call_recording_link TEXT,
  setter_id UUID REFERENCES setters(id) ON DELETE SET NULL,
  setter_name TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_calls_closer_id ON calls(closer_id);
CREATE INDEX idx_calls_setter_id ON calls(setter_id);
CREATE INDEX idx_calls_booking_date ON calls(booking_date);
CREATE INDEX idx_calls_result ON calls(result);
CREATE INDEX idx_closers_name ON closers(name);
CREATE INDEX idx_setters_name ON setters(name);

-- Function to update closer stats
CREATE OR REPLACE FUNCTION update_closer_stats()
RETURNS TRIGGER AS $$
DECLARE
  affected_closer_id UUID;
BEGIN
  -- Determine which closer to update
  IF TG_OP = 'DELETE' THEN
    affected_closer_id := OLD.closer_id;
  ELSE
    affected_closer_id := NEW.closer_id;
  END IF;

  -- Skip if no closer is associated
  IF affected_closer_id IS NULL THEN
    IF TG_OP = 'DELETE' THEN
      RETURN OLD;
    ELSE
      RETURN NEW;
    END IF;
  END IF;

  UPDATE closers
  SET
    total_calls = (SELECT COUNT(*) FROM calls WHERE closer_id = affected_closer_id),
    live_calls = (SELECT COUNT(*) FROM calls WHERE closer_id = affected_closer_id AND result NOT IN ('No Show')),
    no_shows = (SELECT COUNT(*) FROM calls WHERE closer_id = affected_closer_id AND result = 'No Show'),
    closed_deals = (SELECT COUNT(*) FROM calls WHERE closer_id = affected_closer_id AND result = 'Closed'),
    offers_made = (SELECT COUNT(*) FROM calls WHERE closer_id = affected_closer_id AND offer_made = TRUE),
    total_revenue = (SELECT COALESCE(SUM(revenue), 0) FROM calls WHERE closer_id = affected_closer_id),
    total_cash_collected = (SELECT COALESCE(SUM(cash_collected + COALESCE(cash_collected_2, 0)), 0) FROM calls WHERE closer_id = affected_closer_id),
    total_commission = (SELECT COALESCE(SUM(cash_collected + COALESCE(cash_collected_2, 0)), 0) * commission_rate / 100 FROM calls WHERE closer_id = affected_closer_id),
    updated_at = NOW()
  WHERE id = affected_closer_id;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to update setter stats
CREATE OR REPLACE FUNCTION update_setter_stats()
RETURNS TRIGGER AS $$
DECLARE
  affected_setter_id UUID;
BEGIN
  -- Determine which setter to update
  IF TG_OP = 'DELETE' THEN
    affected_setter_id := OLD.setter_id;
  ELSE
    affected_setter_id := NEW.setter_id;
  END IF;

  -- Skip if no setter is associated
  IF affected_setter_id IS NULL THEN
    IF TG_OP = 'DELETE' THEN
      RETURN OLD;
    ELSE
      RETURN NEW;
    END IF;
  END IF;

  UPDATE setters
  SET
    total_calls_booked = (SELECT COUNT(*) FROM calls WHERE setter_id = affected_setter_id),
    total_shows = (SELECT COUNT(*) FROM calls WHERE setter_id = affected_setter_id AND result NOT IN ('No Show')),
    total_closes = (SELECT COUNT(*) FROM calls WHERE setter_id = affected_setter_id AND result = 'Closed'),
    show_rate = CASE
      WHEN (SELECT COUNT(*) FROM calls WHERE setter_id = affected_setter_id) > 0
      THEN (SELECT COUNT(*) FROM calls WHERE setter_id = affected_setter_id AND result NOT IN ('No Show'))::DECIMAL / (SELECT COUNT(*) FROM calls WHERE setter_id = affected_setter_id) * 100
      ELSE 0
    END,
    close_rate = CASE
      WHEN (SELECT COUNT(*) FROM calls WHERE setter_id = affected_setter_id) > 0
      THEN (SELECT COUNT(*) FROM calls WHERE setter_id = affected_setter_id AND result = 'Closed')::DECIMAL / (SELECT COUNT(*) FROM calls WHERE setter_id = affected_setter_id) * 100
      ELSE 0
    END,
    total_revenue_generated = (SELECT COALESCE(SUM(revenue), 0) FROM calls WHERE setter_id = affected_setter_id AND result = 'Closed'),
    updated_at = NOW()
  WHERE id = affected_setter_id;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Triggers to auto-update stats
CREATE TRIGGER trigger_update_closer_stats
AFTER INSERT OR UPDATE OR DELETE ON calls
FOR EACH ROW
EXECUTE FUNCTION update_closer_stats();

CREATE TRIGGER trigger_update_setter_stats
AFTER INSERT OR UPDATE OR DELETE ON calls
FOR EACH ROW
EXECUTE FUNCTION update_setter_stats();

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE closers ENABLE ROW LEVEL SECURITY;
ALTER TABLE setters ENABLE ROW LEVEL SECURITY;
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view their own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- RLS Policies for closers
CREATE POLICY "Closers can view all closers"
  ON closers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Public can view closers"
  ON closers FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Admins can manage closers"
  ON closers FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- RLS Policies for setters
CREATE POLICY "Setters can view all setters"
  ON setters FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Public can view setters"
  ON setters FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Admins can manage setters"
  ON setters FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- RLS Policies for calls
CREATE POLICY "Anyone can insert calls"
  ON calls FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can view all calls"
  ON calls FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Closers can update their own calls"
  ON calls FOR UPDATE
  TO authenticated
  USING (
    closer_id IN (
      SELECT id FROM closers
      WHERE closers.email = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY "Admins can manage all calls"
  ON calls FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );
