import { NextResponse } from "next/server";
import { db } from "@/db";
import { transactions, categories } from "@/db/schema";
import { eq, and, gte, lt, desc } from "drizzle-orm";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month"); // formato: "2025-06"

  let query = db
    .select({
      id: transactions.id,
      type: transactions.type,
      amount: transactions.amount,
      description: transactions.description,
      date: transactions.date,
      categoryId: transactions.categoryId,
      categoryName: categories.name,
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .orderBy(desc(transactions.date), desc(transactions.createdAt));

  if (month) {
    const [year, m] = month.split("-").map(Number);
    const from = new Date(year, m - 1, 1);
    const to = new Date(year, m, 1);
    query = query.where(and(gte(transactions.date, from), lt(transactions.date, to)));
  }

  const data = await query;
  return NextResponse.json(data);
}

export async function POST(request) {
  const { type, amount, categoryId, description, date } = await request.json();

  if (!["income", "expense"].includes(type) || !amount || !categoryId) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const [created] = await db
    .insert(transactions)
    .values({
      type,
      amount: String(amount),
      categoryId: Number(categoryId),
      description: description?.trim() || null,
      date: date ? new Date(date) : new Date(),
    })
    .returning();

  return NextResponse.json(created, { status: 201 });
}
