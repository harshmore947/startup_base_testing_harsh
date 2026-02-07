# Meta Conversion API Setup - Final Steps

## ✅ What's Been Done

1. ✅ Created Supabase Edge Function: `meta-conversion-api`
2. ✅ Deployed the function to your Supabase project
3. ✅ Updated payment success page to track Purchase events
4. ✅ Added helper functions for Meta tracking

---

## 🔧 Configuration Required

### Step 1: Add Meta Access Token to Supabase

1. Go to: https://supabase.com/dashboard/project/sevjezttvhkgxybgedto/settings/functions
2. Click on "Manage secrets" or "Environment variables"
3. Add a new secret:
   - **Name**: `META_ACCESS_TOKEN`
   - **Value**: `EAAWNwMeM4XcBQK6KhgBidsplZBHIi3Hxf2deZBiDaLJXnxNBw914JsvhaByiP7vKYi3rBjR1ZC0efXAwY6El8HKZBknVOs8ST5rSxH6AZCxv88wi4soiPwMMPKZCcalEzBcsF9POpVzZCaI9X0UUFaDZCSZCxoel26idcDeUVMt01x9sHH0br3za1d1jdTFtGLQZDZD`
4. Click "Save"

### Step 2: Redeploy Edge Functions (if needed)

After adding the secret, the Edge Function should automatically pick it up. If not, redeploy:

```bash
cd "/Users/manav/Desktop/claude's startupbase/idea-station-chronicles"
supabase functions deploy meta-conversion-api
```

---

## 📊 What Gets Tracked

### Purchase Events (Currently Implemented)

**When**: After successful payment (both subscription and research reports)
**Where**: `/payment/success` page
**Data Sent**:
- Event Name: `Purchase`
- Value: Actual amount paid (e.g., 2999 for premium, 599 for research)
- Currency: INR
- Content Name: "Premium Annual Subscription" or "Research Your Idea"
- Order ID: Unique order identifier
- User Email: Billing email (hashed for privacy)
- Facebook Browser ID (fbp cookie)
- Facebook Click ID (fbc cookie)
- User Agent, IP Address

---

## 🧪 Testing the Implementation

### Test with a Real Payment

1. Make a test payment (use CCAvenue test credentials)
2. Complete the payment flow
3. Land on the success page
4. Check browser console for: `📊 Tracking Meta event: Purchase`
5. Check Supabase Edge Function logs:
   - Go to: https://supabase.com/dashboard/project/sevjezttvhkgxybgedto/functions/meta-conversion-api
   - Click "Logs"
   - Look for: `✅ Meta Conversion API response`

### Verify in Meta Events Manager

1. Go to: https://business.facebook.com/events_manager2/
2. Select your Pixel ID: `1487427219199470`
3. Click on "Test Events" (for testing)
4. Or check "Events" to see real conversions
5. You should see "Purchase" events appearing within a few minutes

---

## 🔒 Security Features

1. **Email Hashing**: User emails are SHA-256 hashed before sending to Meta
2. **Non-blocking**: If tracking fails, payment flow continues normally
3. **Error Handling**: All tracking errors are logged but don't affect users
4. **Server-side**: Access token is never exposed to the client

---

## 📈 Expected Results

### What You'll See in Meta

- **Event Name**: Purchase
- **Event Source**: Server (Conversion API)
- **Value**: Actual purchase amount in INR
- **Deduplication**: If client-side pixel also fires, Meta will deduplicate automatically

### Benefits

1. **Better Attribution**: Track conversions even with ad blockers
2. **iOS 14+ Support**: Bypass browser privacy restrictions
3. **Accurate Data**: Server-side tracking is more reliable
4. **ROAS Optimization**: Meta can better optimize for conversions

---

## 🚀 Next Steps (Optional - Not Implemented Yet)

These can be added later if needed:

1. **InitiateCheckout**: Track when users click "Buy Premium"
2. **ViewContent**: Track when users view idea reports
3. **Lead**: Track when users sign up (free accounts)
4. **CompleteRegistration**: Track when users verify email

---

## 🐛 Troubleshooting

### If Tracking Doesn't Work

1. **Check Environment Variable**:
   - Go to Supabase Dashboard → Edge Functions → Secrets
   - Verify `META_ACCESS_TOKEN` is set correctly

2. **Check Edge Function Logs**:
   - Go to: https://supabase.com/dashboard/project/sevjezttvhkgxybgedto/functions/meta-conversion-api
   - Look for errors in logs

3. **Check Browser Console**:
   - Open DevTools → Console
   - Look for Meta tracking messages
   - Check for errors

4. **Verify Access Token**:
   - Token might have expired
   - Generate a new one from Meta Business Manager

### Common Errors

**Error**: "Meta Access Token not configured"
**Fix**: Add `META_ACCESS_TOKEN` to Supabase Edge Functions secrets

**Error**: "Meta API Error: Invalid OAuth access token"
**Fix**: Token expired - generate a new token from Meta

---

## 📝 Important Notes

- ⚠️ **NEVER** commit the access token to GitHub
- ⚠️ **ALWAYS** keep it in Supabase Edge Functions secrets
- ⚠️ Tokens expire - you may need to refresh periodically
- ✅ Current implementation is **non-breaking** - if Meta tracking fails, payment flow continues
- ✅ Tracking is **fire-and-forget** - doesn't slow down the user experience

---

## ✨ Files Modified

1. `supabase/functions/meta-conversion-api/index.ts` - New Edge Function
2. `src/lib/metaTracking.ts` - Helper functions
3. `src/pages/payment/Success.tsx` - Added purchase tracking

All changes are safe and won't break existing functionality!
