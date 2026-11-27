CREATE TYPE "public"."wallet_transaction_type" AS ENUM('HOLD', 'SETTLE', 'RELEASE', 'DEPOSIT', 'WITHDRAW', 'SALE_INCOME');--> statement-breakpoint
CREATE TABLE "wallet_transactions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"wallet_id" uuid NOT NULL,
	"type" "wallet_transaction_type" NOT NULL,
	"amount" bigint NOT NULL,
	"held_after" bigint NOT NULL,
	"balance_after" bigint NOT NULL,
	"reference_id" uuid,
	"idempotency_key" varchar(250) NOT NULL,
	CONSTRAINT "wallet_tx_idempotency_unique" UNIQUE("wallet_id","idempotency_key"),
	CONSTRAINT "wallet_tx_amount_positive" CHECK ("wallet_transactions"."amount" > 0)
);
--> statement-breakpoint
ALTER TABLE "wallets" DROP CONSTRAINT "wallet_balance_non_negtaive";--> statement-breakpoint
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_wallet_id_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."wallets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "wallet_tx_wallet_created_idx" ON "wallet_transactions" USING btree ("wallet_id","created_at");--> statement-breakpoint
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallets" ADD CONSTRAINT "wallet_balance_non_negative" CHECK ("wallets"."balance" >= 0);