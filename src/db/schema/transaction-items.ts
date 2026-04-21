import {
  pgTable,
  uuid,
  varchar,
  numeric,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { transactions } from "./transactions";

export const transactionItems = pgTable(
  "transaction_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    transactionId: uuid("transaction_id")
      .notNull()
      .references(() => transactions.id),
    itemName: varchar("item_name", { length: 255 }).notNull(),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [index("transaction_items_transaction_id_idx").on(table.transactionId)]
);

export type TransactionItem = typeof transactionItems.$inferSelect;
export type NewTransactionItem = typeof transactionItems.$inferInsert;
