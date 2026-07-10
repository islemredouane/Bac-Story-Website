-- Add weighted_averages JSONB column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS weighted_averages jsonb DEFAULT '{}'::jsonb;
