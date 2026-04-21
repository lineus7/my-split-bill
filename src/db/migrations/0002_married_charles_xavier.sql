CREATE TABLE "transaction_statuses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"status" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "transaction_statuses_status_unique" UNIQUE("status")
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"status_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"service_charge" numeric(10, 2) DEFAULT '0' NOT NULL,
	"tax_charge" numeric(10, 2) DEFAULT '0' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transaction_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"transaction_id" uuid NOT NULL,
	"item_name" varchar(255) NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transaction_item_add_ons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"transaction_item_id" uuid NOT NULL,
	"item_name" varchar(255) NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transaction_item_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"transaction_item_id" uuid NOT NULL,
	"display_name" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_status_id_transaction_statuses_id_fk" FOREIGN KEY ("status_id") REFERENCES "public"."transaction_statuses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction_items" ADD CONSTRAINT "transaction_items_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction_item_add_ons" ADD CONSTRAINT "transaction_item_add_ons_transaction_item_id_transaction_items_id_fk" FOREIGN KEY ("transaction_item_id") REFERENCES "public"."transaction_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction_item_users" ADD CONSTRAINT "transaction_item_users_transaction_item_id_transaction_items_id_fk" FOREIGN KEY ("transaction_item_id") REFERENCES "public"."transaction_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "transactions_user_id_idx" ON "transactions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "transactions_status_id_idx" ON "transactions" USING btree ("status_id");--> statement-breakpoint
CREATE INDEX "transaction_items_transaction_id_idx" ON "transaction_items" USING btree ("transaction_id");--> statement-breakpoint
CREATE INDEX "transaction_item_add_ons_transaction_item_id_idx" ON "transaction_item_add_ons" USING btree ("transaction_item_id");--> statement-breakpoint
CREATE INDEX "transaction_item_users_transaction_item_id_idx" ON "transaction_item_users" USING btree ("transaction_item_id");