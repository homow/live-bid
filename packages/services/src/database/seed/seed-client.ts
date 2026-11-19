import {Pool} from "pg";
import * as schema from "../schema";
import {drizzle} from "drizzle-orm/node-postgres";

const seedPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  application_name: `${process.env.SERVICE_NAME ?? "live-bid"}-seed`,

  // Pool Size
  min: 1,
  max: 2,

  // Connection Lifecycle
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

export const seedDb = drizzle(seedPool, {schema});

export {seedPool};
