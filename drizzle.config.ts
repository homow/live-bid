import 'dotenv/config';
import {defineConfig} from 'drizzle-kit';

// noinspection JSUnusedGlobalSymbols
export default defineConfig({
  schema: './src/lib/db/schema.ts',
  out: './src/lib/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  strict: true,
  verbose: true,
});
