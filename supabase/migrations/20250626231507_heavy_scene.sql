/*
  # Create shared_dreams table for dream sharing functionality

  1. New Tables
    - `shared_dreams`
      - `id` (uuid, primary key)
      - `dream_id` (uuid, foreign key to dreams table)
      - `share_token` (uuid, unique token for public access)
      - `created_at` (timestamp)
      - `expires_at` (timestamp, optional expiration)
      - `view_count` (integer, tracks views)

  2. Security
    - Enable RLS on `shared_dreams` table
    - Add policy for public access via share token
    - Add policy for dream owners to create shares
    - Add policy for dream owners to view their shares
    - Add policy for dream owners to delete their shares

  3. Indexes
    - Index on share_token for efficient lookups
    - Index on dream_id for efficient joins
*/

CREATE TABLE IF NOT EXISTS shared_dreams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dream_id uuid NOT NULL REFERENCES dreams(id) ON DELETE CASCADE,
  share_token uuid UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  view_count integer DEFAULT 0
);

ALTER TABLE shared_dreams ENABLE ROW LEVEL SECURITY;

-- Policy for public access via share token (anyone can read shared dreams)
CREATE POLICY "Public access via share token"
  ON shared_dreams
  FOR SELECT
  TO public
  USING (true);

-- Policy for dream owners to create shares
CREATE POLICY "Dream owners can create shares"
  ON shared_dreams
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM dreams 
      WHERE dreams.id = shared_dreams.dream_id 
      AND dreams.user_id = auth.uid()
    )
  );

-- Policy for dream owners to view their shares
CREATE POLICY "Dream owners can view their shares"
  ON shared_dreams
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dreams 
      WHERE dreams.id = shared_dreams.dream_id 
      AND dreams.user_id = auth.uid()
    )
  );

-- Policy for dream owners to update their shares (for view count)
CREATE POLICY "Dream owners can update their shares"
  ON shared_dreams
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dreams 
      WHERE dreams.id = shared_dreams.dream_id 
      AND dreams.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM dreams 
      WHERE dreams.id = shared_dreams.dream_id 
      AND dreams.user_id = auth.uid()
    )
  );

-- Policy for dream owners to delete their shares
CREATE POLICY "Dream owners can delete their shares"
  ON shared_dreams
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dreams 
      WHERE dreams.id = shared_dreams.dream_id 
      AND dreams.user_id = auth.uid()
    )
  );

-- Policy to allow public updates for view count increment
CREATE POLICY "Public can update view count"
  ON shared_dreams
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Index for efficient share token lookups
CREATE INDEX IF NOT EXISTS idx_shared_dreams_token ON shared_dreams(share_token);
CREATE INDEX IF NOT EXISTS idx_shared_dreams_dream_id ON shared_dreams(dream_id);
CREATE INDEX IF NOT EXISTS idx_shared_dreams_created_at ON shared_dreams(created_at DESC);