'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, Plus, FileText, Trash2, Calendar, BookOpen, User, 
  X, AlertCircle, PlusCircle, Paperclip, ChevronRight 
} from 'lucide-react';
import { adminService, CustomerDetails } from '../../../services/admin';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDetails | null>(null);
  const [sidebarLoading, setSidebarLoading] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [newDocName, setNewDocName] = useState('');
  const [newDocUrl, setNewDocUrl] = useState('');
  const [newDocType, setNewDocType] = useState('PDF');
  const [error, setError] = useState('');

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getCustomers(search, filter);
      setCustomers(data);
    } catch (err: any) {
      console.error(err);
      setError('Failed to load customers list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [search, filter]);

  const handleSelectCustomer = async (id: string) => {
    try {
      setSidebarLoading(true);
      const details = await adminService.getCustomer(id);
      setSelectedCustomer(details);
      // Reset forms
      setNewNote('');
      setNewDocName('');
      setNewDocUrl('');
    } catch (err: any) {
      alert('Failed to load customer details');
    } finally {
      setSidebarLoading(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !newNote.trim()) return;
    try {
      const added = await adminService.addNote(selectedCustomer.id, newNote);
      setSelectedCustomer(prev => {
        if (!prev) return null;
        return {
          ...prev,
          notes: [added, ...prev.notes]
        };
      });
      setNewNote('');
    } catch (err: any) {
      alert('Failed to add note');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!window.confirm('Delete this note?')) return;
    try {
      await adminService.deleteNote(noteId);
      setSelectedCustomer(prev => {
        if (!prev) return null;
        return {
          ...prev,
          notes: prev.notes.filter(n => n.id !== noteId)
        };
      });
    } catch (err: any) {
      alert('Failed to delete note');
    }
  };

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !newDocName.trim()) return;
    
    // Simulate upload using url
    const finalUrl = newDocUrl.trim() || '/documents/sample_contract.pdf';
    try {
      const added = await adminService.addDocument(selectedCustomer.id, newDocName, finalUrl, newDocType);
      setSelectedCustomer(prev => {
        if (!prev) return null;
        return {
          ...prev,
          documents: [added, ...prev.documents]
        };
      });
      setNewDocName('');
      setNewDocUrl('');
    } catch (err: any) {
      alert('Failed to upload document record');
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!window.confirm('Delete this document?')) return;
    try {
      await adminService.deleteDocument(docId);
      setSelectedCustomer(prev => {
        if (!prev) return null;
        return {
          ...prev,
          documents: prev.documents.filter(d => d.id !== docId)
        };
      });
    } catch (err: any) {
      alert('Failed to delete document');
    }
  };

  return (
    <div className="space-y-6 relative min-h-[80vh]">
      
      {/* Header section */}
      <div className="flex justify-between items-center border-b border-gold-400/20 pb-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-foreground">Customers Database</h2>
          <p className="text-xs text-foreground/50">Browse registered clients, audit document folders, and write notes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Main List */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-gold-400/10 shadow-sm justify-between">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-foreground/45">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, phone..."
                className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-950 pl-10 pr-4 py-2.5 text-xs text-foreground outline-none focus:border-gold-400"
              />
            </div>
            
            {/* Filter */}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-950 px-4 py-2.5 text-xs text-foreground outline-none focus:border-gold-400 min-w-[150px] w-full sm:w-auto"
            >
              <option value="ALL">All Clients</option>
              <option value="ACTIVE">With Bookings</option>
              <option value="INACTIVE">No Bookings</option>
            </select>
          </div>

          {/* Customers Table */}
          <div className="bg-white dark:bg-zinc-900 border border-gold-400/10 rounded-2xl overflow-hidden shadow-sm">
            {loading ? (
              <div className="p-12 text-center text-xs text-foreground/50">
                <div className="h-8 w-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                Searching clients directory...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gold-400/5 font-serif text-[11px] font-bold text-foreground border-b border-gold-400/15">
                      <th className="p-4">Customer Details</th>
                      <th className="p-4">Contact Info</th>
                      <th className="p-4">Joined Date</th>
                      <th className="p-4 text-center">Bookings</th>
                      <th className="p-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gold-400/10 text-foreground/80">
                    {customers.map((c) => (
                      <tr 
                        key={c.id} 
                        className={`hover:bg-gold-400/5 transition-colors cursor-pointer ${selectedCustomer?.id === c.id ? 'bg-gold-400/10' : ''}`}
                        onClick={() => handleSelectCustomer(c.id)}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-gold-400/10 text-gold-500 font-serif flex items-center justify-center font-bold">
                              {c.avatar || c.name.substring(0,2).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-bold text-foreground block">{c.name}</span>
                              <span className="text-[10px] text-foreground/40 font-mono block">{c.id}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="block">{c.email}</span>
                          <span className="block text-foreground/50 text-[10px]">{c.phone}</span>
                        </td>
                        <td className="p-4 text-foreground/60">{c.joinedDate}</td>
                        <td className="p-4 text-center font-bold">{c._count?.bookings || 0}</td>
                        <td className="p-4 text-right">
                          <button 
                            className="p-1 text-gold-500 hover:text-gold-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectCustomer(c.id);
                            }}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {customers.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-12 text-center text-foreground/40">
                          No customer entries found matching query.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Customer Details & Folder */}
        <div className="lg:col-span-1">
          <AnimatePresence mode="wait">
            {selectedCustomer ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="glass-panel border border-gold-400/20 rounded-3xl p-6 shadow-md bg-white dark:bg-zinc-900 space-y-6 sticky top-24 max-h-[78vh] overflow-y-auto"
              >
                {/* Customer card header */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gold-400/10 text-gold-500 font-serif flex items-center justify-center font-bold border border-gold-400/20">
                      {selectedCustomer.avatar}
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground text-sm leading-tight">{selectedCustomer.name}</h3>
                      <p className="text-[10px] text-foreground/50">{selectedCustomer.phone}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedCustomer(null)}
                    className="p-1.5 rounded-lg text-foreground/50 hover:bg-gold-400/10 hover:text-gold-500 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="h-[1px] bg-gold-400/10" />

                {/* Details list */}
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-foreground/50">Email:</span>
                    <span className="font-medium text-foreground">{selectedCustomer.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/50">Joined:</span>
                    <span className="font-medium text-foreground">{selectedCustomer.joinedDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/50">Preferences:</span>
                    <span className="font-medium text-foreground text-right max-w-[150px] truncate">
                      {selectedCustomer.cateringPref || 'None specified'}
                    </span>
                  </div>
                </div>

                {/* Notes Section */}
                <div className="space-y-4 pt-2">
                  <h4 className="font-serif text-sm font-bold text-foreground flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-gold-500" />
                    Customer Notes
                  </h4>
                  
                  {/* Add Note Form */}
                  <form onSubmit={handleAddNote} className="flex gap-2">
                    <input
                      type="text"
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Write internal staff note..."
                      className="flex-1 rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-950 px-3 py-2 text-xs text-foreground outline-none focus:border-gold-400"
                      required
                    />
                    <button
                      type="submit"
                      className="p-2 rounded-xl bg-gold-500 hover:bg-gold-600 text-zinc-950 font-bold transition-colors cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </form>

                  {/* Notes List */}
                  <div className="space-y-2.5 max-h-[20vh] overflow-y-auto pr-1">
                    {selectedCustomer.notes.map((note) => (
                      <div key={note.id} className="p-3 bg-gold-400/5 rounded-xl border border-gold-400/10 space-y-1 group">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-bold text-gold-600 dark:text-gold-400">{note.authorName}</span>
                          <button 
                            onClick={() => handleDeleteNote(note.id)}
                            className="text-foreground/30 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <p className="text-xs text-foreground/75 leading-relaxed">{note.note}</p>
                        <span className="text-[8px] text-foreground/30 block text-right">
                          {new Date(note.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                    {selectedCustomer.notes.length === 0 && (
                      <p className="text-[10px] text-center text-foreground/40 py-2">No notes cataloged.</p>
                    )}
                  </div>
                </div>

                {/* Documents Section */}
                <div className="space-y-4 pt-2">
                  <h4 className="font-serif text-sm font-bold text-foreground flex items-center gap-2">
                    <Paperclip className="h-4 w-4 text-gold-500" />
                    Documents Vault
                  </h4>

                  {/* Add Document Mock Form */}
                  <form onSubmit={handleAddDocument} className="space-y-2">
                    <input
                      type="text"
                      value={newDocName}
                      onChange={(e) => setNewDocName(e.target.value)}
                      placeholder="Document Name (e.g. Lawn Contract)"
                      className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-950 px-3 py-2 text-xs text-foreground outline-none focus:border-gold-400"
                      required
                    />
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newDocUrl}
                        onChange={(e) => setNewDocUrl(e.target.value)}
                        placeholder="/documents/blueprint.pdf (Simulation)"
                        className="flex-1 rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-950 px-3 py-2 text-xs text-foreground outline-none focus:border-gold-400"
                      />
                      <button
                        type="submit"
                        className="px-3.5 rounded-xl bg-gradient-to-r from-gold-600 to-gold-400 text-zinc-950 font-bold text-xs hover:opacity-95 transition-all cursor-pointer flex items-center gap-1 uppercase tracking-wider"
                      >
                        Add
                      </button>
                    </div>
                  </form>

                  {/* Documents List */}
                  <div className="space-y-2 max-h-[20vh] overflow-y-auto pr-1">
                    {selectedCustomer.documents.map((doc) => (
                      <div key={doc.id} className="flex justify-between items-center p-2.5 rounded-xl bg-ivory-50 border border-gold-400/5 hover:border-gold-400/20 transition-all">
                        <a 
                          href={doc.url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center gap-2 text-xs text-foreground/80 hover:text-gold-500 transition-colors"
                        >
                          <FileText className="h-4 w-4 text-gold-400 shrink-0" />
                          <span className="truncate max-w-[140px] font-medium">{doc.name}</span>
                        </a>
                        <button 
                          onClick={() => handleDeleteDocument(doc.id)}
                          className="text-foreground/40 hover:text-red-500 p-1 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                    {selectedCustomer.documents.length === 0 && (
                      <p className="text-[10px] text-center text-foreground/40 py-2">No documents stored.</p>
                    )}
                  </div>
                </div>

                {/* Booking Histories Section */}
                <div className="space-y-3 pt-2">
                  <h4 className="font-serif text-sm font-bold text-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gold-500" />
                    Reservations History
                  </h4>
                  <div className="space-y-2">
                    {selectedCustomer.bookings.map((b) => (
                      <div key={b.id} className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-gold-400/5 flex justify-between items-center">
                        <div>
                          <span className="font-bold block text-foreground">{b.eventType}</span>
                          <span className="text-[10px] text-foreground/50 block">{b.date}</span>
                        </div>
                        <span className={`rounded-full px-2 py-0.5 text-[8px] font-bold uppercase ${
                          b.status === 'CONFIRMED'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                            : b.status === 'CANCELLED'
                            ? 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
                        }`}>
                          {b.status}
                        </span>
                      </div>
                    ))}
                    {selectedCustomer.bookings.length === 0 && (
                      <p className="text-[10px] text-center text-foreground/40 py-1">No booking records found.</p>
                    )}
                  </div>
                </div>

              </motion.div>
            ) : (
              <div className="border border-dashed border-gold-400/20 rounded-3xl p-12 text-center text-foreground/40 flex flex-col justify-center items-center h-[50vh]">
                <User className="h-10 w-10 text-gold-400/30 mb-3" />
                <h4 className="font-serif font-bold text-foreground/70 mb-1">Select Client Profiles</h4>
                <p className="text-[10px] max-w-[200px]">Click on a client in the database view to open notes and document attachments folder.</p>
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
