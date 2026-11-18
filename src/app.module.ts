import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { EmailModule } from './common/infrastructure/email/email.module';
import { PrismaModule } from './common/infrastructure/prisma/prisma.module';
import { RedisModule } from './common/infrastructure/redis/redis.module';
import { TimeModule } from './common/infrastructure/time/time.module';
import { ApiExceptionFilter } from './common/presentation/api-exception.filter';
import { AppConfigModule } from './config/app-config.module';
import { AuthModule } from './modules/auth/auth.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { HealthModule } from './modules/health/health.module';
import { ReportsModule } from './modules/reports/reports.module';
import { SavedModule } from './modules/saved/saved.module';
import { SettingsModule } from './modules/settings/settings.module';

@Module({
  imports: [
    AppConfigModule,
    PrismaModule,
    RedisModule,
    EmailModule,
    TimeModule,
    SettingsModule,
    HealthModule,
    ScheduleModule.forRoot(),
    AuthModule,
    CatalogModule,
    BookingsModule,
    SavedModule,
    ReportsModule,
  ],
  providers: [{ provide: APP_FILTER, useClass: ApiExceptionFilter }],
})
export class AppModule {}
