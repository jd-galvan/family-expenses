CREATE TABLE "monthly_balances" (
	"id" serial PRIMARY KEY NOT NULL,
	"month" text NOT NULL,
	"initial_balance" numeric(12, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "monthly_balances_month_unique" UNIQUE("month")
);
