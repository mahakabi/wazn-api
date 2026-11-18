import {
  type BookingPlace,
  type BookingRecord,
  type Confirmation,
  type NewBooking,
  type StaffBookingRecord,
} from '../../domain/booking-record';
import {
  type BookingRepository,
  type CreateBookingResult,
} from '../../domain/ports/booking-repository';

interface Row extends StaffBookingRecord {
  commission: string | null;
  confirmedBy: string | null;
}

export class InMemoryBookingRepository implements BookingRepository {
  readonly rows: Row[] = [];
  takenCodes = new Set<string>();

  constructor(
    private readonly place: BookingPlace,
    private readonly member: { name: string | null; phone: string | null },
    private readonly gymCommissionRate: string | null = null,
  ) {}

  create(booking: NewBooking): Promise<CreateBookingResult> {
    if (this.takenCodes.has(booking.code) || this.rows.some((row) => row.code === booking.code)) {
      return Promise.resolve({ codeTaken: true });
    }
    const row: Row = {
      ...booking,
      id: `b${this.rows.length + 1}`,
      planMonths: 3,
      status: 'ISSUED',
      createdAt: new Date(),
      confirmedAt: null,
      place: this.place,
      memberFirstName: this.member.name,
      memberPhone: this.member.phone,
      gymCommissionRate: this.gymCommissionRate,
      commission: null,
      confirmedBy: null,
    };
    this.rows.push(row);
    return Promise.resolve({ created: row });
  }

  findActive(userId: string, planId: string, now: Date): Promise<BookingRecord | null> {
    const row = this.rows.find(
      (candidate) =>
        candidate.userId === userId &&
        candidate.planId === planId &&
        candidate.status === 'ISSUED' &&
        candidate.expiresAt > now,
    );
    return Promise.resolve(row ?? null);
  }

  listForUser(userId: string): Promise<BookingRecord[]> {
    return Promise.resolve(this.rows.filter((row) => row.userId === userId));
  }

  findForUser(bookingId: string, userId: string): Promise<BookingRecord | null> {
    return Promise.resolve(
      this.rows.find((row) => row.id === bookingId && row.userId === userId) ?? null,
    );
  }

  findByCode(code: string): Promise<StaffBookingRecord | null> {
    return Promise.resolve(this.rows.find((row) => row.code === code) ?? null);
  }

  cancel(bookingId: string, now: Date): Promise<boolean> {
    return Promise.resolve(this.transition(bookingId, now, { status: 'CANCELLED' }));
  }

  confirm(confirmation: Confirmation): Promise<boolean> {
    return Promise.resolve(
      this.transition(confirmation.bookingId, confirmation.at, {
        status: 'CONFIRMED',
        confirmedAt: confirmation.at,
        confirmedBy: confirmation.staffId,
        commission: confirmation.commission,
      }),
    );
  }

  expireOverdue(now: Date): Promise<number> {
    let count = 0;
    this.rows.forEach((row, index) => {
      if (row.status === 'ISSUED' && row.expiresAt <= now) {
        this.rows[index] = { ...row, status: 'EXPIRED' };
        count += 1;
      }
    });
    return Promise.resolve(count);
  }

  private transition(id: string, now: Date, changes: Partial<Row>): boolean {
    const index = this.rows.findIndex(
      (row) => row.id === id && row.status === 'ISSUED' && row.expiresAt > now,
    );
    const row = this.rows[index];
    if (row === undefined) return false;
    this.rows[index] = { ...row, ...changes };
    return true;
  }
}
