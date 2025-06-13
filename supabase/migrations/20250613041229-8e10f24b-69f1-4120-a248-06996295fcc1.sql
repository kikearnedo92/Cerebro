
-- Remove tenant system and fix all the broken functionality

-- 1. Drop tenant-related policies that are causing issues
DROP POLICY IF EXISTS "users_see_own_tenant" ON tenants;
DROP POLICY IF EXISTS "admins_manage_tenant" ON tenants;
DROP POLICY IF EXISTS "super_admin_full_access_tenants" ON tenants;

-- 2. Drop tenant switching function
DROP FUNCTION IF EXISTS public.switch_tenant_context(text);
DROP FUNCTION IF EXISTS public.get_all_tenants_for_super_admin();

-- 3. Remove tenant_id dependency from profiles (keep data but remove constraint)
ALTER TABLE profiles ALTER COLUMN tenant_id DROP NOT NULL;

-- 4. Fix RLS policies for knowledge_base to work without tenants
DROP POLICY IF EXISTS "Admins can manage knowledge base" ON knowledge_base;
DROP POLICY IF EXISTS "Users can view active knowledge base" ON knowledge_base;

CREATE POLICY "Admins can manage knowledge base" ON knowledge_base
  FOR ALL 
  USING (public.is_current_user_admin());

CREATE POLICY "Users can view active knowledge base" ON knowledge_base
  FOR SELECT 
  USING (active = true);

-- 5. Fix conversations policies
DROP POLICY IF EXISTS "Users can manage own conversations" ON conversations;
CREATE POLICY "Users can manage own conversations" ON conversations
  FOR ALL 
  USING (auth.uid() = user_id);

-- 6. Fix messages policies
DROP POLICY IF EXISTS "Users can manage messages in own conversations" ON messages;
CREATE POLICY "Users can manage messages in own conversations" ON messages
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = messages.conversation_id 
      AND conversations.user_id = auth.uid()
    )
  );

-- 7. Disable RLS on tenants table (keep it but don't use it)
ALTER TABLE tenants DISABLE ROW LEVEL SECURITY;
