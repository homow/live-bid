import {baseDrizzleTable} from "./common";
import {integer, pgTable, uuid} from "drizzle-orm/pg-core";

export const walletSchema = pgTable('wallets', {
  ...baseDrizzleTable,
  user_id: uuid('user_id').notNull().unique(),
  balance: integer('balance').notNull().default(0),
});

export type Wallet = typeof walletSchema.$inferSelect;
