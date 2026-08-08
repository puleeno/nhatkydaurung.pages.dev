-- Initial schema for period tracking app

-- Users table (for multi-user support in future)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Daily logs table
CREATE TABLE IF NOT EXISTS daily_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  date TEXT NOT NULL, -- YYYY-MM-DD
  is_period INTEGER DEFAULT 0,
  flow TEXT CHECK(flow IN ('none', 'light', 'medium', 'heavy', 'spotting')),
  moods TEXT, -- JSON array of MoodType
  symptoms TEXT, -- JSON array of SymptomType
  discharge TEXT CHECK(discharge IN ('dry', 'sticky', 'creamy', 'egg_white', 'watery', 'spotting')),
  bbt REAL, -- Body basal temperature in Celsius
  water_glasses INTEGER DEFAULT 0,
  intimate INTEGER DEFAULT 0,
  protected_intimate INTEGER DEFAULT 0,
  pill_taken INTEGER DEFAULT 0,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, date)
);

-- Period cycles table
CREATE TABLE IF NOT EXISTS period_cycles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  start_date TEXT NOT NULL, -- YYYY-MM-DD
  end_date TEXT NOT NULL, -- YYYY-MM-DD
  length_in_days INTEGER,
  cycle_length INTEGER, -- Total cycle length from this start to next start
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Cycle settings table
CREATE TABLE IF NOT EXISTS cycle_settings (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  average_cycle_length INTEGER DEFAULT 28,
  average_period_length INTEGER DEFAULT 5,
  luteal_phase_length INTEGER DEFAULT 14,
  reminder_enabled INTEGER DEFAULT 1,
  reminder_days_before INTEGER DEFAULT 2,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_daily_logs_user_date ON daily_logs(user_id, date);
CREATE INDEX IF NOT EXISTS idx_daily_logs_date ON daily_logs(date);
CREATE INDEX IF NOT EXISTS idx_period_cycles_user_start ON period_cycles(user_id, start_date);
CREATE INDEX IF NOT EXISTS idx_period_cycles_user_end ON period_cycles(user_id, end_date);
CREATE INDEX IF NOT EXISTS idx_cycle_settings_user ON cycle_settings(user_id);
