import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { db } from "@/db";
import { subscriptionPasswords } from "@/db/schema";
import { generateId } from "@/lib/id";

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { password } = await req.json();

  if (!password) {
    return NextResponse.json({ error: "パスワードは必須です" }, { status: 400 });
  }

  const id = generateId();
  const now = new Date();
  await db.insert(subscriptionPasswords).values({ id, password });

  return NextResponse.json({
    id,
    password,
    usedByEmail: null,
    usedAt: null,
    createdAt: now,
  });
}
