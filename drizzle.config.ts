import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/shared/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/ursa_major',
  },
});
