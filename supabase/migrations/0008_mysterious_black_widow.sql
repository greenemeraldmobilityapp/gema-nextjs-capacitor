CREATE TABLE "saved_bank_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"bank_code" text NOT NULL,
	"bank_name" text NOT NULL,
	"account_number" text NOT NULL,
	"account_holder" text NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN "image_url" text;--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN "status" text DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "wallet_transactions" ADD COLUMN "bank_name" text;--> statement-breakpoint
ALTER TABLE "wallet_transactions" ADD COLUMN "account_number" text;--> statement-breakpoint
ALTER TABLE "wallet_transactions" ADD COLUMN "account_holder" text;--> statement-breakpoint
ALTER TABLE "saved_bank_accounts" ADD CONSTRAINT "saved_bank_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;