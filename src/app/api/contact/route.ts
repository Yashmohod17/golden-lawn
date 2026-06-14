import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, eventType, date, guests, pkg, cost, notes } = body;

    // Server-side validation
    if (!name || !email || !phone || !date) {
      return NextResponse.json(
        { error: 'Missing required booking fields.' },
        { status: 400 }
      );
    }

    // In a real application, you would:
    // 1. Store this event in a Database (e.g. Prisma / Postgres)
    // 2. Dispatch a notification email using Resend / SendGrid
    // 3. Trigger a Slack or WhatsApp webhook
    console.log('--- NEW EVENT BOOKING INQUIRY ---');
    console.log(`Client: ${name} (${email}) | Phone: ${phone}`);
    console.log(`Event: ${eventType.toUpperCase()} | Date: ${date} | Guests: ${guests}`);
    console.log(`Package: ${pkg} | Estimated cost: $${cost}`);
    console.log(`Notes: ${notes || 'None'}`);
    console.log('---------------------------------');

    // Simulate database write delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    return NextResponse.json(
      {
        success: true,
        message: 'Inquiry received successfully. Our booking coordinator will contact you shortly.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
