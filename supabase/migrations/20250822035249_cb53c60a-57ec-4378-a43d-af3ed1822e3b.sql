-- Insert Eduardo's profile with correct user ID
INSERT INTO public.profiles (
    id, 
    email, 
    full_name,
    area,
    rol_empresa,
    role_system,
    is_super_admin,
    daily_query_limit,
    can_access_cerebro
) VALUES (
    '4c9db54f-b8ac-41c2-af18-e39a97fdb491',  
    'eduardo@retorna.app',
    'Eduardo Arango',
    'Management',
    'Director',
    'super_admin',
    true,
    1000,
    true
) ON CONFLICT (id) DO UPDATE SET
    role_system = 'super_admin',
    is_super_admin = true,
    can_access_cerebro = true;