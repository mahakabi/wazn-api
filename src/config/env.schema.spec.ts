import { validateEnv } from './env.schema';

const validEnv = {
  DATABASE_URL: 'postgresql://wazn:wazn@localhost:5432/wazn',
  REDIS_URL: 'redis://localhost:6379',
  JWT_ACCESS_SECRET: 'a'.repeat(32),
  JWT_REFRESH_SECRET: 'b'.repeat(32),
};

describe('validateEnv', () => {
  it('applies defaults and parses CORS origins', () => {
    const env = validateEnv({ ...validEnv, CORS_ORIGINS: 'http://a.test, http://b.test,' });

    expect(env.PORT).toBe(3000);
    expect(env.NODE_ENV).toBe('development');
    expect(env.CORS_ORIGINS).toEqual(['http://a.test', 'http://b.test']);
  });

  it('coerces PORT from string', () => {
    expect(validateEnv({ ...validEnv, PORT: '8080' }).PORT).toBe(8080);
  });

  it('rejects a short JWT secret and names the variable', () => {
    expect(() => validateEnv({ ...validEnv, JWT_ACCESS_SECRET: 'short' })).toThrow(
      /JWT_ACCESS_SECRET/,
    );
  });

  it('rejects a non-postgres DATABASE_URL', () => {
    expect(() => validateEnv({ ...validEnv, DATABASE_URL: 'mysql://x@localhost/db' })).toThrow(
      /DATABASE_URL/,
    );
  });

  it('reports every missing required variable at once', () => {
    expect(() => validateEnv({})).toThrow(/DATABASE_URL[\s\S]*REDIS_URL[\s\S]*JWT_ACCESS_SECRET/);
  });
});
