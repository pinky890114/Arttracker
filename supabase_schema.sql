-- This script sets up the database table and security rules for the ArtTrack app.
-- To use it:
-- 1. Create a new project on supabase.com.
-- 2. Go to the "SQL Editor" section in your Supabase project dashboard.
-- 3. Click "+ New query" and paste the entire content of this file.
-- 4. Click "Run" to execute the script.

-- Step 1: Create the 'commissions' table.
-- We use quoted column names (e.g., "userId") to preserve the camelCase format,
-- which makes it easier to work with the data directly from our JavaScript code.
-- The 'id' is a UUID that Supabase will automatically generate for each new commission.
CREATE TABLE public.commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" TEXT NOT NULL,
  "artistId" TEXT NOT NULL,
  "clientName" TEXT NOT NULL,
  contact TEXT,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  price NUMERIC,
  status TEXT NOT NULL,
  "dateAdded" DATE NOT NULL,
  "lastUpdated" DATE NOT NULL,
  "thumbnailUrl" TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add comments to columns for clarity in the Supabase UI
COMMENT ON COLUMN public.commissions.id IS 'Primary key, unique identifier for each commission';
COMMENT ON COLUMN public.commissions."userId" IS 'Identifier for the artist (in a real app, this would be auth.uid())';
COMMENT ON COLUMN public.commissions."artistId" IS 'Public display name of the artist';
COMMENT ON COLUMN public.commissions."clientName" IS 'Name or ID of the client';
COMMENT ON COLUMN public.commissions.status IS 'Current status from the enum (e.g., ''草稿'')';


-- Step 2: Enable Row Level Security (RLS).
-- This is a crucial security step. By default, it blocks all access to your table.
-- We will then create specific policies to allow access.
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;


-- Step 3: Create security policies to define who can access what.
-- These policies are simple to start with and can be made more secure later
-- by implementing a full user authentication system.

-- POLICY 1: Allow public, read-only access to everyone.
-- This lets clients and visitors see the commission data without being logged in.
CREATE POLICY "Public commissions are viewable by everyone."
  ON public.commissions FOR SELECT
  USING ( true );

-- POLICY 2: Allow logged-in users to create new commissions.
-- Since our current "login" is just a name, we can't securely check if a user is the "owner".
-- For now, we allow any user with the anon key (i.e., any app user) to insert.
-- In a real app with user accounts, you would change `WITH CHECK ( true )` to
-- `WITH CHECK ( auth.uid() = "userId" )` for proper security.
CREATE POLICY "Users can insert commissions."
  ON public.commissions FOR INSERT
  WITH CHECK ( true );

-- POLICY 3: Allow users to update their own commissions.
-- Similar to the insert policy, this is permissive for now.
-- A real policy would be `USING ( auth.uid() = "userId" )`.
CREATE POLICY "Users can update their own commissions."
  ON public.commissions FOR UPDATE
  USING ( true );

-- POLICY 4: Allow users to delete their own commissions.
-- A real policy would be `USING ( auth.uid() = "userId" )`.
CREATE POLICY "Users can delete their own commissions."
  ON public.commissions FOR DELETE
  USING ( true );

-- After running this, your database is ready for the application!
-- You can go to "Table Editor" -> "commissions" to manually add some test data.
