-- Fix 1: Restrict waitlist SELECT to admins only
CREATE POLICY "Only admins can view waitlist"
ON public.waitlist
FOR SELECT
TO authenticated
USING (has_admin_role(auth.uid()));

-- Fix 2: Remove admin insert policy from audit_logs to prevent tampering
DROP POLICY IF EXISTS "Admins can insert audit logs" ON public.audit_logs;