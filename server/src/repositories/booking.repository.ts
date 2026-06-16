import prisma from '../config/database';
import { BookingInput } from '../validations/booking.validation';

export class BookingRepository {
  async getAll() {
    return prisma.booking.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async checkDuplicate(date: string, location: string, excludeId?: string) {
    const conflict = await prisma.booking.findFirst({
      where: {
        date,
        location,
        status: { not: 'CANCELLED' },
        id: excludeId ? { not: excludeId } : undefined,
      },
    });
    if (conflict) {
      throw new Error(`Lawn is already booked for this date: ${date} at location: ${location}.`);
    }
  }

  async create(data: BookingInput) {
    const defaultLocation = 'Grand Main Lawn A & B';
    // Check duplicate
    await this.checkDuplicate(data.date, defaultLocation);

    // Attempt to link booking to existing customer profile by email
    const customer = await prisma.customer.findUnique({
      where: { email: data.email },
    });

    const todayStr = new Date().toISOString().split('T')[0];

    return prisma.$transaction(async (tx) => {
      const booking = await tx.booking.create({
        data: {
          customerId: customer ? customer.id : null,
          name: data.name,
          email: data.email,
          phone: data.phone,
          eventType: data.eventType,
          date: data.date,
          guests: data.guests,
          package: data.package,
          cost: data.cost,
          paid: 0,
          pending: data.cost,
          notes: data.notes,
          status: 'PENDING',
          location: defaultLocation,
          coordinatorName: 'Aravind Sharma',
          coordinatorPhone: '+91 98877 66554',
        },
      });

      // Create default coordination milestones for the timeline
      await tx.milestone.createMany({
        data: [
          { bookingId: booking.id, label: 'Inquiry Submitted', date: todayStr, status: 'COMPLETED' },
          { bookingId: booking.id, label: 'Site Visit & Consultation', status: 'PENDING' },
          { bookingId: booking.id, label: 'Booking Deposit Paid', status: 'PENDING' },
          { bookingId: booking.id, label: 'Design & Menu Finalization', status: 'PENDING' },
          { bookingId: booking.id, label: 'Balance Settlement', status: 'PENDING' },
          { bookingId: booking.id, label: 'Event Execution Day', status: 'PENDING' },
        ],
      });

      // Log initial status history
      await tx.bookingStatusHistory.create({
        data: {
          bookingId: booking.id,
          oldStatus: null,
          newStatus: 'PENDING',
          changedBy: 'CUSTOMER',
          notes: 'Initial booking inquiry submitted.',
        },
      });

      // Log initial timeline event
      await tx.bookingTimelineEvent.create({
        data: {
          bookingId: booking.id,
          title: 'Inquiry Submitted',
          description: `Booking inquiry created for ${data.eventType} on ${data.date}. Estimate: ₹${data.cost.toLocaleString()}.`,
          type: 'STATUS_CHANGE',
          date: todayStr,
        },
      });

      // Notify customer in their portal tray
      if (customer) {
        await tx.notification.create({
          data: {
            customerId: customer.id,
            date: todayStr,
            title: 'New Booking Inquiry',
            message: `Inquiry submitted for ${data.eventType} on ${data.date}. Estimate: ₹${data.cost.toLocaleString()}.`,
            type: 'info',
            read: false,
          },
        });
      }

      return booking;
    });
  }

  async update(id: string, data: Partial<BookingInput & { location: string; coordinatorName: string; coordinatorPhone: string; status: string; paid: number; pending: number; milestones?: any[] }>, changedBy = 'COORDINATOR') {
    const existing = await prisma.booking.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new Error(`Booking with ID ${id} not found.`);
    }

    const todayStr = new Date().toISOString().split('T')[0];
    if (existing.date < todayStr) {
      throw new Error('Past bookings cannot be updated or cancelled.');
    }

    // Downgrade prevention checks
    const costValCheck = data.cost !== undefined ? data.cost : existing.cost;
    if (costValCheck < existing.cost) {
      if (existing.paid >= existing.cost) {
        throw new Error('Package downgrade is not allowed for fully settled bookings.');
      } else if (existing.paid >= costValCheck) {
        throw new Error(`Package downgrade is not allowed because the amount already paid (₹${existing.paid.toLocaleString()}) is greater than or equal to the new package cost (₹${costValCheck.toLocaleString()}).`);
      }
    }

    const targetDate = data.date || existing.date;
    const targetLocation = data.location || existing.location;

    const dateChanged = data.date !== undefined && data.date !== existing.date;
    const locationChanged = data.location !== undefined && data.location !== existing.location;

    // Check duplicate if date or location actually changes
    if (dateChanged || locationChanged) {
      const targetStatus = data.status || existing.status;
      if (targetStatus !== 'CANCELLED') {
        await this.checkDuplicate(targetDate, targetLocation, id);
      }
    }


    return prisma.$transaction(async (tx) => {
      const costVal = data.cost !== undefined ? data.cost : existing.cost;
      const paidVal = data.paid !== undefined ? data.paid : existing.paid;
      const pendingVal = Math.max(0, costVal - paidVal);

      const { milestones, ...updateFields } = data;

      const updated = await tx.booking.update({
        where: { id },
        data: {
          ...updateFields,
          pending: pendingVal,
        },
      });

      if (milestones !== undefined) {
        for (const m of milestones) {
          await tx.milestone.updateMany({
            where: {
              bookingId: id,
              label: m.label,
            },
            data: {
              status: m.status,
              date: m.date,
            },
          });
        }
      }

      const timelineLogs: any[] = [];
      const statusLogs: any[] = [];

      // 1. If status changes
      if (data.status !== undefined && data.status !== existing.status) {
        statusLogs.push({
          bookingId: id,
          oldStatus: existing.status,
          newStatus: data.status,
          changedBy,
          notes: `Status transitioned from ${existing.status} to ${data.status}.`,
        });

        timelineLogs.push({
          bookingId: id,
          title: `Status Updated: ${data.status}`,
          description: `Booking status has been updated to ${data.status.toLowerCase()} by ${changedBy.toLowerCase()}.`,
          type: 'STATUS_CHANGE',
          date: todayStr,
        });

        // Add client notification if customerId exists
        if (existing.customerId) {
          const actionName = data.status === 'CONFIRMED' ? 'Confirmed' : data.status === 'CANCELLED' ? 'Cancelled' : 'Updated';
          await tx.notification.create({
            data: {
              customerId: existing.customerId,
              date: todayStr,
              title: `Booking ${actionName}`,
              message: `Your booking reservation ${id} (${existing.eventType}) has been marked ${data.status.toLowerCase()} by organizers.`,
              type: data.status === 'CONFIRMED' ? 'success' : data.status === 'CANCELLED' ? 'warning' : 'info',
              read: false,
            },
          });
        }
      }

      // 2. If logistics changed (date, location, guests, package) but status did not change
      const dateChanged = data.date !== undefined && data.date !== existing.date;
      const guestsChanged = data.guests !== undefined && data.guests !== existing.guests;
      const packageChanged = data.package !== undefined && data.package !== existing.package;
      const locationChanged = data.location !== undefined && data.location !== existing.location;

      if (dateChanged || guestsChanged || packageChanged || locationChanged) {
        let desc = 'Configurations updated:';
        if (dateChanged) desc += ` date to ${data.date};`;
        if (locationChanged) desc += ` location to ${data.location};`;
        if (guestsChanged) desc += ` guests to ${data.guests};`;
        if (packageChanged) desc += ` package to ${data.package};`;

        timelineLogs.push({
          bookingId: id,
          title: 'Booking Details Updated',
          description: desc,
          type: 'DETAILS_UPDATE',
          date: todayStr,
        });
      }

      // Save status history
      if (statusLogs.length > 0) {
        await tx.bookingStatusHistory.createMany({
          data: statusLogs,
        });
      }

      // Save timeline events
      if (timelineLogs.length > 0) {
        await tx.bookingTimelineEvent.createMany({
          data: timelineLogs,
        });
      }

      return updated;
    });
  }

  async getStatusHistory(bookingId: string) {
    return prisma.bookingStatusHistory.findMany({
      where: { bookingId },
      orderBy: { changedAt: 'desc' },
    });
  }

  async getTimelineEvents(bookingId: string) {
    return prisma.bookingTimelineEvent.findMany({
      where: { bookingId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async delete(id: string) {
    return prisma.booking.delete({
      where: { id },
    });
  }
}

export const bookingRepository = new BookingRepository();
