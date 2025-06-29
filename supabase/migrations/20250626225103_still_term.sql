/*
  # Add analysis style column to dreams table

  1. Schema Changes
    - Add `analysis_style` TEXT column to dreams table
    - Set default value to 'general' for existing records
    - Add check constraint for valid analysis styles

  2. Security
    - No changes to RLS policies needed
    - Column inherits existing table permissions
*/

-- Add analysis_style column to dreams table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dreams' AND column_name = 'analysis_style'
  ) THEN
    ALTER TABLE dreams ADD COLUMN analysis_style TEXT DEFAULT 'general';
  END IF;
END $$;

-- Add check constraint for valid analysis styles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'dreams_analysis_style_check'
  ) THEN
    ALTER TABLE dreams ADD CONSTRAINT dreams_analysis_style_check 
    CHECK (analysis_style IN ('jungian', 'freudian', 'emotional', 'general'));
  END IF;
END $$;

-- Update existing records to have default style
UPDATE dreams 
SET analysis_style = 'general' 
WHERE analysis_style IS NULL;