# CCAvenue Payment Integration - Setup Guide

## 🎉 What's Been Built

CCAvenue payment gateway has been fully integrated into your application. Here's what was created:

### Database Layer
- ✅ **Orders table** - Tracks all payment transactions
- ✅ **User subscription fields** - Added CCAvenue customer ID and subscription plan tracking
- ✅ **RLS policies** - Security policies to protect order data

### Backend (Supabase Edge Functions)
- ✅ **create-ccavenue-order** - Creates orders and generates encrypted payment requests
- ✅ **ccavenue-response** - Handles payment callbacks and updates user subscriptions
- ✅ **Encryption utilities** - AES-256 encryption/decryption for CCAvenue

### Frontend
- ✅ **Updated Pricing Page** - Shows real pricing (₹2,999/year) with CCAvenue integration
- ✅ **Payment Success Page** - Beautiful confirmation page with order details
- ✅ **Payment Failure Page** - Error handling with retry options
- ✅ **Payment Routes** - Integrated into App.tsx routing

---

## 📋 What You Need To Do Next

### Step 1: Add CCAvenue Credentials to Local Environment

1. **Copy .env.example to .env**:
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` and add your CCAvenue credentials**:
   ```env
   CCAVENUE_MERCHANT_ID=your_actual_merchant_id
   CCAVENUE_ACCESS_CODE=your_actual_access_code
   CCAVENUE_WORKING_KEY=your_actual_working_key
   ```

3. **Update the URLs for local testing**:
   ```env
   CCAVENUE_URL=https://test.ccavenue.com/transaction/transaction.do?command=initiateTransaction
   FRONTEND_URL=http://localhost:5173
   ```

   **Note:** For the redirect URL, you'll need to deploy first (see Step 3).

---

### Step 2: Run Database Migration

1. **Push the migration to Supabase**:
   ```bash
   npx supabase db push
   ```

   If you don't have Supabase CLI installed:
   ```bash
   npm install -g supabase
   npx supabase link --project-ref your-project-ref
   npx supabase db push
   ```

2. **Alternatively**, you can run the migration manually:
   - Go to Supabase Dashboard → SQL Editor
   - Copy contents of `supabase/migrations/20251126000000_create_ccavenue_orders.sql`
   - Paste and run

---

### Step 3: Deploy Edge Functions to Supabase

1. **Deploy the functions**:
   ```bash
   npx supabase functions deploy create-ccavenue-order
   npx supabase functions deploy ccavenue-response
   ```

2. **Add Environment Variables to Edge Functions**:
   - Go to Supabase Dashboard
   - Navigate to: **Edge Functions** → **Secrets**
   - Add these secrets:
     ```
     CCAVENUE_MERCHANT_ID = your_merchant_id
     CCAVENUE_ACCESS_CODE = your_access_code
     CCAVENUE_WORKING_KEY = your_working_key
     CCAVENUE_URL = https://test.ccavenue.com/transaction/transaction.do?command=initiateTransaction
     CCAVENUE_REDIRECT_URL = https://your-project.supabase.co/functions/v1/ccavenue-response
     CCAVENUE_CANCEL_URL = https://your-domain.vercel.app/payment/failure
     FRONTEND_URL = https://your-domain.vercel.app
     ```

   **Important:** Replace `your-project.supabase.co` and `your-domain.vercel.app` with your actual URLs.

---

### Step 4: Configure CCAvenue Dashboard

1. **Log in to CCAvenue Merchant Dashboard**

2. **Set Redirect URL**:
   - Go to: **Settings** → **Redirect URL**
   - Add: `https://your-project.supabase.co/functions/v1/ccavenue-response`
   - This is where CCAvenue will send payment responses

3. **Verify Discount Code**:
   - Check that "MAXVALUECUSTOMER" discount code is active
   - Should give ₹2,000 off (making ₹2,999 → ₹999)

---

### Step 5: Deploy to Vercel

1. **Push to GitHub** (already done):
   ```bash
   # Already pushed earlier
   ```

2. **Deploy on Vercel**:
   - Go to Vercel Dashboard
   - Deploy the latest commit
   - Add environment variables in Vercel:
     - No CCAvenue credentials needed in Vercel (they're in Supabase Edge Functions)
     - Just ensure your Supabase env vars are set

3. **Update CCAvenue URLs**:
   - Once deployed, update the `FRONTEND_URL` in Supabase Edge Functions secrets
   - Update `CCAVENUE_CANCEL_URL` with your Vercel domain

---

## 🧪 Testing the Integration

### Local Testing (Limited)

**Note:** Local testing is limited because CCAvenue needs a public callback URL. You can test the flow up to the point of CCAvenue redirect.

1. **Start dev server**:
   ```bash
   npm run dev
   ```

2. **Go to pricing page**:
   ```
   http://localhost:5173/pricing
   ```

3. **Click "Buy Premium"**:
   - Should create an order in database
   - Should redirect to CCAvenue test environment
   - ⚠️ Callback won't work locally (no public URL)

### Full Testing (After Deployment)

1. **Visit your production site**:
   ```
   https://your-domain.vercel.app/pricing
   ```

2. **Test the complete flow**:
   - Click "Buy Premium - ₹2,999/year"
   - You'll be redirected to CCAvenue
   - Use CCAvenue test card details (they'll provide these)
   - Apply discount code "MAXVALUECUSTOMER"
   - Complete payment
   - Should redirect back to your success page
   - Check that user is now premium

3. **Test failure scenario**:
   - Try with invalid card details
   - Should redirect to failure page

---

## 🔍 How to Verify Everything is Working

### Check Database
```sql
-- Check if orders table exists
SELECT * FROM orders LIMIT 1;

-- Check if user columns were added
SELECT ccavenue_customer_id, subscription_plan FROM users LIMIT 1;
```

### Check Edge Functions
```bash
# Test create order function
curl -X POST https://your-project.supabase.co/functions/v1/create-ccavenue-order \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"plan_type": "premium_annual"}'
```

### Check Frontend
- Go to `/pricing` - Should show ₹2,999/year
- Check browser console for any errors
- Button should say "Buy Premium - ₹2,999/year"

---

## 📊 Payment Flow Summary

```
User clicks "Buy Premium"
    ↓
Frontend calls Edge Function: create-ccavenue-order
    ↓
Edge Function:
  - Creates order in database (status: pending)
  - Encrypts payment data
  - Returns CCAvenue URL + encrypted request
    ↓
Frontend submits form to CCAvenue
    ↓
User redirected to CCAvenue payment page
    ↓
User enters card details and applies discount code "MAXVALUECUSTOMER"
    ↓
CCAvenue processes payment
    ↓
CCAvenue redirects to: /ccavenue-response (Edge Function)
    ↓
Edge Function:
  - Decrypts response
  - Updates order status
  - Updates user subscription_status = 'premium'
  - Sets subscription_end_date = now() + 1 year
    ↓
Redirects to /payment/success or /payment/failure
    ↓
User sees confirmation and can access premium features
```

---

## 🚨 Troubleshooting

### "Configuration missing" error
- Check that all Edge Function secrets are set in Supabase Dashboard

### "Failed to create order" error
- Check database migration ran successfully
- Check RLS policies allow service role to insert orders

### Payment successful but user not premium
- Check Edge Function logs in Supabase Dashboard
- Verify `ccavenue-response` function is deployed
- Check that redirect URL in CCAvenue dashboard matches your Edge Function URL

### CCAvenue shows "Merchant not found"
- Verify CCAVENUE_MERCHANT_ID is correct
- Verify CCAVENUE_ACCESS_CODE is correct

### Getting redirected back immediately
- Check that CCAVENUE_WORKING_KEY is correct
- Check encryption is working (look at Edge Function logs)

---

## 🎯 Production Checklist

Before going live:

- [ ] Update CCAVENUE_URL to production: `https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction`
- [ ] Update all URLs to use your production domain
- [ ] Test full payment flow on production
- [ ] Test with real payment method
- [ ] Verify premium features unlock after payment
- [ ] Test discount code "MAXVALUECUSTOMER"
- [ ] Set up monitoring for failed payments
- [ ] Document customer support process for payment issues

---

## 📞 Need Help?

If you encounter issues:
1. Check Edge Function logs in Supabase Dashboard
2. Check browser console for frontend errors
3. Verify all environment variables are set correctly
4. Check CCAvenue dashboard for transaction status
5. Review this guide step by step

---

## 🎉 You're All Set!

Once you complete the setup steps above, your CCAvenue payment integration will be fully functional. Users will be able to purchase premium memberships and your app will automatically grant them access upon successful payment.

Good luck with your launch! 🚀
