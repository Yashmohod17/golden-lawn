export interface CreateOrderInput {
  bookingId: string;
  amount: number;
  paymentType: 'ADVANCE' | 'INSTALLMENT' | 'FINAL';
}

export interface VerifyPaymentInput {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface RefundRequestInput {
  paymentId: string;
  refundAmount: number;
  reason: string;
}

export interface RefundStatusInput {
  refundStatus: 'APPROVED' | 'REJECTED' | 'COMPLETED';
}

export interface GenerateInvoiceInput {
  bookingId: string;
  dueDate: string;
}

export function validateCreateOrder(input: any): { error?: string; value?: CreateOrderInput } {
  const { bookingId, amount, paymentType } = input;

  if (!bookingId || typeof bookingId !== 'string' || !bookingId.trim()) {
    return { error: 'Booking ID is required.' };
  }
  if (!amount || typeof amount !== 'number' || amount <= 0) {
    return { error: 'Payment amount must be a positive number.' };
  }
  if (!paymentType || !['ADVANCE', 'INSTALLMENT', 'FINAL'].includes(paymentType)) {
    return { error: 'Valid paymentType is required (ADVANCE, INSTALLMENT, or FINAL).' };
  }

  return {
    value: {
      bookingId: bookingId.trim(),
      amount,
      paymentType,
    },
  };
}

export function validateVerifyPayment(input: any): { error?: string; value?: VerifyPaymentInput } {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = input;

  if (!razorpay_order_id || typeof razorpay_order_id !== 'string' || !razorpay_order_id.trim()) {
    return { error: 'razorpay_order_id is required.' };
  }
  if (!razorpay_payment_id || typeof razorpay_payment_id !== 'string' || !razorpay_payment_id.trim()) {
    return { error: 'razorpay_payment_id is required.' };
  }
  if (!razorpay_signature || typeof razorpay_signature !== 'string' || !razorpay_signature.trim()) {
    return { error: 'razorpay_signature is required.' };
  }

  return {
    value: {
      razorpay_order_id: razorpay_order_id.trim(),
      razorpay_payment_id: razorpay_payment_id.trim(),
      razorpay_signature: razorpay_signature.trim(),
    },
  };
}

export function validateRefundRequest(input: any): { error?: string; value?: RefundRequestInput } {
  const { paymentId, refundAmount, reason } = input;

  if (!paymentId || typeof paymentId !== 'string' || !paymentId.trim()) {
    return { error: 'Payment ID is required.' };
  }
  if (!refundAmount || typeof refundAmount !== 'number' || refundAmount <= 0) {
    return { error: 'Refund amount must be a positive number.' };
  }
  if (!reason || typeof reason !== 'string' || !reason.trim()) {
    return { error: 'Reason is required.' };
  }

  return {
    value: {
      paymentId: paymentId.trim(),
      refundAmount,
      reason: reason.trim(),
    },
  };
}

export function validateRefundStatus(input: any): { error?: string; value?: RefundStatusInput } {
  const { refundStatus } = input;

  if (!refundStatus || !['APPROVED', 'REJECTED', 'COMPLETED'].includes(refundStatus)) {
    return { error: 'Valid refundStatus is required (APPROVED, REJECTED, or COMPLETED).' };
  }

  return {
    value: {
      refundStatus,
    },
  };
}

export function validateGenerateInvoice(input: any): { error?: string; value?: GenerateInvoiceInput } {
  const { bookingId, dueDate } = input;

  if (!bookingId || typeof bookingId !== 'string' || !bookingId.trim()) {
    return { error: 'Booking ID is required.' };
  }
  if (!dueDate || typeof dueDate !== 'string' || !dueDate.trim()) {
    return { error: 'Due date is required.' };
  }

  return {
    value: {
      bookingId: bookingId.trim(),
      dueDate: dueDate.trim(),
    },
  };
}
