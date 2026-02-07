-- Test Research Payment Flow
-- Run these queries in Supabase SQL Editor to verify the fix

-- BEFORE TESTING: Check current state
SELECT 'Current Orders' as check_type, order_id, plan_type, status, created_at
FROM orders
WHERE user_id = '2920fa49-9761-498c-bb00-44a47606d837'
  AND plan_type = 'research_single'
ORDER BY created_at DESC
LIMIT 5;

SELECT 'Current Pending Requests' as check_type, order_id, idea_title, created_at
FROM pending_research_requests
WHERE user_id = '2920fa49-9761-498c-bb00-44a47606d837'
ORDER BY created_at DESC
LIMIT 5;

-- AFTER PAYMENT: Verify the fix worked
-- 1. Check if order ID has "RESEARCH" prefix
SELECT 'New Order (should have RESEARCH prefix)' as check_type,
       order_id,
       CASE
         WHEN order_id LIKE 'ORD_RESEARCH_%' THEN '✅ CORRECT FORMAT'
         ELSE '❌ WRONG FORMAT'
       END as format_check,
       plan_type,
       status,
       created_at
FROM orders
WHERE user_id = '2920fa49-9761-498c-bb00-44a47606d837'
  AND created_at > NOW() - INTERVAL '10 minutes'
ORDER BY created_at DESC
LIMIT 1;

-- 2. Check if pending_research_requests was created with matching order_id
SELECT 'Pending Request (should match order_id)' as check_type,
       order_id,
       idea_title,
       created_at
FROM pending_research_requests
WHERE user_id = '2920fa49-9761-498c-bb00-44a47606d837'
  AND created_at > NOW() - INTERVAL '10 minutes'
ORDER BY created_at DESC
LIMIT 1;

-- 3. After successful payment, check if user_report was created
SELECT 'User Report (should exist after payment)' as check_type,
       order_id,
       title,
       status,
       created_at
FROM user_reports
WHERE user_id = '2920fa49-9761-498c-bb00-44a47606d837'
  AND created_at > NOW() - INTERVAL '10 minutes'
ORDER BY created_at DESC
LIMIT 1;

-- 4. Verify no duplicate orders were created
SELECT 'Duplicate Check' as check_type,
       COUNT(*) as order_count,
       STRING_AGG(order_id, ', ') as order_ids
FROM orders
WHERE user_id = '2920fa49-9761-498c-bb00-44a47606d837'
  AND created_at > NOW() - INTERVAL '10 minutes';
