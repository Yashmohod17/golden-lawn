export interface Booking {
  id: string;
  name: string;
  email: string;
  phone: string;
  eventType: string;
  date: string;
  guests: number;
  package: string;
  cost: number;
  notes?: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  createdAt: string;
}

const STORAGE_KEY = 'golden_celebrations_bookings';

const initialMockBookings: Booking[] = [
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
    createdAt: '2026-06-10T14:30:00.000Z',
  },
  {
    id: 'b-2',
    name: 'Aditya Deshmukh',
    email: 'aditya.deshmukh@yahoo.com',
    phone: '+91 98901 22345',
    eventType: 'Reception',
    date: '2026-11-22',
    guests: 800,
    package: 'GOLD PACKAGE',
    cost: 2200000,
    notes: 'Valet support for 200 cars and special sweet buffet counters.',
    status: 'PENDING',
    createdAt: '2026-06-12T09:15:00.000Z',
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
    createdAt: '2026-06-13T16:00:00.000Z',
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
    createdAt: '2026-06-11T11:45:00.000Z',
  },
];

export function getBookings(): Booking[] {
  if (typeof window === 'undefined') return [];
  
  const rawData = localStorage.getItem(STORAGE_KEY);
  if (!rawData) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialMockBookings));
    return initialMockBookings;
  }
  
  try {
    return JSON.parse(rawData);
  } catch (e) {
    console.error('Failed to parse bookings from localStorage, seeding default data', e);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialMockBookings));
    return initialMockBookings;
  }
}

export function saveBookings(bookings: Booking[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
}

export function addBooking(booking: Omit<Booking, 'id' | 'status' | 'createdAt'>): Booking {
  const bookings = getBookings();
  const newBooking: Booking = {
    ...booking,
    id: 'b-' + Math.random().toString(36).substr(2, 9),
    status: 'PENDING',
    createdAt: new Date().toISOString(),
  };
  
  bookings.push(newBooking);
  saveBookings(bookings);
  return newBooking;
}

export function updateBookingStatus(id: string, status: Booking['status']): Booking[] {
  const bookings = getBookings();
  const updated = bookings.map((b) => (b.id === id ? { ...b, status } : b));
  saveBookings(updated);
  return updated;
}

export function deleteBooking(id: string): Booking[] {
  const bookings = getBookings();
  const filtered = bookings.filter((b) => b.id !== id);
  saveBookings(filtered);
  return filtered;
}
