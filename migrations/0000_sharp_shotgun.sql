CREATE TYPE "public"."user_role" AS ENUM('USER', 'ADMIN', 'OWNER');--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"password" varchar(255) NOT NULL,
	"email" varchar NOT NULL,
	"username" varchar(255),
	"is_active" boolean DEFAULT true NOT NULL,
	"display_name" varchar(60) NOT NULL,
	"role" "user_role" DEFAULT 'USER' NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE INDEX "users_is_active_role" ON "users" USING btree ("is_active","role");