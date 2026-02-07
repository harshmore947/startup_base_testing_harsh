-- URGENT: Manual setup email for sunilbv84@gmail.com
-- Run this in Supabase SQL Editor

-- Step 1: Find the user ID
SELECT id, email, account_status, subscription_status
FROM users
WHERE email = 'sunilbv84@gmail.com';

-- Step 2: Check if they have any setup tokens
SELECT *
FROM account_setup_tokens
WHERE email = 'sunilbv84@gmail.com'
ORDER BY created_at DESC;

-- Step 3: Create a new setup token (valid for 72 hours for urgency)
-- Replace USER_ID_HERE with the actual user ID from Step 1
INSERT INTO account_setup_tokens (user_id, token, email, expires_at, used)
VALUES (
  'USER_ID_HERE',  -- Replace with actual user ID
  encode(gen_random_bytes(54), 'hex'),  -- Generates 72-char token
  'sunilbv84@gmail.com',
  NOW() + INTERVAL '72 hours',
  false
)
RETURNING token;

-- Step 4: Copy the token from the result and use it to create setup link:
-- https://startupbase.co.in/account-setup?token=TOKEN_HERE
