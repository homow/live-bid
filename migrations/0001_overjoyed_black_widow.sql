ALTER TABLE "wallets" ALTER COLUMN "balance" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "wallets" ADD COLUMN "held_balance" bigint DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "wallets" ADD CONSTRAINT "wallet_balance_non_negtaive" CHECK ("wallets"."balance" >= 0);--> statement-breakpoint
ALTER TABLE "wallets" ADD CONSTRAINT "wallet_held_within_balance" CHECK ("wallets"."held_balance" >= 0 AND "wallets"."held_balance" <= "wallets"."balance");