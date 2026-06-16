export interface NoteInput {
  note: string;
  authorName: string;
}

export function validateNoteInput(input: any): { error?: string; value?: NoteInput } {
  const { note, authorName } = input;
  if (!note || typeof note !== 'string' || !note.trim()) {
    return { error: 'Note content is required.' };
  }
  if (!authorName || typeof authorName !== 'string' || !authorName.trim()) {
    return { error: 'Author name is required.' };
  }
  return { value: { note: note.trim(), authorName: authorName.trim() } };
}

export interface DocumentInput {
  name: string;
  url: string;
  type: string;
}

export function validateDocumentInput(input: any): { error?: string; value?: DocumentInput } {
  const { name, url, type } = input;
  if (!name || typeof name !== 'string' || !name.trim()) {
    return { error: 'Document name is required.' };
  }
  if (!url || typeof url !== 'string' || !url.trim()) {
    return { error: 'Document URL is required.' };
  }
  if (!type || typeof type !== 'string' || !type.trim()) {
    return { error: 'Document type is required.' };
  }
  return { value: { name: name.trim(), url: url.trim(), type: type.trim() } };
}

export interface BlockedDateInput {
  date: string;
  reason: string;
  blockedBy: string;
}

export function validateBlockedDateInput(input: any): { error?: string; value?: BlockedDateInput } {
  const { date, reason, blockedBy } = input;
  if (!date || typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { error: 'Valid date (YYYY-MM-DD) is required.' };
  }
  if (!reason || typeof reason !== 'string' || !reason.trim()) {
    return { error: 'Reason for blocking date is required.' };
  }
  if (!blockedBy || typeof blockedBy !== 'string' || !blockedBy.trim()) {
    return { error: 'Name of person blocking the date is required.' };
  }
  return { value: { date, reason: reason.trim(), blockedBy: blockedBy.trim() } };
}

export interface InvoiceInput {
  bookingId: string;
  amount: number;
  dueDate: string;
  status: 'PAID' | 'UNPAID' | 'PARTIALLY_PAID' | 'OVERDUE';
}

export function validateInvoiceInput(input: any): { error?: string; value?: InvoiceInput } {
  const { bookingId, amount, dueDate, status } = input;
  if (!bookingId || typeof bookingId !== 'string') {
    return { error: 'Booking ID is required.' };
  }
  const parsedAmt = Number(amount);
  if (isNaN(parsedAmt) || parsedAmt <= 0) {
    return { error: 'Valid positive invoice amount is required.' };
  }
  if (!dueDate || typeof dueDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
    return { error: 'Valid due date (YYYY-MM-DD) is required.' };
  }
  if (!status || !['PAID', 'UNPAID', 'PARTIALLY_PAID', 'OVERDUE'].includes(status)) {
    return { error: 'Status must be one of PAID, UNPAID, PARTIALLY_PAID, or OVERDUE.' };
  }
  return { value: { bookingId, amount: parsedAmt, dueDate, status } };
}

export interface StaffInput {
  name: string;
  email: string;
  password?: string;
  role: string;
  phone: string;
  salary?: number;
  status?: string;
}

export function validateStaffInput(input: any, isUpdate = false): { error?: string; value?: StaffInput } {
  const { name, email, password, role, phone, salary, status } = input;
  const value: StaffInput = { name: '', email: '', role: '', phone: '' };

  if (!isUpdate || name !== undefined) {
    if (!name || typeof name !== 'string' || !name.trim()) return { error: 'Staff name is required.' };
    value.name = name.trim();
  }
  if (!isUpdate || email !== undefined) {
    if (!email || typeof email !== 'string' || !/\S+@\S+\.\S+/.test(email)) return { error: 'Valid email is required.' };
    value.email = email.trim();
  }
  if (!isUpdate || password !== undefined) {
    if (!isUpdate && (!password || typeof password !== 'string' || password.length < 6)) {
      return { error: 'Password must be at least 6 characters.' };
    }
    if (password !== undefined) value.password = password;
  }
  if (!isUpdate || role !== undefined) {
    if (!role || typeof role !== 'string' || !role.trim()) return { error: 'Staff role is required.' };
    value.role = role.trim();
  }
  if (!isUpdate || phone !== undefined) {
    if (!phone || typeof phone !== 'string' || !phone.trim()) return { error: 'Staff phone number is required.' };
    value.phone = phone.trim();
  }
  if (salary !== undefined) {
    const val = Number(salary);
    if (isNaN(val) || val < 0) return { error: 'Salary must be a non-negative number.' };
    value.salary = val;
  }
  if (status !== undefined) {
    value.status = String(status).trim();
  }

  return { value };
}

export interface TaskInput {
  title: string;
  description?: string;
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate?: string;
  assignedToId?: string | null;
}

export function validateTaskInput(input: any, isUpdate = false): { error?: string; value?: TaskInput } {
  const { title, description, status, priority, dueDate, assignedToId } = input;
  const value: TaskInput = { title: '' };

  if (!isUpdate || title !== undefined) {
    if (!title || typeof title !== 'string' || !title.trim()) return { error: 'Task title is required.' };
    value.title = title.trim();
  }
  if (description !== undefined) {
    value.description = description ? String(description).trim() : undefined;
  }
  if (status !== undefined) {
    if (!['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].includes(status)) return { error: 'Invalid task status.' };
    value.status = status;
  }
  if (priority !== undefined) {
    if (!['LOW', 'MEDIUM', 'HIGH'].includes(priority)) return { error: 'Invalid task priority.' };
    value.priority = priority;
  }
  if (dueDate !== undefined) {
    if (dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) return { error: 'Valid due date (YYYY-MM-DD) is required.' };
    value.dueDate = dueDate || undefined;
  }
  if (assignedToId !== undefined) {
    value.assignedToId = assignedToId;
  }

  return { value };
}

export interface LeadInput {
  name: string;
  email?: string;
  phone: string;
  source?: string;
  status?: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'LOST' | 'WON';
  notes?: string;
}

export function validateLeadInput(input: any, isUpdate = false): { error?: string; value?: LeadInput } {
  const { name, email, phone, source, status, notes } = input;
  const value: LeadInput = { name: '', phone: '' };

  if (!isUpdate || name !== undefined) {
    if (!name || typeof name !== 'string' || !name.trim()) return { error: 'Lead name is required.' };
    value.name = name.trim();
  }
  if (!isUpdate || phone !== undefined) {
    if (!phone || typeof phone !== 'string' || !phone.trim()) return { error: 'Lead phone number is required.' };
    value.phone = phone.trim();
  }
  if (email !== undefined) {
    if (email && !/\S+@\S+\.\S+/.test(email)) return { error: 'Invalid email address.' };
    value.email = email ? email.trim() : undefined;
  }
  if (source !== undefined) {
    value.source = source ? String(source).trim() : undefined;
  }
  if (status !== undefined) {
    if (!['NEW', 'CONTACTED', 'QUALIFIED', 'LOST', 'WON'].includes(status)) return { error: 'Invalid lead status.' };
    value.status = status;
  }
  if (notes !== undefined) {
    value.notes = notes ? String(notes).trim() : undefined;
  }

  return { value };
}

export interface InquiryInput {
  leadId: string;
  eventType: string;
  eventDate: string;
  guests: number;
  notes?: string;
  status?: 'OPEN' | 'CONVERTED' | 'CLOSED';
}

export function validateInquiryInput(input: any): { error?: string; value?: InquiryInput } {
  const { leadId, eventType, eventDate, guests, notes, status } = input;
  if (!leadId) return { error: 'Lead ID is required.' };
  if (!eventType || typeof eventType !== 'string' || !eventType.trim()) return { error: 'Event Type is required.' };
  if (!eventDate || !/^\d{4}-\d{2}-\d{2}$/.test(eventDate)) return { error: 'Valid event date (YYYY-MM-DD) is required.' };
  const guestCount = Number(guests);
  if (isNaN(guestCount) || guestCount < 100) return { error: 'Guests count must be at least 100.' };

  return {
    value: {
      leadId,
      eventType: eventType.trim(),
      eventDate,
      guests: guestCount,
      notes: notes ? String(notes).trim() : undefined,
      status: status || 'OPEN'
    }
  };
}

export interface FollowUpInput {
  inquiryId: string;
  date: string;
  notes: string;
  outcome?: string;
  nextAction?: string;
  status?: 'SCHEDULED' | 'COMPLETED' | 'MISSED';
}

export function validateFollowUpInput(input: any): { error?: string; value?: FollowUpInput } {
  const { inquiryId, date, notes, outcome, nextAction, status } = input;
  if (!inquiryId) return { error: 'Inquiry ID is required.' };
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return { error: 'Valid follow-up date (YYYY-MM-DD) is required.' };
  if (!notes || typeof notes !== 'string' || !notes.trim()) return { error: 'Follow-up notes are required.' };

  return {
    value: {
      inquiryId,
      date,
      notes: notes.trim(),
      outcome: outcome ? String(outcome).trim() : undefined,
      nextAction: nextAction ? String(nextAction).trim() : undefined,
      status: status || 'SCHEDULED'
    }
  };
}
