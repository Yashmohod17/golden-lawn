export interface ProfileUpdateInput {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  cateringPref?: string;
  themePref?: string;
  contactPref?: string;
}

export interface PaymentSimulationInput {
  bookingId: string;
  amount: number;
  method: string;
}

export function validateProfileUpdate(input: any): { error?: string; value?: ProfileUpdateInput } {
  const value: ProfileUpdateInput = {};

  if (input.name !== undefined) {
    if (typeof input.name !== 'string' || !input.name.trim()) {
      return { error: 'Name must be a non-empty string' };
    }
    value.name = input.name.trim();
  }

  if (input.phone !== undefined) {
    if (typeof input.phone !== 'string' || !input.phone.trim()) {
      return { error: 'Phone must be a non-empty string' };
    }
    value.phone = input.phone.trim();
  }

  if (input.email !== undefined) {
    if (typeof input.email !== 'string' || !/\S+@\S+\.\S+/.test(input.email)) {
      return { error: 'Email must be a valid email format' };
    }
    value.email = input.email.trim();
  }

  if (input.address !== undefined) {
    if (typeof input.address !== 'string' || !input.address.trim()) {
      return { error: 'Address must be a non-empty string' };
    }
    value.address = input.address.trim();
  }

  if (input.cateringPref !== undefined) {
    if (typeof input.cateringPref !== 'string') {
      return { error: 'Catering preference must be a string' };
    }
    value.cateringPref = input.cateringPref.trim();
  }

  if (input.themePref !== undefined) {
    if (typeof input.themePref !== 'string') {
      return { error: 'Theme preference must be a string' };
    }
    value.themePref = input.themePref.trim();
  }

  if (input.contactPref !== undefined) {
    if (typeof input.contactPref !== 'string') {
      return { error: 'Contact preference must be a string' };
    }
    value.contactPref = input.contactPref.trim();
  }

  return { value };
}

export function validatePaymentSimulation(input: any): { error?: string; value?: PaymentSimulationInput } {
  const { bookingId, amount, method } = input;

  if (!bookingId || typeof bookingId !== 'string' || !bookingId.trim()) {
    return { error: 'Booking ID is required and must be a string' };
  }

  const numericAmount = Number(amount);
  if (isNaN(numericAmount) || numericAmount <= 0) {
    return { error: 'Payment amount is required and must be a positive number' };
  }

  if (!method || typeof method !== 'string' || !method.trim()) {
    return { error: 'Payment method is required' };
  }

  return {
    value: {
      bookingId: bookingId.trim(),
      amount: numericAmount,
      method: method.trim(),
    },
  };
}
