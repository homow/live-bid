DROP INDEX "users_is_active_role";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "email" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "username" SET DATA TYPE varchar(30);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "username" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "refresh_tokens" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "refresh_tokens" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
CREATE INDEX "users_is_active_role" ON "users" USING btree ("is_active","role") WHERE "users"."is_active" = $1;