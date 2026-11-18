import { Controller, Get, HttpStatus, Res, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiOkResponse, ApiServiceUnavailableResponse, ApiTags } from '@nestjs/swagger';
import { type Response } from 'express';
import { Public } from '../../../common/presentation/public.decorator';
import { CheckHealthUseCase } from '../application/check-health.use-case';
import { type HealthReport } from '../domain/health-report';
import { HealthReportDto } from './health-report.dto';

@ApiTags('health')
@Public()
@Controller({ path: 'health', version: VERSION_NEUTRAL })
export class HealthController {
  constructor(private readonly checkHealth: CheckHealthUseCase) {}

  @Get()
  @ApiOkResponse({ type: HealthReportDto })
  @ApiServiceUnavailableResponse({ type: HealthReportDto })
  async get(@Res({ passthrough: true }) response: Response): Promise<HealthReport> {
    const report = await this.checkHealth.execute();
    // 503 lets load balancers/orchestrators pull an instance whose dependencies are down.
    response.status(report.status === 'ok' ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE);
    return report;
  }
}
