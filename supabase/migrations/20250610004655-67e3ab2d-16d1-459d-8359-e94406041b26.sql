
-- Create storage bucket for retorna files if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('retorna-files', 'retorna-files', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for retorna-files bucket
CREATE POLICY "Admins can upload files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'retorna-files' AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role_system = 'admin'
  )
);

CREATE POLICY "Admins can view files" ON storage.objects
FOR SELECT USING (
  bucket_id = 'retorna-files' AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role_system = 'admin'
  )
);

CREATE POLICY "Admins can delete files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'retorna-files' AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role_system = 'admin'
  )
);

CREATE POLICY "Users can view files" ON storage.objects
FOR SELECT USING (
  bucket_id = 'retorna-files' AND
  auth.uid() IS NOT NULL
);

-- Fix area constraint in profiles table
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_area_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_area_check 
CHECK (area IN ('ATC', 'Research', 'Onboarding', 'Data', 'Management', 'Otro', 'General'));

-- Add email sending log table
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT DEFAULT 'pending',
  error_message TEXT,
  created_by UUID REFERENCES profiles(id)
);

-- Enable RLS on email_logs
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view email logs" ON email_logs
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role_system = 'admin'
  )
);
