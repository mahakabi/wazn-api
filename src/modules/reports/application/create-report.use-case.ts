import { Inject, Injectable } from '@nestjs/common';
import { GetBranchSummariesUseCase } from '../../catalog/application/get-branch-summaries.use-case';
import { BranchNotFoundError } from '../../catalog/domain/errors/branch-not-found.error';
import { BookingNotFoundError } from '../../bookings/domain/errors/booking-not-found.error';
import { BookingRequiredError } from '../domain/errors/booking-required.error';
import { type CreatedReport } from '../domain/new-report';
import { REPORT_REPOSITORY, type ReportRepository } from '../domain/report-repository';
import { type ReportType } from '../domain/report-type';

export interface CreateReportInput {
  readonly type: ReportType;
  readonly branchId: string;
  readonly bookingId?: string;
  readonly details: string;
}

/** Business rule #10. Price mismatches go to the top of the admin reports list. */
@Injectable()
export class CreateReportUseCase {
  constructor(
    @Inject(REPORT_REPOSITORY) private readonly reports: ReportRepository,
    private readonly branches: GetBranchSummariesUseCase,
  ) {}

  async execute(userId: string, input: CreateReportInput): Promise<CreatedReport> {
    if (input.type === 'PRICE_MISMATCH' && input.bookingId === undefined) {
      throw new BookingRequiredError();
    }
    if (!(await this.branches.execute([input.branchId])).has(input.branchId)) {
      throw new BranchNotFoundError(input.branchId);
    }
    if (input.bookingId !== undefined) {
      const bookingBranch = await this.reports.bookingBranchOf(input.bookingId, userId);
      if (bookingBranch !== input.branchId) throw new BookingNotFoundError();
    }
    return this.reports.create({
      type: input.type,
      branchId: input.branchId,
      userId,
      bookingId: input.bookingId ?? null,
      details: input.details.trim(),
    });
  }
}
