import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ExpireOverdueBookingsUseCase } from '../application/expire-overdue-bookings.use-case';

/**
 * Business rule #3: ISSUED → EXPIRED once the validity window passes. Reads already treat
 * overdue bookings as expired, so this only has to catch up the stored status. The update
 * is idempotent, so running on several instances is safe.
 */
@Injectable()
export class BookingExpiryScheduler {
  private readonly logger = new Logger(BookingExpiryScheduler.name);

  constructor(private readonly expireOverdue: ExpireOverdueBookingsUseCase) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async run(): Promise<void> {
    const expired = await this.expireOverdue.execute();
    if (expired > 0) {
      this.logger.log(`Expired ${expired} booking(s)`);
    }
  }
}
