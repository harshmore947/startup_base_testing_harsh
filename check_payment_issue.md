# Research Payment Diagnostic

## Payment Flow for "Research My Idea":

1. **store-research-request** Edge Function:
   - Creates `orders` record with `plan_type='research_single'`
   - Creates `pending_research_requests` record with same order_id
   - Order ID format: `ORD_RESEARCH_{timestamp}_{user_id_substr}`

2. **Payment on CCAvenue**

3. **ccavenue-response** Edge Function (on success):
   - Updates order status to 'success'
   - Looks up pending_research_request by order_id
   - Creates user_report from pending data
   - Deletes pending_research_request
   - Redirects to success page

## Possible Issues:

### Issue 1: pending_research_request not found
**Location**: ccavenue-response/index.ts:169-173
**Symptom**: Log shows "Failed to fetch pending research request"
**Cause**: Order ID mismatch or record not created

### Issue 2: user_report creation failed  
**Location**: ccavenue-response/index.ts:182-194
**Symptom**: Log shows "Failed to create user report"
**Cause**: Database constraint violation or missing fields

### Issue 3: Silent failure
**Location**: ccavenue-response/index.ts:175-177
**Symptom**: Continues to success even if pending request not found
**Problem**: Error is logged but user_report never created

## Diagnosis Steps:

1. Check Supabase Edge Function logs for ccavenue-response
2. Query orders table for your recent payment
3. Query pending_research_requests for matching order_id
4. Query user_reports to see if it was created
5. Check for any database errors

## Quick Fix Commands:

```sql
-- Find your recent order
SELECT * FROM orders 
WHERE user_id = 'YOUR_USER_ID' 
AND plan_type = 'research_single'
ORDER BY created_at DESC 
LIMIT 5;

-- Check if pending request exists
SELECT * FROM pending_research_requests
WHERE order_id = 'YOUR_ORDER_ID';

-- Check if user_report was created
SELECT * FROM user_reports
WHERE order_id = 'YOUR_ORDER_ID';
```
