import { PrismaClient } from '@prisma/client';
import { NotificationService } from '../src/services/notification.service';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function runTests() {
  console.log('\n--- STARTING NOTIFICATION MODULE E2E VERIFICATION ---');

  // Clean scratch logs
  const logFilePath = path.join(__dirname, 'email-logs.txt');
  if (fs.existsSync(logFilePath)) {
    fs.unlinkSync(logFilePath);
  }

  // 1. Verify Templates
  console.log('\n1. Checking Seeded Templates...');
  const templates = await prisma.notificationTemplate.findMany();
  console.log(`Seeded Templates Count: ${templates.length}`);
  const expectedTemplates = [
    'booking_confirmation',
    'booking_cancellation',
    'welcome_email',
    'payment_receipt',
    'invoice_generated',
    'refund_status',
  ];

  for (const tName of expectedTemplates) {
    const found = templates.some((t) => t.name === tName);
    if (!found) {
      throw new Error(`Expected template "${tName}" was not seeded!`);
    }
    console.log(`  - Template "${tName}" is verified.`);
  }

  // 2. Test rendering engine
  console.log('\n2. Testing Template Interpolation...');
  const testString = 'Hello {{name}}, booking {{bookingId}} is confirmed.';
  const rendered = NotificationService.renderTemplate(testString, {
    name: 'Rajesh Kumar',
    bookingId: 'GC-2026-0912',
  });
  console.log(`  - Input: "${testString}"`);
  console.log(`  - Rendered: "${rendered}"`);
  if (rendered !== 'Hello Rajesh Kumar, booking GC-2026-0912 is confirmed.') {
    throw new Error('Template rendering mismatch!');
  }
  console.log('  - Interpolation engine OK.');

  // 3. Test sending template notification to customer
  console.log('\n3. Testing Customer Notification Dispatch (In-App + Email)...');
  
  // Set up active preferences
  await prisma.notificationPreference.upsert({
    where: { userId: 'cust-rajesh' },
    update: { emailEnabled: true, inAppEnabled: true },
    create: { userId: 'cust-rajesh', emailEnabled: true, inAppEnabled: true },
  });

  const notification = await NotificationService.sendNotification({
    customerId: 'cust-rajesh',
    templateName: 'booking_confirmation',
    variables: {
      eventType: 'Wedding Reception',
      date: '2026-11-22',
      bookingId: 'GC-2026-0912',
    },
    category: 'BOOKING',
    priority: 'HIGH',
    type: 'success',
  });

  if (!notification) {
    throw new Error('Failed to create in-app notification record.');
  }
  console.log(`  - In-App Notification created: ID=${notification.id}`);
  console.log(`  - Title: "${notification.title}"`);
  console.log(`  - Message: "${notification.message}"`);
  console.log(`  - Category: "${notification.category}", Priority: "${notification.priority}"`);

  // Verify email log file output
  if (fs.existsSync(logFilePath)) {
    const logs = fs.readFileSync(logFilePath, 'utf8');
    if (logs.includes('booking_confirmation') || logs.includes('GC-2026-0912')) {
      console.log('  - Email dispatch verified in local logs successfully.');
    } else {
      throw new Error('Email log file contents did not match expectations.');
    }
  } else {
    throw new Error('Email log file was not generated!');
  }

  // 4. Test preference exclusions (In-App Enabled, Email Disabled)
  console.log('\n4. Testing Preferences (Email disabled, In-App enabled)...');
  await prisma.notificationPreference.update({
    where: { userId: 'cust-rajesh' },
    data: { emailEnabled: false, inAppEnabled: true },
  });

  // Clear previous log file
  fs.unlinkSync(logFilePath);

  const testNotif2 = await NotificationService.sendNotification({
    customerId: 'cust-rajesh',
    title: 'Preference Exclusions Test',
    message: 'This is a test message to verify email is blocked.',
    category: 'SYSTEM',
    priority: 'LOW',
  });

  if (!testNotif2) {
    throw new Error('In-app notification should be created when inAppEnabled: true');
  }
  
  if (fs.existsSync(logFilePath)) {
    throw new Error('Email was dispatched even though emailEnabled: false!');
  }
  console.log('  - Preference verification passed: email block works.');

  // 5. Test role broadcasts
  console.log('\n5. Testing Target Role Broadcasts...');
  const originalCount = await prisma.notification.count();
  
  const broadcastList = await NotificationService.broadcastNotification({
    title: 'Lawn Main Power Generator Maintenance',
    message: 'Maintenance schedule: Wed 10:00 - 14:00.',
    category: 'SYSTEM',
    priority: 'MEDIUM',
    targetRole: 'STAFF', // Should send to coordinator staff only
  });

  const finalCount = await prisma.notification.count();
  console.log(`  - Broadcast result count: ${broadcastList.length}`);
  console.log(`  - Database records delta: ${finalCount - originalCount}`);

  if (broadcastList.length === 0) {
    throw new Error('No notifications were dispatched during broadcast!');
  }
  console.log('  - Broadcast targets validation passed.');

  console.log('\n--- ALL E2E NOTIFICATION CHECKS SUCCESSFULLY VERIFIED ---');
}

runTests()
  .catch((err) => {
    console.error('\n!!! E2E VERIFICATION FAILED !!!');
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
