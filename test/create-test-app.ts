import { type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { type App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { EMAIL_SENDER } from '../src/common/domain/email-sender';
import { RecordingEmailSender } from '../src/common/testing/recording-email.sender';
import { setupApp } from '../src/setup-app';

export interface TestApp {
  app: INestApplication<App>;
  mailer: RecordingEmailSender;
}

/** Boots the real app (real DB + Redis) with outgoing email captured instead of sent. */
export async function createTestApp(): Promise<TestApp> {
  const mailer = new RecordingEmailSender();
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(EMAIL_SENDER)
    .useValue(mailer)
    .compile();
  const app = moduleRef.createNestApplication<INestApplication<App>>();
  setupApp(app);
  await app.init();
  return { app, mailer };
}
