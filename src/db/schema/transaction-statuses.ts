import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";

export const transactionStatuses = pgTable("transaction_statuses", {
  id: uuid("id").defaultRandom().primaryKey(),
  status: varchar("status", { length: 255 }).unique().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type TransactionStatus = typeof transactionStatuses.$inferSelect;
export type NewTransactionStatus = typeof transactionStatuses.$inferInsert;
