import { type CreatedReport, type NewReport } from './new-report';

export interface ReportRepository {
  create(report: NewReport): Promise<CreatedReport>;
  /** The branch a booking was made at, if it belongs to this user. */
  bookingBranchOf(bookingId: string, userId: string): Promise<string | null>;
}

export const REPORT_REPOSITORY = Symbol('REPORT_REPOSITORY');
