import {sql} from "drizzle-orm";
import {wallet} from "./wallet.schema";
import {baseDrizzleTable} from "./common";
import {WalletTransactionTypeEnum} from "@live-bid/contracts/enums";
import {bigint, check, index, pgEnum, pgTable, unique, uuid, varchar} from "drizzle-orm/pg-core";

export const walletTransactionTypeEnum = pgEnum('wallet_transaction_type', WalletTransactionTypeEnum);

export const walletTransaction = pgTable('wallet_transactions', {
  id: baseDrizzleTable.id,
  created_at: baseDrizzleTable.created_at,

  wallet_id: uuid('wallet_id')
    .references(() => wallet.id)
    .notNull(),
  type: walletTransactionTypeEnum('type').notNull(),
  amount: bigint('amount', {mode: 'number'}).notNull(),

  held_after: bigint('held_after', {mode: 'number'}).notNull(),
  balance_after: bigint('balance_after', {mode: 'number'}).notNull(),

  reference_id: uuid('reference_id'),

  idempotency_key: varchar('idempotency_key', {length: 250}).notNull(),
}, t => [
  // @formatter:off
  check('wallet_tx_amount_positive', sql`${t.amount} > 0`),
  // @formatter:on
  index('wallet_tx_wallet_created_idx').on(t.wallet_id, t.created_at),
  unique('wallet_tx_idempotency_unique').on(t.wallet_id, t.idempotency_key),
]);

export type WalletTransaction = typeof walletTransaction.$inferSelect;
