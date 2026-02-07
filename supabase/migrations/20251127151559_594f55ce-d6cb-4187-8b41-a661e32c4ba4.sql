-- Drop the admin_research_reports_with_payment view
-- This view exposes auth.users data and bypasses RLS
-- It is completely unused in the codebase (AdminUserReports.tsx queries user_reports directly)
DROP VIEW IF EXISTS public.admin_research_reports_with_payment;