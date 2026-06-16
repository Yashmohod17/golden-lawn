'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, Calendar, FileText, CheckCircle, AlertCircle, 
  FileSpreadsheet, Sparkles, Database, Search 
} from 'lucide-react';
import { adminService } from '../../../services/admin';

export default function ReportsPage() {
  const [category, setCategory] = useState('REVENUE');
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2026-12-31');
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleCompile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await adminService.getReports(category, startDate || undefined, endDate || undefined);
      setRecords(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to compile report logs.');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (format: 'CSV' | 'PDF' | 'EXCEL') => {
    if (records.length === 0) {
      alert('Please compile report data first.');
      return;
    }

    setDownloading(format);
    
    setTimeout(() => {
      setDownloading(null);
      
      // Simulate file download by creating mock blob
      let blobContent = '';
      let mimeType = 'text/csv';
      let extension = 'csv';

      if (category === 'REVENUE') {
        const headers = 'ID,Booking ID,Amount,Method,Date,Status,Description\n';
        const rows = records.map(p => 
          `"${p.id}","${p.bookingId}",${p.amount},"${p.method}","${p.date}","${p.status}","${p.description}"`
        ).join('\n');
        blobContent = headers + rows;
      } else if (category === 'BOOKINGS') {
        const headers = 'ID,Client Name,Email,Phone,Event Date,Guests,Package,Cost,Status\n';
        const rows = records.map(b => 
          `"${b.id}","${b.name}","${b.email}","${b.phone}","${b.date}",${b.guests},"${b.package}",${b.cost},"${b.status}"`
        ).join('\n');
        blobContent = headers + rows;
      } else if (category === 'CRM') {
        const headers = 'Lead ID,Name,Phone,Email,Source,Status\n';
        const rows = records.map(l => 
          `"${l.id}","${l.name}","${l.phone}","${l.email || ''}","${l.source || ''}","${l.status}"`
        ).join('\n');
        blobContent = headers + rows;
      } else {
        const headers = 'Staff ID,Role,Phone,Status\n';
        const rows = records.map(s => 
          `"${s.id}","${s.role}","${s.phone}","${s.status}"`
        ).join('\n');
        blobContent = headers + rows;
      }

      if (format === 'EXCEL') {
        mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        extension = 'xlsx';
      } else if (format === 'PDF') {
        mimeType = 'application/pdf';
        extension = 'pdf';
      }

      const blob = new Blob([blobContent], { type: mimeType });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `golden_lawn_report_${category.toLowerCase()}_${startDate}_to_${endDate}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 1200);
  };

  return (
    <div className="space-y-6 relative min-h-[80vh]">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gold-400/20 pb-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-foreground">Operational Reports Exporter</h2>
          <p className="text-xs text-foreground/50">Filter category ledgers, preview transactions, and compile simulation sheets downloads</p>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 text-xs text-red-500 bg-red-500/5 p-4 rounded-xl border border-red-500/10">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Compiler controls */}
      <div className="glass-panel border border-gold-400/15 rounded-3xl p-6 bg-white dark:bg-zinc-900 shadow-sm">
        <form onSubmit={handleCompile} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end text-xs">
          <div>
            <label className="block font-bold text-foreground/75 mb-1.5 uppercase text-[9px] tracking-wider">Report Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-950 px-3 py-2.5 text-foreground outline-none focus:border-gold-400 font-semibold"
            >
              <option value="REVENUE">Revenue Settlements</option>
              <option value="BOOKINGS">Lawn Bookings Schedule</option>
              <option value="CRM">CRM Leads Pipelines</option>
              <option value="STAFF">Staff payroll roster</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-foreground/75 mb-1.5 uppercase text-[9px] tracking-wider">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-955 px-3 py-2.5 text-foreground outline-none focus:border-gold-400"
            />
          </div>

          <div>
            <label className="block font-bold text-foreground/75 mb-1.5 uppercase text-[9px] tracking-wider">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-955 px-3 py-2.5 text-foreground outline-none focus:border-gold-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-zinc-950 text-white dark:bg-gold-500 dark:text-zinc-950 py-3 font-bold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-md"
          >
            <Database className="h-4 w-4" /> {loading ? 'Compiling...' : 'Compile Report'}
          </button>
        </form>
      </div>

      {/* Preview and Downloads */}
      {records.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-zinc-900 border border-gold-400/10 rounded-2xl p-4 shadow-sm">
            <div>
              <span className="text-xs font-bold text-foreground block">Report Preview: {records.length} records</span>
              <span className="text-[10px] text-foreground/50">Compiled date: {startDate} to {endDate}</span>
            </div>
            
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => handleDownload('CSV')}
                disabled={!!downloading}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-xl border border-gold-400/25 px-4 py-2.5 text-xs font-bold hover:bg-gold-400/5 cursor-pointer text-foreground"
              >
                <Download className="h-4 w-4" /> {downloading === 'CSV' ? 'Exporting...' : 'Export CSV'}
              </button>
              <button
                onClick={() => handleDownload('EXCEL')}
                disabled={!!downloading}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-gold-600 to-gold-400 px-4 py-2.5 text-xs font-bold text-zinc-950 uppercase tracking-wider hover:opacity-95 shadow-md cursor-pointer"
              >
                <FileSpreadsheet className="h-4 w-4" /> {downloading === 'EXCEL' ? 'Generating...' : 'Export Excel'}
              </button>
            </div>
          </div>

          {/* Preview grid table */}
          <div className="bg-white dark:bg-zinc-900 border border-gold-400/10 rounded-2xl overflow-hidden shadow-sm max-h-[40vh] overflow-y-auto">
            <table className="w-full text-left border-collapse text-[11px] text-foreground/80">
              <thead>
                <tr className="bg-gold-400/5 font-serif text-[11px] font-bold text-foreground border-b border-gold-400/15">
                  {category === 'REVENUE' && (
                    <>
                      <th className="p-3">Payment ID</th>
                      <th className="p-3">Booking ID</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Method</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Status</th>
                    </>
                  )}
                  {category === 'BOOKINGS' && (
                    <>
                      <th className="p-3">Booking ID</th>
                      <th className="p-3">Client Name</th>
                      <th className="p-3">Event Date</th>
                      <th className="p-3">Guest Count</th>
                      <th className="p-3">Est. Cost</th>
                      <th className="p-3">Status</th>
                    </>
                  )}
                  {category === 'CRM' && (
                    <>
                      <th className="p-3">Lead ID</th>
                      <th className="p-3">Lead Name</th>
                      <th className="p-3">Phone</th>
                      <th className="p-3">Source</th>
                      <th className="p-3">Status</th>
                    </>
                  )}
                  {category === 'STAFF' && (
                    <>
                      <th className="p-3">Staff ID</th>
                      <th className="p-3">Designation</th>
                      <th className="p-3">Contact</th>
                      <th className="p-3">Contract Status</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gold-400/10">
                {records.map((r, idx) => (
                  <tr key={idx} className="hover:bg-gold-400/5 transition-colors">
                    {category === 'REVENUE' && (
                      <>
                        <td className="p-3 font-mono font-bold">{r.id}</td>
                        <td className="p-3 font-mono">{r.bookingId}</td>
                        <td className="p-3 font-bold text-gold-600">₹{r.amount.toLocaleString()}</td>
                        <td className="p-3">{r.method}</td>
                        <td className="p-3">{r.date}</td>
                        <td className="p-3 font-bold text-emerald-600">{r.status}</td>
                      </>
                    )}
                    {category === 'BOOKINGS' && (
                      <>
                        <td className="p-3 font-mono">#{r.id}</td>
                        <td className="p-3 font-bold">{r.name}</td>
                        <td className="p-3 font-medium">{r.date}</td>
                        <td className="p-3">{r.guests} guests</td>
                        <td className="p-3 font-bold text-gold-600">₹{r.cost.toLocaleString()}</td>
                        <td className="p-3 font-bold">{r.status}</td>
                      </>
                    )}
                    {category === 'CRM' && (
                      <>
                        <td className="p-3 font-mono">{r.id}</td>
                        <td className="p-3 font-bold">{r.name}</td>
                        <td className="p-3 font-mono">{r.phone}</td>
                        <td className="p-3">{r.source || 'Website'}</td>
                        <td className="p-3 font-bold text-indigo-600">{r.status}</td>
                      </>
                    )}
                    {category === 'STAFF' && (
                      <>
                        <td className="p-3 font-mono">{r.id}</td>
                        <td className="p-3 font-bold">{r.role}</td>
                        <td className="p-3 font-mono">{r.phone}</td>
                        <td className="p-3 font-bold text-emerald-600">{r.status}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {records.length === 0 && !loading && (
        <div className="border border-dashed border-gold-400/20 rounded-3xl p-12 text-center text-foreground/45 flex flex-col justify-center items-center h-[35vh]">
          <FileText className="h-8 w-8 text-gold-400/30 mb-2" />
          <h4 className="font-serif font-bold text-foreground/70 mb-1">Reports compiler</h4>
          <p className="text-[10px] max-w-[220px]">Select a category and date ranges to preview operational lists and execute spreadsheet reports downloads.</p>
        </div>
      )}

    </div>
  );
}
