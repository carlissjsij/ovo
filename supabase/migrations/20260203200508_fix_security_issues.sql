/*
  # Fix Security Issues

  ## Changes Made

  ### 1. Remove Redundant/Unused Indexes
    - Drop `idx_blocked_fingerprints_fingerprint` (redundant with UNIQUE constraint)
    - Drop `idx_blocked_fingerprints_last_attempt` (not used in queries)
    - Drop `idx_access_logs_fingerprint` (not frequently queried)
    - Drop `idx_access_logs_suspicious` (not used in current queries)
    - Drop `idx_access_logs_accessed_at` (not used in current queries)

  ### 2. Fix RLS Policies (Critical Security Fix)
    - Replace unrestricted INSERT policies with proper validation
    - Ensure fingerprint and reason are not empty
    - Validate data structure before allowing inserts
    - Restrict to authenticated users only for better security

  ### 3. Fix Function Search Path
    - Set stable search_path on `update_block_count` function to prevent SQL injection

  ### 4. Auth DB Connection Strategy
    - NOTE: Auth DB connection strategy must be changed manually in Supabase Dashboard
    - Go to Project Settings > Database > Connection Pooling
    - Change from fixed number to percentage-based allocation
*/

-- 1. Drop redundant/unused indexes
DROP INDEX IF EXISTS idx_blocked_fingerprints_fingerprint;
DROP INDEX IF EXISTS idx_blocked_fingerprints_last_attempt;
DROP INDEX IF EXISTS idx_access_logs_fingerprint;
DROP INDEX IF EXISTS idx_access_logs_suspicious;
DROP INDEX IF EXISTS idx_access_logs_accessed_at;

-- 2. Drop existing insecure policies
DROP POLICY IF EXISTS "Allow insert blocked fingerprints" ON blocked_fingerprints;
DROP POLICY IF EXISTS "Allow insert access logs" ON access_logs;

-- 3. Create secure RLS policies with proper validation

-- Policy for blocked_fingerprints: Only allow inserts with valid data
CREATE POLICY "Allow validated blocked fingerprint inserts"
  ON blocked_fingerprints
  FOR INSERT
  TO authenticated
  WITH CHECK (
    fingerprint IS NOT NULL 
    AND length(trim(fingerprint)) > 10
    AND reason IS NOT NULL 
    AND length(trim(reason)) > 0
  );

-- Policy for access_logs: Only allow inserts with valid fingerprint data
CREATE POLICY "Allow validated access log inserts"
  ON access_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    fingerprint IS NOT NULL 
    AND length(trim(fingerprint)) > 10
    AND user_agent IS NOT NULL
    AND length(trim(user_agent)) > 0
  );

-- 4. Fix function search path to be immutable
CREATE OR REPLACE FUNCTION update_block_count()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE blocked_fingerprints
  SET 
    block_count = block_count + 1,
    last_attempt = now(),
    updated_at = now()
  WHERE fingerprint = NEW.fingerprint;
  
  RETURN NEW;
END;
$$;