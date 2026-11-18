import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { PrismaModule } from './common/infrastructure/prisma/prisma.module';
import { ApiExceptionFilter } from './common/presentation/api-exception.filter';
import { AppConfigModule } from './config/app-config.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [AppConfigModule, PrismaModule, HealthModule],
  providers: [{ provide: APP_FILTER, useClass: ApiExceptionFilter }],
})
export class AppModule {}
