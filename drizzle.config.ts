import 'dotenv/config';
import {defineConfig} from 'drizzle-kit';

// noinspection JSUnusedGlobalSymbols
export default defineConfig({
  schema: './packages/contracts/src/database/schema.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  strict: true,
  verbose: true,
});
