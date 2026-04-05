import { NextResponse } from "next/server";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const data = await db.select().from(categories).orderBy(categories.type, categories.name);
  return NextResponse.json(data);
}

export async function POST(request) {
  const { name, type } = await request.json();
  if (!name?.trim() || !["income", "expense"].includes(type)) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }
  const [created] = await db.insert(categories).values({ name: name.trim(), type }).returning();
  return NextResponse.json(created, { status: 201 });
}
