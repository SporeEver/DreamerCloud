/*
  # Create dreams table with analysis features

  1. New Tables
    - `dreams`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `username` (text)
      - `user_avatar` (text, optional)
      - `title` (text)
      - `content` (text)
      - `mood` (text with check constraint)
      - `tags` (text array)
      - `is_public` (boolean, default true)
      - `likes` (integer, default 0)
      - `comments` (integer, default 0)
      - `ai_analysis` (text, optional)
      - `analysis` (text, optional)
      - `analysis_created_at` (timestamptz, optional)
      - `generated_image` (text, optional)
      - `image_prompt` (text, optional)
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `dreams` table
    - Add policies for authenticated users to manage their own dreams
    - Add policies for public dream viewing

  3. Indexes
    - Index on user_id for user's dreams
    - Index on is_public for public dreams
    - Index on created_at for chronological ordering
    - Index on analysis for analyzed dreams
    - Index on analysis_created_at for analysis timestamps
*/

-- Create dreams table if it doesn't exist
CREATE TABLE IF NOT EXISTS dreams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  username text NOT NULL,
  user_avatar text,
  title text NOT NULL,
  content text NOT NULL,
  mood text NOT NULL CHECK (mood IN ('peaceful', 'exciting', 'scary', 'strange', 'romantic', 'sad')),
  tags text[] DEFAULT '{}',
  is_public boolean DEFAULT true,
  likes integer DEFAULT 0,
  comments integer DEFAULT 0,
  ai_analysis text,
  analysis text,
  analysis_created_at timestamptz,
  generated_image text,
  image_prompt text,
  created_at timestamptz DEFAULT now()
);

-- Add analysis column if it doesn't exist (for existing tables)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'dreams') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'dreams' AND column_name = 'analysis'
    ) THEN
      ALTER TABLE dreams ADD COLUMN analysis TEXT;
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'dreams' AND column_name = 'analysis_created_at'
    ) THEN
      ALTER TABLE dreams ADD COLUMN analysis_created_at TIMESTAMPTZ;
    END IF;
  END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE dreams ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view public dreams
CREATE POLICY "Public dreams are viewable by everyone"
  ON dreams
  FOR SELECT
  USING (is_public = true);

-- Policy: Users can view their own dreams
CREATE POLICY "Users can view own dreams"
  ON dreams
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own dreams
CREATE POLICY "Users can insert own dreams"
  ON dreams
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own dreams
CREATE POLICY "Users can update own dreams"
  ON dreams
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own dreams
CREATE POLICY "Users can delete own dreams"
  ON dreams
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_dreams_user_id ON dreams(user_id);
CREATE INDEX IF NOT EXISTS idx_dreams_public ON dreams(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_dreams_created_at ON dreams(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dreams_mood ON dreams(mood);
CREATE INDEX IF NOT EXISTS idx_dreams_analysis ON dreams(analysis) WHERE analysis IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_dreams_analysis_created_at ON dreams(analysis_created_at) WHERE analysis_created_at IS NOT NULL;

-- Create index for full-text search on title and content
CREATE INDEX IF NOT EXISTS idx_dreams_search ON dreams USING gin(to_tsvector('english', title || ' ' || content));