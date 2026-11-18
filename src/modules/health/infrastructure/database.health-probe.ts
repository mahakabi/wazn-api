import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/infrastructure/prisma/prisma.service';
import { type HealthProbe } from '../domain/health-probe';

@Injectable()
export class DatabaseHealthProbe implements HealthProbe {
  readonly name = 'database';

  constructor(private readonly prisma: PrismaService) {}

  async isHealthy(): Promise<boolean> {
    await this.prisma.$queryRaw`SELECT 1`;
    return true;
  }
}
