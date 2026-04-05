import { NextResponse } from "next/server";
import { db } from "@/db";
import { transactions } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(request, { params }) {
  const { id } = await params;
  await db.delete(transactions).where(eq(transactions.id, Number(id)));
  return NextResponse.json({ ok: true });
}
