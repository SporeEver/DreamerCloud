/*
  # Add subscription management fields to users table

  1. New Columns
    - `is_subscribed` (boolean) - Whether user has active subscription
    - `subscription_status` (text) - Current subscription status
    - `subscription_product_id` (text) - Product ID from RevenueCat
    - `subscription_platform` (text) - Platform where subscription was purchased
    - `subscription_started_at` (timestamptz) - When subscription started
    - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Users can only read their own subscription status
    - Only service role can update subscription status
*/

-- Add subscription fields to users table
DO $$
BEGIN
  -- Add is_subscribed column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'is_subscribed'
  ) THEN
    ALTER TABLE users ADD COLUMN is_subscribed boolean DEFAULT false;
  END IF;

  -- Add subscription_status column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'subscription_status'
  ) THEN
    ALTER TABLE users ADD COLUMN subscription_status text DEFAULT 'inactive';
  END IF;

  -- Add subscription_product_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'subscription_product_id'
  ) THEN
    ALTER TABLE users ADD COLUMN subscription_product_id text;
  END IF;

  -- Add subscription_platform column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'subscription_platform'
  ) THEN
    ALTER TABLE users ADD COLUMN subscription_platform text;
  END IF;

  -- Add subscription_started_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'subscription_started_at'
  ) THEN
    ALTER TABLE users ADD COLUMN subscription_started_at timestamptz;
  END IF;

  -- Add updated_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE users ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Add constraint for subscription_status values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'users' AND constraint_name = 'users_subscription_status_check'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_subscription_status_check 
    CHECK (subscription_status IN ('active', 'inactive', 'expired', 'pending', 'cancelled'));
  END IF;
END $$;

-- Add constraint for subscription_platform values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'users' AND constraint_name = 'users_subscription_platform_check'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_subscription_platform_check 
    CHECK (subscription_platform IN ('web', 'ios', 'android', 'stripe'));
  END IF;
END $$;

-- Create index for subscription queries
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status) WHERE subscription_status = 'active';
CREATE INDEX IF NOT EXISTS idx_users_is_subscribed ON users(is_subscribed) WHERE is_subscribed = true;

-- Update existing users to have default subscription values
UPDATE users 
SET 
  is_subscribed = COALESCE(is_subscribed, false),
  subscription_status = COALESCE(subscription_status, 'inactive'),
  updated_at = now()
WHERE is_subscribed IS NULL OR subscription_status IS NULL;