import { pgTable, serial, text, numeric, timestamp, pgEnum } from "drizzle-orm/pg-core";

export const transactionTypeEnum = pgEnum("transaction_type", ["expense", "income"]);

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: transactionTypeEnum("type").notNull(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  type: transactionTypeEnum("type").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  categoryId: serial("category_id").references(() => categories.id),
  description: text("description"),
  date: timestamp("date").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Saldo inicial por mes. Solo Abril 2026 se ingresa manualmente;
// los meses siguientes se calculan automáticamente al cargar el dashboard.
export const monthlyBalances = pgTable("monthly_balances", {
  id: serial("id").primaryKey(),
  month: text("month").notNull().unique(), // formato "YYYY-MM"
  initialBalance: numeric("initial_balance", { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
