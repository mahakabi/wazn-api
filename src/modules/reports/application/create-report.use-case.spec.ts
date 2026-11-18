import { type GetBranchSummariesUseCase } from '../../catalog/application/get-branch-summaries.use-case';
import { type BranchSummary } from '../../catalog/domain/branch-views';
import { BookingNotFoundError } from '../../bookings/domain/errors/booking-not-found.error';
import { BranchNotFoundError } from '../../catalog/domain/errors/branch-not-found.error';
import { BookingRequiredError } from '../domain/errors/booking-required.error';
import { type CreatedReport, type NewReport } from '../domain/new-report';
import { type ReportRepository } from '../domain/report-repository';
import { CreateReportUseCase } from './create-report.use-case';

class FakeReports implements ReportRepository {
  readonly created: NewReport[] = [];
  bookings = new Map([['booking1', { userId: 'user1', branchId: 'br1' }]]);

  create(report: NewReport): Promise<CreatedReport> {
    this.created.push(report);
    return Promise.resolve({ id: 'r1', type: report.type, createdAt: new Date() });
  }

  bookingBranchOf(bookingId: string, userId: string): Promise<string | null> {
    const booking = this.bookings.get(bookingId);
    return Promise.resolve(booking?.userId === userId ? booking.branchId : null);
  }
}

const branches = {
  execute: (ids: readonly string[]) =>
    Promise.resolve(
      new Map(ids.filter((id) => id === 'br1').map((id) => [id, { id } as BranchSummary])),
    ),
} as unknown as GetBranchSummariesUseCase;

describe('CreateReportUseCase', () => {
  let reports: FakeReports;
  let useCase: CreateReportUseCase;

  beforeEach(() => {
    reports = new FakeReports();
    useCase = new CreateReportUseCase(reports, branches);
  });

  it("files a price mismatch against the member's own booking", async () => {
    await useCase.execute('user1', {
      type: 'PRICE_MISMATCH',
      branchId: 'br1',
      bookingId: 'booking1',
      details: '  Charged 699 instead of 599 ',
    });

    expect(reports.created[0]).toEqual({
      type: 'PRICE_MISMATCH',
      branchId: 'br1',
      userId: 'user1',
      bookingId: 'booking1',
      details: 'Charged 699 instead of 599',
    });
  });

  it('requires a booking for price mismatches', async () => {
    await expect(
      useCase.execute('user1', { type: 'PRICE_MISMATCH', branchId: 'br1', details: 'x' }),
    ).rejects.toBeInstanceOf(BookingRequiredError);
  });

  it("rejects someone else's booking or a booking at another branch", async () => {
    await expect(
      useCase.execute('user2', {
        type: 'PRICE_MISMATCH',
        branchId: 'br1',
        bookingId: 'booking1',
        details: 'x',
      }),
    ).rejects.toBeInstanceOf(BookingNotFoundError);
  });

  it('allows outdated-price reports without a booking', async () => {
    await useCase.execute('user1', { type: 'OUTDATED_PRICE', branchId: 'br1', details: 'Now 350' });

    expect(reports.created).toHaveLength(1);
  });

  it('rejects unknown branches', async () => {
    await expect(
      useCase.execute('user1', { type: 'OUTDATED_PRICE', branchId: 'nope', details: 'x' }),
    ).rejects.toBeInstanceOf(BranchNotFoundError);
  });
});
