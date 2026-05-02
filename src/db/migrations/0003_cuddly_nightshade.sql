CREATE TABLE "transaction_item_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "transaction_item_types_type_unique" UNIQUE("type")
);
--> statement-breakpoint
ALTER TABLE "transaction_items" ADD COLUMN "type_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "transaction_items" ADD CONSTRAINT "transaction_items_type_id_transaction_item_types_id_fk" FOREIGN KEY ("type_id") REFERENCES "public"."transaction_item_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "transaction_items_type_id_idx" ON "transaction_items" USING btree ("type_id");--> statement-breakpoint
ALTER TABLE "transactions" DROP COLUMN "service_charge";--> statement-breakpoint
ALTER TABLE "transactions" DROP COLUMN "tax_charge";