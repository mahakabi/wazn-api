import { type INestApplication } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { Redis } from 'ioredis';
import request from 'supertest';
import { type App } from 'supertest/types';
import { type RecordingEmailSender } from '../src/common/testing/recording-email.sender';
import { PrismaClient } from '../src/generated/prisma/client';
import { createTestApp } from './create-test-app';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

/** A running app plus direct DB/Redis handles for setup and cleanup. Needs the seed data. */
export class E2eContext {
  private constructor(
    readonly app: INestApplication<App>,
    readonly mailer: RecordingEmailSender,
    readonly prisma: PrismaClient,
    readonly redis: Redis,
  ) {}

  static async start(): Promise<E2eContext> {
    const { app, mailer } = await createTestApp();
    const prisma = new PrismaClient({
      adapter: new PrismaPg({ connectionString: requireEnv('DATABASE_URL') }),
    });
    return new E2eContext(app, mailer, prisma, new Redis(requireEnv('REDIS_URL')));
  }

  http(): ReturnType<typeof request> {
    return request(this.app.getHttpServer());
  }

  /** Signs in through the real email-OTP flow and returns the access token. */
  async signIn(email: string): Promise<string> {
    const keys = await this.redis.keys(`otp:*:${email}`);
    if (keys.length > 0) await this.redis.del(...keys);

    await this.http().post('/v1/auth/otp/request').send({ email }).expect(200);
    const code = this.mailer.lastCodeFor(email);
    const response = await this.http()
      .post('/v1/auth/otp/verify')
      .send({ email, code })
      .expect(200);
    return (response.body as { accessToken: string }).accessToken;
  }

  /** Removes test members and everything that references them. */
  async deleteMembers(emails: readonly string[]): Promise<void> {
    const where = { user: { email: { in: [...emails] } } };
    await this.prisma.report.deleteMany({ where });
    await this.prisma.booking.deleteMany({ where });
    await this.prisma.savedGym.deleteMany({ where });
    await this.prisma.user.deleteMany({ where: { email: { in: [...emails] } } });
  }

  async stop(): Promise<void> {
    await this.prisma.$disconnect();
    this.redis.disconnect();
    await this.app.close();
  }
}
