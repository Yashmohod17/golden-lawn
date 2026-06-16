'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, CreditCard, Shield, Download, RefreshCw, AlertCircle, 
  CheckCircle, ArrowUpRight, DollarSign, Filter, Receipt, 
  CheckCircle2, XCircle, ArrowDownLeft, Send, Eye, Sparkles,
  BookOpen, Clock, Calendar, CheckSquare
} from 'lucide-react';
import Link from 'next/link';
import { adminService } from '../../../services/admin';

export default function PaymentsPage() {
  const [activeTab, setActiveTab] = useState<'ledgers' | 'invoices' | 'refunds' | 'analytics'>('ledgers');
  const [paymentsData, setPaymentsData] = useState<any>({ payments: [], totalCount: 0, totalPages: 1 });
  const [invoicesData, setInvoicesData] = useState<any>({ invoices: [], totalCount: 0, totalPages: 1 });
  const [refundRequests, setRefundRequests] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Search and filters state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  
  // Invoice filters
  const [invSearch, setInvSearch] = useState('');
  const [invStatusFilter, setInvStatusFilter] = useState('ALL');
  const [invPage, setInvPage] = useState(1);

  // Refund creation form state
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [submittingRefund, setSubmittingRefund] = useState(false);

  // Load analytics & metrics
  const loadAnalytics = async () => {
    try {
      const data = await adminService.getPaymentAnalytics();
      setAnalytics(data);
    } catch (err: any) {
      console.error('Failed to load payment analytics:', err);
    }
  };

  // Load payments
  const loadPayments = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await adminService.getPaymentsList({
        search,
        status: statusFilter,
        paymentType: typeFilter,
        page,
        limit: 10
      });
      setPaymentsData(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to sync payments ledger.');
    } finally {
      setLoading(false);
    }
  };

  // Load invoices
  const loadInvoices = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await adminService.getInvoicesList({
        search: invSearch,
        status: invStatusFilter,
        page: invPage,
        limit: 10
      });
      setInvoicesData(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to sync invoices list.');
    } finally {
      setLoading(false);
    }
  };

  // Load refunds
  const loadRefundRequests = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await adminService.getRefundRequests();
      setRefundRequests(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load refund requests.');
    } finally {
      setLoading(false);
    }
  };

  // Master load dispatcher based on active tab
  const refreshAll = async () => {
    setSuccess('');
    setError('');
    loadAnalytics();
    if (activeTab === 'ledgers') {
      await loadPayments();
    } else if (activeTab === 'invoices') {
      await loadInvoices();
    } else if (activeTab === 'refunds') {
      await loadRefundRequests();
    } else if (activeTab === 'analytics') {
      setLoading(true);
      await loadAnalytics();
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAll();
  }, [activeTab, search, statusFilter, typeFilter, page, invSearch, invStatusFilter, invPage]);

  // Handle manual payment reminders
  const handleSendReminder = async (bookingId: string, type: 'ADVANCE' | 'DUE' | 'EVENT') => {
    try {
      setError('');
      setSuccess('');
      await adminService.sendPaymentReminder(bookingId, type);
      setSuccess(`Payment reminder notification successfully sent to customer for booking ${bookingId}`);
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch payment reminder.');
    }
  };

  // Handle refund creation submit
  const handleRefundSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayment) return;
    
    const amount = parseFloat(refundAmount);
    if (isNaN(amount) || amount <= 0 || amount > selectedPayment.amount) {
      setError(`Please input a valid refund amount up to ₹${selectedPayment.amount.toLocaleString()}`);
      return;
    }

    if (!refundReason.trim()) {
      setError('Please provide a reason for the refund request.');
      return;
    }

    try {
      setSubmittingRefund(true);
      setError('');
      
      const token = localStorage.getItem('admin_access_token');
      const res = await fetch('/api/payments/refund-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          paymentId: selectedPayment.id,
          refundAmount: amount,
          reason: refundReason
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to submit refund request.');
      }

      setSuccess(`Refund request of ₹${amount.toLocaleString()} submitted successfully.`);
      setShowRefundModal(false);
      setSelectedPayment(null);
      setRefundAmount('');
      setRefundReason('');
      refreshAll();
    } catch (err: any) {
      setError(err.message || 'Failed to create refund request.');
    } finally {
      setSubmittingRefund(false);
    }
  };

  // Handle refund approvals
  const handleRefundStatusChange = async (id: string, status: 'APPROVED' | 'REJECTED' | 'COMPLETED') => {
    if (!window.confirm(`Are you sure you want to update refund request to status: ${status}?`)) {
      return;
    }
    try {
      setLoading(true);
      setError('');
      await adminService.updateRefundStatus(id, status);
      setSuccess(`Refund status successfully updated to ${status}.`);
      setTimeout(() => setSuccess(''), 4000);
      refreshAll();
    } catch (err: any) {
      setError(err.message || 'Failed to adjust refund status.');
      setLoading(false);
    }
  };

  // Metrics summary
  const metrics = [
    { 
      label: 'Total Settled Revenue', 
      val: analytics ? `₹${analytics.totalRevenue?.toLocaleString('en-IN')}` : '₹0', 
      desc: 'Sum of all processed payments', 
      icon: CheckCircle, 
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10'
    },
    { 
      label: 'Refunds Processed / Requested', 
      val: analytics ? `₹${(analytics.refundStats?.completedAmount || 0).toLocaleString('en-IN')} / ₹${(analytics.refundStats?.pendingAmount || 0).toLocaleString('en-IN')}` : '₹0 / ₹0', 
      desc: `Total refund volume (${analytics?.refundStats?.count || 0} files)`, 
      icon: ArrowDownLeft, 
      color: 'text-rose-500',
      bg: 'bg-rose-500/10'
    },
    { 
      label: 'Active Gateway Integration', 
      val: 'Razorpay SECURE', 
      desc: 'Simulated Sandbox fallback active', 
      icon: Shield, 
      color: 'text-gold-500',
      bg: 'bg-gold-500/10'
    }
  ];

  return (
    <div className="space-y-6 relative min-h-[80vh]">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center border-b border-gold-400/20 pb-4 gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-foreground">Payments, Dues & Refunds</h2>
          <p className="text-xs text-foreground/50">Audit transaction receipts, process client refunds, track invoices and trigger billing reminders</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={refreshAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gold-400/20 bg-white dark:bg-zinc-900 text-xs font-semibold uppercase tracking-wider text-foreground hover:bg-gold-400/5 transition-colors cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh Ledgers
          </button>
        </div>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="flex items-start gap-2 text-xs text-red-500 bg-red-500/5 p-4 rounded-xl border border-red-500/10">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-start gap-2 text-xs text-emerald-600 bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/10 animate-pulse">
          <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metrics.map((card, idx) => (
          <div key={idx} className="glass-card rounded-2xl p-6 flex items-start gap-4 bg-white dark:bg-zinc-900 border border-gold-400/10 shadow-sm">
            <div className={`p-3 rounded-xl ${card.bg} ${card.color}`}>
              <card.icon className="h-5 w-5" />
            </div>
            <div className="space-y-1 overflow-hidden">
              <span className="text-[9px] font-bold uppercase tracking-wider text-foreground/50">{card.label}</span>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-foreground truncate">{card.val}</h3>
              <p className="text-[10px] text-foreground/50">{card.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gold-400/20 gap-4 overflow-x-auto pb-px">
        {[
          { id: 'ledgers', label: 'Payments Ledger', icon: Receipt },
          { id: 'invoices', label: 'Invoice Schedules', icon: BookOpen },
          { id: 'refunds', label: `Refund Requests (${refundRequests.filter(r => r.refundStatus === 'REQUESTED' || r.refundStatus === 'APPROVED').length})`, icon: ArrowDownLeft },
          { id: 'analytics', label: 'Revenue Analytics', icon: DollarSign },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as any);
              setPage(1);
              setInvPage(1);
            }}
            className={`flex items-center gap-2 pb-3 px-1 text-xs font-bold uppercase tracking-wider transition-all border-b-2 outline-none cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-gold-500 text-gold-600 dark:text-gold-400 font-bold'
                : 'border-transparent text-foreground/60 hover:text-foreground hover:border-gold-400/30'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="bg-white dark:bg-zinc-900 border border-gold-400/10 rounded-2xl overflow-hidden shadow-sm p-4 sm:p-6">
        
        {/* Tab 1: Payments Ledger */}
        {activeTab === 'ledgers' && (
          <div className="space-y-4">
            
            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between bg-gold-400/5 p-4 rounded-xl border border-gold-400/10">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-foreground/45">
                  <Search className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search receipt ID, transaction references, booking references..."
                  className="w-full rounded-xl border border-gold-400/15 bg-white dark:bg-zinc-950 pl-9 pr-4 py-2 text-xs text-foreground outline-none focus:border-gold-400"
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] uppercase font-bold text-foreground/50">Status</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    className="rounded-xl border border-gold-400/15 bg-white dark:bg-zinc-950 px-2 py-1.5 text-xs text-foreground outline-none focus:border-gold-400"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="PAID">PAID</option>
                    <option value="PARTIALLY_PAID">PARTIALLY PAID</option>
                    <option value="REFUNDED">REFUNDED</option>
                    <option value="FAILED">FAILED</option>
                  </select>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] uppercase font-bold text-foreground/50">Type</span>
                  <select
                    value={typeFilter}
                    onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
                    className="rounded-xl border border-gold-400/15 bg-white dark:bg-zinc-950 px-2 py-1.5 text-xs text-foreground outline-none focus:border-gold-400"
                  >
                    <option value="ALL">All Types</option>
                    <option value="ADVANCE">ADVANCE DEPOSIT</option>
                    <option value="INSTALLMENT">INSTALLMENT</option>
                    <option value="FINAL">FINAL SETTLEMENT</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-gold-400/10">
              {loading ? (
                <div className="p-12 text-center text-xs text-foreground/50">
                  <div className="h-8 w-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  Syncing ledger with Razorpay settlement hooks...
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gold-400/5 font-serif text-[11px] font-bold text-foreground border-b border-gold-400/15">
                      <th className="p-4">Receipt / Trans ID</th>
                      <th className="p-4">Client Event</th>
                      <th className="p-4">Payment Type</th>
                      <th className="p-4">Settle Date</th>
                      <th className="p-4">Paid (₹)</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gold-400/10 text-foreground/80">
                    {paymentsData.payments.map((p: any) => (
                      <tr key={p.id} className="hover:bg-gold-400/5 transition-colors">
                        <td className="p-4 font-mono font-bold text-foreground/80">
                          {p.id}
                          <span className="block font-sans font-medium text-[9px] text-foreground/50">Txn: {p.transactionId || 'None'}</span>
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-foreground block">{p.booking?.name || 'Manual Customer'}</span>
                          <span className="text-[9px] text-foreground/50 block font-mono">BookID: {p.bookingId}</span>
                        </td>
                        <td className="p-4 font-semibold text-[10px] text-foreground/75">
                          {p.paymentType}
                        </td>
                        <td className="p-4 text-foreground/60">{p.date || new Date(p.createdAt).toLocaleDateString()}</td>
                        <td className="p-4 font-bold text-gold-600 dark:text-gold-400">
                          ₹{p.amount.toLocaleString('en-IN')}
                        </td>
                        <td className="p-4">
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
                        <td className="p-4 text-right flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedPayment(p);
                              setRefundAmount(p.amount.toString());
                              setShowRefundModal(true);
                            }}
                            disabled={p.paymentStatus === 'REFUNDED' || p.status !== 'SUCCESS'}
                            className="px-2 py-1 rounded bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white transition-all text-[9px] font-bold uppercase tracking-wider disabled:opacity-30 disabled:hover:bg-rose-500/10 disabled:hover:text-rose-600 cursor-pointer"
                          >
                            Refund
                          </button>
                          
                          <Link 
                            href={`/admin/payments/${p.id}`}
                            className="p-1 rounded border border-gold-400/20 text-foreground/75 hover:bg-gold-400/5 hover:text-gold-500"
                            title="Inspect details"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                    {paymentsData.payments.length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-12 text-center text-foreground/45">
                          No transactions found matching the filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            {paymentsData.totalPages > 1 && (
              <div className="flex justify-between items-center text-xs pt-2">
                <span className="text-foreground/50">Page {paymentsData.currentPage} of {paymentsData.totalPages} ({paymentsData.totalCount} entries)</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(prev => Math.max(1, prev - 1))}
                    disabled={page === 1}
                    className="px-3 py-1 rounded border border-gold-400/15 disabled:opacity-40 hover:bg-gold-400/5 text-foreground cursor-pointer"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(prev => Math.min(paymentsData.totalPages, prev + 1))}
                    disabled={page === paymentsData.totalPages}
                    className="px-3 py-1 rounded border border-gold-400/15 disabled:opacity-40 hover:bg-gold-400/5 text-foreground cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

        {/* Tab 2: Invoice Schedules */}
        {activeTab === 'invoices' && (
          <div className="space-y-4">
            
            {/* Invoice filters */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between bg-gold-400/5 p-4 rounded-xl border border-gold-400/10">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-foreground/45">
                  <Search className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  value={invSearch}
                  onChange={(e) => setInvSearch(e.target.value)}
                  placeholder="Search invoice number..."
                  className="w-full rounded-xl border border-gold-400/15 bg-white dark:bg-zinc-950 pl-9 pr-4 py-2 text-xs text-foreground outline-none focus:border-gold-400"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-bold text-foreground/50">Status</span>
                <select
                  value={invStatusFilter}
                  onChange={(e) => { setInvStatusFilter(e.target.value); setInvPage(1); }}
                  className="rounded-xl border border-gold-400/15 bg-white dark:bg-zinc-950 px-2 py-1.5 text-xs text-foreground outline-none focus:border-gold-400"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PAID">PAID</option>
                  <option value="PARTIALLY_PAID">PARTIALLY PAID</option>
                  <option value="UNPAID">UNPAID</option>
                  <option value="OVERDUE">OVERDUE</option>
                </select>
              </div>
            </div>

            {/* Invoices list */}
            <div className="overflow-x-auto rounded-xl border border-gold-400/10">
              {loading ? (
                <div className="p-12 text-center text-xs text-foreground/50">
                  <div className="h-8 w-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  Loading invoice registers...
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gold-400/5 font-serif text-[11px] font-bold text-foreground border-b border-gold-400/15">
                      <th className="p-4">Invoice No</th>
                      <th className="p-4">Booking Event</th>
                      <th className="p-4">Due Date</th>
                      <th className="p-4">Total Amount (₹)</th>
                      <th className="p-4">Paid / Remaining (₹)</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions / Reminders</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gold-400/10 text-foreground/80">
                    {invoicesData.invoices.map((inv: any) => (
                      <tr key={inv.id} className="hover:bg-gold-400/5 transition-colors">
                        <td className="p-4 font-mono font-bold text-foreground/85">
                          {inv.invoiceNo || inv.invoiceNumber}
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-foreground block">{inv.booking?.name || 'Customer Booking'}</span>
                          <span className="text-[9px] text-foreground/50 font-mono block">BookID: {inv.bookingId}</span>
                        </td>
                        <td className="p-4 font-semibold text-foreground/75">
                          {inv.dueDate}
                        </td>
                        <td className="p-4 font-bold text-foreground/80">
                          ₹{inv.amount.toLocaleString()}
                        </td>
                        <td className="p-4 text-foreground/60 font-medium">
                          <span className="text-emerald-600 font-bold">₹{inv.paidAmount?.toLocaleString() || 0}</span>
                          <span className="mx-1 text-foreground/30">/</span>
                          <span className="text-rose-600 font-bold">₹{inv.remainingAmount?.toLocaleString() || inv.amount}</span>
                        </td>
                        <td className="p-4">
                          <span className={`rounded-full px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider ${
                            inv.status === 'PAID'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                              : inv.status === 'PARTIALLY_PAID'
                              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400'
                              : inv.status === 'OVERDUE'
                              ? 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400 animate-pulse'
                              : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-950/30 dark:text-zinc-400'
                          }`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="p-4 text-right flex justify-end gap-1.5 items-center">
                          {inv.status !== 'PAID' && (
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleSendReminder(inv.bookingId, 'ADVANCE')}
                                className="px-2 py-1 rounded bg-amber-500/10 hover:bg-amber-500 hover:text-zinc-950 transition-all text-[8px] font-bold uppercase tracking-widest text-amber-600 cursor-pointer"
                                title="Send Advance Reminder"
                              >
                                Adv
                              </button>
                              <button
                                onClick={() => handleSendReminder(inv.bookingId, 'DUE')}
                                className="px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500 hover:text-white transition-all text-[8px] font-bold uppercase tracking-widest text-rose-600 cursor-pointer"
                                title="Send Dues Reminder"
                              >
                                Due
                              </button>
                            </div>
                          )}
                          <Link 
                            href={`/admin/payments/${inv.id}`}
                            className="p-1 rounded border border-gold-400/20 text-foreground/75 hover:bg-gold-400/5 hover:text-gold-500"
                            title="Inspect details"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                    {invoicesData.invoices.length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-12 text-center text-foreground/45">
                          No invoices found matching the filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            {invoicesData.totalPages > 1 && (
              <div className="flex justify-between items-center text-xs pt-2">
                <span className="text-foreground/50">Page {invoicesData.currentPage} of {invoicesData.totalPages} ({invoicesData.totalCount} entries)</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setInvPage(prev => Math.max(1, prev - 1))}
                    disabled={invPage === 1}
                    className="px-3 py-1 rounded border border-gold-400/15 disabled:opacity-40 hover:bg-gold-400/5 text-foreground cursor-pointer"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setInvPage(prev => Math.min(invoicesData.totalPages, prev + 1))}
                    disabled={invPage === invoicesData.totalPages}
                    className="px-3 py-1 rounded border border-gold-400/15 disabled:opacity-40 hover:bg-gold-400/5 text-foreground cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

        {/* Tab 3: Refund Requests Approval Console */}
        {activeTab === 'refunds' && (
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-semibold text-foreground border-b border-gold-400/10 pb-2">Refund Workflows & Approvals</h3>
            
            <div className="overflow-x-auto rounded-xl border border-gold-400/10">
              {loading ? (
                <div className="p-12 text-center text-xs text-foreground/50">
                  <div className="h-8 w-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  Loading refund requests ledger...
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gold-400/5 font-serif text-[11px] font-bold text-foreground border-b border-gold-400/15">
                      <th className="p-4">Refund ID / Date</th>
                      <th className="p-4">Target Payment ID</th>
                      <th className="p-4">Customer Name</th>
                      <th className="p-4">Refund Amount (₹)</th>
                      <th className="p-4">Reason / Notes</th>
                      <th className="p-4">Refund Status</th>
                      <th className="p-4 text-right">Approvals Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gold-400/10 text-foreground/80">
                    {refundRequests.map((ref: any) => (
                      <tr key={ref.id} className="hover:bg-gold-400/5 transition-colors">
                        <td className="p-4 font-mono font-bold text-foreground/85">
                          {ref.id}
                          <span className="block font-sans font-medium text-[9px] text-foreground/50">Created: {new Date(ref.createdAt).toLocaleDateString()}</span>
                        </td>
                        <td className="p-4 font-mono text-foreground/60 font-bold">
                          {ref.paymentId}
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-foreground block">{ref.payment?.customer?.name || ref.payment?.booking?.name || 'Customer'}</span>
                          <span className="text-[9px] text-foreground/50 block">{ref.payment?.customer?.email || 'N/A'}</span>
                        </td>
                        <td className="p-4 font-bold text-rose-600 dark:text-rose-400">
                          ₹{ref.refundAmount.toLocaleString('en-IN')}
                        </td>
                        <td className="p-4 max-w-[180px] truncate" title={ref.reason}>
                          {ref.reason}
                        </td>
                        <td className="p-4">
                          <span className={`rounded-full px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider ${
                            ref.refundStatus === 'COMPLETED'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                              : ref.refundStatus === 'APPROVED'
                              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400'
                              : ref.refundStatus === 'REJECTED'
                              ? 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400'
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 animate-pulse'
                          }`}>
                            {ref.refundStatus}
                          </span>
                        </td>
                        <td className="p-4 text-right flex justify-end gap-1.5 font-medium">
                          {ref.refundStatus === 'REQUESTED' && (
                            <>
                              <button
                                onClick={() => handleRefundStatusChange(ref.id, 'APPROVED')}
                                className="px-2.5 py-1 rounded bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500 hover:text-zinc-950 transition-all text-[9px] font-bold uppercase tracking-wider cursor-pointer"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleRefundStatusChange(ref.id, 'REJECTED')}
                                className="px-2.5 py-1 rounded bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white transition-all text-[9px] font-bold uppercase tracking-wider cursor-pointer"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {ref.refundStatus === 'APPROVED' && (
                            <button
                              onClick={() => handleRefundStatusChange(ref.id, 'COMPLETED')}
                              className="px-2.5 py-1 rounded bg-emerald-500/15 text-emerald-600 hover:bg-emerald-600 hover:text-zinc-950 transition-all text-[9px] font-bold uppercase tracking-wider cursor-pointer animate-pulse"
                            >
                              Complete Settlement
                            </button>
                          )}
                          {(ref.refundStatus === 'COMPLETED' || ref.refundStatus === 'REJECTED') && (
                            <span className="text-[10px] text-foreground/40 italic">Archived Workflow</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {refundRequests.length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-12 text-center text-foreground/45">
                          No refund files logged.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Revenue Analytics */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="border-b border-gold-400/10 pb-2">
              <h3 className="font-serif text-lg font-semibold text-foreground">Revenue trends & collections analytics</h3>
              <p className="text-[10px] text-foreground/50">Historical collection timeline aggregates</p>
            </div>

            {loading || !analytics ? (
              <div className="p-12 text-center text-xs text-foreground/50">
                <div className="h-8 w-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                Aggregating database balances...
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Left: Monthly Collections */}
                <div className="space-y-4">
                  <h4 className="font-serif text-sm font-bold text-foreground">Monthly Collection Aggregates</h4>
                  <div className="bg-gold-400/5 rounded-xl border border-gold-400/10 p-4 divide-y divide-gold-400/10">
                    {Object.entries(analytics.monthlyCollections || {}).map(([month, val]: any) => (
                      <div key={month} className="flex justify-between py-3 text-xs items-center">
                        <span className="font-semibold text-foreground/80">{month}</span>
                        <span className="font-mono font-bold text-gold-600 dark:text-gold-400 text-sm">₹{val.toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                    {Object.keys(analytics.monthlyCollections || {}).length === 0 && (
                      <p className="p-4 text-center text-foreground/40 text-xs">No monthly trends available.</p>
                    )}
                  </div>
                </div>

                {/* Right: Payment State Counts */}
                <div className="space-y-4">
                  <h4 className="font-serif text-sm font-bold text-foreground">Transaction State Counts</h4>
                  <div className="bg-gold-400/5 rounded-xl border border-gold-400/10 p-4 space-y-4">
                    {[
                      { label: 'Settled Payments (PAID)', count: analytics.statusCounts?.PAID || 0, color: 'bg-emerald-500' },
                      { label: 'Partially Settled (PARTIALLY_PAID)', count: analytics.statusCounts?.PARTIALLY_PAID || 0, color: 'bg-yellow-500' },
                      { label: 'Refunded Dues (REFUNDED)', count: analytics.statusCounts?.REFUNDED || 0, color: 'bg-orange-500' },
                      { label: 'Failed Checkouts (FAILED)', count: analytics.statusCounts?.FAILED || 0, color: 'bg-rose-500' },
                    ].map((item, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-foreground/75">{item.label}</span>
                          <span className="font-mono text-foreground font-bold">{item.count}</span>
                        </div>
                        <div className="h-2 w-full bg-gold-400/5 rounded-full overflow-hidden border border-gold-400/10">
                          <div 
                            className={`h-full ${item.color}`} 
                            style={{ 
                              width: `${Math.max(5, (item.count / Math.max(1, Object.values(analytics.statusCounts || {}).reduce((a: any, b: any) => a + b, 0) as any)) * 100)}%` 
                            }} 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

      </div>

      {/* Refund Request Creation Modal */}
      <AnimatePresence>
        {showRefundModal && selectedPayment && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 border border-gold-400/25 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-center border-b border-gold-400/10 pb-3">
                <h3 className="font-serif text-lg font-bold text-foreground">Initiate Refund File</h3>
                <button 
                  onClick={() => { setShowRefundModal(false); setSelectedPayment(null); }}
                  className="p-1 rounded-lg text-foreground/50 hover:bg-gold-400/10 hover:text-gold-500 cursor-pointer"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleRefundSubmit} className="space-y-4">
                <div className="p-3 bg-gold-400/5 rounded-xl border border-gold-400/10 text-[10px] space-y-1">
                  <p className="text-foreground/50 uppercase font-bold">Transaction Reference</p>
                  <p className="font-mono font-bold text-foreground">{selectedPayment.id}</p>
                  <p className="text-foreground/50 uppercase font-bold mt-2">Maximum Refundable Amount</p>
                  <p className="font-serif text-sm font-bold text-gold-600 dark:text-gold-400">₹{selectedPayment.amount.toLocaleString()}</p>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-foreground/70 mb-1.5">
                    Refund Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    max={selectedPayment.amount}
                    min={1}
                    className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-950 px-3.5 py-2.5 text-xs text-foreground outline-none focus:border-gold-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-foreground/70 mb-1.5">
                    Reason for Refund
                  </label>
                  <textarea
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    placeholder="Enter customer cancelation details, floral service adjustments reason..."
                    rows={3}
                    className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-950 px-3.5 py-2.5 text-xs text-foreground outline-none focus:border-gold-400"
                  />
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => { setShowRefundModal(false); setSelectedPayment(null); }}
                    className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-foreground/70 hover:bg-gold-400/5 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingRefund}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer disabled:opacity-50"
                  >
                    {submittingRefund ? 'Submitting...' : 'File Refund'}
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
