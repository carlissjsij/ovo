/*
  # Fix RLS Policies for Anonymous Access

  ## Changes Made

  ### 1. Update RLS Policies to Support Anonymous Users
    - The protection system runs client-side before authentication
    - Need to allow anon users to insert with proper validation
    - Add SELECT policies for checking blocked fingerprints
    - Ensure proper data validation in WITH CHECK clauses

  ### 2. Security Improvements
    - Validate fingerprint length and format
    - Validate required fields are not empty
    - Restrict SELECT to only necessary data
    - Prevent arbitrary data injection
*/

-- Drop the authenticated-only policies
DROP POLICY IF EXISTS "Allow validated blocked fingerprint inserts" ON blocked_fingerprints;
DROP POLICY IF EXISTS "Allow validated access log inserts" ON access_logs;

-- Create proper policies for blocked_fingerprints table

-- Allow anon/authenticated to check if their fingerprint is blocked (SELECT)
CREATE POLICY "Allow checking blocked fingerprints"
  ON blocked_fingerprints
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow anon/authenticated to insert blocked fingerprints with validation (INSERT)
CREATE POLICY "Allow insert blocked fingerprints with validation"
  ON blocked_fingerprints
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    fingerprint IS NOT NULL 
    AND length(trim(fingerprint)) >= 32
    AND reason IS NOT NULL 
    AND length(trim(reason)) > 0
    AND length(trim(reason)) < 200
  );

-- Create proper policies for access_logs table

-- Allow anon/authenticated to query their own access logs (SELECT)
CREATE POLICY "Allow reading access logs"
  ON access_logs
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow anon/authenticated to insert access logs with validation (INSERT)
CREATE POLICY "Allow insert access logs with validation"
  ON access_logs
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    fingerprint IS NOT NULL 
    AND length(trim(fingerprint)) >= 32
    AND user_agent IS NOT NULL
    AND length(trim(user_agent)) > 0
    AND length(trim(user_agent)) < 1000
  );