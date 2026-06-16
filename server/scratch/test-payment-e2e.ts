import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('==================================================');
  console.log('STARTING INTEGRATION PAYMENT & REFUND TEST SUITE');
  console.log('==================================================\n');

  let ownerToken = '';
  let customerToken = '';

  // 1. Authenticate Owner
  try {
    console.log('1. Authenticating Owner account...');
    const res = await fetch(`${BASE_URL}/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'owner@goldencelebration.com', password: 'owner123' })
    });
    
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data: any = await res.json();
    ownerToken = data.accessToken;
    console.log('   [SUCCESS] Owner logged in successfully.\n');
  } catch (err: any) {
    console.error('   [FAIL] Owner authentication failed:', err.message);
    process.exit(1);
  }

  // 2. Authenticate Customer (Rajesh)
  try {
    console.log('2. Authenticating Customer account...');
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'rajesh.kumar@gmail.com', password: 'customer123' })
    });
    
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data: any = await res.json();
    customerToken = data.accessToken;
    console.log('   [SUCCESS] Customer logged in successfully.\n');
  } catch (err: any) {
    console.error('   [FAIL] Customer authentication failed:', err.message);
    process.exit(1);
  }

  // 3. Create Razorpay order for booking GC-2026-0912 (outstanding is ₹300,000)
  let orderId = '';
  let paymentType = 'INSTALLMENT';
  let paymentAmount = 100000;
  
  try {
    console.log('3. Initializing payment order for GC-2026-0912...');
    const res = await fetch(`${BASE_URL}/payments/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        bookingId: 'GC-2026-0912',
        amount: paymentAmount,
        paymentType
      })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || `Status ${res.status}`);
    }

    const order: any = await res.json();
    orderId = order.orderId;
    console.log(`   [SUCCESS] Order created successfully. ID: ${orderId}\n`);
  } catch (err: any) {
    console.error('   [FAIL] Order creation failed:', err.message);
    process.exit(1);
  }

  // 4. Verify Payment simulation
  try {
    console.log('4. Verifying simulated payment verification...');
    const res = await fetch(`${BASE_URL}/payments/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        razorpay_order_id: orderId,
        razorpay_payment_id: `pay_mock_${Date.now()}`,
        razorpay_signature: 'mock_sig',
        paymentType,
        bookingId: 'GC-2026-0912'
      })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || `Status ${res.status}`);
    }

    console.log('   [SUCCESS] Payment verified and applied successfully.\n');
  } catch (err: any) {
    console.error('   [FAIL] Payment verification failed:', err.message);
    process.exit(1);
  }

  // Verify Booking changes
  try {
    console.log('5. Verifying database updates for financials...');
    const booking = await prisma.booking.findUnique({
      where: { id: 'GC-2026-0912' }
    });

    console.log(`   Booking Cost: ₹${booking?.cost.toLocaleString()}`);
    console.log(`   Booking Paid: ₹${booking?.paid.toLocaleString()} (Expected: ₹350,000)`);
    console.log(`   Booking Pending: ₹${booking?.pending.toLocaleString()} (Expected: ₹200,000)`);

    if (booking?.paid !== 350000 || booking?.pending !== 200000) {
      throw new Error('Database financial numbers are out of sync!');
    }
    console.log('   [SUCCESS] Financial updates verified in Booking table.\n');
  } catch (err: any) {
    console.error('   [FAIL] Financial updates verification failed:', err.message);
    process.exit(1);
  }

  // 6. Submit Refund Request
  let refundId = '';
  try {
    console.log('6. Submitting refund request...');
    const payments = await prisma.payment.findMany({
      where: { bookingId: 'GC-2026-0912' },
      orderBy: { createdAt: 'desc' },
      take: 1
    });

    const targetPayment = payments[0];
    const res = await fetch(`${BASE_URL}/payments/refund-request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        paymentId: targetPayment.id,
        refundAmount: 20000,
        reason: 'Double billing adjustment request'
      })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || `Status ${res.status}`);
    }

    const refund: any = await res.json();
    refundId = refund.id;
    console.log(`   [SUCCESS] Refund request submitted. ID: ${refundId}\n`);
  } catch (err: any) {
    console.error('   [FAIL] Refund request failed:', err.message);
    process.exit(1);
  }

  // 7. Approve and Complete Refund
  try {
    console.log('7. Approving and completing refund request...');
    const res = await fetch(`${BASE_URL}/payments/refund/${refundId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ownerToken}`
      },
      body: JSON.stringify({
        refundStatus: 'COMPLETED'
      })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || `Status ${res.status}`);
    }

    console.log('   [SUCCESS] Refund approved and marked COMPLETED.\n');
  } catch (err: any) {
    console.error('   [FAIL] Refund status update failed:', err.message);
    process.exit(1);
  }

  // Verify Booking changes after refund
  try {
    console.log('8. Verifying database balances after refund processing...');
    const booking = await prisma.booking.findUnique({
      where: { id: 'GC-2026-0912' }
    });

    console.log(`   Booking Paid: ₹${booking?.paid.toLocaleString()} (Expected: ₹330,000)`);
    console.log(`   Booking Pending: ₹${booking?.pending.toLocaleString()} (Expected: ₹220,000)`);

    if (booking?.paid !== 330000 || booking?.pending !== 220000) {
      throw new Error('Database financial numbers are out of sync after refund!');
    }
    console.log('   [SUCCESS] Refund verified and adjustments successfully updated in DB.\n');
  } catch (err: any) {
    console.error('   [FAIL] Refund database check failed:', err.message);
    process.exit(1);
  }

  // 9. Check Invoice Updates
  try {
    console.log('9. Verifying Invoice record updates...');
    const invoice = await prisma.invoice.findFirst({
      where: { bookingId: 'GC-2026-0912' }
    });

    console.log(`   Invoice No: ${invoice?.invoiceNo}`);
    console.log(`   Invoice Total: ₹${invoice?.totalAmount.toLocaleString()}`);
    console.log(`   Invoice Paid: ₹${invoice?.paidAmount.toLocaleString()} (Expected: ₹330,000)`);
    console.log(`   Invoice Remaining: ₹${invoice?.remainingAmount.toLocaleString()} (Expected: ₹220,000)`);

    if (invoice?.paidAmount !== 330000 || invoice?.remainingAmount !== 220000) {
      throw new Error('Invoice table did not adjust amounts according to payment & refund timeline!');
    }
    console.log('   [SUCCESS] Invoice updates verified successfully.\n');
  } catch (err: any) {
    console.error('   [FAIL] Invoice verification failed:', err.message);
    process.exit(1);
  }

  console.log('==================================================');
  console.log('PAYMENTS & REFUNDS TEST SUITE SUCCESSFUL');
  console.log('==================================================');
}

runTests()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
