import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  index,
} from "drizzle-orm/pg-core";

// A single key can have multiple rows (e.g. option lists for selects).
// Singletons (e.g. `auth.admin_email`) are modelled as one row per key.
export const general = pgTable(
  "general",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    key: varchar("key", { length: 100 }).notNull(),
    value: text("value").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [index("general_key_idx").on(table.key)]
);

export type General = typeof general.$inferSelect;
export type NewGeneral = typeof general.$inferInsert;
