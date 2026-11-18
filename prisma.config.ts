import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  // Not `env('DATABASE_URL')`: that throws when the variable is missing, which breaks
  // `prisma generate` in postinstall before `.env` exists. Migrate commands still need it.
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
