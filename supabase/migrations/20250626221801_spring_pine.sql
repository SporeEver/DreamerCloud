/*
  # Add Dream Analysis Support

  1. New Columns
    - `analysis` (text) - Stores AI-generated dream analysis
    - `analysis_created_at` (timestamptz) - Timestamp when analysis was created
  
  2. Security
    - Maintains existing RLS policies
    - Analysis data follows same access patterns as dream data
  
  3. Performance
    - Adds index for querying analyzed dreams
*/

-- Add analysis column to dreams table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dreams' AND column_name = 'analysis'
  ) THEN
    ALTER TABLE dreams ADD COLUMN analysis TEXT;
  END IF;
END $$;

-- Add timestamp for when analysis was created
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dreams' AND column_name = 'analysis_created_at'
  ) THEN
    ALTER TABLE dreams ADD COLUMN analysis_created_at TIMESTAMPTZ;
  END IF;
END $$;

-- Add index for better performance when querying analyzed dreams
CREATE INDEX IF NOT EXISTS idx_dreams_analysis ON dreams(analysis) WHERE analysis IS NOT NULL;

-- Add index for analysis timestamp
CREATE INDEX IF NOT EXISTS idx_dreams_analysis_created_at ON dreams(analysis_created_at) WHERE analysis_created_at IS NOT NULL;