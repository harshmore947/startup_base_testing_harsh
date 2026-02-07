#!/usr/bin/env node

/**
 * Setup Verification Script
 * Run this to verify environment variables are properly configured
 */

console.log('🔍 Verifying Security Setup...\n');

// Check if running in Node or browser context
const isNode = typeof process !== 'undefined' && process.versions && process.versions.node;

if (isNode) {
  console.log('❌ This script should be run in the browser context.');
  console.log('📋 Instead, follow these steps:\n');
  console.log('1. Run: npm run dev');
  console.log('2. Open: http://localhost:8080');
  console.log('3. Open DevTools Console (F12)');
  console.log('4. Check for any errors about missing environment variables');
  console.log('5. Try to sign in/sign up to test Supabase connection\n');
  process.exit(0);
}

// Browser context checks
console.log('✅ Environment Variables Check:');
console.log('================================\n');

const requiredVars = {
  'VITE_SUPABASE_URL': import.meta.env?.VITE_SUPABASE_URL,
  'VITE_SUPABASE_PUBLISHABLE_KEY': import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY,
  'VITE_SUPABASE_PROJECT_ID': import.meta.env?.VITE_SUPABASE_PROJECT_ID,
};

let allPresent = true;

for (const [key, value] of Object.entries(requiredVars)) {
  if (value) {
    console.log(`✅ ${key}: ${value.substring(0, 20)}...`);
  } else {
    console.log(`❌ ${key}: MISSING`);
    allPresent = false;
  }
}

console.log('\n================================');

if (allPresent) {
  console.log('✅ All environment variables are properly configured!');
  console.log('✅ Supabase client should work correctly.');
} else {
  console.log('❌ Some environment variables are missing.');
  console.log('⚠️  Check your .env file in the project root.');
}

console.log('\n🧪 Testing Logger:');
console.log('================================');
console.log('In DEVELOPMENT mode, you should see logs below.');
console.log('In PRODUCTION build, you should see NO logs.\n');

// This will only show in development
if (import.meta.env.DEV) {
  console.log('✅ Running in DEVELOPMENT mode');
  console.log('✅ Logger will display debug information');
} else {
  console.log('✅ Running in PRODUCTION mode');
  console.log('✅ Logger is suppressing debug information');
}
