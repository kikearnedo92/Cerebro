
-- Fix infinite recursion in RLS policies by completely dropping and recreating them

-- Drop ALL existing policies that might cause recursion
DROP POLICY IF EXISTS "Allow profile select" ON profiles;
DROP POLICY IF EXISTS "Allow profile insert" ON profiles;
DROP POLICY IF EXISTS "Allow profile update" ON profiles;
DROP POLICY IF EXISTS "Users can view their profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Create simple, non-recursive policies for profiles
CREATE POLICY "Enable read access for own profile" ON profiles
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Enable read access for admins" ON profiles
  FOR SELECT 
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE email = 'eduardo@retorna.app'
    )
  );

CREATE POLICY "Enable update for own profile" ON profiles
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Enable insert for new profiles" ON profiles
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Verify the policies are created correctly
SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename = 'profiles' AND schemaname = 'public';
