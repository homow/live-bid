import 'dotenv/config';
import {Pool} from "pg";
import path from "node:path";
import * as schema from '../schema';
import {drizzle} from "drizzle-orm/node-postgres";
import {migrate} from "drizzle-orm/node-postgres/migrator";

const migrationPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  application_name: `${process.env.SERVICE_NAME ?? 'live-bid'}-migrate`,
  max: 1,
  statement_timeout: 0,
  query_timeout: 0,
  idle_in_transaction_session_timeout: 0,
});

const migrateDB = drizzle(migrationPool, {schema});

async function runMigration() {
  console.log('🔄 Starting migration...');

  try {
    await migrate(migrateDB, {
      migrationsFolder: path.join(process.cwd(), "migrations"),
    });
    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await migrationPool.end();
  }
}

runMigration()
  .then(() => console.log("End process."))
  .catch(e => console.error(e));
