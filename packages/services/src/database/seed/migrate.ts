import 'dotenv/config';
import path from "node:path";
import {db, pool} from "../client";
import {migrate} from "drizzle-orm/node-postgres/migrator";

async function runMigration() {
  console.log('🔄 Starting migration...');

  try {
    await migrate(db, {
      migrationsFolder: path.join(process.cwd(), "migrations"),
    });
    console.log('✅ Migration completed successfully!');
    await pool.end();
  } catch (error) {
    console.error('❌ Migration failed:', error);
    await pool.end();
    process.exit(1);
  }
}

runMigration()
  .then(() => console.log("End process."))
  .catch(e => console.error(e));
