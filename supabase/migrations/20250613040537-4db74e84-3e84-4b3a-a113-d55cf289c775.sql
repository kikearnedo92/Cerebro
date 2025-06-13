
-- Fix RLS policies without recreating existing ones

-- 1. Create security definer functions (skip if they exist)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT 
LANGUAGE SQL 
SECURITY DEFINER 
STABLE
AS $$
  SELECT role_system FROM profiles 
  WHERE id = auth.uid()
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN 
LANGUAGE SQL 
SECURITY DEFINER 
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND (role_system = 'admin' OR role_system = 'super_admin' OR is_super_admin = true)
  );
$$;

-- 2. Drop only the problematic policies that definitely exist
DROP POLICY IF EXISTS "Users can read and create analytics" ON usage_analytics;
DROP POLICY IF EXISTS "Anyone can read profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- 3. Create new safe policies
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles" ON profiles
  FOR SELECT 
  USING (public.is_current_user_admin());

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- 4. Fix analytics policies
CREATE POLICY "Users can view own analytics" ON usage_analytics
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own analytics" ON usage_analytics
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all analytics" ON usage_analytics
  FOR SELECT 
  USING (public.is_current_user_admin());
