import {Pool} from "pg";
import * as schema from "./schema";
import {drizzle} from "drizzle-orm/node-postgres";
import {ONE_HOUR_MS, ONE_SECOND_MS} from "../lib";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  application_name: process.env.SERVICE_NAME ?? 'live-bid',

  // Pool Size
  min: 2,
  max: 60,

  // Connection Lifecycle
  idleTimeoutMillis: ONE_HOUR_MS,
  connectionTimeoutMillis: ONE_SECOND_MS * 5,

  // Query Timeouts
  query_timeout: ONE_SECOND_MS * 10,
  statement_timeout: ONE_SECOND_MS * 10,
});

export const db = drizzle(pool, {
  schema,
});

export {pool};
