'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, FileText, Plus, Edit, Printer, Check, X, AlertCircle, 
  IndianRupee, Calendar, Sparkles, Filter, Info 
} from 'lucide-react';
import { adminService, Invoice } from '../../../services/admin';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Form states for Create Invoice
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const [amount, setAmount] = useState(0);
  const [dueDate, setDueDate] = useState('');
  const [invoiceStatus, setInvoiceStatus] = useState('UNPAID');
  const [submittingInvoice, setSubmittingInvoice] = useState(false);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await adminService.getInvoices(search);
      setInvoices(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to sync invoices billing sheets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, [search]);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await adminService.updateInvoice(id, status);
      await loadInvoices();
      if (selectedInvoice && selectedInvoice.id === id) {
        setSelectedInvoice(prev => prev ? { ...prev, status } as Invoice : null);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update invoice status');
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingId.trim() || amount <= 0 || !dueDate) {
      alert('Please fill out all fields correctly.');
      return;
    }

    setSubmittingInvoice(true);
    try {
      await adminService.createInvoice({ bookingId: bookingId.trim(), amount, dueDate, status: invoiceStatus });
      setBookingId('');
      setAmount(0);
      setDueDate('');
      setIsCreateOpen(false);
      await loadInvoices();
    } catch (err: any) {
      alert(err.message || 'Failed to generate invoice');
    } finally {
      setSubmittingInvoice(false);
    }
  };

  const triggerPrintSimulate = (invoice: Invoice) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice Statement - ${invoice.invoiceNo}</title>
          <style>
            body { font-family: serif; padding: 40px; color: #1c1c1e; }
            .header { border-bottom: 2px solid #bba15c; padding-bottom: 20px; margin-bottom: 40px; }
            .title { font-size: 28px; font-weight: bold; color: #bba15c; }
            .meta { margin-bottom: 40px; font-size: 14px; }
            .details-table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
            .details-table th, .details-table td { border: 1px solid #e5e7eb; padding: 12px; text-align: left; }
            .details-table th { background-color: #f9fafb; font-weight: bold; }
            .footer { border-top: 1px solid #e5e7eb; padding-top: 20px; font-size: 11px; color: #6b7280; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">THE GOLDEN CELEBRATIONS LAWN</div>
            <p>Nagpur Bypass Road, Nagpur, MH, India</p>
          </div>
          <div class="meta">
            <strong>Invoice Number:</strong> ${invoice.invoiceNo}<br>
            <strong>Date:</strong> ${new Date(invoice.createdAt).toLocaleDateString()}<br>
            <strong>Due Date:</strong> ${invoice.dueDate}<br>
            <strong>Client Ref:</strong> ${invoice.booking?.name || 'Inquiry Reference'}<br>
            <strong>Booking ID:</strong> ${invoice.bookingId}
          </div>
          <table class="details-table">
            <thead>
              <tr>
                <th>Item / Description</th>
                <th>Units</th>
                <th>Total Rate</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Lawn reservation and banquet services estimate (${invoice.booking?.eventType || 'Custom Session'})</td>
                <td>1 Package</td>
                <td>₹${invoice.amount.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
          <div style="text-align: right; margin-bottom: 40px; font-size: 18px; font-weight: bold;">
            Total Outstanding: ₹${invoice.amount.toLocaleString()} (${invoice.status})
          </div>
          <div class="footer">
            Thank you for booking with us. This is a computer-generated billing statement.
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6 relative min-h-[80vh]">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gold-400/20 pb-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-foreground">Billing Invoices</h2>
          <p className="text-xs text-foreground/50">Compile invoices, monitor balances, and export print statements</p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-gold-600 to-gold-400 px-4 py-2.5 text-xs font-bold text-zinc-950 uppercase tracking-wider shadow-md hover:opacity-95 cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Create Invoice
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 text-xs text-red-500 bg-red-500/5 p-4 rounded-xl border border-red-500/10">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Table list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-gold-400/10 shadow-sm justify-between">
            <div className="relative flex-1 w-full">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-foreground/45">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search invoice number, booking ID..."
                className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-955 pl-10 pr-4 py-2.5 text-xs text-foreground outline-none focus:border-gold-400"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-gold-400/10 rounded-2xl overflow-hidden shadow-sm">
            {loading ? (
              <div className="p-12 text-center text-xs text-foreground/50">
                <div className="h-8 w-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                Loading ledger records...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gold-400/5 font-serif text-[11px] font-bold text-foreground border-b border-gold-400/15">
                      <th className="p-4">Invoice #</th>
                      <th className="p-4">Booking Ref</th>
                      <th className="p-4">Due Date</th>
                      <th className="p-4">Billing Amount</th>
                      <th className="p-4">Payment Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gold-400/10 text-foreground/80">
                    {invoices.map((inv) => (
                      <tr 
                        key={inv.id} 
                        className={`hover:bg-gold-400/5 transition-colors cursor-pointer ${selectedInvoice?.id === inv.id ? 'bg-gold-400/10' : ''}`}
                        onClick={() => setSelectedInvoice(inv)}
                      >
                        <td className="p-4 font-mono font-bold text-foreground">
                          {inv.invoiceNo}
                          <span className="block text-[8px] text-foreground/45 font-mono">{new Date(inv.createdAt).toLocaleDateString()}</span>
                        </td>
                        <td className="p-4 font-semibold">
                          {inv.booking?.name || 'Inquiry Reference'}
                          <span className="block text-[10px] text-foreground/40 font-mono">#{inv.bookingId}</span>
                        </td>
                        <td className="p-4 text-foreground/60">{inv.dueDate}</td>
                        <td className="p-4 font-bold text-gold-500">
                          ₹{inv.amount.toLocaleString('en-IN')}
                        </td>
                        <td className="p-4">
                          <span className={`rounded-full px-2 py-0.5 text-[8px] font-bold uppercase ${
                            inv.status === 'PAID'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                              : inv.status === 'PARTIALLY_PAID'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
                              : 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400'
                          }`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="p-4 text-right" onClick={e => e.stopPropagation()}>
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => triggerPrintSimulate(inv)}
                              className="p-1 rounded bg-gold-400/10 text-gold-500 hover:bg-gold-500 hover:text-zinc-950 transition-colors"
                              title="Print Statement"
                            >
                              <Printer className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {invoices.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-12 text-center text-foreground/40">
                          No invoice statements stored in ledger.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right slide panel detail */}
        <div className="lg:col-span-1">
          <AnimatePresence mode="wait">
            {selectedInvoice ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="glass-panel border border-gold-400/20 rounded-3xl p-6 bg-white dark:bg-zinc-900 space-y-6 shadow-sm"
              >
                <div className="flex justify-between items-center border-b border-gold-400/10 pb-3">
                  <div>
                    <h3 className="font-serif text-sm font-bold text-foreground">Invoice Details</h3>
                    <p className="text-[9px] text-foreground/45 font-mono">{selectedInvoice.invoiceNo}</p>
                  </div>
                  <button 
                    onClick={() => setSelectedInvoice(null)}
                    className="p-1 rounded hover:bg-gold-400/10 text-foreground/50 hover:text-gold-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-foreground/50">Billing Amount:</span>
                    <span className="font-bold text-gold-500">₹{selectedInvoice.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/50">Due Date:</span>
                    <span className="font-medium">{selectedInvoice.dueDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/50">Client:</span>
                    <span className="font-medium text-foreground">{selectedInvoice.booking?.name || 'Reference'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/50">Booking ID:</span>
                    <span className="font-mono text-[10px]">{selectedInvoice.bookingId}</span>
                  </div>
                </div>

                {/* Adjust Status */}
                <div className="p-3 bg-gold-400/5 rounded-xl border border-gold-400/10 space-y-3">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-foreground/60">Update Invoice Status</span>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <button
                      onClick={() => handleUpdateStatus(selectedInvoice.id, 'PAID')}
                      className={`py-2 rounded-lg font-bold uppercase border transition-all ${
                        selectedInvoice.status === 'PAID' ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gold-400/10 hover:border-gold-400/30 text-foreground/60'
                      }`}
                    >
                      Paid
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedInvoice.id, 'UNPAID')}
                      className={`py-2 rounded-lg font-bold uppercase border transition-all ${
                        selectedInvoice.status === 'UNPAID' ? 'bg-red-500 border-red-500 text-white' : 'border-gold-400/10 hover:border-gold-400/30 text-foreground/60'
                      }`}
                    >
                      Unpaid
                    </button>
                  </div>
                </div>

                {/* Print button */}
                <button
                  onClick={() => triggerPrintSimulate(selectedInvoice)}
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-zinc-950 text-white dark:bg-gold-500 dark:text-zinc-950 py-3 text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  <Printer className="h-4 w-4" /> Print PDF Statement
                </button>
              </motion.div>
            ) : (
              <div className="border border-dashed border-gold-400/20 rounded-3xl p-12 text-center text-foreground/40 flex flex-col justify-center items-center h-[30vh]">
                <Info className="h-8 w-8 text-gold-400/30 mb-2" />
                <h4 className="font-serif font-bold text-foreground/70 mb-1">Invoice Inspector</h4>
                <p className="text-[10px] max-w-[200px]">Select any billing entry to inspect statement meta data or print PDF invoices simulation sheets.</p>
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* CREATE MODAL */}
      <AnimatePresence>
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-zinc-900 border border-gold-400/25 rounded-3xl p-6 shadow-2xl"
            >
              <div className="flex justify-between items-center border-b border-gold-400/10 pb-3 mb-4">
                <h3 className="font-serif text-lg font-bold text-foreground">Create Invoice Statement</h3>
                <button 
                  onClick={() => setIsCreateOpen(false)}
                  className="p-1 rounded hover:bg-gold-400/10 text-foreground/50 hover:text-gold-500"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleCreateInvoice} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-foreground/75 mb-1 uppercase text-[9px] tracking-wider">Booking ID Reference</label>
                  <input
                    type="text"
                    value={bookingId}
                    onChange={(e) => setBookingId(e.target.value)}
                    placeholder="e.g. GC-2026-0912 or b-1"
                    className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-950 px-3 py-2 text-foreground outline-none focus:border-gold-400"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-foreground/75 mb-1 uppercase text-[9px] tracking-wider">Amount (₹)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                    className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-950 px-3 py-2 text-foreground outline-none focus:border-gold-400 font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-foreground/75 mb-1 uppercase text-[9px] tracking-wider">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-950 px-3 py-2 text-foreground outline-none focus:border-gold-400"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-foreground/75 mb-1 uppercase text-[9px] tracking-wider">Invoice Status</label>
                  <select
                    value={invoiceStatus}
                    onChange={(e) => setInvoiceStatus(e.target.value)}
                    className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-950 px-3 py-2 text-foreground outline-none focus:border-gold-400 font-semibold"
                  >
                    <option value="UNPAID">UNPAID</option>
                    <option value="PAID">PAID</option>
                    <option value="PARTIALLY_PAID">PARTIALLY PAID</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 border-t border-gold-400/10 pt-4 mt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="rounded-xl border border-gold-400/20 bg-transparent px-5 py-2.5 font-sans font-bold hover:bg-gold-400/5 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingInvoice}
                    className="rounded-xl bg-gradient-to-r from-gold-600 to-gold-400 px-5 py-2.5 font-sans font-bold text-zinc-950 uppercase tracking-widest hover:opacity-95 shadow-md shadow-gold-600/5 cursor-pointer"
                  >
                    {submittingInvoice ? 'Compiling...' : 'Generate Invoice'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
