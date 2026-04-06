import { NextResponse } from "next/server";
import { db } from "@/db";
import { monthlyBalances, transactions } from "@/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month"); // "YYYY-MM"

  if (!month) {
    return NextResponse.json({ error: "Falta el parámetro month" }, { status: 400 });
  }

  const [row] = await db
    .select()
    .from(monthlyBalances)
    .where(eq(monthlyBalances.month, month));

  return NextResponse.json(row ?? null);
}

export async function POST(request) {
  const { month, initialBalance } = await request.json();

  if (!month || initialBalance === undefined || initialBalance === null) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const [row] = await db
    .insert(monthlyBalances)
    .values({ month, initialBalance: String(initialBalance) })
    .onConflictDoUpdate({
      target: monthlyBalances.month,
      set: { initialBalance: String(initialBalance) },
    })
    .returning();

  return NextResponse.json(row, { status: 201 });
}

// Calcula y guarda automáticamente el saldo inicial de un mes
// basándose en el saldo final del mes anterior.
export async function PUT(request) {
  const { month } = await request.json(); // mes a calcular, ej: "2026-05"

  if (!month) {
    return NextResponse.json({ error: "Falta el parámetro month" }, { status: 400 });
  }

  const [year, m] = month.split("-").map(Number);
  const prevMonth = new Date(year, m - 2, 1); // mes anterior
  const prevMonthStr = prevMonth.toISOString().slice(0, 7);

  // Busca saldo inicial del mes anterior
  const [prevBalance] = await db
    .select()
    .from(monthlyBalances)
    .where(eq(monthlyBalances.month, prevMonthStr));

  if (!prevBalance) {
    return NextResponse.json({ error: "No hay saldo del mes anterior" }, { status: 404 });
  }

  // Suma ingresos y egresos del mes anterior
  const from = new Date(year, m - 2, 1);
  const to = new Date(year, m - 1, 1);
  const prevTransactions = await db
    .select()
    .from(transactions)
    .where(and(gte(transactions.date, from), lte(transactions.date, to)));

  const ingresos = prevTransactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + parseFloat(t.amount), 0);
  const egresos = prevTransactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + parseFloat(t.amount), 0);

  const newInitial = parseFloat(prevBalance.initialBalance) + ingresos - egresos;

  const [row] = await db
    .insert(monthlyBalances)
    .values({ month, initialBalance: String(newInitial) })
    .onConflictDoUpdate({
      target: monthlyBalances.month,
      set: { initialBalance: String(newInitial) },
    })
    .returning();

  return NextResponse.json(row, { status: 201 });
}
