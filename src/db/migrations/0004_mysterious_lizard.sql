ALTER TABLE "transaction_items" ADD COLUMN "quantity" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "transaction_item_add_ons" ADD COLUMN "quantity" integer DEFAULT 1 NOT NULL;