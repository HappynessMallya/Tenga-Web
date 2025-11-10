#!/usr/bin/env node

/**
 * Payment Issue Diagnostic and Fix Script
 *
 * This script helps identify and resolve common payment issues:
 * 1. Payments marked as completed in BongoPay but not locally
 * 2. Completed payments without associated orders
 * 3. Status mismatches between BongoPay and local database
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SERVICE_ROLE_KEY';

// Initialize Supabase client with service role key for admin operations
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  console.log('🔍 Starting Payment Issue Diagnosis...\n');

  try {
    // 1. Find payments that might have issues
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select(
        `
        *,
                orders!left (id, status, created_at)
       `
      )
      .in('status', [
        'PENDING',
        'pending',
        'COMPLETED',
        'completed',
        'FAILED',
        'failed',
        'CANCELLED',
        'cancelled',
      ])
      .order('created_at', { ascending: false })
      .limit(50);

    if (paymentsError) {
      throw paymentsError;
    }

    console.log(`Found ${payments.length} recent payments to check\n`);

    let issuesFound = 0;
    let issuesFixed = 0;

    for (const payment of payments) {
      console.log(`\n📋 Checking Payment: ${payment.id}`);
      console.log(`   Order ID: ${payment.order_id}`);
      console.log(`   Status: ${payment.status}`);
      console.log(`   Amount: ${payment.amount} TSH`);
      console.log(`   Created: ${payment.created_at}`);
      console.log(`   Has Order: ${payment.orders ? 'Yes' : 'No'}`);

      // Issue 1: Payment status inconsistency (uppercase vs lowercase - database expects lowercase)
      if (
        payment.status === 'COMPLETED' ||
        payment.status === 'PENDING' ||
        payment.status === 'FAILED' ||
        payment.status === 'CANCELLED'
      ) {
        console.log(
          `   ⚠️  ISSUE: Status is uppercase (${payment.status}), database expects lowercase`
        );
        issuesFound++;

        const correctStatus = payment.status.toLowerCase();
        const { error: updateError } = await supabase
          .from('payments')
          .update({
            status: correctStatus,
            updated_at: new Date().toISOString(),
          })
          .eq('id', payment.id);

        if (updateError) {
          console.log(`   ❌ Failed to fix status: ${updateError.message}`);
        } else {
          console.log(`   ✅ Fixed status: ${payment.status} → ${correctStatus}`);
          issuesFixed++;
        }
      }

      // Issue 2: Completed payment without order
      if ((payment.status === 'COMPLETED' || payment.status === 'completed') && !payment.orders) {
        console.log(`   ⚠️  ISSUE: Completed payment without associated order`);
        issuesFound++;
        console.log(`   💡 Manual intervention required: Create order for payment ${payment.id}`);
        console.log(`   💡 Order ID should be: ${payment.order_id}`);
        console.log(`   💡 Payment amount: ${payment.amount} TSH`);
        console.log(`   💡 Transaction ID: ${payment.transaction_id}`);
      }

      // Issue 3: Old pending payments (might be stale)
      const paymentAge = Date.now() - new Date(payment.created_at).getTime();
      const hoursOld = paymentAge / (1000 * 60 * 60);

      if ((payment.status === 'PENDING' || payment.status === 'pending') && hoursOld > 2) {
        console.log(
          `   ⚠️  ISSUE: Pending payment is ${hoursOld.toFixed(1)} hours old (might be stale)`
        );
        issuesFound++;
        console.log(`   💡 Consider checking with BongoPay API or marking as FAILED`);
      }

      console.log(`   ✅ Check complete`);
    }

    console.log('\n📊 SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total payments checked: ${payments.length}`);
    console.log(`Issues found: ${issuesFound}`);
    console.log(`Issues auto-fixed: ${issuesFixed}`);
    console.log(`Manual intervention needed: ${issuesFound - issuesFixed}`);

    if (issuesFound === 0) {
      console.log('\n🎉 No payment issues found! All payments look healthy.');
    } else if (issuesFixed === issuesFound) {
      console.log('\n🎉 All issues have been automatically fixed!');
    } else {
      console.log('\n⚠️  Some issues require manual intervention (see details above)');
      console.log('\n💡 Common solutions:');
      console.log(
        '   • For completed payments without orders: Use the payment recovery utility in the app'
      );
      console.log('   • For stale pending payments: Check BongoPay status or mark as failed');
      console.log('   • For status mismatches: Verify with BongoPay API');
    }

    console.log('\n✅ Payment diagnosis complete!');
  } catch (error) {
    console.error('❌ Error during payment diagnosis:', error);
    process.exit(1);
  }
}

// Check if we have the required environment variables
if (!SUPABASE_URL || SUPABASE_URL === 'YOUR_SUPABASE_URL') {
  console.error('❌ EXPO_PUBLIC_SUPABASE_URL environment variable is required');
  process.exit(1);
}

if (!SUPABASE_SERVICE_ROLE_KEY || SUPABASE_SERVICE_ROLE_KEY === 'YOUR_SERVICE_ROLE_KEY') {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  console.error('💡 Get this from your Supabase dashboard → Settings → API → service_role key');
  process.exit(1);
}

main();
