/*
  # Create dream-art storage bucket

  1. Storage
    - Create `dream-art` bucket for storing generated images
    - Set up RLS policies for secure access
    - Configure bucket settings for optimal performance

  2. Security
    - Enable RLS on storage bucket
    - Add policies for authenticated users to upload/read their images
    - Ensure proper access control
*/

-- Create the dream-art bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'dream-art',
  'dream-art',
  false,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Enable RLS on the bucket
UPDATE storage.buckets 
SET public = false 
WHERE id = 'dream-art';

-- Policy: Users can upload images to their own folder
CREATE POLICY "Users can upload dream art"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'dream-art' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can read their own images
CREATE POLICY "Users can read own dream art"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'dream-art' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can update their own images
CREATE POLICY "Users can update own dream art"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'dream-art' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can delete their own images
CREATE POLICY "Users can delete own dream art"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'dream-art' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Add image_url column to dreams table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dreams' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE dreams ADD COLUMN image_url TEXT;
  END IF;
END $$;

-- Create index for image_url column
CREATE INDEX IF NOT EXISTS idx_dreams_image_url ON dreams(image_url) WHERE image_url IS NOT NULL;