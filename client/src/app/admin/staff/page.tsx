'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, UserCheck, CheckSquare, Plus, Trash2, Calendar, Clock, 
  AlertCircle, Shield, Briefcase, PlusCircle, Check, Play, Square, Award, X 
} from 'lucide-react';
import { adminService, StaffMember, Task } from '../../../services/admin';

export default function StaffPage() {
  const [activeTab, setActiveTab] = useState<'DIRECTORY' | 'ATTENDANCE' | 'TASKS'>('DIRECTORY');
  
  // States
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Directory forms
  const [isHireOpen, setIsHireOpen] = useState(false);
  const [hireName, setHireName] = useState('');
  const [hireEmail, setHireEmail] = useState('');
  const [hirePassword, setHirePassword] = useState('');
  const [hireRole, setHireRole] = useState('COORDINATOR');
  const [hirePhone, setHirePhone] = useState('');
  const [hireSalary, setHireSalary] = useState(40000);

  // Task forms
  const [isTaskOpen, setIsTaskOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState('MEDIUM');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskAssignee, setTaskAssignee] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      if (activeTab === 'DIRECTORY') {
        const staffData = await adminService.getStaff();
        setStaff(staffData);
      } else if (activeTab === 'ATTENDANCE') {
        const attData = await adminService.getAttendance(attendanceDate);
        setAttendance(attData);
        const staffData = await adminService.getStaff();
        setStaff(staffData);
      } else if (activeTab === 'TASKS') {
        const tasksData = await adminService.getTasks();
        setTasks(tasksData);
        const staffData = await adminService.getStaff();
        setStaff(staffData);
      }
    } catch (err: any) {
      console.error(err);
      setError('Failed to load operations records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab, attendanceDate]);

  // Attendance actions
  const handleMarkAttendance = async (staffId: string, status: string, checkIn = '09:00', checkOut = '18:00') => {
    try {
      await adminService.logAttendance({
        staffId,
        date: attendanceDate,
        status,
        checkIn,
        checkOut
      });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update attendance');
    }
  };

  // Hire action
  const handleHire = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hireName.trim() || !hireEmail.trim() || !hirePhone.trim()) return;
    try {
      await adminService.createStaff({
        name: hireName.trim(),
        email: hireEmail.trim(),
        password: hirePassword || 'staff123',
        role: hireRole,
        phone: hirePhone.trim(),
        salary: hireSalary,
        status: 'ACTIVE'
      });
      setHireName('');
      setHireEmail('');
      setHirePhone('');
      setHirePassword('');
      setIsHireOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to hire staff member');
    }
  };

  const handleFire = async (id: string) => {
    if (!window.confirm('Terminate staff contract and credentials?')) return;
    try {
      await adminService.deleteStaff(id);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to terminate staff');
    }
  };

  // Task actions
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    try {
      await adminService.createTask({
        title: taskTitle.trim(),
        description: taskDesc.trim(),
        priority: taskPriority,
        dueDate: taskDueDate || undefined,
        assignedToId: taskAssignee || undefined
      });
      setTaskTitle('');
      setTaskDesc('');
      setTaskDueDate('');
      setTaskAssignee('');
      setIsTaskOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to schedule task');
    }
  };

  const handleUpdateTask = async (id: string, status: string) => {
    try {
      await adminService.updateTask(id, status);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update task');
    }
  };

  return (
    <div className="space-y-6 relative min-h-[80vh]">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gold-400/20 pb-4 gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-foreground">Staff & Operations Board</h2>
          <p className="text-xs text-foreground/50">Manage coordinator payroll, clock attendance log entries, and allocate stage banquet checklist tasks</p>
        </div>
        
        <div className="flex gap-2">
          {activeTab === 'DIRECTORY' && (
            <button
              onClick={() => setIsHireOpen(true)}
              className="flex items-center gap-1 bg-gradient-to-r from-gold-600 to-gold-400 px-4 py-2 rounded-xl text-xs font-bold text-zinc-950 uppercase shadow-md cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Add Employee
            </button>
          )}
          {activeTab === 'TASKS' && (
            <button
              onClick={() => setIsTaskOpen(true)}
              className="flex items-center gap-1 bg-gradient-to-r from-gold-600 to-gold-400 px-4 py-2 rounded-xl text-xs font-bold text-zinc-950 uppercase shadow-md cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Delegate Task
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 text-xs text-red-500 bg-red-500/5 p-4 rounded-xl border border-red-500/10">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs list */}
      <div className="flex border-b border-gold-400/10 gap-4">
        {[
          { id: 'DIRECTORY', label: 'Staff Directory', icon: Users },
          { id: 'ATTENDANCE', label: 'Attendance Sheet', icon: UserCheck },
          { id: 'TASKS', label: 'Tasks Board', icon: CheckSquare },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`flex items-center gap-2 pb-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
              activeTab === t.id 
                ? 'border-gold-500 text-gold-500' 
                : 'border-transparent text-foreground/60 hover:text-gold-500'
            }`}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Content wrapper */}
      <div className="bg-white dark:bg-zinc-900 border border-gold-400/10 rounded-2xl p-6 shadow-sm min-h-[50vh]">
        
        {loading ? (
          <div className="p-12 text-center text-xs text-foreground/50 h-[40vh] flex flex-col justify-center items-center">
            <div className="h-8 w-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin mb-2" />
            Synching operational logs...
          </div>
        ) : (
          <div>
            
            {/* DIRECTORY TAB */}
            {activeTab === 'DIRECTORY' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gold-400/5 font-serif text-[11px] font-bold text-foreground border-b border-gold-400/15">
                      <th className="p-4">Staff Member</th>
                      <th className="p-4">Assigned Role</th>
                      <th className="p-4">Contact Phone</th>
                      <th className="p-4">Est. Monthly Salary</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gold-400/10 text-foreground/80">
                    {staff.map((s) => (
                      <tr key={s.id} className="hover:bg-gold-400/5 transition-colors">
                        <td className="p-4">
                          <span className="font-bold text-foreground block">{s.user?.name}</span>
                          <span className="text-[10px] text-foreground/50 block">{s.user?.email}</span>
                        </td>
                        <td className="p-4 font-medium text-foreground">{s.role}</td>
                        <td className="p-4 text-foreground/60">{s.phone}</td>
                        <td className="p-4 font-semibold text-gold-500">
                          {s.salary ? `₹${s.salary.toLocaleString()}` : 'Not fixed'}
                        </td>
                        <td className="p-4">
                          <span className={`rounded-full px-2 py-0.5 text-[8px] font-bold uppercase ${
                            s.status === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                              : 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400'
                          }`}>
                            {s.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleFire(s.id)}
                            className="p-1 text-red-500 hover:text-red-600 rounded hover:bg-red-500/5"
                            title="Terminate Employee"
                            disabled={s.role === 'OWNER'}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* ATTENDANCE TAB */}
            {activeTab === 'ATTENDANCE' && (
              <div className="space-y-6">
                {/* Date select */}
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-gold-500" />
                  <span className="text-xs font-bold text-foreground">Select Attendance Date:</span>
                  <input
                    type="date"
                    value={attendanceDate}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                    className="rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-950 px-3 py-2 text-xs text-foreground outline-none focus:border-gold-400"
                  />
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-gold-400/5 font-serif text-[11px] font-bold text-foreground border-b border-gold-400/15">
                        <th className="p-4">Employee</th>
                        <th className="p-4">Designation</th>
                        <th className="p-4">Lawn Clock In</th>
                        <th className="p-4">Lawn Clock Out</th>
                        <th className="p-4">Attendance Status</th>
                        <th className="p-4 text-right">Update Marks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gold-400/10 text-foreground/80">
                      {staff.map((s) => {
                        const attEntry = attendance.find(a => a.staffId === s.id);
                        const curStatus = attEntry?.status || 'NOT_MARKED';
                        
                        return (
                          <tr key={s.id} className="hover:bg-gold-400/5 transition-colors">
                            <td className="p-4 font-bold text-foreground">{s.user?.name}</td>
                            <td className="p-4 text-foreground/60">{s.role}</td>
                            <td className="p-4 font-mono">{attEntry?.checkIn || '--:--'}</td>
                            <td className="p-4 font-mono">{attEntry?.checkOut || '--:--'}</td>
                            <td className="p-4">
                              <span className={`rounded-full px-2 py-0.5 text-[8px] font-bold uppercase ${
                                curStatus === 'PRESENT'
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                                  : curStatus === 'ABSENT'
                                  ? 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400'
                                  : curStatus === 'LEAVE'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-zinc-100 text-zinc-500'
                              }`}>
                                {curStatus}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex justify-end gap-1.5">
                                <button
                                  onClick={() => handleMarkAttendance(s.id, 'PRESENT', '09:00', '18:00')}
                                  className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-600 font-bold hover:bg-emerald-500 hover:text-white transition-all text-[9px] uppercase cursor-pointer"
                                >
                                  Present
                                </button>
                                <button
                                  onClick={() => handleMarkAttendance(s.id, 'ABSENT')}
                                  className="px-2 py-1 rounded bg-red-500/10 text-red-600 font-bold hover:bg-red-500 hover:text-white transition-all text-[9px] uppercase cursor-pointer"
                                >
                                  Absent
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TASKS TAB */}
            {activeTab === 'TASKS' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Pending Tasks */}
                <div className="space-y-4">
                  <h4 className="font-serif font-bold text-foreground text-sm border-b border-amber-500/15 pb-2 text-amber-600 flex items-center gap-1.5">
                    <Play className="h-4 w-4 rotate-90" /> PENDING
                  </h4>
                  <div className="space-y-3">
                    {tasks.filter(t => t.status === 'PENDING').map(t => (
                      <div key={t.id} className="p-4 bg-amber-500/5 rounded-xl border border-amber-500/10 space-y-2 group relative">
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-xs text-foreground block line-clamp-1">{t.title}</span>
                          <span className="text-[8px] font-bold bg-amber-500/10 text-amber-700 px-1.5 py-0.5 rounded uppercase">{t.priority}</span>
                        </div>
                        <p className="text-[11px] text-foreground/70 leading-relaxed line-clamp-2">{t.description}</p>
                        <div className="flex justify-between items-center text-[9px] text-foreground/45 pt-1.5 border-t border-gold-400/5">
                          <span>Assignee: {t.assignedTo?.user?.name || 'Unassigned'}</span>
                          <button 
                            onClick={() => handleUpdateTask(t.id, 'IN_PROGRESS')}
                            className="text-gold-600 font-bold uppercase hover:text-gold-700 cursor-pointer"
                          >
                            Start
                          </button>
                        </div>
                      </div>
                    ))}
                    {tasks.filter(t => t.status === 'PENDING').length === 0 && (
                      <p className="text-[10px] text-center text-foreground/40 py-8">No pending items.</p>
                    )}
                  </div>
                </div>

                {/* In Progress Tasks */}
                <div className="space-y-4">
                  <h4 className="font-serif font-bold text-foreground text-sm border-b border-gold-400/25 pb-2 text-gold-500 flex items-center gap-1.5">
                    <Clock className="h-4 w-4" /> IN PROGRESS
                  </h4>
                  <div className="space-y-3">
                    {tasks.filter(t => t.status === 'IN_PROGRESS').map(t => (
                      <div key={t.id} className="p-4 bg-gold-400/5 rounded-xl border border-gold-400/15 space-y-2">
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-xs text-foreground block line-clamp-1">{t.title}</span>
                          <span className="text-[8px] font-bold bg-gold-500/10 text-gold-600 px-1.5 py-0.5 rounded uppercase">{t.priority}</span>
                        </div>
                        <p className="text-[11px] text-foreground/70 leading-relaxed line-clamp-2">{t.description}</p>
                        <div className="flex justify-between items-center text-[9px] text-foreground/45 pt-1.5 border-t border-gold-400/5">
                          <span>Assignee: {t.assignedTo?.user?.name || 'Unassigned'}</span>
                          <button 
                            onClick={() => handleUpdateTask(t.id, 'COMPLETED')}
                            className="text-emerald-600 font-bold uppercase hover:text-emerald-700 cursor-pointer"
                          >
                            Complete
                          </button>
                        </div>
                      </div>
                    ))}
                    {tasks.filter(t => t.status === 'IN_PROGRESS').length === 0 && (
                      <p className="text-[10px] text-center text-foreground/40 py-8">No tasks in progress.</p>
                    )}
                  </div>
                </div>

                {/* Completed Tasks */}
                <div className="space-y-4">
                  <h4 className="font-serif font-bold text-foreground text-sm border-b border-emerald-500/15 pb-2 text-emerald-600 flex items-center gap-1.5">
                    <Check className="h-4 w-4" /> COMPLETED
                  </h4>
                  <div className="space-y-3">
                    {tasks.filter(t => t.status === 'COMPLETED').map(t => (
                      <div key={t.id} className="p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/10 space-y-2 opacity-75">
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-xs text-foreground block line-clamp-1 line-through">{t.title}</span>
                          <span className="text-[8px] font-bold bg-emerald-500/10 text-emerald-700 px-1.5 py-0.5 rounded uppercase">{t.priority}</span>
                        </div>
                        <p className="text-[11px] text-foreground/60 leading-relaxed line-clamp-2">{t.description}</p>
                        <div className="flex justify-between items-center text-[9px] text-foreground/45 pt-1.5 border-t border-gold-400/5">
                          <span>Assignee: {t.assignedTo?.user?.name || 'Unassigned'}</span>
                          <span className="text-[8px] text-emerald-600 font-bold uppercase">Done</span>
                        </div>
                      </div>
                    ))}
                    {tasks.filter(t => t.status === 'COMPLETED').length === 0 && (
                      <p className="text-[10px] text-center text-foreground/40 py-8">No completed items.</p>
                    )}
                  </div>
                </div>

              </div>
            )}

          </div>
        )}
      </div>

      {/* HIRE MODAL */}
      <AnimatePresence>
        {isHireOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-zinc-900 border border-gold-400/25 rounded-3xl p-6 shadow-2xl"
            >
              <div className="flex justify-between items-center border-b border-gold-400/10 pb-3 mb-4">
                <h3 className="font-serif text-lg font-bold text-foreground">Hire Staff Credentials</h3>
                <button 
                  onClick={() => setIsHireOpen(false)}
                  className="p-1 rounded hover:bg-gold-400/10 text-foreground/50 hover:text-gold-500"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleHire} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-foreground/75 mb-1 uppercase text-[9px] tracking-wider">Employee Name</label>
                  <input
                    type="text"
                    value={hireName}
                    onChange={(e) => setHireName(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-950 px-3 py-2 text-foreground outline-none focus:border-gold-400"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-foreground/75 mb-1 uppercase text-[9px] tracking-wider">Corporate Email</label>
                  <input
                    type="email"
                    value={hireEmail}
                    onChange={(e) => setHireEmail(e.target.value)}
                    placeholder="e.g. name@goldencelebration.com"
                    className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-950 px-3 py-2 text-foreground outline-none focus:border-gold-400"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-foreground/75 mb-1 uppercase text-[9px] tracking-wider">System Password</label>
                    <input
                      type="password"
                      value={hirePassword}
                      onChange={(e) => setHirePassword(e.target.value)}
                      placeholder="e.g. staff123"
                      className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-950 px-3 py-2 text-foreground outline-none focus:border-gold-400 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-foreground/75 mb-1 uppercase text-[9px] tracking-wider">Designation Role</label>
                    <select
                      value={hireRole}
                      onChange={(e) => setHireRole(e.target.value)}
                      className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-950 px-3 py-2 text-foreground outline-none focus:border-gold-400 font-semibold"
                    >
                      <option value="COORDINATOR">Coordinator</option>
                      <option value="MANAGER">Manager</option>
                      <option value="DECOR_STAFF">Decor Specialist</option>
                      <option value="CATERING_HEAD">Catering Head</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 font-semibold">
                  <div>
                    <label className="block font-bold text-foreground/75 mb-1 uppercase text-[9px] tracking-wider">Phone contact</label>
                    <input
                      type="text"
                      value={hirePhone}
                      onChange={(e) => setHirePhone(e.target.value)}
                      placeholder="+91 98888 77777"
                      className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-950 px-3 py-2 text-foreground outline-none focus:border-gold-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-foreground/75 mb-1 uppercase text-[9px] tracking-wider">Salary (₹/mo)</label>
                    <input
                      type="number"
                      value={hireSalary}
                      onChange={(e) => setHireSalary(parseInt(e.target.value) || 0)}
                      className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-950 px-3 py-2 text-foreground outline-none focus:border-gold-400"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 border-t border-gold-400/10 pt-4 mt-2">
                  <button
                    type="button"
                    onClick={() => setIsHireOpen(false)}
                    className="rounded-xl border border-gold-400/20 bg-transparent px-5 py-2.5 font-sans font-bold hover:bg-gold-400/5 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-gradient-to-r from-gold-600 to-gold-400 px-5 py-2.5 font-sans font-bold text-zinc-950 uppercase tracking-widest hover:opacity-95 shadow-md shadow-gold-600/5 cursor-pointer"
                  >
                    Hire Employee
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TASK DELEGATE MODAL */}
      <AnimatePresence>
        {isTaskOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-zinc-900 border border-gold-400/25 rounded-3xl p-6 shadow-2xl"
            >
              <div className="flex justify-between items-center border-b border-gold-400/10 pb-3 mb-4">
                <h3 className="font-serif text-lg font-bold text-foreground">Schedule Banquet Task</h3>
                <button 
                  onClick={() => setIsTaskOpen(false)}
                  className="p-1 rounded hover:bg-gold-400/10 text-foreground/50 hover:text-gold-500"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-foreground/75 mb-1 uppercase text-[9px] tracking-wider">Task Title</label>
                  <input
                    type="text"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="e.g. Confirm Catering sweet stalls count"
                    className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-950 px-3 py-2 text-foreground outline-none focus:border-gold-400"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-foreground/75 mb-1 uppercase text-[9px] tracking-wider">Task Description</label>
                  <textarea
                    value={taskDesc}
                    onChange={(e) => setTaskDesc(e.target.value)}
                    placeholder="Detailed remarks or guidelines..."
                    className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-950 px-3 py-2 text-foreground outline-none focus:border-gold-400 resize-none"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-foreground/75 mb-1 uppercase text-[9px] tracking-wider">Priority Level</label>
                    <select
                      value={taskPriority}
                      onChange={(e) => setTaskPriority(e.target.value)}
                      className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-950 px-3 py-2 text-foreground outline-none focus:border-gold-400 font-semibold"
                    >
                      <option value="LOW">LOW</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HIGH">HIGH</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-foreground/75 mb-1 uppercase text-[9px] tracking-wider">Task Due Date</label>
                    <input
                      type="date"
                      value={taskDueDate}
                      onChange={(e) => setTaskDueDate(e.target.value)}
                      className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-950 px-3 py-2 text-foreground outline-none focus:border-gold-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-foreground/75 mb-1 uppercase text-[9px] tracking-wider">Assignee Staff member</label>
                  <select
                    value={taskAssignee}
                    onChange={(e) => setTaskAssignee(e.target.value)}
                    className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-950 px-3 py-2 text-foreground outline-none focus:border-gold-400 font-semibold"
                  >
                    <option value="">Leave Unassigned</option>
                    {staff.map(s => (
                      <option key={s.id} value={s.id}>{s.user?.name} ({s.role})</option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-2 border-t border-gold-400/10 pt-4 mt-2">
                  <button
                    type="button"
                    onClick={() => setIsTaskOpen(false)}
                    className="rounded-xl border border-gold-400/20 bg-transparent px-5 py-2.5 font-sans font-bold hover:bg-gold-400/5 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-gradient-to-r from-gold-600 to-gold-400 px-5 py-2.5 font-sans font-bold text-zinc-950 uppercase tracking-widest hover:opacity-95 shadow-md shadow-gold-600/5 cursor-pointer"
                  >
                    Delegate
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
