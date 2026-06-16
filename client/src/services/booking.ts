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
  paid?: number;
  pending?: number;
  notes?: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  location?: string;
  coordinatorName?: string;
  coordinatorPhone?: string;
  createdAt: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export async function getBookings(): Promise<Booking[]> {
  const response = await fetch(`${API_URL}/api/bookings`);
  if (!response.ok) {
    throw new Error('Failed to fetch bookings');
  }
  return response.json();
}

export async function addBooking(booking: Omit<Booking, 'id' | 'status' | 'createdAt'>): Promise<Booking> {
  const response = await fetch(`${API_URL}/api/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(booking),
  });
  if (!response.ok) {
    throw new Error('Failed to add booking');
  }
  return response.json();
}

export async function updateBookingStatus(id: string, status: Booking['status']): Promise<Booking[]> {
  const response = await fetch(`${API_URL}/api/bookings/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) {
    throw new Error('Failed to update booking status');
  }
  return getBookings();
}

export async function deleteBooking(id: string): Promise<Booking[]> {
  const response = await fetch(`${API_URL}/api/bookings/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete booking');
  }
  return getBookings();
}
