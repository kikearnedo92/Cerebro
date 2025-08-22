-- Create profiles table for user management
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  area TEXT NOT NULL DEFAULT 'General',
  rol_empresa TEXT NOT NULL DEFAULT 'Usuario',
  role_system TEXT NOT NULL DEFAULT 'user',
  department TEXT,
  role TEXT DEFAULT 'user',
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  tenant_id UUID,
  is_super_admin BOOLEAN DEFAULT false,
  daily_query_limit INTEGER DEFAULT 50,
  queries_used_today INTEGER DEFAULT 0,
  last_query_reset DATE DEFAULT CURRENT_DATE,
  can_access_cerebro BOOLEAN DEFAULT false,
  can_access_nucleo BOOLEAN DEFAULT true
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Allow authenticated users to view profiles" 
ON public.profiles 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage own profile" 
ON public.profiles 
FOR ALL 
USING (auth.uid() = id OR auth.role() = 'authenticated');

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    user_role TEXT := 'user';
    is_admin BOOLEAN := FALSE;
    can_cerebro BOOLEAN := FALSE;
BEGIN
    -- Determine role based on email
    IF NEW.email = 'eduardo@retorna.app' OR NEW.email = 'eduardoarnedog@gmail.com' THEN
        user_role := 'super_admin';
        is_admin := TRUE;
        can_cerebro := TRUE;
    ELSIF NEW.email LIKE '%@retorna.app' THEN
        user_role := 'admin';
        is_admin := TRUE;
        can_cerebro := TRUE;
    END IF;

    INSERT INTO public.profiles (
        id, 
        email, 
        full_name,
        role_system,
        is_super_admin,
        daily_query_limit,
        can_access_cerebro
    )
    VALUES (
        NEW.id, 
        NEW.email, 
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        user_role,
        is_admin,
        CASE WHEN is_admin THEN 1000 ELSE 50 END,
        can_cerebro
    );
    
    RETURN NEW;
END;
$$;

-- Create trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert your profile manually since you're already a user
INSERT INTO public.profiles (
    id, 
    email, 
    full_name,
    role_system,
    is_super_admin,
    daily_query_limit,
    can_access_cerebro
) VALUES (
    '4c9db54f-b8ac-41c2-af18-e39a97fdb491',  -- Your user ID from the logs
    'eduardo@retorna.app',
    'Eduardo Arango',
    'super_admin',
    true,
    1000,
    true
) ON CONFLICT (id) DO UPDATE SET
    role_system = 'super_admin',
    is_super_admin = true,
    can_access_cerebro = true;