'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, CreditCard, User, Calendar, Receipt, Shield, 
  CheckCircle, AlertCircle, Printer, Download, Sparkles, BookOpen, Clock
} from 'lucide-react';
import Link from 'next/link';
import { adminService } from '../../../../services/admin';

export default function PaymentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDetails = async () => {
    try {
      setLoading(true);
      setError('');
      
      let data = null;
      try {
        data = await adminService.getPaymentDetails(id);
      } catch (err) {
        try {
          const inv = await adminService.getInvoiceDetails(id);
          data = {
            id: inv.invoiceNo || inv.invoiceNumber || inv.id,
            amount: inv.amount,
            paymentType: 'INVOICE STATEMENT',
            paymentStatus: inv.status,
            paymentMethod: 'Invoice Billing',
            transactionId: 'N/A',
            date: inv.dueDate,
            booking: inv.booking,
            customer: inv.customer,
            isInvoiceOnly: true,
            dueDate: inv.dueDate,
            paidAmount: inv.paidAmount,
            remainingAmount: inv.remainingAmount,
            createdAt: inv.createdAt
          };
        } catch (innerErr) {
          throw new Error('Could not locate payment receipt or invoice document.');
        }
      }
      setPayment(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to fetch transaction record details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadDetails();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center bg-ivory-50 dark:bg-zinc-950">
        <div className="h-10 w-10 border-2 border-gold-400 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs uppercase tracking-widest text-gold-500">Retrieving Transaction Ledger...</p>
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="space-y-4 p-6 bg-white dark:bg-zinc-900 border border-gold-400/15 rounded-2xl max-w-xl mx-auto mt-12 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
        <h3 className="font-serif text-lg font-bold text-foreground">Transaction Audit Failed</h3>
        <p className="text-xs text-foreground/50">{error || 'Receipt or invoice record could not be loaded.'}</p>
        <button 
          onClick={() => router.push('/admin/payments')}
          className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-gold-500 hover:bg-gold-600 text-zinc-950 font-semibold uppercase tracking-wider text-xs rounded-xl cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Payments
        </button>
      </div>
    );
  }

  const isRefunded = payment.paymentStatus === 'REFUNDED' || payment.status === 'REFUNDED';
  const isPaid = payment.paymentStatus === 'PAID' || payment.status === 'SUCCESS' || payment.status === 'PAID';

  return (
    <div className="space-y-6">
      
      {/* Back button and Print buttons (hidden during print) */}
      <div className="flex justify-between items-center print:hidden border-b border-gold-400/20 pb-4">
        <button 
          onClick={() => router.push('/admin/payments')}
          className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-foreground/75 hover:text-gold-500 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Ledgers
        </button>
        <button 
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-gold-600 to-gold-400 hover:from-gold-500 hover:to-gold-300 text-zinc-950 font-semibold uppercase tracking-wider text-xs rounded-xl shadow-md cursor-pointer"
        >
          <Printer className="h-4 w-4" />
          Print Statement / Receipt
        </button>
      </div>

      {/* Main layout container (print responsive) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start print:block print:space-y-8">
        
        {/* Left column: Print invoice sheet/Receipt certificate */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-gold-400/15 rounded-3xl p-8 shadow-sm space-y-6 print:border-none print:shadow-none print:p-0">
          
          {/* Receipt Header Banner */}
          <div className="flex justify-between items-start border-b border-gold-400/10 pb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] text-gold-500 font-bold uppercase tracking-widest">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Golden Celebrations Lawn</span>
              </div>
              <h1 className="font-serif text-2xl font-bold text-foreground">
                {payment.isInvoiceOnly ? 'BILLING STATEMENT' : 'PAYMENT RECEIPT'}
              </h1>
              <p className="text-[10px] text-foreground/50 font-mono">Document Ref: {payment.id}</p>
            </div>
            <div className="text-right space-y-1">
              <span className={`inline-block rounded-full px-3 py-1 text-[9px] font-bold uppercase tracking-wider ${
                isPaid
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                  : isRefunded
                  ? 'bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400'
                  : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-950/30 dark:text-zinc-400'
              }`}>
                {payment.paymentStatus || payment.status}
              </span>
              <p className="text-[10px] text-foreground/50">Date: {payment.date || new Date(payment.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Ledger Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-2">
            <div className="space-y-4">
              <h3 className="font-serif text-xs font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400 border-b border-gold-400/10 pb-1 flex items-center gap-1.5">
                <User className="h-4 w-4" />
                Billed To
              </h3>
              <div className="text-xs space-y-1 text-foreground/80">
                <p className="font-bold text-foreground">{payment.customer?.name || payment.booking?.name || 'Customer'}</p>
                <p>{payment.customer?.email || 'N/A'}</p>
                <p>{payment.customer?.phone || 'N/A'}</p>
                <p className="text-[10px] text-foreground/50 italic leading-relaxed">{payment.customer?.address || 'No physical address'}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-serif text-xs font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400 border-b border-gold-400/10 pb-1 flex items-center gap-1.5">
                <Receipt className="h-4 w-4" />
                Lawn Event Details
              </h3>
              <div className="text-xs space-y-1 text-foreground/80">
                <p className="font-bold text-foreground">Type: {payment.booking?.eventType || 'Social Gathering'}</p>
                <p>Date: {payment.booking?.date || 'N/A'}</p>
                <p>Location: {payment.booking?.location || 'Main Premium Lawn Area'}</p>
                <p className="font-mono text-[10px]">Booking Reference: {payment.bookingId || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Financial Breakdown Table */}
          <div className="space-y-4">
            <h3 className="font-serif text-xs font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400 border-b border-gold-400/10 pb-1 flex items-center gap-1.5">
              <CreditCard className="h-4 w-4" />
              Financial Allocation
            </h3>
            
            <div className="overflow-hidden rounded-xl border border-gold-400/10 bg-gold-400/5 p-4 space-y-3">
              <div className="flex justify-between text-xs pb-2 border-b border-gold-400/10">
                <span className="font-bold">Item Description</span>
                <span className="font-bold text-right">Amount (₹)</span>
              </div>
              
              <div className="flex justify-between text-xs text-foreground/80">
                <span>{payment.paymentType || 'Milestone Balance Settlement'}</span>
                <span className="font-mono">₹{payment.amount.toLocaleString()}</span>
              </div>

              {payment.isInvoiceOnly && (
                <>
                  <div className="flex justify-between text-xs text-emerald-600 font-semibold border-t border-gold-400/5 pt-2">
                    <span>Amount Received / Settled</span>
                    <span className="font-mono">₹{(payment.paidAmount || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs text-rose-600 font-semibold">
                    <span>Outstanding Due Balance</span>
                    <span className="font-mono font-bold text-sm">₹{(payment.remainingAmount || payment.amount).toLocaleString()}</span>
                  </div>
                </>
              )}

              {!payment.isInvoiceOnly && (
                <div className="flex justify-between text-xs text-foreground/80">
                  <span>Authorized via: {payment.paymentMethod || 'Razorpay Link'}</span>
                  <span className="font-mono text-[10px]">Txn ID: {payment.transactionId}</span>
                </div>
              )}
            </div>
          </div>

          {/* Refund request detail (if existing) */}
          {payment.refundRequests && payment.refundRequests.length > 0 && (
            <div className="space-y-3 pt-2">
              <h3 className="font-serif text-xs font-bold uppercase tracking-wider text-rose-500 border-b border-rose-500/10 pb-1">Refund logs</h3>
              {payment.refundRequests.map((ref: any) => (
                <div key={ref.id} className="p-3.5 bg-rose-500/5 rounded-xl border border-rose-500/10 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-foreground">Refunded: ₹{ref.refundAmount.toLocaleString()}</span>
                    <span className="block text-[10px] text-foreground/60 italic mt-0.5">Reason: {ref.reason}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-700 text-[8px] font-bold uppercase tracking-wider">
                    {ref.refundStatus}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Footer Notice */}
          <div className="border-t border-gold-400/10 pt-6 text-[9px] text-center text-foreground/40 leading-relaxed italic">
            This is an administratively audited document generated from the Golden Celebrations Lawn dashboard ledger.
            Payments are secured and verified in integration with Razorpay Payment Gateway webhook channels.
          </div>

        </div>

        {/* Right column: Audit logs, metadata notes (hidden during print) */}
        <div className="lg:col-span-1 space-y-6 print:hidden">
          
          <div className="glass-panel border border-gold-400/20 rounded-3xl p-6 bg-white dark:bg-zinc-900 space-y-4">
            <h3 className="font-serif text-base font-bold text-foreground flex items-center gap-1.5">
              <Shield className="h-5 w-5 text-gold-500" />
              Administrative Audit
            </h3>
            <p className="text-[10px] text-foreground/50 leading-relaxed">
              Verify database record indices and payment flow integrity.
            </p>

            <div className="h-[1px] bg-gold-400/10" />

            <div className="space-y-3 text-[10px] text-foreground/75 leading-relaxed">
              <div className="flex justify-between">
                <span className="font-semibold text-foreground/50 uppercase">Gateway Node</span>
                <span className="font-bold font-mono text-emerald-600">ONLINE</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-foreground/50 uppercase">Payment Method</span>
                <span className="font-mono">{payment.paymentMethod || 'Debit/Credit'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-foreground/50 uppercase">System Date</span>
                <span>{new Date(payment.createdAt || Date.now()).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-foreground/50 uppercase">Booking Status</span>
                <span className="font-bold text-gold-500">{payment.booking?.status || 'PENDING'}</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gold-400/5 border border-gold-400/10 rounded-2xl text-[9px] leading-relaxed text-foreground/45">
            *Outbound refunds or adjustments should be filed via the payments ledger list before execution.
          </div>

        </div>

      </div>

    </div>
  );
}
