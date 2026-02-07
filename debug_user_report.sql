-- Debug: Check why user is seeing payment page instead of completed report

-- 1. Check if you have any user_reports
SELECT
  'User Reports' as check_type,
  id,
  user_id,
  order_id,
  idea_title,
  status,
  created_at
FROM user_reports
WHERE user_id = '2920fa49-9761-498c-bb00-44a47606d837'
ORDER BY created_at DESC;

-- 2. Check what the eligibility function returns
SELECT * FROM check_user_research_eligibility('2920fa49-9761-498c-bb00-44a47606d837');

-- 3. Check if there are any pending requests
SELECT
  'Pending Requests' as check_type,
  id,
  user_id,
  order_id,
  idea_title,
  created_at
FROM pending_research_requests
WHERE user_id = '2920fa49-9761-498c-bb00-44a47606d837'
ORDER BY created_at DESC;

-- 4. Check all orders for this user
SELECT
  'Orders' as check_type,
  order_id,
  plan_type,
  status,
  created_at
FROM orders
WHERE user_id = '2920fa49-9761-498c-bb00-44a47606d837'
  AND plan_type = 'research_single'
ORDER BY created_at DESC;

-- 5. Check exact status value (might have extra spaces or different text)
SELECT
  'Status Check' as check_type,
  status,
  LENGTH(status) as status_length,
  status = 'Research Analysis Complete' as exact_match,
  CASE
    WHEN status LIKE '%Research%Analysis%Complete%' THEN 'Contains keywords'
    ELSE 'Different text'
  END as status_check
FROM user_reports
WHERE user_id = '2920fa49-9761-498c-bb00-44a47606d837';
