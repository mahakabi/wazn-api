import { type ReportType } from './report-type';

export interface NewReport {
  readonly type: ReportType;
  readonly branchId: string;
  readonly userId: string;
  readonly bookingId: string | null;
  readonly details: string;
}

export interface CreatedReport {
  readonly id: string;
  readonly type: ReportType;
  readonly createdAt: Date;
}
