-- Maniac Garage D1 migration
-- Add editable user profile fields.

ALTER TABLE users ADD COLUMN bio TEXT;
