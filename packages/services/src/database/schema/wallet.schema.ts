import {sql} from "drizzle-orm";
import {baseDrizzleTable} from "./common";
import {bigint, check, pgTable, uuid} from "drizzle-orm/pg-core";

export const wallet = pgTable('wallets', {
  ...baseDrizzleTable,
  user_id: uuid('user_id')
    .notNull()
    .unique(),

  // Money is always a whole number (toman), never a float
  balance: bigint('balance', {mode: 'number'})
    .notNull()
    .default(0),

  // The part of the balance that's locked for active bids
  held_balance: bigint('held_balance', {mode: 'number'})
    .notNull()
    .default(0),
}, t => [
  // @formatter:off
  check('wallet_balance_non_negtaive', sql`${t.balance} >= 0`),
  check('wallet_held_within_balance', sql`${t.held_balance} >= 0 AND ${t.held_balance} <= ${t.balance}`),
  // @formatter:on
]);

export type Wallet = typeof wallet.$inferSelect;
