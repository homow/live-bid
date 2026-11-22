import {Pool} from "pg";
import path from "node:path";
import {TEST_DATABASE_URL} from "./test-env";
import {drizzle} from "drizzle-orm/node-postgres";
import {migrate} from "drizzle-orm/node-postgres/migrator";

/**
 * Runs once before all integration tests:
 * creates the test database if it's missing, then applies the migrations.
 */
export default async function setup() {
  const dbName = new URL(TEST_DATABASE_URL).pathname.slice(1);

  if (!/^[a-z0-9_]+_test$/.test(dbName)) {
    throw new Error(`Test database name must look like something_test, got "${dbName}"`);
  }

  // Connect to the default "postgres" database just to create ours
  const adminUrl = new URL(TEST_DATABASE_URL);
  adminUrl.pathname = "/postgres";

  const admin = new Pool({connectionString: adminUrl.toString()});
  try {
    const {rowCount} = await admin.query("SELECT 1 FROM pg_database WHERE datname = $1", [dbName]);
    if (!rowCount) await admin.query(`CREATE DATABASE "${dbName}"`);
  } finally {
    await admin.end();
  }

  const pool = new Pool({connectionString: TEST_DATABASE_URL});
  try {
    await migrate(drizzle(pool), {migrationsFolder: path.join(process.cwd(), "migrations")});
  } finally {
    await pool.end();
  }
}
