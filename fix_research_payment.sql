-- Check if there's an order with RESEARCH prefix (the correct one)
SELECT * FROM orders
WHERE order_id LIKE 'ORD_RESEARCH%'
AND created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;

-- Check all your recent orders
SELECT order_id, plan_type, status, created_at
FROM orders
WHERE user_id = '2920fa49-9761-498c-bb00-44a47606d837'
ORDER BY created_at DESC
LIMIT 10;

-- Check all pending research requests
SELECT * FROM pending_research_requests
WHERE user_id = '2920fa49-9761-498c-bb00-44a47606d837'
ORDER BY created_at DESC;
