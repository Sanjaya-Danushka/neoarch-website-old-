import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core"

export const reviews = pgTable("reviews", {
  id: serial().primaryKey(),
  name: text().notNull(),
  email: text().notNull(),
  rating: integer().notNull(),
  message: text().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})
