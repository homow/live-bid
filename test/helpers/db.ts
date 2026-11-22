import {sql} from "drizzle-orm";
import {db, pool, user} from "@live-bid/services/database";

function assertTestDatabase() {
  const url = process.env.DATABASE_URL;
  const name = url ? new URL(url).pathname.slice(1) : "";

  if (!name.endsWith("_test")) {
    throw new Error(
      `Refusing to touch "${name}". Integration tests only run against a database whose name ends with _test.`,
    );
  }
}

/** Wipes everything. Users cascade into tokens, wallets and wallet transactions. */
export async function resetDb() {
  assertTestDatabase();
  await db.execute(sql`TRUNCATE TABLE users CASCADE`);
}

let counter = 0;

/** Inserts a user with unique defaults and returns the full row (password hash included) */
export async function createUser(overrides: Partial<typeof user.$inferInsert> = {}) {
  counter += 1;

  const [row] = await db
    .insert(user)
    .values({
      email: `user${counter}@example.com`,
      display_name: `User ${counter}`,
      password: "$2b$04$not.a.real.hash.just.a.placeholder",
      ...overrides,
    })
    .returning();

  return row;
}

export async function closeDb() {
  await pool.end();
}
