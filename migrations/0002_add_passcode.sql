-- Add passcode fields to cycle_settings table
ALTER TABLE cycle_settings ADD COLUMN passcode TEXT;
ALTER TABLE cycle_settings ADD COLUMN passcode_enabled INTEGER DEFAULT 0;
