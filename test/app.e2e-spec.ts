import { E2eContext } from './e2e-context';

describe('App (e2e)', () => {
  let ctx: E2eContext;

  beforeAll(async () => {
    ctx = await E2eContext.start();
  });

  afterAll(async () => {
    await ctx.stop();
  });

  it('GET /health reports the database and redis as up', async () => {
    const response = await ctx.http().get('/health').expect(200);

    expect(response.body).toEqual({ status: 'ok', checks: { database: 'up', redis: 'up' } });
  });

  it('GET /docs-json serves the OpenAPI document', async () => {
    const response = await ctx.http().get('/docs-json').expect(200);
    const document = response.body as { openapi: string; paths: Record<string, unknown> };

    expect(document.openapi).toMatch(/^3\./);
    expect(document.paths).toHaveProperty('/health');
  });

  it('unknown routes use the standard error shape', async () => {
    const response = await ctx.http().get('/v1/nope').expect(404);

    expect(response.body).toEqual({ code: 'NOT_FOUND', message: 'Cannot GET /v1/nope' });
  });
});
