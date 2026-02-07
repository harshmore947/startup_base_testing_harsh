-- Add role column to users table
ALTER TABLE public.users ADD COLUMN role text DEFAULT 'user';

-- Create security definer function to check admin role
CREATE OR REPLACE FUNCTION public.has_admin_role(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = _user_id AND role = 'admin'
  );
$$;

-- Create admin-only RLS policies for dashboard queries
CREATE POLICY "Admins can view all user data for dashboard" ON public.users
FOR SELECT USING (public.has_admin_role(auth.uid()));

CREATE POLICY "Admins can view all reports for dashboard" ON public.user_reports  
FOR SELECT USING (public.has_admin_role(auth.uid()));

-- Add audit logging for admin actions
CREATE POLICY "Admins can insert audit logs" ON public.audit_logs
FOR INSERT WITH CHECK (public.has_admin_role(auth.uid()));

-- Create index for better performance on role queries
CREATE INDEX idx_users_role ON public.users(role) WHERE role = 'admin';