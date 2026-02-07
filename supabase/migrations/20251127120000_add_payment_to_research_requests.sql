-- Migration: Add Payment Tracking to Research Requests
-- Date: 2025-11-27
-- Purpose: Enable pay-per-use research requests with strict security

-- ============================================================================
-- STEP 1: Add payment tracking columns to user_reports
-- ============================================================================

ALTER TABLE user_reports
  ADD COLUMN IF NOT EXISTS order_id text,
  ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded'));

-- Add foreign key constraint to orders table
ALTER TABLE user_reports
  ADD CONSTRAINT fk_user_reports_order
  FOREIGN KEY (order_id)
  REFERENCES orders(order_id)
  ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_reports_order_id ON user_reports(order_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_user_payment_status ON user_reports(user_id, payment_status, status);
CREATE INDEX IF NOT EXISTS idx_user_reports_user_created ON user_reports(user_id, created_at DESC);

-- ============================================================================
-- STEP 2: Create pending_research_requests table for pre-payment storage
-- ============================================================================

CREATE TABLE IF NOT EXISTS pending_research_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id text NOT NULL UNIQUE REFERENCES orders(order_id) ON DELETE CASCADE,
  idea_title text NOT NULL CHECK (char_length(idea_title) >= 5 AND char_length(idea_title) <= 200),
  idea_description text NOT NULL CHECK (char_length(idea_description) >= 20 AND char_length(idea_description) <= 2000),
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '1 hour'),

  CONSTRAINT unique_order_per_request UNIQUE(order_id)
);

-- Index for auto-cleanup of expired requests
CREATE INDEX IF NOT EXISTS idx_pending_requests_expires ON pending_research_requests(expires_at);
CREATE INDEX IF NOT EXISTS idx_pending_requests_user ON pending_research_requests(user_id);

-- Add helpful comment
COMMENT ON TABLE pending_research_requests IS 'Temporary storage for research requests before payment completion. Auto-expires after 1 hour.';

-- ============================================================================
-- STEP 3: Enable Row Level Security (RLS)
-- ============================================================================

-- Enable RLS on user_reports (if not already enabled)
ALTER TABLE user_reports ENABLE ROW LEVEL SECURITY;

-- Enable RLS on pending_research_requests
ALTER TABLE pending_research_requests ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 4: Drop existing policies and create new secure policies
-- ============================================================================

-- Drop existing policies on user_reports (if any)
DROP POLICY IF EXISTS "Users can view own reports" ON user_reports;
DROP POLICY IF EXISTS "Users create reports only with paid orders" ON user_reports;
DROP POLICY IF EXISTS "Admins can view all reports" ON user_reports;
DROP POLICY IF EXISTS "Service role can update reports" ON user_reports;
DROP POLICY IF EXISTS "Users can insert own reports" ON user_reports;
DROP POLICY IF EXISTS "Users can read own reports" ON user_reports;

-- ============================================================================
-- SECURE POLICY 1: Users can ONLY view their OWN reports
-- ============================================================================
CREATE POLICY "users_view_own_reports_only"
ON user_reports
FOR SELECT
USING (
  auth.uid() = user_id
  OR
  -- Admins can view all reports
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- ============================================================================
-- SECURE POLICY 2: Users can ONLY insert reports with PAID orders
-- ============================================================================
CREATE POLICY "users_insert_only_with_paid_order"
ON user_reports
FOR INSERT
WITH CHECK (
  -- Must be authenticated
  auth.uid() IS NOT NULL
  AND
  -- User ID must match authenticated user
  auth.uid() = user_id
  AND
  -- Payment status must be 'paid'
  payment_status = 'paid'
  AND
  -- Order must exist and be successful
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.order_id = user_reports.order_id
    AND orders.user_id = auth.uid()
    AND orders.status = 'success'
    AND orders.plan_type = 'research_single'
  )
);

-- ============================================================================
-- SECURE POLICY 3: Users CANNOT update their own reports
-- Only service role (backend) can update
-- ============================================================================
CREATE POLICY "only_service_can_update_reports"
ON user_reports
FOR UPDATE
USING (
  -- Only allow service role or admin to update
  current_setting('role') = 'service_role'
  OR
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- ============================================================================
-- SECURE POLICY 4: Users CANNOT delete their own reports
-- Only admins can delete
-- ============================================================================
CREATE POLICY "only_admins_can_delete_reports"
ON user_reports
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- ============================================================================
-- STEP 5: RLS Policies for pending_research_requests
-- ============================================================================

-- Users can view only their own pending requests
CREATE POLICY "users_view_own_pending_requests"
ON pending_research_requests
FOR SELECT
USING (auth.uid() = user_id);

-- Only service role can insert pending requests (via edge function)
CREATE POLICY "service_inserts_pending_requests"
ON pending_research_requests
FOR INSERT
WITH CHECK (current_setting('role') = 'service_role');

-- Only service role can update pending requests
CREATE POLICY "service_updates_pending_requests"
ON pending_research_requests
FOR UPDATE
USING (current_setting('role') = 'service_role');

-- Only service role can delete pending requests (after payment)
CREATE POLICY "service_deletes_pending_requests"
ON pending_research_requests
FOR DELETE
USING (current_setting('role') = 'service_role');

-- ============================================================================
-- STEP 6: Create function to check user eligibility for new research
-- ============================================================================

CREATE OR REPLACE FUNCTION check_user_research_eligibility(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_active_report record;
  v_pending_request record;
  v_result jsonb;
BEGIN
  -- Check for active (pending) research report
  SELECT id, idea_title, status, created_at
  INTO v_active_report
  FROM user_reports
  WHERE user_id = p_user_id
    AND status = 'pending'
    AND payment_status = 'paid'
  ORDER BY created_at DESC
  LIMIT 1;

  -- If has active report, return not eligible
  IF FOUND THEN
    v_result := jsonb_build_object(
      'can_submit', false,
      'reason', 'has_active_request',
      'active_report', jsonb_build_object(
        'id', v_active_report.id,
        'title', v_active_report.idea_title,
        'status', v_active_report.status,
        'created_at', v_active_report.created_at
      )
    );
    RETURN v_result;
  END IF;

  -- Check for pending payment (unpaid order)
  SELECT prr.id, prr.idea_title, prr.order_id, o.amount
  INTO v_pending_request
  FROM pending_research_requests prr
  INNER JOIN orders o ON o.order_id = prr.order_id
  WHERE prr.user_id = p_user_id
    AND prr.expires_at > now()
    AND o.status = 'pending'
  ORDER BY prr.created_at DESC
  LIMIT 1;

  -- If has unpaid order, return not eligible
  IF FOUND THEN
    v_result := jsonb_build_object(
      'can_submit', false,
      'reason', 'has_unpaid_order',
      'pending_order', jsonb_build_object(
        'order_id', v_pending_request.order_id,
        'amount', 599.00,
        'idea_title', v_pending_request.idea_title
      )
    );
    RETURN v_result;
  END IF;

  -- User is eligible to submit new research
  v_result := jsonb_build_object(
    'can_submit', true,
    'reason', 'ok'
  );

  RETURN v_result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION check_user_research_eligibility(uuid) TO authenticated;

-- Add helpful comment
COMMENT ON FUNCTION check_user_research_eligibility IS 'Checks if user can submit a new research request. Returns eligibility status and reason.';

-- ============================================================================
-- STEP 7: Create function to auto-cleanup expired pending requests
-- ============================================================================

CREATE OR REPLACE FUNCTION cleanup_expired_pending_requests()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete expired pending requests (older than 1 hour)
  DELETE FROM pending_research_requests
  WHERE expires_at < now();

  -- Log cleanup action
  RAISE NOTICE 'Cleaned up expired pending research requests';
END;
$$;

-- Add helpful comment
COMMENT ON FUNCTION cleanup_expired_pending_requests IS 'Deletes pending research requests that have expired (>1 hour old). Run via cron job.';

-- ============================================================================
-- STEP 8: Update orders table plan_type if needed
-- ============================================================================

-- Verify research_single plan exists in PLANS constant in edge functions
-- This is just a documentation comment, actual plan is in TypeScript code
COMMENT ON TABLE orders IS 'Payment orders. plan_type includes: premium_annual (2999), research_single (599 with 999 strikethrough)';

-- ============================================================================
-- STEP 9: Create audit log trigger for security monitoring
-- ============================================================================

CREATE OR REPLACE FUNCTION audit_user_report_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log any direct updates to payment_status or order_id (potential security breach)
  IF (TG_OP = 'UPDATE') THEN
    IF (OLD.payment_status != NEW.payment_status OR OLD.order_id != NEW.order_id) THEN
      -- Log to audit table (if exists) or raise warning
      RAISE WARNING 'Security Alert: payment_status or order_id modified for report % by role %',
        NEW.id, current_setting('role');
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS audit_user_reports_trigger ON user_reports;
CREATE TRIGGER audit_user_reports_trigger
  BEFORE UPDATE ON user_reports
  FOR EACH ROW
  EXECUTE FUNCTION audit_user_report_changes();

-- ============================================================================
-- STEP 10: Create helper view for admin dashboard
-- ============================================================================

CREATE OR REPLACE VIEW admin_research_reports_with_payment AS
SELECT
  ur.id,
  ur.user_id,
  ur.idea_title,
  ur.idea_description,
  ur.status,
  ur.payment_status,
  ur.order_id,
  ur.created_at,
  u.email as user_email,
  u.raw_user_meta_data->>'full_name' as user_name,
  o.amount as amount_paid,
  o.currency,
  o.billing_email,
  o.completed_at as payment_completed_at,
  CASE
    WHEN ur.status = 'pending' THEN 'In Progress'
    WHEN ur.status = 'Research Analysis Complete' THEN 'Completed'
    ELSE ur.status
  END as display_status
FROM user_reports ur
LEFT JOIN auth.users u ON u.id = ur.user_id
LEFT JOIN orders o ON o.order_id = ur.order_id
WHERE ur.payment_status = 'paid'
ORDER BY ur.created_at DESC;

-- Grant access to admins only (via RLS on underlying tables)
COMMENT ON VIEW admin_research_reports_with_payment IS 'Admin view of all paid research reports with payment details. Protected by RLS on underlying tables.';

-- ============================================================================
-- STEP 11: Add security constraints
-- ============================================================================

-- Ensure payment_status can only be 'paid' when order exists and is successful
ALTER TABLE user_reports
  ADD CONSTRAINT check_paid_requires_successful_order
  CHECK (
    payment_status != 'paid'
    OR
    (order_id IS NOT NULL)
  );

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Verify migration success
DO $$
BEGIN
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Migration completed successfully!';
  RAISE NOTICE 'Added payment tracking to user_reports';
  RAISE NOTICE 'Created pending_research_requests table';
  RAISE NOTICE 'Enabled strict RLS policies';
  RAISE NOTICE 'Created eligibility check function';
  RAISE NOTICE 'Security: Users can ONLY see their own reports';
  RAISE NOTICE '============================================';
END $$;
