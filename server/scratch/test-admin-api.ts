import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('==================================================');
  console.log('STARTING AUTOMATED ADMIN API TEST SUITE');
  console.log('==================================================\n');

  let ownerToken = '';
  let managerToken = '';
  let staffToken = '';

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

  // 2. Authenticate Manager
  try {
    console.log('2. Authenticating Manager account...');
    const res = await fetch(`${BASE_URL}/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'manager@goldencelebration.com', password: 'manager123' })
    });
    
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data: any = await res.json();
    managerToken = data.accessToken;
    console.log('   [SUCCESS] Manager logged in successfully.\n');
  } catch (err: any) {
    console.error('   [FAIL] Manager authentication failed:', err.message);
    process.exit(1);
  }

  // 3. Authenticate Coordinator (Staff)
  try {
    console.log('3. Authenticating Staff (Coordinator) account...');
    const res = await fetch(`${BASE_URL}/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'staff@goldencelebration.com', password: 'staff123' })
    });
    
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data: any = await res.json();
    staffToken = data.accessToken;
    console.log('   [SUCCESS] Staff logged in successfully.\n');
  } catch (err: any) {
    console.error('   [FAIL] Staff authentication failed:', err.message);
    process.exit(1);
  }

  // 4. Test RBAC validation (Staff should be blocked from read:staff and read:payments)
  try {
    console.log('4. Verifying RBAC middleware policy enforcement...');
    const res = await fetch(`${BASE_URL}/admin/staff`, {
      headers: { 'Authorization': `Bearer ${staffToken}` }
    });
    
    if (res.status === 403) {
      console.log('   [SUCCESS] Staff was correctly blocked from accessing staff roster (403 Forbidden).');
    } else {
      console.error(`   [FAIL] Expected 403 Forbidden, got status: ${res.status}`);
    }

    const res2 = await fetch(`${BASE_URL}/admin/staff`, {
      headers: { 'Authorization': `Bearer ${ownerToken}` }
    });
    
    if (res2.ok) {
      console.log('   [SUCCESS] Owner was correctly allowed to access staff roster.');
    } else {
      console.error(`   [FAIL] Owner request failed with status: ${res2.status}`);
    }
    console.log('');
  } catch (err: any) {
    console.error('   [FAIL] RBAC test failed:', err.message);
  }

  // 5. Test Double-Booking Protection ( Rajesh has a booking on 2026-11-22 )
  try {
    console.log('5. Verifying date conflicts and double-booking blocks...');
    // Attempt to block Rajesh's booking date (2026-11-22)
    const res = await fetch(`${BASE_URL}/admin/calendar/block`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ownerToken}`
      },
      body: JSON.stringify({ date: '2026-11-22', reason: 'Attempted Double Block' })
    });
    
    if (res.status === 400) {
      const data: any = await res.json();
      console.log(`   [SUCCESS] Double-booking blocked. Response: "${data.error}"`);
    } else {
      console.error(`   [FAIL] Expected 400 Bad Request, got status: ${res.status}`);
    }
    console.log('');
  } catch (err: any) {
    console.error('   [FAIL] Double-booking validation failed:', err.message);
  }

  // 6. Test Date blocking & unblocking
  try {
    console.log('6. Verifying calendar date-blocking constraints...');
    const blockDate = '2026-12-25';
    
    // Block Christmas Day
    const res = await fetch(`${BASE_URL}/admin/calendar/block`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ownerToken}`
      },
      body: JSON.stringify({ date: blockDate, reason: 'Christmas Day Grass Aeration Maintenance' })
    });

    if (res.ok) {
      console.log(`   [SUCCESS] Successfully blocked date ${blockDate} for lawn aeration.`);
    } else {
      const err = await res.ok ? {} : await res.json();
      console.error(`   [FAIL] Block date failed:`, err);
    }

    // Verify block in calendar events
    const calRes = await fetch(`${BASE_URL}/admin/calendar?yearMonth=2026-12`, {
      headers: { 'Authorization': `Bearer ${ownerToken}` }
    });
    const calData: any = await calRes.json();
    const isBlocked = calData.blocked.some((b: any) => b.date === blockDate);
    if (isBlocked) {
      console.log(`   [SUCCESS] Verified block is visible in the Availability Calendar events list.`);
    } else {
      console.error(`   [FAIL] Blocked date was not found in calendar responses.`);
    }

    // Unblock Christmas Day
    const unblockRes = await fetch(`${BASE_URL}/admin/calendar/unblock`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ownerToken}`
      },
      body: JSON.stringify({ date: blockDate })
    });

    if (unblockRes.ok) {
      console.log(`   [SUCCESS] Successfully unblocked date ${blockDate}.`);
    } else {
      console.error(`   [FAIL] Unblock date failed.`);
    }
    console.log('');
  } catch (err: any) {
    console.error('   [FAIL] Date blocking validation failed:', err.message);
  }

  // 7. Verify Audit log record creation
  try {
    console.log('7. Verifying administrative operations audit logging...');
    const auditLogs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 3
    });

    console.log(`   Seeded/Triggered Audit logs retrieved: ${auditLogs.length}`);
    for (const log of auditLogs) {
      console.log(`   - Action: "${log.action}" | IP: "${log.ipAddress || 'unknown'}" | Details: ${log.details}`);
    }
    
    const hasBlockLog = auditLogs.some((log: any) => log.action.includes('BLOCK_DATE'));
    if (hasBlockLog) {
      console.log('\n   [SUCCESS] Audit logger recorded date blocking actions correctly.');
    } else {
      console.log('\n   [WARNING] Date block audit log not found in last entries. Check middleware setup.');
    }
    console.log('');
  } catch (err: any) {
    console.error('   [FAIL] Audit log check failed:', err.message);
  }

  console.log('==================================================');
  console.log('TEST SUITE EXECUTION COMPLETED');
  console.log('==================================================');
}

runTests()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
