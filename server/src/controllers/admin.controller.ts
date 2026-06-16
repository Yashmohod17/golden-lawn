import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { adminService } from '../services/admin.service';
import { logAuditAction } from '../middleware/security.middleware';
import { 
  validateNoteInput, validateDocumentInput, validateBlockedDateInput, 
  validateInvoiceInput, validateStaffInput, validateTaskInput, 
  validateLeadInput, validateInquiryInput, validateFollowUpInput 
} from '../validations/admin.validation';

const JWT_SECRET = process.env.JWT_SECRET || 'golden_celebrations_secret_key_123_abc_xyz';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'golden_celebrations_refresh_secret_key_987_def_uvw';

export class AdminController {

  // ==========================================
  // AUTHENTICATION
  // ==========================================
  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
      }

      // Check admin User table
      const user = await prisma.user.findUnique({
        where: { email },
        include: { role: true }
      });

      if (!user) {
        return res.status(401).json({ error: 'Invalid administrative email or password.' });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid administrative email or password.' });
      }

      const roleName = user.role?.name || 'STAFF';

      // Generate JWT tokens
      const accessToken = jwt.sign(
        { id: user.id, email: user.email, role: roleName },
        JWT_SECRET,
        { expiresIn: '1h' }
      );
      const refreshToken = jwt.sign(
        { id: user.id, email: user.email, role: roleName },
        JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
      );

      // Audit Log
      await logAuditAction(user.id, 'ADMIN_LOGIN', { email: user.email }, req.ip);

      res.json({
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: roleName
        }
      });
    } catch (error) {
      next(error);
    }
  };

  // ==========================================
  // 1. DASHBOARD OVERVIEW
  // ==========================================
  getSummary = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const summary = await adminService.getDashboardSummary();
      res.json(summary);
    } catch (error) {
      next(error);
    }
  };

  // ==========================================
  // 2. CUSTOMER MANAGEMENT
  // ==========================================
  getCustomers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { search, filter } = req.query;
      const list = await adminService.listCustomers(
        search ? String(search) : '',
        filter ? String(filter) : 'ALL'
      );
      res.json(list);
    } catch (error) {
      next(error);
    }
  };

  getCustomer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const details = await adminService.getCustomerDetails(id);
      res.json(details);
    } catch (error) {
      next(error);
    }
  };

  addNote = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params; // customerId
      const { error, value } = validateNoteInput(req.body);
      if (error || !value) return res.status(400).json({ error });

      const note = await adminService.addCustomerNote(id, value.note, value.authorName);
      
      // Audit log
      await logAuditAction(req.user?.id || null, 'ADD_CUSTOMER_NOTE', { customerId: id }, req.ip);

      res.status(201).json(note);
    } catch (error) {
      next(error);
    }
  };

  deleteNote = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { noteId } = req.params;
      await adminService.deleteCustomerNote(noteId);
      
      // Audit log
      await logAuditAction(req.user?.id || null, 'DELETE_CUSTOMER_NOTE', { noteId }, req.ip);

      res.json({ success: true, message: 'Note deleted.' });
    } catch (error) {
      next(error);
    }
  };

  addDocument = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params; // customerId
      const { error, value } = validateDocumentInput(req.body);
      if (error || !value) return res.status(400).json({ error });

      const doc = await adminService.uploadCustomerDocument(id, value.name, value.url, value.type);
      
      // Audit log
      await logAuditAction(req.user?.id || null, 'ADD_CUSTOMER_DOCUMENT', { customerId: id, name: value.name }, req.ip);

      res.status(201).json(doc);
    } catch (error) {
      next(error);
    }
  };

  deleteDocument = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { docId } = req.params;
      await adminService.deleteCustomerDocument(docId);
      
      // Audit log
      await logAuditAction(req.user?.id || null, 'DELETE_CUSTOMER_DOCUMENT', { docId }, req.ip);

      res.json({ success: true, message: 'Document deleted.' });
    } catch (error) {
      next(error);
    }
  };

  // ==========================================
  // 3. AVAILABILITY CALENDAR
  // ==========================================
  getCalendar = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { month } = req.query; // e.g. "2026-11"
      const data = await adminService.getCalendarEvents(month ? String(month) : '');
      res.json(data);
    } catch (error) {
      next(error);
    }
  };

  blockDate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.body && !req.body.blockedBy && req.user) {
        req.body.blockedBy = req.user.email;
      }
      const { error, value } = validateBlockedDateInput(req.body);
      if (error || !value) return res.status(400).json({ error });

      const block = await adminService.blockDate(value.date, value.reason, value.blockedBy);
      
      // Audit log
      await logAuditAction(req.user?.id || null, 'BLOCK_DATE', { date: value.date }, req.ip);

      res.status(201).json(block);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  unblockDate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { date } = req.body;
      if (!date) return res.status(400).json({ error: 'Date is required.' });

      await adminService.unblockDate(date);
      
      // Audit log
      await logAuditAction(req.user?.id || null, 'UNBLOCK_DATE', { date }, req.ip);

      res.json({ success: true, message: `Date ${date} is now unblocked.` });
    } catch (error) {
      next(error);
    }
  };

  // ==========================================
  // 4. PAYMENTS & INVOICES
  // ==========================================
  getPayments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { search } = req.query;
      const list = await adminService.listPayments(search ? String(search) : '');
      res.json(list);
    } catch (error) {
      next(error);
    }
  };

  getInvoices = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { search } = req.query;
      const list = await adminService.listInvoices(search ? String(search) : '');
      res.json(list);
    } catch (error) {
      next(error);
    }
  };

  createInvoice = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error, value } = validateInvoiceInput(req.body);
      if (error || !value) return res.status(400).json({ error });

      const inv = await adminService.generateInvoice(value);
      
      // Audit log
      await logAuditAction(req.user?.id || null, 'GENERATE_INVOICE', { invoiceNo: inv.invoiceNo }, req.ip);

      res.status(201).json(inv);
    } catch (error) {
      next(error);
    }
  };

  updateInvoice = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      if (!status) return res.status(400).json({ error: 'Status is required.' });

      const updated = await adminService.updateInvoiceStatus(id, status);
      
      // Audit log
      await logAuditAction(req.user?.id || null, 'UPDATE_INVOICE', { id, status }, req.ip);

      res.json(updated);
    } catch (error) {
      next(error);
    }
  };

  // ==========================================
  // 5. STAFF OPERATIONS
  // ==========================================
  getStaff = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const list = await adminService.listStaff();
      res.json(list);
    } catch (error) {
      next(error);
    }
  };

  createStaff = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error, value } = validateStaffInput(req.body);
      if (error || !value) return res.status(400).json({ error });

      const result = await adminService.createStaff(value);
      
      // Audit log
      await logAuditAction(req.user?.id || null, 'CREATE_STAFF', { email: value.email }, req.ip);

      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  deleteStaff = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await adminService.deleteStaff(id);
      
      // Audit log
      await logAuditAction(req.user?.id || null, 'DELETE_STAFF', { id }, req.ip);

      res.json({ success: true, message: 'Staff member deleted.' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  logAttendance = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { staffId, date, status, checkIn, checkOut } = req.body;
      if (!staffId || !date || !status) {
        return res.status(400).json({ error: 'StaffId, date, and status are required.' });
      }

      const log = await adminService.logAttendance(staffId, date, status, checkIn, checkOut);
      res.json(log);
    } catch (error) {
      next(error);
    }
  };

  getAttendance = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { date } = req.query;
      if (!date) return res.status(400).json({ error: 'Date query param is required.' });

      const list = await adminService.getAttendanceReport(String(date));
      res.json(list);
    } catch (error) {
      next(error);
    }
  };

  getTasks = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const list = await adminService.getTasks();
      res.json(list);
    } catch (error) {
      next(error);
    }
  };

  createTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error, value } = validateTaskInput(req.body);
      if (error || !value) return res.status(400).json({ error });

      const creatorId = req.user?.id || '';
      const task = await adminService.createTask(creatorId, value);
      
      // Audit log
      await logAuditAction(req.user?.id || null, 'CREATE_TASK', { title: value.title }, req.ip);

      res.status(201).json(task);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  updateTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      if (!status) return res.status(400).json({ error: 'Status is required.' });

      const updated = await adminService.updateTaskStatus(id, status as any);
      res.json(updated);
    } catch (error) {
      next(error);
    }
  };

  // ==========================================
  // 6. CRM
  // ==========================================
  getLeads = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const list = await adminService.getLeads();
      res.json(list);
    } catch (error) {
      next(error);
    }
  };

  createLead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error, value } = validateLeadInput(req.body);
      if (error || !value) return res.status(400).json({ error });

      const lead = await adminService.createLead(value);
      res.status(201).json(lead);
    } catch (error) {
      next(error);
    }
  };

  updateLead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      if (!status) return res.status(400).json({ error: 'Status is required.' });

      const updated = await adminService.updateLeadStatus(id, status as any);
      res.json(updated);
    } catch (error) {
      next(error);
    }
  };

  addInquiry = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params; // leadId
      const { error, value } = validateInquiryInput(req.body);
      if (error || !value) return res.status(400).json({ error });

      const inq = await adminService.addLeadInquiry(id, value);
      res.status(201).json(inq);
    } catch (error) {
      next(error);
    }
  };

  scheduleFollowUp = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error, value } = validateFollowUpInput(req.body);
      if (error || !value) return res.status(400).json({ error });

      const follow = await adminService.scheduleFollowUp(value);
      res.status(201).json(follow);
    } catch (error) {
      next(error);
    }
  };

  completeFollowUp = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { outcome, nextAction } = req.body;
      if (!outcome) return res.status(400).json({ error: 'Outcome is required.' });

      const updated = await adminService.completeFollowUp(id, outcome, nextAction);
      res.json(updated);
    } catch (error) {
      next(error);
    }
  };

  // ==========================================
  // 7. ANALYTICS & REPORTS
  // ==========================================
  getAnalytics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const stats = await adminService.getAnalyticsData();
      res.json(stats);
    } catch (error) {
      next(error);
    }
  };

  getReport = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { category, startDate, endDate } = req.query;
      if (!category) return res.status(400).json({ error: 'Report category is required.' });

      const report = await adminService.getReportData(
        String(category),
        startDate ? String(startDate) : undefined,
        endDate ? String(endDate) : undefined
      );
      res.json(report);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };
}

export const adminController = new AdminController();
