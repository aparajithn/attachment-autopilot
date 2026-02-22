-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  gmail_connected BOOLEAN DEFAULT FALSE,
  drive_connected BOOLEAN DEFAULT FALSE,
  subscription_tier TEXT DEFAULT 'free'
);

-- Email connections table
CREATE TABLE IF NOT EXISTS public.email_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('gmail', 'outlook')),
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expiry TIMESTAMP WITH TIME ZONE NOT NULL,
  last_synced TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Storage connections table
CREATE TABLE IF NOT EXISTS public.storage_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('gdrive', 'dropbox', 'onedrive')),
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expiry TIMESTAMP WITH TIME ZONE NOT NULL,
  root_folder_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Processed attachments table
CREATE TABLE IF NOT EXISTS public.processed_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  email_id TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  new_filename TEXT NOT NULL,
  doc_type TEXT NOT NULL,
  metadata JSONB,
  storage_url TEXT NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_email_connections_user_id ON public.email_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_storage_connections_user_id ON public.storage_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_processed_attachments_user_id ON public.processed_attachments(user_id);
CREATE INDEX IF NOT EXISTS idx_processed_attachments_processed_at ON public.processed_attachments(processed_at DESC);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storage_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processed_attachments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for email_connections
CREATE POLICY "Users can view own email connections" ON public.email_connections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own email connections" ON public.email_connections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own email connections" ON public.email_connections
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own email connections" ON public.email_connections
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for storage_connections
CREATE POLICY "Users can view own storage connections" ON public.storage_connections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own storage connections" ON public.storage_connections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own storage connections" ON public.storage_connections
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own storage connections" ON public.storage_connections
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for processed_attachments
CREATE POLICY "Users can view own processed attachments" ON public.processed_attachments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own processed attachments" ON public.processed_attachments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
