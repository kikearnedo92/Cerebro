-- Add access control columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS can_access_cerebro BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS can_access_nucleo BOOLEAN DEFAULT true;

-- Update existing users to have appropriate access
-- Super admins get access to both
UPDATE public.profiles 
SET can_access_cerebro = true, can_access_nucleo = true 
WHERE role_system = 'super_admin' OR is_super_admin = true;

-- Admins get access to both by default
UPDATE public.profiles 
SET can_access_cerebro = true, can_access_nucleo = true 
WHERE role_system = 'admin';

-- Regular users get access to Nucleo only by default
UPDATE public.profiles 
SET can_access_cerebro = false, can_access_nucleo = true 
WHERE role_system = 'user';

-- Add function to check if user can access specific product
CREATE OR REPLACE FUNCTION public.user_can_access_product(_user_id uuid, _product_name text)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
BEGIN
  -- Super admins can access everything
  IF EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = _user_id 
    AND (is_super_admin = true OR role_system = 'super_admin')
  ) THEN
    RETURN true;
  END IF;

  -- Check specific product access
  IF _product_name = 'cerebro' THEN
    RETURN EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = _user_id AND can_access_cerebro = true
    );
  ELSIF _product_name = 'nucleo' THEN
    RETURN EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = _user_id AND can_access_nucleo = true
    );
  END IF;

  RETURN false;
END;
$$;