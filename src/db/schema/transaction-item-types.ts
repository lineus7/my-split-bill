import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";

export const transactionItemTypes = pgTable("transaction_item_types", {
  id: uuid("id").defaultRandom().primaryKey(),
  type: varchar("type", { length: 255 }).unique().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type TransactionItemType = typeof transactionItemTypes.$inferSelect;
export type NewTransactionItemType = typeof transactionItemTypes.$inferInsert;
