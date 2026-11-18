import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/infrastructure/prisma/prisma.service';
import { type CreatedReport, type NewReport } from '../domain/new-report';
import { type ReportRepository } from '../domain/report-repository';

@Injectable()
export class PrismaReportRepository implements ReportRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(report: NewReport): Promise<CreatedReport> {
    return this.prisma.report.create({
      data: report,
      select: { id: true, type: true, createdAt: true },
    });
  }

  async bookingBranchOf(bookingId: string, userId: string): Promise<string | null> {
    const booking = await this.prisma.booking.findFirst({
      where: { id: bookingId, userId },
      select: { plan: { select: { branchId: true } } },
    });
    return booking?.plan.branchId ?? null;
  }
}
