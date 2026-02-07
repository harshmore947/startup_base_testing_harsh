-- Fix: check_user_research_eligibility should return completed reports too
-- Bug: Function only checked for status='pending', missing completed reports
-- Impact: Users with completed reports couldn't view them via /research-my-idea page

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
  -- Check for active OR completed research report
  -- Changed: Now includes both 'pending' AND 'Research Analysis Complete' status
  SELECT id, idea_title, status, created_at
  INTO v_active_report
  FROM user_reports
  WHERE user_id = p_user_id
    AND status IN ('pending', 'Research Analysis Complete')  -- ✅ FIXED: Include completed reports
    AND payment_status = 'paid'
  ORDER BY created_at DESC
  LIMIT 1;

  -- If has active OR completed report, return not eligible for NEW submission
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

-- Update function comment
COMMENT ON FUNCTION check_user_research_eligibility IS 'Checks if user can submit a new research request. Returns active/completed reports. Returns eligibility status and reason.';
