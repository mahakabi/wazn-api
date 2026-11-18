import { Module } from '@nestjs/common';
import { CatalogModule } from '../catalog/catalog.module';
import { CreateReportUseCase } from './application/create-report.use-case';
import { REPORT_REPOSITORY } from './domain/report-repository';
import { PrismaReportRepository } from './infrastructure/prisma-report.repository';
import { ReportsController } from './presentation/reports.controller';

@Module({
  imports: [CatalogModule],
  controllers: [ReportsController],
  providers: [
    CreateReportUseCase,
    { provide: REPORT_REPOSITORY, useClass: PrismaReportRepository },
  ],
})
export class ReportsModule {}
