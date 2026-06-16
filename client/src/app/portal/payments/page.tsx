'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, IndianRupee, CheckCircle2, Clock, 
  ArrowRight, Sparkles, Receipt, ShieldCheck, AlertCircle,
  Download, Printer, XCircle, ArrowUpRight, HelpCircle, Laptop
} from 'lucide-react';
import { usePortal } from '../../../lib/PortalContext';
import confetti from 'canvas-confetti';

// Load Razorpay SDK Script dynamically
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

function PaymentsContent() {
  const searchParams = useSearchParams();
  const { bookings, payments, invoices, refreshData } = usePortal();
  
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [validationError, setValidationError] = useState('');

  // Invoice modal state
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  // Simulated Checkout Modal State
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutOrder, setCheckoutOrder] = useState<any>(null);
  const [checkoutStep, setCheckoutStep] = useState<'select' | 'processing' | 'success'>('select');
  const [simulatedMethod, setSimulatedMethod] = useState<'upi' | 'card'>('upi');

  // Find bookings with pending balances
  const billableBookings = bookings.filter(b => b.status !== 'CANCELLED' && b.pending > 0);

  // Pre-fill from query params if navigated from booking details
  useEffect(() => {
    const bookingIdParam = searchParams.get('bookingId');
    const amountParam = searchParams.get('amount');
    
    if (bookingIdParam) {
      setSelectedBookingId(bookingIdParam);
    } else if (billableBookings.length > 0) {
      setSelectedBookingId(billableBookings[0].id);
    }

    if (amountParam) {
      setPaymentAmount(amountParam);
    }
  }, [searchParams, bookings]);

  // Set default amount when booking changes
  useEffect(() => {
    if (!selectedBookingId) return;
    const booking = bookings.find(b => b.id === selectedBookingId);
    if (booking && !searchParams.get('amount')) {
      setPaymentAmount(booking.pending.toString());
    }
  }, [selectedBookingId, bookings, searchParams]);

  // Calculations
  const totalPaid = payments
    .filter(p => p.status === 'SUCCESS')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalOutstanding = bookings
    .filter(b => b.status !== 'CANCELLED')
    .reduce((sum, b) => sum + b.pending, 0);

  const handleBookingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedBookingId(id);
    setValidationError('');
    const booking = bookings.find(b => b.id === id);
    if (booking) {
      setPaymentAmount(booking.pending.toString());
    }
  };

  // Triggers the order creation and Razorpay initialization flow
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');
    setSuccessMessage('');

    if (!selectedBookingId) {
      setValidationError('Please select a booking.');
      return;
    }

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      setValidationError('Please enter a valid positive payment amount.');
      return;
    }

    const booking = bookings.find(b => b.id === selectedBookingId);
    if (!booking) {
      setValidationError('Selected booking does not exist.');
      return;
    }

    if (amount > booking.pending) {
      setValidationError(`Amount exceeds the remaining outstanding balance of ₹${booking.pending.toLocaleString()}.`);
      return;
    }

    try {
      setIsProcessing(true);
      const token = localStorage.getItem('portal_access_token');
      const customerId = localStorage.getItem('portal_customer_id');

      // Create Order
      const orderRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          bookingId: selectedBookingId,
          amount,
          paymentType: booking.paid === 0 ? 'ADVANCE' : 'INSTALLMENT'
        })
      });

      if (!orderRes.ok) {
        const err = await orderRes.json();
        throw new Error(err.error || 'Failed to create payment gateway order.');
      }

      const orderData = await orderRes.json();
      
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      
      // If Razorpay keys are real and script is loaded, launch standard Razorpay
      if (scriptLoaded && orderData.keyId !== 'rzp_test_mock_key_id') {
        const options = {
          key: orderData.keyId,
          amount: orderData.amount * 100, // in paise
          currency: orderData.currency,
          name: 'Golden Celebrations Lawn',
          description: `${orderData.paymentType} Milestone Payment`,
          order_id: orderData.orderId,
          handler: async function (response: any) {
            setIsProcessing(true);
            try {
              const verifyRes = await fetch('/api/payments/verify', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  bookingId: selectedBookingId,
                  paymentType: orderData.paymentType
                })
              });

              if (!verifyRes.ok) {
                const errData = await verifyRes.json();
                throw new Error(errData.error || 'Signature verification failed.');
              }

              confetti({
                particleCount: 150,
                spread: 80,
                origin: { y: 0.6 },
                colors: ['#D4AF37', '#B8962D', '#7A0016', '#BA3356', '#F3E5AB']
              });

              setSuccessMessage(`Payment of ₹${amount.toLocaleString()} processed successfully via Razorpay!`);
              setPaymentAmount('');
              refreshData();
            } catch (err: any) {
              setValidationError(err.message || 'Signature verification failed.');
            } finally {
              setIsProcessing(false);
            }
          },
          prefill: {
            name: customerId || 'Valued Client',
          },
          theme: {
            color: '#7A0016'
          }
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
        setIsProcessing(false);
      } else {
        // Fallback to beautiful simulated payment console overlay
        setCheckoutOrder(orderData);
        setCheckoutStep('select');
        setShowCheckoutModal(true);
        setIsProcessing(false);
      }
    } catch (err: any) {
      setValidationError(err.message || 'Payment initializer error. Please try again.');
      setIsProcessing(false);
    }
  };

  // Handles simulated checkout completion
  const handleSimulatePaymentComplete = async () => {
    if (!checkoutOrder) return;
    setCheckoutStep('processing');
    
    // Simulate short server-bank handshakes latency (1.5 seconds)
    setTimeout(async () => {
      try {
        const token = localStorage.getItem('portal_access_token');
        const randId = Math.floor(100000 + Math.random() * 900000);
        
        const verifyRes = await fetch('/api/payments/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            razorpay_order_id: checkoutOrder.orderId,
            razorpay_payment_id: `pay_mock_${randId}`,
            razorpay_signature: `sig_mock_${randId}`,
            bookingId: selectedBookingId,
            paymentType: checkoutOrder.paymentType
          })
        });

        if (!verifyRes.ok) {
          const errData = await verifyRes.json();
          throw new Error(errData.error || 'Simulated verify failed.');
        }

        setCheckoutStep('success');
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#D4AF37', '#B8962D', '#7A0016', '#BA3356', '#F3E5AB']
        });

        setSuccessMessage(`Payment of ₹${checkoutOrder.amount.toLocaleString()} authorized successfully via simulated checkout!`);
        setPaymentAmount('');
        refreshData();
      } catch (err: any) {
        setValidationError(err.message || 'Simulated verification failed.');
        setShowCheckoutModal(false);
      }
    }, 1500);
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header */}
      <div className="print:hidden">
        <h1 className="font-serif text-3xl font-bold tracking-wide text-foreground">
          Payment History & Billing
        </h1>
        <p className="text-xs text-foreground/60 mt-1 flex items-center gap-1.5">
          <Sparkles className="h-3 w-3 text-gold-500" />
          Clear outstanding milestone dues, inspect invoices and download receipts
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 print:hidden">
        <div className="glass-card rounded-3xl p-6 border border-gold-400/15 flex items-start gap-4">
          <div className="p-3.5 rounded-xl bg-gold-400/10 text-gold-500">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/50">Total Settled Payments</span>
            <h3 className="font-serif text-2xl font-bold text-foreground">₹{totalPaid.toLocaleString('en-IN')}</h3>
            <p className="text-[10px] text-foreground/50">Verified receipts settled</p>
          </div>
        </div>

        <div className="glass-card rounded-3xl p-6 border border-gold-400/15 flex items-start gap-4">
          <div className="p-3.5 rounded-xl bg-gold-400/10 text-rose-600 dark:text-rose-400">
            <Clock className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/50">Outstanding Milestone Balance</span>
            <h3 className="font-serif text-2xl font-bold text-foreground">₹{totalOutstanding.toLocaleString('en-IN')}</h3>
            <p className="text-[10px] text-foreground/50">Due 30 days before event dates</p>
          </div>
        </div>
      </div>

      {/* Mid Grid: Checkout Trigger & Transaction lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 print:hidden">
        
        {/* Payment Checkout Panel */}
        <div className="lg:col-span-1 glass-panel rounded-3xl border border-gold-400/15 p-6 shadow-md h-fit">
          <div className="space-y-1 mb-6">
            <h3 className="font-serif text-xl font-bold tracking-wide text-foreground">Settle Outstanding Milestone</h3>
            <p className="text-xs text-foreground/60">Secure payment via Razorpay</p>
          </div>

          {billableBookings.length > 0 ? (
            <form onSubmit={handleCheckoutSubmit} className="space-y-4">
              
              {validationError && (
                <div className="flex items-start gap-2 text-xs text-red-500 bg-red-500/5 p-3 rounded-xl border border-red-500/10">
                  <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                  <span>{validationError}</span>
                </div>
              )}

              {successMessage && (
                <div className="flex items-start gap-2 text-xs text-emerald-600 bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10">
                  <CheckCircle2 className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Select Booking */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-foreground/70 mb-1.5">
                  Select Booking Event
                </label>
                <select
                  value={selectedBookingId}
                  onChange={handleBookingChange}
                  className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-900 px-3 py-3 text-xs text-foreground outline-none focus:border-gold-400 focus:bg-white dark:focus:bg-zinc-950 transition-all font-sans"
                >
                  {billableBookings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.eventType} ({b.id}) - Bal: ₹{b.pending.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-foreground/70 mb-1.5">
                  Amount to Pay (INR)
                </label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="Enter custom amount"
                  className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-900 px-3.5 py-3 text-xs text-foreground outline-none focus:border-gold-400 focus:bg-white dark:focus:bg-zinc-950 transition-all font-mono font-bold"
                />
              </div>

              <div className="flex items-center gap-2 text-[9px] text-foreground/50 bg-gold-400/5 p-3 rounded-lg border border-gold-400/10 leading-relaxed">
                <ShieldCheck className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
                <span>PCI-DSS Secured. Verification occurs on-chain via signature verification.</span>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold-600 to-gold-400 py-3.5 font-sans text-xs font-bold tracking-widest text-zinc-950 uppercase shadow-lg shadow-gold-600/10 hover:from-gold-500 hover:to-gold-300 transition-all cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? 'Connecting...' : 'Pay Outstanding Milestone'}
              </button>

            </form>
          ) : (
            <div className="text-center py-8 text-xs text-foreground/40 space-y-2">
              <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto opacity-70" />
              <p className="font-semibold text-foreground">Outstanding dues are fully paid!</p>
              <p className="px-4 text-[11px]">Thank you for planning your events at Golden Celebrations Lawn.</p>
            </div>
          )}
        </div>

        {/* Invoices & History lists */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Invoice Center */}
          <div className="glass-panel rounded-3xl border border-gold-400/15 p-6 shadow-md space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-serif text-lg font-bold tracking-wide text-foreground">Invoices & Statements</h3>
              <span className="text-[10px] text-foreground/45 uppercase tracking-wider">Historical Invoice ledger</span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gold-400/10">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-gold-400/15 bg-gold-400/5 font-serif text-[11px] font-bold text-foreground">
                    <th className="p-3">Invoice No</th>
                    <th className="p-3">Due Date</th>
                    <th className="p-3">Cost (₹)</th>
                    <th className="p-3">Settled / Remaining (₹)</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold-400/10 text-foreground/85">
                  {invoices.map((inv: any) => (
                    <tr key={inv.id} className="hover:bg-gold-400/5 transition-colors">
                      <td className="p-3 font-semibold text-foreground">{inv.invoiceNo || inv.invoiceNumber}</td>
                      <td className="p-3">{inv.dueDate}</td>
                      <td className="p-3 font-bold text-foreground/80">₹{inv.amount.toLocaleString()}</td>
                      <td className="p-3 font-mono font-medium">
                        <span className="text-emerald-600 font-bold">₹{inv.paidAmount?.toLocaleString() || 0}</span>
                        <span className="mx-1 text-foreground/30">/</span>
                        <span className="text-rose-600 font-bold">₹{inv.remainingAmount?.toLocaleString() || inv.amount}</span>
                      </td>
                      <td className="p-3">
                        <span className={`rounded-full px-2 py-0.5 text-[8px] font-bold uppercase ${
                          inv.status === 'PAID'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                            : inv.status === 'PARTIALLY_PAID'
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400 animate-pulse'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedInvoice(inv);
                            setShowInvoiceModal(true);
                          }}
                          className="px-2.5 py-1 rounded bg-gold-400/10 hover:bg-gold-400 text-zinc-950 text-[9px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          View / Print
                        </button>
                      </td>
                    </tr>
                  ))}
                  {invoices.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-xs text-foreground/40">
                        No invoices generated. Dues generate upon advance booking deposits.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Historical Payments / Receipts */}
          <div className="glass-panel rounded-3xl border border-gold-400/15 p-6 shadow-md space-y-4">
            <h3 className="font-serif text-lg font-bold tracking-wide text-foreground">Verified Payments Ledger</h3>
            
            <div className="overflow-x-auto rounded-xl border border-gold-400/10">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-gold-400/15 bg-gold-400/5 font-serif text-[11px] font-bold text-foreground">
                    <th className="p-3">Receipt Ref</th>
                    <th className="p-3">Payment Date</th>
                    <th className="p-3">Milestone Type</th>
                    <th className="p-3">Method</th>
                    <th className="p-3">Settled (₹)</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold-400/10 text-foreground/80">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-gold-400/5 transition-colors">
                      <td className="p-3 font-semibold text-foreground flex items-center gap-1.5 font-mono">
                        <Receipt className="h-3.5 w-3.5 text-gold-500" />
                        <span>{p.id}</span>
                      </td>
                      <td className="p-3">{p.date}</td>
                      <td className="p-3 font-semibold text-[10px] text-foreground/70">{p.paymentType || 'ADVANCE'}</td>
                      <td className="p-3 text-[10px]">{p.method}</td>
                      <td className="p-3 font-bold text-gold-600 dark:text-gold-400">₹{p.amount.toLocaleString()}</td>
                      <td className="p-3">
                        <span className={`rounded-full px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider ${
                          p.paymentStatus === 'PAID' || p.status === 'SUCCESS'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                            : p.paymentStatus === 'REFUNDED' || p.status === 'REFUNDED'
                            ? 'bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400'
                        }`}>
                          {p.paymentStatus || p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {payments.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-xs text-foreground/40">
                        No transaction logs located.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>

      {/* Invoice Printable View Sheet Modal */}
      <AnimatePresence>
        {showInvoiceModal && selectedInvoice && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in print:bg-white print:p-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-900 border border-gold-400/25 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto print:border-none print:shadow-none print:max-h-full print:overflow-visible print:p-0 print:m-0"
            >
              
              {/* Modal header actions */}
              <div className="flex justify-between items-center border-b border-gold-400/10 pb-3 print:hidden">
                <span className="font-serif text-sm font-bold text-foreground">Billing Statement Details</span>
                <div className="flex gap-2">
                  <button
                    onClick={handlePrintInvoice}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gold-400 text-zinc-950 font-bold uppercase tracking-wider text-[10px] cursor-pointer"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    Print / PDF
                  </button>
                  <button
                    onClick={() => { setShowInvoiceModal(false); setSelectedInvoice(null); }}
                    className="p-1 rounded-lg text-foreground/50 hover:bg-gold-400/10 hover:text-gold-500 cursor-pointer"
                  >
                    <XCircle className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Printable Area */}
              <div className="space-y-6 print:m-0 print:p-0">
                <div className="flex justify-between items-start border-b border-gold-400/10 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-[9px] text-gold-500 font-bold uppercase tracking-wider">
                      <Sparkles className="h-3 w-3" />
                      <span>Golden Celebrations Lawn</span>
                    </div>
                    <h2 className="font-serif text-xl font-bold text-foreground">INVOICE STATEMENT</h2>
                    <p className="text-[9px] font-mono text-foreground/50">No: {selectedInvoice.invoiceNo || selectedInvoice.invoiceNumber}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <span className="rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider">
                      {selectedInvoice.status}
                    </span>
                    <p className="text-[9px] text-foreground/60">Due Date: {selectedInvoice.dueDate}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-foreground/80 leading-relaxed">
                  <div className="space-y-1 border-l-2 border-gold-500 pl-3">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400 block mb-1">Billed To:</span>
                    <p className="font-bold text-foreground">Customer: Rajesh Kumar</p>
                    <p>rajesh.kumar@gmail.com</p>
                    <p>+91 98765 43210</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400 block mb-1">Venue Booking Event:</span>
                    <p className="font-bold text-foreground">Type: {selectedInvoice.booking?.eventType || 'Milestone Ceremony'}</p>
                    <p>Date: {selectedInvoice.booking?.date || 'N/A'}</p>
                    <p>Location: {selectedInvoice.booking?.location || 'Premium Front Stage & Buffet Lawn'}</p>
                  </div>
                </div>

                <div className="rounded-xl border border-gold-400/10 bg-gold-400/5 p-4 space-y-3">
                  <div className="flex justify-between text-xs font-bold border-b border-gold-400/10 pb-2">
                    <span>Itemized Breakdown</span>
                    <span>Cost (₹)</span>
                  </div>
                  <div className="flex justify-between text-xs text-foreground/80">
                    <span>Venue Rent & Banqueting Services Package</span>
                    <span className="font-mono">₹{selectedInvoice.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs text-emerald-600 font-bold border-t border-gold-400/5 pt-2">
                    <span>Milestones Settled (Cleared)</span>
                    <span className="font-mono">- ₹{(selectedInvoice.paidAmount || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs text-rose-600 font-bold">
                    <span>Total Dues Outstanding</span>
                    <span className="font-mono text-sm font-bold">₹{(selectedInvoice.remainingAmount || 0).toLocaleString()}</span>
                  </div>
                </div>

                <p className="text-[8px] text-center text-foreground/40 italic leading-relaxed pt-2 border-t border-gold-400/10">
                  Thank you for your business. For billing queries, support coordinates: billing@goldencelebrations.in.
                </p>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Simulated Razorpay Checkout Modal (hidden during print) */}
      <AnimatePresence>
        {showCheckoutModal && checkoutOrder && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in print:hidden">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-950 border border-gold-400/30 rounded-3xl overflow-hidden max-w-sm w-full shadow-2xl text-zinc-100 font-sans"
            >
              
              {/* Header */}
              <div className="bg-gradient-to-r from-burgundy-950 to-zinc-900 px-6 py-4 flex justify-between items-center border-b border-gold-400/20">
                <div className="flex items-center gap-1.5">
                  <Laptop className="h-4.5 w-4.5 text-gold-400" />
                  <span className="text-xs uppercase font-bold tracking-widest text-gold-400">Razorpay Sandbox</span>
                </div>
                <button 
                  onClick={() => { setShowCheckoutModal(false); setCheckoutOrder(null); }}
                  className="p-1 rounded-lg text-zinc-500 hover:text-gold-400 transition-colors cursor-pointer"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6">
                
                {checkoutStep === 'select' && (
                  <div className="space-y-4">
                    <div className="text-center space-y-1.5">
                      <p className="text-[10px] text-zinc-400 uppercase tracking-widest">Payment Authorization Amount</p>
                      <h4 className="font-serif text-2xl font-bold text-gold-400 font-mono">₹{checkoutOrder.amount.toLocaleString()}</h4>
                      <p className="text-[9px] text-zinc-500 font-mono">Order: {checkoutOrder.orderId}</p>
                    </div>

                    <div className="h-[1px] bg-zinc-800" />

                    <div className="space-y-2.5">
                      <p className="text-[9px] uppercase font-bold text-zinc-400 tracking-wider">Select Mock Method</p>
                      
                      <button
                        onClick={() => setSimulatedMethod('upi')}
                        className={`w-full p-3.5 rounded-xl border flex items-center justify-between transition-all text-xs cursor-pointer ${
                          simulatedMethod === 'upi'
                            ? 'border-gold-400 bg-gold-400/5 text-gold-400 font-bold'
                            : 'border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-gold-500/10 text-gold-500 flex items-center justify-center font-bold text-[10px]">⚡</span>
                          <span>Simulated UPI (Google Pay fallback)</span>
                        </div>
                        {simulatedMethod === 'upi' && <span className="text-gold-400 text-xs">✓</span>}
                      </button>

                      <button
                        onClick={() => setSimulatedMethod('card')}
                        className={`w-full p-3.5 rounded-xl border flex items-center justify-between transition-all text-xs cursor-pointer ${
                          simulatedMethod === 'card'
                            ? 'border-gold-400 bg-gold-400/5 text-gold-400 font-bold'
                            : 'border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <CreditCard className="w-4.5 h-4.5 text-zinc-400" />
                          <span>Simulated Credit / Debit Card</span>
                        </div>
                        {simulatedMethod === 'card' && <span className="text-gold-400 text-xs">✓</span>}
                      </button>
                    </div>

                    <button
                      onClick={handleSimulatePaymentComplete}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold-500 to-gold-300 py-3 text-xs font-bold tracking-widest text-zinc-950 uppercase shadow-lg shadow-gold-500/10 hover:from-gold-400 hover:to-gold-200 transition-all cursor-pointer"
                    >
                      Authorize Sandbox Payment
                    </button>
                  </div>
                )}

                {checkoutStep === 'processing' && (
                  <div className="py-8 text-center space-y-4">
                    <div className="h-10 w-10 border-2 border-gold-400 border-t-transparent rounded-full animate-spin mx-auto" />
                    <div className="space-y-1">
                      <p className="text-xs font-bold uppercase tracking-widest text-gold-400">Verifying signature key...</p>
                      <p className="text-[9px] text-zinc-400">Performing backend sha256 handshake verification</p>
                    </div>
                  </div>
                )}

                {checkoutStep === 'success' && (
                  <div className="py-8 text-center space-y-4">
                    <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-full w-fit mx-auto border border-emerald-500/20">
                      <CheckCircle2 className="h-10 w-10 animate-bounce" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">Payment cleared successfully!</p>
                      <p className="text-[9px] text-zinc-500">Database status: CONFIRMED / ADVANCE_PAID</p>
                    </div>
                    <button
                      onClick={() => { setShowCheckoutModal(false); setCheckoutOrder(null); }}
                      className="px-4 py-1.5 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-900 text-xs font-semibold uppercase tracking-wider text-zinc-300 cursor-pointer"
                    >
                      Close Window
                    </button>
                  </div>
                )}

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default function PaymentHistory() {
  return (
    <Suspense fallback={
      <div className="h-[60vh] flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <PaymentsContent />
    </Suspense>
  );
}
