import { pgTable, uuid, varchar, timestamp, index } from "drizzle-orm/pg-core";
import { transactionItems } from "./transaction-items";

export const transactionItemUsers = pgTable(
  "transaction_item_users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    transactionItemId: uuid("transaction_item_id")
      .notNull()
      .references(() => transactionItems.id),
    displayName: varchar("display_name", { length: 255 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("transaction_item_users_transaction_item_id_idx").on(
      table.transactionItemId
    ),
  ]
);

export type TransactionItemUser = typeof transactionItemUsers.$inferSelect;
export type NewTransactionItemUser = typeof transactionItemUsers.$inferInsert;
