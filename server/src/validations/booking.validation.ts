export interface BookingInput {
  name: string;
  email: string;
  phone: string;
  eventType: string;
  date: string;
  guests: number;
  package: string;
  cost: number;
  notes?: string;
}

export function validateBookingInput(input: any): { error?: string; value?: BookingInput } {
  const { name, email, phone, eventType, date, guests, pkg, package: packageTier, cost, notes } = input;

  if (!name || typeof name !== 'string' || !name.trim()) {
    return { error: 'Full Name is required and must be a string' };
  }
  if (!email || typeof email !== 'string' || !/\S+@\S+\.\S+/.test(email)) {
    return { error: 'A valid email address is required' };
  }
  if (!phone || typeof phone !== 'string' || !phone.trim()) {
    return { error: 'Phone number is required' };
  }
  if (!date || typeof date !== 'string' || !date.trim()) {
    return { error: 'Date is required' };
  }
  if (!eventType || typeof eventType !== 'string' || !eventType.trim()) {
    return { error: 'Event Type is required' };
  }
  
  const guestCount = parseInt(guests);
  if (isNaN(guestCount) || guestCount < 100) {
    return { error: 'Guest count must be at least 100' };
  }

  const finalPackage = (packageTier || pkg || '').trim();
  if (!finalPackage) {
    return { error: 'Selected Package is required' };
  }

  const finalCost = Number(cost);
  if (isNaN(finalCost) || finalCost <= 0) {
    return { error: 'Valid estimate cost is required' };
  }

  return {
    value: {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      eventType: eventType.trim(),
      date: date.trim(),
      guests: guestCount,
      package: finalPackage,
      cost: finalCost,
      notes: notes ? String(notes).trim() : undefined,
    },
  };
}

export interface BookingUpdateInput {
  name?: string;
  email?: string;
  phone?: string;
  eventType?: string;
  date?: string;
  guests?: number;
  package?: string;
  cost?: number;
  paid?: number;
  pending?: number;
  notes?: string;
  status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  location?: string;
  coordinatorName?: string;
  coordinatorPhone?: string;
  milestones?: { label: string; date?: string | null; status: string }[];
}

export function validateBookingUpdate(input: any): { error?: string; value?: BookingUpdateInput } {
  const { name, email, phone, eventType, date, guests, pkg, package: packageTier, cost, paid, pending, notes, status, location, coordinatorName, coordinatorPhone, milestones } = input;
  const value: BookingUpdateInput = {};

  if (name !== undefined) {
    if (typeof name !== 'string' || !name.trim()) {
      return { error: 'Full Name must be a non-empty string' };
    }
    value.name = name.trim();
  }

  if (email !== undefined) {
    if (typeof email !== 'string' || !/\S+@\S+\.\S+/.test(email)) {
      return { error: 'A valid email address is required' };
    }
    value.email = email.trim();
  }

  if (phone !== undefined) {
    if (typeof phone !== 'string' || !phone.trim()) {
      return { error: 'Phone number must be a non-empty string' };
    }
    value.phone = phone.trim();
  }

  if (date !== undefined) {
    if (typeof date !== 'string' || !date.trim()) {
      return { error: 'Booking Date must be a non-empty string' };
    }
    value.date = date.trim();
  }

  if (eventType !== undefined) {
    if (typeof eventType !== 'string' || !eventType.trim()) {
      return { error: 'Event Type must be a non-empty string' };
    }
    value.eventType = eventType.trim();
  }

  if (guests !== undefined) {
    const guestCount = parseInt(guests);
    if (isNaN(guestCount) || guestCount < 100) {
      return { error: 'Guest count must be at least 100' };
    }
    value.guests = guestCount;
  }

  const finalPackage = (packageTier || pkg);
  if (finalPackage !== undefined) {
    if (typeof finalPackage !== 'string' || !finalPackage.trim()) {
      return { error: 'Package Tier must be a non-empty string' };
    }
    value.package = finalPackage.trim();
  }

  if (cost !== undefined) {
    const costVal = Number(cost);
    if (isNaN(costVal) || costVal <= 0) {
      return { error: 'Valid estimate cost must be a positive number' };
    }
    value.cost = costVal;
  }

  if (paid !== undefined) {
    const paidVal = Number(paid);
    if (isNaN(paidVal) || paidVal < 0) {
      return { error: 'Paid amount must be a non-negative number' };
    }
    value.paid = paidVal;
  }

  if (pending !== undefined) {
    const pendingVal = Number(pending);
    if (isNaN(pendingVal) || pendingVal < 0) {
      return { error: 'Pending amount must be a non-negative number' };
    }
    value.pending = pendingVal;
  }

  if (notes !== undefined) {
    value.notes = notes ? String(notes).trim() : undefined;
  }

  if (status !== undefined) {
    if (!['PENDING', 'CONFIRMED', 'CANCELLED'].includes(status)) {
      return { error: 'Status must be one of PENDING, CONFIRMED, or CANCELLED' };
    }
    value.status = status as any;
  }

  if (location !== undefined) {
    if (typeof location !== 'string' || !location.trim()) {
      return { error: 'Location must be a non-empty string' };
    }
    value.location = location.trim();
  }

  if (coordinatorName !== undefined) {
    if (typeof coordinatorName !== 'string' || !coordinatorName.trim()) {
      return { error: 'Coordinator Name must be a non-empty string' };
    }
    value.coordinatorName = coordinatorName.trim();
  }

  if (coordinatorPhone !== undefined) {
    if (typeof coordinatorPhone !== 'string' || !coordinatorPhone.trim()) {
      return { error: 'Coordinator Phone must be a non-empty string' };
    }
    value.coordinatorPhone = coordinatorPhone.trim();
  }

  if (milestones !== undefined) {
    if (Array.isArray(milestones)) {
      value.milestones = milestones.map((m: any) => ({
        label: String(m.label).trim(),
        date: m.date ? String(m.date).trim() : null,
        status: String(m.status).trim(),
      }));
    }
  }

  return { value };
}
