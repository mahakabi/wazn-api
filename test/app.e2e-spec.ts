import { type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { type App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { setupApp } from '../src/setup-app';

describe('App (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    setupApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /health reports the database as up', async () => {
    const response = await request(app.getHttpServer()).get('/health').expect(200);

    expect(response.body).toEqual({ status: 'ok', checks: { database: 'up' } });
  });

  it('GET /docs-json serves the OpenAPI document', async () => {
    const response = await request(app.getHttpServer()).get('/docs-json').expect(200);
    const document = response.body as { openapi: string; paths: Record<string, unknown> };

    expect(document.openapi).toMatch(/^3\./);
    expect(document.paths).toHaveProperty('/health');
  });

  it('unknown routes use the standard error shape', async () => {
    const response = await request(app.getHttpServer()).get('/v1/nope').expect(404);

    expect(response.body).toEqual({ code: 'NOT_FOUND', message: 'Cannot GET /v1/nope' });
  });
});
