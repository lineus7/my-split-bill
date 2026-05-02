import {
  pgTable,
  uuid,
  varchar,
  numeric,
  integer,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { transactionItems } from "./transaction-items";

export const transactionItemAddOns = pgTable(
  "transaction_item_add_ons",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    transactionItemId: uuid("transaction_item_id")
      .notNull()
      .references(() => transactionItems.id),
    itemName: varchar("item_name", { length: 255 }).notNull(),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    quantity: integer("quantity").notNull().default(1),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("transaction_item_add_ons_transaction_item_id_idx").on(
      table.transactionItemId
    ),
  ]
);

export type TransactionItemAddOn = typeof transactionItemAddOns.$inferSelect;
export type NewTransactionItemAddOn =
  typeof transactionItemAddOns.$inferInsert;
