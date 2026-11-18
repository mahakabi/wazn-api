import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApiErrorDto } from '../../../common/presentation/api-error';
import { type AccessTokenClaims } from '../../auth/domain/access-token-claims';
import { CurrentUser } from '../../auth/presentation/current-user.decorator';
import { CreateReportUseCase } from '../application/create-report.use-case';
import { type CreatedReport } from '../domain/new-report';
import { CreateReportDto } from './dto/create-report.dto';
import { ReportCreatedDto } from './dto/report-created.dto';

@ApiTags('reports')
@ApiBearerAuth()
@Controller('reports')
export class ReportsController {
  constructor(private readonly createReport: CreateReportUseCase) {}

  @Post()
  @ApiCreatedResponse({ type: ReportCreatedDto })
  @ApiBadRequestResponse({ type: ApiErrorDto, description: 'BOOKING_REQUIRED, VALIDATION_FAILED' })
  @ApiNotFoundResponse({ type: ApiErrorDto, description: 'BRANCH_NOT_FOUND, BOOKING_NOT_FOUND' })
  create(
    @CurrentUser() caller: AccessTokenClaims,
    @Body() body: CreateReportDto,
  ): Promise<CreatedReport> {
    return this.createReport.execute(caller.userId, body);
  }
}
