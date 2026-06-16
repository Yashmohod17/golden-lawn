import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const customerData = {
  id: 'cust-rajesh',
  name: 'Rajesh Kumar',
  email: 'rajesh.kumar@gmail.com',
  password: bcrypt.hashSync('customer123', 10),
  phone: '+91 98765 43210',
  address: 'Flat 405, Gold Crest Heights, Narsala Road, Nagpur, Maharashtra - 440034',
  avatar: 'RK',
  joinedDate: 'March 15, 2026',
  cateringPref: 'Traditional Veg Indian (Buffet)',
  themePref: 'Royal Ivory & Marigold Gold',
  contactPref: 'WhatsApp & Email',
  role: 'CUSTOMER',
};

const customerBookings = [
  {
    id: 'GC-2026-0912',
    customerId: 'cust-rajesh',
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@gmail.com',
    phone: '+91 98765 43210',
    eventType: 'Wedding Reception',
    date: '2026-11-22',
    guests: 600,
    package: 'Imperial Royal Platinum',
    cost: 550000,
    paid: 250000,
    pending: 300000,
    notes: 'Requires luxury floral stage decoration, grand entrance layout, and customized sweet stalls.',
    location: 'Grand Main Lawn A & B',
    coordinatorName: 'Aravind Sharma',
    coordinatorPhone: '+91 98877 66554',
    status: 'CONFIRMED',
    createdAt: new Date('2025-11-15T10:00:00.000Z'),
  },
  {
    id: 'GC-2026-0415',
    customerId: 'cust-rajesh',
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@gmail.com',
    phone: '+91 98765 43210',
    eventType: 'Silver Jubilee Anniversary',
    date: '2026-04-12',
    guests: 250,
    package: 'Premium Gold Feast',
    cost: 280000,
    paid: 280000,
    pending: 0,
    notes: 'Stage backdrop with silver and navy blue accents. High-tea style appetizers preferred.',
    location: 'Riverside Banquet Deck',
    coordinatorName: 'Meera Nair',
    coordinatorPhone: '+91 98877 66551',
    status: 'CONFIRMED',
    createdAt: new Date('2025-12-10T11:30:00.000Z'),
  },
  {
    id: 'GC-2026-0210',
    customerId: 'cust-rajesh',
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@gmail.com',
    phone: '+91 98765 43210',
    eventType: 'Corporate Gala Banquet',
    date: '2026-08-30',
    guests: 150,
    package: 'Classic Garden Feast',
    cost: 150000,
    paid: 0,
    pending: 0,
    notes: 'Cancelled due to organization realignment. Advance booking deposit waived per policy guidelines.',
    location: 'Cozy Mini Lawn B',
    coordinatorName: 'Karan Malhotra',
    coordinatorPhone: '+91 98877 66559',
    status: 'CANCELLED',
    createdAt: new Date('2026-02-05T09:00:00.000Z'),
  },
];

const milestonesData = [
  // GC-2026-0912
  { bookingId: 'GC-2026-0912', label: 'Inquiry Submitted', date: '2025-11-15', status: 'COMPLETED' },
  { bookingId: 'GC-2026-0912', label: 'Site Visit & Consultation', date: '2025-11-20', status: 'COMPLETED' },
  { bookingId: 'GC-2026-0912', label: 'Booking Deposit Paid', date: '2025-12-01', status: 'COMPLETED' },
  { bookingId: 'GC-2026-0912', label: 'Design & Menu Finalization', date: '2026-06-12', status: 'IN_PROGRESS' },
  { bookingId: 'GC-2026-0912', label: 'Balance Settlement', status: 'PENDING' },
  { bookingId: 'GC-2026-0912', label: 'Event Execution Day', status: 'PENDING' },
  
  // GC-2026-0415
  { bookingId: 'GC-2026-0415', label: 'Inquiry Submitted', date: '2025-12-10', status: 'COMPLETED' },
  { bookingId: 'GC-2026-0415', label: 'Site Visit & Consultation', date: '2025-12-18', status: 'COMPLETED' },
  { bookingId: 'GC-2026-0415', label: 'Booking Deposit Paid', date: '2025-12-28', status: 'COMPLETED' },
  { bookingId: 'GC-2026-0415', label: 'Design & Menu Finalization', date: '2026-02-15', status: 'COMPLETED' },
  { bookingId: 'GC-2026-0415', label: 'Balance Settlement', date: '2026-04-01', status: 'COMPLETED' },
  { bookingId: 'GC-2026-0415', label: 'Event Execution Day', date: '2026-04-12', status: 'COMPLETED' },

  // GC-2026-0210
  { bookingId: 'GC-2026-0210', label: 'Inquiry Submitted', date: '2026-02-05', status: 'COMPLETED' },
  { bookingId: 'GC-2026-0210', label: 'Inquiry Review', date: '2026-02-08', status: 'COMPLETED' },
  { bookingId: 'GC-2026-0210', label: 'Booking Cancelled', date: '2026-02-10', status: 'CANCELLED' },
];

const paymentsData = [
  { id: 'RCP-98124', bookingId: 'GC-2026-0912', customerId: 'cust-rajesh', amount: 150000, method: 'Bank Transfer (HDFC)', date: '2025-12-01', status: 'SUCCESS', description: 'Booking Advance Deposit', paymentType: 'ADVANCE', paymentStatus: 'PAID', paymentMethod: 'Net Banking', transactionId: 'pay_mock_124' },
  { id: 'RCP-98402', bookingId: 'GC-2026-0912', customerId: 'cust-rajesh', amount: 100000, method: 'UPI (Google Pay)', date: '2026-03-15', status: 'SUCCESS', description: 'Second Milestone Payment', paymentType: 'INSTALLMENT', paymentStatus: 'PAID', paymentMethod: 'UPI', transactionId: 'pay_mock_402' },
  { id: 'RCP-97531', bookingId: 'GC-2026-0415', customerId: 'cust-rajesh', amount: 180000, method: 'Credit Card (ICICI)', date: '2025-12-28', status: 'SUCCESS', description: 'Booking Advance Deposit', paymentType: 'ADVANCE', paymentStatus: 'PAID', paymentMethod: 'Card', transactionId: 'pay_mock_531' },
  { id: 'RCP-97690', bookingId: 'GC-2026-0415', customerId: 'cust-rajesh', amount: 100000, method: 'Net Banking', date: '2026-04-01', status: 'SUCCESS', description: 'Final Settlement', paymentType: 'FINAL', paymentStatus: 'PAID', paymentMethod: 'Net Banking', transactionId: 'pay_mock_690' },
];

const notificationsData = [
  { customerId: 'cust-rajesh', date: '2026-06-15', title: 'Custom Menu Approved', message: 'Chef Sharma has approved your customization requests for the Wedding Reception menu.', type: 'success', read: false },
  { customerId: 'cust-rajesh', date: '2026-06-12', title: 'Payment Receipt Available', message: 'Receipt RCP-98402 for ₹1,00,000 has been generated and added to your history.', type: 'info', read: true },
  { customerId: 'cust-rajesh', date: '2026-06-05', title: 'Milestone Finalization Reminder', message: 'Please finalize your floral stage design choices by July 15, 2026.', type: 'warning', read: false },
];

const adminBookings = [
  {
    id: 'b-1',
    name: 'Aishwarya Patil',
    email: 'aishwarya.patil@gmail.com',
    phone: '+91 94221 55678',
    eventType: 'Wedding',
    date: '2026-11-20',
    guests: 600,
    package: 'PLATINUM PACKAGE',
    cost: 3240000,
    notes: 'Requires dynamic floral entry arches and white roses themed staging.',
    status: 'CONFIRMED',
    createdAt: new Date('2026-06-10T14:30:00.000Z'),
  },
  {
    id: 'b-2',
    name: 'Aditya Deshmukh',
    email: 'aditya.deshmukh@yahoo.com',
    phone: '+91 98901 22345',
    eventType: 'Reception',
    date: '2026-11-24',
    guests: 800,
    package: 'GOLD PACKAGE',
    cost: 2200000,
    notes: 'Valet support for 200 cars and special sweet buffet counters.',
    status: 'PENDING',
    createdAt: new Date('2026-06-12T09:15:00.000Z'),
  },
  {
    id: 'b-3',
    name: 'TCS Group Nagpur',
    email: 'hr.nagpur@tcs.com',
    phone: '+91 71225 67890',
    eventType: 'Corporate Event',
    date: '2026-12-05',
    guests: 400,
    package: 'GOLD PACKAGE',
    cost: 1150000,
    notes: 'Projector stage mapping setup and cocktail high chairs layout.',
    status: 'CONFIRMED',
    createdAt: new Date('2026-06-13T16:00:00.000Z'),
  },
  {
    id: 'b-4',
    name: 'Meenal Kulkarni',
    email: 'meenal.k@outlook.com',
    phone: '+91 91588 44321',
    eventType: 'Birthday Party',
    date: '2026-10-18',
    guests: 200,
    package: 'SILVER PACKAGE',
    cost: 192000,
    notes: 'Princess theme balloon decor and chocolate fountain addon.',
    status: 'CANCELLED',
    createdAt: new Date('2026-06-11T11:45:00.000Z'),
  },
];

async function main() {
  console.log('Clearing database tables...');
  await prisma.followUp.deleteMany({});
  await prisma.inquiry.deleteMany({});
  await prisma.lead.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.attendance.deleteMany({});
  await prisma.staff.deleteMany({});
  await prisma.blockedDate.deleteMany({});
  await prisma.availabilityDate.deleteMany({});
  await prisma.calendarEvent.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.customerNote.deleteMany({});
  await prisma.customerDocument.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.bookingStatusHistory.deleteMany({});
  await prisma.bookingTimelineEvent.deleteMany({});
  await prisma.refundRequest.deleteMany({});
  await prisma.paymentTransaction.deleteMany({});
  await prisma.paymentReminder.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.milestone.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.role.deleteMany({});
  await prisma.permission.deleteMany({});
  await prisma.customer.deleteMany({});

  console.log('Seeding Customer Rajesh Kumar...');
  const customer = await prisma.customer.create({
    data: customerData,
  });

  console.log('Seeding customer notes and documents...');
  await prisma.customerNote.createMany({
    data: [
      { customerId: customer.id, note: 'Prefers mild spices in wedding menu, and extra yellow marigolds.', authorName: 'Aravind Sharma' },
      { customerId: customer.id, note: 'Discussed stage setup sizes. Standard 40ft stage required.', authorName: 'Meera Nair' },
    ]
  });

  await prisma.customerDocument.createMany({
    data: [
      { customerId: customer.id, name: 'Lawn Selection Blueprint.pdf', url: '/documents/blueprint.pdf', type: 'PDF' },
      { customerId: customer.id, name: 'Catering Menu Details.pdf', url: '/documents/menu.pdf', type: 'PDF' },
    ]
  });

  console.log('Seeding customer bookings...');
  for (const booking of customerBookings) {
    await prisma.booking.create({
      data: booking,
    });
  }

  console.log('Seeding admin standard bookings...');
  for (const booking of adminBookings) {
    await prisma.booking.create({
      data: booking,
    });
  }

  console.log('Seeding booking milestones...');
  for (const milestone of milestonesData) {
    await prisma.milestone.create({
      data: milestone,
    });
  }

  console.log('Seeding payment transactions...');
  for (const payment of paymentsData) {
    await prisma.payment.create({
      data: payment,
    });
  }

  console.log('Seeding notifications...');
  for (const notification of notificationsData) {
    await prisma.notification.create({
      data: notification,
    });
  }

  console.log('Seeding invoices...');
  await prisma.invoice.createMany({
    data: [
      { bookingId: 'GC-2026-0912', invoiceNo: 'INV-2026-0001', invoiceNumber: 'INV-2026-0001', customerId: 'cust-rajesh', amount: 550000, totalAmount: 550000, paidAmount: 250000, remainingAmount: 300000, dueDate: '2026-10-22', status: 'PARTIALLY_PAID' },
      { bookingId: 'GC-2026-0415', invoiceNo: 'INV-2026-0002', invoiceNumber: 'INV-2026-0002', customerId: 'cust-rajesh', amount: 280000, totalAmount: 280000, paidAmount: 280000, remainingAmount: 0, dueDate: '2026-03-12', status: 'PAID' },
      { bookingId: 'b-1', invoiceNo: 'INV-2026-0003', invoiceNumber: 'INV-2026-0003', amount: 3240000, totalAmount: 3240000, paidAmount: 0, remainingAmount: 3240000, dueDate: '2026-10-20', status: 'UNPAID' },
      { bookingId: 'b-3', invoiceNo: 'INV-2026-0004', invoiceNumber: 'INV-2026-0004', amount: 1150000, totalAmount: 1150000, paidAmount: 0, remainingAmount: 1150000, dueDate: '2026-11-05', status: 'UNPAID' },
    ]
  });

  console.log('Seeding permissions...');
  const permissionsList = [
    'read:bookings', 'write:bookings', 'delete:bookings',
    'read:payments', 'write:payments',
    'read:staff', 'write:staff',
    'read:crm', 'write:crm',
    'read:analytics', 'read:reports',
    'manage:settings'
  ];
  const permissions: Record<string, any> = {};
  for (const pName of permissionsList) {
    permissions[pName] = await prisma.permission.create({
      data: { name: pName }
    });
  }

  console.log('Seeding roles...');
  const roleOwner = await prisma.role.create({
    data: {
      name: 'OWNER',
      permissions: {
        connect: Object.values(permissions).map(p => ({ id: p.id }))
      }
    }
  });

  const roleManager = await prisma.role.create({
    data: {
      name: 'MANAGER',
      permissions: {
        connect: [
          permissions['read:bookings'], permissions['write:bookings'],
          permissions['read:payments'], permissions['write:payments'],
          permissions['read:crm'], permissions['write:crm'],
          permissions['read:staff'],
          permissions['read:analytics'], permissions['read:reports']
        ].map(p => ({ id: p.id }))
      }
    }
  });

  const roleStaff = await prisma.role.create({
    data: {
      name: 'STAFF',
      permissions: {
        connect: [
          permissions['read:bookings'],
          permissions['read:crm'], permissions['write:crm']
        ].map(p => ({ id: p.id }))
      }
    }
  });

  console.log('Seeding admin users...');
  const hashedDefaultPassword = bcrypt.hashSync('owner123', 10);
  const hashedManagerPassword = bcrypt.hashSync('manager123', 10);
  const hashedStaffPassword = bcrypt.hashSync('staff123', 10);

  const userOwner = await prisma.user.create({
    data: {
      name: 'Aravind Sharma (Owner)',
      email: 'owner@goldencelebration.com',
      password: hashedDefaultPassword,
      roleId: roleOwner.id
    }
  });

  const userManager = await prisma.user.create({
    data: {
      name: 'Meera Nair (Manager)',
      email: 'manager@goldencelebration.com',
      password: hashedManagerPassword,
      roleId: roleManager.id
    }
  });

  const userStaff = await prisma.user.create({
    data: {
      name: 'Rohan Joshi (Coordinator)',
      email: 'staff@goldencelebration.com',
      password: hashedStaffPassword,
      roleId: roleStaff.id
    }
  });

  console.log('Seeding staff profiles...');
  const staffOwner = await prisma.staff.create({
    data: {
      userId: userOwner.id,
      role: 'OWNER',
      phone: '+91 98877 66554',
      status: 'ACTIVE',
      salary: 150000
    }
  });

  const staffManager = await prisma.staff.create({
    data: {
      userId: userManager.id,
      role: 'MANAGER',
      phone: '+91 98877 66555',
      status: 'ACTIVE',
      salary: 85000
    }
  });

  const staffStaff = await prisma.staff.create({
    data: {
      userId: userStaff.id,
      role: 'COORDINATOR',
      phone: '+91 98877 66556',
      status: 'ACTIVE',
      salary: 45000
    }
  });

  console.log('Seeding staff attendance logs...');
  const attendanceDates = ['2026-06-15', '2026-06-16'];
  for (const date of attendanceDates) {
    await prisma.attendance.create({ data: { staffId: staffOwner.id, date, status: 'PRESENT', checkIn: '09:00', checkOut: '18:00' } });
    await prisma.attendance.create({ data: { staffId: staffManager.id, date, status: 'PRESENT', checkIn: '09:15', checkOut: '18:30' } });
    await prisma.attendance.create({ data: { staffId: staffStaff.id, date, status: 'PRESENT', checkIn: '08:50', checkOut: '17:45' } });
  }

  console.log('Seeding tasks...');
  await prisma.task.createMany({
    data: [
      { title: 'Finalize Stage Florist Contracts', description: 'Align with Rajesh Kumar flowers preference list.', status: 'IN_PROGRESS', priority: 'HIGH', assignedToId: staffStaff.id, createdById: staffManager.id, dueDate: '2026-06-25' },
      { title: 'Update Catering Rates in Packages', description: 'Recalculate GST adjustments in Silver/Gold rates.', status: 'PENDING', priority: 'MEDIUM', assignedToId: staffManager.id, createdById: staffOwner.id, dueDate: '2026-06-30' },
      { title: 'Inspect banqueting deck speakers system', description: 'Resolve reported echo issues.', status: 'COMPLETED', priority: 'LOW', assignedToId: staffStaff.id, createdById: staffManager.id, dueDate: '2026-06-15' },
    ]
  });

  console.log('Seeding blocked and availability dates...');
  await prisma.blockedDate.create({
    data: { date: '2026-11-15', reason: 'Blocked for Annual Lawn Grass Core Aeration & Re-seeding Maintenance.', blockedBy: 'Aravind Sharma (Owner)' }
  });

  const datesList = [
    { date: '2026-11-22', status: 'BOOKED', notes: 'GC-2026-0912 Wedding Reception booked.' },
    { date: '2026-11-20', status: 'BOOKED', notes: 'b-1 Wedding slots confirmed.' },
    { date: '2026-11-24', status: 'PENDING', notes: 'b-2 slot pending approval.' },
    { date: '2026-11-15', status: 'BLOCKED', notes: 'Grass maintenance scheduled.' },
  ];
  for (const item of datesList) {
    await prisma.availabilityDate.create({ data: item });
  }

  console.log('Seeding calendar events...');
  await prisma.calendarEvent.createMany({
    data: [
      { title: 'Wedding Reception: Rajesh Kumar', description: 'Grand Main Lawn A & B (ID: GC-2026-0912)', startDate: '2026-11-22', endDate: '2026-11-22', color: 'emerald', bookingId: 'GC-2026-0912' },
      { title: 'Wedding Slots: Aishwarya Patil', description: 'Grand Main Lawn A & B (ID: b-1)', startDate: '2026-11-20', endDate: '2026-11-20', color: 'emerald', bookingId: 'b-1' },
      { title: 'Lawn Grass Maintenance', description: 'Blocked for maintenance activities', startDate: '2026-11-15', endDate: '2026-11-15', color: 'red' },
      { title: 'Pending Inquiry: Aditya Deshmukh', description: 'Waiting for token advance (ID: b-2)', startDate: '2026-11-24', endDate: '2026-11-24', color: 'amber', bookingId: 'b-2' },
    ]
  });

  console.log('Seeding CRM Leads, Inquiries, & Follow-Ups...');
  const lead1 = await prisma.lead.create({
    data: { name: 'Suresh Patil', email: 'suresh.patil@yahoo.com', phone: '+91 98230 45678', source: 'Website Inquiry Form', status: 'QUALIFIED', notes: 'Wants a grand premium wedding layout for 800 guests.' }
  });
  const lead2 = await prisma.lead.create({
    data: { name: 'Neha Deshmukh', email: 'neha.d@outlook.com', phone: '+91 91452 78901', source: 'Referral', status: 'NEW', notes: 'Looking to book cozy lawn for kids birthday.' }
  });

  const inquiry1 = await prisma.inquiry.create({
    data: { leadId: lead1.id, eventType: 'Engagement Reception', eventDate: '2026-12-18', guests: 300, status: 'OPEN', notes: 'Needs premium decor. Requested estimates.' }
  });
  const inquiry2 = await prisma.inquiry.create({
    data: { leadId: lead2.id, eventType: 'Birthday Party', eventDate: '2026-10-05', guests: 150, status: 'OPEN', notes: 'Wants buffet options details.' }
  });

  await prisma.followUp.createMany({
    data: [
      { inquiryId: inquiry1.id, date: '2026-06-16', notes: 'Called Suresh to clarify guest count. Sent proposal PDF.', outcome: 'Interested', nextAction: 'Schedule venue visit', status: 'COMPLETED' },
      { inquiryId: inquiry1.id, date: '2026-06-20', notes: 'Conduct venue walkthrough with client.', status: 'SCHEDULED' },
      { inquiryId: inquiry2.id, date: '2026-06-16', notes: 'Left message. No response yet.', outcome: 'No Answer', nextAction: 'Call again tomorrow', status: 'MISSED' },
    ]
  });

  console.log('Seeding status history and timeline events...');
  
  // GC-2026-0912
  await prisma.bookingStatusHistory.createMany({
    data: [
      { bookingId: 'GC-2026-0912', oldStatus: null, newStatus: 'PENDING', changedBy: 'CUSTOMER', notes: 'Initial booking inquiry submitted.' },
      { bookingId: 'GC-2026-0912', oldStatus: 'PENDING', newStatus: 'CONFIRMED', changedBy: 'COORDINATOR', notes: 'Booking deposit cleared and verified.' }
    ]
  });
  
  await prisma.bookingTimelineEvent.createMany({
    data: [
      { bookingId: 'GC-2026-0912', title: 'Inquiry Submitted', description: 'Wedding Reception booking inquiry submitted.', type: 'STATUS_CHANGE', date: '2025-11-15' },
      { bookingId: 'GC-2026-0912', title: 'Site Visit Completed', description: 'Rajesh Kumar completed the venue walkthrough with Aravind Sharma.', type: 'MILESTONE_UPDATE', date: '2025-11-20' },
      { bookingId: 'GC-2026-0912', title: 'Advance Deposit Paid', description: 'Advance payment of ₹1,50,000 received via HDFC Bank Transfer (Receipt RCP-98124).', type: 'PAYMENT_RECEIVED', date: '2025-12-01' },
      { bookingId: 'GC-2026-0912', title: 'Booking Confirmed', description: 'Booking status transitioned to Confirmed.', type: 'STATUS_CHANGE', date: '2025-12-01' },
      { bookingId: 'GC-2026-0912', title: 'Second Payment Received', description: 'Payment of ₹1,00,000 received via Google Pay (Receipt RCP-98402).', type: 'PAYMENT_RECEIVED', date: '2026-03-15' }
    ]
  });

  // GC-2026-0415
  await prisma.bookingStatusHistory.createMany({
    data: [
      { bookingId: 'GC-2026-0415', oldStatus: null, newStatus: 'PENDING', changedBy: 'CUSTOMER', notes: 'Inquiry submitted.' },
      { bookingId: 'GC-2026-0415', oldStatus: 'PENDING', newStatus: 'CONFIRMED', changedBy: 'COORDINATOR', notes: 'Balance settled fully. Booking confirmed.' }
    ]
  });

  await prisma.bookingTimelineEvent.createMany({
    data: [
      { bookingId: 'GC-2026-0415', title: 'Inquiry Submitted', description: 'Silver Jubilee Anniversary booking inquiry submitted.', type: 'STATUS_CHANGE', date: '2025-12-10' },
      { bookingId: 'GC-2026-0415', title: 'Site Visit Completed', description: 'Consultation and walkthrough cleared.', type: 'MILESTONE_UPDATE', date: '2025-12-18' },
      { bookingId: 'GC-2026-0415', title: 'Deposit Received', description: 'Deposit of ₹1,80,000 paid via ICICI Credit Card.', type: 'PAYMENT_RECEIVED', date: '2025-12-28' },
      { bookingId: 'GC-2026-0415', title: 'Design Finalization', description: 'Stage backdrop and layout designs confirmed with coordinator.', type: 'MILESTONE_UPDATE', date: '2026-02-15' },
      { bookingId: 'GC-2026-0415', title: 'Final Balance Paid', description: 'Outstanding balance of ₹1,00,000 cleared via Net Banking.', type: 'PAYMENT_RECEIVED', date: '2026-04-01' },
      { bookingId: 'GC-2026-0415', title: 'Booking Confirmed', description: 'Reservation status confirmed.', type: 'STATUS_CHANGE', date: '2026-04-01' },
      { bookingId: 'GC-2026-0415', title: 'Event Executed', description: 'Event successfully executed at Riverside Banquet Deck.', type: 'MILESTONE_UPDATE', date: '2026-04-12' }
    ]
  });

  // Seeding initial histories for standard admin bookings too
  const adminBIds = ['b-1', 'b-2', 'b-3', 'b-4'];
  for (const bid of adminBIds) {
    const isCancelled = bid === 'b-4';
    const isConfirmed = bid === 'b-1' || bid === 'b-3';
    
    await prisma.bookingStatusHistory.create({
      data: {
        bookingId: bid,
        oldStatus: null,
        newStatus: 'PENDING',
        changedBy: 'CUSTOMER',
        notes: 'Inquiry submitted.'
      }
    });

    await prisma.bookingTimelineEvent.create({
      data: {
        bookingId: bid,
        title: 'Inquiry Submitted',
        description: 'Initial event booking inquiry submitted.',
        type: 'STATUS_CHANGE',
        date: '2026-06-10'
      }
    });

    if (isConfirmed) {
      await prisma.bookingStatusHistory.create({
        data: {
          bookingId: bid,
          oldStatus: 'PENDING',
          newStatus: 'CONFIRMED',
          changedBy: 'COORDINATOR',
          notes: 'Organizers approved the booking.'
        }
      });
      await prisma.bookingTimelineEvent.create({
        data: {
          bookingId: bid,
          title: 'Booking Confirmed',
          description: 'Reservation marked Confirmed by organizers.',
          type: 'STATUS_CHANGE',
          date: '2026-06-12'
        }
      });
    } else if (isCancelled) {
      await prisma.bookingStatusHistory.create({
        data: {
          bookingId: bid,
          oldStatus: 'PENDING',
          newStatus: 'CANCELLED',
          changedBy: 'COORDINATOR',
          notes: 'Customer cancelled request.'
        }
      });
      await prisma.bookingTimelineEvent.create({
        data: {
          bookingId: bid,
          title: 'Booking Cancelled',
          description: 'Event cancelled and resources released.',
          type: 'STATUS_CHANGE',
          date: '2026-06-11'
        }
      });
    }
  }

  console.log('Seeding Refund Requests & Payment Reminders...');
  await prisma.refundRequest.create({
    data: {
      paymentId: 'RCP-98402',
      reason: 'Decor adjustments and guest count reduced from original package specs.',
      refundAmount: 20000,
      refundStatus: 'REQUESTED'
    }
  });

  await prisma.paymentReminder.createMany({
    data: [
      { bookingId: 'b-2', type: 'ADVANCE', amount: 1000000, dueDate: '2026-10-01', status: 'SENT' },
      { bookingId: 'b-1', type: 'DUE', amount: 2990000, dueDate: '2026-11-05', status: 'PENDING' },
    ]
  });

  console.log('Database seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
