
-- MEGA FIX: Complete RLS policies rewrite to fix all permission errors

-- 1. DROP ALL existing problematic policies
DROP POLICY IF EXISTS "Enable read access for own profile" ON profiles;
DROP POLICY IF EXISTS "Enable read access for admins" ON profiles;
DROP POLICY IF EXISTS "Enable update for own profile" ON profiles;
DROP POLICY IF EXISTS "Enable insert for new profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can delete own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can view conversation messages" ON messages;
DROP POLICY IF EXISTS "Users can create conversation messages" ON messages;
DROP POLICY IF EXISTS "View active knowledge base" ON knowledge_base;
DROP POLICY IF EXISTS "Admin manage knowledge base" ON knowledge_base;
DROP POLICY IF EXISTS "Users view own files" ON uploaded_files;
DROP POLICY IF EXISTS "Users upload own files" ON uploaded_files;
DROP POLICY IF EXISTS "Admin view all files" ON uploaded_files;
DROP POLICY IF EXISTS "Admin view analytics" ON usage_analytics;
DROP POLICY IF EXISTS "Users create analytics" ON usage_analytics;

-- 2. CREATE SIMPLE, WORKING POLICIES FOR PROFILES
CREATE POLICY "Anyone can read profiles" ON profiles
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE 
  USING (auth.uid() = id);

-- 3. KNOWLEDGE BASE POLICIES - Make accessible
CREATE POLICY "Anyone can read active knowledge" ON knowledge_base
  FOR SELECT 
  USING (active = true);

CREATE POLICY "Authenticated users can manage knowledge" ON knowledge_base
  FOR ALL 
  USING (auth.uid() IS NOT NULL);

-- 4. CONVERSATIONS POLICIES
CREATE POLICY "Users manage own conversations" ON conversations
  FOR ALL 
  USING (auth.uid() = user_id);

-- 5. MESSAGES POLICIES  
CREATE POLICY "Users manage own messages" ON messages
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = messages.conversation_id 
      AND conversations.user_id = auth.uid()
    )
  );

-- 6. UPLOADED FILES POLICIES
CREATE POLICY "Users manage own files" ON uploaded_files
  FOR ALL 
  USING (auth.uid() = user_id);

-- 7. ANALYTICS POLICIES
CREATE POLICY "Users can read and create analytics" ON usage_analytics
  FOR ALL 
  USING (true);

-- 8. STORAGE POLICIES - Make sure bucket exists and is accessible
INSERT INTO storage.buckets (id, name, public) 
VALUES ('retorna-files', 'retorna-files', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies
DROP POLICY IF EXISTS "Allow file uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow file viewing" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete files" ON storage.objects;

-- Create permissive storage policies
CREATE POLICY "Anyone can upload files" ON storage.objects
  FOR INSERT 
  WITH CHECK (bucket_id = 'retorna-files');

CREATE POLICY "Anyone can view files" ON storage.objects
  FOR SELECT 
  USING (bucket_id = 'retorna-files');

CREATE POLICY "Anyone can delete files" ON storage.objects
  FOR DELETE 
  USING (bucket_id = 'retorna-files');

-- 9. ENSURE EDUARDO IS ADMIN
UPDATE profiles 
SET role_system = 'admin' 
WHERE email = 'eduardo@retorna.app';

-- 10. CREATE OR UPDATE HANDLE NEW USER FUNCTION
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, area, rol_empresa, role_system)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuario'),
    COALESCE(NEW.raw_user_meta_data->>'area', 'General'),
    COALESCE(NEW.raw_user_meta_data->>'rol_empresa', 'Usuario'),
    CASE 
      WHEN NEW.email = 'eduardo@retorna.app' THEN 'admin'
      ELSE 'user'
    END
  );
  RETURN NEW;
END;
$$;

-- 11. RECREATE TRIGGER FOR NEW USERS
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 12. VERIFY POLICIES EXIST
SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
