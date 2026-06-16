'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, Phone, Mail, Plus, X, Edit, Eye, CheckCircle2, Clock, 
  AlertCircle, MessageSquare, ChevronRight, UserPlus, PhoneCall 
} from 'lucide-react';
import { adminService, CRMLead, CRMInquiry, CRMFollowUp } from '../../../services/admin';

export default function CRMPage() {
  const [leads, setLeads] = useState<CRMLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Lead inspector details
  const [selectedLead, setSelectedLead] = useState<CRMLead | null>(null);

  // Forms states
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [leadName, setLeadName] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadSource, setLeadSource] = useState('Website');
  const [leadNotes, setLeadNotes] = useState('');

  // Inquiry/Follow-up schedule states
  const [isFollowUpOpen, setIsFollowUpOpen] = useState(false);
  const [followUpNotes, setFollowUpNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [selectedInquiryId, setSelectedInquiryId] = useState('');

  // Follow-up complete state
  const [selectedFollowUp, setSelectedFollowUp] = useState<CRMFollowUp | null>(null);
  const [followUpOutcome, setFollowUpOutcome] = useState('');
  const [followUpNextAction, setFollowUpNextAction] = useState('');

  const loadLeads = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await adminService.getLeads();
      setLeads(data);
      if (selectedLead) {
        const refreshed = data.find(l => l.id === selectedLead.id);
        if (refreshed) setSelectedLead(refreshed);
      }
    } catch (err: any) {
      console.error(err);
      setError('Failed to sync CRM pipeline logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  const handleUpdateStatus = async (leadId: string, status: string) => {
    try {
      await adminService.updateLeadStatus(leadId, status);
      await loadLeads();
    } catch (err: any) {
      alert('Failed to update lead status');
    }
  };

  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName.trim() || !leadPhone.trim()) return;
    try {
      await adminService.createLead({
        name: leadName.trim(),
        email: leadEmail.trim() || undefined,
        phone: leadPhone.trim(),
        source: leadSource,
        notes: leadNotes.trim() || undefined
      });
      setLeadName('');
      setLeadPhone('');
      setLeadEmail('');
      setLeadNotes('');
      setIsAddLeadOpen(false);
      await loadLeads();
    } catch (err: any) {
      alert('Failed to register new lead');
    }
  };

  const handleScheduleFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInquiryId || !followUpDate || !followUpNotes.trim()) return;
    try {
      await adminService.scheduleFollowUp({
        inquiryId: selectedInquiryId,
        date: followUpDate,
        notes: followUpNotes.trim()
      });
      setFollowUpNotes('');
      setFollowUpDate('');
      setIsFollowUpOpen(false);
      await loadLeads();
    } catch (err: any) {
      alert('Failed to schedule callback follow-up');
    }
  };

  const handleCompleteFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFollowUp || !followUpOutcome.trim()) return;
    try {
      await adminService.completeFollowUp(selectedFollowUp.id, followUpOutcome.trim(), followUpNextAction.trim() || undefined);
      setFollowUpOutcome('');
      setFollowUpNextAction('');
      setSelectedFollowUp(null);
      await loadLeads();
    } catch (err: any) {
      alert('Failed to save follow-up callback details');
    }
  };

  const crmColumns = [
    { status: 'NEW', label: 'New Inquiries', color: 'bg-blue-500/10 text-blue-700 border-blue-500/20' },
    { status: 'CONTACTED', label: 'Contacted Leads', color: 'bg-amber-500/10 text-amber-700 border-amber-500/20' },
    { status: 'QUALIFIED', label: 'Qualified Opportunities', color: 'bg-indigo-500/10 text-indigo-700 border-indigo-500/20' },
    { status: 'WON', label: 'Won Conversions', color: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20' },
  ];

  return (
    <div className="space-y-6 relative min-h-[80vh]">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gold-400/20 pb-4 gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-foreground">Banquet CRM Pipeline</h2>
          <p className="text-xs text-foreground/50">Qualify marketing leads, schedule follow-ups, and track booking conversions</p>
        </div>
        <button
          onClick={() => setIsAddLeadOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-gold-600 to-gold-400 px-4 py-2.5 text-xs font-bold text-zinc-950 uppercase shadow-md hover:opacity-95 cursor-pointer"
        >
          <UserPlus className="h-4 w-4" /> Add Hot Lead
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 text-xs text-red-500 bg-red-500/5 p-4 rounded-xl border border-red-500/10">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-xs text-foreground/50 h-[40vh] flex flex-col justify-center items-center">
          <div className="h-8 w-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin mb-2" />
          Syncing sales pipeline...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          
          {/* Columns Loop */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4">
            {crmColumns.map(col => {
              const colLeads = leads.filter(l => l.status === col.status);
              
              return (
                <div key={col.status} className="bg-zinc-50 dark:bg-zinc-900/40 border border-gold-400/5 rounded-2xl p-4 min-h-[50vh] space-y-4">
                  <div className={`p-2 rounded-xl text-[10px] font-bold uppercase tracking-wider text-center border ${col.color}`}>
                    {col.label} ({colLeads.length})
                  </div>
                  
                  <div className="space-y-3">
                    {colLeads.map(l => (
                      <div 
                        key={l.id} 
                        onClick={() => setSelectedLead(l)}
                        className={`p-3.5 bg-white dark:bg-zinc-900 border rounded-xl hover:border-gold-400 shadow-sm transition-all cursor-pointer space-y-2 relative ${
                          selectedLead?.id === l.id ? 'ring-1 ring-gold-400 border-gold-400 bg-gold-400/5' : 'border-gold-400/10'
                        }`}
                      >
                        <div>
                          <span className="font-bold text-xs text-foreground block">{l.name}</span>
                          <span className="text-[9px] text-foreground/50 block font-mono">{l.phone}</span>
                        </div>
                        
                        <div className="flex justify-between items-center text-[9px] text-foreground/45 pt-1.5 border-t border-gold-400/5">
                          <span>Source: {l.source || 'Website'}</span>
                          <div className="flex gap-1">
                            {col.status !== 'WON' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const nextSt = col.status === 'NEW' ? 'CONTACTED' : col.status === 'CONTACTED' ? 'QUALIFIED' : 'WON';
                                  handleUpdateStatus(l.id, nextSt);
                                }}
                                className="text-gold-500 font-bold uppercase hover:text-gold-600"
                                title="Advance Pipeline"
                              >
                                &rarr;
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {colLeads.length === 0 && (
                      <p className="text-[10px] text-center text-foreground/30 py-12">No leads in stage.</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* CRM Side details panel */}
          <div className="lg:col-span-1">
            <AnimatePresence mode="wait">
              {selectedLead ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="glass-panel border border-gold-400/20 rounded-3xl p-6 bg-white dark:bg-zinc-900 space-y-6 shadow-sm max-h-[75vh] overflow-y-auto"
                >
                  <div className="flex justify-between items-start border-b border-gold-400/10 pb-3">
                    <div>
                      <h3 className="font-serif text-sm font-bold text-foreground">Lead Profile</h3>
                      <p className="text-[9px] text-foreground/45 font-mono">#{selectedLead.id}</p>
                    </div>
                    <button 
                      onClick={() => setSelectedLead(null)}
                      className="p-1 rounded hover:bg-gold-400/10 text-foreground/50"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center gap-2 text-foreground/75 font-semibold">
                      <Phone className="h-3.5 w-3.5 text-gold-500" />
                      <span>{selectedLead.phone}</span>
                    </div>
                    {selectedLead.email && (
                      <div className="flex items-center gap-2 text-foreground/75 font-semibold">
                        <Mail className="h-3.5 w-3.5 text-gold-500" />
                        <span>{selectedLead.email}</span>
                      </div>
                    )}
                    {selectedLead.notes && (
                      <div className="bg-gold-400/5 p-3 rounded-xl border border-gold-400/10 mt-2">
                        <span className="block text-[9px] font-bold text-gold-600 dark:text-gold-400 uppercase tracking-wide mb-1">Remarks</span>
                        <p className="text-[11px] text-foreground/75 leading-relaxed italic">&quot;{selectedLead.notes}&quot;</p>
                      </div>
                    )}
                  </div>

                  {/* Lead Inquiries Details */}
                  <div className="space-y-4 pt-2">
                    <div className="flex justify-between items-center">
                      <h4 className="font-serif text-xs font-bold text-foreground flex items-center gap-1.5">
                        <MessageSquare className="h-4 w-4 text-gold-500" /> Inquiries
                      </h4>
                    </div>

                    <div className="space-y-3">
                      {selectedLead.inquiries?.map((inq: CRMInquiry) => (
                        <div key={inq.id} className="p-3 bg-zinc-50 dark:bg-zinc-950/40 rounded-xl border border-gold-400/5 space-y-2 text-xs">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-foreground">{inq.eventType}</span>
                            <span className="text-[9px] text-foreground/50">{inq.eventDate}</span>
                          </div>
                          <p className="text-[10px] text-foreground/60">{inq.guests} Guests • {inq.notes || 'No custom details'}</p>
                          
                          {/* FollowUps Section */}
                          <div className="border-t border-gold-400/5 pt-2 mt-2 space-y-1.5">
                            <div className="flex justify-between items-center">
                              <span className="text-[9px] font-bold text-gold-500 uppercase tracking-wide">Follow-Up Call logs</span>
                              <button
                                onClick={() => {
                                  setSelectedInquiryId(inq.id);
                                  setIsFollowUpOpen(true);
                                }}
                                className="text-[9px] bg-gold-400/10 text-gold-600 px-2 py-0.5 rounded font-bold uppercase cursor-pointer"
                              >
                                Schedule
                              </button>
                            </div>

                            <div className="space-y-1.5">
                              {inq.followUps?.map((f: CRMFollowUp) => (
                                <div key={f.id} className="p-2 bg-white dark:bg-zinc-900 border border-gold-400/5 rounded-lg text-[10px] space-y-1">
                                  <div className="flex justify-between">
                                    <span className="font-bold text-foreground/70">{f.date}</span>
                                    <span className={`text-[8px] font-bold uppercase ${f.status === 'COMPLETED' ? 'text-emerald-600' : 'text-amber-600'}`}>{f.status}</span>
                                  </div>
                                  <p className="text-foreground/60 leading-relaxed italic">{f.notes}</p>
                                  {f.outcome && <p className="text-[9px] text-gold-600 font-bold">Outcome: {f.outcome}</p>}
                                  {f.status === 'SCHEDULED' && (
                                    <button
                                      onClick={() => setSelectedFollowUp(f)}
                                      className="w-full text-center text-gold-500 border border-dashed border-gold-400/20 py-1 rounded text-[8px] font-bold uppercase tracking-wider mt-1 hover:border-gold-500 hover:text-gold-600 cursor-pointer"
                                    >
                                      Record Call Callback
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </motion.div>
              ) : (
                <div className="border border-dashed border-gold-400/20 rounded-3xl p-12 text-center text-foreground/40 flex flex-col justify-center items-center h-[30vh]">
                  <Target className="h-8 w-8 text-gold-400/30 mb-2" />
                  <h4 className="font-serif font-bold text-foreground/70 mb-1">CRM Inspector</h4>
                  <p className="text-[10px] max-w-[200px]">Select any lead from the columns board to schedule follow-ups and update phone callback results.</p>
                </div>
              )}
            </AnimatePresence>
          </div>

        </div>
      )}

      {/* ADD LEAD MODAL */}
      <AnimatePresence>
        {isAddLeadOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-zinc-900 border border-gold-400/25 rounded-3xl p-6 shadow-2xl"
            >
              <div className="flex justify-between items-center border-b border-gold-400/10 pb-3 mb-4">
                <h3 className="font-serif text-lg font-bold text-foreground">Add Hot Lead</h3>
                <button 
                  onClick={() => setIsAddLeadOpen(false)}
                  className="p-1 rounded hover:bg-gold-400/10 text-foreground/50"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleAddLead} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-foreground/75 mb-1 uppercase text-[9px] tracking-wider">Client Name</label>
                  <input
                    type="text"
                    value={leadName}
                    onChange={(e) => setLeadName(e.target.value)}
                    placeholder="Enter customer name"
                    className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-950 px-3 py-2 text-foreground outline-none focus:border-gold-400"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-foreground/75 mb-1 uppercase text-[9px] tracking-wider">Phone contact</label>
                    <input
                      type="text"
                      value={leadPhone}
                      onChange={(e) => setLeadPhone(e.target.value)}
                      placeholder="e.g. +91 98888 77777"
                      className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-950 px-3 py-2 text-foreground outline-none focus:border-gold-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-foreground/75 mb-1 uppercase text-[9px] tracking-wider">Lead Source</label>
                    <select
                      value={leadSource}
                      onChange={(e) => setLeadSource(e.target.value)}
                      className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-950 px-3 py-2 text-foreground outline-none focus:border-gold-400 font-semibold"
                    >
                      <option value="Website">Website</option>
                      <option value="Referral">Referral</option>
                      <option value="Social Media">Social Media</option>
                      <option value="Walk-in">Walk-in</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-foreground/75 mb-1 uppercase text-[9px] tracking-wider">Email Address</label>
                  <input
                    type="email"
                    value={leadEmail}
                    onChange={(e) => setLeadEmail(e.target.value)}
                    placeholder="e.g. name@outlook.com"
                    className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-955 px-3 py-2 text-foreground outline-none focus:border-gold-400"
                  />
                </div>

                <div>
                  <label className="block font-bold text-foreground/75 mb-1 uppercase text-[9px] tracking-wider">Inquiry details</label>
                  <textarea
                    value={leadNotes}
                    onChange={(e) => setLeadNotes(e.target.value)}
                    placeholder="Preferences, catering specs..."
                    className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-950 px-3 py-2 text-foreground outline-none focus:border-gold-400 resize-none"
                    rows={2}
                  />
                </div>

                <div className="flex justify-end gap-2 border-t border-gold-400/10 pt-4 mt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddLeadOpen(false)}
                    className="rounded-xl border border-gold-400/20 bg-transparent px-5 py-2.5 font-sans font-bold hover:bg-gold-400/5 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-gradient-to-r from-gold-600 to-gold-400 px-5 py-2.5 font-sans font-bold text-zinc-950 uppercase tracking-widest hover:opacity-95 shadow-md shadow-gold-600/5 cursor-pointer"
                  >
                    Save Lead
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SCHEDULE FOLLOWUP MODAL */}
      <AnimatePresence>
        {isFollowUpOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-zinc-900 border border-gold-400/25 rounded-3xl p-6 shadow-2xl"
            >
              <div className="flex justify-between items-center border-b border-gold-400/10 pb-3 mb-4">
                <h3 className="font-serif text-lg font-bold text-foreground">Schedule Follow-up Call</h3>
                <button 
                  onClick={() => setIsFollowUpOpen(false)}
                  className="p-1 rounded hover:bg-gold-400/10 text-foreground/50"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleScheduleFollowUp} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-foreground/75 mb-1 uppercase text-[9px] tracking-wider">Callback Date</label>
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-950 px-3 py-2 text-foreground outline-none focus:border-gold-400"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-foreground/75 mb-1 uppercase text-[9px] tracking-wider">Call Guidelines / Target Notes</label>
                  <textarea
                    value={followUpNotes}
                    onChange={(e) => setFollowUpNotes(e.target.value)}
                    placeholder="e.g. Call client to clarify menu customizations proposal..."
                    className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-950 px-3 py-2 text-foreground outline-none focus:border-gold-400 resize-none"
                    rows={3}
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 border-t border-gold-400/10 pt-4 mt-2">
                  <button
                    type="button"
                    onClick={() => setIsFollowUpOpen(false)}
                    className="rounded-xl border border-gold-400/20 bg-transparent px-5 py-2.5 font-sans font-bold hover:bg-gold-400/5 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-gradient-to-r from-gold-600 to-gold-400 px-5 py-2.5 font-sans font-bold text-zinc-950 uppercase tracking-widest hover:opacity-95 shadow-md shadow-gold-600/5 cursor-pointer"
                  >
                    Schedule Callback
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* RECORD CALL OUTCOME MODAL */}
      <AnimatePresence>
        {selectedFollowUp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-zinc-900 border border-gold-400/25 rounded-3xl p-6 shadow-2xl"
            >
              <div className="flex justify-between items-center border-b border-gold-400/10 pb-3 mb-4">
                <h3 className="font-serif text-lg font-bold text-foreground">Record Call Callback Outcome</h3>
                <button 
                  onClick={() => setSelectedFollowUp(null)}
                  className="p-1 rounded hover:bg-gold-400/10 text-foreground/50"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleCompleteFollowUp} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-foreground/75 mb-1 uppercase text-[9px] tracking-wider font-semibold">Scheduled Date</label>
                  <p className="font-mono text-foreground/60">{selectedFollowUp.date}</p>
                </div>

                <div>
                  <label className="block font-bold text-foreground/75 mb-1 uppercase text-[9px] tracking-wider font-semibold">Call Remarks Guidelines</label>
                  <p className="text-foreground/70 italic">&quot;{selectedFollowUp.notes}&quot;</p>
                </div>

                <div>
                  <label className="block font-bold text-foreground/75 mb-1 uppercase text-[9px] tracking-wider">Call Outcome Result</label>
                  <input
                    type="text"
                    value={followUpOutcome}
                    onChange={(e) => setFollowUpOutcome(e.target.value)}
                    placeholder="e.g. Interested, wants venue tour Friday..."
                    className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-950 px-3 py-2 text-foreground outline-none focus:border-gold-400"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-foreground/75 mb-1 uppercase text-[9px] tracking-wider">Next Action Guideline</label>
                  <input
                    type="text"
                    value={followUpNextAction}
                    onChange={(e) => setFollowUpNextAction(e.target.value)}
                    placeholder="e.g. Tour scheduling email"
                    className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-950 px-3 py-2 text-foreground outline-none focus:border-gold-400"
                  />
                </div>

                <div className="flex justify-end gap-2 border-t border-gold-400/10 pt-4 mt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedFollowUp(null)}
                    className="rounded-xl border border-gold-400/20 bg-transparent px-5 py-2.5 font-sans font-bold hover:bg-gold-400/5 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-gradient-to-r from-gold-600 to-gold-400 px-5 py-2.5 font-sans font-bold text-zinc-950 uppercase tracking-widest hover:opacity-95 shadow-md shadow-gold-600/5 cursor-pointer"
                  >
                    Complete Call Record
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
